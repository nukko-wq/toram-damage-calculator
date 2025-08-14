import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { CalculatorData } from '@/types/calculator'
import type { SaveDataStore } from '@/types/stores'
import {
	createSaveData as createSaveDataUtil,
	deleteSaveData as deleteSaveDataUtil,
	getAllSaveData,
	getCurrentSaveData,
	initializeStorage,
	loadSaveData,
	renameSaveData as renameSaveDataUtil,
	reorderSaveData as reorderSaveDataUtil,
	setCurrentSaveData,
} from '@/utils/saveDataManager'

// 初期currentSaveIdを同期的に取得（SSR対応）
const getInitialCurrentSaveId = () => {
	// サーバーサイドレンダリング時はデフォルト値を返す
	if (typeof window === 'undefined') {
		return 'default'
	}

	try {
		return getCurrentSaveData().id
	} catch {
		return 'default'
	}
}

import { setCurrentSaveDataId } from '@/utils/editSessionManager'

export const useSaveDataStore = create<SaveDataStore>()(
	devtools(
		(set, get) => ({
			// ===== 初期状態 =====
			saveDataList: [],
			currentSaveId: getInitialCurrentSaveId(),
			isLoading: true,
			isInitialized: false,
			error: null,
			pendingSaveId: null,

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

					// 編集セッション管理にセーブデータIDを設定
					setCurrentSaveDataId(current.id)

					set({
						saveDataList: userSaveData,
						currentSaveId: current.id,
						isLoading: false,
						isInitialized: true,
					})
				} catch (err) {
					console.error('セーブデータの読み込みに失敗しました:', err)
					set({
						error: 'セーブデータの読み込みに失敗しました',
						isLoading: false,
						isInitialized: true,
					})
				}
			},

			// ===== セーブデータ切り替え =====
			switchSaveData: async (saveId) => {
				try {
					// 編集セッション管理にセーブデータIDを設定
					setCurrentSaveDataId(saveId)

					// データの読み込みと更新を先に行う
					await setCurrentSaveData(saveId)
					const loadedSaveData = await loadSaveData(saveId)

					// 全ての準備が完了してからcurrentSaveIdを更新（ちらつき防止）
					set({ currentSaveId: saveId })
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

					// saveDataListに新しいアイテムを追加（リロードせずに）
					set((state) => ({
						saveDataList: [...state.saveDataList, newSaveData],
					}))

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
					const currentState = get()
					await deleteSaveDataUtil(saveId)

					// saveDataListから削除したアイテムを除去（リロードせずに）
					const updatedList = currentState.saveDataList.filter(
						(data) => data.id !== saveId,
					)
					set({ saveDataList: updatedList })

					// 全ユーザーデータが削除された場合、メインデータに自動切り替え
					if (updatedList.length === 0) {
						const mainData = await get().switchToMainData()
						return mainData
					}

					// 削除したセーブデータが現在選択中だった場合、メインデータに切り替え
					if (currentState.currentSaveId === saveId) {
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

					// saveDataListの該当アイテムの名前を更新（リロードせずに）
					set((state) => ({
						saveDataList: state.saveDataList.map((saveData) =>
							saveData.id === saveId
								? {
										...saveData,
										name: newName,
										updatedAt: new Date().toISOString(),
									}
								: saveData,
						),
					}))
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

					// 並び替え後の完全なセーブデータリストを取得
					const allSaveData = getAllSaveData()
					const userSaveData = allSaveData.filter(
						(data) => data.id !== 'default',
					)
					set({ saveDataList: userSaveData })
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
