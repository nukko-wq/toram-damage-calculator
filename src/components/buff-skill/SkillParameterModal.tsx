'use client'

import { useEffect, useCallback, useMemo } from 'react'
import type { BuffSkillDefinition } from '@/types/buffSkill'
import { getInputHint } from '@/utils/buffSkillUtils'
import { useCalculatorStore } from '@/stores'

interface SkillParameterModalProps {
	skill: BuffSkillDefinition
	isOpen: boolean
	onClose: () => void
}

export default function SkillParameterModal({
	skill,
	isOpen,
	onClose,
}: SkillParameterModalProps) {
	// デフォルト値をメモ化して同一オブジェクトを保証
	const defaultState = useMemo(() => ({
		isEnabled: false,
		level: 10,
		stackCount: 1,
		specialParam: 0
	}), [])

	// Zustandから現在の状態を取得（メモ化してキャッシュ）
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
	const updateSkillParameter = useCalculatorStore(state => state.updateSkillParameter)

	// ESCキーでモーダルを閉じる
	useEffect(() => {
		if (!isOpen) return

		const handleEscapeKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose()
			}
		}

		document.addEventListener('keydown', handleEscapeKey)
		return () => {
			document.removeEventListener('keydown', handleEscapeKey)
		}
	}, [isOpen, onClose])

	// レベル変更ハンドラー
	const handleLevelChange = (newLevel: number) => {
		updateSkillParameter(skill.id, 'level', newLevel)
	}

	// 重ねがけ数変更ハンドラー
	const handleStackCountChange = (newStackCount: number) => {
		updateSkillParameter(skill.id, 'stackCount', newStackCount)
	}

	// 特殊パラメータ変更ハンドラー
	const handleSpecialParamChange = (newValue: number) => {
		updateSkillParameter(skill.id, 'specialParam', newValue)
	}

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

	if (!isOpen) return null

	const inputHintText = getInputHint(skill)

	return (
		<dialog
			open={isOpen}
			className="fixed inset-0 z-50 overflow-y-auto p-0 m-0 w-full h-full bg-black/50 transition-opacity"
			onClick={handleBackgroundClick}
			aria-labelledby="skill-modal-title"
			aria-modal="true"
		>
			<div className="min-h-screen flex items-center justify-center p-4">
				<div
					className="relative bg-white rounded-lg shadow-xl max-w-md w-full"
					onClick={handleContentClick}
					data-modal-content="true"
				>
					{/* ヘッダー */}
					<div className="flex items-center justify-between p-6 border-b">
						<h3 id="skill-modal-title" className="text-lg font-bold text-gray-900">
							{skill.name}
						</h3>
						<button
							type="button"
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600 transition-colors"
							aria-label="モーダルを閉じる"
						>
							<svg
								className="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>閉じる</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>

					{/* コンテンツ */}
					<div className="p-6">
						{/* 入力補助テキスト */}
						{inputHintText && (
							<div className="mb-4 p-3 bg-blue-50 rounded">
								<p className="text-sm text-blue-700">{inputHintText}</p>
							</div>
						)}

						{/* パラメータ入力フォーム */}
						<div className="space-y-4">
							{/* レベル設定（toggle以外） */}
							{skill.type !== 'toggle' && (
								<>
									{skill.type === 'level' && (
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												スキルレベル (1-{skill.maxLevel || 10})
											</label>
											<div className="flex items-center justify-center space-x-1">
												{/* -10ボタン（最小値1にセット） */}
												<button
													type="button"
													onClick={() => {
														handleLevelChange(1)
													}}
													disabled={(currentState.level || 10) === 1}
													className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 border rounded transition-colors"
												>
													-10
												</button>
												
												{/* -1ボタン */}
												<button
													type="button"
													onClick={() => {
														const newLevel = Math.max(1, (currentState.level || 10) - 1)
														handleLevelChange(newLevel)
													}}
													disabled={((currentState.level || 10) - 1) < 1}
													className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 border rounded transition-colors"
												>
													-1
												</button>
												
												{/* スキルレベル表示 */}
												<div className="px-4 py-1 bg-blue-50 border border-blue-200 rounded text-center min-w-[3rem]">
													<span className="text-sm font-medium text-blue-700">
														{currentState.level || 10}
													</span>
												</div>
												
												{/* +1ボタン */}
												<button
													type="button"
													onClick={() => {
														const maxLevel = skill.maxLevel || 10
														const newLevel = Math.min(maxLevel, (currentState.level || 10) + 1)
														handleLevelChange(newLevel)
													}}
													disabled={((currentState.level || 10) + 1) > (skill.maxLevel || 10)}
													className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 border rounded transition-colors"
												>
													+1
												</button>
												
												{/* +10ボタン（最大値にセット） */}
												<button
													type="button"
													onClick={() => {
														const maxLevel = skill.maxLevel || 10
														handleLevelChange(maxLevel)
													}}
													disabled={(currentState.level || 10) === (skill.maxLevel || 10)}
													className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 border rounded transition-colors"
												>
													+10
												</button>
											</div>
										</div>
									)}

									{skill.type === 'stack' && (
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												重ねがけ数 (1-{skill.maxStack || 10})
											</label>
											<select
												value={currentState.stackCount || 1}
												onChange={(e) => handleStackCountChange(Number(e.target.value))}
												className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
											>
												{Array.from(
													{ length: skill.maxStack || 10 },
													(_, i) => i + 1,
												).map((num) => (
													<option key={num} value={num}>
														×{num}
													</option>
												))}
											</select>
										</div>
									)}

									{skill.type === 'special' && (
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												特殊パラメータ
											</label>
											<input
												type="number"
												min={0}
												value={currentState.specialParam || 0}
												onChange={(e) => handleSpecialParamChange(Number(e.target.value))}
												className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
												placeholder={inputHintText || '値を入力してください'}
											/>
										</div>
									)}
								</>
							)}
						</div>
					</div>

					{/* フッター */}
					<div className="flex justify-end space-x-2 p-6 border-t bg-gray-50">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
						>
							閉じる
						</button>
					</div>
				</div>
			</div>
		</dialog>
	)
}