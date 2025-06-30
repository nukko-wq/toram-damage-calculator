'use client'

import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
	getAvailableSkills,
	sortSkills,
	mergeSkillStates,
} from '@/utils/buffSkillUtils'
import type { BuffSkillDefinition } from '@/types/buffSkill'
import { useCalculatorData } from '@/hooks/useCalculatorData'
import type {
	BuffSkillFormData,
	MainWeaponType,
	SubWeaponType,
} from '@/types/buffSkill'
import type { WeaponType, SubWeaponType as CalculatorSubWeaponType } from '@/types/calculator'
import { buffSkillSchema } from '@/schemas/buffSkillSchema'
import SkillCard from './SkillCard'

// 武器種変換関数
function convertWeaponType(weaponType: WeaponType): MainWeaponType | null {
	const weaponMap: Record<WeaponType, MainWeaponType> = {
		'片手剣': 'oneHandSword',
		'双剣': 'dualSword',
		'両手剣': 'twoHandSword',
		'手甲': 'knuckle',
		'旋風槍': 'halberd',
		'抜刀剣': 'katana',
		'弓': 'bow',
		'自動弓': 'bowgun',
		'杖': 'staff',
		'魔導具': 'magicDevice',
		'素手': 'bareHands',
	}
	return weaponMap[weaponType] || null
}

function convertSubWeaponType(subWeaponType: CalculatorSubWeaponType): SubWeaponType | null {
	const subWeaponMap: Record<CalculatorSubWeaponType, SubWeaponType> = {
		'なし': 'none',
		'ナイフ': 'knife',
		'矢': 'arrow',
		'盾': 'shield',
		'手甲': 'knuckle',
		'魔道具': 'magicDevice',
		'巻物': 'scroll',
		'片手剣': 'knife', // 片手剣サブ武器はknife扱い
		'抜刀剣': 'knife', // 抜刀剣サブ武器もknife扱いに修正
	}
	return subWeaponMap[subWeaponType] || null
}

// 新しいBuffSkillFormデータを旧形式に変換
function convertToLegacyFormat(
	newData: BuffSkillFormData, 
	availableSkills: BuffSkillDefinition[]
): import('@/types/calculator').BuffSkillFormData {
	const skills: import('@/types/calculator').BuffSkill[] = []
	
	// 有効なスキルのみを配列形式に変換
	for (const [skillId, state] of Object.entries(newData.skills)) {
		if (state.isEnabled) {
			const skillDef = availableSkills.find(s => s.id === skillId)
			if (skillDef) {
				skills.push({
					id: skillId,
					name: skillDef.name,
					category: skillDef.category,
					isEnabled: true,
					parameters: {
						skillLevel: state.level || 1,
						stackCount: state.stackCount || 1,
						playerCount: state.specialParam || 0,
					}
				})
			}
		}
	}
	
	return { skills }
}

// バフスキルフォームコンポーネント
export default function BuffSkillForm() {
	// データと更新関数を取得
	const { data, updateBuffSkills } = useCalculatorData()
	
	// 武器種を BuffSkill システム用の型に変換
	const mainWeapon = convertWeaponType(data.mainWeapon.weaponType)
	const subWeapon = convertSubWeaponType(data.subWeapon.weaponType)
	
	// 武器に応じたスキルを取得してソート
	const availableSkills = useMemo(() => {
		const skills = getAvailableSkills(mainWeapon, subWeapon)
		return sortSkills(skills)
	}, [mainWeapon, subWeapon])


	// 初期フォーム値を生成（武器に応じて）
	const initialFormValues = useMemo(() => {
		const currentStates = data.buffSkills?.skills ? 
			convertLegacyToNewFormat(data.buffSkills) : 
			{}
		const mergedStates = mergeSkillStates(currentStates, availableSkills)
		return { skills: mergedStates }
	}, [data.buffSkills, availableSkills])

	const { control, watch, reset, setValue } = useForm<BuffSkillFormData>({
		resolver: zodResolver(buffSkillSchema),
		defaultValues: initialFormValues,
	})

	// 武器変更時にフォームをリセット
	useEffect(() => {
		reset(initialFormValues)
	}, [reset, initialFormValues])

	// フォーム値の変更をストアに反映（debounce付き）
	const formData = watch()
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			const legacyData = convertToLegacyFormat(formData, availableSkills)
			updateBuffSkills(legacyData)
		}, 200) // 200ms debounce
		
		return () => clearTimeout(timeoutId)
	}, [formData, availableSkills, updateBuffSkills])


	return (
		<div className="space-y-4 md:col-start-1 md:col-end-9 md:row-start-5 md:row-end-6 xl:col-start-1 xl:col-end-4 xl:row-start-4 xl:row-end-5 bg-white p-4 rounded-lg shadow-md">
			<div className="mb-6">
				<h2 className="text-xl font-bold text-gray-900 mb-2">バフスキル</h2>
				<p className="text-sm text-gray-600">
					利用可能スキル数: {availableSkills.length}
				</p>
			</div>

			<div className="grid grid-cols-2 gap-4 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3">
				{availableSkills.map(skill => (
					<SkillCard 
						key={skill.id} 
						skill={skill} 
						control={control} 
						watch={watch} 
						setValue={setValue}
					/>
				))}
			</div>
		</div>
	)
}

// 旧形式から新形式への変換
function convertLegacyToNewFormat(legacyData: import('@/types/calculator').BuffSkillFormData): Record<string, import('@/types/buffSkill').BuffSkillState> {
	const newFormat: Record<string, import('@/types/buffSkill').BuffSkillState> = {}
	
	for (const skill of legacyData.skills) {
		newFormat[skill.id] = {
			isEnabled: skill.isEnabled,
			level: skill.parameters.skillLevel,
			stackCount: skill.parameters.stackCount,
			specialParam: skill.parameters.playerCount,
		}
	}
	
	return newFormat
}