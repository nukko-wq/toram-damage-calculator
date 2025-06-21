// 編集セッション管理システム
// 既存カスタム装備の編集時に一時的な変更をメモリ上で管理

import type {
	EquipmentProperties,
	UserEquipment,
} from '@/types/calculator'

// 編集セッションを格納するメモリストレージ（セーブデータID + 装備IDの組み合わせをキーとする）
const editSessions: Map<string, UserEquipment> = new Map()
let lastCleanup: Date = new Date()
let currentSaveDataId: string | null = null

/**
 * 現在のセーブデータIDを設定
 */
export function setCurrentSaveDataId(saveDataId: string | null): void {
	currentSaveDataId = saveDataId
}

/**
 * セーブデータと装備の組み合わせキーを生成
 */
function createSessionKey(equipmentId: string, saveDataId?: string): string {
	const effectiveSaveDataId = saveDataId || currentSaveDataId || 'default'
	return `${effectiveSaveDataId}:${equipmentId}`
}

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

	// セーブデータ固有のキーで編集セッションに保存
	const sessionKey = createSessionKey(equipment.id)
	editSessions.set(sessionKey, editableEquipment)

	return editableEquipment
}

/**
 * 編集セッション中の装備のプロパティを更新
 */
export function updateEditSessionProperties(
	id: string,
	properties: Partial<EquipmentProperties>,
): boolean {
	const sessionKey = createSessionKey(id)
	const sessionEquipment = editSessions.get(sessionKey)
	if (!sessionEquipment) {
		return false
	}

	// プロパティを更新
	sessionEquipment.properties = {
		...sessionEquipment.properties,
		...properties,
	}
	sessionEquipment.updatedAt = new Date().toISOString()

	editSessions.set(sessionKey, sessionEquipment)
	return true
}

/**
 * 編集セッション中かどうかを判定
 */
export function isInEditSession(id: string): boolean {
	const sessionKey = createSessionKey(id)
	return editSessions.has(sessionKey)
}

/**
 * 編集セッション中の装備を取得
 */
export function getEditSessionEquipment(
	id: string,
): UserEquipment | undefined {
	const sessionKey = createSessionKey(id)
	return editSessions.get(sessionKey)
}

/**
 * 現在のセーブデータに関連する編集セッション装備を取得
 */
export function getAllEditSessionEquipments(): UserEquipment[] {
	if (!currentSaveDataId) {
		return []
	}
	
	const currentSavePrefix = `${currentSaveDataId}:`
	const results: UserEquipment[] = []
	
	for (const [sessionKey, equipment] of editSessions) {
		if (sessionKey.startsWith(currentSavePrefix)) {
			results.push(equipment)
		}
	}
	
	return results
}

/**
 * 編集セッションを終了（破棄）
 */
export function endEditSession(id: string): boolean {
	const sessionKey = createSessionKey(id)
	return editSessions.delete(sessionKey)
}

/**
 * 特定のセーブデータに関連する編集セッションをクリーンアップ
 */
export function cleanupEditSessionsForSaveData(saveDataId: string): void {
	const keysToDelete: string[] = []
	
	for (const [sessionKey] of editSessions) {
		if (sessionKey.startsWith(`${saveDataId}:`)) {
			keysToDelete.push(sessionKey)
		}
	}
	
	for (const key of keysToDelete) {
		editSessions.delete(key)
	}
}

/**
 * 現在のセーブデータに関連する編集セッションをクリーンアップ
 */
export function cleanupCurrentEditSessions(): void {
	if (currentSaveDataId) {
		cleanupEditSessionsForSaveData(currentSaveDataId)
	}
}

/**
 * すべての編集セッションをクリーンアップ
 * ブラウザリロード時などに呼び出し
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
	const sessionKey = createSessionKey(id)
	const editSessionEquipment = editSessions.get(sessionKey)
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

	// 現在のセーブデータに関連する編集セッションのみを永続化
	const currentEditSessions = getAllEditSessionEquipments()
	
	for (const sessionEquipment of currentEditSessions) {
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
	const sessionKey = createSessionKey(id)
	const sessionEquipment = editSessions.get(sessionKey)
	if (!sessionEquipment || !sessionEquipment.weaponStats) {
		return false
	}

	sessionEquipment.weaponStats = {
		...sessionEquipment.weaponStats,
		...weaponStats,
	}
	sessionEquipment.updatedAt = new Date().toISOString()

	editSessions.set(sessionKey, sessionEquipment)
	return true
}

/**
 * 編集セッション中の装備のクリスタルスロットを更新
 */
export function updateEditSessionCrystalSlots(
	id: string,
	crystalSlots: { slot1?: string; slot2?: string },
): boolean {
	const sessionKey = createSessionKey(id)
	const sessionEquipment = editSessions.get(sessionKey)
	if (!sessionEquipment || !sessionEquipment.crystalSlots) {
		return false
	}

	sessionEquipment.crystalSlots = {
		...sessionEquipment.crystalSlots,
		...crystalSlots,
	}
	sessionEquipment.updatedAt = new Date().toISOString()

	editSessions.set(sessionKey, sessionEquipment)
	return true
}