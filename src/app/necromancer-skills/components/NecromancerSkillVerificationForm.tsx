'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
	playerLevel: z.number().min(1).max(400),
	baseAtk: z.number().min(0),
	baseDamage: z.number().min(1),
	enhancedDamage: z.number().min(1),
})

type FormData = z.infer<typeof schema>

interface NecromancerSkillVerificationFormProps {
	onCalculate?: (data: FormData) => void
}

export default function NecromancerSkillVerificationForm({
	onCalculate,
}: NecromancerSkillVerificationFormProps) {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			playerLevel: 305,
			baseAtk: 10000,
			baseDamage: 50000,
			enhancedDamage: 55000,
		},
	})

	const onSubmit = (data: FormData) => {
		onCalculate?.(data)
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			{/* キャラクター情報 */}
			<div className="space-y-4">
				<h3 className="text-lg font-medium text-gray-700">キャラクター情報</h3>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						レベル
					</label>
					<input
						type="number"
						{...register('playerLevel', { valueAsNumber: true })}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					{errors.playerLevel && (
						<p className="text-red-600 text-sm mt-1">
							{errors.playerLevel.message}
						</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						基準ATK（通常時）
					</label>
					<input
						type="number"
						{...register('baseAtk', { valueAsNumber: true })}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					{errors.baseAtk && (
						<p className="text-red-600 text-sm mt-1">{errors.baseAtk.message}</p>
					)}
				</div>





			</div>

			{/* 2点測定データ */}
			<div className="space-y-4">
				<h3 className="text-lg font-medium text-gray-700">2点測定データ</h3>
				
				<div className="bg-blue-50 p-3 rounded-md">
					<p className="text-sm text-blue-700 mb-2">
						<strong>測定方法:</strong> 同じスキルを2回使用して測定
					</p>
					<ul className="text-xs text-blue-600 space-y-1">
						<li>• 測定1: 通常のATKでダメージ測定</li>
						<li>• 測定2: ATK+100した状態でダメージ測定</li>
					</ul>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						測定1: 基準ATKでのダメージ
					</label>
					<input
						type="number"
						{...register('baseDamage', { valueAsNumber: true })}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="通常ATKでの実測ダメージ"
					/>
					{errors.baseDamage && (
						<p className="text-red-600 text-sm mt-1">
							{errors.baseDamage.message}
						</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						測定2: ATK+100でのダメージ
					</label>
					<input
						type="number"
						{...register('enhancedDamage', { valueAsNumber: true })}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="ATK+100での実測ダメージ"
					/>
					{errors.enhancedDamage && (
						<p className="text-red-600 text-sm mt-1">
							{errors.enhancedDamage.message}
						</p>
					)}
				</div>
			</div>

			<button
				type="submit"
				className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
			>
				スキル倍率・固定値を計算
			</button>
		</form>
	)
}
