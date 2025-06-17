import type { PresetCrystal, CrystalType, UserCrystal } from '@/types/calculator'
import { StorageHelper, STORAGE_KEYS } from './storage'
import crystalsData from '@/data/crystals.json'

// プリセットクリスタデータを正規化（JSONデータをそのまま使用）
const presetCrystals: PresetCrystal[] = [
	...crystalsData.crystals.weapon.map(crystal => ({ 
		...crystal, 
		type: 'weapon' as CrystalType
	})),
	...crystalsData.crystals.armor.map(crystal => ({ 
		...crystal, 
		type: 'armor' as CrystalType
	})),
	...crystalsData.crystals.additional.map(crystal => ({ 
		...crystal, 
		type: 'additional' as CrystalType
	})),
	...crystalsData.crystals.special.map(crystal => ({ 
		...crystal, 
		type: 'special' as CrystalType
	})),
	...crystalsData.crystals.normal.map(crystal => ({ 
		...crystal, 
		type: 'normal' as CrystalType
	})),
]

// ユーザーカスタムクリスタをLocalStorageから取得
export const getUserCrystals = (): UserCrystal[] => {
	return StorageHelper.get<UserCrystal[]>(STORAGE_KEYS.CUSTOM_CRYSTALS, [])
}

// IDでユーザーカスタムクリスタルを取得
export const getUserCrystalById = (id: string): UserCrystal | undefined => {
	return getUserCrystals().find(crystal => crystal.id === id)
}

// タイプ別にユーザーカスタムクリスタルを取得
export const getUserCrystalsByType = (type: CrystalType): UserCrystal[] => {
	return getUserCrystals().filter(crystal => crystal.type === type)
}

// ユーザーカスタムクリスタルを更新
export const updateUserCrystal = (id: string, updates: Partial<UserCrystal>): void => {
	try {
		const userCrystals = getUserCrystals()
		const index = userCrystals.findIndex(c => c.id === id)
		
		if (index >= 0) {
			userCrystals[index] = {
				...userCrystals[index],
				...updates,
				updatedAt: new Date().toISOString()
			}
			StorageHelper.set(STORAGE_KEYS.CUSTOM_CRYSTALS, userCrystals)
		}
	} catch (error) {
		console.error('Error updating user crystal:', error)
	}
}

// ユーザーカスタムクリスタル名を変更
export const renameUserCrystal = (id: string, newName: string): void => {
	updateUserCrystal(id, { name: newName.trim() })
}

// ユーザーカスタムクリスタルのお気に入り状態を切り替え
export const toggleCrystalFavorite = (id: string): void => {
	const crystal = getUserCrystalById(id)
	if (crystal) {
		updateUserCrystal(id, { isFavorite: !crystal.isFavorite })
	}
}

// ユーザーカスタムクリスタルを複製
export const duplicateUserCrystal = (id: string, newName?: string): string => {
	const crystal = getUserCrystalById(id)
	if (!crystal) {
		throw new Error('Crystal not found')
	}
	
	const newId = `${crystal.id}_copy_${Date.now()}`
	const duplicatedCrystal: Omit<UserCrystal, 'isCustom' | 'createdAt' | 'updatedAt'> = {
		...crystal,
		id: newId,
		name: newName || `${crystal.name} (コピー)`,
		isFavorite: false
	}
	
	saveUserCrystal(duplicatedCrystal)
	return newId
}

// ユーザーカスタムクリスタをLocalStorageに保存
export const saveUserCrystal = (crystal: Omit<UserCrystal, 'isCustom' | 'createdAt' | 'updatedAt'>): void => {
	try {
		const userCrystals = getUserCrystals()
		const now = new Date().toISOString()
		
		const existingIndex = userCrystals.findIndex(c => c.id === crystal.id)
		
		if (existingIndex >= 0) {
			// 既存のクリスタを更新
			userCrystals[existingIndex] = {
				...crystal,
				isCustom: true,
				createdAt: userCrystals[existingIndex].createdAt,
				updatedAt: now,
			}
		} else {
			// 新しいクリスタを追加
			userCrystals.push({
				...crystal,
				isCustom: true,
				createdAt: now,
				updatedAt: now,
			})
		}
		
		StorageHelper.set(STORAGE_KEYS.CUSTOM_CRYSTALS, userCrystals)
	} catch (error) {
		console.error('Error saving user crystal:', error)
	}
}

// ユーザーカスタムクリスタを削除
export const deleteUserCrystal = (id: string): void => {
	try {
		const userCrystals = getUserCrystals()
		const filtered = userCrystals.filter(c => c.id !== id)
		StorageHelper.set(STORAGE_KEYS.CUSTOM_CRYSTALS, filtered)
	} catch (error) {
		console.error('Error deleting user crystal:', error)
	}
}

// すべてのクリスタ（プリセット + ユーザーカスタム）を取得
export const getAllCrystals = (): (PresetCrystal | UserCrystal)[] => {
	return [...presetCrystals, ...getUserCrystals()]
}

// タイプ別にクリスタを取得
export const getCrystalsByType = (type: CrystalType): (PresetCrystal | UserCrystal)[] => {
	return getAllCrystals().filter(crystal => crystal.type === type)
}

// IDでクリスタを取得
export const getCrystalById = (id: string): (PresetCrystal | UserCrystal) | undefined => {
	return getAllCrystals().find(crystal => crystal.id === id)
}

// プリセットクリスタのみを取得
export const getPresetCrystals = (): PresetCrystal[] => {
	return presetCrystals
}

// クリスタが存在するかチェック
export const crystalExists = (id: string): boolean => {
	return getAllCrystals().some(crystal => crystal.id === id)
}

