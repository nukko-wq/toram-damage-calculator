import type { SkillCalculationInput, SkillCalculationResult } from '../types'
import { SkillHitCalculator } from './SkillHitCalculator'

/**
 * サイクロンアロー専用計算器
 * サブ武器による倍率補正を実装
 */
export class CycloneArrowCalculator extends SkillHitCalculator {
	calculate(input: SkillCalculationInput): SkillCalculationResult {
		const baseMultiplier = 100 // 基本倍率100%
		let arrowBonus = 0

		// サブ武器による補正
		if (input.equipmentContext.subWeaponType === '矢') {
			arrowBonus = Math.floor(input.playerStats.adjustedDEX / 2) // +補正後DEX/2%
		}

		const finalMultiplier = baseMultiplier + arrowBonus

		return {
			hitNumber: input.hitNumber,
			calculatedMultiplier: finalMultiplier,
			calculatedFixedDamage: 100, // 固定値100
			calculationProcess: `100% + ${arrowBonus}% (矢装備補正) = ${finalMultiplier}%`,
		}
	}
}
