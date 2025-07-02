/**
 * 敵データ取得フック
 */

import { useMemo } from 'react'
import { useCalculatorStore } from '@/stores'
import type { EnemyFormData } from '@/types/calculator'
import { convertToEnemyFormData } from '@/utils/enemyDataMigration'
import { loadEnemySettingsState } from '@/utils/enemySettingsState'

/**
 * 敵データを取得するフック
 * 個別セーブデータの敵選択と共通設定を結合してEnemyFormDataを提供
 */
export function useEnemyData() {
	const saveDataEnemyInfo = useCalculatorStore((state) => state.data.enemy)
	
	const enemyFormData = useMemo((): EnemyFormData => {
		// 個別データと共通設定を結合
		const settingsState = loadEnemySettingsState()
		
		return convertToEnemyFormData(settingsState, saveDataEnemyInfo)
	}, [saveDataEnemyInfo])
	
	return {
		enemyFormData,
	}
}