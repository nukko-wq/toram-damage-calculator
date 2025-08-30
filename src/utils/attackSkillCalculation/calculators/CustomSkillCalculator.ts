import { useCustomSkillStore } from '../../../stores/customSkillStore'
import type { SkillCalculationInput, SkillCalculationResult } from '../types'
import { SkillHitCalculator } from './SkillHitCalculator'

/**
 * カスタムスキル計算器（ユーザー設定値使用）
 */
export class CustomSkillCalculator extends SkillHitCalculator {
	calculate(input: SkillCalculationInput): SkillCalculationResult {
		// ユーザー設定を取得
		const settings = useCustomSkillStore.getState().settings

		return {
			hitNumber: input.hitNumber,
			calculatedMultiplier: settings.multiplier,
			calculatedFixedDamage: settings.fixedDamage,
			calculationProcess: `Custom: ${settings.multiplier}%, ${settings.fixedDamage}`,
		}
	}
}
