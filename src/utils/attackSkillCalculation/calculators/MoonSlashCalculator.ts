import type { SkillCalculationInput, SkillCalculationResult } from '../types'
import { SkillHitCalculator } from './SkillHitCalculator'

/**
 * ムーンスラッシュ専用計算
 */
export class MoonSlashCalculator extends SkillHitCalculator {
	calculate(input: SkillCalculationInput): SkillCalculationResult {
		const { hitNumber, playerStats } = input

		switch (hitNumber) {
			case 1:
				return {
					hitNumber: 1,
					calculatedMultiplier: 1000, // 固定1000%
					calculatedFixedDamage: 400, // 固定400
					calculationProcess: 'Fixed: 1000%, 400',
				}

			case 2: {
				const multiplier = Math.abs(playerStats.adjustedSTR)
				const fixedDamage = Math.floor(playerStats.baseINT / 2)

				return {
					hitNumber: 2,
					calculatedMultiplier: multiplier,
					calculatedFixedDamage: fixedDamage,
					calculationProcess: `|${playerStats.adjustedSTR}| = ${multiplier}%, floor(${playerStats.baseINT}/2) = ${fixedDamage}`,
				}
			}

			default:
				throw new Error(`Invalid hit number for Moon Slash: ${hitNumber}`)
		}
	}
}
