'use client'

import { useCallback, useMemo } from 'react'
import { useCalculatorStore } from '@/stores/calculatorStore'
import type { BuffSkillDefinition } from '@/types/buffSkill'

interface LevelAndStackModalProps {
	skill: BuffSkillDefinition
	isOpen: boolean
	onClose: () => void
}

export default function LevelAndStackModal({
	skill,
	isOpen,
	onClose,
}: LevelAndStackModalProps) {
	// Zustandストアから現在のスキル状態を取得
	const defaultState = useMemo(
		() => ({
			isEnabled: false,
			level: 10,
			stackCount: skill.id === 'ds6' ? 100 : skill.id === 'mg2' ? 15 : 1, // セイバーオーラは100、急速チャージは15、その他は1
			specialParam: 0,
		}),
		[skill.id],
	)

	const currentState = useCalculatorStore(
		useCallback(
			(state) => {
				const buffSkillsData = state.data.buffSkills.skills

				// Handle both old array format and new Record format
				if (Array.isArray(buffSkillsData)) {
					const foundSkill = buffSkillsData.find((s) => s.id === skill.id)
					if (foundSkill) {
						const defaultStackCount = skill.id === 'ds6' ? 100 : 1
						return {
							isEnabled: foundSkill.isEnabled,
							level: foundSkill.parameters.skillLevel || 10,
							stackCount: foundSkill.parameters.stackCount || defaultStackCount,
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

	// レベル変更ハンドラ
	const handleLevelChange = useCallback(
		(newLevel: number) => {
			const maxLevel = skill.maxLevel || 10
			const clampedLevel = Math.max(1, Math.min(maxLevel, newLevel))

			updateBuffSkillState(skill.id, {
				...currentState,
				level: clampedLevel,
			})
		},
		[skill.id, currentState, updateBuffSkillState, skill.maxLevel],
	)

	// スタック数変更ハンドラ
	const handleStackCountChange = useCallback(
		(newStackCount: number) => {
			const maxStack = skill.maxStack || 10
			const clampedStackCount = Math.max(1, Math.min(maxStack, newStackCount))

			updateBuffSkillState(skill.id, {
				...currentState,
				stackCount: clampedStackCount,
			})
		},
		[skill.id, currentState, updateBuffSkillState, skill.maxStack],
	)

	// 背景クリックでモーダルを閉じる
	const handleBackgroundClick = (e: React.MouseEvent) => {
		// クリックされた要素がモーダルコンテンツ内かどうかをチェック
		const modalContent = document.querySelector('[data-modal-content="true"]')
		const target = e.target as Element

		if (modalContent && !modalContent.contains(target)) {
			onClose()
		}
	}

	const handleContentClick = (e: React.MouseEvent) => {
		// モーダル内のクリックは伝播を停止
		e.stopPropagation()
	}

	// モーダルが閉じているときは何も表示しない
	if (!isOpen) return null

	return (
		<div 
			className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
			onClick={handleBackgroundClick}
		>
			<div 
				className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
				onClick={handleContentClick}
				data-modal-content="true"
			>
				{/* ヘッダー */}
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-lg font-semibold text-gray-800">
						{skill.name} - レベル・重ねがけ数設定
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
					>
						×
					</button>
				</div>

				{/* 設定UI */}
				<div className="space-y-6">
					{/* スキルレベル設定 */}
					<div>
						<div className="text-sm text-gray-600 mb-3">
							スキルレベルを入力してください。
						</div>
						<div className="flex items-center justify-center space-x-2">
							{/* レベル -10ボタン */}
							<button
								type="button"
								onClick={() => handleLevelChange(1)}
								disabled={currentState.level === 1}
								className="py-1 px-4 text-sm bg-rose-100 hover:bg-rose-200 border border-rose-200 rounded transition-colors cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
							>
								-10
							</button>

							{/* レベル -1ボタン */}
							<button
								type="button"
								onClick={() =>
									handleLevelChange((currentState.level || 10) - 1)
								}
								disabled={currentState.level <= 1}
								className="py-1 px-3 text-sm bg-rose-100 hover:bg-rose-200 border border-rose-200 rounded transition-colors cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
							>
								-1
							</button>

							{/* レベル表示 */}
							<div className="py-1 px-6 text-base font-medium bg-gray-100 border border-gray-200 rounded min-w-[60px] text-center">
								Lv.{currentState.level || 10}
							</div>

							{/* レベル +1ボタン */}
							<button
								type="button"
								onClick={() =>
									handleLevelChange((currentState.level || 10) + 1)
								}
								disabled={currentState.level >= (skill.maxLevel || 10)}
								className="py-1 px-3 text-sm bg-blue-100 hover:bg-blue-200 border border-blue-200 rounded transition-colors cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
							>
								+1
							</button>

							{/* レベル +10ボタン */}
							<button
								type="button"
								onClick={() => handleLevelChange(skill.maxLevel || 10)}
								disabled={currentState.level === (skill.maxLevel || 10)}
								className="py-1 px-4 text-sm bg-blue-100 hover:bg-blue-200 border border-blue-200 rounded transition-colors cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
							>
								+10
							</button>
						</div>
					</div>

					{/* 重ねがけ数設定 */}
					<div>
						<div className="text-sm text-gray-600 mb-3">
							カウント数を入力してください。
						</div>
						<div className="flex items-center justify-center space-x-2">
							{/* スタック -10ボタン */}
							<button
								type="button"
								onClick={() => handleStackCountChange(1)}
								disabled={currentState.stackCount === 1}
								className="py-1 px-4 text-sm bg-rose-100 hover:bg-rose-200 border border-rose-200 rounded transition-colors cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
							>
								-10
							</button>

							{/* スタック -1ボタン */}
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

							{/* スタック数表示 */}
							<div className="py-1 px-6 text-base font-medium bg-gray-100 border border-gray-200 rounded min-w-[60px] text-center">
								×{currentState.stackCount || 1}
							</div>

							{/* スタック +1ボタン */}
							<button
								type="button"
								onClick={() =>
									handleStackCountChange((currentState.stackCount || 1) + 1)
								}
								disabled={currentState.stackCount >= (skill.maxStack || 10)}
								className="py-1 px-3 text-sm bg-blue-100 hover:bg-blue-200 border border-blue-200 rounded transition-colors cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
							>
								+1
							</button>

							{/* スタック +10ボタン */}
							<button
								type="button"
								onClick={() => handleStackCountChange(skill.maxStack || 10)}
								disabled={currentState.stackCount === (skill.maxStack || 10)}
								className="py-1 px-4 text-sm bg-blue-100 hover:bg-blue-200 border border-blue-200 rounded transition-colors cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
							>
								+10
							</button>
						</div>
					</div>

					{/* 説明 */}
					<div className="text-xs text-gray-500 text-center">
						{skill.name}はカウント数1-{skill.maxStack || 10}まで設定可能です
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
