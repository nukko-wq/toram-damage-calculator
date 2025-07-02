/**
 * 敵データ変換ユーティリティ
 */

import type { 
	EnemyFormData, 
	EnemySettingsState,
	SaveDataEnemyInfo
} from '@/types/calculator'

/**
 * EnemySettingsState と SaveDataEnemyInfo を EnemyFormData に変換
 * UIコンポーネントで使用するための統合データを作成
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