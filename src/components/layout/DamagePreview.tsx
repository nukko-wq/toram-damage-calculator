'use client'

import { useState, useMemo, useEffect } from 'react'
import { useCalculatorStore } from '@/stores/calculatorStore'
import {
	calculateDamage,
	createDefaultDamageInput,
	type DamageCalculationInput,
} from '@/utils/damageCalculation'
import { getAttackSkillById } from '@/data/attackSkills'
import { attackSkillCalculation } from '@/utils/attackSkillCalculation'
import { getPresetEnemyById } from '@/utils/enemyDatabase'
import { calculateBossDifficultyStats } from '@/utils/bossDifficultyCalculation'
import {
	type DamageCaptureData,
	saveCaptureData,
	loadCaptureData,
	createCaptureData,
} from '@/utils/damageCaptureStorage'
import { getBuffSkillPassiveMultiplier, getBuffSkillPassiveMultiplierWithSkillCategory } from '@/utils/buffSkillCalculation'
import type { PowerOptions } from '@/types/calculator'
import { createInitialPowerOptions } from '@/utils/initialData'

interface DamagePreviewProps {
	isVisible: boolean
}

// ダメージ表示結果の型定義
interface DamageDisplayResult {
	min: number
	max: number
	average: number
	stability: number
	averageStability: number
}

// ダメージ計算結果の型定義
interface DamageResults {
	normal: DamageDisplayResult
	skill: DamageDisplayResult
}

