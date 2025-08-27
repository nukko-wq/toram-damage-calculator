import type { SkillCalculationInput, SkillCalculationResult } from '../types'
import { SkillHitCalculator } from './SkillHitCalculator'

/**
 * トールハンマー(追撃3hit)専用計算器
 *
 * 1hit目: 固定倍率1500%、固定ダメージ400
 * 2hit目: INT((200+補正後INT×10%)×1) + INT((200+補正後INT×10%)×2) + INT((200+補正後INT×10%)×3)、固定ダメージ200の追撃部分
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
			// INT((200+INT(補正後INT×10%))×1) + INT((200+INT(補正後INT×10%))×2) + INT((200+INT(補正後INT×10%))×3)の計算
			const adjustedINT = input.playerStats.adjustedINT
			const intBonus = Math.floor(adjustedINT * 0.1) // INT(補正後INT×10%)
			const baseMultiplier = 200 + intBonus
			const hit1 = Math.floor(baseMultiplier * 1) // INT((200+INT(補正後INT×10%))×1)
			const hit2 = Math.floor(baseMultiplier * 2) // INT((200+INT(補正後INT×10%))×2)
			const hit3 = Math.floor(baseMultiplier * 3) // INT((200+INT(補正後INT×10%))×3)
			const totalMultiplier = hit1 + hit2 + hit3
			const fixedDamage = 200

			return {
				hitNumber: 2,
				calculatedMultiplier: totalMultiplier,
				calculatedFixedDamage: fixedDamage,
				calculationProcess: `トールハンマー(追撃): INT((200+INT(補正後INT(${adjustedINT})×10%))×1~3) = INT((200+${intBonus})×1~3) = ${hit1} + ${hit2} + ${hit3} = ${totalMultiplier}% + 固定値${fixedDamage}`,
			}
		}

		// 想定外のhitNumber
		throw new Error(
			`Invalid hitNumber for ThorHammerFollowup: ${input.hitNumber}`,
		)
	}
}
