/**
 * 敵データ移行ユーティリティ
 */

import type { 
	EnemyFormData, 
	EnemySettingsState,
	SaveDataEnemyInfo, 
	CalculatorData 
} from '@/types/calculator'
import { 
	loadEnemySettingsState, 
	saveEnemySettingsState, 
	getDefaultEnemySettingsState 
} from './enemySettingsState'

/**
 * EnemyFormData を EnemySettingsState に変換（設定値のみ）
 */
export function migrateEnemyFormDataToSettingsState(
	enemyFormData: EnemyFormData,
): EnemySettingsState {
	return {
		difficulty: enemyFormData.difficulty || 'normal',
		raidBossLevel: enemyFormData.raidBossLevel || 288,
		manualOverrides: enemyFormData.manualOverrides || {
			resistCritical: 0,
			requiredHIT: 0,
		},
		lastUpdated: new Date().toISOString(),
	}
}

/**
 * EnemyFormData を SaveDataEnemyInfo に変換（選択情報のみ）
 */
export function migrateEnemyFormDataToSaveDataInfo(
	enemyFormData: EnemyFormData,
): SaveDataEnemyInfo {
	return {
		selectedEnemyId: enemyFormData.selectedId,
		enemyType: enemyFormData.type,
		lastSelectedAt: enemyFormData.selectedId ? new Date().toISOString() : undefined,
	}
}

/**
 * EnemySettingsState と SaveDataEnemyInfo を EnemyFormData に変換（後方互換性用）
 */
export function convertToEnemyFormData(
	settingsState: EnemySettingsState,
	saveDataInfo: SaveDataEnemyInfo,
): EnemyFormData {
	return {
		selectedId: saveDataInfo.selectedEnemyId,
		type: saveDataInfo.enemyType,
		difficulty: settingsState.difficulty,
		raidBossLevel: settingsState.raidBossLevel,
		manualOverrides: settingsState.manualOverrides,
	}
}

/**
 * CalculatorData の敵情報を新形式に移行
 */
export function migrateCalculatorDataEnemyInfo(data: CalculatorData): CalculatorData {
	// 既に新形式の場合はそのまま返す
	if (!data.legacyEnemyFormData && data.enemy && 'selectedEnemyId' in data.enemy && 'enemyType' in data.enemy) {
		return data
	}

	// 旧形式が存在する場合は移行
	if (data.legacyEnemyFormData) {
		// 共通設定を更新
		const settingsState = migrateEnemyFormDataToSettingsState(data.legacyEnemyFormData)
		saveEnemySettingsState(settingsState)

		// 個別データに変換
		const saveDataInfo = migrateEnemyFormDataToSaveDataInfo(data.legacyEnemyFormData)

		return {
			...data,
			enemy: saveDataInfo,
			legacyEnemyFormData: undefined, // 移行完了後は削除
		}
	}

	// 何もない場合はデフォルト値を設定
	return {
		...data,
		enemy: {
			selectedEnemyId: null,
			enemyType: null,
			lastSelectedAt: undefined,
		},
	}
}

/**
 * 全セーブデータの敵情報を一括移行
 */
export function migrateAllSaveDataEnemyInfo(): void {
	try {
		// セーブデータの取得（実際の実装では saveDataStore から取得）
		const saveDataKeys = []
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i)
			if (key?.startsWith('save_data_')) {
				saveDataKeys.push(key)
			}
		}

		let hasAnyMigration = false

		// 各セーブデータを移行
		for (const key of saveDataKeys) {
			try {
				const saveDataStr = localStorage.getItem(key)
				if (!saveDataStr) continue

				const saveData = JSON.parse(saveDataStr)
				if (!saveData.data) continue

				const originalData = saveData.data as CalculatorData
				const migratedData = migrateCalculatorDataEnemyInfo(originalData)

				// 変更があった場合のみ保存
				if (originalData !== migratedData) {
					localStorage.setItem(key, JSON.stringify({
						...saveData,
						data: migratedData,
					}))
					hasAnyMigration = true
				}
			} catch (error) {
				console.warn(`Failed to migrate save data ${key}:`, error)
			}
		}

		if (hasAnyMigration) {
			console.log('Enemy data migration completed for all save data')
		}
	} catch (error) {
		console.error('Failed to migrate save data enemy info:', error)
	}
}

/**
 * 現在の敵設定状態を取得（フォールバック付き）
 */
export function getCurrentEnemySettingsState(): EnemySettingsState {
	const state = loadEnemySettingsState()
	
	// 初回起動時など、状態が空の場合のフォールバック
	if (!state.lastUpdated) {
		return getDefaultEnemySettingsState()
	}
	
	return state
}