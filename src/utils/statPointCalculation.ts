/**
 * ステータスポイント計算ロジック
 * 
 * レベルに応じたステータスポイントの計算を行う
 * 詳細な計算式は docs/calculations/basic-stats.md を参照
 */

export interface StatPointCalculationSteps {
	level: number
	basePoints: number
	levelIncreasePoints: number
	level305Bonus: number
	totalStatPoints: number
}

/**
 * ステータスポイント計算
 * @param level キャラクターレベル
 * @returns ステータスポイント計算結果
 */
export function calculateStatPoints(level: number): StatPointCalculationSteps {
	// 基本ポイント（レベル1時）
	const basePoints = 172

	// レベル増加ポイント（レベル-1）× 2
	const levelIncreasePoints = (level - 1) * 2

	// レベル305ボーナス
	const level305Bonus = level >= 305 ? 5 : 0

	// 総ステータスポイント
	const totalStatPoints = basePoints + levelIncreasePoints + level305Bonus

	return {
		level,
		basePoints,
		levelIncreasePoints,
		level305Bonus,
		totalStatPoints,
	}
}