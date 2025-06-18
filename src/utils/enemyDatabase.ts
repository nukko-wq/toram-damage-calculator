// 敵情報データベース（プリセット + ユーザーカスタム統合）

import type { PresetEnemy, UserEnemy, EnemyCategory } from '@/types/calculator'
import { getUserEnemies } from './customEnemyManager'
import enemiesData from '@/data/enemies.json'

// プリセット敵データの型定義
interface EnemiesData {
	enemies: {
		mob: PresetEnemy[]
		fieldBoss: PresetEnemy[]
		boss: PresetEnemy[]
		raidBoss: PresetEnemy[]
	}
}

/**
 * プリセット敵情報を全て取得
 */
export function getPresetEnemies(): PresetEnemy[] {
	const data = enemiesData as EnemiesData
	return [
		...data.enemies.mob,
		...data.enemies.fieldBoss,
		...data.enemies.boss,
		...data.enemies.raidBoss,
	]
}

/**
 * カテゴリ別のプリセット敵情報を取得
 */
export function getPresetEnemiesByCategory(category: EnemyCategory): PresetEnemy[] {
	const data = enemiesData as EnemiesData
	return data.enemies[category] || []
}

/**
 * IDでプリセット敵情報を取得
 */
export function getPresetEnemyById(id: string): PresetEnemy | undefined {
	return getPresetEnemies().find(enemy => enemy.id === id)
}

/**
 * 全敵情報を取得（プリセット + ユーザーカスタム）
 */
export function getAllEnemies(): (PresetEnemy | UserEnemy)[] {
	const presetEnemies = getPresetEnemies()
	const userEnemies = getUserEnemies()
	return [...presetEnemies, ...userEnemies]
}

/**
 * カテゴリ別の全敵情報を取得（プリセット + ユーザーカスタム）
 */
export function getEnemiesByCategory(category: EnemyCategory): (PresetEnemy | UserEnemy)[] {
	const presetEnemies = getPresetEnemiesByCategory(category)
	const userEnemies = getUserEnemies().filter(enemy => enemy.category === category)
	return [...presetEnemies, ...userEnemies]
}

/**
 * IDで敵情報を取得（プリセット + ユーザーカスタム統合）
 */
export function getEnemyById(id: string): (PresetEnemy | UserEnemy) | undefined {
	// プリセット敵情報から検索
	const presetEnemy = getPresetEnemyById(id)
	if (presetEnemy) {
		return presetEnemy
	}

	// ユーザーカスタム敵情報から検索
	const userEnemies = getUserEnemies()
	return userEnemies.find(enemy => enemy.id === id)
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
export function isPresetEnemy(enemy: PresetEnemy | UserEnemy): enemy is PresetEnemy {
	return !('createdAt' in enemy)
}

/**
 * 敵情報がユーザーカスタムかを判定
 */
export function isUserEnemy(enemy: PresetEnemy | UserEnemy): enemy is UserEnemy {
	return 'createdAt' in enemy
}

/**
 * 敵情報を名前で検索（プリセット + ユーザーカスタム）
 */
export function searchEnemies(
	query: string,
	category?: EnemyCategory
): (PresetEnemy | UserEnemy)[] {
	let enemies = getAllEnemies()

	if (category) {
		enemies = enemies.filter(enemy => enemy.category === category)
	}

	if (query.trim()) {
		const searchTerm = query.trim().toLowerCase()
		enemies = enemies.filter(enemy => 
			enemy.name.toLowerCase().includes(searchTerm)
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
	category?: EnemyCategory
): (PresetEnemy | UserEnemy)[] {
	let enemies = category ? getEnemiesByCategory(category) : getAllEnemies()
	
	return enemies.filter(enemy => 
		enemy.level >= minLevel && enemy.level <= maxLevel
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
export function getEnemySelectOptions(category?: EnemyCategory): EnemySelectOption[] {
	const enemies = category ? getEnemiesByCategory(category) : getAllEnemies()
	
	return enemies.map(enemy => ({
		value: enemy.id,
		label: `${enemy.name} (Lv.${enemy.level})`,
		category: enemy.category,
		enemy
	}))
}

/**
 * カテゴリ別にグループ化されたセレクトオプションを生成
 */
export function getGroupedEnemySelectOptions(): Record<EnemyCategory, EnemySelectOption[]> {
	const categories: EnemyCategory[] = ['mob', 'fieldBoss', 'boss', 'raidBoss']
	const result = {} as Record<EnemyCategory, EnemySelectOption[]>

	categories.forEach(category => {
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
		raidBoss: 'レイドボス'
	}
	return displayNames[category]
}