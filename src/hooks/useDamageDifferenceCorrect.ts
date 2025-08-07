/**
 * DamagePreview.tsxの正しい方法を参考にしたダメージ差分計算フック
 * 共通のダメージ計算サービスを使用
 */

import { useMemo, useState } from 'react'
import { useCalculatorStore } from '@/stores/calculatorStore'
import type { CalculatorData } from '@/types/calculator'
import type {
	DamageDifferenceOptions,
	DamageDifferenceResult,
	PreviewItem,
	SlotInfo,
} from '@/types/damagePreview'
import { calculateResults } from '@/utils/calculationEngine'
import {
	calculateDamageWithService,
	type DamageCalculationServiceResult,
} from '@/utils/damageCalculationService'
import { simulateItemEquipSimple } from '@/utils/damageSimulationSimple'
import { getWeaponInfo } from '@/utils/weaponInfoStorage'

/**
 * 正しい方法によるダメージ差分計算フック
 */
export function useDamageDifferenceCorrect(
	item: PreviewItem | null,
	slotInfo: SlotInfo,
	options: DamageDifferenceOptions = {},
): DamageDifferenceResult {
	// 強制的な再計算用のタイムスタンプ
	const [, _forceUpdate] = useState(0)
	// 現在のデータと計算結果を取得
	const currentData = useCalculatorStore((state) => state.data)
	const currentResults = useCalculatorStore((state) => state.calculationResults)
	const powerOptions = useCalculatorStore((state) => state.data.powerOptions)

	// キャッシュされた基準ダメージ結果を取得
	const baselineDamageResult = useCalculatorStore(
		(state) => state.baselineDamageResult,
	)

	return useMemo(() => {
		// 初期値
		const initialResult: DamageDifferenceResult = {
			difference: 0,
			isCalculating: false,
			error: null,
			currentDamage: 0,
			simulatedDamage: 0,
		}

		// 無効化されている場合
		if (options.disabled) {
			return initialResult
		}

		// アイテムまたはデータがない場合
		if (!item || !currentData) {
			return initialResult
		}

		// currentResultsがない場合は、その場で計算を実行
		let effectiveCurrentResults = currentResults
		if (!effectiveCurrentResults) {
			effectiveCurrentResults = calculateResults(currentData)
		}

		try {
			// 「クリスタなし」の特殊処理
			if (item.id === '__crystal_none__') {
				// 「クリスタなし」の場合は、現在装着中のクリスタルを外した状態のダメージを計算
				const baselineData = currentData // 現在の状態を基準
				const simulatedData = removeItemFromSlot(currentData, slotInfo) // クリスタルを外した状態

				// 基準ダメージ（現在の状態）を計算
				const baselineResults = calculateResults(baselineData)
				const currentDamageResult = calculateDamageWithService(
					baselineData,
					baselineResults,
					{ debug: options.debug, powerOptions: powerOptions || {} },
				)

				// シミュレーション後（クリスタル外した状態）のダメージを計算
				const simulatedResults = calculateResults(simulatedData)
				const simulatedDamageResult = calculateDamageWithService(
					simulatedData,
					simulatedResults,
					{ debug: options.debug, powerOptions: powerOptions || {} },
				)

				// 差分を計算（外した状態 - 現在の状態）
				const averageDifference =
					simulatedDamageResult.normal.average -
					currentDamageResult.normal.average
				const difference = Math.round(averageDifference)

				return {
					difference,
					isCalculating: false,
					error: null,
					currentDamage: currentDamageResult.normal.max,
					simulatedDamage: simulatedDamageResult.normal.max,
				}
			}

			// 「装備なし」の特殊処理
			if (item.id === '__equipment_none__') {
				// 「装備なし」の場合は、現在装着中の装備を外した状態のダメージを計算
				const baselineData = currentData // 現在の状態を基準
				const simulatedData = removeItemFromSlot(currentData, slotInfo) // 装備を外した状態

				// 基準ダメージ（現在の状態）を計算
				const baselineResults = calculateResults(baselineData)
				const currentDamageResult = calculateDamageWithService(
					baselineData,
					baselineResults,
					{ debug: options.debug, powerOptions: powerOptions || {} },
				)

				// シミュレーション後（装備外した状態）のダメージを計算
				const simulatedResults = calculateResults(simulatedData)
				const simulatedDamageResult = calculateDamageWithService(
					simulatedData,
					simulatedResults,
					{ debug: options.debug, powerOptions: powerOptions || {} },
				)

				// 差分を計算（外した状態 - 現在の状態）
				const averageDifference =
					simulatedDamageResult.normal.average -
					currentDamageResult.normal.average
				const difference = Math.round(averageDifference)

				return {
					difference,
					isCalculating: false,
					error: null,
					currentDamage: currentDamageResult.normal.max,
					simulatedDamage: simulatedDamageResult.normal.max,
				}
			}

			// 「バフアイテムなし」の特殊処理
			if (item.id === '__buff_item_none__') {
				// 「バフアイテムなし」の場合は、現在装着中のバフアイテムを外した状態のダメージを計算
				const baselineData = currentData // 現在の状態を基準
				const simulatedData = removeItemFromSlot(currentData, slotInfo) // バフアイテムを外した状態

				// 基準ダメージ（現在の状態）を計算
				const baselineResults = calculateResults(baselineData)
				const currentDamageResult = calculateDamageWithService(
					baselineData,
					baselineResults,
					{ debug: options.debug, powerOptions: powerOptions || {} },
				)

				// シミュレーション後（バフアイテム外した状態）のダメージを計算
				const simulatedResults = calculateResults(simulatedData)
				const simulatedDamageResult = calculateDamageWithService(
					simulatedData,
					simulatedResults,
					{ debug: options.debug, powerOptions: powerOptions || {} },
				)

				// 差分を計算（外した状態 - 現在の状態）
				const averageDifference =
					simulatedDamageResult.normal.average -
					currentDamageResult.normal.average
				const difference = Math.round(averageDifference)

				return {
					difference,
					isCalculating: false,
					error: null,
					currentDamage: currentDamageResult.normal.max,
					simulatedDamage: simulatedDamageResult.normal.max,
				}
			}

			// 現在装着中のアイテムIDを確認
			let currentEquippedItemId: string | null = null
			let currentSlotKey: string | null = null

			if (slotInfo.type === 'crystal') {
				// クリスタルの場合
				currentSlotKey =
					slotInfo.category && typeof slotInfo.slot === 'number'
						? `${slotInfo.category}${slotInfo.slot + 1}`
						: null
				currentEquippedItemId = currentSlotKey
					? (currentData.crystals as unknown as Record<string, string | null>)[
							currentSlotKey
						]
					: null
			} else if (slotInfo.type === 'equipment') {
				// 装備の場合
				if (slotInfo.slot && typeof slotInfo.slot === 'string') {
					currentSlotKey = slotInfo.slot
					currentEquippedItemId =
						// biome-ignore lint/suspicious/noExplicitAny: 動的スロットキーアクセスのための型アサーション
						(currentData.equipment as any)[currentSlotKey]?.id || null
				}
			} else if (slotInfo.type === 'buffItem') {
				// バフアイテムの場合
				if (slotInfo.category && typeof slotInfo.category === 'string') {
					currentSlotKey = slotInfo.category
					currentEquippedItemId =
						// biome-ignore lint/suspicious/noExplicitAny: 動的スロットキーアクセスのための型アサーション
						(currentData.buffItems as any)[currentSlotKey] || null
				}
			}

			const isCurrentlyEquipped = currentEquippedItemId === item.id

			// 基準ダメージの取得/計算
			let calculatedBaselineDamageResult: DamageCalculationServiceResult
			if (isCurrentlyEquipped) {
				// 現在装着中のアイテムの場合：外した状態のダメージを計算
				const baselineData = removeItemFromSlot(currentData, slotInfo)
				const baselineResults = calculateResults(baselineData)
				calculatedBaselineDamageResult = calculateDamageWithService(
					baselineData,
					baselineResults,
					{ debug: options.debug, powerOptions: powerOptions || {} },
				)
			} else {
				// 装着していないアイテムの場合：キャッシュされた基準ダメージを使用
				if (!baselineDamageResult) {
					// キャッシュがない場合は従来の方法で計算
					const baselineResults = calculateResults(currentData)
					calculatedBaselineDamageResult = calculateDamageWithService(
						currentData,
						baselineResults,
						{ debug: options.debug, powerOptions: powerOptions || {} },
					)
				} else {
					// キャッシュされた基準ダメージを使用
					calculatedBaselineDamageResult = baselineDamageResult
				}
			}

			// シミュレーション後のダメージを計算
			let simulatedData = isCurrentlyEquipped
				? currentData // 現在装着中の場合は現在のデータ
				: simulateItemEquipSimple(currentData, item, slotInfo) // 装着していない場合は装着後をシミュレート

			// 装備の武器ATK情報をLocalStorageから取得して反映
			if (slotInfo.type === 'equipment' && !isCurrentlyEquipped) {
				const weaponInfo = getWeaponInfo(item.id)
				if (weaponInfo && weaponInfo.ATK > 0) {
					simulatedData = { ...simulatedData }
					
					// メイン武器またはサブ武器のATKを更新
					if (slotInfo.slot === 'mainWeapon') {
						simulatedData.mainWeapon = {
							...simulatedData.mainWeapon,
							ATK: weaponInfo.ATK,
							stability: weaponInfo.stability,
							refinement: weaponInfo.refinement,
						}
						if (weaponInfo.weaponType) {
							simulatedData.mainWeapon.weaponType = weaponInfo.weaponType
						}
					} else if (slotInfo.slot === 'subWeapon') {
						simulatedData.subWeapon = {
							...simulatedData.subWeapon,
							ATK: weaponInfo.ATK,
							stability: weaponInfo.stability,
							refinement: weaponInfo.refinement,
						}
					}
				}
			}

			// 連携クリスタがある場合は、それを考慮したデータに更新
			if (options.linkedCrystals && slotInfo.type === 'equipment') {
				simulatedData = { ...simulatedData }
				
				// 連携クリスタをシミュレーションデータに設定
				if (options.linkedCrystals.slot1) {
					simulatedData.crystals = {
						...simulatedData.crystals,
						weapon1: options.linkedCrystals.slot1,
					}
				}
				if (options.linkedCrystals.slot2) {
					simulatedData.crystals = {
						...simulatedData.crystals,
						weapon2: options.linkedCrystals.slot2,
					}
				}
			}

			const simulatedResults = calculateResults(simulatedData)
			const simulatedDamageResult = calculateDamageWithService(
				simulatedData,
				simulatedResults,
				{ debug: options.debug, powerOptions: powerOptions || {} },
			)

			// 平均ダメージの差分を計算
			const averageDifference =
				simulatedDamageResult.normal.average -
				calculatedBaselineDamageResult.normal.average

			// 最終差分は平均差分を使用
			const difference = Math.round(averageDifference)
			
			// 特定の装備のみデバッグ用ログ出力
			if (item.name === 'ディグニダー' || item.name === '両手有利23%A15%S10%') {
				console.log('=== ダメージ差分計算の詳細 ===')
				console.log('アイテム:', item.name, `(ID: ${item.id})`)
				console.log('スロット情報:', slotInfo)
				console.log('現在装着中:', isCurrentlyEquipped ? 'はい' : 'いいえ')
				
				// 武器情報の取得状況を確認
				if (slotInfo.type === 'equipment' && !isCurrentlyEquipped) {
					const weaponInfo = getWeaponInfo(item.id)
					console.log('--- 武器情報取得 ---')
					console.log('取得した武器情報:', weaponInfo)
					if (weaponInfo) {
						console.log('武器ATK:', weaponInfo.ATK)
						console.log('安定率:', weaponInfo.stability)
						console.log('精錬値:', weaponInfo.refinement)
						console.log('武器種:', weaponInfo.weaponType || weaponInfo.subWeaponType)
					} else {
						console.log('武器情報が見つかりません')
					}
				}
				
				// シミュレーションデータの詳細
				console.log('--- シミュレーションデータ ---')
				console.log('メイン武器ATK:', simulatedData.mainWeapon?.ATK || 0)
				console.log('サブ武器ATK:', simulatedData.subWeapon?.ATK || 0)
				
				if (slotInfo.type === 'equipment') {
					console.log('装備スロット:', slotInfo.slot)
					// biome-ignore lint/suspicious/noExplicitAny: 動的スロットキーアクセスのための型アサーション
					const equipmentSlot = (simulatedData.equipment as any)[slotInfo.slot || '']
					console.log('装備データ:', equipmentSlot)
					if (equipmentSlot?.properties) {
						console.log('装備プロパティ:', equipmentSlot.properties)
					}
				}
				
				// 基準ダメージの詳細
				console.log('--- 基準ダメージ ---')
				console.log('平均:', calculatedBaselineDamageResult.normal.average)
				console.log('最小:', calculatedBaselineDamageResult.normal.min)
				console.log('最大:', calculatedBaselineDamageResult.normal.max)
				
				// シミュレーション後ダメージの詳細
				console.log('--- シミュレーション後ダメージ ---')
				console.log('平均:', simulatedDamageResult.normal.average)
				console.log('最小:', simulatedDamageResult.normal.min)
				console.log('最大:', simulatedDamageResult.normal.max)
				
				console.log('--- 計算結果 ---')
				console.log('平均ダメージ差分:', averageDifference)
				console.log('最終差分（四捨五入）:', difference)
				console.log('========================')
			}

			return {
				difference,
				isCalculating: false,
				error: null,
				currentDamage: calculatedBaselineDamageResult.normal.max,
				simulatedDamage: simulatedDamageResult.normal.max,
			}
		} catch (error) {
			return {
				...initialResult,
				error: error as Error,
			}
		}
	}, [
		item,
		currentData,
		currentResults,
		powerOptions,
		slotInfo,
		options.disabled,
		options.debug,
		options.linkedCrystals,
		baselineDamageResult,
	])
}

