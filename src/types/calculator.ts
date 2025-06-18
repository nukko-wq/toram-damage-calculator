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
	LUK: number
	level: number
}

// 装備プロパティ（技術仕様書 4.1.5 に基づく完全定義）
export interface EquipmentProperties {
	// 基本攻撃力系
	ATK_Rate: number // ATK%
	ATK: number // ATK
	MATK_Rate: number // MATK%
	MATK: number // MATK
	WeaponATK_Rate: number // 武器ATK%
	WeaponATK: number // 武器ATK

	// 防御力系
	DEF_Rate: number // DEF%
	DEF: number // DEF
	MDEF_Rate: number // MDEF%
	MDEF: number // MDEF

	// 貫通系
	PhysicalPenetration_Rate: number // 物理貫通%
	MagicalPenetration_Rate: number // 魔法貫通%
	ElementAdvantage_Rate: number // 属性有利%

	// 威力系
	UnsheatheAttack_Rate: number // 抜刀威力%
	UnsheatheAttack: number // 抜刀威力
	ShortRangeDamage_Rate: number // 近距離威力%
	LongRangeDamage_Rate: number // 遠距離威力%

	// クリティカル系
	CriticalDamage_Rate: number // クリティカルダメージ%
	CriticalDamage: number // クリティカルダメージ
	Critical_Rate: number // クリティカル率%
	Critical: number // クリティカル率

	// 安定率
	Stability_Rate: number // 安定率%

	// HP/MP系
	HP_Rate: number // HP%
	HP: number // HP
	MP_Rate: number // MP%
	MP: number // MP

	// ステータス系
	STR_Rate: number // STR%
	STR: number // STR
	INT_Rate: number // INT%
	INT: number // INT
	VIT_Rate: number // VIT%
	VIT: number // VIT
	AGI_Rate: number // AGI%
	AGI: number // AGI
	DEX_Rate: number // DEX%
	DEX: number // DEX
	CRT_Rate: number // CRT%
	CRT: number // CRT
	MEN_Rate: number // MEN%
	MEN: number // MEN
	TEC_Rate: number // TEC%
	TEC: number // TEC
	LUK_Rate: number // LUK%
	LUK: number // LUK

	// 命中・回避系
	Accuracy_Rate: number // 命中%
	Accuracy: number // 命中
	Dodge_Rate: number // 回避%
	Dodge: number // 回避

	// 速度系
	AttackSpeed_Rate: number // 攻撃速度%
	AttackSpeed: number // 攻撃速度
	CastingSpeed_Rate: number // 詠唱速度%
	CastingSpeed: number // 詠唱速度
	MotionSpeed_Rate: number // 行動速度%

	// MP回復系
	AttackMPRecovery_Rate: number // 攻撃MP回復%
	AttackMPRecovery: number // 攻撃MP回復

	// 耐性系
	PhysicalResistance_Rate: number // 物理耐性%
	MagicalResistance_Rate: number // 魔法耐性%
	AilmentResistance_Rate: number // 異常耐性%

	// その他戦闘系
	Aggro_Rate: number // ヘイト%
	RevivalTime_Rate: number // 復帰短縮%

	// 自然回復系
	NaturalHPRecovery_Rate: number // HP自然回復%
	NaturalHPRecovery: number // HP自然回復
	NaturalMPRecovery_Rate: number // MP自然回復%
	NaturalMPRecovery: number // MP自然回復

	// 特殊系
	ArmorBreak_Rate: number // 防御崩し%
	Anticipate_Rate: number // 先読み%
	GuardPower_Rate: number // Guard力%
	GuardRecharge_Rate: number // Guard回復%
	AvoidRecharge_Rate: number // Avoid回復%
	ItemCooldown: number // 道具速度
	AbsoluteAccuracy_Rate: number // 絶対命中%
	AbsoluteDodge_Rate: number // 絶対回避%

	// ステータス連動攻撃力
	ATK_STR_Rate: number // ATK+(STR)%
	ATK_INT_Rate: number // ATK+(INT)%
	ATK_VIT_Rate: number // ATK+(VIT)%
	ATK_AGI_Rate: number // ATK+(AGI)%
	ATK_DEX_Rate: number // ATK+(DEX)%
	MATK_STR_Rate: number // MATK+(STR)%
	MATK_INT_Rate: number // MATK+(INT)%
	MATK_VIT_Rate: number // MATK+(VIT)%
	MATK_AGI_Rate: number // MATK+(AGI)%
	MATK_DEX_Rate: number // MATK+(DEX)%

