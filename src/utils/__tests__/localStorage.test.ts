// LocalStorage系統の統合テスト

import { describe, it, expect, beforeEach } from 'vitest'
import { StorageHelper, STORAGE_KEYS } from '../storage'
import { 
	initializeStorage, 
	createSaveData, 
	getAllSaveData,
	loadSaveData,
	updateSaveData,
	deleteSaveData,
	getCurrentSaveData,
	setCurrentSaveData
} from '../saveDataManager'
import { createInitialCalculatorData } from '../initialData'

// LocalStorageのモック
const localStorageMock = (() => {
	let store: Record<string, string> = {}
	
	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value.toString()
		},
		removeItem: (key: string) => {
			delete store[key]
		},
		clear: () => {
			store = {}
		}
	}
})()

// グローバルのlocalStorageをモックで置き換え
Object.defineProperty(window, 'localStorage', {
	value: localStorageMock
})

describe('LocalStorage Integration Tests', () => {
	beforeEach(() => {
		localStorageMock.clear()
	})

	describe('StorageHelper', () => {
		it('should save and retrieve data correctly', () => {
			const testData = { name: 'test', value: 123 }
			
			const success = StorageHelper.set('test_key', testData)
			expect(success).toBe(true)
			
			const retrieved = StorageHelper.get('test_key', null)
			expect(retrieved).toEqual(testData)
		})

		it('should return default value when key does not exist', () => {
			const defaultValue = { default: true }
			const result = StorageHelper.get('nonexistent_key', defaultValue)
			expect(result).toEqual(defaultValue)
		})

		it('should remove data correctly', () => {
			StorageHelper.set('remove_test', 'data')
			expect(StorageHelper.get('remove_test', null)).toBe('data')
			
			const success = StorageHelper.remove('remove_test')
			expect(success).toBe(true)
			expect(StorageHelper.get('remove_test', null)).toBe(null)
		})
	})

	describe('SaveDataManager', () => {
		it('should initialize storage correctly', async () => {
			await initializeStorage()
			
			const saveDataList = StorageHelper.get(STORAGE_KEYS.SAVE_DATA_LIST, [])
			expect(Array.isArray(saveDataList)).toBe(true)
			expect(saveDataList.length).toBeGreaterThan(0)
			
			const defaultData = saveDataList.find(save => save.id === 'default')
			expect(defaultData).toBeDefined()
			expect(defaultData?.isDefault).toBe(true)
		})

		it('should create and retrieve save data', async () => {
			await initializeStorage()
			
			const testData = createInitialCalculatorData()
			testData.baseStats.STR = 100
			
			const newSave = await createSaveData('テストセーブ', testData)
			expect(newSave.name).toBe('テストセーブ')
			expect(newSave.data.baseStats.STR).toBe(100)
			
			const retrieved = await loadSaveData(newSave.id)
			expect(retrieved.name).toBe('テストセーブ')
			expect(retrieved.data.baseStats.STR).toBe(100)
		})

		it('should update save data correctly', async () => {
			await initializeStorage()
			
			const testData = createInitialCalculatorData()
			const newSave = await createSaveData('アップデートテスト', testData)
			
			await updateSaveData(newSave.id, { name: '更新されたセーブ' })
			
			const updated = await loadSaveData(newSave.id)
			expect(updated.name).toBe('更新されたセーブ')
		})

		it('should delete save data correctly', async () => {
			await initializeStorage()
			
			const testData = createInitialCalculatorData()
			const newSave = await createSaveData('削除テスト', testData)
			
			const beforeDelete = getAllSaveData()
			const countBefore = beforeDelete.length
			
			await deleteSaveData(newSave.id)
			
			const afterDelete = getAllSaveData()
			expect(afterDelete.length).toBe(countBefore - 1)
			
			expect(() => loadSaveData(newSave.id)).rejects.toThrow()
		})

		it('should handle current save data correctly', async () => {
			await initializeStorage()
			
			const testData = createInitialCalculatorData()
			testData.baseStats.INT = 200
			const newSave = await createSaveData('カレントテスト', testData)
			
			await setCurrentSaveData(newSave.id)
			
			const current = getCurrentSaveData()
			expect(current.id).toBe(newSave.id)
			expect(current.data.baseStats.INT).toBe(200)
		})

		it('should not delete default save data', async () => {
			await initializeStorage()
			
			await expect(deleteSaveData('default')).rejects.toThrow('Cannot delete default save data')
		})
	})
})