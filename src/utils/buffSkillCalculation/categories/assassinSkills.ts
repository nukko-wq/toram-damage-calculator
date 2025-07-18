/**
 * アサシンスキル系統のバフスキル計算
 */

import type { BuffSkillState } from '@/types/buffSkill'
import type { EquipmentProperties, SubWeaponType } from '@/types/calculator'

/**
 * シーカーリウスの効果計算関数
 */
export function calculateSecariusEffects(
	isEnabled: boolean,
	subWeaponType: SubWeaponType | null,
): Partial<EquipmentProperties> {
	if (!isEnabled) return {}

	// ナイフと巻物で強化効果
	const isEnhanced = subWeaponType === 'ナイフ' || subWeaponType === '巻物'

	return {
		ATK: isEnhanced ? 100 : 50,
		PhysicalPenetration_Rate: isEnhanced ? 25 : 10,
	}
}

/**
 * シーカーリウスの効果を取得
 */
export function getSecariusEffects(
	buffSkillData: Record<string, BuffSkillState> | null,
	subWeaponType: SubWeaponType | null,
): Partial<EquipmentProperties> {
	if (!buffSkillData) return {}

	const secarius = buffSkillData['oh1-2']
	if (secarius?.isEnabled) {
		return calculateSecariusEffects(secarius.isEnabled, subWeaponType)
	}

	return {}
}

/**
 * アサシンスキル系統の統合効果を取得
 */
export function getAssassinSkillBonuses(
	buffSkillData: Record<string, BuffSkillState> | null,
	subWeaponType: SubWeaponType | null,
): Partial<EquipmentProperties> {
	const bonuses: Partial<EquipmentProperties> = {}

	if (!buffSkillData) return bonuses

	// シーカーリウスの効果を統合
	const secariusBonuses = getSecariusEffects(buffSkillData, subWeaponType)
	for (const [key, value] of Object.entries(secariusBonuses)) {
		if (typeof value === 'number' && value !== 0) {
			bonuses[key as keyof EquipmentProperties] =
				(bonuses[key as keyof EquipmentProperties] || 0) + value
		}
	}

	return bonuses
}