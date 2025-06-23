/**
 * 基本ステータス（HP・MP）計算ロジック
 * 
 * トーラムオンラインの正確な計算式に基づく実装
 * 詳細な計算式は docs/calculations/basic-stats.md を参照
 */

import type { BaseStats } from '@/types/calculator'

// 全補正値（装備・クリスタ・料理・バフアイテムの合計）
export interface AllBonuses {
	VIT?: number          // VIT固定値の合計
	VIT_Rate?: number     // VIT%の合計
	HP?: number           // HP固定値の合計
	HP_Rate?: number      // HP%の合計
	MP?: number           // MP固定値の合計
	MP_Rate?: number      // MP%の合計
}

// HP計算の中間結果
export interface HPCalculationSteps {
	adjustedVIT: number      // 補正後VIT
	baseHP: number          // HP基本値
	hpAfterPercent: number  // HP%適用後
	finalHP: number         // 最終HP
}

// MP計算の中間結果
export interface MPCalculationSteps {
	baseMP: number          // MP基本値
	mpAfterPercent: number  // MP%適用後
	finalMP: number         // 最終MP
}

/**
 * HP計算（正確な計算式）
 * HP = INT(INT(93+(補正後VIT+22.41)*Lv/3)*(1+HP%/100))+HP固定値
 */
export function calculateHP(stats: BaseStats, bonuses: AllBonuses = {}): HPCalculationSteps {
	// 1. 補正後VIT計算
	const vitPercent = bonuses.VIT_Rate || 0
	const vitFixed = bonuses.VIT || 0
	const adjustedVIT = stats.VIT * (1 + vitPercent / 100) + vitFixed

	// 2. HP基本値計算
	const baseHP = Math.floor(93 + (adjustedVIT + 22.41) * stats.level / 3)

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
export function calculateMP(stats: BaseStats, bonuses: AllBonuses = {}): MPCalculationSteps {
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
	return {
		VIT: (equipment.VIT || 0) + (crystals.VIT || 0) + (foods.VIT || 0) + (buffs.VIT || 0),
		VIT_Rate: (equipment.VIT_Rate || 0) + (crystals.VIT_Rate || 0) + (foods.VIT_Rate || 0) + (buffs.VIT_Rate || 0),
		HP: (equipment.HP || 0) + (crystals.HP || 0) + (foods.HP || 0) + (buffs.HP || 0),
		HP_Rate: (equipment.HP_Rate || 0) + (crystals.HP_Rate || 0) + (foods.HP_Rate || 0) + (buffs.HP_Rate || 0),
		MP: (equipment.MP || 0) + (crystals.MP || 0) + (foods.MP || 0) + (buffs.MP || 0),
		MP_Rate: (equipment.MP_Rate || 0) + (crystals.MP_Rate || 0) + (foods.MP_Rate || 0) + (buffs.MP_Rate || 0),
	}
}