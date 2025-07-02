/**
 * 敵選択状態管理ユーティリティ（全セーブデータ共通）
 */

import type { EnemySelectionState, BossDifficulty } from '@/types/calculator'

const STORAGE_KEY = 'enemy_selection_state'

/**
 * デフォルトの敵選択状態を取得
 */
export function getDefaultEnemySelectionState(): EnemySelectionState {
	return {
		selectedId: null,
		type: null,
		difficulty: 'normal',
		raidBossLevel: 288,
		manualOverrides: {
			resistCritical: 0,
			requiredHIT: 0,
		},
		lastUpdated: new Date().toISOString(),
	}
}

/**
 * 敵選択状態をLocalStorageから取得
 */
export function loadEnemySelectionState(): EnemySelectionState {
	try {
		const stored = localStorage.getItem(STORAGE_KEY)
		if (!stored) {
			return getDefaultEnemySelectionState()
		}

		const parsed = JSON.parse(stored) as EnemySelectionState
		
		// 必要なフィールドの存在チェック
		if (!parsed.lastUpdated) {
			parsed.lastUpdated = new Date().toISOString()
		}
		
		// デフォルト値の補完
		if (parsed.difficulty === undefined) {
			parsed.difficulty = 'normal'
		}
		
		if (parsed.raidBossLevel === undefined) {
			parsed.raidBossLevel = 288
		}
		
		if (!parsed.manualOverrides) {
			parsed.manualOverrides = {
				resistCritical: 0,
				requiredHIT: 0,
			}
		}

		return parsed
	} catch (error) {
		console.warn('Failed to load enemy selection state:', error)
		return getDefaultEnemySelectionState()
	}
}

/**
 * 敵選択状態をLocalStorageに保存
 */
export function saveEnemySelectionState(state: EnemySelectionState): void {
	try {
		const stateWithTimestamp = {
			...state,
			lastUpdated: new Date().toISOString(),
		}
		localStorage.setItem(STORAGE_KEY, JSON.stringify(stateWithTimestamp))
	} catch (error) {
		console.error('Failed to save enemy selection state:', error)
	}
}

/**
 * 敵選択状態を更新（部分更新可能）
 */
export function updateEnemySelectionState(
	updates: Partial<Omit<EnemySelectionState, 'lastUpdated'>>,
): EnemySelectionState {
	const currentState = loadEnemySelectionState()
	const newState = {
		...currentState,
		...updates,
		lastUpdated: new Date().toISOString(),
	}
	
	saveEnemySelectionState(newState)
	return newState
}

/**
 * 敵を選択
 */
export function selectEnemy(
	enemyId: string | null,
	type: 'preset' | 'custom' | null,
): EnemySelectionState {
	return updateEnemySelectionState({
		selectedId: enemyId,
		type,
		// 敵変更時はデフォルト設定にリセット
		difficulty: 'normal',
		raidBossLevel: 288,
		manualOverrides: {
			resistCritical: 0,
			requiredHIT: 0,
		},
	})
}

/**
 * ボス難易度を設定
 */
export function setBossDifficulty(difficulty: BossDifficulty): EnemySelectionState {
	return updateEnemySelectionState({ difficulty })
}

/**
 * レイドボスレベルを設定
 */
export function setRaidBossLevel(level: number): EnemySelectionState {
	return updateEnemySelectionState({ raidBossLevel: level })
}

/**
 * 手動調整値を設定
 */
export function setManualOverrides(overrides: {
	resistCritical?: number
	requiredHIT?: number
}): EnemySelectionState {
	const currentState = loadEnemySelectionState()
	return updateEnemySelectionState({
		manualOverrides: {
			...currentState.manualOverrides,
			...overrides,
		},
	})
}

/**
 * 敵選択状態をクリア
 */
export function clearEnemySelection(): EnemySelectionState {
	return updateEnemySelectionState(getDefaultEnemySelectionState())
}