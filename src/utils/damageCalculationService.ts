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
import {
	getBuffSkillPassiveMultiplier,
	getBuffSkillPassiveMultiplierWithSkillCategory,
	getBuffSkillBraveMultiplier,
} from '@/utils/buffSkillCalculation'
import { calculateMagicalStability } from '@/utils/basicStatsCalculation'
import type { CalculatorData, PowerOptions } from '@/types/calculator'
import type { BuffSkillState } from '@/types/buffSkill'
import { createInitialPowerOptions } from '@/utils/initialData'

// ダメージ表示結果の型定義
export interface DamageDisplayResult {
	min: number
	max: number
	average: number
	stability: number
	averageStability: number
	maxStability?: number // 魔法スキル用の最大安定率
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
 * エターナルナイトメアのレベルを取得
 */
function getEternalNightmareLevel(skill: BuffSkillState | undefined): number {
	if (!skill?.isEnabled) return 0
	
	// multiParam型の場合はmultiParam1、level型の場合はlevel、specialParamの場合はspecialParamを使用
	return skill.multiParam1 || skill.level || skill.specialParam || 0
}

/**
 * ダークパワースキルの合計レベルを計算
 * エターナルナイトメアの場合、multiParam2がダークパワー全習得スキルポイント
 */
function calculateTotalDarkPowerLevel(buffSkills: Record<string, BuffSkillState>): number {
	const eternalNightmare = buffSkills.dp1
	if (eternalNightmare?.isEnabled) {
		// multiParam2がダークパワー全習得スキルポイント（25-80）
		return eternalNightmare.multiParam2 || eternalNightmare.specialParam || 80 // デフォルト80
	}
	
	return 80 // デフォルト値
}

/**
 * 魔法攻撃スキルかどうかを判定
 */
function isMagicalAttackSkill(skillId: string | null): boolean {
	if (!skillId) return false
	
	const skill = getAttackSkillById(skillId)
	if (!skill) return false
	
	// 全ての撃が魔法攻撃の場合、魔法スキルと判定
	return skill.hits.every(hit => hit.attackType === 'magical')
}

/**
 * DamagePreviewと同じ方法でダメージを計算する
 */
export function calculateDamageWithService(
	calculatorData: CalculatorData,
	calculationResults: any,
	options: DamageCalculationOptions = {},
): DamageCalculationServiceResult {
	const { debug = false, powerOptions = createInitialPowerOptions() } = options

	// デバッグログを一時的に無効化
	const debugEnabled = false

	try {
		// 基本的な計算入力データを作成
		const defaultInput = createDefaultDamageInput()

		// 中央集約された計算結果を使用
		const totalATK = calculationResults?.basicStats.totalATK || 0
		const physicalStabilityRate = calculationResults?.basicStats.stabilityRate || 85
		
		// 魔法スキル選択時は魔法安定率を計算
		const isMagicalSkill = isMagicalAttackSkill(calculatorData.attackSkill?.selectedSkillId)
		const stabilityInfo = isMagicalSkill 
			? calculateMagicalStability(physicalStabilityRate)
			: { averageStability: physicalStabilityRate, magicalStabilityLower: physicalStabilityRate, magicalStabilityUpper: 100 }
		
		const stabilityRate = isMagicalSkill ? stabilityInfo.averageStability : physicalStabilityRate
		
		// デバッグ情報
		if (debugEnabled && debug && process.env.NODE_ENV === 'development' && isMagicalSkill) {
			console.log('=== 魔法安定率計算 ===')
			console.log('物理安定率:', physicalStabilityRate)
			console.log('魔法安定率下限:', stabilityInfo.magicalStabilityLower)
			console.log('魔法安定率上限:', stabilityInfo.magicalStabilityUpper)
			console.log('魔法安定率平均:', stabilityInfo.averageStability)
		}

		// バフスキルからパッシブ倍率を取得
		// 通常攻撃時は攻撃スキルカテゴリがないため、従来の関数を使用
		const passiveMultiplier = getBuffSkillPassiveMultiplier(
			calculatorData.buffSkills?.skills || null,
			calculatorData.mainWeapon?.weaponType || null,
		)

		// バフスキルからブレイブ倍率を取得
		const braveMultiplier = getBuffSkillBraveMultiplier(
			calculatorData.buffSkills?.skills || null,
		)

		if (debugEnabled && debug && process.env.NODE_ENV === 'development') {
			console.log('=== DamageCalculationService 中央集約計算結果 ===')
			console.log('calculationResults?.basicStats.totalATK:', totalATK)
			console.log(
				'calculationResults?.basicStats.stabilityRate:',
				stabilityRate,
			)
			console.log('passiveMultiplier:', passiveMultiplier)
			console.log('braveMultiplier:', braveMultiplier)
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
		
		// Normal難易度のDEF/MDEFを保持（エターナルナイトメア減算用）
		const normalEnemyDEF = enemyInfo?.stats.DEF ?? defaultInput.enemy.DEF
		const normalEnemyMDEF = enemyInfo?.stats.MDEF ?? defaultInput.enemy.MDEF

		// エンハンススキルのブレイブ倍率を適用するため、敵情報を含めて再計算
		const braveMultiplierWithEnemy = getBuffSkillBraveMultiplier(
			calculatorData.buffSkills?.skills || null,
			normalEnemyDEF,
			normalEnemyMDEF,
			finalEnemyLevel,
		)

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

		const input: DamageCalculationInput = {
			...defaultInput,
			playerLevel: calculatorData.baseStats.level,
			referenceStat: totalATK, // 計算済みの総ATKを使用
			passiveMultiplier: passiveMultiplier, // バフスキルから取得したパッシブ倍率を適用
			braveMultiplier: braveMultiplierWithEnemy, // エンハンス含むブレイブ倍率を適用
			// 敵情報を実際のデータに基づいて設定
			enemyLevel: finalEnemyLevel,
			stability: {
				rate: stabilityRate, // 計算済みの安定率を使用
			},
			// バフスキル情報を追加
			buffSkills: {
				eternalNightmare: {
					isEnabled: calculatorData.buffSkills?.skills?.dp1?.isEnabled ?? false,
					level: getEternalNightmareLevel(calculatorData.buffSkills?.skills?.dp1),
				},
				totalDarkPowerLevel: calculateTotalDarkPowerLevel(calculatorData.buffSkills?.skills ?? {}),
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
				fixedDamage:
					calculationResults?.equipmentBonus1?.unsheatheAttack ??
					defaultInput.unsheathe.fixedDamage,
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
				// エターナルナイトメア減算用にNormal難易度のDEF/MDEFを設定
				normalDEF: normalEnemyDEF,
				normalMDEF: normalEnemyMDEF,
			},
			// 耐性設定も実際のデータに基づいて更新
			resistance: {
				...defaultInput.resistance,
				physical:
					enemyInfo?.stats.physicalResistance ??
					defaultInput.resistance.physical,
				magical:
					enemyInfo?.stats.magicalResistance ?? defaultInput.resistance.magical,
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

		if (debugEnabled && debug && process.env.NODE_ENV === 'development') {
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
						// スキルの場合はMATK、ATK、またはtotalATKを参照
						referenceStat:
							originalHit.powerReference === 'MATK'
								? calculationResults?.basicStats.MATK || 1500
								: originalHit.powerReference === 'ATK'
									? calculationResults?.basicStats.ATK || 0
									: totalATK,
						// スキルカテゴリを考慮したパッシブ倍率を適用
						passiveMultiplier: getBuffSkillPassiveMultiplierWithSkillCategory(
							calculatorData.buffSkills?.skills || null,
							calculatorData.mainWeapon?.weaponType || null,
							selectedSkill.category,
						),
						// ブレイブ倍率はスキル攻撃でも同じ値を使用（エンハンス含む）
						braveMultiplier: braveMultiplierWithEnemy,
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
			const baseStabilityRate = physicalStabilityRate

			// 魔法スキルの場合は魔法安定率、物理スキルの場合は従来の安定率を使用
			const effectiveMinStabilityRate = isMagicalSkill ? stabilityInfo.magicalStabilityLower : baseStabilityRate
			const effectiveMaxStabilityRate = isMagicalSkill ? stabilityInfo.magicalStabilityUpper : 100
			const effectiveAverageStabilityRate = isMagicalSkill ? stabilityInfo.averageStability : Math.floor((effectiveMaxStabilityRate + effectiveMinStabilityRate) / 2)

			// 各撃の最小ダメージを個別に計算して合計
			// 各撃: 最大ダメージ × 最小安定率（小数点切り捨て）
			const totalMinDamage = attackResults.reduce((sum, hit) => {
				const hitMaxDamage = hit.result.baseDamage
				const hitMinDamage = Math.floor(
					(hitMaxDamage * effectiveMinStabilityRate) / 100,
				)
				return sum + hitMinDamage
			}, 0)

			// 各撃の平均ダメージを個別に計算して合計
			// 平均安定率 = (最大安定率 + 最小安定率) / 2（小数点切り捨て）
			// 各撃: 最大ダメージ × 平均安定率（小数点切り捨て）
			const totalAverageDamage = attackResults.reduce((sum, hit) => {
				const hitMaxDamage = hit.result.baseDamage
				const hitAverageDamage = Math.floor(
					(hitMaxDamage * effectiveAverageStabilityRate) / 100,
				)
				return sum + hitAverageDamage
			}, 0)

			// Note: 平均安定率は表示時に個別計算

			return {
				baseDamage: totalMaxDamage,
				stabilityResult: {
					minDamage: totalMinDamage,
					maxDamage: totalMaxDamage,
					averageDamage: totalAverageDamage,
					stabilityRate: effectiveMinStabilityRate, // 最小の安定率を使用
				},
				calculationSteps: attackResults[0].result.calculationSteps, // 最初の撃の計算過程を参考表示
			}
		})()

		const attackResult = totalAttackResult

		if (debugEnabled && debug && process.env.NODE_ENV === 'development') {
			console.log('=== DamageCalculationService RESULTS ===')
			console.log('baseDamage:', attackResult.baseDamage)
			console.log('stabilityResult:', attackResult.stabilityResult)
		}

		// ダメージ判定タイプに応じて表示するダメージを決定
		const getDamageByType = () => {
			const baseDamage = attackResult.baseDamage // 白ダメ（基本ダメージ）
			const stabilityResult = attackResult.stabilityResult
			
			// 魔法スキルの場合は魔法安定率を使用、物理スキルの場合は従来の安定率を使用
			const minStabilityRate = isMagicalSkill ? stabilityInfo.magicalStabilityLower : stabilityResult.stabilityRate
			const maxStabilityRate = isMagicalSkill ? stabilityInfo.magicalStabilityUpper : 100
			const averageStabilityRate = isMagicalSkill ? stabilityInfo.averageStability : Math.floor((minStabilityRate + maxStabilityRate) / 2)

			switch (powerOptions.damageType) {
				case 'white': {
					// 白ダメ：基本ダメージに対して安定率を適用
					// 多撃の場合は既に計算済みの値を使用
					if (isMultiHit) {
						// 多撃時も魔法安定率を適用するため再計算
						if (isMagicalSkill) {
							const totalMinDamage = attackResults.reduce((sum, hit) => {
								const hitMaxDamage = hit.result.baseDamage
								const hitMinDamage = Math.floor((hitMaxDamage * minStabilityRate) / 100)
								return sum + hitMinDamage
							}, 0)
							
							const totalMaxDamage = attackResults.reduce((sum, hit) => {
								const hitMaxDamage = hit.result.baseDamage
								const hitMaxDamageAdjusted = Math.floor((hitMaxDamage * maxStabilityRate) / 100)
								return sum + hitMaxDamageAdjusted
							}, 0)
							
							const totalAverageDamage = attackResults.reduce((sum, hit) => {
								const hitMaxDamage = hit.result.baseDamage
								const hitAverageDamage = Math.floor((hitMaxDamage * averageStabilityRate) / 100)
								return sum + hitAverageDamage
							}, 0)
							
							return {
								min: totalMinDamage,
								max: totalMaxDamage,
								average: totalAverageDamage,
								stability: minStabilityRate,
								averageStability: averageStabilityRate,
								maxStability: maxStabilityRate,
							}
						}
						
						return {
							min: stabilityResult.minDamage, // 既に計算済み
							max: stabilityResult.maxDamage, // 既に計算済み
							average: stabilityResult.averageDamage, // 既に計算済み
							stability: minStabilityRate,
							averageStability: averageStabilityRate,
							maxStability: maxStabilityRate,
						}
					}

					return {
						min: Math.floor((baseDamage * minStabilityRate) / 100),
						max: Math.floor((baseDamage * maxStabilityRate) / 100),
						average: Math.floor((baseDamage * averageStabilityRate) / 100),
						stability: minStabilityRate,
						averageStability: averageStabilityRate,
						maxStability: maxStabilityRate,
					}
				}
				case 'critical': {
					// クリティカル：baseDamageがすでにクリティカル計算済み
					// 多撃の場合は既に計算済みの値を使用
					if (isMultiHit) {
						// 多撃時も魔法安定率を適用するため再計算
						if (isMagicalSkill) {
							const totalMinDamage = attackResults.reduce((sum, hit) => {
								const hitMaxDamage = hit.result.baseDamage
								const hitMinDamage = Math.floor((hitMaxDamage * minStabilityRate) / 100)
								return sum + hitMinDamage
							}, 0)
							
							const totalMaxDamage = attackResults.reduce((sum, hit) => {
								const hitMaxDamage = hit.result.baseDamage
								const hitMaxDamageAdjusted = Math.floor((hitMaxDamage * maxStabilityRate) / 100)
								return sum + hitMaxDamageAdjusted
							}, 0)
							
							const totalAverageDamage = attackResults.reduce((sum, hit) => {
								const hitMaxDamage = hit.result.baseDamage
								const hitAverageDamage = Math.floor((hitMaxDamage * averageStabilityRate) / 100)
								return sum + hitAverageDamage
							}, 0)
							
							return {
								min: totalMinDamage,
								max: totalMaxDamage,
								average: totalAverageDamage,
								stability: minStabilityRate,
								averageStability: averageStabilityRate,
								maxStability: maxStabilityRate,
							}
						}
						
						return {
							min: stabilityResult.minDamage, // 既に計算済み
							max: stabilityResult.maxDamage, // 既に計算済み
							average: stabilityResult.averageDamage, // 既に計算済み
							stability: minStabilityRate,
							averageStability: averageStabilityRate,
							maxStability: maxStabilityRate,
						}
					}

					return {
						min: Math.floor((baseDamage * minStabilityRate) / 100),
						max: Math.floor((baseDamage * maxStabilityRate) / 100),
						average: Math.floor((baseDamage * averageStabilityRate) / 100),
						stability: minStabilityRate,
						averageStability: averageStabilityRate,
						maxStability: maxStabilityRate,
					}
				}
				case 'graze': {
					// グレイズ：後で実装予定
					const grazeBaseDamage = Math.floor(baseDamage * 0.1)

					// 多撃の場合は既に計算済みの値を使用（グレイズ適用後）
					if (isMultiHit) {
						if (isMagicalSkill) {
							const totalMinDamage = attackResults.reduce((sum, hit) => {
								const hitMaxDamage = hit.result.baseDamage
								const hitGrazeMinDamage = Math.floor((hitMaxDamage * 0.1 * minStabilityRate) / 100)
								return sum + hitGrazeMinDamage
							}, 0)
							
							const totalMaxDamage = attackResults.reduce((sum, hit) => {
								const hitMaxDamage = hit.result.baseDamage
								const hitGrazeMaxDamage = Math.floor((hitMaxDamage * 0.1 * maxStabilityRate) / 100)
								return sum + hitGrazeMaxDamage
							}, 0)
							
							const totalAverageDamage = attackResults.reduce((sum, hit) => {
								const hitMaxDamage = hit.result.baseDamage
								const hitGrazeAverageDamage = Math.floor((hitMaxDamage * 0.1 * averageStabilityRate) / 100)
								return sum + hitGrazeAverageDamage
							}, 0)
							
							return {
								min: totalMinDamage,
								max: totalMaxDamage,
								average: totalAverageDamage,
								stability: minStabilityRate,
								averageStability: averageStabilityRate,
								maxStability: maxStabilityRate,
							}
						}
						
						return {
							min: Math.floor(stabilityResult.minDamage * 0.1),
							max: Math.floor(stabilityResult.maxDamage * 0.1),
							average: Math.floor(stabilityResult.averageDamage * 0.1),
							stability: minStabilityRate,
							averageStability: averageStabilityRate,
							maxStability: maxStabilityRate,
						}
					}

					return {
						min: Math.floor((grazeBaseDamage * minStabilityRate) / 100),
						max: Math.floor((grazeBaseDamage * maxStabilityRate) / 100),
						average: Math.floor((grazeBaseDamage * averageStabilityRate) / 100),
						stability: minStabilityRate,
						averageStability: averageStabilityRate,
					}
				}
				case 'expected': {
					// 期待値（多撃の場合は既に計算済みの値を使用）
					if (isMultiHit) {
						if (isMagicalSkill) {
							const totalAverageDamage = attackResults.reduce((sum, hit) => {
								const hitMaxDamage = hit.result.baseDamage
								const hitAverageDamage = Math.floor((hitMaxDamage * averageStabilityRate) / 100)
								return sum + hitAverageDamage
							}, 0)
							
							return {
								min: totalAverageDamage,
								max: totalAverageDamage,
								average: totalAverageDamage,
								stability: averageStabilityRate,
								averageStability: averageStabilityRate,
								maxStability: maxStabilityRate,
							}
						}
						
						return {
							min: stabilityResult.averageDamage,
							max: stabilityResult.averageDamage,
							average: stabilityResult.averageDamage,
							stability: averageStabilityRate,
							averageStability: averageStabilityRate,
							maxStability: maxStabilityRate,
						}
					}
					
					const expectedDamage = Math.floor((baseDamage * averageStabilityRate) / 100)
					return {
						min: expectedDamage,
						max: expectedDamage,
						average: expectedDamage,
						stability: averageStabilityRate,
						averageStability: averageStabilityRate,
						maxStability: maxStabilityRate,
					}
				}
				default: {
					// 通常ダメージ：最大=基本ダメージ、最小=基本ダメージ×安定率（小数点以下切り捨て）
					// 多撃の場合は既に計算済みの値を使用
					if (isMultiHit) {
						// 多撃時も魔法安定率を適用するため再計算
						if (isMagicalSkill) {
							const totalMinDamage = attackResults.reduce((sum, hit) => {
								const hitMaxDamage = hit.result.baseDamage
								const hitMinDamage = Math.floor((hitMaxDamage * minStabilityRate) / 100)
								return sum + hitMinDamage
							}, 0)
							
							const totalMaxDamage = attackResults.reduce((sum, hit) => {
								const hitMaxDamage = hit.result.baseDamage
								const hitMaxDamageAdjusted = Math.floor((hitMaxDamage * maxStabilityRate) / 100)
								return sum + hitMaxDamageAdjusted
							}, 0)
							
							const totalAverageDamage = attackResults.reduce((sum, hit) => {
								const hitMaxDamage = hit.result.baseDamage
								const hitAverageDamage = Math.floor((hitMaxDamage * averageStabilityRate) / 100)
								return sum + hitAverageDamage
							}, 0)
							
							return {
								min: totalMinDamage,
								max: totalMaxDamage,
								average: totalAverageDamage,
								stability: minStabilityRate,
								averageStability: averageStabilityRate,
								maxStability: maxStabilityRate,
							}
						}
						
						return {
							min: stabilityResult.minDamage, // 既に計算済み
							max: stabilityResult.maxDamage, // 既に計算済み
							average: stabilityResult.averageDamage, // 既に計算済み
							stability: minStabilityRate,
							averageStability: averageStabilityRate,
							maxStability: maxStabilityRate,
						}
					}

					return {
						min: Math.floor((baseDamage * minStabilityRate) / 100),
						max: Math.floor((baseDamage * maxStabilityRate) / 100),
						average: Math.floor((baseDamage * averageStabilityRate) / 100),
						stability: minStabilityRate,
						averageStability: averageStabilityRate,
						maxStability: maxStabilityRate,
					}
				}
			}
		}

		const damageDisplay = getDamageByType()

		if (debugEnabled && debug && process.env.NODE_ENV === 'development') {
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
