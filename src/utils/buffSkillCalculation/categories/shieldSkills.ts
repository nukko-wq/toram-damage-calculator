/**
 * シールドスキル系統のバフスキル計算
 */

import type { BuffSkillState } from '@/types/buffSkill'
import type { EquipmentProperties } from '@/types/calculator'

/**
 * プロテクションの効果計算関数
 */
export function calculateProtectionEffects(
	isEnabled: boolean,
): Partial<EquipmentProperties> {
	if (!isEnabled) return {}

	return {
		PhysicalResistance_Rate: 30, // 物理耐性%+30
		MagicalResistance_Rate: -15, // 魔法耐性%-15
	}
}

/**
 * プロテクションの効果を取得
 */
export function getProtectionEffects(
	buffSkillData: Record<string, BuffSkillState> | null,
): Partial<EquipmentProperties> {
	if (!buffSkillData) return {}

	const protection = buffSkillData.IsProtect
	if (protection?.isEnabled) {
		return calculateProtectionEffects(protection.isEnabled)
	}

	return {}
}

/**
 * イージスの効果計算関数
 */
export function calculateAegisEffects(
	isEnabled: boolean,
): Partial<EquipmentProperties> {
	if (!isEnabled) return {}

	return {
		PhysicalResistance_Rate: -15, // 物理耐性%-15
		MagicalResistance_Rate: 30, // 魔法耐性%+30
	}
}

/**
 * イージスの効果を取得
 */
export function getAegisEffects(
	buffSkillData: Record<string, BuffSkillState> | null,
): Partial<EquipmentProperties> {
	if (!buffSkillData) return {}

	const aegis = buffSkillData.IsAegis
	if (aegis?.isEnabled) {
		return calculateAegisEffects(aegis.isEnabled)
	}

	return {}
}

/**
 * シールドスキル系統の統合効果を取得
 */
export function getShieldSkillBonuses(
	buffSkillData: Record<string, BuffSkillState> | null,
): Partial<EquipmentProperties> {
	const bonuses: Partial<EquipmentProperties> = {}

	if (!buffSkillData) return bonuses

	// プロテクションの効果を統合
	const protectionBonuses = getProtectionEffects(buffSkillData)
	for (const [key, value] of Object.entries(protectionBonuses)) {
		if (typeof value === 'number' && value !== 0) {
			bonuses[key as keyof EquipmentProperties] =
				(bonuses[key as keyof EquipmentProperties] || 0) + value
		}
	}

	// イージスの効果を統合
	const aegisBonuses = getAegisEffects(buffSkillData)
	for (const [key, value] of Object.entries(aegisBonuses)) {
		if (typeof value === 'number' && value !== 0) {
			bonuses[key as keyof EquipmentProperties] =
				(bonuses[key as keyof EquipmentProperties] || 0) + value
		}
	}

	return bonuses
}