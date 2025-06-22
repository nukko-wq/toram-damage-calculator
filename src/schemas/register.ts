import { z } from 'zod'

// レジスタ効果タイプのZodスキーマ
export const registerEffectTypeSchema = z.enum([
	'physicalAttackUp',
	'magicalAttackUp',
	'maxHpUp',
	'maxMpUp',
	'accuracyUp',
	'evasionUp',
	'attackSpeedUp',
	'magicalSpeedUp',
	'fateCompanionship',
	'voidStance',
	'arrowPursuit',
	'airSlideCompress',
	'assassinStabEnhance',
	'resonancePower',
	'resonanceAcceleration',
	'resonanceConcentration',
	'deliciousFoodTrade',
	'freshFruitTrade',
])

// レジスタ効果データのZodスキーマ
export const registerEffectSchema = z.object({
	id: z.string(),
	name: z.string(),
	type: registerEffectTypeSchema,
	isEnabled: z.boolean(),
	level: z.number().min(1),
	maxLevel: z.number().min(1),
	partyMembers: z.number().min(1).max(3).optional(),
})

// レジスタフォームデータのZodスキーマ
export const registerFormDataSchema = z.object({
	effects: z.array(registerEffectSchema),
})

// TypeScript型の推論
export type RegisterEffectTypeSchema = z.infer<typeof registerEffectTypeSchema>
export type RegisterEffectSchema = z.infer<typeof registerEffectSchema>
export type RegisterFormDataSchema = z.infer<typeof registerFormDataSchema>
