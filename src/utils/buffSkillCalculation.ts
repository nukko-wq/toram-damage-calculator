/**
 * バフスキル効果計算ユーティリティ
 *
 * バフスキルの効果値を計算し、装備プロパティ形式で返す
 */

import type { BuffSkillState, MainWeaponType } from '@/types/buffSkill'
import type { EquipmentProperties, WeaponType, SubWeaponType } from '@/types/calculator'
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
 * 素早い斬撃の効果計算関数
 */
export function calculateQuickSlashEffects(
	skillLevel: number,
	weaponType: MainWeaponType | null,
): Partial<EquipmentProperties> {
	const bladeWeapons: MainWeaponType[] = ['oneHandSword', 'twoHandSword', 'dualSword']
	if (!weaponType || !bladeWeapons.includes(weaponType) || skillLevel <= 0) return {}

	return {
		AttackSpeed: skillLevel * 10,
		AttackSpeed_Rate: skillLevel * 1,
	}
}

/**
 * 匠の剣術(sm4)のパッシブ倍率計算関数
 */
export function calculateTakumiKenjutsuPassiveMultiplier(
	isEnabled: boolean,
	weaponType: MainWeaponType | null,
): number {
	const bladeWeapons: MainWeaponType[] = ['oneHandSword', 'twoHandSword', 'dualSword']
	if (!isEnabled || !weaponType || !bladeWeapons.includes(weaponType)) return 0

	return 20 // パッシブ倍率 +20%
}

/**
 * 両手持ち(sm1-1)の効果計算関数
 */
export function calculateTwoHandsEffects(
	isEnabled: boolean,
	mainWeaponType: MainWeaponType | null,
	subWeaponType: SubWeaponType | null,
): Partial<EquipmentProperties> {
	if (!isEnabled) return {}
	
	const isKatana = mainWeaponType === 'katana'
	const isSubWeaponNone = !subWeaponType || subWeaponType === 'なし'
	const isSubWeaponScroll = subWeaponType === '巻物'
	
	// 抜刀剣の場合：サブ武器がなしまたは巻物
	if (isKatana && (isSubWeaponNone || isSubWeaponScroll)) {
		return {
			Accuracy_Rate: 10,
			Stability_Rate: 10,
			Critical: 10,
			WeaponATK_Rate: 10,
		}
	}
	
	// その他の武器の場合：サブ武器がなしのみ
	if (!isKatana && isSubWeaponNone) {
		return {
			Accuracy_Rate: 10,
			Stability_Rate: 5,
			Critical: 5,
			WeaponATK_Rate: 10,
		}
	}
	
	// 効果条件を満たさない場合
	return {}
}

/**
 * 攻撃力up(exATK1)の効果計算関数
 */
export function calculateAttackUpEffects(
	skillLevel: number,
	playerLevel: number,
): Partial<EquipmentProperties> {
	if (!skillLevel || skillLevel === 0) return {}
	
	// ATK = Math.floor(プレイヤーレベル × (25 × スキルレベル ÷ 10) ÷ 100)
	const atkBonus = Math.floor(playerLevel * (25 * skillLevel / 10) / 100)
	
	return {
		ATK: atkBonus,
	}
}

/**
 * 魔法力up(exMATK1)の効果計算関数
 */
export function calculateMagicUpEffects(
	skillLevel: number,
	playerLevel: number,
): Partial<EquipmentProperties> {
	if (!skillLevel || skillLevel === 0) return {}
	
	// MATK = Math.floor(プレイヤーレベル × (25 × スキルレベル ÷ 10) ÷ 100)
	const matkBonus = Math.floor(playerLevel * (25 * skillLevel / 10) / 100)
	
	return {
		MATK: matkBonus,
	}
}

/**
 * クイックオーラ(hb1)の効果計算関数
 */
export function calculateQuickAuraEffects(
	skillLevel: number,
): Partial<EquipmentProperties> {
	if (!skillLevel || skillLevel === 0) return {}
	
	return {
		AttackSpeed: skillLevel * 50,
		AttackSpeed_Rate: Math.floor(skillLevel * 2.5),
	}
}

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
 * クリティカルup(oh1)の効果計算関数
 */
export function calculateCriticalUpEffects(
	isEnabled: boolean,
): Partial<EquipmentProperties> {
	if (!isEnabled) return {}
	
	return {
		Critical: 5,
		CriticalDamage_Rate: 5,
	}
}

/**
 * MPブースト(oh2)の効果計算関数
 */
