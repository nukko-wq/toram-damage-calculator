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

	// モーダル背景クリックで閉じる
	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose()
		}
	}

	if (!isOpen) return null

	const modalContent = (
		<div
			className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
			onClick={handleBackdropClick}
		>
			<div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
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
						className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 cursor-pointer"
					>
						キャンセル
					</button>
					<button
						onClick={onConfirm}
						className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 cursor-pointer"
					>
						保存する
					</button>
				</div>
			</div>
		</div>
	)

	// Portalを使ってbody要素に直接レンダリング
	return createPortal(modalContent, document.body)
}