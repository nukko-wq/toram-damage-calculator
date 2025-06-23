/**
 * データソース統合ユーティリティ
 *
 * 4つのデータソース（装備品・クリスタ・料理・バフ）から
 * 補正値を取得して統合する機能を提供
 */

import type { AllBonuses } from './basicStatsCalculation'
import type {
	EquipmentBonusSource,
	CrystalBonusSource,
	FoodBonusSource,
	BuffBonusSource,
	DataSourceBonuses,
} from '@/types/bonusCalculation'
import type { CalculatorData } from '@/types/calculator'

/**
 * プロパティ値のバリデーション
 */
function validatePropertyValue(value: number, propertyId: string): number {
	// 数値チェック
	if (typeof value !== 'number' || isNaN(value)) return 0

	// 範囲チェック（プロパティ別）
	if (propertyId.includes('Rate')) {
		// %系は-100〜1000の範囲
		return Math.max(-100, Math.min(1000, value))
	} else {
		// 固定値系は-9999〜9999の範囲
		return Math.max(-9999, Math.min(9999, value))
	}
}

/**
 * 装備品データから補正値を取得
 */
export function getEquipmentBonuses(equipmentData: any): Partial<AllBonuses> {
	try {
		const bonuses: Partial<AllBonuses> = {}

		// nullチェック
		if (!equipmentData) return bonuses

		// 8スロット分のプロパティを統合
		const allSlots = [
			equipmentData.main,
			equipmentData.body,
			equipmentData.additional,
			equipmentData.special,
			equipmentData.sub,
			equipmentData.fashion1,
			equipmentData.fashion2,
			equipmentData.fashion3,
		].filter(Boolean)

		for (const slot of allSlots) {
			if (!slot?.selectedProperties) continue

			for (const prop of slot.selectedProperties) {
				if (!prop?.propertyId || typeof prop.value !== 'number') continue

				const validatedValue = validatePropertyValue(
					prop.value,
					prop.propertyId,
				)
				const key = prop.isPercentage
					? `${prop.propertyId}_Rate`
					: prop.propertyId

				bonuses[key as keyof AllBonuses] =
					(bonuses[key as keyof AllBonuses] || 0) + validatedValue
			}
		}

		return bonuses
	} catch (error) {
		console.error('Equipment bonus calculation error:', error)
		return {}
	}
}

/**
 * クリスタルデータから補正値を取得
 */
export function getCrystalBonuses(crystalData: any): Partial<AllBonuses> {
	try {
		const bonuses: Partial<AllBonuses> = {}

		// nullチェック
		if (!crystalData) return bonuses

		// 8スロット分のクリスタル効果を統合
		const allSlots = [
			crystalData.weapon1,
			crystalData.weapon2,
			crystalData.armor1,
			crystalData.armor2,
			crystalData.additional1,
			crystalData.additional2,
			crystalData.special1,
			crystalData.special2,
		].filter(Boolean)

		for (const slot of allSlots) {
			if (!slot?.effects) continue

			for (const effect of slot.effects) {
				if (!effect?.propertyId || typeof effect.value !== 'number') continue

				const validatedValue = validatePropertyValue(
					effect.value,
					effect.propertyId,
				)
				const key = effect.isPercentage
					? `${effect.propertyId}_Rate`
					: effect.propertyId

				bonuses[key as keyof AllBonuses] =
					(bonuses[key as keyof AllBonuses] || 0) + validatedValue
			}
		}

		return bonuses
	} catch (error) {
		console.error('Crystal bonus calculation error:', error)
		return {}
	}
}

/**
 * 料理データから補正値を取得
 */
export function getFoodBonuses(foodData: any): Partial<AllBonuses> {
	try {
		const bonuses: Partial<AllBonuses> = {}

		// nullチェック
		if (!foodData?.selectedFoods) return bonuses

		for (const food of foodData.selectedFoods) {
			if (!food?.propertyType || typeof food.value !== 'number') continue

			const validatedValue = validatePropertyValue(
				food.value,
				food.propertyType,
			)
			const key = food.isPercentage
				? `${food.propertyType}_Rate`
				: food.propertyType

			bonuses[key as keyof AllBonuses] =
				(bonuses[key as keyof AllBonuses] || 0) + validatedValue
		}

		return bonuses
	} catch (error) {
		console.error('Food bonus calculation error:', error)
		return {}
	}
}

/**
 * バフアイテムデータから補正値を取得
 */
export function getBuffBonuses(buffData: any): Partial<AllBonuses> {
	try {
		const bonuses: Partial<AllBonuses> = {}

		// nullチェック
		if (!buffData?.activeBuffs) return bonuses

		for (const buff of buffData.activeBuffs) {
			// 時間切れバフは除外
			if (!buff?.effects || buff.duration <= 0) continue

			for (const effect of buff.effects) {
				if (!effect?.propertyId || typeof effect.value !== 'number') continue

				const validatedValue = validatePropertyValue(
					effect.value,
					effect.propertyId,
				)
				const key = effect.isPercentage
					? `${effect.propertyId}_Rate`
					: effect.propertyId

				bonuses[key as keyof AllBonuses] =
					(bonuses[key as keyof AllBonuses] || 0) + validatedValue
			}
		}

		return bonuses
	} catch (error) {
		console.error('Buff bonus calculation error:', error)
		return {}
	}
}

/**
 * 全データソースを一括取得するヘルパー
 */
export function getAllDataSourceBonuses(
	data: CalculatorData,
): DataSourceBonuses {
	return {
		equipment: getEquipmentBonuses(data.equipment),
		crystal: getCrystalBonuses(data.crystals),
		food: getFoodBonuses(data.food),
		buff: getBuffBonuses(data.buffs),
	}
}

/**
 * データソースボーナスの統計情報を取得（デバッグ用）
 */
export function getDataSourceStats(bonuses: DataSourceBonuses) {
	const stats = {
		equipment: Object.keys(bonuses.equipment).length,
		crystal: Object.keys(bonuses.crystal).length,
		food: Object.keys(bonuses.food).length,
		buff: Object.keys(bonuses.buff).length,
		total: 0,
	}

	stats.total = stats.equipment + stats.crystal + stats.food + stats.buff

	return stats
}
