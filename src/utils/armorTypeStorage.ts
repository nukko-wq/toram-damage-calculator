// 防具改造タイプ専用のLocalStorage管理システム
// プリセット装備とカスタム装備の両方で防具改造タイプをオーバーレイ保存

interface ArmorTypeInfo {
	armorType: import('@/types/calculator').ArmorType
	updatedAt: string
}

interface ArmorTypeStorage {
	[equipmentId: string]: ArmorTypeInfo
}

const ARMOR_TYPE_STORAGE_KEY = 'toram_armor_type_overrides'

/**
 * 装備IDに紐づけて防具改造タイプを保存
 */
export function saveArmorType(
	equipmentId: string,
	armorType: import('@/types/calculator').ArmorType,
): boolean {
	try {
		const storage = getArmorTypeStorage()
		const armorTypeInfo: ArmorTypeInfo = {
			armorType,
			updatedAt: new Date().toISOString(),
		}

		storage[equipmentId] = armorTypeInfo
		localStorage.setItem(ARMOR_TYPE_STORAGE_KEY, JSON.stringify(storage))
		return true
	} catch (error) {
		console.error('防具改造タイプ保存エラー:', error)
		return false
	}
}

/**
 * 装備IDに紐づけられた防具改造タイプを取得
 */
export function getArmorType(equipmentId: string): import('@/types/calculator').ArmorType | null {
	try {
		const storage = getArmorTypeStorage()
		const armorTypeInfo = storage[equipmentId]
		return armorTypeInfo ? armorTypeInfo.armorType : null
	} catch (error) {
		console.error('防具改造タイプ取得エラー:', error)
		return null
	}
}

/**
 * 装備IDに紐づけられた防具改造タイプを削除
 */
export function deleteArmorType(equipmentId: string): boolean {
	try {
		const storage = getArmorTypeStorage()
		if (equipmentId in storage) {
			delete storage[equipmentId]
			localStorage.setItem(ARMOR_TYPE_STORAGE_KEY, JSON.stringify(storage))
			return true
		}
		return false
	} catch (error) {
		console.error('防具改造タイプ削除エラー:', error)
		return false
	}
}

/**
 * 装備IDに防具改造タイプが保存されているかを確認
 */
export function hasArmorType(equipmentId: string): boolean {
	try {
		const storage = getArmorTypeStorage()
		return equipmentId in storage
	} catch (error) {
		console.error('防具改造タイプ確認エラー:', error)
		return false
	}
}

/**
 * 全ての防具改造タイプ情報を取得
 */
export function getAllArmorType(): ArmorTypeStorage {
	return getArmorTypeStorage()
}

/**
 * 防具改造タイプストレージを初期化（開発・デバッグ用）
 */
export function clearAllArmorType(): boolean {
	try {
		localStorage.removeItem(ARMOR_TYPE_STORAGE_KEY)
		return true
	} catch (error) {
		console.error('防具改造タイプ初期化エラー:', error)
		return false
	}
}

/**
 * LocalStorageから防具改造タイプストレージを取得
 */
function getArmorTypeStorage(): ArmorTypeStorage {
	try {
		const stored = localStorage.getItem(ARMOR_TYPE_STORAGE_KEY)
		return stored ? JSON.parse(stored) : {}
	} catch (error) {
		console.error('防具改造タイプストレージ取得エラー:', error)
		return {}
	}
}

/**
 * 防具改造タイプをクリア（完全削除）
 */
export function clearArmorType(equipmentId: string): boolean {
	return deleteArmorType(equipmentId)
}

/**
 * 装備に防具改造タイプをオーバーレイする関数（equipmentDatabaseで使用）
 */
export function applyArmorTypeOverlay<T extends { id: string; armorType?: import('@/types/calculator').ArmorType }>(
	equipment: T
): T {
	const armorType = getArmorType(equipment.id)
	if (armorType) {
		return {
			...equipment,
			armorType,
		}
	}
	return equipment
}