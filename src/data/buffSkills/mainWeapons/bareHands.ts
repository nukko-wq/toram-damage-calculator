import type { BuffSkillDefinition } from '@/types/buffSkill'

export const bareHandsSkills: BuffSkillDefinition[] = [
	// マスタリ
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
