import type { SkillCalculationInput, SkillCalculationResult } from '../types'
import { SkillHitCalculator } from './SkillHitCalculator'

/**
 * トールハンマー(追撃8hit)用計算機
 * - 1hit目: 固定倍率1500%, 固定値400
 * - 2hit目: (200+補正後INT×10%)×36の動的倍率, 固定値200
 */
export class ThorHammerFollowup8HitCalculator extends SkillHitCalculator {
	calculate(input: SkillCalculationInput): SkillCalculationResult {
		if (input.hitNumber === 1) {
			// 1hit目: メイン攻撃
			const multiplier = 1500
			const fixedDamage = 400

			return {
				hitNumber: 1,
				calculatedMultiplier: multiplier,
				calculatedFixedDamage: fixedDamage,
				calculationProcess: `トールハンマー(メイン): ${multiplier}% + 固定値${fixedDamage} (槍MATK参照)`,
			}
		} else if (input.hitNumber === 2) {
			// 2hit目: 追撃部分
			// (200+補正後INT×10%)×36の計算
			const adjustedINT = input.playerStats.adjustedINT
			const baseMultiplier = 200 + (adjustedINT * 0.1)
			const totalMultiplier = baseMultiplier * 36 // 1倍+2倍+3倍+4倍+5倍+6倍+7倍+8倍=36倍
			const fixedDamage = 200

			// 小数点第2位までに丸める
			const roundedMultiplier = Math.round(totalMultiplier * 100) / 100

			return {
				hitNumber: 2,
				calculatedMultiplier: roundedMultiplier,
				calculatedFixedDamage: fixedDamage,
				calculationProcess: `トールハンマー(追撃): (200+補正後INT(${adjustedINT})×10%)×36 = (200+${adjustedINT * 0.1})×36 = ${roundedMultiplier}% + 固定値${fixedDamage}`,
			}
		}

		// 想定外のhitNumber
		throw new Error(`Invalid hitNumber for ThorHammerFollowup8Hit: ${input.hitNumber}`)
	}
}