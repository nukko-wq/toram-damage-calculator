/**
 * 基本ステータス（HP・MP）計算ロジック
 *
 * トーラムオンラインの正確な計算式に基づく実装
 * 詳細な計算式は docs/calculations/basic-stats.md を参照
 */

import type { BaseStats } from '@/types/calculator'

// 全補正値（装備・クリスタ・料理・バフアイテムの合計）
export interface AllBonuses {
	// 基本ステータス
	STR?: number
	STR_Rate?: number
	AGI?: number
	AGI_Rate?: number
	INT?: number
	INT_Rate?: number
	DEX?: number
	DEX_Rate?: number
	VIT?: number
	VIT_Rate?: number
	CRT?: number
	CRT_Rate?: number
	MEN?: number
	MEN_Rate?: number
	TEC?: number
	TEC_Rate?: number

	// HP/MP関連
	HP?: number
	HP_Rate?: number
	MP?: number
	MP_Rate?: number

	// 装備品補正値1系プロパティ
	ATK?: number
	ATK_Rate?: number
	MATK?: number
	MATK_Rate?: number
	weaponATK?: number
	weaponATK_Rate?: number
	physicalPenetration?: number
	physicalPenetration_Rate?: number
	magicalPenetration?: number
	magicalPenetration_Rate?: number
	elementPower?: number
	elementPower_Rate?: number
	unsheatheAttack?: number
	unsheatheAttack_Rate?: number
	shortRangeDamage?: number
	shortRangeDamage_Rate?: number
	longRangeDamage?: number
	longRangeDamage_Rate?: number
	criticalRate?: number
	criticalRate_Rate?: number
	criticalDamage?: number
	criticalDamage_Rate?: number
	ASPD?: number
	ASPD_Rate?: number
	CSPD?: number
	CSPD_Rate?: number
	stability?: number
	stability_Rate?: number
	motionSpeed?: number
	motionSpeed_Rate?: number
	accuracy?: number
	accuracy_Rate?: number
	dodge?: number
	dodge_Rate?: number
	attackMPRecovery?: number
	attackMPRecovery_Rate?: number
	ailmentResistance?: number
	ailmentResistance_Rate?: number
	physicalResistance?: number
	physicalResistance_Rate?: number
	magicalResistance?: number
	magicalResistance_Rate?: number
	aggroPlus?: number
	aggroPlus_Rate?: number
	aggroMinus?: number
	aggroMinus_Rate?: number

	// 装備品補正値2系プロパティ
	ATK_STR?: number
	ATK_STR_Rate?: number
	MATK_STR?: number
	MATK_STR_Rate?: number
	ATK_INT?: number
	ATK_INT_Rate?: number
	MATK_INT?: number
	MATK_INT_Rate?: number
	ATK_VIT?: number
	ATK_VIT_Rate?: number
	MATK_VIT?: number
	MATK_VIT_Rate?: number
	ATK_AGI?: number
	ATK_AGI_Rate?: number
	MATK_AGI?: number
	MATK_AGI_Rate?: number
	ATK_DEX?: number
	ATK_DEX_Rate?: number
	MATK_DEX?: number
	MATK_DEX_Rate?: number
	neutralResistance?: number
	neutralResistance_Rate?: number
	fireResistance?: number
	fireResistance_Rate?: number
	waterResistance?: number
	waterResistance_Rate?: number
	windResistance?: number
	windResistance_Rate?: number
	earthResistance?: number
	earthResistance_Rate?: number
	lightResistance?: number
	lightResistance_Rate?: number
	darkResistance?: number
	darkResistance_Rate?: number
	linearReduction?: number
	linearReduction_Rate?: number
	rushReduction?: number
	rushReduction_Rate?: number
	bulletReduction?: number
	bulletReduction_Rate?: number
	proximityReduction?: number
	proximityReduction_Rate?: number
	areaReduction?: number
	areaReduction_Rate?: number
	floorTrapReduction?: number
	floorTrapReduction_Rate?: number
	meteorReduction?: number
	meteorReduction_Rate?: number
	bladeReduction?: number
	bladeReduction_Rate?: number
	suctionReduction?: number
	suctionReduction_Rate?: number
	explosionReduction?: number
	explosionReduction_Rate?: number
	physicalBarrier?: number
	magicalBarrier?: number
	fractionalBarrier?: number
	barrierCooldown?: number
	barrierCooldown_Rate?: number

