/**
 * DamagePreview.tsxの正しい方法を参考にしたダメージ差分計算フック
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
import { 
	calculateDamage,
	createDefaultDamageInput,
	type DamageCalculationInput,
} from '@/utils/damageCalculation'
import { simulateItemEquipSimple } from '@/utils/damageSimulationSimple'
import { getPresetEnemyById } from '@/utils/enemyDatabase'
import { calculateBossDifficultyStats } from '@/utils/bossDifficultyCalculation'

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

			// 1. 基準状態のダメージを計算
			const baselineResults = calculateResults(baselineData)
			const currentMaxDamage = calculateDamageFromResults(baselineResults, baselineData, powerOptions || {}, options.debug)
			
			// 2. シミュレーション後のステータスを計算
			const simulatedResults = calculateResults(simulatedData)
			const simulatedMaxDamage = calculateDamageFromResults(simulatedResults, simulatedData, powerOptions || {}, options.debug)
			
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

/**
 * DamagePreview.tsxと同じ方法でダメージを計算
 * （計算結果から直接ダメージを計算）
 */
function calculateDamageFromResults(
	calculationResults: unknown,
	data: CalculatorData,
	powerOptions: unknown,
	debug = false
): number {
	// 基本的な計算入力データを作成
	const defaultInput = createDefaultDamageInput()

	// 中央集約された計算結果を使用
	const totalATK = (calculationResults as any)?.basicStats.totalATK || 0
	const stabilityRate = (calculationResults as any)?.basicStats.stabilityRate || 85
	
	// デバッグログ
	if (debug) {
		console.log('💡 calculateDamageFromResults called with:', {
			totalATK,
			stabilityRate,
			calculationResults: calculationResults,
			basicStats: (calculationResults as any)?.basicStats,
			equipmentBonus1: (calculationResults as any)?.equipmentBonus1,
		})
	}
	
	// 敵情報を取得
	let enemyInfo = null
	if (data.enemy?.selectedEnemyId) {
		enemyInfo = getPresetEnemyById(data.enemy.selectedEnemyId)
	}

	// PowerOptionsに基づく属性攻撃設定
	const getElementAdvantageTotal = () => {
		const powerOpts = powerOptions as any
		// 属性攻撃が無効の場合は0を返す
		if (powerOpts.elementAttack === 'none') {
			return 0
		}

		// 基本ステータスから総属性有利を取得（装備・クリスタ・料理・バフ統合済み）
		const baseAdvantage = (calculationResults as any)?.basicStats?.totalElementAdvantage ?? 0

		// 属性威力オプションに応じて計算
		switch (powerOpts.elementPower) {
			case 'disabled':
				return 0 // 属性威力無効時は0
			case 'awakeningOnly':
				return 25 // 覚醒のみ時は25%固定
			case 'advantageOnly':
				return baseAdvantage // 装備品補正値1の総属性有利のみ
			case 'enabled':
				return baseAdvantage + 25 // 総属性有利 + 属性覚醒25%
			default:
				return baseAdvantage
		}
	}

	// PowerOptionsに基づく距離設定
	const getDistanceValues = () => {
		return {
			shortRange: (calculationResults as any)?.equipmentBonus1?.shortRangeDamage || 0,
			longRange: (calculationResults as any)?.equipmentBonus1?.longRangeDamage || 0,
		}
	}

	// Zustandストアのデータで入力を更新
	const distanceValues = getDistanceValues()

	// 敵情報を明示的に作成（ボス難易度適用）
	let finalEnemyDEF = enemyInfo?.stats.DEF ?? defaultInput.enemy.DEF
	let finalEnemyMDEF = enemyInfo?.stats.MDEF ?? defaultInput.enemy.MDEF
	let finalEnemyLevel = enemyInfo?.level ?? defaultInput.enemy.level

	// ボス系敵かつ難易度がnormal以外の場合、難易度調整を適用
	const powerOpts = powerOptions as any
	if (enemyInfo?.category === 'boss' && powerOpts.bossDifficulty !== 'normal') {
		const adjustedStats = calculateBossDifficultyStats(
			finalEnemyLevel,
			enemyInfo.stats,
			powerOpts.bossDifficulty,
		)
		finalEnemyLevel = adjustedStats.level
		finalEnemyDEF = adjustedStats.stats.DEF
		finalEnemyMDEF = adjustedStats.stats.MDEF
	}

	const input: DamageCalculationInput = {
		...defaultInput,
		playerLevel: data.baseStats.level,
		referenceStat: totalATK, // 計算済みの総ATKを使用
		// 敵情報を実際のデータに基づいて設定
		enemyLevel: finalEnemyLevel,
		stability: {
			rate: stabilityRate, // 計算済みの安定率を使用
		},
		critical: {
			damage: (calculationResults as any)?.basicStats?.criticalDamage || 100,
		},
		resistance: {
			physical: enemyInfo?.stats.physicalResistance ?? defaultInput.resistance.physical,
			magical: enemyInfo?.stats.magicalResistance ?? defaultInput.resistance.magical,
			weapon: 0,
		},
		enemy: {
			DEF: finalEnemyDEF,
			MDEF: finalEnemyMDEF,
			level: finalEnemyLevel,
			category: enemyInfo?.category ?? defaultInput.enemy.category,
			difficulty: powerOpts.bossDifficulty,
			hasDestruction: false, // TODO: 破壊状態設定
			guaranteedCritical: 0,
		},
		penetration: {
			physical: (calculationResults as any)?.equipmentBonus1?.physicalPenetration || 0,
			magical: (calculationResults as any)?.equipmentBonus1?.magicalPenetration || 0,
		},
		elementAdvantage: {
			total: getElementAdvantageTotal(),
			awakening: 0, // 総属性有利で統合計算されるため0
			isActive: getElementAdvantageTotal() > 0,
		},
		distance: {
			shortRange: distanceValues.shortRange,
			longRange: distanceValues.longRange,
		},
		// ユーザー設定（白ダメージで計算）
		userSettings: {
			familiarity: 100,
			currentDistance: 'disabled',
			damageType: 'white', // 最大ダメージを取得するため白ダメージ
		},
	}

	// ダメージ計算実行
	const damageResult = calculateDamage(input)
	
	if (debug) {
		console.log('🔥 DAMAGE CALCULATION RESULT:', {
			referenceStat: input.referenceStat,
			baseDamage: damageResult.baseDamage,
			maxDamage: damageResult.stabilityResult.maxDamage,
			minDamage: damageResult.stabilityResult.minDamage,
			stabilityRate: damageResult.stabilityResult.stabilityRate,
		})
	}
	
	// 白ダメージ計算：DamagePreviewと同じ方法を使用
	// 最大ダメージ = baseDamage（100%の安定率）
	// 最小ダメージ = baseDamage * stabilityRate / 100（切り捨て）
	const baseDamage = damageResult.baseDamage
	const currentStabilityRate = damageResult.stabilityResult.stabilityRate
	const maxDamage = baseDamage // DamagePreviewと同じ：最大ダメージ = baseDamage
	const minDamage = Math.floor((baseDamage * currentStabilityRate) / 100)
	
	if (debug) {
		console.log('🔥 WHITE DAMAGE CALCULATION (DamagePreview style):', {
			baseDamage,
			stabilityRate: currentStabilityRate,
			maxDamage,
			minDamage,
			'maxDamage === baseDamage': maxDamage === baseDamage,
		})
	}
	
	// ダメージタイプに応じて適切なダメージを返す
	// 現在は白ダメージで統一（DamagePreviewのデフォルト）
	return maxDamage
}