	// 属性耐性
	FireResistance_Rate: number // 火耐性%
	WaterResistance_Rate: number // 水耐性%
	WindResistance_Rate: number // 風耐性%
	EarthResistance_Rate: number // 地耐性%
	LightResistance_Rate: number // 光耐性%
	DarkResistance_Rate: number // 闇耐性%
	NeutralResistance_Rate: number // 無耐性%

	// ダメージ軽減系
	LinearReduction_Rate: number // 直線軽減%
	RushReduction_Rate: number // 突進軽減%
	BulletReduction_Rate: number // 弾丸軽減%
	ProximityReduction_Rate: number // 周囲軽減%
	AreaReduction_Rate: number // 範囲軽減%
	FloorTrapReduction_Rate: number // 痛床軽減%
	MeteorReduction_Rate: number // 隕石軽減%
	BladeReduction_Rate: number // 射刃軽減%
	SuctionReduction_Rate: number // 吸引軽減%
	ExplosionReduction_Rate: number // 爆発軽減%

	// バリア系
	PhysicalBarrier: number // 物理バリア
	MagicalBarrier: number // 魔法バリア
	FractionalBarrier: number // 割合バリア
	BarrierCooldown_Rate: number // バリア速度%

	// 追撃系
	PhysicalFollowup_Rate: number // 物理追撃%
	MagicalFollowup_Rate: number // 魔法追撃%
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
	ATK: number
	stability: number
	refinement: number
}

// 装備アイテム（レガシー - 統合型を使用することを推奨）
export interface LegacyEquipment {
	name: string
	properties: Partial<EquipmentProperties>
	presetId?: string | null // プリセット装備のID（プリセット選択時のみ）
}

// 装備タイプ
export type EquipmentType = 'weapon' | 'armor' | 'accessory' | 'fashion'

// 装備カテゴリ
export type EquipmentCategory =
	| 'main'
	| 'mainWeapon'
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
export type CrystalType =
	| 'weapon'
	| 'armor'
	| 'additional'
	| 'special'
	| 'normal'

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

// 新しい敵情報システム

// 敵のカテゴリ
export type EnemyCategory = 'mob' | 'fieldBoss' | 'boss' | 'raidBoss'

// 敵の基本ステータス
export interface EnemyStats {
	DEF: number // 物理防御力 (0-9999)
	MDEF: number // 魔法防御力 (0-9999)
	physicalResistance: number // 物理耐性% (-100-100)
	magicalResistance: number // 魔法耐性% (-100-100)
	resistCritical: number // クリティカル耐性 (0-999) ※プリセットでは0、ユーザーが調整可能
	requiredHIT: number // 必要HIT (0-9999) ※プリセットでは0、ユーザーが調整可能
}

// プリセット敵情報
export interface PresetEnemy {
	id: string // 一意識別子
	name: string // 敵名
	level: number // レベル (1-999)
	stats: EnemyStats // 基本ステータス
	category: EnemyCategory // 敵カテゴリ
}

// 敵フォームデータ（セーブデータ用）
export interface EnemyFormData {
	selectedId: string | null // プリセット敵情報ID or カスタム敵情報ID
	type: 'preset' | 'custom' | null // データソースの識別
	// 手動入力値（プリセット・カスタム選択後のresistCriticalとrequiredHIT調整用）
	manualOverrides?: {
		resistCritical?: number // プリセット値(0)からの調整値
		requiredHIT?: number // プリセット値(0)からの調整値
	}
}

// 従来のEnemyInfo（後方互換性のため残す、将来的に削除予定）
export interface EnemyInfo {
	DEF: number
	MDEF: number
	level: number
	guaranteedCritical: number
	freeValue: number
}

