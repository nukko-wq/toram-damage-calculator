import type { CalculatorData } from '@/types/calculator'
import type { CalculationResults } from '@/types/calculationResult'
import {
	calculateHP,
	calculateMP,
	calculateAdjustedStats,
	calculateASPD,
	calculateMotionSpeed,
	calculateAilmentResistance,
	calculateATK,
	calculateSubATK,
	calculateCriticalRate,
	calculateCriticalDamage,
	calculateMagicalCriticalDamage,
	calculateTotalATK,
	calculateMATK,
	calculateHIT,
	calculatePhysicalResistance,
	calculateMagicalResistance,
	calculateArmorBreak,
	calculateAnticipate,
	calculateCSPD,
	calculateFLEE,
	calculateTotalElementAdvantage,
	calculateStability,
	getBodyArmorType,
} from './basicStatsCalculation'
import { getAllDataSourceBonusesWithBuffSkills } from './dataSourceIntegration'

/**
 * 計算結果を生成する（実際の計算式使用）
 *
 * @param data - 全入力フォームデータ
 * @returns 計算結果
 */
export const calculateResults = (data: CalculatorData): CalculationResults => {
	// 装備・クリスタ・料理・バフ・バフスキルからの補正値を統合
	const initialBonuses = getAllDataSourceBonusesWithBuffSkills(data)

	// 全ての効果を統合した最終ボーナス値を作成
	const allBonuses = { ...initialBonuses }

	// レジスタ効果を統合
	if (data.register?.effects) {
		const maxHpUpEffect = data.register.effects.find(
			(effect) => effect.type === 'maxHpUp' && effect.isEnabled,
		)
		if (maxHpUpEffect) {
			allBonuses.HP = (allBonuses.HP || 0) + maxHpUpEffect.level * 10
		}

		const maxMpUpEffect = data.register.effects.find(
			(effect) => effect.type === 'maxMpUp' && effect.isEnabled,
		)
		if (maxMpUpEffect) {
			allBonuses.MP = (allBonuses.MP || 0) + maxMpUpEffect.level * 1
		}

		const physicalAttackUpEffect = data.register.effects.find(
			(effect) => effect.type === 'physicalAttackUp' && effect.isEnabled,
		)
		if (physicalAttackUpEffect) {
			allBonuses.ATK = (allBonuses.ATK || 0) + physicalAttackUpEffect.level * 1
		}

		const magicAttackUpEffect = data.register.effects.find(
			(effect) => effect.type === 'magicalAttackUp' && effect.isEnabled,
		)
		if (magicAttackUpEffect) {
			allBonuses.MATK = (allBonuses.MATK || 0) + magicAttackUpEffect.level * 1
		}

		const accuracyUpEffect = data.register.effects.find(
			(effect) => effect.type === 'accuracyUp' && effect.isEnabled,
		)
		if (accuracyUpEffect) {
			allBonuses.Accuracy =
				(allBonuses.Accuracy || 0) + accuracyUpEffect.level * 1
		}

		const evasionUpEffect = data.register.effects.find(
			(effect) => effect.type === 'evasionUp' && effect.isEnabled,
		)
		if (evasionUpEffect) {
			allBonuses.Dodge = (allBonuses.Dodge || 0) + evasionUpEffect.level * 1
		}

		const attackSpeedUpEffect = data.register.effects.find(
			(effect) => effect.type === 'attackSpeedUp' && effect.isEnabled,
		)
		if (attackSpeedUpEffect) {
			allBonuses.AttackSpeed =
				(allBonuses.AttackSpeed || 0) + attackSpeedUpEffect.level * 1
		}

		const magicalSpeedUpEffect = data.register.effects.find(
			(effect) => effect.type === 'magicalSpeedUp' && effect.isEnabled,
		)
		if (magicalSpeedUpEffect) {
			allBonuses.CastingSpeed =
				(allBonuses.CastingSpeed || 0) + magicalSpeedUpEffect.level * 1
		}

		const fateCompanionshipEffect = data.register.effects.find(
			(effect) => effect.type === 'fateCompanionship' && effect.isEnabled,
		)
		if (fateCompanionshipEffect) {
			const bonusPercent = (fateCompanionshipEffect.partyMembers || 1) * 1
			allBonuses.ATK_Rate = (allBonuses.ATK_Rate || 0) + bonusPercent
			allBonuses.MATK_Rate = (allBonuses.MATK_Rate || 0) + bonusPercent
		}

		// ギルド料理効果
		const deliciousIngredientTradeEffect = data.register.effects.find(
			(effect) =>
				effect.type === 'deliciousIngredientTrade' && effect.isEnabled,
		)
		if (deliciousIngredientTradeEffect) {
			allBonuses.HP =
				(allBonuses.HP || 0) + deliciousIngredientTradeEffect.level * 100
		}

		const freshFruitTradeEffect = data.register.effects.find(
			(effect) => effect.type === 'freshFruitTrade' && effect.isEnabled,
		)
		if (freshFruitTradeEffect) {
			allBonuses.MP = (allBonuses.MP || 0) + freshFruitTradeEffect.level * 10
		}
	}

	// 1. 補正後ステータス計算
	const adjustedStats = calculateAdjustedStats(data.baseStats, allBonuses)

	// 2. HP計算
	const hpCalculation = calculateHP(data.baseStats, allBonuses)

	// 3. MP計算
	const mpCalculation = calculateMP(data.baseStats, allBonuses)

	// 4. ATK計算
	const atkCalculation = calculateATK(
		data.baseStats,
		data.mainWeapon,
		data.subWeapon,
		adjustedStats,
		allBonuses,
	)

	// 4-1. サブATK計算
	const subATKCalculation = calculateSubATK(
		data.baseStats,
		data.mainWeapon,
		data.subWeapon,
		adjustedStats,
		allBonuses,
	)

	// 4-2. 総ATK計算
	const totalATKCalculation = calculateTotalATK(
		data.mainWeapon.weaponType,
		atkCalculation.finalATK,
		subATKCalculation?.subFinalATK || 0,
	)

	// 5. ASPD計算（体装備のArmorTypeを取得）
	const bodyArmorType = getBodyArmorType(data.equipment.body)
	const aspdCalculation = calculateASPD(
		data.baseStats,
		data.mainWeapon,
		adjustedStats,
		allBonuses,
		bodyArmorType,
	)

	// 6. 行動速度計算
	const motionSpeedCalculation = calculateMotionSpeed(
		aspdCalculation.finalASPD,
		allBonuses,
	)

	// 7. 異常耐性計算
	const ailmentResistance = calculateAilmentResistance(
		data.baseStats,
		allBonuses,
	)

	// 8. クリティカル率計算
	const criticalRateCalculation = calculateCriticalRate(
		data.baseStats.CRT,
		allBonuses,
	)

	// 8-2. クリティカルダメージ計算
	const criticalDamageCalculation = calculateCriticalDamage(
		adjustedStats.STR,
		adjustedStats.AGI,
		allBonuses,
	)

	// 8-3. 魔法クリティカルダメージ計算
	// バフスキルからスペルバーストの状態を取得
	// スペルバーストはtoggleタイプで、有効時はレベル10として扱う
	const spellBurstSkill = data.buffSkills.skills.sf1
	const spellBurstLevel = spellBurstSkill?.isEnabled ? 10 : 0
	const magicalCriticalDamageCalculation = calculateMagicalCriticalDamage(
		criticalDamageCalculation.finalCriticalDamage,
		spellBurstLevel,
	)

	// 8-3. MATK計算
	const matkCalculation = calculateMATK(
		data.baseStats.level,
		data.mainWeapon.weaponType,
		data.mainWeapon.ATK,
		data.mainWeapon.refinement,
		atkCalculation.totalWeaponATK, // 手甲用の総武器ATK
		data.baseStats, // 基礎ステータス（MATKアップ用）
		adjustedStats, // 補正後ステータス（ステータスMATK用）
		allBonuses,
	)

	// 9. HIT計算
	const hitCalculation = calculateHIT(
		data.baseStats.level,
		adjustedStats.DEX,
		allBonuses,
	)

	// 10. FLEE計算
	const fleeCalculation = calculateFLEE(
		data.baseStats.level,
		adjustedStats.AGI,
		data.equipment.body,
		allBonuses,
	)

	// 11. 物理耐性計算
	const physicalResistanceCalculation = calculatePhysicalResistance(allBonuses)

	// 12. 魔法耐性計算
	const magicalResistanceCalculation = calculateMagicalResistance(allBonuses)

	// 13. 防御崩し計算
	const armorBreakCalculation = calculateArmorBreak(allBonuses)

	// 14. 先読み計算
	const anticipateCalculation = calculateAnticipate(allBonuses)

	// 15. CSPD計算
	const cspdCalculation = calculateCSPD(
		data.baseStats.level,
		adjustedStats.DEX,
		adjustedStats.AGI,
		allBonuses,
	)

	// 16. 総属性有利計算
	const totalElementAdvantageCalculation =
		calculateTotalElementAdvantage(allBonuses)

	// 17. 安定率計算
	const stabilityCalculation = calculateStability(
		data.mainWeapon.stability,
		data.mainWeapon.weaponType,
		adjustedStats,
		allBonuses,
	)

	return {
		basicStats: {
			HP: hpCalculation.finalHP,
			MP: mpCalculation.finalMP,
			ATK: atkCalculation.finalATK,
			subATK: subATKCalculation?.subFinalATK || 0,
			subBaseATK: subATKCalculation?.subBaseATK || 0,
			totalATK: totalATKCalculation.totalATK, // 総ATK計算結果
			bringerAM: 0, // 暫定
			MATK: matkCalculation.finalMATK,
			baseMATK: matkCalculation.baseMATK,
			stabilityRate: stabilityCalculation.finalStability,
			subStabilityRate:
				subATKCalculation?.subStability || data.subWeapon.stability,
			criticalRate: criticalRateCalculation.finalCriticalRate,
			criticalDamage: criticalDamageCalculation.finalCriticalDamage,
			magicCriticalRate: 0, // 暫定
			magicCriticalDamage:
				magicalCriticalDamageCalculation.finalMagicalCriticalDamage, // 魔法クリティカルダメージ計算結果
			totalElementAdvantage:
				totalElementAdvantageCalculation.finalTotalElementAdvantage,
			elementAwakeningAdvantage: 0, // 暫定
			ASPD: aspdCalculation.finalASPD,
			CSPD: cspdCalculation.finalCSPD,
			HIT: hitCalculation.finalHIT,
			FLEE: fleeCalculation.finalFLEE,
			physicalResistance: physicalResistanceCalculation.finalPhysicalResistance,
			magicalResistance: magicalResistanceCalculation.finalMagicalResistance,
			ailmentResistance,
			motionSpeed: motionSpeedCalculation.finalMotionSpeed,
			armorBreak: armorBreakCalculation.finalArmorBreak,
			anticipate: anticipateCalculation.finalAnticipate,
		},

		adjustedStats,

		equipmentBonus1: {
			ATK: allBonuses.ATK || 0,
			physicalPenetration: allBonuses.PhysicalPenetration_Rate || 0,
			MATK: allBonuses.MATK || 0,
			magicalPenetration: allBonuses.MagicalPenetration_Rate || 0,
			weaponATK: allBonuses.WeaponATK || 0,
			elementPower: allBonuses.ElementAdvantage_Rate || 0,
			unsheatheAttack: allBonuses.UnsheatheAttack || 0,
			shortRangeDamage: allBonuses.ShortRangeDamage_Rate || 0,
			longRangeDamage: allBonuses.LongRangeDamage_Rate || 0,
			criticalDamage: allBonuses.CriticalDamage || 0,
			criticalRate: allBonuses.Critical || 0,
			STR: allBonuses.STR || 0,
			AGI: allBonuses.AGI || 0,
			INT: allBonuses.INT || 0,
			DEX: allBonuses.DEX || 0,
			VIT: allBonuses.VIT || 0,
			ASPD: allBonuses.AttackSpeed || 0,
			CSPD: allBonuses.CastingSpeed || 0,
			stability: allBonuses.Stability_Rate || 0,
			motionSpeed: allBonuses.MotionSpeed_Rate || 0,
			accuracy: allBonuses.Accuracy || 0,
			dodge: allBonuses.Dodge || 0,
			MP: allBonuses.MP || 0,
			attackMPRecovery: allBonuses.AttackMPRecovery || 0,
			HP: allBonuses.HP || 0,
			ailmentResistance: allBonuses.AilmentResistance_Rate || 0,
			physicalResistance: allBonuses.PhysicalResistance_Rate || 0,
			magicalResistance: allBonuses.MagicalResistance_Rate || 0,
			aggro: allBonuses.Aggro || 0,
			aggro_Rate: allBonuses.Aggro_Rate || 0,
		},

		equipmentBonus2: {
			ATK_STR: 0,
			MATK_STR: 0,
			ATK_INT: 0,
			MATK_INT: 0,
			ATK_VIT: 0,
			MATK_VIT: 0,
			ATK_AGI: 0,
			MATK_AGI: 0,
			ATK_DEX: 0,
			MATK_DEX: 0,
			neutralResistance: 0,
			fireResistance: 0,
			waterResistance: 0,
			windResistance: 0,
			earthResistance: 0,
			lightResistance: 0,
			darkResistance: 0,
			linearReduction: 0,
			rushReduction: 0,
			bulletReduction: 0,
			proximityReduction: 0,
			areaReduction: 0,
			floorTrapReduction: 0,
			meteorReduction: 0,
			bladeReduction: 0,
			suctionReduction: 0,
			explosionReduction: 0,
			physicalBarrier: 0,
			magicalBarrier: 0,
			fractionalBarrier: 0,
			barrierCooldown: 0,
		},

		equipmentBonus3: {
			physicalFollowup: 0,
			magicalFollowup: 0,
			naturalHPRecovery: 0,
			naturalMPRecovery: 0,
			absoluteAccuracy: 0,
			absoluteDodge: 0,
			revivalTime: 0,
			itemCooldown: 0,
		},
	}
}

