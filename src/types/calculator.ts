// 武器種の定義
export type WeaponType =
	| '片手剣'
	| '双剣'
	| '両手剣'
	| '手甲'
	| '旋風槍'
	| '抜刀剣'
	| '弓'
	| '自動弓'
	| '杖'
	| '魔導具'
	| '素手'

// サブ武器種の定義
export type SubWeaponType = 'ナイフ' | '矢' | 'なし'

// 基本ステータス
export interface BaseStats {
	STR: number
	INT: number
	VIT: number
	AGI: number
	DEX: number
	CRT: number
	MEN: number
	TEC: number
	level: number
}

// 装備プロパティ
export interface EquipmentProperties {
	'ATK%': number
	ATK: number
	'MATK%': number
	MATK: number
	'武器ATK%': number
	武器ATK: number
	'物理貫通%': number
	'魔法貫通%': number
	'属性有利%': number
	'抜刀威力%': number
	抜刀威力: number
	'近距離威力%': number
	'遠距離威力%': number
	'クリティカルダメージ%': number
	クリティカルダメージ: number
	'クリティカル率%': number
	クリティカル率: number
	'安定率%': number
	'HP%': number
	HP: number
	MP: number
	'STR%': number
	STR: number
	'INT%': number
	INT: number
	'VIT%': number
	VIT: number
	'AGI%': number
	AGI: number
	'DEX%': number
	DEX: number
	'命中%': number
	命中: number
	'回避%': number
	回避: number
	'攻撃速度%': number
	攻撃速度: number
	'詠唱速度%': number
	詠唱速度: number
}

// メイン武器
export interface MainWeapon {
	weaponType: WeaponType
	ATK: number
	stability: number
	refinement: number
}

// サブ武器
export interface SubWeapon {
	weaponType: SubWeaponType
	refinement: number
}

// 装備アイテム
export interface Equipment {
	name: string
	properties: Partial<EquipmentProperties>
	presetId?: string | null // プリセット装備のID（プリセット選択時のみ）
}

// 装備タイプ
export type EquipmentType = 'weapon' | 'armor' | 'accessory' | 'fashion'

// 装備カテゴリ
export type EquipmentCategory = 
	| 'main' 
	| 'body' 
	| 'additional' 
	| 'special' 
	| 'subWeapon' 
	| 'fashion1' 
	| 'fashion2' 
	| 'fashion3'

// プリセット装備
export interface PresetEquipment {
	id: string
	name: string
	type: EquipmentType
	category: EquipmentCategory[]
	baseStats: {
		ATK?: number
		DEF?: number
		MATK?: number
		MDEF?: number
		stability?: number
		refinement?: number
	}
	properties: Partial<EquipmentProperties>
	description?: string
	source?: string // 入手方法
}

// クリスタル種別
export type CrystalType = 'weapon' | 'armor' | 'additional' | 'special' | 'normal'

// プリセットクリスタル
export interface PresetCrystal {
	id: string
	name: string
	type: CrystalType
	properties: Partial<EquipmentProperties>
	description?: string
}

// 装備スロット
export interface EquipmentSlots {
	main: Equipment
	body: Equipment
	additional: Equipment
	special: Equipment
	subWeapon: Equipment
	fashion1: Equipment
	fashion2: Equipment
	fashion3: Equipment
}

// クリスタルスロット（選択されたクリスタルのIDを保存）
export interface CrystalSlots {
	weapon1: string | null
	weapon2: string | null
	armor1: string | null
	armor2: string | null
	additional1: string | null
	additional2: string | null
	special1: string | null
	special2: string | null
}

// 敵の情報
export interface EnemyInfo {
	DEF: number
	MDEF: number
	level: number
	guaranteedCritical: number
	freeValue: number
}

// 計算機の全データ
export interface CalculatorData {
	baseStats: BaseStats
	mainWeapon: MainWeapon
	subWeapon: SubWeapon
	equipment: EquipmentSlots
	crystals: CrystalSlots
	enemy: EnemyInfo
}

// 計算結果
export interface CalculationResult {
	totalStats: BaseStats & Partial<EquipmentProperties>
	damage: {
		normal: number
		skill: number
		critical: number
	}
}
