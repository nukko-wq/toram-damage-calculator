import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { SaveDataStore } from '@/types/stores'
import type { CalculatorData } from '@/types/calculator'
import {
	getAllSaveData,
	getCurrentSaveData,
	setCurrentSaveData,
	createSaveData as createSaveDataUtil,
	deleteSaveData as deleteSaveDataUtil,
	renameSaveData as renameSaveDataUtil,
	reorderSaveData as reorderSaveDataUtil,
	initializeStorage,
	loadSaveData,
} from '@/utils/saveDataManager'

export const useSaveDataStore = create<SaveDataStore>()(
	devtools(
		(set, get) => ({
			// ===== 初期状態 =====
			saveDataList: [],
			currentSaveId: 'default',
			isLoading: true,
			error: null,
			pendingSaveId: null,
			showUnsavedChangesModal: false,

			// ===== セーブデータ一覧読み込み（ユーザー作成データのみ） =====
			loadSaveDataList: async () => {
				try {
					set({ isLoading: true, error: null })

					// ストレージを初期化
					await initializeStorage()

					// セーブデータリストを取得（メインデータ「default」を除外）
					const allSaveData = getAllSaveData()
					const userSaveData = allSaveData.filter(
						(data) => data.id !== 'default',
					)
					const current = getCurrentSaveData()

					set({
						saveDataList: userSaveData,
						currentSaveId: current.id,
						isLoading: false,
					})
				} catch (err) {
					console.error('セーブデータの読み込みに失敗しました:', err)
					set({
						error: 'セーブデータの読み込みに失敗しました',
						isLoading: false,
					})
				}
			},

			// ===== セーブデータ切り替え =====
			switchSaveData: async (saveId) => {
				try {
					await setCurrentSaveData(saveId)
					set({ currentSaveId: saveId })

					// 最新のデータを直接ストレージから読み込み
					const loadedSaveData = await loadSaveData(saveId)
					return loadedSaveData.data
				} catch (err) {
					console.error('セーブデータの切り替えに失敗しました:', err)
					set({ error: 'セーブデータの切り替えに失敗しました' })
					throw err
				}
			},

			// ===== 新規セーブデータ作成（作成後自動切り替え） =====
			createSaveData: async (name, data) => {
				try {
					const newSaveData = await createSaveDataUtil(name, data)
					await get().loadSaveDataList() // リストを再読み込み

					// 作成したセーブデータに自動切り替え
					const loadedData = await get().switchSaveData(newSaveData.id)

					return { saveData: newSaveData, loadedData }
				} catch (err) {
					console.error('セーブデータの作成に失敗しました:', err)
					set({ error: 'セーブデータの作成に失敗しました' })
					throw err
				}
			},

			// ===== セーブデータ削除（全削除時メインデータ自動切り替え） =====
			deleteSaveData: async (saveId) => {
				try {
					await deleteSaveDataUtil(saveId)
					await get().loadSaveDataList() // リストを再読み込み

					// 全ユーザーデータが削除された場合、メインデータに自動切り替え
					if (get().saveDataList.length === 0) {
						const mainData = await get().switchToMainData()
						return mainData
					}

					// 削除したセーブデータが現在選択中だった場合、メインデータに切り替え
					if (get().currentSaveId === saveId) {
						const mainData = await get().switchToMainData()
						return mainData
					}
				} catch (err) {
					console.error('セーブデータの削除に失敗しました:', err)
					set({ error: 'セーブデータの削除に失敗しました' })
					throw err
				}
			},

			// ===== セーブデータ名変更 =====
			renameSaveData: async (saveId, newName) => {
				try {
					await renameSaveDataUtil(saveId, newName)
					await get().loadSaveDataList() // リストを再読み込み
				} catch (err) {
					console.error('セーブデータの名前変更に失敗しました:', err)
					set({ error: 'セーブデータの名前変更に失敗しました' })
					throw err
				}
			},

			// ===== セーブデータ並び替え =====
			reorderSaveData: async (newOrder) => {
				try {
					await reorderSaveDataUtil(newOrder)
					await get().loadSaveDataList() // リストを再読み込み
				} catch (err) {
					console.error('セーブデータの並び替えに失敗しました:', err)
					set({ error: 'セーブデータの並び替えに失敗しました' })
					throw err
				}
			},

			// ===== UI状態管理 =====
			setPendingSaveId: (saveId) => {
				set({ pendingSaveId: saveId })
			},

			setShowUnsavedChangesModal: (value) => {
				set({ showUnsavedChangesModal: value })
			},

			setError: (error) => {
				set({ error })
			},

			// ===== メインデータ切り替え専用 =====
			switchToMainData: async () => {
				try {
					const mainData = await get().switchSaveData('default')
					return mainData
				} catch (err) {
					console.error('メインデータへの切り替えに失敗しました:', err)
					set({ error: 'メインデータへの切り替えに失敗しました' })
					throw err
				}
			},
		}),
		{
			name: 'save-data-store',
		},
	),
)
