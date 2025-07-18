import type {
	PresetEquipment,
	LocalStorageEquipment,
	Equipment,
	UserEquipment,
	EquipmentType,
	EquipmentCategory,
	EquipmentProperties,
	ArmorType,
} from '@/types/calculator'
import { equipmentsData } from '@/data/equipments'
import {
	getAllTemporaryEquipments,
	getTemporaryEquipmentsByCategory,
	getTemporaryEquipmentById,
	isTemporaryEquipment,
} from './temporaryEquipmentManager'
import {
	getAllEditSessionEquipments,
	getEditSessionEquipment,
	isInEditSession,
	startEditSession,
	updateEditSessionProperties,
} from './editSessionManager'

// プロパティからundefinedの値を除外する関数
function cleanProperties(properties: any): Partial<EquipmentProperties> {
	if (!properties) return {}

	const cleaned: Partial<EquipmentProperties> = {}
	for (const [key, value] of Object.entries(properties)) {
		if (value !== undefined && typeof value === 'number') {
			cleaned[key as keyof EquipmentProperties] = value
		}
	}
	return cleaned
}

// プリセット装備データを取得
export function getAllEquipments(): PresetEquipment[] {
	const allEquipments: PresetEquipment[] = []

	// 新しいJSON構造に対応
	const equipmentsRoot = (equipmentsData as any).equipments

	if (!equipmentsRoot) {
		console.error('equipments.json構造が不正です')
		return []
	}

	// mainWeapon -> main カテゴリ、weapon タイプ
	if (equipmentsRoot.mainWeapon) {
		for (const item of equipmentsRoot.mainWeapon) {
			allEquipments.push({
				id: item.id,
				name: item.name,
				type: 'weapon' as EquipmentType,
				category: ['main'] as EquipmentCategory[],
				baseStats: item.weaponStats || {},
				properties: cleanProperties(item.properties),
				source: item.source,
				conditionalEffects: item.conditionalEffects,
			})
		}
	}

	// body -> body カテゴリ、armor タイプ
	if (equipmentsRoot.body) {
		for (const item of equipmentsRoot.body) {
			allEquipments.push({
				id: item.id,
				name: item.name,
				type: 'armor' as EquipmentType,
				category: ['body'] as EquipmentCategory[],
				baseStats: {},
				properties: cleanProperties(item.properties),
				source: item.source,
				conditionalEffects: item.conditionalEffects,
			})
		}
	}

	// additional -> additional カテゴリ、accessory タイプ
	if (equipmentsRoot.additional) {
		for (const item of equipmentsRoot.additional) {
			allEquipments.push({
				id: item.id,
				name: item.name,
				type: 'accessory' as EquipmentType,
				category: ['additional'] as EquipmentCategory[],
				baseStats: {},
				properties: cleanProperties(item.properties),
				source: item.source,
				conditionalEffects: item.conditionalEffects,
			})
		}
	}

	// special -> special カテゴリ、accessory タイプ
	if (equipmentsRoot.special) {
		for (const item of equipmentsRoot.special) {
			allEquipments.push({
				id: item.id,
				name: item.name,
				type: 'accessory' as EquipmentType,
				category: ['special'] as EquipmentCategory[],
				baseStats: {},
				properties: cleanProperties(item.properties),
				source: item.source,
				conditionalEffects: item.conditionalEffects,
			})
		}
	}

	// subWeapon -> subWeapon カテゴリ、weapon タイプ
	if (equipmentsRoot.subWeapon) {
		for (const item of equipmentsRoot.subWeapon) {
			allEquipments.push({
				id: item.id,
				name: item.name,
				type: 'weapon' as EquipmentType,
				category: ['subWeapon'] as EquipmentCategory[],
				baseStats: {},
				properties: cleanProperties(item.properties),
				source: item.source,
				conditionalEffects: item.conditionalEffects,
			})
		}
	}

	// fashion1 -> fashion1 カテゴリ、fashion タイプ
	if (equipmentsRoot.fashion1) {
		for (const item of equipmentsRoot.fashion1) {
			allEquipments.push({
				id: item.id,
				name: item.name,
				type: 'fashion' as EquipmentType,
				category: ['fashion1'] as EquipmentCategory[],
				baseStats: {},
				properties: cleanProperties(item.properties),
				source: item.source,
				conditionalEffects: item.conditionalEffects,
			})
		}
	}

	// fashion2 -> fashion2 カテゴリ、fashion タイプ
	if (equipmentsRoot.fashion2) {
		for (const item of equipmentsRoot.fashion2) {
			allEquipments.push({
				id: item.id,
				name: item.name,
				type: 'fashion' as EquipmentType,
				category: ['fashion2'] as EquipmentCategory[],
				baseStats: {},
				properties: cleanProperties(item.properties),
				source: item.source,
				conditionalEffects: item.conditionalEffects,
			})
		}
	}

	// fashion3 -> fashion3 カテゴリ、fashion タイプ
	if (equipmentsRoot.fashion3) {
		for (const item of equipmentsRoot.fashion3) {
			allEquipments.push({
				id: item.id,
				name: item.name,
				type: 'fashion' as EquipmentType,
				category: ['fashion3'] as EquipmentCategory[],
				baseStats: {},
				properties: cleanProperties(item.properties),
				source: item.source,
				conditionalEffects: item.conditionalEffects,
			})
		}
	}

	return allEquipments
}

