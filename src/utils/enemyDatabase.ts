// 敵情報データベース（プリセット + ユーザーカスタム統合）

import type {
	PresetEnemy,
	LocalStorageEnemy,
	Enemy,
	UserEnemy,
	EnemyCategory,
} from '@/types/calculator'
import { getUserEnemies } from './customEnemyManager'
import enemiesData from '@/data/enemies.json'

// ストレージキー
const STORAGE_KEYS = {
	PRESET_ENEMIES: 'toram_preset_enemies',
	CUSTOM_ENEMIES: 'toram_custom_enemies',
} as const

// プリセット敵データの型定義
interface EnemiesData {
	enemies: {
		mob: PresetEnemy[]
		fieldBoss: PresetEnemy[]
		boss: PresetEnemy[]
		raidBoss: PresetEnemy[]
	}
}

// ローカルストレージからプリセット敵情報を取得（新システム）
export function getLocalStorageEnemies(): LocalStorageEnemy[] {
	try {
		const stored = localStorage.getItem(STORAGE_KEYS.PRESET_ENEMIES)
		return stored ? JSON.parse(stored) : []
	} catch (error) {
		console.error('Failed to load preset enemies from localStorage:', error)
		return []
	}
}

/**
 * プリセット敵情報を全て取得（後方互換性）
 */
export function getPresetEnemies(): PresetEnemy[] {
	const data = enemiesData as unknown as EnemiesData
	return [
		...data.enemies.mob,
		...data.enemies.fieldBoss,
		...data.enemies.boss,
		...data.enemies.raidBoss,
	]
}

// プリセット敵情報のお気に入り状態を更新（新システム）
export function toggleEnemyFavorite(id: string): void {
	try {
		const presetEnemies = getLocalStorageEnemies()
		const index = presetEnemies.findIndex((item) => item.id === id)

		if (index >= 0) {
			presetEnemies[index].isFavorite = !presetEnemies[index].isFavorite
			presetEnemies[index].isModified = true
			presetEnemies[index].modifiedAt = new Date().toISOString()
			presetEnemies[index].updatedAt = new Date().toISOString()

			localStorage.setItem(
				STORAGE_KEYS.PRESET_ENEMIES,
				JSON.stringify(presetEnemies),
			)
		}
	} catch (error) {
		console.error('Failed to toggle enemy favorite:', error)
	}
}

// プリセット敵情報のプロパティを更新（新システム）
export function updatePresetEnemy(
	id: string,
	updates: Partial<LocalStorageEnemy>,
): void {
	try {
		const presetEnemies = getLocalStorageEnemies()
		const index = presetEnemies.findIndex((item) => item.id === id)

		if (index >= 0) {
			presetEnemies[index] = {
				...presetEnemies[index],
				...updates,
				isModified: true,
				modifiedAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}

			localStorage.setItem(
				STORAGE_KEYS.PRESET_ENEMIES,
				JSON.stringify(presetEnemies),
			)
		}
	} catch (error) {
		console.error('Failed to update preset enemy:', error)
	}
}

/**
 * カテゴリ別のプリセット敵情報を取得
 */
export function getPresetEnemiesByCategory(
	category: EnemyCategory,
): PresetEnemy[] {
	const data = enemiesData as unknown as EnemiesData
	return data.enemies[category] || []
}

/**
 * IDでプリセット敵情報を取得
 */
export function getPresetEnemyById(id: string): PresetEnemy | undefined {
	return getPresetEnemies().find((enemy) => enemy.id === id)
}

/**
 * 全敵情報を取得（プリセット + ユーザーカスタム）- 新システム
 */
export function getAllEnemies(): Enemy[] {
	const presetEnemies = getLocalStorageEnemies()
	const userEnemies = getUserEnemies()

	// カスタム敵情報をCustomEnemy形式に変換
	const formattedUserEnemies: Enemy[] = userEnemies.map((enemy) => ({
		...enemy,
		isPreset: false as const,
		isCustom: true as const,
		isFavorite: enemy.isFavorite || false,
		isModified: false,
		createdAt: enemy.createdAt || new Date().toISOString(),
		updatedAt: enemy.updatedAt || new Date().toISOString(),
	}))

	return [...presetEnemies, ...formattedUserEnemies]
}

