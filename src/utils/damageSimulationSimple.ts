/**
 * シンプルダメージシミュレーション関数群
 * 型エラーを避けつつ基本機能を提供
 */

import type { CalculatorData } from '@/types/calculator'
import type { SlotInfo, PreviewItem } from '@/types/damagePreview'

/**
 * アイテム装着シミュレーション（シンプル版）
 */
export function simulateItemEquipSimple(
	currentData: CalculatorData,
	item: PreviewItem,
	slotInfo: SlotInfo,
): CalculatorData {
	// ディープコピーを作成
	const simulatedData: CalculatorData = JSON.parse(JSON.stringify(currentData))

	try {
		switch (slotInfo.type) {
			case 'crystal': {
				// クリスタルの場合
				if (slotInfo.category && typeof slotInfo.slot === 'number') {
					const crystalId = item.id
					
					// クリスタルスロットの構造に基づいて適切にセット
					// CrystalSlotsの実際の構造: weapon1, weapon2, armor1, armor2, etc.
					const slotNumber = slotInfo.slot + 1 // 0-based to 1-based
					const slotKey = `${slotInfo.category}${slotNumber}`
					
					// デバッグログ：更新前の状態
					console.log('🔧 CRYSTAL SIMULATION START:', {
						itemName: item.name,
						crystalId,
						slotCategory: slotInfo.category,
						slotNumber: slotInfo.slot,
						slotKey,
						beforeUpdateCrystal: (currentData.crystals as unknown as Record<string, string | null>)[slotKey],
						'currentData.crystals': currentData.crystals,
						'item.properties': item.properties,
					})
					
					// crystalsオブジェクトを直接更新
					if (simulatedData.crystals) {
						// 型安全性のため、unknownを経由してキャスト
						(simulatedData.crystals as unknown as Record<string, string | null>)[slotKey] = crystalId
						
						// デバッグログ：更新後の状態
						console.log('🔧 CRYSTAL SIMULATION EXECUTED:', {
							itemName: item.name,
							crystalId,
							slotKey,
							afterUpdateCrystal: (simulatedData.crystals as unknown as Record<string, string | null>)[slotKey],
							simulatedCrystals: JSON.stringify(simulatedData.crystals, null, 2),
							crystalChangeSuccess: (simulatedData.crystals as unknown as Record<string, string | null>)[slotKey] === crystalId,
						})
					}
					
					// Crystal slot updated successfully
				}
				break
			}

			case 'equipment': {
				// 装備の場合（簡略実装）
				// Equipment simulation not yet implemented
				break
			}

			case 'buffItem': {
				// バフアイテムの場合（簡略実装）
				// BuffItem simulation not yet implemented
				break
			}

			default:
				// Unknown slot type
		}

		return simulatedData
	} catch {
		// Simulation failed, return original data
		return currentData
	}
}

/**
 * スロット情報の妥当性チェック（シンプル版）
 */
export function validateSlotInfoSimple(slotInfo: SlotInfo): boolean {
	return slotInfo.type !== undefined
}

/**
 * アイテムとスロット情報の互換性チェック（シンプル版）
 */
export function validateItemSlotCompatibilitySimple(
	item: PreviewItem,
	slotInfo: SlotInfo,
): boolean {
	// 基本的なnullチェックのみ
	return item !== null && slotInfo !== null
}