/**
 * データソース統合ユーティリティ
 *
 * 4つのデータソース（装備品・クリスタ・料理・バフ）から
 * 補正値を取得して統合する機能を提供
 */

import type {
	BuffBonusSource,
	CrystalBonusSource,
	DataSourceBonuses,
	DetailedDataSourceBonuses,
	EquipmentBonusSource,
	FoodBonusSource,
} from '@/types/bonusCalculation'
import type { CalculatorData, RegisterFormData } from '@/types/calculator'
import { getBuffItemById as getBuffItemFromDB } from '@/utils/buffItemDatabase'
import type { AllBonuses } from './basicStatsCalculation'
import {
	getArcheryEffects,
	getAssassinSkillEffects,
	getBuffSkillBonuses,
	getCamouflageEffects,
	getFrontlineMaintenance2Effects,
	getGodspeedTrajectoryEffects,
	getPetBraveUpEffects,
	getPetCriticalUpEffects,
	getPetCutUpEffects,
	getPetMindUpEffects,
	getTwoHandsEffects,
} from './buffSkillCalculation'
import { getBattleSkillBonusesWithPlayerLevel } from './buffSkillCalculation/categories/battleSkills'
import { applyConditionalCrystalEffects } from './crystalConditionalEffects'
import { getCrystalById } from './crystalDatabase'
import { getPresetEnemyById } from './enemyDatabase'
import { recalculateEquipmentEffects } from './equipmentConditionalEffects'

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
		elementAdvantage: 'ElementAdvantage_Rate',
		weaponATK: 'WeaponATK',
		criticalRate: 'Critical',
		attackMPRecovery: 'AttackMPRecovery',
		accuracy: 'Accuracy', // 命中の正規化を追加
		physicalResistance: 'PhysicalResistance_Rate',
		magicalResistance: 'MagicalResistance_Rate',

		// レガシー名称の変換
		AbsoluteEvasion: 'AbsoluteDodge_Rate',
		AbsoluteEvasion_Rate: 'AbsoluteDodge_Rate',
		ItemSpeed: 'ItemCooldown',
		ToolSpeed: 'ItemCooldown',
	}

	return propertyMapping[propertyKey] || propertyKey
}

/**
 * 装備品データから補正値を取得（条件付き効果対応版）
 */
export function getEquipmentBonusesWithConditionalEffects(
	data: CalculatorData,
): Partial<AllBonuses> {
	try {
		const bonuses: Partial<AllBonuses> = {}

		// nullチェック
		if (!data.equipment) return bonuses

		// 条件付き効果を適用した最終的なプロパティを取得
		const effectiveProperties = recalculateEquipmentEffects(
			data.equipment,
			data.mainWeapon,
			data.subWeapon,
		)

		// 最終的なプロパティから補正値を計算
		for (const [propertyKey, value] of Object.entries(effectiveProperties)) {
			if (typeof value !== 'number' || value === 0) continue

			const validatedValue = validatePropertyValue(value, propertyKey)

			const normalizedKey = normalizePropertyKey(propertyKey)
			bonuses[normalizedKey as keyof AllBonuses] =
				(bonuses[normalizedKey as keyof AllBonuses] || 0) + validatedValue
		}

		return bonuses
	} catch (error) {
		console.error('Error in getEquipmentBonusesWithConditionalEffects:', error)
		return {}
	}
}

/**
 * 装備品データから補正値を取得（従来版）
 */
export function getEquipmentBonuses(equipmentData: any): Partial<AllBonuses> {
	try {
		const bonuses: Partial<AllBonuses> = {}

		// nullチェック
		if (!equipmentData) {
			return bonuses
		}

		// 11スロット分のプロパティを統合（従来8スロット + 自由入力3スロット）
		const allSlots = [
			equipmentData.mainWeapon,
			equipmentData.body,
			equipmentData.additional,
			equipmentData.special,
			equipmentData.subWeapon,
			equipmentData.fashion1,
			equipmentData.fashion2,
			equipmentData.fashion3,
			equipmentData.freeInput1,
			equipmentData.freeInput2,
			equipmentData.freeInput3,
		].filter(Boolean)

		for (const slot of allSlots) {
			if (!slot?.properties) {
				continue
			}

			// propertiesオブジェクトの各プロパティを処理
			for (const [propertyKey, value] of Object.entries(slot.properties)) {
				if (typeof value !== 'number' || value === 0) continue

				const validatedValue = validatePropertyValue(value, propertyKey)

				const normalizedKey = normalizePropertyKey(propertyKey)
				const previousValue = bonuses[normalizedKey as keyof AllBonuses] || 0
				const newValue = previousValue + validatedValue
				bonuses[normalizedKey as keyof AllBonuses] = newValue
			}
		}

		return bonuses
	} catch (error) {
		console.error('Equipment bonus calculation error:', error)
		return {}
	}
}

