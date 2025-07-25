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
	
	// キャッシュされた基準ダメージ結果を取得
	const baselineDamageResult = useCalculatorStore((state) => state.baselineDamageResult)

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
			// 「クリスタなし」の特殊処理
			if (item.id === '__crystal_none__') {
				// 「クリスタなし」の場合は、現在装着中のクリスタルを外した状態のダメージを計算
				const baselineData = currentData // 現在の状態を基準
				const simulatedData = removeItemFromSlot(currentData, slotInfo) // クリスタルを外した状態
				
				// 基準ダメージ（現在の状態）を計算
				const baselineResults = calculateResults(baselineData)
				const currentDamageResult = calculateDamageWithService(
					baselineData,
					baselineResults,
					{ debug: options.debug, powerOptions: powerOptions || {} }
				)
				
				// シミュレーション後（クリスタル外した状態）のダメージを計算
				const simulatedResults = calculateResults(simulatedData)
				const simulatedDamageResult = calculateDamageWithService(
					simulatedData,
					simulatedResults,
					{ debug: options.debug, powerOptions: powerOptions || {} }
				)
				
				// 差分を計算（外した状態 - 現在の状態）
				const averageDifference = simulatedDamageResult.normal.average - currentDamageResult.normal.average
				const difference = Math.round(averageDifference)
				
				return {
					difference,
					isCalculating: false,
					error: null,
					currentDamage: currentDamageResult.normal.max,
					simulatedDamage: simulatedDamageResult.normal.max,
				}
			}

			// 「装備なし」の特殊処理
			if (item.id === '__equipment_none__') {
				// 「装備なし」の場合は、現在装着中の装備を外した状態のダメージを計算
				const baselineData = currentData // 現在の状態を基準
				const simulatedData = removeItemFromSlot(currentData, slotInfo) // 装備を外した状態
				
				// 基準ダメージ（現在の状態）を計算
				const baselineResults = calculateResults(baselineData)
				const currentDamageResult = calculateDamageWithService(
					baselineData,
					baselineResults,
					{ debug: options.debug, powerOptions: powerOptions || {} }
				)
				
				// シミュレーション後（装備外した状態）のダメージを計算
				const simulatedResults = calculateResults(simulatedData)
				const simulatedDamageResult = calculateDamageWithService(
					simulatedData,
					simulatedResults,
					{ debug: options.debug, powerOptions: powerOptions || {} }
				)
				
				// 差分を計算（外した状態 - 現在の状態）
				const averageDifference = simulatedDamageResult.normal.average - currentDamageResult.normal.average
				const difference = Math.round(averageDifference)
				
				return {
					difference,
					isCalculating: false,
					error: null,
					currentDamage: currentDamageResult.normal.max,
					simulatedDamage: simulatedDamageResult.normal.max,
				}
			}

			// 「バフアイテムなし」の特殊処理
			if (item.id === '__buff_item_none__') {
				// 「バフアイテムなし」の場合は、現在装着中のバフアイテムを外した状態のダメージを計算
				const baselineData = currentData // 現在の状態を基準
				const simulatedData = removeItemFromSlot(currentData, slotInfo) // バフアイテムを外した状態
				
				// 基準ダメージ（現在の状態）を計算
				const baselineResults = calculateResults(baselineData)
				const currentDamageResult = calculateDamageWithService(
					baselineData,
					baselineResults,
					{ debug: options.debug, powerOptions: powerOptions || {} }
				)
				
				// シミュレーション後（バフアイテム外した状態）のダメージを計算
				const simulatedResults = calculateResults(simulatedData)
				const simulatedDamageResult = calculateDamageWithService(
					simulatedData,
					simulatedResults,
					{ debug: options.debug, powerOptions: powerOptions || {} }
				)
				
				// 差分を計算（外した状態 - 現在の状態）
				const averageDifference = simulatedDamageResult.normal.average - currentDamageResult.normal.average
				const difference = Math.round(averageDifference)
				
				return {
					difference,
					isCalculating: false,
					error: null,
					currentDamage: currentDamageResult.normal.max,
					simulatedDamage: simulatedDamageResult.normal.max,
				}
			}

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

			// 基準ダメージの取得/計算
			let calculatedBaselineDamageResult
			if (isCurrentlyEquipped) {
				// 現在装着中のアイテムの場合：外した状態のダメージを計算
				const baselineData = removeItemFromSlot(currentData, slotInfo)
				const baselineResults = calculateResults(baselineData)
				calculatedBaselineDamageResult = calculateDamageWithService(
					baselineData,
					baselineResults,
					{ debug: options.debug, powerOptions: powerOptions || {} },
				)
			} else {
				// 装着していないアイテムの場合：キャッシュされた基準ダメージを使用
				if (!baselineDamageResult) {
					// キャッシュがない場合は従来の方法で計算
					const baselineResults = calculateResults(currentData)
					calculatedBaselineDamageResult = calculateDamageWithService(
						currentData,
						baselineResults,
						{ debug: options.debug, powerOptions: powerOptions || {} },
					)
				} else {
					// キャッシュされた基準ダメージを使用
					calculatedBaselineDamageResult = baselineDamageResult
				}
			}

			// シミュレーション後のダメージを計算
			const simulatedData = isCurrentlyEquipped 
				? currentData // 現在装着中の場合は現在のデータ
				: simulateItemEquipSimple(currentData, item, slotInfo) // 装着していない場合は装着後をシミュレート
			
			const simulatedResults = calculateResults(simulatedData)
			const simulatedDamageResult = calculateDamageWithService(
				simulatedData,
				simulatedResults,
				{ debug: options.debug, powerOptions: powerOptions || {} },
			)

			// 平均ダメージの差分を計算
			const averageDifference =
				simulatedDamageResult.normal.average -
				calculatedBaselineDamageResult.normal.average

			// 最終差分は平均差分を使用
			const difference = Math.round(averageDifference)

			return {
				difference,
				isCalculating: false,
				error: null,
				currentDamage: calculatedBaselineDamageResult.normal.max,
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
		baselineDamageResult,
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
