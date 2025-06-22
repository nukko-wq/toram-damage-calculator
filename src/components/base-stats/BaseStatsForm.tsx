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

// ステータスフィールドコンポーネント（コンポーネント外に定義して再作成を防ぐ）
interface StatFieldProps {
	label: string
	name: keyof BaseStatsFormData
	max: number
	register: any
	handleBlur: (name: keyof BaseStatsFormData) => void
	handleClickToClear: (name: keyof BaseStatsFormData) => void
}

const StatField = ({
	label,
	name,
	max,
	register,
	handleBlur,
	handleClickToClear,
}: StatFieldProps) => {
	return (
		<div className="flex items-center gap-2">
			<label
				htmlFor={`stat-${name}`}
				className="text-sm font-medium text-gray-700 w-12 flex-shrink-0"
			>
				{label}:
			</label>
			<div className="flex-1">
				<input
					id={`stat-${name}`}
					type="number"
					className="px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent w-full"
					min="1"
					max={max}
					onBlur={() => handleBlur(name)}
					onMouseDown={(e) => {
						// 既にフォーカスが当たっている要素をマウスダウンした場合のみクリア処理
						if (document.activeElement === e.target) {
							handleClickToClear(name)
						}
					}}
					{...register(name, {
						setValueAs: (value: string | number) => {
							// 空文字やNaNの場合は1を返す
							if (value === '' || value === null || value === undefined) {
								return 1
							}
							const numValue = Number(value)
							return Number.isNaN(numValue) ? 1 : numValue
						},
					})}
				/>
			</div>
		</div>
	)
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
		if (['CRT', 'MEN', 'TEC', 'LUK'].includes(fieldName)) {
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
			const element = document.getElementById(`stat-${fieldName}`) as HTMLInputElement
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
		<section className="bg-white rounded-lg shadow-md p-4 lg:col-start-1 lg:col-end-3 lg:row-start-1 lg:row-end-2">
			<h2 className="text-lg font-bold text-gray-800 mb-3">基本ステータス</h2>
			<div className="flex flex-col gap-2">
				{/* レベル行 */}
				<div className="grid grid-cols-3 gap-3">
					<StatField
						label="レベル"
						name="level"
						max={510}
						register={register}
						handleBlur={handleBlur}
						handleClickToClear={handleClickToClear}
					/>
				</div>
				{/* メインステータス第1行 */}
				<div className="grid grid-cols-3 gap-3">
					<StatField
						label="STR"
						name="STR"
						max={510}
						register={register}
						handleBlur={handleBlur}
						handleClickToClear={handleClickToClear}
					/>
					<StatField
						label="INT"
						name="INT"
						max={510}
						register={register}
						handleBlur={handleBlur}
						handleClickToClear={handleClickToClear}
					/>
					<StatField
						label="VIT"
						name="VIT"
						max={510}
						register={register}
						handleBlur={handleBlur}
						handleClickToClear={handleClickToClear}
					/>
				</div>

				{/* メインステータス第2行 */}
				<div className="grid grid-cols-3 gap-3">
					<StatField
						label="AGI"
						name="AGI"
						max={510}
						register={register}
						handleBlur={handleBlur}
						handleClickToClear={handleClickToClear}
					/>
					<StatField
						label="DEX"
						name="DEX"
						max={510}
						register={register}
						handleBlur={handleBlur}
						handleClickToClear={handleClickToClear}
					/>
				</div>

				{/* 特殊ステータス行 */}
				<div className="grid grid-cols-4 gap-3">
					<StatField
						label="CRT"
						name="CRT"
						max={255}
						register={register}
						handleBlur={handleBlur}
						handleClickToClear={handleClickToClear}
					/>
					<StatField
						label="MEN"
						name="MEN"
						max={255}
						register={register}
						handleBlur={handleBlur}
						handleClickToClear={handleClickToClear}
					/>
					<StatField
						label="TEC"
						name="TEC"
						max={255}
						register={register}
						handleBlur={handleBlur}
						handleClickToClear={handleClickToClear}
					/>
					<StatField
						label="LUK"
						name="LUK"
						max={255}
						register={register}
						handleBlur={handleBlur}
						handleClickToClear={handleClickToClear}
					/>
				</div>
			</div>
		</section>
	)
}
