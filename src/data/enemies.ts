/**
 * 敵情報プリセットデータ（TypeScript版）
 * 
 * 型安全性とエディタ補完により開発効率を向上
 * EnemyStatsインターフェースによる厳密な型チェック
 */

import type { EnemyCategory, PresetEnemy } from '@/types/calculator'

// 敵情報データの型定義
interface EnemiesData {
	enemies: Record<EnemyCategory, PresetEnemy[]>
}

// 敵情報プリセットデータ
export const enemiesData: EnemiesData = {
	enemies: {
		mob: [
			{
				id: "000",
				name: "ラフィー",
				level: 1,
				stats: {
					DEF: 0,
					MDEF: 0,
					physicalResistance: 0,
					magicalResistance: 0,
					resistCritical: 0,
					requiredHIT: 0
				},
				category: "mob"
			},
			{
				id: "001",
				name: "エンバブ",
				level: 143,
				stats: {
					DEF: 143,
					MDEF: 143,
					physicalResistance: 0,
					magicalResistance: 0,
					resistCritical: 0,
					requiredHIT: 0
				},
				category: "mob"
			}
		],
		fieldBoss: [
			{
				id: "002",
				name: "リリカロラ",
				level: 278,
				stats: {
					DEF: 1251,
					MDEF: 1251,
					physicalResistance: 11,
					magicalResistance: 11,
					resistCritical: 0,
					requiredHIT: 0
				},
				category: "fieldBoss"
			},
			{
				id: "003",
				name: "ドリドディ",
				level: 296,
				stats: {
					DEF: 1658,
					MDEF: 1658,
					physicalResistance: 14,
					magicalResistance: 14,
					resistCritical: 0,
					requiredHIT: 0
				},
				category: "fieldBoss"
			},
			{
				id: "004",
				name: "カレリーフ",
				level: 305,
				stats: {
					DEF: 915,
					MDEF: 1526,
					physicalResistance: 14,
					magicalResistance: 14,
					resistCritical: 0,
					requiredHIT: 0
				},
				category: "fieldBoss"
			},
			{
				id: "005",
				name: "ダンドリオン",
				level: 308,
				stats: {
					DEF: 1077,
					MDEF: 770,
					physicalResistance: 24,
					magicalResistance: 12,
					resistCritical: 0,
					requiredHIT: 0
				},
				category: "fieldBoss"
			}
		],
		boss: [
			{
				id: "006",
				name: "ピヌグールガ",
				level: 286,
				stats: {
					DEF: 1144,
					MDEF: 715,
					physicalResistance: 15,
					magicalResistance: 10,
					resistCritical: 0,
					requiredHIT: 0
				},
				category: "boss"
			},
			{
				id: "007",
				name: "バクザン",
				level: 292,
				stats: {
					DEF: 1460,
					MDEF: 584,
					physicalResistance: 10,
					magicalResistance: 10,
					resistCritical: 0,
					requiredHIT: 0
				},
				category: "boss"
			}
		],
		raidBoss: [
			{
				id: "008",
				name: "竜骨の魔人",
				level: 0, // nullから0に変更（型安全性のため）
				stats: {
					DEF: 0, // nullから0に変更（型安全性のため）
					MDEF: 0, // nullから0に変更（型安全性のため）
					physicalResistance: 0, // nullから0に変更（型安全性のため）
					magicalResistance: 0, // nullから0に変更（型安全性のため）
					resistCritical: 0,
					requiredHIT: 0
				},
				category: "raidBoss"
			},
			{
				id: "009",
				name: "赫灼のセルディテ",
				level: 0, // nullから0に変更（型安全性のため）
				stats: {
					DEF: 0, // nullから0に変更（型安全性のため）
					MDEF: 0, // nullから0に変更（型安全性のため）
					physicalResistance: 0, // nullから0に変更（型安全性のため）
					magicalResistance: 0, // nullから0に変更（型安全性のため）
					resistCritical: 0,
					requiredHIT: 0
				},
				category: "raidBoss"
			}
		]
	}
} as const

// 後方互換性のためのエクスポート
export default enemiesData