/**
 * クリスタルデータから補正値を取得（条件付き効果対応版）
 */
export function getCrystalBonusesWithConditionalEffects(
	data: CalculatorData,
): Partial<AllBonuses> {
	try {
		const bonuses: Partial<AllBonuses> = {}

		// nullチェック
		if (!data.crystals) return bonuses

		// 8スロット分のクリスタルIDから実際のクリスタルデータを取得
		const slotIds = [
			data.crystals.weapon1,
			data.crystals.weapon2,
			data.crystals.armor1,
			data.crystals.armor2,
			data.crystals.additional1,
			data.crystals.additional2,
			data.crystals.special1,
			data.crystals.special2,
		].filter(Boolean)

		for (const crystalId of slotIds) {
			if (typeof crystalId !== 'string') continue

			const crystal = getCrystalById(crystalId)
			if (!crystal?.properties) continue

			// 条件付き効果を適用した最終的なプロパティを取得
			const effectiveProperties = applyConditionalCrystalEffects(
				crystal,
				data.equipment,
				data.mainWeapon,
				data.subWeapon,
			)

			// 最終的なプロパティから補正値を計算
			for (const [propertyKey, value] of Object.entries(effectiveProperties)) {
				if (typeof value !== 'number' || value === 0) continue

				const validatedValue = validatePropertyValue(value, propertyKey)

				const normalizedKey = normalizePropertyKey(propertyKey)
				bonuses[normalizedKey as keyof AllBonuses] =
					(bonuses[normalizedKey as keyof AllBonuses] || 0) + validatedValue
			}
		}

		return bonuses
	} catch (error) {
		console.error('Error in getCrystalBonusesWithConditionalEffects:', error)
		return {}
	}
}

