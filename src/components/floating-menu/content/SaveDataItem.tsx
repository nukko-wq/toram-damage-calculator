'use client'

import React, { useState } from 'react'
import type { SaveData } from '@/types/calculator'

interface SaveDataItemProps {
	saveData: SaveData
	isActive: boolean
	onSelect: (saveId: string) => void
	onRename: (saveId: string, newName: string) => void
	onDelete: (saveId: string) => void
}

export default function SaveDataItem({
	saveData,
	isActive,
	onSelect,
	onRename,
	onDelete,
}: SaveDataItemProps) {
	const [isEditing, setIsEditing] = useState(false)
	const [editName, setEditName] = useState(saveData.name)

	const handleStartEdit = () => {
		setEditName(saveData.name)
		setIsEditing(true)
	}

	const handleSaveEdit = () => {
		if (editName.trim() && editName.trim() !== saveData.name) {
			onRename(saveData.id, editName.trim())
		}
		setIsEditing(false)
	}

	const handleCancelEdit = () => {
		setEditName(saveData.name)
		setIsEditing(false)
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleSaveEdit()
		} else if (e.key === 'Escape') {
			handleCancelEdit()
		}
	}

	const handleDelete = () => {
		if (window.confirm(`「${saveData.name}」を削除しますか？`)) {
			onDelete(saveData.id)
		}
	}

	const formatDate = (dateString: string) => {
		const date = new Date(dateString)
		return date.toLocaleDateString('ja-JP', {
			month: 'numeric',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		})
	}

	const isMainData = saveData.id === 'main'

	return (
		<div
			className={`
				flex items-center p-3 border-b border-gray-100 last:border-b-0
				transition-colors duration-150
				${isActive ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}
			`}
		>
			{/* アイコン */}
			<div className="flex-shrink-0 mr-3">
				{isMainData ? (
					<svg
						className="w-5 h-5 text-blue-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
						/>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M8 5a2 2 0 012-2h4a2 2 0 012 2v10a2 2 0 01-2 2H10a2 2 0 01-2-2V5z"
						/>
					</svg>
				) : (
					<svg
						className="w-5 h-5 text-gray-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
				)}
			</div>

			{/* 名前と詳細 */}
			<div className="flex-1 min-w-0">
				{isEditing ? (
					<input
						type="text"
						value={editName}
						onChange={(e) => setEditName(e.target.value)}
						onBlur={handleSaveEdit}
						onKeyDown={handleKeyDown}
						className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
						autoFocus
					/>
				) : (
					<div>
						<div className={`text-sm font-medium truncate ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
							{saveData.name}
						</div>
						<div className="text-xs text-gray-500">
							{formatDate(saveData.updatedAt)}
						</div>
					</div>
				)}
			</div>

			{/* アクションボタン */}
			{!isEditing && (
				<div className="flex-shrink-0 ml-2 flex items-center space-x-1">
					{!isActive && (
						<button
							type="button"
							onClick={() => onSelect(saveData.id)}
							className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors duration-150"
							title="このデータに切り替え"
						>
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
								/>
							</svg>
						</button>
					)}

					{!isMainData && (
						<>
							<button
								type="button"
								onClick={handleStartEdit}
								className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-100 rounded transition-colors duration-150"
								title="名前を変更"
							>
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
									/>
								</svg>
							</button>

							<button
								type="button"
								onClick={handleDelete}
								className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors duration-150"
								title="削除"
							>
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
									/>
								</svg>
							</button>
						</>
					)}
				</div>
			)}
		</div>
	)
}