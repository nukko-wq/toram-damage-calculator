import type { BuffSkill, BuffSkillFormData } from '@/types/calculator'

// バフスキルのデフォルトデータ
export const getDefaultBuffSkills = (): BuffSkill[] => [
	// マスタリスキル
	{
		id: 'halberd_mastery',
		name: 'ハルバードマスタリ',
		category: 'mastery',
		isEnabled: false,
		parameters: { skillLevel: 10 },
	},
	{
		id: 'blade_mastery',
		name: 'ブレードマスタリ',
		category: 'mastery',
		isEnabled: false,
		parameters: { skillLevel: 10 },
	},
	{
		id: 'shoot_mastery',
		name: 'シュートマスタリ',
		category: 'mastery',
		isEnabled: false,
		parameters: { skillLevel: 10 },
	},
	{
		id: 'magic_mastery',
		name: 'マジックマスタリ',
		category: 'mastery',
		isEnabled: false,
		parameters: { skillLevel: 10 },
	},
	{
		id: 'martial_mastery',
		name: 'マーシャルマスタリ',
		category: 'mastery',
		isEnabled: false,
		parameters: { skillLevel: 10 },
	},
	{
		id: 'dual_mastery',
		name: 'デュアルマスタリ',
		category: 'mastery',
		isEnabled: false,
		parameters: { skillLevel: 10 },
	},
	{
		id: 'shield_mastery',
		name: 'シールドマスタリ',
		category: 'mastery',
		isEnabled: false,
		parameters: { skillLevel: 10 },
	},

	// ブレードスキル
	{
		id: 'war_cry',
		name: 'ウォークライ',
		category: 'blade',
		isEnabled: false,
		parameters: {},
	},
	{
		id: 'berserk',
		name: 'バーサーク',
		category: 'blade',
		isEnabled: false,
		parameters: {},
	},

	// シュートスキル
	{
		id: 'samurai_archery',
		name: '武士弓術',
		category: 'shoot',
		isEnabled: false,
		parameters: {},
	},
	{
		id: 'long_range',
		name: 'ロングレンジ',
		category: 'shoot',
		isEnabled: false,
		parameters: { skillLevel: 10 },
	},

	// ハルバードスキル
	{
		id: 'quick_aura',
		name: 'クイックオーラ',
		category: 'halberd',
		isEnabled: false,
		parameters: { skillLevel: 10 },
	},
	{
		id: 'critical_parry',
		name: '会心の捌き',
		category: 'halberd',
		isEnabled: false,
		parameters: {},
	},
	{
		id: 'tornado_lance',
		name: 'トルネードランス',
		category: 'halberd',
		isEnabled: false,
		parameters: { stackCount: 1 },
	},
	{
		id: 'godspeed_parry',
		name: '神速の捌手',
		category: 'halberd',
		isEnabled: false,
		parameters: { stackCount: 1 },
	},
	{
		id: 'thor_hammer',
		name: 'トールハンマー',
		category: 'halberd',
		isEnabled: false,
		parameters: {},
	},

	// モノノフスキル
	{
		id: 'bushido',
		name: '武士道',
		category: 'mononofu',
		isEnabled: false,
		parameters: { skillLevel: 10 },
	},
	{
		id: 'clear_mind',
		name: '明鏡止水',
		category: 'mononofu',
		isEnabled: false,
		parameters: { skillLevel: 10 },
	},
	{
		id: 'two_handed',
		name: '両手持ち',
		category: 'mononofu',
		isEnabled: false,
		parameters: {},
	},
	{
		id: 'superhuman_strength',
		name: '怪力乱神',
		category: 'mononofu',
		isEnabled: false,
		parameters: { skillLevel: 10 },
	},

	// デュアルソードスキル
	{
		id: 'godspeed_trajectory',
		name: '神速の軌跡',
		category: 'dualSword',
		isEnabled: false,
		parameters: { skillLevel: 10 },
	},
	{
		id: 'filo_eclair',
		name: 'フィロエクレール',
		category: 'dualSword',
		isEnabled: false,
		parameters: { skillLevel: 10 },
	},

	// スプライトスキル
	{
		id: 'enhance',
		name: 'エンハンス',
		category: 'sprite',
		isEnabled: false,
		parameters: {},
	},
	{
		id: 'stabilize',
		name: 'スタピリス',
		category: 'sprite',
		isEnabled: false,
		parameters: {},
	},
	{
		id: 'prière',
		name: 'プリエール',
		category: 'sprite',
		isEnabled: false,
		parameters: {},
	},

	// ダークパワースキル
	{
		id: 'eternal_nightmare',
		name: 'エターナルナイトメア',
		category: 'darkPower',
		isEnabled: false,
		parameters: { skillLevel: 10, spUsed: 25 },
	},

	// シールドスキル
	{
		id: 'protection',
		name: 'プロテクション',
		category: 'shield',
		isEnabled: false,
		parameters: {},
	},
	{
		id: 'aegis',
		name: 'イージス',
		category: 'shield',
		isEnabled: false,
		parameters: {},
	},

	// ナイトスキル
	{
		id: 'knight_pledge',
		name: 'ナイトプレッジ',
		category: 'knight',
		isEnabled: false,
		parameters: { skillLevel: 10, playerCount: 0, refinement: 1 },
	},

	// ハンタースキル
	{
		id: 'camouflage',
		name: 'カムフラージュ',
		category: 'hunter',
		isEnabled: false,
		parameters: { skillLevel: 10 },
	},

	// アサシンスキル
	{
		id: 'seeker_rius',
		name: 'シーカーリウス',
		category: 'assassin',
		isEnabled: false,
		parameters: {},
	},
	{
		id: 'assassination_mastery',
		name: '暗殺の極意',
		category: 'assassin',
		isEnabled: false,
		parameters: {},
	},

	// ニンジャスキル
	{
		id: 'nindo',
		name: '忍道',
		category: 'ninja',
		isEnabled: false,
		parameters: { skillLevel: 10 },
	},
	{
		id: 'ninjutsu',
		name: '忍術',
		category: 'ninja',
		isEnabled: false,
		parameters: { skillLevel: 10 },
	},
	{
		id: 'ninjutsu_training_1',
		name: '忍術鍛錬Ⅰ',
		category: 'ninja',
		isEnabled: false,
		parameters: { skillLevel: 10 },
	},
	{
		id: 'ninjutsu_training_2',
		name: '忍術鍛錬Ⅱ',
		category: 'ninja',
		isEnabled: false,
		parameters: { skillLevel: 10 },
	},

	// サポートスキル
	{
		id: 'brave',
		name: 'ブレイブ',
		category: 'support',
		isEnabled: false,
		parameters: { isCaster: 0 },
	},
	{
		id: 'high_cycle',
		name: 'ハイサイクル',
		category: 'support',
		isEnabled: false,
		parameters: {},
	},
	{
		id: 'quick_motion',
		name: 'クイックモーション',
		category: 'support',
		isEnabled: false,
		parameters: {},
	},
	{
		id: 'mana_recharge',
		name: 'マナリチャージ',
		category: 'support',
		isEnabled: false,
		parameters: {},
	},

	// サバイバルスキル
	{
		id: 'mp_boost',
		name: 'MPブースト',
		category: 'survival',
		isEnabled: false,
		parameters: { skillLevel: 10 },
	},

	// バトルスキル
	{
		id: 'spell_burst',
		name: 'スペルバースト',
		category: 'battle',
		isEnabled: false,
		parameters: {},
	},
	{
		id: 'critical_up',
		name: 'クリティカルUP',
		category: 'battle',
		isEnabled: false,
		parameters: {},
	},
	{
		id: 'hp_boost',
		name: 'HPブースト',
		category: 'battle',
		isEnabled: false,
		parameters: { skillLevel: 10 },
	},
	{
		id: 'attack_up',
		name: '攻撃力UP',
		category: 'battle',
		isEnabled: false,
		parameters: { skillLevel: 10 },
	},
	{
		id: 'threatening_power',
		name: '脅威の威力',
		category: 'battle',
		isEnabled: false,
		parameters: { skillLevel: 10 },
	},
	{
		id: 'magic_up',
		name: '魔法力UP',
		category: 'battle',
		isEnabled: false,
		parameters: { skillLevel: 10 },
	},
	{
		id: 'more_magic',
		name: '更なるまりょく',
		category: 'battle',
		isEnabled: false,
		parameters: { skillLevel: 10 },
	},
	{
		id: 'accuracy_up',
		name: '命中UP',
		category: 'battle',
		isEnabled: false,
		parameters: { skillLevel: 10 },
	},
	{
		id: 'dodge_up',
		name: '回避UP',
		category: 'battle',
		isEnabled: false,
		parameters: { skillLevel: 10 },
	},

	// ペット使用スキル（赤バフ）
	{
		id: 'brave_up',
		name: 'ブレイブアップ',
		category: 'pet',
		isEnabled: false,
		parameters: {},
	},
	{
		id: 'mind_up',
		name: 'マインドアップ',
		category: 'pet',
		isEnabled: false,
		parameters: {},
	},
	{
		id: 'cut_up',
		name: 'カットアップ',
		category: 'pet',
		isEnabled: false,
		parameters: {},
	},
	{
		id: 'critical_up_pet',
		name: 'クリティカルアップ',
		category: 'pet',
		isEnabled: false,
		parameters: {},
	},

	// ミンストレルスキル
	{
		id: 'passion_song',
		name: '熱情の歌',
		category: 'minstrel',
		isEnabled: false,
		parameters: { stackCount: 1 },
	},

	// パルチザンスキル
	{
		id: 'front_maintenance_2',
		name: '前線維持Ⅱ',
		category: 'partisan',
		isEnabled: false,
		parameters: { skillLevel: 10 },
	},
]

