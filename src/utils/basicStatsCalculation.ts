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
	adjustedINT: number // 補正後INT
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
 * MP = INT(INT(Lv+99+TEC+補正後INT/10)*(1+MP%/100))+MP固定値
 */
export function calculateMP(
	stats: BaseStats,
	bonuses: AllBonuses = {},
): MPCalculationSteps {
	// 1. 補正後INT計算
	const intPercent = bonuses.INT_Rate || 0
	const intFixed = bonuses.INT || 0
	const adjustedINT = Math.floor(stats.INT * (1 + intPercent / 100)) + intFixed

	// 2. MP基本値計算
	const baseMP = Math.floor(stats.level + 99 + stats.TEC + adjustedINT / 10)

	// 3. MP%補正適用
	const mpPercent = bonuses.MP_Rate || 0
	const mpAfterPercent = Math.floor(baseMP * (1 + mpPercent / 100))

	// 4. MP固定値加算
	const mpFixed = bonuses.MP || 0
	const finalMP = mpAfterPercent + mpFixed

	return {
		adjustedINT,
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

// 補正後ステータス計算の中間結果
export interface AdjustedStatsCalculation {
	STR: number
	AGI: number
	INT: number
	DEX: number
	VIT: number
	CRT: number // 基本ステータスの値をそのまま
	MEN: number // 基本ステータスの値をそのまま
	TEC: number // 基本ステータスの値をそのまま
}

/**
 * 補正後ステータス計算
 * STR/INT/VIT/AGI/DEX: INT(基礎ステータス × (1 + ステータス%/100)) + ステータス固定値
 * CRT/MEN/TEC: 基本ステータスの値をそのまま表示
 */
export function calculateAdjustedStats(
	stats: BaseStats,
	bonuses: AllBonuses = {},
): AdjustedStatsCalculation {
	// STR補正後計算
	const strPercent = bonuses.STR_Rate || 0
	const strFixed = bonuses.STR || 0
	const adjustedSTR = Math.floor(stats.STR * (1 + strPercent / 100)) + strFixed

	// AGI補正後計算
	const agiPercent = bonuses.AGI_Rate || 0
	const agiFixed = bonuses.AGI || 0
	const adjustedAGI = Math.floor(stats.AGI * (1 + agiPercent / 100)) + agiFixed

	// INT補正後計算
	const intPercent = bonuses.INT_Rate || 0
	const intFixed = bonuses.INT || 0
	const adjustedINT = Math.floor(stats.INT * (1 + intPercent / 100)) + intFixed

	// DEX補正後計算
	const dexPercent = bonuses.DEX_Rate || 0
	const dexFixed = bonuses.DEX || 0
	const adjustedDEX = Math.floor(stats.DEX * (1 + dexPercent / 100)) + dexFixed

	// VIT補正後計算
	const vitPercent = bonuses.VIT_Rate || 0
	const vitFixed = bonuses.VIT || 0
	const adjustedVIT = Math.floor(stats.VIT * (1 + vitPercent / 100)) + vitFixed

	return {
		STR: adjustedSTR,
		AGI: adjustedAGI,
		INT: adjustedINT,
		DEX: adjustedDEX,
		VIT: adjustedVIT,
		CRT: stats.CRT, // 基本ステータスの値をそのまま
		MEN: stats.MEN, // 基本ステータスの値をそのまま
		TEC: stats.TEC, // 基本ステータスの値をそのまま
	}
}

// ATK計算の中間結果
export interface ATKCalculationSteps {
	// 総武器ATK関連
	baseWeaponATK: number // 武器の基本ATK
	refinementLevel: number // 精錬値
	refinedWeaponATK: number // 精錬補正後武器ATK
	weaponATKPercentBonus: number // 武器ATK%補正
	weaponATKFixedBonus: number // 武器ATK固定値
	totalWeaponATK: number // 総武器ATK

	// ステータスATK関連
	baseSTR: number // 基礎STR
	baseAGI: number // 基礎AGI（旋風槍の場合）
	statusATK: number // ステータスATK

	// ATKアップ・ダウン関連
	atkUpSTR: number // ATKアップ(STR%)
	atkUpAGI: number // ATKアップ(AGI%)
	atkUpINT: number // ATKアップ(INT%)
	atkUpVIT: number // ATKアップ(VIT%)
	atkUpDEX: number // ATKアップ(DEX%)
	atkUpTotal: number // ATKアップ合計
	atkDownTotal: number // ATKダウン合計

	// 最終計算
	atkBeforePercent: number // ATK%適用前
	atkPercent: number // ATK%
	atkAfterPercent: number // ATK%適用後
	atkFixed: number // ATK固定値
	finalATK: number // 最終ATK
}

// 武器種別定義
export interface WeaponType {
	id: string
	name: string
	statusATKFormula: (baseStats: BaseStats) => number
}

// 武器種別定義
const WEAPON_TYPES: Record<string, WeaponType> = {
	halberd: {
		id: 'halberd',
		name: '旋風槍',
		statusATKFormula: (stats) => stats.STR * 2.5 + stats.AGI * 1.5,
	},
	sword: {
		id: 'sword',
		name: '剣',
		statusATKFormula: (stats) => stats.STR * 3.0 + stats.DEX * 1.0,
	},
	spear: {
		id: 'spear',
		name: '槍',
		statusATKFormula: (stats) => stats.STR * 2.5 + stats.AGI * 1.5,
	},
	// 他の武器種も将来実装予定
}

/**
 * ATK計算（旋風槍対応）
 * ATK = INT((自Lv + 総武器ATK + ステータスATK + ATKアップ - ATKダウン) × (1 + ATK%/100)) + ATK固定値
 */
export function calculateATK(
	stats: BaseStats,
	weapon: { ATK: number; stability: number; refinement: number; type: string },
	bonuses: AllBonuses = {},
): ATKCalculationSteps {
	// 1. 総武器ATK計算
	const refinedWeaponATK = Math.floor(
		weapon.ATK * (1 + weapon.refinement ** 2 / 100) + weapon.refinement,
	)

	const weaponATKPercent = bonuses.weaponATK_Rate || 0
	const weaponATKPercentBonus = Math.floor(
		(weapon.ATK * weaponATKPercent) / 100,
	)

	const weaponATKFixedBonus = bonuses.weaponATK || 0
	const totalWeaponATK =
		refinedWeaponATK + weaponATKPercentBonus + weaponATKFixedBonus

	// 2. ステータスATK計算（武器種別対応）
	const weaponType = WEAPON_TYPES[weapon.type] || WEAPON_TYPES.halberd
	const statusATK = weaponType.statusATKFormula(stats)

	// 3. ATKアップ・ダウン計算
	const atkUpSTR = Math.floor((stats.STR * (bonuses.ATK_STR_Rate || 0)) / 100)
	const atkUpAGI = Math.floor((stats.AGI * (bonuses.ATK_AGI_Rate || 0)) / 100)
	const atkUpINT = Math.floor((stats.INT * (bonuses.ATK_INT_Rate || 0)) / 100)
	const atkUpVIT = Math.floor((stats.VIT * (bonuses.ATK_VIT_Rate || 0)) / 100)
	const atkUpDEX = Math.floor((stats.DEX * (bonuses.ATK_DEX_Rate || 0)) / 100)
	const atkUpTotal = atkUpSTR + atkUpAGI + atkUpINT + atkUpVIT + atkUpDEX

	// ATKダウンは現在なしと仮定
	const atkDownTotal = 0

	// 4. 最終ATK計算
	const atkBeforePercent =
		stats.level + totalWeaponATK + statusATK + atkUpTotal - atkDownTotal
	const atkPercent = bonuses.ATK_Rate || 0
	const atkAfterPercent = Math.floor(
		atkBeforePercent * (1 + atkPercent / 100),
	)
	const atkFixed = bonuses.ATK || 0
	const finalATK = atkAfterPercent + atkFixed

	return {
		baseWeaponATK: weapon.ATK,
		refinementLevel: weapon.refinement,
		refinedWeaponATK,
		weaponATKPercentBonus,
		weaponATKFixedBonus,
		totalWeaponATK,
		baseSTR: stats.STR,
		baseAGI: stats.AGI,
		statusATK,
		atkUpSTR,
		atkUpAGI,
		atkUpINT,
		atkUpVIT,
		atkUpDEX,
		atkUpTotal,
		atkDownTotal,
		atkBeforePercent,
		atkPercent,
		atkAfterPercent,
		atkFixed,
		finalATK,
	}
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

	// 装備品補正値1 (31項目) - %と固定値の両方を含む
	const equipmentBonus1 = {
		ATK: allBonuses.ATK || 0,
		ATK_Rate: allBonuses.ATK_Rate || 0,
		physicalPenetration: allBonuses.physicalPenetration || 0,
		physicalPenetration_Rate: allBonuses.physicalPenetration_Rate || 0,
		MATK: allBonuses.MATK || 0,
		MATK_Rate: allBonuses.MATK_Rate || 0,
		magicalPenetration: allBonuses.magicalPenetration || 0,
		magicalPenetration_Rate: allBonuses.magicalPenetration_Rate || 0,
		weaponATK: allBonuses.weaponATK || 0,
		weaponATK_Rate: allBonuses.weaponATK_Rate || 0,
		elementPower: allBonuses.elementPower || 0,
		elementPower_Rate: allBonuses.elementPower_Rate || 0,
		unsheatheAttack: allBonuses.unsheatheAttack || 0,
		unsheatheAttack_Rate: allBonuses.unsheatheAttack_Rate || 0,
		shortRangeDamage: allBonuses.shortRangeDamage || 0,
		shortRangeDamage_Rate: allBonuses.shortRangeDamage_Rate || 0,
		longRangeDamage: allBonuses.longRangeDamage || 0,
		longRangeDamage_Rate: allBonuses.longRangeDamage_Rate || 0,
		criticalDamage: allBonuses.criticalDamage || 0,
		criticalDamage_Rate: allBonuses.criticalDamage_Rate || 0,
		criticalRate: allBonuses.criticalRate || 0,
		criticalRate_Rate: allBonuses.criticalRate_Rate || 0,
		STR: allBonuses.STR || 0,
		STR_Rate: allBonuses.STR_Rate || 0,
		AGI: allBonuses.AGI || 0,
		AGI_Rate: allBonuses.AGI_Rate || 0,
		INT: allBonuses.INT || 0,
		INT_Rate: allBonuses.INT_Rate || 0,
		DEX: allBonuses.DEX || 0,
		DEX_Rate: allBonuses.DEX_Rate || 0,
		VIT: allBonuses.VIT || 0,
		VIT_Rate: allBonuses.VIT_Rate || 0,
		ASPD: allBonuses.ASPD || 0,
		ASPD_Rate: allBonuses.ASPD_Rate || 0,
		CSPD: allBonuses.CSPD || 0,
		CSPD_Rate: allBonuses.CSPD_Rate || 0,
		stability: allBonuses.stability || 0,
		stability_Rate: allBonuses.stability_Rate || 0,
		motionSpeed: allBonuses.motionSpeed || 0,
		motionSpeed_Rate: allBonuses.motionSpeed_Rate || 0,
		accuracy: allBonuses.accuracy || 0,
		accuracy_Rate: allBonuses.accuracy_Rate || 0,
		dodge: allBonuses.dodge || 0,
		dodge_Rate: allBonuses.dodge_Rate || 0,
		MP: allBonuses.MP || 0,
		MP_Rate: allBonuses.MP_Rate || 0,
		attackMPRecovery: allBonuses.attackMPRecovery || 0,
		attackMPRecovery_Rate: allBonuses.attackMPRecovery_Rate || 0,
		HP: allBonuses.HP || 0,
		HP_Rate: allBonuses.HP_Rate || 0,
		ailmentResistance: allBonuses.ailmentResistance || 0,
		ailmentResistance_Rate: allBonuses.ailmentResistance_Rate || 0,
		physicalResistance: allBonuses.physicalResistance || 0,
		physicalResistance_Rate: allBonuses.physicalResistance_Rate || 0,
		magicalResistance: allBonuses.magicalResistance || 0,
		magicalResistance_Rate: allBonuses.magicalResistance_Rate || 0,
		aggroPlus: allBonuses.aggroPlus || 0,
		aggroPlus_Rate: allBonuses.aggroPlus_Rate || 0,
		aggroMinus: allBonuses.aggroMinus || 0,
		aggroMinus_Rate: allBonuses.aggroMinus_Rate || 0,
	}

	// 装備品補正値2 (31項目) - %と固定値の両方を含む
	const equipmentBonus2 = {
		ATK_STR: allBonuses.ATK_STR || 0,
		ATK_STR_Rate: allBonuses.ATK_STR_Rate || 0,
		MATK_STR: allBonuses.MATK_STR || 0,
		MATK_STR_Rate: allBonuses.MATK_STR_Rate || 0,
		ATK_INT: allBonuses.ATK_INT || 0,
		ATK_INT_Rate: allBonuses.ATK_INT_Rate || 0,
		MATK_INT: allBonuses.MATK_INT || 0,
		MATK_INT_Rate: allBonuses.MATK_INT_Rate || 0,
		ATK_VIT: allBonuses.ATK_VIT || 0,
		ATK_VIT_Rate: allBonuses.ATK_VIT_Rate || 0,
		MATK_VIT: allBonuses.MATK_VIT || 0,
		MATK_VIT_Rate: allBonuses.MATK_VIT_Rate || 0,
		ATK_AGI: allBonuses.ATK_AGI || 0,
		ATK_AGI_Rate: allBonuses.ATK_AGI_Rate || 0,
		MATK_AGI: allBonuses.MATK_AGI || 0,
		MATK_AGI_Rate: allBonuses.MATK_AGI_Rate || 0,
		ATK_DEX: allBonuses.ATK_DEX || 0,
		ATK_DEX_Rate: allBonuses.ATK_DEX_Rate || 0,
		MATK_DEX: allBonuses.MATK_DEX || 0,
		MATK_DEX_Rate: allBonuses.MATK_DEX_Rate || 0,
		neutralResistance: allBonuses.neutralResistance || 0,
		neutralResistance_Rate: allBonuses.neutralResistance_Rate || 0,
		fireResistance: allBonuses.fireResistance || 0,
		fireResistance_Rate: allBonuses.fireResistance_Rate || 0,
		waterResistance: allBonuses.waterResistance || 0,
		waterResistance_Rate: allBonuses.waterResistance_Rate || 0,
		windResistance: allBonuses.windResistance || 0,
		windResistance_Rate: allBonuses.windResistance_Rate || 0,
		earthResistance: allBonuses.earthResistance || 0,
		earthResistance_Rate: allBonuses.earthResistance_Rate || 0,
		lightResistance: allBonuses.lightResistance || 0,
		lightResistance_Rate: allBonuses.lightResistance_Rate || 0,
		darkResistance: allBonuses.darkResistance || 0,
		darkResistance_Rate: allBonuses.darkResistance_Rate || 0,
		linearReduction: allBonuses.linearReduction || 0,
		linearReduction_Rate: allBonuses.linearReduction_Rate || 0,
		rushReduction: allBonuses.rushReduction || 0,
		rushReduction_Rate: allBonuses.rushReduction_Rate || 0,
		bulletReduction: allBonuses.bulletReduction || 0,
		bulletReduction_Rate: allBonuses.bulletReduction_Rate || 0,
		proximityReduction: allBonuses.proximityReduction || 0,
		proximityReduction_Rate: allBonuses.proximityReduction_Rate || 0,
		areaReduction: allBonuses.areaReduction || 0,
		areaReduction_Rate: allBonuses.areaReduction_Rate || 0,
		floorTrapReduction: allBonuses.floorTrapReduction || 0,
		floorTrapReduction_Rate: allBonuses.floorTrapReduction_Rate || 0,
		meteorReduction: allBonuses.meteorReduction || 0,
		meteorReduction_Rate: allBonuses.meteorReduction_Rate || 0,
		bladeReduction: allBonuses.bladeReduction || 0,
		bladeReduction_Rate: allBonuses.bladeReduction_Rate || 0,
		suctionReduction: allBonuses.suctionReduction || 0,
		suctionReduction_Rate: allBonuses.suctionReduction_Rate || 0,
		explosionReduction: allBonuses.explosionReduction || 0,
		explosionReduction_Rate: allBonuses.explosionReduction_Rate || 0,
		physicalBarrier: allBonuses.physicalBarrier || 0,
		magicalBarrier: allBonuses.magicalBarrier || 0,
		fractionalBarrier: allBonuses.fractionalBarrier || 0,
		barrierCooldown: allBonuses.barrierCooldown || 0,
		barrierCooldown_Rate: allBonuses.barrierCooldown_Rate || 0,
	}

	// 装備品補正値3 (8項目) - %と固定値の両方を含む
	const equipmentBonus3 = {
		physicalFollowup: allBonuses.physicalFollowup || 0,
		physicalFollowup_Rate: allBonuses.physicalFollowup_Rate || 0,
		magicalFollowup: allBonuses.magicalFollowup || 0,
		magicalFollowup_Rate: allBonuses.magicalFollowup_Rate || 0,
		naturalHPRecovery: allBonuses.naturalHPRecovery || 0,
		naturalHPRecovery_Rate: allBonuses.naturalHPRecovery_Rate || 0,
		naturalMPRecovery: allBonuses.naturalMPRecovery || 0,
		naturalMPRecovery_Rate: allBonuses.naturalMPRecovery_Rate || 0,
		absoluteAccuracy: allBonuses.absoluteAccuracy || 0,
		absoluteAccuracy_Rate: allBonuses.absoluteAccuracy_Rate || 0,
		absoluteDodge: allBonuses.absoluteDodge || 0,
		absoluteDodge_Rate: allBonuses.absoluteDodge_Rate || 0,
		revivalTime: allBonuses.revivalTime || 0,
		revivalTime_Rate: allBonuses.revivalTime_Rate || 0,
		itemCooldown: allBonuses.itemCooldown || 0,
	}

	return {
		equipmentBonus1,
		equipmentBonus2,
		equipmentBonus3,
	}
}
