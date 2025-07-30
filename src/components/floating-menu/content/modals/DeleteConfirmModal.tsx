'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'

interface DeleteConfirmModalProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void
	saveDataName: string
}

export default function DeleteConfirmModal({
	isOpen,
	onClose,
	onConfirm,
	saveDataName,
}: DeleteConfirmModalProps) {
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
						セーブデータの削除
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
								className="h-6 w-6 text-red-600"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
						</div>
						<div className="ml-3">
							<p className="text-sm text-gray-700 mb-2">
								セーブデータ「<span className="font-medium text-gray-900">{saveDataName}</span>」を削除しようとしています。
							</p>
							<div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3">
								<div className="flex">
									<div className="flex-shrink-0">
										<svg
											className="h-5 w-5 text-red-400"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path
												fillRule="evenodd"
												d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
												clipRule="evenodd"
											/>
										</svg>
									</div>
									<div className="ml-3">
										<p className="text-sm text-red-800">
											この操作は元に戻すことができません。削除されたデータは復元できません。
										</p>
									</div>
								</div>
							</div>
							<p className="text-xs text-gray-500">
								削除を実行する場合は「削除する」ボタンを押してください。
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
						className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 cursor-pointer"
					>
						削除する
					</button>
				</div>
			</div>
		</div>
	)

	// Portalを使ってbody要素に直接レンダリング
	return createPortal(modalContent, document.body)
}