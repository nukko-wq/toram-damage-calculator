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
	DamageDifferenceOptions 
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
		// 常にログを表示して、フックが呼ばれているかを確認
		console.log('🔄 useDamageDifferenceCorrect called:', {
			itemName: item?.name,
			hasItem: !!item,
			hasSlotInfo: !!slotInfo,
			hasCurrentData: !!currentData,
			hasCurrentResults: !!currentResults,
			disabled: options.disabled,
		})
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
			if (options.debug) {
				console.log('❌ Missing item or currentData:', { 
					item: !!item, 
					currentData: !!currentData
				})
			}
			return initialResult
		}

		// currentResultsがない場合は、その場で計算を実行
		let effectiveCurrentResults = currentResults
		if (!effectiveCurrentResults) {
			if (options.debug) {
				console.log('⚠️ calculationResults not available, calculating on-demand')
			}
			effectiveCurrentResults = calculateResults(currentData)
		}

		if (options.debug) {
			console.log('✅ Starting correct damage difference calculation for:', item.name)
			console.log('🔍 Crystal properties:', item.properties)
		}

		try {
			// 現在装着中のクリスタルIDを確認
			const currentSlotKey = slotInfo.category && typeof slotInfo.slot === 'number' 
				? `${slotInfo.category}${slotInfo.slot + 1}` 
				: null
			const currentEquippedCrystalId = currentSlotKey 
				? (currentData.crystals as unknown as Record<string, string | null>)[currentSlotKey]
				: null
			
			const isCurrentlyEquipped = currentEquippedCrystalId === item.id
			
			if (options.debug) {
				console.log('🔍 CRYSTAL EQUIP STATUS:', {
					currentSlotKey,
					currentEquippedCrystalId,
					targetCrystalId: item.id,
					isCurrentlyEquipped,
				})
			}

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
				{ debug: options.debug, powerOptions: powerOptions || {} }
			)
			const currentMaxDamage = currentDamageResult.normal.max
			
			// 2. シミュレーション後のステータスを計算（共通サービスを使用）
			const simulatedResults = calculateResults(simulatedData)
			const simulatedDamageResult = calculateDamageWithService(
				simulatedData, 
				simulatedResults, 
				{ debug: options.debug, powerOptions: powerOptions || {} }
			)
			const simulatedMaxDamage = simulatedDamageResult.normal.max
			
			// デバッグログ: calculateResults実行後
			if (options.debug) {
				console.log('⚙️ CRYSTAL SIMULATION VERIFICATION:', {
					'=== EXPECTED VALUES ===': '========================',
					'Before (no crystal)': {
						totalATK: 4873,
						'equipmentBonus1.ATK_Rate': 0,
						'equipmentBonus1.STR_Rate': 0,
						'equipmentBonus1.criticalRate': 0,
					},
					'After (Don Profond)': {
						totalATK: 5475,
						'equipmentBonus1.ATK_Rate': 10,
						'equipmentBonus1.STR_Rate': 7,
						'equipmentBonus1.criticalRate': 8,
					},
					'=== ACTUAL BASELINE RESULTS ===': '================',
					baselineTotalATK: baselineResults.basicStats.totalATK,
					'baseline.equipmentBonus1.atkRate': (baselineResults.equipmentBonus1 as any)?.atkRate || 0,
					'baseline.equipmentBonus1.strRate': (baselineResults.equipmentBonus1 as any)?.strRate || 0,
					'baseline.equipmentBonus1.criticalRate': baselineResults.equipmentBonus1?.criticalRate || 0,
					'=== ACTUAL SIMULATED RESULTS ===': '================',
					simulatedTotalATK: simulatedResults.basicStats.totalATK,
					'simulated.equipmentBonus1.ATK_Rate': (simulatedResults.equipmentBonus1 as any)?.ATK_Rate || 0,
					'simulated.equipmentBonus1.STR_Rate': (simulatedResults.equipmentBonus1 as any)?.STR_Rate || 0,
					'simulated.equipmentBonus1.Critical_Rate': (simulatedResults.equipmentBonus1 as any)?.Critical_Rate || 0,
					'=== DIFFERENCES ===': '========================',
					totalATKDiff: simulatedResults.basicStats.totalATK - baselineResults.basicStats.totalATK,
					atkRateDiff: ((simulatedResults.equipmentBonus1 as any)?.ATK_Rate || 0) - ((baselineResults.equipmentBonus1 as any)?.ATK_Rate || 0),
					strRateDiff: ((simulatedResults.equipmentBonus1 as any)?.STR_Rate || 0) - ((baselineResults.equipmentBonus1 as any)?.STR_Rate || 0),
					criticalRateDiff: ((simulatedResults.equipmentBonus1 as any)?.Critical_Rate || 0) - ((baselineResults.equipmentBonus1 as any)?.Critical_Rate || 0),
				})
				
				console.log('🔍 CRYSTAL DATA VERIFICATION:', {
					crystalName: item.name,
					crystalProperties: item.properties,
					expectedProperties: {
						ATK_Rate: 10,
						STR_Rate: 7,
						Critical_Rate: 8,
						DEF_Rate: -27,
					},
					propertiesMatch: {
						ATK_Rate: (item.properties as any)?.ATK_Rate === 10,
						STR_Rate: (item.properties as any)?.STR_Rate === 7,
						Critical_Rate: (item.properties as any)?.Critical_Rate === 8,
						DEF_Rate: (item.properties as any)?.DEF_Rate === -27,
					}
				})
			}
			
			
			// デバッグログ: ダメージ計算結果の比較
			if (options.debug) {
				console.log('🎯 DAMAGE CALCULATION COMPARISON:', {
					'=== DAMAGE RESULTS ===': '========================',
					currentMaxDamage,
					simulatedMaxDamage,
					rawDifference: simulatedMaxDamage - currentMaxDamage,
					roundedDifference: Math.round(simulatedMaxDamage - currentMaxDamage),
					'=== EXPECTED VS ACTUAL ===': '===================',
					expectedDifference: 188273, // 実際の差分: 1,733,894 - 1,545,621
					calculatedDifference: Math.round(simulatedMaxDamage - currentMaxDamage),
					discrepancy: 188273 - Math.round(simulatedMaxDamage - currentMaxDamage),
				})
			}
			
			
			// 5. 差分を計算
			const difference = Math.round(simulatedMaxDamage - currentMaxDamage)

			if (options.debug) {
				console.log('🎯 Correct Damage Difference Calculation:', {
					current: currentMaxDamage,
					simulated: simulatedMaxDamage,
					difference,
					item: item.name,
					slotInfo,
					currentTotalATK: effectiveCurrentResults.basicStats.totalATK,
					simulatedTotalATK: simulatedResults.basicStats.totalATK,
				})
				
				// 詳細デバッグ: クリスタル装着前後の比較
				console.log('📊 DETAILED DAMAGE DIFFERENCE DEBUG:', {
					'=== CRYSTAL SIMULATION ===': '=================',
					itemName: item.name,
					slotCategory: slotInfo.category,
					slotNumber: slotInfo.slot,
					'=== CURRENT DATA ===': '=================',
					currentCrystals: currentData.crystals,
					currentTotalATK: effectiveCurrentResults.basicStats.totalATK,
					currentMaxDamage: currentMaxDamage,
					'=== SIMULATED DATA ===': '=================',
					simulatedCrystals: simulatedData.crystals,
					simulatedTotalATK: simulatedResults.basicStats.totalATK,
					simulatedMaxDamage: simulatedMaxDamage,
					'=== DIFFERENCE ===': '=================',
					attackDifference: simulatedResults.basicStats.totalATK - effectiveCurrentResults.basicStats.totalATK,
					damageDifference: difference,
					'=== BONUS COMPARISON ===': '=================',
					currentEquipmentBonus1: effectiveCurrentResults.equipmentBonus1,
					simulatedEquipmentBonus1: simulatedResults.equipmentBonus1,
				})
				
				// クリスタル装着シミュレーションの詳細確認
				console.log('🔍 CRYSTAL EQUIP SIMULATION DETAILS:')
				console.log('slotInfo:', slotInfo)
				if (slotInfo.category && typeof slotInfo.slot === 'number') {
					const slotKey = `${slotInfo.category}${slotInfo.slot + 1}`
					console.log('Expected slot key:', slotKey)
					console.log('Current crystal in slot:', (currentData.crystals as unknown as Record<string, string | null>)[slotKey])
					console.log('Simulated crystal in slot:', (simulatedData.crystals as unknown as Record<string, string | null>)[slotKey])
				}
			}

			return {
				difference,
				isCalculating: false,
				error: null,
				currentDamage: currentMaxDamage,
				simulatedDamage: simulatedMaxDamage,
			}
		} catch (error) {
			if (options.debug) {
				console.error('Correct damage difference calculation failed:', error)
			}
			return {
				...initialResult,
				error: error as Error,
			}
		}
	}, [item, currentData, currentResults, powerOptions, slotInfo, options.disabled, options.debug])
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

	if (slotInfo.type === 'crystal' && slotInfo.category && typeof slotInfo.slot === 'number') {
		const slotNumber = slotInfo.slot + 1 // 0-based to 1-based
		const slotKey = `${slotInfo.category}${slotNumber}`
		
		// クリスタルスロットを空にする
		if (resultData.crystals) {
			(resultData.crystals as unknown as Record<string, string | null>)[slotKey] = null
		}
	}

	return resultData
}

