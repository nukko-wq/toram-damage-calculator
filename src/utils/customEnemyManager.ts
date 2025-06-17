// カスタム敵管理システム

import type { UserEnemy } from '@/types/calculator'
import { StorageHelper, STORAGE_KEYS } from './storage'

/**
 * ユーザーカスタム敵をLocalStorageから取得
 */
export const getUserEnemies = (): UserEnemy[] => {
	return StorageHelper.get<UserEnemy[]>(STORAGE_KEYS.CUSTOM_ENEMIES, [])
}

/**
 * IDでユーザーカスタム敵を取得
 */
export const getUserEnemyById = (id: string): UserEnemy | undefined => {
	return getUserEnemies().find((enemy) => enemy.id === id)
}

/**
 * カテゴリ別にユーザーカスタム敵を取得
 */
export const getUserEnemiesByCategory = (
	category: UserEnemy['category'],
): UserEnemy[] => {
	return getUserEnemies().filter((enemy) => enemy.category === category)
}

/**
 * ユーザーカスタム敵を保存
 */
export const saveUserEnemy = (
	enemy: Omit<UserEnemy, 'createdAt' | 'updatedAt'>,
): void => {
	try {
		const userEnemies = getUserEnemies()
		const now = new Date().toISOString()

		const existingIndex = userEnemies.findIndex((e) => e.id === enemy.id)

		if (existingIndex >= 0) {
			// 既存の敵を更新
			userEnemies[existingIndex] = {
				...enemy,
				createdAt: userEnemies[existingIndex].createdAt,
				updatedAt: now,
			}
		} else {
			// 新しい敵を追加
			userEnemies.push({
				...enemy,
				createdAt: now,
				updatedAt: now,
			})
		}

		StorageHelper.set(STORAGE_KEYS.CUSTOM_ENEMIES, userEnemies)
	} catch (error) {
		console.error('Error saving user enemy:', error)
	}
}

/**
 * ユーザーカスタム敵を更新
 */
export const updateUserEnemy = (
	id: string,
	updates: Partial<UserEnemy>,
): void => {
	try {
		const userEnemies = getUserEnemies()
		const index = userEnemies.findIndex((e) => e.id === id)

		if (index >= 0) {
			userEnemies[index] = {
				...userEnemies[index],
				...updates,
				updatedAt: new Date().toISOString(),
			}
			StorageHelper.set(STORAGE_KEYS.CUSTOM_ENEMIES, userEnemies)
		}
	} catch (error) {
		console.error('Error updating user enemy:', error)
	}
}

/**
 * ユーザーカスタム敵を削除
 */
export const deleteUserEnemy = (id: string): void => {
	try {
		const userEnemies = getUserEnemies()
		const filtered = userEnemies.filter((e) => e.id !== id)
		StorageHelper.set(STORAGE_KEYS.CUSTOM_ENEMIES, filtered)
	} catch (error) {
		console.error('Error deleting user enemy:', error)
	}
}

/**
 * ユーザーカスタム敵名を変更
 */
export const renameUserEnemy = (id: string, newName: string): void => {
	updateUserEnemy(id, { name: newName.trim() })
}

/**
 * ユーザーカスタム敵のお気に入り状態を切り替え
 */
export const toggleEnemyFavorite = (id: string): void => {
	const enemy = getUserEnemyById(id)
	if (enemy) {
		updateUserEnemy(id, { isFavorite: !enemy.isFavorite })
	}
}

/**
 * ユーザーカスタム敵を複製
 */
export const duplicateUserEnemy = (id: string, newName?: string): string => {
	const enemy = getUserEnemyById(id)
	if (!enemy) {
		throw new Error('Enemy not found')
	}

	const newId = `${enemy.id}_copy_${Date.now()}`
	const duplicatedEnemy: Omit<UserEnemy, 'createdAt' | 'updatedAt'> = {
		...enemy,
		id: newId,
		name: newName || `${enemy.name} (コピー)`,
		isFavorite: false,
	}

	saveUserEnemy(duplicatedEnemy)
	return newId
}

/**
 * カスタム敵を検索
 */
export const searchUserEnemies = (
	query: string,
	category?: UserEnemy['category'],
): UserEnemy[] => {
	let enemies = getUserEnemies()

	if (category) {
		enemies = enemies.filter((e) => e.category === category)
	}

	if (query.trim()) {
		const searchTerm = query.trim().toLowerCase()
		enemies = enemies.filter((e) => e.name.toLowerCase().includes(searchTerm))
	}

	return enemies
}

/**
 * お気に入りカスタム敵を取得
 */
export const getFavoriteUserEnemies = (): UserEnemy[] => {
	return getUserEnemies().filter((e) => e.isFavorite)
}

/**
 * レベル範囲でカスタム敵を取得
 */
export const getUserEnemiesByLevelRange = (
	minLevel: number,
	maxLevel: number,
): UserEnemy[] => {
	return getUserEnemies().filter(
		(e) => e.level >= minLevel && e.level <= maxLevel,
	)
}

/**
 * 耐性値でカスタム敵をフィルタリング
 */
export const getUserEnemiesByResistance = (
	type: 'physical' | 'magical',
	minResistance?: number,
	maxResistance?: number,
): UserEnemy[] => {
	return getUserEnemies().filter((e) => {
		const resistance =
			type === 'physical'
				? e.stats.physicalResistance
				: e.stats.magicalResistance

		if (minResistance !== undefined && resistance < minResistance) return false
		if (maxResistance !== undefined && resistance > maxResistance) return false

		return true
	})
}
