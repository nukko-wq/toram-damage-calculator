import type { SkillCalculationInput, SkillCalculationResult } from '../types'
import { SkillHitCalculator } from './SkillHitCalculator'

/**
 * トールハンマー(単発)専用計算器
 * 
 * 固定倍率1500%、固定ダメージ400の槍MATK参照魔法攻撃スキル
 */
export class ThorHammerSingleCalculator extends SkillHitCalculator {
	calculate(input: SkillCalculationInput): SkillCalculationResult {
		// トールハンマー(単発)は固定値スキル
		const multiplier = 1500 // 固定倍率1500%
		const fixedDamage = 400 // 固定ダメージ400

		return {
			hitNumber: input.hitNumber,
			calculatedMultiplier: multiplier,
			calculatedFixedDamage: fixedDamage,
			calculationProcess: `トールハンマー(単発): ${multiplier}% + 固定値${fixedDamage} (槍MATK参照)`,
		}
	}
}