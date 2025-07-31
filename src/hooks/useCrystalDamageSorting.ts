/**
 * クリスタルをダメージ差分順でソートするためのユーティリティ
 */

import { useMemo, useState, useEffect } from 'react'
import type { Crystal } from '@/types/calculator'
import type { SlotInfo } from '@/types/damagePreview'
import { useCalculatorStore } from '@/stores/calculatorStore'
import { calculateResults } from '@/utils/calculationEngine'
import {
	calculateDamageWithService,
	type DamageCalculationServiceResult,
} from '@/utils/damageCalculationService'
import { simulateItemEquipSimple } from '@/utils/damageSimulationSimple'

interface CrystalWithDamage {
	id: string
	name: string
	// biome-ignore lint/suspicious/noExplicitAny: Crystal typeは複雑な型のため一時的にanyを使用
	type: any
	// biome-ignore lint/suspicious/noExplicitAny: Crystal propertiesは複雑な型のため一時的にanyを使用
	properties: any
	description?: string
	// biome-ignore lint/suspicious/noExplicitAny: conditionalEffectsは複雑な型のため一時的にanyを使用
	conditionalEffects?: any[]
	isCustom?: boolean
	createdAt?: string
	updatedAt?: string
	isFavorite?: boolean
	damageDifference: number
	isCalculating: boolean
	hasError: boolean
}

/**
 * クリスタル配列をダメージ差分順でソートするフック
 */
export function useCrystalDamageSorting(
	crystals: Crystal[],
	slotInfo: SlotInfo | undefined,
	enabled = true,
) {
	const currentData = useCalculatorStore((state) => state.data)
	const currentResults = useCalculatorStore((state) => state.calculationResults)
	const powerOptions = useCalculatorStore((state) => state.data.powerOptions)
	const baselineDamageResult = useCalculatorStore(
		(state) => state.baselineDamageResult,
	)

	const [crystalsWithDamage, setCrystalsWithDamage] = useState<
		CrystalWithDamage[]
	>([])
	const [isCalculating, setIsCalculating] = useState(false)

	// ダメージ差分を計算
	useEffect(() => {
		if (!enabled || !slotInfo || crystals.length === 0 || !currentData) {
			setCrystalsWithDamage(
				crystals.map((crystal) => ({
					...crystal,
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

				// 各クリスタルのダメージを計算
				const results = await Promise.all(
					crystals.map(async (crystal) => {
						try {
							// シミュレーション後のダメージを計算
							const simulatedData = simulateItemEquipSimple(
								currentData,
								crystal,
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
								...crystal,
								damageDifference: difference,
								isCalculating: false,
								hasError: false,
							}
						} catch (_error) {
							return {
								...crystal,
								damageDifference: 0,
								isCalculating: false,
								hasError: true,
							}
						}
					}),
				)

				setCrystalsWithDamage(results)
			} catch (_error) {
				// エラー時は元の配列を返す
				setCrystalsWithDamage(
					crystals.map((crystal) => ({
						...crystal,
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
		crystals,
		slotInfo,
		enabled,
		currentData,
		currentResults,
		powerOptions,
		baselineDamageResult,
	])

	// ダメージ差分順でソート
	const sortedCrystals = useMemo(() => {
		if (!enabled || isCalculating) return crystals

		return [...crystalsWithDamage]
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
			.map(
				(crystal) =>
					({
						id: crystal.id,
						name: crystal.name,
						type: crystal.type,
						properties: crystal.properties,
						description: crystal.description,
						conditionalEffects: crystal.conditionalEffects,
						isCustom: crystal.isCustom,
						createdAt: crystal.createdAt,
						updatedAt: crystal.updatedAt,
						isFavorite: crystal.isFavorite,
					}) as Crystal,
			)
	}, [crystalsWithDamage, enabled, crystals, isCalculating])

	return {
		sortedCrystals,
		isCalculating,
	}
}
