/**
 * DamagePreview.tsxの計算ロジックを共通化したサービス
 * 差分計算でも同じ計算エンジンを使用できるようにする
 */

import {
	calculateDamage,
	createDefaultDamageInput,
	type DamageCalculationInput,
} from '@/utils/damageCalculation'
import { getAttackSkillById } from '@/data/attackSkills'
import { attackSkillCalculation } from '@/utils/attackSkillCalculation'
import { getPresetEnemyById } from '@/utils/enemyDatabase'
import { calculateBossDifficultyStats } from '@/utils/bossDifficultyCalculation'
import type { CalculatorData, PowerOptions } from '@/types/calculator'
import { createInitialPowerOptions } from '@/utils/initialData'

// ダメージ表示結果の型定義
export interface DamageDisplayResult {
	min: number
	max: number
	average: number
	stability: number
	averageStability: number
}

// ダメージ計算結果の型定義
export interface DamageCalculationServiceResult {
	normal: DamageDisplayResult
	skill: DamageDisplayResult
}

// 計算オプション
export interface DamageCalculationOptions {
	debug?: boolean
	powerOptions?: PowerOptions
}

/**
 * DamagePreviewと同じ方法でダメージを計算する
 */
export function calculateDamageWithService(
	calculatorData: CalculatorData,
	calculationResults: any,
	options: DamageCalculationOptions = {}
): DamageCalculationServiceResult {
	const { debug = false, powerOptions = createInitialPowerOptions() } = options

	try {
		// 基本的な計算入力データを作成
		const defaultInput = createDefaultDamageInput()

		// 中央集約された計算結果を使用
		const totalATK = calculationResults?.basicStats.totalATK || 0
		const stabilityRate = calculationResults?.basicStats.stabilityRate || 85
		
		if (debug) {
			console.log('=== DamageCalculationService 中央集約計算結果 ===')
			console.log('calculationResults?.basicStats.totalATK:', totalATK)
			console.log('calculationResults?.basicStats.stabilityRate:', stabilityRate)
		}

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

		// PowerOptionsに基づく距離設定
		const getDistanceValues = () => {
			return {
				shortRange: calculationResults?.equipmentBonus1?.shortRangeDamage ?? 0,
				longRange: calculationResults?.equipmentBonus1?.longRangeDamage ?? 0,
			}
		}

		// Zustandストアのデータで入力を更新
		const distanceValues = getDistanceValues()

		// 敵情報を明示的に作成（ボス難易度適用）
		let finalEnemyDEF = enemyInfo?.stats.DEF ?? defaultInput.enemy.DEF
		let finalEnemyMDEF = enemyInfo?.stats.MDEF ?? defaultInput.enemy.MDEF
		let finalEnemyLevel = enemyInfo?.level ?? defaultInput.enemy.level

		// ボス系敵かつ難易度がnormal以外の場合、難易度調整を適用
		if (enemyInfo?.category === 'boss' && powerOptions.bossDifficulty !== 'normal') {
			const adjustedStats = calculateBossDifficultyStats(
				finalEnemyLevel,
				enemyInfo.stats,
				powerOptions.bossDifficulty,
			)
			finalEnemyLevel = adjustedStats.level
			finalEnemyDEF = adjustedStats.stats.DEF
			finalEnemyMDEF = adjustedStats.stats.MDEF
		}

		const input: DamageCalculationInput = {
			...defaultInput,
			playerLevel: calculatorData.baseStats.level,
			referenceStat: totalATK, // 計算済みの総ATKを使用
			// 敵情報を実際のデータに基づいて設定
			enemyLevel: finalEnemyLevel,
			stability: {
				rate: stabilityRate, // 計算済みの安定率を使用
			},
			// PowerOptionsに基づいた設定
			elementAdvantage: {
				total: getElementAdvantageTotal(),
				awakening: 0, // 総属性有利で統合計算されるため0
				isActive:
					powerOptions.elementAttack !== 'none' &&
					powerOptions.elementPower !== 'disabled',
			},
			distance: distanceValues,
			unsheathe: {
				fixedDamage: calculationResults?.equipmentBonus1?.unsheatheAttack ?? defaultInput.unsheathe.fixedDamage,
				rateBonus: calculationResults?.equipmentBonus1?.elementPower ?? 0, // 抜刀威力%は一旦elementPowerで代用
				isActive: powerOptions.unsheathe,
			},
			userSettings: {
				familiarity: 100, // 仮の慣れ値（100%）
				currentDistance: powerOptions.distance,
				damageType: powerOptions.damageType,
			},
			// クリティカルダメージ設定
			critical: {
				damage: calculationResults?.basicStats.criticalDamage ?? 100,
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
				physical: calculationResults?.equipmentBonus1?.physicalPenetration ?? defaultInput.penetration.physical,
				magical: calculationResults?.equipmentBonus1?.magicalPenetration ?? defaultInput.penetration.magical,
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

		if (debug) {
			console.log('=== DamageCalculationService Input ===')
			console.log('playerLevel:', input.playerLevel)
			console.log('referenceStat (totalATK):', input.referenceStat)
			console.log('stabilityRate:', input.stability.rate)
			console.log('enemy.DEF:', input.enemy.DEF)
			console.log('enemy.MDEF:', input.enemy.MDEF)
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
					calculationSteps: {} as any,
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
			const baseStabilityRate = calculationResults?.basicStats.stabilityRate || 85

			// 各撃の最小ダメージを個別に計算して合計
			// 各撃: 最大ダメージ × 最小安定率（小数点切り捨て）
			const totalMinDamage = attackResults.reduce((sum, hit) => {
				const hitMaxDamage = hit.result.baseDamage
				const hitMinDamage = Math.floor((hitMaxDamage * baseStabilityRate) / 100)
				return sum + hitMinDamage
			}, 0)

			// 各撃の平均ダメージを個別に計算して合計
			// 平均安定率 = (最大安定率 + 最小安定率) / 2（小数点切り捨て）
			// 各撃: 最大ダメージ × 平均安定率（小数点切り捨て）
			const totalAverageDamage = attackResults.reduce((sum, hit) => {
				const hitMaxDamage = hit.result.baseDamage
				const hitMaxStabilityRate = 100
				const hitAverageStabilityRate = Math.floor((hitMaxStabilityRate + baseStabilityRate) / 2)
				const hitAverageDamage = Math.floor((hitMaxDamage * hitAverageStabilityRate) / 100)
				return sum + hitAverageDamage
			}, 0)

			// Note: 平均安定率は表示時に個別計算

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

		if (debug) {
			console.log('=== DamageCalculationService RESULTS ===')
			console.log('baseDamage:', attackResult.baseDamage)
			console.log('stabilityResult:', attackResult.stabilityResult)
		}

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

		if (debug) {
			console.log('=== DamageCalculationService FINAL DISPLAY VALUES ===')
			console.log('damageType:', powerOptions.damageType)
			console.log('表示される最小ダメージ:', damageDisplay.min)
			console.log('表示される最大ダメージ:', damageDisplay.max)
			console.log('表示される平均ダメージ:', damageDisplay.average)
			console.log('表示される安定率:', damageDisplay.stability)
		}

		return {
			normal: damageDisplay,
			skill: damageDisplay, // スキル攻撃も同じ判定を適用
		}
	} catch (error) {
		console.error('DamageCalculationService エラー:', error)
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
}