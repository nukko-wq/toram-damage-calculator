/**
 * ハルバードスキル系統のバフスキル計算
 */

import type { BuffSkillState, MainWeaponType } from '@/types/buffSkill'
import type { EquipmentProperties, WeaponType } from '@/types/calculator'
import type { AllBonuses } from '../../basicStatsCalculation'
import { convertWeaponType, integrateEffects } from '../types'

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
 * 会心の捌き(hb2)の効果計算関数
 */
export function calculateCriticalParryEffects(
	isEnabled: boolean,
	weaponType: MainWeaponType | null,
): Partial<EquipmentProperties> {
	if (!isEnabled || weaponType !== 'halberd') return {}

	return {
		Critical: 5,
		Critical_Rate: 5,
	}
}

/**
 * ハルバードスキル系統の統合効果取得
 */
/**
 * トルネードランス(hb3)の効果計算関数
 */
export function calculateTornadoLanceEffects(
	stackCount: number,
	weaponType: MainWeaponType | null,
): Partial<EquipmentProperties> {
	if (!stackCount || stackCount === 0 || weaponType !== 'halberd') return {}

	return {
		CriticalDamage: stackCount * 2,
		Dodge_Rate: stackCount * 10,
	}
}

/**
 * トールハンマー(hb4)の効果計算関数
 */
export function calculateThorHammerEffects(
	isEnabled: boolean,
	weaponType: MainWeaponType | null,
	baseINT: number,
): Partial<EquipmentProperties> {
	if (!isEnabled || weaponType !== 'halberd') return {}

	return {
		MagicalPenetration_Rate: 20,
		MagicalFollowup_Rate: 100,
		Accuracy: baseINT,
	}
}

export function getHalberdSkillBonuses(
	buffSkillData: Record<string, BuffSkillState> | null,
	weaponType: WeaponType | null,
	baseStats?: { INT?: number }, // 基礎ステータスを追加
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
		integrateEffects(effects, bonuses)
	}

	// クイックオーラの処理
	const quickAura = buffSkillData['hb1']
	if (quickAura?.isEnabled && quickAura.level) {
		const effects = calculateQuickAuraEffects(quickAura.level)
		integrateEffects(effects, bonuses)
	}

	// 会心の捌きの処理
	const criticalParry = buffSkillData['hb2']
	if (criticalParry?.isEnabled) {
		const effects = calculateCriticalParryEffects(
			criticalParry.isEnabled,
			convertedWeaponType,
		)
		integrateEffects(effects, bonuses)
	}

	// トルネードランスの処理
	const tornadoLance = buffSkillData['hb3']
	if (tornadoLance?.isEnabled && tornadoLance.stackCount) {
		const effects = calculateTornadoLanceEffects(
			tornadoLance.stackCount,
			convertedWeaponType,
		)
		integrateEffects(effects, bonuses)
	}

	// トールハンマーの処理
	const thorHammer = buffSkillData['hb4']
	if (thorHammer?.isEnabled) {
		const effects = calculateThorHammerEffects(
			thorHammer.isEnabled,
			convertedWeaponType,
			baseStats?.INT || 0, // 基礎INTを取得
		)
		integrateEffects(effects, bonuses)
	}

	return bonuses
}
