'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { BuffSkill, BuffSkillParameters } from '@/types/calculator'

interface SkillParameterFormProps {
	skill: BuffSkill
	onSave: (parameters: BuffSkillParameters) => void
	onCancel: () => void
}

// パラメータ編集用のスキーマ
const skillParameterSchema = z.object({
	skillLevel: z.number().min(1).max(10).optional(),
	stackCount: z.number().min(1).max(10).optional(),
	playerCount: z.number().min(0).max(4).optional(),
	refinement: z.number().min(1).max(15).optional(),
	spUsed: z.number().min(25).max(80).optional(),
	isCaster: z.number().min(0).max(1).optional(),
})

export function SkillParameterForm({
	skill,
	onSave,
	onCancel,
}: SkillParameterFormProps) {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<BuffSkillParameters>({
		resolver: zodResolver(skillParameterSchema),
		defaultValues: skill.parameters,
	})

	const onSubmit = (data: BuffSkillParameters) => {
		onSave(data)
	}

	// スキルごとに必要なパラメータを決定
	const getRequiredParameters = (): Array<keyof BuffSkillParameters> => {
		switch (skill.id) {
			// マスタリスキル
			case 'halberd_mastery':
			case 'blade_mastery':
			case 'shoot_mastery':
			case 'magic_mastery':
			case 'martial_mastery':
			case 'dual_mastery':
			case 'shield_mastery':
				return ['skillLevel']

			// レベル設定があるスキル
			case 'long_range':
			case 'quick_aura':
			case 'bushido':
			case 'meikyo_shisui':
			case 'kairiki_ranshin':
			case 'shinsoku_no_kiseki':
			case 'philo_eclaire':
			case 'eternal_nightmare':
			case 'knight_pledge':
			case 'camouflage':
			case 'nindo':
			case 'ninjutsu':
			case 'ninjutsu_tanren_1':
			case 'ninjutsu_tanren_2':
			case 'mp_boost':
			case 'hp_boost':
			case 'attack_up':
			case 'kyoi_no_iryoku':
			case 'magic_power_up':
			case 'sara_naru_maryoku':
			case 'hit_up':
			case 'dodge_up':
			case 'zensen_iji_2':
				return ['skillLevel']

			// 重ねがけ系
			case 'tornado_lance':
			case 'netsujo_no_uta':
				return ['stackCount']

			// 特殊パラメータ
			case 'shinsoku_no_sabaki':
				return ['stackCount'] // 重ねがけ数 (1-3)

			case 'knight_pledge':
				return ['skillLevel', 'playerCount', 'refinement']

			case 'eternal_nightmare':
				return ['skillLevel', 'spUsed']

			case 'brave':
				return ['isCaster']

			// パラメータ不要（オン/オフのみ）
			default:
				return []
		}
	}

	const requiredParameters = getRequiredParameters()

	if (requiredParameters.length === 0) {
		return (
			<div className="p-4">
				<h3 className="font-semibold text-gray-800 mb-3">{skill.name}</h3>
				<p className="text-sm text-gray-600 mb-4">
					このスキルはオン/オフ切り替えのみです。
				</p>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={onCancel}
						className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
					>
						閉じる
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className="p-4">
			<h3 className="font-semibold text-gray-800 mb-3">{skill.name}</h3>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
				{requiredParameters.includes('skillLevel') && (
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							スキルレベル
						</label>
						<input
							{...register('skillLevel', { valueAsNumber: true })}
							type="number"
							min="1"
							max="10"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
						{errors.skillLevel && (
							<p className="text-xs text-red-600 mt-1">
								1〜10の値を入力してください
							</p>
						)}
					</div>
				)}

				{requiredParameters.includes('stackCount') && (
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							{skill.id === 'shinsoku_no_sabaki' ? '重ねがけ数' : 'カウント数'}
						</label>
						<input
							{...register('stackCount', { valueAsNumber: true })}
							type="number"
							min={skill.id === 'shinsoku_no_sabaki' ? '1' : '1'}
							max={skill.id === 'shinsoku_no_sabaki' ? '3' : '10'}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
						{errors.stackCount && (
							<p className="text-xs text-red-600 mt-1">
								{skill.id === 'shinsoku_no_sabaki'
									? '1〜3の値を入力してください'
									: '1〜10の値を入力してください'}
							</p>
						)}
					</div>
				)}

				{requiredParameters.includes('playerCount') && (
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							プレイヤー数
						</label>
						<input
							{...register('playerCount', { valueAsNumber: true })}
							type="number"
							min="0"
							max="4"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
						{errors.playerCount && (
							<p className="text-xs text-red-600 mt-1">
								0〜4の値を入力してください
							</p>
						)}
					</div>
				)}

				{requiredParameters.includes('refinement') && (
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							盾精錬値
						</label>
						<input
							{...register('refinement', { valueAsNumber: true })}
							type="number"
							min="1"
							max="15"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
						{errors.refinement && (
							<p className="text-xs text-red-600 mt-1">
								1〜15の値を入力してください
							</p>
						)}
					</div>
				)}

				{requiredParameters.includes('spUsed') && (
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							使用スキルポイント
						</label>
						<input
							{...register('spUsed', { valueAsNumber: true })}
							type="number"
							min="25"
							max="80"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
						{errors.spUsed && (
							<p className="text-xs text-red-600 mt-1">
								25〜80の値を入力してください
							</p>
						)}
					</div>
				)}

				{requiredParameters.includes('isCaster') && (
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							使用者
						</label>
						<select
							{...register('isCaster', { valueAsNumber: true })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						>
							<option value={0}>他者使用</option>
							<option value={1}>自己使用</option>
						</select>
						{errors.isCaster && (
							<p className="text-xs text-red-600 mt-1">
								使用者を選択してください
							</p>
						)}
					</div>
				)}

				<div className="flex gap-2 pt-2">
					<button
						type="submit"
						className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
					>
						適用
					</button>
					<button
						type="button"
						onClick={onCancel}
						className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
					>
						キャンセル
					</button>
				</div>
			</form>
		</div>
	)
}
