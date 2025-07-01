// バフスキル関連のユーティリティ関数

import type {
	BuffSkillDefinition,
	BuffSkillState,
	BuffSkillFormData,
	MainWeaponType,
	SubWeaponType,
	WeaponRequirement,
	BuffSkillCategory,
	BuffSkillType,
} from '@/types/buffSkill'
import {
	COMMON_BUFF_SKILLS,
	NEARLY_COMMON_SKILLS,
	WEAPON_SPECIFIC_SKILLS,
	SUB_WEAPON_SKILLS,
} from '@/data/buffSkills'
import { CATEGORY_ORDER_RANGES } from '@/types/buffSkill'

// 武器組み合わせに応じた利用可能スキルを取得
export function getAvailableSkills(
	mainWeapon: MainWeaponType | null,
	subWeapon: SubWeaponType | null
): BuffSkillDefinition[] {
	const skills: BuffSkillDefinition[] = []

	// 1. 共通バフスキル（35個）を追加
	skills.push(...COMMON_BUFF_SKILLS)

	// 2. ほぼ共通スキル（武士弓術）を追加（素手以外）
	if (mainWeapon !== 'bareHands') {
		skills.push(...NEARLY_COMMON_SKILLS)
	}

	// 3. 武器固有スキルを追加
	if (mainWeapon && WEAPON_SPECIFIC_SKILLS[mainWeapon]) {
		const weaponSkills = WEAPON_SPECIFIC_SKILLS[mainWeapon]
		skills.push(...weaponSkills)
	}

	// 4. サブ武器特殊スキルを追加
	if (subWeapon && subWeapon !== 'none') {
		const subWeaponSkills = getSubWeaponSkills(mainWeapon, subWeapon)
		skills.push(...subWeaponSkills)
	}

	// 5. 重複除去（IDベース）と要件チェック
	const uniqueSkills = deduplicateSkills(skills)
	return uniqueSkills.filter(skill =>
		isSkillCompatible(skill, mainWeapon, subWeapon)
	)
}

// サブ武器特殊スキルを取得
function getSubWeaponSkills(
	mainWeapon: MainWeaponType | null,
	subWeapon: SubWeaponType
): BuffSkillDefinition[] {
	const skills: BuffSkillDefinition[] = []

	// 特殊ケース：弓 + 矢（katanaはSubWeaponTypeに含まれていないため除外）
	if (mainWeapon === 'bow' && subWeapon === 'arrow') {
		if (SUB_WEAPON_SKILLS.bowSpecial) {
			skills.push(...SUB_WEAPON_SKILLS.bowSpecial)
		}
		return skills
	}

	// 一般的なサブ武器スキル
	if (SUB_WEAPON_SKILLS[subWeapon]) {
		const candidateSkills = SUB_WEAPON_SKILLS[subWeapon]

		// 武器要件をチェックして適用可能なスキルのみ追加
		for (const skill of candidateSkills) {
			if (isSkillCompatible(skill, mainWeapon, subWeapon)) {
				skills.push(skill)
			}
		}
	}

	return skills
}

// スキルの重複除去（IDベース）
function deduplicateSkills(skills: BuffSkillDefinition[]): BuffSkillDefinition[] {
	const seen = new Set<string>()
	return skills.filter(skill => {
		if (seen.has(skill.id)) {
			return false
		}
		seen.add(skill.id)
		return true
	})
}

// スキルが武器組み合わせと互換性があるかチェック
export function isSkillCompatible(
	skill: BuffSkillDefinition,
	mainWeapon: MainWeaponType | null,
	subWeapon: SubWeaponType | null
): boolean {
	// 要件が指定されていない場合は互換性あり
	if (!skill.requirements || skill.requirements.length === 0) {
		return true
	}

	// いずれかの要件を満たせば互換性あり
	return skill.requirements.some(requirement =>
		checkWeaponRequirement(requirement, mainWeapon, subWeapon)
	)
}

// 単一の武器要件をチェック
function checkWeaponRequirement(
	requirement: WeaponRequirement,
	mainWeapon: MainWeaponType | null,
	subWeapon: SubWeaponType | null
): boolean {
	// 除外条件をチェック
	if (requirement.exclude) {
		if (
			requirement.exclude.mainWeapon &&
			mainWeapon &&
			requirement.exclude.mainWeapon.includes(mainWeapon)
		) {
			return false
		}
		if (
			requirement.exclude.subWeapon &&
			subWeapon &&
			requirement.exclude.subWeapon.includes(subWeapon)
		) {
			return false
		}
	}

	// メイン武器要件をチェック
	if (requirement.mainWeapon) {
		if (!mainWeapon) return false

		const requiredMainWeapons = Array.isArray(requirement.mainWeapon)
			? requirement.mainWeapon
			: [requirement.mainWeapon]

		if (!requiredMainWeapons.includes(mainWeapon)) {
			return false
		}
	}

	// サブ武器要件をチェック
	if (requirement.subWeapon) {
		if (!subWeapon) return false

		const requiredSubWeapons = Array.isArray(requirement.subWeapon)
			? requirement.subWeapon
			: [requirement.subWeapon]

		if (!requiredSubWeapons.includes(subWeapon)) {
			return false
		}
	}

	return true
}

// スキルを順序番号でソート
export function sortSkills(skills: BuffSkillDefinition[]): BuffSkillDefinition[] {
	return [...skills].sort((a, b) => {
		// 1. カテゴリ順序で比較
		const categoryOrderA = CATEGORY_ORDER_RANGES[a.category]
		const categoryOrderB = CATEGORY_ORDER_RANGES[b.category]

		if (categoryOrderA !== categoryOrderB) {
			return categoryOrderA - categoryOrderB
		}

		// 2. 同カテゴリ内では個別順序番号で比較
		const orderA = getEffectiveOrder(a)
		const orderB = getEffectiveOrder(b)

		return orderA - orderB
	})
}

