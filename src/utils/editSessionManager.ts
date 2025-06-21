// 編集セッション管理システム
// 既存カスタム装備の編集時に一時的な変更をメモリ上で管理

import type {
	EquipmentProperties,
	UserEquipment,
} from '@/types/calculator'

// 編集セッションを格納するメモリストレージ
const editSessions: Map<string, UserEquipment> = new Map()
let lastCleanup: Date = new Date()

/**
 * 既存カスタム装備の編集セッションを開始
 * 永続データをベースに編集用のコピーを作成
 */
export function startEditSession(
	equipment: UserEquipment,
): UserEquipment {
	// 永続データのディープコピーを作成
	const editableEquipment: UserEquipment = {
		...equipment,
		properties: { ...equipment.properties },
		weaponStats: equipment.weaponStats ? { ...equipment.weaponStats } : undefined,
		crystalSlots: equipment.crystalSlots ? { ...equipment.crystalSlots } : undefined,
		updatedAt: new Date().toISOString(),
	}

	// 編集セッションに保存
	editSessions.set(equipment.id, editableEquipment)

	return editableEquipment
}

/**
 * 編集セッション中の装備のプロパティを更新
 */
export function updateEditSessionProperties(
	id: string,
	properties: Partial<EquipmentProperties>,
): boolean {
	const sessionEquipment = editSessions.get(id)
	if (!sessionEquipment) {
		return false
	}

	// プロパティを更新
	sessionEquipment.properties = {
		...sessionEquipment.properties,
		...properties,
	}
	sessionEquipment.updatedAt = new Date().toISOString()

	editSessions.set(id, sessionEquipment)
	return true
}

/**
 * 編集セッション中かどうかを判定
 */
export function isInEditSession(id: string): boolean {
	return editSessions.has(id)
}

/**
 * 編集セッション中の装備を取得
 */
export function getEditSessionEquipment(
	id: string,
): UserEquipment | undefined {
	return editSessions.get(id)
}

/**
 * すべての編集セッション装備を取得
 */
export function getAllEditSessionEquipments(): UserEquipment[] {
	return Array.from(editSessions.values())
}

/**
 * 編集セッションを終了（破棄）
 */
export function endEditSession(id: string): boolean {
	return editSessions.delete(id)
}

/**
 * すべての編集セッションをクリーンアップ
 * セーブデータ切り替えやブラウザリロード時に呼び出し
 */
export function cleanupAllEditSessions(): void {
	editSessions.clear()
	lastCleanup = new Date()
}

/**
 * 編集セッションの統計情報を取得
 */
export function getEditSessionStats(): {
	count: number
	lastCleanup: Date
	hasUnsavedEdits: boolean
} {
	return {
		count: editSessions.size,
		lastCleanup,
		hasUnsavedEdits: editSessions.size > 0,
	}
}

/**
 * 編集セッション中の装備IDリストを取得
 */
export function getEditSessionIds(): string[] {
	return Array.from(editSessions.keys())
}

/**
 * 指定した編集セッションの装備を永続データ用に変換
 * セーブ時に呼び出される
 */
export function convertEditSessionToPersistent(
	id: string,
): UserEquipment | null {
	const editSessionEquipment = editSessions.get(id)
	if (!editSessionEquipment) {
		return null
	}

	// 編集内容を永続データ形式に変換
	const persistentEquipment: UserEquipment = {
		...editSessionEquipment,
		updatedAt: new Date().toISOString(),
	}

	return persistentEquipment
}

/**
 * すべての編集セッションを永続データに変換
 * 一括保存時に使用
 */
export function convertAllEditSessionsToPersistent(): UserEquipment[] {
	const persistentEquipments: UserEquipment[] = []

	for (const [id, sessionEquipment] of editSessions) {
		persistentEquipments.push({
			...sessionEquipment,
			updatedAt: new Date().toISOString(),
		})
	}

	return persistentEquipments
}

/**
 * 編集セッション中の装備の武器ステータスを更新
 */
export function updateEditSessionWeaponStats(
	id: string,
	weaponStats: { ATK?: number; stability?: number; refinement?: number },
): boolean {
	const sessionEquipment = editSessions.get(id)
	if (!sessionEquipment || !sessionEquipment.weaponStats) {
		return false
	}

	sessionEquipment.weaponStats = {
		...sessionEquipment.weaponStats,
		...weaponStats,
	}
	sessionEquipment.updatedAt = new Date().toISOString()

	editSessions.set(id, sessionEquipment)
	return true
}

/**
 * 編集セッション中の装備のクリスタルスロットを更新
 */
export function updateEditSessionCrystalSlots(
	id: string,
	crystalSlots: { slot1?: string; slot2?: string },
): boolean {
	const sessionEquipment = editSessions.get(id)
	if (!sessionEquipment || !sessionEquipment.crystalSlots) {
		return false
	}

	sessionEquipment.crystalSlots = {
		...sessionEquipment.crystalSlots,
		...crystalSlots,
	}
	sessionEquipment.updatedAt = new Date().toISOString()

	editSessions.set(id, sessionEquipment)
	return true
}