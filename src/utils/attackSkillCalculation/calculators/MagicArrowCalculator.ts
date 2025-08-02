import type { SkillCalculationInput, SkillCalculationResult } from '../types'
import { SkillHitCalculator } from './SkillHitCalculator'

/**
 * 術式/アロー専用計算
 */
export class MagicArrowCalculator extends SkillHitCalculator {
	calculate(input: SkillCalculationInput): SkillCalculationResult {
		const { hitNumber, playerStats, equipmentContext } = input

		// 基本倍率: 125%
		let multiplier = 125

		// 杖装備時: 威力+25%
		const hasStaffEquipped = equipmentContext.mainWeaponType === '杖'
		if (hasStaffEquipped) {
			multiplier += 25
		}

		// 固定値: 50
		const fixedDamage = 50

		return {
			hitNumber,
			calculatedMultiplier: Number(multiplier.toFixed(2)),
			calculatedFixedDamage: fixedDamage,
			calculationProcess: `125%${
				hasStaffEquipped ? '+25%(杖装備)' : ''
			} = ${multiplier}%, 固定値: ${fixedDamage}`,
		}
	}
}
