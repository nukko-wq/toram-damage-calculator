'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { baseStatsSchema, type BaseStatsFormData } from '@/schemas/baseStats'
import type { BaseStats } from '@/types/calculator'
import { useEffect } from 'react'

interface BaseStatsFormProps {
	stats: BaseStats
	onChange: (stats: BaseStats) => void
}

export default function BaseStatsForm({ stats, onChange }: BaseStatsFormProps) {
	const {
		register,
		watch,
		formState: { errors },
		reset,
		setValue,
		getValues,
	} = useForm<BaseStatsFormData>({
		resolver: zodResolver(baseStatsSchema),
		defaultValues: stats,
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

	// 外部からのstats変更を反映
	useEffect(() => {
		// フォームが初期化されていない場合のみリセット
		const currentValues = watch()
		const hasChanges = Object.keys(stats).some(
			(key) =>
				currentValues[key as keyof BaseStatsFormData] !==
				stats[key as keyof BaseStats],
		)

		if (hasChanges && Object.keys(errors).length === 0) {
			reset(stats)
		}
	}, [stats, reset, watch, errors])

	// フォームの値変更を監視して親に通知
	useEffect(() => {
		const subscription = watch((value) => {
			// 全ての値が揃っている場合は常にonChangeを呼ぶ（バリデーションエラーがあっても）
			if (Object.values(value).every((v) => v !== undefined && v !== null)) {
				onChange(value as BaseStats)
			}
		})
		return () => subscription.unsubscribe()
	}, [watch, onChange])

	// ステータスフィールドコンポーネント
	const StatField = ({
		label,
		name,
		max,
	}: {
		label: string
		name: keyof BaseStatsFormData
		max: number
	}) => (
		<div className="flex items-center gap-2">
			<label
				htmlFor={`stat-${name}`}
				className="text-sm font-medium text-gray-700 w-12 flex-shrink-0"
			>
				{label}:
			</label>
			<div className="flex flex-col flex-1">
				<input
					id={`stat-${name}`}
					type="number"
					className={`px-1 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent w-full ${
						errors[name] ? 'border-red-500' : 'border-gray-300'
					}`}
					min="1"
					max={max}
					{...register(name, {
						valueAsNumber: true,
						onBlur: () => handleBlur(name),
					})}
				/>
				{errors[name] && (
					<span className="text-red-500 text-xs mt-1">
						{errors[name]?.message}
					</span>
				)}
			</div>
		</div>
	)

	return (
		<section className="bg-white rounded-lg shadow-md p-4 lg:col-start-1 lg:col-end-3 lg:row-start-1 lg:row-end-2">
			<h2 className="text-lg font-bold text-gray-800 mb-3">基本ステータス</h2>
			<div className="flex flex-col gap-2">
				{/* レベル行 */}
				<div className="grid grid-cols-3 gap-3">
					<StatField label="レベル" name="level" max={510} />
				</div>
				{/* メインステータス第1行 */}
				<div className="grid grid-cols-3 gap-3">
					<StatField label="STR" name="STR" max={510} />
					<StatField label="INT" name="INT" max={510} />
					<StatField label="VIT" name="VIT" max={510} />
				</div>

				{/* メインステータス第2行 */}
				<div className="grid grid-cols-3 gap-3">
					<StatField label="AGI" name="AGI" max={510} />
					<StatField label="DEX" name="DEX" max={510} />
				</div>

				{/* 特殊ステータス行 */}
				<div className="grid grid-cols-3 gap-3">
					<StatField label="CRT" name="CRT" max={255} />
					<StatField label="MEN" name="MEN" max={255} />
					<StatField label="TEC" name="TEC" max={255} />
				</div>
			</div>
		</section>
	)
}
