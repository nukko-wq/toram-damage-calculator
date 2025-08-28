'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
	playerLevel: z.number().min(1).max(400),
	atk: z.number().min(0),
	actualDamage: z.number().min(1),
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
			atk: 10000,
			actualDamage: 50000,
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
						ATK
					</label>
					<input
						type="number"
						{...register('atk', { valueAsNumber: true })}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					{errors.atk && (
						<p className="text-red-600 text-sm mt-1">{errors.atk.message}</p>
					)}
				</div>





			</div>

			{/* 実測値 */}
			<div className="space-y-4">
				<h3 className="text-lg font-medium text-gray-700">実測値</h3>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						与えたダメージ
					</label>
					<input
						type="number"
						{...register('actualDamage', { valueAsNumber: true })}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="実際に与えたダメージを入力"
					/>
					{errors.actualDamage && (
						<p className="text-red-600 text-sm mt-1">
							{errors.actualDamage.message}
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
