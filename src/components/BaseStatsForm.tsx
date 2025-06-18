'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { baseStatsSchema, type BaseStatsFormData } from '@/schemas/baseStats'
import type { BaseStats } from '@/types/calculator'
import { useEffect, useCallback } from 'react'

interface BaseStatsFormProps {
	stats: BaseStats
	onChange: (stats: BaseStats) => void
}

// ステータスフィールドコンポーネント（コンポーネント外に定義して再作成を防ぐ）
interface StatFieldProps {
	label: string
	name: keyof BaseStatsFormData
	max: number
	register: any
	errors: any
	handleBlur: (name: keyof BaseStatsFormData) => void
}

const StatField = ({ label, name, max, register, errors, handleBlur }: StatFieldProps) => (
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
					setValueAs: (value) => {
						// 空文字やNaNの場合は1を返す
						if (value === '' || value === null || value === undefined) {
							return 1
						}
						const numValue = Number(value)
						return isNaN(numValue) ? 1 : numValue
					},
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

export default function BaseStatsForm({ stats, onChange }: BaseStatsFormProps) {
	const {
		register,
		watch,
		formState: { errors },
		setValue,
		getValues,
	} = useForm<BaseStatsFormData>({
		resolver: zodResolver(baseStatsSchema),
		values: stats,
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

	// valuesを使用するため、外部からの変更検知は不要

	// onChangeをuseCallbackでメモ化して安定化
	const stableOnChange = useCallback(onChange, [])

	// フォームの値変更を監視して親に通知
	useEffect(() => {
		const subscription = watch((value) => {
			// 全ての値が有効な数値の場合のみonChangeを呼ぶ
			const isAllValid = Object.values(value).every((v) => 
				typeof v === 'number' && !isNaN(v) && v >= 1
			)
			
			if (isAllValid) {
				stableOnChange(value as BaseStats)
			}
		})
		return () => subscription.unsubscribe()
	}, [watch, stableOnChange])


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
						errors={errors}
						handleBlur={handleBlur}
					/>
				</div>
				{/* メインステータス第1行 */}
				<div className="grid grid-cols-3 gap-3">
					<StatField 
						label="STR" 
						name="STR" 
						max={510} 
						register={register}
						errors={errors}
						handleBlur={handleBlur}
					/>
					<StatField 
						label="INT" 
						name="INT" 
						max={510} 
						register={register}
						errors={errors}
						handleBlur={handleBlur}
					/>
					<StatField 
						label="VIT" 
						name="VIT" 
						max={510} 
						register={register}
						errors={errors}
						handleBlur={handleBlur}
					/>
				</div>

				{/* メインステータス第2行 */}
				<div className="grid grid-cols-3 gap-3">
					<StatField 
						label="AGI" 
						name="AGI" 
						max={510} 
						register={register}
						errors={errors}
						handleBlur={handleBlur}
					/>
					<StatField 
						label="DEX" 
						name="DEX" 
						max={510} 
						register={register}
						errors={errors}
						handleBlur={handleBlur}
					/>
				</div>

				{/* 特殊ステータス行 */}
				<div className="grid grid-cols-3 gap-3">
					<StatField 
						label="CRT" 
						name="CRT" 
						max={255} 
						register={register}
						errors={errors}
						handleBlur={handleBlur}
					/>
					<StatField 
						label="MEN" 
						name="MEN" 
						max={255} 
						register={register}
						errors={errors}
						handleBlur={handleBlur}
					/>
					<StatField 
						label="TEC" 
						name="TEC" 
						max={255} 
						register={register}
						errors={errors}
						handleBlur={handleBlur}
					/>
				</div>
			</div>
		</section>
	)
}
