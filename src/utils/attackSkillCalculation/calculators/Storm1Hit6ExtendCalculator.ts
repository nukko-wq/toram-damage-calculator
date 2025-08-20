import type { SkillCalculationInput, SkillCalculationResult } from '../types'
import { SkillHitCalculator } from './SkillHitCalculator'

/**
 * 術式/ストーム(1/6hit)-ストーム延長専用計算
 */
export class Storm1Hit6ExtendCalculator extends SkillHitCalculator {
	calculate(input: SkillCalculationInput): SkillCalculationResult {
		const { hitNumber, equipmentContext } = input

		// デバッグ情報を追加
		console.log('Storm1Hit6ExtendCalculator DEBUG:', {
			hitNumber,
			hasStaffEquipped: equipmentContext.hasStaffEquipped,
			mainWeaponType: equipmentContext.mainWeaponType,
		})

		switch (hitNumber) {
			case 1: {
				// 1撃目: 基本150%、杖装備時250%
				const baseMultiplier = 150
				const staffBonus = equipmentContext.hasStaffEquipped ? 100 : 0
				const multiplier = baseMultiplier + staffBonus

				return {
					hitNumber: 1,
					calculatedMultiplier: multiplier,
					calculatedFixedDamage: 420,
					calculationProcess: equipmentContext.hasStaffEquipped
						? `${baseMultiplier}%(基本) + ${staffBonus}%(杖装備時) = ${multiplier}%`
						: `${baseMultiplier}%(基本) = ${multiplier}%`,
				}
			}

			default:
				throw new Error(
					`Invalid hit number for Storm 1/6hit Extend: ${hitNumber}`,
				)
		}
	}
}
