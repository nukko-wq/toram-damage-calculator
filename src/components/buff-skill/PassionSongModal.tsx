'use client'

import { useCallback, useMemo } from 'react'
import { useCalculatorStore } from '@/stores/calculatorStore'
import type { BuffSkillDefinition } from '@/types/buffSkill'

interface PassionSongModalProps {
	skill: BuffSkillDefinition
	isOpen: boolean
	onClose: () => void
}

export default function PassionSongModal({
	skill,
	isOpen,
	onClose,
}: PassionSongModalProps) {
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

	// カウント数変更ハンドラ
	const handleCountChange = useCallback(
		(newCount: number) => {
			// 範囲チェック（1-10）
			const clampedCount = Math.max(1, Math.min(10, newCount))

			updateBuffSkillState(skill.id, {
				...currentState,
				stackCount: clampedCount,
				level: 10, // スキルレベルは10固定
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
						{skill.name} - カウント数設定
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
					>
						×
					</button>
				</div>

				{/* カウント数調整UI */}
				<div className="space-y-4">
					<div className="text-sm text-gray-600">
						カウント数を入力して下さい。
						<br />
						※スキルレベルは10固定です。
					</div>

					{/* カウント数調整ボタン */}
					<div className="flex items-center justify-center space-x-2">
						{/* -10ボタン（最小値の1にセット） */}
						<button
							type="button"
							onClick={() => handleCountChange(1)}
							disabled={currentState.stackCount === 1}
							className="py-1 px-4 text-sm bg-rose-100 hover:bg-rose-200 border border-rose-200 rounded transition-colors cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-default"
						>
							-10
						</button>

						{/* -1ボタン */}
						<button
							type="button"
							onClick={() =>
								handleCountChange((currentState.stackCount || 1) - 1)
							}
							disabled={currentState.stackCount <= 1}
							className="py-1 px-3 text-sm bg-rose-100 hover:bg-rose-200 border border-rose-200 rounded transition-colors cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-default"
						>
							-1
						</button>

						{/* カウント数表示 */}
						<div className="py-1 px-6 text-base font-medium bg-gray-100 border border-gray-200 rounded min-w-[60px] text-center">
							{currentState.stackCount || 1}
						</div>

						{/* +1ボタン */}
						<button
							type="button"
							onClick={() =>
								handleCountChange((currentState.stackCount || 1) + 1)
							}
							disabled={currentState.stackCount >= 10}
							className="py-1 px-3 text-sm bg-blue-100 hover:bg-blue-200 border border-blue-200 rounded transition-colors cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-default"
						>
							+1
						</button>

						{/* +10ボタン（最大値の10にセット） */}
						<button
							type="button"
							onClick={() => handleCountChange(10)}
							disabled={currentState.stackCount === 10}
							className="py-1 px-4 text-sm bg-blue-100 hover:bg-blue-200 border border-blue-200 rounded transition-colors cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-default"
						>
							+10
						</button>
					</div>

					{/* カウント数の説明 */}
					<div className="text-xs text-gray-500 text-center">
						熱情の歌は最大10カウントまで重ねがけ可能です
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
