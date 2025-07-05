/**
 * ダメージ差分計算フック
 * アイテム選択時のダメージ差分をリアルタイムで計算
 */

import { useMemo } from 'react'
import { useCalculatorStore } from '@/stores/calculatorStore'
import type { 
	PreviewItem, 
	SlotInfo, 
	DamageDifferenceResult, 
	DamageDifferenceOptions 
} from '@/types/damagePreview'
import { 
	simulateItemEquip, 
	validateSlotInfo, 
	validateItemSlotCompatibility,
	logSimulationDiff 
} from '@/utils/damageSimulation'
import { 
	calculateDamagePreview, 
	getCurrentMaxDamage,
	generateCacheKey 
} from '@/utils/damagePreviewCalculation'

/**
 * ダメージ差分計算フック
 */
export function useDamageDifference(
	item: PreviewItem | null,
	slotInfo: SlotInfo,
	options: DamageDifferenceOptions = {},
): DamageDifferenceResult {
	const currentData = useCalculatorStore((state) => state.data)
	const currentResults = useCalculatorStore((state) => state.calculationResults)
	
	return useMemo(() => {
		// 初期値
		const initialResult: DamageDifferenceResult = {
			difference: 0,
			isCalculating: false,
			error: null,
			currentDamage: 0,
			simulatedDamage: 0,
		}

		// 無効化されている場合
		if (options.disabled) {
			return initialResult
		}

		// アイテムまたは計算結果がない場合
		if (!item || !currentResults) {
			return initialResult
		}

		try {
			// スロット情報の妥当性チェック
			if (!validateSlotInfo(slotInfo)) {
				throw new Error(`Invalid slot info: ${JSON.stringify(slotInfo)}`)
			}

			// アイテムとスロットの互換性チェック
			if (!validateItemSlotCompatibility(item, slotInfo)) {
				if (options.debug) {
					console.warn('Item-slot compatibility check failed', { item, slotInfo })
				}
				return {
					...initialResult,
					error: new Error('Item and slot are not compatible'),
				}
			}

			// 現在のダメージを取得
			const currentMaxDamage = getCurrentMaxDamage(currentResults)

			// アイテム装着をシミュレーション
			const simulatedData = simulateItemEquip(currentData, item, slotInfo)
			
			// デバッグログ出力
			if (options.debug) {
				logSimulationDiff(currentData, simulatedData, slotInfo, item)
			}

			// シミュレーション結果でダメージ計算
			const simulatedResult = calculateDamagePreview(simulatedData)

			// 差分計算
			const difference = simulatedResult.maxDamage - currentMaxDamage

			if (options.debug) {
				console.log('🎯 Damage Difference Calculation:', {
					current: currentMaxDamage,
					simulated: simulatedResult.maxDamage,
					difference,
					item: item.name,
					slotInfo,
				})
			}

			return {
				difference,
				isCalculating: false,
				error: null,
				currentDamage: currentMaxDamage,
				simulatedDamage: simulatedResult.maxDamage,
			}
		} catch (error) {
			console.error('Damage difference calculation failed:', error)
			return {
				...initialResult,
				error: error as Error,
			}
		}
	}, [item, currentData, currentResults, slotInfo, options.disabled, options.debug])
}

/**
 * バッチダメージ差分計算フック
 * 複数アイテムの差分を一度に計算
 */
export function useBatchDamageDifference(
	items: Array<{ item: PreviewItem; slotInfo: SlotInfo }>,
	options: DamageDifferenceOptions = {},
): Array<DamageDifferenceResult> {
	const currentData = useCalculatorStore((state) => state.data)
	const currentResults = useCalculatorStore((state) => state.calculationResults)

	return useMemo(() => {
		if (options.disabled || !currentResults || items.length === 0) {
			return items.map(() => ({
				difference: 0,
				isCalculating: false,
				error: null,
				currentDamage: 0,
				simulatedDamage: 0,
			}))
		}

		try {
			// 現在のダメージを一度だけ計算
			const currentMaxDamage = getCurrentMaxDamage(currentResults)

			return items.map(({ item, slotInfo }) => {
				try {
					// 妥当性チェック
					if (!validateSlotInfo(slotInfo) || !validateItemSlotCompatibility(item, slotInfo)) {
						return {
							difference: 0,
							isCalculating: false,
							error: new Error('Validation failed'),
							currentDamage: currentMaxDamage,
							simulatedDamage: currentMaxDamage,
						}
					}

					// シミュレーションと計算
					const simulatedData = simulateItemEquip(currentData, item, slotInfo)
					const simulatedResult = calculateDamagePreview(simulatedData)
					const difference = simulatedResult.maxDamage - currentMaxDamage

					return {
						difference,
						isCalculating: false,
						error: null,
						currentDamage: currentMaxDamage,
						simulatedDamage: simulatedResult.maxDamage,
					}
				} catch (error) {
					return {
						difference: 0,
						isCalculating: false,
						error: error as Error,
						currentDamage: currentMaxDamage,
						simulatedDamage: currentMaxDamage,
					}
				}
			})
		} catch (error) {
			console.error('Batch damage difference calculation failed:', error)
			return items.map(() => ({
				difference: 0,
				isCalculating: false,
				error: error as Error,
				currentDamage: 0,
				simulatedDamage: 0,
			}))
		}
	}, [items, currentData, currentResults, options.disabled])
}

/**
 * ダメージ差分のソート用ヘルパー
 */
export function sortByDamageDifference<T extends { item: PreviewItem; slotInfo: SlotInfo }>(
	items: T[],
	results: Array<DamageDifferenceResult>,
	order: 'asc' | 'desc' = 'desc',
): T[] {
	const itemsWithDifference = items.map((item, index) => ({
		...item,
		difference: results[index]?.difference || 0,
	}))

	return itemsWithDifference
		.sort((a, b) => {
			if (order === 'desc') {
				return b.difference - a.difference
			}
			return a.difference - b.difference
		})
		.map(({ difference, ...item }) => item)
}

/**
 * ダメージ差分の統計情報
 */
export interface DamageDifferenceStats {
	max: number
	min: number
	average: number
	positive: number
	negative: number
	neutral: number
}

/**
 * ダメージ差分統計計算
 */
export function calculateDamageDifferenceStats(
	results: Array<DamageDifferenceResult>,
): DamageDifferenceStats {
	const validDifferences = results
		.filter((result) => !result.error)
		.map((result) => result.difference)

	if (validDifferences.length === 0) {
		return {
			max: 0,
			min: 0,
			average: 0,
			positive: 0,
			negative: 0,
			neutral: 0,
		}
	}

	const max = Math.max(...validDifferences)
	const min = Math.min(...validDifferences)
	const average = validDifferences.reduce((sum, diff) => sum + diff, 0) / validDifferences.length
	const positive = validDifferences.filter((diff) => diff > 0).length
	const negative = validDifferences.filter((diff) => diff < 0).length
	const neutral = validDifferences.filter((diff) => diff === 0).length

	return {
		max,
		min,
		average,
		positive,
		negative,
		neutral,
	}
}