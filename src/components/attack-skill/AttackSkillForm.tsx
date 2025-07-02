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

	// 詳細情報の表示状態
	const [showDetailedInfo, setShowDetailedInfo] = useState(false)
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
			})) || []

		return {
			selectedSkill: selectedSkill || null,
			calculatedHits,
			showDetailedInfo,
		}
	}, [selectedSkill, showDetailedInfo])

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
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<span className="text-gray-600">スキル威力値:</span>{' '}
								{selectedSkill.hits.map((hit, index) => (
									<span key={hit.hitNumber}>
										{hit.multiplier}%
										{index < selectedSkill.hits.length - 1 && ' / '}
									</span>
								))}
							</div>
							<div>
								<span className="text-gray-600">スキル固定値:</span>{' '}
								{selectedSkill.hits.map((hit, index) => (
									<span key={hit.hitNumber}>
										{hit.fixedDamage}
										{index < selectedSkill.hits.length - 1 && ' / '}
									</span>
								))}
							</div>
						</div>
						<div className="text-sm">
							<span className="text-gray-600">消費MP:</span> {selectedSkill.mpCost}
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
						const currentHit = selectedSkill.hits[selectedHitIndex] || selectedSkill.hits[0]
						return (
							<div className="space-y-3">
								{/* 基本情報 */}
								<div className="grid grid-cols-3 gap-4 text-sm">
									<div>
										{currentHit.attackType === 'physical' ? '物理スキル' : '魔法スキル'}
									</div>
									<div>
										<span className="text-gray-600">慣れ参照:</span>{' '}
										{getFamiliarityDisplayText(currentHit.familiarity)}
									</div>
									<div>
										<span className="text-gray-600">慣れ付与:</span>{' '}
										{getFamiliarityDisplayText(currentHit.familiarityGrant)}
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4 text-sm">
									<div>
										<span className="text-gray-600">参照防御力:</span> {currentHit.referenceDefense}
									</div>
									<div>
										<span className="text-gray-600">参照耐性:</span>{' '}
										{currentHit.referenceResistance === 'physical' ? '物理耐性' : '魔法耐性'}
									</div>
								</div>

								<div className="grid grid-cols-3 gap-4 text-sm">
									<div>
										<span className="text-gray-600">距離威力:</span> 近距離○
									</div>
									<div>
										<span className="text-gray-600">抜刀威力:</span>{' '}
										{currentHit.canUseUnsheathePower ? '○' : '×'}
									</div>
									<div>
										<span className="text-gray-600">ロングレンジ:</span>{' '}
										{currentHit.canUseLongRange ? '○' : '×'}
									</div>
								</div>

								<div className="text-sm">
									<span className="text-gray-600">威力参照/攻撃力:</span>{' '}
									{getPowerReferenceDisplayText(currentHit.powerReference)}
								</div>

								{/* 特殊計算式表示（2撃目等で特殊な場合） */}
								{currentHit.multiplierFormula && currentHit.multiplierFormula !== `${currentHit.multiplier}%` && (
									<div className="space-y-2 p-3 bg-white rounded border">
										<div className="text-sm">
											<span className="text-gray-600">威力+</span>
											{currentHit.multiplierFormula}
										</div>
									</div>
								)}

								{currentHit.fixedDamageFormula && currentHit.fixedDamageFormula !== '0' && currentHit.fixedDamageFormula !== `${currentHit.fixedDamage}` && (
									<div className="space-y-2 p-3 bg-white rounded border">
										<div className="text-sm">
											<span className="text-gray-600">固定値+</span>
											{currentHit.fixedDamageFormula}
										</div>
									</div>
								)}
							</div>
						)
					})()}

					{/* 詳細情報（展開可能） */}
					<div className="space-y-2">
						<button
							onClick={() => setShowDetailedInfo(!showDetailedInfo)}
							className="flex items-center gap-2 text-gray-800 font-semibold hover:text-blue-600"
						>
							📋 詳細情報 {showDetailedInfo ? '▲' : '▼'}
						</button>

						{showDetailedInfo && (
							<div className="space-y-2 text-sm pl-4">
								{selectedSkill.weaponTypeRequirements && (
									<div>
										<span className="text-gray-600">必要武器:</span>{' '}
										{selectedSkill.weaponTypeRequirements.join(', ')}
									</div>
								)}
								{selectedSkill.prerequisites && (
									<div>
										<span className="text-gray-600">前提スキル:</span>{' '}
										{selectedSkill.prerequisites.join(', ')}
									</div>
								)}
								{selectedSkill.specialEffects &&
									selectedSkill.specialEffects.length > 0 && (
										<div>
											<span className="text-gray-600">特殊効果:</span>{' '}
											{selectedSkill.specialEffects.join(', ')}
										</div>
									)}
								{selectedSkill.description && (
									<div>
										<span className="text-gray-600">説明:</span>{' '}
										{selectedSkill.description}
									</div>
								)}
								{selectedSkill.notes && (
									<div>
										<span className="text-gray-600">備考:</span>{' '}
										{selectedSkill.notes}
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	)
}
