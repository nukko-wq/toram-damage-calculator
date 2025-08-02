// セーブデータ インポート管理システム

import type { SaveData, UserEquipment } from '@/types/calculator'
import type { ImportValidationResult } from './dataValidator'
import type { ExportData } from './exportManager'

// 再エクスポート
export type { ImportValidationResult }

import { getUserCrystals, saveUserCrystal } from './crystalDatabase'
import { getUserEquipments, saveUserEquipment } from './customEquipmentManager'
import {
	safeParseJSON,
	validateExportData,
	validateFileSize,
	validateFileType,
	validateSecurity,
} from './dataValidator'
import { createSaveData, getAllSaveData } from './saveDataManager'
import { STORAGE_KEYS, StorageHelper } from './storage'

// インポートオプション
export interface ImportOptions {
	createBackup?: boolean
	overwriteExisting?: boolean
	mergeMode?: 'replace' | 'merge' | 'skip'
}

// インポート結果
export interface ImportResult {
	success: boolean
	importedCounts: {
		saveData: number
		customEquipment: number
		customCrystals: number
		settings: number
	}
	skippedCounts: {
		saveData: number
		customEquipment: number
		customCrystals: number
	}
	errors?: string[]
	warnings?: string[]
}

/**
 * ファイルを読み込んでJSONとして解析
 */
export async function readImportFile(
	file: File,
): Promise<ImportValidationResult> {
	const errors: string[] = []
	const warnings: string[] = []

	// ファイル形式の検証
	const typeResult = validateFileType(file)
	errors.push(...typeResult.errors)
	warnings.push(...typeResult.warnings)

	if (!typeResult.isValid) {
		return {
			isValid: false,
			errors,
			warnings,
		}
	}

	// ファイルサイズの検証
	const sizeResult = validateFileSize(file)
	errors.push(...sizeResult.errors)
	warnings.push(...sizeResult.warnings)

	if (!sizeResult.isValid) {
		return {
			isValid: false,
			errors,
			warnings,
		}
	}

	try {
		// ファイル内容を読み込み
		const content = await file.text()

		// JSON解析
		const parseResult = safeParseJSON(content)
		if (!parseResult.success) {
			return {
				isValid: false,
				errors: [`JSONファイルの解析に失敗しました: ${parseResult.error}`],
				warnings,
			}
		}

		const jsonData = parseResult.data

		// データ構造の検証
		const validationResult = validateExportData(jsonData)
		errors.push(...validationResult.errors)
		warnings.push(...validationResult.warnings)

		if (!validationResult.isValid) {
			return {
				isValid: false,
				errors,
				warnings,
			}
		}

		// セキュリティチェック
		const securityResult = validateSecurity(jsonData)
		warnings.push(...securityResult.warnings)

		// 競合チェック
		const conflicts = await checkDataConflicts(jsonData as ExportData)

		return {
			isValid: true,
			errors,
			warnings,
			data: jsonData as ExportData,
			conflicts,
		}
	} catch (error) {
		return {
			isValid: false,
			errors: [
				`ファイル読み込みエラー: ${error instanceof Error ? error.message : '不明なエラー'}`,
			],
			warnings,
		}
	}
}

/**
 * データの競合をチェック
 */
async function checkDataConflicts(data: ExportData): Promise<{
	saveData: string[]
	equipment: string[]
	crystals: string[]
}> {
	const conflicts = {
		saveData: [] as string[],
		equipment: [] as string[],
		crystals: [] as string[],
	}

	// セーブデータの競合チェック
	if (data.saveData?.saves) {
		const existingSaves = getAllSaveData()
		const existingNames = new Set(existingSaves.map((save) => save.name))

		for (const save of data.saveData.saves) {
			if (existingNames.has(save.name)) {
				conflicts.saveData.push(save.name)
			}
		}
	}

	// カスタム装備の競合チェック
	if (data.customData?.equipment) {
		const existingEquipments = getUserEquipments()
		const existingNames = new Set(existingEquipments.map((eq) => eq.name))

		for (const equipment of data.customData.equipment) {
			if (existingNames.has(equipment.name)) {
				conflicts.equipment.push(equipment.name)
			}
		}
	}

	// カスタムクリスタルの競合チェック
	if (data.customData?.crystals) {
		const existingCrystals = getUserCrystals()
		const existingNames = new Set(
			existingCrystals.map((crystal) => crystal.name),
		)

		for (const crystal of data.customData.crystals) {
			if (existingNames.has(crystal.name)) {
				conflicts.crystals.push(crystal.name)
			}
		}
	}

	return conflicts
}