/**
 * クリスタルデータから補正値を取得（従来版）
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

			// 基本プロパティの処理
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
			if (
				!slot?.selectedFood ||
				slot.selectedFood === 'none' ||
				slot.level <= 0
			) {
				continue
			}

			// 料理IDとレベルから効果値を取得
			const foodEffect = getFoodEffectByIdAndLevel(
				slot.selectedFood,
				slot.level,
			)
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
function getFoodEffectByIdAndLevel(
	foodId: string,
	level: number,
): {
	propertyType: string
	value: number
	isPercentage: boolean
} | null {
	// 料理データマッピング（設計書に基づく）
	const foodEffects: Record<
		string,
		{
			propertyType: string
			isPercentage: boolean
			values: number[] // Lv1-10の効果値配列
		}
	> = {
		// HP系料理
		golden_fried_rice: {
			propertyType: 'HP',
			isPercentage: false,
			values: [400, 800, 1200, 1600, 2000, 2600, 3200, 3800, 4400, 5000],
		},

		// MP系料理
		ankake_fried_rice: {
			propertyType: 'MP',
			isPercentage: false,
			values: [60, 120, 180, 240, 300, 440, 580, 720, 860, 1000],
		},

		// クリ率系料理
		takoyaki: {
			propertyType: 'criticalRate',
			isPercentage: false,
			values: [2, 4, 6, 8, 10, 14, 18, 22, 26, 30],
		},

		// 攻撃MP回復系料理
		yakisoba: {
			propertyType: 'attackMPRecovery',
			isPercentage: false,
			values: [2, 4, 6, 8, 10, 14, 18, 22, 26, 30],
		},

		// 武器ATK系料理
		margherita_pizza: {
			propertyType: 'weaponATK',
			isPercentage: false,
			values: [6, 12, 18, 24, 30, 44, 58, 72, 86, 100],
		},

		// ATK系料理
		diabola_pizza: {
			propertyType: 'ATK',
			isPercentage: false,
			values: [6, 12, 18, 24, 30, 44, 58, 72, 86, 100],
		},

		// おにぎり系（ステータス）
		okaka_onigiri: {
			propertyType: 'STR',
			isPercentage: false,
			values: [2, 4, 6, 8, 10, 14, 18, 22, 26, 30],
		},
		sake_onigiri: {
			propertyType: 'DEX',
			isPercentage: false,
			values: [2, 4, 6, 8, 10, 14, 18, 22, 26, 30],
		},
		umeboshi_onigiri: {
			propertyType: 'INT',
			isPercentage: false,
			values: [2, 4, 6, 8, 10, 14, 18, 22, 26, 30],
		},
		mentaiko_onigiri: {
			propertyType: 'AGI',
			isPercentage: false,
			values: [2, 4, 6, 8, 10, 14, 18, 22, 26, 30],
		},
		tuna_mayo_onigiri: {
			propertyType: 'VIT',
			isPercentage: false,
			values: [2, 4, 6, 8, 10, 14, 18, 22, 26, 30],
		},

		// ラーメン系
		shoyu_ramen: {
			propertyType: 'accuracy',
			isPercentage: false,
			values: [6, 12, 18, 24, 30, 44, 58, 72, 86, 100],
		},

		// パスタ系
		zokusei_pasta: {
			propertyType: 'elementAdvantage',
			isPercentage: false,
			values: [1, 2, 3, 4, 5, 7, 9, 11, 13, 15],
		},

		// ピザ系（その他）
		seafood_pizza: {
			propertyType: 'MATK',
			isPercentage: false,
			values: [6, 12, 18, 24, 30, 44, 58, 72, 86, 100],
		},

		// シチュー系
		beef_stew: {
			propertyType: 'Aggro_Rate',
			isPercentage: false,
			values: [6, 12, 18, 24, 30, 44, 58, 72, 86, 100],
		},
		white_stew: {
			propertyType: 'Aggro_Rate',
			isPercentage: false,
			values: [-6, -12, -18, -24, -30, -44, -58, -72, -86, -100],
		},

		// バーガー系
		beef_burger: {
			propertyType: 'physicalResistance',
			isPercentage: false,
			values: [4, 8, 12, 16, 20, 26, 32, 38, 44, 50],
		},
		fish_burger: {
			propertyType: 'magicalResistance',
			isPercentage: false,
			values: [4, 8, 12, 16, 20, 26, 32, 38, 44, 50],
		},
	}

	const effect = foodEffects[foodId]
	if (!effect || level < 1 || level > 10) return null

	return {
		propertyType: effect.propertyType,
		value: effect.values[level - 1], // 配列は0ベースなのでlevel-1
		isPercentage: effect.isPercentage,
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
			'physicalPower',
			'magicalPower',
			'physicalDefense',
			'magicalDefense',
			'elementalAttack',
			'elementalDefense',
			'speed',
			'casting',
			'mp',
			'hp',
			'accuracy',
			'evasion',
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
function getBuffItemById(
	id: string,
): { properties: Record<string, number> } | null {
	// buffItemDatabase.tsのgetBuffItemById関数を使用
	try {
		const buffItem = getBuffItemFromDB(id)

		if (!buffItem?.properties) {
			return null
		}

		return {
			properties: buffItem.properties,
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
 * エンハンススキル計算用のNormal難易度敵データを取得
 * @param data 計算機データ
 * @returns Normal難易度の敵データ（DEF, MDEF, Level）
 */
function getNormalDifficultyEnemyData(data: CalculatorData): {
	level: number
	DEF: number
	MDEF: number
} | null {
	// 選択されている敵IDを取得
	const selectedEnemyId = data.enemy?.selectedEnemyId
	if (!selectedEnemyId) {
		return null
	}

	// プリセット敵データを取得
	const enemyData = getPresetEnemyById(selectedEnemyId)
	if (!enemyData) {
		return null
	}

	// Normal難易度の値を返す（プリセットデータそのまま）
	return {
		level: enemyData.level,
		DEF: enemyData.stats.DEF,
		MDEF: enemyData.stats.MDEF,
	}
}

/**
 * バフスキルを含む全データソースを一括取得するヘルパー
 */
