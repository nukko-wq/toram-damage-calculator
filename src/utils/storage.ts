// LocalStorage管理の基本ユーティリティ

import type { StorageUsage } from '@/types/calculator'

// ストレージキー定義
export const STORAGE_KEYS = {
	// セーブデータ（参照情報のみ）
	SAVE_DATA_LIST: 'toram_save_data_list',
	CURRENT_SAVE_ID: 'toram_current_save_id',

	// ユーザーカスタムデータ（全セーブデータで共有）
	CUSTOM_EQUIPMENTS: 'toram_custom_equipments',
	CUSTOM_CRYSTALS: 'toram_user_crystals', // 既存のcrystalDatabase.tsと整合性を保つ
	CUSTOM_ENEMIES: 'toram_custom_enemies',

	// アプリケーション設定
	APP_SETTINGS: 'toram_app_settings',
	FLOATING_MENU_SETTINGS: 'toram_floating_menu_settings',
	VERSION: 'toram_storage_version',

	// お気に入り機能
	EQUIPMENT_FAVORITES: 'toram_equipment_favorites',
	CRYSTAL_FAVORITES: 'toram_crystal_favorites',
	BUFF_ITEM_FAVORITES: 'toram_buff_item_favorites',
} as const

// 安全なLocalStorage操作のヘルパー関数
// biome-ignore lint/complexity/noStaticOnlyClass: LocalStorage操作の名前空間として使用
export class StorageHelper {
	/**
	 * LocalStorageからデータを安全に取得
	 */
	static get<T>(key: string, defaultValue: T): T {
		if (typeof window === 'undefined') return defaultValue

		try {
			const item = localStorage.getItem(key)
			if (item === null) return defaultValue
			return JSON.parse(item) as T
		} catch (error) {
			console.error(`Error reading from localStorage (${key}):`, error)
			return defaultValue
		}
	}

	/**
	 * LocalStorageにデータを安全に保存
	 */
	static set<T>(key: string, value: T): boolean {
		if (typeof window === 'undefined') return false

		try {
			localStorage.setItem(key, JSON.stringify(value))
			return true
		} catch (error) {
			console.error(`Error writing to localStorage (${key}):`, error)
			return false
		}
	}

	/**
	 * LocalStorageからデータを安全に削除
	 */
	static remove(key: string): boolean {
		if (typeof window === 'undefined') return false

		try {
			localStorage.removeItem(key)
			return true
		} catch (error) {
			console.error(`Error removing from localStorage (${key}):`, error)
			return false
		}
	}

	/**
	 * LocalStorageをクリア
	 */
	static clear(): boolean {
		if (typeof window === 'undefined') return false

		try {
			localStorage.clear()
			return true
		} catch (error) {
			console.error('Error clearing localStorage:', error)
			return false
		}
	}

	/**
	 * LocalStorageが利用可能かチェック
	 */
	static isAvailable(): boolean {
		if (typeof window === 'undefined') return false

		try {
			const testKey = '__storage_test__'
			localStorage.setItem(testKey, 'test')
			localStorage.removeItem(testKey)
			return true
		} catch {
			return false
		}
	}
}

/**
 * ストレージ使用量を取得
 */
export function getStorageUsage(): StorageUsage {
	if (!StorageHelper.isAvailable()) {
		return {
			totalSize: 0,
			maxSize: 0,
			usage: 0,
			warning: false,
			critical: false,
		}
	}

	let totalSize = 0

	try {
		// 全てのLocalStorageアイテムのサイズを計算
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i)
			if (key) {
				const value = localStorage.getItem(key)
				if (value) {
					// キー + 値のサイズ（概算）
					totalSize += key.length + value.length
				}
			}
		}
	} catch (error) {
		console.error('Error calculating storage usage:', error)
	}

	// LocalStorageの一般的な制限（5MB）
	const maxSize = 5 * 1024 * 1024 // 5MB in bytes
	const usage = totalSize / maxSize

	return {
		totalSize,
		maxSize,
		usage,
		warning: usage >= 0.8, // 80%以上で警告
		critical: usage >= 0.95, // 95%以上で危険
	}
}

/**
 * 古いデータをクリーンアップ
 */
export async function cleanupOldData(): Promise<void> {
	// 実装は将来的に追加
	// 古いセーブデータの削除、不要なデータの整理など
	console.log('Cleanup old data - not implemented yet')
}

/**
 * データ整合性をチェック
 */
export async function validateStorageIntegrity(): Promise<boolean> {
	try {
		// 基本的なデータ整合性チェック
		const saveDataList = StorageHelper.get(STORAGE_KEYS.SAVE_DATA_LIST, [])
		const currentSaveId = StorageHelper.get(STORAGE_KEYS.CURRENT_SAVE_ID, null)

		// 現在のセーブIDが存在するかチェック
		if (currentSaveId && !Array.isArray(saveDataList)) {
			console.warn('Save data list is not an array')
			return false
		}

		if (
			currentSaveId &&
			// biome-ignore lint/suspicious/noExplicitAny: SaveData型の互換性のため
			!saveDataList.find((save: any) => save.id === currentSaveId)
		) {
			console.warn('Current save ID not found in save data list')
			return false
		}

		return true
	} catch (error) {
		console.error('Error validating storage integrity:', error)
		return false
	}
}

/**
 * ストレージバージョンを取得
 */
export function getCurrentStorageVersion(): string {
	return StorageHelper.get(STORAGE_KEYS.VERSION, '1.0.0')
}

/**
 * ストレージバージョンを設定
 */
export function setStorageVersion(version: string): boolean {
	return StorageHelper.set(STORAGE_KEYS.VERSION, version)
}

/**
 * データ移行処理
 */
export async function migrateStorageVersion(
	fromVersion: string,
	toVersion: string,
): Promise<void> {
	console.log(`Migrating storage from ${fromVersion} to ${toVersion}`)
	// 将来的にバージョン間の移行処理を実装
}
