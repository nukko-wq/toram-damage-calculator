import { getAttackSkillById } from '@/data/attackSkills'
import {
	BusterBladeCalculator,
	CycloneArrowCalculator,
	LBoomerang3Calculator,
	MagicArrowCalculator,
	MeteorBreakerCalculator,
	MoonSlashCalculator,
	OgreSlashCalculator,
	type SkillHitCalculator,
	StandardCalculator,
	Storm1Hit6Calculator,
	Storm1Hit6ExtendCalculator,
	Storm1Hit6NewCalculator,
	StormBlazer1StackCalculator,
	StormBlazer10StackCalculator,
	StrikeStabAilmentCalculator,
	StrikeStabCalculator,
	ThorHammerFollowup5HitCalculator,
	ThorHammerFollowup8HitCalculator,
	ThorHammerFollowupCalculator,
	ThorHammerSingleCalculator,
} from './calculators'
import type {
	BuffSkillContext,
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
		buffSkillContext?: BuffSkillContext,
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
				buffSkillContext,
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
			case 'meteor_breaker':
				return new MeteorBreakerCalculator()
			case 'moon_slash':
				return new MoonSlashCalculator()
			case 'ogre_slash':
				return new OgreSlashCalculator()
			case 'storm_blazer_10stack':
				return new StormBlazer10StackCalculator()
			case 'storm_blazer_1stack':
				return new StormBlazer1StackCalculator()
			case 'strike_stab':
				return new StrikeStabCalculator()
			case 'strike_stab_ailment':
				return new StrikeStabAilmentCalculator()
			case 'magic_arrow':
				return new MagicArrowCalculator()
			case 'storm_1_6hit':
				return new Storm1Hit6Calculator()
			case 'storm_1_6hit_new':
				return new Storm1Hit6NewCalculator()
			case 'storm_1_6hit_extend':
				return new Storm1Hit6ExtendCalculator()
			case 'buster_blade':
				return new BusterBladeCalculator()
			case 'cyclone_arrow':
				return new CycloneArrowCalculator()
			case 'thor_hammer_single':
				return new ThorHammerSingleCalculator()
			case 'thor_hammer_followup':
				return new ThorHammerFollowupCalculator()
			case 'thor_hammer_followup_5hit':
				return new ThorHammerFollowup5HitCalculator()
			case 'thor_hammer_followup_8hit':
				return new ThorHammerFollowup8HitCalculator()
			case 'power_shot':
			case 'dual_strike':
				return new StandardCalculator()
			default:
				throw new Error(`No calculator found for skill: ${skillId}`)
		}
	}
}
