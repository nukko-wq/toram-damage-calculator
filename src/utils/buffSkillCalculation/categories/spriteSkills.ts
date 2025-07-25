/**
 * スプライトスキル系統のバフスキル計算
 */

import type { BuffSkillState } from '@/types/buffSkill'
import type { EquipmentProperties } from '@/types/calculator'
import type { AllBonuses } from '../../basicStatsCalculation'
import { integrateEffects } from '../types'

/**
 * エンハンス(IsEnhance)の効果計算関数
 */
export function calculateEnhanceEffects(
	isEnabled: boolean,
	enemyDEF: number,
	enemyMDEF: number,
	enemyLevel: number,
): Partial<EquipmentProperties> {
	if (!isEnabled) return {}

	// ブレイブ倍率+10%
	const braveMultiplier = 10

	// ATK = Math.min(Math.floor(敵DEF / 2), 敵レベル)
	const atkBonus = Math.min(Math.floor(enemyDEF / 2), enemyLevel)

	// MATK = Math.min(Math.floor(敵MDEF / 2), 敵レベル)
	const matkBonus = Math.min(Math.floor(enemyMDEF / 2), enemyLevel)

	return {
		BraveMultiplier: braveMultiplier,
		ATK: atkBonus,
		MATK: matkBonus,
	}
}

/**
 * スプライトスキル系統の統合効果取得
 */
export function getSpriteSkillBonuses(
	buffSkillData: Record<string, BuffSkillState> | null,
	enemyDEF: number = 0,
	enemyMDEF: number = 0,
	enemyLevel: number = 1,
): Partial<AllBonuses> {
	const bonuses: Partial<AllBonuses> = {}

	if (!buffSkillData) return bonuses

	// エンハンス(IsEnhance)の処理
	const enhance = buffSkillData.IsEnhance
	if (enhance?.isEnabled) {
		const effects = calculateEnhanceEffects(
			enhance.isEnabled,
			enemyDEF,
			enemyMDEF,
			enemyLevel,
		)
		integrateEffects(effects, bonuses)
	}

	return bonuses
}

/**
 * スプライトスキル系統のブレイブ倍率取得
 */
export function getSpriteSkillBraveMultiplier(
	buffSkillData: Record<string, BuffSkillState> | null,
	enemyDEF: number = 0,
	enemyMDEF: number = 0,
	enemyLevel: number = 1,
): number {
	let braveMultiplier = 0

	if (!buffSkillData) return braveMultiplier

	// エンハンス(IsEnhance)の処理
	const enhance = buffSkillData.IsEnhance
	if (enhance?.isEnabled) {
		const effects = calculateEnhanceEffects(
			enhance.isEnabled,
			enemyDEF,
			enemyMDEF,
			enemyLevel,
		)
		braveMultiplier += effects.BraveMultiplier || 0
	}

	return braveMultiplier
}