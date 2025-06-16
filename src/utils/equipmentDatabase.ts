import type { PresetEquipment, EquipmentType, EquipmentCategory } from '@/types/calculator'
import equipmentsData from '@/data/equipments.json'

// 新しいJSON構造の型定義
interface EquipmentsJsonStructure {
	equipments: {
		mainWeapon?: Array<{
			id: string
			name: string
			weaponStats?: {
				ATK?: number
				stability?: number
				refinement?: number
			}
			properties?: Record<string, number>
			source?: string
		}>
		body?: Array<{
			id: string
			name: string
			properties?: Record<string, number>
			source?: string
		}>
		additional?: Array<{
			id: string
			name: string
			properties?: Record<string, number>
			source?: string
		}>
		special?: Array<{
			id: string
			name: string
			properties?: Record<string, number>
			source?: string
		}>
		subWeapon?: Array<{
			id: string
			name: string
			properties?: Record<string, number>
			source?: string
		}>
		fashion1?: Array<{
			id: string
			name: string
			properties?: Record<string, number>
			source?: string
		}>
		fashion2?: Array<{
			id: string
			name: string
			properties?: Record<string, number>
			source?: string
		}>
		fashion3?: Array<{
			id: string
			name: string
			properties?: Record<string, number>
			source?: string
		}>
	}
}

// プリセット装備データを取得
export function getAllEquipments(): PresetEquipment[] {
	const allEquipments: PresetEquipment[] = []
	
	// 新しいJSON構造に対応
	const equipmentsRoot = (equipmentsData as EquipmentsJsonStructure).equipments
	
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
				properties: item.properties || {},
				source: item.source
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
				properties: item.properties || {},
				source: item.source
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
				properties: item.properties || {},
				source: item.source
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
				properties: item.properties || {},
				source: item.source
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
				properties: item.properties || {},
				source: item.source
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
				properties: item.properties || {},
				source: item.source
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
				properties: item.properties || {},
				source: item.source
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
				properties: item.properties || {},
				source: item.source
			})
		}
	}
	
	return allEquipments
}

// 装備タイプでフィルタリング
export function getEquipmentsByType(type: EquipmentType): PresetEquipment[] {
	return getAllEquipments().filter(equipment => equipment.type === type)
}

// 装備カテゴリでフィルタリング
export function getEquipmentsByCategory(category: EquipmentCategory): PresetEquipment[] {
	return getAllEquipments().filter(equipment => 
		equipment.category.includes(category)
	)
}

// IDで装備を取得
export function getEquipmentById(id: string): PresetEquipment | null {
	return getAllEquipments().find(equipment => equipment.id === id) || null
}

// LocalStorageからユーザーカスタム装備を取得
export function getUserCustomEquipments(): PresetEquipment[] {
	try {
		const customData = localStorage.getItem('custom_equipments')
		return customData ? JSON.parse(customData) : []
	} catch (error) {
		console.error('Failed to load custom equipments:', error)
		return []
	}
}

// LocalStorageにユーザーカスタム装備を保存
export function saveUserCustomEquipment(equipment: PresetEquipment): void {
	try {
		const customEquipments = getUserCustomEquipments()
		const existingIndex = customEquipments.findIndex(item => item.id === equipment.id)
		
		if (existingIndex >= 0) {
			customEquipments[existingIndex] = equipment
		} else {
			customEquipments.push(equipment)
		}
		
		localStorage.setItem('custom_equipments', JSON.stringify(customEquipments))
	} catch (error) {
		console.error('Failed to save custom equipment:', error)
	}
}

// プリセット + ユーザーカスタム装備を統合して取得
export function getAllAvailableEquipments(): PresetEquipment[] {
	const presetEquipments = getAllEquipments()
	const customEquipments = getUserCustomEquipments()
	
	return [...presetEquipments, ...customEquipments]
}

// カテゴリ別の統合装備リストを取得
export function getAvailableEquipmentsByCategory(category: EquipmentCategory): PresetEquipment[] {
	return getAllAvailableEquipments().filter(equipment => 
		equipment.category.includes(category)
	)
}

// 装備タイプ別の統合装備リストを取得
export function getAvailableEquipmentsByType(type: EquipmentType): PresetEquipment[] {
	return getAllAvailableEquipments().filter(equipment => equipment.type === type)
}

// 装備の表示名を取得（装備タイプに応じたラベル）
export function getEquipmentTypeLabel(type: EquipmentType): string {
	switch (type) {
		case 'weapon': return '武器'
		case 'armor': return '防具'
		case 'accessory': return 'アクセサリ'
		case 'fashion': return 'オシャレ'
		default: return type
	}
}

// 装備カテゴリの表示名を取得
export function getEquipmentCategoryLabel(category: EquipmentCategory): string {
	switch (category) {
		case 'main': return 'メイン装備'
		case 'mainWeapon': return 'メイン武器'
		case 'body': return '体装備'
		case 'additional': return '追加装備'
		case 'special': return '特殊装備'
		case 'subWeapon': return 'サブ武器'
		case 'fashion1': return 'オシャレ1'
		case 'fashion2': return 'オシャレ2'
		case 'fashion3': return 'オシャレ3'
		default: return category
	}
}