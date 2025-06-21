'use client'

import { useState, useEffect } from 'react'

interface NewSaveDataModalProps {
	isOpen: boolean
	onClose: () => void
	onCreateSave: (name: string) => void
}

export default function NewSaveDataModal({
	isOpen,
	onClose,
	onCreateSave,
}: NewSaveDataModalProps) {
	const [saveName, setSaveName] = useState('')
	const [isCreating, setIsCreating] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// モーダルが開いたときの初期化
	useEffect(() => {
		if (isOpen) {
			setSaveName('')
			setError(null)
			setIsCreating(false)
		}
	}, [isOpen])

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

	// セーブデータ作成
	const handleCreateSave = async () => {
		const trimmedName = saveName.trim()

		// バリデーション
		if (!trimmedName) {
			setError('セーブデータ名を入力してください')
			return
		}

		if (trimmedName.length > 50) {
			setError('セーブデータ名は50文字以内で入力してください')
			return
		}

		try {
			setIsCreating(true)
			setError(null)
			await onCreateSave(trimmedName)
		} catch (err) {
			console.error('セーブデータ作成エラー:', err)
			setError('セーブデータの作成に失敗しました')
		} finally {
			setIsCreating(false)
		}
	}

	// エンターキーで作成
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !isCreating) {
			handleCreateSave()
		}
	}

	// モーダル背景クリックで閉じる
	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose()
		}
	}

	if (!isOpen) return null

	return (
		<div
			className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
			onClick={handleBackdropClick}
		>
			<div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
				{/* ヘッダー */}
				<div className="flex items-center justify-between p-6 border-b border-gray-200">
					<h3 className="text-lg font-medium text-gray-900">
						新規セーブデータ作成
					</h3>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
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
							セーブデータ名
						</label>
						<input
							id="save-name"
							type="text"
							value={saveName}
							onChange={(e) => setSaveName(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="例: 物理アタッカー構成"
							className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							disabled={isCreating}
							autoFocus
						/>
						<p className="mt-1 text-xs text-gray-500">
							現在の計算機の設定をコピーして新しいセーブデータを作成します
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
						disabled={isCreating}
						className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						キャンセル
					</button>
					<button
						onClick={handleCreateSave}
						disabled={isCreating || !saveName.trim()}
						className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
					>
						{isCreating && (
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
								></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
						)}
						{isCreating ? '作成中...' : '作成'}
					</button>
				</div>
			</div>
		</div>
	)
}
