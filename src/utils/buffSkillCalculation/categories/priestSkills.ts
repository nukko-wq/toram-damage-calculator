/**
 * プリーストスキル系統のバフスキル計算
 */

import type { BuffSkillState } from '@/types/buffSkill'
import type { EquipmentProperties, WeaponType } from '@/types/calculator'
import type { AllBonuses } from '../../basicStatsCalculation'
import { integrateEffects } from '../types'

/**
 * プリエールの効果計算関数
 */
export function calculatePriereEffects(
	weaponTypeParam: number, // 1: メイン/サブ武器が魔導具, 2: それ以外
): Partial<EquipmentProperties> {
	if (!weaponTypeParam || (weaponTypeParam !== 1 && weaponTypeParam !== 2))
		return {}

	// 武器タイプに応じた効果
	if (weaponTypeParam === 1) {
		// メイン/サブ武器が魔導具の場合
		return {
			MATK_Rate: 15, // MATK率+15%
		}
	}
	// それ以外の場合
	return {
		MATK_Rate: 10, // MATK率+10%
	}
}

/**
 * プリーストスキル系統の統合効果取得
 */
export function getPriestSkillBonuses(
	buffSkillData: Record<string, BuffSkillState> | null,
): Partial<AllBonuses> {
	const bonuses: Partial<AllBonuses> = {}

	if (!buffSkillData) return bonuses

	// プリエールの処理
	const priere = buffSkillData['IsPriere']
	if (priere?.isEnabled && priere.multiParam1) {
		const effects = calculatePriereEffects(priere.multiParam1)
		integrateEffects(effects, bonuses)
	}

	return bonuses
}