/**
 * 指定されたスロットからアイテムを削除した状態のデータを作成
 */
function removeItemFromSlot(
	currentData: CalculatorData,
	slotInfo: SlotInfo,
): CalculatorData {
	// ディープコピーを作成
	const resultData: CalculatorData = JSON.parse(JSON.stringify(currentData))

	if (slotInfo.type === 'crystal') {
		// クリスタルの場合
		if (slotInfo.category && typeof slotInfo.slot === 'number') {
			const slotNumber = slotInfo.slot + 1 // 0-based to 1-based
			const slotKey = `${slotInfo.category}${slotNumber}`

			// クリスタルスロットを空にする
			if (resultData.crystals) {
				;(resultData.crystals as unknown as Record<string, string | null>)[
					slotKey
				] = null
			}
		}
	} else if (slotInfo.type === 'equipment') {
		// 装備の場合
		if (slotInfo.slot && typeof slotInfo.slot === 'string') {
			const slotKey = slotInfo.slot
			// 装備スロットを空にする
			if (resultData.equipment) {
				// biome-ignore lint/suspicious/noExplicitAny: 動的スロットキーアクセスのための型アサーション
				;(resultData.equipment as any)[slotKey] = null
			}
		}
	} else if (slotInfo.type === 'buffItem') {
		// バフアイテムの場合
		if (slotInfo.category && typeof slotInfo.category === 'string') {
			const category = slotInfo.category
			// バフアイテムスロットを空にする
			if (resultData.buffItems) {
				// biome-ignore lint/suspicious/noExplicitAny: 動的スロットキーアクセスのための型アサーション
				;(resultData.buffItems as any)[category] = null
			}
		}
	}

	return resultData
}
