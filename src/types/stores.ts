import type {
	CalculatorData,
	BaseStats,
	MainWeapon,
	SubWeapon,
	CrystalSlots,
	EquipmentSlots,
	EquipmentType,
	EquipmentCategory,
	EquipmentProperties,
	FoodFormData,
	EnemyFormData,
	BuffItemFormData,
	RegisterFormData,
	SaveData,
	ArmorType,
	PowerOptions,
} from './calculator'
import type { CalculationResults } from './calculationResult'
import type { BuffSkillFormData } from './buffSkill'
import type { DamageCalculationServiceResult } from '@/utils/damageCalculationService'

// ===== 計算結果関連（将来実装）=====
export interface DamageCalculationResult {
	totalDamage: number
	criticalDamage: number
	averageDamage: number
	hitRate: number
	criticalRate: number
	details: {
		baseDamage: number
		weaponATK: number
		statBonus: number
		equipmentBonus: number
		crystalBonus: number
		foodBonus: number
	}
}

export interface CalculationSettings {
	includeBuffs: boolean
	useAverageDamage: boolean
	calculateCritical: boolean
	enemyLevel?: number
}

// ===== メインストア =====
export interface CalculatorStore {
	// ===== データ状態 =====
	data: CalculatorData

	// ===== UI状態 =====
	hasUnsavedChanges: boolean
	isLoading: boolean
	isInitialized: boolean

	// ===== 削除された差分検知システム =====
	// lastSavedData: CalculatorData | null
	// lastSavedUIState: { statusPreviewCategory: string } | null
	// hasRealChanges: boolean

	// ===== 将来の計算結果 =====
	calculationResult: DamageCalculationResult | null
	isCalculating: boolean
	calculationSettings: CalculationSettings

	// ===== ステータス計算結果表示 =====
	calculationResults: CalculationResults | null
	isCalculationResultVisible: boolean

	// ===== ダメージ計算結果キャッシュ =====
	baselineDamageResult: DamageCalculationServiceResult | null

	// ===== 基本アクション =====
	updateData: (updates: Partial<CalculatorData>) => void
	setData: (data: CalculatorData) => void
	resetUnsavedChanges: () => void
	setHasUnsavedChanges: (value: boolean) => void
	setIsLoading: (value: boolean) => void

	// ===== 削除された差分検知メソッド =====
	// updateLastSavedData: (data: CalculatorData) => void
	// updateLastSavedUIState: (saveId: string) => void
	// checkForRealChanges: () => boolean
	// setHasRealChanges: (value: boolean) => void

	// ===== セーブデータ管理 =====
	loadSaveData: (data: CalculatorData) => Promise<void>
	saveCurrentData: () => Promise<void>
	checkUIChanges: (saveId: string) => void

	// ===== 個別フォーム更新 =====
	updateBaseStats: (stats: BaseStats) => void
	updateMainWeapon: (weapon: MainWeapon) => void
	updateSubWeapon: (weapon: SubWeapon) => void
	updateCrystals: (crystals: CrystalSlots) => void
	updateEquipment: (equipment: EquipmentSlots) => void
	updateFood: (food: FoodFormData) => void
	updateEnemy: (enemy: EnemyFormData) => void
	updateAttackSkill: (
		attackSkill: import('@/types/calculator').AttackSkillFormData,
	) => void
	updateBuffSkills: (buffSkills: BuffSkillFormData) => void
	updateBuffSkillState: (
		skillId: string,
		state: import('@/types/buffSkill').BuffSkillState,
	) => void
	updateSkillParameter: (
		skillId: string,
		paramType: 'level' | 'stackCount' | 'specialParam',
		value: number,
	) => void
	updateBuffItems: (buffItems: BuffItemFormData) => void
	updateRegister: (register: RegisterFormData) => void
	updateRegisterEffect: (effectId: string, enabled: boolean) => void
	updateRegisterLevel: (
		effectId: string,
		level: number,
		partyMembers?: number,
	) => void
	resetRegisterData: () => void
	updatePowerOptions: (powerOptions: PowerOptions) => void
	updateAdaptationMultiplier: (adaptationMultiplier: number) => void

