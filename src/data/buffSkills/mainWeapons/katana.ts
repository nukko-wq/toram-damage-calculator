import type { BuffSkillDefinition } from '@/types/buffSkill'

export const katanaSkills: BuffSkillDefinition[] = [
	// マスタリ
	{
		id: 'Ms-Mononof',
		name: '武士道',
		category: 'mastery',
		type: 'level',
		order: 101,
	},

	// モノノフスキル
	{
		id: 'mf1-2',
		name: '明鏡止水',
		category: 'mononofu',
		type: 'level',
		order: 805,
	},
	{
		id: 'mf3',
		name: '不撓不屈',
		category: 'mononofu',
		type: 'level',
		maxLevel: 100,
		order: 606,
	},
	{
		id: 'sm1-2',
		name: '両手持ち',
		category: 'mononofu',
		type: 'toggle',
		order: 707,
	},
	{
		id: 'mf2',
		name: '画竜点睛',
		category: 'mononofu',
		type: 'level',
		maxLevel: 10,
		order: 708,
	},
]