/**
 * 装備品プロパティを統合する（将来実装予定）
 */
export const combineEquipmentProperties = (equipment: any) => {
	// TODO: 装備品プロパティの統合ロジック
	return {}
}

/**
 * クリスタルプロパティを統合する（将来実装予定）
 */
export const combineCrystalProperties = (crystals: any) => {
	// TODO: クリスタルプロパティの統合ロジック
	return {}
}

/**
 * 料理効果を統合する（将来実装予定）
 */
export const combineFoodEffects = (food: any) => {
	// TODO: 料理効果の統合ロジック
	return {}
}

/**
 * バフスキル効果を統合する（将来実装予定）
 */
export const combineBuffSkillEffects = (buffSkills: any) => {
	// TODO: バフスキル効果の統合ロジック
	return {}
}

/**
 * バフアイテム効果を統合する（将来実装予定）
 */
export const combineBuffItemEffects = (buffItems: any) => {
	// TODO: バフアイテム効果の統合ロジック
	return {}
}

/**
 * レジスタ他効果を統合する（将来実装予定）
 */
export const combineRegisterEffects = (register: any) => {
	// TODO: レジスタ他効果の統合ロジック
	return {}
}

/**
 * 武器ステータスを統合する（将来実装予定）
 */
export const combineWeaponStats = (mainWeapon: any, subWeapon: any) => {
	// TODO: 武器ステータスの統合ロジック
	return {}
}

/**
 * 全効果を統合する（将来実装予定）
 */
export const integrateAllEffects = (effects: any) => {
	// TODO: 全効果の統合ロジック
	return {}
}
