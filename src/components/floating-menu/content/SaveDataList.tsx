'use client'

import { useMemo } from 'react'

import { useSaveDataStore } from '@/stores'

import SaveDataItem from './SaveDataItem'

interface SaveDataListProps {
	onItemSelect: (saveId: string) => void
	onItemRename: (saveId: string, newName: string) => void
	onItemDelete: (saveId: string) => void
	onClose: () => void
}

export default function SaveDataList({
	onItemSelect,
	onItemRename,
	onItemDelete,
	onClose,
}: SaveDataListProps) {
	const { saveDataList, currentSaveId } = useSaveDataStore()

	// 更新日時降順でソート（最新が上）
	const sortedSaveDataList = useMemo(() => {
		return [...saveDataList].sort(
			(a, b) =>
				new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
		)
	}, [saveDataList])

	if (saveDataList.length === 0) {
		return (
			<div className="flex-1 flex items-center justify-center p-8">
				<div className="text-center">
					<svg
						className="mx-auto h-12 w-12 text-gray-400 mb-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
					<h3 className="text-sm font-medium text-gray-900 mb-1">
						セーブデータがありません
					</h3>
					<p className="text-xs text-gray-500">
						新規作成ボタンでセーブデータを作成しましょう
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className="flex-1 overflow-y-auto">
			<div className="divide-y divide-gray-100">
				{sortedSaveDataList.map((saveData) => (
					<SaveDataItem
						key={saveData.id}
						saveData={saveData}
						isActive={saveData.id === currentSaveId}
						onSelect={onItemSelect}
						onRename={onItemRename}
						onDelete={onItemDelete}
						onClose={onClose}
					/>
				))}
			</div>
		</div>
	)
}
