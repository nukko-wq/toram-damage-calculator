import type { SkillCalculationInput, SkillCalculationResult } from '../types'
import { SkillHitCalculator } from './SkillHitCalculator'

/**
 * 標準計算器（固定値スキル用）
 */
export class StandardCalculator extends SkillHitCalculator {
	calculate(input: SkillCalculationInput): SkillCalculationResult {
		const hit = this.getSkillHit(input.skillId, input.hitNumber)

		return {
			hitNumber: input.hitNumber,
			calculatedMultiplier: hit.multiplier, // 表示値をそのまま使用
			calculatedFixedDamage: hit.fixedDamage, // 表示値をそのまま使用
			calculationProcess: `Fixed values: ${hit.multiplier}%, ${hit.fixedDamage}`,
		}
	}
}
