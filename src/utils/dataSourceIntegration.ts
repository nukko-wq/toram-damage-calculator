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
import { getCrystalById } from './crystalDatabase'

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
 * プロパティ名を正規化（実際のデータ名 → AllBonuses型のキー名）
 */
function normalizePropertyKey(propertyKey: string): string {
	// プロパティ名のマッピング表
	const propertyMapping: Record<string, string> = {
		// 実際のデータ名 → AllBonuses型のキー名
		'Critical': 'criticalRate',        // 固定値
		'Critical_Rate': 'criticalRate_Rate', // %値
		'CriticalDamage': 'criticalDamage',
		'CriticalDamage_Rate': 'criticalDamage_Rate',
		'NaturalHPRecovery': 'naturalHPRecovery',
		'NaturalMPRecovery': 'naturalMPRecovery',
		'ElementAdvantage_Rate': 'elementPower_Rate',
		'PhysicalPenetration_Rate': 'physicalPenetration_Rate',
		'MagicalPenetration_Rate': 'magicalPenetration_Rate',
		'AttackSpeed': 'ASPD',
		'AttackSpeed_Rate': 'ASPD_Rate',
		'CastingSpeed': 'CSPD',
		'CastingSpeed_Rate': 'CSPD_Rate',
		'MotionSpeed_Rate': 'motionSpeed_Rate',
		'Stability_Rate': 'stability_Rate',
		'WeaponATK': 'weaponATK',
		'WeaponATK_Rate': 'weaponATK_Rate',
		'UnsheatheAttack': 'unsheatheAttack',
		'UnsheatheAttack_Rate': 'unsheatheAttack_Rate',
		'ShortRangeDamage_Rate': 'shortRangeDamage_Rate',
		'LongRangeDamage_Rate': 'longRangeDamage_Rate',
		'Accuracy': 'accuracy',
		'Accuracy_Rate': 'accuracy_Rate',
		'Dodge': 'dodge',
		'Dodge_Rate': 'dodge_Rate',
	}

	return propertyMapping[propertyKey] || propertyKey
}

/**
 * 装備品データから補正値を取得
 */
export function getEquipmentBonuses(equipmentData: any): Partial<AllBonuses> {
	try {
		const bonuses: Partial<AllBonuses> = {}

		// nullチェック
		if (!equipmentData) {
			console.log('Equipment data is null/undefined')
			return bonuses
		}

		console.log('Equipment data structure:', equipmentData)

		// 8スロット分のプロパティを統合（実際のデータ構造に合わせる）
		const allSlots = [
			equipmentData.main,
			equipmentData.body,
			equipmentData.additional,
			equipmentData.special,
			equipmentData.subWeapon,
			equipmentData.fashion1,
			equipmentData.fashion2,
			equipmentData.fashion3,
		].filter(Boolean)

		console.log(
			'All slots:',
			allSlots.map((slot) => ({
				name: slot?.name,
				properties: slot?.properties,
			})),
		)

		for (const slot of allSlots) {
			if (!slot?.properties) {
				console.log('Slot missing properties:', slot)
				continue
			}

			console.log('Processing slot:', slot.name, 'properties:', slot.properties)

			// propertiesオブジェクトの各プロパティを処理
			for (const [propertyKey, value] of Object.entries(slot.properties)) {
				if (typeof value !== 'number' || value === 0) continue

				console.log(`Found property: ${propertyKey} = ${value}`)

				const validatedValue = validatePropertyValue(value, propertyKey)
				const normalizedKey = normalizePropertyKey(propertyKey)

				console.log(`Normalized ${propertyKey} → ${normalizedKey}`)

				const previousValue = bonuses[normalizedKey as keyof AllBonuses] || 0
				const newValue = previousValue + validatedValue
				bonuses[normalizedKey as keyof AllBonuses] = newValue

				console.log(`Adding ${normalizedKey}: ${previousValue} + ${validatedValue} = ${newValue}`)
			}
		}

		// デバッグログ
		console.log('Equipment bonuses calculated:', JSON.stringify(bonuses, null, 2))

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

		// 8スロット分のクリスタルIDから実際のクリスタルデータを取得
		const slotIds = [
			crystalData.weapon1,
			crystalData.weapon2,
			crystalData.armor1,
			crystalData.armor2,
			crystalData.additional1,
			crystalData.additional2,
			crystalData.special1,
			crystalData.special2,
		].filter(Boolean)

		for (const crystalId of slotIds) {
			if (typeof crystalId !== 'string') continue

			const crystal = getCrystalById(crystalId)
			if (!crystal?.properties) continue

			// propertiesオブジェクトの各プロパティを処理
			for (const [propertyKey, value] of Object.entries(crystal.properties)) {
				if (typeof value !== 'number' || value === 0) continue

				const validatedValue = validatePropertyValue(value, propertyKey)
				const normalizedKey = normalizePropertyKey(propertyKey)

				bonuses[normalizedKey as keyof AllBonuses] =
					(bonuses[normalizedKey as keyof AllBonuses] || 0) + validatedValue
			}
		}

		// デバッグログ
		if (Object.keys(bonuses).length > 0) {
			console.log('Crystal bonuses calculated:', bonuses)
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
		buff: getBuffBonuses(data.buffItems),
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
