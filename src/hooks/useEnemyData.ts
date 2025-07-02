/**
 * 敵データ取得フック（新しいストレージシステム対応）
 */

import { useMemo } from 'react'
import { useCalculatorStore } from '@/stores'
import type { EnemyFormData } from '@/types/calculator'
import { convertToEnemyFormData } from '@/utils/enemyDataMigration'
import { loadEnemySettingsState } from '@/utils/enemySettingsState'

/**
 * 敵データを取得するフック
 * 新しいストレージシステムと後方互換性を提供
 */
export function useEnemyData() {
	const saveDataEnemyInfo = useCalculatorStore((state) => state.data.enemy)
	const legacyEnemyFormData = useCalculatorStore((state) => state.data.legacyEnemyFormData)
	
	const enemyFormData = useMemo((): EnemyFormData => {
		// 旧形式が存在する場合はそれを優先
		if (legacyEnemyFormData) {
			return legacyEnemyFormData
		}
		
		// 新形式の場合：個別データと共通設定を結合
		const settingsState = loadEnemySettingsState()
		
		return convertToEnemyFormData(settingsState, saveDataEnemyInfo)
	}, [saveDataEnemyInfo, legacyEnemyFormData])
	
	return {
		enemyFormData,
		isNewFormat: !legacyEnemyFormData,
	}
}