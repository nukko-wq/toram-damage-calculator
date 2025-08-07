/**
 * バトルスキル系統のバフスキル計算
 */

import type { BuffSkillState } from '@/types/buffSkill'
import type { EquipmentProperties } from '@/types/calculator'
import type { AllBonuses } from '../../basicStatsCalculation'
import { integrateEffects } from '../types'

/**
 * 攻撃力UP(exATK1)の効果計算関数
 */
export function calculateAttackUpEffects(
	skillLevel: number,
	playerLevel: number,
): Partial<EquipmentProperties> {
	if (!skillLevel || skillLevel === 0) return {}

	// ATK = Math.floor(プレイヤーレベル × Math.floor(25 × スキルレベル ÷ 10) ÷ 100)
	const atkBonus = Math.floor((playerLevel * Math.floor((25 * skillLevel) / 10)) / 100)

	return {
		ATK: atkBonus,
	}
}

/**
 * 魔法力UP(exMATK1)の効果計算関数
 */
export function calculateMagicUpEffects(
	skillLevel: number,
	playerLevel: number,
): Partial<EquipmentProperties> {
	if (!skillLevel || skillLevel === 0) return {}

	// MATK = Math.floor(プレイヤーレベル × Math.floor(25 × スキルレベル ÷ 10) ÷ 100)
	const matkBonus = Math.floor((playerLevel * Math.floor((25 * skillLevel) / 10)) / 100)

	return {
		MATK: matkBonus,
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
 * 命中UP(exHIT)の効果計算関数
 */
export function calculateAccuracyUpEffects(
	skillLevel: number,
): Partial<EquipmentProperties> {
	if (!skillLevel || skillLevel === 0) return {}

	// Accuracy = skillLevel
	return {
		Accuracy: skillLevel,
	}
}

/**
 * 回避UP(exFREE)の効果計算関数
 */
export function calculateDodgeUpEffects(
	skillLevel: number,
): Partial<EquipmentProperties> {
	if (!skillLevel || skillLevel === 0) return {}

	// Dodge = skillLevel
	return {
		Dodge: skillLevel,
	}
}

/**
 * バトルスキル系統の統合効果取得（基本スキル）
 */
export function getBattleSkillBonuses(
	buffSkillData: Record<string, BuffSkillState> | null,
): Partial<AllBonuses> {
	const bonuses: Partial<AllBonuses> = {}

	if (!buffSkillData) return bonuses

	// クリティカルupの処理
	const criticalUp = buffSkillData['oh1']
	if (criticalUp?.isEnabled) {
		const effects = calculateCriticalUpEffects(criticalUp.isEnabled)
		integrateEffects(effects, bonuses)
	}

	return bonuses
}

/**
 * バトルスキル系統の統合効果取得（プレイヤーレベル依存）
 */
export function getBattleSkillBonusesWithPlayerLevel(
	buffSkillData: Record<string, BuffSkillState> | null,
	playerLevel: number,
): Partial<AllBonuses> {
	const bonuses: Partial<AllBonuses> = {}

	if (!buffSkillData) return bonuses

	// 攻撃力UP(exATK1)の処理
	const attackUp = buffSkillData['exATK1']
	if (attackUp?.isEnabled && attackUp.level) {
		const effects = calculateAttackUpEffects(attackUp.level, playerLevel)
		integrateEffects(effects, bonuses)
	}

	// 魔法力UP(exMATK1)の処理
	const magicUp = buffSkillData['exMATK1']
	if (magicUp?.isEnabled && magicUp.level) {
		const effects = calculateMagicUpEffects(magicUp.level, playerLevel)
		integrateEffects(effects, bonuses)
	}

	// 驚異の威力(exATK2)の処理 - 攻撃力UPと同じ計算式
	const threatPower = buffSkillData['exATK2']
	if (threatPower?.isEnabled && threatPower.level) {
		const effects = calculateAttackUpEffects(threatPower.level, playerLevel)
		integrateEffects(effects, bonuses)
	}

	// 更なる魔力(exMATK2)の処理 - 魔法力UPと同じ計算式
	const furtherMagic = buffSkillData['exMATK2']
	if (furtherMagic?.isEnabled && furtherMagic.level) {
		const effects = calculateMagicUpEffects(furtherMagic.level, playerLevel)
		integrateEffects(effects, bonuses)
	}

	// 命中UP(exHIT)の処理
	const accuracyUp = buffSkillData['exHIT']
	if (accuracyUp?.isEnabled && accuracyUp.level) {
		const effects = calculateAccuracyUpEffects(accuracyUp.level)
		integrateEffects(effects, bonuses)
	}

	// 回避UP(exFREE)の処理
	const dodgeUp = buffSkillData['exFREE']
	if (dodgeUp?.isEnabled && dodgeUp.level) {
		const effects = calculateDodgeUpEffects(dodgeUp.level)
		integrateEffects(effects, bonuses)
	}

	return bonuses
}
