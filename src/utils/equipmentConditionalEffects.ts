/**
 * 装備条件付き効果システム
 *
 * 装備条件に基づいて装備の効果を自動適用する機能
 * crystalConditionalEffects.tsと同様の仕組みを装備品に適用
 */

import type {
	EquipmentCondition,
	EquipmentSlots,
	EquipmentProperties,
	PresetEquipment,
	Equipment,
	MainWeapon,
	SubWeapon,
} from '@/types/calculator'
import { getArmorType } from './armorTypeStorage'
import { getCombinedEquipmentById } from './equipmentDatabase'

/**
 * 装備条件の判定
 * @param condition 判定する条件
 * @param equipmentState 現在の装備状態
 * @param mainWeapon メイン武器の情報
 * @param subWeapon サブ武器の情報
 * @returns 条件が満たされている場合true
 */
export function checkEquipmentCondition(
	condition: EquipmentCondition,
	equipmentState: EquipmentSlots,
	mainWeapon: MainWeapon,
	subWeapon: SubWeapon,
): boolean {
	switch (condition.type) {
		case 'mainWeapon': {
			return mainWeapon?.weaponType === condition.weaponType
		}
		case 'subWeapon':
			return subWeapon?.weaponType === condition.weaponType
		case 'armor':
			return getArmorType(equipmentState?.body?.id) === condition.armorType
		default:
			return false
	}
}

/**
 * 装備プロパティのマージ
 * @param base 基本プロパティ
 * @param additional 追加プロパティ
 * @returns マージされたプロパティ
 */
export function mergeProperties(
	base: Partial<EquipmentProperties>,
	additional: Partial<EquipmentProperties>,
): Partial<EquipmentProperties> {
	const result = { ...base }

	// 各プロパティを加算
	for (const [key, value] of Object.entries(additional)) {
		const typedKey = key as keyof EquipmentProperties
		if (typeof value === 'number') {
			result[typedKey] = (result[typedKey] || 0) + value
		}
	}

	return result
}

/**
 * 装備スロットの条件付き効果を適用
 * @param equipment 対象の装備データ
 * @param equipmentState 現在の装備状態
 * @param mainWeapon メイン武器の情報
 * @param subWeapon サブ武器の情報
 * @returns 適用された効果を含む最終的なプロパティ
 */
export function applyConditionalEquipmentEffects(
	equipment: PresetEquipment | Equipment,
	equipmentState: EquipmentSlots,
	mainWeapon: MainWeapon,
	subWeapon: SubWeapon,
): Partial<EquipmentProperties> {
	let effectiveProperties = { ...equipment.properties }

	if (equipment.conditionalEffects) {
		for (const effect of equipment.conditionalEffects) {
			const conditionMet = checkEquipmentCondition(
				effect.condition,
				equipmentState,
				mainWeapon,
				subWeapon,
			)

			if (conditionMet) {
				effectiveProperties = mergeProperties(
					effectiveProperties,
					effect.properties,
				)
			}
		}
	}

	return effectiveProperties
}

/**
 * 装備スロットデータから装備IDを取得し、条件付き効果を適用したプロパティを返す
 * @param slot 装備スロットデータ
 * @param equipmentState 現在の装備状態
 * @param mainWeapon メイン武器の情報
 * @param subWeapon サブ武器の情報
 * @returns 条件付き効果が適用されたプロパティ
 */
export function getSlotEffectiveProperties(
	slot: any,
	equipmentState: EquipmentSlots,
	mainWeapon: MainWeapon,
	subWeapon: SubWeapon,
): Partial<EquipmentProperties> {
	// スロットが装備データを直接持っている場合（プリセット装備など）
	// nameとpropertiesがあり、conditionalEffectsがある可能性を確認
	if (slot?.name && slot?.properties) {
		// 条件付き効果を持つ装備の場合、条件付き効果をチェック
		if (slot.name === '星辰の舟衣' || slot.name === '熊戦士の帯') {
			// IDがある場合はデータベースから完全なデータを取得して条件付き効果を適用
			if (slot.id) {
				const equipment = getCombinedEquipmentById(slot.id)
				if (equipment?.conditionalEffects) {
					return applyConditionalEquipmentEffects(
						equipment,
						equipmentState,
						mainWeapon,
						subWeapon,
					)
				}
			}

			// IDがない場合でも、装備データベースから名前で検索を試みる
			// 固定IDで直接取得
			const knownIds: Record<string, string> = {
				星辰の舟衣: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
				熊戦士の帯: 'eq014-f012-3456-789a-bcdef0123456',
			}
			const knownId = knownIds[slot.name]
			if (knownId) {
				const equipment = getCombinedEquipmentById(knownId)
				if (equipment?.conditionalEffects) {
					return applyConditionalEquipmentEffects(
						equipment,
						equipmentState,
						mainWeapon,
						subWeapon,
					)
				}
			}
		}

		// 条件付き効果がない場合は直接のプロパティを使用
		return { ...slot.properties }
	}

	// スロットにIDがある場合、データベースから装備を取得
	if (slot?.id) {
		const equipment = getCombinedEquipmentById(slot.id)

		if (equipment) {
			return applyConditionalEquipmentEffects(
				equipment,
				equipmentState,
				mainWeapon,
				subWeapon,
			)
		}
	}

	return {}
}

/**
 * 装備された全装備の効果を再計算（条件付き効果含む）
 * @param equipmentState 現在の装備状態
 * @param mainWeapon メイン武器の情報
 * @param subWeapon サブ武器の情報
 * @returns 全装備の効果を合計したプロパティ
 */
export function recalculateEquipmentEffects(
	equipmentState: EquipmentSlots,
	mainWeapon: MainWeapon,
	subWeapon: SubWeapon,
): Partial<EquipmentProperties> {
	let totalEffects: Partial<EquipmentProperties> = {}

	// 11スロット分の装備を処理（従来8スロット + 自由入力3スロット）
	const allSlots = [
		equipmentState.mainWeapon,
		equipmentState.body,
		equipmentState.additional,
		equipmentState.special,
		equipmentState.subWeapon,
		equipmentState.fashion1,
		equipmentState.fashion2,
		equipmentState.fashion3,
		equipmentState.freeInput1,
		equipmentState.freeInput2,
		equipmentState.freeInput3,
	].filter(Boolean)

	for (const slot of allSlots) {
		const effectiveProperties = getSlotEffectiveProperties(
			slot,
			equipmentState,
			mainWeapon,
			subWeapon,
		)
		totalEffects = mergeProperties(totalEffects, effectiveProperties)
	}

	return totalEffects
}
