// カスタム装備管理システム

import type { EquipmentCategory, UserEquipment } from '@/types/calculator'
import { STORAGE_KEYS, StorageHelper } from './storage'

/**
 * ユーザーカスタム装備をLocalStorageから取得
 */
export const getUserEquipments = (): UserEquipment[] => {
	return StorageHelper.get<UserEquipment[]>(STORAGE_KEYS.CUSTOM_EQUIPMENTS, [])
}

/**
 * IDでユーザーカスタム装備を取得
 */
export const getUserEquipmentById = (id: string): UserEquipment | undefined => {
	return getUserEquipments().find((equipment) => equipment.id === id)
}

/**
 * カテゴリ別にユーザーカスタム装備を取得
 */
export const getUserEquipmentsByCategory = (
	category: EquipmentCategory,
): UserEquipment[] => {
	return getUserEquipments().filter(
		(equipment) => equipment.category === category,
	)
}

/**
 * ユーザーカスタム装備を保存
 */
export const saveUserEquipment = (
	equipment: Omit<UserEquipment, 'createdAt' | 'updatedAt'>,
): void => {
	try {
		const userEquipments = getUserEquipments()
		const now = new Date().toISOString()

		const existingIndex = userEquipments.findIndex((e) => e.id === equipment.id)

		if (existingIndex >= 0) {
			// 既存の装備を更新
			userEquipments[existingIndex] = {
				...equipment,
				createdAt: userEquipments[existingIndex].createdAt,
				updatedAt: now,
			}
		} else {
			// 新しい装備を追加
			userEquipments.push({
				...equipment,
				createdAt: now,
				updatedAt: now,
			})
		}

		StorageHelper.set(STORAGE_KEYS.CUSTOM_EQUIPMENTS, userEquipments)
	} catch (error) {
		console.error('Error saving user equipment:', error)
	}
}

/**
 * ユーザーカスタム装備を更新
 */
export const updateUserEquipment = (
	id: string,
	updates: Partial<UserEquipment>,
): void => {
	try {
		const userEquipments = getUserEquipments()
		const index = userEquipments.findIndex((e) => e.id === id)

		if (index >= 0) {
			userEquipments[index] = {
				...userEquipments[index],
				...updates,
				updatedAt: new Date().toISOString(),
			}
			StorageHelper.set(STORAGE_KEYS.CUSTOM_EQUIPMENTS, userEquipments)
		}
	} catch (error) {
		console.error('Error updating user equipment:', error)
	}
}

/**
 * ユーザーカスタム装備を削除
 */
export const deleteUserEquipment = (id: string): void => {
	try {
		const userEquipments = getUserEquipments()
		const filtered = userEquipments.filter((e) => e.id !== id)
		StorageHelper.set(STORAGE_KEYS.CUSTOM_EQUIPMENTS, filtered)
	} catch (error) {
		console.error('Error deleting user equipment:', error)
	}
}

/**
 * ユーザーカスタム装備名を変更
 */
export const renameUserEquipment = (id: string, newName: string): void => {
	updateUserEquipment(id, { name: newName.trim() })
}

/**
 * ユーザーカスタム装備のお気に入り状態を切り替え
 */
export const toggleEquipmentFavorite = (id: string): void => {
	const equipment = getUserEquipmentById(id)
	if (equipment) {
		updateUserEquipment(id, { isFavorite: !equipment.isFavorite })
	}
}

/**
 * ユーザーカスタム装備を複製
 */
export const duplicateUserEquipment = (
	id: string,
	newName?: string,
): string => {
	const equipment = getUserEquipmentById(id)
	if (!equipment) {
		throw new Error('Equipment not found')
	}

	const newId = `${equipment.id}_copy_${Date.now()}`
	const duplicatedEquipment: Omit<UserEquipment, 'createdAt' | 'updatedAt'> = {
		...equipment,
		id: newId,
		name: newName || `${equipment.name} (コピー)`,
		isFavorite: false,
	}

	saveUserEquipment(duplicatedEquipment)
	return newId
}

/**
 * カスタム装備を検索
 */
export const searchUserEquipments = (
	query: string,
	category?: EquipmentCategory,
): UserEquipment[] => {
	let equipments = getUserEquipments()

	if (category) {
		equipments = equipments.filter((e) => e.category === category)
	}

	if (query.trim()) {
		const searchTerm = query.trim().toLowerCase()
		equipments = equipments.filter((e) =>
			e.name.toLowerCase().includes(searchTerm),
		)
	}

	return equipments
}

/**
 * お気に入りカスタム装備を取得
 */
export const getFavoriteUserEquipments = (): UserEquipment[] => {
	return getUserEquipments().filter((e) => e.isFavorite)
}
