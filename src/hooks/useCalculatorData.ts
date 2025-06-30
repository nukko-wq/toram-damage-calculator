import { useCalculatorStore } from '@/stores'

/**
 * 計算データ管理用のカスタムフック
 * フォームからの使用を簡単にするためのヘルパー
 */
export const useCalculatorData = () => {
	const store = useCalculatorStore()

	return {
		// データアクセス
		data: store.data,
		hasUnsavedChanges: store.hasUnsavedChanges,
		isLoading: store.isLoading,
		isInitialized: store.isInitialized,

		// 個別フォーム更新関数
		updateBaseStats: store.updateBaseStats,
		updateMainWeapon: store.updateMainWeapon,
		updateSubWeapon: store.updateSubWeapon,
		updateCrystals: store.updateCrystals,
		updateEquipment: store.updateEquipment,
		updateFood: store.updateFood,
		updateEnemy: store.updateEnemy,
		updateBuffSkills: store.updateBuffSkills,
		updateBuffItems: store.updateBuffItems,
		updateRegister: store.updateRegister,

		// 基本アクション
		setHasUnsavedChanges: store.setHasUnsavedChanges,
		resetUnsavedChanges: store.resetUnsavedChanges,

		// セーブデータ管理
		loadSaveData: store.loadSaveData,
		saveCurrentData: store.saveCurrentData,

		// 初期化
		initialize: store.initialize,
	}
}