// デフォルトバフスキルフォームデータを生成
export const getDefaultBuffSkillFormData = (): BuffSkillFormData => ({
	skills: getDefaultBuffSkills(),
})

// 武器種からマスタリスキルIDを取得するマッピング
export const weaponTypeToMasterySkills: Record<string, string[]> = {
	素手: ['shield_mastery'],
	片手剣: ['blade_mastery', 'shield_mastery'],
	双剣: ['blade_mastery', 'dual_mastery'],
	両手剣: ['blade_mastery'],
	手甲: ['martial_mastery', 'shield_mastery'],
	旋風槍: ['halberd_mastery'],
	抜刀剣: [], // 該当するマスタリスキルなし
	弓: ['shoot_mastery'],
	自動弓: ['shoot_mastery', 'shield_mastery'],
	杖: ['magic_mastery', 'shield_mastery'],
	魔導具: ['magic_mastery'],
}

// 武器種から専用スキルIDを取得するマッピング
export const weaponTypeToSpecialSkills: Record<string, string[]> = {
	素手: [],
	片手剣: [],
	双剣: [],
	両手剣: [],
	手甲: [],
	旋風槍: ['thor_hammer'], // トールハンマー
	抜刀剣: [],
	弓: [],
	自動弓: [],
	杖: [],
	魔導具: [],
}

