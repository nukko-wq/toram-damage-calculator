'use client'

import { useState } from 'react'

export interface CreateEquipmentModalProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: (equipmentName: string) => void
	equipmentType: string
}

export default function CreateEquipmentModal({
	isOpen,
	onClose,
	onConfirm,
	equipmentType,
}: CreateEquipmentModalProps) {
	const [equipmentName, setEquipmentName] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!equipmentName.trim() || isSubmitting) return

		setIsSubmitting(true)
		try {
			await onConfirm(equipmentName.trim())
			setEquipmentName('')
			onClose()
		} catch (error) {
			console.error('装備作成エラー:', error)
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleClose = () => {
		if (isSubmitting) return
		setEquipmentName('')
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
			aria-labelledby="create-equipment-title"
			aria-describedby="create-equipment-description"
		>
			<div className="min-h-screen flex items-center justify-center p-4">
				<div
					className="relative bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden"
					onClick={(e) => e.stopPropagation()}
				>
					{/* ヘッダー */}
					<div className="flex items-center justify-between p-6 border-b border-gray-200">
						<h2
							id="create-equipment-title"
							className="text-xl font-semibold text-gray-900"
						>
							新規装備作成
						</h2>
						<button
							onClick={handleClose}
							disabled={isSubmitting}
							className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
							aria-label="モーダルを閉じる"
						>
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
					<form onSubmit={handleSubmit} className="p-6">
						<div
							id="create-equipment-description"
							className="text-sm text-gray-600 mb-4"
						>
							{equipmentType}のカスタム装備を作成します。作成後、全プロパティがリセットされます。
						</div>

						<div className="mb-6">
							<label
								htmlFor="equipment-name"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								装備名
							</label>
							<input
								id="equipment-name"
								type="text"
								value={equipmentName}
								onChange={(e) => setEquipmentName(e.target.value)}
								placeholder="装備名を入力してください"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								maxLength={50}
								disabled={isSubmitting}
								autoFocus
							/>
						</div>

						{/* フッター */}
						<div className="flex justify-end gap-3">
							<button
								type="button"
								onClick={handleClose}
								disabled={isSubmitting}
								className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
							>
								キャンセル
							</button>
							<button
								type="submit"
								disabled={!equipmentName.trim() || isSubmitting}
								className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								{isSubmitting ? '作成中...' : '作成'}
							</button>
						</div>
					</form>
				</div>
			</div>
		</dialog>
	)
}