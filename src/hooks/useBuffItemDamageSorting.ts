/**
 * バフアイテムをダメージ差分順でソートするためのユーティリティ
 */

import { useMemo, useState, useEffect } from 'react'
import type { PresetBuffItem } from '@/types/calculator'
import type { SlotInfo } from '@/types/damagePreview'
import { useCalculatorStore } from '@/stores/calculatorStore'
import { calculateResults } from '@/utils/calculationEngine'
import { calculateDamageWithService } from '@/utils/damageCalculationService'
import { simulateItemEquipSimple } from '@/utils/damageSimulationSimple'

interface BuffItemWithDamage {
	id: string
	name: string
	category: any
	properties: any
	description?: string
	damageDifference: number
	isCalculating: boolean
	hasError: boolean
}

/**
 * バフアイテム配列をダメージ差分順でソートするフック
 */
export function useBuffItemDamageSorting(
	buffItems: PresetBuffItem[],
	slotInfo: SlotInfo | undefined,
	enabled: boolean = true
) {
	const currentData = useCalculatorStore((state) => state.data)
	const currentResults = useCalculatorStore((state) => state.calculationResults)
	const powerOptions = useCalculatorStore((state) => state.data.powerOptions)
	const baselineDamageResult = useCalculatorStore((state) => state.baselineDamageResult)
	
	const [buffItemsWithDamage, setBuffItemsWithDamage] = useState<BuffItemWithDamage[]>([])
	const [isCalculating, setIsCalculating] = useState(false)

	// ダメージ差分を計算
	useEffect(() => {
		if (!enabled || !slotInfo || buffItems.length === 0 || !currentData) {
			setBuffItemsWithDamage(buffItems.map(buffItem => ({
				...buffItem,
				damageDifference: 0,
				isCalculating: false,
				hasError: false
			})))
			return
		}

		setIsCalculating(true)

		// 非同期でダメージ差分を計算
		const calculateDamages = async () => {
			try {
				// 基準ダメージの取得
				let effectiveCurrentResults = currentResults
				if (!effectiveCurrentResults) {
					effectiveCurrentResults = calculateResults(currentData)
				}

				let calculatedBaselineDamageResult
				if (baselineDamageResult) {
					calculatedBaselineDamageResult = baselineDamageResult
				} else {
					calculatedBaselineDamageResult = calculateDamageWithService(
						currentData,
						effectiveCurrentResults,
						{ debug: false, powerOptions: powerOptions || {} }
					)
				}

				// 各バフアイテムのダメージを計算
				const results = await Promise.all(
					buffItems.map(async (buffItem) => {
						try {
							// シミュレーション後のダメージを計算
							const simulatedData = simulateItemEquipSimple(currentData, buffItem as any, slotInfo)
							const simulatedResults = calculateResults(simulatedData)
							const simulatedDamageResult = calculateDamageWithService(
								simulatedData,
								simulatedResults,
								{ debug: false, powerOptions: powerOptions || {} }
							)

							// 平均ダメージの差分を計算
							const averageDifference =
								simulatedDamageResult.normal.average -
								calculatedBaselineDamageResult.normal.average

							const difference = Math.round(averageDifference)

							return {
								...buffItem,
								damageDifference: difference,
								isCalculating: false,
								hasError: false
							}
						} catch (error) {
							return {
								...buffItem,
								damageDifference: 0,
								isCalculating: false,
								hasError: true
							}
						}
					})
				)

				setBuffItemsWithDamage(results)
			} catch (error) {
				// エラー時は元の配列を返す
				setBuffItemsWithDamage(buffItems.map(buffItem => ({
					...buffItem,
					damageDifference: 0,
					isCalculating: false,
					hasError: true
				})))
			} finally {
				setIsCalculating(false)
			}
		}

		calculateDamages()
	}, [buffItems, slotInfo, enabled, currentData, currentResults, powerOptions, baselineDamageResult])

	// ダメージ差分順でソート
	const sortedBuffItems = useMemo(() => {
		if (!enabled || isCalculating) return buffItems

		return [...buffItemsWithDamage]
			.sort((a, b) => {
				// エラーがあるアイテムは最後に
				if (a.hasError && !b.hasError) return 1
				if (!a.hasError && b.hasError) return -1
				if (a.hasError && b.hasError) return a.name.localeCompare(b.name)

				// ダメージ差分で降順ソート
				const diff = b.damageDifference - a.damageDifference
				if (diff !== 0) return diff

				// 同じダメージ差分の場合は名前順
				return a.name.localeCompare(b.name)
			})
			.map(buffItem => buffItem as unknown as PresetBuffItem)
	}, [buffItemsWithDamage, enabled, buffItems, isCalculating])

	return {
		sortedBuffItems,
		isCalculating
	}
}