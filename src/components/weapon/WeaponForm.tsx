'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import {
	type MainWeaponFormData,
	mainWeaponSchema,
	type SubWeaponFormData,
	subWeaponSchema,
} from '@/schemas/weapons'
import { useWeaponFormSync, validateWeaponData } from '@/hooks/useFormSync'
import { useCalculatorStore } from '@/stores'
import type { MainWeapon, SubWeapon, WeaponType } from '@/types/calculator'
import {
	getRefinementDisplayOptions,
	type RefinementDisplay,
	refinementDisplayToValue,
	refinementValueToDisplay,
} from '@/utils/refinementUtils'
import {
	getAutoFixedSubWeapon,
	getAvailableSubWeaponTypes,
	isValidWeaponCombination,
} from '@/utils/weaponCombinations'

export default function WeaponForm() {
	// Zustandストアから武器データを取得
	const storeMainWeapon = useCalculatorStore((state) => state.data.mainWeapon)
	const storeSubWeapon = useCalculatorStore((state) => state.data.subWeapon)
	const updateMainWeapon = useCalculatorStore((state) => state.updateMainWeapon)
	const updateSubWeapon = useCalculatorStore((state) => state.updateSubWeapon)

	// Zustandストアの値を使用（完全移行）
	const effectiveMainWeapon = storeMainWeapon
	const effectiveSubWeapon = storeSubWeapon
	const weaponTypes: WeaponType[] = [
		'片手剣',
		'双剣',
		'両手剣',
		'手甲',
		'旋風槍',
		'抜刀剣',
		'弓',
		'自動弓',
		'杖',
		'魔導具',
		'素手',
	]

	// メイン武器に応じて選択可能なサブ武器種を動的に取得
	const availableSubWeaponTypes = useMemo(() => {
		return getAvailableSubWeaponTypes(effectiveMainWeapon.weaponType)
	}, [effectiveMainWeapon.weaponType])

	// 精錬値の選択肢を取得
	const refinementOptions = useMemo(() => {
		return getRefinementDisplayOptions()
	}, [])


	// 精錬値変換ヘルパー関数
	const getCurrentMainRefinementDisplay = (): RefinementDisplay => {
		// biome-ignore lint/suspicious/noExplicitAny: refinement型の互換性のため
		return refinementValueToDisplay(effectiveMainWeapon.refinement as any)
	}

	const getCurrentSubRefinementDisplay = (): RefinementDisplay => {
		// biome-ignore lint/suspicious/noExplicitAny: refinement型の互換性のため
		return refinementValueToDisplay(effectiveSubWeapon.refinement as any)
	}

	// 精錬値変更ハンドラ
	const handleMainRefinementChange = (refinementDisplay: RefinementDisplay) => {
		const refinementValue = refinementDisplayToValue(refinementDisplay)
		const updatedMainWeapon = {
			...effectiveMainWeapon,
			refinement: refinementValue,
		}
		updateMainWeapon(updatedMainWeapon)
		setValueMain('refinement', refinementValue)
	}

	const handleSubRefinementChange = (refinementDisplay: RefinementDisplay) => {
		const refinementValue = refinementDisplayToValue(refinementDisplay)
		const updatedSubWeapon = {
			...effectiveSubWeapon,
			refinement: refinementValue,
		}
		updateSubWeapon(updatedSubWeapon)
		setValueSub('refinement', refinementValue)
	}

	// フォーカス状態でのクリックによる値クリア機能（メイン武器）
	const handleMainClickToClear = (fieldName: 'ATK' | 'stability') => {
		setValueMain(fieldName, 0, { shouldValidate: true })
		// 次のティックでテキストを選択状態にしてユーザーが入力しやすくする
		setTimeout(() => {
			const element = document.getElementById(
				`main-weapon-${fieldName}`,
			) as HTMLInputElement
			if (element) {
				element.select()
			}
		}, 0)
	}

	// フォーカス状態でのクリックによる値クリア機能（サブ武器）
	const handleSubClickToClear = (fieldName: 'ATK' | 'stability') => {
		setValueSub(fieldName, 0, { shouldValidate: true })
		// 次のティックでテキストを選択状態にしてユーザーが入力しやすくする
		setTimeout(() => {
			const element = document.getElementById(
				`sub-weapon-${fieldName}`,
			) as HTMLInputElement
			if (element) {
				element.select()
			}
		}, 0)
	}

	// メイン武器フォーム
	const {
		register: registerMain,
		watch: watchMain,
		formState: { errors: _errorsMain },
		setValue: setValueMain,
		getValues: getValuesMain,
	} = useForm<MainWeaponFormData>({
		resolver: zodResolver(mainWeaponSchema),
		values: effectiveMainWeapon,
		mode: 'onChange',
	})

	// サブ武器フォーム
	const {
		register: registerSub,
		watch: watchSub,
		formState: { errors: _errorsSub },
		setValue: setValueSub,
		getValues: getValuesSub,
	} = useForm<SubWeaponFormData>({
		resolver: zodResolver(subWeaponSchema),
		values: effectiveSubWeapon,
		mode: 'onChange',
	})

	// 入力値を範囲内に制限する関数（メイン武器）
	const handleMainBlur = (fieldName: keyof MainWeaponFormData) => {
		const value = getValuesMain(fieldName)
		if (typeof value !== 'number') return

		const min = 0
		let max = 1500

		if (fieldName === 'stability') {
			max = 100
		} else if (fieldName === 'refinement') {
			max = 15
		}

		if (value < min) {
			setValueMain(fieldName, min, { shouldValidate: true })
		} else if (value > max) {
			setValueMain(fieldName, max, { shouldValidate: true })
		}
	}

	// 入力値を範囲内に制限する関数（サブ武器）
	const handleSubBlur = (fieldName: keyof SubWeaponFormData) => {
		const value = getValuesSub(fieldName)
		if (typeof value !== 'number') return

		const min = 0
		let max = 1500

		if (fieldName === 'stability') {
			max = 100
		} else if (fieldName === 'refinement') {
			max = 15
		}

		if (value < min) {
			setValueSub(fieldName, min, { shouldValidate: true })
		} else if (value > max) {
			setValueSub(fieldName, max, { shouldValidate: true })
		}
	}


	// メイン武器の武器タイプ変更時の処理
	const handleMainWeaponTypeChange = (newWeaponType: string, currentData: Partial<MainWeaponFormData>) => {
		const newMainWeaponType = newWeaponType as WeaponType
		const currentSubWeaponType = effectiveSubWeapon.weaponType

		// 現在のサブ武器が新しいメイン武器で選択可能かチェック
		if (!isValidWeaponCombination(newMainWeaponType, currentSubWeaponType)) {
			// 無効な場合は自動修正
			const fixedSubWeaponType = getAutoFixedSubWeapon(newMainWeaponType)
			const fixedSubWeapon = {
				...effectiveSubWeapon,
				weaponType: fixedSubWeaponType,
			}

			// サブ武器を自動修正
			updateSubWeapon(fixedSubWeapon)
			setValueSub('weaponType', fixedSubWeaponType)
		}
	}

	// メイン武器のフォーム同期（カスタムフック使用）
	useWeaponFormSync<MainWeaponFormData>(
		watchMain,
		(data: MainWeaponFormData) => updateMainWeapon(data as MainWeapon),
		validateWeaponData,
		{
			onWeaponTypeChange: handleMainWeaponTypeChange,
		},
	)

	// サブ武器のフォーム値変更を監視（シンプル版）
	useEffect(() => {
		const subscription = watchSub((value, { name, type }) => {
			// プログラム的な変更は無視
			if (!name || !value || type !== 'change') {
				return
			}
			if (Object.values(value).every((v) => v !== undefined && v !== null)) {
				// Zustandストアを更新
				updateSubWeapon(value as SubWeapon)
			}
		})
		return () => subscription.unsubscribe()
	}, [watchSub, updateSubWeapon])

	return (
		<section className="bg-white rounded-lg shadow-md p-4 md:col-start-5 md:col-end-9 md:row-start-1 md:row-end-2 xl:col-start-1 xl:col-end-3 xl:row-start-2 xl:row-end-3">
			<h2 className="text-lg font-bold text-gray-800 mb-3">武器情報</h2>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* メイン武器 */}
				<div className="space-y-3">
					<h3 className="text-base font-semibold text-gray-700 mb-2">
						メイン武器
					</h3>
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<label
								htmlFor="main-weapon-type"
								className="text-sm font-medium text-gray-700 w-16 flex-shrink-0"
							>
								武器種:
							</label>
							<select
								id="main-weapon-type"
								className="flex-1 px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
								{...registerMain('weaponType')}
							>
								{weaponTypes.map((type) => (
									<option key={type} value={type}>
										{type}
									</option>
								))}
							</select>
						</div>

						<div className="flex items-center gap-2">
							<label
								htmlFor="main-weapon-ATK"
								className="text-sm font-medium text-gray-700 w-16 flex-shrink-0"
							>
								武器ATK:
							</label>
							<input
								id="main-weapon-ATK"
								type="number"
								className="flex-1 px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
								min="0"
								max="1500"
								onMouseDown={(e) => {
									if (document.activeElement === e.target) {
										handleMainClickToClear('ATK')
									}
								}}
								{...registerMain('ATK', {
									setValueAs: (value: string | number) => {
										if (value === '' || value === null || value === undefined) {
											return 0
										}
										const numValue = Number(value)
										return Number.isNaN(numValue) ? 0 : numValue
									},
									onBlur: () => handleMainBlur('ATK'),
								})}
							/>
						</div>

						<div className="flex items-center gap-2">
							<label
								htmlFor="main-weapon-stability"
								className="text-sm font-medium text-gray-700 w-16 flex-shrink-0"
							>
								安定率:
							</label>
							<input
								id="main-weapon-stability"
								type="number"
								className="flex-1 px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
								min="0"
								max="100"
								onMouseDown={(e) => {
									if (document.activeElement === e.target) {
										handleMainClickToClear('stability')
									}
								}}
								{...registerMain('stability', {
									setValueAs: (value: string | number) => {
										if (value === '' || value === null || value === undefined) {
											return 0
										}
										const numValue = Number(value)
										return Number.isNaN(numValue) ? 0 : numValue
									},
									onBlur: () => handleMainBlur('stability'),
								})}
							/>
						</div>

						<div className="flex items-center gap-2">
							<label
								htmlFor="main-weapon-refinement"
								className="text-sm font-medium text-gray-700 w-16 flex-shrink-0"
							>
								精錬値:
							</label>
							<select
								id="main-weapon-refinement"
								className="flex-1 px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
								value={getCurrentMainRefinementDisplay()}
								onChange={(e) =>
									handleMainRefinementChange(
										e.target.value as RefinementDisplay,
									)
								}
							>
								{refinementOptions.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>

				{/* サブ武器 */}
				<div className="space-y-3">
					<h3 className="text-base font-semibold text-gray-700 mb-2">
						サブ武器
					</h3>
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<label
								htmlFor="sub-weapon-type"
								className="text-sm font-medium text-gray-700 w-16 flex-shrink-0"
							>
								武器種:
							</label>
							<select
								id="sub-weapon-type"
								className="flex-1 px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
								{...registerSub('weaponType')}
							>
								{availableSubWeaponTypes.map((type) => (
									<option key={type} value={type}>
										{type}
									</option>
								))}
							</select>
						</div>

						<div className="flex items-center gap-2">
							<label
								htmlFor="sub-weapon-ATK"
								className="text-sm font-medium text-gray-700 w-16 flex-shrink-0"
							>
								武器ATK:
							</label>
							<input
								id="sub-weapon-ATK"
								type="number"
								className="flex-1 px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
								min="0"
								max="1500"
								onMouseDown={(e) => {
									if (document.activeElement === e.target) {
										handleSubClickToClear('ATK')
									}
								}}
								{...registerSub('ATK', {
									setValueAs: (value: string | number) => {
										if (value === '' || value === null || value === undefined) {
											return 0
										}
										const numValue = Number(value)
										return Number.isNaN(numValue) ? 0 : numValue
									},
									onBlur: () => handleSubBlur('ATK'),
								})}
							/>
						</div>

						<div className="flex items-center gap-2">
							<label
								htmlFor="sub-weapon-stability"
								className="text-sm font-medium text-gray-700 w-16 flex-shrink-0"
							>
								安定率:
							</label>
							<input
								id="sub-weapon-stability"
								type="number"
								className="flex-1 px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
								min="0"
								max="100"
								onMouseDown={(e) => {
									if (document.activeElement === e.target) {
										handleSubClickToClear('stability')
									}
								}}
								{...registerSub('stability', {
									setValueAs: (value: string | number) => {
										if (value === '' || value === null || value === undefined) {
											return 0
										}
										const numValue = Number(value)
										return Number.isNaN(numValue) ? 0 : numValue
									},
									onBlur: () => handleSubBlur('stability'),
								})}
							/>
						</div>

						<div className="flex items-center gap-2">
							<label
								htmlFor="sub-weapon-refinement"
								className="text-sm font-medium text-gray-700 w-16 flex-shrink-0"
							>
								精錬値:
							</label>
							<select
								id="sub-weapon-refinement"
								className="flex-1 px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
								value={getCurrentSubRefinementDisplay()}
								onChange={(e) =>
									handleSubRefinementChange(e.target.value as RefinementDisplay)
								}
							>
								{refinementOptions.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
