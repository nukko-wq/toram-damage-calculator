import type { PresetEquipment, EquipmentType, EquipmentCategory } from '@/types/calculator'
import equipmentsData from '@/data/equipments.json'

// プリセット装備データを取得
export function getAllEquipments(): PresetEquipment[] {
	const allEquipments: PresetEquipment[] = []
	
	// 各カテゴリの装備を統合
	const categories = ['weapons', 'armors', 'accessories', 'fashion', 'subWeapons'] as const
	
	categories.forEach(category => {
		if (equipmentsData[category]) {
			allEquipments.push(...equipmentsData[category])
		}
	})
	
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