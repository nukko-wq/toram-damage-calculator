import { z } from 'zod'
import { isValidWeaponCombination } from '@/utils/weaponCombinations'
import {
	getRefinementDisplayOptions,
	type RefinementDisplay,
} from '@/utils/refinementUtils'
import type { WeaponType, SubWeaponType } from '@/types/calculator'

// 武器タイプのZodスキーマ
export const weaponTypeSchema = z.enum([
	'片手剣',
	'双剣',
	'両手剣',
	'手甲',
	'旋風槍',
	'抜刀剣',
	'弓',
	'自動弓',
	'杖',
	'魔導具',
	'素手',
] as const)

export const subWeaponTypeSchema = z.enum([
	'ナイフ',
	'矢',
	'盾',
	'魔導具',
	'手甲',
	'巻物',
	'片手剣',
	'抜刀剣',
	'なし',
] as const)

// 精錬値のZodスキーマ
export const refinementDisplaySchema = z.enum([
	'未精錬',
	'1',
	'2',
	'3',
	'4',
	'5',
	'6',
	'7',
	'8',
	'9',
	'E',
	'D',
	'C',
	'B',
	'A',
	'S',
] as const)

export const refinementValueSchema = z.number().min(0).max(15)

export const mainWeaponSchema = z.object({
	weaponType: weaponTypeSchema,
	ATK: z
		.number()
		.min(0, 'ATKは0以上である必要があります')
		.max(1500, 'ATKは1500以下である必要があります'),
	stability: z
		.number()
		.min(0, '安定率は0以上である必要があります')
		.max(100, '安定率は100以下である必要があります'),
	refinement: refinementValueSchema,
})

export const subWeaponSchema = z.object({
	weaponType: subWeaponTypeSchema,
	ATK: z
		.number()
		.min(0, 'ATKは0以上である必要があります')
		.max(1500, 'ATKは1500以下である必要があります'),
	stability: z
		.number()
		.min(0, '安定率は0以上である必要があります')
		.max(100, '安定率は100以下である必要があります'),
	refinement: refinementValueSchema,
})

// 武器組み合わせバリデーション
export const weaponCombinationSchema = z
	.object({
		mainWeapon: mainWeaponSchema,
		subWeapon: subWeaponSchema,
	})
	.refine(
		(data) => {
			return isValidWeaponCombination(
				data.mainWeapon.weaponType as WeaponType,
				data.subWeapon.weaponType as SubWeaponType,
			)
		},
		{
			message: '選択されたメイン武器とサブ武器の組み合わせは無効です',
			path: ['subWeapon', 'weaponType'],
		},
	)

// UI表示用フォームスキーマ
export const mainWeaponDisplaySchema = z.object({
	weaponType: weaponTypeSchema,
	ATK: z
		.number()
		.min(0, 'ATKは0以上である必要があります')
		.max(1500, 'ATKは1500以下である必要があります'),
	stability: z
		.number()
		.min(0, '安定率は0以上である必要があります')
		.max(100, '安定率は100以下である必要があります'),
	refinementDisplay: refinementDisplaySchema,
})

export const subWeaponDisplaySchema = z.object({
	weaponType: subWeaponTypeSchema,
	ATK: z
		.number()
		.min(0, 'ATKは0以上である必要があります')
		.max(1500, 'ATKは1500以下である必要があります'),
	stability: z
		.number()
		.min(0, '安定率は0以上である必要があります')
		.max(100, '安定率は100以下である必要があります'),
	refinementDisplay: refinementDisplaySchema,
})

export type MainWeaponFormData = z.infer<typeof mainWeaponSchema>
export type SubWeaponFormData = z.infer<typeof subWeaponSchema>
export type MainWeaponDisplayFormData = z.infer<typeof mainWeaponDisplaySchema>
export type SubWeaponDisplayFormData = z.infer<typeof subWeaponDisplaySchema>
