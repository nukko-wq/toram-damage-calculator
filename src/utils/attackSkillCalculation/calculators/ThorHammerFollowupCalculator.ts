import type { SkillCalculationInput, SkillCalculationResult } from '../types'
import { SkillHitCalculator } from './SkillHitCalculator'

/**
 * トールハンマー(追撃3hit)専用計算器
 * 
 * 1hit目: 固定倍率1500%、固定ダメージ400
 * 2hit目: (200+補正後INT×10%)×6倍率、固定ダメージ200の追撃部分
 */
export class ThorHammerFollowupCalculator extends SkillHitCalculator {
	calculate(input: SkillCalculationInput): SkillCalculationResult {
		if (input.hitNumber === 1) {
			// 1hit目: メイン攻撃（トールハンマー単発と同じ）
			const multiplier = 1500 // 固定倍率1500%
			const fixedDamage = 400 // 固定ダメージ400

			return {
				hitNumber: 1,
				calculatedMultiplier: multiplier,
				calculatedFixedDamage: fixedDamage,
				calculationProcess: `トールハンマー(メイン): ${multiplier}% + 固定値${fixedDamage} (槍MATK参照)`,
			}
		} else if (input.hitNumber === 2) {
			// 2hit目: 追撃部分
			// (200+補正後INT×10%)×6の計算
			const adjustedINT = input.playerStats.adjustedINT
			const baseMultiplier = 200 + (adjustedINT * 0.1)
			const totalMultiplier = baseMultiplier * 6 // 1倍+2倍+3倍=6倍
			const fixedDamage = 200

			// 小数点第2位までに丸める
			const roundedMultiplier = Math.round(totalMultiplier * 100) / 100

			return {
				hitNumber: 2,
				calculatedMultiplier: roundedMultiplier,
				calculatedFixedDamage: fixedDamage,
				calculationProcess: `トールハンマー(追撃): (200+補正後INT(${adjustedINT})×10%)×6 = (200+${adjustedINT * 0.1})×6 = ${roundedMultiplier}% + 固定値${fixedDamage}`,
			}
		}

		// 想定外のhitNumber
		throw new Error(`Invalid hitNumber for ThorHammerFollowup: ${input.hitNumber}`)
	}
}