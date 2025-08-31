import { SkillHitCalculator } from './SkillHitCalculator'
import type { SkillCalculationInput, SkillCalculationResult } from '../types'

/**
 * ファントムミサイル専用計算器
 * 10hit攻撃、漸増威力（100%→700%、合計4000%）
 * 計算式: n hit目 = 100 + (200/3) × (n-1) %
 */
export class PhantomMissileCalculator extends SkillHitCalculator {
	calculate(input: SkillCalculationInput): SkillCalculationResult {
		const { hitNumber } = input

		if (hitNumber < 1 || hitNumber > 10) {
			throw new Error(`Invalid hit number for Phantom Missile: ${hitNumber}`)
		}

		// 計算式: n hit目 = 100 + (200/3) × (n-1) %
		const multiplier = Math.floor(100 + (200 / 3) * (hitNumber - 1))
		const fixedDamage = 500

		return {
			hitNumber,
			calculatedMultiplier: multiplier,
			calculatedFixedDamage: fixedDamage,
			calculationProcess: `100 + (200/3) × ${hitNumber - 1} = ${multiplier}%, 固定500`,
		}
	}
}