export default function DamagePreview({ isVisible }: DamagePreviewProps) {

	// 威力オプション設定をZustandストアから取得（フォールバック付き）
	const powerOptions =
		useCalculatorStore((state) => state.data.powerOptions) ||
		createInitialPowerOptions()
	const updatePowerOptions = useCalculatorStore(
		(state) => state.updatePowerOptions,
	)

	// キャプチャデータの状態管理
	const [captureData, setCaptureData] = useState<DamageCaptureData | null>(null)

	// キャプチャデータの初期読み込み
	useEffect(() => {
		const loadedData = loadCaptureData()
		setCaptureData(loadedData)
	}, [])

	// Zustandストアから計算データと計算結果を取得
	const calculatorData = useCalculatorStore((state) => state.data)
	const calculationResults = useCalculatorStore(
		(state) => state.calculationResults,
	)
	const updateCalculationResults = useCalculatorStore(
		(state) => state.updateCalculationResults,
	)

	// 計算結果を更新
	useEffect(() => {
		if (!calculationResults) {
			updateCalculationResults()
		}
	}, [calculationResults, updateCalculationResults])

	// 選択されている敵の名前を取得
	const getSelectedEnemyName = (): string => {
		if (calculatorData.enemy?.selectedEnemyId) {
			const enemy = getPresetEnemyById(calculatorData.enemy.selectedEnemyId)
			if (enemy) {
				return enemy.name
			}
		}
		return '未選択'
	}

	// 実際のダメージ計算
	const damageResults = useMemo((): DamageResults => {
		try {
			// 基本的な計算入力データを作成
			const defaultInput = createDefaultDamageInput()

			// 中央集約された計算結果を使用
			const totalATK = calculationResults?.basicStats.totalATK || 0
			const stabilityRate = calculationResults?.basicStats.stabilityRate || 85


			// 敵情報を取得
			let enemyInfo = null
			if (calculatorData.enemy?.selectedEnemyId) {
				enemyInfo = getPresetEnemyById(calculatorData.enemy.selectedEnemyId)
			}


			// PowerOptionsに基づく属性攻撃設定
			const getElementAdvantageTotal = () => {
				// 属性攻撃が無効の場合は0を返す
				if (powerOptions.elementAttack === 'none') {
					return 0
				}

				// 基本ステータスから総属性有利を取得（装備・クリスタ・料理・バフ統合済み）
				const baseAdvantage =
					calculationResults?.basicStats?.totalElementAdvantage ?? 0

				// 属性威力オプションに応じて計算
				switch (powerOptions.elementPower) {
					case 'disabled':
						return 0 // 属性威力無効時は0
					case 'awakeningOnly':
						return 25 // 覚醒のみ時は25%固定
					case 'advantageOnly':
						return baseAdvantage // 装備品補正値1の総属性有利のみ
					case 'enabled':
						return baseAdvantage + 25 // 総属性有利 + 属性覚醒25%
					default:
						return baseAdvantage
				}
			}

			const getElementAdvantageAwakening = () => {
				// 属性覚醒は常に0（getElementAdvantageTotalで統合計算されるため）
				return 0
			}

			// PowerOptionsに基づく距離設定
			const getDistanceValues = () => {
				return {
					shortRange:
						calculationResults?.equipmentBonus1?.shortRangeDamage || 0,
					longRange: calculationResults?.equipmentBonus1?.longRangeDamage || 0,
				}
			}

			// Zustandストアのデータで入力を更新
			const distanceValues = getDistanceValues()

			// 敵情報を明示的に作成（ボス難易度適用）
			let finalEnemyDEF = enemyInfo?.stats.DEF ?? defaultInput.enemy.DEF
			let finalEnemyMDEF = enemyInfo?.stats.MDEF ?? defaultInput.enemy.MDEF
			let finalEnemyLevel = enemyInfo?.level ?? defaultInput.enemy.level

			// ボス系敵かつ難易度がnormal以外の場合、難易度調整を適用
			if (
				enemyInfo?.category === 'boss' &&
				powerOptions.bossDifficulty !== 'normal'
			) {
				const adjustedStats = calculateBossDifficultyStats(
					finalEnemyLevel,
					enemyInfo.stats,
					powerOptions.bossDifficulty,
				)
				finalEnemyLevel = adjustedStats.level
				finalEnemyDEF = adjustedStats.stats.DEF
				finalEnemyMDEF = adjustedStats.stats.MDEF
			}

			// バフスキルからパッシブ倍率を取得
			const passiveMultiplier = getBuffSkillPassiveMultiplier(
				calculatorData.buffSkills?.skills || null,
				calculatorData.mainWeapon?.weaponType || null,
			)


			const input: DamageCalculationInput = {
				...defaultInput,
				playerLevel: calculatorData.baseStats.level,
				referenceStat: totalATK, // 計算済みの総ATKを使用
				passiveMultiplier: passiveMultiplier, // バフスキルから取得したパッシブ倍率を適用
				// 敵情報を実際のデータに基づいて設定
				enemyLevel: finalEnemyLevel,
				stability: {
					rate: stabilityRate, // 計算済みの安定率を使用
				},
				// PowerOptionsに基づいた設定
				elementAdvantage: {
					total: getElementAdvantageTotal(),
					awakening: getElementAdvantageAwakening(),
					isActive:
						powerOptions.elementAttack !== 'none' &&
						powerOptions.elementPower !== 'disabled',
				},
				distance: distanceValues,
				unsheathe: {
					fixedDamage:
						calculationResults?.equipmentBonus1?.unsheatheAttack ||
						defaultInput.unsheathe.fixedDamage,
					rateBonus: calculationResults?.equipmentBonus1?.elementPower || 0, // 抜刀威力%は一旦elementPowerで代用
					isActive: powerOptions.unsheathe,
				},
				userSettings: {
					familiarity: 100, // 仮の慣れ値（100%）
					currentDistance: powerOptions.distance,
					damageType: powerOptions.damageType,
				},
				// クリティカルダメージ設定
				critical: {
					damage: calculationResults?.basicStats.criticalDamage || 100,
				},
				// 敵情報設定を実際のデータに基づいて更新
				enemy: {
					...defaultInput.enemy,
					DEF: finalEnemyDEF,
					MDEF: finalEnemyMDEF,
					level: finalEnemyLevel,
					category: enemyInfo?.category ?? defaultInput.enemy.category,
					difficulty: powerOptions.bossDifficulty,
				},
				// 耐性設定も実際のデータに基づいて更新
				resistance: {
					...defaultInput.resistance,
					physical:
						enemyInfo?.stats.physicalResistance ??
						defaultInput.resistance.physical,
					magical:
						enemyInfo?.stats.magicalResistance ??
						defaultInput.resistance.magical,
				},
				// 貫通値を中央集約された装備品補正値1から取得
				penetration: {
					physical:
						calculationResults?.equipmentBonus1?.physicalPenetration ??
						defaultInput.penetration.physical,
					magical:
						calculationResults?.equipmentBonus1?.magicalPenetration ??
						defaultInput.penetration.magical,
				},
				// コンボ設定を反映
				combo: {
					isActive: powerOptions.combo,
					multiplier: powerOptions.combo ? 150 : 100, // 仮のコンボ倍率
				},
				attackSkill: {
					...defaultInput.attackSkill,
					// 攻撃スキルが選択されている場合はその値を使用、なければ通常攻撃
					multiplier: 100, // 一旦通常攻撃として設定（後でスキル攻撃時に上書き）
					fixedDamage: 0,
				},
			}


			// 攻撃スキルが選択されている場合は、スキルの計算結果を使用
			const attackResults: Array<{
				hitNumber: number
				result: ReturnType<typeof calculateDamage>
			}> = []
			if (calculatorData.attackSkill?.selectedSkillId) {
				const selectedSkill = getAttackSkillById(
					calculatorData.attackSkill.selectedSkillId,
				)
				if (selectedSkill) {
					// 攻撃スキル計算システムを使用してスキル情報を取得
					const skillCalculationResult = attackSkillCalculation.calculateSkill(
						selectedSkill.id,
						calculatorData,
					)

					// スキルダメージオプションに応じて計算対象の撃を決定
					// 注意：UIでは3撃目までしか表示しないが、実際のスキルには6撃目まで存在するものがある
					// 「全て」選択時は1～6撃目全ての合計ダメージを計算する
					const getTargetHits = () => {
						switch (powerOptions.skillDamage) {
							case 'hit1':
								return skillCalculationResult.hits.filter(
									(hit) => hit.hitNumber === 1,
								)
							case 'hit2':
								return skillCalculationResult.hits.filter(
									(hit) => hit.hitNumber === 2,
								)
							case 'hit3':
								return skillCalculationResult.hits.filter(
									(hit) => hit.hitNumber === 3,
								)
							case 'all':
								// 1～6撃目全てを対象（スキルに存在する全ての撃の合計）
								return skillCalculationResult.hits
							default:
								return skillCalculationResult.hits
						}
					}

					const targetHits = getTargetHits()

					// 各撃に対してダメージ計算を実行
					for (const hitResult of targetHits) {
						const originalHit = selectedSkill.hits.find(
							(hit) => hit.hitNumber === hitResult.hitNumber,
						)
						if (!originalHit) continue

						const skillInput = {
							...input,
							// スキルの場合はMATKまたはtotalATKを参照
							referenceStat:
								originalHit.powerReference === 'MATK'
									? calculationResults?.basicStats.MATK || 1500
									: totalATK,
							// スキルカテゴリを考慮したパッシブ倍率を適用
							passiveMultiplier: getBuffSkillPassiveMultiplierWithSkillCategory(
								calculatorData.buffSkills?.skills || null,
								calculatorData.mainWeapon?.weaponType || null,
								selectedSkill.category,
							),
							attackSkill: {
								type: originalHit.attackType,
								multiplier: hitResult.calculatedMultiplier,
								fixedDamage: hitResult.calculatedFixedDamage,
								supportedDistances: (() => {
									const distances: ('short' | 'long')[] = []
									if (originalHit.canUseShortRangePower) distances.push('short')
									if (originalHit.canUseLongRangePower) distances.push('long')
									return distances
								})(),
								canUseLongRange: originalHit.canUseLongRange,
								skillId: selectedSkill.id,
								hitNumber: hitResult.hitNumber,
							},
							// スキルでも距離・抜刀・慣れ設定を適用
							unsheathe: {
								...input.unsheathe,
								isActive:
									powerOptions.unsheathe && originalHit.canUseUnsheathePower,
							},
						}

						const hitAttackResult = calculateDamage(skillInput)
						attackResults.push({
							hitNumber: hitResult.hitNumber,
							result: hitAttackResult,
						})
					}
				}
			} else {
				// 通常攻撃の場合
				const normalAttackResult = calculateDamage(input)
				attackResults.push({
					hitNumber: 1,
					result: normalAttackResult,
				})
			}

			// 複数撃がある場合は合計ダメージを計算
			// 多撃判定フラグ
			const isMultiHit = attackResults.length > 1
			const totalAttackResult = (() => {
				if (attackResults.length === 0) {
					// 存在しない撃を選択した場合（例：ムーンスラッシュの3撃目）は0ダメージを返す
					const defaultStabilityRate =
						calculationResults?.basicStats.stabilityRate || 85
					return {
						baseDamage: 0,
						stabilityResult: {
							minDamage: 0,
							maxDamage: 0,
							averageDamage: 0,
							stabilityRate: defaultStabilityRate,
						},
						calculationSteps: {
							step1_baseDamage: {
								playerLevel: calculatorData.baseStats.level,
								referenceStat: 0,
								enemyLevel: 0,
								beforeResistance: 0,
								physicalResistanceRate: 0,
								magicalResistanceRate: 0,
								weaponResistanceRate: 0,
								afterResistance: 0,
								enemyDEF: 0,
								result: 0,
							},
						} as any,
					}
				}

				if (attackResults.length === 1) {
					// 単発攻撃または特定撃のみ選択時
					return attackResults[0].result
				}

				// 複数撃の合計計算（'all'選択時）
				// 各撃の最大ダメージを合計
				const totalMaxDamage = attackResults.reduce(
					(sum, hit) => sum + hit.result.baseDamage,
					0,
				)

				// 基本ステータスの安定率を取得
				const baseStabilityRate =
					calculationResults?.basicStats.stabilityRate || 85

				// 各撃の最小ダメージを個別に計算して合計
				// 各撃: 最大ダメージ × 最小安定率（小数点切り捨て）
				const totalMinDamage = attackResults.reduce((sum, hit) => {
					const hitMaxDamage = hit.result.baseDamage
					const hitMinDamage = Math.floor(
						(hitMaxDamage * baseStabilityRate) / 100,
					)
					return sum + hitMinDamage
				}, 0)

				// 各撃の平均ダメージを個別に計算して合計
				// 平均安定率 = (最大安定率 + 最小安定率) / 2（小数点切り捨て）
				// 各撃: 最大ダメージ × 平均安定率（小数点切り捨て）
				const totalAverageDamage = attackResults.reduce((sum, hit) => {
					const hitMaxDamage = hit.result.baseDamage
					const hitMaxStabilityRate = 100
					const hitAverageStabilityRate = Math.floor(
						(hitMaxStabilityRate + baseStabilityRate) / 2,
					)
					const hitAverageDamage = Math.floor(
						(hitMaxDamage * hitAverageStabilityRate) / 100,
					)
					return sum + hitAverageDamage
				}, 0)

				// 全体の平均安定率を計算（すべての撃で同じ安定率のため）
				const hitMaxStabilityRate = 100
				const overallAverageStabilityRate = Math.floor(
					(hitMaxStabilityRate + baseStabilityRate) / 2,
				)


				return {
					baseDamage: totalMaxDamage,
					stabilityResult: {
						minDamage: totalMinDamage,
						maxDamage: totalMaxDamage,
						averageDamage: totalAverageDamage,
						stabilityRate: baseStabilityRate, // 最小の安定率を使用
					},
					calculationSteps: attackResults[0].result.calculationSteps, // 最初の撃の計算過程を参考表示
				}
			})()

			const attackResult = totalAttackResult


			// ダメージ判定タイプに応じて表示するダメージを決定
			const getDamageByType = () => {
				const baseDamage = attackResult.baseDamage // 白ダメ（基本ダメージ）
				const stabilityResult = attackResult.stabilityResult
				const stabilityRate = stabilityResult.stabilityRate

				switch (powerOptions.damageType) {
					case 'white': {
						// 白ダメ：基本ダメージに対して安定率を適用
						const minStabilityRate = stabilityRate
						const maxStabilityRate = 100
						const averageStabilityRate = Math.floor(
							(minStabilityRate + maxStabilityRate) / 2,
						)

						// 多撃の場合は既に計算済みの値を使用
						if (isMultiHit) {
							return {
								min: stabilityResult.minDamage, // 既に計算済み
								max: stabilityResult.maxDamage, // 既に計算済み
								average: stabilityResult.averageDamage, // 既に計算済み
								stability: stabilityRate,
								averageStability: averageStabilityRate,
							}
						}

						return {
							min: Math.floor((baseDamage * stabilityRate) / 100),
							max: baseDamage,
							average: Math.floor((baseDamage * averageStabilityRate) / 100),
							stability: stabilityRate,
							averageStability: averageStabilityRate,
						}
					}
					case 'critical': {
						// クリティカル：baseDamageがすでにクリティカル計算済み
						const minStabilityRate = stabilityRate
						const maxStabilityRate = 100
						const averageStabilityRate = Math.floor(
							(minStabilityRate + maxStabilityRate) / 2,
						)


						// 多撃の場合は既に計算済みの値を使用
						if (isMultiHit) {
							return {
								min: stabilityResult.minDamage, // 既に計算済み
								max: stabilityResult.maxDamage, // 既に計算済み
								average: stabilityResult.averageDamage, // 既に計算済み
								stability: stabilityRate,
								averageStability: averageStabilityRate,
							}
						}

						return {
							min: Math.floor((baseDamage * stabilityRate) / 100),
							max: baseDamage,
							average: Math.floor((baseDamage * averageStabilityRate) / 100),
							stability: stabilityRate,
							averageStability: averageStabilityRate,
						}
					}
					case 'graze': {
						// グレイズ：後で実装予定
						const grazeBaseDamage = Math.floor(baseDamage * 0.1)
						const minStabilityRate = stabilityRate
						const maxStabilityRate = 100
						const averageStabilityRate = Math.floor(
							(minStabilityRate + maxStabilityRate) / 2,
						)

						// 多撃の場合は既に計算済みの値を使用（グレイズ適用後）
						if (isMultiHit) {
							return {
								min: Math.floor(stabilityResult.minDamage * 0.1),
								max: Math.floor(stabilityResult.maxDamage * 0.1),
								average: Math.floor(stabilityResult.averageDamage * 0.1),
								stability: stabilityRate,
								averageStability: averageStabilityRate,
							}
						}

						return {
							min: Math.floor((grazeBaseDamage * stabilityRate) / 100),
							max: grazeBaseDamage,
							average: Math.floor(
								(grazeBaseDamage * averageStabilityRate) / 100,
							),
							stability: stabilityRate,
							averageStability: averageStabilityRate,
						}
					}
					case 'expected': {
						// 期待値（多撃の場合は既に計算済みの値を使用）
						if (isMultiHit) {
							return {
								min: stabilityResult.averageDamage,
								max: stabilityResult.averageDamage,
								average: stabilityResult.averageDamage,
								stability: stabilityRate,
								averageStability: stabilityRate,
							}
						}
						return {
							min: stabilityResult.averageDamage,
							max: stabilityResult.averageDamage,
							average: stabilityResult.averageDamage,
							stability: stabilityRate,
							averageStability: stabilityRate,
						}
					}
					default: {
						// 通常ダメージ：最大=基本ダメージ、最小=基本ダメージ×安定率（小数点以下切り捨て）
						const minStabilityRate = stabilityRate
						const maxStabilityRate = 100
						const averageStabilityRate = Math.floor(
							(minStabilityRate + maxStabilityRate) / 2,
						)

						// 多撃の場合は既に計算済みの値を使用
						if (isMultiHit) {
							return {
								min: stabilityResult.minDamage, // 既に計算済み
								max: stabilityResult.maxDamage, // 既に計算済み
								average: stabilityResult.averageDamage, // 既に計算済み
								stability: stabilityRate,
								averageStability: averageStabilityRate,
							}
						}

						return {
							min: Math.floor((baseDamage * stabilityRate) / 100),
							max: baseDamage,
							average: Math.floor((baseDamage * averageStabilityRate) / 100),
							stability: stabilityRate,
							averageStability: averageStabilityRate,
						}
					}
				}
			}

			const damageDisplay = getDamageByType()


			return {
				normal: damageDisplay,
				skill: damageDisplay, // スキル攻撃も同じ判定を適用
			}
		} catch (error) {
			console.error('ダメージ計算エラー:', error)
			// エラー時はフォールバック値を返す
			return {
				normal: {
					min: 1000,
					max: 1500,
					average: 1250,
					stability: 85,
					averageStability: 92,
				},
				skill: {
					min: 1200,
					max: 1800,
					average: 1500,
					stability: 85,
					averageStability: 92,
				},
			}
		}
	}, [calculatorData, calculationResults, powerOptions])

	if (!isVisible) {
		return null
	}

	// キャプチャボタンクリック処理
	const handleCapture = () => {
		try {
			// 現在のダメージ値を取得
			const currentDamage = damageResults.normal

			// キャプチャデータを作成
			const newCaptureData = createCaptureData(
				currentDamage.min,
				currentDamage.max,
				currentDamage.average,
				currentDamage.stability,
				currentDamage.averageStability,
			)

			// LocalStorageに保存
			saveCaptureData(newCaptureData)

			// 状態を更新
			setCaptureData(newCaptureData)

		} catch (error) {
			console.error('キャプチャに失敗しました:', error)
			alert('キャプチャに失敗しました')
		}
	}

	const handlePowerOptionChange = <K extends keyof PowerOptions>(
		key: K,
		value: PowerOptions[K],
	) => {
		updatePowerOptions({ ...powerOptions, [key]: value })
	}

	// powerOptionsが存在しない場合のフォールバック表示
	if (!powerOptions) {
		return (
			<div className="bg-blue-50 py-2">
				<div className="container mx-auto px-4">
					<div className="text-center py-4">Loading...</div>
				</div>
			</div>
		)
	}

	return (
		<div className="bg-blue-50 py-2">
			<div className="container mx-auto px-4">
				{/* ダメージ表示テーブル */}
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-gray-200">
								<th className="sm:px-2 py-3 text-left text-gray-700 font-medium" />
								<th
									className="px-1 sm:px-2 py-1 sm:py-3 text-center text-gray-700 font-medium"
									colSpan={2}
								>
									現在の計算結果
								</th>
								<th
									className="px-1 py-1 sm:px-2 sm:py-3 text-center text-gray-700 font-medium"
									colSpan={2}
								>
									<button
										onClick={handleCapture}
										className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-1 cursor-pointer text-sm mx-auto"
									>
										<svg
											className="w-3 h-3"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
											/>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
											/>
										</svg>
										キャプチャ
									</button>
								</th>
							</tr>
							<tr className="border-b border-gray-200">
								<th className="sm:px-2 py-0.5 text-left text-gray-700 font-medium" />
								<th className="px-1 sm:px-2 py-0.5 text-center text-gray-700 font-medium">
									ダメージ
								</th>
								<th className="px-1 sm:px-2 py-0.5 text-center text-gray-700 font-medium">
									安定率
								</th>
								<th className="px-1 sm:px-2 py-0.5 text-center text-gray-700 font-medium">
									ダメージ
								</th>
								<th className="px-1 sm:px-2 py-0.5 text-center text-gray-700 font-medium">
									安定率
								</th>
							</tr>
						</thead>
						<tbody>
							<tr className="border-b border-gray-100">
								<td className="px-1 sm:pl-4 sm:pr-2 pb-0.5 pt-1 font-medium text-gray-700">
									最小
								</td>
								<td className="pl-1 pr-2 sm:px-4 pb-0.5 pt-1 text-right font-semibold text-gray-700 font-roboto">
									{damageResults.normal.min.toLocaleString()}
								</td>
								<td className="px-1 sm:px-4 pb-0.5 pt-1 text-center text-gray-700 font-roboto">
									{damageResults.normal.stability}%
								</td>
								<td className="pl-1 pr-2 sm:px-4 pb-0.5 pt-1 text-right font-semibold text-gray-700 font-roboto">
									{captureData
										? captureData.damageResult.minimum.damage.toLocaleString()
										: 'データなし'}
								</td>
								<td className="px-1 sm:px-4 pb-0.5 pt-1 text-center text-gray-700 font-roboto">
									{captureData
										? `${captureData.damageResult.minimum.stability}%`
										: '-'}
								</td>
							</tr>
							<tr className="border-b border-gray-100">
								<td className="px-1 sm:px-4 py-0.5 font-medium text-gray-700">
									最大
								</td>
								<td className="pl-1 pr-2 sm:px-4 py-0.5 text-right font-semibold text-gray-700 font-roboto">
									{damageResults.normal.max.toLocaleString()}
								</td>
								<td className="px-1 sm:px-4 py-0.5 text-center text-gray-600 font-roboto">
									100%
								</td>
								<td className="pl-1 pr-2 sm:px-4 py-0.5 text-right font-semibold text-gray-700 font-roboto">
									{captureData
										? captureData.damageResult.maximum.damage.toLocaleString()
										: 'データなし'}
								</td>
								<td className="px-1 sm:px-4 py-0.5 text-center text-gray-600 font-roboto">
									{captureData
										? `${captureData.damageResult.maximum.stability}%`
										: '-'}
								</td>
							</tr>
							<tr>
								<td className="px-1 sm:px-4 py-0.5 font-medium text-gray-700">
									平均
								</td>
								<td className="pl-1 pr-2 sm:px-4 py-0.5 text-right font-bold text-gray-700 font-roboto">
									{damageResults.normal.average.toLocaleString()}
								</td>
								<td className="px-1 sm:px-4 py-0.5 text-center text-gray-600 font-roboto">
									{damageResults.normal.averageStability}%
								</td>
								<td className="pl-1 pr-2 sm:px-4 py-0.5 text-right font-bold text-gray-700 font-roboto">
									{captureData
										? captureData.damageResult.average.damage.toLocaleString()
										: 'データなし'}
								</td>
								<td className="px-1 sm:px-4 py-0.5 text-center text-gray-600 font-roboto">
									{captureData
										? `${captureData.damageResult.average.stability}%`
										: '-'}
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				{/* 慣れ倍率スライダー（後で実装予定の枠） */}
				<div className="p-1 sm:p-2 flex items-center">
					<div className="text-xs sm:text-[13px] font-medium text-gray-700">
						慣れ倍率（後で実装）
					</div>
					<div className="h-8 bg-gray-100 rounded flex items-center justify-center">
						<span className="text-xs text-gray-500">スライダー実装予定</span>
					</div>
				</div>

				{/* 敵情報 */}
				<div className="p-1 sm:p-2 flex items-center gap-2">
					<p className="text-sm font-medium text-gray-700">
						敵：{getSelectedEnemyName()}
					</p>
				</div>

				{/* 威力オプション */}
				<div className=" sm:p-2">
					<ul className="flex gap-2 bg-blue-100 p-1 mb-1">
						<li className="text-[10px] sm:text-xs font-semibold text-gray-900 flex-1 text-center">
							威力オプション
						</li>
						<li className="text-[10px] sm:text-xs font-semibold text-gray-900 flex-1 text-center">
							その他
						</li>
					</ul>

					<div className="space-y-1">
						{/* ボス戦難易度 */}
						<div className="flex items-center sm:gap-4 border-b-2 border-blue-200">
							<label className="text-xs md:text-[13px] font-semibold text-gray-700 w-24">
								ボス戦難易度
							</label>
							<div className="flex sm:gap-2">
								{(['normal', 'hard', 'lunatic', 'ultimate'] as const).map(
									(difficulty) => (
										<button
											key={difficulty}
											onClick={() =>
												handlePowerOptionChange('bossDifficulty', difficulty)
											}
											className={`px-3 py-0.5 sm:py-1 text-xs md:text-[13px] rounded min-h-6 cursor-pointer ${
												powerOptions.bossDifficulty === difficulty
													? 'bg-blue-400 text-white'
													: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
											}`}
										>
											{difficulty === 'normal'
												? 'Normal'
												: difficulty === 'hard'
													? 'Hard'
													: difficulty === 'lunatic'
														? 'Lunatic'
														: 'Ultimate'}
										</button>
									),
								)}
							</div>
						</div>

						{/* スキルダメージ */}
						<div className="flex items-center sm:gap-4 border-b-2 border-blue-200">
							<label className="text-xs md:text-[13px] font-semibold text-gray-700 w-24">
								スキルダメージ
							</label>
							<div className="flex sm:gap-2">
								{(['all', 'hit1', 'hit2', 'hit3'] as const).map((hit) => (
									<button
										key={hit}
										onClick={() => handlePowerOptionChange('skillDamage', hit)}
										className={`px-3 py-1 text-xs md:text-[13px] rounded min-h-6 cursor-pointer ${
											powerOptions.skillDamage === hit
												? 'bg-blue-400 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										}`}
									>
										{hit === 'all'
											? '全て'
											: hit === 'hit1'
												? '1撃目'
												: hit === 'hit2'
													? '2撃目'
													: '3撃目'}
									</button>
								))}
							</div>
						</div>

						{/* 属性攻撃 */}
						<div className="flex items-center sm:gap-4 border-b-2 border-blue-200">
							<label className="text-xs md:text-[13px] font-semibold text-gray-700 w-24">
								属性攻撃
							</label>
							<div className="flex sm:gap-2">
								{(
									['advantageous', 'other', 'none', 'disadvantageous'] as const
								).map((element) => (
									<button
										key={element}
										onClick={() =>
											handlePowerOptionChange('elementAttack', element)
										}
										className={`px-3 py-1 text-xs md:text-[13px] rounded cursor-pointer ${
											powerOptions.elementAttack === element
												? 'bg-pink-400 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										}`}
									>
										{element === 'advantageous'
											? '有(有利)'
											: element === 'other'
												? '有(その他)'
												: element === 'none'
													? '無'
													: '不利属性'}
									</button>
								))}
							</div>
						</div>

						{/* コンボ:強打 */}
						<div className="flex items-center sm:gap-4 border-b-2 border-blue-200">
							<label className="text-xs md:text-[13px] font-semibold text-gray-700 w-24">
								コンボ:強打
							</label>
							<div className="flex sm:gap-2">
								{[
									{ value: true, label: '有効' },
									{ value: false, label: '無効' },
								].map((option) => (
									<button
										key={option.label}
										onClick={() =>
											handlePowerOptionChange('combo', option.value)
										}
										className={`px-3 py-1 text-xs md:text-[13px] rounded cursor-pointer ${
											powerOptions.combo === option.value
												? 'bg-rose-400 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										}`}
									>
										{option.label}
									</button>
								))}
							</div>
						</div>

						{/* ダメージ判定 */}
						<div className="flex items-center sm:gap-4 border-b-2 border-blue-200">
							<label className="text-xs md:text-[13px] font-semibold text-gray-700 w-24">
								ダメージ判定
							</label>
							<div className="flex sm:gap-2">
								{(['critical', 'graze', 'white', 'expected'] as const).map(
									(type) => (
										<button
											key={type}
											onClick={() =>
												handlePowerOptionChange('damageType', type)
											}
											className={`px-3 py-1 text-xs md:text-[13px] rounded cursor-pointer ${
												powerOptions.damageType === type
													? 'bg-amber-400 text-white'
													: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
											}`}
										>
											{type === 'white'
												? '白ダメ'
												: type === 'critical'
													? 'Critical'
													: type === 'graze'
														? 'Graze'
														: '期待値'}
										</button>
									),
								)}
							</div>
						</div>

						{/* 距離判定 */}
						<div className="flex items-center sm:gap-4 border-b-2 border-blue-200">
							<label className="text-xs md:text-[13px] font-semibold text-gray-700 w-24">
								距離判定
							</label>
							<div className="flex sm:gap-2">
								{(['short', 'long', 'disabled'] as const).map((distance) => (
									<button
										key={distance}
										onClick={() =>
											handlePowerOptionChange('distance', distance)
										}
										className={`px-3 py-1 text-xs md:text-[13px] rounded cursor-pointer ${
											powerOptions.distance === distance
												? 'bg-rose-400 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										}`}
									>
										{distance === 'short'
											? '近距離'
											: distance === 'long'
												? '遠距離'
												: '無効化'}
									</button>
								))}
							</div>
						</div>

						{/* 属性威力 */}
						<div className="flex items-center sm:gap-4 border-b-2 border-blue-200">
							<label className="text-xs md:text-[13px] font-semibold text-gray-700 w-24">
								属性威力
							</label>
							<div className="flex sm:gap-2">
								{(
									[
										'enabled',
										'advantageOnly',
										'awakeningOnly',
										'disabled',
									] as const
								).map((power) => (
									<button
										key={power}
										onClick={() =>
											handlePowerOptionChange('elementPower', power)
										}
										className={`px-3 py-1 text-xs md:text-[13px] rounded cursor-pointer ${
											powerOptions.elementPower === power
												? 'bg-rose-400 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										}`}
									>
										{power === 'enabled'
											? '有効'
											: power === 'advantageOnly'
												? '有利のみ'
												: power === 'awakeningOnly'
													? '覚醒のみ'
													: '無効'}
									</button>
								))}
							</div>
						</div>

						{/* 抜刀威力 */}
						<div className="flex items-center sm:gap-4 border-b-2 border-blue-200">
							<label className="text-xs md:text-[13px] font-semibold text-gray-700 w-24">
								抜刀威力
							</label>
							<div className="flex sm:gap-2">
								{[
									{ value: true, label: '有効' },
									{ value: false, label: '無効' },
								].map((option) => (
									<button
										key={option.label}
										onClick={() =>
											handlePowerOptionChange('unsheathe', option.value)
										}
										className={`px-3 py-1 text-xs md:text-[13px] rounded cursor-pointer ${
											powerOptions.unsheathe === option.value
												? 'bg-rose-400 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										}`}
									>
										{option.label}
									</button>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