/**
 * バックアップを作成
 */
export async function createBackupBeforeImport(): Promise<string> {
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
	const backupFilename = `backup-before-import-${timestamp}`

	// 現在のデータをエクスポート形式で準備
	const { exportData } = await import('./exportManager')
	const result = await exportData({
		type: 'full',
		filename: backupFilename,
	})

	if (!result.success) {
		throw new Error(`バックアップの作成に失敗しました: ${result.error}`)
	}

	return backupFilename
}

/**
 * セーブデータをインポート
 */
async function importSaveData(
	saveDataInfo: { saves: SaveData[]; currentSaveId: string | null },
	options: ImportOptions,
): Promise<{ imported: number; skipped: number }> {
	let imported = 0
	let skipped = 0

	const existingSaves = getAllSaveData()
	const existingNames = new Set(existingSaves.map((save) => save.name))

	for (const saveData of saveDataInfo.saves) {
		// デフォルトセーブデータはスキップ
		if (saveData.id === 'default') {
			skipped++
			continue
		}

		// 競合処理
		if (existingNames.has(saveData.name)) {
			if (options.mergeMode === 'skip') {
				skipped++
				continue
			}
			if (options.mergeMode === 'merge') {
				// 名前を変更してインポート
				let newName = `${saveData.name} (インポート)`
				let counter = 1
				while (existingNames.has(newName)) {
					newName = `${saveData.name} (インポート${counter})`
					counter++
				}
				saveData.name = newName
			}
			// 'replace'の場合はそのまま進行
		}

		try {
			// 新しいセーブデータとして作成
			await createSaveData(saveData.name, saveData.data)
			imported++
		} catch (error) {
			console.error('セーブデータインポートエラー:', saveData.name, error)
			skipped++
		}
	}

	return { imported, skipped }
}

/**
 * カスタム装備をインポート
 */
async function importCustomEquipment(
	equipments: UserEquipment[],
	options: ImportOptions,
): Promise<{ imported: number; skipped: number }> {
	let imported = 0
	let skipped = 0

	const existingEquipments = getUserEquipments()
	const existingNames = new Set(existingEquipments.map((eq) => eq.name))

	for (const equipment of equipments) {
		// 競合処理
		if (existingNames.has(equipment.name)) {
			if (options.mergeMode === 'skip') {
				skipped++
				continue
			}
			if (options.mergeMode === 'merge') {
				// 名前を変更してインポート
				let newName = `${equipment.name} (インポート)`
				let counter = 1
				while (existingNames.has(newName)) {
					newName = `${equipment.name} (インポート${counter})`
					counter++
				}
				equipment.name = newName
			}
			// 'replace'の場合はそのまま進行
		}

		try {
			// カスタム装備として保存
			saveUserEquipment({
				...equipment,
				id:
					equipment.id ||
					`import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			})
			imported++
		} catch (error) {
			console.error('カスタム装備インポートエラー:', equipment.name, error)
			skipped++
		}
	}

	return { imported, skipped }
}

/**
 * カスタムクリスタルをインポート
 */
async function importCustomCrystals(
	crystals: any[],
	options: ImportOptions,
): Promise<{ imported: number; skipped: number }> {
	let imported = 0
	let skipped = 0

	const existingCrystals = getUserCrystals()
	const existingNames = new Set(existingCrystals.map((crystal) => crystal.name))

	for (const crystal of crystals) {
		// 競合処理
		if (existingNames.has(crystal.name)) {
			if (options.mergeMode === 'skip') {
				skipped++
				continue
			}
			if (options.mergeMode === 'merge') {
				// 名前を変更してインポート
				let newName = `${crystal.name} (インポート)`
				let counter = 1
				while (existingNames.has(newName)) {
					newName = `${crystal.name} (インポート${counter})`
					counter++
				}
				crystal.name = newName
			}
			// 'replace'の場合はそのまま進行
		}

		try {
			// カスタムクリスタルとして保存
			saveUserCrystal({
				...crystal,
				id:
					crystal.id ||
					`import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			})
			imported++
		} catch (error) {
			console.error('カスタムクリスタルインポートエラー:', crystal.name, error)
			skipped++
		}
	}

	return { imported, skipped }
}

/**
 * 設定データをインポート
 */
