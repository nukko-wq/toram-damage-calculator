/**
 * DamagePreview.tsxの正しい方法を参考にしたダメージ差分計算フック
 */

import { useMemo } from 'react'
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

		// アイテム、データ、または計算結果がない場合
		if (!item || !currentData || !currentResults) {
			if (options.debug) {
				console.log('❌ Missing item, data, or currentResults:', { 
					item: !!item, 
					currentData: !!currentData, 
					currentResults: !!currentResults 
				})
			}
			return initialResult
		}

		if (options.debug) {
			console.log('✅ Starting correct damage difference calculation for:', item.name)
		}

		try {

			// 1. 現在のダメージを計算（DamagePreview.tsxと同じ方法）
			const currentMaxDamage = calculateDamageFromResults(currentResults, currentData, powerOptions || {}, options.debug)
			
			// 2. アイテム装着をシミュレーション
			const simulatedData = simulateItemEquipSimple(currentData, item, slotInfo)
			
			// 3. シミュレーション後のステータスを計算
			const simulatedResults = calculateResults(simulatedData)
			
			// デバッグログ: calculateResults実行後
			if (options.debug) {
				console.log('⚙️  CALCULATE RESULTS COMPARISON:', {
					'=== CURRENT RESULTS ===': '======================',
					currentBasicStats: currentResults.basicStats,
					currentEquipmentBonus1: currentResults.equipmentBonus1,
					'=== SIMULATED RESULTS ===': '====================',
					simulatedBasicStats: simulatedResults.basicStats,
					simulatedEquipmentBonus1: simulatedResults.equipmentBonus1,
					'=== COMPARISON ===': '===========================',
					atkDifference: simulatedResults.basicStats.totalATK - currentResults.basicStats.totalATK,
					strDifference: simulatedResults.adjustedStats.STR - currentResults.adjustedStats.STR,
					criticalRateDifference: simulatedResults.equipmentBonus1.criticalRate - currentResults.equipmentBonus1.criticalRate,
					vitDifference: simulatedResults.adjustedStats.VIT - currentResults.adjustedStats.VIT,
				})
			}
			
			// 4. シミュレーション後のダメージを計算（DamagePreview.tsxと同じ方法）
			const simulatedMaxDamage = calculateDamageFromResults(simulatedResults, simulatedData, powerOptions || {}, options.debug)
			
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
					currentTotalATK: currentResults.basicStats.totalATK,
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
					currentTotalATK: currentResults.basicStats.totalATK,
					currentMaxDamage: currentMaxDamage,
					'=== SIMULATED DATA ===': '=================',
					simulatedCrystals: simulatedData.crystals,
					simulatedTotalATK: simulatedResults.basicStats.totalATK,
					simulatedMaxDamage: simulatedMaxDamage,
					'=== DIFFERENCE ===': '=================',
					attackDifference: simulatedResults.basicStats.totalATK - currentResults.basicStats.totalATK,
					damageDifference: difference,
					'=== BONUS COMPARISON ===': '=================',
					currentEquipmentBonus1: currentResults.equipmentBonus1,
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
	
	// 最大ダメージを返す
	return damageResult.stabilityResult.maxDamage
}