import { SkillHitCalculator } from './SkillHitCalculator'
import type { SkillCalculationInput, SkillCalculationResult } from '../types'

/**
 * ストライクスタブ専用計算
 */
export class StrikeStabCalculator extends SkillHitCalculator {
	calculate(input: SkillCalculationInput): SkillCalculationResult {
		const { hitNumber, playerStats, equipmentContext } = input

		// 倍率計算: |200+補正後STR/5|%
		const multiplierValue = 200 + playerStats.adjustedSTR / 5
		const multiplier = Number(Math.abs(multiplierValue).toFixed(2))

		// 固定値計算: 100 (旋風槍装備時+100)
		const baseFixedDamage = 100
		const equipmentBonus = equipmentContext.hasHalberdEquipped ? 100 : 0
		const fixedDamage = baseFixedDamage + equipmentBonus

		return {
			hitNumber,
			calculatedMultiplier: multiplier,
			calculatedFixedDamage: fixedDamage,
			calculationProcess: `|200+${playerStats.adjustedSTR}/5| = |${multiplierValue.toFixed(2)}| = ${multiplier}%, 100${
				equipmentBonus > 0 ? '+100(旋風槍)' : ''
			} = ${fixedDamage}`,
		}
	}
}