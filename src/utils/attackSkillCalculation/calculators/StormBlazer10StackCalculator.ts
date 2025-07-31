import { SkillHitCalculator } from './SkillHitCalculator'
import type { SkillCalculationInput, SkillCalculationResult } from '../types'

/**
 * ストームブレイザー(10スタック)専用計算
 */
export class StormBlazer10StackCalculator extends SkillHitCalculator {
	calculate(input: SkillCalculationInput): SkillCalculationResult {
		const { hitNumber, playerStats } = input

		switch (hitNumber) {
			case 1: {
				// 基本倍率1000%（固定）
				const multiplier = 1000

				// 固定ダメージ: 200 + 補正後VIT
				const fixedDamage = 200 + playerStats.adjustedVIT

				return {
					hitNumber: 1,
					calculatedMultiplier: multiplier,
					calculatedFixedDamage: fixedDamage,
					calculationProcess: `倍率: 1000% | 固定値: 200 + ${playerStats.adjustedVIT} = ${fixedDamage}`,
				}
			}

			default:
				throw new Error(
					`Invalid hit number for Storm Blazer (10 Stack): ${hitNumber}`,
				)
		}
	}
}
