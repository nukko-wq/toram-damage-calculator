import type { BuffSkillDefinition } from '@/types/buffSkill'

export const twoHandSwordSkills: BuffSkillDefinition[] = [
	// マスタリ
	{
		id: 'Ms-blade',
		name: 'ブレードマスタリ',
		category: 'mastery',
		type: 'level',
		maxLevel: 10,
		order: 101,
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
		id: 'sm3-3',
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
		id: '4-TH',
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
	{
		id: 'sm1',
		name: 'オーガスラッシュ',
		category: 'blade',
		type: 'stack',
		maxStack: 10,
		order: 209,
	},

	// モノノフスキル
	{
		id: 'sm1-1',
		name: '両手持ち',
		category: 'mononofu',
		type: 'toggle',
		order: 603,
	},

	// マジックブレードスキル
	{
		id: 'oh3',
		name: 'コンバージョン',
		category: 'magicBlade',
		type: 'toggle',
		order: 1002,
	},
]
