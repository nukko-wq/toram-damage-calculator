import {
	BaseStats,
	MainWeapon,
	SubWeapon,
	Equipment,
	EquipmentSlots,
	CrystalSlots,
	EnemyInfo,
	CalculatorData,
	EquipmentProperties,
} from '@/types/calculator'

export const createInitialBaseStats = (): BaseStats => ({
	STR: 0,
	INT: 0,
	VIT: 0,
	AGI: 0,
	DEX: 0,
	CRT: 0,
	MEN: 0,
	TEC: 0,
	level: 1,
})

export const createInitialMainWeapon = (): MainWeapon => ({
	weaponType: 'なし',
	ATK: 0,
	stability: 0,
	refinement: 0,
})

export const createInitialSubWeapon = (): SubWeapon => ({
	weaponType: 'なし',
	refinement: 0,
})

export const createInitialEquipmentProperties =
	(): Partial<EquipmentProperties> => ({
		'ATK%': 0,
		ATK: 0,
		'MATK%': 0,
		MATK: 0,
		'武器ATK%': 0,
		武器ATK: 0,
		'物理貫通%': 0,
		'魔法貫通%': 0,
		'属性有利%': 0,
		'抜刀威力%': 0,
		抜刀威力: 0,
		'近距離威力%': 0,
		'遠距離威力%': 0,
		'クリティカルダメージ%': 0,
		クリティカルダメージ: 0,
		'クリティカル率%': 0,
		クリティカル率: 0,
		'安定率%': 0,
		'HP%': 0,
		HP: 0,
		MP: 0,
		'STR%': 0,
		STR: 0,
		'INT%': 0,
		INT: 0,
		'VIT%': 0,
		VIT: 0,
		'AGI%': 0,
		AGI: 0,
		'DEX%': 0,
		DEX: 0,
		'命中%': 0,
		命中: 0,
		'回避%': 0,
		回避: 0,
		'攻撃速度%': 0,
		攻撃速度: 0,
		'詠唱速度%': 0,
		詠唱速度: 0,
	})

export const createInitialEquipment = (): Equipment => ({
	name: '',
	properties: createInitialEquipmentProperties(),
})

export const createInitialEquipmentSlots = (): EquipmentSlots => ({
	main: createInitialEquipment(),
	body: createInitialEquipment(),
	additional: createInitialEquipment(),
	special: createInitialEquipment(),
	subWeapon: createInitialEquipment(),
	fashion1: createInitialEquipment(),
	fashion2: createInitialEquipment(),
	fashion3: createInitialEquipment(),
})

export const createInitialCrystalSlots = (): CrystalSlots => ({
	weapon1: null,
	weapon2: null,
	armor1: null,
	armor2: null,
	additional1: null,
	additional2: null,
	special1: null,
	special2: null,
})

export const createInitialEnemyInfo = (): EnemyInfo => ({
	DEF: 0,
	MDEF: 0,
	level: 1,
	guaranteedCritical: 0,
	freeValue: 0,
})

export const createInitialCalculatorData = (): CalculatorData => ({
	baseStats: createInitialBaseStats(),
	mainWeapon: createInitialMainWeapon(),
	subWeapon: createInitialSubWeapon(),
	equipment: createInitialEquipmentSlots(),
	crystals: createInitialCrystalSlots(),
	enemy: createInitialEnemyInfo(),
})
