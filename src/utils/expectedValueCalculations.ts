/**
 * 期待値表示での計算ロジック
 */

import { getAttackSkillById } from '@/data/attackSkills'
import type { CalculationResults } from '@/types/calculationResult'
import type {
	CalculatorData,
	EnemyFormData,
	WeaponType,
} from '@/types/calculator'
import { calculateBossDifficultyStats } from '@/utils/bossDifficultyCalculation'
import { calculateDamageWithService } from '@/utils/damageCalculationService'
import { getPresetEnemyById } from '@/utils/enemyDatabase'
import { calculateRaidBossStats } from '@/utils/raidBossCalculation'

// 武器種別の最低保証HIT率を取得
export const getMinimumGuaranteedHitRate = (weaponType: WeaponType): number => {
	switch (weaponType) {
		case '片手剣':
			return 25
		case '両手剣':
			return 15
		case '弓':
			return 10
		case '自動弓':
			return 5
		case '杖':
			return 30
		case '魔導具':
			return 10
		case '手甲':
			return 10
		case '旋風槍':
			return 20
		case '抜刀剣':
			return 30
		case '素手':
			return 50
		default:
			return 0 // 不明な武器種の場合
	}
}

// クリティカル発生率を計算
export const calculateCriticalRate = (
	playerCriticalRate: number,
	enemyRequiredCritical: number,
): number => {
	if (enemyRequiredCritical <= 100) {
		// 敵の確定クリティカル ≤ 100の場合
		return Math.min(100, (playerCriticalRate / enemyRequiredCritical) * 100)
	} else {
		// 敵の確定クリティカル > 100の場合
		return Math.max(0, 100 - (enemyRequiredCritical - playerCriticalRate))
	}
}

// 命中率を計算
export const calculateHitRate = (
	playerHitValue: number,
	requiredHit: number,
	skillMpCost: number = 0,
): number => {
	// 基本命中率
	const baseHitRate = 100 - (requiredHit - playerHitValue) / 3

	// スキル補正
	const skillBonus = skillMpCost / 10

	// 最終命中率（0%～100%でキャップ、小数点以下切り捨て）
	return Math.floor(Math.max(0, Math.min(100, baseHitRate + skillBonus)))
}

// 期待値計算用のパラメーターを取得
export interface ExpectedValueParams {
	criticalRate: number
	hitRate: number
	playerCriticalStat: number
	enemyRequiredCritical: number
	playerHitStat: number
	enemyRequiredHit: number
	skillMpCost: number
}

// 敵の確定クリティカル値を取得
const getEnemyResistCritical = (enemyFormData: EnemyFormData): number => {
	// 手動調整値がある場合はそれを優先
	if (enemyFormData.manualOverrides?.resistCritical != null) {
		return enemyFormData.manualOverrides.resistCritical
	}

	// 選択された敵がない場合は100
	if (!enemyFormData.selectedId || !enemyFormData.type) {
		return 100
	}

	// プリセット敵の場合
	if (enemyFormData.type === 'preset') {
		const enemy = getPresetEnemyById(enemyFormData.selectedId)
		if (!enemy) return 100

		// ボス難易度調整
		if (enemy.category === 'boss' && enemyFormData.difficulty) {
			const adjustedStats = calculateBossDifficultyStats(
				enemy.level,
				enemy.stats,
				enemyFormData.difficulty,
			)
			return adjustedStats.stats.resistCritical
		}

		// レイドボス調整
		if (enemy.category === 'raidBoss' && enemyFormData.raidBossLevel) {
			const adjustedStats = calculateRaidBossStats(
				enemy.id,
				enemyFormData.raidBossLevel,
			)
			return adjustedStats.resistCritical
		}

		return enemy.stats.resistCritical
	}

	// カスタム敵の場合（未実装）
	return 100
}

