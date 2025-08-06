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
 * フォースシールドの効果計算関数
 */
export function calculateForceShieldEffects(
	skillLevel: number,
	hasShield: boolean,
): Partial<EquipmentProperties> {
	if (!skillLevel || !hasShield) return {}

	return {
		HP: skillLevel * 50, // HP = skillLevel × 50
		PhysicalResistance_Rate: skillLevel, // 物理耐性% = skillLevel%
	}
}

/**
 * フォースシールドの効果を取得
 */
export function getForceShieldEffects(
	buffSkillData: Record<string, BuffSkillState> | null,
	hasShield: boolean = false,
): Partial<EquipmentProperties> {
	if (!buffSkillData) return {}

	const forceShield = buffSkillData.shield1
	if (forceShield?.isEnabled && forceShield.level) {
		return calculateForceShieldEffects(forceShield.level, hasShield)
	}

	return {}
}

/**
 * マジカルシールドの効果計算関数
 */
export function calculateMagicalShieldEffects(
	skillLevel: number,
	hasShield: boolean,
): Partial<EquipmentProperties> {
	if (!skillLevel || !hasShield) return {}

	return {
		HP: skillLevel * 50, // HP = skillLevel × 50
		MagicalResistance_Rate: skillLevel, // 魔法耐性% = skillLevel%
	}
}

/**
 * マジカルシールドの効果を取得
 */
export function getMagicalShieldEffects(
	buffSkillData: Record<string, BuffSkillState> | null,
	hasShield: boolean = false,
): Partial<EquipmentProperties> {
	if (!buffSkillData) return {}

	const magicalShield = buffSkillData.shield2
	if (magicalShield?.isEnabled && magicalShield.level) {
		return calculateMagicalShieldEffects(magicalShield.level, hasShield)
	}

	return {}
}

/**
 * シールドスキル系統の統合効果を取得
 */
export function getShieldSkillBonuses(
	buffSkillData: Record<string, BuffSkillState> | null,
	hasShield: boolean = false,
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

	// フォースシールドの効果を統合（盾装備時のみ）
	const forceShieldBonuses = getForceShieldEffects(buffSkillData, hasShield)
	for (const [key, value] of Object.entries(forceShieldBonuses)) {
		if (typeof value === 'number' && value !== 0) {
			bonuses[key as keyof EquipmentProperties] =
				(bonuses[key as keyof EquipmentProperties] || 0) + value
		}
	}

	// マジカルシールドの効果を統合（盾装備時のみ）
	const magicalShieldBonuses = getMagicalShieldEffects(buffSkillData, hasShield)
	for (const [key, value] of Object.entries(magicalShieldBonuses)) {
		if (typeof value === 'number' && value !== 0) {
			bonuses[key as keyof EquipmentProperties] =
				(bonuses[key as keyof EquipmentProperties] || 0) + value
		}
	}

	return bonuses
}
