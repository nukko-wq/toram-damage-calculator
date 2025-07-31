/**
 * サバイバルスキル系統のバフスキル計算
 */

import type { BuffSkillState } from '@/types/buffSkill'
import type { EquipmentProperties } from '@/types/calculator'
import type { AllBonuses } from '../../basicStatsCalculation'
import { integrateEffects } from '../types'

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
 * HPブースト(oh4)の効果計算関数
 */
export function calculateHPBoostEffects(
	skillLevel: number,
): Partial<EquipmentProperties> {
	if (!skillLevel || skillLevel === 0) return {}

	return {
		HP: skillLevel * 100,
		HP_Rate: skillLevel * 2,
	}
}

/**
 * サバイバルスキル系統の統合効果取得
 */
export function getSurvivalSkillBonuses(
	buffSkillData: Record<string, BuffSkillState> | null,
): Partial<AllBonuses> {
	const bonuses: Partial<AllBonuses> = {}

	if (!buffSkillData) return bonuses

	// MPブーストの処理
	const mpBoost = buffSkillData['oh2']
	if (mpBoost?.isEnabled && mpBoost.level) {
		const effects = calculateMPBoostEffects(mpBoost.level)
		integrateEffects(effects, bonuses)
	}

	// HPブーストの処理
	const hpBoost = buffSkillData['oh4']
	if (hpBoost?.isEnabled && hpBoost.level) {
		const effects = calculateHPBoostEffects(hpBoost.level)
		integrateEffects(effects, bonuses)
	}

	return bonuses
}
