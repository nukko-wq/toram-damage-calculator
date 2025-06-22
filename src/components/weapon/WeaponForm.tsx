'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
	mainWeaponSchema,
	subWeaponSchema,
	type MainWeaponFormData,
	type SubWeaponFormData,
} from '@/schemas/weapons'
import type {
	MainWeapon,
	SubWeapon,
	WeaponType,
	SubWeaponType,
} from '@/types/calculator'
import { useEffect, useState, useMemo } from 'react'
import { useCalculatorStore } from '@/stores'
import { 
	getAvailableSubWeaponTypes, 
	isValidWeaponCombination, 
	getAutoFixedSubWeapon 
} from '@/utils/weaponCombinations'

interface WeaponFormProps {
	// Zustand移行後は不要（後方互換性のため残存）
	mainWeapon?: MainWeapon
	subWeapon?: SubWeapon
	onMainWeaponChange?: (weapon: MainWeapon) => void
	onSubWeaponChange?: (weapon: SubWeapon) => void
}

export default function WeaponForm({
	mainWeapon,
	subWeapon,
	onMainWeaponChange,
	onSubWeaponChange,
}: WeaponFormProps) {
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

	// 初期化状態管理
	const [isInitialized, setIsInitialized] = useState(false)

	// メイン武器フォーム
	const {
		register: registerMain,
		watch: watchMain,
		formState: { errors: errorsMain },
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
		formState: { errors: errorsSub },
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

	// 外部からの変更を反映（軽量化でちらつき防止）
	useEffect(() => {
		// valuesプロパティを使用しているため、変更検知を一時的に無効化のみ
		setIsInitialized(false)
		const timer = setTimeout(() => setIsInitialized(true), 30)
		return () => clearTimeout(timer)
	}, [effectiveMainWeapon, effectiveSubWeapon])

	// フォーム値変更を監視してZustandストアに通知（メイン武器）
	useEffect(() => {
		const subscription = watchMain((value, { name, type }) => {
			// 初期化中やプログラム的な変更は無視
			if (!isInitialized || !name || !value || type !== 'change') {
				return
			}
			if (Object.values(value).every((v) => v !== undefined && v !== null)) {
				// メイン武器が変更された場合、サブ武器の組み合わせをチェック
				if (name === 'weaponType') {
					const newMainWeaponType = value.weaponType as WeaponType
					const currentSubWeaponType = effectiveSubWeapon.weaponType
					
					// 現在のサブ武器が新しいメイン武器で選択可能かチェック
					if (!isValidWeaponCombination(newMainWeaponType, currentSubWeaponType)) {
						// 無効な場合は自動修正
						const fixedSubWeaponType = getAutoFixedSubWeapon(newMainWeaponType)
						const fixedSubWeapon = {
							...effectiveSubWeapon,
							weaponType: fixedSubWeaponType
						}
						
						// サブ武器を自動修正
						updateSubWeapon(fixedSubWeapon)
						setValueSub('weaponType', fixedSubWeaponType)
					}
				}

				// Zustandストアを更新
				updateMainWeapon(value as MainWeapon)

				// 後方互換性のため従来のonChangeも呼び出し
				if (onMainWeaponChange) {
					onMainWeaponChange(value as MainWeapon)
				}
			}
		})
		return () => subscription.unsubscribe()
	}, [watchMain, onMainWeaponChange, isInitialized, updateMainWeapon, updateSubWeapon, effectiveSubWeapon, setValueSub])

	// フォーム値変更を監視してZustandストアに通知（サブ武器）
	useEffect(() => {
		const subscription = watchSub((value, { name, type }) => {
			// 初期化中やプログラム的な変更は無視
			if (!isInitialized || !name || !value || type !== 'change') {
				return
			}
			if (Object.values(value).every((v) => v !== undefined && v !== null)) {
				// Zustandストアを更新
				updateSubWeapon(value as SubWeapon)

				// 後方互換性のため従来のonChangeも呼び出し
				if (onSubWeaponChange) {
					onSubWeaponChange(value as SubWeapon)
				}
			}
		})
		return () => subscription.unsubscribe()
	}, [watchSub, onSubWeaponChange, isInitialized, updateSubWeapon])

	return (
		<section className="bg-white rounded-lg shadow-md p-4 lg:col-start-1 lg:col-end-3 lg:row-start-2 lg:row-end-3">
			<h2 className="text-lg font-bold text-gray-800 mb-3">武器情報</h2>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* メイン武器 */}
				<div className="space-y-3">
					<h3 className="text-base font-semibold text-gray-700 mb-2">
						メイン武器
					</h3>
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<label className="text-sm font-medium text-gray-700 w-16 flex-shrink-0">
								武器種:
							</label>
							<select
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
							<label className="text-sm font-medium text-gray-700 w-16 flex-shrink-0">
								武器ATK:
							</label>
							<input
								type="number"
								className="flex-1 px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
								min="0"
								max="1500"
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
							<label className="text-sm font-medium text-gray-700 w-16 flex-shrink-0">
								安定率:
							</label>
							<input
								type="number"
								className="flex-1 px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
								min="0"
								max="100"
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
							<label className="text-sm font-medium text-gray-700 w-16 flex-shrink-0">
								精錬値:
							</label>
							<input
								type="number"
								className="flex-1 px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
								min="0"
								max="15"
								{...registerMain('refinement', {
									setValueAs: (value: string | number) => {
										if (value === '' || value === null || value === undefined) {
											return 0
										}
										const numValue = Number(value)
										return Number.isNaN(numValue) ? 0 : numValue
									},
									onBlur: () => handleMainBlur('refinement'),
								})}
							/>
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
							<label className="text-sm font-medium text-gray-700 w-16 flex-shrink-0">
								武器種:
							</label>
							<select
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
							<label className="text-sm font-medium text-gray-700 w-16 flex-shrink-0">
								武器ATK:
							</label>
							<input
								type="number"
								className="flex-1 px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
								min="0"
								max="1500"
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
							<label className="text-sm font-medium text-gray-700 w-16 flex-shrink-0">
								安定率:
							</label>
							<input
								type="number"
								className="flex-1 px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
								min="0"
								max="100"
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
							<label className="text-sm font-medium text-gray-700 w-16 flex-shrink-0">
								精錬値:
							</label>
							<input
								type="number"
								className="flex-1 px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
								min="0"
								max="15"
								{...registerSub('refinement', {
									setValueAs: (value: string | number) => {
										if (value === '' || value === null || value === undefined) {
											return 0
										}
										const numValue = Number(value)
										return Number.isNaN(numValue) ? 0 : numValue
									},
									onBlur: () => handleSubBlur('refinement'),
								})}
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
