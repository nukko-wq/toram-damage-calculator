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
 * イージスの効果計算関数（将来実装用）
 */
export function calculateAegisEffects(
	isEnabled: boolean,
): Partial<EquipmentProperties> {
	if (!isEnabled) return {}

	// TODO: イージスの効果を実装
	return {}
}

/**
 * イージスの効果を取得（将来実装用）
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