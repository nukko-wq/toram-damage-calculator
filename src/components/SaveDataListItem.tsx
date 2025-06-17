'use client'

import { useState } from 'react'
import type { SaveData } from '@/types/calculator'

interface SaveDataListItemProps {
	saveData: SaveData
	isSelected: boolean
	onSelect: () => void
	onDelete: () => void
	onRename: (newName: string) => void
}

export default function SaveDataListItem({
	saveData,
	isSelected,
	onSelect,
	onDelete,
	onRename
}: SaveDataListItemProps) {
	const [isEditing, setIsEditing] = useState(false)
	const [editingName, setEditingName] = useState(saveData.name)
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

	// 編集開始
	const handleStartEdit = () => {
		if (saveData.isDefault) return // デフォルトセーブは編集不可
		setEditingName(saveData.name)
		setIsEditing(true)
	}

	// 編集完了
	const handleFinishEdit = () => {
		const trimmedName = editingName.trim()
		if (trimmedName && trimmedName !== saveData.name) {
			onRename(trimmedName)
		}
		setIsEditing(false)
		setEditingName(saveData.name)
	}

	// 編集キャンセル
	const handleCancelEdit = () => {
		setIsEditing(false)
		setEditingName(saveData.name)
	}

	// キーボードイベント処理
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleFinishEdit()
		} else if (e.key === 'Escape') {
			handleCancelEdit()
		}
	}

	// 削除確認
	const handleDeleteClick = () => {
		if (saveData.isDefault) return // デフォルトセーブは削除不可
		setShowDeleteConfirm(true)
	}

	// 削除実行
	const handleConfirmDelete = () => {
		onDelete()
		setShowDeleteConfirm(false)
	}

	// 日時フォーマット
	const formatDate = (dateString: string) => {
		const date = new Date(dateString)
		return date.toLocaleDateString('ja-JP', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	return (
		<div
			className={`border rounded-lg p-4 transition-all duration-200 ${
				isSelected
					? 'border-blue-500 bg-blue-50 shadow-md'
					: 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
			}`}
		>
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-3 flex-1 min-w-0">
					{/* 選択ラジオボタン */}
					<input
						type="radio"
						checked={isSelected}
						onChange={onSelect}
						className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
					/>

					{/* セーブデータ情報 */}
					<div className="flex-1 min-w-0">
						{isEditing ? (
							<input
								type="text"
								value={editingName}
								onChange={(e) => setEditingName(e.target.value)}
								onBlur={handleFinishEdit}
								onKeyDown={handleKeyDown}
								className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								autoFocus
							/>
						) : (
							<div>
								<div className="flex items-center space-x-2">
									<h3 className="text-sm font-medium text-gray-900 truncate">
										{saveData.name}
									</h3>
									{saveData.isDefault && (
										<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
											メイン
										</span>
									)}
								</div>
								<div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
									<span>作成: {formatDate(saveData.createdAt)}</span>
									{saveData.updatedAt !== saveData.createdAt && (
										<span>更新: {formatDate(saveData.updatedAt)}</span>
									)}
								</div>
							</div>
						)}
					</div>
				</div>

				{/* アクションボタン */}
				<div className="flex items-center space-x-2">
					{!saveData.isDefault && !isEditing && (
						<>
							<button
								onClick={handleStartEdit}
								className="p-1 text-gray-400 hover:text-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
								title="名前を変更"
							>
								<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
								</svg>
							</button>
							<button
								onClick={handleDeleteClick}
								className="p-1 text-gray-400 hover:text-red-600 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
								title="削除"
							>
								<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
								</svg>
							</button>
						</>
					)}
				</div>
			</div>

			{/* 削除確認モーダル */}
			{showDeleteConfirm && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-sm mx-4">
						<h3 className="text-lg font-medium text-gray-900 mb-4">
							セーブデータの削除
						</h3>
						<p className="text-sm text-gray-600 mb-6">
							「{saveData.name}」を削除しますか？<br />
							この操作は取り消せません。
						</p>
						<div className="flex space-x-3 justify-end">
							<button
								onClick={() => setShowDeleteConfirm(false)}
								className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
							>
								キャンセル
							</button>
							<button
								onClick={handleConfirmDelete}
								className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
							>
								削除する
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}