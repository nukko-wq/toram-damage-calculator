'use client'

import { useState, useEffect } from 'react'
import type { SaveData, CalculatorData } from '@/types/calculator'
import {
	getAllSaveData,
	getCurrentSaveData,
	setCurrentSaveData,
	createSaveData,
	deleteSaveData,
	renameSaveData,
	reorderSaveData,
	initializeStorage,
	loadSaveData
} from '@/utils/saveDataManager'
import SaveDataListItem from './SaveDataListItem'
import NewSaveDataModal from './NewSaveDataModal'

interface SaveDataManagerProps {
	currentData: CalculatorData
	onDataLoad: (data: CalculatorData) => void
	onDataSave?: () => void
}

export default function SaveDataManager({ 
	currentData, 
	onDataLoad,
	onDataSave 
}: SaveDataManagerProps) {
	const [saveDataList, setSaveDataList] = useState<SaveData[]>([])
	const [currentSaveId, setCurrentSaveId] = useState<string>('default')
	const [isNewSaveModalOpen, setIsNewSaveModalOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// セーブデータリストを読み込み
	const loadSaveDataList = async () => {
		try {
			setIsLoading(true)
			setError(null)
			
			// ストレージを初期化
			await initializeStorage()
			
			// セーブデータリストを取得
			const saveData = getAllSaveData()
			setSaveDataList(saveData)
			
			// 現在のセーブデータを取得
			const current = getCurrentSaveData()
			setCurrentSaveId(current.id)
			
			// データを親コンポーネントに通知
			onDataLoad(current.data)
		} catch (err) {
			console.error('セーブデータの読み込みに失敗しました:', err)
			setError('セーブデータの読み込みに失敗しました')
		} finally {
			setIsLoading(false)
		}
	}

	// 初期化
	useEffect(() => {
		loadSaveDataList()
	}, [])

	// セーブデータの切り替え
	const handleSaveDataSelect = async (saveId: string) => {
		try {
			await setCurrentSaveData(saveId)
			setCurrentSaveId(saveId)
			
			// 最新のデータを直接ストレージから読み込み
			const loadedSaveData = await loadSaveData(saveId)
			onDataLoad(loadedSaveData.data)
		} catch (err) {
			console.error('セーブデータの切り替えに失敗しました:', err)
			setError('セーブデータの切り替えに失敗しました')
		}
	}

	// 新しいセーブデータを作成
	const handleCreateSaveData = async (name: string) => {
		try {
			const newSaveData = await createSaveData(name, currentData)
			await loadSaveDataList() // リストを再読み込み
			setIsNewSaveModalOpen(false)
			
			// 新しく作成したセーブデータに切り替え
			await handleSaveDataSelect(newSaveData.id)
		} catch (err) {
			console.error('セーブデータの作成に失敗しました:', err)
			setError('セーブデータの作成に失敗しました')
		}
	}

	// セーブデータを削除
	const handleDeleteSaveData = async (saveId: string) => {
		try {
			await deleteSaveData(saveId)
			await loadSaveDataList() // リストを再読み込み
			
			// 削除したセーブデータが現在選択中だった場合、デフォルトに切り替え
			if (currentSaveId === saveId) {
				await handleSaveDataSelect('default')
			}
		} catch (err) {
			console.error('セーブデータの削除に失敗しました:', err)
			setError('セーブデータの削除に失敗しました')
		}
	}

	// セーブデータ名を変更
	const handleRenameSaveData = async (saveId: string, newName: string) => {
		try {
			await renameSaveData(saveId, newName)
			await loadSaveDataList() // リストを再読み込み
		} catch (err) {
			console.error('セーブデータの名前変更に失敗しました:', err)
			setError('セーブデータの名前変更に失敗しました')
		}
	}

	// セーブデータの並び順を変更
	const handleReorderSaveData = async (newOrder: string[]) => {
		try {
			await reorderSaveData(newOrder)
			await loadSaveDataList() // リストを再読み込み
		} catch (err) {
			console.error('セーブデータの並び替えに失敗しました:', err)
			setError('セーブデータの並び替えに失敗しました')
		}
	}

	// 現在のデータを保存
	const handleSaveCurrentData = () => {
		if (onDataSave) {
			onDataSave()
		}
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
						className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
					>
						現在のデータを保存
					</button>
					<button
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
							<svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
								<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
								<svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
									<path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
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
					<svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
					<h3 className="mt-2 text-sm font-medium text-gray-900">セーブデータがありません</h3>
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
		</div>
	)
}