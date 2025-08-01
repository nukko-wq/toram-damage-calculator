import { isEqual } from 'lodash-es'
import type { CalculatorData } from '@/types/calculator'
import { createInitialCalculatorData } from '@/utils/initialData'

/**
 * デフォルトデータを取得する
 */
export const getDefaultCalculatorData = (): CalculatorData => {
	return createInitialCalculatorData()
}

/**
 * 深い比較による差分検知
 * @param currentData 現在のデータ
 * @param savedData 保存済みデータ
 * @returns 差分があるかどうか
 */
export const hasDataDifferences = (
	currentData: CalculatorData,
	savedData: CalculatorData | null,
): boolean => {
	if (!savedData) {
		// 保存データがない場合はデフォルトデータと比較
		const defaultData = getDefaultCalculatorData()
		return !isEqual(currentData, defaultData)
	}

	// 保存済みデータと現在データの深い比較
	return !isEqual(currentData, savedData)
}

/**
 * 軽量な差分チェック（主要フィールドのみ）
 * パフォーマンスが重要な場合に使用
 * @param currentData 現在のデータ
 * @param savedData 保存済みデータ
 * @returns 主要フィールドに差分があるかどうか
 */
export const hasLightDifferences = (
	currentData: CalculatorData,
	savedData: CalculatorData | null,
): boolean => {
	if (!savedData) {
		const defaultData = getDefaultCalculatorData()
		return (
			!isEqual(currentData.baseStats, defaultData.baseStats) ||
			!isEqual(currentData.equipment.mainWeapon, defaultData.equipment.mainWeapon) ||
			!isEqual(currentData.equipment.body, defaultData.equipment.body)
		)
	}

	// 頻繁に変更される主要フィールドのみチェック
	return (
		!isEqual(currentData.baseStats, savedData.baseStats) ||
		!isEqual(currentData.equipment.main, savedData.equipment.main) ||
		!isEqual(currentData.equipment.body, savedData.equipment.body) ||
		!isEqual(currentData.buffSkills.skills, savedData.buffSkills.skills)
	)
}

/**
 * 段階的差分チェック
 * 軽量チェックで差分が見つからない場合は完全チェックをスキップ
 * @param currentData 現在のデータ
 * @param savedData 保存済みデータ
 * @returns 差分があるかどうか
 */
export const performOptimizedDifferenceCheck = (
	currentData: CalculatorData,
	savedData: CalculatorData | null,
): boolean => {
	// 1. 軽量チェックを最初に実行
	if (!hasLightDifferences(currentData, savedData)) {
		return false
	}

	// 2. 軽量チェックで差分が見つかった場合のみ完全チェック
	return hasDataDifferences(currentData, savedData)
}

/**
 * データの深いコピーを作成
 * lastSavedDataとして保存する際に使用
 * @param data コピー対象のデータ
 * @returns 深いコピーされたデータ
 */
export const createDataSnapshot = (data: CalculatorData): CalculatorData => {
	// structuredCloneを使用して深いコピーを作成
	return structuredClone(data)
}

/**
 * データ整合性の検証
 * @param data 検証対象のデータ
 * @returns データが有効かどうか
 */
export const isValidCalculatorData = (
	data: unknown,
): data is CalculatorData => {
	if (!data || typeof data !== 'object') {
		return false
	}

	const calculatorData = data as CalculatorData

	// 必須フィールドの存在確認
	return !!(
		calculatorData.baseStats &&
		calculatorData.equipment &&
		calculatorData.crystals &&
		calculatorData.buffSkills &&
		calculatorData.buffItems &&
		calculatorData.food &&
		calculatorData.register &&
		calculatorData.enemy
	)
}
