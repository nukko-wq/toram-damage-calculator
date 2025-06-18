import { z } from 'zod'

// バフスキルカテゴリのスキーマ
export const buffSkillCategorySchema = z.enum([
	'mastery',
	'blade',
	'shoot',
	'halberd',
	'mononofu',
	'dualSword',
	'sprite',
	'darkPower',
	'shield',
	'knight',
	'hunter',
	'assassin',
	'ninja',
	'support',
	'survival',
	'battle',
	'pet',
	'minstrel',
	'partisan',
])

// バフスキルパラメータのスキーマ
export const buffSkillParametersSchema = z.object({
	skillLevel: z.number().min(1).max(10).optional(),
	stackCount: z.number().min(1).max(10).optional(),
	playerCount: z.number().min(0).max(4).optional(),
	refinement: z.number().min(1).max(15).optional(),
	spUsed: z.number().min(25).max(80).optional(),
	isCaster: z.number().min(0).max(1).optional(),
})

// バフスキルのスキーマ
export const buffSkillSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	category: buffSkillCategorySchema,
	isEnabled: z.boolean(),
	parameters: buffSkillParametersSchema,
})

// バフスキルフォームデータのスキーマ
export const buffSkillFormDataSchema = z.object({
	skills: z.array(buffSkillSchema),
})

// 個別スキルパラメータ更新のスキーマ
export const buffSkillParameterUpdateSchema = z.object({
	skillId: z.string().min(1),
	parameterName: z.enum([
		'skillLevel',
		'stackCount',
		'playerCount',
		'refinement',
		'spUsed',
		'isCaster',
	]),
	value: z.number(),
})

// バフスキル有効/無効切り替えのスキーマ
export const buffSkillToggleSchema = z.object({
	skillId: z.string().min(1),
	isEnabled: z.boolean(),
})