// 敵の必要HIT値を取得
const getEnemyRequiredHit = (enemyFormData: EnemyFormData): number => {
	// 手動調整値がある場合はそれを優先
	if (enemyFormData.manualOverrides?.requiredHIT != null) {
		return enemyFormData.manualOverrides.requiredHIT
	}

	// 選択された敵がない場合は0
	if (!enemyFormData.selectedId || !enemyFormData.type) {
		return 0
	}

	// プリセット敵の場合
	if (enemyFormData.type === 'preset') {
		const enemy = getPresetEnemyById(enemyFormData.selectedId)
		if (!enemy) return 0

		// ボス難易度調整
		if (enemy.category === 'boss' && enemyFormData.difficulty) {
			const adjustedStats = calculateBossDifficultyStats(
				enemy.level,
				enemy.stats,
				enemyFormData.difficulty,
			)
			return adjustedStats.stats.requiredHIT
		}

		// レイドボス調整
		if (enemy.category === 'raidBoss' && enemyFormData.raidBossLevel) {
			const adjustedStats = calculateRaidBossStats(
				enemy.id,
				enemyFormData.raidBossLevel,
			)
			return adjustedStats.requiredHIT
		}

		return enemy.stats.requiredHIT
	}

	// カスタム敵の場合（未実装）
	return 0
}

// 計算データから期待値パラメーターを抽出
export const getExpectedValueParams = (
	calculatorData: CalculatorData,
	calculationResults: CalculationResults | null,
	enemyFormData: EnemyFormData,
): ExpectedValueParams => {
	// StatusPreviewの基本ステータスから取得
	const playerCriticalStat = calculationResults?.basicStats?.criticalRate || 0
	const playerHitStat = calculationResults?.basicStats?.HIT || 0

	// 敵情報から取得
	const enemyRequiredCritical = getEnemyResistCritical(enemyFormData)
	const enemyRequiredHit = getEnemyRequiredHit(enemyFormData)

	// AttackSkillFormから取得
	const skillMpCost = calculatorData.attackSkill.selectedSkillId
		? getAttackSkillById(calculatorData.attackSkill.selectedSkillId)?.mpCost ||
			0
		: 0

	// 計算
	const criticalRate = calculateCriticalRate(
		playerCriticalStat,
		enemyRequiredCritical,
	)
	const hitRate = calculateHitRate(playerHitStat, enemyRequiredHit, skillMpCost)

	return {
		criticalRate,
		hitRate,
		playerCriticalStat,
		enemyRequiredCritical,
		playerHitStat,
		enemyRequiredHit,
		skillMpCost,
	}
}

// 発生割合データの型定義
export interface OccurrenceRatioData {
	critical: number
	graze: number // クリティカル時のGraze
	white: number // 白ダメ（非クリティカル時の命中 + 保証HITによるGraze）
	miss: number
}

// 与ダメージ割合データの型定義（ミス除外）
export interface DamageRatioData {
	critical: number
	graze: number
	white: number
}

// 保証HIT率を考慮した実際の命中率を計算
export const calculateActualHitRate = (
	hitRate: number,
	weaponType: WeaponType,
): number => {
	const guaranteedHitRate = getMinimumGuaranteedHitRate(weaponType)
	return Math.max(hitRate, guaranteedHitRate)
}

// 発生割合を計算（保証HIT率考慮）
export const calculateOccurrenceRatio = (
	criticalRate: number,
	hitRate: number,
	weaponType: WeaponType,
): OccurrenceRatioData => {
	const guaranteedHitRate = getMinimumGuaranteedHitRate(weaponType)
	const actualHitRate = Math.max(hitRate, guaranteedHitRate)

	// クリティカル系の内訳
	const critical = (criticalRate * hitRate) / 100
	const graze = (criticalRate * (100 - hitRate)) / 100 // クリティカル時のGraze

	// 非クリティカル系の内訳
	const nonCriticalTotal = 100 - criticalRate
	const white = (nonCriticalTotal * actualHitRate) / 100 // 白ダメ（通常命中 + 保証HITによるGraze）
	const miss = (nonCriticalTotal * (100 - actualHitRate)) / 100

	return {
		critical: critical, // 正確な計算値
		graze: graze, // クリティカル時のGraze
		white: white, // 白ダメ（保証HIT含む）
		miss: miss, // 正確な計算値
	}
}

