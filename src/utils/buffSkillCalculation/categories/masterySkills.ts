/**
 * マスタリスキル系統のバフスキル計算
 */

import type { BuffSkillState, MainWeaponType } from '@/types/buffSkill'
import type { EquipmentProperties, WeaponType } from '@/types/calculator'
import type { AllBonuses } from '../../basicStatsCalculation'
import { convertWeaponType, integrateEffects } from '../types'

/**
 * ハルバードマスタリの効果計算関数
 */
export function calculateHalberdMasteryEffects(
	skillLevel: number,
	weaponType: MainWeaponType | null,
): Partial<EquipmentProperties> {
	if (weaponType !== 'halberd' || skillLevel <= 0) return {}

	// WeaponATK%計算
	const weaponATKRate = skillLevel * 3

	// ATK%計算（スキルレベル別）
	let atkRate = 0
	if (skillLevel >= 1 && skillLevel <= 2) {
		atkRate = 1
	} else if (skillLevel >= 3 && skillLevel <= 7) {
		atkRate = 2
	} else if (skillLevel >= 8 && skillLevel <= 10) {
		atkRate = 3
	}

	return {
		WeaponATK_Rate: weaponATKRate,
		ATK_Rate: atkRate,
	}
}

/**
 * ブレードマスタリの効果計算関数
 */
export function calculateBladeMasteryEffects(
	skillLevel: number,
	weaponType: MainWeaponType | null,
): Partial<EquipmentProperties> {
	const bladeWeapons: MainWeaponType[] = [
		'oneHandSword',
		'twoHandSword',
		'dualSword',
	]
	if (!weaponType || !bladeWeapons.includes(weaponType) || skillLevel <= 0)
		return {}

	// WeaponATK%計算
	const weaponATKRate = skillLevel * 3

	// ATK%計算（スキルレベル別）
	let atkRate = 0
	if (skillLevel >= 1 && skillLevel <= 2) {
		atkRate = 1
	} else if (skillLevel >= 3 && skillLevel <= 7) {
		atkRate = 2
	} else if (skillLevel >= 8 && skillLevel <= 10) {
		atkRate = 3
	}

	return {
		WeaponATK_Rate: weaponATKRate,
		ATK_Rate: atkRate,
	}
}

/**
 * シュートマスタリの効果計算関数
 */
export function calculateShootMasteryEffects(
	skillLevel: number,
	weaponType: MainWeaponType | null,
): Partial<EquipmentProperties> {
	const shootWeapons: MainWeaponType[] = ['bow', 'bowgun']
	if (!weaponType || !shootWeapons.includes(weaponType) || skillLevel <= 0)
		return {}

	// WeaponATK%計算
	const weaponATKRate = skillLevel * 3

	// ATK%計算（スキルレベル別）
	let atkRate = 0
	if (skillLevel >= 1 && skillLevel <= 2) {
		atkRate = 1
	} else if (skillLevel >= 3 && skillLevel <= 7) {
		atkRate = 2
	} else if (skillLevel >= 8 && skillLevel <= 10) {
		atkRate = 3
	}

	return {
		WeaponATK_Rate: weaponATKRate,
		ATK_Rate: atkRate,
	}
}

/**
 * マーシャルマスタリの効果計算関数
 */
export function calculateMartialMasteryEffects(
	skillLevel: number,
	weaponType: MainWeaponType | null,
): Partial<EquipmentProperties> {
	if (weaponType !== 'knuckle' || skillLevel <= 0) return {}

	// WeaponATK%計算
	const weaponATKRate = skillLevel * 3

	// ATK%計算（スキルレベル別）
	let atkRate = 0
	if (skillLevel >= 1 && skillLevel <= 2) {
		atkRate = 1
	} else if (skillLevel >= 3 && skillLevel <= 7) {
		atkRate = 2
	} else if (skillLevel >= 8 && skillLevel <= 10) {
		atkRate = 3
	}

	return {
		WeaponATK_Rate: weaponATKRate,
		ATK_Rate: atkRate,
	}
}

/**
 * マジックマスタリの効果計算関数
 */
export function calculateMagicMasteryEffects(
	skillLevel: number,
	weaponType: MainWeaponType | null,
): Partial<EquipmentProperties> {
	const magicWeapons: MainWeaponType[] = ['staff', 'magicDevice']
	if (!weaponType || !magicWeapons.includes(weaponType) || skillLevel <= 0)
		return {}

	// WeaponATK%計算
	const weaponATKRate = skillLevel * 3

	// MATK%計算（スキルレベル別）
	let matkRate = 0
	if (skillLevel >= 1 && skillLevel <= 2) {
		matkRate = 1
	} else if (skillLevel >= 3 && skillLevel <= 7) {
		matkRate = 2
	} else if (skillLevel >= 8 && skillLevel <= 10) {
		matkRate = 3
	}

	return {
		WeaponATK_Rate: weaponATKRate,
		MATK_Rate: matkRate,
	}
}

/**
 * マスタリスキル系統の統合効果取得
 */
export function getMasterySkillBonuses(
	buffSkillData: Record<string, BuffSkillState> | null,
	weaponType: WeaponType | null,
): Partial<AllBonuses> {
	const convertedWeaponType = convertWeaponType(weaponType)
	const bonuses: Partial<AllBonuses> = {}

	if (!buffSkillData) return bonuses

	// ハルバードマスタリの処理
	const halberdMastery = buffSkillData['Ms-halberd']
	if (halberdMastery?.isEnabled && halberdMastery.level) {
		const effects = calculateHalberdMasteryEffects(
			halberdMastery.level,
			convertedWeaponType,
		)
		integrateEffects(effects, bonuses)
	}

	// ブレードマスタリの処理
	const bladeMastery = buffSkillData['Ms-blade']
	if (bladeMastery?.isEnabled && bladeMastery.level) {
		const effects = calculateBladeMasteryEffects(
			bladeMastery.level,
			convertedWeaponType,
		)
		integrateEffects(effects, bonuses)
	}

	// シュートマスタリの処理
	const shootMastery = buffSkillData['Ms-shoot']
	if (shootMastery?.isEnabled && shootMastery.level) {
		const effects = calculateShootMasteryEffects(
			shootMastery.level,
			convertedWeaponType,
		)
		integrateEffects(effects, bonuses)
	}

	// マーシャルマスタリの処理
	const martialMastery = buffSkillData['Ms-Marchal']
	if (martialMastery?.isEnabled && martialMastery.level) {
		const effects = calculateMartialMasteryEffects(
			martialMastery.level,
			convertedWeaponType,
		)
		integrateEffects(effects, bonuses)
	}

	// マジックマスタリの処理
	const magicMastery = buffSkillData['Ms-magic']
	if (magicMastery?.isEnabled && magicMastery.level) {
		const effects = calculateMagicMasteryEffects(
			magicMastery.level,
			convertedWeaponType,
		)
		integrateEffects(effects, bonuses)
	}

	return bonuses
}