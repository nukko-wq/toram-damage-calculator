import type { BuffSkillDefinition } from '@/types/buffSkill'

export const bowSkills: BuffSkillDefinition[] = [
	// マスタリ
	{
		id: 'Ms-shoot',
		name: 'シュートマスタリ',
		category: 'mastery',
		type: 'level',
		maxLevel: 10,
		order: 101,
	},

	// シュートスキル
	{
		id: 'ar2',
		name: '武士弓術',
		category: 'shoot',
		type: 'toggle',
		order: 302,
	},
	{
		id: 'ar3',
		name: 'パワーショット',
		category: 'shoot',
		type: 'level',
		maxLevel: 10,
		order: 303,
	},
	{
		id: 'ar4',
		name: 'スナイプ10',
		category: 'shoot',
		type: 'level',
		order: 304,
	},
	{
		id: 'ar5',
		name: 'モータルブロー',
		category: 'shoot',
		type: 'toggle',
		order: 305,
	},
	{
		id: 'ar6',
		name: 'サクリファイスショット',
		category: 'shoot',
		type: 'toggle',
		order: 306,
	},
	{
		id: 'ar7',
		name: 'シャープネイル',
		category: 'shoot',
		type: 'level',
		order: 307,
	},
	{
		id: 'ar8',
		name: 'イーグルアイ',
		category: 'shoot',
		type: 'level',
		order: 308,
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