// 装備タイプでフィルタリング
export function getEquipmentsByType(type: EquipmentType): PresetEquipment[] {
	return getAllEquipments().filter((equipment) => equipment.type === type)
}

// 装備カテゴリでフィルタリング
export function getEquipmentsByCategory(
	category: EquipmentCategory,
): PresetEquipment[] {
	return getAllEquipments().filter((equipment) =>
		equipment.category.includes(category),
	)
}

// IDで装備を取得
export function getEquipmentById(id: string): PresetEquipment | null {
	return getAllEquipments().find((equipment) => equipment.id === id) || null
}

// ストレージキー
const STORAGE_KEYS = {
	PRESET_EQUIPMENTS: 'toram_preset_equipments',
	CUSTOM_EQUIPMENTS: 'toram_custom_equipments',
} as const

// ローカルストレージからプリセット装備を取得（新システム）
export function getLocalStorageEquipments(): LocalStorageEquipment[] {
	try {
		const stored = localStorage.getItem(STORAGE_KEYS.PRESET_EQUIPMENTS)
		return stored ? JSON.parse(stored) : []
	} catch (error) {
		console.error('Failed to load preset equipments from localStorage:', error)
		return []
	}
}

// ローカルストレージからユーザーカスタム装備を取得
export function getUserCustomEquipments(): UserEquipment[] {
	try {
		const customData = localStorage.getItem(STORAGE_KEYS.CUSTOM_EQUIPMENTS)
		return customData ? JSON.parse(customData) : []
	} catch (error) {
		console.error('Failed to load custom equipments:', error)
		return []
	}
}

// ローカルストレージにユーザーカスタム装備を保存
export function saveUserCustomEquipment(equipment: UserEquipment): void {
	try {
		const customEquipments = getUserCustomEquipments()
		const existingIndex = customEquipments.findIndex(
			(item) => item.id === equipment.id,
		)

		if (existingIndex >= 0) {
			customEquipments[existingIndex] = equipment
		} else {
			customEquipments.push(equipment)
		}

		localStorage.setItem(
			STORAGE_KEYS.CUSTOM_EQUIPMENTS,
			JSON.stringify(customEquipments),
		)
	} catch (error) {
		console.error('Failed to save custom equipment:', error)
	}
}

// プリセット装備のお気に入り状態を更新
export function toggleEquipmentFavorite(id: string): void {
	try {
		const presetEquipments = getLocalStorageEquipments()
		const index = presetEquipments.findIndex((item) => item.id === id)

		if (index >= 0) {
			presetEquipments[index].isFavorite = !presetEquipments[index].isFavorite
			presetEquipments[index].isModified = true
			presetEquipments[index].modifiedAt = new Date().toISOString()
			presetEquipments[index].updatedAt = new Date().toISOString()

			localStorage.setItem(
				STORAGE_KEYS.PRESET_EQUIPMENTS,
				JSON.stringify(presetEquipments),
			)
		}
	} catch (error) {
		console.error('Failed to toggle equipment favorite:', error)
	}
}