export function calculateMPBoostEffects(
	skillLevel: number,
): Partial<EquipmentProperties> {
	if (!skillLevel || skillLevel === 0) return {}
	
	return {
		MP: skillLevel * 30,
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

	// 素早い斬撃の処理
	const quickSlash = buffSkillData['sm2']
	if (quickSlash?.isEnabled && quickSlash.level) {
		const effects = calculateQuickSlashEffects(
			quickSlash.level,
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

	// クイックオーラの処理
	const quickAura = buffSkillData['hb1']
	if (quickAura?.isEnabled && quickAura.level) {
		const effects = calculateQuickAuraEffects(quickAura.level)

		// EquipmentPropertiesをAllBonusesに変換して統合
		for (const [key, value] of Object.entries(effects)) {
			if (typeof value === 'number' && value !== 0) {
				bonuses[key as keyof AllBonuses] =
					(bonuses[key as keyof AllBonuses] || 0) + value
			}
		}
	}

	// クリティカルupの処理
	const criticalUp = buffSkillData['oh1']
	if (criticalUp?.isEnabled) {
		const effects = calculateCriticalUpEffects(criticalUp.isEnabled)

		// EquipmentPropertiesをAllBonusesに変換して統合
		for (const [key, value] of Object.entries(effects)) {
			if (typeof value === 'number' && value !== 0) {
				bonuses[key as keyof AllBonuses] =
					(bonuses[key as keyof AllBonuses] || 0) + value
			}
		}
	}

	// MPブーストの処理
	const mpBoost = buffSkillData['oh2']
	if (mpBoost?.isEnabled && mpBoost.level) {
		const effects = calculateMPBoostEffects(mpBoost.level)

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

/**
 * バフスキルデータから攻撃力upの効果を取得（プレイヤーレベルが必要）
 */
export function getAttackUpEffects(
	buffSkillData: Record<string, BuffSkillState> | null,
	playerLevel: number,
): Partial<AllBonuses> {
	const bonuses: Partial<AllBonuses> = {}

	if (!buffSkillData) return bonuses

	// 攻撃力up(exATK1)の処理
	const attackUp = buffSkillData['exATK1']
	if (attackUp?.isEnabled && attackUp.level) {
		const effects = calculateAttackUpEffects(
			attackUp.level,
			playerLevel,
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

/**
 * バフスキルデータから魔法力upの効果を取得（プレイヤーレベルが必要）
 */
export function getMagicUpEffects(
	buffSkillData: Record<string, BuffSkillState> | null,
	playerLevel: number,
): Partial<AllBonuses> {
	const bonuses: Partial<AllBonuses> = {}

	if (!buffSkillData) return bonuses

	// 魔法力up(exMATK1)の処理
	const magicUp = buffSkillData['exMATK1']
	if (magicUp?.isEnabled && magicUp.level) {
		const effects = calculateMagicUpEffects(
			magicUp.level,
			playerLevel,
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

/**
 * バフスキルデータから驚異の威力の効果を取得（プレイヤーレベルが必要）
 */
export function getThreatPowerEffects(
	buffSkillData: Record<string, BuffSkillState> | null,
	playerLevel: number,
): Partial<AllBonuses> {
	const bonuses: Partial<AllBonuses> = {}

	if (!buffSkillData) return bonuses

	// 驚異の威力(exATK2)の処理
	const threatPower = buffSkillData['exATK2']
	if (threatPower?.isEnabled && threatPower.level) {
		// 攻撃力upと同じ計算式を使用
		const effects = calculateAttackUpEffects(
			threatPower.level,
			playerLevel,
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

/**
 * バフスキルデータから更なる魔力の効果を取得（プレイヤーレベルが必要）
 */
export function getFurtherMagicEffects(
	buffSkillData: Record<string, BuffSkillState> | null,
	playerLevel: number,
): Partial<AllBonuses> {
	const bonuses: Partial<AllBonuses> = {}

	if (!buffSkillData) return bonuses

	// 更なる魔力(exMATK2)の処理
	const furtherMagic = buffSkillData['exMATK2']
	if (furtherMagic?.isEnabled && furtherMagic.level) {
		// 魔法力upと同じ計算式を使用
		const effects = calculateMagicUpEffects(
			furtherMagic.level,
			playerLevel,
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

/**
 * バフスキルデータから両手持ちの効果を取得（サブ武器情報が必要）
 */
export function getTwoHandsEffects(
	buffSkillData: Record<string, BuffSkillState> | null,
	mainWeaponType: WeaponType | null,
	subWeaponType: SubWeaponType | null,
): Partial<AllBonuses> {
	const convertedWeaponType = convertWeaponType(mainWeaponType)
	const bonuses: Partial<AllBonuses> = {}

	if (!buffSkillData) return bonuses

	// 両手持ち(sm1-1)の処理
	const twoHands = buffSkillData['sm1-1']
	if (twoHands?.isEnabled) {
		const effects = calculateTwoHandsEffects(
			twoHands.isEnabled,
			convertedWeaponType,
			subWeaponType,
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

/**
 * バフスキルデータから神速の軌跡の効果を取得（武器タイプが必要）
 */
export function getGodspeedTrajectoryEffects(
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

/**
 * バフスキルデータからパッシブ倍率を取得
 */
export function getBuffSkillPassiveMultiplier(
	buffSkillData: Record<string, BuffSkillState> | null,
	weaponType: WeaponType | null,
): number {
	const convertedWeaponType = convertWeaponType(weaponType)
	let totalPassiveMultiplier = 0

	if (!buffSkillData) return totalPassiveMultiplier

	// 匠の剣術(sm4)の処理
	const takumiKenjutsu = buffSkillData['sm4']
	if (takumiKenjutsu?.isEnabled) {
		totalPassiveMultiplier += calculateTakumiKenjutsuPassiveMultiplier(
			takumiKenjutsu.isEnabled,
			convertedWeaponType,
		)
	}

	return totalPassiveMultiplier
}

