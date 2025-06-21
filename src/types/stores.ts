import type {
	CalculatorData,
	BaseStats,
	MainWeapon,
	SubWeapon,
	CrystalSlots,
	EquipmentSlots,
	EquipmentType,
	EquipmentCategory,
	FoodFormData,
	EnemyFormData,
	BuffSkillFormData,
	BuffItemFormData,
	SaveData,
} from './calculator'

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

	// ===== 将来の計算結果 =====
	calculationResult: DamageCalculationResult | null
	isCalculating: boolean
	calculationSettings: CalculationSettings

	// ===== 基本アクション =====
	updateData: (updates: Partial<CalculatorData>) => void
	setData: (data: CalculatorData) => void
	resetUnsavedChanges: () => void
	setHasUnsavedChanges: (value: boolean) => void
	setIsLoading: (value: boolean) => void

	// ===== セーブデータ管理 =====
	loadSaveData: (data: CalculatorData) => Promise<void>
	saveCurrentData: () => Promise<void>

	// ===== 個別フォーム更新 =====
	updateBaseStats: (stats: BaseStats) => void
	updateMainWeapon: (weapon: MainWeapon) => void
	updateSubWeapon: (weapon: SubWeapon) => void
	updateCrystals: (crystals: CrystalSlots) => void
	updateEquipment: (equipment: EquipmentSlots) => void
	updateFood: (food: FoodFormData) => void
	updateEnemy: (enemy: EnemyFormData) => void
	updateBuffSkills: (buffSkills: BuffSkillFormData) => void
	updateBuffItems: (buffItems: BuffItemFormData) => void

	// ===== カスタム装備管理 =====
	createCustomEquipment: (equipmentCategory: EquipmentCategory, name: string) => Promise<void>
	deleteCustomEquipment: (equipmentId: string) => Promise<void>

	// ===== 将来の計算機能 =====
	calculateDamage: () => Promise<void>
	updateCalculationSettings: (settings: Partial<CalculationSettings>) => void

	// ===== 初期化 =====
	initialize: () => Promise<void>
}

// ===== UIストア =====
export interface UIStore {
	showSaveManager: boolean
	showUpdateNotifications: boolean

	setShowSaveManager: (value: boolean) => void
	setShowUpdateNotifications: (value: boolean) => void
}

// ===== セーブデータストア =====
export interface SaveDataStore {
	saveDataList: SaveData[]
	currentSaveId: string
	isLoading: boolean
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
}
