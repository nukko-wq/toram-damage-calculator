'use client'

import { useState, useMemo } from 'react'
import type { CalculatedHit, AttackSkillDisplayData } from '@/types/calculator'
import { useCalculatorStore } from '@/stores/calculatorStore'
import {
	attackSkillsData,
	getAttackSkillById,
	getPowerReferenceDisplayText,
} from '@/data/attackSkills'

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

	// 選択中の撃目（タブ）
	const [selectedHitIndex, setSelectedHitIndex] = useState(0)

	// 選択中のスキル
	const selectedSkill = useMemo(() => {
		if (!attackSkillData.selectedSkillId) return null
		return getAttackSkillById(attackSkillData.selectedSkillId)
	}, [attackSkillData.selectedSkillId])

	// 表示用の計算データ
	const displayData = useMemo((): AttackSkillDisplayData => {
		const calculatedHits: CalculatedHit[] =
			selectedSkill?.hits.map((hit) => ({
				hitNumber: hit.hitNumber,
				attackType: hit.attackType,
				powerReference: getPowerReferenceDisplayText(hit.powerReference),
				referenceDefense: hit.referenceDefense,
				referenceResistance: hit.referenceResistance,
				multiplier: hit.multiplier,
				fixedDamage: hit.fixedDamage,
				multiplierFormula: hit.multiplierFormula,
				fixedDamageFormula: hit.fixedDamageFormula,
				familiarityReference: hit.familiarity,
				familiarityGrant: hit.familiarityGrant,
				canUseUnsheathePower: hit.canUseUnsheathePower,
				canUseLongRange: hit.canUseLongRange,
				canUseDistancePower: hit.canUseDistancePower,
			})) || []

		return {
			selectedSkill: selectedSkill || null,
			calculatedHits,
			showDetailedInfo: false,
		}
	}, [selectedSkill])

	// スキル選択処理
	const handleSkillSelect = (skillId: string) => {
		const newSkillId = skillId === '' ? null : skillId
		updateAttackSkill({
			selectedSkillId: newSkillId,
			calculatedData: newSkillId ? displayData.calculatedHits : null,
			lastCalculatedAt: new Date().toISOString(),
		})

		// 親コンポーネントに通知
		if (onSkillChange) {
			onSkillChange(displayData)
		}
	}

	// スキルリセット処理
	const handleSkillReset = () => {
		updateAttackSkill({
			selectedSkillId: null,
			calculatedData: null,
			lastCalculatedAt: undefined,
		})

		if (onSkillChange) {
			onSkillChange({
				selectedSkill: null,
				calculatedHits: [],
				showDetailedInfo: false,
			})
		}
	}

	// 慣れタイプの表示名
	const getFamiliarityDisplayText = (familiarity: string) => {
		switch (familiarity) {
			case 'physical':
				return '物理'
			case 'magical':
				return '魔法'
			case 'normal':
				return '通常'
			default:
				return familiarity
		}
	}

	return (
		<div className="space-y-4 p-4 border border-gray-300 rounded-lg bg-white xl:col-start-3 xl:col-end-4 xl:row-start-6 xl:row-end-8">
			<h2 className="text-lg font-bold text-gray-800 mb-3">攻撃スキル</h2>

			{/* スキル選択セクション */}
			<div className="flex gap-2">
				<select
					value={attackSkillData.selectedSkillId || ''}
					onChange={(e) => handleSkillSelect(e.target.value)}
					className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value="">⚔️ 攻撃スキルを選択してください</option>
					{attackSkillsData.map((skill) => (
						<option key={skill.id} value={skill.id}>
							{skill.name}
						</option>
					))}
				</select>
				<button
					onClick={handleSkillReset}
					className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
				>
					リセット
				</button>
			</div>

			{/* スキル情報表示セクション */}
			{selectedSkill && (
				<div className="space-y-4 p-4 bg-gray-50 rounded-lg">
					{/* スキル威力値 */}
					<div className="space-y-2">
						<div className="flex flex-col">
							<div className="flex">
								<span className="text-gray-700 w-[7rem]">スキル威力値:</span>{' '}
								<span className="flex items-center gap-3">
									{selectedSkill.hits.map((hit, index) => (
										<span
											key={hit.hitNumber}
											className="flex items-center w-[4rem] gap-2 text-gray-700"
										>
											{hit.multiplier}%
											{index < selectedSkill.hits.length - 1 && (
												<span className="text-gray-700">/</span>
											)}
										</span>
									))}
								</span>
							</div>
							<div className="flex">
								<span className="text-gray-700 w-[7rem]">スキル固定値:</span>{' '}
								<span className="flex items-center gap-3">
									{selectedSkill.hits.map((hit, index) => (
										<span
											key={hit.hitNumber}
											className="flex items-center w-[4rem] gap-8 text-gray-700"
										>
											{hit.fixedDamage}
											{index < selectedSkill.hits.length - 1 && (
												<span className="text-gray-700">/</span>
											)}
										</span>
									))}
								</span>
							</div>
							<div className="flex">
								<span className="text-gray-700 w-[7rem]">消費MP:</span>{' '}
								<span className="text-gray-700">{selectedSkill.mpCost}</span>
							</div>
						</div>
					</div>

					{/* タブメニュー */}
					{selectedSkill.hits.length > 1 && (
						<div className="flex border-b border-gray-300">
							{selectedSkill.hits.map((hit, index) => (
								<button
									key={hit.hitNumber}
									onClick={() => setSelectedHitIndex(index)}
									className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
										selectedHitIndex === index
											? 'border-blue-500 text-blue-600'
											: 'border-transparent text-gray-600 hover:text-gray-800'
									}`}
								>
									{hit.hitNumber}撃目
								</button>
							))}
						</div>
					)}

					{/* 選択された撃の詳細情報 */}
					{(() => {
						const currentHit =
							selectedSkill.hits[selectedHitIndex] || selectedSkill.hits[0]
						return (
							<div className="space-y-3">
								{/* テーブル風の詳細情報 */}
								<div className="border border-gray-300 rounded text-sm">
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
												{getFamiliarityDisplayText(currentHit.familiarity)}
											</span>
										</div>
										<div className="px-3 py-2">
											<span className="text-gray-700">慣れ付与:</span>{' '}
											<span className="text-gray-700">
												{getFamiliarityDisplayText(currentHit.familiarityGrant)}
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
												{currentHit.canUseDistancePower ? '○' : '×'}
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
											{getPowerReferenceDisplayText(currentHit.powerReference)}
										</span>
									</div>
								</div>

								{/* 特殊計算式表示（2撃目等で特殊な場合） */}
								{currentHit.multiplierFormula &&
									currentHit.multiplierFormula !==
										`${currentHit.multiplier}%` && (
										<div className="space-y-2 p-3 rounded border border-gray-300">
											<div className="text-sm">
												<span className="text-gray-600">威力+</span>
												<span className="text-gray-600">
													{currentHit.multiplierFormula}
												</span>
											</div>
										</div>
									)}

								{currentHit.fixedDamageFormula &&
									currentHit.fixedDamageFormula !== '0' &&
									currentHit.fixedDamageFormula !==
										`${currentHit.fixedDamage}` && (
										<div className="space-y-2 p-3 rounded border border-gray-300">
											<div className="text-sm">
												<span className="text-gray-600">固定値+</span>
												<span className="text-gray-600">
													{currentHit.fixedDamageFormula}
												</span>
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
