/**
 * DamagePreview.tsxの正しい方法を参考にしたダメージ差分計算フック
 * 共通のダメージ計算サービスを使用
 */

import { useMemo, useState } from 'react'
import { useCalculatorStore } from '@/stores/calculatorStore'
import type {
	PreviewItem,
	SlotInfo,
	DamageDifferenceResult,
	DamageDifferenceOptions,
} from '@/types/damagePreview'
import type { CalculatorData } from '@/types/calculator'
import { calculateResults } from '@/utils/calculationEngine'
import { simulateItemEquipSimple } from '@/utils/damageSimulationSimple'
import { calculateDamageWithService } from '@/utils/damageCalculationService'

/**
 * 正しい方法によるダメージ差分計算フック
 */
export function useDamageDifferenceCorrect(
	item: PreviewItem | null,
	slotInfo: SlotInfo,
	options: DamageDifferenceOptions = {},
): DamageDifferenceResult {
	// 強制的な再計算用のタイムスタンプ
	const [, forceUpdate] = useState(0)
	// 現在のデータと計算結果を取得
	const currentData = useCalculatorStore((state) => state.data)
	const currentResults = useCalculatorStore((state) => state.calculationResults)
	const powerOptions = useCalculatorStore((state) => state.data.powerOptions)

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

		// アイテムまたはデータがない場合
		if (!item || !currentData) {
			return initialResult
		}

		// currentResultsがない場合は、その場で計算を実行
		let effectiveCurrentResults = currentResults
		if (!effectiveCurrentResults) {
			effectiveCurrentResults = calculateResults(currentData)
		}

		try {
			// 現在装着中のアイテムIDを確認
			let currentEquippedItemId: string | null = null
			let currentSlotKey: string | null = null

			if (slotInfo.type === 'crystal') {
				// クリスタルの場合
				currentSlotKey =
					slotInfo.category && typeof slotInfo.slot === 'number'
						? `${slotInfo.category}${slotInfo.slot + 1}`
						: null
				currentEquippedItemId = currentSlotKey
					? (currentData.crystals as unknown as Record<string, string | null>)[
							currentSlotKey
						]
					: null
			} else if (slotInfo.type === 'equipment') {
				// 装備の場合
				if (slotInfo.slot && typeof slotInfo.slot === 'string') {
					currentSlotKey = slotInfo.slot
					currentEquippedItemId =
						(currentData.equipment as any)[currentSlotKey]?.id || null
				}
			} else if (slotInfo.type === 'buffItem') {
				// バフアイテムの場合
				if (slotInfo.category && typeof slotInfo.category === 'string') {
					currentSlotKey = slotInfo.category
					currentEquippedItemId =
						(currentData.buffItems as any)[currentSlotKey] || null
				}
			}

			const isCurrentlyEquipped = currentEquippedItemId === item.id

			let baselineData: CalculatorData
			let simulatedData: CalculatorData

			if (isCurrentlyEquipped) {
				// 現在装着中のクリスタルの場合：外した状態を基準にして差分を計算
				baselineData = removeItemFromSlot(currentData, slotInfo)
				simulatedData = currentData // 現在の状態が装着状態
			} else {
				// 装着していないクリスタルの場合：現在の状態を基準にして装着後の差分を計算
				baselineData = currentData
				simulatedData = simulateItemEquipSimple(currentData, item, slotInfo)
			}

			// 1. 基準状態のダメージを計算（共通サービスを使用）
			const baselineResults = calculateResults(baselineData)
			const currentDamageResult = calculateDamageWithService(
				baselineData,
				baselineResults,
				{ debug: options.debug, powerOptions: powerOptions || {} },
			)

			// 2. シミュレーション後のステータスを計算（共通サービスを使用）
			const simulatedResults = calculateResults(simulatedData)
			const simulatedDamageResult = calculateDamageWithService(
				simulatedData,
				simulatedResults,
				{ debug: options.debug, powerOptions: powerOptions || {} },
			)

			// 3. 平均ダメージの差分を計算
			const averageDifference =
				simulatedDamageResult.normal.average -
				currentDamageResult.normal.average

			// 4. 平均ダメージの差分を使用
			const averageDamageDifference = Math.round(averageDifference)

			// 5. 最終差分は平均差分を使用
			const difference = averageDamageDifference

			return {
				difference,
				isCalculating: false,
				error: null,
				currentDamage: currentDamageResult.normal.max,
				simulatedDamage: simulatedDamageResult.normal.max,
			}
		} catch (error) {
			return {
				...initialResult,
				error: error as Error,
			}
		}
	}, [
		item,
		currentData,
		currentResults,
		powerOptions,
		slotInfo,
		options.disabled,
		options.debug,
	])
}

/**
 * 指定されたスロットからアイテムを削除した状態のデータを作成
 */
function removeItemFromSlot(
	currentData: CalculatorData,
	slotInfo: SlotInfo,
): CalculatorData {
	// ディープコピーを作成
	const resultData: CalculatorData = JSON.parse(JSON.stringify(currentData))

	if (slotInfo.type === 'crystal') {
		// クリスタルの場合
		if (slotInfo.category && typeof slotInfo.slot === 'number') {
			const slotNumber = slotInfo.slot + 1 // 0-based to 1-based
			const slotKey = `${slotInfo.category}${slotNumber}`

			// クリスタルスロットを空にする
			if (resultData.crystals) {
				;(resultData.crystals as unknown as Record<string, string | null>)[
					slotKey
				] = null
			}
		}
	} else if (slotInfo.type === 'equipment') {
		// 装備の場合
		if (slotInfo.slot && typeof slotInfo.slot === 'string') {
			const slotKey = slotInfo.slot
			// 装備スロットを空にする
			if (resultData.equipment) {
				;(resultData.equipment as any)[slotKey] = null
			}
		}
	} else if (slotInfo.type === 'buffItem') {
		// バフアイテムの場合
		if (slotInfo.category && typeof slotInfo.category === 'string') {
			const category = slotInfo.category
			// バフアイテムスロットを空にする
			if (resultData.buffItems) {
				;(resultData.buffItems as any)[category] = null
			}
		}
	}

	return resultData
}
