'use client'

import { useState, useEffect } from 'react'

interface RenameEquipmentModalProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: (newName: string) => void
	currentName: string
	equipmentId: string
}

export default function RenameEquipmentModal({
	isOpen,
	onClose,
	onConfirm,
	currentName,
	equipmentId: _equipmentId,
}: RenameEquipmentModalProps) {
	const [newName, setNewName] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	// モーダルが開かれた時に現在の名前を初期値として設定
	useEffect(() => {
		if (isOpen) {
			setNewName(currentName)
		}
	}, [isOpen, currentName])

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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		// 名前の検証
		const trimmedName = newName.trim()
		if (!trimmedName) {
			alert('装備名を入力してください')
			return
		}

		if (trimmedName === currentName) {
			// 変更がない場合はそのまま閉じる
			onClose()
			return
		}

		if (trimmedName.length > 50) {
			alert('装備名は50文字以内で入力してください')
			return
		}

		setIsSubmitting(true)
		try {
			await onConfirm(trimmedName)
			onClose()
		} catch (error) {
			console.error('名前変更エラー:', error)
			alert('名前の変更に失敗しました')
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleCancel = () => {
		setNewName(currentName) // 元の名前に戻す
		onClose()
	}

	const handleBackgroundClick = (e: React.MouseEvent) => {
		// クリックされた要素がモーダルコンテンツ内かどうかをチェック
		const modalContent = document.querySelector('[data-modal-content="rename"]')
		const target = e.target as Element

		if (modalContent && !modalContent.contains(target)) {
			handleCancel()
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
			aria-labelledby="rename-modal-title"
			aria-modal="true"
		>
			<div className="min-h-screen flex items-center justify-center p-4">
				<div
					className="relative bg-white rounded-lg shadow-xl max-w-md w-full outline-none"
					onClick={handleContentClick}
					data-modal-content="rename"
				>
					{/* ヘッダー */}
					<div className="flex items-center justify-between p-6 border-b">
						<h2
							id="rename-modal-title"
							className="text-xl font-bold text-gray-900"
						>
							装備名の変更
						</h2>
						<button
							type="button"
							onClick={handleCancel}
							className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
							aria-label="モーダルを閉じる"
						>
							<svg
								className="w-6 h-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-label="閉じるアイコン"
							>
								<title>閉じるアイコン</title>
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
						<div className="mb-4">
							<label
								htmlFor="equipment-name"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								新しい装備名
							</label>
							<input
								id="equipment-name"
								type="text"
								value={newName}
								onChange={(e) => setNewName(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
								placeholder="装備名を入力してください"
								maxLength={50}
								autoFocus
								disabled={isSubmitting}
							/>
							<div className="mt-1 text-xs text-gray-500">
								{newName.length}/50文字
							</div>
						</div>

						{/* ボタン */}
						<div className="flex justify-end space-x-3">
							<button
								type="button"
								onClick={handleCancel}
								className="px-4 py-2 text-sm font-medium text-white bg-gray-500/80 rounded-md hover:bg-gray-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
								disabled={isSubmitting}
							>
								キャンセル
							</button>
							<button
								type="submit"
								className="px-4 py-2 text-sm font-medium text-white bg-blue-500/80 rounded-md hover:bg-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
								disabled={isSubmitting || !newName.trim()}
							>
								{isSubmitting ? '変更中...' : '変更'}
							</button>
						</div>
					</form>
				</div>
			</div>
		</dialog>
	)
}
