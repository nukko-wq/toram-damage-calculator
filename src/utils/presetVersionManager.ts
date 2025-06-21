import type {
	PresetVersionInfo,
	UpdateCheckResult,
	LocalStorageEquipment,
	LocalStorageCrystal,
	LocalStorageEnemy,
	PresetEquipment,
	PresetCrystal,
	PresetEnemy,
	UpdateNotification,
	EquipmentCategory,
} from '@/types/calculator'

// フォールバック用の静的インポート
import equipmentsData from '@/data/equipments.json'
import crystalsData from '@/data/crystals.json'
import enemiesData from '@/data/enemies.json'

// ストレージキー
const STORAGE_KEYS = {
	PRESET_VERSION: 'toram_preset_version',
	LAST_UPDATE_CHECK: 'toram_last_update_check',
	PRESET_EQUIPMENTS: 'toram_preset_equipments',
	PRESET_CRYSTALS: 'toram_preset_crystals',
	PRESET_ENEMIES: 'toram_preset_enemies',
} as const

/**
 * プリセットデータを強制的にリセットして再初期化
 */
export function forceResetPresetData(): void {
	try {
		// プリセットデータを削除
		localStorage.removeItem(STORAGE_KEYS.PRESET_VERSION)
		localStorage.removeItem(STORAGE_KEYS.PRESET_EQUIPMENTS)
		localStorage.removeItem(STORAGE_KEYS.PRESET_CRYSTALS)
		localStorage.removeItem(STORAGE_KEYS.PRESET_ENEMIES)
		console.log('Preset data reset successfully')
	} catch (error) {
		console.error('Failed to reset preset data:', error)
	}
}

/**
 * ローカルストレージからプリセットバージョン情報を取得
 */
export function getLocalPresetVersion(): PresetVersionInfo | null {
	try {
		const stored = localStorage.getItem(STORAGE_KEYS.PRESET_VERSION)
		return stored ? JSON.parse(stored) : null
	} catch (error) {
		console.error('Failed to get local preset version:', error)
		return null
	}
}

/**
 * プリセットバージョン情報をローカルストレージに保存
 */
export async function saveLocalPresetVersion(
	version: PresetVersionInfo,
): Promise<void> {
	try {
		localStorage.setItem(STORAGE_KEYS.PRESET_VERSION, JSON.stringify(version))
		localStorage.setItem(
			STORAGE_KEYS.LAST_UPDATE_CHECK,
			new Date().toISOString(),
		)
	} catch (error) {
		console.error('Failed to save local preset version:', error)
		throw error
	}
}

/**
 * システム側の最新プリセットバージョン情報を取得
 */
export async function getLatestPresetVersion(): Promise<PresetVersionInfo> {
	try {
		// src/data/version.json から最新バージョン情報を取得
		const response = await fetch('/data/version.json')
		if (!response.ok) {
			throw new Error(`Failed to fetch version info: ${response.status}`)
		}
		return await response.json()
	} catch (error) {
		console.error('Failed to get latest preset version:', error)
		throw error
	}
}

/**
 * バージョンを比較して更新が必要かチェック
 */
export function compareVersions(
	local: PresetVersionInfo,
	latest: PresetVersionInfo,
): UpdateCheckResult {
	const needsUpdate = local.version !== latest.version

	return {
		needsUpdate,
		equipmentsUpdate:
			needsUpdate && local.equipments.version !== latest.equipments.version,
		crystalsUpdate:
			needsUpdate && local.crystals.version !== latest.crystals.version,
		enemiesUpdate:
			needsUpdate && local.enemies.version !== latest.enemies.version,
		oldVersion: local.version,
		newVersion: latest.version,
	}
}

/**
 * 新規アイテムを抽出（ID重複チェック）
 */
function extractNewItems<T extends { id: string }>(
	currentItems: T[],
	latestItems: T[],
): T[] {
	const currentIds = new Set(currentItems.map((item) => item.id))
	return latestItems.filter((item) => !currentIds.has(item.id))
}

/**
 * プリセット装備データをローカルストレージにコピー
 */
