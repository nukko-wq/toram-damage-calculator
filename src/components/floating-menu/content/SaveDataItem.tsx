'use client'

import { Edit, EllipsisVertical, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
	Button,
	Menu,
	MenuItem,
	MenuTrigger,
	Popover,
} from 'react-aria-components'
import type { SaveData } from '@/types/calculator'
import DeleteConfirmModal from './modals/DeleteConfirmModal'
import RenameModal from './modals/RenameModal'

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
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
	const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)

	// 名前変更モーダルを表示
	const handleRenameButtonClick = () => {
		setIsRenameModalOpen(true)
	}

	// 名前変更確認後の処理
	const handleRenameConfirm = async (newName: string) => {
		onRename(saveData.id, newName)
		setIsRenameModalOpen(false)
	}

	// 削除確認ダイアログを表示
	const handleDeleteButtonClick = () => {
		setIsDeleteModalOpen(true)
	}

	// 削除確認後の処理
	const handleDeleteConfirm = () => {
		onDelete(saveData.id)
		setIsDeleteModalOpen(false)
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

	const isMainData = saveData.id === 'mainWeapon'

	return (
		<div
			className={`
				flex items-center p-3 border-b border-gray-100 last:border-b-0
				transition-colors duration-150
				${isActive ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}
			`}
		>
			{/* アイコン */}
			<div className="flex-shrink-0 mr-3 hidden sm:block">
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
				<div>
					<div
						className={`text-sm font-medium truncate ${isActive ? 'text-blue-900' : 'text-gray-900'}`}
					>
						{saveData.name}
					</div>
					<div className="text-xs text-gray-500">
						{formatDate(saveData.updatedAt)}
					</div>
				</div>
			</div>

			{/* アクションボタン */}
			<div className="flex-shrink-0 ml-1 sm:ml-3 flex items-center space-x-1 sm:space-x-2">
				{/* 読み込みボタン - プライマリ */}
				<button
					type="button"
					onClick={() => onSelect(saveData.id)}
					className="flex items-center space-x-1 px-1.5 sm:px-3 py-1.5 text-xs font-medium text-white bg-blue-400/80 hover:bg-blue-400 rounded-md transition-colors duration-150 cursor-pointer focus:outline-none"
					title="このセーブデータを読み込む"
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
							d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
					<span>読み込み</span>
				</button>

				{/* メニューボタン */}
				{!isMainData && (
					<MenuTrigger>
						<Button
							aria-label="メニュー"
							className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors duration-150 cursor-pointer"
						>
							<EllipsisVertical className="w-[18px] h-[18px] text-gray-500" />
						</Button>
						<Popover placement="bottom end">
							<Menu className="bg-white border border-gray-200 rounded-lg shadow-md min-w-[160px] text-sm z-50 outline-hidden">
								<MenuItem
									id="rename"
									className="px-3 py-2 outline-none hover:bg-blue-50 cursor-pointer rounded-t-lg"
									onAction={handleRenameButtonClick}
								>
									<div className="flex items-center gap-2">
										<Edit className="w-4 h-4 text-gray-700" />
										<span className="text-sm text-gray-700">名前を変更</span>
									</div>
								</MenuItem>
								<MenuItem
									id="delete"
									className="px-3 py-2 outline-none hover:bg-blue-50 text-red-600 cursor-pointer rounded-b-lg"
									onAction={handleDeleteButtonClick}
								>
									<div className="flex items-center gap-2">
										<Trash2 className="w-4 h-4" />
										<span className="text-sm">削除</span>
									</div>
								</MenuItem>
							</Menu>
						</Popover>
					</MenuTrigger>
				)}
			</div>

			{/* 名前変更モーダル */}
			<RenameModal
				isOpen={isRenameModalOpen}
				onClose={() => setIsRenameModalOpen(false)}
				onConfirm={handleRenameConfirm}
				currentName={saveData.name}
			/>

			{/* 削除確認モーダル */}
			<DeleteConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				onConfirm={handleDeleteConfirm}
				saveDataName={saveData.name}
			/>
		</div>
	)
}
