import type { BuffSkillDefinition } from '@/types/buffSkill'

// 共通バフスキル（35個）- 全武器種で使用可能
export const COMMON_BUFF_SKILLS: BuffSkillDefinition[] = [
	// ブレードスキル
	{
		id: 'IsWarcry',
		name: 'ウォークライ',
		category: 'blade',
		type: 'toggle',
		order: 201,
	},

	// シュートスキル
	{
		id: 'LongRange',
		name: 'ロングレンジ',
		category: 'shoot',
		type: 'level',
		maxLevel: 10,
		order: 302,
	},

	// ハルバードスキル
	{
		id: 'hb1',
		name: 'クイックオーラ',
		category: 'halberd',
		type: 'level',
		maxLevel: 10,
		order: 601,
	},
	{
		id: 'godspeed_parry',
		name: '神速の捌手',
		category: 'halberd',
		type: 'stack',
		maxStack: 3,
		order: 602,
	},

	// モノノフスキル
	{
		id: 'Mononof',
		name: '武士道',
		category: 'mononofu',
		type: 'level',
		maxLevel: 10,
		order: 601,
		requirements: [
			{
				exclude: {
					mainWeapon: ['katana'],
				},
			},
		],
	},
	{
		id: 'mf1-1',
		name: '明鏡止水',
		category: 'mononofu',
		type: 'level',
		maxLevel: 10,
		order: 602,
	},
	{
		id: 'mf1',
		name: '怪力乱神',
		category: 'mononofu',
		type: 'level',
		maxLevel: 10,
		order: 704,
	},

	// デュアルソードスキル
	{
		id: 'ds1-2',
		name: '神速の軌跡',
		category: 'dualSword',
		type: 'level',
		maxLevel: 10,
		order: 801,
	},
	{
		id: 'ds1',
		name: 'フィロエクレール',
		category: 'dualSword',
		type: 'level',
		maxLevel: 10,
		order: 802,
	},

	// スプライトスキル
	{
		id: 'IsEnhance',
		name: 'エンハンス',
		category: 'sprite',
		type: 'toggle',
		order: 801,
	},
	{
		id: 'IsStabilis',
		name: 'スタビリス',
		category: 'sprite',
		type: 'toggle',
		order: 902,
	},

	// プリーストスキル
	{
		id: 'IsPriere',
		name: 'プリエール',
		category: 'priest',
		type: 'toggle',
		order: 1101,
	},

	// ダークパワースキル
	{
		id: 'dp1',
		name: 'エターナルナイトメア',
		category: 'darkPower',
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
				name: 'スキルポイント合計',
				min: 25,
				max: 80,
				default: 80,
				unit: 'pt',
			},
		},
		order: 1401,
	},

	// シールドスキル
	{
		id: 'IsProtect',
		name: 'プロテクション',
		category: 'shield',
		type: 'toggle',
		order: 1501,
	},
	{
		id: 'IsAegis',
		name: 'イージス',
		category: 'shield',
		type: 'toggle',
		order: 1502,
	},

	// ナイトスキル
	{
		id: 'knight5-3',
		name: 'ナイトプレッジ',
		category: 'knight',
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
				name: 'バフエリア内のプレイヤーの数',
				min: 0,
				max: 4,
				default: 4,
				unit: '人',
			},
			param3: {
				name: '盾の精錬値',
				min: 0,
				max: 15,
				default: 15,
				unit: '',
			},
		},
		order: 1601,
	},

	// ハンタースキル
	{
		id: 'hunter5-2',
		name: 'カムフラージュ',
		category: 'hunter',
		type: 'level',
		maxLevel: 10,
		order: 1701,
	},

	// アサシンスキル
	{
		id: 'oh1-2',
		name: 'シーカーリウス',
		category: 'assassin',
		type: 'toggle',
		order: 1801,
	},
	{
		id: 'assassin5-1',
		name: '暗殺の極意',
		category: 'assassin',
		type: 'toggle',
		order: 1802,
	},

	// ニンジャスキル
	{
		id: 'mf2',
		name: '忍道',
		category: 'ninja',
		type: 'level',
		maxLevel: 10,
		order: 1901,
	},
	{
		id: 'ninja0',
		name: '忍術',
		category: 'ninja',
		type: 'level',
		maxLevel: 10,
		order: 1902,
	},
	{
		id: 'ninja1',
		name: '忍術鍛錬Ⅰ',
		category: 'ninja',
		type: 'level',
		maxLevel: 10,
		order: 1903,
	},
	{
		id: 'ninja2',
		name: '忍術鍛錬Ⅱ',
		category: 'ninja',
		type: 'level',
		maxLevel: 10,
		order: 1904,
	},

	// サポートスキル
	{
		id: 'IsBrave',
		name: 'ブレイブオーラ',
		category: 'support',
		type: 'multiParam',
		multiParams: {
			param1: {
				name: 'バフ使用者タイプ',
				min: 1,
				max: 2,
				default: 2,
				unit: '',
			},
		},
		order: 2001,
	},
	{
		id: 'IsHighCycle',
		name: 'ハイサイクル',
		category: 'support',
		type: 'toggle',
		order: 2002,
	},
	{
		id: 'IsQuickMotion',
		name: 'クイックモーション',
		category: 'support',
		type: 'toggle',
		order: 2003,
	},
	{
		id: 'IsManaReCharge',
		name: 'マナリチャージ',
		category: 'support',
		type: 'toggle',
		order: 2004,
	},

	// サバイバルスキル
	{
		id: 'oh2',
		name: 'MPブースト',
		category: 'survival',
		type: 'level',
		maxLevel: 10,
		order: 2102,
	},

	// バトルスキル
	{
		id: 'sf1',
		name: 'スペルバースト',
		category: 'battle',
		type: 'toggle',
		order: 2201,
	},
	{
		id: 'oh1',
		name: 'クリティカルup',
		category: 'battle',
		type: 'toggle',
		order: 2202,
	},
	{
		id: 'oh4',
		name: 'HPブースト',
		category: 'survival',
		type: 'level',
		maxLevel: 10,
		order: 2101,
	},
	{
		id: 'exATK1',
		name: '攻撃力UP',
		category: 'battle',
		type: 'level',
		maxLevel: 10,
		order: 2204,
	},
	{
		id: 'exATK2',
		name: '驚異の威力',
		category: 'battle',
		type: 'level',
		maxLevel: 10,
		order: 2205,
	},
	{
		id: 'exMATK1',
		name: '魔法力UP',
		category: 'battle',
		type: 'level',
		maxLevel: 10,
		order: 2206,
	},
	{
		id: 'exMATK2',
		name: '更なる魔力',
		category: 'battle',
		type: 'level',
		maxLevel: 10,
		order: 2207,
	},
	{
		id: 'exHIT',
		name: '命中UP',
		category: 'battle',
		type: 'level',
		maxLevel: 10,
		order: 2208,
	},
	{
		id: 'exFREE',
		name: '回避UP',
		category: 'battle',
		type: 'level',
		maxLevel: 10,
		order: 2209,
	},

	// ペット使用スキル(赤バフ)
	{
		id: 'IsPetBrave',
		name: 'ブレイブアップ',
		category: 'pet',
		type: 'toggle',
		order: 2301,
	},
	{
		id: 'IsPetMind',
		name: 'マインドアップ',
		category: 'pet',
		type: 'toggle',
		order: 2302,
	},
	{
		id: 'IsPetCut',
		name: 'カットアップ',
		category: 'pet',
		type: 'toggle',
		order: 2303,
	},
	{
		id: 'IsPetCri',
		name: 'クリティカルアップ',
		category: 'pet',
		type: 'toggle',
		order: 2304,
	},

	// ミンストレルスキル
	{
		id: 'IsHotKnows',
		name: '熱情の歌',
		category: 'minstrel',
		type: 'stack',
		maxStack: 10,
		order: 2401,
	},

	// パルチザンスキル
	{
		id: 'pal1',
		name: '前線維持Ⅱ',
		category: 'partisan',
		type: 'level',
		maxLevel: 10,
		order: 2501,
	},
]

// ほぼ共通スキル（素手以外）
export const NEARLY_COMMON_SKILLS: BuffSkillDefinition[] = [
	{
		id: 'ar1',
		name: '武士弓術',
		category: 'shoot',
		type: 'toggle',
		order: 301,
		requirements: [
			{
				exclude: {
					mainWeapon: ['bareHands'],
				},
			},
		],
	},
]