export function getAllDataSourceBonusesWithBuffSkills(
	data: CalculatorData,
): Partial<AllBonuses> {
	const bonuses: Partial<AllBonuses> = {}

	// 従来の4つのデータソースを統合（装備・クリスタルは条件付き効果対応版を使用）
	const dataSources = {
		equipment: getEquipmentBonusesWithConditionalEffects(data),
		crystal: getCrystalBonusesWithConditionalEffects(data),
		food: getFoodBonuses(data.food),
		buff: getBuffBonuses(data.buffItems),
	}

	// 各データソースの補正値を統合
	for (const source of Object.values(dataSources)) {
		for (const [key, value] of Object.entries(source)) {
			if (typeof value === 'number' && value !== 0) {
				bonuses[key as keyof AllBonuses] =
					(bonuses[key as keyof AllBonuses] || 0) + value
			}
		}
	}

	// 敵情報を取得（エンハンス等で使用）
	let enemyDEF = 1000
	let enemyMDEF = 1000
	let enemyLevel = 100

	// 実際の敵データを取得してNormal難易度の値を使用
	const normalEnemyData = getNormalDifficultyEnemyData(data)
	if (normalEnemyData) {
		enemyDEF = normalEnemyData.DEF
		enemyMDEF = normalEnemyData.MDEF
		enemyLevel = normalEnemyData.level
	}

	// バフスキルの補正値を追加（敵情報とサブ武器情報を渡す）
	const buffSkillBonuses = getBuffSkillBonuses(
		data.buffSkills?.skills || null,
		data.mainWeapon?.weaponType || null,
		enemyDEF,
		enemyMDEF,
		enemyLevel,
		data.subWeapon?.weaponType || null,
		data.subWeapon?.refinement || 0,
		data.baseStats, // 基礎ステータスを追加
	)

	for (const [key, value] of Object.entries(buffSkillBonuses)) {
		if (typeof value === 'number' && value !== 0) {
			bonuses[key as keyof AllBonuses] =
				(bonuses[key as keyof AllBonuses] || 0) + value
		}
	}

	// 両手持ちスキル効果は getBuffSkillBonuses 内で統合処理されるため重複削除

	// バトルスキル（プレイヤーレベル依存）の補正値を追加
	const battleSkillBonuses = getBattleSkillBonusesWithPlayerLevel(
		data.buffSkills?.skills || null,
		data.baseStats?.level || 1,
	)

	for (const [key, value] of Object.entries(battleSkillBonuses)) {
		if (typeof value === 'number' && value !== 0) {
			bonuses[key as keyof AllBonuses] =
				(bonuses[key as keyof AllBonuses] || 0) + value
		}
	}

	// 神速の軌跡スキルの補正値を追加（武器タイプが必要）
	const godspeedTrajectoryBonuses = getGodspeedTrajectoryEffects(
		data.buffSkills?.skills || null,
		data.mainWeapon?.weaponType || null,
	)

	for (const [key, value] of Object.entries(godspeedTrajectoryBonuses)) {
		if (typeof value === 'number' && value !== 0) {
			bonuses[key as keyof AllBonuses] =
				(bonuses[key as keyof AllBonuses] || 0) + value
		}
	}

	// カムフラージュスキルの補正値を追加（基本ステータスレベルと武器タイプが必要）
	const camouflageBonuses = getCamouflageEffects(
		data.buffSkills?.skills || null,
		data.baseStats?.level || 1,
		data.mainWeapon?.weaponType || null,
	)

	for (const [key, value] of Object.entries(camouflageBonuses)) {
		if (typeof value === 'number' && value !== 0) {
			bonuses[key as keyof AllBonuses] =
				(bonuses[key as keyof AllBonuses] || 0) + value
		}
	}

	// 前線維持Ⅱスキルの補正値を追加（基本ステータスレベルが必要）
	const frontlineMaintenance2Bonuses = getFrontlineMaintenance2Effects(
		data.buffSkills?.skills || null,
		data.baseStats?.level || 1,
	)

	for (const [key, value] of Object.entries(frontlineMaintenance2Bonuses)) {
		if (typeof value === 'number' && value !== 0) {
			bonuses[key as keyof AllBonuses] =
				(bonuses[key as keyof AllBonuses] || 0) + value
		}
	}

	// ペットクリティカルアップスキルの補正値を追加
	const petCriticalUpBonuses = getPetCriticalUpEffects(
		data.buffSkills?.skills || null,
	)

	for (const [key, value] of Object.entries(petCriticalUpBonuses)) {
		if (typeof value === 'number' && value !== 0) {
			bonuses[key as keyof AllBonuses] =
				(bonuses[key as keyof AllBonuses] || 0) + value
		}
	}

	// ペットブレイブアップスキルの補正値を追加
	const petBraveUpBonuses = getPetBraveUpEffects(
		data.buffSkills?.skills || null,
	)

	for (const [key, value] of Object.entries(petBraveUpBonuses)) {
		if (typeof value === 'number' && value !== 0) {
			bonuses[key as keyof AllBonuses] =
				(bonuses[key as keyof AllBonuses] || 0) + value
		}
	}

	// ペットマインドアップスキルの補正値を追加
	const petMindUpBonuses = getPetMindUpEffects(data.buffSkills?.skills || null)

	for (const [key, value] of Object.entries(petMindUpBonuses)) {
		if (typeof value === 'number' && value !== 0) {
			bonuses[key as keyof AllBonuses] =
				(bonuses[key as keyof AllBonuses] || 0) + value
		}
	}

	// ペットカットアップスキルの補正値を追加
	const petCutUpBonuses = getPetCutUpEffects(data.buffSkills?.skills || null)

	for (const [key, value] of Object.entries(petCutUpBonuses)) {
		if (typeof value === 'number' && value !== 0) {
			bonuses[key as keyof AllBonuses] =
				(bonuses[key as keyof AllBonuses] || 0) + value
		}
	}

	// 怪力乱神スキルの補正値は getTwoHandsEffects 内で統合処理されるため、ここでは追加しない

	// 武士弓術スキルの補正値を追加
	const archeryBonuses = getArcheryEffects(
		data.buffSkills?.skills || null,
		data.mainWeapon?.weaponType || null,
		data.subWeapon?.weaponType || null,
		data.subWeapon?.ATK || 0,
		data.subWeapon?.stability || 0,
	)

	for (const [key, value] of Object.entries(archeryBonuses)) {
		if (typeof value === 'number' && value !== 0) {
			bonuses[key as keyof AllBonuses] =
				(bonuses[key as keyof AllBonuses] || 0) + value
		}
	}

	// アサシンスキルの補正値を追加（サブ武器情報が必要）
	const assassinSkillBonuses = getAssassinSkillEffects(
		data.buffSkills?.skills || null,
		data.subWeapon?.weaponType || null,
	)

	for (const [key, value] of Object.entries(assassinSkillBonuses)) {
		if (typeof value === 'number' && value !== 0) {
			bonuses[key as keyof AllBonuses] =
				(bonuses[key as keyof AllBonuses] || 0) + value
		}
	}

	// レジスタ効果の補正値を追加
	const registerBonuses = getRegisterBonuses(data.register)

	for (const [key, value] of Object.entries(registerBonuses)) {
		if (typeof value === 'number' && value !== 0) {
			bonuses[key as keyof AllBonuses] =
				(bonuses[key as keyof AllBonuses] || 0) + value
		}
	}

	// 攻撃スキルの特殊効果を追加（オーガスラッシュの物理貫通等）
	const attackSkillBonuses = getAttackSkillSpecialEffects(data)

	for (const [key, value] of Object.entries(attackSkillBonuses)) {
		if (typeof value === 'number' && value !== 0) {
			bonuses[key as keyof AllBonuses] =
				(bonuses[key as keyof AllBonuses] || 0) + value
		}
	}

	return bonuses
}

