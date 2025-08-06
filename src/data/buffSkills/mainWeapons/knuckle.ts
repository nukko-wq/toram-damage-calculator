import type { BuffSkillDefinition } from '@/types/buffSkill'

export const knuckleSkills: BuffSkillDefinition[] = [
	// マスタリ
	{
		id: 'Ms-Marchal',
		name: 'マーシャルマスタリ',
		category: 'mastery',
		type: 'level',
		maxLevel: 10,
		order: 101,
	},
	{
		id: 'Ms-Shield',
		name: 'シールドマスタリ',
		category: 'mastery',
		type: 'toggle',
		order: 103,
	},

	// ブレードスキル
	{
		id: 'sm3-1',
		name: 'バーサーク',
		category: 'blade',
		type: 'toggle',
		order: 203,
	},

	// マーシャルスキル
	{
		id: 'ma1',
		name: '体術鍛錬',
		category: 'martial',
		type: 'level',
		maxLevel: 10,
		order: 501,
	},
	{
		id: 'ma2-1',
		name: '強力な追撃',
		category: 'martial',
		type: 'level',
		maxLevel: 10,
		order: 502,
	},
	{
		id: 'ma2',
		name: 'アシュラオーラ',
		category: 'martial',
		type: 'toggle',
		order: 503,
	},

	// モノノフスキル
	{
		id: 'sm1-1',
		name: '両手持ち',
		category: 'mononofu',
		type: 'toggle',
		order: 603,
	},

	// クラッシャースキル
	{
		id: 'ma1',
		name: '破壊者',
		category: 'crusher',
		type: 'toggle',
		order: 801,
	},
	{
		id: 'cr1',
		name: 'ゴッドハンド',
		category: 'crusher',
		type: 'level',
		maxLevel: 3,
		order: 802,
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
