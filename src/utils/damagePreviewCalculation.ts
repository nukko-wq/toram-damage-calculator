/**
 * 軽量ダメージ計算
 * プレビュー用の高速ダメージ計算を提供
 */

import type { CalculatorData } from '@/types/calculator'
import type { CalculationResults } from '@/types/calculationResult'
import type { DamagePreviewResult } from '@/types/damagePreview'
import { calculateResults } from '@/utils/calculationEngine'
import { 
	calculateDamage,
	createDefaultDamageInput,
	type DamageCalculationInput 
} from '@/utils/damageCalculation'

/**
 * ダメージプレビュー計算（軽量版）
 * 基本ステータス計算とダメージ計算を実行
 */
export function calculateDamagePreview(data: CalculatorData): DamagePreviewResult {
	try {
		// 1. 基本ステータス計算
		const calculationResults = calculateResults(data)
		
		// 2. ダメージ計算用の入力データを作成
		const damageInput = createDamageInputFromCalculatorData(data, calculationResults)
		
		// 3. ダメージ計算実行
		const damageResult = calculateDamage(damageInput)
		
		return {
			maxDamage: damageResult.stabilityResult.maxDamage,
			minDamage: damageResult.stabilityResult.minDamage,
			baseDamage: damageResult.baseDamage,
			averageDamage: damageResult.stabilityResult.averageDamage,
		}
	} catch (error) {
		console.error('Failed to calculate damage preview:', error)
		// エラー時はゼロ値を返す
		return {
			maxDamage: 0,
			minDamage: 0,
			baseDamage: 0,
			averageDamage: 0,
		}
	}
}

/**
 * 計算結果から現在の最大ダメージを取得
 */
export function getCurrentMaxDamage(results: CalculationResults | null): number {
	if (!results) return 0
	
	try {
		// DamagePreviewと同じロジックで計算入力データを作成
		const damageInput = createDamageInputFromResults(results)
		const damageResult = calculateDamage(damageInput)
		
		return damageResult.stabilityResult.maxDamage
	} catch (error) {
		console.error('Failed to get current max damage:', error)
		return 0
	}
}

/**
 * CalculatorDataとCalculationResultsからダメージ計算入力を作成
 */
export function createDamageInputFromCalculatorData(
	data: CalculatorData,
	results: CalculationResults,
): DamageCalculationInput {
	// デフォルト入力データを基準に作成
	const defaultInput = createDefaultDamageInput()
	
	try {
		return {
			...defaultInput,
			// 基本パラメータ
			playerLevel: data.baseStats.level,
			enemyLevel: data.enemy?.level || 100,
			referenceStatType: 'totalATK' as const,
			referenceStat: results.basicStats.totalATK,
			
			// 攻撃スキル（現在は通常攻撃固定）
			attackSkill: {
				type: 'physical' as const,
				multiplier: 100,
				fixedDamage: 0,
				supportedDistances: ['short', 'long'],
				canUseLongRange: true,
			},
			
			// 耐性
			resistance: {
				physical: data.enemy?.physicalResistance || 0,
				magical: data.enemy?.magicalResistance || 0,
				weapon: 0,
			},
			
			// 敵情報
			enemy: {
				DEF: data.enemy?.DEF || 100,
				MDEF: data.enemy?.MDEF || 100,
				level: data.enemy?.level || 100,
				category: data.enemy?.category || 'mob',
				difficulty: data.enemy?.difficulty,
				raidBossLevel: data.enemy?.raidBossLevel,
				hasDestruction: false, // 状態異常は未実装
				guaranteedCritical: 0,
			},
			
			// 貫通
			penetration: {
				physical: results.equipmentBonus1.physicalPenetration || 0,
				magical: results.equipmentBonus1.magicalPenetration || 0,
			},
			
			// 抜刀
			unsheathe: {
				fixedDamage: results.equipmentBonus1.unsheatheAttack || 0,
				rateBonus: 0, // 抜刀%は未実装
				isActive: false, // プレビューでは抜刀攻撃は考慮しない
			},
			
			// 属性有利
			elementAdvantage: {
				total: results.basicStats.totalElementAdvantage || 0,
				awakening: results.basicStats.elementAwakeningAdvantage || 0,
				isActive: false, // プレビューでは属性攻撃は考慮しない
			},
			
			// 距離
			distance: {
				shortRange: results.equipmentBonus1.shortRangeDamage || 0,
				longRange: results.equipmentBonus1.longRangeDamage || 0,
			},
			
			// コンボ
			combo: {
				isActive: false, // プレビューではコンボは考慮しない
				multiplier: 100,
			},
			
			// バフ倍率（未実装）
			passiveMultiplier: 0,
			braveMultiplier: 0,
			
			// ユーザー設定
			userSettings: {
				familiarity: 100,
				currentDistance: 'disabled' as const,
				damageType: 'white' as const,
			},
			
			// クリティカル・安定率
			critical: {
				damage: results.basicStats.criticalDamage || 100,
			},
			stability: {
				rate: results.basicStats.stabilityRate || 85,
			},
			
			// バフスキル（簡略版）
			buffSkills: {
				eternalNightmare: {
					isEnabled: false,
					level: 0,
				},
				totalDarkPowerLevel: 0,
			},
		}
	} catch (error) {
		console.error('Failed to create damage input from calculator data:', error)
		return defaultInput
	}
}

