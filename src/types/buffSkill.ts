// バフスキルシステムの型定義

export interface BuffSkillFormData {
	skills: Record<string, BuffSkillState> // スキルID → 状態のマップ
}

export interface BuffSkillState {
	isEnabled: boolean // オン/オフ状態
	level?: number // スキルレベル（1-10, 1-15, 1-100等）
	stackCount?: number // 重ねがけ数（×3, ×10, ×15等）
	multiParam1?: number // multiParamタイプ用（パラメータ1）
	multiParam2?: number // multiParamタイプ用（パラメータ2）
	multiParam3?: number // multiParamタイプ用（パラメータ3）
	specialParam?: number // 特殊パラメータ（プレイヤー数、精錬値等）
}

export interface MultiParamConfig {
	param1: {
		name: string // パラメータ名（例: "スキルレベル"）
		min: number // 最小値
		max: number // 最大値
		default: number // デフォルト値
		unit?: string // 単位（例: "Lv", "個", "pt"）
	}
	param2: {
		name: string
		min: number
		max: number
		default: number
		unit?: string
	}
	param3?: {
		name: string
		min: number
		max: number
		default: number
		unit?: string
	}
}

export interface BuffSkillDefinition {
	id: string // data-key値（IsWarcry, mg4等）
	name: string // 表示名（ウォークライ、チェインキャスト等）
	category: BuffSkillCategory // スキル系統
	type: BuffSkillType // スキルタイプ
	order: number // 表示順序番号（昇順ソート用）
	categoryOrder?: number // カテゴリ内順序番号（省略時はorder使用）
	maxLevel?: number // 最大レベル（デフォルト10）
	maxStack?: number // 最大重ねがけ数
	multiParams?: MultiParamConfig // multiParamタイプ用
	description?: string // 説明文
	requirements?: WeaponRequirement[] // 武器要件
}

export type BuffSkillType =
	| 'toggle' // ON/OFF切り替えのみ
	| 'level' // レベル設定（1-10等）
	| 'stack' // 重ねがけ設定（×3, ×10等）
	| 'multiParam' // 複数パラメータ設定（キャストマスタリ、セイバーオーラ等）
	| 'special' // 特殊パラメータ付き

export type BuffSkillCategory =
	| 'mastery'
	| 'blade'
	| 'shoot'
	| 'martial'
	| 'halberd'
	| 'mononofu'
	| 'dualSword'
	| 'crusher'
	| 'sprite'
	| 'magicBlade'
	| 'priest'
	| 'wizard'
	| 'magic'
	| 'darkPower'
	| 'shield'
	| 'knight'
	| 'hunter'
	| 'assassin'
	| 'ninja'
	| 'support'
	| 'survival'
	| 'battle'
	| 'pet'
	| 'minstrel'
	| 'partisan'

export interface WeaponRequirement {
	mainWeapon?: MainWeaponType | MainWeaponType[]
	subWeapon?: SubWeaponType | SubWeaponType[]
	exclude?: {
		mainWeapon?: MainWeaponType[]
		subWeapon?: SubWeaponType[]
	}
}

export type MainWeaponType =
	| 'oneHandSword'
	| 'dualSword'
	| 'twoHandSword'
	| 'knuckle'
	| 'halberd'
	| 'katana'
	| 'bow'
	| 'bowgun'
	| 'staff'
	| 'magicDevice'
	| 'bareHands'

export type SubWeaponType =
	| 'none'
	| 'knife'
	| 'arrow'
	| 'shield'
	| 'knuckle'
	| 'magicDevice'
	| 'scroll'

// カテゴリ別順序番号範囲
export const CATEGORY_ORDER_RANGES = {
	mastery: 100, // 100-199: マスタリスキル
	blade: 200, // 200-299: ブレードスキル
	shoot: 300, // 300-399: シュートスキル
	magic: 400, // 400-499: マジックスキル
	martial: 500, // 500-599: マーシャルスキル
	halberd: 600, // 600-699: ハルバードスキル
	mononofu: 700, // 700-799: モノノフスキル
	dualSword: 800, // 800-899: デュアルソードスキル
	crusher: 900, // 900-999: クラッシャースキル
	sprite: 1000, // 1000-1099: スプライトスキル
	magicBlade: 1100, // 1100-1199: マジックブレードスキル
	priest: 1200, // 1200-1299: プリーストスキル
	wizard: 1300, // 1300-1399: ウィザードスキル
	darkPower: 1400, // 1400-1499: ダークパワースキル
	shield: 1500, // 1500-1599: シールドスキル
	knight: 1600, // 1600-1699: ナイトスキル
	hunter: 1700, // 1700-1799: ハンタースキル
	assassin: 1800, // 1800-1899: アサシンスキル
	ninja: 1900, // 1900-1999: ニンジャスキル
	support: 2000, // 2000-2099: サポートスキル
	survival: 2100, // 2100-2199: サバイバルスキル
	battle: 2200, // 2200-2299: バトルスキル
	pet: 2300, // 2300-2399: ペット使用スキル
	minstrel: 2400, // 2400-2499: ミンストレルスキル
	partisan: 2500, // 2500-2599: パルチザンスキル
} as const

// カテゴリラベル
export const CATEGORY_LABELS: Record<BuffSkillCategory, string> = {
	mastery: 'マスタリスキル',
	blade: 'ブレードスキル',
	shoot: 'シュートスキル',
	martial: 'マーシャルスキル',
	halberd: 'ハルバードスキル',
	mononofu: 'モノノフスキル',
	dualSword: 'デュアルソードスキル',
	crusher: 'クラッシャースキル',
	sprite: 'スプライトスキル',
	magicBlade: 'マジックブレードスキル',
	priest: 'プリーストスキル',
	wizard: 'ウィザードスキル',
	magic: 'マジックスキル',
	darkPower: 'ダークパワースキル',
	shield: 'シールドスキル',
	knight: 'ナイトスキル',
	hunter: 'ハンタースキル',
	assassin: 'アサシンスキル',
	ninja: 'ニンジャスキル',
	support: 'サポートスキル',
	survival: 'サバイバルスキル',
	battle: 'バトルスキル',
	pet: 'ペット使用スキル',
	minstrel: 'ミンストレルスキル',
	partisan: 'パルチザンスキル',
}

// 順序番号生成ヘルパー
export function getSkillOrder(category: BuffSkillCategory, index: number): number {
	return CATEGORY_ORDER_RANGES[category] + index + 1
}

// 効果的な順序番号を取得
export function getEffectiveOrder(skill: BuffSkillDefinition): number {
	return skill.categoryOrder ?? skill.order
}