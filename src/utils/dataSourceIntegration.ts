/**
 * データソース統合ユーティリティ
 *
 * 4つのデータソース（装備品・クリスタ・料理・バフ）から
 * 補正値を取得して統合する機能を提供
 */

import type { AllBonuses } from './basicStatsCalculation'
import { getBuffItemById as getBuffItemFromDB } from '@/utils/buffItemDatabase'
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
	}
		// 固定値系は-9999〜9999の範囲
		return Math.max(-9999, Math.min(9999, value))
}

/**
 * プロパティ名を正規化（実際のデータ名 → AllBonuses型のキー名）
 * 新しいAllBonusesインターフェースはEquipmentPropertiesと同じ命名規則を使用するため、
 * ほとんどのプロパティはそのまま使用可能
 */
function normalizePropertyKey(propertyKey: string): string {
	// 特殊な変換が必要なプロパティのみマッピング
	const propertyMapping: Record<string, string> = {
		// 料理プロパティ名の変換
		'elementAdvantage': 'ElementAdvantage_Rate',
		'weaponATK': 'WeaponATK',
		'criticalRate': 'Critical',
		'attackMPRecovery': 'AttackMPRecovery',
		'aggroPlus': 'Aggro', // 正の値として処理
		'aggroMinus': 'Aggro', // 負の値として処理
		'physicalResistance': 'PhysicalResistance_Rate',
		'magicalResistance': 'MagicalResistance_Rate',
		
		// レガシー名称の変換
		'AbsoluteEvasion': 'AbsoluteDodge_Rate',
		'AbsoluteEvasion_Rate': 'AbsoluteDodge_Rate',
		'ItemSpeed': 'ItemCooldown',
		'ToolSpeed': 'ItemCooldown',
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
			return bonuses
		}

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


		for (const slot of allSlots) {
			if (!slot?.properties) {
				continue
			}

			// propertiesオブジェクトの各プロパティを処理
			for (const [propertyKey, value] of Object.entries(slot.properties)) {
				if (typeof value !== 'number' || value === 0) continue

				const validatedValue = validatePropertyValue(value, propertyKey)
				
				// Aggro値の特殊処理（料理の aggroPlus/aggroMinus → Aggro統合）
				if (propertyKey === 'aggroPlus' || propertyKey === 'aggroMinus') {
					const normalizedKey = 'Aggro'
					const previousValue = bonuses[normalizedKey as keyof AllBonuses] || 0
					const adjustedValue = propertyKey === 'aggroMinus' ? -Math.abs(validatedValue) : validatedValue
					bonuses[normalizedKey as keyof AllBonuses] = previousValue + adjustedValue
				} else {
					const normalizedKey = normalizePropertyKey(propertyKey)
					const previousValue = bonuses[normalizedKey as keyof AllBonuses] || 0
					const newValue = previousValue + validatedValue
					bonuses[normalizedKey as keyof AllBonuses] = newValue
				}
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
		if (!foodData) return bonuses

		// 5スロット分のデータを確認
		const slots = [
			foodData.slot1,
			foodData.slot2,
			foodData.slot3,
			foodData.slot4,
			foodData.slot5,
		].filter(Boolean)

		for (const slot of slots) {
			// 「なし」やレベル0はスキップ
			if (!slot?.selectedFood || slot.selectedFood === 'none' || slot.level <= 0) {
				continue
			}

			// 料理IDとレベルから効果値を取得
			const foodEffect = getFoodEffectByIdAndLevel(slot.selectedFood, slot.level)
			if (!foodEffect) continue

			const validatedValue = validatePropertyValue(
				foodEffect.value,
				foodEffect.propertyType,
			)

			// プロパティ名を正規化
			const normalizedKey = normalizePropertyKey(foodEffect.propertyType)
			const key = foodEffect.isPercentage
				? `${normalizedKey}_Rate`
				: normalizedKey

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
 * 料理IDとレベルから効果データを取得
 */
function getFoodEffectByIdAndLevel(foodId: string, level: number): {
	propertyType: string
	value: number
	isPercentage: boolean
} | null {
	// 料理データマッピング（設計書に基づく）
	const foodEffects: Record<string, {
		propertyType: string
		isPercentage: boolean
		values: number[] // Lv1-10の効果値配列
	}> = {
		// HP系料理
		'golden_fried_rice': {
			propertyType: 'HP',
			isPercentage: false,
			values: [400, 800, 1200, 1600, 2000, 2600, 3200, 3800, 4400, 5000]
		},
		
		// MP系料理
		'ankake_fried_rice': {
			propertyType: 'MP',
			isPercentage: false,
			values: [60, 120, 180, 240, 300, 440, 580, 720, 860, 1000]
		},
		
		// クリ率系料理
		'takoyaki': {
			propertyType: 'criticalRate',
			isPercentage: false,
			values: [2, 4, 6, 8, 10, 14, 18, 22, 26, 30]
		},
		
		// 攻撃MP回復系料理
		'yakisoba': {
			propertyType: 'attackMPRecovery',
			isPercentage: false,
			values: [2, 4, 6, 8, 10, 14, 18, 22, 26, 30]
		},
		
		// 武器ATK系料理
		'margherita_pizza': {
			propertyType: 'weaponATK',
			isPercentage: false,
			values: [6, 12, 18, 24, 30, 44, 58, 72, 86, 100]
		},
		
		// ATK系料理
		'diabola_pizza': {
			propertyType: 'ATK',
			isPercentage: false,
			values: [6, 12, 18, 24, 30, 44, 58, 72, 86, 100]
		},
		
		// おにぎり系（ステータス）
		'okaka_onigiri': {
			propertyType: 'STR',
			isPercentage: false,
			values: [2, 4, 6, 8, 10, 14, 18, 22, 26, 30]
		},
		'sake_onigiri': {
			propertyType: 'DEX',
			isPercentage: false,
			values: [2, 4, 6, 8, 10, 14, 18, 22, 26, 30]
		},
		'umeboshi_onigiri': {
			propertyType: 'INT',
			isPercentage: false,
			values: [2, 4, 6, 8, 10, 14, 18, 22, 26, 30]
		},
		'mentaiko_onigiri': {
			propertyType: 'AGI',
			isPercentage: false,
			values: [2, 4, 6, 8, 10, 14, 18, 22, 26, 30]
		},
		'tuna_mayo_onigiri': {
			propertyType: 'VIT',
			isPercentage: false,
			values: [2, 4, 6, 8, 10, 14, 18, 22, 26, 30]
		},
		
		// ラーメン系
		'shoyu_ramen': {
			propertyType: 'accuracy',
			isPercentage: false,
			values: [6, 12, 18, 24, 30, 44, 58, 72, 86, 100]
		},
		
		// パスタ系
		'zokusei_pasta': {
			propertyType: 'elementAdvantage',
			isPercentage: false,
			values: [1, 2, 3, 4, 5, 7, 9, 11, 13, 15]
		},
		
		// ピザ系（その他）
		'seafood_pizza': {
			propertyType: 'MATK',
			isPercentage: false,
			values: [6, 12, 18, 24, 30, 44, 58, 72, 86, 100]
		},
		
		// シチュー系
		'beef_stew': {
			propertyType: 'aggroPlus',
			isPercentage: false,
			values: [6, 12, 18, 24, 30, 44, 58, 72, 86, 100]
		},
		'white_stew': {
			propertyType: 'aggroMinus',
			isPercentage: false,
			values: [-6, -12, -18, -24, -30, -44, -58, -72, -86, -100]
		},
		
		// バーガー系
		'beef_burger': {
			propertyType: 'physicalResistance',
			isPercentage: false,
			values: [4, 8, 12, 16, 20, 26, 32, 38, 44, 50]
		},
		'fish_burger': {
			propertyType: 'magicalResistance',
			isPercentage: false,
			values: [4, 8, 12, 16, 20, 26, 32, 38, 44, 50]
		},
	}

	const effect = foodEffects[foodId]
	if (!effect || level < 1 || level > 10) return null

	return {
		propertyType: effect.propertyType,
		value: effect.values[level - 1], // 配列は0ベースなのでlevel-1
		isPercentage: effect.isPercentage
	}
}

/**
 * バフアイテムデータから補正値を取得
 */
export function getBuffBonuses(buffData: any): Partial<AllBonuses> {
	try {
		const bonuses: Partial<AllBonuses> = {}

		// nullチェック
		if (!buffData) return bonuses

		// 12カテゴリのバフアイテムを確認
		const categories = [
			'physicalPower', 'magicalPower', 'physicalDefense', 'magicalDefense',
			'elementalAttack', 'elementalDefense', 'speed', 'casting',
			'mp', 'hp', 'accuracy', 'evasion'
		]

		for (const category of categories) {
			const itemId = buffData[category]
			if (!itemId) continue

			// アイテムIDからアイテムデータを取得
			const buffItem = getBuffItemById(itemId)
			if (!buffItem?.properties) continue

			// プロパティを処理
			for (const [propertyKey, value] of Object.entries(buffItem.properties)) {
				if (typeof value !== 'number' || value === 0) continue

				const validatedValue = validatePropertyValue(value, propertyKey)
				const normalizedKey = normalizePropertyKey(propertyKey)

				bonuses[normalizedKey as keyof AllBonuses] =
					(bonuses[normalizedKey as keyof AllBonuses] || 0) + validatedValue
			}
		}

		return bonuses
	} catch (error) {
		console.error('Buff bonus calculation error:', error)
		return {}
	}
}

/**
 * バフアイテムIDからアイテムデータを取得
 */
function getBuffItemById(id: string): { properties: Record<string, number> } | null {
	// buffItemDatabase.tsのgetBuffItemById関数を使用
	try {
		const buffItem = getBuffItemFromDB(id)
		
		if (!buffItem?.properties) {
			return null
		}

		return {
			properties: buffItem.properties
		}
	} catch (error) {
		console.error('Error loading buff item:', error)
		return null
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
