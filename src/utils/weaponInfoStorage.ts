// 武器情報専用のLocalStorage管理システム
// プリセット装備とカスタム装備の両方で武器情報をオーバーレイ保存

interface WeaponInfo {
	ATK: number
	stability: number
	refinement: number
	updatedAt: string
}

interface WeaponInfoStorage {
	[equipmentId: string]: WeaponInfo
}

const WEAPON_INFO_STORAGE_KEY = 'toram_weapon_info_overrides'

/**
 * 装備IDに紐づけて武器情報を保存
 */
export function saveWeaponInfo(
	equipmentId: string,
	ATK: number,
	stability: number,
	refinement: number,
): boolean {
	try {
		const storage = getWeaponInfoStorage()
		const weaponInfo: WeaponInfo = {
			ATK,
			stability,
			refinement,
			updatedAt: new Date().toISOString(),
		}

		storage[equipmentId] = weaponInfo
		localStorage.setItem(WEAPON_INFO_STORAGE_KEY, JSON.stringify(storage))
		return true
	} catch (error) {
		console.error('武器情報保存エラー:', error)
		return false
	}
}

/**
 * 装備IDに紐づけられた武器情報を取得
 */
export function getWeaponInfo(equipmentId: string): WeaponInfo | null {
	try {
		const storage = getWeaponInfoStorage()
		return storage[equipmentId] || null
	} catch (error) {
		console.error('武器情報取得エラー:', error)
		return null
	}
}

/**
 * 装備IDに紐づけられた武器情報を削除
 */
export function deleteWeaponInfo(equipmentId: string): boolean {
	try {
		const storage = getWeaponInfoStorage()
		if (equipmentId in storage) {
			delete storage[equipmentId]
			localStorage.setItem(WEAPON_INFO_STORAGE_KEY, JSON.stringify(storage))
			return true
		}
		return false
	} catch (error) {
		console.error('武器情報削除エラー:', error)
		return false
	}
}

/**
 * 装備IDに武器情報が保存されているかを確認
 */
export function hasWeaponInfo(equipmentId: string): boolean {
	try {
		const storage = getWeaponInfoStorage()
		return equipmentId in storage
	} catch (error) {
		console.error('武器情報確認エラー:', error)
		return false
	}
}

/**
 * 全ての武器情報を取得
 */
export function getAllWeaponInfo(): WeaponInfoStorage {
	return getWeaponInfoStorage()
}

/**
 * 武器情報ストレージを初期化（開発・デバッグ用）
 */
export function clearAllWeaponInfo(): boolean {
	try {
		localStorage.removeItem(WEAPON_INFO_STORAGE_KEY)
		return true
	} catch (error) {
		console.error('武器情報初期化エラー:', error)
		return false
	}
}

/**
 * LocalStorageから武器情報ストレージを取得
 */
function getWeaponInfoStorage(): WeaponInfoStorage {
	try {
		const stored = localStorage.getItem(WEAPON_INFO_STORAGE_KEY)
		return stored ? JSON.parse(stored) : {}
	} catch (error) {
		console.error('武器情報ストレージ取得エラー:', error)
		return {}
	}
}

/**
 * 武器情報をクリア（完全削除）
 */
export function clearWeaponInfo(equipmentId: string): boolean {
	return deleteWeaponInfo(equipmentId)
}

// 移行関数は削除済み - weaponInfoStorageで統一管理完了
