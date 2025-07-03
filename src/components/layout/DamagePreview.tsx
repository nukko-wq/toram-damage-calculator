'use client'

import { useState, useMemo, useEffect } from 'react'
import { useCalculatorStore } from '@/stores/calculatorStore'
import { 
	calculateDamage, 
	createDefaultDamageInput,
	type DamageCalculationInput 
} from '@/utils/damageCalculation'
import { getAttackSkillById } from '@/data/attackSkills'
import { attackSkillCalculation } from '@/utils/attackSkillCalculation'
import { getEnemyById } from '@/utils/enemyDatabase'
import { 
	getEquipmentBonuses,
	getCrystalBonuses,
	getFoodBonuses,
	getBuffBonuses,
} from '@/utils/dataSourceIntegration'
import { aggregateAllBonuses } from '@/utils/basicStatsCalculation'

interface DamagePreviewProps {
	isVisible: boolean
}

// 威力オプション設定の型定義
interface PowerOptions {
	bossDifficulty: 'normal' | 'hard' | 'lunatic' | 'ultimate'
	skillDamage: 'all' | 'hit1' | 'hit2' | 'hit3'
	elementAttack: 'advantageous' | 'other' | 'none' | 'disadvantageous'
	combo: boolean
	damageType: 'critical' | 'graze' | 'normal' | 'expected'
	distance: 'short' | 'long' | 'disabled'
	elementPower: 'enabled' | 'advantageOnly' | 'awakeningOnly' | 'disabled'
	unsheathe: boolean
}

