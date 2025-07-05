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
			// ダメージ計算のログを一時的に無効化
			const originalConsoleLog = console.log
			if (!options.debug) {
				console.log = () => {}
			}

			// 1. 現在のダメージを計算（DamagePreview.tsxと同じ方法）
			const currentMaxDamage = calculateDamageFromResults(currentResults, currentData, powerOptions || {})
			
			// 2. アイテム装着をシミュレーション
			const simulatedData = simulateItemEquipSimple(currentData, item, slotInfo)
			
			// 3. シミュレーション後のステータスを計算
			const simulatedResults = calculateResults(simulatedData)
			
			// 4. シミュレーション後のダメージを計算（DamagePreview.tsxと同じ方法）
			const simulatedMaxDamage = calculateDamageFromResults(simulatedResults, simulatedData, powerOptions || {})
			
			// console.logを復元
			if (!options.debug) {
				console.log = originalConsoleLog
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
	calculationResults: any,
	data: CalculatorData,
	powerOptions: any
): number {
	// 基本的な計算入力データを作成
	const defaultInput = createDefaultDamageInput()

	// 中央集約された計算結果を使用
	const totalATK = calculationResults?.basicStats.totalATK || 0
	const stabilityRate = calculationResults?.basicStats.stabilityRate || 85
	
	// 敵情報を取得
	let enemyInfo = null
	if (data.enemy?.selectedEnemyId) {
		enemyInfo = getPresetEnemyById(data.enemy.selectedEnemyId)
	}

	// PowerOptionsに基づく属性攻撃設定
	const getElementAdvantageTotal = () => {
		// 属性攻撃が無効の場合は0を返す
		if (powerOptions.elementAttack === 'none') {
			return 0
		}

		// 基本ステータスから総属性有利を取得（装備・クリスタ・料理・バフ統合済み）
		const baseAdvantage = calculationResults?.basicStats?.totalElementAdvantage ?? 0

		// 属性威力オプションに応じて計算
		switch (powerOptions.elementPower) {
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
			shortRange: calculationResults?.equipmentBonus1?.shortRangeDamage || 0,
			longRange: calculationResults?.equipmentBonus1?.longRangeDamage || 0,
		}
	}

	// Zustandストアのデータで入力を更新
	const distanceValues = getDistanceValues()

	// 敵情報を明示的に作成（ボス難易度適用）
	let finalEnemyDEF = enemyInfo?.stats.DEF ?? defaultInput.enemy.DEF
	let finalEnemyMDEF = enemyInfo?.stats.MDEF ?? defaultInput.enemy.MDEF
	let finalEnemyLevel = enemyInfo?.level ?? defaultInput.enemy.level

	// ボス系敵かつ難易度がnormal以外の場合、難易度調整を適用
	if (enemyInfo?.category === 'boss' && powerOptions.bossDifficulty !== 'normal') {
		const adjustedStats = calculateBossDifficultyStats(
			finalEnemyLevel,
			enemyInfo.stats,
			powerOptions.bossDifficulty,
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
			damage: calculationResults?.basicStats?.criticalDamage || 100,
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
			difficulty: powerOptions.bossDifficulty,
			hasDestruction: false, // TODO: 破壊状態設定
			guaranteedCritical: 0,
		},
		penetration: {
			physical: calculationResults?.equipmentBonus1?.physicalPenetration || 0,
			magical: calculationResults?.equipmentBonus1?.magicalPenetration || 0,
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
	
	// 最大ダメージを返す
	return damageResult.stabilityResult.maxDamage
}