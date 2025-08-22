import type { SkillCalculationInput, SkillCalculationResult } from '../types'
import { SkillHitCalculator } from './SkillHitCalculator'

/**
 * シャットアウト(通常)専用計算
 */
export class ShutOutCalculator extends SkillHitCalculator {
	calculate(input: SkillCalculationInput): SkillCalculationResult {
		const { hitNumber, playerStats, equipmentContext } = input

		if (hitNumber !== 1) {
			throw new Error(`Invalid hit number for Shut Out: ${hitNumber}`)
		}

		// 基本値
		let multiplier = 500
		let fixedDamage = 100
		let process = 'Base: 500%, 100'

		// 武器種別追加効果
		switch (equipmentContext.mainWeaponType) {
			case '両手剣':
				multiplier += 1000 // +1000%
				process += ' | 両手剣: +1000%'
				break

			case '片手剣': {
				const dexBonus = Math.abs(Math.floor(playerStats.baseDEX / 2))
				multiplier += dexBonus
				process += ` | 片手剣: +|${playerStats.baseDEX}/2|% = +${dexBonus}%`
				break
			}

			case '双剣': {
				const agiBonus = Math.abs(Math.floor(playerStats.baseAGI / 4))
				multiplier += agiBonus
				fixedDamage += 100
				process += ` | 双剣: +|${playerStats.baseAGI}/4|% = +${agiBonus}%, +100固定`
				break
			}

			default:
				// 他の武器種では基本値のまま
				process += ' | 武器種効果なし'
				break
		}

		return {
			hitNumber: 1,
			calculatedMultiplier: multiplier,
			calculatedFixedDamage: fixedDamage,
			calculationProcess: process,
		}
	}
}
