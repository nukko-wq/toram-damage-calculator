// セーブデータ管理システム

import { v4 as uuidv4 } from 'uuid'
import type {
	SaveData,
	DefaultSaveData,
	CalculatorData,
	DataValidation,
	UpdateNotification,
} from '@/types/calculator'
import { StorageHelper, STORAGE_KEYS } from './storage'
import { createInitialCalculatorData } from './initialData'
import { checkAndUpdatePresetData } from './presetVersionManager'

/**
 * 初期化・セットアップ（バージョン管理システム統合版）
 */
export async function initializeStorage(): Promise<UpdateNotification[]> {
	try {
		// ストレージが利用可能かチェック
		if (!StorageHelper.isAvailable()) {
			throw new Error('LocalStorage is not available')
		}

		// プリセットデータのバージョンチェック・更新
		const updateNotifications = await checkAndUpdatePresetData()

		// バージョンチェック・マイグレーション（将来実装）
		await checkStorageVersion()

		// メインデータの確保
		await ensureDefaultSaveData()

		// 現在のセーブデータ設定
		const currentSaveId = StorageHelper.get(STORAGE_KEYS.CURRENT_SAVE_ID, null)
		if (!currentSaveId) {
			StorageHelper.set(STORAGE_KEYS.CURRENT_SAVE_ID, 'default')
		}

		// データ整合性チェック
		const isValid = await validateStorageIntegrity()
		if (!isValid) {
			console.warn('Storage integrity validation failed, resetting to default')
			await resetToDefault()
		}

		return updateNotifications
	} catch (error) {
		console.error('ストレージ初期化エラー:', error)
		// フォールバック処理
		await resetToDefault()
		return []
	}
}

/**
 * デフォルトセーブデータを作成
 */
export function createDefaultSaveData(): DefaultSaveData {
	const now = new Date().toISOString()

	return {
		id: 'default',
		name: 'メインデータ',
		isDefault: true,
		createdAt: now,
		updatedAt: now,
		order: 0,
		data: createInitialCalculatorData(),
	}
}

/**
 * デフォルトセーブデータの存在を確認し、なければ作成
 */
export async function ensureDefaultSaveData(): Promise<DefaultSaveData> {
	const saveDataList = StorageHelper.get<SaveData[]>(
		STORAGE_KEYS.SAVE_DATA_LIST,
		[],
	)
	const defaultData = saveDataList.find(
		(save) => save.id === 'default',
	) as DefaultSaveData

	if (!defaultData) {
		const newDefaultData = createDefaultSaveData()
		saveDataList.unshift(newDefaultData) // 先頭に追加
		StorageHelper.set(STORAGE_KEYS.SAVE_DATA_LIST, saveDataList)
		return newDefaultData
	}

	return defaultData
}

/**
 * 新しいセーブデータを作成
 */
export async function createSaveData(
	name: string,
	currentData: CalculatorData,
): Promise<SaveData> {
	const saveDataList = StorageHelper.get<SaveData[]>(
		STORAGE_KEYS.SAVE_DATA_LIST,
		[],
	)
	const now = new Date().toISOString()

	const newSaveData: SaveData = {
		id: uuidv4(),
		name: name.trim(),
		isDefault: false,
		createdAt: now,
		updatedAt: now,
		order: saveDataList.length,
		data: { ...currentData },
	}

	saveDataList.push(newSaveData)
	StorageHelper.set(STORAGE_KEYS.SAVE_DATA_LIST, saveDataList)

	return newSaveData
}

/**
 * セーブデータを読み込み
 */
export async function loadSaveData(id: string): Promise<SaveData> {
	const saveDataList = StorageHelper.get<SaveData[]>(
		STORAGE_KEYS.SAVE_DATA_LIST,
		[],
	)
	const saveData = saveDataList.find((save) => save.id === id)

	if (!saveData) {
		throw new Error(`Save data with id ${id} not found`)
	}

	return saveData
}

/**
 * セーブデータを更新
 */
export async function updateSaveData(
	id: string,
	updates: Partial<SaveData>,
): Promise<void> {
	const saveDataList = StorageHelper.get<SaveData[]>(
		STORAGE_KEYS.SAVE_DATA_LIST,
		[],
	)
	const index = saveDataList.findIndex((save) => save.id === id)

	if (index === -1) {
		throw new Error(`Save data with id ${id} not found`)
	}

	saveDataList[index] = {
		...saveDataList[index],
		...updates,
		updatedAt: new Date().toISOString(),
	}

	StorageHelper.set(STORAGE_KEYS.SAVE_DATA_LIST, saveDataList)
}

/**
 * セーブデータを削除
 */
export async function deleteSaveData(id: string): Promise<void> {
	if (id === 'default') {
		throw new Error('Cannot delete default save data')
	}

	const saveDataList = StorageHelper.get<SaveData[]>(
		STORAGE_KEYS.SAVE_DATA_LIST,
		[],
	)
	const filteredList = saveDataList.filter((save) => save.id !== id)

	if (filteredList.length === saveDataList.length) {
		throw new Error(`Save data with id ${id} not found`)
	}

	StorageHelper.set(STORAGE_KEYS.SAVE_DATA_LIST, filteredList)

	// 削除したセーブデータが現在選択中の場合、デフォルトに切り替え
	const currentSaveId = StorageHelper.get(STORAGE_KEYS.CURRENT_SAVE_ID, null)
	if (currentSaveId === id) {
		StorageHelper.set(STORAGE_KEYS.CURRENT_SAVE_ID, 'default')
	}
}

