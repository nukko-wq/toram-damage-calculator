// 仮データ管理システム
// カスタム装備の新規作成時に一時的なデータをメモリ上で管理

import type {
	EquipmentCategory,
	EquipmentProperties,
	UserEquipment,
} from '@/types/calculator'

// 仮データを格納するメモリストレージ
const temporaryEquipments: Map<string, UserEquipment> = new Map()
let lastCleanup: Date = new Date()

/**
 * 仮データとして新しいカスタム装備を作成
 * LocalStorageには保存せず、メモリ上で管理
 */
export function createTemporaryCustomEquipment(
	name: string,
	category: EquipmentCategory,
): UserEquipment {
	const now = new Date().toISOString()
	const id = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`

	const temporaryEquipment: UserEquipment = {
		id,
		name,
		category,
		properties: {}, // 全プロパティをリセット状態で作成
		// weaponStatsは使用せず、weaponInfoStorageで管理するため削除
		crystalSlots: ['mainWeapon', 'body', 'additional', 'special'].includes(
			category,
		)
			? {
					slot1: undefined,
					slot2: undefined,
				}
			: undefined,
		createdAt: now,
		updatedAt: now,
		isFavorite: false,
	}

	// メモリ上に保存
	temporaryEquipments.set(id, temporaryEquipment)

	// 武器系装備（メイン・サブ）の場合は初期武器情報をweaponInfoStorageに保存
	if (category === 'mainWeapon' || category === 'subWeapon') {
		const { saveWeaponInfo } = require('./weaponInfoStorage')
		saveWeaponInfo(id, 0, 0, 0)
	}

	return temporaryEquipment
}

/**
 * 仮データ装備のプロパティを更新
 */
export function updateTemporaryEquipmentProperties(
	id: string,
	properties: Partial<EquipmentProperties>,
): boolean {
	const equipment = temporaryEquipments.get(id)
	if (!equipment) {
		return false
	}

	// プロパティを更新
	equipment.properties = {
		...equipment.properties,
		...properties,
	}
	equipment.updatedAt = new Date().toISOString()

	temporaryEquipments.set(id, equipment)
	return true
}

/**
 * 仮データ装備の精錬値を更新
 */
export function updateTemporaryEquipmentRefinement(
	id: string,
	refinement: number,
): boolean {
	const equipment = temporaryEquipments.get(id)
	if (!equipment) {
		return false
	}

	// 精錬値をweaponInfoStorageで更新
	const { saveWeaponInfo, getWeaponInfo } = require('./weaponInfoStorage')
	const currentWeaponInfo = getWeaponInfo(id)
	const success = saveWeaponInfo(
		id,
		currentWeaponInfo?.ATK || 0,
		currentWeaponInfo?.stability || 0,
		refinement,
	)

	if (success) {
		equipment.updatedAt = new Date().toISOString()
		temporaryEquipments.set(id, equipment)
	}

	return success
}

/**
 * 仮データ装備の名前を更新
 */
export function updateTemporaryEquipmentName(
	id: string,
	newName: string,
): boolean {
	const equipment = temporaryEquipments.get(id)
	if (!equipment) {
		return false
	}

	// 名前を更新
	equipment.name = newName
	equipment.updatedAt = new Date().toISOString()

	temporaryEquipments.set(id, equipment)
	return true
}

/**
 * 仮データかどうかを判定
 */
export function isTemporaryEquipment(id: string): boolean {
	return id.startsWith('temp_') && temporaryEquipments.has(id)
}

/**
 * 仮データ装備を取得
 */
export function getTemporaryEquipmentById(
	id: string,
): UserEquipment | undefined {
	return temporaryEquipments.get(id)
}

/**
 * すべての仮データ装備を取得
 */
export function getAllTemporaryEquipments(): UserEquipment[] {
	return Array.from(temporaryEquipments.values())
}

/**
 * カテゴリ別の仮データ装備を取得
 */
export function getTemporaryEquipmentsByCategory(
	category: EquipmentCategory,
): UserEquipment[] {
	return Array.from(temporaryEquipments.values()).filter(
		(equipment) => equipment.category === category,
	)
}

/**
 * 仮データを削除
 */
export function deleteTemporaryEquipment(id: string): boolean {
	return temporaryEquipments.delete(id)
}

/**
 * すべての仮データをクリーンアップ
 * セーブデータ切り替えやブラウザリロード時に呼び出し
 */
export function cleanupAllTemporaryEquipments(): void {
	temporaryEquipments.clear()
	lastCleanup = new Date()
}

/**
 * 仮データの統計情報を取得
 */
export function getTemporaryEquipmentStats(): {
	count: number
	lastCleanup: Date
	hasUnsavedData: boolean
} {
	return {
		count: temporaryEquipments.size,
		lastCleanup,
		hasUnsavedData: temporaryEquipments.size > 0,
	}
}

/**
 * 仮データのIDリストを取得
 */
export function getTemporaryEquipmentIds(): string[] {
	return Array.from(temporaryEquipments.keys())
}

/**
 * 指定した仮データをLocalStorage用の永続データに変換
 * セーブ時に呼び出される
 */
export function convertTemporaryEquipmentToPersistent(
	id: string,
): UserEquipment | null {
	const tempEquipment = temporaryEquipments.get(id)
	if (!tempEquipment) {
		return null
	}

	// 仮データから永続データに変換（IDを永続形式に変更）
	const persistentId = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`

	const persistentEquipment: UserEquipment = {
		...tempEquipment,
		id: persistentId,
		updatedAt: new Date().toISOString(),
	}

	return persistentEquipment
}
