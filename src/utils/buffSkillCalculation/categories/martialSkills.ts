/**
 * マーシャルスキル系統のバフスキル計算
 */

import type { BuffSkillState, MainWeaponType } from '@/types/buffSkill'
import type { EquipmentProperties } from '@/types/calculator'
import type { AllBonuses } from '../../basicStatsCalculation'
import { convertWeaponType, integrateEffects } from '../types'
import type { WeaponType } from '@/types/calculator'

/**
 * 体術鍛錬の効果計算関数
 */
export function calculatePhysicalTrainingEffects(
	skillLevel: number,
	weaponType: MainWeaponType | null,
): Partial<EquipmentProperties> {
	if (!weaponType || weaponType !== 'knuckle' || skillLevel <= 0) return {}

	// 攻撃速度効果計算
	const attackSpeed = skillLevel * 10
	const attackSpeedRate = Math.abs(skillLevel)

	return {
		AttackSpeed: attackSpeed,
		AttackSpeed_Rate: attackSpeedRate,
	}
}

/**
 * 強力な追撃の効果計算関数
 * TODO: 追撃効果の詳細設計が必要
 */
export function calculatePowerfulFollowUpEffects(
	skillLevel: number,
	weaponType: MainWeaponType | null,
): Partial<EquipmentProperties> {
	if (!weaponType || weaponType !== 'knuckle' || skillLevel <= 0) return {}

	// TODO: 追撃効果の実装
	return {}
}

/**
 * アシュラオーラの効果計算関数
 * TODO: アシュラオーラ効果の詳細設計が必要
 */
export function calculateAshuraAuraEffects(
	isEnabled: boolean,
	weaponType: MainWeaponType | null,
): Partial<EquipmentProperties> {
	if (!isEnabled || !weaponType || weaponType !== 'knuckle') return {}

	// TODO: アシュラオーラ効果の実装
	return {}
}

/**
 * マーシャルスキル系統の統合効果取得
 */
export function getMartialSkillBonuses(
	buffSkillData: Record<string, BuffSkillState> | null,
	weaponType: WeaponType | null,
): Partial<AllBonuses> {
	const convertedWeaponType = convertWeaponType(weaponType)
	const bonuses: Partial<AllBonuses> = {}

	if (!buffSkillData) return bonuses

	// 体術鍛錬の処理
	const physicalTraining = buffSkillData['ma1']
	if (physicalTraining?.isEnabled && physicalTraining.level) {
		const effects = calculatePhysicalTrainingEffects(
			physicalTraining.level,
			convertedWeaponType,
		)
		integrateEffects(effects, bonuses)
	}

	// 強力な追撃の処理
	const powerfulFollowUp = buffSkillData['ma2-1']
	if (powerfulFollowUp?.isEnabled && powerfulFollowUp.level) {
		const effects = calculatePowerfulFollowUpEffects(
			powerfulFollowUp.level,
			convertedWeaponType,
		)
		integrateEffects(effects, bonuses)
	}

	// アシュラオーラの処理
	const ashuraAura = buffSkillData['ma2']
	if (ashuraAura?.isEnabled) {
		const effects = calculateAshuraAuraEffects(
			ashuraAura.isEnabled,
			convertedWeaponType,
		)
		integrateEffects(effects, bonuses)
	}

	return bonuses
}