/**
 * セーブデータ名を変更
 */
export async function renameSaveData(
	id: string,
	newName: string,
): Promise<void> {
	if (id === 'default') {
		throw new Error('Cannot rename default save data')
	}

	await updateSaveData(id, { name: newName.trim() })
}

/**
 * 全セーブデータを取得
 */
export function getAllSaveData(): SaveData[] {
	return StorageHelper.get<SaveData[]>(STORAGE_KEYS.SAVE_DATA_LIST, [])
}

/**
 * セーブデータの並び順を変更
 */
export async function reorderSaveData(newOrder: string[]): Promise<void> {
	const saveDataList = StorageHelper.get<SaveData[]>(
		STORAGE_KEYS.SAVE_DATA_LIST,
		[],
	)

	// 新しい順序に従って並び替え
	const reorderedList = newOrder.map((id, index) => {
		const saveData = saveDataList.find((save) => save.id === id)
		if (!saveData) {
			throw new Error(`Save data with id ${id} not found`)
		}
		return { ...saveData, order: index }
	})

	// リストに存在するが新しい順序に含まれていないアイテムを追加
	const missingItems = saveDataList.filter(
		(save) => !newOrder.includes(save.id),
	)
	reorderedList.push(
		...missingItems.map((item, index) => ({
			...item,
			order: newOrder.length + index,
		})),
	)

	StorageHelper.set(STORAGE_KEYS.SAVE_DATA_LIST, reorderedList)
}

/**
 * 現在のセーブデータを取得
 */
export function getCurrentSaveData(): SaveData {
	const currentSaveId = StorageHelper.get(
		STORAGE_KEYS.CURRENT_SAVE_ID,
		'default',
	)
	const saveDataList = StorageHelper.get<SaveData[]>(
		STORAGE_KEYS.SAVE_DATA_LIST,
		[],
	)

	const currentSave = saveDataList.find((save) => save.id === currentSaveId)
	if (!currentSave) {
		// 現在のセーブデータが見つからない場合、デフォルトを返す
		return (
			saveDataList.find((save) => save.id === 'default') ||
			createDefaultSaveData()
		)
	}

	return currentSave
}

/**
 * 現在のセーブデータを設定
 */
export async function setCurrentSaveData(id: string): Promise<void> {
	const saveDataList = StorageHelper.get<SaveData[]>(
		STORAGE_KEYS.SAVE_DATA_LIST,
		[],
	)
	const saveData = saveDataList.find((save) => save.id === id)

	if (!saveData) {
		throw new Error(`Save data with id ${id} not found`)
	}

	StorageHelper.set(STORAGE_KEYS.CURRENT_SAVE_ID, id)
}

/**
 * 現在のセーブデータを更新（フォーム入力を保存）
 */
export async function saveCurrentData(data: CalculatorData): Promise<void> {
	const currentSaveId = StorageHelper.get(
		STORAGE_KEYS.CURRENT_SAVE_ID,
		'default',
	)
	await updateSaveData(currentSaveId, { data })
}

/**
 * セーブデータの参照整合性を検証
 */
export function validateSaveDataReferences(saveData: SaveData): boolean {
	// 基本的な構造チェック
	if (!saveData.data) return false
	if (!saveData.data.baseStats) return false
	if (!saveData.data.mainWeapon) return false
	if (!saveData.data.subWeapon) return false
	if (!saveData.data.equipment) return false
	if (!saveData.data.crystals) return false
	if (!saveData.data.enemy) return false

	// より詳細な検証は将来実装
	return true
}

/**
 * ストレージ整合性の検証
 */
async function validateStorageIntegrity(): Promise<boolean> {
	try {
		const saveDataList = StorageHelper.get<SaveData[]>(
			STORAGE_KEYS.SAVE_DATA_LIST,
			[],
		)
		const currentSaveId = StorageHelper.get(STORAGE_KEYS.CURRENT_SAVE_ID, null)

		// セーブデータリストが配列かチェック
		if (!Array.isArray(saveDataList)) return false

		// デフォルトセーブデータが存在するかチェック
		const hasDefault = saveDataList.some((save) => save.id === 'default')
		if (!hasDefault) return false

		// 現在のセーブIDが有効かチェック
		if (
			currentSaveId &&
			!saveDataList.some((save) => save.id === currentSaveId)
		) {
			return false
		}

		// 各セーブデータの構造をチェック
		for (const saveData of saveDataList) {
			if (!validateSaveDataReferences(saveData)) {
				return false
			}
		}

		return true
	} catch (error) {
		console.error('Error validating storage integrity:', error)
		return false
	}
}

/**
 * バージョンチェック
 */
async function checkStorageVersion(): Promise<void> {
	// 将来的にバージョン管理を実装
}

/**
 * デフォルト状態にリセット
 */
async function resetToDefault(): Promise<void> {
	try {
		// 全データをクリア
		StorageHelper.remove(STORAGE_KEYS.SAVE_DATA_LIST)
		StorageHelper.remove(STORAGE_KEYS.CURRENT_SAVE_ID)

		// デフォルトデータを作成
		await ensureDefaultSaveData()
		StorageHelper.set(STORAGE_KEYS.CURRENT_SAVE_ID, 'default')

		console.log('Storage reset to default state')
	} catch (error) {
		console.error('Error resetting to default:', error)
	}
}
