import type { SkillCalculationInput, SkillCalculationResult } from '../types'
import { SkillHitCalculator } from './SkillHitCalculator'

/**
 * オーガスラッシュ専用計算
 * - 1撃目: |基礎STR+基礎VIT|% + 物理貫通加算、補正後DEX固定ダメージ
 * - 2撃目: |200×消費鬼力数|%、固定500ダメージ
 * - 特殊効果: |消費鬼力×10|%の物理貫通
 * - 貫通加算システム: 総物理貫通100%超過時、超過分を1撃目威力に加算
 */
export class OgreSlashCalculator extends SkillHitCalculator {
	calculate(input: SkillCalculationInput): SkillCalculationResult {
		const { hitNumber, playerStats } = input

		switch (hitNumber) {
			case 1: {
				// 1撃目: ステータス依存計算 + 物理貫通加算
				const baseMultiplier = Math.abs(playerStats.baseSTR + playerStats.baseVIT)
				const fixedDamage = playerStats.adjustedDEX
				
				// StatusPreviewの装備品補正値1の物理貫通値を使用して1hit目ボーナス計算
				const totalPenetration = playerStats.totalPhysicalPenetration
				
				// 物理貫通100%超過分を1撃目威力に加算
				const penetrationBonus = totalPenetration > 100 ? totalPenetration - 100 : 0
				const finalMultiplier = baseMultiplier + penetrationBonus
				
				// 特殊効果の物理貫通は引き続きバフスキルの消費鬼力から計算
				const demonPowerCount = input.buffSkillContext?.getBuffSkillLevel('sm1') || 0
				const skillPenetration = Math.abs(demonPowerCount * 10)

				return {
					hitNumber: 1,
					calculatedMultiplier: finalMultiplier,
					calculatedFixedDamage: fixedDamage,
					calculationProcess: `|${playerStats.baseSTR}+${playerStats.baseVIT}| + 貫通加算${penetrationBonus} = ${finalMultiplier}%, ${playerStats.adjustedDEX}`,
					specialEffects: {
						physicalPenetration: skillPenetration
					}
				}
			}

			case 2: {
				// 2撃目: 消費鬼力依存計算
				const demonPowerCount = input.buffSkillContext?.getBuffSkillLevel('sm1') || 0
				const multiplier = Math.abs(200 * demonPowerCount)
				const fixedDamage = 500

				return {
					hitNumber: 2,
					calculatedMultiplier: multiplier,
					calculatedFixedDamage: fixedDamage,
					calculationProcess: `|200×${demonPowerCount}| = ${multiplier}%, 500固定`,
					specialEffects: {
						physicalPenetration: Math.abs(demonPowerCount * 10)
					}
				}
			}

			default:
				throw new Error(`Invalid hit number for Ogre Slash: ${hitNumber}`)
		}
	}
}