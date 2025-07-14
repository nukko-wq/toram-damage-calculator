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
			const result = mainWeapon?.weaponType === condition.weaponType
			// Debug log only for 両手剣 condition
			if (condition.weaponType === '両手剣') {
				console.log('🗡️ 両手剣 CONDITION CHECK:', {
					condition,
					mainWeaponType: mainWeapon?.weaponType,
					result,
					stack: new Error().stack?.split('\n').slice(1, 4)
				})
			}
			return result
		}
		case 'subWeapon':
			return subWeapon?.weaponType === condition.weaponType
		case 'armor':
			return equipmentState?.body?.armorType === condition.armorType
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

	// TEST: Log all equipment that has conditional effects
	if (equipment.conditionalEffects && equipment.conditionalEffects.length > 0) {
		console.log('🔧 Processing equipment with conditional effects:', {
			name: equipment.name,
			id: equipment.id,
			effectsCount: equipment.conditionalEffects.length,
			mainWeaponType: mainWeapon?.weaponType
		})
	}

	if (equipment.conditionalEffects) {
		for (const effect of equipment.conditionalEffects) {
			const conditionMet = checkEquipmentCondition(
				effect.condition,
				equipmentState,
				mainWeapon,
				subWeapon,
			)
			
			if (conditionMet) {
				// Debug log only for MP bonuses
				if (effect.properties.MP) {
					console.log('🎉 MP BONUS APPLIED:', {
						equipment: equipment.name,
						effect: effect.properties,
						condition: effect.condition
					})
				}
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
	console.log('🔍 getSlotEffectiveProperties called with slot:', {
		slotName: slot?.name,
		hasProperties: !!slot?.properties,
		hasId: !!slot?.id,
		slotId: slot?.id,
		isPreset: slot?.isPreset
	})

	// スロットが装備データを直接持っている場合（プリセット装備など）
	// nameとpropertiesがあり、conditionalEffectsがある可能性を確認
	if (slot?.name && slot?.properties) {
		console.log('📦 Found equipment with direct properties:', slot.name)
		
		// 条件付き効果を持つ装備の場合、条件付き効果をチェック
		if (slot.name === '星辰の舟衣' || slot.name === '熊戦士の帯') {
			console.log(`⭐ ${slot.name} found in direct slot data!`)
			
			// IDがある場合はデータベースから完全なデータを取得して条件付き効果を適用
			if (slot.id) {
				console.log('🔗 Looking up complete equipment data by ID:', slot.id)
				const equipment = getCombinedEquipmentById(slot.id)
				if (equipment && equipment.conditionalEffects) {
					console.log('📋 Found complete equipment with conditional effects')
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
				'星辰の舟衣': '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
				'熊戦士の帯': 'eq014-f012-3456-789a-bcdef0123456'
			}
			const knownId = knownIds[slot.name]
			if (knownId) {
				console.log(`🔗 Looking up ${slot.name} by known ID:`, knownId)
				const equipment = getCombinedEquipmentById(knownId)
				if (equipment && equipment.conditionalEffects) {
					console.log(`⭐ ${slot.name} found with conditional effects:`, {
						name: equipment.name,
						hasConditionalEffects: !!equipment.conditionalEffects,
						mainWeaponType: mainWeapon?.weaponType,
						conditionalEffects: equipment.conditionalEffects
					})
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
		console.log('🔗 Looking up equipment by ID:', slot.id)
		const equipment = getCombinedEquipmentById(slot.id)
		console.log('📋 Equipment lookup result:', {
			found: !!equipment,
			name: equipment?.name,
			id: equipment?.id,
			hasConditionalEffects: !!equipment?.conditionalEffects
		})
		
		if (equipment) {
			return applyConditionalEquipmentEffects(
				equipment,
				equipmentState,
				mainWeapon,
				subWeapon,
			)
		} else {
			console.log('❌ Equipment not found for ID:', slot.id)
		}
	} else {
		console.log('❌ No valid slot data provided')
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
	console.log('🔄 recalculateEquipmentEffects called with:', {
		hasEquipmentState: !!equipmentState,
		mainWeaponType: mainWeapon?.weaponType,
		bodySlot: equipmentState?.body,
		bodySlotId: equipmentState?.body?.id,
	})

	let totalEffects: Partial<EquipmentProperties> = {}

	// 11スロット分の装備を処理（従来8スロット + 自由入力3スロット）
	const allSlots = [
		equipmentState.main,
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

	console.log('🎯 Processing slots:', allSlots.map(slot => ({ id: slot?.id, name: slot?.name })))

	for (const slot of allSlots) {
		const effectiveProperties = getSlotEffectiveProperties(
			slot,
			equipmentState,
			mainWeapon,
			subWeapon,
		)
		totalEffects = mergeProperties(totalEffects, effectiveProperties)
	}

	// Debug log total effects
	console.log('💎 FINAL TOTAL EFFECTS:', totalEffects)
	if (totalEffects.MP) {
		console.log('🔮 EQUIPMENT MP BONUS FOUND:', totalEffects.MP)
	}

	return totalEffects
}