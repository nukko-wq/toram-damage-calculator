import { useSaveDataStore } from '@/stores'

/**
 * セーブデータ管理用のカスタムフック
 * SaveDataManagerコンポーネントでの使用を簡単にするためのヘルパー
 */
export const useSaveDataManager = () => {
	const store = useSaveDataStore()

	return {
		// データアクセス
		saveDataList: store.saveDataList,
		currentSaveId: store.currentSaveId,
		isLoading: store.isLoading,
		error: store.error,
		pendingSaveId: store.pendingSaveId,
		showUnsavedChangesModal: store.showUnsavedChangesModal,

		// アクション
		loadSaveDataList: store.loadSaveDataList,
		switchSaveData: store.switchSaveData,
		createSaveData: store.createSaveData,
		deleteSaveData: store.deleteSaveData,
		renameSaveData: store.renameSaveData,
		reorderSaveData: store.reorderSaveData,

		// UI状態管理
		setPendingSaveId: store.setPendingSaveId,
		setShowUnsavedChangesModal: store.setShowUnsavedChangesModal,
		setError: store.setError,
	}
}