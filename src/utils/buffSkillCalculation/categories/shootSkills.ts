/**
 * シュートスキル系統のバフスキル計算
 */

import type { BuffSkillState } from '@/types/buffSkill'
import type { EquipmentProperties } from '@/types/calculator'

/**
 * 武士弓術の効果計算関数
 * メイン武器が弓でサブ武器が抜刀剣の場合のみ効果が発動
 */
export function calculateArcheryEffects(
	isEnabled: boolean,
	mainWeaponType: string | null,
	subWeaponType: string | null,
	subWeaponATK = 0,
	subWeaponStability = 0,
): Partial<EquipmentProperties> {
	if (!isEnabled) return {}
	
	// メイン武器が弓でサブ武器が抜刀剣の場合のみ効果が発動
	if (mainWeaponType !== '弓' || subWeaponType !== '抜刀剣') {
		return {}
	}

	return {
		WeaponATK: subWeaponATK, // サブ武器の武器ATK分の加算
		Stability_Rate: Math.floor(subWeaponStability / 4), // サブ武器の安定率 / 4（小数点以下切り捨て）
	}
}

/**
 * 武士弓術の効果を取得
 */
export function getArcheryEffects(
	buffSkillData: Record<string, BuffSkillState> | null,
	mainWeaponType: string | null,
	subWeaponType: string | null,
	subWeaponATK = 0,
	subWeaponStability = 0,
): Partial<EquipmentProperties> {
	if (!buffSkillData) return {}

	const archery = buffSkillData.ar1
	if (archery?.isEnabled) {
		return calculateArcheryEffects(
			archery.isEnabled,
			mainWeaponType,
			subWeaponType,
			subWeaponATK,
			subWeaponStability,
		)
	}

	return {}
}