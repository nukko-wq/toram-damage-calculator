// 装備クリスタ連携専用のLocalStorage管理システム
// 装備IDとクリスタスロットの組み合わせでクリスタIDを保存

import { safeJSONParse } from './storage'

interface CrystalInfo {
	crystalId: string
	updatedAt: string
}

interface CrystalInfoStorage {
	[equipmentCrystalKey: string]: CrystalInfo
}

const EQUIPMENT_CRYSTAL_STORAGE_KEY = 'toram_equipment_crystal_associations'

/**
 * 装備クリスタ連携キーを生成
 */
function generateCrystalKey(equipmentId: string, slotNumber: 1 | 2): string {
	return `equipment_crystal_${equipmentId}_slot${slotNumber}`
}

/**
 * 装備IDとスロット番号に紐づけてクリスタIDを保存
 */
export function saveEquipmentCrystal(
	equipmentId: string,
	slotNumber: 1 | 2,
	crystalId: string,
): boolean {
	try {
		const storage = getCrystalInfoStorage()
		const key = generateCrystalKey(equipmentId, slotNumber)

		const crystalInfo: CrystalInfo = {
			crystalId,
			updatedAt: new Date().toISOString(),
		}

		storage[key] = crystalInfo
		localStorage.setItem(EQUIPMENT_CRYSTAL_STORAGE_KEY, JSON.stringify(storage))
		return true
	} catch (error) {
		console.error('装備クリスタ情報保存エラー:', error)
		return false
	}
}

/**
 * 装備IDとスロット番号に紐づけられたクリスタIDを取得
 */
export function getEquipmentCrystal(
	equipmentId: string,
	slotNumber: 1 | 2,
): string | null {
	try {
		const storage = getCrystalInfoStorage()
		const key = generateCrystalKey(equipmentId, slotNumber)
		const crystalInfo = storage[key]
		return crystalInfo ? crystalInfo.crystalId : null
	} catch (error) {
		console.error('装備クリスタ情報取得エラー:', error)
		return null
	}
}

/**
 * 装備IDとスロット番号に紐づけられたクリスタ情報を削除
 */
export function deleteEquipmentCrystal(
	equipmentId: string,
	slotNumber: 1 | 2,
): boolean {
	try {
		const storage = getCrystalInfoStorage()
		const key = generateCrystalKey(equipmentId, slotNumber)

		if (key in storage) {
			delete storage[key]
			localStorage.setItem(
				EQUIPMENT_CRYSTAL_STORAGE_KEY,
				JSON.stringify(storage),
			)
			return true
		}
		return false
	} catch (error) {
		console.error('装備クリスタ情報削除エラー:', error)
		return false
	}
}

/**
 * 装備IDのすべてのクリスタ情報を取得
 */
export function getEquipmentAllCrystals(equipmentId: string): {
	slot1: string | null
	slot2: string | null
} {
	return {
		slot1: getEquipmentCrystal(equipmentId, 1),
		slot2: getEquipmentCrystal(equipmentId, 2),
	}
}

/**
 * 装備IDのすべてのクリスタ情報を削除
 */
export function deleteEquipmentAllCrystals(equipmentId: string): boolean {
	try {
		const slot1Success = deleteEquipmentCrystal(equipmentId, 1)
		const slot2Success = deleteEquipmentCrystal(equipmentId, 2)
		return slot1Success || slot2Success // 少なくとも1つが削除されれば成功
	} catch (error) {
		console.error('装備クリスタ情報全削除エラー:', error)
		return false
	}
}

/**
 * 装備IDとスロット番号にクリスタ情報が保存されているかを確認
 */
export function hasEquipmentCrystal(
	equipmentId: string,
	slotNumber: 1 | 2,
): boolean {
	try {
		const storage = getCrystalInfoStorage()
		const key = generateCrystalKey(equipmentId, slotNumber)
		return key in storage
	} catch (error) {
		console.error('装備クリスタ情報確認エラー:', error)
		return false
	}
}

/**
 * 全ての装備クリスタ情報を取得
 */
export function getAllEquipmentCrystals(): CrystalInfoStorage {
	return getCrystalInfoStorage()
}

/**
 * 装備クリスタ情報ストレージを初期化（開発・デバッグ用）
 */
export function clearAllEquipmentCrystals(): boolean {
	try {
		localStorage.removeItem(EQUIPMENT_CRYSTAL_STORAGE_KEY)
		return true
	} catch (error) {
		console.error('装備クリスタ情報初期化エラー:', error)
		return false
	}
}

/**
 * LocalStorageから装備クリスタ情報ストレージを取得
 */
function getCrystalInfoStorage(): CrystalInfoStorage {
	try {
		const stored = localStorage.getItem(EQUIPMENT_CRYSTAL_STORAGE_KEY)
		return stored ? safeJSONParse(stored, {}) : {}
	} catch (error) {
		console.error('装備クリスタ情報ストレージ取得エラー:', error)
		return {}
	}
}
