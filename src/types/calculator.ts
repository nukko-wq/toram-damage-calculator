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
export type SubWeaponType =
	| 'ナイフ'
	| '矢'
	| '盾'
	| '魔道具'
	| '手甲'
	| '巻物'
	| '片手剣'
	| '抜刀剣'
	| 'なし'

// 防具の改造タイプ（体装備専用）
export type ArmorType = 'normal' | 'heavy' | 'light'

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
	| 'freeInput1'
	| 'freeInput2'
	| 'freeInput3'

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
	armorType?: ArmorType // 防具の改造タイプ（体装備のみ、セーブデータ間で共通）
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
	memo1?: string
	memo2?: string
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
	freeInput1: Equipment
	freeInput2: Equipment
	freeInput3: Equipment
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

// ボス戦難易度
export type BossDifficulty = 'normal' | 'hard' | 'lunatic' | 'ultimate'

// 敵の基本ステータス
export interface EnemyStats {
	DEF: number // 物理防御力 (0-9999)
	MDEF: number // 魔法防御力 (0-9999)
	physicalResistance: number // 物理耐性% (-100-100)
	magicalResistance: number // 魔法耐性% (-100-100)
	resistCritical: number // 確定クリティカル (0-999) ※プリセットでは0、全敵カテゴリでユーザーが調整可能
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

// 個別敵設定（敵ごとの設定値）
export interface EnemySettings {
	enemyId: string // 敵のID
	// ボス難易度設定（boss カテゴリのみ）
	difficulty?: BossDifficulty
	// レイドボス レベル調整（raidBoss カテゴリのみ）
	raidBossLevel?: number
	// 手動調整値（プリセット・カスタム選択後の調整用）
	manualOverrides?: {
		resistCritical?: number // 確定クリティカル調整値
		requiredHIT?: number // 必要HIT調整値（レイドボス以外 or 赫灼のセルディテのFLEE値）
	}
	lastUpdated: string // 最終更新日時 (ISO string)
}

// 敵設定管理状態（全敵の設定を格納）
export interface EnemySettingsMap {
	[enemyId: string]: EnemySettings
}

// セーブデータ内の敵情報（個別セーブデータ用 - 選択している敵）
export interface SaveDataEnemyInfo {
	selectedEnemyId: string | null // 選択中の敵ID
	enemyType: 'preset' | 'custom' | null // データソースの識別
	lastSelectedAt?: string // 最終選択日時 (ISO string)
}

// 敵フォームデータ（UIコンポーネント用の統合型）
export interface EnemyFormData {
	selectedId: string | null // プリセット敵情報ID or カスタム敵情報ID
	type: 'preset' | 'custom' | null // データソースの識別
	// ボス難易度設定（boss カテゴリのみ）
	difficulty?: BossDifficulty
	// レイドボス レベル調整（raidBoss カテゴリのみ）
	raidBossLevel?: number
	// 手動入力値（プリセット・カスタム選択後の調整用）
	manualOverrides?: {
		resistCritical?: number // 確定クリティカル調整値
		requiredHIT?: number // 必要HIT調整値（レイドボス以外 or 赫灼のセルディテのFLEE値）
	}
}

// 計算機の全データ
export interface CalculatorData {
	baseStats: BaseStats
	mainWeapon: MainWeapon
	subWeapon: SubWeapon
	equipment: EquipmentSlots
	crystals: CrystalSlots
	food: FoodFormData // 料理データ
	enemy: SaveDataEnemyInfo // 敵情報（個別セーブデータ用）
	buffSkills: import('./buffSkill').BuffSkillFormData // バフスキルデータ
	buffItems: BuffItemFormData // バフアイテムデータ
	register: RegisterFormData // レジスタ他データ
	attackSkill: AttackSkillFormData // 攻撃スキルデータ
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
	armorType?: ArmorType // 防具の改造タイプ（体装備のみ、セーブデータ間で共通）
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
	memo1?: string
	memo2?: string
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

// 料理システム

// 料理タイプ
export type FoodType =
	| 'none' // なし
	| 'okaka_onigiri' // おかかおにぎり(STR)
	| 'sake_onigiri' // 鮭おにぎり(DEX)
	| 'umeboshi_onigiri' // 梅干しおにぎり(INT)
	| 'mentaiko_onigiri' // 明太子おにぎり(AGI)
	| 'tuna_mayo_onigiri' // ツナマヨおにぎり(VIT)
	| 'shoyu_ramen' // しょうゆラーメン(命中)
	| 'zokusei_pasta' // 属性パスタ(属性有利共通)
	| 'takoyaki' // たこ焼き(クリ率)
	| 'yakisoba' // 焼きそば(攻撃MP回復)
	| 'golden_fried_rice' // 黄金チャーハン(HP)
	| 'ankake_fried_rice' // あんかけチャーハン(MP)
	| 'margherita_pizza' // マルゲリータピザ(武器ATK+)
	| 'diabola_pizza' // ディアボラピザ(ATK+)
	| 'seafood_pizza' // シーフードピザ(MATK+)
	| 'beef_stew' // ビーフシチュー(ヘイト)
	| 'white_stew' // ホワイトシチュー(ヘイト)
	| 'beef_burger' // ビーフバーガー(物理耐性)
	| 'fish_burger' // フィッシュバーガー(魔法耐性)

// 料理スロットデータ
export interface FoodSlotData {
	selectedFood: FoodType // 選択された料理タイプ
	level: number // 料理レベル (1-10、「なし」の場合は0)
}

// 料理フォームデータ
export interface FoodFormData {
	slot1: FoodSlotData
	slot2: FoodSlotData
	slot3: FoodSlotData
	slot4: FoodSlotData
	slot5: FoodSlotData
}

// バフスキルシステム

// バフスキルカテゴリ
export type BuffSkillCategory =
	| 'mastery'
	| 'blade'
	| 'shoot'
	| 'halberd'
	| 'mononofu'
	| 'dualSword'
	| 'sprite'
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

// バフスキルパラメータ
export interface BuffSkillParameters {
	skillLevel?: number // 1-10
	stackCount?: number // 重ねがけ数
	playerCount?: number // プレイヤー数
	refinement?: number // 精錬値
	spUsed?: number // 使用SP
	isCaster?: number // 使用者フラグ (0:他者使用, 1:自己使用)
}

// バフスキルデータ
export interface BuffSkill {
	id: string
	name: string
	category: BuffSkillCategory
	isEnabled: boolean
	parameters: BuffSkillParameters
}

// バフスキルフォームデータ
export interface BuffSkillFormData {
	skills: BuffSkill[]
}

// バフアイテムカテゴリ
export type BuffItemCategory =
	| 'physicalPower' // 物理威力
	| 'magicalPower' // 魔法威力
	| 'physicalDefense' // 物理防御
	| 'magicalDefense' // 魔法防御
	| 'elementalAttack' // 属性攻撃
	| 'elementalDefense' // 属性防御
	| 'speed' // 速度
	| 'casting' // 詠唱
	| 'mp' // MP
	| 'hp' // HP
	| 'accuracy' // 命中
	| 'evasion' // 回避

// プリセットバフアイテム（JSON用）
export interface PresetBuffItem {
	id: string
	name: string
	category: BuffItemCategory
	properties: Partial<EquipmentProperties>
}

// ローカルストレージバフアイテム（プリセット拡張版）
export interface LocalStorageBuffItem extends PresetBuffItem {
	isPreset: boolean // 常にtrue（プリセットのみ）
	isFavorite: boolean // お気に入り設定
	createdAt: string // 作成日時
	updatedAt: string // 更新日時
}

// 統合バフアイテム型
export type BuffItem = LocalStorageBuffItem

// バフアイテムフォームデータ
export interface BuffItemFormData {
	physicalPower: string | null // 選択されたアイテムID（null = なし）
	magicalPower: string | null
	physicalDefense: string | null
	magicalDefense: string | null
	elementalAttack: string | null
	elementalDefense: string | null
	speed: string | null
	casting: string | null
	mp: string | null
	hp: string | null
	accuracy: string | null
	evasion: string | null
}

// レジスタ他システム

// レジスタ効果タイプ
export type RegisterEffectType =
	| 'physicalAttackUp' // 物理攻撃アップ
	| 'magicalAttackUp' // 魔法攻撃アップ
	| 'maxHpUp' // 最大HPアップ
	| 'maxMpUp' // 最大MPアップ
	| 'accuracyUp' // 命中アップ
	| 'evasionUp' // 回避アップ
	| 'attackSpeedUp' // 攻撃速度アップ
	| 'magicalSpeedUp' // 魔法速度アップ
	| 'fateCompanionship' // 運命共同体
	| 'voidStance' // 無の構え
	| 'arrowPursuit' // 術式アロー・追撃
	| 'airSlideCompress' // エアスライド・圧縮
	| 'assassinStabEnhance' // アサシンスタブ・強化
	| 'resonancePower' // レゾナンス・火力
	| 'resonanceAcceleration' // レゾナンス・加速
	| 'resonanceConcentration' // レゾナンス・集中
	| 'deliciousIngredientTrade' // おいしい食材取引
	| 'freshFruitTrade' // 新鮮な果物取引

// レジスタ効果データ
export interface RegisterEffect {
	id: string
	name: string
	type: RegisterEffectType
	isEnabled: boolean
	level: number
	maxLevel: number
	partyMembers?: number // 運命共同体専用
}

// レジスタフォームデータ
export interface RegisterFormData {
	effects: RegisterEffect[]
}

// 攻撃スキルシステム

// 攻撃スキルカテゴリ
export type AttackSkillCategory = 
	| 'sword'      // 片手剣
	| 'twohandSword' // 両手剣
	| 'bow'        // 弓
	| 'bowgun'     // 自動弓
	| 'staff'      // 杖
	| 'magicDevice' // 魔導具
	| 'knuckle'    // 拳甲
	| 'halberd'    // 旋棍
	| 'katana'     // 刀
	| 'dualSword'  // 双剣
	| 'martialArts' // 格闘

// 威力参照タイプ
export type PowerReferenceType = 'totalATK' | 'MATK' // 将来拡張: 'spearMATK', 'STR', 'INT', etc.

// 慣れタイプ
export type FamiliarityType = 'physical' | 'magical' | 'normal'

// 攻撃段階情報
export interface AttackHit {
	hitNumber: number                    // 撃目番号（1-6）
	attackType: 'physical' | 'magical'   // 攻撃タイプ
	referenceDefense: 'DEF' | 'MDEF'     // 参照防御力
	referenceResistance: 'physical' | 'magical' // 参照耐性
	powerReference: PowerReferenceType    // 威力参照
	
