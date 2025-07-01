'use client'

import { useCallback, useMemo } from 'react'
import { useCalculatorStore } from '@/stores/calculatorStore'
import type { BuffSkillDefinition } from '@/types/buffSkill'

interface StackCountModalProps {
	skill: BuffSkillDefinition
	isOpen: boolean
	onClose: () => void
}

export default function StackCountModal({
	skill,
	isOpen,
	onClose,
}: StackCountModalProps) {
	// Zustandストアから現在のスキル状態を取得
	const defaultState = useMemo(
		() => ({
			isEnabled: false,
			level: 10,
			stackCount: 1,
			specialParam: 0,
		}),
		[],
	)

	const currentState = useCalculatorStore(
		useCallback(
			(state) => {
				const buffSkillsData = state.data.buffSkills.skills

				// Handle both old array format and new Record format
				if (Array.isArray(buffSkillsData)) {
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

				const skillState = buffSkillsData[skill.id]
				return skillState || defaultState
			},
			[skill.id, defaultState],
		),
	)

	// Zustandストアの更新関数を取得
	const updateBuffSkillState = useCalculatorStore(
		(state) => state.updateBuffSkillState,
	)

	// 重ねがけ数変更ハンドラ
	const handleStackCountChange = useCallback(
		(newStackCount: number) => {
			// 範囲チェック（1-3）
			const clampedStackCount = Math.max(1, Math.min(3, newStackCount))

			updateBuffSkillState(skill.id, {
				...currentState,
				stackCount: clampedStackCount,
			})
		},
		[skill.id, currentState, updateBuffSkillState],
	)

	// モーダルが閉じているときは何も表示しない
	if (!isOpen) return null

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
				{/* ヘッダー */}
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-lg font-semibold text-gray-800">
						{skill.name} - 重ねがけ数設定
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
					>
						×
					</button>
				</div>

				{/* 重ねがけ数調整UI */}
				<div className="space-y-4">
					<div className="text-sm text-gray-600">
						重ねがけ数を調整してください（1-3）
					</div>

					{/* 重ねがけ数調整ボタン */}
					<div className="flex items-center justify-center space-x-2">
						{/* -10ボタン（最小値の1にセット） */}
						<button
							type="button"
							onClick={() => handleStackCountChange(1)}
							disabled={currentState.stackCount === 1}
							className="py-1 px-4 text-sm bg-rose-100 hover:bg-rose-200 border border-rose-200 rounded transition-colors cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
						>
							-10
						</button>

						{/* -1ボタン */}
						<button
							type="button"
							onClick={() =>
								handleStackCountChange((currentState.stackCount || 1) - 1)
							}
							disabled={currentState.stackCount <= 1}
							className="py-1 px-3 text-sm bg-rose-100 hover:bg-rose-200 border border-rose-200 rounded transition-colors cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
						>
							-1
						</button>

						{/* 重ねがけ数表示 */}
						<div className="py-1 px-6 text-base font-medium bg-gray-100 border border-gray-200 rounded min-w-[60px] text-center">
							{currentState.stackCount || 1}
						</div>

						{/* +1ボタン */}
						<button
							type="button"
							onClick={() =>
								handleStackCountChange((currentState.stackCount || 1) + 1)
							}
							disabled={currentState.stackCount >= 3}
							className="py-1 px-3 text-sm bg-blue-100 hover:bg-blue-200 border border-blue-200 rounded transition-colors cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
						>
							+1
						</button>

						{/* +10ボタン（最大値の3にセット） */}
						<button
							type="button"
							onClick={() => handleStackCountChange(3)}
							disabled={currentState.stackCount === 3}
							className="py-1 px-4 text-sm bg-blue-100 hover:bg-blue-200 border border-blue-200 rounded transition-colors cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
						>
							+10
						</button>
					</div>

					{/* 重ねがけ数の説明 */}
					<div className="text-xs text-gray-500 text-center">
						神速の捌手は最大3回まで重ねがけ可能です
					</div>
				</div>

				{/* 閉じるボタン */}
				<div className="flex justify-end mt-6">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
					>
						閉じる
					</button>
				</div>
			</div>
		</div>
	)
}
