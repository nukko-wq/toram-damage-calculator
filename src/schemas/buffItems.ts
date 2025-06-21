import { z } from 'zod'

// バフアイテムカテゴリのバリデーション
export const buffItemCategorySchema = z.enum([
	'physicalPower',
	'magicalPower',
	'physicalDefense',
	'magicalDefense',
	'elementalAttack',
	'elementalDefense',
	'speed',
	'casting',
	'mp',
	'hp',
	'accuracy',
	'evasion',
])

// バフアイテム選択のバリデーション（nullまたは文字列ID）
export const buffItemSelectionSchema = z.string().nullable()

// バフアイテムフォーム全体のバリデーション
export const buffItemFormDataSchema = z.object({
	physicalPower: buffItemSelectionSchema,
	magicalPower: buffItemSelectionSchema,
	physicalDefense: buffItemSelectionSchema,
	magicalDefense: buffItemSelectionSchema,
	elementalAttack: buffItemSelectionSchema,
	elementalDefense: buffItemSelectionSchema,
	speed: buffItemSelectionSchema,
	casting: buffItemSelectionSchema,
	mp: buffItemSelectionSchema,
	hp: buffItemSelectionSchema,
	accuracy: buffItemSelectionSchema,
	evasion: buffItemSelectionSchema,
})

// 型推論
export type BuffItemFormData = z.infer<typeof buffItemFormDataSchema>
export type BuffItemCategory = z.infer<typeof buffItemCategorySchema>
export type BuffItemSelection = z.infer<typeof buffItemSelectionSchema>
