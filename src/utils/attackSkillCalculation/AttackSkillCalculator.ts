import { getAttackSkillById } from '@/data/attackSkills'
import {
	MoonSlashCalculator,
	type SkillHitCalculator,
	StandardCalculator,
	StrikeStabCalculator,
	StrikeStabAilmentCalculator,
} from './calculators'
import type {
	EquipmentContext,
	PlayerStats,
	SkillCalculationInput,
	SkillCalculationResult,
} from './types'

/**
 * メイン計算エンジン
 */
export class AttackSkillCalculator {
	/**
	 * スキルの計算を実行
	 */
	calculateSkill(
		skillId: string,
		playerStats: PlayerStats,
		equipmentContext: EquipmentContext,
	): SkillCalculationResult[] {
		const skill = getAttackSkillById(skillId)
		if (!skill) {
			throw new Error(`Skill not found: ${skillId}`)
		}

		return skill.hits.map((hit) =>
			this.calculateHit({
				skillId,
				hitNumber: hit.hitNumber,
				playerStats,
				equipmentContext,
			}),
		)
	}

	/**
	 * 単一撃の計算
	 */
	private calculateHit(input: SkillCalculationInput): SkillCalculationResult {
		const calculator = this.getCalculatorForSkill(input.skillId)
		return calculator.calculate(input)
	}

	/**
	 * スキル固有の計算機を取得
	 */
	private getCalculatorForSkill(skillId: string): SkillHitCalculator {
		switch (skillId) {
			case 'moon_slash':
				return new MoonSlashCalculator()
			case 'strike_stab':
				return new StrikeStabCalculator()
			case 'strike_stab_ailment':
				return new StrikeStabAilmentCalculator()
			case 'slash':
			case 'magic_arrow':
			case 'power_shot':
			case 'dual_strike':
				return new StandardCalculator()
			default:
				throw new Error(`No calculator found for skill: ${skillId}`)
		}
	}
}