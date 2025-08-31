import type { SkillCalculationInput, SkillCalculationResult } from '../types'
import { SkillHitCalculator } from './SkillHitCalculator'

/**
 * クロスファイア(溜め可変)専用計算
 */
export class CrossFireVariableChargeCalculator extends SkillHitCalculator {
	calculate(input: SkillCalculationInput): SkillCalculationResult {
		const { hitNumber, playerStats, equipmentContext, variableOptions } = input
		const chargeLevel = variableOptions?.chargeLevel ?? 1 // デフォルト1回

		switch (hitNumber) {
			case 1: {
				// 1撃目: 武器種・溜め回数に応じた計算
				let multiplier: number

				if (equipmentContext.mainWeaponType === '弓') {
					// 弓: |950xチャージ数+基礎DEXx20%xチャージ数|
					const baseMultiplier = 950 * chargeLevel
					const dexBonus = Math.floor(playerStats.baseDEX * 0.2) * chargeLevel
					multiplier = Math.abs(baseMultiplier + dexBonus)
				} else if (equipmentContext.mainWeaponType === '自動弓') {
					// 自動弓: 900xチャージ数
					multiplier = 900 * chargeLevel
				} else {
					multiplier = 0 // 武器種不適合
				}

				// 自動弓装備時は物理貫通効果を追加
				const physicalPenetration =
					equipmentContext.mainWeaponType === '自動弓'
						? Math.abs(Math.floor(playerStats.baseDEX * 0.1))
						: 0

				const result: SkillCalculationResult = {
					hitNumber: 1,
					calculatedMultiplier: multiplier,
					calculatedFixedDamage: 400,
					calculationProcess:
						equipmentContext.mainWeaponType === '弓'
							? `|950x${chargeLevel} + floor(${playerStats.baseDEX} * 0.2)x${chargeLevel}| = ${multiplier}%`
							: `900x${chargeLevel} = ${multiplier}%`,
				}

				// 物理貫通効果がある場合は追加
				if (physicalPenetration > 0) {
					result.specialEffects = { physicalPenetration }
					result.calculationProcess += `, 物理貫通: ${physicalPenetration}%`
				}

				return result
			}

			case 2: {
				// 2撃目: 武器種・溜め回数に応じた計算
				let multiplier: number

				if (equipmentContext.mainWeaponType === '弓') {
					// 弓: 200%x(チャージ数-1)
					multiplier = chargeLevel > 1 ? 200 * (chargeLevel - 1) : 0
				} else if (equipmentContext.mainWeaponType === '自動弓') {
					// 自動弓: 300%x(チャージ数-1)
					multiplier = chargeLevel > 1 ? 300 * (chargeLevel - 1) : 0
				} else {
					multiplier = 0 // 武器種不適合
				}

				// 自動弓装備時は物理貫通効果を追加
				const physicalPenetration =
					equipmentContext.mainWeaponType === '自動弓'
						? Math.abs(Math.floor(playerStats.baseDEX * 0.1))
						: 0

				const result: SkillCalculationResult = {
					hitNumber: 2,
					calculatedMultiplier: multiplier,
					calculatedFixedDamage: chargeLevel > 1 ? 400 : 0,
					calculationProcess:
						equipmentContext.mainWeaponType === '弓'
							? `200x(${chargeLevel}-1) = ${multiplier}%` +
								(chargeLevel > 1 ? ', 固定400' : ', 固定0')
							: `300x(${chargeLevel}-1) = ${multiplier}%` +
								(chargeLevel > 1 ? ', 固定400' : ', 固定0'),
				}

				// 物理貫通効果がある場合は追加
				if (physicalPenetration > 0) {
					result.specialEffects = { physicalPenetration }
					result.calculationProcess += `, 物理貫通: ${physicalPenetration}%`
				}

				return result
			}

			default:
				throw new Error(
					`Invalid hit number for Cross Fire (Variable Charge): ${hitNumber}`,
				)
		}
	}
}