// カテゴリ内でのスキルソート
export function sortSkillsInCategory(
	skills: BuffSkillDefinition[],
	category: BuffSkillCategory
): BuffSkillDefinition[] {
	return skills
		.filter(skill => skill.category === category)
		.sort((a, b) => {
			const orderA = getEffectiveOrder(a)
			const orderB = getEffectiveOrder(b)
			return orderA - orderB
		})
}

// 効果的な順序番号を取得（categoryOrder優先、なければorder使用）
export function getEffectiveOrder(skill: BuffSkillDefinition): number {
	return skill.categoryOrder ?? skill.order
}

// デフォルトのスキル状態を生成
export function getDefaultSkillStates(
	skills: BuffSkillDefinition[]
): Record<string, BuffSkillState> {
	const states: Record<string, BuffSkillState> = {}

	for (const skill of skills) {
		// セイバーオーラの特別なデフォルト値
		const defaultStackCount = skill.id === 'ds6' ? 100 : 1
		
		states[skill.id] = {
			isEnabled: false,
			level: (skill.type === 'level' || skill.type === 'levelAndStack') ? 10 : undefined,
			stackCount: (skill.type === 'stack' || skill.type === 'levelAndStack') ? defaultStackCount : undefined,
			specialParam: skill.type === 'special' ? 0 : undefined,
		}
	}

	return states
}

// 武器変更時のスキル状態マージ（既存設定を保持）
export function mergeSkillStates(
	currentStates: Record<string, BuffSkillState>,
	newSkills: BuffSkillDefinition[]
): Record<string, BuffSkillState> {
	const newStates = getDefaultSkillStates(newSkills)

	// 既存の設定を保持
	for (const skillId of Object.keys(newStates)) {
		if (currentStates[skillId]) {
			newStates[skillId] = { ...currentStates[skillId] }
		}
	}

	return newStates
}

// スキルをカテゴリ別にグループ化
export function groupSkillsByCategory(
	skills: BuffSkillDefinition[]
): Map<BuffSkillCategory, BuffSkillDefinition[]> {
	const categoryMap = new Map<BuffSkillCategory, BuffSkillDefinition[]>()

	for (const skill of skills) {
		if (!categoryMap.has(skill.category)) {
			categoryMap.set(skill.category, [])
		}
		categoryMap.get(skill.category)!.push(skill)
	}

	// 各カテゴリ内でもソート
	for (const [category, categorySkills] of categoryMap) {
		categoryMap.set(category, sortSkillsInCategory(categorySkills, category))
	}

	return categoryMap
}

// 武器変更時のスキル状態適応
export function adaptSkillsToWeapon(
	currentSkills: BuffSkillFormData,
	availableSkills: BuffSkillDefinition[]
): BuffSkillFormData {
	const newSkillStates = mergeSkillStates(
		currentSkills.skills,
		availableSkills
	)

	return {
		skills: newSkillStates,
	}
}

// スキル効果値の検証
export function validateSkillState(
	skill: BuffSkillDefinition,
	state: BuffSkillState
): boolean {
	if (!state.isEnabled) return true

	// レベル系スキルの検証
	if (skill.type === 'level' && state.level !== undefined) {
		const maxLevel = skill.maxLevel ?? 10
		return state.level >= 1 && state.level <= maxLevel
	}

	// スタック系スキルの検証
	if (skill.type === 'stack' && state.stackCount !== undefined) {
		const maxStack = skill.maxStack ?? 10
		return state.stackCount >= 1 && state.stackCount <= maxStack
	}

	return true
}

// 入力補助テキスト関連の関数

// スキルタイプに対応するデフォルト入力補助テキストを取得
export function getDefaultInputHint(skillType: BuffSkillType): string {
	switch (skillType) {
		case 'level':
			return 'スキルレベルを入力してください'
		case 'stack':
			return '重ね掛け回数を選択してください'
		case 'special':
			return '値を入力してください'
		default:
			return ''
	}
}

// カスタム入力補助テキスト（特殊ケースのみ）
const CUSTOM_SKILL_INPUT_HINTS: Record<string, string> = {
	// 特殊パラメータ系で具体的な説明が必要なもののみ
	ogre_slash: '消費鬼力数を入力してください',
	brave: '対象プレイヤー数を入力してください',
	knight_pledge: '精錬値を入力してください',
	eternal_nightmare: '消費MP数を入力してください',
}

// スキルの入力補助テキストを取得（カスタム設定 || デフォルト）
export function getInputHint(skill: BuffSkillDefinition): string {
	// カスタム設定があればそれを使用、なければデフォルト
	return CUSTOM_SKILL_INPUT_HINTS[skill.id] || getDefaultInputHint(skill.type)
}

// モーダル表示判定
export function shouldShowModal(skill: BuffSkillDefinition): boolean {
	// toggleタイプのスキルはモーダル表示しない（ON/OFFのみ）
	if (skill.type === 'toggle') {
		return false
	}
	
	// level, stack, levelAndStack, specialタイプはモーダル表示
	return ['level', 'stack', 'levelAndStack', 'special'].includes(skill.type)
}

// スキル名のクリック可能性を示すCSSクラス名を取得
export function getSkillNameClassName(skill: BuffSkillDefinition): string {
	const baseClass = 'skill-name text-[13px] font-medium text-gray-700 flex-1 mr-2 leading-tight'
	
	if (shouldShowModal(skill)) {
		return `${baseClass} hover:text-blue-600 cursor-pointer`
	}
	
	return baseClass
}