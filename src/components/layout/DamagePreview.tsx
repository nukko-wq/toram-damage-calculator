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
			
			// デバッグ: 中央集約された値を確認
			console.log('=== DamagePreview 中央集約計算結果 ===')
			console.log('calculationResults?.basicStats.totalATK:', totalATK)
			console.log('calculationResults?.basicStats.stabilityRate:', stabilityRate)
			console.log('calculationResults?.equipmentBonus1.physicalPenetration:', calculationResults?.equipmentBonus1.physicalPenetration)
			console.log('calculationResults?.equipmentBonus1.magicalPenetration:', calculationResults?.equipmentBonus1.magicalPenetration)

			// 敵情報を取得
			let enemyInfo = null
			if (calculatorData.enemy?.selectedEnemyId) {
				enemyInfo = getPresetEnemyById(calculatorData.enemy.selectedEnemyId)
			}

			// デバッグ用ログ - 実際の値を確認
			console.log('=== DamagePreview Debug ===')
			console.log(
				'calculatorData.baseStats.level:',
				calculatorData.baseStats.level,
			)
			console.log('totalATK:', totalATK)
			console.log('stabilityRate:', stabilityRate)
			console.log(
				'calculationResults?.basicStats:',
				calculationResults?.basicStats,
			)
			console.log('calculatorData.enemy:', calculatorData.enemy)
			console.log(
				'calculatorData.enemy.selectedEnemyId:',
				calculatorData.enemy?.selectedEnemyId,
			)
			console.log('enemyInfo:', enemyInfo)
			if (enemyInfo) {
				console.log('enemyInfo.stats:', enemyInfo.stats)
				console.log('enemyInfo.stats.DEF:', enemyInfo.stats.DEF)
				console.log('enemyInfo.stats.MDEF:', enemyInfo.stats.MDEF)
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
					shortRange: calculationResults?.equipmentBonus1?.shortRangeDamage || 0,
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
					awakening: getElementAdvantageAwakening(),
					isActive:
						powerOptions.elementAttack !== 'none' &&
						powerOptions.elementPower !== 'disabled',
				},
				distance: distanceValues,
				unsheathe: {
					fixedDamage: calculationResults?.equipmentBonus1?.unsheatheAttack || defaultInput.unsheathe.fixedDamage,
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
					physical: calculationResults?.equipmentBonus1?.physicalPenetration || defaultInput.penetration.physical,
					magical: calculationResults?.equipmentBonus1?.magicalPenetration || defaultInput.penetration.magical,
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

			// ===== 詳細ダメージ計算確認ログ =====
			console.log('================================')
			console.log('=== DAMAGE CALCULATION DEBUG ===')
			console.log('================================')

			// 1. レベル
			console.log('1. レベル情報:')
			console.log('  自Lv (playerLevel):', input.playerLevel)
			console.log('  敵Lv (enemyLevel):', input.enemyLevel)

			// 2. 参照ステータス
			console.log('2. 参照ステータス:')
			console.log('  総ATK (referenceStat):', input.referenceStat)
			console.log('  参照タイプ:', input.referenceStatType)

			// 3. ダメージタイプとクリティカル設定
			console.log('3. ダメージタイプ設定:')
			console.log('  ダメージタイプ:', powerOptions.damageType)
			console.log(
				'  input.userSettings.damageType:',
				input.userSettings.damageType,
			)
			console.log(
				'  クリティカルダメージ input.critical.damage:',
				input.critical.damage,
			)
			console.log(
				'  元データ calculationResults?.basicStats.criticalDamage:',
				calculationResults?.basicStats.criticalDamage,
			)
			console.log(
				'  クリティカル判定:',
				input.userSettings.damageType === 'critical'
					? 'クリティカル計算を実行'
					: '通常計算を実行',
			)

			// 3. 敵の耐性
			console.log('3. 敵の耐性:')
			console.log('  物理耐性 (%):', input.resistance.physical)
			console.log('  魔法耐性 (%):', input.resistance.magical)
			console.log('  武器耐性 (%):', input.resistance.weapon)
			console.log(
				'  DEBUG: enemyInfo?.stats.physicalResistance:',
				enemyInfo?.stats.physicalResistance,
			)
			console.log(
				'  DEBUG: enemyInfo?.stats.magicalResistance:',
				enemyInfo?.stats.magicalResistance,
			)
			console.log('  DEBUG: defaultInput.resistance:', defaultInput.resistance)

			// 4. 敵のDEF/MDEF
			console.log('4. 敵の防御力:')
			console.log('  敵DEF:', input.enemy.DEF)
			console.log('  敵MDEF:', input.enemy.MDEF)

			// 5. 貫通値
			console.log('5. 貫通値:')
			console.log('  物理貫通:', input.penetration.physical)
			console.log('  魔法貫通:', input.penetration.magical)

			// 6. 固定値
			console.log('6. 固定値:')
			console.log('  抜刀固定値:', input.unsheathe.fixedDamage)
			console.log('  スキル固定値:', input.attackSkill.fixedDamage)
			console.log('  抜刀有効:', input.unsheathe.isActive)

			// 7. 属性有利
			console.log('7. 属性有利:')
			console.log('  総属性有利 (%):', input.elementAdvantage.total)
			console.log('  属性覚醒有利 (%):', input.elementAdvantage.awakening)
			console.log('  属性攻撃有効:', input.elementAdvantage.isActive)
			console.log(
				'  DEBUG: calculationResults?.basicStats?.totalElementAdvantage:',
				calculationResults?.basicStats?.totalElementAdvantage,
			)
			console.log(
				'  DEBUG: calculationResults?.basicStats?.elementAwakeningAdvantage:',
				calculationResults?.basicStats?.elementAwakeningAdvantage,
			)

			// 8. スキル倍率
			console.log('8. スキル倍率:')
			console.log('  スキル倍率 (%):', input.attackSkill.multiplier)
			console.log('  攻撃タイプ:', input.attackSkill.type)

			// 9. 距離威力
			console.log('9. 距離威力:')
			console.log('  近距離威力 (%):', input.distance.shortRange)
			console.log('  遠距離威力 (%):', input.distance.longRange)
			console.log('  現在の距離判定:', input.userSettings.currentDistance)

			// 10. その他重要な値
			console.log('10. その他:')
			console.log('  安定率 (%):', input.stability.rate)
			console.log('  抜刀% (%):', input.unsheathe.rateBonus)
			console.log('  慣れ (%):', input.userSettings.familiarity)

			console.log('================================')

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
				const totalBaseDamage = attackResults.reduce(
					(sum, hit) => sum + hit.result.baseDamage,
					0,
				)

				// 安定率は最初の撃の値を使用（全撃で同じ安定率のため）
				const stabilityRate =
					attackResults[0].result.stabilityResult.stabilityRate

				return {
					baseDamage: totalBaseDamage,
					stabilityResult: {
						minDamage: Math.floor((totalBaseDamage * stabilityRate) / 100),
						maxDamage: totalBaseDamage,
						averageDamage: Math.floor(
							(totalBaseDamage * (stabilityRate + 100)) / 2 / 100,
						),
						stabilityRate: stabilityRate,
					},
					calculationSteps: attackResults[0].result.calculationSteps, // 最初の撃の計算過程を参考表示
				}
			})()

			const attackResult = totalAttackResult

			// 計算結果の詳細ログ
			console.log('=== CALCULATION RESULTS ===')
			console.log('damageType:', powerOptions.damageType)
			console.log('最終ダメージ:', attackResult.baseDamage)
			console.log('最小ダメージ:', attackResult.stabilityResult.minDamage)
			console.log('最大ダメージ:', attackResult.stabilityResult.maxDamage)
			console.log('平均ダメージ:', attackResult.stabilityResult.averageDamage)
			console.log('')
			console.log('=== CALCULATION STEPS ===')

			// クリティカル計算が実行されたかチェック（ステップ2a）
			if (attackResult.calculationSteps.step2a_critical) {
				const step2a = attackResult.calculationSteps.step2a_critical
				console.log('ステップ2a クリティカルダメージ:')
				console.log('  固定値適用後:', step2a.beforeCritical)
				console.log('  クリティカル倍率:', step2a.criticalRate + '%')
				console.log('  クリティカル適用後:', step2a.result)
			}

			// ブレイブ倍率ステップ
			if (attackResult.calculationSteps.step10_brave) {
				const step10 = attackResult.calculationSteps.step10_brave
				console.log('ステップ10 ブレイブ倍率:')
				console.log('  適用前:', step10.beforeBrave)
				console.log('  ブレイブ倍率:', step10.braveRate + '%')
				console.log('  適用後:', step10.result)
			}

			if (attackResult.calculationSteps.step1_baseDamage) {
				const step1 = attackResult.calculationSteps.step1_baseDamage
				console.log('ステップ1 基礎ダメージ:')
				console.log(
					'  計算前:',
					step1.beforeResistance,
					'= (自Lv',
					step1.playerLevel,
					'+ 参照ステータス',
					step1.referenceStat,
					'- 敵Lv',
					step1.enemyLevel,
					')',
				)
				console.log('  物理耐性率:', step1.physicalResistanceRate, '%')
				console.log('  魔法耐性率:', step1.magicalResistanceRate, '%')
				console.log('  武器耐性率:', step1.weaponResistanceRate, '%')
				console.log(
					'  耐性倍率計算:',
					`(1 - ${step1.physicalResistanceRate || step1.magicalResistanceRate}/100) = ${1 - (step1.physicalResistanceRate || step1.magicalResistanceRate) / 100}`,
				)
				console.log(
					'  耐性適用計算:',
					`${step1.beforeResistance} × ${1 - (step1.physicalResistanceRate || step1.magicalResistanceRate) / 100} = ${step1.beforeResistance * (1 - (step1.physicalResistanceRate || step1.magicalResistanceRate) / 100)}`,
				)
				console.log('  耐性適用後:', step1.afterResistance)
				console.log('  敵防御力:', step1.enemyDEF)
				console.log(
					'  DEBUG: 元の敵DEF/MDEF:',
					input.attackSkill.type === 'physical'
						? input.enemy.DEF
						: input.enemy.MDEF,
				)
				console.log(
					'  DEBUG: 適用された貫通率(%):',
					input.attackSkill.type === 'physical'
						? input.penetration.physical
						: input.penetration.magical,
				)
				const originalDef =
					input.attackSkill.type === 'physical'
						? input.enemy.DEF
						: input.enemy.MDEF
				const penetrationRate =
					input.attackSkill.type === 'physical'
						? input.penetration.physical
						: input.penetration.magical
				const penetrationMultiplier = 1 - penetrationRate / 100
				console.log(
					'  DEBUG: 貫通適用計算:',
					`${originalDef} × (1 - ${penetrationRate}/100) = ${originalDef} × ${penetrationMultiplier} = ${originalDef * penetrationMultiplier} → Math.floor = ${Math.floor(originalDef * penetrationMultiplier)}`,
				)
				console.log('  Math.floor前:', step1.afterResistance - step1.enemyDEF)
				console.log('  結果:', step1.result)
			}
			if (attackResult.calculationSteps.step2_fixedValues) {
				const step2 = attackResult.calculationSteps.step2_fixedValues
				console.log('ステップ2 固定値加算:')
				console.log('  基礎ダメージ:', step2.baseDamage)
				console.log('  抜刀固定値:', step2.unsheatheFixed)
				console.log('  スキル固定値:', step2.skillFixed)
				console.log('  結果:', step2.result)
			}
			if (attackResult.calculationSteps.step3_elementAdvantage) {
				const step3 = attackResult.calculationSteps.step3_elementAdvantage
				console.log('ステップ3 属性有利:')
				console.log('  適用前:', step3.beforeAdvantage)
				console.log('  属性有利率:', step3.advantageRate, '%')
				console.log(
					'  計算式:',
					`${step3.beforeAdvantage} × (1 + ${step3.advantageRate}/100) = ${step3.beforeAdvantage} × ${1 + step3.advantageRate / 100} = ${step3.beforeAdvantage * (1 + step3.advantageRate / 100)}`,
				)
				console.log(
					'  Math.floor前:',
					step3.beforeAdvantage * (1 + step3.advantageRate / 100),
				)
				console.log('  結果:', step3.result)
			}
			if (attackResult.calculationSteps.step4_skillMultiplier) {
				const step4 = attackResult.calculationSteps.step4_skillMultiplier
				console.log('ステップ4 スキル倍率:')
				console.log('  適用前:', step4.beforeSkill)
				console.log('  スキル倍率:', step4.skillRate, '%')
				console.log(
					'  計算式:',
					`${step4.beforeSkill} × ${step4.skillRate}/100 = ${(step4.beforeSkill * step4.skillRate) / 100}`,
				)
				console.log(
					'  Math.floor前:',
					(step4.beforeSkill * step4.skillRate) / 100,
				)
				console.log('  結果:', step4.result)
			}
			console.log('================================')

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

						console.log('=== CRITICAL DISPLAY DEBUG ===')
						console.log('baseDamage (クリティカル計算済み):', baseDamage)
						console.log('stabilityRate:', stabilityRate)
						console.log(
							'計算される最小ダメージ:',
							Math.floor((baseDamage * stabilityRate) / 100),
						)
						console.log('計算される最大ダメージ:', baseDamage)
						console.log(
							'計算される平均ダメージ:',
							Math.floor((baseDamage * averageStabilityRate) / 100),
						)

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
						// 期待値
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

			// 最終表示値とコンソールログとの対応確認
			console.log('=== FINAL DISPLAY VALUES ===')
			console.log('damageType:', powerOptions.damageType)
			console.log('表示される最小ダメージ:', damageDisplay.min)
			console.log('表示される最大ダメージ:', damageDisplay.max)
			console.log('表示される平均ダメージ:', damageDisplay.average)
			console.log('表示される安定率:', damageDisplay.stability)
			console.log('表示される平均安定率:', damageDisplay.averageStability)
			console.log('コンソールログの最終ダメージ:', attackResult.baseDamage)
			console.log(
				'コンソールログの最小ダメージ:',
				attackResult.stabilityResult.minDamage,
			)
			console.log(
				'コンソールログの最大ダメージ:',
				attackResult.stabilityResult.maxDamage,
			)
			console.log(
				'コンソールログの平均ダメージ:',
				attackResult.stabilityResult.averageDamage,
			)
			console.log('============================')

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

			console.log('ダメージをキャプチャしました:', newCaptureData)
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
