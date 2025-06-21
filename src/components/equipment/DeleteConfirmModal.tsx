'use client'

import { useState } from 'react'

export interface DeleteConfirmModalProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void
	equipmentName: string
	message: string
}

export default function DeleteConfirmModal({
	isOpen,
	onClose,
	onConfirm,
	equipmentName,
	message,
}: DeleteConfirmModalProps) {
	const [isDeleting, setIsDeleting] = useState(false)

	const handleConfirm = async () => {
		if (isDeleting) return

		setIsDeleting(true)
		try {
			await onConfirm()
			onClose()
		} catch (error) {
			console.error('装備削除エラー:', error)
		} finally {
			setIsDeleting(false)
		}
	}

	const handleClose = () => {
		if (isDeleting) return
		onClose()
	}

	const handleBackgroundClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			handleClose()
		}
	}

	if (!isOpen) return null

	return (
		<dialog
			open={isOpen}
			className="fixed inset-0 z-50 overflow-y-auto p-0 m-0 w-full h-full bg-black/50 transition-opacity"
			onClick={handleBackgroundClick}
			aria-labelledby="delete-confirm-title"
			aria-describedby="delete-confirm-description"
		>
			<div className="min-h-screen flex items-center justify-center p-4">
				<div
					className="relative bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden"
					onClick={(e) => e.stopPropagation()}
				>
					{/* ヘッダー */}
					<div className="flex items-center justify-between p-6 border-b border-gray-200">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<svg
									className="w-6 h-6 text-red-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
									/>
								</svg>
							</div>
							<h2
								id="delete-confirm-title"
								className="ml-3 text-xl font-semibold text-gray-900"
							>
								装備削除の確認
							</h2>
						</div>
						<button
							onClick={handleClose}
							disabled={isDeleting}
							className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
							aria-label="モーダルを閉じる"
						>
							<svg
								className="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
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
						<div
							id="delete-confirm-description"
							className="text-sm text-gray-600 mb-4"
						>
							{message}
						</div>

						<div className="bg-gray-50 rounded-lg p-4 mb-6">
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<svg
										className="w-5 h-5 text-gray-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
										/>
									</svg>
								</div>
								<div className="ml-3">
									<div className="text-sm font-medium text-gray-900">
										削除対象の装備
									</div>
									<div className="text-sm text-gray-600 truncate">
										{equipmentName}
									</div>
								</div>
							</div>
						</div>

						<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
							<div className="flex items-start">
								<div className="flex-shrink-0">
									<svg
										className="w-5 h-5 text-red-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
										/>
									</svg>
								</div>
								<div className="ml-3">
									<div className="text-sm font-medium text-red-800">
										注意事項
									</div>
									<div className="text-sm text-red-700 mt-1">
										この操作は取り消すことができません。削除された装備は復元できません。
									</div>
								</div>
							</div>
						</div>

						{/* フッター */}
						<div className="flex justify-end gap-3">
							<button
								type="button"
								onClick={handleClose}
								disabled={isDeleting}
								className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
							>
								キャンセル
							</button>
							<button
								type="button"
								onClick={handleConfirm}
								disabled={isDeleting}
								className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								{isDeleting ? '削除中...' : '削除する'}
							</button>
						</div>
					</div>
				</div>
			</div>
		</dialog>
	)
}
