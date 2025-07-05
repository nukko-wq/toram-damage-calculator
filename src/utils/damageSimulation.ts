/**
 * ダメージシミュレーション関数群
 * アイテム装着のシミュレーションとダメージ計算を行う
 */

import type { CalculatorData } from '@/types/calculator'
import type { SlotInfo, PreviewItem, Crystal, Equipment, EquipmentSlot, BuffItem } from '@/types/damagePreview'

/**
 * アイテム装着シミュレーション
 * 現在のデータに仮想的にアイテムをセットした状態を生成
 */
export function simulateItemEquip(
	currentData: CalculatorData,
	item: PreviewItem,
	slotInfo: SlotInfo,
): CalculatorData {
	// ディープコピーを作成（JSONベースの簡易版）
	const simulatedData: CalculatorData = JSON.parse(JSON.stringify(currentData))

	try {
		switch (slotInfo.type) {
			case 'crystal': {
				if (!slotInfo.category || slotInfo.slot === undefined) {
					throw new Error('Crystal slot info is incomplete')
				}
				
				const crystal = item as Crystal
				const category = slotInfo.category
				const slot = slotInfo.slot as number

				// クリスタルスロットの範囲チェック
				if (slot < 0 || slot >= 2) {
					throw new Error(`Invalid crystal slot: ${slot}`)
				}

				// クリスタルをセット
				if (!simulatedData.crystals[category]) {
					simulatedData.crystals[category] = { slot0: null, slot1: null }
				}
				
				const slotKey = `slot${slot}` as 'slot0' | 'slot1'
				simulatedData.crystals[category][slotKey] = crystal
				break
			}

			case 'equipment': {
				if (!slotInfo.slot) {
					throw new Error('Equipment slot info is incomplete')
				}
				
				const equipment = item as Equipment
				const slot = slotInfo.slot as EquipmentSlot

				// 装備をセット
				simulatedData.equipment[slot] = equipment
				break
			}

			case 'buffItem': {
				if (!slotInfo.category) {
					throw new Error('BuffItem category info is incomplete')
				}
				
				const buffItem = item as BuffItem
				const category = slotInfo.category

				// バフアイテムをセット
				simulatedData.buffItems[category] = buffItem
				break
			}

			default:
				throw new Error(`Unknown slot type: ${slotInfo.type}`)
		}

		return simulatedData
	} catch (error) {
		console.error('Failed to simulate item equip:', error)
		// エラー時は元のデータを返す
		return currentData
	}
}

/**
 * スロット情報の妥当性チェック
 */
export function validateSlotInfo(slotInfo: SlotInfo): boolean {
	switch (slotInfo.type) {
		case 'crystal':
			return (
				slotInfo.category !== undefined &&
				slotInfo.slot !== undefined &&
				typeof slotInfo.slot === 'number' &&
				slotInfo.slot >= 0 &&
				slotInfo.slot < 2
			)

		case 'equipment':
			return (
				slotInfo.slot !== undefined &&
				typeof slotInfo.slot === 'string'
			)

		case 'buffItem':
			return slotInfo.category !== undefined

		default:
			return false
	}
}

/**
 * アイテムとスロット情報の互換性チェック
 */
export function validateItemSlotCompatibility(
	item: PreviewItem,
	slotInfo: SlotInfo,
): boolean {
	try {
		switch (slotInfo.type) {
			case 'crystal': {
				const crystal = item as Crystal
				// クリスタルの場合、カテゴリ互換性をチェック
				// ノーマルクリスタルは全カテゴリ対応、特化クリスタルは該当カテゴリのみ
				if (crystal.category === 'normal') {
					return true // ノーマルクリスタルは全スロット対応
				}
				return crystal.category === slotInfo.category
			}

			case 'equipment': {
				const equipment = item as Equipment
				const slot = slotInfo.slot as EquipmentSlot
				// 装備タイプとスロットの互換性チェック
				return equipment.slot === slot
			}

			case 'buffItem': {
				const buffItem = item as BuffItem
				// バフアイテムのカテゴリチェック
				return buffItem.category === slotInfo.category
			}

			default:
				return false
		}
	} catch (error) {
		console.error('Failed to validate item-slot compatibility:', error)
		return false
	}
}

/**
 * デバッグ用: シミュレーション結果の差分をログ出力
 */
export function logSimulationDiff(
	original: CalculatorData,
	simulated: CalculatorData,
	slotInfo: SlotInfo,
	item: PreviewItem,
): void {
	console.group('🔍 Damage Simulation Debug')
	console.log('Slot Info:', slotInfo)
	console.log('Item:', item)
	
	switch (slotInfo.type) {
		case 'crystal':
			if (slotInfo.category && slotInfo.slot !== undefined) {
				const slotKey = `slot${slotInfo.slot}` as 'slot0' | 'slot1'
				console.log('Original Crystal:', original.crystals[slotInfo.category]?.[slotKey])
				console.log('Simulated Crystal:', simulated.crystals[slotInfo.category]?.[slotKey])
			}
			break
			
		case 'equipment':
			if (slotInfo.slot) {
				const slot = slotInfo.slot as EquipmentSlot
				console.log('Original Equipment:', original.equipment[slot])
				console.log('Simulated Equipment:', simulated.equipment[slot])
			}
			break
			
		case 'buffItem':
			if (slotInfo.category) {
				console.log('Original BuffItem:', original.buffItems[slotInfo.category])
				console.log('Simulated BuffItem:', simulated.buffItems[slotInfo.category])
			}
			break
	}
	
	console.groupEnd()
}