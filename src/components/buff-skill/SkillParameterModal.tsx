'use client'

import { useEffect, useCallback, useMemo } from 'react'
import type { BuffSkillDefinition } from '@/types/buffSkill'
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
	const defaultState = useMemo(
		() => ({
			isEnabled: false,
			level: 10,
			stackCount: 1,
			specialParam: 0,
		}),
		[],
	)

	// Zustandから現在の状態を取得（メモ化してキャッシュ）
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
	const updateSkillParameter = useCalculatorStore(
		(state) => state.updateSkillParameter,
	)

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
					<div className="flex items-center justify-between p-6">
						<h3
							id="skill-modal-title"
							className="text-lg font-bold text-gray-900"
						>
							{skill.name}
						</h3>
						<button
							type="button"
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
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
						{/* パラメータ入力フォーム */}
						<div className="space-y-4">
							{/* レベル設定（toggle以外） */}
							{skill.type !== 'toggle' && (
								<>
									{skill.type === 'level' && (
										<div>
											<div className="text-sm text-gray-600 mb-3">
												スキルレベルを入力してください。
											</div>
											<div className="flex items-center justify-center space-x-2">
												{/* -10ボタン（最小値1にセット） */}
												<button
													type="button"
													onClick={() => {
														handleLevelChange(1)
													}}
													disabled={(currentState.level || 10) === 1}
													className="py-1 px-4 text-sm bg-rose-100 hover:bg-rose-200 border border-rose-200 rounded transition-colors cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-default"
												>
													-10
												</button>

												{/* -1ボタン */}
												<button
													type="button"
													onClick={() => {
														const newLevel = Math.max(
															1,
															(currentState.level || 10) - 1,
														)
														handleLevelChange(newLevel)
													}}
													disabled={(currentState.level || 10) - 1 < 1}
													className="py-1 px-3 text-sm bg-rose-100 hover:bg-rose-200 border border-rose-200 rounded transition-colors cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-default"
												>
													-1
												</button>

												{/* スキルレベル表示 */}
												<div className="py-1 px-6 text-base font-medium bg-gray-100 border border-gray-200 rounded w-[80px] text-center">
													Lv.{currentState.level || 10}
												</div>

												{/* +1ボタン */}
												<button
													type="button"
													onClick={() => {
														const maxLevel = skill.maxLevel || 10
														const newLevel = Math.min(
															maxLevel,
															(currentState.level || 10) + 1,
														)
														handleLevelChange(newLevel)
													}}
													disabled={
														(currentState.level || 10) + 1 >
														(skill.maxLevel || 10)
													}
													className="py-1 px-3 text-sm bg-blue-100 hover:bg-blue-200 border border-blue-200 rounded transition-colors cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-default"
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
													disabled={
														(currentState.level || 10) ===
														(skill.maxLevel || 10)
													}
													className="py-1 px-4 text-sm bg-blue-100 hover:bg-blue-200 border border-blue-200 rounded transition-colors cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-default"
												>
													+10
												</button>
											</div>
										</div>
									)}

									{skill.type === 'stack' && (
										<div>
											<div className="text-sm text-gray-600 mb-3">
												重ねがけ数を入力してください。
											</div>
											<div className="flex items-center justify-center space-x-2">
												{/* -10ボタン（最小値1にセット） */}
												<button
													type="button"
													onClick={() => handleStackCountChange(1)}
													disabled={(currentState.stackCount || 1) === 1}
													className="py-1 px-4 text-sm bg-rose-100 hover:bg-rose-200 border border-rose-200 rounded transition-colors cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
												>
													-10
												</button>

												{/* -1ボタン */}
												<button
													type="button"
													onClick={() =>
														handleStackCountChange(
															(currentState.stackCount || 1) - 1,
														)
													}
													disabled={(currentState.stackCount || 1) <= 1}
													className="py-1 px-3 text-sm bg-rose-100 hover:bg-rose-200 border border-rose-200 rounded transition-colors cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
												>
													-1
												</button>

												{/* スタック数表示 */}
												<div className="py-1 px-6 text-base font-medium bg-gray-100 border border-gray-200 rounded min-w-[60px] text-center">
													×{currentState.stackCount || 1}
												</div>

												{/* +1ボタン */}
												<button
													type="button"
													onClick={() =>
														handleStackCountChange(
															(currentState.stackCount || 1) + 1,
														)
													}
													disabled={
														(currentState.stackCount || 1) >=
														(skill.maxStack || 10)
													}
													className="py-1 px-3 text-sm bg-blue-100 hover:bg-blue-200 border border-blue-200 rounded transition-colors cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
												>
													+1
												</button>

												{/* +10ボタン（最大値にセット） */}
												<button
													type="button"
													onClick={() =>
														handleStackCountChange(skill.maxStack || 10)
													}
													disabled={
														(currentState.stackCount || 1) ===
														(skill.maxStack || 10)
													}
													className="py-1 px-4 text-sm bg-blue-100 hover:bg-blue-200 border border-blue-200 rounded transition-colors cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
												>
													+10
												</button>
											</div>
										</div>
									)}

									{skill.type === 'special' && (
										<div>
											<div className="text-sm text-gray-600 mb-3">
												特殊パラメータを入力してください。
											</div>
											<div className="flex items-center justify-center space-x-2">
												{/* -10ボタン */}
												<button
													type="button"
													onClick={() =>
														handleSpecialParamChange(
															Math.max(
																0,
																(currentState.specialParam || 0) - 10,
															),
														)
													}
													disabled={(currentState.specialParam || 0) <= 0}
													className="py-1 px-4 text-sm bg-rose-100 hover:bg-rose-200 border border-rose-200 rounded transition-colors cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
												>
													-10
												</button>

												{/* -1ボタン */}
												<button
													type="button"
													onClick={() =>
														handleSpecialParamChange(
															Math.max(0, (currentState.specialParam || 0) - 1),
														)
													}
													disabled={(currentState.specialParam || 0) <= 0}
													className="py-1 px-3 text-sm bg-rose-100 hover:bg-rose-200 border border-rose-200 rounded transition-colors cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
												>
													-1
												</button>

												{/* 値表示 */}
												<div className="py-1 px-6 text-base font-medium bg-gray-100 border border-gray-200 rounded min-w-[60px] text-center">
													{currentState.specialParam || 0}
												</div>

												{/* +1ボタン */}
												<button
													type="button"
													onClick={() =>
														handleSpecialParamChange(
															(currentState.specialParam || 0) + 1,
														)
													}
													className="py-1 px-3 text-sm bg-blue-100 hover:bg-blue-200 border border-blue-200 rounded transition-colors cursor-pointer"
												>
													+1
												</button>

												{/* +10ボタン */}
												<button
													type="button"
													onClick={() =>
														handleSpecialParamChange(
															(currentState.specialParam || 0) + 10,
														)
													}
													className="py-1 px-4 text-sm bg-blue-100 hover:bg-blue-200 border border-blue-200 rounded transition-colors cursor-pointer"
												>
													+10
												</button>
											</div>
										</div>
									)}
								</>
							)}
						</div>
					</div>

					{/* フッター */}
					<div className="flex justify-end space-x-2 p-6">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors cursor-pointer"
						>
							閉じる
						</button>
					</div>
				</div>
			</div>
		</dialog>
	)
}
