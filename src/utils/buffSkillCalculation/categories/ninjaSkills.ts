/**
 * 忍者スキル系統の計算関数
 */

import type { AllBonuses } from '../../basicStatsCalculation'

/**
 * 忍道の効果を計算
 * 回避力 += スキルレベル × 1
 */
export function calculate忍道Effects(skillLevel: number): Partial<AllBonuses> {
	if (skillLevel <= 0) return {}

	return {
		Dodge: skillLevel * 1,
	}
}

/**
 * 忍者スキルのボーナスを取得
 */
export function getNinjaSkillBonuses(
	skills: Record<string, any> | null,
): Partial<AllBonuses> {
	const bonuses: Partial<AllBonuses> = {}

	if (!skills) return bonuses

	// 忍道 (mf2)
	const 忍道Skill = skills.mf2
	if (忍道Skill?.isEnabled && 忍道Skill.level > 0) {
		const 忍道Bonuses = calculate忍道Effects(忍道Skill.level)
		for (const [key, value] of Object.entries(忍道Bonuses)) {
			if (typeof value === 'number' && value !== 0) {
				bonuses[key as keyof AllBonuses] =
					(bonuses[key as keyof AllBonuses] || 0) + value
			}
		}
	}

	return bonuses
}
