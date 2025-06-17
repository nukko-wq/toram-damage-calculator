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
		let min = 1
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

	return (
		<section className="bg-white rounded-lg shadow-md p-6 lg:col-start-1 lg:col-end-3 lg:row-start-1 lg:row-end-2">
			<h2 className="text-xl font-bold text-gray-800 mb-4">基本ステータス</h2>
			<div className="flex flex-col gap-3">
				{/* レベル */}
				<div className="grid grid-cols-3 gap-4">
					<div className="flex flex-col">
						<label
							htmlFor="stat-level"
							className="text-sm font-medium text-gray-500"
						>
							レベル
						</label>
						<input
							id="stat-level"
							type="number"
							className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
								errors.level ? 'border-red-500' : 'border-gray-300'
							}`}
							min="1"
							max="510"
							{...register('level', {
								valueAsNumber: true,
								onBlur: () => handleBlur('level'),
							})}
						/>
						{errors.level && (
							<p className="text-red-500 text-xs mt-1">
								{errors.level.message}
							</p>
						)}
					</div>
				</div>
				<div className="grid grid-cols-3 gap-4">
					{/* STR（力） */}
					<div className="flex flex-col">
						<label
							htmlFor="stat-str"
							className="text-sm font-medium text-gray-500"
						>
							STR
						</label>
						<input
							id="stat-str"
							type="number"
							className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
								errors.STR ? 'border-red-500' : 'border-gray-300'
							}`}
							min="1"
							max="510"
							{...register('STR', {
								valueAsNumber: true,
								onBlur: () => handleBlur('STR'),
							})}
						/>
						{errors.STR && (
							<p className="text-red-500 text-xs mt-1">{errors.STR.message}</p>
						)}
					</div>

					{/* INT（知力） */}
					<div className="flex flex-col">
						<label
							htmlFor="stat-int"
							className="text-sm font-medium text-gray-500"
						>
							INT
						</label>
						<input
							id="stat-int"
							type="number"
							className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
								errors.INT ? 'border-red-500' : 'border-gray-300'
							}`}
							min="1"
							max="510"
							{...register('INT', {
								valueAsNumber: true,
								onBlur: () => handleBlur('INT'),
							})}
						/>
						{errors.INT && (
							<p className="text-red-500 text-xs mt-1">{errors.INT.message}</p>
						)}
					</div>

					{/* VIT（体力） */}
					<div className="flex flex-col">
						<label
							htmlFor="stat-vit"
							className="text-sm font-medium text-gray-500"
						>
							VIT
						</label>
						<input
							id="stat-vit"
							type="number"
							className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
								errors.VIT ? 'border-red-500' : 'border-gray-300'
							}`}
							min="1"
							max="510"
							{...register('VIT', {
								valueAsNumber: true,
								onBlur: () => handleBlur('VIT'),
							})}
						/>
						{errors.VIT && (
							<p className="text-red-500 text-xs mt-1">{errors.VIT.message}</p>
						)}
					</div>
				</div>

				<div className="grid grid-cols-3 gap-4">
					{/* AGI（俊敏性） */}
					<div className="flex flex-col">
						<label
							htmlFor="stat-agi"
							className="text-sm font-medium text-gray-500"
						>
							AGI
						</label>
						<input
							id="stat-agi"
							type="number"
							className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
								errors.AGI ? 'border-red-500' : 'border-gray-300'
							}`}
							min="1"
							max="510"
							{...register('AGI', {
								valueAsNumber: true,
								onBlur: () => handleBlur('AGI'),
							})}
						/>
						{errors.AGI && (
							<p className="text-red-500 text-xs mt-1">{errors.AGI.message}</p>
						)}
					</div>

					{/* DEX（器用さ） */}
					<div className="flex flex-col">
						<label
							htmlFor="stat-dex"
							className="text-sm font-medium text-gray-500"
						>
							DEX
						</label>
						<input
							id="stat-dex"
							type="number"
							className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
								errors.DEX ? 'border-red-500' : 'border-gray-300'
							}`}
							min="1"
							max="510"
							{...register('DEX', {
								valueAsNumber: true,
								onBlur: () => handleBlur('DEX'),
							})}
						/>
						{errors.DEX && (
							<p className="text-red-500 text-xs mt-1">{errors.DEX.message}</p>
						)}
					</div>
				</div>

				<div className="grid grid-cols-3 gap-4">
					{/* CRT（クリティカル） */}
					<div className="flex flex-col">
						<label
							htmlFor="stat-crt"
							className="text-sm font-medium text-gray-500"
						>
							CRT
						</label>
						<input
							id="stat-crt"
							type="number"
							className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
								errors.CRT ? 'border-red-500' : 'border-gray-300'
							}`}
							min="1"
							max="255"
							{...register('CRT', {
								valueAsNumber: true,
								onBlur: () => handleBlur('CRT'),
							})}
						/>
						{errors.CRT && (
							<p className="text-red-500 text-xs mt-1">{errors.CRT.message}</p>
						)}
					</div>

					{/* MEN（精神力） */}
					<div className="flex flex-col">
						<label
							htmlFor="stat-men"
							className="text-sm font-medium text-gray-500"
						>
							MEN
						</label>
						<input
							id="stat-men"
							type="number"
							className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
								errors.MEN ? 'border-red-500' : 'border-gray-300'
							}`}
							min="1"
							max="255"
							{...register('MEN', {
								valueAsNumber: true,
								onBlur: () => handleBlur('MEN'),
							})}
						/>
						{errors.MEN && (
							<p className="text-red-500 text-xs mt-1">{errors.MEN.message}</p>
						)}
					</div>

					{/* TEC（技術力） */}
					<div className="flex flex-col">
						<label
							htmlFor="stat-tec"
							className="text-sm font-medium text-gray-500"
						>
							TEC
						</label>
						<input
							id="stat-tec"
							type="number"
							className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
								errors.TEC ? 'border-red-500' : 'border-gray-300'
							}`}
							min="1"
							max="255"
							{...register('TEC', {
								valueAsNumber: true,
								onBlur: () => handleBlur('TEC'),
							})}
						/>
						{errors.TEC && (
							<p className="text-red-500 text-xs mt-1">{errors.TEC.message}</p>
						)}
					</div>
				</div>

				<div className="grid grid-cols-3 gap-4">
					{/* LUK（運） */}
					<div className="flex flex-col">
						<label
							htmlFor="stat-luk"
							className="text-sm font-medium text-gray-500"
						>
							LUK
						</label>
						<input
							id="stat-luk"
							type="number"
							className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
								errors.LUK ? 'border-red-500' : 'border-gray-300'
							}`}
							min="1"
							max="255"
							{...register('LUK', {
								valueAsNumber: true,
								onBlur: () => handleBlur('LUK'),
							})}
						/>
						{errors.LUK && (
							<p className="text-red-500 text-xs mt-1">{errors.LUK.message}</p>
						)}
					</div>
				</div>
			</div>
		</section>
	)
}