/**
 * 装備スロット別の補正値を取得
 */
export function getEquipmentSlotBonuses(
	equipmentData: any,
): Record<string, Partial<AllBonuses>> {
	try {
		const bonuses: Record<string, Partial<AllBonuses>> = {
			mainWeapon: {},
			body: {},
			additional: {},
			special: {},
			subWeapon: {},
			fashion1: {},
			fashion2: {},
			fashion3: {},
			freeInput1: {},
			freeInput2: {},
			freeInput3: {},
		}

		// nullチェック
		if (!equipmentData) {
			return bonuses
		}

		// 各スロットごとに個別計算
		const slots = [
			{ key: 'mainWeapon', data: equipmentData.mainWeapon },
			{ key: 'body', data: equipmentData.body },
			{ key: 'additional', data: equipmentData.additional },
			{ key: 'special', data: equipmentData.special },
			{ key: 'subWeapon', data: equipmentData.subWeapon },
			{ key: 'fashion1', data: equipmentData.fashion1 },
			{ key: 'fashion2', data: equipmentData.fashion2 },
			{ key: 'fashion3', data: equipmentData.fashion3 },
			{ key: 'freeInput1', data: equipmentData.freeInput1 },
			{ key: 'freeInput2', data: equipmentData.freeInput2 },
			{ key: 'freeInput3', data: equipmentData.freeInput3 },
		]

		for (const slot of slots) {
			if (slot.data?.properties) {
				for (const [propertyKey, value] of Object.entries(
					slot.data.properties,
				)) {
					if (typeof value === 'number' && value !== 0) {
						const validatedValue = validatePropertyValue(value, propertyKey)
						const normalizedKey = normalizePropertyKey(propertyKey)
						bonuses[slot.key][normalizedKey as keyof AllBonuses] =
							validatedValue
					}
				}
			}
		}

		return bonuses
	} catch (error) {
		console.error('Equipment slot bonus calculation error:', error)
		return {
			mainWeapon: {},
			body: {},
			additional: {},
			special: {},
			subWeapon: {},
			fashion1: {},
			fashion2: {},
			fashion3: {},
			freeInput1: {},
			freeInput2: {},
			freeInput3: {},
		}
	}
}