// プリセット装備のプロパティを更新
export function updatePresetEquipment(
	id: string,
	updates: Partial<LocalStorageEquipment>,
): void {
	try {
		const presetEquipments = getLocalStorageEquipments()
		const index = presetEquipments.findIndex((item) => item.id === id)

		if (index >= 0) {
			presetEquipments[index] = {
				...presetEquipments[index],
				...updates,
				isModified: true,
				modifiedAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}

			localStorage.setItem(
				STORAGE_KEYS.PRESET_EQUIPMENTS,
				JSON.stringify(presetEquipments),
			)
		}
	} catch (error) {
		console.error('Failed to update preset equipment:', error)
	}
}

// プリセット + ユーザーカスタム装備を統合して取得（新システム）
export function getAllAvailableEquipments(): Equipment[] {
	const presetEquipments = getLocalStorageEquipments()
	const customEquipments = getUserCustomEquipments()

	// カスタム装備をCustomEquipment形式に変換
	const formattedCustomEquipments: Equipment[] = customEquipments.map(
		(equipment) => ({
			id: equipment.id,
			name: equipment.name,
			type: 'weapon' as const, // UserEquipmentにtypeがないのでデフォルト値
			category: [equipment.category] as EquipmentCategory[], // 単一カテゴリを配列に変換
			baseStats: equipment.weaponStats || {}, // weaponStatsをbaseStatsにマップ
			properties: equipment.properties,
			isPreset: false as const,
			isCustom: true as const,
			isFavorite: equipment.isFavorite,
			isModified: false,
			createdAt: equipment.createdAt,
			updatedAt: equipment.updatedAt,
		}),
	)

	return [...presetEquipments, ...formattedCustomEquipments]
}

// 統合装備からIDで取得
export function getAvailableEquipmentById(id: string): Equipment | null {
	return (
		getAllAvailableEquipments().find((equipment) => equipment.id === id) || null
	)
}

// カテゴリ別の統合装備リストを取得
export function getAvailableEquipmentsByCategory(
	category: EquipmentCategory,
): Equipment[] {
	return getAllAvailableEquipments().filter((equipment) => {
		if (!equipment.category) return false

		// mainカテゴリを検索する時はmainWeaponカテゴリも含める
		if (category === 'main') {
			return (
				equipment.category.includes('main') ||
				equipment.category.includes('mainWeapon')
			)
		}

		return equipment.category.includes(category)
	})
}

// 装備タイプ別の統合装備リストを取得
export function getAvailableEquipmentsByType(type: EquipmentType): Equipment[] {
	return getAllAvailableEquipments().filter(
		(equipment) => equipment.type === type,
	)
}

// 装備の表示名を取得（装備タイプに応じたラベル）
export function getEquipmentTypeLabel(type: EquipmentType): string {
	switch (type) {
		case 'weapon':
			return '武器'
		case 'armor':
			return '防具'
		case 'accessory':
			return 'アクセサリ'
		case 'fashion':
			return 'オシャレ'
		default:
			return type
	}
}

// 装備カテゴリの表示名を取得
export function getEquipmentCategoryLabel(category: EquipmentCategory): string {
	switch (category) {
		case 'main':
			return 'メイン装備'
		case 'mainWeapon':
			return 'メイン武器'
		case 'body':
			return '体装備'
		case 'additional':
			return '追加装備'
		case 'special':
			return '特殊装備'
		case 'subWeapon':
			return 'サブ武器'
		case 'fashion1':
			return 'オシャレ1'
		case 'fashion2':
			return 'オシャレ2'
		case 'fashion3':
			return 'オシャレ3'
		case 'freeInput1':
			return '自由入力1'
		case 'freeInput2':
			return '自由入力2'
		case 'freeInput3':
			return '自由入力3'
		default:
			return category
	}
}

