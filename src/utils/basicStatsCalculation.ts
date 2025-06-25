/**
 * 基本ステータス（HP・MP）計算ロジック
 *
 * トーラムオンラインの正確な計算式に基づく実装
 * 詳細な計算式は docs/calculations/basic-stats.md を参照
 */

import type { BaseStats, WeaponType as WeaponTypeEnum } from '@/types/calculator'
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

	// サブATK最終計算
	subBaseATK: number // サブ基礎ATK
	subATKBeforePercent: number // サブATK%適用前
	subATKAfterPercent: number // サブATK%適用後
	subFinalATK: number // サブ最終ATK
}

export interface ASPDCalculationSteps {
	level: number // キャラクターレベル
	statusASPD: number // ステータスASPD（武器種別計算）
	weaponTypeCorrection: number // 武器種補正値
	aspdBeforePercent: number // ASPD%適用前
	aspdPercent: number // ASPD%補正値
	aspdAfterPercent: number // ASPD%適用後
	aspdFixed: number // ASPD固定値
	finalASPD: number // 最終ASPD
}

// 武器種別定義
export interface WeaponType {
	id: string
	name: string
	statusATKFormula: (baseStats: BaseStats) => number
	statusASPDFormula: (adjustedStats: AdjustedStatsCalculation) => number
	aspdCorrection: number
}

// 武器種別定義（英語キーと日本語名称）
const WEAPON_TYPES: Record<string, WeaponType> = {
	halberd: {
		id: 'halberd',
		name: '旋風槍',
		statusATKFormula: (stats) => stats.STR * 2.5 + stats.AGI * 1.5,
		statusASPDFormula: (stats) => stats.STR * 0.2 + stats.AGI * 3.5,
		aspdCorrection: 25,
	},
	'1hsword': {
		id: '1hsword',
		name: '片手剣',
		statusATKFormula: (stats) => stats.STR * 2.0 + stats.DEX * 2.0,
		statusASPDFormula: (stats) => stats.STR * 0.2 + stats.AGI * 4.2,
		aspdCorrection: 100,
	},
	'2hsword': {
		id: '2hsword',
		name: '両手剣',
		statusATKFormula: (stats) => stats.STR * 3.0 + stats.DEX * 1.0,
		statusASPDFormula: (stats) => stats.STR * 0.2 + stats.AGI * 2.1,
		aspdCorrection: 50,
	},
	bow: {
		id: 'bow',
		name: '弓',
		statusATKFormula: (stats) => stats.STR * 1.0 + stats.DEX * 3.0,
		statusASPDFormula: (stats) => stats.DEX * 0.2 + stats.AGI * 3.1,
		aspdCorrection: 75,
	},
	bowgun: {
		id: 'bowgun',
		name: '自動弓',
		statusATKFormula: (stats) => stats.DEX * 4.0,
		statusASPDFormula: (stats) => stats.DEX * 0.2 + stats.AGI * 2.2,
		aspdCorrection: 30,
	},
	staff: {
		id: 'staff',
		name: '杖',
		statusATKFormula: (stats) => stats.STR * 3.0 + stats.INT * 1.0,
		statusASPDFormula: (stats) => stats.AGI * 1.8 + stats.INT * 0.2,
		aspdCorrection: 60,
	},
	'magic-device': {
		id: 'magic-device',
		name: '魔導具',
		statusATKFormula: (stats) => stats.AGI * 2.0 + stats.INT * 2.0,
		statusASPDFormula: (stats) => stats.AGI * 4.0 + stats.INT * 0.2,
		aspdCorrection: 900,
	},
	knuckle: {
		id: 'knuckle',
		name: '手甲',
		statusATKFormula: (stats) => stats.DEX * 0.5 + stats.AGI * 2.0,
		statusASPDFormula: (stats) => stats.STR * 0.1 + stats.DEX * 0.1 + stats.AGI * 4.6,
		aspdCorrection: 120,
	},
	katana: {
		id: 'katana',
		name: '抜刀剣',
		statusATKFormula: (stats) => stats.STR * 1.5 + stats.DEX * 2.5,
		statusASPDFormula: (stats) => stats.STR * 0.3 + stats.AGI * 3.9,
		aspdCorrection: 200,
	},
	'dual-sword': {
		id: 'dual-sword',
		name: '双剣',
		statusATKFormula: (stats) => stats.STR * 1.0 + stats.DEX * 2.0 + stats.AGI * 1.0,
		statusASPDFormula: (stats) => stats.STR * 0.2 + stats.AGI * 4.2,
		aspdCorrection: 100,
	},
	barehand: {
		id: 'barehand',
		name: '素手',
		statusATKFormula: (stats) => stats.STR * 1.0,
		statusASPDFormula: (stats) => stats.AGI * 9.6,
		aspdCorrection: 1000,
	},
}

/**
 * ATK計算（全武器種対応）
 * ATK = INT((自Lv + 総武器ATK + ステータスATK + ATKアップ - ATKダウン) × (1 + ATK%/100)) + ATK固定値
 */