	// 倍率情報（表示用）
	multiplier: number                   // 威力倍率%（表示値、実際の計算は別途）
	fixedDamage: number                  // 固定ダメージ（表示値、実際の計算は別途）
	
	// 計算式説明（各撃ごとに設定可能）
	multiplierFormula?: string           // 倍率の計算式説明（例: "1000%", "|補正後STR|%"）
	fixedDamageFormula?: string          // 固定値の計算式説明（例: "400", "基礎INT/2"）
	
	// 補正適用
	familiarity: FamiliarityType         // 慣れ参照
	familiarityGrant: FamiliarityType    // 慣れ付与
	canUseUnsheathePower: boolean        // 抜刀威力適用可否
	canUseLongRange: boolean             // ロングレンジ適用可否
	canUseDistancePower: boolean         // 距離威力適用可否
	
	// 特殊設定
	notes?: string                       // 備考
}

// 攻撃スキル
export interface AttackSkill {
	// 基本情報
	id: string                           // 一意識別子
	name: string                        // スキル名
	category: AttackSkillCategory        // スキルカテゴリ
	weaponTypeRequirements?: WeaponType[] // 必要武器種（指定なしは全武器対応）
	
	// 消費・条件
	mpCost: number                      // 消費MP
	levelRequirement?: number            // 必要スキルレベル
	prerequisites?: string[]            // 前提スキル
	
