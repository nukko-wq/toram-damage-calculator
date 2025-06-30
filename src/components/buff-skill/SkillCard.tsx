'use client'

import { useState, useMemo, useCallback } from 'react'
import type { BuffSkillDefinition } from '@/types/buffSkill'
import { CATEGORY_LABELS } from '@/types/buffSkill'
import { shouldShowModal, getSkillNameClassName } from '@/utils/buffSkillUtils'
import { useCalculatorStore } from '@/stores'
import SkillToggleButton from './SkillToggleButton'
import SkillParameterModal from './SkillParameterModal'

interface SkillCardProps {
	skill: BuffSkillDefinition
}

export default function SkillCard({
	skill,
}: SkillCardProps) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const categoryLabel = CATEGORY_LABELS[skill.category]
	
	// Zustandから現在の状態を取得（メモ化）
	const defaultState = useMemo(() => ({
		isEnabled: false,
		level: 10,
		stackCount: 1,
		specialParam: 0
	}), [])

	const currentState = useCalculatorStore(useCallback(state => {
		const buffSkillsData = state.data.buffSkills.skills
		
		// Handle both old array format and new Record format
		if (Array.isArray(buffSkillsData)) {
			// Old format: array of BuffSkill objects
			const foundSkill = buffSkillsData.find(s => s.id === skill.id)
			if (foundSkill) {
				return {
					isEnabled: foundSkill.isEnabled,
					level: foundSkill.parameters.skillLevel || 10,
					stackCount: foundSkill.parameters.stackCount || 1,
					specialParam: foundSkill.parameters.playerCount || 0
				}
			}
			return defaultState
		}
		
		// New format: Record<string, BuffSkillState>
		const skillState = buffSkillsData[skill.id]
		return skillState || defaultState
	}, [skill.id, defaultState]))
	
	// Zustandの更新メソッド
	const updateBuffSkillState = useCalculatorStore(state => state.updateBuffSkillState)

	// モーダル開閉ハンドラー
	const handleSkillNameClick = () => {
		// toggle以外のスキルのみモーダルを開く
		if (shouldShowModal(skill)) {
			setIsModalOpen(true)
		}
	}

	// スキル名の表示形式を決定（パラメータ値付き）
	const getDisplayName = (): string => {
		const level = currentState.level
		const stackCount = currentState.stackCount

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

	// スキル有効化のトグルハンドラー
	const handleToggle = (enabled: boolean) => {
		updateBuffSkillState(skill.id, {
			...currentState,
			isEnabled: enabled
		})
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
				<SkillToggleButton
					isEnabled={currentState.isEnabled}
					onToggle={handleToggle}
				/>
			</div>


			{/* モーダル */}
			<SkillParameterModal
				skill={skill}
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			/>
		</div>
	)
}