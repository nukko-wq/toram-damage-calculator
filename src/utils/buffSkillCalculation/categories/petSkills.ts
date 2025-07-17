/**
 * ペット使用スキル系統のバフスキル計算
 */

import type { BuffSkillState } from '@/types/buffSkill'
import type { EquipmentProperties } from '@/types/calculator'

/**
 * ペットクリティカルアップの効果計算関数
 */
export function calculatePetCriticalUpEffects(
	isEnabled: boolean,
): Partial<EquipmentProperties> {
	if (!isEnabled) return {}

	return {
		CriticalDamage: 12, // クリティカルダメージ+12
	}
}

/**
 * ペットブレイブアップの効果計算関数
 */
export function calculatePetBraveUpEffects(
	isEnabled: boolean,
): Partial<EquipmentProperties> {
	if (!isEnabled) return {}

	return {
		ATK_Rate: 10, // ATK%+10
		ATK: 75, // ATK+75
		AttackSpeed_Rate: 20, // AttackSpeed%+20
		AttackSpeed: 300, // AttackSpeed+300
	}
}

/**
 * ペットマインドアップの効果計算関数
 */
export function calculatePetMindUpEffects(
	isEnabled: boolean,
): Partial<EquipmentProperties> {
	if (!isEnabled) return {}

	return {
		MATK_Rate: 10, // MATK%+10
		MATK: 75, // MATK+75
		CastingSpeed_Rate: 20, // CastingSpeed%+20
		CastingSpeed: 300, // CastingSpeed+300
	}
}

/**
 * ペットクリティカルアップの効果を取得
 */
export function getPetCriticalUpEffects(
	buffSkillData: Record<string, BuffSkillState> | null,
): Partial<EquipmentProperties> {
	if (!buffSkillData) return {}

	const petCriticalUp = buffSkillData.IsPetCri
	if (petCriticalUp?.isEnabled) {
		return calculatePetCriticalUpEffects(petCriticalUp.isEnabled)
	}

	return {}
}

/**
 * ペットブレイブアップの効果を取得
 */
export function getPetBraveUpEffects(
	buffSkillData: Record<string, BuffSkillState> | null,
): Partial<EquipmentProperties> {
	if (!buffSkillData) return {}

	const petBraveUp = buffSkillData.IsPetBrave
	if (petBraveUp?.isEnabled) {
		return calculatePetBraveUpEffects(petBraveUp.isEnabled)
	}

	return {}
}

/**
 * ペットマインドアップの効果を取得
 */
export function getPetMindUpEffects(
	buffSkillData: Record<string, BuffSkillState> | null,
): Partial<EquipmentProperties> {
	if (!buffSkillData) return {}

	const petMindUp = buffSkillData.IsPetMind
	if (petMindUp?.isEnabled) {
		return calculatePetMindUpEffects(petMindUp.isEnabled)
	}

	return {}
}