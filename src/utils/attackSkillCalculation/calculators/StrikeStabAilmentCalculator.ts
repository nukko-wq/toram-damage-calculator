import type { SkillCalculationInput, SkillCalculationResult } from '../types'
import { SkillHitCalculator } from './SkillHitCalculator'

/**
 * ストライクスタブ(敵状態異常時)専用計算
 */
export class StrikeStabAilmentCalculator extends SkillHitCalculator {
	calculate(input: SkillCalculationInput): SkillCalculationResult {
		const { hitNumber, playerStats, equipmentContext } = input

		// 倍率計算: 300+補正後STR/5 (旋風槍装備時400+補正後STR/5)
		const baseMultiplier = equipmentContext.hasHalberdEquipped ? 400 : 300
		const multiplierValue = baseMultiplier + playerStats.adjustedSTR / 5
		const multiplier = Number(multiplierValue.toFixed(2))

		// 固定値計算: 100 (旋風槍装備時+100)
		const baseFixedDamage = 100
		const equipmentBonus = equipmentContext.hasHalberdEquipped ? 100 : 0
		const fixedDamage = baseFixedDamage + equipmentBonus

		return {
			hitNumber,
			calculatedMultiplier: multiplier,
			calculatedFixedDamage: fixedDamage,
			calculationProcess: `${baseMultiplier}+${playerStats.adjustedSTR}/5 = ${baseMultiplier}+${(playerStats.adjustedSTR / 5).toFixed(2)} = ${multiplier}%, 100${
				equipmentBonus > 0 ? '+100(旋風槍)' : ''
			} = ${fixedDamage}`,
		}
	}
}