/**
 * CalculationResultsのみからダメージ計算入力を作成（既存結果用）
 */
export function createDamageInputFromResults(results: CalculationResults): DamageCalculationInput {
	const defaultInput = createDefaultDamageInput()
	
	try {
		return {
			...defaultInput,
			// 基本パラメータ（デフォルト値使用）
			referenceStat: results.basicStats.totalATK,
			
			// 貫通
			penetration: {
				physical: results.equipmentBonus1.physicalPenetration || 0,
				magical: results.equipmentBonus1.magicalPenetration || 0,
			},
			
			// 抜刀
			unsheathe: {
				fixedDamage: results.equipmentBonus1.unsheatheAttack || 0,
				rateBonus: 0,
				isActive: false,
			},
			
			// 属性有利
			elementAdvantage: {
				total: results.basicStats.totalElementAdvantage || 0,
				awakening: results.basicStats.elementAwakeningAdvantage || 0,
				isActive: false,
			},
			
			// 距離
			distance: {
				shortRange: results.equipmentBonus1.shortRangeDamage || 0,
				longRange: results.equipmentBonus1.longRangeDamage || 0,
			},
			
			// クリティカル・安定率
			critical: {
				damage: results.basicStats.criticalDamage || 100,
			},
			stability: {
				rate: results.basicStats.stabilityRate || 85,
			},
		}
	} catch (error) {
		console.error('Failed to create damage input from results:', error)
		return defaultInput
	}
}

/**
 * 軽量ダメージ計算（キャッシュ対応版）
 * 同じデータでの再計算を避けるためのメモ化版
 */
const damagePreviewCache = new Map<string, DamagePreviewResult>()

export function calculateDamagePreviewCached(
	data: CalculatorData,
	cacheKey?: string,
): DamagePreviewResult {
	// キャッシュキーが指定されていればキャッシュを確認
	if (cacheKey && damagePreviewCache.has(cacheKey)) {
		const cached = damagePreviewCache.get(cacheKey)!
		return cached
	}
	
	// 計算実行
	const result = calculateDamagePreview(data)
	
	// キャッシュに保存
	if (cacheKey) {
		damagePreviewCache.set(cacheKey, result)
	}
	
	return result
}

/**
 * キャッシュクリア
 */
export function clearDamagePreviewCache(): void {
	damagePreviewCache.clear()
}

/**
 * データからキャッシュキーを生成
 */
export function generateCacheKey(data: CalculatorData): string {
	try {
		// 計算に影響する主要データのハッシュを生成
		const relevantData = {
			baseStats: data.baseStats,
			mainWeapon: data.mainWeapon,
			subWeapon: data.subWeapon,
			equipment: data.equipment,
			crystals: data.crystals,
			buffItems: data.buffItems,
			food: data.food,
			buffSkills: data.buffSkills,
			enemy: data.enemy,
		}
		
		return JSON.stringify(relevantData)
	} catch (error) {
		console.error('Failed to generate cache key:', error)
		return Math.random().toString(36) // フォールバック
	}
}