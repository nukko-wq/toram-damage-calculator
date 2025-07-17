/**
 * ハンタースキル系統のバフスキル計算
 */

import type { BuffSkillState, MainWeaponType } from '@/types/buffSkill'
import type { EquipmentProperties, WeaponType } from '@/types/calculator'
import type { AllBonuses } from '../../basicStatsCalculation'
import { convertWeaponType, integrateEffects } from '../types'

/**
 * カムフラージュ(hunter5-2)の効果計算関数
 */
export function calculateCamouflageEffects(
	skillLevel: number,
	baseStatsLevel: number,
	weaponType: MainWeaponType | null,
): Partial<EquipmentProperties> {
	if (!skillLevel || skillLevel === 0) return {}

	const isBowWeapon = weaponType === 'bow' || weaponType === 'bowgun'

	// ATK計算：弓系は基本ステータスレベル × スキルレベル ÷ 10、その他は基本ステータスレベル ÷ 2 × スキルレベル ÷ 10（小数点切り捨て）
	const atkBonus = isBowWeapon
		? Math.floor((baseStatsLevel * skillLevel) / 10)
		: Math.floor(((baseStatsLevel / 2) * skillLevel) / 10)

	return {
		ATK: atkBonus,
		Critical: skillLevel * 4,
	}
}

/**
 * ハンタースキル系統の統合効果取得
 */
export function getHunterSkillBonuses(
	buffSkillData: Record<string, BuffSkillState> | null,
	baseStatsLevel: number,
	weaponType: WeaponType | null,
): Partial<AllBonuses> {
	const convertedWeaponType = convertWeaponType(weaponType)
	const bonuses: Partial<AllBonuses> = {}

	if (!buffSkillData) return bonuses

	// カムフラージュ(hunter5-2)の処理
	const camouflage = buffSkillData['hunter5-2']
	if (camouflage?.isEnabled && camouflage.level) {
		const effects = calculateCamouflageEffects(
			camouflage.level,
			baseStatsLevel,
			convertedWeaponType,
		)
		integrateEffects(effects, bonuses)
	}

	return bonuses
}