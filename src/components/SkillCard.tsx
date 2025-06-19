'use client'

import ToggleSwitch from './ToggleSwitch'
import type { BuffSkill } from '@/types/calculator'

interface SkillCardProps {
	skill: BuffSkill
	categoryLabel: string
	onToggle: (skillId: string, enabled: boolean) => void
	onParameterChange: (skillId: string, paramName: string, value: number) => void
	getParameterRange: (paramName: string) => { min: number; max: number }
	getParameterLabel: (paramName: string) => string
}

export default function SkillCard({
	skill,
	categoryLabel,
	onToggle,
	onParameterChange,
	getParameterRange,
	getParameterLabel,
}: SkillCardProps) {
	const hasParameters = Object.keys(skill.parameters).length > 0

	return (
		<div className="skill-card border border-gray-200 rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition-shadow">
			{/* カテゴリラベル */}
			<div className="category-label text-xs text-gray-500 font-medium mb-2 pb-1 border-b border-gray-100">
				{categoryLabel}
			</div>

			{/* スキル名とトグルスイッチ */}
			<div className="skill-header flex items-center justify-between mb-3">
				<span className="skill-name text-sm font-medium text-gray-700 flex-1 mr-2 leading-tight">
					{skill.name}
				</span>
				<ToggleSwitch
					checked={skill.isEnabled}
					onChange={(checked) => onToggle(skill.id, checked)}
					size="sm"
				/>
			</div>

			{/* パラメータ入力（有効時のみ表示） */}
			{skill.isEnabled && hasParameters && (
				<div className="skill-parameters space-y-2">
					{Object.entries(skill.parameters).map(([paramName, value]) => {
						const range = getParameterRange(paramName)
						const label = getParameterLabel(paramName)

						return (
							<div key={paramName} className="parameter-input">
								<label className="block text-xs font-medium text-gray-600 mb-1">
									{label}
								</label>
								<input
									type="number"
									value={value ?? range.min}
									onChange={(e) =>
										onParameterChange(
											skill.id,
											paramName,
											Number(e.target.value),
										)
									}
									min={range.min}
									max={range.max}
									className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
								/>
							</div>
						)
					})}
				</div>
			)}
		</div>
	)
}