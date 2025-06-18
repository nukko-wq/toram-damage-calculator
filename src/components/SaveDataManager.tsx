'use client'

import { useState, useEffect } from 'react'
import { useCalculatorStore, useSaveDataStore } from '@/stores'
import SaveDataListItem from './SaveDataListItem'
import NewSaveDataModal from './NewSaveDataModal'

interface SaveDataManagerProps {
	// 将来的に削除予定（Zustand移行後は不要）
	currentData?: any
	onDataLoad?: any
	onDataSave?: any
	hasUnsavedChanges?: boolean
	isFirstLoad?: boolean
}

export default function SaveDataManager({}: SaveDataManagerProps) {
	// Zustandストアからデータを取得
	const {
		data: currentData,
		hasUnsavedChanges,
		loadSaveData,
		saveCurrentData,
	} = useCalculatorStore()

	const {
		saveDataList,
		currentSaveId,
		isLoading,
		error,
		pendingSaveId,
		showUnsavedChangesModal,
		loadSaveDataList,
		switchSaveData,
		createSaveData,
		deleteSaveData,
		renameSaveData,
		reorderSaveData,
		setPendingSaveId,
		setShowUnsavedChangesModal,
		setError,
	} = useSaveDataStore()

	const [isNewSaveModalOpen, setIsNewSaveModalOpen] = useState(false)

	// 初期化（一度だけ実行）
	useEffect(() => {
		loadSaveDataList()
	}, [])

	// セーブデータの切り替え
	const handleSaveDataSelect = async (saveId: string) => {
		// 未保存の変更がある場合は確認ダイアログを表示
		if (hasUnsavedChanges && saveId !== currentSaveId) {
			setPendingSaveId(saveId)
			setShowUnsavedChangesModal(true)
			return
		}

		try {
			// Zustandストア経由でセーブデータを切り替え
			const loadedData = await switchSaveData(saveId)
			if (loadedData) {
				// CalculatorStoreのloadSaveDataを使用してセーブデータ切り替えバグを根本解決
				await loadSaveData(loadedData)
			}
		} catch (err) {
			console.error('セーブデータの切り替えに失敗しました:', err)
		}
	}

	// 新しいセーブデータを作成
	const handleCreateSaveData = async (name: string) => {
		try {
			const newSaveData = await createSaveData(name, currentData)
			setIsNewSaveModalOpen(false)

			if (newSaveData) {
				// 新しく作成したセーブデータに切り替え
				await handleSaveDataSelect(newSaveData.id)
			}
		} catch (err) {
			console.error('セーブデータの作成に失敗しました:', err)
		}
	}

	// セーブデータを削除
	const handleDeleteSaveData = async (saveId: string) => {
		try {
			const defaultData = await deleteSaveData(saveId)
			
			// 削除したセーブデータが現在選択中だった場合、デフォルトデータを読み込み
			if (currentSaveId === saveId && defaultData) {
				await loadSaveData(defaultData)
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

	// セーブデータの並び順を変更
	const handleReorderSaveData = async (newOrder: string[]) => {
		try {
			await reorderSaveData(newOrder)
		} catch (err) {
			console.error('セーブデータの並び替えに失敗しました:', err)
		}
	}

	// 現在のデータを保存
	const handleSaveCurrentData = async () => {
		try {
			await saveCurrentData()
		} catch (err) {
			console.error('データ保存エラー:', err)
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
				if (loadedData) {
					await loadSaveData(loadedData)
				}
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
				await saveCurrentData()

				// 保存後にセーブデータを切り替え
				setShowUnsavedChangesModal(false)
				setPendingSaveId(null)

				const loadedData = await switchSaveData(pendingSaveId)
				if (loadedData) {
					await loadSaveData(loadedData)
				}
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
			<div className="bg-white rounded-lg shadow-md p-6">
				<div className="flex items-center justify-center py-8">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
					<span className="ml-3 text-gray-600">読み込み中...</span>
				</div>
			</div>
		)
	}

	return (
		<div className="bg-white rounded-lg shadow-md p-6">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-xl font-bold text-gray-800">セーブデータ管理</h2>
				<div className="flex space-x-3">
					<button
						onClick={handleSaveCurrentData}
						className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors flex items-center ${
							hasUnsavedChanges
								? 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
								: 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
						}`}
					>
						{hasUnsavedChanges && (
							<svg
								className="mr-2 h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
								/>
							</svg>
						)}
						{hasUnsavedChanges ? '未保存の変更を保存' : '現在のデータを保存'}
					</button>
					<button
						type="button"
						onClick={() => setIsNewSaveModalOpen(true)}
						className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
					>
						新規セーブ作成
					</button>
				</div>
			</div>

			{error && (
				<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
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
							<p className="text-sm font-medium text-red-800">{error}</p>
						</div>
						<div className="ml-auto pl-3">
							<button
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

			<div className="space-y-2">
				{saveDataList.map((saveData) => (
					<SaveDataListItem
						key={saveData.id}
						saveData={saveData}
						isSelected={saveData.id === currentSaveId}
						onSelect={() => handleSaveDataSelect(saveData.id)}
						onDelete={() => handleDeleteSaveData(saveData.id)}
						onRename={(newName) => handleRenameSaveData(saveData.id, newName)}
					/>
				))}
			</div>

			{saveDataList.length === 0 && (
				<div className="text-center py-8">
					<svg
						className="mx-auto h-12 w-12 text-gray-400"
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
					<h3 className="mt-2 text-sm font-medium text-gray-900">
						セーブデータがありません
					</h3>
					<p className="mt-1 text-sm text-gray-500">
						新規セーブを作成して始めましょう
					</p>
				</div>
			)}

			<NewSaveDataModal
				isOpen={isNewSaveModalOpen}
				onClose={() => setIsNewSaveModalOpen(false)}
				onCreateSave={handleCreateSaveData}
			/>

			{/* 未保存変更の確認モーダル */}
			{showUnsavedChangesModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
						{/* ヘッダー */}
						<div className="flex items-center justify-between p-6 border-b border-gray-200">
							<h3 className="text-lg font-medium text-gray-900">
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
				</div>
			)}
		</div>
	)
}
