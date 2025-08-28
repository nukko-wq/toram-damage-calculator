'use client'

import { useMemo, useState } from 'react'
import {
	attackSkillsData,
	getAttackSkillById,
	getPowerReferenceDisplayText,
	getSystemGroupLabel,
} from '@/data/attackSkills'
import { useUIStore } from '@/stores'
import { useCalculatorStore } from '@/stores/calculatorStore'
import type { AttackSkillDisplayData, CalculatedHit } from '@/types/calculator'
import { attackSkillCalculation } from '@/utils/attackSkillCalculation'
import type { BuffSkillContext } from '@/utils/attackSkillCalculation/types'

interface AttackSkillFormProps {
	onSkillChange?: (skillData: AttackSkillDisplayData) => void
}

export default function AttackSkillForm({
	onSkillChange,
}: AttackSkillFormProps) {
	// Zustandストアから攻撃スキルデータを取得
	const attackSkillData = useCalculatorStore(
		(state) =>
			state.data.attackSkill || {
				selectedSkillId: null,
				calculatedData: null,
				lastCalculatedAt: undefined,
			},
	)
	const updateAttackSkill = useCalculatorStore(
		(state) => state.updateAttackSkill,
	)

	// UIStoreから溜め回数設定を取得
	const {
		attackSkill: {
			variableCharge: { chargeLevel },
		},
	} = useUIStore()

	// 選択中の撃目（タブ）
	const [selectedHitIndex, setSelectedHitIndex] = useState(0)

	// 選択中のスキル
	const selectedSkill = useMemo(() => {
		if (!attackSkillData.selectedSkillId) return null
		return getAttackSkillById(attackSkillData.selectedSkillId)
	}, [attackSkillData.selectedSkillId])

	// 全体のデータを取得（計算に使用）
	const calculatorData = useCalculatorStore((state) => state.data)

	// 表示用の計算データ
	const displayData = useMemo((): AttackSkillDisplayData => {
		if (!selectedSkill) {
			return {
				selectedSkill: null,
				calculatedHits: [],
				showDetailedInfo: false,
			}
		}

		// 計算モジュールを使用して実際の計算を実行
		const variableOptions = selectedSkill.hasVariableCharging
			? { chargeLevel }
			: undefined

		const calculationResult = attackSkillCalculation.calculateSkill(
			selectedSkill.id,
			calculatorData,
			variableOptions,
		)

		const calculatedHits: CalculatedHit[] = calculationResult.hits.map(
			(calculatedHit) => {
				const originalHit = selectedSkill.hits.find(
					(hit) => hit.hitNumber === calculatedHit.hitNumber,
				)
				if (!originalHit) {
					throw new Error(
						`Original hit data not found for hit ${calculatedHit.hitNumber}`,
					)
				}

				return {
					hitNumber: calculatedHit.hitNumber,
					attackType: originalHit.attackType,
					powerReference: getPowerReferenceDisplayText(
						originalHit.powerReference,
					),
					referenceDefense: originalHit.referenceDefense,
					referenceResistance: originalHit.referenceResistance,
					multiplier: calculatedHit.calculatedMultiplier,
					fixedDamage: calculatedHit.calculatedFixedDamage,
					multiplierFormula: originalHit.multiplierFormula,
					fixedDamageFormula: originalHit.fixedDamageFormula,
					adaptationReference: originalHit.adaptation,
					adaptationGrant: originalHit.adaptationGrant,
					canUseUnsheathePower: originalHit.canUseUnsheathePower,
					canUseLongRange: originalHit.canUseLongRange,
					canUseShortRangePower: originalHit.canUseShortRangePower,
					canUseLongRangePower: originalHit.canUseLongRangePower,
					specialEffects: originalHit.specialEffects,
					calculationProcess: calculatedHit.calculationProcess,
				}
			},
		)

		return {
			selectedSkill,
			calculatedHits,
			showDetailedInfo: false,
		}
	}, [selectedSkill, calculatorData, chargeLevel])

	// スキル選択処理
	const handleSkillSelect = (skillId: string) => {
		const newSkillId = skillId === '' ? null : skillId

		// スキルが選択された場合は計算を実行
		let calculatedData = null
		let displayDataForCallback = {
			selectedSkill: null,
			calculatedHits: [],
			showDetailedInfo: false,
		} as AttackSkillDisplayData

		if (newSkillId) {
			const skill = getAttackSkillById(newSkillId)
			if (skill) {
				const variableOptions = skill.hasVariableCharging
					? { chargeLevel }
					: undefined

				const calculationResult = attackSkillCalculation.calculateSkill(
					newSkillId,
					calculatorData,
					variableOptions,
				)
				calculatedData = calculationResult.hits.map((calculatedHit) => {
					const originalHit = skill.hits.find(
						(hit) => hit.hitNumber === calculatedHit.hitNumber,
					)
					if (!originalHit) {
						throw new Error(
							`Original hit data not found for hit ${calculatedHit.hitNumber}`,
						)
					}
					return {
						hitNumber: calculatedHit.hitNumber,
						attackType: originalHit.attackType,
						powerReference: getPowerReferenceDisplayText(
							originalHit.powerReference,
						),
						referenceDefense: originalHit.referenceDefense,
						referenceResistance: originalHit.referenceResistance,
						multiplier: calculatedHit.calculatedMultiplier,
						fixedDamage: calculatedHit.calculatedFixedDamage,
						multiplierFormula: originalHit.multiplierFormula,
						fixedDamageFormula: originalHit.fixedDamageFormula,
						adaptationReference: originalHit.adaptation,
						adaptationGrant: originalHit.adaptationGrant,
						canUseUnsheathePower: originalHit.canUseUnsheathePower,
						canUseLongRange: originalHit.canUseLongRange,
						canUseShortRangePower: originalHit.canUseShortRangePower,
						canUseLongRangePower: originalHit.canUseLongRangePower,
						specialEffects: originalHit.specialEffects,
						calculationProcess: calculatedHit.calculationProcess,
					}
				})

				displayDataForCallback = {
					selectedSkill: skill,
					calculatedHits: calculatedData,
					showDetailedInfo: false,
				}
			}
		}

		updateAttackSkill({
			selectedSkillId: newSkillId,
			calculatedData,
			lastCalculatedAt: new Date().toISOString(),
		})

		// 親コンポーネントに通知
		if (onSkillChange) {
			onSkillChange(displayDataForCallback)
		}
	}

	// 慣れタイプの表示名
	const getAdaptationDisplayText = (adaptation: string) => {
		switch (adaptation) {
			case 'physical':
				return '物理'
			case 'magical':
				return '魔法'
			case 'normal':
				return '通常'
			default:
				return adaptation
		}
	}

	// 距離威力の表示テキストを決定
	const getDistancePowerDisplayText = (hit: CalculatedHit) => {
		const canShort = hit.canUseShortRangePower
		const canLong = hit.canUseLongRangePower

		if (canShort && canLong) {
			return '○' // 近距離と遠距離両方有効
		}
		if (canShort && !canLong) {
			return '近距離○' // 近距離のみ有効
		}
		if (!canShort && canLong) {
			return '遠距離○' // 遠距離のみ有効（稀）
		}
		return '×' // 両方無効
	}

	// 系統別にスキルをグループ化
	const skillGroups = useMemo(() => {
		const groups: { [key: string]: typeof attackSkillsData } = {}

		attackSkillsData.forEach((skill) => {
			const groupLabel = getSystemGroupLabel(skill.systemGroup)
			if (!groups[groupLabel]) {
				groups[groupLabel] = []
			}
			groups[groupLabel].push(skill)
		})

		return groups
	}, [])

	return (
		<div className="space-y-4 p-4 shadow-md rounded-lg bg-white md:col-start-4 md:col-end-9 md:row-start-6 md:row-end-8 xl:col-start-3 xl:col-end-4 xl:row-start-6 xl:row-end-8 max-w-full overflow-hidden">
			<h2 className="text-lg font-bold text-gray-800 mb-3">攻撃スキル</h2>

			{/* スキル選択セクション */}
			<div className="w-full min-w-0">
				<select
					value={attackSkillData.selectedSkillId || ''}
					onChange={(e) => handleSkillSelect(e.target.value)}
					className="w-full text-xs sm:text-sm px-1 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0 max-w-full"
					style={{
						width: '100%',
						maxWidth: '100%',
						minWidth: '0',
						boxSizing: 'border-box',
					}}
				>
					<option value="">⚔️ 攻撃スキルを選択してください</option>
					{Object.entries(skillGroups).map(([groupLabel, skills]) => (
						<optgroup key={groupLabel} label={groupLabel}>
							{skills.map((skill) => (
								<option key={skill.id} value={skill.id}>
									{skill.name}
								</option>
							))}
						</optgroup>
					))}
				</select>
			</div>

			{/* スキル情報表示セクション */}
			{selectedSkill && (
				<div className="space-y-4 p-4 bg-gray-50 rounded-lg">
					{/* スキル威力値 */}
					<div className="space-y-2">
						<div className="flex flex-col">
							<div className="flex">
								<span className="text-gray-700 w-[7rem] text-sm">
									スキル威力値:
								</span>{' '}
								<span className="flex items-center gap-3 text-sm">
									{displayData.calculatedHits.map((hit, index) => (
										<span
											key={hit.hitNumber}
											className="flex items-center w-[4rem] gap-2 text-gray-700"
										>
											{hit.multiplier}%
											{index < displayData.calculatedHits.length - 1 && (
												<span className="text-gray-700">/</span>
											)}
										</span>
									))}
								</span>
							</div>
							<div className="flex">
								<span className="text-gray-700 w-[7rem] text-sm">
									スキル固定値:
								</span>{' '}
								<span className="flex items-center gap-3 text-sm">
									{displayData.calculatedHits.map((hit, index) => (
										<span
											key={hit.hitNumber}
											className="flex items-center w-[4rem] gap-8 text-gray-700"
										>
											{hit.fixedDamage}
											{index < displayData.calculatedHits.length - 1 && (
												<span className="text-gray-700">/</span>
											)}
										</span>
									))}
								</span>
							</div>
							<div className="flex">
								<span className="text-gray-700 w-[7rem] text-sm">消費MP:</span>{' '}
								<span className="text-gray-700 text-sm">
									{selectedSkill.mpCost}
								</span>
							</div>
						</div>
					</div>

					{/* タブメニュー */}
					<div className="flex border-b border-gray-300">
						{selectedSkill.hits.map((hit, index) => (
							<button
								type="button"
								key={hit.hitNumber}
								onClick={() => setSelectedHitIndex(index)}
								className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
									selectedHitIndex === index
										? 'border-blue-500 text-blue-600'
										: 'border-transparent text-gray-600 hover:text-gray-800'
								}`}
							>
								{hit.hitNumber}撃目
							</button>
						))}
					</div>

					{/* 選択された撃の詳細情報 */}
					{(() => {
						const currentHit =
							displayData.calculatedHits[selectedHitIndex] ||
							displayData.calculatedHits[0]
						return (
							<div className="space-y-3">
								{/* テーブル風の詳細情報 */}
								<div className="border border-gray-300 rounded text-xs sm:text-sm">
									{/* 1行目: 3列表示 (スキルタイプ、慣れ参照、慣れ付与) */}
									<div className="border-b border-gray-300 grid grid-cols-3">
										<div className="px-3 py-2 border-r border-gray-300">
											<span className="text-gray-700">
												{currentHit.attackType === 'physical'
													? '物理スキル'
													: '魔法スキル'}
											</span>
										</div>
										<div className="px-3 py-2 border-r border-gray-300">
											<span className="text-gray-700">慣れ参照:</span>{' '}
											<span className="text-gray-700">
												{getAdaptationDisplayText(
													currentHit.adaptationReference,
												)}
											</span>
										</div>
										<div className="px-3 py-2">
											<span className="text-gray-700">慣れ付与:</span>{' '}
											<span className="text-gray-700">
												{getAdaptationDisplayText(currentHit.adaptationGrant)}
											</span>
										</div>
									</div>

									{/* 2行目: 2列表示 (参照防御力、参照耐性) */}
									<div className="border-b border-gray-300 grid grid-cols-2">
										<div className="px-3 py-2 border-r border-gray-300">
											<span className="text-gray-700">参照防御力:</span>{' '}
											<span className="text-gray-700">
												{currentHit.referenceDefense}
											</span>
										</div>
										<div className="px-3 py-2">
											<span className="text-gray-600">参照耐性:</span>{' '}
											<span className="text-gray-700">
												{currentHit.referenceResistance === 'physical'
													? '物理耐性'
													: '魔法耐性'}
											</span>
										</div>
									</div>

									{/* 3行目: 3列表示 (距離威力、抜刀威力、ロングレンジ) */}
									<div className="border-b border-gray-300 grid grid-cols-3">
										<div className="px-3 py-2 border-r border-gray-300">
											<span className="text-gray-600">距離威力:</span>{' '}
											<span className="text-gray-700">
												{getDistancePowerDisplayText(currentHit)}
											</span>
										</div>
										<div className="px-3 py-2 border-r border-gray-300">
											<span className="text-gray-600">抜刀威力:</span>{' '}
											<span className="text-gray-700">
												{currentHit.canUseUnsheathePower ? '○' : '×'}
											</span>
										</div>
										<div className="px-3 py-2">
											<span className="text-gray-600">ロングレンジ:</span>{' '}
											<span className="text-gray-700">
												{currentHit.canUseLongRange ? '○' : '×'}
											</span>
										</div>
									</div>

									{/* 4行目: 1列表示 (威力参照) */}
									<div className="px-3 py-2">
										<span className="text-gray-700">威力参照/攻撃力:</span>{' '}
										<span className="text-gray-700">
											{currentHit.powerReference}
										</span>
									</div>
								</div>

								{/* スキル威力/固定値の計算式表示 */}
								{(currentHit.multiplierFormula ||
									currentHit.fixedDamageFormula ||
									(currentHit.specialEffects &&
										currentHit.specialEffects.length > 0)) && (
									<div className="space-y-2 p-3 rounded border border-gray-300 bg-gray-50">
										{/* Special Effects の表示 */}
										{currentHit.specialEffects &&
											currentHit.specialEffects.length > 0 && (
												<div className="space-y-1">
													<div className="text-sm text-gray-600 font-medium">
														特殊効果:
													</div>
													<div className="flex flex-wrap gap-1">
														{currentHit.specialEffects.map((effect) => (
															<span
																key={effect}
																className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full border border-blue-200"
															>
																{effect}
															</span>
														))}
													</div>
												</div>
											)}
										{currentHit.multiplierFormula && (
											<div className="space-y-1">
												{Array.isArray(currentHit.multiplierFormula) ? (
													currentHit.multiplierFormula.map((formula) => (
														<div
															key={formula}
															className="flex items-center text-sm"
														>
															<span className="text-gray-700 font-mono mt-1 before:content-['★'] before:text-red-500 text-xs sm:text-sm">
																{formula}
															</span>
														</div>
													))
												) : (
													<div className="flex items-center text-sm">
														<span className="text-gray-700 font-mono mt-1 before:content-['★'] before:text-red-500 text-xs sm:text-sm">
															{currentHit.multiplierFormula}
														</span>
													</div>
												)}
											</div>
										)}
										{currentHit.fixedDamageFormula && (
											<div className="flex items-center text-sm">
												<span className="text-gray-700 font-mono mt-1 before:content-['★'] before:text-red-500 text-xs sm:text-sm">
													{currentHit.fixedDamageFormula}
												</span>
											</div>
										)}
									</div>
								)}

								{/* 計算過程表示（特殊計算がある場合） */}
								{currentHit.calculationProcess && (
									<div className="space-y-2 p-3 rounded border border-gray-300 bg-blue-50">
										<div className="text-xs sm:text-sm">
											<span className="text-gray-600">計算過程:</span>
											<div className="text-gray-700 font-mono mt-1">
												{currentHit.calculationProcess}
											</div>
										</div>
									</div>
								)}
							</div>
						)
					})()}
				</div>
			)}
		</div>
	)
}
