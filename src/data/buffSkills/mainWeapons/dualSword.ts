import type { BuffSkillDefinition } from '@/types/buffSkill'

export const dualSwordSkills: BuffSkillDefinition[] = [
	// マスタリ
	{
		id: 'Ms-blade',
		name: 'ブレードマスタリ',
		category: 'mastery',
		type: 'level',
		maxLevel: 10,
		order: 101,
	},
	{
		id: 'DSpena1',
		name: 'デュアルマスタリ',
		category: 'mastery',
		type: 'level',
		order: 102,
	},

	// ブレードスキル
	{
		id: 'sm2',
		name: '素早い斬撃',
		category: 'blade',
		type: 'level',
		maxLevel: 10,
		order: 202,
	},
	{
		id: 'sm3-2',
		name: 'バーサーク',
		category: 'blade',
		type: 'toggle',
		order: 203,
	},
	{
		id: 'sm4',
		name: '匠の剣術',
		category: 'blade',
		type: 'toggle',
		order: 204,
	},
	{
		id: '4-DS',
		name: 'オーラブレード',
		category: 'blade',
		type: 'toggle',
		order: 206,
	},
	{
		id: '5-BusterBlade',
		name: 'バスターブレード',
		category: 'blade',
		type: 'toggle',
		order: 207,
	},

	// デュアルソードスキル
	{
		id: 'DSpena2',
		name: '双剣の鍛錬',
		category: 'dualSword',
		type: 'level',
		order: 803,
	},
	{
		id: '2-DSeclair',
		name: 'フィロエクレール',
		category: 'dualSword',
		type: 'toggle',
		order: 805,
	},
	{
		id: 'ds3',
		name: 'シュツルムリーパー',
		category: 'dualSword',
		type: 'level',
		maxLevel: 100,
		order: 806,
	},
	{
		id: 'ds4',
		name: 'パリングソード',
		category: 'dualSword',
		type: 'level',
		order: 707,
	},
	{
		id: 'ds5',
		name: 'ツインスラッシュ',
		category: 'dualSword',
		type: 'toggle',
		order: 708,
	},
	{
		id: 'ds6',
		name: 'セイバーオーラ',
		category: 'dualSword',
		type: 'multiParam',
		multiParams: {
			param1: {
				name: 'スキルレベル',
				min: 1,
				max: 10,
				default: 10,
				unit: 'Lv',
			},
			param2: {
				name: 'カウント数',
				min: 1,
				max: 100,
				default: 100,
				unit: '',
			},
		},
		order: 809,
	},
	{
		id: 'ds7',
		name: 'アークセイバー',
		category: 'dualSword',
		type: 'level',
		order: 810,
	},
]