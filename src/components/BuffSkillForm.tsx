'use client'

import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { useCalculatorStore } from '@/stores/calculatorStore'
import {
	categoryNameMap,
	weaponTypeToMasterySkills,
	getDefaultParametersForSkill,
} from '@/utils/buffSkillDefaults'
import type { BuffSkill, BuffSkillCategory, WeaponType } from '@/types/calculator'

export default function BuffSkillForm() {
	const storeBuffSkills = useCalculatorStore((state) => state.data.buffSkills)
	const mainWeaponType = useCalculatorStore(
		(state) => state.data.mainWeapon.weaponType,
	)
	const updateBuffSkills = useCalculatorStore((state) => state.updateBuffSkills)
	const isInitialized = useCalculatorStore((state) => state.isInitialized)

	const [localInitialized, setLocalInitialized] = useState(false)
	const prevWeaponType = useRef<WeaponType>(mainWeaponType)

	// セーブデータ切り替え時のちらつき防止
	useEffect(() => {
		setLocalInitialized(false)
		const timer = setTimeout(() => setLocalInitialized(true), 30)
		return () => clearTimeout(timer)
	}, [storeBuffSkills])

	// 武器種に応じたマスタリスキルフィルタリング
	const getVisibleMasterySkills = useCallback((weaponType: WeaponType) => {
		return weaponTypeToMasterySkills[weaponType] || []
	}, [])

	// 武器種変更時のマスタリスキルリセット処理
	const resetMasterySkillsOnWeaponChange = useCallback(() => {
		if (!isInitialized || !localInitialized) return

		const updatedSkills = storeBuffSkills.skills.map((skill) => {
			if (skill.category === 'mastery') {
				return {
					...skill,
					isEnabled: false,
					parameters: getDefaultParametersForSkill(skill.id),
				}
			}
			return skill
		})
		updateBuffSkills({ skills: updatedSkills })
	}, [storeBuffSkills.skills, updateBuffSkills, isInitialized, localInitialized])

	// 武器種変更を検知してマスタリスキルをリセット
	useEffect(() => {
		if (prevWeaponType.current !== mainWeaponType) {
			resetMasterySkillsOnWeaponChange()
			prevWeaponType.current = mainWeaponType
		}
	}, [mainWeaponType, resetMasterySkillsOnWeaponChange])

	// スキルをカテゴリ別にグループ化（マスタリスキルフィルタリング付き）
	const skillsByCategory = useMemo(() => {
		const visibleMasterySkills = getVisibleMasterySkills(mainWeaponType)

		return storeBuffSkills.skills.reduce(
			(acc, skill) => {
				// マスタリスキルの場合は武器種に応じてフィルタリング
				if (skill.category === 'mastery') {
					if (visibleMasterySkills.length === 0) {
						// 抜刀剣等：マスタリスキル系統全体を非表示
						return acc
					}
					if (!visibleMasterySkills.includes(skill.id)) {
						// 該当しないマスタリスキルは非表示
						return acc
					}
				}

				if (!acc[skill.category]) acc[skill.category] = []
				acc[skill.category].push(skill)
				return acc
			},
			{} as Record<BuffSkillCategory, BuffSkill[]>,
		)
	}, [storeBuffSkills.skills, mainWeaponType, getVisibleMasterySkills])

	// スキルのオン/オフ切り替え
	const handleSkillToggle = (skillId: string, enabled: boolean) => {
		if (!isInitialized || !localInitialized) return

		const updatedSkills = storeBuffSkills.skills.map((skill) =>
			skill.id === skillId ? { ...skill, isEnabled: enabled } : skill,
		)
		updateBuffSkills({ skills: updatedSkills })
	}

	// スキルパラメータの更新
	const handleParameterChange = (
		skillId: string,
		paramName: string,
		value: number,
	) => {
		if (!isInitialized || !localInitialized) return

		const updatedSkills = storeBuffSkills.skills.map((skill) =>
			skill.id === skillId
				? {
						...skill,
						parameters: { ...skill.parameters, [paramName]: value },
					}
				: skill,
		)
		updateBuffSkills({ skills: updatedSkills })
	}

	// パラメータの範囲制限を取得
	const getParameterRange = (paramName: string) => {
		switch (paramName) {
			case 'skillLevel':
				return { min: 1, max: 10 }
			case 'stackCount':
				return { min: 1, max: 10 }
			case 'playerCount':
				return { min: 0, max: 4 }
			case 'refinement':
				return { min: 1, max: 15 }
			case 'spUsed':
				return { min: 25, max: 80 }
			case 'isCaster':
				return { min: 0, max: 1 }
			default:
				return { min: 0, max: 100 }
		}
	}

	// パラメータの表示名を取得
	const getParameterLabel = (paramName: string) => {
		switch (paramName) {
			case 'skillLevel':
				return 'スキルレベル'
			case 'stackCount':
				return '重ねがけ数'
			case 'playerCount':
				return 'プレイヤー数'
			case 'refinement':
				return '精錬値'
			case 'spUsed':
				return '使用SP'
			case 'isCaster':
				return '使用者か？'
			default:
				return paramName
		}
	}

	return (
		<div className="space-y-4">
			<h2 className="text-xl font-bold text-gray-800">バフスキル設定</h2>

			<div className="space-y-6">
				{Object.entries(skillsByCategory).map(([category, skills]) => (
					<SkillCategorySection
						key={category}
						category={category as BuffSkillCategory}
						skills={skills}
						onSkillToggle={handleSkillToggle}
						onParameterChange={handleParameterChange}
						getParameterRange={getParameterRange}
						getParameterLabel={getParameterLabel}
					/>
				))}
			</div>
		</div>
	)
}