export function calculateATK(
	stats: BaseStats,
	weapon: { weaponType: WeaponTypeEnum; ATK: number; stability: number; refinement: number },
	bonuses: AllBonuses = {},
): ATKCalculationSteps {
	// 1. 総武器ATK計算
	const refinedWeaponATK = Math.floor(
		weapon.ATK * (1 + weapon.refinement ** 2 / 100) + weapon.refinement,
	)

	const weaponATKPercent = bonuses.WeaponATK_Rate || 0
	const weaponATKPercentBonus = Math.floor(
		(weapon.ATK * weaponATKPercent) / 100,
	)

	const weaponATKFixedBonus = bonuses.WeaponATK || 0
	const totalWeaponATK =
		refinedWeaponATK + weaponATKPercentBonus + weaponATKFixedBonus

	// 2. ステータスATK計算（武器種別対応）
	const weaponTypeKey = getWeaponTypeKey(weapon.weaponType)
	const weaponType = WEAPON_TYPES[weaponTypeKey] || WEAPON_TYPES.halberd
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

	// 4. 基礎ATK計算（ATK%適用前の値、小数点処理なし）
	const baseATK = stats.level + totalWeaponATK + statusATK + atkUpTotal - atkDownTotal
	
	// 5. 最終ATK計算
	const atkBeforePercent = baseATK
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
		baseATK,
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
		aggroPlus: Math.max(0, allBonuses.Aggro || 0),
		aggroPlus_Rate: Math.max(0, allBonuses.Aggro_Rate || 0),
		aggroMinus: Math.abs(Math.min(0, allBonuses.Aggro || 0)),
		aggroMinus_Rate: Math.abs(Math.min(0, allBonuses.Aggro_Rate || 0)),
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

/**
 * サブATK計算（双剣専用）
 */
export function calculateSubATK(
	stats: BaseStats,
	mainWeapon: { weaponType: WeaponTypeEnum; ATK: number; stability: number; refinement: number },
	subWeapon: { weaponType: string; ATK: number; stability: number; refinement: number },
	adjustedStats: AdjustedStatsCalculation,
	bonuses: AllBonuses = {},
): SubATKCalculationSteps | null {
	// 双剣以外は計算しない
	if (mainWeapon.weaponType !== '双剣') {
		return null
	}

	// 1. サブ総武器ATK計算（精錬補正は /200）
	const subRefinedWeaponATK = Math.floor(
		subWeapon.ATK * (1 + subWeapon.refinement ** 2 / 200) + subWeapon.refinement,
	)
	const subWeaponATKPercentBonus = Math.floor(subWeapon.ATK * (bonuses.WeaponATK_Rate || 0))
	const subWeaponATKFixedBonus = bonuses.WeaponATK || 0
	const subTotalWeaponATK = subRefinedWeaponATK + subWeaponATKPercentBonus + subWeaponATKFixedBonus

	// 2. サブステータスATK計算（双剣専用計算式: STR × 1.0 + AGI × 3.0）
	const subStatusATK = adjustedStats.STR * 1.0 + adjustedStats.AGI * 3.0

	// 3. サブ基礎ATK計算（ATKアップ・ATKダウンは含まない）
	const subBaseATK = stats.level + subTotalWeaponATK + subStatusATK

	// 4. サブ最終ATK計算
	const subATKBeforePercent = subBaseATK
	const atkPercent = bonuses.ATK_Rate || 0
	const subATKAfterPercent = Math.floor(
		subATKBeforePercent * (1 + atkPercent / 100),
	)
	const atkFixed = bonuses.ATK || 0
	const subFinalATK = subATKAfterPercent + atkFixed

	return {
		subBaseWeaponATK: subWeapon.ATK,
		subRefinementLevel: subWeapon.refinement,
		subRefinedWeaponATK,
		subWeaponATKPercentBonus,
		subWeaponATKFixedBonus,
		subTotalWeaponATK,
		subStatusATK,
		subBaseATK,
		subATKBeforePercent,
		subATKAfterPercent,
		subFinalATK,
	}
}

/**
 * ASPD計算（武器種別対応）
 * ASPD = INT((Lv + ステータスASPD + 武器種補正値) × (1 + ASPD%/100)) + ASPD固定値
 */
export function calculateASPD(
	stats: BaseStats,
	weapon: { weaponType: WeaponTypeEnum },
	adjustedStats: AdjustedStatsCalculation,
	bonuses: AllBonuses = {},
): ASPDCalculationSteps {
	// 1. 武器種別ステータスASPD計算
	const weaponTypeKey = getWeaponTypeKey(weapon.weaponType)
	const weaponType = WEAPON_TYPES[weaponTypeKey] || WEAPON_TYPES.halberd
	const statusASPD = weaponType.statusASPDFormula(adjustedStats)

	// 2. 武器種補正値取得
	const weaponTypeCorrection = weaponType.aspdCorrection

	// 3. ASPD%適用前の値計算
	const aspdBeforePercent = stats.level + statusASPD + weaponTypeCorrection

	// 4. ASPD%補正適用
	const aspdPercent = bonuses.AttackSpeed_Rate || 0
	const aspdAfterPercent = Math.floor(
		aspdBeforePercent * (1 + aspdPercent / 100),
	)

	// 5. ASPD固定値加算
	const aspdFixed = bonuses.AttackSpeed || 0
	const finalASPD = aspdAfterPercent + aspdFixed

	return {
		level: stats.level,
		statusASPD,
		weaponTypeCorrection,
		aspdBeforePercent,
		aspdPercent,
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
