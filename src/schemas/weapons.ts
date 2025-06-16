import { z } from 'zod'

export const mainWeaponSchema = z.object({
	weaponType: z.string(),
	ATK: z.number().min(0, 'ATKは0以上である必要があります').max(1500, 'ATKは1500以下である必要があります'),
	stability: z.number().min(0, '安定率は0以上である必要があります').max(100, '安定率は100以下である必要があります'),
	refinement: z.number().min(0, '精錬値は0以上である必要があります').max(15, '精錬値は15以下である必要があります'),
})

export const subWeaponSchema = z.object({
	weaponType: z.string(),
	ATK: z.number().min(0, 'ATKは0以上である必要があります').max(1500, 'ATKは1500以下である必要があります'),
	stability: z.number().min(0, '安定率は0以上である必要があります').max(100, '安定率は100以下である必要があります'),
	refinement: z.number().min(0, '精錬値は0以上である必要があります').max(15, '精錬値は15以下である必要があります'),
})

export type MainWeaponFormData = z.infer<typeof mainWeaponSchema>
export type SubWeaponFormData = z.infer<typeof subWeaponSchema>