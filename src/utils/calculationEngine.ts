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
	aggregateAllBonuses,
	getBodyArmorType,
	type AllBonuses,
} from './basicStatsCalculation'

/**
 * 計算結果を生成する（実際の計算式使用）
 *
 * @param data - 全入力フォームデータ
 * @returns 計算結果
 */
export const calculateResults = (data: CalculatorData): CalculationResults => {
	// 現在は簡単な実装。将来的に装備・クリスタ・料理・バフからの補正値を統合
	const dummyBonuses: AllBonuses = {}

	// 1. 補正後ステータス計算
	const adjustedStats = calculateAdjustedStats(data.baseStats, dummyBonuses)

	// 2. HP計算
	const hpCalculation = calculateHP(data.baseStats, dummyBonuses)

	// 3. MP計算
	const mpCalculation = calculateMP(data.baseStats, dummyBonuses)

	// 4. ATK計算
	const atkCalculation = calculateATK(
		data.baseStats,
		data.mainWeapon,
		data.subWeapon,
		adjustedStats,
		dummyBonuses,
	)

	// 4-1. 総ATK計算
	const totalATKCalculation = calculateTotalATK(
		data.mainWeapon.weaponType,
		atkCalculation.finalATK,
		0, // TODO: サブATK計算結果を取得
	)

	// 5. ASPD計算（体装備のArmorTypeを取得）
	const bodyArmorType = getBodyArmorType(data.equipment.body)
	const aspdCalculation = calculateASPD(
		data.baseStats,
		data.mainWeapon,
		adjustedStats,
		dummyBonuses,
		bodyArmorType,
	)

	// 6. 行動速度計算
	const motionSpeedCalculation = calculateMotionSpeed(
		aspdCalculation.finalASPD,
		dummyBonuses,
	)

	// 7. 異常耐性計算
	const ailmentResistance = calculateAilmentResistance(
		data.baseStats,
		dummyBonuses,
	)

	// 8. クリティカル率計算
	const criticalRateCalculation = calculateCriticalRate(
		data.baseStats.CRT,
		dummyBonuses,
	)

	// 8-2. クリティカルダメージ計算
	const criticalDamageCalculation = calculateCriticalDamage(
		adjustedStats.STR,
		adjustedStats.AGI,
		dummyBonuses,
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
		dummyBonuses,
	)

	// 9. HIT計算
	const hitCalculation = calculateHIT(
		data.baseStats.level,
		adjustedStats.DEX,
		dummyBonuses,
	)

	// 10. FLEE計算
	const fleeCalculation = calculateFLEE(
		data.baseStats.level,
		adjustedStats.AGI,
		data.equipment.body,
		dummyBonuses,
	)

	// 11. 物理耐性計算
	const physicalResistanceCalculation =
		calculatePhysicalResistance(dummyBonuses)

	// 12. 魔法耐性計算
	const magicalResistanceCalculation = calculateMagicalResistance(dummyBonuses)

	// 13. 防御崩し計算
	const armorBreakCalculation = calculateArmorBreak(dummyBonuses)

	// 14. 先読み計算
	const anticipateCalculation = calculateAnticipate(dummyBonuses)

	// 15. CSPD計算
	const cspdCalculation = calculateCSPD(
		data.baseStats.level,
		adjustedStats.DEX,
		adjustedStats.AGI,
		dummyBonuses,
	)

	// 16. 総属性有利計算
	const totalElementAdvantageCalculation =
		calculateTotalElementAdvantage(dummyBonuses)

	// 17. 安定率計算
	const stabilityCalculation = calculateStability(
		data.mainWeapon.stability,
		data.mainWeapon.weaponType,
		adjustedStats,
		dummyBonuses,
	)

	return {
		basicStats: {
			HP: hpCalculation.finalHP,
			MP: mpCalculation.finalMP,
			ATK: atkCalculation.finalATK,
			subBaseATK: data.subWeapon.ATK, // 暫定：サブ武器ATKをそのまま表示
			totalATK: totalATKCalculation.totalATK, // 総ATK計算結果
			bringerAM: 0, // 暫定
			MATK: matkCalculation.finalMATK,
			baseMATK: matkCalculation.baseMATK,
			stabilityRate: stabilityCalculation.finalStability,
			subStabilityRate: data.subWeapon.stability,
			criticalRate: criticalRateCalculation.finalCriticalRate,
			criticalDamage: criticalDamageCalculation.finalCriticalDamage,
			magicCriticalRate: 0, // 暫定
			magicCriticalDamage: magicalCriticalDamageCalculation.finalMagicalCriticalDamage, // 魔法クリティカルダメージ計算結果
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
			ATK: 0,
			physicalPenetration: 0,
			MATK: 0,
			magicalPenetration: 0,
			weaponATK: 0,
			elementPower: 0,
			unsheatheAttack: 0,
			shortRangeDamage: 0,
			longRangeDamage: 0,
			criticalDamage: 0,
			criticalRate: 0,
			STR: 0,
			AGI: 0,
			INT: 0,
			DEX: 0,
			VIT: 0,
			ASPD: 0,
			CSPD: 0,
			stability: 0,
			motionSpeed: 0,
			accuracy: 0,
			dodge: 0,
			MP: 0,
			attackMPRecovery: 0,
			HP: 0,
			ailmentResistance: 0,
			physicalResistance: 0,
			magicalResistance: 0,
			aggro: 0,
			aggro_Rate: 0,
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
