// セーブデータ エクスポート管理システム

import type { CalculatorData, SaveData } from '@/types/calculator'
import { StorageHelper, STORAGE_KEYS } from './storage'
import { getAllSaveData, getCurrentSaveData } from './saveDataManager'
import { getUserEquipments } from './customEquipmentManager'
import { getUserCrystals } from './crystalDatabase'

// アプリケーションバージョン
const APP_VERSION = '0.1.0'

// エクスポート種別
export type ExportType = 'full' | 'save-data' | 'custom-data' | 'current-save'

// エクスポートオプション
export interface ExportOptions {
	type: ExportType
	filename: string
	includeSettings?: boolean
}

// エクスポートデータ構造
export interface ExportData {
	// メタデータ
	version: string
	exportDate: string
	exportType: ExportType
	
	// セーブデータ
	saveData?: {
		saves: SaveData[]
		currentSaveId: string | null
	}
	
	// カスタムデータ
	customData?: {
		equipment: any[]
		crystals: any[]
	}
	
	// 設定データ
	settings?: {
		theme?: string
		language?: string
	}
}

// エクスポート結果
export interface ExportResult {
	success: boolean
	filename?: string
	error?: string
	data?: ExportData
}

/**
 * デフォルトファイル名を生成
 */
export function generateDefaultFilename(): string {
	const now = new Date()
	const year = now.getFullYear()
	const month = String(now.getMonth() + 1).padStart(2, '0')
	const day = String(now.getDate()).padStart(2, '0')
	const hour = String(now.getHours()).padStart(2, '0')
	const minute = String(now.getMinutes()).padStart(2, '0')
	const second = String(now.getSeconds()).padStart(2, '0')
	
	return `toram-calc-backup-${year}-${month}-${day}-${hour}${minute}${second}`
}

/**
 * セーブデータを収集
 */
async function collectSaveData(): Promise<{
	saves: SaveData[]
	currentSaveId: string | null
}> {
	const saves = getAllSaveData()
	const currentSaveId = StorageHelper.get(STORAGE_KEYS.CURRENT_SAVE_ID, null)
	
	return {
		saves,
		currentSaveId
	}
}

/**
 * カスタムデータを収集
 */
async function collectCustomData(): Promise<{
	equipment: any[]
	crystals: any[]
}> {
	const equipment = getUserEquipments()
	const crystals = getUserCrystals()
	
	return {
		equipment,
		crystals
	}
}

/**
 * 現在のセーブデータのみを収集
 */
async function collectCurrentSaveData(): Promise<{
	saves: SaveData[]
	currentSaveId: string | null
}> {
	const currentSave = getCurrentSaveData()
	const currentSaveId = StorageHelper.get(STORAGE_KEYS.CURRENT_SAVE_ID, null)
	
	return {
		saves: [currentSave],
		currentSaveId
	}
}

/**
 * 設定データを収集
 */
async function collectSettings(): Promise<{
	theme?: string
	language?: string
}> {
	// 将来的に設定データがあれば収集
	return {}
}

/**
 * エクスポート種別に応じてデータを収集
 */
async function collectExportData(type: ExportType): Promise<ExportData> {
	const exportData: ExportData = {
		version: APP_VERSION,
		exportDate: new Date().toISOString(),
		exportType: type
	}
	
	switch (type) {
		case 'full':
			exportData.saveData = await collectSaveData()
			exportData.customData = await collectCustomData()
			exportData.settings = await collectSettings()
			break
			
		case 'save-data':
			exportData.saveData = await collectSaveData()
			break
			
		case 'custom-data':
			exportData.customData = await collectCustomData()
			break
			
		case 'current-save':
			exportData.saveData = await collectCurrentSaveData()
			break
			
		default:
			throw new Error(`Unknown export type: ${type}`)
	}
	
	return exportData
}

/**
 * ファイルをダウンロード
 */
function downloadFile(data: ExportData, filename: string): void {
	const jsonString = JSON.stringify(data, null, 2)
	const blob = new Blob([jsonString], {
		type: 'application/json'
	})
	
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = `${filename}.json`
	a.style.display = 'none'
	
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
	
	URL.revokeObjectURL(url)
}

/**
 * データをエクスポート
 */
export async function exportData(options: ExportOptions): Promise<ExportResult> {
	try {
		// データ収集
		const data = await collectExportData(options.type)
		
		// ファイルダウンロード
		downloadFile(data, options.filename)
		
		return {
			success: true,
			filename: `${options.filename}.json`,
			data
		}
	} catch (error) {
		console.error('Export error:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'エクスポートに失敗しました'
		}
	}
}

/**
 * エクスポートデータのプレビューを生成
 */
export async function generateExportPreview(type: ExportType): Promise<{
	saveCount: number
	customEquipmentCount: number
	customCrystalCount: number
	hasSettings: boolean
}> {
	try {
		const data = await collectExportData(type)
		
		return {
			saveCount: data.saveData?.saves?.length || 0,
			customEquipmentCount: data.customData?.equipment?.length || 0,
			customCrystalCount: data.customData?.crystals?.length || 0,
			hasSettings: !!data.settings && Object.keys(data.settings).length > 0
		}
	} catch (error) {
		console.error('Export preview error:', error)
		return {
			saveCount: 0,
			customEquipmentCount: 0,
			customCrystalCount: 0,
			hasSettings: false
		}
	}
}

/**
 * エクスポート可能かチェック
 */
export function canExport(type: ExportType): boolean {
	try {
		switch (type) {
			case 'full':
				return true // 常にエクスポート可能
				
			case 'save-data': {
				const saves = getAllSaveData()
				return saves.length > 0
			}
				
			case 'custom-data': {
				const equipment = getUserEquipments()
				const crystals = getUserCrystals()
				return equipment.length > 0 || crystals.length > 0
			}
				
			case 'current-save': {
				const currentSave = getCurrentSaveData()
				return !!currentSave
			}
				
			default:
				return false
		}
	} catch (error) {
		console.error('Export check error:', error)
		return false
	}
}

/**
 * エクスポート種別の表示名を取得
 */
export function getExportTypeLabel(type: ExportType): string {
	switch (type) {
		case 'full':
			return '全データ (セーブデータ + カスタムデータ)'
		case 'save-data':
			return 'セーブデータのみ'
		case 'custom-data':
			return 'カスタムデータのみ (装備・クリスタル等)'
		case 'current-save':
			return '現在のデータのみ'
		default:
			return '不明'
	}
}

/**
 * エクスポート種別の説明を取得
 */
export function getExportTypeDescription(type: ExportType): string {
	switch (type) {
		case 'full':
			return 'すべてのセーブデータとカスタムデータを含む完全なバックアップです。'
		case 'save-data':
			return 'セーブデータのみをエクスポートします。カスタム装備・クリスタルは含まれません。'
		case 'custom-data':
			return 'カスタム装備・クリスタルのみをエクスポートします。セーブデータは含まれません。'
		case 'current-save':
			return '現在選択中のセーブデータのみをエクスポートします。'
		default:
			return ''
	}
}