export default function DamagePreview({ isVisible }: DamagePreviewProps) {
	// 威力オプション設定の状態管理
	const [powerOptions, setPowerOptions] = useState<PowerOptions>({
		bossDifficulty: 'normal',
		skillDamage: 'all',
		elementAttack: 'advantageous',
		combo: false,
		damageType: 'expected',
		distance: 'disabled',
		elementPower: 'enabled',
		unsheathe: false,
	})

	// Zustandストアから計算データと計算結果を取得
	const calculatorData = useCalculatorStore((state) => state.data)
	const calculationResults = useCalculatorStore((state) => state.calculationResults)
	const updateCalculationResults = useCalculatorStore((state) => state.updateCalculationResults)

	// 計算結果を更新
	useEffect(() => {
		if (!calculationResults) {
			updateCalculationResults()
		}
	}, [calculationResults, updateCalculationResults])

	// 実際のダメージ計算
	const damageResults = useMemo(() => {
		try {
			// 基本的な計算入力データを作成
			const defaultInput = createDefaultDamageInput()
			
			// 計算結果が利用可能な場合は使用、なければフォールバック値を使用
			const totalATK = calculationResults?.basicStats.totalATK || 1000
			const stabilityRate = calculationResults?.basicStats.stabilityRate || 85
			
			// 敵情報を取得
			let enemyInfo = null
			if (calculatorData.enemy?.selectedEnemyId) {
				enemyInfo = getEnemyById(calculatorData.enemy.selectedEnemyId)
			}

			// 実際の装備品ボーナスを計算
			const equipmentBonuses = getEquipmentBonuses(calculatorData.equipment)
			const crystalBonuses = getCrystalBonuses(calculatorData.crystals)
			const foodBonuses = getFoodBonuses(calculatorData.food)
			const buffBonuses = getBuffBonuses(calculatorData.buffItems)
			
			// 全てのボーナスを統合
			const allBonuses = aggregateAllBonuses(
				equipmentBonuses,
				crystalBonuses,
				foodBonuses,
				buffBonuses,
			)
			
			// デバッグ用ログ - 実際の値を確認
			console.log('=== DamagePreview Debug ===')
			console.log('calculatorData.baseStats.level:', calculatorData.baseStats.level)
			console.log('totalATK:', totalATK)
			console.log('stabilityRate:', stabilityRate)
			console.log('calculationResults?.basicStats:', calculationResults?.basicStats)
			console.log('calculatorData.enemy:', calculatorData.enemy)
			console.log('calculatorData.enemy.selectedEnemyId:', calculatorData.enemy?.selectedEnemyId)
			console.log('enemyInfo:', enemyInfo)
			if (enemyInfo) {
				console.log('enemyInfo.stats:', enemyInfo.stats)
				console.log('enemyInfo.stats.DEF:', enemyInfo.stats.DEF)
				console.log('enemyInfo.stats.MDEF:', enemyInfo.stats.MDEF)
			}
			
			// PowerOptionsに基づく属性攻撃設定
			const getElementAdvantageTotal = () => {
				if (powerOptions.elementAttack === 'none') return 0
				// 基本ステータスから総属性有利を取得（装備・クリスタ・料理・バフ統合済み）
				const baseAdvantage = calculationResults?.basicStats?.totalElementAdvantage ?? 0
				
				// 属性攻撃が有効な場合は基本ステータスの総属性有利をそのまま使用
				// PowerOptionsの設定は属性攻撃の有効/無効の判定にのみ使用
				return baseAdvantage
			}
			
			const getElementAdvantageAwakening = () => {
				if (powerOptions.elementAttack === 'none') return 0
				// 実際の計算結果から属性覚醒有利を取得
				return calculationResults?.basicStats?.elementAwakeningAdvantage ?? 0
			}
			
			// PowerOptionsに基づく距離設定
			const getDistanceValues = () => {
				return {
					shortRange: allBonuses.ShortRangeDamage_Rate ?? 0,
					longRange: allBonuses.LongRangeDamage_Rate ?? 0,
				}
			}
			
			// Zustandストアのデータで入力を更新
			const distanceValues = getDistanceValues()
			
			// 敵情報を明示的に作成
			const finalEnemyDEF = enemyInfo?.stats.DEF ?? defaultInput.enemy.DEF
			const finalEnemyMDEF = enemyInfo?.stats.MDEF ?? defaultInput.enemy.MDEF
			const finalEnemyLevel = enemyInfo?.level ?? defaultInput.enemy.level
			
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
					isActive: powerOptions.elementAttack !== 'none',
				},
				distance: distanceValues,
				unsheathe: {
					fixedDamage: allBonuses.UnsheatheAttack ?? defaultInput.unsheathe.fixedDamage,
					rateBonus: allBonuses.UnsheatheAttack_Rate ?? 0,
					isActive: powerOptions.unsheathe,
				},
				userSettings: {
					familiarity: 100, // 仮の慣れ値（100%）
					currentDistance: powerOptions.distance,
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
					physical: enemyInfo?.stats.physicalResistance ?? defaultInput.resistance.physical,
					magical: enemyInfo?.stats.magicalResistance ?? defaultInput.resistance.magical,
				},
				// 貫通値を実際の装備品ボーナスから取得
				penetration: {
					physical: allBonuses.PhysicalPenetration_Rate ?? defaultInput.penetration.physical,
					magical: allBonuses.MagicalPenetration_Rate ?? defaultInput.penetration.magical,
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
			
			// 3. 敵の耐性
			console.log('3. 敵の耐性:')
			console.log('  物理耐性 (%):', input.resistance.physical)
			console.log('  魔法耐性 (%):', input.resistance.magical)
			console.log('  武器耐性 (%):', input.resistance.weapon)
			
			// 4. 敵のDEF/MDEF
			console.log('4. 敵の防御力:')
			console.log('  敵DEF:', input.enemy.DEF)
			console.log('  敵MDEF:', input.enemy.MDEF)
			
			// 5. 貫通値
			console.log('5. 貫通値:')
			console.log('  物理貫通:', input.penetration.physical)
			console.log('  魔法貫通:', input.penetration.magical)
			console.log('  DEBUG: allBonuses.PhysicalPenetration_Rate:', allBonuses.PhysicalPenetration_Rate)
			console.log('  DEBUG: allBonuses.MagicalPenetration_Rate:', allBonuses.MagicalPenetration_Rate)
			console.log('  DEBUG: allBonuses:', allBonuses)
			
			// 6. 固定値
			console.log('6. 固定値:')
			console.log('  抜刀固定値:', input.unsheathe.fixedDamage)
			console.log('  スキル固定値:', input.attackSkill.fixedDamage)
			console.log('  抜刀有効:', input.unsheathe.isActive)
			console.log('  DEBUG: allBonuses.UnsheatheAttack:', allBonuses.UnsheatheAttack)
			console.log('  DEBUG: allBonuses.UnsheatheAttack_Rate:', allBonuses.UnsheatheAttack_Rate)
			
			// 7. 属性有利
			console.log('7. 属性有利:')
			console.log('  総属性有利 (%):', input.elementAdvantage.total)
			console.log('  属性覚醒有利 (%):', input.elementAdvantage.awakening)
			console.log('  属性攻撃有効:', input.elementAdvantage.isActive)
			console.log('  DEBUG: calculationResults?.basicStats?.totalElementAdvantage:', calculationResults?.basicStats?.totalElementAdvantage)
			console.log('  DEBUG: calculationResults?.basicStats?.elementAwakeningAdvantage:', calculationResults?.basicStats?.elementAwakeningAdvantage)
			console.log('  DEBUG: allBonuses.ElementAdvantage_Rate:', allBonuses.ElementAdvantage_Rate)
			
			// 8. スキル倍率
			console.log('8. スキル倍率:')
			console.log('  スキル倍率 (%):', input.attackSkill.multiplier)
			console.log('  攻撃タイプ:', input.attackSkill.type)
			
			// 9. 距離威力
			console.log('9. 距離威力:')
			console.log('  近距離威力 (%):', input.distance.shortRange)
			console.log('  遠距離威力 (%):', input.distance.longRange)
			console.log('  現在の距離判定:', input.userSettings.currentDistance)
			console.log('  DEBUG: allBonuses.ShortRangeDamage_Rate:', allBonuses.ShortRangeDamage_Rate)
			console.log('  DEBUG: allBonuses.LongRangeDamage_Rate:', allBonuses.LongRangeDamage_Rate)
			
			// 10. その他重要な値
			console.log('10. その他:')
			console.log('  安定率 (%):', input.stability.rate)
			console.log('  抜刀% (%):', input.unsheathe.rateBonus)
			console.log('  慣れ (%):', input.userSettings.familiarity)
			
			console.log('================================')

			// 攻撃スキルが選択されている場合は、スキルの計算結果を使用
			let finalInput = input
			if (calculatorData.attackSkill?.selectedSkillId) {
				const selectedSkill = getAttackSkillById(calculatorData.attackSkill.selectedSkillId)
				if (selectedSkill) {
					// 攻撃スキル計算システムを使用してスキル情報を取得
					const skillCalculationResult = attackSkillCalculation.calculateSkill(
						selectedSkill.id,
						calculatorData,
					)

					// スキル用の計算入力データを作成
					finalInput = {
						...input,
						// スキルの場合はMATKまたはtotalATKを参照
						referenceStat: selectedSkill.hits[0].powerReference === 'MATK' 
							? (calculationResults?.basicStats.MATK || 1500)
							: totalATK,
						attackSkill: {
							type: selectedSkill.hits[0].attackType,
							multiplier: skillCalculationResult.hits[0]?.calculatedMultiplier || selectedSkill.hits[0].multiplier,
							fixedDamage: skillCalculationResult.hits[0]?.calculatedFixedDamage || selectedSkill.hits[0].fixedDamage,
							supportedDistances: selectedSkill.hits[0].canUseDistancePower ? ['short', 'long'] : [],
							canUseLongRange: selectedSkill.hits[0].canUseLongRange,
						},
						// スキルでも距離・抜刀・慣れ設定を適用
						unsheathe: {
							...input.unsheathe,
							isActive: powerOptions.unsheathe && selectedSkill.hits[0].canUseUnsheathePower,
						},
					}
				}
			}

			// 最終的なダメージ計算
			const attackResult = calculateDamage(finalInput)
			
			// 計算結果の詳細ログ
			console.log('=== CALCULATION RESULTS ===')
			console.log('最終ダメージ:', attackResult.baseDamage)
			console.log('最小ダメージ:', attackResult.stabilityResult.minDamage)
			console.log('最大ダメージ:', attackResult.stabilityResult.maxDamage)
			console.log('平均ダメージ:', attackResult.stabilityResult.averageDamage)
			console.log('')
			console.log('=== CALCULATION STEPS ===')
			if (attackResult.calculationSteps.step1_baseDamage) {
				const step1 = attackResult.calculationSteps.step1_baseDamage
				console.log('ステップ1 基礎ダメージ:')
				console.log('  計算前:', step1.beforeResistance, '= (自Lv', step1.playerLevel, '+ 参照ステータス', step1.referenceStat, '- 敵Lv', step1.enemyLevel, ')')
				console.log('  耐性適用後:', step1.afterResistance)
				console.log('  敵防御力:', step1.enemyDEF)
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
				console.log('  結果:', step3.result)
			}
			if (attackResult.calculationSteps.step4_skillMultiplier) {
				const step4 = attackResult.calculationSteps.step4_skillMultiplier
				console.log('ステップ4 スキル倍率:')
				console.log('  適用前:', step4.beforeSkill)
				console.log('  スキル倍率:', step4.skillRate, '%')
				console.log('  結果:', step4.result)
			}
			console.log('================================')

			// 最終結果を返す（攻撃スキルが選択されている場合は既にfinalInputで適用済み）
			const hasSkillSelected = calculatorData.attackSkill?.selectedSkillId !== undefined
			
			return {
				normal: {
					min: hasSkillSelected ? attackResult.stabilityResult.minDamage : attackResult.stabilityResult.minDamage,
					max: hasSkillSelected ? attackResult.stabilityResult.maxDamage : attackResult.stabilityResult.maxDamage,
					average: hasSkillSelected ? attackResult.stabilityResult.averageDamage : attackResult.stabilityResult.averageDamage,
					stability: attackResult.stabilityResult.stabilityRate,
				},
				skill: {
					min: attackResult.stabilityResult.minDamage,
					max: attackResult.stabilityResult.maxDamage,
					average: attackResult.stabilityResult.averageDamage,
					stability: attackResult.stabilityResult.stabilityRate,
				},
			}
		} catch (error) {
			console.error('ダメージ計算エラー:', error)
			// エラー時はフォールバック値を返す
			return {
				normal: { min: 1000, max: 1500, average: 1250, stability: 85 },
				skill: { min: 1200, max: 1800, average: 1500, stability: 85 },
			}
		}
	}, [calculatorData, calculationResults, powerOptions])

	if (!isVisible) {
		return null
	}

	const handleScreenshot = () => {
		// スクリーンショット機能（将来実装）
		console.log('キャプチャ機能は将来実装予定です')
	}

	const updatePowerOption = <K extends keyof PowerOptions>(
		key: K,
		value: PowerOptions[K],
	) => {
		setPowerOptions((prev) => ({ ...prev, [key]: value }))
	}

	return (
		<div className="bg-blue-50 py-2">
			<div className="container mx-auto px-4">
				{/* キャプチャボタン */}
				<div className="mb-4 flex justify-end">
					<button
						onClick={handleScreenshot}
						className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 cursor-pointer"
					>
						<svg
							className="w-4 h-4"
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
				</div>

				{/* ダメージ表示テーブル */}
				<div className="bg-white rounded-lg border border-gray-200 mb-6 overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-gray-200">
								<th className="px-4 py-3 text-left text-gray-600 font-medium">
									-
								</th>
								<th className="px-4 py-3 text-center text-gray-600 font-medium">
									ダメージ
								</th>
								<th className="px-4 py-3 text-center text-gray-600 font-medium">
									安定率
								</th>
								<th className="px-4 py-3 text-center text-gray-600 font-medium">
									ダメージ
								</th>
								<th className="px-4 py-3 text-center text-gray-600 font-medium">
									安定率
								</th>
							</tr>
						</thead>
						<tbody>
							<tr className="border-b border-gray-100">
								<td className="px-4 py-3 font-medium text-gray-700">最小</td>
								<td className="px-4 py-3 text-center font-semibold text-blue-600">
									{damageResults.normal.min.toLocaleString()}
								</td>
								<td className="px-4 py-3 text-center text-gray-600">
									{damageResults.normal.stability}%
								</td>
								<td className="px-4 py-3 text-center font-semibold text-purple-600">
									{damageResults.skill.min.toLocaleString()}
								</td>
								<td className="px-4 py-3 text-center text-gray-600">
									{damageResults.skill.stability}%
								</td>
							</tr>
							<tr className="border-b border-gray-100">
								<td className="px-4 py-3 font-medium text-gray-700">最大</td>
								<td className="px-4 py-3 text-center font-semibold text-blue-600">
									{damageResults.normal.max.toLocaleString()}
								</td>
								<td className="px-4 py-3 text-center text-gray-600">100%</td>
								<td className="px-4 py-3 text-center font-semibold text-purple-600">
									{damageResults.skill.max.toLocaleString()}
								</td>
								<td className="px-4 py-3 text-center text-gray-600">100%</td>
							</tr>
							<tr>
								<td className="px-4 py-3 font-medium text-gray-700">平均</td>
								<td className="px-4 py-3 text-center font-bold text-orange-600">
									{damageResults.normal.average.toLocaleString()}
								</td>
								<td className="px-4 py-3 text-center text-gray-600">
									{Math.round((damageResults.normal.min + damageResults.normal.max) / 2 / damageResults.normal.max * 100)}%
								</td>
								<td className="px-4 py-3 text-center font-bold text-orange-600">
									{damageResults.skill.average.toLocaleString()}
								</td>
								<td className="px-4 py-3 text-center text-gray-600">
									{Math.round((damageResults.skill.min + damageResults.skill.max) / 2 / damageResults.skill.max * 100)}%
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				{/* 慣れ倍率スライダー（後で実装予定の枠） */}
				<div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex items-center gap-2">
					<div className="text-[13px] font-medium text-gray-700">
						慣れ倍率（後で実装）
					</div>
					<div className="h-8 bg-gray-100 rounded flex items-center justify-center">
						<span className="text-xs text-gray-500">スライダー実装予定</span>
					</div>
				</div>

				{/* 敵情報 */}
				<div className="p-2 flex items-center gap-2">
					<p className="text-xs sm:text-[13px] font-medium text-gray-700">
						敵：ラフィー
					</p>
				</div>

				{/* 威力オプション */}
				<div className=" sm:p-2">
					<ul className="flex gap-2 bg-blue-100 p-1">
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
												updatePowerOption('bossDifficulty', difficulty)
											}
											className={`px-3 py-0.5 sm:py-1 text-xs md:text-[13px] rounded ${
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
										onClick={() => updatePowerOption('skillDamage', hit)}
										className={`px-3 py-1 text-xs md:text-[13px] rounded ${
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
										onClick={() => updatePowerOption('elementAttack', element)}
										className={`px-3 py-1 text-xs md:text-[13px] rounded ${
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
										onClick={() => updatePowerOption('combo', option.value)}
										className={`px-3 py-1 text-xs md:text-[13px] rounded ${
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
								{(['critical', 'graze', 'normal', 'expected'] as const).map(
									(type) => (
										<button
											key={type}
											onClick={() => updatePowerOption('damageType', type)}
											className={`px-3 py-1 text-xs md:text-[13px] rounded ${
												powerOptions.damageType === type
													? 'bg-amber-400 text-white'
													: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
											}`}
										>
											{type === 'critical'
												? 'Critical'
												: type === 'graze'
													? 'Graze'
													: type === 'normal'
														? '白ダメ'
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
										onClick={() => updatePowerOption('distance', distance)}
										className={`px-3 py-1 text-xs md:text-[13px] rounded ${
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
										onClick={() => updatePowerOption('elementPower', power)}
										className={`px-3 py-1 text-xs md:text-[13px] rounded ${
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
										onClick={() => updatePowerOption('unsheathe', option.value)}
										className={`px-3 py-1 text-xs md:text-[13px] rounded ${
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