/**
 * 全敵情報を取得（プリセット + ユーザーカスタム）- 後方互換性
 */
export function getAllEnemiesLegacy(): (PresetEnemy | UserEnemy)[] {
	const presetEnemies = getPresetEnemies()
	const userEnemies = getUserEnemies()
	return [...presetEnemies, ...userEnemies]
}

/**
 * カテゴリ別の全敵情報を取得（プリセット + ユーザーカスタム）- 新システム
 */
export function getEnemiesByCategory(category: EnemyCategory): Enemy[] {
	return getAllEnemies().filter((enemy) => enemy.category === category)
}

/**
 * IDで敵情報を取得（プリセット + ユーザーカスタム統合）- 新システム
 */
export function getEnemyById(id: string): Enemy | undefined {
	return getAllEnemies().find((enemy) => enemy.id === id)
}

/**
 * 敵情報の存在確認
 */
export function enemyExists(id: string): boolean {
	return getEnemyById(id) !== undefined
}

/**
 * 敵情報がプリセットかカスタムかを判定
 */
export function isPresetEnemy(
	enemy: PresetEnemy | UserEnemy,
): enemy is PresetEnemy {
	return !('createdAt' in enemy)
}

/**
 * 敵情報がユーザーカスタムかを判定
 */
export function isUserEnemy(
	enemy: PresetEnemy | UserEnemy,
): enemy is UserEnemy {
	return 'createdAt' in enemy
}

/**
 * 敵情報を名前で検索（プリセット + ユーザーカスタム）
 */
export function searchEnemies(
	query: string,
	category?: EnemyCategory,
): (PresetEnemy | UserEnemy)[] {
	let enemies = getAllEnemies()

	if (category) {
		enemies = enemies.filter((enemy) => enemy.category === category)
	}

	if (query.trim()) {
		const searchTerm = query.trim().toLowerCase()
		enemies = enemies.filter((enemy) =>
			enemy.name.toLowerCase().includes(searchTerm),
		)
	}

	return enemies
}

/**
 * レベル範囲で敵情報をフィルタリング
 */
export function getEnemiesByLevelRange(
	minLevel: number,
	maxLevel: number,
	category?: EnemyCategory,
): (PresetEnemy | UserEnemy)[] {
	const enemies = category ? getEnemiesByCategory(category) : getAllEnemies()

	return enemies.filter(
		(enemy) => enemy.level >= minLevel && enemy.level <= maxLevel,
	)
}

/**
 * 選択用オプションの生成（セレクトボックス用）
 */
export interface EnemySelectOption {
	value: string
	label: string
	category: EnemyCategory
	enemy: PresetEnemy | UserEnemy
}

/**
 * セレクトボックス用のオプションを生成
 */
export function getEnemySelectOptions(
	category?: EnemyCategory,
): EnemySelectOption[] {
	const enemies = category ? getEnemiesByCategory(category) : getAllEnemies()

	return enemies.map((enemy) => ({
		value: enemy.id,
		label: `${enemy.name} (Lv.${enemy.level})`,
		category: enemy.category,
		enemy,
	}))
}

/**
 * カテゴリ別にグループ化されたセレクトオプションを生成
 */
export function getGroupedEnemySelectOptions(): Record<
	EnemyCategory,
	EnemySelectOption[]
> {
	const categories: EnemyCategory[] = ['mob', 'fieldBoss', 'boss', 'raidBoss']
	const result = {} as Record<EnemyCategory, EnemySelectOption[]>

	categories.forEach((category) => {
		result[category] = getEnemySelectOptions(category)
	})

	return result
}

/**
 * カテゴリの表示名を取得
 */
export function getCategoryDisplayName(category: EnemyCategory): string {
	const displayNames: Record<EnemyCategory, string> = {
		mob: 'モブ',
		fieldBoss: 'フィールドボス',
		boss: 'ボス',
		raidBoss: 'レイドボス',
	}
	return displayNames[category]
}
