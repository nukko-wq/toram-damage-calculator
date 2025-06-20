'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useCalculatorStore } from '@/stores/calculatorStore'
import {
	categoryNameMap,
	getDefaultParametersForSkill,
	weaponTypeToMasterySkills,
} from '@/utils/buffSkillDefaults'
import SkillCard from './SkillCard'
import type { WeaponType } from '@/types/calculator'

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
	}, [storeBuffSkills.skills.length])

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
	}, [
		storeBuffSkills.skills,
		updateBuffSkills,
		isInitialized,
		localInitialized,
	])

	// 武器種変更を検知してマスタリスキルをリセット
	useEffect(() => {
		if (prevWeaponType.current !== mainWeaponType) {
			resetMasterySkillsOnWeaponChange()
			prevWeaponType.current = mainWeaponType
		}
	}, [mainWeaponType, resetMasterySkillsOnWeaponChange])

	// スキルを平坦なリストに変換（マスタリスキルフィルタリング付き）
	const flatSkillsList = useMemo(() => {
		const visibleMasterySkills = getVisibleMasterySkills(mainWeaponType)

		return storeBuffSkills.skills
			.filter((skill) => {
				// マスタリスキルの場合は武器種に応じてフィルタリング
				if (skill.category === 'mastery') {
					if (visibleMasterySkills.length === 0) {
						// 抜刀剣等：マスタリスキル系統全体を非表示
						return false
					}
					if (!visibleMasterySkills.includes(skill.id)) {
						// 該当しないマスタリスキルは非表示
						return false
					}
				}
				return true
			})
			.map((skill) => ({
				...skill,
				categoryLabel: categoryNameMap[skill.category],
			}))
	}, [storeBuffSkills.skills, mainWeaponType, getVisibleMasterySkills])

	// スキルのオン/オフ切り替え
	const handleSkillToggle = (skillId: string, enabled: boolean) => {
		if (!isInitialized || !localInitialized) return

		const updatedSkills = storeBuffSkills.skills.map((skill) =>
			skill.id === skillId ? { ...skill, isEnabled: enabled } : skill,
		)
		updateBuffSkills({ skills: updatedSkills })
	}

	// スキルパラメータの更新（ポップオーバー用）
	const handleParameterChange = (
		skillId: string,
		parameters: import('@/types/calculator').BuffSkillParameters,
	) => {
		if (!isInitialized || !localInitialized) return

		const updatedSkills = storeBuffSkills.skills.map((skill) =>
			skill.id === skillId
				? {
						...skill,
						parameters,
					}
				: skill,
		)
		updateBuffSkills({ skills: updatedSkills })
	}

	return (
		<div className="space-y-4 lg:col-start-1 lg:col-end-4 lg:row-start-4 lg:row-end-5 bg-white p-4 rounded-lg shadow-md">
			<h2 className="text-xl font-bold text-gray-800">バフスキル設定</h2>

			<div className="grid grid-cols-2 gap-4 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3">
				{flatSkillsList.map((skill) => (
					<SkillCard
						key={skill.id}
						skill={skill}
						categoryLabel={skill.categoryLabel}
						onToggle={handleSkillToggle}
						onParameterChange={handleParameterChange}
					/>
				))}
			</div>
		</div>
	)
}