// 装備カテゴリ表示名を取得
export function getEquipmentCategoryDisplayName(
	category: EquipmentCategory,
): string {
	switch (category) {
		case 'main':
			return 'メイン装備'
		case 'body':
			return '体装備'
		case 'additional':
			return '追加装備'
		case 'special':
			return '特殊装備'
		case 'subWeapon':
			return 'サブ武器'
		case 'fashion1':
			return 'オシャレ1'
		case 'fashion2':
			return 'オシャレ2'
		case 'fashion3':
			return 'オシャレ3'
		case 'freeInput1':
			return '自由入力1'
		case 'freeInput2':
			return '自由入力2'
		case 'freeInput3':
			return '自由入力3'
		default:
			return category
	}
}

// 装備カテゴリ別の初期名を生成
export function generateInitialEquipmentName(
	category: EquipmentCategory,
): string {
	const timestamp = Date.now().toString().slice(-4) // 末尾4桁を使用
	const categoryName = getEquipmentCategoryDisplayName(category)
	return `カスタム${categoryName}_${timestamp}`
}

// カスタム装備を作成（全装備スロット対応）
export function createCustomEquipment(
	equipmentCategory: EquipmentCategory,
	name: string,
): UserEquipment {
	const now = new Date().toISOString()
	const id = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`

	const customEquipment: UserEquipment = {
		id,
		name,
		category: equipmentCategory,
		properties: {}, // 全プロパティをリセット状態で作成
		// 武器系装備（メイン・サブ）には武器ステータスを初期化
		weaponStats:
			equipmentCategory === 'main' || equipmentCategory === 'subWeapon'
				? {
						ATK: 0,
						stability: 0,
						refinement: 0,
					}
				: undefined,
		// クリスタルスロット対応装備にはスロットを初期化
		crystalSlots: ['main', 'body', 'additional', 'special'].includes(
			equipmentCategory,
		)
			? {
					slot1: undefined,
					slot2: undefined,
				}
			: undefined,
		// 体装備の場合はarmorTypeにデフォルト値を設定
		armorType: equipmentCategory === 'body' ? 'normal' : undefined,
		createdAt: now,
		updatedAt: now,
		isFavorite: false,
	}

	return customEquipment
}

// カスタム装備を保存
export function saveCustomEquipment(equipment: UserEquipment): void {
	saveUserCustomEquipment(equipment)
}

// カスタム装備を削除
export function deleteCustomEquipment(equipmentId: string): void {
	try {
		const customEquipments = getUserCustomEquipments()
		const filteredEquipments = customEquipments.filter(
			(equipment) => equipment.id !== equipmentId,
		)

		localStorage.setItem(
			STORAGE_KEYS.CUSTOM_EQUIPMENTS,
			JSON.stringify(filteredEquipments),
		)
	} catch (error) {
		console.error('Failed to delete custom equipment:', error)
		throw error
	}
}

// カスタム装備をIDで取得
export function getCustomEquipmentById(id: string): UserEquipment | null {
	const customEquipments = getUserCustomEquipments()
	return customEquipments.find((equipment) => equipment.id === id) || null
}

// プリセット装備とカスタム装備を統合して取得（装備選択モーダル用）
export function getCombinedEquipmentsByCategory(
	equipmentCategory: EquipmentCategory,
): Equipment[] {
	const presetEquipments = getEquipmentsByCategory(equipmentCategory)
	const customEquipments = getUserCustomEquipments()
	const temporaryEquipments =
		getTemporaryEquipmentsByCategory(equipmentCategory)

	// カスタム装備を該当カテゴリでフィルタリング
	const filteredCustomEquipments = customEquipments.filter(
		(equipment) => equipment.category === equipmentCategory,
	)

	// カテゴリからタイプへのマップ
	const categoryToTypeMap: Record<EquipmentCategory, EquipmentType> = {
		main: 'weapon',
		mainWeapon: 'weapon',
		body: 'armor',
		additional: 'accessory',
		special: 'accessory',
		subWeapon: 'weapon',
		fashion1: 'fashion',
		fashion2: 'fashion',
		fashion3: 'fashion',
		freeInput1: 'accessory',
		freeInput2: 'accessory',
		freeInput3: 'accessory',
	}

	// カスタム装備をEquipment形式に変換
	const formattedCustomEquipments: Equipment[] = filteredCustomEquipments.map(
		(equipment) => ({
			id: equipment.id,
			name: equipment.name,
			type: categoryToTypeMap[equipment.category],
			category: [equipment.category] as EquipmentCategory[],
			baseStats: equipment.weaponStats || {},
			properties: equipment.properties,
			armorType: equipment.armorType,
			isPreset: false,
			isCustom: true,
			isFavorite: equipment.isFavorite,
			isModified: false,
			createdAt: equipment.createdAt,
			updatedAt: equipment.updatedAt,
		}),
	)

	// 仮データ装備をEquipment形式に変換
	const formattedTemporaryEquipments: Equipment[] = temporaryEquipments.map(
		(equipment) => ({
			id: equipment.id,
			name: `${equipment.name} (未保存)`,
			type: categoryToTypeMap[equipment.category],
			category: [equipment.category] as EquipmentCategory[],
			baseStats: equipment.weaponStats || {},
			properties: equipment.properties,
			isPreset: false,
			isCustom: true,
			isFavorite: equipment.isFavorite,
			isModified: false,
			createdAt: equipment.createdAt,
			updatedAt: equipment.updatedAt,
		}),
	)

	// プリセット装備とカスタム装備、仮データを結合
	const convertedPresetEquipments = presetEquipments.map((preset) => ({
		...preset,
		isPreset: true as const,
		isFavorite: false,
		isModified: false,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	}))

	return [
		...convertedPresetEquipments,
		...formattedCustomEquipments,
		...formattedTemporaryEquipments,
	]
}

// 統合装備をIDで取得（プリセット・カスタム・編集セッション対応）
export function getCombinedEquipmentById(id: string): Equipment | null {
	const categoryToTypeMap: Record<EquipmentCategory, EquipmentType> = {
		main: 'weapon',
		mainWeapon: 'weapon',
		body: 'armor',
		additional: 'accessory',
		special: 'accessory',
		subWeapon: 'weapon',
		fashion1: 'fashion',
		fashion2: 'fashion',
		fashion3: 'fashion',
		freeInput1: 'accessory',
		freeInput2: 'accessory',
		freeInput3: 'accessory',
	}

	// 編集セッション中のデータから検索（最優先）
	const editSessionEquipment = getEditSessionEquipment(id)
	if (editSessionEquipment) {
		return {
			id: editSessionEquipment.id,
			name: `${editSessionEquipment.name} (編集中)`,
			type: categoryToTypeMap[editSessionEquipment.category],
			category: [editSessionEquipment.category],
			baseStats: editSessionEquipment.weaponStats || {},
			properties: editSessionEquipment.properties,
			isPreset: false,
			isCustom: true,
			isFavorite: editSessionEquipment.isFavorite,
			isModified: true,
			createdAt: editSessionEquipment.createdAt,
			updatedAt: editSessionEquipment.updatedAt,
		}
	}

	// 仮データから検索（第二優先）
	const temporaryEquipment = getTemporaryEquipmentById(id)
	if (temporaryEquipment) {
		return {
			id: temporaryEquipment.id,
			name: `${temporaryEquipment.name} (未保存)`,
			type: categoryToTypeMap[temporaryEquipment.category],
			category: [temporaryEquipment.category],
			baseStats: temporaryEquipment.weaponStats || {},
			properties: temporaryEquipment.properties,
			isPreset: false,
			isCustom: true,
			isFavorite: temporaryEquipment.isFavorite,
			isModified: false,
			createdAt: temporaryEquipment.createdAt,
			updatedAt: temporaryEquipment.updatedAt,
		}
	}

	// プリセット装備から検索
	const presetEquipment = getEquipmentById(id)
	if (presetEquipment) {
		return {
			...presetEquipment,
			isPreset: true as const,
			isFavorite: false,
			isModified: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}
	}

	// カスタム装備から検索
	const customEquipment = getCustomEquipmentById(id)
	if (customEquipment) {
		return {
			id: customEquipment.id,
			name: customEquipment.name,
			type: categoryToTypeMap[customEquipment.category],
			category: [customEquipment.category],
			baseStats: customEquipment.weaponStats || {},
			properties: customEquipment.properties,
			armorType: customEquipment.armorType,
			isPreset: false,
			isCustom: true,
			isFavorite: customEquipment.isFavorite,
			isModified: false,
			createdAt: customEquipment.createdAt,
			updatedAt: customEquipment.updatedAt,
		}
	}

	return null
}

// カスタム装備のプロパティを更新（編集セッション・仮データ・永続データ対応）
export function updateCustomEquipmentProperties(
	id: string,
	properties: Partial<EquipmentProperties>,
): boolean {
	// 編集セッション中のデータ更新を試行（最優先）
	if (isInEditSession(id)) {
		return updateEditSessionProperties(id, properties)
	}

	// 仮データから更新を試行
	if (isTemporaryEquipment(id)) {
		try {
			const {
				updateTemporaryEquipmentProperties,
			} = require('./temporaryEquipmentManager')
			return updateTemporaryEquipmentProperties(id, properties)
		} catch (error) {
			console.error('Failed to update temporary equipment properties:', error)
			return false
		}
	}

	// カスタム装備の場合は編集セッションを開始してから更新
	const customEquipment = getCustomEquipmentById(id)
	if (customEquipment) {
		// 編集セッションを開始
		const editableEquipment = startEditSession(customEquipment)
		// 編集セッション内でプロパティを更新
		return updateEditSessionProperties(editableEquipment.id, properties)
	}

	return false
}

// 仮データが存在するかチェック
export function hasTemporaryEquipments(): boolean {
	return getAllTemporaryEquipments().length > 0
}

// 編集セッション中のデータが存在するかチェック
export function hasEditSessions(): boolean {
	return getAllEditSessionEquipments().length > 0
}

// カスタム装備の名前を変更（全データ層対応）
export function renameCustomEquipment(id: string, newName: string): boolean {
	let updated = false

	// 1. 編集セッション中のデータがある場合は編集セッション内で更新
	if (isInEditSession(id)) {
		try {
			const { updateEditSessionName } = require('./editSessionManager')
			if (updateEditSessionName(id, newName)) {
				updated = true
			}
		} catch (error) {
			console.error('Failed to update edit session name:', error)
		}
	}

	// 2. 仮データの場合は仮データを更新
	if (isTemporaryEquipment(id)) {
		try {
			const {
				updateTemporaryEquipmentName,
			} = require('./temporaryEquipmentManager')
			if (updateTemporaryEquipmentName(id, newName)) {
				updated = true
			}
		} catch (error) {
			console.error('Failed to update temporary equipment name:', error)
		}
	}

	// 3. 永続データのカスタム装備を更新
	const customEquipment = getCustomEquipmentById(id)
	if (customEquipment) {
		try {
			const updatedEquipment: UserEquipment = {
				...customEquipment,
				name: newName,
				updatedAt: new Date().toISOString(),
			}
			saveUserCustomEquipment(updatedEquipment)
			updated = true
		} catch (error) {
			console.error('Failed to update custom equipment name:', error)
		}
	}

	return updated
}

// ArmorTypeを更新（プリセット・カスタム装備対応）
export function updateEquipmentArmorType(
	id: string,
	armorType: ArmorType,
): boolean {
	console.log('updateEquipmentArmorType called:', { id, armorType })

	// カスタム装備の場合を先に確認
	const customEquipment = getCustomEquipmentById(id)
	if (customEquipment) {
		console.log('Found custom equipment:', customEquipment.name)
		try {
			const { updateUserEquipment } = require('./customEquipmentManager')
			updateUserEquipment(id, { armorType })
			console.log('Custom equipment armorType updated successfully')
			return true
		} catch (error) {
			console.error('Failed to update custom equipment armor type:', error)
			return false
		}
	}

	// プリセット装備の場合（equipments.tsのデータを直接更新）
	const presetEquipment = getEquipmentById(id)
	if (presetEquipment) {
		console.log('Found preset equipment:', presetEquipment.name)
		// プリセット装備データを直接更新（メモリ上の変更）
		presetEquipment.armorType = armorType
		console.log('Preset equipment armorType updated successfully')
		return true
	}

	console.log('No equipment found with id:', id)
	return false
}
