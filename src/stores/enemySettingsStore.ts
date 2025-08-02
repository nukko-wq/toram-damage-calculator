/**
 * 敵設定専用Zustandストア
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {
	BossDifficulty,
	EnemySettings,
	EnemySettingsMap,
} from '@/types/calculator'

interface EnemySettingsStore {
	// 状態
	settingsMap: EnemySettingsMap

	// アクション
	getEnemySettings: (enemyId: string) => EnemySettings
	updateEnemySettings: (
		enemyId: string,
		updates: Partial<Omit<EnemySettings, 'enemyId' | 'lastUpdated'>>,
	) => void
	setBossDifficulty: (enemyId: string, difficulty: BossDifficulty) => void
	setRaidBossLevel: (enemyId: string, level: number) => void
	setManualOverrides: (
		enemyId: string,
		overrides: { resistCritical?: number; requiredHIT?: number },
	) => void
	resetEnemySettings: (enemyId: string) => void
	loadFromLocalStorage: () => void
	saveToLocalStorage: () => void
}

const STORAGE_KEY = 'enemy_settings_per_enemy'

/**
 * デフォルトの敵設定を取得
 */
function getDefaultEnemySettings(enemyId: string): EnemySettings {
	return {
		enemyId,
		difficulty: 'normal',
		raidBossLevel: 288,
		manualOverrides: {
			resistCritical: 0,
			requiredHIT: 0,
		},
		lastUpdated: new Date().toISOString(),
	}
}

export const useEnemySettingsStore = create<EnemySettingsStore>()(
	devtools(
		(set, get) => ({
			// 初期状態
			settingsMap: {},

			// 特定の敵の設定を取得
			getEnemySettings: (enemyId: string) => {
				const { settingsMap } = get()
				return settingsMap[enemyId] || getDefaultEnemySettings(enemyId)
			},

			// 特定の敵の設定を更新
			updateEnemySettings: (enemyId: string, updates) => {
				set(
					(state) => {
						const currentSettings =
							state.settingsMap[enemyId] || getDefaultEnemySettings(enemyId)
						const updatedSettings: EnemySettings = {
							...currentSettings,
							...updates,
							enemyId,
							lastUpdated: new Date().toISOString(),
						}

						const newSettingsMap = {
							...state.settingsMap,
							[enemyId]: updatedSettings,
						}

						// LocalStorageにも保存
						try {
							localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettingsMap))
						} catch (error) {
							console.error(
								'Failed to save enemy settings to localStorage:',
								error,
							)
						}

						return { settingsMap: newSettingsMap }
					},
					false,
					`updateEnemySettings:${enemyId}`,
				)
			},

			// ボス難易度を設定
			setBossDifficulty: (enemyId: string, difficulty: BossDifficulty) => {
				get().updateEnemySettings(enemyId, { difficulty })
			},

			// レイドボスレベルを設定
			setRaidBossLevel: (enemyId: string, level: number) => {
				get().updateEnemySettings(enemyId, { raidBossLevel: level })
			},

			// 手動調整値を設定
			setManualOverrides: (enemyId: string, overrides) => {
				const currentSettings = get().getEnemySettings(enemyId)
				const newOverrides = {
					...currentSettings.manualOverrides,
					...overrides,
				}
				get().updateEnemySettings(enemyId, { manualOverrides: newOverrides })
			},

			// 特定の敵の設定をリセット
			resetEnemySettings: (enemyId: string) => {
				const defaultSettings = getDefaultEnemySettings(enemyId)
				get().updateEnemySettings(enemyId, {
					difficulty: defaultSettings.difficulty,
					raidBossLevel: defaultSettings.raidBossLevel,
					manualOverrides: defaultSettings.manualOverrides,
				})
			},

			// LocalStorageから読み込み
			loadFromLocalStorage: () => {
				try {
					const stored = localStorage.getItem(STORAGE_KEY)
					if (stored) {
						const parsed = JSON.parse(stored) as EnemySettingsMap
						set({ settingsMap: parsed }, false, 'loadFromLocalStorage')
					}
				} catch (error) {
					console.warn(
						'Failed to load enemy settings from localStorage:',
						error,
					)
				}
			},

			// LocalStorageに保存
			saveToLocalStorage: () => {
				try {
					const { settingsMap } = get()
					localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsMap))
				} catch (error) {
					console.error('Failed to save enemy settings to localStorage:', error)
				}
			},
		}),
		{
			name: 'enemy-settings-store',
		},
	),
)
