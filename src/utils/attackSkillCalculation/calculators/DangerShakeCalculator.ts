import type { SkillCalculationInput, SkillCalculationResult } from '../types'
import { SkillHitCalculator } from './SkillHitCalculator'

/**
 * デンジャーシェイク(前入力派生)専用計算
 */
export class DangerShakeCalculator extends SkillHitCalculator {
	calculate(input: SkillCalculationInput): SkillCalculationResult {
		const { hitNumber, playerStats, equipmentContext } = input

		switch (hitNumber) {
			case 1: {
				// 1撃目: 武器種・基礎STR依存計算
				const baseSTR = playerStats.baseSTR
				let multiplier: number
				
				// 武器種による基準値の決定
				const weaponType = equipmentContext.mainWeaponType
				if (weaponType === '杖') {
					multiplier = Math.abs(1000 + Math.floor(baseSTR / 2))
				} else if (weaponType === '旋風槍') {
					multiplier = Math.abs(750 + Math.floor(baseSTR / 2))
				} else {
					// デフォルト（杖として扱う）
					multiplier = Math.abs(1000 + Math.floor(baseSTR / 2))
				}

				return {
					hitNumber: 1,
					calculatedMultiplier: multiplier,
					calculatedFixedDamage: 100,
					calculationProcess: `${weaponType}:|${weaponType === '旋風槍' ? 750 : 1000}+floor(${baseSTR}/2)| = ${multiplier}%, 固定100`
				}
			}

			case 2: {
				// 2撃目: 武器種・補正後STR依存計算
				const adjustedSTR = playerStats.adjustedSTR
				let multiplier: number
				
				// 武器種による基準値の決定
				const weaponType = equipmentContext.mainWeaponType
				if (weaponType === '杖') {
					multiplier = Math.abs(1500 + adjustedSTR)
				} else if (weaponType === '旋風槍') {
					multiplier = Math.abs(1000 + adjustedSTR)
				} else {
					// デフォルト（杖として扱う）
					multiplier = Math.abs(1500 + adjustedSTR)
				}

				return {
					hitNumber: 2,
					calculatedMultiplier: multiplier,
					calculatedFixedDamage: 100,
					calculationProcess: `${weaponType}:|${weaponType === '旋風槍' ? 1000 : 1500}+${adjustedSTR}| = ${multiplier}%, 固定100`
				}
			}

			default:
				throw new Error(`Invalid hit number for Danger Shake: ${hitNumber}`)
		}
	}
}