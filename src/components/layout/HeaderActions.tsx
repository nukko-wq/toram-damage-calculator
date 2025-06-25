import React from 'react'
import { useCalculatorStore, useSaveDataStore } from '@/stores'

interface HeaderActionsProps {
	className?: string
}

export default React.memo<HeaderActionsProps>(
	function HeaderActions({
		className = '',
	}) {
		// ストアからデータを取得
		const { saveCurrentData, hasUnsavedChanges, getUnsavedDataStatus } = useCalculatorStore()
		const { saveDataList, currentSaveId } = useSaveDataStore()

		// 現在のセーブデータ名を取得
		const currentSaveData = saveDataList.find(save => save.id === currentSaveId)
		const currentSaveName = currentSaveData?.name || 'メインデータ'

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
			<div className={`flex flex-col sm:flex-row gap-2 sm:gap-3 items-center ${className}`}>
				{/* 現在のセーブデータ名 */}
				<div className="text-sm text-gray-700 font-medium truncate max-w-32">
					{currentSaveName}
				</div>

				{/* 現在のデータを保存ボタン */}
				<button
					type="button"
					onClick={handleSaveCurrentData}
					disabled={!hasUnsavedChanges}
					className={`inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md transition-colors duration-200 ${
						hasUnsavedChanges
							? 'text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
							: 'text-gray-400 bg-gray-200 cursor-not-allowed'
					}`}
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
					保存
					{unsavedStatus.hasTemporaryEquipments && (
						<span className="ml-1 text-xs">(仮)</span>
					)}
					{unsavedStatus.hasEditSessions && (
						<span className="ml-1 text-xs">(編)</span>
					)}
				</button>

			</div>
		)
	},
)
