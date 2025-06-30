'use client'

import { useState } from 'react'
import { Controller, type Control, type UseFormSetValue } from 'react-hook-form'
import type { BuffSkillDefinition, BuffSkillFormData, BuffSkillState } from '@/types/buffSkill'
import { CATEGORY_LABELS } from '@/types/buffSkill'
import { shouldShowModal, getSkillNameClassName } from '@/utils/buffSkillUtils'
import NewSkillToggleButton from './NewSkillToggleButton'
import SkillParameterModal from './SkillParameterModal'

interface NewSkillCardProps {
	skill: BuffSkillDefinition
	control: Control<BuffSkillFormData>
	watch: (name?: string) => unknown
	setValue: UseFormSetValue<BuffSkillFormData>
}

export default function NewSkillCard({
	skill,
	control,
	watch,
	setValue,
}: NewSkillCardProps) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const categoryLabel = CATEGORY_LABELS[skill.category]
	const isEnabled = watch(`skills.${skill.id}.isEnabled`) as boolean

	// 現在のスキル状態を取得
	const currentState = watch(`skills.${skill.id}`) as BuffSkillState || {
		isEnabled: false,
		level: 1,
		stackCount: 1,
		specialParam: 0
	}

	// モーダル開閉ハンドラー
	const handleSkillNameClick = () => {
		// toggle以外のスキルのみモーダルを開く
		if (shouldShowModal(skill)) {
			setIsModalOpen(true)
		}
	}

	const handleModalSave = (newState: BuffSkillState) => {
		// React Hook Form の setValue を使用して状態を更新
		setValue(`skills.${skill.id}`, newState)
	}

	// スキル名の表示形式を決定（パラメータ値付き）
	const getDisplayName = (): string => {
		const level = watch(`skills.${skill.id}.level`) as number
		const stackCount = watch(`skills.${skill.id}.stackCount`) as number

		switch (skill.type) {
			case 'level':
				if (level && level > 1) {
					return `${skill.name}/${level}`
				}
				return skill.name

			case 'stack':
				if (stackCount && stackCount > 1) {
					return `${skill.name}×${stackCount}`
				}
				return skill.name

			default:
				return skill.name
		}
	}

	return (
		<div className="border-b-2 border-blue-200">
			{/* カテゴリラベル */}
			<div className="text-[10px] text-gray-500">{categoryLabel}</div>

			{/* スキル名とトグルスイッチ */}
			<div className="skill-header flex items-center justify-between mb-1">
				<span 
					className={getSkillNameClassName(skill)}
					onClick={handleSkillNameClick}
					role={shouldShowModal(skill) ? 'button' : undefined}
					tabIndex={shouldShowModal(skill) ? 0 : undefined}
					onKeyDown={(e) => {
						if (shouldShowModal(skill) && (e.key === 'Enter' || e.key === ' ')) {
							e.preventDefault()
							handleSkillNameClick()
						}
					}}
					aria-label={shouldShowModal(skill) ? `${skill.name}の詳細設定を開く` : undefined}
				>
					{getDisplayName()}
				</span>
				<Controller
					name={`skills.${skill.id}.isEnabled`}
					control={control}
					render={({ field }) => (
						<NewSkillToggleButton
							isEnabled={field.value || false}
							onToggle={field.onChange}
						/>
					)}
				/>
			</div>

			{/* パラメータ設定 */}
			{isEnabled && (
				<div className="mt-2 space-y-2">
					{skill.type === 'level' && (
						<div className="flex items-center space-x-2">
							<span className="text-xs text-gray-500">Lv:</span>
							<Controller
								name={`skills.${skill.id}.level`}
								control={control}
								render={({ field }) => (
									<input
										type="number"
										min={1}
										max={skill.maxLevel || 10}
										value={field.value || 1}
										onChange={e => field.onChange(Number(e.target.value))}
										className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
									/>
								)}
							/>
						</div>
					)}

					{skill.type === 'stack' && (
						<div className="flex items-center space-x-2">
							<span className="text-xs text-gray-500">×</span>
							<Controller
								name={`skills.${skill.id}.stackCount`}
								control={control}
								render={({ field }) => (
									<select
										value={field.value || 1}
										onChange={e => field.onChange(Number(e.target.value))}
										className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
									>
										{Array.from(
											{ length: skill.maxStack || 10 },
											(_, i) => i + 1
										).map(num => (
											<option key={num} value={num}>
												{num}
											</option>
										))}
									</select>
								)}
							/>
						</div>
					)}

					{skill.type === 'special' && (
						<div className="flex items-center space-x-2">
							<span className="text-xs text-gray-500">値:</span>
							<Controller
								name={`skills.${skill.id}.specialParam`}
								control={control}
								render={({ field }) => (
									<input
										type="number"
										min={0}
										value={field.value || 0}
										onChange={e => field.onChange(Number(e.target.value))}
										className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
										placeholder="値"
									/>
								)}
							/>
						</div>
					)}
				</div>
			)}

			{/* モーダル */}
			<SkillParameterModal
				skill={skill}
				currentState={currentState}
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSave={handleModalSave}
			/>
		</div>
	)
}