import type { BuffSkillDefinition } from '@/types/buffSkill'

export const bowgunSkills: BuffSkillDefinition[] = [
	// マスタリ
	{
		id: 'Ms-shoot',
		name: 'シュートマスタリ',
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

	// シュートスキル
	{
		id: 'bw1',
		name: 'パライズショット',
		category: 'shoot',
		type: 'toggle',
		order: 309,
	},

	// マーシャルスキル
	{
		id: 'ma2-2',
		name: '強力な追撃',
		category: 'martial',
		type: 'level',
		order: 501,
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

	// ハンタースキル
	{
		id: 'sh1',
		name: 'ボウガンハンター',
		category: 'hunter',
		type: 'toggle',
		order: 1703,
	},
	{
		id: 'hunter5-3',
		name: '狩人の知識',
		category: 'hunter',
		type: 'level',
		order: 1704,
	},
	{
		id: 'hunter5-1',
		name: 'フォーカス',
		category: 'hunter',
		type: 'level',
		order: 1705,
	},
]