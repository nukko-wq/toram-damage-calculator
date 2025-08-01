'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface RenameModalProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: (newName: string) => void
	currentName: string
}

export default function RenameModal({
	isOpen,
	onClose,
	onConfirm,
	currentName,
}: RenameModalProps) {
	const [newName, setNewName] = useState(currentName)
	const [isRenaming, setIsRenaming] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// モーダルが開いたときの初期化
	useEffect(() => {
		if (isOpen) {
			setNewName(currentName)
			setError(null)
			setIsRenaming(false)
		}
	}, [isOpen, currentName])

	// ESCキーでモーダルを閉じる
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				onClose()
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [isOpen, onClose])

	// 名前変更処理
	const handleRename = async () => {
		const trimmedName = newName.trim()

		// バリデーション
		if (!trimmedName) {
			setError('セーブデータ名を入力してください')
			return
		}

		if (trimmedName.length > 50) {
			setError('セーブデータ名は50文字以内で入力してください')
			return
		}

		if (trimmedName === currentName) {
			// 名前が変更されていない場合はそのまま閉じる
			onClose()
			return
		}

		try {
			setIsRenaming(true)
			setError(null)
			onConfirm(trimmedName)
		} catch (err) {
			console.error('名前変更エラー:', err)
			setError('名前の変更に失敗しました')
		} finally {
			setIsRenaming(false)
		}
	}

	// エンターキーで名前変更
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !isRenaming) {
			handleRename()
		}
	}

	if (!isOpen) return null

	// モーダル全体のmousedownでイベント伝播を停止（floating-menuの外側クリック検知を回避）
	const handleModalMouseDown = (e: React.MouseEvent) => {
		e.stopPropagation()
	}

	// 背景クリック処理（RenameEquipmentModalと同じ手法）
	const handleBackgroundClick = (e: React.MouseEvent) => {
		// クリックされた要素がモーダルコンテンツ内かどうかをチェック
		const modalContent = document.querySelector(
			'[data-modal-content="rename-save"]',
		)
		const target = e.target as Element

		if (modalContent && !modalContent.contains(target)) {
			onClose()
		}
	}

	// モーダルコンテンツのクリックでイベント伝播を停止
	const handleContentClick = (e: React.MouseEvent) => {
		e.stopPropagation()
	}

	const modalContent = (
		<div
			className="fixed inset-0 z-[10000] bg-black/50"
			onMouseDown={handleModalMouseDown}
			onClick={handleBackgroundClick}
		>
			{/* モーダルコンテンツ */}
			<div className="flex items-center justify-center min-h-full p-4">
				<div
					className="bg-white rounded-lg shadow-xl max-w-md w-full"
					role="dialog"
					aria-labelledby="rename-save-modal-title"
					aria-modal="true"
					onClick={handleContentClick}
					data-modal-content="rename-save"
				>
					{/* ヘッダー */}
					<div className="flex items-center justify-between p-6 border-b border-gray-200">
						<h3
							id="rename-save-modal-title"
							className="text-lg font-medium text-gray-900"
						>
							セーブデータ名の変更
						</h3>
						<button
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1 cursor-pointer"
						>
							<svg
								className="h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
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
						<div className="mb-4">
							<label
								htmlFor="save-name"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								新しいセーブデータ名
							</label>
							<input
								id="save-name"
								type="text"
								value={newName}
								onChange={(e) => setNewName(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder="例: 物理アタッカー構成"
								className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								disabled={isRenaming}
								autoFocus
							/>
							<p className="mt-1 text-xs text-gray-500">
								現在の名前: {currentName}
							</p>
						</div>

						{error && (
							<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
								<div className="flex">
									<div className="flex-shrink-0">
										<svg
											className="h-5 w-5 text-red-400"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path
												fillRule="evenodd"
												d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
												clipRule="evenodd"
											/>
										</svg>
									</div>
									<div className="ml-3">
										<p className="text-sm text-red-800">{error}</p>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* フッター */}
					<div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
						<button
							onClick={onClose}
							disabled={isRenaming}
							className="px-4 py-2 text-sm font-medium text-white bg-gray-400/80 rounded-md hover:bg-gray-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
						>
							キャンセル
						</button>
						<button
							onClick={handleRename}
							disabled={isRenaming || !newName.trim()}
							className="px-4 py-2 text-sm font-medium text-white bg-rose-400/80 rounded-md hover:bg-rose-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center cursor-pointer"
						>
							{isRenaming && (
								<svg
									className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									/>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									/>
								</svg>
							)}
							{isRenaming ? '変更中...' : '変更'}
						</button>
					</div>
				</div>
			</div>
		</div>
	)

	// Portalを使ってbody要素に直接レンダリング
	return createPortal(modalContent, document.body)
}
