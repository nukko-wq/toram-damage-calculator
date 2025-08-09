import type { BuffSkillDefinition } from '@/types/buffSkill'

export const halberdSkills: BuffSkillDefinition[] = [
	// マスタリ
	{
		id: 'Ms-halberd',
		name: 'ハルバードマスタリ',
		category: 'mastery',
		type: 'level',
		maxLevel: 10,
		order: 101,
	},

	// ブレードスキル
	{
		id: 'sm3-1',
		name: 'バーサーク',
		category: 'blade',
		type: 'toggle',
		order: 203,
	},

	// ハルバードスキル
	{
		id: 'hb1',
		name: 'クイックオーラ',
		category: 'halberd',
		type: 'level',
		maxLevel: 10,
		order: 501,
		requirements: [
			{
				mainWeapon: 'halberd',
			},
		],
	},
	{
		id: 'hb2',
		name: '会心の捌き',
		category: 'halberd',
		type: 'toggle',
		order: 502,
		requirements: [
			{
				mainWeapon: 'halberd',
			},
		],
	},
	{
		id: 'hb3',
		name: 'トルネードランス',
		category: 'halberd',
		type: 'stack',
		maxStack: 10,
		order: 503,
		requirements: [
			{
				mainWeapon: 'halberd',
			},
		],
	},

	// モノノフスキル
	{
		id: 'sm1-1',
		name: '両手持ち',
		category: 'mononofu',
		type: 'toggle',
		order: 603,
	},
]
