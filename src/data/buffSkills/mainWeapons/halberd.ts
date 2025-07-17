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
		id: 'hb2',
		name: '会心の捌き',
		category: 'halberd',
		type: 'toggle',
		order: 503,
	},
	{
		id: 'hb3',
		name: 'トルネードランス',
		category: 'halberd',
		type: 'level',
		maxLevel: 10,
		order: 704,
	},
	{
		id: 'hb1',
		name: 'トールハンマー',
		category: 'halberd',
		type: 'toggle',
		order: 606,
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