'use client'

import { useState } from 'react'
import { useCalculatorStore, useSaveDataStore } from '@/stores'
import NewSaveDataModal from './modals/NewSaveDataModal'

import SaveDataActions from './SaveDataActions'
import SaveDataList from './SaveDataList'

interface SaveDataContentProps {
	onClose: () => void
}

export default function SaveDataContent({ onClose }: SaveDataContentProps) {
	// Zustandストアからデータを取得
	const { data: currentData, loadSaveData } = useCalculatorStore()

	const {
		saveDataList,
		currentSaveId,
		isLoading,
		error,
		switchSaveData,
		createSaveData,
		deleteSaveData,
		renameSaveData,
		setError,
	} = useSaveDataStore()

	const [isNewSaveModalOpen, setIsNewSaveModalOpen] = useState(false)

	// 初期化は既にcalculatorStoreで実行済みなので不要
	// useEffect(() => {
	// 	loadSaveDataList()
	// }, [loadSaveDataList])

	// セーブデータの切り替え
	const handleSaveDataSelect = async (saveId: string) => {
		try {
			// Zustandストア経由でセーブデータを切り替え（原子操作）
			const loadedData = await switchSaveData(saveId)
			// calculatorStoreにデータを読み込んで未保存変更フラグをリセット（同期的に実行）
			await loadSaveData(loadedData)
			// フロートメニューを閉じる
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
		</div>
	)
}
