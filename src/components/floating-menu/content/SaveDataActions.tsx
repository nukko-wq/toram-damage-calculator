'use client'

import { useCalculatorStore } from '@/stores'

interface SaveDataActionsProps {
	onCreateNew: () => void
}

export default function SaveDataActions({ onCreateNew }: SaveDataActionsProps) {
	const { saveCurrentData, hasUnsavedChanges, getUnsavedDataStatus } =
		useCalculatorStore()

	// 現在のデータを保存
	const handleSaveCurrentData = async () => {
		try {
			await saveCurrentData()
		} catch (err) {
			console.error('データ保存エラー:', err)
		}
	}

	// 未保存データの状態を取得
	const unsavedStatus = getUnsavedDataStatus()

	return (
		<div className="p-4 border-b border-gray-200">
			<div className="flex gap-2">
				{/* 現在のデータを保存ボタン */}
				<button
					type="button"
					onClick={handleSaveCurrentData}
					disabled={!hasUnsavedChanges}
					className={`
						flex-1 inline-flex items-center justify-center px-3 py-2 
						border border-transparent text-sm font-medium rounded-md 
						transition-colors duration-200
						${
							hasUnsavedChanges
								? 'text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer'
								: 'text-gray-400 bg-gray-200'
						}
					`}
					title={hasUnsavedChanges ? '現在のデータを保存' : '変更がありません'}
				>
					{hasUnsavedChanges && (
						<svg
							className="w-4 h-4 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d={
									unsavedStatus.hasTemporaryEquipments ||
									unsavedStatus.hasEditSessions
										? 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z'
										: 'M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12'
								}
							/>
						</svg>
					)}
					<span className="truncate">
						現在のデータを保存
						{unsavedStatus.hasTemporaryEquipments && (
							<span className="ml-1 text-xs">(仮)</span>
						)}
						{unsavedStatus.hasEditSessions && (
							<span className="ml-1 text-xs">(編)</span>
						)}
					</span>
				</button>

				{/* 新規作成ボタン */}
				<button
					type="button"
					onClick={onCreateNew}
					className="
						cursor-pointer
						flex-1 inline-flex items-center justify-center px-3 py-2 
						border border-transparent text-sm font-medium rounded-md 
						text-white bg-blue-600 hover:bg-blue-700 
						focus:outline-none focus:ring-2 focus:ring-blue-500 
						transition-colors duration-200
					"
					title="新しいセーブデータを作成"
				>
					<svg
						className="w-4 h-4 mr-2"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 4v16m8-8H4"
						/>
					</svg>
					<span className="truncate">新規作成</span>
				</button>
			</div>
		</div>
	)
}
