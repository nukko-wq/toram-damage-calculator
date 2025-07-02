/**
 * レイドボス レベル調整計算ユーティリティ
 */

import type { EnemyStats } from '@/types/calculator'

/**
 * レイドボス レベル調整時のステータス計算
 */
export function calculateRaidBossStats(raidBossId: string, level: number): EnemyStats {
	switch (raidBossId) {
		case 'ca10a211-71b5-4683-811e-3e09457edbe3': // 竜骨の魔人
			return {
				DEF: Math.floor((level * 3) / 4),
				MDEF: Math.floor((level * 3) / 2),
				physicalResistance: Math.floor(level / 10),
				magicalResistance: Math.floor(25 + level / 10),
				resistCritical: 0, // 確定クリティカル、ユーザー調整可能
				requiredHIT: Math.floor((level * 3) / 2), // FLEE値
			}

		case '1a1674ab-7118-4667-b457-903841462889': // 赫灼のセルディテ
			return {
				DEF: Math.floor((level * 5) / 4),
				MDEF: Math.floor((level * 5) / 4),
				physicalResistance: Math.floor(20 + level / 10),
				magicalResistance: Math.floor(level / 10),
				resistCritical: 0, // 確定クリティカル、ユーザー調整可能
				requiredHIT: 0, // FLEE値不明のため0、ユーザー入力可能
			}

		case 'ice-bison-uuid': // 氷岩のバイソン
			return {
				DEF: Math.floor((level * 3) / 2),
				MDEF: Math.floor((level * 3) / 4),
				physicalResistance: Math.floor(25 + level / 10),
				magicalResistance: Math.floor(level / 10),
				resistCritical: 0, // 確定クリティカル、ユーザー調整可能
				requiredHIT: Math.floor((level * 3) / 2),
			}

		case 'thunder-nguruma-uuid': // 轟雷のングルマ
			return {
				DEF: Math.floor(level * 1),
				MDEF: Math.floor((level * 1) / 4),
				physicalResistance: Math.floor(15 + level / 10),
				magicalResistance: Math.floor(15 + level / 10),
				resistCritical: 0, // 確定クリティカル、ユーザー調整可能
				requiredHIT: Math.floor(level * 3),
			}

		case 'earthquake-chimera-uuid': // 震巌のキマイラ
			return {
				DEF: Math.floor(level * 2),
				MDEF: Math.floor(level * 1),
				physicalResistance: Math.floor(10 + level / 10),
				magicalResistance: Math.floor(20 + level / 10),
				resistCritical: 0, // 確定クリティカル、ユーザー調整可能
				requiredHIT: Math.floor((level * 1) / 2),
			}

		default:
			// 未定義のレイドボスの場合はデフォルト値
			return {
				DEF: 0,
				MDEF: 0,
				physicalResistance: 0,
				magicalResistance: 0,
				resistCritical: 0,
				requiredHIT: 0,
			}
	}
}

/**
 * 赫灼のセルディテかどうかを判定
 */
export function isSelditeFLEEUnknown(raidBossId: string): boolean {
	return raidBossId === '1a1674ab-7118-4667-b457-903841462889'
}