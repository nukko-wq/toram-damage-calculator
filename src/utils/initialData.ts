import type {
	BaseStats,
	MainWeapon,
	SubWeapon,
	Equipment,
	EquipmentSlots,
	CrystalSlots,
	FoodFormData,
	EnemyInfo,
	EnemyFormData,
	BuffSkillFormData,
	BuffItemFormData,
	CalculatorData,
	EquipmentProperties,
} from '@/types/calculator'
import { getDefaultBuffSkillFormData } from './buffSkillDefaults'
import { getDefaultBuffItems } from './buffItemDefaults'

export const createInitialBaseStats = (): BaseStats => ({
	STR: 1,
	INT: 1,
	VIT: 1,
	AGI: 1,
	DEX: 1,
	CRT: 1,
	MEN: 1,
	TEC: 1,
	LUK: 1,
	level: 1,
})

export const createInitialMainWeapon = (): MainWeapon => ({
	weaponType: '素手',
	ATK: 0,
	stability: 0,
	refinement: 0,
})

export const createInitialSubWeapon = (): SubWeapon => ({
	weaponType: 'なし',
	ATK: 0,
	stability: 0,
	refinement: 0,
})

export const createInitialEquipmentProperties =
	(): Partial<EquipmentProperties> => ({
		// 基本攻撃力系
		ATK_Rate: 0,
		ATK: 0,
		MATK_Rate: 0,
		MATK: 0,
		WeaponATK_Rate: 0,
		WeaponATK: 0,

		// 防御力系
		DEF_Rate: 0,
		DEF: 0,
		MDEF_Rate: 0,
		MDEF: 0,

		// 貫通系
		PhysicalPenetration_Rate: 0,
		MagicalPenetration_Rate: 0,
		ElementAdvantage_Rate: 0,

		// 威力系
		UnsheatheAttack_Rate: 0,
		UnsheatheAttack: 0,
		ShortRangeDamage_Rate: 0,
		LongRangeDamage_Rate: 0,

		// クリティカル系
		CriticalDamage_Rate: 0,
		CriticalDamage: 0,
		Critical_Rate: 0,
		Critical: 0,

		// 安定率
		Stability_Rate: 0,

		// HP/MP系
		HP_Rate: 0,
		HP: 0,
		MP_Rate: 0,
		MP: 0,

		// ステータス系
		STR_Rate: 0,
		STR: 0,
		INT_Rate: 0,
		INT: 0,
		VIT_Rate: 0,
		VIT: 0,
		AGI_Rate: 0,
		AGI: 0,
		DEX_Rate: 0,
		DEX: 0,
		CRT_Rate: 0,
		CRT: 0,
		MEN_Rate: 0,
		MEN: 0,
		TEC_Rate: 0,
		TEC: 0,
		LUK_Rate: 0,
		LUK: 0,

		// 命中・回避系
		Accuracy_Rate: 0,
		Accuracy: 0,
		Dodge_Rate: 0,
		Dodge: 0,

		// 速度系
		AttackSpeed_Rate: 0,
		AttackSpeed: 0,
		CastingSpeed_Rate: 0,
		CastingSpeed: 0,
		MotionSpeed_Rate: 0,
	})

export const createInitialEquipment = (): Equipment => ({
	id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
	name: '',
	type: 'weapon',
	category: ['main'],
	baseStats: {},
	properties: createInitialEquipmentProperties(),
	isPreset: false,
	isCustom: true,
	isFavorite: false,
	isModified: false,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
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
	freeInput1: createInitialEquipment(),
	freeInput2: createInitialEquipment(),
	freeInput3: createInitialEquipment(),
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

// 料理システムの初期値
export const createInitialFoodFormData = (): FoodFormData => ({
	slot1: { selectedFood: 'none', level: 0 },
	slot2: { selectedFood: 'none', level: 0 },
	slot3: { selectedFood: 'none', level: 0 },
	slot4: { selectedFood: 'none', level: 0 },
	slot5: { selectedFood: 'none', level: 0 },
})

// 新しい敵情報システムの初期値
export const createInitialEnemyFormData = (): EnemyFormData => ({
	selectedId: null,
	type: null,
	manualOverrides: {
		resistCritical: 0,
		requiredHIT: 0,
	},
})

export const createInitialCalculatorData = (): CalculatorData => ({
	baseStats: createInitialBaseStats(),
	mainWeapon: createInitialMainWeapon(),
	subWeapon: createInitialSubWeapon(),
	equipment: createInitialEquipmentSlots(),
	crystals: createInitialCrystalSlots(),
	food: createInitialFoodFormData(), // 料理システム
	enemy: createInitialEnemyFormData(), // 新しい敵情報システム
	buffSkills: getDefaultBuffSkillFormData(), // バフスキルシステム
	buffItems: getDefaultBuffItems(), // バフアイテムシステム
	legacyEnemy: createInitialEnemyInfo(), // 後方互換性
})