interface SkillCategorySectionProps {
	category: BuffSkillCategory
	skills: BuffSkill[]
	onSkillToggle: (skillId: string, enabled: boolean) => void
	onParameterChange: (
		skillId: string,
		paramName: string,
		value: number,
	) => void
	getParameterRange: (paramName: string) => { min: number; max: number }
	getParameterLabel: (paramName: string) => string
}

function SkillCategorySection({
	category,
	skills,
	onSkillToggle,
	onParameterChange,
	getParameterRange,
	getParameterLabel,
}: SkillCategorySectionProps) {
	const [isExpanded, setIsExpanded] = useState(true)

	return (
		<div className="border border-gray-200 rounded-lg p-4">
			<button
				type="button"
				onClick={() => setIsExpanded(!isExpanded)}
				className="flex items-center justify-between w-full text-left"
			>
				<h3 className="text-lg font-semibold text-gray-700">
					{categoryNameMap[category]}
				</h3>
				<span className="text-gray-500">
					{isExpanded ? '▼' : '▶'}
				</span>
			</button>

			{isExpanded && (
				<div className="mt-4 space-y-3">
					{skills.map((skill) => (
						<SkillItem
							key={skill.id}
							skill={skill}
							onToggle={onSkillToggle}
							onParameterChange={onParameterChange}
							getParameterRange={getParameterRange}
							getParameterLabel={getParameterLabel}
						/>
					))}
				</div>
			)}
		</div>
	)
}

interface SkillItemProps {
	skill: BuffSkill
	onToggle: (skillId: string, enabled: boolean) => void
	onParameterChange: (
		skillId: string,
		paramName: string,
		value: number,
	) => void
	getParameterRange: (paramName: string) => { min: number; max: number }
	getParameterLabel: (paramName: string) => string
}

function SkillItem({
	skill,
	onToggle,
	onParameterChange,
	getParameterRange,
	getParameterLabel,
}: SkillItemProps) {
	return (
		<div className="bg-gray-50 p-3 rounded-md">
			<div className="flex items-center justify-between mb-2">
				<label className="flex items-center space-x-2">
					<input
						type="checkbox"
						checked={skill.isEnabled}
						onChange={(e) => onToggle(skill.id, e.target.checked)}
						className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
					/>
					<span className="font-medium text-gray-700">
						{skill.name}
					</span>
				</label>
			</div>

			{skill.isEnabled &&
				Object.keys(skill.parameters).length > 0 && (
					<div className="grid grid-cols-2 gap-3">
						{Object.entries(skill.parameters).map(
							([paramName, value]) => (
								<div key={paramName} className="space-y-1">
									<label className="block text-sm font-medium text-gray-600">
										{getParameterLabel(paramName)}
									</label>
									<input
										type="number"
										value={value ?? 0}
										onChange={(e) =>
											onParameterChange(
												skill.id,
												paramName,
												Number(e.target.value),
											)
										}
										{...getParameterRange(paramName)}
										className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
								</div>
							),
						)}
					</div>
				)}
		</div>
	)
}