import { SkillHitCalculator } from './SkillHitCalculator'
import type { SkillCalculationInput, SkillCalculationResult } from '../types'

/**
 * Lブーメラン\u2162専用計算
 */
export class LBoomerang3Calculator extends SkillHitCalculator {
	calculate(input: SkillCalculationInput): SkillCalculationResult {
		const { hitNumber, playerStats } = input

		switch (hitNumber) {
			case 1: {
				// 1撃目: |1350+基礎DEX|%
				const multiplierValue = 1350 + playerStats.baseDEX
				const multiplier = Math.abs(multiplierValue)

				return {
					hitNumber: 1,
					calculatedMultiplier: multiplier,
					calculatedFixedDamage: 400,
					calculationProcess: `|1350+${playerStats.baseDEX}(基礎DEX)| = |${multiplierValue}| = ${multiplier}%`,
				}
			}

			case 2: {
				// 2撃目: |1500+基礎DEX|%
				const multiplierValue = 1500 + playerStats.baseDEX
				const multiplier = Math.abs(multiplierValue)

				return {
					hitNumber: 2,
					calculatedMultiplier: multiplier,
					calculatedFixedDamage: 400,
					calculationProcess: `|1500+${playerStats.baseDEX}(基礎DEX)| = |${multiplierValue}| = ${multiplier}%`,
				}
			}

			default:
				throw new Error(`Invalid hit number for L Boomerang 3: ${hitNumber}`)
		}
	}
}