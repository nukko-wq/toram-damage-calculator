/**
 * ダークパワースキル系統のバフスキル計算
 */

import type { BuffSkillState } from '@/types/buffSkill'
import type { AllBonuses } from '../../basicStatsCalculation'

/**
 * エターナルナイトメアの効果計算関数
 */
export function calculateEternalNightmareEffects(
	skillLevel: number,
	skillPointTotal: number,
): Partial<AllBonuses> {
	if (!skillLevel || skillLevel === 0) return {}

	// HP率は絶対値を使用（|2 × スキルレベル|%）
	const hpRate = Math.abs(2 * skillLevel)

	return {
		HP_Rate: hpRate,
		DarkResistance_Rate: 5, // 闇耐性+5%
		LightResistance_Rate: -5, // 光耐性-5%
		// 敵DEF・MDEF低下効果は将来実装予定
		// enemyDefReduction: skillPointTotal * (skillLevel * 0.5)
		// enemyMDefReduction: skillPointTotal * (skillLevel * 0.5)
	}
}

/**
 * エターナルナイトメアの効果を取得
 */
export function getEternalNightmareEffects(
	buffSkillData: Record<string, BuffSkillState> | null,
): Partial<AllBonuses> {
	if (!buffSkillData) return {}

	const eternalNightmare = buffSkillData.dp1

	if (eternalNightmare?.isEnabled) {
		// multiParam型の場合は multiParam1, multiParam2 を使用
		// level型の場合は level を使用
		let skillLevel = 10 // デフォルト値
		let skillPointTotal = 80 // デフォルト値

		if (eternalNightmare.multiParam1 && eternalNightmare.multiParam2) {
			skillLevel = eternalNightmare.multiParam1
			skillPointTotal = eternalNightmare.multiParam2
		} else if (eternalNightmare.level) {
			skillLevel = eternalNightmare.level
			// specialParamがスキルポイント合計として使われているかチェック
			skillPointTotal = eternalNightmare.specialParam || 80
		}

		const effects = calculateEternalNightmareEffects(
			skillLevel,
			skillPointTotal,
		)
		return effects
	}

	return {}
}

/**
 * ダークパワースキル系統の統合効果を取得
 */
export function getDarkPowerSkillBonuses(
	buffSkillData: Record<string, BuffSkillState> | null,
): Partial<AllBonuses> {
	const bonuses: Partial<AllBonuses> = {}

	if (!buffSkillData) return bonuses

	// エターナルナイトメアの効果を統合
	const eternalNightmareBonuses = getEternalNightmareEffects(buffSkillData)
	for (const [key, value] of Object.entries(eternalNightmareBonuses)) {
		if (typeof value === 'number' && value !== 0) {
			bonuses[key as keyof AllBonuses] =
				(bonuses[key as keyof AllBonuses] || 0) + value
		}
	}

	return bonuses
}
