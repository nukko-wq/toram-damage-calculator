import type { BuffSkillDefinition } from '@/types/buffSkill'

export const oneHandSwordSkills: BuffSkillDefinition[] = [
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
		id: 'sm5',
		name: 'P:オーラブレード',
		category: 'blade',
		type: 'level',
		order: 205,
	},
	{
		id: '4-OH',
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

	// マーシャルスキル
	{
		id: 'ma2-2',
		name: '強力な追撃',
		category: 'martial',
		type: 'level',
		order: 501,
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
		id: 'MagicWarrior',
		name: '魔法戦士の心得',
		category: 'magicBlade',
		type: 'level',
		order: 1001,
	},
	{
		id: 'oh3',
		name: 'コンバージョン',
		category: 'magicBlade',
		type: 'toggle',
		order: 1002,
	},

	// ウィザードスキル
	{
		id: 'mg3',
		name: 'ファミリア',
		category: 'wizard',
		type: 'level',
		order: 1201,
	},

	// シールドスキル
	{
		id: 'shield1',
		name: 'フォースシールド',
		category: 'shield',
		type: 'level',
		order: 1503,
	},
	{
		id: 'shield2',
		name: 'マジカルシールド',
		category: 'shield',
		type: 'level',
		order: 1504,
	},
]