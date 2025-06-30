'use client'

import { useState, useEffect } from 'react'
import type { BuffSkillDefinition, BuffSkillState } from '@/types/buffSkill'
import { getInputHint } from '@/utils/buffSkillUtils'

interface SkillParameterModalProps {
	skill: BuffSkillDefinition
	currentState: BuffSkillState
	isOpen: boolean
	onClose: () => void
	onSave: (newState: BuffSkillState) => void
}

export default function SkillParameterModal({
	skill,
	currentState,
	isOpen,
	onClose,
	onSave,
}: SkillParameterModalProps) {
	const [tempState, setTempState] = useState<BuffSkillState>(currentState)

	// モーダルが開いたときに現在の状態を同期
	useEffect(() => {
		if (isOpen) {
			setTempState(currentState)
		}
	}, [isOpen, currentState])

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

	const handleSave = () => {
		onSave(tempState)
		onClose()
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
											<input
												type="number"
												min={1}
												max={skill.maxLevel || 10}
												value={tempState.level || 1}
												onChange={(e) =>
													setTempState((prev) => ({
														...prev,
														level: Number(e.target.value),
													}))
												}
												className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
												placeholder="スキルレベルを入力してください"
											/>
										</div>
									)}

									{skill.type === 'stack' && (
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												重ねがけ数 (1-{skill.maxStack || 10})
											</label>
											<select
												value={tempState.stackCount || 1}
												onChange={(e) =>
													setTempState((prev) => ({
														...prev,
														stackCount: Number(e.target.value),
													}))
												}
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
												value={tempState.specialParam || 0}
												onChange={(e) =>
													setTempState((prev) => ({
														...prev,
														specialParam: Number(e.target.value),
													}))
												}
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
							className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
						>
							キャンセル
						</button>
						<button
							type="button"
							onClick={handleSave}
							className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
						>
							保存
						</button>
					</div>
				</div>
			</div>
		</dialog>
	)
}