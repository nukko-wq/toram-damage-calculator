/**
 * 敵データ取得フック
 */

import { useMemo } from 'react'
import { useCalculatorStore } from '@/stores'
import { useEnemySettingsStore } from '@/stores/enemySettingsStore'
import type { EnemyFormData } from '@/types/calculator'

/**
 * 敵データを取得するフック
 * 個別セーブデータの敵選択と敵ごと設定を結合してEnemyFormDataを提供
 */
export function useEnemyData() {
	const saveDataEnemyInfo = useCalculatorStore((state) => state.data.enemy)
	const getEnemySettings = useEnemySettingsStore(
		(state) => state.getEnemySettings,
	)

	const enemyFormData = useMemo((): EnemyFormData => {
		// 選択された敵がない場合
		if (!saveDataEnemyInfo.selectedEnemyId) {
			return {
				selectedId: null,
				type: null,
				difficulty: 'normal',
				raidBossLevel: 288,
				manualOverrides: {
					resistCritical: 0,
					requiredHIT: 0,
				},
			}
		}

		// 選択された敵の設定を取得
		const enemySettings = getEnemySettings(saveDataEnemyInfo.selectedEnemyId)

		return {
			selectedId: saveDataEnemyInfo.selectedEnemyId,
			type: saveDataEnemyInfo.enemyType,
			difficulty: enemySettings.difficulty,
			raidBossLevel: enemySettings.raidBossLevel,
			manualOverrides: enemySettings.manualOverrides,
		}
	}, [saveDataEnemyInfo, getEnemySettings])

	return {
		enemyFormData,
	}
}