	// ===== カスタム装備管理 =====
	createTemporaryCustomEquipment: (
		equipmentCategory: EquipmentCategory,
		name: string,
	) => Promise<void>
	saveTemporaryCustomEquipments: () => Promise<void>
	renameCustomEquipment: (
		equipmentId: string,
		newName: string,
	) => Promise<boolean>
	deleteCustomEquipment: (equipmentId: string) => Promise<void>
	updateCustomEquipmentProperties: (
		equipmentId: string,
		properties: Partial<EquipmentProperties>,
	) => Promise<boolean>
	updateCustomEquipmentRefinement: (
		equipmentId: string,
		refinement: number,
	) => Promise<boolean>
	updateEquipmentArmorType: (
		equipmentId: string,
		armorType: ArmorType,
	) => Promise<boolean>
	cleanupTemporaryData: () => void
	getUnsavedDataStatus: () => {
		hasUnsavedChanges: boolean
		hasTemporaryEquipments: boolean
		hasEditSessions: boolean
	}
	saveEditSessions: () => Promise<void>

	// ===== 将来の計算機能 =====
	calculateDamage: () => Promise<void>
	updateCalculationSettings: (settings: Partial<CalculationSettings>) => void

	// ===== ステータス計算結果表示アクション =====
	updateCalculationResults: () => void
	toggleCalculationResultVisibility: () => void
	initializeCalculationResultVisibility: () => void

	// ===== ダメージ計算結果キャッシュアクション =====
	updateBaselineDamageResult: () => void

	// ===== 初期化 =====
	initialize: () => Promise<void>
}

// ===== UIストア =====
export interface UIStore {
	showSaveManager: boolean
	showUpdateNotifications: boolean

	// 計算結果表示制御（2カラム対応）
	showStatusPreview: boolean
	showDamagePreview: boolean

	// セーブデータごとの基本ステータスカテゴリ表示状態
	statusPreviewCategories: Record<
		string,
		'base' | 'physical' | 'magical' | 'hybrid' | 'tank'
	>

	setShowSaveManager: (value: boolean) => void
	setShowUpdateNotifications: (value: boolean) => void
	setShowStatusPreview: (show: boolean) => void
	setShowDamagePreview: (show: boolean) => void
	toggleStatusPreview: () => void
	toggleDamagePreview: () => void

	// セーブデータごとの基本ステータスカテゴリ管理
	getStatusPreviewCategory: (
		saveId: string,
	) => 'base' | 'physical' | 'magical' | 'hybrid' | 'tank'
	setStatusPreviewCategory: (
		saveId: string,
		category: 'base' | 'physical' | 'magical' | 'hybrid' | 'tank',
	) => void
}

// ===== セーブデータストア =====
export interface SaveDataStore {
	saveDataList: SaveData[]
	currentSaveId: string
	isLoading: boolean
	isInitialized: boolean
	error: string | null
	pendingSaveId: string | null
	showUnsavedChangesModal: boolean

	loadSaveDataList: () => Promise<void>
	switchSaveData: (saveId: string) => Promise<CalculatorData>
	createSaveData: (
		name: string,
		data: CalculatorData,
	) => Promise<{ saveData: SaveData; loadedData: CalculatorData }>
	deleteSaveData: (saveId: string) => Promise<CalculatorData | void>
	renameSaveData: (saveId: string, newName: string) => Promise<void>
	reorderSaveData: (newOrder: string[]) => Promise<void>
	switchToMainData: () => Promise<CalculatorData>

	setPendingSaveId: (saveId: string | null) => void
	setShowUnsavedChangesModal: (value: boolean) => void
	setError: (error: string | null) => void

	// ===== ステータス計算結果表示アクション =====
	updateCalculationResults: () => void
	toggleCalculationResultVisibility: () => void
	initializeCalculationResultVisibility: () => void
}