async function importSettings(
	settings: any,
	_options: ImportOptions,
): Promise<{ imported: number; skipped: number }> {
	// 将来的に設定データがあればここで処理
	// 現在は設定データがないため、スキップ
	return { imported: 0, skipped: 0 }
}

/**
 * データをインポート
 */
export async function importData(
	data: ExportData,
	options: ImportOptions = {},
): Promise<ImportResult> {
	const errors: string[] = []
	const warnings: string[] = []
	const importedCounts = {
		saveData: 0,
		customEquipment: 0,
		customCrystals: 0,
		settings: 0,
	}
	const skippedCounts = {
		saveData: 0,
		customEquipment: 0,
		customCrystals: 0,
	}

	try {
		// バックアップ作成（オプション）
		if (options.createBackup) {
			try {
				await createBackupBeforeImport()
			} catch (error) {
				warnings.push(
					`バックアップ作成に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
				)
			}
		}

		// セーブデータのインポート
		if (data.saveData) {
			try {
				const result = await importSaveData(data.saveData, options)
				importedCounts.saveData = result.imported
				skippedCounts.saveData = result.skipped
			} catch (error) {
				errors.push(
					`セーブデータのインポートに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
				)
			}
		}

		// カスタム装備のインポート
		if (data.customData?.equipment) {
			try {
				const result = await importCustomEquipment(
					data.customData.equipment,
					options,
				)
				importedCounts.customEquipment = result.imported
				skippedCounts.customEquipment = result.skipped
			} catch (error) {
				errors.push(
					`カスタム装備のインポートに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
				)
			}
		}

		// カスタムクリスタルのインポート
		if (data.customData?.crystals) {
			try {
				const result = await importCustomCrystals(
					data.customData.crystals,
					options,
				)
				importedCounts.customCrystals = result.imported
				skippedCounts.customCrystals = result.skipped
			} catch (error) {
				errors.push(
					`カスタムクリスタルのインポートに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
				)
			}
		}

		// 設定データのインポート
		if (data.settings) {
			try {
				const result = await importSettings(data.settings, options)
				importedCounts.settings = result.imported
			} catch (error) {
				errors.push(
					`設定データのインポートに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
				)
			}
		}

		return {
			success: errors.length === 0,
			importedCounts,
			skippedCounts,
			errors: errors.length > 0 ? errors : undefined,
			warnings: warnings.length > 0 ? warnings : undefined,
		}
	} catch (error) {
		return {
			success: false,
			importedCounts: {
				saveData: 0,
				customEquipment: 0,
				customCrystals: 0,
				settings: 0,
			},
			skippedCounts: {
				saveData: 0,
				customEquipment: 0,
				customCrystals: 0,
			},
			errors: [
				`インポート処理エラー: ${error instanceof Error ? error.message : '不明なエラー'}`,
			],
		}
	}
}

/**
 * インポート可能性をチェック
 */
export function canImport(): boolean {
	try {
		// LocalStorageが利用可能かチェック
		return StorageHelper.isAvailable()
	} catch (error) {
		console.error('Import availability check error:', error)
		return false
	}
}

/**
 * インポート統計情報を生成
 */
export function generateImportSummary(result: ImportResult): string {
	const lines: string[] = []

	if (result.success) {
		lines.push('✅ インポートが完了しました')
	} else {
		lines.push('❌ インポートが失敗しました')
	}

	lines.push('')
	lines.push('📊 インポート結果:')

	const imported = result.importedCounts
	const skipped = result.skippedCounts

	if (imported.saveData > 0 || skipped.saveData > 0) {
		lines.push(
			`  セーブデータ: ${imported.saveData}個 インポート, ${skipped.saveData}個 スキップ`,
		)
	}

	if (imported.customEquipment > 0 || skipped.customEquipment > 0) {
		lines.push(
			`  カスタム装備: ${imported.customEquipment}個 インポート, ${skipped.customEquipment}個 スキップ`,
		)
	}

	if (imported.customCrystals > 0 || skipped.customCrystals > 0) {
		lines.push(
			`  カスタムクリスタル: ${imported.customCrystals}個 インポート, ${skipped.customCrystals}個 スキップ`,
		)
	}

	if (result.warnings && result.warnings.length > 0) {
		lines.push('')
		lines.push('⚠️ 警告:')
		result.warnings.forEach((warning) => lines.push(`  ${warning}`))
	}

	if (result.errors && result.errors.length > 0) {
		lines.push('')
		lines.push('❌ エラー:')
		result.errors.forEach((error) => lines.push(`  ${error}`))
	}

	return lines.join('\n')
}
