'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { baseStatsSchema, type BaseStatsFormData } from '@/schemas/baseStats'
import type { BaseStats } from '@/types/calculator'
import { useEffect, useCallback, useState } from 'react'
import { useCalculatorStore } from '@/stores'

interface BaseStatsFormProps {
	// Zustand移行後は不要（後方互換性のため残存）
	stats?: BaseStats
	onChange?: (stats: BaseStats) => void
}


export default function BaseStatsForm({ stats, onChange }: BaseStatsFormProps) {
	// 初期化状態管理
	const [isInitialized, setIsInitialized] = useState(false)

	// Zustandストアから基本ステータスを取得
	const storeStats = useCalculatorStore((state) => state.data.baseStats)
	const updateBaseStats = useCalculatorStore((state) => state.updateBaseStats)

	// Zustandストアの値を使用（完全移行）
	const effectiveStats = storeStats

	const {
		register,
		watch,
		formState: { errors },
		setValue,
		getValues,
	} = useForm<BaseStatsFormData>({
		resolver: zodResolver(baseStatsSchema),
		values: effectiveStats,
		mode: 'onChange',
	})

	// 入力値を範囲内に制限する関数
	const handleBlur = (fieldName: keyof BaseStatsFormData) => {
		const value = getValues(fieldName)
		const min = 1
		let max = 510

		// フィールドごとの最大値を設定
		if (['CRT', 'MEN', 'TEC'].includes(fieldName)) {
			max = 255
		}

		if (value < min) {
			setValue(fieldName, min, { shouldValidate: true })
		} else if (value > max) {
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

	// 外部データ変更時の初期化管理（軽量化でちらつき防止）
	useEffect(() => {
		// データが変更されたときは一時的に変更検知を無効化
		setIsInitialized(false)
		// 次のティックで再有効化（ちらつき最小化）
		const timer = setTimeout(() => setIsInitialized(true), 30)
		return () => clearTimeout(timer)
	}, [effectiveStats])

	// 後方互換性のためのonChange（省略可能）
	const stableOnChange = useCallback(onChange || (() => {}), [onChange])

	// フォームの値変更を監視して親に通知
	useEffect(() => {
		const subscription = watch((value, { name, type }) => {
			// 初期化中やプログラム的な変更は無視
			if (!isInitialized || !name || !value || type !== 'change') {
				return
			}

			// 全ての値が有効な数値の場合のみonChangeを呼ぶ
			const isAllValid = Object.values(value).every(
				(v) => typeof v === 'number' && !Number.isNaN(v) && v >= 1,
			)

			if (isAllValid) {
				// Zustandストアを更新（完全移行）
				updateBaseStats(value as BaseStats)

				// 後方互換性のため従来のonChangeも呼び出し
				if (onChange) {
					stableOnChange(value as BaseStats)
				}
			}
		})
		return () => subscription.unsubscribe()
	}, [watch, stableOnChange, isInitialized, updateBaseStats])

	return (
		<section className="bg-white rounded-lg shadow-md p-4 md:col-start-1 md:col-end-5 md:row-start-1 md:row-end-2 lg:col-start-1 lg:col-end-3 lg:row-start-1 lg:row-end-2">
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
										if (value === '' || value === null || value === undefined) {
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
										if (value === '' || value === null || value === undefined) {
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
										if (value === '' || value === null || value === undefined) {
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
										if (value === '' || value === null || value === undefined) {
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
										if (value === '' || value === null || value === undefined) {
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
										if (value === '' || value === null || value === undefined) {
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
										if (value === '' || value === null || value === undefined) {
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
										if (value === '' || value === null || value === undefined) {
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
										if (value === '' || value === null || value === undefined) {
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