	// 装備品補正値3系プロパティ
	physicalFollowup?: number
	physicalFollowup_Rate?: number
	magicalFollowup?: number
	magicalFollowup_Rate?: number
	naturalHPRecovery?: number
	naturalHPRecovery_Rate?: number
	naturalMPRecovery?: number
	naturalMPRecovery_Rate?: number
	absoluteAccuracy?: number
	absoluteAccuracy_Rate?: number
	absoluteDodge?: number
	absoluteDodge_Rate?: number
	revivalTime?: number
	revivalTime_Rate?: number
	itemCooldown?: number
}

// HP計算の中間結果
export interface HPCalculationSteps {
	adjustedVIT: number // 補正後VIT
	baseHP: number // HP基本値
	hpAfterPercent: number // HP%適用後
	finalHP: number // 最終HP
}

// MP計算の中間結果
export interface MPCalculationSteps {
	baseMP: number // MP基本値
	mpAfterPercent: number // MP%適用後
	finalMP: number // 最終MP
}

/**
 * HP計算（正確な計算式）
 * HP = INT(INT(93+(補正後VIT+22.41)*Lv/3)*(1+HP%/100))+HP固定値
 */
export function calculateHP(
	stats: BaseStats,
	bonuses: AllBonuses = {},
): HPCalculationSteps {
	// 1. 補正後VIT計算
	const vitPercent = bonuses.VIT_Rate || 0
	const vitFixed = bonuses.VIT || 0
	const adjustedVIT = stats.VIT * (1 + vitPercent / 100) + vitFixed

	// 2. HP基本値計算
	const baseHP = Math.floor(93 + ((adjustedVIT + 22.41) * stats.level) / 3)

	// 3. HP%補正適用
	const hpPercent = bonuses.HP_Rate || 0
	const hpAfterPercent = Math.floor(baseHP * (1 + hpPercent / 100))

	// 4. HP固定値加算
	const hpFixed = bonuses.HP || 0
	const finalHP = hpAfterPercent + hpFixed

	return {
		adjustedVIT,
		baseHP,
		hpAfterPercent,
		finalHP,
	}
}

/**
 * MP計算（正確な計算式）
 * MP = INT(INT(Lv+99+TEC+総INT/10)*(1+MP%/100))+MP固定値
 */
export function calculateMP(
	stats: BaseStats,
	bonuses: AllBonuses = {},
): MPCalculationSteps {
	// 1. MP基本値計算
	const baseMP = Math.floor(stats.level + 99 + stats.TEC + stats.INT / 10)

	// 2. MP%補正適用
	const mpPercent = bonuses.MP_Rate || 0
	const mpAfterPercent = Math.floor(baseMP * (1 + mpPercent / 100))

	// 3. MP固定値加算
	const mpFixed = bonuses.MP || 0
	const finalMP = mpAfterPercent + mpFixed

	return {
		baseMP,
		mpAfterPercent,
		finalMP,
	}
}

/**
 * 全補正値を装備・クリスタ・料理・バフから集計
 *
 * @param equipment 装備補正値
 * @param crystals クリスタ補正値
 * @param foods 料理補正値
 * @param buffs バフアイテム補正値
 */
export function aggregateAllBonuses(
	equipment: Partial<AllBonuses> = {},
	crystals: Partial<AllBonuses> = {},
	foods: Partial<AllBonuses> = {},
	buffs: Partial<AllBonuses> = {},
): AllBonuses {
	const result: AllBonuses = {}

	// 全プロパティキーを収集
	const allKeys = new Set<keyof AllBonuses>([
		...(Object.keys(equipment) as (keyof AllBonuses)[]),
		...(Object.keys(crystals) as (keyof AllBonuses)[]),
		...(Object.keys(foods) as (keyof AllBonuses)[]),
		...(Object.keys(buffs) as (keyof AllBonuses)[]),
	])

	// 各プロパティの4ソース合計を計算
	for (const key of allKeys) {
		result[key] =
			(equipment[key] || 0) +
			(crystals[key] || 0) +
			(foods[key] || 0) +
			(buffs[key] || 0)
	}

	return result
}

/**
 * 装備品補正値を装備・クリスタ・料理・バフから計算
 * StatusPreviewで使用される装備品補正値1〜3の計算
 *
 * @param equipment 装備補正値
 * @param crystals クリスタ補正値
 * @param foods 料理補正値
 * @param buffs バフアイテム補正値
 */