export async function copyPresetEquipmentsToLocalStorage(): Promise<void> {
	try {
		let data: any

		// まずfetchを試行
		try {
			const response = await fetch('/data/equipments.json')
			if (!response.ok) {
				throw new Error(`Failed to fetch equipments: ${response.status}`)
			}
			data = await response.json()
		} catch (fetchError) {
			console.warn(
				'Failed to fetch equipments.json, using static import fallback:',
				fetchError,
			)
			// フォールバック: 静的インポートを使用
			data = equipmentsData
		}

		const localStorageEquipments: LocalStorageEquipment[] = []

		// 各カテゴリの装備を処理
		for (const [category, equipments] of Object.entries(data.equipments)) {
			for (const equipment of equipments as any[]) {
				const localEquipment: LocalStorageEquipment = {
					...equipment,
					// JSONデータに不足している必須フィールドを追加
					type:
						category === 'mainWeapon' || category === 'subWeapon'
							? 'weapon'
							: category === 'body'
								? 'armor'
								: category === 'fashion1' ||
										category === 'fashion2' ||
										category === 'fashion3'
									? 'fashion'
									: 'accessory',
					category:
						category === 'mainWeapon'
							? ['main', 'mainWeapon']
							: [category as EquipmentCategory],
					baseStats: equipment.weaponStats || equipment.baseStats || {},
					isPreset: true,
					isFavorite: false,
					isModified: false,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				}
				localStorageEquipments.push(localEquipment)
			}
		}

		localStorage.setItem(
			STORAGE_KEYS.PRESET_EQUIPMENTS,
			JSON.stringify(localStorageEquipments),
		)
	} catch (error) {
		console.error('Failed to copy preset equipments:', error)
		throw error
	}
}

/**
 * プリセットクリスタルデータをローカルストレージにコピー
 */
export async function copyPresetCrystalsToLocalStorage(): Promise<void> {
	try {
		let data: any

		// まずfetchを試行
		try {
			const response = await fetch('/data/crystals.json')
			if (!response.ok) {
				throw new Error(`Failed to fetch crystals: ${response.status}`)
			}
			data = await response.json()
		} catch (fetchError) {
			console.warn(
				'Failed to fetch crystals.json, using static import fallback:',
				fetchError,
			)
			// フォールバック: 静的インポートを使用
			data = crystalsData
		}

		// crystals.json の構造に応じて処理
		let crystalsList: PresetCrystal[] = []

		if (data.crystals && typeof data.crystals === 'object') {
			// 新しい構造: { crystals: { weapon: [], armor: [], ... } }
			if (Array.isArray(data.crystals)) {
				crystalsList = data.crystals
			} else {
				// カテゴリ別の構造
				for (const [type, crystals] of Object.entries(data.crystals)) {
					if (Array.isArray(crystals)) {
						crystalsList.push(
							...(crystals as PresetCrystal[]).map((crystal) => ({
								...crystal,
								type: type as any,
							})),
						)
					}
				}
			}
		}

		const localStorageCrystals: LocalStorageCrystal[] = crystalsList.map(
			(crystal: PresetCrystal) => ({
				...crystal,
				isPreset: true,
				isFavorite: false,
				isModified: false,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}),
		)

		localStorage.setItem(
			STORAGE_KEYS.PRESET_CRYSTALS,
			JSON.stringify(localStorageCrystals),
		)
	} catch (error) {
		console.error('Failed to copy preset crystals:', error)
		throw error
	}
}

/**
 * プリセット敵情報データをローカルストレージにコピー
 */
