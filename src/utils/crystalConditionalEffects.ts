/**
 * クリスタル条件付き効果システム
 *
 * 装備条件に基づいてクリスタルの効果を自動適用する機能
 */

import type {
	EquipmentCondition,
	EquipmentSlots,
	EquipmentProperties,
	CrystalSlots,
	PresetCrystal,
	MainWeapon,
	SubWeapon,
} from '@/types/calculator'
import { getArmorType } from './armorTypeStorage'
import { getCrystalById } from './crystalDatabase'

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
		case 'mainWeapon':
			return mainWeapon?.weaponType === condition.weaponType
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
 * 条件付き効果の適用
 * @param crystal 対象のクリスタル
 * @param equipmentState 現在の装備状態
 * @param mainWeapon メイン武器の情報
 * @param subWeapon サブ武器の情報
 * @returns 適用された効果を含む最終的なプロパティ
 */
export function applyConditionalCrystalEffects(
	crystal: PresetCrystal,
	equipmentState: EquipmentSlots,
	mainWeapon: MainWeapon,
	subWeapon: SubWeapon,
): Partial<EquipmentProperties> {
	let effectiveProperties = { ...crystal.properties }

	if (crystal.conditionalEffects) {
		for (const effect of crystal.conditionalEffects) {
			if (
				checkEquipmentCondition(
					effect.condition,
					equipmentState,
					mainWeapon,
					subWeapon,
				)
			) {
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
 * 装備されたクリスタルの効果を再計算
 * @param crystals 現在のクリスタル装備状態
 * @param equipmentState 現在の装備状態
 * @param mainWeapon メイン武器の情報
 * @param subWeapon サブ武器の情報
 * @returns 全クリスタルの効果を合計したプロパティ
 */
export function recalculateCrystalEffects(
	crystals: CrystalSlots,
	equipmentState: EquipmentSlots,
	mainWeapon: MainWeapon,
	subWeapon: SubWeapon,
): Partial<EquipmentProperties> {
	let totalEffects: Partial<EquipmentProperties> = {}

	// 各スロットのクリスタルを処理
	const crystalIds = [
		crystals.weapon1,
		crystals.weapon2,
		crystals.armor1,
		crystals.armor2,
		crystals.additional1,
		crystals.additional2,
		crystals.special1,
		crystals.special2,
	]

	for (const crystalId of crystalIds) {
		if (crystalId) {
			const crystal = getCrystalById(crystalId)
			if (crystal) {
				const effectiveProperties = applyConditionalCrystalEffects(
					crystal,
					equipmentState,
					mainWeapon,
					subWeapon,
				)
				totalEffects = mergeProperties(totalEffects, effectiveProperties)
			}
		}
	}

	return totalEffects
}
