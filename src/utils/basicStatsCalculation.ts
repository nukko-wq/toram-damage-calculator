/**
 * 基本ステータス（HP・MP）計算ロジック
 *
 * トーラムオンラインの正確な計算式に基づく実装
 * 詳細な計算式は docs/calculations/basic-stats.md を参照
 */

import type {
	BaseStats,
	WeaponType as WeaponTypeEnum,
	ArmorType,
} from '@/types/calculator'
import { getWeaponTypeKey } from '@/utils/weaponTypeMapping'

// 全補正値（装備・クリスタ・料理・バフアイテムの合計）
// EquipmentPropertiesと同じ命名規則を使用
export interface AllBonuses {
	// 基本攻撃力系
	ATK_Rate?: number // ATK%
	ATK?: number // ATK
	MATK_Rate?: number // MATK%
	MATK?: number // MATK
	WeaponATK_Rate?: number // 武器ATK%
	WeaponATK?: number // 武器ATK

	// 防御力系
	DEF_Rate?: number // DEF%
	DEF?: number // DEF
	MDEF_Rate?: number // MDEF%
	MDEF?: number // MDEF

	// 貫通系
	PhysicalPenetration_Rate?: number // 物理貫通%
	MagicalPenetration_Rate?: number // 魔法貫通%
	ElementAdvantage_Rate?: number // 属性有利%

	// 威力系
	UnsheatheAttack_Rate?: number // 抜刀威力%
	UnsheatheAttack?: number // 抜刀威力
	ShortRangeDamage_Rate?: number // 近距離威力%
	LongRangeDamage_Rate?: number // 遠距離威力%

	// クリティカル系
	CriticalDamage_Rate?: number // クリティカルダメージ%
	CriticalDamage?: number // クリティカルダメージ
	Critical_Rate?: number // クリティカル率%
	Critical?: number // クリティカル率

	// 安定率
	Stability_Rate?: number // 安定率%

	// HP/MP系
	HP_Rate?: number // HP%
	HP?: number // HP
	MP_Rate?: number // MP%
	MP?: number // MP

	// ステータス系
	STR_Rate?: number // STR%
	STR?: number // STR
	INT_Rate?: number // INT%
	INT?: number // INT
	VIT_Rate?: number // VIT%
	VIT?: number // VIT
	AGI_Rate?: number // AGI%
	AGI?: number // AGI
	DEX_Rate?: number // DEX%
	DEX?: number // DEX
	CRT_Rate?: number // CRT%
	CRT?: number // CRT
	MEN_Rate?: number // MEN%
	MEN?: number // MEN
	TEC_Rate?: number // TEC%
	TEC?: number // TEC

	// 命中・回避系
	Accuracy_Rate?: number // 命中%
	Accuracy?: number // 命中
	Dodge_Rate?: number // 回避%
	Dodge?: number // 回避

	// 速度系
	AttackSpeed_Rate?: number // 攻撃速度%
	AttackSpeed?: number // 攻撃速度
	CastingSpeed_Rate?: number // 詠唱速度%
	CastingSpeed?: number // 詠唱速度
	MotionSpeed_Rate?: number // 行動速度%

	// MP回復系
	AttackMPRecovery_Rate?: number // 攻撃MP回復%
	AttackMPRecovery?: number // 攻撃MP回復

	// 耐性系
	PhysicalResistance_Rate?: number // 物理耐性%
	MagicalResistance_Rate?: number // 魔法耐性%
	AilmentResistance_Rate?: number // 異常耐性%

	// その他戦闘系
	Aggro_Rate?: number // ヘイト%
	Aggro?: number // ヘイト固定値（正負両方対応）
	RevivalTime_Rate?: number // 復帰短縮%

	// 自然回復系
	NaturalHPRecovery_Rate?: number // HP自然回復%
	NaturalHPRecovery?: number // HP自然回復
	NaturalMPRecovery_Rate?: number // MP自然回復%
	NaturalMPRecovery?: number // MP自然回復

	// 特殊系
	ArmorBreak_Rate?: number // 防御崩し%
	Anticipate_Rate?: number // 先読み%
	GuardPower_Rate?: number // Guard力%
	GuardRecharge_Rate?: number // Guard回復%
	AvoidRecharge_Rate?: number // Avoid回復%
	ItemCooldown?: number // 道具速度
	AbsoluteAccuracy_Rate?: number // 絶対命中%
	AbsoluteDodge_Rate?: number // 絶対回避%

	// ステータス連動攻撃力
	ATK_STR_Rate?: number // ATK+(STR)%
	ATK_INT_Rate?: number // ATK+(INT)%
	ATK_VIT_Rate?: number // ATK+(VIT)%
	ATK_AGI_Rate?: number // ATK+(AGI)%
	ATK_DEX_Rate?: number // ATK+(DEX)%
	MATK_STR_Rate?: number // MATK+(STR)%
	MATK_INT_Rate?: number // MATK+(INT)%
	MATK_VIT_Rate?: number // MATK+(VIT)%
	MATK_AGI_Rate?: number // MATK+(AGI)%
	MATK_DEX_Rate?: number // MATK+(DEX)%

	// 属性耐性
	FireResistance_Rate?: number // 火耐性%
	WaterResistance_Rate?: number // 水耐性%
	WindResistance_Rate?: number // 風耐性%
	EarthResistance_Rate?: number // 地耐性%
	LightResistance_Rate?: number // 光耐性%
	DarkResistance_Rate?: number // 闇耐性%
	NeutralResistance_Rate?: number // 無耐性%

	// ダメージ軽減系
	LinearReduction_Rate?: number // 直線軽減%
	RushReduction_Rate?: number // 突進軽減%
	BulletReduction_Rate?: number // 弾丸軽減%
	ProximityReduction_Rate?: number // 周囲軽減%
	AreaReduction_Rate?: number // 範囲軽減%
	FloorTrapReduction_Rate?: number // 痛床軽減%
	MeteorReduction_Rate?: number // 隕石軽減%
	BladeReduction_Rate?: number // 射刃軽減%
	SuctionReduction_Rate?: number // 吸引軽減%
	ExplosionReduction_Rate?: number // 爆発軽減%

	// バリア系
	PhysicalBarrier?: number // 物理バリア
	MagicalBarrier?: number // 魔法バリア
	FractionalBarrier?: number // 割合バリア
	BarrierCooldown_Rate?: number // バリア速度%

	// 追撃系
	PhysicalFollowup_Rate?: number // 物理追撃%
	MagicalFollowup_Rate?: number // 魔法追撃%
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

// 安定率計算の中間結果
export interface StabilityCalculationSteps {
	weaponStability: number // メイン武器の安定率
	statusStability: number // ステータス安定率
	stabilityPercent: number // 安定率%補正
	arrowStability: number // 矢の安定率（弓+矢時のみ）
	stabilityBeforeLimit: number // 制限適用前の安定率
	finalStability: number // 最終安定率（0-100制限適用後）
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
	baseWeaponATK: number // 武器の基本ATK（弓＋矢の場合は加算後）
	arrowATK?: number // 矢のATK（弓装備時のみ）
	isBowArrowCombo: boolean // 弓＋矢の組み合わせかどうか
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
	baseATK: number // 基礎ATK（Lv+総武器ATK+ステータスATK+ATKアップ-ATKダウン、小数点処理なし）
	atkBeforePercent: number // ATK%適用前
	atkPercent: number // ATK%
	atkAfterPercent: number // ATK%適用後
	atkFixed: number // ATK固定値
	finalATK: number // 最終ATK
}

// サブATK計算の中間結果（双剣専用）
export interface SubATKCalculationSteps {
	// サブ総武器ATK関連
	subBaseWeaponATK: number // サブ武器の基本ATK
	subRefinementLevel: number // サブ精錬値
	subRefinedWeaponATK: number // サブ精錬補正後武器ATK
	subWeaponATKPercentBonus: number // サブ武器ATK%補正
	subWeaponATKFixedBonus: number // サブ武器ATK固定値
	subTotalWeaponATK: number // サブ総武器ATK

