/**
 * 補正値計算用の型定義
 */

import type { AllBonuses } from '@/utils/basicStatsCalculation'

// 装備品データソース
export interface EquipmentBonusSource {
	main: EquipmentSlotBonus
	body: EquipmentSlotBonus
	additional: EquipmentSlotBonus
	special: EquipmentSlotBonus
	sub: EquipmentSlotBonus
	fashion1: EquipmentSlotBonus
	fashion2: EquipmentSlotBonus
	fashion3: EquipmentSlotBonus
}

export interface EquipmentSlotBonus {
	equipmentId?: string
	selectedProperties: Array<{
		propertyId: string
		value: number
		isPercentage: boolean
	}>
	refinementLevel: number
}

// クリスタルデータソース
export interface CrystalBonusSource {
	weapon1: CrystalSlotBonus
	weapon2: CrystalSlotBonus
	armor1: CrystalSlotBonus
	armor2: CrystalSlotBonus
	additional1: CrystalSlotBonus
	additional2: CrystalSlotBonus
	special1: CrystalSlotBonus
	special2: CrystalSlotBonus
}

export interface CrystalSlotBonus {
	crystalId?: string
	effects: Array<{
		propertyId: string
		value: number
		isPercentage: boolean
	}>
}

// 料理データソース
export interface FoodBonusSource {
	selectedFoods: Array<{
		foodId: string
		level: number
		propertyType: string
		value: number
		isPercentage: boolean
	}>
}

// バフアイテムデータソース
export interface BuffBonusSource {
	activeBuffs: Array<{
		buffId: string
		duration: number
		effects: Array<{
			propertyId: string
			value: number
			isPercentage: boolean
		}>
	}>
}

// データソース統合結果
export interface DataSourceBonuses {
	equipment: Partial<AllBonuses>
	crystal: Partial<AllBonuses>
	food: Partial<AllBonuses>
	buff: Partial<AllBonuses>
}

// 詳細データソース統合結果（フィルター機能用）
export interface DetailedDataSourceBonuses {
	equipment: {
		main: Partial<AllBonuses>
		body: Partial<AllBonuses>
		additional: Partial<AllBonuses>
		special: Partial<AllBonuses>
		subWeapon: Partial<AllBonuses>
		fashion1: Partial<AllBonuses>
		fashion2: Partial<AllBonuses>
		fashion3: Partial<AllBonuses>
		freeInput1: Partial<AllBonuses>
		freeInput2: Partial<AllBonuses>
		freeInput3: Partial<AllBonuses>
		enchantment: Partial<AllBonuses>
	}
	crystal: Partial<AllBonuses>
	food: Partial<AllBonuses>
	buffItems: Partial<AllBonuses>
	buffSkills: Partial<AllBonuses>
}

// フィルターオプション型
export type FilterOption =
	| 'all'
	| 'main'
	| 'subWeapon'
	| 'body'
	| 'additional'
	| 'special'
	| 'enchantment'
	| 'freeInput1'
	| 'freeInput2'
	| 'freeInput3'
	| 'crystal'
	| 'food'
	| 'buffItems'
	| 'buffSkills'
