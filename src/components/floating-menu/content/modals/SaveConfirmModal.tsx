'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'

interface SaveConfirmModalProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void
}

export default function SaveConfirmModal({
	isOpen,
	onClose,
	onConfirm,
}: SaveConfirmModalProps) {
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

	if (!isOpen) return null

	// モーダル全体のmousedownでイベント伝播を停止（floating-menuの外側クリック検知を回避）
	const handleModalMouseDown = (e: React.MouseEvent) => {
		e.stopPropagation()
	}

	// 背景クリック処理（RenameModalと同じ手法）
	const handleBackgroundClick = (e: React.MouseEvent) => {
		// クリックされた要素がモーダルコンテンツ内かどうかをチェック
		const modalContent = document.querySelector(
			'[data-modal-content="save-confirm"]',
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
			className="fixed inset-0 z-[9999] bg-black/50"
			onMouseDown={handleModalMouseDown}
			onClick={handleBackgroundClick}
		>
			<div className="flex items-center justify-center min-h-full p-4">
				<div
					className="bg-white rounded-lg shadow-xl max-w-md w-full"
					onClick={handleContentClick}
					data-modal-content="save-confirm"
				>
					{/* ヘッダー */}
					<div className="flex items-center justify-between p-6 border-b border-gray-200">
						<h3 className="text-lg font-medium text-gray-900">
							データ保存の確認
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
						<div className="flex items-start">
							<div className="flex-shrink-0">
								<svg
									className="h-6 w-6 text-green-600"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
									/>
								</svg>
							</div>
							<div className="ml-3">
								<p className="text-sm text-gray-700 mb-2">
									現在の計算機の設定を現在選択中のセーブデータに保存します。
								</p>
								<p className="text-xs text-gray-500">
									この操作は元に戻すことができません。
								</p>
							</div>
						</div>
					</div>

					{/* フッター */}
					<div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
						<button
							onClick={onClose}
							className="px-4 py-2 text-sm font-medium text-white bg-gray-400/80 rounded-md hover:bg-gray-400 focus:outline-none cursor-pointer"
						>
							キャンセル
						</button>
						<button
							onClick={onConfirm}
							className="px-4 py-2 text-sm font-medium text-white bg-rose-400/80 rounded-md hover:bg-rose-400 focus:outline-none cursor-pointer"
						>
							保存する
						</button>
					</div>
				</div>
			</div>
		</div>
	)

	// Portalを使ってbody要素に直接レンダリング
	return createPortal(modalContent, document.body)
}
