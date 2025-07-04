// データ検証機能

import type { ExportData } from './exportManager'

// 検証結果の型定義
export interface ValidationResult {
	isValid: boolean
	errors: string[]
	warnings: string[]
}

// 詳細検証結果（インポート用）
export interface ImportValidationResult extends ValidationResult {
	data?: ExportData
	conflicts?: {
		saveData: string[]      // 競合するセーブデータ名
		equipment: string[]     // 競合するカスタム装備名
		crystals: string[]      // 競合するカスタムクリスタル名
	}
}

/**
 * JSONファイルの基本構造を検証
 */
export function validateFileStructure(jsonData: any): ValidationResult {
	const errors: string[] = []
	const warnings: string[] = []

	// 必須フィールドの存在チェック
	if (!jsonData.version) {
		errors.push('バージョン情報が見つかりません')
	}

	if (!jsonData.exportDate) {
		errors.push('エクスポート日時が見つかりません')
	}

	if (!jsonData.exportType) {
		errors.push('エクスポート種別が見つかりません')
	}

	// エクスポート種別の妥当性チェック
	const validExportTypes = ['full', 'save-data', 'custom-data', 'current-save']
	if (jsonData.exportType && !validExportTypes.includes(jsonData.exportType)) {
		errors.push(`無効なエクスポート種別: ${jsonData.exportType}`)
	}

	// 日付形式の検証
	if (jsonData.exportDate) {
		const date = new Date(jsonData.exportDate)
		if (isNaN(date.getTime())) {
			warnings.push('エクスポート日時の形式が無効です')
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings
	}
}

/**
 * バージョン互換性をチェック
 */
export function validateVersionCompatibility(version: string): ValidationResult {
	const errors: string[] = []
	const warnings: string[] = []

	// 現在のアプリケーションバージョン
	const currentVersion = '0.1.0'

	// バージョン形式の検証
	const versionRegex = /^\d+\.\d+\.\d+$/
	if (!versionRegex.test(version)) {
		errors.push('バージョン形式が無効です')
		return { isValid: false, errors, warnings }
	}

	// バージョン比較（将来の実装）
	const [major, minor, patch] = version.split('.').map(Number)
	const [currentMajor, currentMinor, currentPatch] = currentVersion.split('.').map(Number)

	// メジャーバージョンが異なる場合は互換性なし
	if (major !== currentMajor) {
		errors.push(`互換性のないバージョンです (${version} vs ${currentVersion})`)
	}
	// マイナーバージョンが新しい場合は警告
	else if (minor > currentMinor) {
		warnings.push(`新しいバージョンのデータです (${version} vs ${currentVersion})`)
	}
	// パッチバージョンが異なる場合は情報として表示
	else if (patch !== currentPatch) {
		warnings.push(`パッチバージョンが異なります (${version} vs ${currentVersion})`)
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings
	}
}

/**
 * セーブデータの構造を検証
 */
export function validateSaveData(saveData: any): ValidationResult {
	const errors: string[] = []
	const warnings: string[] = []

	if (!saveData) {
		return { isValid: true, errors, warnings }
	}

	// 基本構造の検証
	if (!Array.isArray(saveData.saves)) {
		errors.push('セーブデータリストが配列ではありません')
		return { isValid: false, errors, warnings }
	}

	// 各セーブデータの検証
	for (let i = 0; i < saveData.saves.length; i++) {
		const save = saveData.saves[i]
		const prefix = `セーブデータ[${i}]`

		if (!save.id) {
			errors.push(`${prefix}: IDが見つかりません`)
		}

		if (!save.name) {
			errors.push(`${prefix}: 名前が見つかりません`)
		}

		if (!save.data) {
			errors.push(`${prefix}: 計算機データが見つかりません`)
		}

		// 計算機データの基本構造チェック
		if (save.data) {
			const requiredFields = ['baseStats', 'mainWeapon', 'subWeapon', 'equipment', 'crystals', 'enemy']
			for (const field of requiredFields) {
				if (!save.data[field]) {
					warnings.push(`${prefix}: ${field}データが見つかりません`)
				}
			}
		}

		// 日付の検証
		if (save.createdAt) {
			const createdDate = new Date(save.createdAt)
			if (isNaN(createdDate.getTime())) {
				warnings.push(`${prefix}: 作成日時の形式が無効です`)
			}
		}

		if (save.updatedAt) {
			const updatedDate = new Date(save.updatedAt)
			if (isNaN(updatedDate.getTime())) {
				warnings.push(`${prefix}: 更新日時の形式が無効です`)
			}
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings
	}
}

/**
 * カスタムデータの構造を検証
 */
export function validateCustomData(customData: any): ValidationResult {
	const errors: string[] = []
	const warnings: string[] = []

	if (!customData) {
		return { isValid: true, errors, warnings }
	}

	// カスタム装備の検証
	if (customData.equipment) {
		if (!Array.isArray(customData.equipment)) {
			errors.push('カスタム装備データが配列ではありません')
		} else {
			for (let i = 0; i < customData.equipment.length; i++) {
				const equipment = customData.equipment[i]
				const prefix = `カスタム装備[${i}]`

				if (!equipment.id) {
					errors.push(`${prefix}: IDが見つかりません`)
				}

				if (!equipment.name) {
					errors.push(`${prefix}: 名前が見つかりません`)
				}

				if (!equipment.category) {
					errors.push(`${prefix}: カテゴリが見つかりません`)
				}

				if (!equipment.properties) {
					warnings.push(`${prefix}: プロパティが見つかりません`)
				}
			}
		}
	}

	// カスタムクリスタルの検証
	if (customData.crystals) {
		if (!Array.isArray(customData.crystals)) {
			errors.push('カスタムクリスタルデータが配列ではありません')
		} else {
			for (let i = 0; i < customData.crystals.length; i++) {
				const crystal = customData.crystals[i]
				const prefix = `カスタムクリスタル[${i}]`

				if (!crystal.id) {
					errors.push(`${prefix}: IDが見つかりません`)
				}

				if (!crystal.name) {
					errors.push(`${prefix}: 名前が見つかりません`)
				}

				if (!crystal.type) {
					errors.push(`${prefix}: タイプが見つかりません`)
				}

				if (!crystal.properties) {
					warnings.push(`${prefix}: プロパティが見つかりません`)
				}
			}
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings
	}
}

/**
 * 完全なエクスポートデータの検証
 */
export function validateExportData(jsonData: any): ValidationResult {
	const allErrors: string[] = []
	const allWarnings: string[] = []

	// 基本構造の検証
	const structureResult = validateFileStructure(jsonData)
	allErrors.push(...structureResult.errors)
	allWarnings.push(...structureResult.warnings)

	if (!structureResult.isValid) {
		return {
			isValid: false,
			errors: allErrors,
			warnings: allWarnings
		}
	}

	// バージョン互換性の検証
	const versionResult = validateVersionCompatibility(jsonData.version)
	allErrors.push(...versionResult.errors)
	allWarnings.push(...versionResult.warnings)

	// セーブデータの検証
	const saveDataResult = validateSaveData(jsonData.saveData)
	allErrors.push(...saveDataResult.errors)
	allWarnings.push(...saveDataResult.warnings)

	// カスタムデータの検証
	const customDataResult = validateCustomData(jsonData.customData)
	allErrors.push(...customDataResult.errors)
	allWarnings.push(...customDataResult.warnings)

	return {
		isValid: allErrors.length === 0,
		errors: allErrors,
		warnings: allWarnings
	}
}

/**
 * ファイルサイズを検証
 */
export function validateFileSize(file: File): ValidationResult {
	const errors: string[] = []
	const warnings: string[] = []

	// 最大ファイルサイズ: 10MB
	const maxSize = 10 * 1024 * 1024
	
	if (file.size > maxSize) {
		errors.push(`ファイルサイズが大きすぎます (${Math.round(file.size / 1024 / 1024)}MB > 10MB)`)
	}

	// 推奨サイズ: 1MB
	const recommendedSize = 1 * 1024 * 1024
	
	if (file.size > recommendedSize) {
		warnings.push(`ファイルサイズが大きいため、処理に時間がかかる可能性があります (${Math.round(file.size / 1024 / 1024)}MB)`)
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings
	}
}

/**
 * ファイル形式を検証
 */
export function validateFileType(file: File): ValidationResult {
	const errors: string[] = []
	const warnings: string[] = []

	// MIME タイプチェック
	if (file.type !== 'application/json' && file.type !== '') {
		warnings.push(`ファイル形式が不明です (${file.type})`)
	}

	// 拡張子チェック
	if (!file.name.toLowerCase().endsWith('.json')) {
		errors.push('JSONファイルではありません')
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings
	}
}

/**
 * JSON文字列を安全にパース
 */
export function safeParseJSON(jsonString: string): { success: boolean; data?: any; error?: string } {
	try {
		const data = JSON.parse(jsonString)
		return { success: true, data }
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : '不明なJSONパースエラー'
		}
	}
}

/**
 * 危険なコンテンツを検証（基本的なセキュリティチェック）
 */
export function validateSecurity(jsonData: any): ValidationResult {
	const errors: string[] = []
	const warnings: string[] = []

	// 深すぎるネストをチェック
	function checkDepth(obj: any, depth = 0): number {
		if (depth > 20) {
			return depth
		}

		if (typeof obj === 'object' && obj !== null) {
			let maxDepth = depth
			for (const value of Object.values(obj)) {
				const childDepth = checkDepth(value, depth + 1)
				maxDepth = Math.max(maxDepth, childDepth)
			}
			return maxDepth
		}

		return depth
	}

	const maxDepth = checkDepth(jsonData)
	if (maxDepth > 15) {
		warnings.push('データの構造が深すぎます。処理に時間がかかる可能性があります。')
	}

	// 大きすぎるプロパティをチェック
	function checkLargeProperties(obj: any, path = ''): void {
		if (typeof obj === 'object' && obj !== null) {
			for (const [key, value] of Object.entries(obj)) {
				const currentPath = path ? `${path}.${key}` : key

				if (typeof value === 'string' && value.length > 10000) {
					warnings.push(`大きすぎる文字列データが含まれています: ${currentPath}`)
				}

				if (Array.isArray(value) && value.length > 1000) {
					warnings.push(`大きすぎる配列データが含まれています: ${currentPath}`)
				}

				if (typeof value === 'object') {
					checkLargeProperties(value, currentPath)
				}
			}
		}
	}

	checkLargeProperties(jsonData)

	return {
		isValid: true, // セキュリティチェックは警告のみ
		errors,
		warnings
	}
}