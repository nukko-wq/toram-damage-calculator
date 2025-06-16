import type { PresetCrystal, CrystalType } from '@/types/calculator'
import crystalsData from '@/data/crystals.json'

// プリセットクリスタデータを正規化
const presetCrystals: PresetCrystal[] = [
	...crystalsData.weapon.map(crystal => ({ ...crystal, type: 'weapon' as CrystalType })),
	...crystalsData.armor.map(crystal => ({ ...crystal, type: 'armor' as CrystalType })),
	...crystalsData.additional.map(crystal => ({ ...crystal, type: 'additional' as CrystalType })),
	...crystalsData.special.map(crystal => ({ ...crystal, type: 'special' as CrystalType })),
]

// LocalStorage管理のキー
const USER_CRYSTALS_KEY = 'toram_user_crystals'

// ユーザーカスタムクリスタの型
interface UserCrystal extends PresetCrystal {
	isCustom: true
	createdAt: string
	updatedAt: string
}

// ユーザーカスタムクリスタをLocalStorageから取得
export const getUserCrystals = (): UserCrystal[] => {
	if (typeof window === 'undefined') return []
	
	try {
		const stored = localStorage.getItem(USER_CRYSTALS_KEY)
		return stored ? JSON.parse(stored) : []
	} catch (error) {
		console.error('Error loading user crystals:', error)
		return []
	}
}

// ユーザーカスタムクリスタをLocalStorageに保存
export const saveUserCrystal = (crystal: Omit<UserCrystal, 'isCustom' | 'createdAt' | 'updatedAt'>): void => {
	if (typeof window === 'undefined') return
	
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
		
		localStorage.setItem(USER_CRYSTALS_KEY, JSON.stringify(userCrystals))
	} catch (error) {
		console.error('Error saving user crystal:', error)
	}
}

// ユーザーカスタムクリスタを削除
export const deleteUserCrystal = (id: string): void => {
	if (typeof window === 'undefined') return
	
	try {
		const userCrystals = getUserCrystals()
		const filtered = userCrystals.filter(c => c.id !== id)
		localStorage.setItem(USER_CRYSTALS_KEY, JSON.stringify(filtered))
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

// ユーザーデータをエクスポート
export const exportUserCrystals = (): string => {
	return JSON.stringify(getUserCrystals(), null, 2)
}

// ユーザーデータをインポート
export const importUserCrystals = (jsonData: string): boolean => {
	try {
		const crystals = JSON.parse(jsonData) as UserCrystal[]
		
		// 簡単なバリデーション
		if (!Array.isArray(crystals)) {
			throw new Error('Invalid data format')
		}
		
		localStorage.setItem(USER_CRYSTALS_KEY, JSON.stringify(crystals))
		return true
	} catch (error) {
		console.error('Error importing user crystals:', error)
		return false
	}
}