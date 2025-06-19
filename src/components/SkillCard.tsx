'use client'

import { useState } from 'react'
import { Popover } from './Popover'
import { SkillParameterForm } from './SkillParameterForm'
import ToggleSwitch from './ToggleSwitch'
import type { BuffSkill, BuffSkillParameters } from '@/types/calculator'

interface SkillCardProps {
	skill: BuffSkill
	categoryLabel: string
	onToggle: (skillId: string, enabled: boolean) => void
	onParameterChange: (skillId: string, parameters: BuffSkillParameters) => void
}

export default function SkillCard({
	skill,
	categoryLabel,
	onToggle,
	onParameterChange,
}: SkillCardProps) {
	const [isPopoverOpen, setIsPopoverOpen] = useState(false)

	// スキル名の表示形式を決定（パラメータ値付き）
	const getDisplayName = (): string => {
		if (!skill.isEnabled) return skill.name

		// スキルレベルがある場合は「スキル名/レベル」形式
		if (skill.parameters.skillLevel) {
			return `${skill.name}/${skill.parameters.skillLevel}`
		}

		// スタックカウントがある場合
		if (skill.parameters.stackCount) {
			return `${skill.name}(${skill.parameters.stackCount})`
		}

		// その他のパラメータがある場合は基本名のみ
		return skill.name
	}

	// パラメータが必要かどうかを判定
	const hasParameters = (): boolean => {
		switch (skill.id) {
			// マスタリスキル
			case 'halberd_mastery':
			case 'blade_mastery':
			case 'shoot_mastery':
			case 'magic_mastery':
			case 'martial_mastery':
			case 'dual_mastery':
			case 'shield_mastery':
				return true

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
			// 重ねがけ系
			case 'tornado_lance':
			case 'netsujo_no_uta':
			case 'shinsoku_no_sabaki':
			// 特殊パラメータ
			case 'brave':
				return true

			// パラメータ不要（オン/オフのみ）
			default:
				return false
		}
	}

	const handleParameterSave = (parameters: BuffSkillParameters) => {
		onParameterChange(skill.id, parameters)
		setIsPopoverOpen(false)
	}

	const handleParameterCancel = () => {
		setIsPopoverOpen(false)
	}

	return (
		<div className="skill-card border border-gray-200 rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition-shadow">
			{/* カテゴリラベル */}
			<div className="category-label text-xs text-gray-500 font-medium mb-2 pb-1 border-b border-gray-100">
				{categoryLabel}
			</div>

			{/* スキル名とトグルスイッチ */}
			<div className="skill-header flex items-center justify-between mb-3">
				{hasParameters() ? (
					<Popover
						trigger={
							<span className="skill-name text-sm font-medium text-gray-700 flex-1 mr-2 leading-tight hover:text-blue-600 cursor-pointer">
								{getDisplayName()}
							</span>
						}
						isOpen={isPopoverOpen}
						onOpenChange={setIsPopoverOpen}
						placement="bottom"
					>
						<SkillParameterForm
							skill={skill}
							onSave={handleParameterSave}
							onCancel={handleParameterCancel}
						/>
					</Popover>
				) : (
					<span className="skill-name text-sm font-medium text-gray-700 flex-1 mr-2 leading-tight">
						{getDisplayName()}
					</span>
				)}
				<ToggleSwitch
					checked={skill.isEnabled}
					onChange={(checked) => onToggle(skill.id, checked)}
					size="sm"
				/>
			</div>
		</div>
	)
}
