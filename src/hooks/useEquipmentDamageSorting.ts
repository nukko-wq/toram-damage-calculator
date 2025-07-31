/**
 * 装備をダメージ差分順でソートするためのユーティリティ
 */

import { useMemo, useState, useEffect } from 'react'
import type { Equipment } from '@/types/calculator'
import type { SlotInfo } from '@/types/damagePreview'
import { useCalculatorStore } from '@/stores/calculatorStore'
import { calculateResults } from '@/utils/calculationEngine'
import {
	calculateDamageWithService,
	type DamageCalculationServiceResult,
} from '@/utils/damageCalculationService'
import { simulateItemEquipSimple } from '@/utils/damageSimulationSimple'

interface EquipmentWithDamage {
	id: string
	name: string
	// biome-ignore lint/suspicious/noExplicitAny: Equipment typeは複雑な型のため一時的にanyを使用
	type: any
	// biome-ignore lint/suspicious/noExplicitAny: Equipment propertiesは複雑な型のため一時的にanyを使用
	properties: any
	description?: string
	// biome-ignore lint/suspicious/noExplicitAny: conditionalEffectsは複雑な型のため一時的にanyを使用
	conditionalEffects?: any[]
	isCustom?: boolean
	createdAt?: string
	updatedAt?: string
	isFavorite?: boolean
	// biome-ignore lint/suspicious/noExplicitAny: Equipment categoryは複雑な型のため一時的にanyを使用
	category?: any
	refinement?: number
	damageDifference: number
	isCalculating: boolean
	hasError: boolean
}

/**
 * 装備配列をダメージ差分順でソートするフック
 */
export function useEquipmentDamageSorting(
	equipments: Equipment[],
	slotInfo: SlotInfo | undefined,
	enabled = true,
) {
	const currentData = useCalculatorStore((state) => state.data)
	const currentResults = useCalculatorStore((state) => state.calculationResults)
	const powerOptions = useCalculatorStore((state) => state.data.powerOptions)
	const baselineDamageResult = useCalculatorStore(
		(state) => state.baselineDamageResult,
	)

	const [equipmentsWithDamage, setEquipmentsWithDamage] = useState<
		EquipmentWithDamage[]
	>([])
	const [isCalculating, setIsCalculating] = useState(false)

	// ダメージ差分を計算
	useEffect(() => {
		if (!enabled || !slotInfo || equipments.length === 0 || !currentData) {
			setEquipmentsWithDamage(
				equipments.map((equipment) => ({
					...equipment,
					damageDifference: 0,
					isCalculating: false,
					hasError: false,
				})),
			)
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

				let calculatedBaselineDamageResult: DamageCalculationServiceResult
				if (baselineDamageResult) {
					calculatedBaselineDamageResult = baselineDamageResult
				} else {
					calculatedBaselineDamageResult = calculateDamageWithService(
						currentData,
						effectiveCurrentResults,
						{ debug: false, powerOptions: powerOptions || {} },
					)
				}

				// 各装備のダメージを計算
				const results = await Promise.all(
					equipments.map(async (equipment) => {
						try {
							// シミュレーション後のダメージを計算
							const simulatedData = simulateItemEquipSimple(
								currentData,
								equipment,
								slotInfo,
							)
							const simulatedResults = calculateResults(simulatedData)
							const simulatedDamageResult = calculateDamageWithService(
								simulatedData,
								simulatedResults,
								{ debug: false, powerOptions: powerOptions || {} },
							)

							// 平均ダメージの差分を計算
							const averageDifference =
								simulatedDamageResult.normal.average -
								calculatedBaselineDamageResult.normal.average

							const difference = Math.round(averageDifference)

							return {
								...equipment,
								damageDifference: difference,
								isCalculating: false,
								hasError: false,
							}
						} catch (_error) {
							return {
								...equipment,
								damageDifference: 0,
								isCalculating: false,
								hasError: true,
							}
						}
					}),
				)

				setEquipmentsWithDamage(results)
			} catch (_error) {
				// エラー時は元の配列を返す
				setEquipmentsWithDamage(
					equipments.map((equipment) => ({
						...equipment,
						damageDifference: 0,
						isCalculating: false,
						hasError: true,
					})),
				)
			} finally {
				setIsCalculating(false)
			}
		}

		calculateDamages()
	}, [
		equipments,
		slotInfo,
		enabled,
		currentData,
		currentResults,
		powerOptions,
		baselineDamageResult,
	])

	// ダメージ差分順でソート
	const sortedEquipments = useMemo(() => {
		if (!enabled || isCalculating) return equipments

		return [...equipmentsWithDamage]
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
			.map((equipment) => equipment as unknown as Equipment)
	}, [equipmentsWithDamage, enabled, equipments, isCalculating])

	return {
		sortedEquipments,
		isCalculating,
	}
}
