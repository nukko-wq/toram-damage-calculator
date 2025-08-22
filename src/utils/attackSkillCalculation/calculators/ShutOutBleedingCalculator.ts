import type { SkillCalculationInput, SkillCalculationResult } from '../types'
import { SkillHitCalculator } from './SkillHitCalculator'

/**
 * シャットアウト(出血付与時)専用計算
 */
export class ShutOutBleedingCalculator extends SkillHitCalculator {
	calculate(input: SkillCalculationInput): SkillCalculationResult {
		const { hitNumber, playerStats, equipmentContext } = input

		if (hitNumber !== 1) {
			throw new Error(
				`Invalid hit number for Shut Out (Bleeding): ${hitNumber}`,
			)
		}

		// 基本値
		let multiplier = 500
		let fixedDamage = 100
		let process = 'Base: 500%, 100'
		let physicalPenetrationMultiplier = 1

		// 武器種別追加効果
		switch (equipmentContext.mainWeaponType) {
			case '両手剣':
				multiplier += 1500 // +1500%
				process += ' | 両手剣: +1500%'
				break

			case '片手剣': {
				const dexBonus = Math.abs(2000 + playerStats.baseDEX)
				multiplier += dexBonus
				physicalPenetrationMultiplier = 4 // 物理貫通4倍計算
				process += ` | 片手剣: +|2000+${playerStats.baseDEX}|% = +${dexBonus}%, 物理貫通4倍`
				break
			}

			case '双剣': {
				multiplier += 2000 // +2000%
				const agiBonus = Math.abs(Math.floor(playerStats.baseAGI / 2))
				multiplier += agiBonus
				fixedDamage += 100
				physicalPenetrationMultiplier = 2 // 物理貫通2倍計算
				process += ` | 双剣: +2000%+|${playerStats.baseAGI}/2|% = +${2000 + agiBonus}%, +100固定, 物理貫通2倍`
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
			specialEffects:
				physicalPenetrationMultiplier > 1
					? {
							physicalPenetration: physicalPenetrationMultiplier,
						}
					: undefined,
		}
	}
}
