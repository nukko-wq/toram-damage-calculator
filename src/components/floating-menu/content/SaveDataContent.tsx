'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useCalculatorStore, useSaveDataStore } from '@/stores'
import NewSaveDataModal from './modals/NewSaveDataModal'

import SaveDataActions from './SaveDataActions'
import SaveDataList from './SaveDataList'

interface SaveDataContentProps {
	onClose: () => void
}

export default function SaveDataContent({ onClose }: SaveDataContentProps) {
	// Zustandストアからデータを取得
	const {
		data: currentData,
		hasUnsavedChanges,
		loadSaveData,
	} = useCalculatorStore()

	const {
		saveDataList,
		currentSaveId,
		isLoading,
		error,
		pendingSaveId,
		showUnsavedChangesModal,
		switchSaveData,
		createSaveData,
		deleteSaveData,
		renameSaveData,
		setPendingSaveId,
		setShowUnsavedChangesModal,
		setError,
	} = useSaveDataStore()

	const [isNewSaveModalOpen, setIsNewSaveModalOpen] = useState(false)

	// 初期化は既にcalculatorStoreで実行済みなので不要
	// useEffect(() => {
	// 	loadSaveDataList()
	// }, [loadSaveDataList])

	// セーブデータの切り替え
	const handleSaveDataSelect = async (saveId: string) => {
		// 未保存の変更がある場合は確認ダイアログを表示
		if (hasUnsavedChanges && saveId !== currentSaveId) {
			setPendingSaveId(saveId)
			setShowUnsavedChangesModal(true)
			return
		}

		try {
			// Zustandストア経由でセーブデータを切り替え（原子操作）
			const loadedData = await switchSaveData(saveId)
			// calculatorStoreにデータを読み込んで未保存変更フラグをリセット（同期的に実行）
			await loadSaveData(loadedData)
			// 未保存の変更がない場合はフロートメニューを閉じる
			onClose()
		} catch (err) {
			console.error('セーブデータの切り替えに失敗しました:', err)
		}
	}

	// 新しいセーブデータを作成（自動切り替え）
	const handleCreateSaveData = async (name: string) => {
		try {
			const result = await createSaveData(name, currentData)
			// 作成されたセーブデータに自動切り替えされるため、calculatorStoreにデータを読み込み
			await loadSaveData(result.loadedData)
			setIsNewSaveModalOpen(false)
		} catch (err) {
			console.error('セーブデータの作成に失敗しました:', err)
		}
	}

	// セーブデータを削除（全削除時メインデータ自動切り替え）
	const handleDeleteSaveData = async (saveId: string) => {
		try {
			const mainData = await deleteSaveData(saveId)

			// 削除したセーブデータが現在選択中だった場合、または全ユーザーデータが削除された場合、メインデータを読み込み
			if ((currentSaveId === saveId || saveDataList.length === 1) && mainData) {
				await loadSaveData(mainData)
			}
		} catch (err) {
			console.error('セーブデータの削除に失敗しました:', err)
		}
	}

	// セーブデータ名を変更
	const handleRenameSaveData = async (saveId: string, newName: string) => {
		try {
			await renameSaveData(saveId, newName)
		} catch (err) {
			console.error('セーブデータの名前変更に失敗しました:', err)
		}
	}

	// 未保存変更の確認ダイアログで「保存せずに切り替え」を選択
	const handleDiscardChanges = async () => {
		if (pendingSaveId) {
			setShowUnsavedChangesModal(false)
			setPendingSaveId(null)

			try {
				// Zustandストア経由でセーブデータを切り替え
				const loadedData = await switchSaveData(pendingSaveId)
				// calculatorStoreにデータを読み込んで未保存変更フラグをリセット（同期的に実行）
				await loadSaveData(loadedData)
				// フロートメニューを閉じる
				onClose()
			} catch (err) {
				console.error('セーブデータの切り替えに失敗しました:', err)
			}
		}
	}

	// 未保存変更の確認ダイアログで「保存してから切り替え」を選択
	const handleSaveAndSwitch = async () => {
		if (pendingSaveId) {
			try {
				// 現在のデータを保存
				const { saveCurrentData } = useCalculatorStore.getState()
				await saveCurrentData()

				// 保存後にセーブデータを切り替え
				setShowUnsavedChangesModal(false)
				setPendingSaveId(null)

				const loadedData = await switchSaveData(pendingSaveId)
				// calculatorStoreにデータを読み込んで未保存変更フラグをリセット（同期的に実行）
				await loadSaveData(loadedData)
				// フロートメニューを閉じる
				onClose()
			} catch (err) {
				console.error('セーブデータの切り替えに失敗しました:', err)
			}
		}
	}

	// 未保存変更の確認ダイアログをキャンセル
	const handleCancelSwitch = () => {
		setShowUnsavedChangesModal(false)
		setPendingSaveId(null)
	}

	if (isLoading) {
		return (
			<div className="flex-1 flex items-center justify-center p-8">
				<div className="flex items-center">
					<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
					<span className="ml-3 text-sm text-gray-600">読み込み中...</span>
				</div>
			</div>
		)
	}

	return (
		<div className="flex flex-col h-full">
			{/* アクションボタンエリア */}
			<SaveDataActions onCreateNew={() => setIsNewSaveModalOpen(true)} />

			{/* エラー表示 */}
			{error && (
				<div className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
					<div className="flex items-center">
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
						<div className="ml-3 flex-1">
							<p className="text-sm font-medium text-red-800">{error}</p>
						</div>
						<div className="ml-auto">
							<button
								type="button"
								onClick={() => setError(null)}
								className="inline-flex text-red-400 hover:text-red-600"
							>
								<span className="sr-only">閉じる</span>
								<svg
									className="h-5 w-5"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fillRule="evenodd"
										d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
										clipRule="evenodd"
									/>
								</svg>
							</button>
						</div>
					</div>
				</div>
			)}

			{/* セーブデータ一覧 */}
			<SaveDataList
				onItemSelect={handleSaveDataSelect}
				onItemRename={handleRenameSaveData}
				onItemDelete={handleDeleteSaveData}
				onClose={onClose}
			/>

			{/* 新規作成モーダル */}
			<NewSaveDataModal
				isOpen={isNewSaveModalOpen}
				onClose={() => setIsNewSaveModalOpen(false)}
				onCreateSave={handleCreateSaveData}
			/>

			{/* 未保存変更の確認モーダル */}
			{showUnsavedChangesModal && createPortal(
				<div 
					className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]"
					onMouseDown={(e) => e.stopPropagation()}
					onClick={(e) => {
						// 背景クリックで閉じる
						if (e.target === e.currentTarget) {
							handleCancelSwitch()
						}
					}}
				>
					<div 
						className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
						onClick={(e) => e.stopPropagation()}
						role="dialog"
						aria-labelledby="unsaved-changes-modal-title"
						aria-modal="true"
					>
						{/* ヘッダー */}
						<div className="flex items-center justify-between p-6 border-b border-gray-200">
							<h3 
								id="unsaved-changes-modal-title"
								className="text-lg font-medium text-gray-900"
							>
								未保存の変更があります
							</h3>
							<button
								type="button"
								onClick={handleCancelSwitch}
								className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
							>
								<svg
									className="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									aria-hidden="true"
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
							<div className="flex items-start space-x-3">
								<div className="flex-shrink-0">
									<svg
										className="h-6 w-6 text-orange-600"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										aria-hidden="true"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
										/>
									</svg>
								</div>
								<div>
									<p className="text-sm text-gray-600">
										現在のセーブデータに未保存の変更があります。
										<br />
										このまま他のセーブデータに切り替えると、変更内容が失われます。
									</p>
								</div>
							</div>
						</div>

						{/* フッター */}
						<div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
							<button
								type="button"
								onClick={handleCancelSwitch}
								className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
							>
								キャンセル
							</button>
							<button
								type="button"
								onClick={handleDiscardChanges}
								className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
							>
								変更を破棄して切り替え
							</button>
							<button
								type="button"
								onClick={handleSaveAndSwitch}
								className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
							>
								保存してから切り替え
							</button>
						</div>
					</div>
				</div>,
				document.body
			)}
		</div>
	)
}
