import type { SkillCalculationInput, SkillCalculationResult } from '../types'
import { SkillHitCalculator } from './SkillHitCalculator'

/**
 * ストームブレイザー(1スタック)専用計算
 */
export class StormBlazer1StackCalculator extends SkillHitCalculator {
	calculate(input: SkillCalculationInput): SkillCalculationResult {
		const { hitNumber, playerStats } = input

		switch (hitNumber) {
			case 1: {
				// 基本倍率75%（固定）
				const multiplier = 75

				// 固定ダメージ: 150 + 補正後VIT
				const fixedDamage = 150 + playerStats.adjustedVIT

				return {
					hitNumber: 1,
					calculatedMultiplier: multiplier,
					calculatedFixedDamage: fixedDamage,
					calculationProcess: `倍率: 75% | 固定値: 150 + ${playerStats.adjustedVIT} = ${fixedDamage}`,
				}
			}

			default:
				throw new Error(
					`Invalid hit number for Storm Blazer (1 Stack): ${hitNumber}`,
				)
		}
	}
}
