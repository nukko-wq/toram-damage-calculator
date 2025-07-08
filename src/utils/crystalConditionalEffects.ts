/**
 * クリスタル条件付き効果システム
 * 
 * 装備条件に基づいてクリスタルの効果を自動適用する機能
 */

import type {
	EquipmentCondition,
	ConditionalEffect,
	PresetCrystal,
	EquipmentSlots,
	EquipmentProperties,
} from '@/types/calculator'

/**
 * 装備条件の判定
 * @param condition 判定する条件
 * @param equipmentState 現在の装備状態
 * @returns 条件が満たされている場合true
 */
export function checkEquipmentCondition(
	condition: EquipmentCondition,
	equipmentState: EquipmentSlots
): boolean {
	switch (condition.type) {
		case 'mainWeapon':
			return equipmentState.main.weaponType === condition.weaponType
		case 'subWeapon':
			return equipmentState.subWeapon.weaponType === condition.weaponType
		case 'armor':
			return equipmentState.body.armorType === condition.armorType
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
	additional: Partial<EquipmentProperties>
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
 * @returns 適用された効果を含む最終的なプロパティ
 */
export function applyConditionalCrystalEffects(
	crystal: PresetCrystal,
	equipmentState: EquipmentSlots
): Partial<EquipmentProperties> {
	let effectiveProperties = { ...crystal.properties }
	
	if (crystal.conditionalEffects) {
		for (const effect of crystal.conditionalEffects) {
			if (checkEquipmentCondition(effect.condition, equipmentState)) {
				effectiveProperties = mergeProperties(effectiveProperties, effect.properties)
			}
		}
	}
	
	return effectiveProperties
}