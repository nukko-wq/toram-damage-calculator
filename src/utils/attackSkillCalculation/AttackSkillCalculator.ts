import { getAttackSkillById } from '@/data/attackSkills'
import {
	BusterBladeCalculator,
	CycloneArrowCalculator,
	LBoomerang3Calculator,
	MagicArrowCalculator,
	MoonSlashCalculator,
	type SkillHitCalculator,
	StandardCalculator,
	Storm1Hit6Calculator,
	StrikeStabAilmentCalculator,
	StrikeStabCalculator,
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
			case 'l_boomerang_3':
				return new LBoomerang3Calculator()
			case 'moon_slash':
				return new MoonSlashCalculator()
			case 'strike_stab':
				return new StrikeStabCalculator()
			case 'strike_stab_ailment':
				return new StrikeStabAilmentCalculator()
			case 'magic_arrow':
				return new MagicArrowCalculator()
			case 'storm_1_6hit':
				return new Storm1Hit6Calculator()
			case 'buster_blade':
				return new BusterBladeCalculator()
			case 'cyclone_arrow':
				return new CycloneArrowCalculator()
			case 'power_shot':
			case 'dual_strike':
				return new StandardCalculator()
			default:
				throw new Error(`No calculator found for skill: ${skillId}`)
		}
	}
}
