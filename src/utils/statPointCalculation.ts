/**
 * ステータスポイント計算ロジック
 *
 * レベルに応じたステータスポイントの計算を行う
 * 詳細な計算式は docs/calculations/basic-stats.md を参照
 */

import type { BaseStats } from '@/types/calculator'

export interface StatPointCalculationSteps {
	level: number
	basePoints: number
	levelIncreasePoints: number
	level305Bonus: number
	totalStatPoints: number
	usedPoints: number
	availableStatPoints: number
}

/**
 * ステータスポイント計算
 * @param level キャラクターレベル
 * @param stats 基本ステータス（使用済みポイント計算用）
 * @returns ステータスポイント計算結果
 */
export function calculateStatPoints(
	level: number,
	stats?: BaseStats,
): StatPointCalculationSteps {
	// 基本ポイント（レベル1時）
	const basePoints = 172

	// レベル増加ポイント（レベル-1）× 2
	const levelIncreasePoints = (level - 1) * 2

	// レベル305ボーナス
	const level305Bonus = level >= 305 ? 5 : 0

	// 総ステータスポイント
	const totalStatPoints = basePoints + levelIncreasePoints + level305Bonus

	// 使用済みポイント計算（初期値1を除く）
	let usedPoints = 0
	if (stats) {
		usedPoints =
			stats.STR -
			1 +
			(stats.INT - 1) +
			(stats.VIT - 1) +
			(stats.AGI - 1) +
			(stats.DEX - 1) +
			(stats.CRT - 1) +
			(stats.MEN - 1) +
			(stats.TEC - 1)
	}

	// 利用可能ステータスポイント
	const availableStatPoints = totalStatPoints - usedPoints

	return {
		level,
		basePoints,
		levelIncreasePoints,
		level305Bonus,
		totalStatPoints,
		usedPoints,
		availableStatPoints,
	}
}