// 与ダメージ割合を計算（ミス除外して正規化）
export const calculateDamageRatio = (
	occurrenceRatio: OccurrenceRatioData,
): DamageRatioData => {
	const { critical, graze, white } = occurrenceRatio
	const totalEffectiveDamage = critical + graze + white

	// 有効ダメージが0の場合は全て0%
	if (totalEffectiveDamage === 0) {
		return {
			critical: 0,
			graze: 0,
			white: 0,
		}
	}

	// 正規化（ミスを除外して100%とする）
	return {
		critical: (critical / totalEffectiveDamage) * 100,
		graze: (graze / totalEffectiveDamage) * 100,
		white: (white / totalEffectiveDamage) * 100,
	}
}

// Critical系の割合を計算（Critical + Graze = 100%として正規化）
export const calculateCriticalSystemRatio = (
	criticalRate: number,
	grazeRate: number,
): { criticalRatio: number; grazeRatio: number } => {
	const total = criticalRate + grazeRate

	// 合計が0の場合は0%とする
	if (total === 0) {
		return {
			criticalRatio: 0,
			grazeRatio: 0,
		}
	}

	return {
		criticalRatio: (criticalRate / total) * 100,
		grazeRatio: (grazeRate / total) * 100,
	}
}

// 平均安定率を計算
export const calculateAverageStability = (
	calculatorData: CalculatorData,
	calculationResults: CalculationResults | null,
	occurrenceRatio: OccurrenceRatioData,
	adaptationMultiplier: number = 100,
): number => {
	if (!calculationResults) return 0

	// Critical系の割合を計算
	const { criticalRatio, grazeRatio } = calculateCriticalSystemRatio(
		occurrenceRatio.critical,
		occurrenceRatio.graze,
	)

	// Critical時の安定率を取得
	const criticalDamageResult = calculateDamageWithService(
		calculatorData,
		calculationResults,
		{
			powerOptions: {
				...(calculatorData.powerOptions || {}),
				damageType: 'critical',
			},
			adaptationMultiplier,
		},
	)
	const criticalStability = criticalDamageResult.normal.averageStability

	// Graze時の安定率を取得
	const grazeDamageResult = calculateDamageWithService(
		calculatorData,
		calculationResults,
		{
			powerOptions: {
				...(calculatorData.powerOptions || {}),
				damageType: 'graze',
			},
			adaptationMultiplier,
		},
	)
	const grazeStability = grazeDamageResult.normal.averageStability

	// 加重平均による平均安定率算出
	if (criticalRatio + grazeRatio === 0) return 0

	return (criticalStability * criticalRatio + grazeStability * grazeRatio) / 100
}