// 計算機の全データ（新しい敵情報システム対応）
export interface CalculatorData {
	baseStats: BaseStats
	mainWeapon: MainWeapon
	subWeapon: SubWeapon
	equipment: EquipmentSlots
	crystals: CrystalSlots
	enemy: EnemyFormData // 新しい敵情報システム
	// 後方互換性のため旧敵情報も保持（将来的に削除予定）
	legacyEnemy?: EnemyInfo
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

// セーブデータ管理用の型定義
export interface SaveData {
	id: string
	name: string
	isDefault: boolean
	createdAt: string
	updatedAt: string
	order: number
	data: CalculatorData
}

// デフォルトセーブデータ
export interface DefaultSaveData extends SaveData {
	id: 'default'
	name: 'メインデータ'
	isDefault: true
}

// データ検証結果
export interface DataValidation {
	isValid: boolean
	errors: string[]
	warnings: string[]
	brokenReferences: { type: string; id: string }[]
}

// ストレージ使用量
export interface StorageUsage {
	totalSize: number
	maxSize: number
	usage: number
	warning: boolean
	critical: boolean
}

// ユーザーカスタム装備
export interface UserEquipment {
	id: string
	name: string
	category: EquipmentCategory
	properties: Partial<EquipmentProperties>
	weaponStats?: {
		ATK?: number
		stability?: number
		refinement?: number
	}
	crystalSlots?: {
		slot1?: string
		slot2?: string
	}
	createdAt: string
	updatedAt: string
	isFavorite: boolean
}

// ユーザーカスタムクリスタル
export interface UserCrystal {
	id: string
	name: string
	type: CrystalType
	properties: Partial<EquipmentProperties>
	description?: string
	isCustom: true
	createdAt: string
	updatedAt: string
	isFavorite?: boolean
}

// ユーザーカスタム敵情報
export interface UserEnemy {
	id: string
	name: string
	level: number
	stats: {
		DEF: number
		MDEF: number
		physicalResistance: number
		magicalResistance: number
		resistCritical: number
		requiredHIT: number
	}
	category: 'mob' | 'fieldBoss' | 'boss' | 'raidBoss'
	createdAt: string
	updatedAt: string
	isFavorite: boolean
}

// バージョン管理システム用の型定義

// プリセットデータバージョン情報
export interface PresetVersionInfo {
	version: string
	releaseDate: string
	equipments: {
		version: string
		checksum: string
	}
	crystals: {
		version: string
		checksum: string
	}
	enemies: {
		version: string
		checksum: string
	}
	lastUpdated: string // ISO date
}

// 更新チェック結果
export interface UpdateCheckResult {
	needsUpdate: boolean
	equipmentsUpdate: boolean
	crystalsUpdate: boolean
	enemiesUpdate: boolean
	oldVersion: string
	newVersion: string
}

// ローカルストレージ用のプリセットアイテム（共通フィールド）
interface LocalStoragePresetItemBase {
	isPreset: true
	isFavorite: boolean
	isModified: boolean
	modifiedAt?: string
	originalChecksum?: string
	createdAt: string
	updatedAt: string
}

// ローカルストレージ用のユーザーカスタムアイテム（共通フィールド）
interface LocalStorageCustomItemBase {
	isPreset: false
	isFavorite: boolean
	isModified: boolean
	createdAt: string
	updatedAt: string
}

// ローカルストレージ装備（プリセット由来）
export interface LocalStorageEquipment
	extends PresetEquipment,
		LocalStoragePresetItemBase {}

// ローカルストレージクリスタル（プリセット由来）
export interface LocalStorageCrystal
	extends PresetCrystal,
		LocalStoragePresetItemBase {
	description?: string
}

// ローカルストレージ敵情報（プリセット由来）
export interface LocalStorageEnemy
	extends PresetEnemy,
		LocalStoragePresetItemBase {}

// ユーザーカスタムアイテム
export interface CustomEquipment
	extends PresetEquipment,
		LocalStorageCustomItemBase {
	isCustom: true
}

export interface CustomCrystal
	extends PresetCrystal,
		LocalStorageCustomItemBase {
	isCustom: true
	description?: string
}

export interface CustomEnemy extends PresetEnemy, LocalStorageCustomItemBase {
	isCustom: true
}

// 統合型（アプリ内で使用する型）
export type Equipment = LocalStorageEquipment | CustomEquipment
export type Crystal = LocalStorageCrystal | CustomCrystal
export type Enemy = LocalStorageEnemy | CustomEnemy

// 更新通知の種類
export type UpdateNotificationType = 'equipments' | 'crystals' | 'enemies'

// 更新通知データ
export interface UpdateNotification {
	type: UpdateNotificationType
	count: number
	items: string[] // 追加されたアイテム名のリスト
}
