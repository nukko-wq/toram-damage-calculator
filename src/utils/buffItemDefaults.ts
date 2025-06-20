import type { BuffItemFormData } from '@/types/calculator'

// バフアイテムのデフォルトデータを生成
export const getDefaultBuffItems = (): BuffItemFormData => ({
	physicalPower: null,
	magicalPower: null,
	physicalDefense: null,
	magicalDefense: null,
	elementalAttack: null,
	elementalDefense: null,
	speed: null,
	casting: null,
	mp: null,
	hp: null,
	accuracy: null,
	evasion: null,
})

// バフアイテムカテゴリの日本語名マッピング
export const buffItemCategoryNameMap = {
	physicalPower: '物理威力',
	magicalPower: '魔法威力',
	physicalDefense: '物理防御',
	magicalDefense: '魔法防御',
	elementalAttack: '属性攻撃',
	elementalDefense: '属性防御',
	speed: '速度',
	casting: '詠唱',
	mp: 'MP',
	hp: 'HP',
	accuracy: '命中',
	evasion: '回避',
} as const