	// サブステータスATK関連
	subStatusATK: number // サブステータスATK（STR×1 + AGI×3）

	// サブ基礎ATK計算
	subBaseATK: number // サブ基礎ATK

	// サブATK最終計算（安定率適用）
	subWeaponStability: number // サブ武器の安定率
	subWeaponStatusStability: number // ステータス安定率（補正後STR×0.06+補正後AGI×0.04）
	stabilityPercent: number // 安定率%補正
	subStability: number // サブ安定率（計算後）
	subATKAfterPercent: number // サブATK%適用後
	subATKAfterFixed: number // サブATK固定値適用後
	subFinalATK: number // サブ最終ATK
}

export interface ASPDCalculationSteps {
	level: number // キャラクターレベル
	statusASPD: number // ステータスASPD（武器種別計算）
	weaponTypeCorrection: number // 武器種補正値
	aspdBeforePercent: number // ASPD%適用前
	aspdPercent: number // ASPD%補正値（装備等）
	armorTypeBonus: number // ArmorType補正値（内部計算のみ）
	effectiveASPDPercent: number // 実効ASPD%（ASPD% + ArmorType補正）
	aspdAfterPercent: number // ASPD%適用後
	aspdFixed: number // ASPD固定値
	finalASPD: number // 最終ASPD
}

// 行動速度計算の中間結果
export interface MotionSpeedCalculationSteps {
	aspd: number // 計算されたASPD値
	aspdBase: number // ASPDベース行動速度 = INT((ASPD-1000)/180)
	aspdBaseClamped: number // 下限制限後 = MAX(0, ASPDベース行動速度)
	motionSpeedPercent: number // 行動速度%補正
	motionSpeedAfterPercent: number // 行動速度%適用後
	finalMotionSpeed: number // 最終行動速度（上限50%制限適用）
}

// クリティカル率計算の詳細ステップ
export interface CriticalRateCalculationSteps {
	crt: number // ステータスのCRT
	crtBaseCriticalRate: number // CRT基礎クリティカル率 = INT(25 + CRT/3.4)
	criticalRatePercent: number // クリティカル率%補正
	criticalRateAfterPercent: number // クリティカル率%適用後 = INT(基礎 × (1 + %/100))
	criticalRateFixed: number // クリティカル率固定値補正
	finalCriticalRate: number // 最終クリティカル率
}

// クリティカルダメージ計算の詳細ステップ
export interface CriticalDamageCalculationSteps {
	adjustedSTR: number // 補正後STR
	adjustedAGI: number // 補正後AGI
	strDivision: number // STR/5
	strAgiDivision: number // (STR+AGI)/10
	maxValue: number // MAX(STR/5, (STR+AGI)/10)
	baseCriticalDamage: number // 基礎クリティカルダメージ = 150 + maxValue
	cdPercent: number // クリティカルダメージ%補正
	cdAfterPercent: number // CD%適用後 = INT(基礎CD × (1 + CD%/100))
	cdFixed: number // クリティカルダメージ固定値補正
	cdBeforeLimit: number // 制限前CD = CD%適用後 + CD固定値
	isOver300: boolean // 300超過フラグ
	excessAmount?: number // 超過分（300超過時のみ）
	halvedExcess?: number // 半減後超過分（300超過時のみ）
	finalCriticalDamage: number // 最終クリティカルダメージ
}

// 魔法クリティカルダメージ計算の詳細ステップ
export interface MagicalCriticalDamageCalculationSteps {
	physicalCriticalDamage: number // 物理クリティカルダメージ（半減処理適用済み）
	spellBurstLevel: number // スペルバーストスキルレベル（0-10）
	baseMagicalCD: number // 魔法クリティカルダメージのベース値（100）
	increaseAmount: number // 増加量計算結果
	finalMagicalCriticalDamage: number // 最終魔法クリティカルダメージ
}

// MATK計算の詳細ステップ
export interface MATKCalculationSteps {
	level: number // キャラクターレベル
	weaponType: string // 武器種別
	weaponATK: number // 武器ATK
	refinementLevel: number // 精錬値
	weaponMATK: number // 総武器MATK
	baseINT: number // 基礎INT
	baseDEX: number // 基礎DEX
	baseAGI: number // 基礎AGI（旋風槍用）
	statusMATK: number // ステータスMATK
	matkUpSTR: number // MATKアップ(STR)
	matkUpINT: number // MATKアップ(INT)
	matkUpVIT: number // MATKアップ(VIT)
	matkUpAGI: number // MATKアップ(AGI)
	matkUpDEX: number // MATKアップ(DEX)
	matkUpTotal: number // MATKアップ合計
	matkDownTotal: number // MATKダウン合計
	baseMATK: number // 基礎MATK
	matkPercent: number // MATK%補正
	matkAfterPercent: number // MATK%適用後
	matkFixed: number // MATK固定値
	finalMATK: number // 最終MATK
}

// HIT計算の詳細ステップ
export interface HITCalculationSteps {
	level: number // ステータスのレベル
	adjustedDEX: number // 補正後DEX
	baseHIT: number // レベル + 補正後DEX
	accuracyPercent: number // 命中%補正
	hitAfterPercent: number // 命中%適用後 = INT(baseHIT × (1 + 命中%/100))
	accuracyFixed: number // 命中固定値補正
	finalHIT: number // 最終HIT
}

// 物理耐性計算の詳細ステップ
export interface PhysicalResistanceCalculationSteps {
	physicalResistanceRate: number // 物理耐性%補正（4データソース統合済み）
	finalPhysicalResistance: number // 最終物理耐性%
}

// 魔法耐性計算の詳細ステップ
export interface MagicalResistanceCalculationSteps {
	magicalResistanceRate: number // 魔法耐性%補正（4データソース統合済み）
	finalMagicalResistance: number // 最終魔法耐性%
}

// 防御崩し計算の詳細ステップ
export interface ArmorBreakCalculationSteps {
	armorBreakRate: number // 防御崩し%補正（3データソース統合済み）
	finalArmorBreak: number // 最終防御崩し%
}

// 先読み計算の詳細ステップ
export interface AnticipateCalculationSteps {
	anticipateRate: number // 先読み%補正（3データソース統合済み）
	finalAnticipate: number // 最終先読み%
}

// CSPD（詠唱速度）計算の詳細ステップ
export interface CSPDCalculationSteps {
	level: number // キャラクターレベル
	adjustedDEX: number // 補正後DEX
	adjustedAGI: number // 補正後AGI
	baseCSPD: number // ベースCSPD = INT(Lv + 補正後DEX × 2.94 + 補正後AGI × 1.16)
	cspd_Rate: number // CSPD%補正
	cspdAfterPercent: number // CSPD%適用後 = INT(ベースCSPD × (1 + CSPD%/100))
	cspdFixed: number // CSPD固定値補正
	finalCSPD: number // 最終CSPD
}

// 総属性有利計算の詳細ステップ
export interface TotalElementAdvantageCalculationSteps {
	elementAdvantageRate: number // 属性有利%補正（4データソース統合済み）
	finalTotalElementAdvantage: number // 最終総属性有利%
}

// 武器種別定義
export interface WeaponType {
	id: string
	name: string
	statusATKFormula: (adjustedStats: AdjustedStatsCalculation) => number
	statusASPDFormula: (adjustedStats: AdjustedStatsCalculation) => number
	statusStabilityFormula: (adjustedStats: AdjustedStatsCalculation) => number
	aspdCorrection: number
}

// 武器種別定義（英語キーと日本語名称）
const WEAPON_TYPES: Record<string, WeaponType> = {
	halberd: {
		id: 'halberd',
		name: '旋風槍',
		statusATKFormula: (stats) => stats.STR * 2.5 + stats.AGI * 1.5,
		statusASPDFormula: (stats) => stats.STR * 0.2 + stats.AGI * 3.5,
		statusStabilityFormula: (stats) => stats.STR * 0.05 + stats.DEX * 0.05,
		aspdCorrection: 25,
	},
	'1hsword': {
		id: '1hsword',
		name: '片手剣',
		statusATKFormula: (stats) => stats.STR * 2.0 + stats.DEX * 2.0,
		statusASPDFormula: (stats) => stats.STR * 0.2 + stats.AGI * 4.2,
		statusStabilityFormula: (stats) => stats.STR * 0.025 + stats.DEX * 0.075,
		aspdCorrection: 100,
	},
	'2hsword': {
		id: '2hsword',
		name: '両手剣',
		statusATKFormula: (stats) => stats.STR * 3.0 + stats.DEX * 1.0,
		statusASPDFormula: (stats) => stats.STR * 0.2 + stats.AGI * 2.1,
		statusStabilityFormula: (stats) => stats.DEX * 0.1,
		aspdCorrection: 50,
	},
	bow: {
		id: 'bow',
		name: '弓',
		statusATKFormula: (stats) => stats.STR * 1.0 + stats.DEX * 3.0,
		statusASPDFormula: (stats) => stats.DEX * 0.2 + stats.AGI * 3.1,
		statusStabilityFormula: (stats) => stats.STR * 0.05 + stats.DEX * 0.05,
		aspdCorrection: 75,
	},
	bowgun: {
		id: 'bowgun',
		name: '自動弓',
		statusATKFormula: (stats) => stats.DEX * 4.0,
		statusASPDFormula: (stats) => stats.DEX * 0.2 + stats.AGI * 2.2,
		statusStabilityFormula: (stats) => stats.STR * 0.05,
		aspdCorrection: 30,
	},
	staff: {
		id: 'staff',
		name: '杖',
		statusATKFormula: (stats) => stats.STR * 3.0 + stats.INT * 1.0,
		statusASPDFormula: (stats) => stats.AGI * 1.8 + stats.INT * 0.2,
		statusStabilityFormula: (stats) => stats.STR * 0.05,
		aspdCorrection: 60,
	},
	'magic-device': {
		id: 'magic-device',
		name: '魔導具',
		statusATKFormula: (stats) => stats.AGI * 2.0 + stats.INT * 2.0,
		statusASPDFormula: (stats) => stats.AGI * 4.0 + stats.INT * 0.2,
		statusStabilityFormula: (stats) => stats.DEX * 0.1,
		aspdCorrection: 900,
	},
	knuckle: {
		id: 'knuckle',
		name: '手甲',
		statusATKFormula: (stats) => stats.DEX * 0.5 + stats.AGI * 2.0,
		statusASPDFormula: (stats) =>
			stats.STR * 0.1 + stats.DEX * 0.1 + stats.AGI * 4.6,
		statusStabilityFormula: (stats) => stats.DEX * 0.025,
		aspdCorrection: 120,
	},
	katana: {
		id: 'katana',
		name: '抜刀剣',
		statusATKFormula: (stats) => stats.STR * 1.5 + stats.DEX * 2.5,
		statusASPDFormula: (stats) => stats.STR * 0.3 + stats.AGI * 3.9,
		statusStabilityFormula: (stats) => stats.STR * 0.075 + stats.DEX * 0.025,
		aspdCorrection: 200,
	},
	'dual-sword': {
		id: 'dual-sword',
		name: '双剣',
		statusATKFormula: (stats) =>
			stats.STR * 1.0 + stats.DEX * 2.0 + stats.AGI * 1.0,
		statusASPDFormula: (stats) => stats.STR * 0.2 + stats.AGI * 4.2,
		statusStabilityFormula: (stats) => 0, // 特殊計算（保留）
		aspdCorrection: 100,
	},
	barehand: {
		id: 'barehand',
		name: '素手',
		statusATKFormula: (stats) => stats.STR * 1.0,
		statusASPDFormula: (stats) => stats.AGI * 9.6,
		statusStabilityFormula: (stats) => stats.DEX * 0.35,
		aspdCorrection: 1000,
	},
}

/**
 * ATK計算（全武器種対応）
 * ATK = INT((自Lv + 総武器ATK + ステータスATK + ATKアップ - ATKダウン) × (1 + ATK%/100)) + ATK固定値
 */
export function calculateATK(
	stats: BaseStats,
	mainWeapon: {
		weaponType: WeaponTypeEnum
		ATK: number
		stability: number
		refinement: number
	},
	subWeapon: {
		weaponType: string
		ATK: number
		stability: number
		refinement: number
	},
	adjustedStats: AdjustedStatsCalculation,
	bonuses: AllBonuses = {},
): ATKCalculationSteps {
	// 0. 弓＋矢の判定
	const isBowArrowCombo =
		(mainWeapon.weaponType === '弓' || mainWeapon.weaponType === '自動弓') &&
		subWeapon?.weaponType === '矢'

	// 弓の場合は矢のATKをそのまま、自動弓の場合は矢のATK/2（INT適用）を加算
	let arrowATK = 0
	if (isBowArrowCombo) {
		if (mainWeapon.weaponType === '弓') {
			arrowATK = subWeapon.ATK
		} else if (mainWeapon.weaponType === '自動弓') {
			arrowATK = Math.floor(subWeapon.ATK / 2)
		}
	}

	// 1. 総武器ATK計算（メイン武器のATKのみに補正適用）
	const refinedWeaponATK = Math.floor(
		mainWeapon.ATK * (1 + mainWeapon.refinement ** 2 / 100) +
			mainWeapon.refinement,
	)

	const weaponATKPercent = bonuses.WeaponATK_Rate || 0
	const weaponATKPercentBonus = Math.floor(
		(mainWeapon.ATK * weaponATKPercent) / 100,
	)

	const weaponATKFixedBonus = bonuses.WeaponATK || 0
	// 矢のATKは武器ATK固定値として最後に加算
	const totalWeaponATK =
		refinedWeaponATK + weaponATKPercentBonus + weaponATKFixedBonus + arrowATK

	// 2. ステータスATK計算（武器種別対応、補正後ステータスを使用）
	const weaponTypeKey = getWeaponTypeKey(mainWeapon.weaponType)
	const weaponType = WEAPON_TYPES[weaponTypeKey] || WEAPON_TYPES.halberd
	const statusATK = weaponType.statusATKFormula(adjustedStats)

	// 3. ATKアップ・ダウン計算
	const atkUpSTR = Math.floor((stats.STR * (bonuses.ATK_STR_Rate || 0)) / 100)
	const atkUpAGI = Math.floor((stats.AGI * (bonuses.ATK_AGI_Rate || 0)) / 100)
	const atkUpINT = Math.floor((stats.INT * (bonuses.ATK_INT_Rate || 0)) / 100)
	const atkUpVIT = Math.floor((stats.VIT * (bonuses.ATK_VIT_Rate || 0)) / 100)
	const atkUpDEX = Math.floor((stats.DEX * (bonuses.ATK_DEX_Rate || 0)) / 100)
	const atkUpTotal = atkUpSTR + atkUpAGI + atkUpINT + atkUpVIT + atkUpDEX

	// ATKダウンは現在なしと仮定
	const atkDownTotal = 0

	// 4. 基礎ATK計算（ATK%適用前の値、小数点処理なし）
	const baseATK =
		stats.level + totalWeaponATK + statusATK + atkUpTotal - atkDownTotal

	// 5. 最終ATK計算
	const atkBeforePercent = baseATK
	const atkPercent = bonuses.ATK_Rate || 0
	const atkAfterPercent = Math.floor(atkBeforePercent * (1 + atkPercent / 100))
	const atkFixed = bonuses.ATK || 0
	const finalATK = atkAfterPercent + atkFixed

	return {
		baseWeaponATK: mainWeapon.ATK,
		arrowATK,
		isBowArrowCombo,
		refinementLevel: mainWeapon.refinement,
		refinedWeaponATK,
		weaponATKPercentBonus,
		weaponATKFixedBonus,
		totalWeaponATK,
		baseSTR: adjustedStats.STR, // 補正後ステータス（ステータスATK用）
		baseAGI: adjustedStats.AGI, // 補正後ステータス（ステータスATK用）
		statusATK,
		atkUpSTR,
		atkUpAGI,
		atkUpINT,
		atkUpVIT,
		atkUpDEX,
		atkUpTotal,
		atkDownTotal,
		baseATK,
		atkBeforePercent,
		atkPercent,
		atkAfterPercent,
		atkFixed,
		finalATK,
	}
}

/**
 * 装備品補正値1〜3を計算する関数
 * StatusPreviewで使用される装備品補正値1〜3の計算
 *
 * @param allBonuses レジスタ効果を含む統合済みのAllBonuses
 */
export function calculateEquipmentBonuses(
	allBonuses: AllBonuses, // レジスタ効果込みのAllBonusesを直接受け取る
) {
	// allBonusesはStatusPreviewで統合済み（レジスタ効果含む）

	// 装備品補正値1 (31項目) - %と固定値の両方を含む
	const equipmentBonus1 = {
		ATK: allBonuses.ATK || 0,
		ATK_Rate: allBonuses.ATK_Rate || 0,
		physicalPenetration: allBonuses.PhysicalPenetration_Rate || 0,
		physicalPenetration_Rate: allBonuses.PhysicalPenetration_Rate || 0,
		MATK: allBonuses.MATK || 0,
		MATK_Rate: allBonuses.MATK_Rate || 0,
		magicalPenetration: allBonuses.MagicalPenetration_Rate || 0,
		magicalPenetration_Rate: allBonuses.MagicalPenetration_Rate || 0,
		weaponATK: allBonuses.WeaponATK || 0,
		weaponATK_Rate: allBonuses.WeaponATK_Rate || 0,
		elementPower: allBonuses.ElementAdvantage_Rate || 0,
		elementPower_Rate: allBonuses.ElementAdvantage_Rate || 0,
		unsheatheAttack: allBonuses.UnsheatheAttack || 0,
		unsheatheAttack_Rate: allBonuses.UnsheatheAttack_Rate || 0,
		shortRangeDamage: allBonuses.ShortRangeDamage_Rate || 0,
		shortRangeDamage_Rate: allBonuses.ShortRangeDamage_Rate || 0,
		longRangeDamage: allBonuses.LongRangeDamage_Rate || 0,
		longRangeDamage_Rate: allBonuses.LongRangeDamage_Rate || 0,
		criticalDamage: allBonuses.CriticalDamage || 0,
		criticalDamage_Rate: allBonuses.CriticalDamage_Rate || 0,
		criticalRate: allBonuses.Critical || 0,
		criticalRate_Rate: allBonuses.Critical_Rate || 0,
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
		ASPD: allBonuses.AttackSpeed || 0,
		ASPD_Rate: allBonuses.AttackSpeed_Rate || 0,
		CSPD: allBonuses.CastingSpeed || 0,
		CSPD_Rate: allBonuses.CastingSpeed_Rate || 0,
		stability: allBonuses.Stability_Rate || 0,
		stability_Rate: allBonuses.Stability_Rate || 0,
		motionSpeed: allBonuses.MotionSpeed_Rate || 0,
		motionSpeed_Rate: allBonuses.MotionSpeed_Rate || 0,
		accuracy: allBonuses.Accuracy || 0,
		accuracy_Rate: allBonuses.Accuracy_Rate || 0,
		dodge: allBonuses.Dodge || 0,
		dodge_Rate: allBonuses.Dodge_Rate || 0,
		MP: allBonuses.MP || 0,
		MP_Rate: allBonuses.MP_Rate || 0,
		attackMPRecovery: allBonuses.AttackMPRecovery || 0,
		attackMPRecovery_Rate: allBonuses.AttackMPRecovery_Rate || 0,
		HP: allBonuses.HP || 0,
		HP_Rate: allBonuses.HP_Rate || 0,
		ailmentResistance: allBonuses.AilmentResistance_Rate || 0,
		ailmentResistance_Rate: allBonuses.AilmentResistance_Rate || 0,
		physicalResistance: allBonuses.PhysicalResistance_Rate || 0,
		physicalResistance_Rate: allBonuses.PhysicalResistance_Rate || 0,
		magicalResistance: allBonuses.MagicalResistance_Rate || 0,
		magicalResistance_Rate: allBonuses.MagicalResistance_Rate || 0,
		aggro: allBonuses.Aggro || 0,
		aggro_Rate: allBonuses.Aggro_Rate || 0,
	}

	// 装備品補正値2 (31項目) - %と固定値の両方を含む
	const equipmentBonus2 = {
		ATK_STR: 0, // ステータス連動攻撃力は固定値なし
		ATK_STR_Rate: allBonuses.ATK_STR_Rate || 0,
		MATK_STR: 0, // ステータス連動攻撃力は固定値なし
		MATK_STR_Rate: allBonuses.MATK_STR_Rate || 0,
		ATK_INT: 0, // ステータス連動攻撃力は固定値なし
		ATK_INT_Rate: allBonuses.ATK_INT_Rate || 0,
		MATK_INT: 0, // ステータス連動攻撃力は固定値なし
		MATK_INT_Rate: allBonuses.MATK_INT_Rate || 0,
		ATK_VIT: 0, // ステータス連動攻撃力は固定値なし
		ATK_VIT_Rate: allBonuses.ATK_VIT_Rate || 0,
		MATK_VIT: 0, // ステータス連動攻撃力は固定値なし
		MATK_VIT_Rate: allBonuses.MATK_VIT_Rate || 0,
		ATK_AGI: 0, // ステータス連動攻撃力は固定値なし
		ATK_AGI_Rate: allBonuses.ATK_AGI_Rate || 0,
		MATK_AGI: 0, // ステータス連動攻撃力は固定値なし
		MATK_AGI_Rate: allBonuses.MATK_AGI_Rate || 0,
		ATK_DEX: 0, // ステータス連動攻撃力は固定値なし
		ATK_DEX_Rate: allBonuses.ATK_DEX_Rate || 0,
		MATK_DEX: 0, // ステータス連動攻撃力は固定値なし
		MATK_DEX_Rate: allBonuses.MATK_DEX_Rate || 0,
		neutralResistance: 0, // 属性耐性は%のみ
		neutralResistance_Rate: allBonuses.NeutralResistance_Rate || 0,
		fireResistance: 0, // 属性耐性は%のみ
		fireResistance_Rate: allBonuses.FireResistance_Rate || 0,
		waterResistance: 0, // 属性耐性は%のみ
		waterResistance_Rate: allBonuses.WaterResistance_Rate || 0,
		windResistance: 0, // 属性耐性は%のみ
		windResistance_Rate: allBonuses.WindResistance_Rate || 0,
		earthResistance: 0, // 属性耐性は%のみ
		earthResistance_Rate: allBonuses.EarthResistance_Rate || 0,
		lightResistance: 0, // 属性耐性は%のみ
		lightResistance_Rate: allBonuses.LightResistance_Rate || 0,
		darkResistance: 0, // 属性耐性は%のみ
		darkResistance_Rate: allBonuses.DarkResistance_Rate || 0,
		linearReduction: 0, // ダメージ軽減は%のみ
		linearReduction_Rate: allBonuses.LinearReduction_Rate || 0,
		rushReduction: 0, // ダメージ軽減は%のみ
		rushReduction_Rate: allBonuses.RushReduction_Rate || 0,
		bulletReduction: 0, // ダメージ軽減は%のみ
		bulletReduction_Rate: allBonuses.BulletReduction_Rate || 0,
		proximityReduction: 0, // ダメージ軽減は%のみ
		proximityReduction_Rate: allBonuses.ProximityReduction_Rate || 0,
		areaReduction: 0, // ダメージ軽減は%のみ
		areaReduction_Rate: allBonuses.AreaReduction_Rate || 0,
		floorTrapReduction: 0, // ダメージ軽減は%のみ
		floorTrapReduction_Rate: allBonuses.FloorTrapReduction_Rate || 0,
		meteorReduction: 0, // ダメージ軽減は%のみ
		meteorReduction_Rate: allBonuses.MeteorReduction_Rate || 0,
		bladeReduction: 0, // ダメージ軽減は%のみ
		bladeReduction_Rate: allBonuses.BladeReduction_Rate || 0,
		suctionReduction: 0, // ダメージ軽減は%のみ
		suctionReduction_Rate: allBonuses.SuctionReduction_Rate || 0,
		explosionReduction: 0, // ダメージ軽減は%のみ
		explosionReduction_Rate: allBonuses.ExplosionReduction_Rate || 0,
		physicalBarrier: allBonuses.PhysicalBarrier || 0,
		magicalBarrier: allBonuses.MagicalBarrier || 0,
		fractionalBarrier: allBonuses.FractionalBarrier || 0,
		barrierCooldown: 0, // バリア速度は%のみ
		barrierCooldown_Rate: allBonuses.BarrierCooldown_Rate || 0,
	}

	// 装備品補正値3 (8項目) - %と固定値の両方を含む
	const equipmentBonus3 = {
		physicalFollowup: 0, // 追撃は%のみ
		physicalFollowup_Rate: allBonuses.PhysicalFollowup_Rate || 0,
		magicalFollowup: 0, // 追撃は%のみ
		magicalFollowup_Rate: allBonuses.MagicalFollowup_Rate || 0,
		naturalHPRecovery: allBonuses.NaturalHPRecovery || 0,
		naturalHPRecovery_Rate: allBonuses.NaturalHPRecovery_Rate || 0,
		naturalMPRecovery: allBonuses.NaturalMPRecovery || 0,
		naturalMPRecovery_Rate: allBonuses.NaturalMPRecovery_Rate || 0,
		absoluteAccuracy: 0, // 絶対系は%のみ
		absoluteAccuracy_Rate: allBonuses.AbsoluteAccuracy_Rate || 0,
		absoluteDodge: 0, // 絶対系は%のみ
		absoluteDodge_Rate: allBonuses.AbsoluteDodge_Rate || 0,
		revivalTime: 0, // 復帰短縮は%のみ
		revivalTime_Rate: allBonuses.RevivalTime_Rate || 0,
		itemCooldown: allBonuses.ItemCooldown || 0,
	}

	return {
		equipmentBonus1,
		equipmentBonus2,
		equipmentBonus3,
	}
}

/**
 * サブATK計算（双剣専用）
 */
export function calculateSubATK(
	stats: BaseStats,
	mainWeapon: {
		weaponType: WeaponTypeEnum
		ATK: number
		stability: number
		refinement: number
	},
	subWeapon: {
		weaponType: string
		ATK: number
		stability: number
		refinement: number
	},
	adjustedStats: AdjustedStatsCalculation,
	bonuses: AllBonuses = {},
): SubATKCalculationSteps | null {
	// 双剣以外は計算しない
	if (mainWeapon.weaponType !== '双剣') {
		return null
	}

	// 1. サブ総武器ATK計算（精錬補正は /200）
	const subRefinedWeaponATK = Math.floor(
		subWeapon.ATK * (1 + subWeapon.refinement ** 2 / 200) +
			subWeapon.refinement,
	)
	const subWeaponATKPercentBonus = Math.floor(
		(subWeapon.ATK * (bonuses.WeaponATK_Rate || 0)) / 100,
	)
	const subWeaponATKFixedBonus = bonuses.WeaponATK || 0
	const subTotalWeaponATK =
		subRefinedWeaponATK + subWeaponATKPercentBonus + subWeaponATKFixedBonus

	// 2. サブステータスATK計算（双剣専用計算式: STR × 1.0 + AGI × 3.0）
	const subStatusATK = adjustedStats.STR * 1.0 + adjustedStats.AGI * 3.0

	// 3. サブ基礎ATK計算
	const subBaseATK = Math.floor(stats.level + subTotalWeaponATK + subStatusATK)

	// 4. ステータス安定率計算（補正後ステータスを使用）
	const subWeaponStatusStability =
		adjustedStats.STR * 0.06 + adjustedStats.AGI * 0.04

	// 5. サブ安定率計算
	const stabilityPercent = bonuses.Stability_Rate || 0
	const subStability = Math.floor(
		Math.max(
			0,
			Math.min(
				100,
				subWeapon.stability / 2 + subWeaponStatusStability + stabilityPercent,
			),
		),
	)

	// 6. サブATK計算（ATK%・ATK固定値適用後、サブ安定率適用）
	const atkPercent = bonuses.ATK_Rate || 0
	const atkFixed = bonuses.ATK || 0
	const subATKAfterPercent = Math.floor(subBaseATK * (1 + atkPercent / 100))
	const subATKAfterFixed = subATKAfterPercent + atkFixed
	const subFinalATK = Math.floor((subATKAfterFixed * subStability) / 100)

	return {
		subBaseWeaponATK: subWeapon.ATK,
		subRefinementLevel: subWeapon.refinement,
		subRefinedWeaponATK,
		subWeaponATKPercentBonus,
		subWeaponATKFixedBonus,
		subTotalWeaponATK,
		subStatusATK,
		subBaseATK,
		subWeaponStability: subWeapon.stability,
		subWeaponStatusStability,
		stabilityPercent,
		subStability,
		subATKAfterPercent,
		subATKAfterFixed,
		subFinalATK,
	}
}

/**
 * ASPD計算（武器種別対応、ArmorType補正対応）
 * ASPD = INT((Lv + ステータスASPD + 武器補正値) × (1 + (ASPD% + ArmorType補正)/100)) + ASPD固定値
 * ArmorType補正: 通常=0%, 軽量化=+50%, 重量化=-50%（内部計算のみ）
 */
export function calculateASPD(
	stats: BaseStats,
	weapon: { weaponType: WeaponTypeEnum },
	adjustedStats: AdjustedStatsCalculation,
	bonuses: AllBonuses = {},
	armorType: ArmorType = 'normal',
): ASPDCalculationSteps {
	// 1. 武器種別ステータスASPD計算
	const weaponTypeKey = getWeaponTypeKey(weapon.weaponType)
	const weaponType = WEAPON_TYPES[weaponTypeKey] || WEAPON_TYPES.halberd
	const statusASPD = weaponType.statusASPDFormula(adjustedStats)

	// 2. 武器種補正値取得
	const weaponTypeCorrection = weaponType.aspdCorrection

	// 3. ASPD%適用前の値計算
	const aspdBeforePercent = stats.level + statusASPD + weaponTypeCorrection

	// 4. ASPD%補正値とArmorType補正計算
	const aspdPercent = bonuses.AttackSpeed_Rate || 0
	const armorTypeBonus = getArmorTypeASPDBonus(armorType)
	const effectiveASPDPercent = aspdPercent + armorTypeBonus

	// 5. 実効ASPD%補正適用
	const aspdAfterPercent = Math.floor(
		aspdBeforePercent * (1 + effectiveASPDPercent / 100),
	)

	// 6. ASPD固定値加算
	const aspdFixed = bonuses.AttackSpeed || 0
	const finalASPD = aspdAfterPercent + aspdFixed

	return {
		level: stats.level,
		statusASPD,
		weaponTypeCorrection,
		aspdBeforePercent,
		aspdPercent,
		armorTypeBonus,
		effectiveASPDPercent,
		aspdAfterPercent,
		aspdFixed,
		finalASPD,
	}
}

/**
 * 異常耐性計算
 * 異常耐性(%) = INT(MEN/3.4) + 異常耐性%
 */
export function calculateAilmentResistance(
	stats: BaseStats,
	bonuses: AllBonuses = {},
): number {
	// MEN基礎計算
	const menBaseResistance = Math.floor(stats.MEN / 3.4)

	// 異常耐性%補正
	const ailmentResistancePercent = bonuses.AilmentResistance_Rate || 0

	// 最終異常耐性
	const finalAilmentResistance = menBaseResistance + ailmentResistancePercent

	return finalAilmentResistance
}

/**
 * FLEE計算ステップの詳細情報
 */
export interface FLEECalculationSteps {
	level: number
	adjustedAGI: number
	hasBodyEquipment: boolean
	armorType: ArmorType
	baseFLEE: number
	dodgePercent: number
	fleeAfterPercent: number
	dodgeFixed: number
	finalFLEE: number
}

/**
 * 体装備の状態とArmorTypeを判定
 * @param bodyEquipment 体装備データ
 * @returns 体装備状態とArmorType
 */
export function getBodyEquipmentStatus(bodyEquipment: any): {
	hasBodyEquipment: boolean
	armorType: ArmorType
} {
	if (!bodyEquipment || !bodyEquipment.id) {
		return { hasBodyEquipment: false, armorType: 'normal' }
	}

	return {
		hasBodyEquipment: true,
		armorType: bodyEquipment.armorType || 'normal',
	}
}

/**
 * FLEE（回避率）計算
 * FLEE = INT(基礎FLEE × (1 + 回避%/100)) + 回避固定値
 *
 * 基礎FLEE計算（体装備状態とArmorTypeに依存）：
 * - 体装備なし: INT(75 + Lv × 3/2 + 補正後AGI × 2)
 * - 体装備あり（通常）: INT(Lv + 補正後AGI)
 * - 体装備あり（軽量化）: INT(30 + Lv × 5/4 + 補正後AGI × 7/4)
 * - 体装備あり（重量化）: INT(-15 + Lv/2 + 補正後AGI × 3/4)
 */
export function calculateFLEE(
	level: number,
	adjustedAGI: number,
	bodyEquipment: any,
	bonuses: AllBonuses = {},
): FLEECalculationSteps {
	// 1. 体装備状態の判定
	const { hasBodyEquipment, armorType } = getBodyEquipmentStatus(bodyEquipment)

	// 2. 基礎FLEE計算（4パターン）
	let baseFLEE: number

	if (!hasBodyEquipment) {
		// 体装備なし
		baseFLEE = Math.floor(75 + (level * 3) / 2 + adjustedAGI * 2)
	} else {
		// 体装備あり（ArmorTypeに応じて分岐）
		switch (armorType) {
			case 'light':
				// 軽量化
				baseFLEE = Math.floor(30 + (level * 5) / 4 + (adjustedAGI * 7) / 4)
				break
			case 'heavy':
				// 重量化
				baseFLEE = Math.floor(-15 + level / 2 + (adjustedAGI * 3) / 4)
				break
			case 'normal':
			default:
				// 通常
				baseFLEE = Math.floor(level + adjustedAGI)
				break
		}
	}

	// 3. 回避%適用（装備+クリスタ+バフアイテム、料理除外）
	const dodgePercent = bonuses.Dodge_Rate || 0
	const fleeAfterPercent = Math.floor(baseFLEE * (1 + dodgePercent / 100))

	// 4. 回避固定値加算（装備+クリスタ+バフアイテム、料理除外）
	const dodgeFixed = bonuses.Dodge || 0
	const finalFLEE = fleeAfterPercent + dodgeFixed

	return {
		level,
		adjustedAGI,
		hasBodyEquipment,
		armorType,
		baseFLEE,
		dodgePercent,
		fleeAfterPercent,
		dodgeFixed,
		finalFLEE,
	}
}

/**
 * ArmorType補正値を計算
 * @param armorType 体装備の防具の改造
 * @returns ASPD%補正値（内部計算のみ）
 */
export function getArmorTypeASPDBonus(armorType: ArmorType): number {
	switch (armorType) {
		case 'light':
			return 50 // 軽量化: +50%
		case 'heavy':
			return -50 // 重量化: -50%
		case 'normal':
		default:
			return 0 // 通常: +0%
	}
}

/**
 * 体装備からArmorTypeを取得
 * @param bodyEquipment 体装備データ
 * @returns ArmorType（デフォルト: 'normal'）
 */
export function getBodyArmorType(bodyEquipment: any): ArmorType {
	// 体装備が設定されていない場合はデフォルト
	if (!bodyEquipment?.id) {
		return 'normal'
	}

	// まず体装備スロット自体のarmorTypeをチェック（ユーザーが設定した改造タイプ）
	if (bodyEquipment.armorType) {
		return bodyEquipment.armorType
	}

	// 体装備のArmorTypeを取得（装備データから）
	const { getCombinedEquipmentById } = require('./equipmentDatabase')
	const equipment = getCombinedEquipmentById(bodyEquipment.id)

	const finalArmorType = equipment?.armorType || 'normal'

	return finalArmorType
}

/**
 * 行動速度計算
 * 行動速度 = MIN(50, MAX(0, INT((ASPD-1000)/180)) + 行動速度%)
 */
export function calculateMotionSpeed(
	aspd: number,
	bonuses: AllBonuses = {},
): MotionSpeedCalculationSteps {
	// 1. ASPDベース行動速度計算
	const aspdBase = Math.floor((aspd - 1000) / 180)

	// 2. 下限制限適用（0未満を0に制限）
	const aspdBaseClamped = Math.max(0, aspdBase)

	// 3. 行動速度%補正適用
	const motionSpeedPercent = bonuses.MotionSpeed_Rate || 0
	const motionSpeedAfterPercent = aspdBaseClamped + motionSpeedPercent

	// 4. 上限制限適用（50%上限）
	const finalMotionSpeed = Math.min(50, motionSpeedAfterPercent)

	return {
		aspd,
		aspdBase,
		aspdBaseClamped,
		motionSpeedPercent,
		motionSpeedAfterPercent,
		finalMotionSpeed,
	}
}

/**
 * クリティカル率計算
 * クリティカル率(%) = INT(INT(25+CRT/3.4)×(1+クリティカル率%/100))+クリティカル率固定値
 */
export function calculateCriticalRate(
	crt: number,
	bonuses: AllBonuses = {},
): CriticalRateCalculationSteps {
	// 1. CRT基礎クリティカル率計算
	const crtBaseCriticalRate = Math.floor(25 + crt / 3.4)

	// 2. クリティカル率%補正適用
	const criticalRatePercent = bonuses.Critical_Rate || 0
	const criticalRateAfterPercent = Math.floor(
		crtBaseCriticalRate * (1 + criticalRatePercent / 100),
	)

	// 3. クリティカル率固定値加算
	const criticalRateFixed = bonuses.Critical || 0
	const finalCriticalRate = criticalRateAfterPercent + criticalRateFixed

	return {
		crt,
		crtBaseCriticalRate,
		criticalRatePercent,
		criticalRateAfterPercent,
		criticalRateFixed,
		finalCriticalRate,
	}
}

/**
 * クリティカルダメージ計算
 * クリティカルダメージ = INT((150+MAX(補正後STR/5,(補正後STR+補正後AGI)/10))×(1+CD%/100))+CD固定値
 * ※300を超えた場合、300以降の数値は半減し、小数点以下は切り捨てられる
 */
export function calculateCriticalDamage(
	adjustedSTR: number,
	adjustedAGI: number,
	bonuses: AllBonuses = {},
): CriticalDamageCalculationSteps {
	// 1. MAX計算
	const strDivision = adjustedSTR / 5
	const strAgiDivision = (adjustedSTR + adjustedAGI) / 10
	const maxValue = Math.max(strDivision, strAgiDivision)

	// 2. 基礎クリティカルダメージ
	const baseCriticalDamage = 150 + maxValue

	// 3. CD%適用
	const cdPercent = bonuses.CriticalDamage_Rate || 0
	const cdAfterPercent = Math.floor(baseCriticalDamage * (1 + cdPercent / 100))

	// 4. CD固定値加算
	const cdFixed = bonuses.CriticalDamage || 0
	const cdBeforeLimit = cdAfterPercent + cdFixed

	// 5. 300超過時の半減処理
	let finalCriticalDamage: number
	let isOver300 = false
	let excessAmount: number | undefined
	let halvedExcess: number | undefined

	if (cdBeforeLimit > 300) {
		isOver300 = true
		excessAmount = cdBeforeLimit - 300
		halvedExcess = Math.floor(excessAmount / 2)
		finalCriticalDamage = 300 + halvedExcess
	} else {
		finalCriticalDamage = cdBeforeLimit
	}

	return {
		adjustedSTR,
		adjustedAGI,
		strDivision,
		strAgiDivision,
		maxValue,
		baseCriticalDamage,
		cdPercent,
		cdAfterPercent,
		cdFixed,
		cdBeforeLimit,
		isOver300,
		excessAmount,
		halvedExcess,
		finalCriticalDamage,
	}
}

/**
 * MATK計算
 * MATK = INT((自Lv+総武器MATK+ステータスMATK+MATKアップ-MATKダウン)×(1+MATK%/100))+MATK固定値
 *
 * @param level キャラクターレベル
 * @param weaponType 武器種別
 * @param weaponATK 武器ATK
 * @param refinementLevel 精錬値
 * @param totalWeaponATK 総武器ATK（手甲用）
 * @param baseStats 基礎ステータス（MATKアップ計算用）
 * @param adjustedStats 補正後ステータス（ステータスMATK計算用）
 * @param bonuses 全補正値（装備・クリスタ・バフアイテム・料理の合計）
 * @returns MATK計算結果
 */
export const calculateMATK = (
	level: number,
	weaponType: string,
	weaponATK: number,
	refinementLevel: number,
	totalWeaponATK: number,
	baseStats: BaseStats,
	adjustedStats: AdjustedStatsCalculation,
	bonuses: AllBonuses,
): MATKCalculationSteps => {
	// 1. 総武器MATK計算
	let weaponMATK = 0
	if (weaponType === '杖' || weaponType === '魔導具') {
		// 杖・魔導具: 総武器MATKを適用
		const weaponATKPercent = bonuses.WeaponATK_Rate || 0
		const weaponATKFixed = bonuses.WeaponATK || 0
		weaponMATK =
			Math.floor(
				weaponATK * (1 + refinementLevel ** 2 / 100) + refinementLevel,
			) +
			Math.floor((weaponATK * weaponATKPercent) / 100) +
			weaponATKFixed
	} else if (weaponType === '手甲') {
		// 手甲: 総武器ATK/2（小数点保持）
		weaponMATK = totalWeaponATK / 2
	}
	// その他の武器種は weaponMATK = 0

	// 2. ステータスMATK計算（補正後ステータスを使用）
	const { INT, DEX, AGI } = adjustedStats
	let statusMATK = 0
	switch (weaponType) {
		case '片手剣':
		case '両手剣':
		case '弓':
		case '自動弓':
		case '素手':
			statusMATK = INT * 3 + DEX * 1
			break
		case '杖':
		case '魔導具':
		case '手甲':
			statusMATK = INT * 4 + DEX * 1
			break
		case '旋風槍':
			statusMATK = INT * 2 + DEX * 1 + AGI * 1
			break
		case '抜刀剣':
			statusMATK = INT * 1.5 + DEX * 1 // 小数点保持
			break
		case '双剣':
			// TODO: 双剣の計算式は後で追加
			statusMATK = INT * 3 + DEX * 1 // 暫定
			break
		default:
			statusMATK = INT * 3 + DEX * 1 // デフォルト
			break
	}

	// 3. MATKアップ・ダウン計算（基礎ステータスを使用）
	const matkUpSTR = Math.floor(
		(baseStats.STR * (bonuses.MATK_STR_Rate || 0)) / 100,
	)
	const matkUpINT = Math.floor(
		(baseStats.INT * (bonuses.MATK_INT_Rate || 0)) / 100,
	)
	const matkUpVIT = Math.floor(
		(baseStats.VIT * (bonuses.MATK_VIT_Rate || 0)) / 100,
	)
	const matkUpAGI = Math.floor(
		(baseStats.AGI * (bonuses.MATK_AGI_Rate || 0)) / 100,
	)
	const matkUpDEX = Math.floor(
		(baseStats.DEX * (bonuses.MATK_DEX_Rate || 0)) / 100,
	)

	const matkUpTotal = matkUpSTR + matkUpINT + matkUpVIT + matkUpAGI + matkUpDEX
	const matkDownTotal = 0 // 必要に応じて実装

	// 4. 基本MATK計算
	const baseMATK = level + weaponMATK + statusMATK + matkUpTotal - matkDownTotal

	// 5. MATK%適用
	const matkPercent = bonuses.MATK_Rate || 0
	const matkAfterPercent = Math.floor(baseMATK * (1 + matkPercent / 100))

	// 6. MATK固定値加算
	const matkFixed = bonuses.MATK || 0
	const finalMATK = matkAfterPercent + matkFixed

	return {
		level,
		weaponType,
		weaponATK,
		refinementLevel,
		weaponMATK,
		baseINT: INT, // 補正後ステータスのINT
		baseDEX: DEX, // 補正後ステータスのDEX
		baseAGI: AGI, // 補正後ステータスのAGI
		statusMATK,
		matkUpSTR,
		matkUpINT,
		matkUpVIT,
		matkUpAGI,
		matkUpDEX,
		matkUpTotal,
		matkDownTotal,
		baseMATK,
		matkPercent,
		matkAfterPercent,
		matkFixed,
		finalMATK,
	}
}

/**
 * HIT計算
 * HIT = INT((Lv+総DEX)×(1+命中%/100))+命中固定値
 */
export function calculateHIT(
	level: number,
	adjustedDEX: number,
	bonuses: AllBonuses = {},
): HITCalculationSteps {
	// 1. ベースHIT計算（レベル + 補正後DEX）
	const baseHIT = level + adjustedDEX

	// 2. 命中%補正適用
	const accuracyPercent = bonuses.Accuracy_Rate || 0
	const hitAfterPercent = Math.floor(baseHIT * (1 + accuracyPercent / 100))

	// 3. 命中固定値加算
	const accuracyFixed = bonuses.Accuracy || 0
	const finalHIT = hitAfterPercent + accuracyFixed

	return {
		level,
		adjustedDEX,
		baseHIT,
		accuracyPercent,
		hitAfterPercent,
		accuracyFixed,
		finalHIT,
	}
}

/**
 * 物理耐性計算
 * 物理耐性(%) = 装備/プロパティ物理耐性% + クリスタ物理耐性% + 料理物理耐性% + バフアイテム物理耐性%
 */
export function calculatePhysicalResistance(
	bonuses: AllBonuses = {},
): PhysicalResistanceCalculationSteps {
	// 物理耐性%の合計値（4つのデータソースから統合済み）
	const physicalResistanceRate = bonuses.PhysicalResistance_Rate || 0

	return {
		physicalResistanceRate,
		finalPhysicalResistance: physicalResistanceRate,
	}
}

/**
 * 魔法耐性計算
 * 魔法耐性(%) = 装備/プロパティ魔法耐性% + クリスタ魔法耐性% + 料理魔法耐性% + バフアイテム魔法耐性%
 */
export function calculateMagicalResistance(
	bonuses: AllBonuses = {},
): MagicalResistanceCalculationSteps {
	// 魔法耐性%の合計値（4つのデータソースから統合済み）
	const magicalResistanceRate = bonuses.MagicalResistance_Rate || 0

	return {
		magicalResistanceRate,
		finalMagicalResistance: magicalResistanceRate,
	}
}

/**
 * 防御崩し計算
 * 防御崩し(%) = 装備/プロパティ防御崩し% + クリスタ防御崩し% + バフアイテム防御崩し%
 */
export function calculateArmorBreak(
	bonuses: AllBonuses = {},
): ArmorBreakCalculationSteps {
	// 防御崩し%の合計値（3つのデータソースから統合済み、料理除外）
	const armorBreakRate = bonuses.ArmorBreak_Rate || 0

	return {
		armorBreakRate,
		finalArmorBreak: armorBreakRate,
	}
}

/**
 * 先読み計算
 * 先読み(%) = 装備/プロパティ先読み% + クリスタ先読み% + バフアイテム先読み%
 */
export function calculateAnticipate(
	bonuses: AllBonuses = {},
): AnticipateCalculationSteps {
	// 先読み%の合計値（3つのデータソースから統合済み、料理除外）
	const anticipateRate = bonuses.Anticipate_Rate || 0

	return {
		anticipateRate,
		finalAnticipate: anticipateRate,
	}
}

/**
 * CSPD（詠唱速度）計算
 * CSPD = INT((INT(Lv+補正後DEX×2.94+補正後AGI×1.16))×(1+CSPD%/100))+CSPD固定値
 */
export function calculateCSPD(
	level: number,
	adjustedDEX: number,
	adjustedAGI: number,
	bonuses: AllBonuses = {},
): CSPDCalculationSteps {
	// 1. ベースCSPD計算
	const baseCSPD = Math.floor(level + adjustedDEX * 2.94 + adjustedAGI * 1.16)

	// 2. CSPD%補正適用
	const cspd_Rate = bonuses.CastingSpeed_Rate || 0
	const cspdAfterPercent = Math.floor(baseCSPD * (1 + cspd_Rate / 100))

	// 3. CSPD固定値加算
	const cspdFixed = bonuses.CastingSpeed || 0
	const finalCSPD = cspdAfterPercent + cspdFixed

	return {
		level,
		adjustedDEX,
		adjustedAGI,
		baseCSPD,
		cspd_Rate,
		cspdAfterPercent,
		cspdFixed,
		finalCSPD,
	}
}

/**
 * 総属性有利計算
 *
 * 装備/プロパティ、クリスタ、料理、バフアイテムからの属性有利%補正を統合
 * 全ての属性攻撃に対して共通で適用される汎用的な属性有利補正
 *
 * @param bonuses 全補正値（4データソース統合済み）
 * @returns 総属性有利計算の詳細ステップ
 */
export function calculateTotalElementAdvantage(
	bonuses: AllBonuses = {},
): TotalElementAdvantageCalculationSteps {
	// 属性有利%補正を取得（4データソース統合済み）
	const elementAdvantageRate = bonuses.ElementAdvantage_Rate || 0

	// 総属性有利は単純な%補正のみ（固定値補正は存在しない）
	const finalTotalElementAdvantage = elementAdvantageRate

	return {
		elementAdvantageRate,
		finalTotalElementAdvantage,
	}
}

/**
 * 魔法クリティカルダメージ計算
 * 魔法クリティカルダメージ = INT(100 + (クリティカルダメージ - 100) × (20 + スペルバーストslv) / 40)
 *
 * @param physicalCriticalDamage 物理クリティカルダメージの最終計算結果（300超過時の半減処理適用済み）
 * @param spellBurstLevel バフスキルのスペルバースト(sf1)のスキルレベル（0-10）
 * @returns 魔法クリティカルダメージ計算結果
 */
export function calculateMagicalCriticalDamage(
	physicalCriticalDamage: number,
	spellBurstLevel = 0,
): MagicalCriticalDamageCalculationSteps {
	// 1. ベース値
	const baseMagicalCD = 100

	// 2. 増加量計算
	const increaseAmount =
		((physicalCriticalDamage - 100) * (20 + spellBurstLevel)) / 40

	// 3. 最終値算出（INT関数適用）
	const finalMagicalCriticalDamage = Math.floor(baseMagicalCD + increaseAmount)

	return {
		physicalCriticalDamage,
		spellBurstLevel,
		baseMagicalCD,
		increaseAmount,
		finalMagicalCriticalDamage,
	}
}

/**
 * 総ATK計算結果のインターフェース
 */
export interface TotalATKCalculationSteps {
	mainATK: number
	subATK: number
	isDualSword: boolean
	totalATK: number
}

/**
 * 総ATK計算
 *
 * 双剣以外: 総ATK = ATK
 * 双剣: 総ATK = ATK + サブATK
 *
 * @param mainWeaponType メイン武器種別
 * @param mainATK メイン武器のATK計算結果
 * @param subATK サブ武器のATK計算結果
 * @returns 総ATK計算の詳細ステップ
 */
export function calculateTotalATK(
	mainWeaponType: WeaponTypeEnum,
	mainATK: number,
	subATK: number,
): TotalATKCalculationSteps {
	const isDualSword = mainWeaponType === '双剣'

	const totalATK = isDualSword ? mainATK + subATK : mainATK

	return {
		mainATK,
		subATK,
		isDualSword,
		totalATK,
	}
}

/**
 * 安定率計算
 *
 * 計算式: MAX(0, MIN(100, メイン武器の安定率 + ステータス安定率 + 安定率%))
 * ステータス安定率は武器種によって異なる計算式を使用
 *
 * @param weaponStability メイン武器の安定率
 * @param weaponType 武器種別
 * @param adjustedStats 補正後ステータス
 * @param bonuses 全補正値（装備・クリスタ・料理・バフアイテム統合済み）
 * @returns 安定率計算の詳細ステップ
 */
export function calculateStability(
	weaponStability: number,
	weaponType: WeaponTypeEnum,
	adjustedStats: AdjustedStatsCalculation,
	bonuses: AllBonuses = {},
	subWeapon?: { weaponType: string; stability: number },
): StabilityCalculationSteps {
	// 1. 武器種別によるステータス安定率計算
	const weaponTypeKey = getWeaponTypeKey(weaponType)
	const weaponTypeData = WEAPON_TYPES[weaponTypeKey] || WEAPON_TYPES.halberd
	const statusStability = weaponTypeData.statusStabilityFormula(adjustedStats)

	// 2. 安定率%補正取得（3データソース：装備・クリスタ・バフアイテム）
	const stabilityPercent = bonuses.Stability_Rate || 0

	// 3. 弓+矢の場合の矢の安定率取得
	const isBowArrowCombo =
		(weaponType === '弓' || weaponType === '自動弓') &&
		subWeapon?.weaponType === '矢'
	let arrowStability = 0
	if (isBowArrowCombo) {
		if (weaponType === '弓') {
			arrowStability = subWeapon.stability // 弓の場合はそのまま
		} else if (weaponType === '自動弓') {
			arrowStability = Math.floor(subWeapon.stability / 2) // 自動弓の場合は半分（INT適用）
		}
	}

	// 4. 制限適用前の安定率計算
	const stabilityBeforeLimit =
		weaponStability + statusStability + stabilityPercent + arrowStability

	// 5. 0-100%制限適用と小数点切り捨て
	const finalStability = Math.floor(
		Math.max(0, Math.min(100, stabilityBeforeLimit)),
	)

	return {
		weaponStability,
		statusStability,
		stabilityPercent,
		arrowStability,
		stabilityBeforeLimit,
		finalStability,
	}
}
