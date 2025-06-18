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
import { useEffect, useState } from 'react'

interface WeaponFormProps {
	mainWeapon: MainWeapon
	subWeapon: SubWeapon
	onMainWeaponChange: (weapon: MainWeapon) => void
	onSubWeaponChange: (weapon: SubWeapon) => void
}

export default function WeaponForm({
	mainWeapon,
	subWeapon,
	onMainWeaponChange,
	onSubWeaponChange,
}: WeaponFormProps) {
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

	const subWeaponTypes: SubWeaponType[] = ['ナイフ', '矢', 'なし']

	// 初期化状態管理
	const [isInitialized, setIsInitialized] = useState(false)

	// メイン武器フォーム
	const {
		register: registerMain,
		watch: watchMain,
		formState: { errors: errorsMain },
		reset: resetMain,
		setValue: setValueMain,
		getValues: getValuesMain,
	} = useForm<MainWeaponFormData>({
		resolver: zodResolver(mainWeaponSchema),
		defaultValues: mainWeapon,
		mode: 'onChange',
	})

	// サブ武器フォーム
	const {
		register: registerSub,
		watch: watchSub,
		formState: { errors: errorsSub },
		reset: resetSub,
		setValue: setValueSub,
		getValues: getValuesSub,
	} = useForm<SubWeaponFormData>({
		resolver: zodResolver(subWeaponSchema),
		defaultValues: subWeapon,
		mode: 'onChange',
	})

	// 入力値を範囲内に制限する関数（メイン武器）
	const handleMainBlur = (fieldName: keyof MainWeaponFormData) => {
		const value = getValuesMain(fieldName)
		if (typeof value !== 'number') return

		let min = 0
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

		let min = 0
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

	// 外部からの変更を反映（初期化状態管理付き）
	useEffect(() => {
		setIsInitialized(false)
		resetMain(mainWeapon)
		resetSub(subWeapon)
		const timer = setTimeout(() => setIsInitialized(true), 0)
		return () => clearTimeout(timer)
	}, [mainWeapon, subWeapon, resetMain, resetSub])

	// フォーム値変更を監視して親に通知（メイン武器）
	useEffect(() => {
		const subscription = watchMain((value, { name, type }) => {
			// 初期化中やプログラム的な変更は無視
			if (!isInitialized || !name || !value || type !== 'change') {
				return
			}
			if (Object.values(value).every((v) => v !== undefined && v !== null)) {
				onMainWeaponChange(value as MainWeapon)
			}
		})
		return () => subscription.unsubscribe()
	}, [watchMain, onMainWeaponChange, isInitialized])

	// フォーム値変更を監視して親に通知（サブ武器）
	useEffect(() => {
		const subscription = watchSub((value, { name, type }) => {
			// 初期化中やプログラム的な変更は無視
			if (!isInitialized || !name || !value || type !== 'change') {
				return
			}
			if (Object.values(value).every((v) => v !== undefined && v !== null)) {
				onSubWeaponChange(value as SubWeapon)
			}
		})
		return () => subscription.unsubscribe()
	}, [watchSub, onSubWeaponChange, isInitialized])

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
								{subWeaponTypes.map((type) => (
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
