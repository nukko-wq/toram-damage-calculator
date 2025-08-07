'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useFormSync, validateBaseStats } from '@/hooks/useFormSync'
import { type BaseStatsFormData, baseStatsSchema } from '@/schemas/baseStats'
import { useCalculatorStore } from '@/stores'
import type { BaseStats } from '@/types/calculator'
import { calculateStatPoints } from '@/utils/statPointCalculation'

export default function BaseStatsForm() {
	console.log('BaseStatsForm: Component rendered')
	
	// Zustandストアから基本ステータスを取得
	const storeStats = useCalculatorStore((state) => state.data.baseStats)
	const updateBaseStats = useCalculatorStore((state) => state.updateBaseStats)
	
	console.log('BaseStatsForm: storeStats:', storeStats)
	console.log('BaseStatsForm: updateBaseStats:', updateBaseStats)

	// Zustandストアの値を使用（完全移行）
	const effectiveStats = storeStats

	const { register, watch, setValue, getValues, reset } = useForm<BaseStatsFormData>({
		resolver: zodResolver(baseStatsSchema),
		defaultValues: effectiveStats,
		mode: 'onChange',
	})
	
	console.log('BaseStatsForm: useForm initialized with defaultValues:', effectiveStats)

	// useFormSyncカスタムフックで初期化とフォーム監視を統合
	console.log('BaseStatsForm: Calling useFormSync with watch function:', typeof watch)
	
	// 直接watchをテストしてみる
	useEffect(() => {
		const subscription = watch((value, { name, type }) => {
			console.log('BaseStatsForm: Direct watch callback triggered:', { value, name, type })
		})
		return () => subscription.unsubscribe()
	}, [watch])
	
	useFormSync<BaseStatsFormData>(
		watch,
		(data: BaseStatsFormData) => {
			console.log('BaseStatsForm: updateBaseStats called with:', data)
			updateBaseStats(data as BaseStats)
		},
		(data) => {
			const isValid = validateBaseStats(data)
			console.log('BaseStatsForm: validateBaseStats result:', isValid, 'data:', data)
			return isValid
		},
	)

	// デバッグ用：ストアの値が変わったときにフォームをリセット
	useEffect(() => {
		console.log('BaseStatsForm: storeStats changed:', storeStats)
		console.log('BaseStatsForm: current form values:', watch())
		// ストアの値が変わったときにフォームをリセット
		reset(storeStats)
	}, [storeStats, reset, watch])

	// 現在のレベル値と全ステータス値を取得してステータスポイントを計算
	const currentLevel = watch('level') || effectiveStats.level || 1
	const allStats = watch()
	const statPointsResult = useMemo(() => {
		return calculateStatPoints(currentLevel, allStats)
	}, [currentLevel, allStats])

	// 入力値を範囲内に制限する関数
	const handleBlur = (fieldName: keyof BaseStatsFormData) => {
		const value = getValues(fieldName)
		const min = 1
		let max = 510

		// フィールドごとの最大値を設定
		if (['CRT', 'MEN', 'TEC'].includes(fieldName)) {
			max = 255
		}

		// 空文字、0、または不正な値の場合は最小値に設定
		const numValue = Number(value)
		if (value === undefined || value === null || String(value) === '' || Number.isNaN(numValue) || numValue < min) {
			setValue(fieldName, min, { shouldValidate: true })
		} else if (numValue > max) {
			setValue(fieldName, max, { shouldValidate: true })
		}
	}

	// フォーカス状態でのクリックによる値クリア機能
	const handleClickToClear = (fieldName: keyof BaseStatsFormData) => {
		// 最小値の1を設定してから、テキストを選択状態にする
		setValue(fieldName, 1, { shouldValidate: true })
		// 次のティックでテキストを選択状態にしてユーザーが入力しやすくする
		setTimeout(() => {
			const element = document.getElementById(
				`stat-${fieldName}`,
			) as HTMLInputElement
			if (element) {
				element.select()
			}
		}, 0)
	}

	// useFormSyncカスタムフックで初期化は自動的に管理される
	// useEffectによる手動管理は不要

	return (
		<section className="bg-white rounded-lg shadow-md p-4 md:col-start-1 md:col-end-5 md:row-start-1 md:row-end-2 xl:col-start-1 xl:col-end-3 xl:row-start-1 xl:row-end-2">
			<h2 className="text-lg font-bold text-gray-800 mb-3">基本ステータス</h2>
			<div className="flex flex-col gap-2">
				{/* レベル行 */}
				<div className="grid grid-cols-3 gap-3">
					<div className="flex items-center gap-2">
						<label
							htmlFor="stat-level"
							className="text-sm font-medium text-gray-700 w-12 flex-shrink-0"
						>
							レベル:
						</label>
						<div className="flex-1">
							<input
								id="stat-level"
								type="number"
								className="px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent w-full"
								min="1"
								max="510"
								onMouseDown={(e) => {
									if (document.activeElement === e.target) {
										handleClickToClear('level')
									}
								}}
								{...register('level', {
									setValueAs: (value: string | number) => {
										// 空文字の場合はそのまま返す（入力中は許可）
										if (value === '') {
											return ''
										}
										if (value === null || value === undefined) {
											return 1
										}
										const numValue = Number(value)
										return Number.isNaN(numValue) ? 1 : numValue
									},
									onBlur: () => handleBlur('level'),
								})}
							/>
						</div>
					</div>
					{/* ステータスポイント表示 */}
					<div className="flex items-center gap-2 col-span-2">
						<span className="text-sm text-gray-600">
							残りステータスポイント：
						</span>
						<span
							className={`text-sm font-medium ${
								statPointsResult.availableStatPoints < 0
									? 'text-red-600'
									: 'text-blue-600'
							}`}
						>
							{statPointsResult.availableStatPoints}
						</span>
					</div>
				</div>
				{/* メインステータス第1行 */}
				<div className="grid grid-cols-3 gap-3">
					<div className="flex items-center gap-2">
						<label
							htmlFor="stat-STR"
							className="text-sm font-medium text-gray-700 w-12 flex-shrink-0"
						>
							STR:
						</label>
						<div className="flex-1">
							<input
								id="stat-STR"
								type="number"
								className="px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent w-full"
								min="1"
								max="510"
								onMouseDown={(e) => {
									if (document.activeElement === e.target) {
										handleClickToClear('STR')
									}
								}}
								{...register('STR', {
									setValueAs: (value: string | number) => {
										// 空文字の場合はそのまま返す（入力中は許可）
										if (value === '') {
											return ''
										}
										if (value === null || value === undefined) {
											return 1
										}
										const numValue = Number(value)
										return Number.isNaN(numValue) ? 1 : numValue
									},
									onBlur: () => handleBlur('STR'),
								})}
							/>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<label
							htmlFor="stat-INT"
							className="text-sm font-medium text-gray-700 w-12 flex-shrink-0"
						>
							INT:
						</label>
						<div className="flex-1">
							<input
								id="stat-INT"
								type="number"
								className="px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent w-full"
								min="1"
								max="510"
								onMouseDown={(e) => {
									if (document.activeElement === e.target) {
										handleClickToClear('INT')
									}
								}}
								{...register('INT', {
									setValueAs: (value: string | number) => {
										// 空文字の場合はそのまま返す（入力中は許可）
										if (value === '') {
											return ''
										}
										if (value === null || value === undefined) {
											return 1
										}
										const numValue = Number(value)
										return Number.isNaN(numValue) ? 1 : numValue
									},
									onBlur: () => handleBlur('INT'),
								})}
							/>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<label
							htmlFor="stat-VIT"
							className="text-sm font-medium text-gray-700 w-12 flex-shrink-0"
						>
							VIT:
						</label>
						<div className="flex-1">
							<input
								id="stat-VIT"
								type="number"
								className="px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent w-full"
								min="1"
								max="510"
								onMouseDown={(e) => {
									if (document.activeElement === e.target) {
										handleClickToClear('VIT')
									}
								}}
								{...register('VIT', {
									setValueAs: (value: string | number) => {
										// 空文字の場合はそのまま返す（入力中は許可）
										if (value === '') {
											return ''
										}
										if (value === null || value === undefined) {
											return 1
										}
										const numValue = Number(value)
										return Number.isNaN(numValue) ? 1 : numValue
									},
									onBlur: () => handleBlur('VIT'),
								})}
							/>
						</div>
					</div>
				</div>

				{/* メインステータス第2行 */}
				<div className="grid grid-cols-3 gap-3">
					<div className="flex items-center gap-2">
						<label
							htmlFor="stat-AGI"
							className="text-sm font-medium text-gray-700 w-12 flex-shrink-0"
						>
							AGI:
						</label>
						<div className="flex-1">
							<input
								id="stat-AGI"
								type="number"
								className="px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent w-full"
								min="1"
								max="510"
								onMouseDown={(e) => {
									if (document.activeElement === e.target) {
										handleClickToClear('AGI')
									}
								}}
								{...register('AGI', {
									setValueAs: (value: string | number) => {
										// 空文字の場合はそのまま返す（入力中は許可）
										if (value === '') {
											return ''
										}
										if (value === null || value === undefined) {
											return 1
										}
										const numValue = Number(value)
										return Number.isNaN(numValue) ? 1 : numValue
									},
									onBlur: () => handleBlur('AGI'),
								})}
							/>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<label
							htmlFor="stat-DEX"
							className="text-sm font-medium text-gray-700 w-12 flex-shrink-0"
						>
							DEX:
						</label>
						<div className="flex-1">
							<input
								id="stat-DEX"
								type="number"
								className="px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent w-full"
								min="1"
								max="510"
								onMouseDown={(e) => {
									if (document.activeElement === e.target) {
										handleClickToClear('DEX')
									}
								}}
								{...register('DEX', {
									setValueAs: (value: string | number) => {
										// 空文字の場合はそのまま返す（入力中は許可）
										if (value === '') {
											return ''
										}
										if (value === null || value === undefined) {
											return 1
										}
										const numValue = Number(value)
										return Number.isNaN(numValue) ? 1 : numValue
									},
									onBlur: () => handleBlur('DEX'),
								})}
							/>
						</div>
					</div>
				</div>

				{/* 特殊ステータス行 */}
				<div className="grid grid-cols-3 gap-3">
					<div className="flex items-center gap-2">
						<label
							htmlFor="stat-CRT"
							className="text-sm font-medium text-gray-700 w-12 flex-shrink-0"
						>
							CRT:
						</label>
						<div className="flex-1">
							<input
								id="stat-CRT"
								type="number"
								className="px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent w-full"
								min="1"
								max="255"
								onMouseDown={(e) => {
									if (document.activeElement === e.target) {
										handleClickToClear('CRT')
									}
								}}
								{...register('CRT', {
									setValueAs: (value: string | number) => {
										// 空文字の場合はそのまま返す（入力中は許可）
										if (value === '') {
											return ''
										}
										if (value === null || value === undefined) {
											return 1
										}
										const numValue = Number(value)
										return Number.isNaN(numValue) ? 1 : numValue
									},
									onBlur: () => handleBlur('CRT'),
								})}
							/>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<label
							htmlFor="stat-MEN"
							className="text-sm font-medium text-gray-700 w-12 flex-shrink-0"
						>
							MEN:
						</label>
						<div className="flex-1">
							<input
								id="stat-MEN"
								type="number"
								className="px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent w-full"
								min="1"
								max="255"
								onMouseDown={(e) => {
									if (document.activeElement === e.target) {
										handleClickToClear('MEN')
									}
								}}
								{...register('MEN', {
									setValueAs: (value: string | number) => {
										// 空文字の場合はそのまま返す（入力中は許可）
										if (value === '') {
											return ''
										}
										if (value === null || value === undefined) {
											return 1
										}
										const numValue = Number(value)
										return Number.isNaN(numValue) ? 1 : numValue
									},
									onBlur: () => handleBlur('MEN'),
								})}
							/>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<label
							htmlFor="stat-TEC"
							className="text-sm font-medium text-gray-700 w-12 flex-shrink-0"
						>
							TEC:
						</label>
						<div className="flex-1">
							<input
								id="stat-TEC"
								type="number"
								className="px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent w-full"
								min="1"
								max="255"
								onMouseDown={(e) => {
									if (document.activeElement === e.target) {
										handleClickToClear('TEC')
									}
								}}
								{...register('TEC', {
									setValueAs: (value: string | number) => {
										// 空文字の場合はそのまま返す（入力中は許可）
										if (value === '') {
											return ''
										}
										if (value === null || value === undefined) {
											return 1
										}
										const numValue = Number(value)
										return Number.isNaN(numValue) ? 1 : numValue
									},
									onBlur: () => handleBlur('TEC'),
								})}
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
