/**
 * ブレードスキル系統のバフスキル計算
 */

import type { BuffSkillState, MainWeaponType } from '@/types/buffSkill'
import type { EquipmentProperties, WeaponType } from '@/types/calculator'
import type { AllBonuses } from '../../basicStatsCalculation'
import { convertWeaponType, integrateEffects } from '../types'

/**
 * 素早い斬撃の効果計算関数
 */
export function calculateQuickSlashEffects(
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
	const bladeWeapons: MainWeaponType[] = [
		'oneHandSword',
		'twoHandSword',
		'dualSword',
	]
	if (!isEnabled || !weaponType || !bladeWeapons.includes(weaponType)) return 0

	return 20 // パッシブ倍率 +20%
}

/**
 * ブレードスキル系統の統合効果取得
 */
export function getBladeSkillBonuses(
	buffSkillData: Record<string, BuffSkillState> | null,
	weaponType: WeaponType | null,
): Partial<AllBonuses> {
	const convertedWeaponType = convertWeaponType(weaponType)
	const bonuses: Partial<AllBonuses> = {}

	if (!buffSkillData) return bonuses

	// 素早い斬撃の処理
	const quickSlash = buffSkillData['sm2']
	if (quickSlash?.isEnabled && quickSlash.level) {
		const effects = calculateQuickSlashEffects(
			quickSlash.level,
			convertedWeaponType,
		)
		integrateEffects(effects, bonuses)
	}

	return bonuses
}

/**
 * ブレードスキル系統のパッシブ倍率取得
 */
export function getBladeSkillPassiveMultiplier(
	buffSkillData: Record<string, BuffSkillState> | null,
	weaponType: WeaponType | null,
	attackSkillCategory?: string,
): number {
	const convertedWeaponType = convertWeaponType(weaponType)
	let totalPassiveMultiplier = 0

	if (!buffSkillData) return totalPassiveMultiplier

	// 匠の剣術(sm4)の処理 - bladeカテゴリのスキル使用時のみ適用
	const takumiKenjutsu = buffSkillData.sm4
	if (takumiKenjutsu?.isEnabled && attackSkillCategory === 'blade') {
		totalPassiveMultiplier += calculateTakumiKenjutsuPassiveMultiplier(
			takumiKenjutsu.isEnabled,
			convertedWeaponType,
		)
	}

	return totalPassiveMultiplier
}