/**
 * エンチャント（オシャレ装備）の合計補正値を取得
 */
export function getEnchantmentBonuses(equipmentData: any): Partial<AllBonuses> {
	try {
		const bonuses: Partial<AllBonuses> = {}

		// nullチェック
		if (!equipmentData) return bonuses

		const slots = [
			equipmentData.fashion1,
			equipmentData.fashion2,
			equipmentData.fashion3,
		]

		for (const slot of slots) {
			if (slot?.properties) {
				for (const [propertyKey, value] of Object.entries(slot.properties)) {
					if (typeof value === 'number' && value !== 0) {
						const validatedValue = validatePropertyValue(value, propertyKey)
						const normalizedKey = normalizePropertyKey(propertyKey)
						bonuses[normalizedKey as keyof AllBonuses] =
							(bonuses[normalizedKey as keyof AllBonuses] || 0) + validatedValue
					}
				}
			}
		}

		return bonuses
	} catch (error) {
		console.error('Enchantment bonus calculation error:', error)
		return {}
	}
}

/**
 * 攻撃スキルの特殊効果をボーナス値に変換
 * （例：オーガスラッシュの物理貫通効果）
 */
function getAttackSkillSpecialEffects(
	data: CalculatorData,
): Partial<AllBonuses> {
	const bonuses: Partial<AllBonuses> = {}

	// 攻撃スキルが選択されていない場合はボーナスなし
	if (!data.attackSkill?.selectedSkillId) {
		return bonuses
	}

	// オーガスラッシュの特殊効果処理
	if (data.attackSkill.selectedSkillId === 'ogre_slash') {
		// バフスキルのオーガスラッシュ（sm1）が有効かチェック
		const ogreSlashBuffSkill = data.buffSkills?.skills?.sm1
		if (ogreSlashBuffSkill?.isEnabled && 'stackCount' in ogreSlashBuffSkill) {
			const demonPowerCount = ogreSlashBuffSkill.stackCount || 0
			// 物理貫通 = |消費鬼力 × 10|%
			const physicalPenetration = Math.abs(demonPowerCount * 10)

			if (physicalPenetration > 0) {
				bonuses.PhysicalPenetration_Rate =
					(bonuses.PhysicalPenetration_Rate || 0) + physicalPenetration
			}
		}
	}

	return bonuses
}

/**
 * レジスタ効果をボーナス値に変換
 */
