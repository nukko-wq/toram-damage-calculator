/**
 * デュアルソードスキル系統のバフスキル計算
 */

import type { BuffSkillState, MainWeaponType } from '@/types/buffSkill'
import type { EquipmentProperties, WeaponType } from '@/types/calculator'
import type { AllBonuses } from '../../basicStatsCalculation'
import { convertWeaponType, integrateEffects } from '../types'

/**
 * 神速の軌跡(ds1-2)の効果計算関数
 */
export function calculateGodspeedTrajectoryEffects(
	skillLevel: number,
	weaponType: MainWeaponType | null,
): Partial<EquipmentProperties> {
	if (!skillLevel || skillLevel === 0) return {}

	const isDualSword = weaponType === 'dualSword'

	// AGI = スキルレベル + MAX(スキルレベル-5, 0)
	const agiBonus = skillLevel + Math.max(skillLevel - 5, 0)

	// UnsheatheAttack = 双剣なら15+スキルレベル、それ以外なら5+スキルレベル
	const unsheatheAttackBonus = isDualSword ? 15 + skillLevel : 5 + skillLevel

	return {
		AGI: agiBonus,
		UnsheatheAttack: unsheatheAttackBonus,
	}
}

/**
 * デュアルソードスキル系統の統合効果取得
 */
export function getDualSwordSkillBonuses(
	buffSkillData: Record<string, BuffSkillState> | null,
	weaponType: WeaponType | null,
): Partial<AllBonuses> {
	const convertedWeaponType = convertWeaponType(weaponType)
	const bonuses: Partial<AllBonuses> = {}

	if (!buffSkillData) return bonuses

	// 神速の軌跡(ds1-2)の処理
	const godspeedTrajectory = buffSkillData['ds1-2']
	if (godspeedTrajectory?.isEnabled && godspeedTrajectory.level) {
		const effects = calculateGodspeedTrajectoryEffects(
			godspeedTrajectory.level,
			convertedWeaponType,
		)
		integrateEffects(effects, bonuses)
	}

	return bonuses
}