/**
 * バフスキル効果計算ユーティリティ
 *
 * バフスキルの効果値を計算し、装備プロパティ形式で返す
 */

import type { BuffSkillState, MainWeaponType } from '@/types/buffSkill'
import type { EquipmentProperties, WeaponType } from '@/types/calculator'
import type { AllBonuses } from './basicStatsCalculation'

/**
 * WeaponType（日本語）からMainWeaponType（英語）への変換関数
 */
function convertWeaponType(weaponType: WeaponType | null): MainWeaponType | null {
	if (!weaponType) return null
	
	const conversionMap: Record<WeaponType, MainWeaponType> = {
		'片手剣': 'oneHandSword',
		'双剣': 'dualSword',
		'両手剣': 'twoHandSword',
		'手甲': 'knuckle',
		'旋風槍': 'halberd',
		'抜刀剣': 'katana',
		'弓': 'bow',
		'自動弓': 'bowgun',
		'杖': 'staff',
		'魔導具': 'magicDevice',
		'素手': 'bareHands',
	}
	
	return conversionMap[weaponType] || null
}

/**
 * 神速の捌手の効果計算関数
 */
export function calculateGodspeedParryEffects(
	stackCount: number,
	weaponType: MainWeaponType | null,
): Partial<EquipmentProperties> {
	if (stackCount <= 0) return {}

	const isHalberd = weaponType === 'halberd'

	return {
		AttackSpeed: stackCount * (isHalberd ? 400 : 300),
		MotionSpeed_Rate: stackCount * 10,
		MP: stackCount * -100,
		PhysicalResistance_Rate: stackCount * (isHalberd ? -25 : -70),
		MagicalResistance_Rate: stackCount * (isHalberd ? -25 : -70),
		AvoidRecharge_Rate: stackCount * 10,
	}
}

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
	const bladeWeapons: MainWeaponType[] = ['oneHandSword', 'twoHandSword', 'dualSword']
	if (!weaponType || !bladeWeapons.includes(weaponType) || skillLevel <= 0) return {}

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
	if (!weaponType || !shootWeapons.includes(weaponType) || skillLevel <= 0) return {}

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
	if (!weaponType || !magicWeapons.includes(weaponType) || skillLevel <= 0) return {}

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
 * バフスキルデータから全体の補正値を取得
 */
export function getBuffSkillBonuses(
	buffSkillData: Record<string, BuffSkillState> | null,
	weaponType: WeaponType | null,
): Partial<AllBonuses> {
	const convertedWeaponType = convertWeaponType(weaponType)
	const bonuses: Partial<AllBonuses> = {}

	if (!buffSkillData) return bonuses

	// 神速の捌手の処理
	const godspeedParry = buffSkillData['godspeed_parry']
	if (godspeedParry?.isEnabled && godspeedParry.stackCount) {
		const effects = calculateGodspeedParryEffects(
			godspeedParry.stackCount,
			convertedWeaponType,
		)

		// EquipmentPropertiesをAllBonusesに変換して統合
		for (const [key, value] of Object.entries(effects)) {
			if (typeof value === 'number' && value !== 0) {
				bonuses[key as keyof AllBonuses] =
					(bonuses[key as keyof AllBonuses] || 0) + value
			}
		}
	}

	// ハルバードマスタリの処理
	const halberdMastery = buffSkillData['Ms-halberd']
	if (halberdMastery?.isEnabled && halberdMastery.level) {
		const effects = calculateHalberdMasteryEffects(
			halberdMastery.level,
			convertedWeaponType,
		)

		// EquipmentPropertiesをAllBonusesに変換して統合
		for (const [key, value] of Object.entries(effects)) {
			if (typeof value === 'number' && value !== 0) {
				bonuses[key as keyof AllBonuses] =
					(bonuses[key as keyof AllBonuses] || 0) + value
			}
		}
	}

	// ブレードマスタリの処理
	const bladeMastery = buffSkillData['Ms-blade']
	if (bladeMastery?.isEnabled && bladeMastery.level) {
		const effects = calculateBladeMasteryEffects(
			bladeMastery.level,
			convertedWeaponType,
		)

		// EquipmentPropertiesをAllBonusesに変換して統合
		for (const [key, value] of Object.entries(effects)) {
			if (typeof value === 'number' && value !== 0) {
				bonuses[key as keyof AllBonuses] =
					(bonuses[key as keyof AllBonuses] || 0) + value
			}
		}
	}

	// シュートマスタリの処理
	const shootMastery = buffSkillData['Ms-shoot']
	if (shootMastery?.isEnabled && shootMastery.level) {
		const effects = calculateShootMasteryEffects(
			shootMastery.level,
			convertedWeaponType,
		)

		// EquipmentPropertiesをAllBonusesに変換して統合
		for (const [key, value] of Object.entries(effects)) {
			if (typeof value === 'number' && value !== 0) {
				bonuses[key as keyof AllBonuses] =
					(bonuses[key as keyof AllBonuses] || 0) + value
			}
		}
	}

	// マーシャルマスタリの処理
	const martialMastery = buffSkillData['Ms-Marchal']
	if (martialMastery?.isEnabled && martialMastery.level) {
		const effects = calculateMartialMasteryEffects(
			martialMastery.level,
			convertedWeaponType,
		)

		// EquipmentPropertiesをAllBonusesに変換して統合
		for (const [key, value] of Object.entries(effects)) {
			if (typeof value === 'number' && value !== 0) {
				bonuses[key as keyof AllBonuses] =
					(bonuses[key as keyof AllBonuses] || 0) + value
			}
		}
	}

	// マジックマスタリの処理
	const magicMastery = buffSkillData['Ms-magic']
	if (magicMastery?.isEnabled && magicMastery.level) {
		const effects = calculateMagicMasteryEffects(
			magicMastery.level,
			convertedWeaponType,
		)

		// EquipmentPropertiesをAllBonusesに変換して統合
		for (const [key, value] of Object.entries(effects)) {
			if (typeof value === 'number' && value !== 0) {
				bonuses[key as keyof AllBonuses] =
					(bonuses[key as keyof AllBonuses] || 0) + value
			}
		}
	}

	return bonuses
}

