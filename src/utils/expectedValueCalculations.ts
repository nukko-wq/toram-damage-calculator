/**
 * 期待値表示での計算ロジック
 */

import type { CalculatorData, EnemyFormData } from '@/types/calculator'
import type { CalculationResults } from '@/types/calculationResult'
import { getPresetEnemyById } from '@/utils/enemyDatabase'
import { calculateBossDifficultyStats } from '@/utils/bossDifficultyCalculation'
import { calculateRaidBossStats } from '@/utils/raidBossCalculation'
import { getAttackSkillById } from '@/data/attackSkills'

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
	
	// 最終命中率（100%でキャップ）
	return Math.min(100, baseHitRate + skillBonus)
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
			const adjustedStats = calculateBossDifficultyStats(enemy.level, enemy.stats, enemyFormData.difficulty)
			return adjustedStats.stats.resistCritical
		}

		// レイドボス調整
		if (enemy.category === 'raidBoss' && enemyFormData.raidBossLevel) {
			const adjustedStats = calculateRaidBossStats(enemy.id, enemyFormData.raidBossLevel)
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
			const adjustedStats = calculateBossDifficultyStats(enemy.level, enemy.stats, enemyFormData.difficulty)
			return adjustedStats.stats.requiredHIT
		}

		// レイドボス調整
		if (enemy.category === 'raidBoss' && enemyFormData.raidBossLevel) {
			const adjustedStats = calculateRaidBossStats(enemy.id, enemyFormData.raidBossLevel)
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
		? getAttackSkillById(calculatorData.attackSkill.selectedSkillId)?.mpCost || 0
		: 0
	
	// 計算
	const criticalRate = calculateCriticalRate(playerCriticalStat, enemyRequiredCritical)
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

// 期待値表示用のダミーデータ（実際の計算ロジック実装まで）
export const calculateExpectedValueData = (
	calculatorData: CalculatorData,
	calculationResults: CalculationResults | null,
	enemyFormData: EnemyFormData,
) => {
	const params = getExpectedValueParams(calculatorData, calculationResults, enemyFormData)
	
	return {
		expectedValue: 1250, // TODO: 実際の期待値計算
		averageStability: 92.5, // TODO: 実際の平均安定率計算
		powerEfficiency: 88.3, // TODO: 実際の威力発揮率計算
		params, // 基本情報タブで使用
	}
}