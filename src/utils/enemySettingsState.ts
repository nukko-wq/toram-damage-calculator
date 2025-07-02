/**
 * 敵設定状態管理ユーティリティ（全セーブデータ共通の設定値）
 */

import type { EnemySettingsState, BossDifficulty } from '@/types/calculator'

const STORAGE_KEY = 'enemy_settings_state'

/**
 * デフォルトの敵設定状態を取得
 */
export function getDefaultEnemySettingsState(): EnemySettingsState {
	return {
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
 * 敵設定状態をLocalStorageから取得
 */
export function loadEnemySettingsState(): EnemySettingsState {
	try {
		const stored = localStorage.getItem(STORAGE_KEY)
		if (!stored) {
			return getDefaultEnemySettingsState()
		}

		const parsed = JSON.parse(stored) as EnemySettingsState
		
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
		console.warn('Failed to load enemy settings state:', error)
		return getDefaultEnemySettingsState()
	}
}

/**
 * 敵設定状態をLocalStorageに保存
 */
export function saveEnemySettingsState(state: EnemySettingsState): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
	} catch (error) {
		console.error('Failed to save enemy settings state:', error)
	}
}

/**
 * 敵設定状態を更新
 */
function updateEnemySettingsState(
	updates: Partial<Omit<EnemySettingsState, 'lastUpdated'>>,
): EnemySettingsState {
	const currentState = loadEnemySettingsState()
	const newState: EnemySettingsState = {
		...currentState,
		...updates,
		lastUpdated: new Date().toISOString(),
	}
	
	saveEnemySettingsState(newState)
	return newState
}

/**
 * ボス難易度を設定
 */
export function setBossDifficulty(difficulty: BossDifficulty): EnemySettingsState {
	return updateEnemySettingsState({ difficulty })
}

/**
 * レイドボスレベルを設定
 */
export function setRaidBossLevel(level: number): EnemySettingsState {
	return updateEnemySettingsState({ raidBossLevel: level })
}

/**
 * 手動調整値を設定
 */
export function setManualOverrides(overrides: {
	resistCritical?: number
	requiredHIT?: number
}): EnemySettingsState {
	const currentState = loadEnemySettingsState()
	const newOverrides = {
		...currentState.manualOverrides,
		...overrides,
	}
	return updateEnemySettingsState({ manualOverrides: newOverrides })
}

/**
 * 設定をリセット
 */
export function resetEnemySettings(): EnemySettingsState {
	const defaultState = getDefaultEnemySettingsState()
	saveEnemySettingsState(defaultState)
	return defaultState
}