import type { SkillCalculationInput, SkillCalculationResult } from '../types'
import { SkillHitCalculator } from './SkillHitCalculator'

/**
 * クロスファイア(3溜め)専用計算
 */
export class CrossFire3ChargeCalculator extends SkillHitCalculator {
	calculate(input: SkillCalculationInput): SkillCalculationResult {
		const { hitNumber, playerStats, equipmentContext } = input

		switch (hitNumber) {
			case 1: {
				// 1撃目: 武器種に応じた計算
				let multiplier: number
				
				if (equipmentContext.mainWeaponType === '弓') {
					// 弓: |2850+基礎DEXx60%|%
					const dexBonus = Math.floor(playerStats.baseDEX * 0.6)
					multiplier = Math.abs(2850 + dexBonus)
				} else if (equipmentContext.mainWeaponType === '自動弓') {
					// 自動弓: 2700%
					multiplier = 2700
				} else {
					multiplier = 0 // 武器種不適合
				}
				
				// 自動弓装備時は物理貫通効果を追加
				const physicalPenetration = equipmentContext.mainWeaponType === '自動弓'
					? Math.abs(Math.floor(playerStats.baseDEX * 0.1))
					: 0
				
				const result: SkillCalculationResult = {
					hitNumber: 1,
					calculatedMultiplier: multiplier,
					calculatedFixedDamage: 400,
					calculationProcess: equipmentContext.mainWeaponType === '弓'
						? `|2850 + floor(${playerStats.baseDEX} * 0.6)| = ${multiplier}%`
						: `2700% (自動弓)`,
				}

				// 物理貫通効果がある場合は追加
				if (physicalPenetration > 0) {
					result.specialEffects = { physicalPenetration }
					result.calculationProcess += `, 物理貫通: ${physicalPenetration}%`
				}

				return result
			}

			case 2: {
				// 2撃目: 武器種に応じた計算
				let multiplier: number
				
				if (equipmentContext.mainWeaponType === '弓') {
					// 弓: 200%x2 = 400%
					multiplier = 400
				} else if (equipmentContext.mainWeaponType === '自動弓') {
					// 自動弓: 300%x2 = 600%
					multiplier = 600
				} else {
					multiplier = 0 // 武器種不適合
				}
				
				// 自動弓装備時は物理貫通効果を追加
				const physicalPenetration = equipmentContext.mainWeaponType === '自動弓'
					? Math.abs(Math.floor(playerStats.baseDEX * 0.1))
					: 0
				
				const result: SkillCalculationResult = {
					hitNumber: 2,
					calculatedMultiplier: multiplier,
					calculatedFixedDamage: 400,
					calculationProcess: equipmentContext.mainWeaponType === '弓'
						? `200% x 2 = ${multiplier}%`
						: `300% x 2 = ${multiplier}%`,
				}

				// 物理貫通効果がある場合は追加
				if (physicalPenetration > 0) {
					result.specialEffects = { physicalPenetration }
					result.calculationProcess += `, 物理貫通: ${physicalPenetration}%`
				}

				return result
			}

			default:
				throw new Error(`Invalid hit number for Cross Fire (3 Charge): ${hitNumber}`)
		}
	}
}