'use client'

import { useState, useMemo, useCallback } from 'react'
import type { BuffSkillDefinition } from '@/types/buffSkill'
import { CATEGORY_LABELS } from '@/types/buffSkill'
import { shouldShowModal, getSkillNameClassName } from '@/utils/buffSkillUtils'
import { useCalculatorStore } from '@/stores'
import SkillToggleButton from './SkillToggleButton'
import SkillParameterModal from './SkillParameterModal'
import StackCountModal from './StackCountModal'
import MultiParamModal from './MultiParamModal'

interface SkillCardProps {
	skill: BuffSkillDefinition
}

export default function SkillCard({ skill }: SkillCardProps) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const categoryLabel = CATEGORY_LABELS[skill.category]

	// Zustandから現在の状態を取得（メモ化）
	const defaultState = useMemo(() => {
		// 特別なデフォルト値
		const defaultStackCount =
			skill.id === 'ds6' ? 100 : skill.id === 'mg2' ? 15 : 1

		return {
			isEnabled: false,
			level: 10,
			stackCount: defaultStackCount,
			specialParam: 0,
		}
	}, [skill.id])

	const currentState = useCalculatorStore(
		useCallback(
			(state) => {
				const buffSkillsData = state.data.buffSkills.skills

				// Handle both old array format and new Record format
				if (Array.isArray(buffSkillsData)) {
					// Old format: array of BuffSkill objects
					const foundSkill = buffSkillsData.find((s) => s.id === skill.id)
					if (foundSkill) {
						return {
							isEnabled: foundSkill.isEnabled,
							level: foundSkill.parameters.skillLevel || 10,
							stackCount: foundSkill.parameters.stackCount || 1,
							specialParam: foundSkill.parameters.playerCount || 0,
						}
					}
					return defaultState
				}

				// New format: Record<string, BuffSkillState>
				const skillState = buffSkillsData[skill.id]
				return skillState || defaultState
			},
			[skill.id, defaultState],
		),
	)

	// Zustandの更新メソッド
	const updateBuffSkillState = useCalculatorStore(
		(state) => state.updateBuffSkillState,
	)

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
				return `${skill.name}/${level || 1}`

			case 'stack':
				return `${skill.name}×${stackCount || 1}`

			case 'multiParam':
				if (skill.id === 'IsBrave') {
					return `${skill.name}/${(level || 2) === 1 ? '使用者' : '非使用者'}`
				}
				if (skill.id === 'IsWarcry') {
					return `${skill.name}/${(level || 2) === 1 ? '両手剣' : '両手剣以外'}`
				}
				return `${skill.name}/${level || 1}`

			default:
				return skill.name
		}
	}

	// スキル有効化のトグルハンドラー
	const handleToggle = (enabled: boolean) => {
		updateBuffSkillState(skill.id, {
			...currentState,
			isEnabled: enabled,
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
						if (
							shouldShowModal(skill) &&
							(e.key === 'Enter' || e.key === ' ')
						) {
							e.preventDefault()
							handleSkillNameClick()
						}
					}}
					aria-label={
						shouldShowModal(skill) ? `${skill.name}の詳細設定を開く` : undefined
					}
				>
					{getDisplayName()}
				</span>
				<SkillToggleButton
					isEnabled={currentState.isEnabled}
					onToggle={handleToggle}
				/>
			</div>

			{/* モーダル - スキル専用またはデフォルト */}
			{skill.type === 'stack' ? (
				<StackCountModal
					skill={skill}
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
				/>
			) : skill.type === 'multiParam' ? (
				<MultiParamModal
					skill={skill}
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
				/>
			) : (
				<SkillParameterModal
					skill={skill}
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
				/>
			)}
		</div>
	)
}
