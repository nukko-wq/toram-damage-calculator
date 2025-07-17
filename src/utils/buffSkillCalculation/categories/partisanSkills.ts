/**
 * パルチザンスキル系統のバフスキル計算
 */

import type { BuffSkillState } from '@/types/buffSkill'
import type { EquipmentProperties } from '@/types/calculator'
import type { AllBonuses } from '../../basicStatsCalculation'
import { integrateEffects } from '../types'

/**
 * 前線維持Ⅱ(pal1)の効果計算関数
 */
export function calculateFrontlineMaintenance2Effects(
	skillLevel: number,
	baseStatsLevel: number,
): Partial<EquipmentProperties> {
	if (!skillLevel || skillLevel === 0) return {}

	// HP = 10 × (スキルレベル × 10 + 基本ステータスレベル)
	const hpBonus = 10 * (skillLevel * 10 + baseStatsLevel)

	return {
		HP: hpBonus,
	}
}

/**
 * パルチザンスキル系統の統合効果取得
 */
export function getPartisanSkillBonuses(
	buffSkillData: Record<string, BuffSkillState> | null,
	baseStatsLevel: number,
): Partial<AllBonuses> {
	const bonuses: Partial<AllBonuses> = {}

	if (!buffSkillData) return bonuses

	// 前線維持Ⅱ(pal1)の処理
	const frontlineMaintenance2 = buffSkillData.pal1
	if (frontlineMaintenance2?.isEnabled && frontlineMaintenance2.level) {
		const effects = calculateFrontlineMaintenance2Effects(
			frontlineMaintenance2.level,
			baseStatsLevel,
		)
		integrateEffects(effects, bonuses)
	}

	return bonuses
}