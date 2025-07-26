/**
 * サポートスキル系統のバフスキル計算
 */

import type { BuffSkillState } from '@/types/buffSkill'
import type { EquipmentProperties } from '@/types/calculator'
import type { AllBonuses } from '../../basicStatsCalculation'
import { integrateEffects } from '../types'

/**
 * ブレイブオーラ(IsBrave)の効果計算関数
 */
export function calculateBraveAuraEffects(
	buffUserType: number, // 1: バフ使用者, 2: バフ非使用者
): Partial<EquipmentProperties> {
	if (!buffUserType || (buffUserType !== 1 && buffUserType !== 2)) return {}

	const effects: Partial<EquipmentProperties> = {
		WeaponATK_Rate: 30, // 全タイプ共通: 武器ATK+30%
		BraveMultiplier: 20, // ブレイブ倍率+20%
	}

	// バフ使用者の場合は命中率低下も追加
	if (buffUserType === 1) {
		effects.Accuracy_Rate = -50 // 命中率-50%
	}

	return effects
}

/**
 * マナリチャージ(IsManaReCharge)の効果計算関数
 */
export function calculateManaRechargeEffects(
	isEnabled: boolean,
): Partial<EquipmentProperties> {
	if (!isEnabled) return {}

	return {
		BraveMultiplier: -25, // ブレイブ倍率-25%
	}
}

/**
 * サポートスキル系統のブレイブ倍率取得
 * 複数のブレイブ倍率スキルを加算して合計値を返す
 */
export function getSupportSkillBraveMultiplier(
	buffSkillData: Record<string, BuffSkillState> | null,
): number {
	let braveMultiplier = 0

	if (!buffSkillData) return braveMultiplier

	// ブレイブオーラ（IsBrave）の処理
	const braveAura = buffSkillData.IsBrave
	if (braveAura?.isEnabled && braveAura.multiParam1) {
		const effects = calculateBraveAuraEffects(braveAura.multiParam1)
		braveMultiplier += effects.BraveMultiplier || 0
	}

	// マナリチャージ（IsManaReCharge）の処理
	const manaRecharge = buffSkillData.IsManaReCharge
	if (manaRecharge?.isEnabled) {
		const effects = calculateManaRechargeEffects(manaRecharge.isEnabled)
		braveMultiplier += effects.BraveMultiplier || 0
	}

	return braveMultiplier
}

/**
 * サポートスキル系統の統合効果取得
 */
export function getSupportSkillBonuses(
	buffSkillData: Record<string, BuffSkillState> | null,
): Partial<AllBonuses> {
	const bonuses: Partial<AllBonuses> = {}

	if (!buffSkillData) return bonuses

	// ブレイブオーラ（IsBrave）の処理
	const braveAura = buffSkillData.IsBrave
	if (braveAura?.isEnabled && braveAura.multiParam1) {
		const effects = calculateBraveAuraEffects(braveAura.multiParam1)
		integrateEffects(effects, bonuses)
	}

	// マナリチャージ（IsManaReCharge）の処理
	const manaRecharge = buffSkillData.IsManaReCharge
	if (manaRecharge?.isEnabled) {
		const effects = calculateManaRechargeEffects(manaRecharge.isEnabled)
		integrateEffects(effects, bonuses)
	}

	return bonuses
}