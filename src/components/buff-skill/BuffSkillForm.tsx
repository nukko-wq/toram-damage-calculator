'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm, type Control, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
	getAvailableSkills,
	sortSkills,
	groupSkillsByCategory,
	mergeSkillStates,
} from '@/utils/buffSkillUtils'
import { useCalculatorData } from '@/hooks/useCalculatorData'
import type {
	BuffSkillFormData,
	BuffSkillDefinition,
	BuffSkillCategory,
	MainWeaponType,
	SubWeaponType,
} from '@/types/buffSkill'
import type { WeaponType, SubWeaponType as CalculatorSubWeaponType } from '@/types/calculator'
import { CATEGORY_LABELS, CATEGORY_ORDER_RANGES } from '@/types/buffSkill'
import { buffSkillSchema } from '@/schemas/buffSkillSchema'

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

	// カテゴリ別スキルマップ（ソート済み）
	const skillsByCategory = useMemo(() => {
		return groupSkillsByCategory(availableSkills)
	}, [availableSkills])

	// 初期フォーム値を生成（武器に応じて）
	const initialFormValues = useMemo(() => {
		const currentStates = data.buffSkills?.skills ? 
			convertLegacyToNewFormat(data.buffSkills) : 
			{}
		const mergedStates = mergeSkillStates(currentStates, availableSkills)
		return { skills: mergedStates }
	}, [data.buffSkills, availableSkills])

	const { control, watch, reset } = useForm<BuffSkillFormData>({
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

	// カテゴリを順序番号順で表示
	const sortedCategories = Array.from(skillsByCategory.keys()).sort(
		(a, b) => CATEGORY_ORDER_RANGES[a] - CATEGORY_ORDER_RANGES[b]
	)

	return (
		<div className="space-y-4 md:col-start-1 md:col-end-9 md:row-start-5 md:row-end-6 xl:col-start-1 xl:col-end-4 xl:row-start-4 xl:row-end-5 bg-white p-4 rounded-lg shadow-md">
			<div className="mb-6">
				<h2 className="text-xl font-bold text-gray-900 mb-2">バフスキル</h2>
				<p className="text-sm text-gray-600">
					利用可能スキル数: {availableSkills.length}
				</p>
			</div>

			<form className="space-y-6">
				{sortedCategories.map(category => (
					<BuffSkillSection
						key={category}
						category={category}
						skills={skillsByCategory.get(category) || []}
						control={control}
						watch={watch}
					/>
				))}
			</form>
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

// スキルセクションコンポーネント
interface BuffSkillSectionProps {
	category: BuffSkillCategory
	skills: BuffSkillDefinition[]
	control: Control<BuffSkillFormData>
	watch: () => BuffSkillFormData
}

function BuffSkillSection({
	category,
	skills,
	control,
	watch,
}: BuffSkillSectionProps) {
	const [isOpen, setIsOpen] = useState(false)

	if (skills.length === 0) return null

	const formValues = watch()
	const enabledCount = skills.filter(skill => {
		const skillState = formValues?.skills?.[skill.id]
		return skillState?.isEnabled
	}).length

	return (
		<div className="border border-gray-200 rounded-lg overflow-hidden">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="w-full p-4 text-left flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
			>
				<div className="flex items-center space-x-3">
					<h3 className="text-lg font-medium text-gray-900">
						{CATEGORY_LABELS[category]}
					</h3>
					<span className="text-sm text-gray-500">
						({enabledCount}/{skills.length})
					</span>
				</div>
				<svg
					className={`w-5 h-5 text-gray-500 transition-transform ${
						isOpen ? 'rotate-180' : ''
					}`}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
				</svg>
			</button>

			{isOpen && (
				<div className="p-4 border-t border-gray-200 bg-white">
					<div className="space-y-3">
						{skills.map(skill => (
							<BuffSkillControl key={skill.id} skill={skill} control={control} watch={watch} />
						))}
					</div>
				</div>
			)}
		</div>
	)
}

// 個別スキル制御コンポーネント
interface BuffSkillControlProps {
	skill: BuffSkillDefinition
	control: Control<BuffSkillFormData>
	watch: (name?: string) => unknown
}

function BuffSkillControl({ skill, control, watch }: BuffSkillControlProps) {
	return (
		<div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
			<div className="flex items-center space-x-3">
				<Controller
					name={`skills.${skill.id}.isEnabled`}
					control={control}
					render={({ field }) => (
						<input
							type="checkbox"
							checked={field.value || false}
							onChange={field.onChange}
							className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
						/>
					)}
				/>
				<div className="flex flex-col">
					<span className="text-sm font-medium text-gray-900">
						{skill.name}
					</span>
					{skill.description && (
						<span className="text-xs text-gray-500">{skill.description}</span>
					)}
				</div>
			</div>

			<div className="flex items-center space-x-2">
				{skill.type === 'level' && (
					<Controller
						name={`skills.${skill.id}.level`}
						control={control}
						render={({ field }) => (
							<div className="flex items-center space-x-1">
								<span className="text-xs text-gray-500">Lv:</span>
								<input
									type="number"
									min={1}
									max={skill.maxLevel || 10}
									value={field.value || 1}
									onChange={e => field.onChange(Number(e.target.value))}
									className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
									disabled={!watch(`skills.${skill.id}.isEnabled`)}
								/>
							</div>
						)}
					/>
				)}

				{skill.type === 'stack' && (
					<Controller
						name={`skills.${skill.id}.stackCount`}
						control={control}
						render={({ field }) => (
							<div className="flex items-center space-x-1">
								<span className="text-xs text-gray-500">×</span>
								<select
									value={field.value || 1}
									onChange={e => field.onChange(Number(e.target.value))}
									className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
									disabled={!watch(`skills.${skill.id}.isEnabled`)}
								>
									{Array.from(
										{ length: skill.maxStack || 10 },
										(_, i) => i + 1
									).map(num => (
										<option key={num} value={num}>
											{num}
										</option>
									))}
								</select>
							</div>
						)}
					/>
				)}

				{skill.type === 'special' && (
					<Controller
						name={`skills.${skill.id}.specialParam`}
						control={control}
						render={({ field }) => (
							<div className="flex items-center space-x-1">
								<input
									type="number"
									min={0}
									value={field.value || 0}
									onChange={e => field.onChange(Number(e.target.value))}
									className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
									disabled={!watch(`skills.${skill.id}.isEnabled`)}
									placeholder="値"
								/>
							</div>
						)}
					/>
				)}
			</div>
		</div>
	)
}