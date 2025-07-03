/**
 * ボス戦難易度計算ユーティリティ
 */

import type { BossDifficulty, EnemyStats } from '@/types/calculator'

/**
 * 難易度別レベル補正値を取得
 */
export function getDifficultyLevelBonus(difficulty: BossDifficulty): number {
	switch (difficulty) {
		case 'normal':
			return 0
		case 'hard':
			return 10
		case 'lunatic':
			return 20
		case 'ultimate':
			return 40
	}
}

/**
 * 難易度別DEF/MDEF倍率を取得
 */
export function getDifficultyDefMultiplier(difficulty: BossDifficulty): number {
	switch (difficulty) {
		case 'normal':
			return 1
		case 'hard':
			return 2
		case 'lunatic':
			return 4
		case 'ultimate':
			return 6
	}
}

/**
 * ボス難易度に基づいてステータスを調整
 */
export function calculateBossDifficultyStats(
	baseLevel: number,
	baseStats: EnemyStats,
	difficulty: BossDifficulty,
): { level: number; stats: EnemyStats } {
	const adjustedLevel = baseLevel + getDifficultyLevelBonus(difficulty)
	const defMultiplier = getDifficultyDefMultiplier(difficulty)

	return {
		level: adjustedLevel,
		stats: {
			...baseStats,
			DEF: Math.floor(baseStats.DEF * defMultiplier),
			MDEF: Math.floor(baseStats.MDEF * defMultiplier),
		},
	}
}