	// 表示用計算式説明
	multiplierFormula?: string           // 倍率の計算式説明（例: "1000%", "|補正後STR|%"）
	fixedDamageFormula?: string          // 固定値の計算式説明（例: "400", "基礎INT/2"）
	
	// 多段攻撃設定
	hits: AttackHit[]                   // 1〜6撃目の情報配列
	
	// 特殊効果
	specialEffects?: string[] // 特殊効果の説明文配列
	
	// メタ情報
	description?: string                // スキル説明
	notes?: string                     // 実装・使用上の注意
}

// 計算済み攻撃段階情報（表示用）
export interface CalculatedHit {
	hitNumber: number
	attackType: 'physical' | 'magical'
	powerReference: string              // 表示用（例: "総ATK"）
	referenceDefense: 'DEF' | 'MDEF'
	referenceResistance: 'physical' | 'magical' // 参照耐性
	multiplier: number                  // 表示用倍率%
	fixedDamage: number                 // 表示用固定値
	
	// 計算式説明
	multiplierFormula?: string          // 倍率の計算式説明
	fixedDamageFormula?: string         // 固定値の計算式説明
	
	// 慣れ情報
	familiarityReference: FamiliarityType
	familiarityGrant: FamiliarityType
	
	// 補正適用
	canUseUnsheathePower: boolean
	canUseLongRange: boolean
	canUseDistancePower: boolean
	
	// 計算過程（特殊計算の場合）
	calculationProcess?: string
}

// AttackSkillForm表示用データ
export interface AttackSkillDisplayData {
	// 選択情報
	selectedSkill: AttackSkill | null
	
	// 計算結果
	calculatedHits: CalculatedHit[]
	
	// 表示設定
	showDetailedInfo: boolean
}

// AttackSkillFormデータ（CalculatorData内で使用）
export interface AttackSkillFormData {
	selectedSkillId: string | null
	calculatedData: CalculatedHit[] | null
	lastCalculatedAt?: string
}
