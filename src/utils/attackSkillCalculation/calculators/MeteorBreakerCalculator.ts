import { SkillHitCalculator } from './SkillHitCalculator'
import type { SkillCalculationInput, SkillCalculationResult } from '../types'

/**
 * メテオブレイカー専用計算
 */
export class MeteorBreakerCalculator extends SkillHitCalculator {
	calculate(input: SkillCalculationInput): SkillCalculationResult {
		const { hitNumber, playerStats, equipmentContext } = input

		switch (hitNumber) {
			case 1: {
				// 1撃目: 基本600% + 両手剣装備時補正
				const multiplier = 600 // 基本倍率600%
				let weaponBonus = 0

				if (equipmentContext.mainWeaponType === '両手剣') {
					weaponBonus = 200 + Math.floor(playerStats.baseSTR / 10)
				}

				const finalMultiplier = multiplier + weaponBonus

				return {
					hitNumber: 1,
					calculatedMultiplier: finalMultiplier,
					calculatedFixedDamage: 600,
					calculationProcess:
						equipmentContext.mainWeaponType === '両手剣'
							? `600% + 200% + floor(${playerStats.baseSTR}/10)% = ${finalMultiplier}%`
							: '600% (基本倍率)',
				}
			}

			case 2: {
				// 2撃目: 基本600% + 片手剣装備時補正
				const multiplier = 600 // 基本倍率600%
				let weaponBonus = 0

				if (equipmentContext.mainWeaponType === '片手剣') {
					weaponBonus = Math.floor(playerStats.baseDEX / 2)
				}

				const finalMultiplier = multiplier + weaponBonus

				return {
					hitNumber: 2,
					calculatedMultiplier: finalMultiplier,
					calculatedFixedDamage: 0, // 固定ダメージなし
					calculationProcess:
						equipmentContext.mainWeaponType === '片手剣'
							? `600% + floor(${playerStats.baseDEX}/2)% = ${finalMultiplier}%`
							: '600% (基本倍率)',
				}
			}

			default:
				throw new Error(`Invalid hit number for Meteor Breaker: ${hitNumber}`)
		}
	}
}