export async function copyPresetEnemiesToLocalStorage(): Promise<void> {
	try {
		let data: any

		// まずfetchを試行
		try {
			const response = await fetch('/data/enemies.json')
			if (!response.ok) {
				throw new Error(`Failed to fetch enemies: ${response.status}`)
			}
			data = await response.json()
		} catch (fetchError) {
			console.warn(
				'Failed to fetch enemies.json, using static import fallback:',
				fetchError,
			)
			// フォールバック: 静的インポートを使用
			data = enemiesData
		}

		const localStorageEnemies: LocalStorageEnemy[] = []

		// 各カテゴリの敵情報を処理
		for (const [category, enemies] of Object.entries(data.enemies)) {
			for (const enemy of enemies as PresetEnemy[]) {
				const localEnemy: LocalStorageEnemy = {
					...enemy,
					isPreset: true,
					isFavorite: false,
					isModified: false,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				}
				localStorageEnemies.push(localEnemy)
			}
		}

		localStorage.setItem(
			STORAGE_KEYS.PRESET_ENEMIES,
			JSON.stringify(localStorageEnemies),
		)
	} catch (error) {
		console.error('Failed to copy preset enemies:', error)
		throw error
	}
}

/**
 * 装備データの差分更新
 */
async function updatePresetEquipments(): Promise<UpdateNotification | null> {
	try {
		const response = await fetch('/data/equipments.json')
		if (!response.ok) {
			throw new Error(`Failed to fetch equipments: ${response.status}`)
		}
		const data = await response.json()

		const currentEquipments = getLocalStorageEquipments()
		const latestEquipments: PresetEquipment[] = []

		// 各カテゴリの装備を統合
		for (const [category, equipments] of Object.entries(data.equipments)) {
			for (const equipment of equipments as any[]) {
				latestEquipments.push({
					...equipment,
					type:
						category === 'mainWeapon' || category === 'subWeapon'
							? 'weapon'
							: category === 'body'
								? 'armor'
								: category === 'fashion1' ||
										category === 'fashion2' ||
										category === 'fashion3'
									? 'fashion'
									: 'accessory',
					category:
						category === 'mainWeapon'
							? ['main', 'mainWeapon']
							: [category as EquipmentCategory],
					baseStats: equipment.weaponStats || equipment.baseStats || {},
				} as PresetEquipment)
			}
		}

		const newEquipments = extractNewItems(currentEquipments, latestEquipments)

		if (newEquipments.length === 0) {
			return null
		}

		const newLocalEquipments: LocalStorageEquipment[] = newEquipments.map(
			(equipment) => ({
				...equipment,
				isPreset: true,
				isFavorite: false,
				isModified: false,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}),
		)

		const updatedEquipments = [...currentEquipments, ...newLocalEquipments]
		localStorage.setItem(
			STORAGE_KEYS.PRESET_EQUIPMENTS,
			JSON.stringify(updatedEquipments),
		)

		return {
			type: 'equipments',
			count: newEquipments.length,
			items: newEquipments.map((eq) => eq.name),
		}
	} catch (error) {
		console.error('Failed to update preset equipments:', error)
		return null
	}
}

/**
 * クリスタルデータの差分更新
 */
async function updatePresetCrystals(): Promise<UpdateNotification | null> {
	try {
		const response = await fetch('/data/crystals.json')
		if (!response.ok) {
			throw new Error(`Failed to fetch crystals: ${response.status}`)
		}
		const data = await response.json()

		const currentCrystals = getLocalStorageCrystals()
		const latestCrystals: PresetCrystal[] = data.crystals

		const newCrystals = extractNewItems(currentCrystals, latestCrystals)

		if (newCrystals.length === 0) {
			return null
		}

		const newLocalCrystals: LocalStorageCrystal[] = newCrystals.map(
			(crystal) => ({
				...crystal,
				isPreset: true,
				isFavorite: false,
				isModified: false,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}),
		)

		const updatedCrystals = [...currentCrystals, ...newLocalCrystals]
		localStorage.setItem(
			STORAGE_KEYS.PRESET_CRYSTALS,
			JSON.stringify(updatedCrystals),
		)

		return {
			type: 'crystals',
			count: newCrystals.length,
			items: newCrystals.map((crystal) => crystal.name),
		}
	} catch (error) {
		console.error('Failed to update preset crystals:', error)
		return null
	}
}

/**
 * 敵情報データの差分更新
 */
