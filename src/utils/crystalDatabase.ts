import type {
	PresetCrystal,
	LocalStorageCrystal,
	Crystal,
	CrystalType,
	UserCrystal,
} from '@/types/calculator'
import { StorageHelper, STORAGE_KEYS } from './storage'
import crystalsData from '@/data/crystals.json'

// ストレージキー
const NEW_STORAGE_KEYS = {
	PRESET_CRYSTALS: 'toram_preset_crystals',
	CUSTOM_CRYSTALS: 'toram_custom_crystals',
} as const

// プリセットクリスタデータを正規化（JSONデータをそのまま使用）- 後方互換性のため保持
const presetCrystals: PresetCrystal[] = [
	...crystalsData.crystals.weapon.map((crystal) => ({
		...crystal,
		type: 'weapon' as CrystalType,
	})),
	...crystalsData.crystals.armor.map((crystal) => ({
		...crystal,
		type: 'armor' as CrystalType,
	})),
	...crystalsData.crystals.additional.map((crystal) => ({
		...crystal,
		type: 'additional' as CrystalType,
	})),
	...crystalsData.crystals.special.map((crystal) => ({
		...crystal,
		type: 'special' as CrystalType,
	})),
	...crystalsData.crystals.normal.map((crystal) => ({
		...crystal,
		type: 'normal' as CrystalType,
	})),
]

// ローカルストレージからプリセットクリスタルを取得（新システム）
export function getLocalStorageCrystals(): LocalStorageCrystal[] {
	try {
		const stored = localStorage.getItem(NEW_STORAGE_KEYS.PRESET_CRYSTALS)
		return stored ? JSON.parse(stored) : []
	} catch (error) {
		console.error('Failed to load preset crystals from localStorage:', error)
		return []
	}
}

// ユーザーカスタムクリスタをLocalStorageから取得
export const getUserCrystals = (): UserCrystal[] => {
	return StorageHelper.get<UserCrystal[]>(STORAGE_KEYS.CUSTOM_CRYSTALS, [])
}

// プリセットクリスタルのお気に入り状態を更新（新システム）
export function togglePresetCrystalFavorite(id: string): void {
	try {
		const presetCrystals = getLocalStorageCrystals()
		const index = presetCrystals.findIndex((item) => item.id === id)

		if (index >= 0) {
			presetCrystals[index].isFavorite = !presetCrystals[index].isFavorite
			presetCrystals[index].isModified = true
			presetCrystals[index].modifiedAt = new Date().toISOString()
			presetCrystals[index].updatedAt = new Date().toISOString()

			localStorage.setItem(
				NEW_STORAGE_KEYS.PRESET_CRYSTALS,
				JSON.stringify(presetCrystals),
			)
		}
	} catch (error) {
		console.error('Failed to toggle preset crystal favorite:', error)
	}
}

// プリセットクリスタルのプロパティを更新（新システム）
export function updatePresetCrystal(
	id: string,
	updates: Partial<LocalStorageCrystal>,
): void {
	try {
		const presetCrystals = getLocalStorageCrystals()
		const index = presetCrystals.findIndex((item) => item.id === id)

		if (index >= 0) {
			presetCrystals[index] = {
				...presetCrystals[index],
				...updates,
				isModified: true,
				modifiedAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}

			localStorage.setItem(
				NEW_STORAGE_KEYS.PRESET_CRYSTALS,
				JSON.stringify(presetCrystals),
			)
		}
	} catch (error) {
		console.error('Failed to update preset crystal:', error)
	}
}

// IDでユーザーカスタムクリスタルを取得
export const getUserCrystalById = (id: string): UserCrystal | undefined => {
	return getUserCrystals().find((crystal) => crystal.id === id)
}

// タイプ別にユーザーカスタムクリスタルを取得
export const getUserCrystalsByType = (type: CrystalType): UserCrystal[] => {
	return getUserCrystals().filter((crystal) => crystal.type === type)
}

// ユーザーカスタムクリスタルを更新
export const updateUserCrystal = (
	id: string,
	updates: Partial<UserCrystal>,
): void => {
	try {
		const userCrystals = getUserCrystals()
		const index = userCrystals.findIndex((c) => c.id === id)

		if (index >= 0) {
			userCrystals[index] = {
				...userCrystals[index],
				...updates,
				updatedAt: new Date().toISOString(),
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
	const duplicatedCrystal: Omit<
		UserCrystal,
		'isCustom' | 'createdAt' | 'updatedAt'
	> = {
		...crystal,
		id: newId,
		name: newName || `${crystal.name} (コピー)`,
		isFavorite: false,
	}

	saveUserCrystal(duplicatedCrystal)
	return newId
}

// ユーザーカスタムクリスタをLocalStorageに保存
export const saveUserCrystal = (
	crystal: Omit<UserCrystal, 'isCustom' | 'createdAt' | 'updatedAt'>,
): void => {
	try {
		const userCrystals = getUserCrystals()
		const now = new Date().toISOString()

		const existingIndex = userCrystals.findIndex((c) => c.id === crystal.id)

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
		const filtered = userCrystals.filter((c) => c.id !== id)
		StorageHelper.set(STORAGE_KEYS.CUSTOM_CRYSTALS, filtered)
	} catch (error) {
		console.error('Error deleting user crystal:', error)
	}
}

// すべてのクリスタ（プリセット + ユーザーカスタム）を取得（新システム）
export const getAllCrystals = (): Crystal[] => {
	const presetCrystals = getLocalStorageCrystals()
	const customCrystals = getUserCrystals()

	// カスタムクリスタルをCustomCrystal形式に変換
	const formattedCustomCrystals: Crystal[] = customCrystals.map((crystal) => ({
		...crystal,
		isPreset: false as const,
		isCustom: true as const,
		isFavorite: crystal.isFavorite || false,
		isModified: false,
		createdAt: crystal.createdAt || new Date().toISOString(),
		updatedAt: crystal.updatedAt || new Date().toISOString(),
	}))

	return [...presetCrystals, ...formattedCustomCrystals]
}

// すべてのクリスタ（プリセット + ユーザーカスタム）を取得（後方互換性）
export const getAllCrystalsLegacy = (): (PresetCrystal | UserCrystal)[] => {
	return [...presetCrystals, ...getUserCrystals()]
}

// タイプ別にクリスタを取得（新システム）
export const getCrystalsByType = (type: CrystalType): Crystal[] => {
	return getAllCrystals().filter((crystal) => crystal.type === type)
}

// IDでクリスタを取得（新システム）
export const getCrystalById = (id: string): Crystal | undefined => {
	return getAllCrystals().find((crystal) => crystal.id === id)
}

// プリセットクリスタのみを取得（新システム）
export const getPresetCrystals = (): LocalStorageCrystal[] => {
	return getLocalStorageCrystals()
}

// プリセットクリスタのみを取得（後方互換性）
export const getPresetCrystalsLegacy = (): PresetCrystal[] => {
	return presetCrystals
}

// クリスタが存在するかチェック（新システム）
export const crystalExists = (id: string): boolean => {
	return getAllCrystals().some((crystal) => crystal.id === id)
}
