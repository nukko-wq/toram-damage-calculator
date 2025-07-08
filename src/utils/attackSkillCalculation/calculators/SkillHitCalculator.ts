import type { AttackHit } from '@/types/calculator'
import { getAttackSkillById } from '@/data/attackSkills'
import type { SkillCalculationInput, SkillCalculationResult } from '../types'

/**
 * スキル計算器の基底クラス
 */
export abstract class SkillHitCalculator {
	/**
	 * スキル計算の実行
	 */
	abstract calculate(input: SkillCalculationInput): SkillCalculationResult

	/**
	 * スキルの指定された撃目データを取得
	 */
	protected getSkillHit(skillId: string, hitNumber: number): AttackHit {
		const skill = getAttackSkillById(skillId)
		if (!skill) {
			throw new Error(`Skill not found: ${skillId}`)
		}

		const hit = skill.hits.find((h) => h.hitNumber === hitNumber)
		if (!hit) {
			throw new Error(`Hit ${hitNumber} not found for skill: ${skillId}`)
		}

		return hit
	}
}