async function updatePresetEnemies(): Promise<UpdateNotification | null> {
	try {
		const response = await fetch('/data/enemies.json')
		if (!response.ok) {
			throw new Error(`Failed to fetch enemies: ${response.status}`)
		}
		const data = await response.json()

		const currentEnemies = getLocalStorageEnemies()
		const latestEnemies: PresetEnemy[] = []

		// 各カテゴリの敵情報を統合
		for (const enemies of Object.values(data.enemies)) {
			latestEnemies.push(...(enemies as PresetEnemy[]))
		}

		const newEnemies = extractNewItems(currentEnemies, latestEnemies)

		if (newEnemies.length === 0) {
			return null
		}

		const newLocalEnemies: LocalStorageEnemy[] = newEnemies.map((enemy) => ({
			...enemy,
			isPreset: true,
			isFavorite: false,
			isModified: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}))

		const updatedEnemies = [...currentEnemies, ...newLocalEnemies]
		localStorage.setItem(
			STORAGE_KEYS.PRESET_ENEMIES,
			JSON.stringify(updatedEnemies),
		)

		return {
			type: 'enemies',
			count: newEnemies.length,
			items: newEnemies.map((enemy) => enemy.name),
		}
	} catch (error) {
		console.error('Failed to update preset enemies:', error)
		return null
	}
}

/**
 * 差分更新を実行
 */
export async function performDifferentialUpdate(
	updateCheck: UpdateCheckResult,
): Promise<UpdateNotification[]> {
	const notifications: UpdateNotification[] = []

	if (updateCheck.equipmentsUpdate) {
		const notification = await updatePresetEquipments()
		if (notification) {
			notifications.push(notification)
		}
	}

	if (updateCheck.crystalsUpdate) {
		const notification = await updatePresetCrystals()
		if (notification) {
			notifications.push(notification)
		}
	}

	if (updateCheck.enemiesUpdate) {
		const notification = await updatePresetEnemies()
		if (notification) {
			notifications.push(notification)
		}
	}

	return notifications
}

/**
 * 初回プリセットデータコピー
 */
export async function initialCopyPresetData(): Promise<void> {
	await Promise.all([
		copyPresetEquipmentsToLocalStorage(),
		copyPresetCrystalsToLocalStorage(),
		copyPresetEnemiesToLocalStorage(),
	])
}

/**
 * プリセットデータのチェックと更新
 */
export async function checkAndUpdatePresetData(): Promise<
	UpdateNotification[]
> {
	try {
		const localVersion = getLocalPresetVersion()
		const latestVersion = await getLatestPresetVersion()

		// 初回アクセス（ローカルバージョンなし）
		if (!localVersion) {
			await initialCopyPresetData()
			await saveLocalPresetVersion(latestVersion)
			return []
		}

		// バージョン比較
		const updateCheck = compareVersions(localVersion, latestVersion)

		if (updateCheck.needsUpdate) {
			const notifications = await performDifferentialUpdate(updateCheck)
			await saveLocalPresetVersion(latestVersion)
			return notifications
		}

		return []
	} catch (error) {
		console.error('Failed to check and update preset data:', error)
		return []
	}
}

// ローカルストレージからデータを取得するヘルパー関数
function getLocalStorageEquipments(): LocalStorageEquipment[] {
	try {
		const stored = localStorage.getItem(STORAGE_KEYS.PRESET_EQUIPMENTS)
		return stored ? JSON.parse(stored) : []
	} catch (error) {
		console.error('Failed to get local storage equipments:', error)
		return []
	}
}

function getLocalStorageCrystals(): LocalStorageCrystal[] {
	try {
		const stored = localStorage.getItem(STORAGE_KEYS.PRESET_CRYSTALS)
		return stored ? JSON.parse(stored) : []
	} catch (error) {
		console.error('Failed to get local storage crystals:', error)
		return []
	}
}

function getLocalStorageEnemies(): LocalStorageEnemy[] {
	try {
		const stored = localStorage.getItem(STORAGE_KEYS.PRESET_ENEMIES)
		return stored ? JSON.parse(stored) : []
	} catch (error) {
		console.error('Failed to get local storage enemies:', error)
		return []
	}
}