function getRegisterBonuses(
	registerData?: RegisterFormData,
): Partial<AllBonuses> {
	const bonuses: Partial<AllBonuses> = {}

	if (!registerData?.effects) return bonuses

	// 各効果を処理
	for (const effect of registerData.effects) {
		if (!effect.isEnabled) continue

		switch (effect.type) {
			case 'maxHpUp':
				// 最大HPアップ: レベル × 10 をHP固定値に加算
				bonuses.HP = (bonuses.HP || 0) + effect.level * 10
				break

			case 'maxMpUp':
				// 最大MPアップ: レベル × 1 をMP固定値に加算
				bonuses.MP = (bonuses.MP || 0) + effect.level * 1
				break

			case 'physicalAttackUp':
				// 物理攻撃アップ: レベル × 1 をATK固定値に加算
				bonuses.ATK = (bonuses.ATK || 0) + effect.level
				break

			case 'magicalAttackUp':
				// 魔法攻撃アップ: レベル × 1 をMATK固定値に加算
				bonuses.MATK = (bonuses.MATK || 0) + effect.level
				break

			case 'accuracyUp':
				// 命中アップ: レベル × 1 をAccuracy固定値に加算
				bonuses.Accuracy = (bonuses.Accuracy || 0) + effect.level
				break

			case 'evasionUp':
				// 回避アップ: レベル × 1 をDodge固定値に加算
				bonuses.Dodge = (bonuses.Dodge || 0) + effect.level
				break

			case 'attackSpeedUp':
				// 攻撃速度アップ: レベル × 1 をAttackSpeed固定値に加算
				bonuses.AttackSpeed = (bonuses.AttackSpeed || 0) + effect.level
				break

			case 'magicalSpeedUp':
				// 魔法速度アップ: レベル × 1 をCastingSpeed固定値に加算
				bonuses.CastingSpeed = (bonuses.CastingSpeed || 0) + effect.level
				break

			case 'fateCompanionship':
				// 運命共同体: 特殊計算（レベル1固定 + パーティメンバー数効果）
				if (effect.level === 1) {
					const partyMemberBonus = effect.partyMembers || 0 // パーティメンバー数%の効果

					bonuses.ATK_Rate = (bonuses.ATK_Rate || 0) + partyMemberBonus
					bonuses.MATK_Rate = (bonuses.MATK_Rate || 0) + partyMemberBonus
				}
				break

			case 'deliciousIngredientTrade':
				// 美味食材取引: レベル × 100 をHP固定値に加算
				bonuses.HP = (bonuses.HP || 0) + effect.level * 100
				break

			case 'freshFruitTrade':
				// 新鮮な果物取引: レベル × 10 をMP固定値に加算
				bonuses.MP = (bonuses.MP || 0) + effect.level * 10
				break

			// 他の効果は将来実装
			default:
				break
		}
	}

	return bonuses
}

/**
 * データソース別補正値を一括取得
 */