// 期待値を計算
export const calculateExpectedValue = (
	calculatorData: CalculatorData,
	calculationResults: CalculationResults | null,
	occurrenceRatio: OccurrenceRatioData,
	adaptationMultiplier: number = 100,
): number => {
	if (!calculationResults) return 0

	// 各ダメージタイプの平均ダメージを取得
	const criticalDamageResult = calculateDamageWithService(
		calculatorData,
		calculationResults,
		{
			powerOptions: {
				...(calculatorData.powerOptions || {}),
				damageType: 'critical',
			},
			adaptationMultiplier,
		},
	)
	const criticalDamage = criticalDamageResult.normal.average

	const grazeDamageResult = calculateDamageWithService(
		calculatorData,
		calculationResults,
		{
			powerOptions: {
				...(calculatorData.powerOptions || {}),
				damageType: 'graze',
			},
			adaptationMultiplier,
		},
	)
	const grazeDamage = grazeDamageResult.normal.average

	const whiteDamageResult = calculateDamageWithService(
		calculatorData,
		calculationResults,
		{
			powerOptions: {
				...(calculatorData.powerOptions || {}),
				damageType: 'white',
			},
			adaptationMultiplier,
		},
	)
	const whiteDamage = whiteDamageResult.normal.average

	// ミスダメージは0
	const missDamage = 0

	// 期待値計算（発生割合による加重平均）
	const expectedValue =
		(criticalDamage * occurrenceRatio.critical +
			grazeDamage * occurrenceRatio.graze +
			whiteDamage * occurrenceRatio.white +
			missDamage * occurrenceRatio.miss) /
		100

	// 計算過程をコンソールログで表示（開発環境のみ）
	if (process.env.NODE_ENV === 'development') {
		console.group('期待値計算の詳細')
		console.log('発生割合:', occurrenceRatio)
		console.log('Criticalダメージ:', criticalDamage)
		console.log('Grazeダメージ:', grazeDamage)
		console.log('白ダメダメージ:', whiteDamage)
		console.log('ミスダメージ:', missDamage)
		console.log(
			'計算式:',
			`(${criticalDamage} × ${occurrenceRatio.critical}% + ${grazeDamage} × ${occurrenceRatio.graze}% + ${whiteDamage} × ${occurrenceRatio.white}% + ${missDamage} × ${occurrenceRatio.miss}%) ÷ 100`,
		)
		console.log('期待値（小数）:', expectedValue)
		console.log('期待値（整数）:', Math.floor(expectedValue))
		console.groupEnd()
	}

	return Math.floor(expectedValue)
}

// 威力発揮率を計算
export const calculatePowerEfficiency = (
	calculatorData: CalculatorData,
	calculationResults: CalculationResults | null,
	expectedValue: number,
	adaptationMultiplier: number = 100,
): number => {
	if (!calculationResults || expectedValue === 0) return 0

	// Criticalダメージの平均値を取得
	const criticalDamageResult = calculateDamageWithService(
		calculatorData,
		calculationResults,
		{
			powerOptions: {
				...(calculatorData.powerOptions || {}),
				damageType: 'critical',
			},
			adaptationMultiplier,
		},
	)
	const criticalAverageDamage = criticalDamageResult.normal.average

	if (criticalAverageDamage === 0) return 0

	// 威力発揮率 = (期待値 ÷ Criticalの平均ダメージ) × 100
	const powerEfficiency = (expectedValue / criticalAverageDamage) * 100

	return Math.round(powerEfficiency * 100) / 100 // 小数点第2位まで
}

// 期待値表示用のデータ計算
export const calculateExpectedValueData = (
	calculatorData: CalculatorData,
	calculationResults: CalculationResults | null,
	enemyFormData: EnemyFormData,
	adaptationMultiplier: number = 100,
) => {
	const params = getExpectedValueParams(
		calculatorData,
		calculationResults,
		enemyFormData,
	)
	const weaponType = calculatorData.mainWeapon.weaponType
	const occurrenceRatio = calculateOccurrenceRatio(
		params.criticalRate,
		params.hitRate,
		weaponType,
	)
	const damageRatio = calculateDamageRatio(occurrenceRatio)

	// 期待値を計算
	const expectedValue = calculateExpectedValue(
		calculatorData,
		calculationResults,
		occurrenceRatio,
		adaptationMultiplier,
	)

	// 平均安定率を計算
	const averageStability = calculateAverageStability(
		calculatorData,
		calculationResults,
		occurrenceRatio,
		adaptationMultiplier,
	)

	// 威力発揮率を計算
	const powerEfficiency = calculatePowerEfficiency(
		calculatorData,
		calculationResults,
		expectedValue,
		adaptationMultiplier,
	)

	return {
		expectedValue, // 実際の期待値計算
		averageStability: Math.round(averageStability * 10) / 10, // 小数点以下1桁で丸める
		powerEfficiency, // 実際の威力発揮率計算
		params, // 基本情報タブで使用
		occurrenceRatio, // 割合表示タブで使用（発生割合）
		damageRatio, // 割合表示タブで使用（与ダメージ割合）
	}
}
