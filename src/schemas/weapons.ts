import { z } from 'zod'
import { isValidWeaponCombination } from '@/utils/weaponCombinations'
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
	'素手'
] as const)

export const subWeaponTypeSchema = z.enum([
	'ナイフ',
	'矢',
	'盾',
	'魔道具',
	'手甲',
	'巻物',
	'片手剣',
	'抜刀剣',
	'なし'
] as const)

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
	refinement: z
		.number()
		.min(0, '精錬値は0以上である必要があります')
		.max(15, '精錬値は15以下である必要があります'),
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
	refinement: z
		.number()
		.min(0, '精錬値は0以上である必要があります')
		.max(15, '精錬値は15以下である必要があります'),
})

// 武器組み合わせバリデーション
export const weaponCombinationSchema = z.object({
	mainWeapon: mainWeaponSchema,
	subWeapon: subWeaponSchema
}).refine((data) => {
	return isValidWeaponCombination(
		data.mainWeapon.weaponType as WeaponType, 
		data.subWeapon.weaponType as SubWeaponType
	)
}, {
	message: "選択されたメイン武器とサブ武器の組み合わせは無効です",
	path: ["subWeapon", "weaponType"]
})

export type MainWeaponFormData = z.infer<typeof mainWeaponSchema>
export type SubWeaponFormData = z.infer<typeof subWeaponSchema>
