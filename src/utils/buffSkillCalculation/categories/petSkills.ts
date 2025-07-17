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