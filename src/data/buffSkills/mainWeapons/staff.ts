import type { BuffSkillDefinition } from '@/types/buffSkill'

export const staffSkills: BuffSkillDefinition[] = [
	// マスタリ
	{
		id: 'Ms-magic',
		name: 'マジックマスタリ',
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

	// マジックスキル
	{
		id: 'mg5',
		name: 'チェインキャスト',
		category: 'magic',
		type: 'level',
		order: 401,
	},
	{
		id: 'mg2',
		name: '急速チャージ',
		category: 'magic',
		type: 'stack',
		maxStack: 15,
		order: 402,
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
		id: 'mg1',
		name: '魔術の導',
		category: 'wizard',
		type: 'level',
		order: 1202,
	},
	{
		id: 'mg4',
		name: 'キャストマスタリ',
		category: 'wizard',
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
				name: 'ウィザードスキル習得数',
				min: 0,
				max: 14,
				default: 14,
				unit: '個',
			},
			param3: {
				name: '使用全スキルポイント',
				min: 64,
				max: 150,
				default: 150,
				unit: 'pt',
			},
		},
		order: 1203,
	},
	{
		id: 'mg3',
		name: 'ファミリア',
		category: 'wizard',
		type: 'level',
		order: 1204,
	},
	{
		id: 'mg1',
		name: 'オーバーリミット',
		category: 'wizard',
		type: 'level',
		order: 1205,
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