export function getDetailedDataSourceBonuses(
	data: CalculatorData,
): DetailedDataSourceBonuses {
	try {
		const equipmentSlots = getEquipmentSlotBonuses(data.equipment)

		return {
			equipment: {
				mainWeapon: equipmentSlots.mainWeapon,
				body: equipmentSlots.body,
				additional: equipmentSlots.additional,
				special: equipmentSlots.special,
				subWeapon: equipmentSlots.subWeapon,
				fashion1: equipmentSlots.fashion1,
				fashion2: equipmentSlots.fashion2,
				fashion3: equipmentSlots.fashion3,
				freeInput1: equipmentSlots.freeInput1,
				freeInput2: equipmentSlots.freeInput2,
				freeInput3: equipmentSlots.freeInput3,
				enchantment: getEnchantmentBonuses(data.equipment),
			},
			crystal: getCrystalBonusesWithConditionalEffects(data),
			food: getFoodBonuses(data.food),
			buffItems: getBuffBonuses(data.buffItems),
			buffSkills: (() => {
				// 全バフスキル効果を統合（getAllDataSourceBonusesWithBuffSkillsと同じロジック）
				let combinedBonuses: Partial<AllBonuses> = {}

				// 敵情報を取得（エンハンス等で使用）
				let enemyDEF = 1000
				let enemyMDEF = 1000
				let enemyLevel = 100

				// 実際の敵データを取得してNormal難易度の値を使用
				const normalEnemyData = getNormalDifficultyEnemyData(data)
				if (normalEnemyData) {
					enemyDEF = normalEnemyData.DEF
					enemyMDEF = normalEnemyData.MDEF
					enemyLevel = normalEnemyData.level
				}

				// 基本バフスキル効果
				const buffSkillBonuses = getBuffSkillBonuses(
					data.buffSkills?.skills || null,
					data.mainWeapon?.weaponType || null,
					enemyDEF,
					enemyMDEF,
					enemyLevel,
					data.subWeapon?.weaponType || null,
					data.subWeapon?.refinement || 0,
					data.baseStats, // 基礎ステータスを追加
				)

				for (const [key, value] of Object.entries(buffSkillBonuses)) {
					if (typeof value === 'number' && value !== 0) {
						combinedBonuses[key as keyof AllBonuses] =
							(combinedBonuses[key as keyof AllBonuses] || 0) + value
					}
				}

				// バトルスキル（プレイヤーレベル依存）の補正値を追加
				const battleSkillBonuses = getBattleSkillBonusesWithPlayerLevel(
					data.buffSkills?.skills || null,
					data.baseStats?.level || 1,
				)

				for (const [key, value] of Object.entries(battleSkillBonuses)) {
					if (typeof value === 'number' && value !== 0) {
						combinedBonuses[key as keyof AllBonuses] =
							(combinedBonuses[key as keyof AllBonuses] || 0) + value
					}
				}

				// 神速の軌跡スキルの補正値を追加（武器タイプが必要）
				const godspeedTrajectoryBonuses = getGodspeedTrajectoryEffects(
					data.buffSkills?.skills || null,
					data.mainWeapon?.weaponType || null,
				)

				for (const [key, value] of Object.entries(godspeedTrajectoryBonuses)) {
					if (typeof value === 'number' && value !== 0) {
						combinedBonuses[key as keyof AllBonuses] =
							(combinedBonuses[key as keyof AllBonuses] || 0) + value
					}
				}

				// カムフラージュスキルの補正値を追加（基本ステータスレベルと武器タイプが必要）
				const camouflageBonuses = getCamouflageEffects(
					data.buffSkills?.skills || null,
					data.baseStats?.level || 1,
					data.mainWeapon?.weaponType || null,
				)

				for (const [key, value] of Object.entries(camouflageBonuses)) {
					if (typeof value === 'number' && value !== 0) {
						combinedBonuses[key as keyof AllBonuses] =
							(combinedBonuses[key as keyof AllBonuses] || 0) + value
					}
				}

				// 前線維持Ⅱスキルの補正値を追加（基本ステータスレベルが必要）
				const frontlineMaintenance2Bonuses = getFrontlineMaintenance2Effects(
					data.buffSkills?.skills || null,
					data.baseStats?.level || 1,
				)

				for (const [key, value] of Object.entries(
					frontlineMaintenance2Bonuses,
				)) {
					if (typeof value === 'number' && value !== 0) {
						combinedBonuses[key as keyof AllBonuses] =
							(combinedBonuses[key as keyof AllBonuses] || 0) + value
					}
				}

				// ペット関連スキルの補正値を追加
				const petCriticalUpBonuses = getPetCriticalUpEffects(
					data.buffSkills?.skills || null,
				)
				const petBraveUpBonuses = getPetBraveUpEffects(
					data.buffSkills?.skills || null,
				)
				const petMindUpBonuses = getPetMindUpEffects(
					data.buffSkills?.skills || null,
				)
				const petCutUpBonuses = getPetCutUpEffects(
					data.buffSkills?.skills || null,
				)

				for (const petBonuses of [
					petCriticalUpBonuses,
					petBraveUpBonuses,
					petMindUpBonuses,
					petCutUpBonuses,
				]) {
					for (const [key, value] of Object.entries(petBonuses)) {
						if (typeof value === 'number' && value !== 0) {
							combinedBonuses[key as keyof AllBonuses] =
								(combinedBonuses[key as keyof AllBonuses] || 0) + value
						}
					}
				}

				// 武士弓術スキルの補正値を追加
				const archeryBonuses = getArcheryEffects(
					data.buffSkills?.skills || null,
					data.mainWeapon?.weaponType || null,
					data.subWeapon?.weaponType || null,
					data.subWeapon?.ATK || 0,
					data.subWeapon?.stability || 0,
				)

				for (const [key, value] of Object.entries(archeryBonuses)) {
					if (typeof value === 'number' && value !== 0) {
						combinedBonuses[key as keyof AllBonuses] =
							(combinedBonuses[key as keyof AllBonuses] || 0) + value
					}
				}

				// アサシンスキルの補正値を追加（サブ武器情報が必要）
				const assassinSkillBonuses = getAssassinSkillEffects(
					data.buffSkills?.skills || null,
					data.subWeapon?.weaponType || null,
				)

				for (const [key, value] of Object.entries(assassinSkillBonuses)) {
					if (typeof value === 'number' && value !== 0) {
						combinedBonuses[key as keyof AllBonuses] =
							(combinedBonuses[key as keyof AllBonuses] || 0) + value
					}
				}

				return combinedBonuses
			})(),
			register: getRegisterBonuses(data.register),
		}
	} catch (error) {
		console.error('Detailed data source bonuses calculation error:', error)
		return {
			equipment: {
				mainWeapon: {},
				body: {},
				additional: {},
				special: {},
				subWeapon: {},
				fashion1: {},
				fashion2: {},
				fashion3: {},
				freeInput1: {},
				freeInput2: {},
				freeInput3: {},
				enchantment: {},
			},
			crystal: {},
			food: {},
			buffItems: {},
			buffSkills: {},
			register: {},
		}
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
