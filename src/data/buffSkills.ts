import type { BuffSkillDefinition, MainWeaponType } from '@/types/buffSkill'

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
		order: 301,
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
		order: 603,
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
		order: 2101,
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
		category: 'battle',
		type: 'level',
		maxLevel: 10,
		order: 2203,
	},
	{
		id: 'exATK1',
		name: '攻撃力up',
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
		name: '魔法力up',
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
		order: 302,
		requirements: [
			{
				exclude: {
					mainWeapon: ['bareHands'],
				},
			},
		],
	},
]

// 武器固有スキル定義
export const WEAPON_SPECIFIC_SKILLS: Record<
	MainWeaponType,
	BuffSkillDefinition[]
> = {
	oneHandSword: [
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
			order: 704,
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
	],

	dualSword: [
		// マスタリ
		{
			id: 'Ms-blade',
			name: 'ブレードマスタリ',
			category: 'mastery',
			type: 'level',
			maxLevel: 10,
			order: 101,
		},
		{
			id: 'DSpena1',
			name: 'デュアルマスタリ',
			category: 'mastery',
			type: 'level',
			order: 102,
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
			id: '4-DS',
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

		// デュアルソードスキル
		{
			id: 'DSpena2',
			name: '双剣の鍛錬',
			category: 'dualSword',
			type: 'level',
			order: 803,
		},
		{
			id: 'ds1-1',
			name: '神速の軌跡',
			category: 'dualSword',
			type: 'level',
			order: 704,
		},
		{
			id: '2-DSeclair',
			name: 'フィロエクレール',
			category: 'dualSword',
			type: 'toggle',
			order: 805,
		},
		{
			id: 'ds3',
			name: 'シュツルムリーパー',
			category: 'dualSword',
			type: 'level',
			maxLevel: 100,
			order: 806,
		},
		{
			id: 'ds4',
			name: 'パリングソード',
			category: 'dualSword',
			type: 'level',
			order: 707,
		},
		{
			id: 'ds5',
			name: 'ツインスラッシュ',
			category: 'dualSword',
			type: 'toggle',
			order: 708,
		},
		{
			id: 'ds6',
			name: 'セイバーオーラ',
			category: 'dualSword',
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
					name: 'カウント数',
					min: 1,
					max: 100,
					default: 100,
					unit: '',
				},
			},
			order: 809,
		},
		{
			id: 'ds7',
			name: 'アークセイバー',
			category: 'dualSword',
			type: 'level',
			order: 810,
		},
	],

	twoHandSword: [
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
			order: 704,
		},

		// マジックブレードスキル
		{
			id: 'oh3',
			name: 'コンバージョン',
			category: 'magicBlade',
			type: 'toggle',
			order: 1002,
		},
	],

	knuckle: [
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
			order: 501,
		},
		{
			id: 'ma2-1',
			name: '強力な追撃',
			category: 'martial',
			type: 'level',
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
			order: 704,
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
	],

	halberd: [
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
			order: 704,
		},
	],

	katana: [
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
	],

	bow: [
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
			order: 704,
		},
	],

	bowgun: [
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
	],

	staff: [
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
	],

	magicDevice: [
		// マスタリ
		{
			id: 'Ms-magic',
			name: 'マジックマスタリ',
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
	],

	bareHands: [
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
	],
}

// サブ武器特殊スキル
export const SUB_WEAPON_SKILLS: Record<string, BuffSkillDefinition[]> = {
	arrow: [
		{
			id: 'bw1',
			name: 'パライズショット',
			category: 'shoot',
			type: 'toggle',
			order: 303,
			requirements: [
				{
					mainWeapon: ['oneHandSword', 'halberd', 'staff'],
				},
			],
		},
	],

	magicDevice: [
		{
			id: 'mg2',
			name: '急速チャージ',
			category: 'magic',
			type: 'stack',
			maxStack: 15,
			order: 401,
		},
		{
			id: 'mw1',
			name: 'P:コンバージョン',
			category: 'magicBlade',
			type: 'toggle',
			order: 1003,
		},
		{
			id: 'mw2',
			name: 'エンチャントバースト',
			category: 'magicBlade',
			type: 'toggle',
			order: 1004,
		},
		{
			id: 'mw3',
			name: 'デュアルブリンガー-旧',
			category: 'magicBlade',
			type: 'toggle',
			order: 1005,
		},
		{
			id: 'mw4',
			name: 'レゾナンス？',
			category: 'magicBlade',
			type: 'level',
			order: 1006,
		},
	],

	scroll: [
		{
			id: 'ninja1',
			name: '風遁の術',
			category: 'ninja',
			type: 'toggle',
			order: 1905,
			requirements: [
				{
					mainWeapon: ['oneHandSword', 'katana', 'staff', 'magicDevice'],
				},
			],
		},
	],

	bowSpecial: [
		{
			id: 'sm3-1',
			name: 'バーサーク',
			category: 'blade',
			type: 'toggle',
			order: 208,
			categoryOrder: 1,
		},
		{
			id: 'hunter5-1',
			name: 'フォーカス',
			category: 'hunter',
			type: 'level',
			order: 1702,
			categoryOrder: 1,
		},
	],
}