export function calculateEquipmentBonuses(
	equipment: Partial<AllBonuses> = {},
	crystals: Partial<AllBonuses> = {},
	foods: Partial<AllBonuses> = {},
	buffs: Partial<AllBonuses> = {},
) {
	// 全ソースを統合
	const allBonuses = aggregateAllBonuses(equipment, crystals, foods, buffs)

	// 装備品補正値1 (31項目)
	const equipmentBonus1 = {
		ATK: allBonuses.ATK || 0,
		physicalPenetration: allBonuses.physicalPenetration || 0,
		MATK: allBonuses.MATK || 0,
		magicalPenetration: allBonuses.magicalPenetration || 0,
		weaponATK: allBonuses.weaponATK || 0,
		elementPower: allBonuses.elementPower || 0,
		unsheatheAttack: allBonuses.unsheatheAttack || 0,
		shortRangeDamage: allBonuses.shortRangeDamage || 0,
		longRangeDamage: allBonuses.longRangeDamage || 0,
		criticalDamage: allBonuses.criticalDamage || 0,
		criticalRate: allBonuses.criticalRate || 0,
		STR: allBonuses.STR || 0,
		AGI: allBonuses.AGI || 0,
		INT: allBonuses.INT || 0,
		DEX: allBonuses.DEX || 0,
		VIT: allBonuses.VIT || 0,
		ASPD: allBonuses.ASPD || 0,
		CSPD: allBonuses.CSPD || 0,
		stability: allBonuses.stability || 0,
		motionSpeed: allBonuses.motionSpeed || 0,
		accuracy: allBonuses.accuracy || 0,
		dodge: allBonuses.dodge || 0,
		MP: allBonuses.MP || 0,
		attackMPRecovery: allBonuses.attackMPRecovery || 0,
		HP: allBonuses.HP || 0,
		ailmentResistance: allBonuses.ailmentResistance || 0,
		physicalResistance: allBonuses.physicalResistance || 0,
		magicalResistance: allBonuses.magicalResistance || 0,
		aggroPlus: allBonuses.aggroPlus || 0,
		aggroMinus: allBonuses.aggroMinus || 0,
	}

	// 装備品補正値2 (31項目)
	const equipmentBonus2 = {
		ATK_STR: allBonuses.ATK_STR || 0,
		MATK_STR: allBonuses.MATK_STR || 0,
		ATK_INT: allBonuses.ATK_INT || 0,
		MATK_INT: allBonuses.MATK_INT || 0,
		ATK_VIT: allBonuses.ATK_VIT || 0,
		MATK_VIT: allBonuses.MATK_VIT || 0,
		ATK_AGI: allBonuses.ATK_AGI || 0,
		MATK_AGI: allBonuses.MATK_AGI || 0,
		ATK_DEX: allBonuses.ATK_DEX || 0,
		MATK_DEX: allBonuses.MATK_DEX || 0,
		neutralResistance: allBonuses.neutralResistance || 0,
		fireResistance: allBonuses.fireResistance || 0,
		waterResistance: allBonuses.waterResistance || 0,
		windResistance: allBonuses.windResistance || 0,
		earthResistance: allBonuses.earthResistance || 0,
		lightResistance: allBonuses.lightResistance || 0,
		darkResistance: allBonuses.darkResistance || 0,
		linearReduction: allBonuses.linearReduction || 0,
		rushReduction: allBonuses.rushReduction || 0,
		bulletReduction: allBonuses.bulletReduction || 0,
		proximityReduction: allBonuses.proximityReduction || 0,
		areaReduction: allBonuses.areaReduction || 0,
		floorTrapReduction: allBonuses.floorTrapReduction || 0,
		meteorReduction: allBonuses.meteorReduction || 0,
		bladeReduction: allBonuses.bladeReduction || 0,
		suctionReduction: allBonuses.suctionReduction || 0,
		explosionReduction: allBonuses.explosionReduction || 0,
		physicalBarrier: allBonuses.physicalBarrier || 0,
		magicalBarrier: allBonuses.magicalBarrier || 0,
		fractionalBarrier: allBonuses.fractionalBarrier || 0,
		barrierCooldown: allBonuses.barrierCooldown || 0,
	}

	// 装備品補正値3 (8項目)
	const equipmentBonus3 = {
		physicalFollowup: allBonuses.physicalFollowup || 0,
		magicalFollowup: allBonuses.magicalFollowup || 0,
		naturalHPRecovery: allBonuses.naturalHPRecovery || 0,
		naturalMPRecovery: allBonuses.naturalMPRecovery || 0,
		absoluteAccuracy: allBonuses.absoluteAccuracy || 0,
		absoluteDodge: allBonuses.absoluteDodge || 0,
		revivalTime: allBonuses.revivalTime || 0,
		itemCooldown: allBonuses.itemCooldown || 0,
	}

	return {
		equipmentBonus1,
		equipmentBonus2,
		equipmentBonus3,
	}
}