// 武器種専用スキルIDのリスト（フィルタリング用）
export const weaponSpecificSkillIds = ['thor_hammer']

// スキルIDからデフォルトパラメータを取得
export const getDefaultParametersForSkill = (skillId: string) => {
	const masteryDefaults = { skillLevel: 10 }
	const emptyDefaults = {}
	const levelDefaults = { skillLevel: 10 }
	const stackDefaults = { stackCount: 1 }
	const knightDefaults = { skillLevel: 10, playerCount: 0, refinement: 1 }
	const eternalDefaults = { skillLevel: 10, spUsed: 25 }
	const braveDefaults = { isCaster: 0 }

	const skillDefaults: Record<string, any> = {
		// マスタリスキル
		halberd_mastery: masteryDefaults,
		blade_mastery: masteryDefaults,
		shoot_mastery: masteryDefaults,
		magic_mastery: masteryDefaults,
		martial_mastery: masteryDefaults,
		dual_mastery: masteryDefaults,
		shield_mastery: masteryDefaults,

		// レベルを持つスキル
		long_range: levelDefaults,
		quick_aura: levelDefaults,
		bushido: levelDefaults,
		clear_mind: levelDefaults,
		superhuman_strength: levelDefaults,
		godspeed_trajectory: levelDefaults,
		filo_eclair: levelDefaults,
		camouflage: levelDefaults,
		nindo: levelDefaults,
		ninjutsu: levelDefaults,
		ninjutsu_training_1: levelDefaults,
		ninjutsu_training_2: levelDefaults,
		mp_boost: levelDefaults,
		hp_boost: levelDefaults,
		attack_up: levelDefaults,
		threatening_power: levelDefaults,
		magic_up: levelDefaults,
		more_magic: levelDefaults,
		accuracy_up: levelDefaults,
		dodge_up: levelDefaults,
		front_maintenance_2: levelDefaults,

		// 重ねがけ数を持つスキル
		tornado_lance: stackDefaults,
		godspeed_parry: stackDefaults,
		passion_song: stackDefaults,

		// 特殊パラメータを持つスキル
		knight_pledge: knightDefaults,
		eternal_nightmare: eternalDefaults,
		brave: braveDefaults,
	}

	return skillDefaults[skillId] || emptyDefaults
}

// スキルカテゴリの日本語名マッピング
export const categoryNameMap = {
	mastery: 'マスタリスキル',
	blade: 'ブレードスキル',
	shoot: 'シュートスキル',
	halberd: 'ハルバードスキル',
	mononofu: 'モノノフスキル',
	dualSword: 'デュアルソードスキル',
	sprite: 'スプライトスキル',
	darkPower: 'ダークパワースキル',
	shield: 'シールドスキル',
	knight: 'ナイトスキル',
	hunter: 'ハンタースキル',
	assassin: 'アサシンスキル',
	ninja: 'ニンジャスキル',
	support: 'サポートスキル',
	survival: 'サバイバルスキル',
	battle: 'バトルスキル',
	pet: 'ペット使用スキル（赤バフ）',
	minstrel: 'ミンストレルスキル',
	partisan: 'パルチザンスキル',
} as const
