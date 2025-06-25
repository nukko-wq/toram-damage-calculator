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
				id: "2b981c85-54f5-4c67-bac1-0e9cba4bdeb2",
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
				id: "ffc25bc7-9085-4959-9f4a-dedd996bef9d",
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
				id: "f92e54d6-1261-4b22-89b5-289f3d10051b",
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
				id: "1e4c89e3-217e-4cc1-be50-ac6f6174d2fa",
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
				id: "560e477a-d2e5-4d9f-8d64-f5748050d155",
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
				id: "6576de23-fb13-4e33-b2df-f64a5f65f520",
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
				id: "83b50518-c3e0-40ca-91a8-4caa2ca8643f",
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
				id: "090db7b6-3b78-4d55-8102-88b81151c85b",
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
				id: "ca10a211-71b5-4683-811e-3e09457edbe3",
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
				id: "1a1674ab-7118-4667-b457-903841462889",
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