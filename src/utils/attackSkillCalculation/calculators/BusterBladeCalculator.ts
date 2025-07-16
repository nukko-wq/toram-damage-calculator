import { SkillHitCalculator } from './SkillHitCalculator'
import type { SkillCalculationInput, SkillCalculationResult } from '../types'

/**
 * バスターブレード専用計算器
 * 武器種別による倍率補正を実装
 */
export class BusterBladeCalculator extends SkillHitCalculator {
	calculate(input: SkillCalculationInput): SkillCalculationResult {
		const baseMultiplier = 750 // 基本倍率750%
		let weaponBonus = 0
		
		// 武器種別による補正
		switch (input.equipmentContext.mainWeaponType) {
			case '両手剣':
				weaponBonus = input.playerStats.baseSTR // +基礎STR%
				break
			case '片手剣':
				weaponBonus = Math.floor(input.playerStats.baseDEX / 2) // +基礎DEX/2%
				break
			case '双剣':
				weaponBonus = 0 // 補正なし
				break
			default:
				weaponBonus = 0
		}
		
		const finalMultiplier = baseMultiplier + weaponBonus
		
		return {
			hitNumber: input.hitNumber,
			calculatedMultiplier: finalMultiplier,
			calculatedFixedDamage: 300, // 固定値300
			calculationProcess: `750% + ${weaponBonus}% (武器種別補正) = ${finalMultiplier}%`,
		}
	}
}