import type {
	BaseStats,
	MainWeapon,
	SubWeapon,
	Equipment,
	EquipmentSlots,
	CrystalSlots,
	FoodFormData,
	SaveDataEnemyInfo,
	RegisterFormData,
	RegisterEffect,
	CalculatorData,
	EquipmentProperties,
	PowerOptions,
	OtherOptions,
	OptionTabType,
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
	level: 1,
})

export const createInitialMainWeapon = (): MainWeapon => ({
	weaponType: '素手',
	ATK: 5,
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
	properties: createInitialEquipmentProperties(),
	isPreset: false,
	isCustom: true,
	isFavorite: false,
	isModified: false,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
})

// 装備なしを表現する空の装備オブジェクト
export const createEmptyEquipment = (): Equipment => ({
	id: '',
	name: '',
	properties: createInitialEquipmentProperties(),
	isPreset: true,
	isFavorite: false,
	isModified: false,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
})

export const createInitialEquipmentSlots = (): EquipmentSlots => ({
	mainWeapon: createEmptyEquipment(),
	body: createEmptyEquipment(),
	additional: createEmptyEquipment(),
	special: createEmptyEquipment(),
	subWeapon: createEmptyEquipment(),
	fashion1: createEmptyEquipment(),
	fashion2: createEmptyEquipment(),
	fashion3: createEmptyEquipment(),
	freeInput1: createEmptyEquipment(),
	freeInput2: createEmptyEquipment(),
	freeInput3: createEmptyEquipment(),
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

// 料理システムの初期値
export const createInitialFoodFormData = (): FoodFormData => ({
	slot1: { selectedFood: 'none', level: 0 },
	slot2: { selectedFood: 'none', level: 0 },
	slot3: { selectedFood: 'none', level: 0 },
	slot4: { selectedFood: 'none', level: 0 },
	slot5: { selectedFood: 'none', level: 0 },
})

// 敵情報システムの初期値（個別セーブデータ用）
export const createInitialSaveDataEnemyInfo = (): SaveDataEnemyInfo => ({
	selectedEnemyId: '2b981c85-54f5-4c67-bac1-0e9cba4bdeb2', // ラフィー
	enemyType: 'preset',
	lastSelectedAt: new Date().toISOString(),
})

// レジスタ他システムの初期値
export const createInitialRegisterFormData = (): RegisterFormData => {
	const effects: RegisterEffect[] = [
		// レジスタレット効果
		{
			id: 'physicalAttackUp',
			name: '物理攻撃アップ',
			type: 'physicalAttackUp',
			isEnabled: false,
			level: 30,
			maxLevel: 30,
		},
		{
			id: 'magicalAttackUp',
			name: '魔法攻撃アップ',
			type: 'magicalAttackUp',
			isEnabled: false,
			level: 30,
			maxLevel: 30,
		},
		{
			id: 'maxHpUp',
			name: '最大HPアップ',
			type: 'maxHpUp',
			isEnabled: false,
			level: 100,
			maxLevel: 100,
		},
		{
			id: 'maxMpUp',
			name: '最大MPアップ',
			type: 'maxMpUp',
			isEnabled: false,
			level: 100,
			maxLevel: 100,
		},
		{
			id: 'accuracyUp',
			name: '命中アップ',
			type: 'accuracyUp',
			isEnabled: false,
			level: 10,
			maxLevel: 10,
		},
		{
			id: 'evasionUp',
			name: '回避アップ',
			type: 'evasionUp',
			isEnabled: false,
			level: 10,
			maxLevel: 10,
		},
		{
			id: 'attackSpeedUp',
			name: '攻撃速度アップ',
			type: 'attackSpeedUp',
			isEnabled: false,
			level: 100,
			maxLevel: 100,
		},
		{
			id: 'magicalSpeedUp',
			name: '魔法速度アップ',
			type: 'magicalSpeedUp',
			isEnabled: false,
			level: 100,
			maxLevel: 100,
		},
		{
			id: 'fateCompanionship',
			name: '運命共同体',
			type: 'fateCompanionship',
			isEnabled: false,
			level: 1,
			maxLevel: 1,
			partyMembers: 3,
		},
		{
			id: 'voidStance',
			name: '無の構え',
			type: 'voidStance',
			isEnabled: false,
			level: 10,
			maxLevel: 10,
		},
		{
			id: 'arrowPursuit',
			name: '術式アロー・追撃',
			type: 'arrowPursuit',
			isEnabled: false,
			level: 4,
			maxLevel: 4,
		},
		{
			id: 'airSlideCompress',
			name: 'エアスライド・圧縮',
			type: 'airSlideCompress',
			isEnabled: false,
			level: 10,
			maxLevel: 10,
		},
		{
			id: 'assassinStabEnhance',
			name: 'アサシンスタブ・強化',
			type: 'assassinStabEnhance',
			isEnabled: false,
			level: 10,
			maxLevel: 10,
		},
		{
			id: 'resonancePower',
			name: 'レゾナンス・火力',
			type: 'resonancePower',
			isEnabled: false,
			level: 9,
			maxLevel: 9,
		},
		{
			id: 'resonanceAcceleration',
			name: 'レゾナンス・加速',
			type: 'resonanceAcceleration',
			isEnabled: false,
			level: 9,
			maxLevel: 9,
		},
		{
			id: 'resonanceConcentration',
			name: 'レゾナンス・集中',
			type: 'resonanceConcentration',
			isEnabled: false,
			level: 9,
			maxLevel: 9,
		},
		// ギルド料理効果
		{
			id: 'deliciousIngredientTrade',
			name: 'おいしい食材取引',
			type: 'deliciousIngredientTrade',
			isEnabled: false,
			level: 10,
			maxLevel: 10,
		},
		{
			id: 'freshFruitTrade',
			name: '新鮮な果物取引',
			type: 'freshFruitTrade',
			isEnabled: false,
			level: 10,
			maxLevel: 10,
		},
	]

	return { effects }
}

// レジスタ効果の移行用関数（既存セーブデータに新効果を追加）
export const migrateRegisterEffects = (
	existingData: RegisterFormData,
): RegisterFormData => {
	const currentEffects = createInitialRegisterFormData().effects
	const existingEffects = existingData.effects || []

	// 既存効果をIDでマップ化
	const existingEffectMap = new Map(
		existingEffects.map((effect) => [effect.id, effect]),
	)

	// 新しい効果配列を作成（既存効果を保持し、不足分を補完）
	const migratedEffects = currentEffects.map((currentEffect) => {
		// 既存データにある場合はそれを使用、ない場合は新規効果を追加
		return existingEffectMap.get(currentEffect.id) || currentEffect
	})

	return { effects: migratedEffects }
}

// 攻撃スキル初期データ作成
export const createInitialAttackSkillFormData =
	(): import('@/types/calculator').AttackSkillFormData => ({
		selectedSkillId: null,
		calculatedData: null,
		lastCalculatedAt: undefined,
	})

// 威力オプション初期データ作成
export const createInitialPowerOptions = (): PowerOptions => ({
	bossDifficulty: 'normal',
	skillDamage: 'all',
	elementAttack: 'advantageous',
	combo: false,
	damageType: 'white',
	distance: 'disabled',
	elementPower: 'enabled',
	unsheathe: false,
})

export const createInitialOtherOptions = (): OtherOptions => ({
	// 敵状態異常
	enemyStatusDestroy: 'none',
	enemyStatusWeaken: 'none',
	enemyStatusBlind: 'none',

	// スキル
	skillPowerHit: 'inactive',
	skillConcentration: 'inactive',

	// 倍率
	passiveMultiplier: {
		mode: 'auto',
		value: 0,
	},
	braveMultiplier: {
		mode: 'auto',
		value: 0,
	},
})

export const createInitialCalculatorData = (): CalculatorData => ({
	baseStats: createInitialBaseStats(),
	mainWeapon: createInitialMainWeapon(),
	subWeapon: createInitialSubWeapon(),
	equipment: createInitialEquipmentSlots(),
	crystals: createInitialCrystalSlots(),
	food: createInitialFoodFormData(), // 料理システム
	enemy: createInitialSaveDataEnemyInfo(), // 新しい敵情報システム
	buffSkills: getDefaultBuffSkillFormData(), // バフスキルシステム
	buffItems: getDefaultBuffItems(), // バフアイテムシステム
	register: createInitialRegisterFormData(), // レジスタ他システム
	attackSkill: createInitialAttackSkillFormData(), // 攻撃スキルシステム
	powerOptions: createInitialPowerOptions(), // 威力オプション設定
	otherOptions: createInitialOtherOptions(), // その他オプション設定
	optionTab: 'power' as OptionTabType, // オプションタブ状態（デフォルトは威力オプション）
	adaptationMultiplier: 100, // 慣れ倍率のデフォルト値 (100%)
})
