import { z } from 'zod'

export const baseStatsSchema = z.object({
	STR: z
		.number()
		.min(1, 'STRは1以上である必要があります')
		.max(510, 'STRは510以下である必要があります'),
	INT: z
		.number()
		.min(1, 'INTは1以上である必要があります')
		.max(510, 'INTは510以下である必要があります'),
	VIT: z
		.number()
		.min(1, 'VITは1以上である必要があります')
		.max(510, 'VITは510以下である必要があります'),
	AGI: z
		.number()
		.min(1, 'AGIは1以上である必要があります')
		.max(510, 'AGIは510以下である必要があります'),
	DEX: z
		.number()
		.min(1, 'DEXは1以上である必要があります')
		.max(510, 'DEXは510以下である必要があります'),
	CRT: z
		.number()
		.min(1, 'CRTは1以上である必要があります')
		.max(255, 'CRTは255以下である必要があります'),
	MEN: z
		.number()
		.min(1, 'MENは1以上である必要があります')
		.max(255, 'MENは255以下である必要があります'),
	TEC: z
		.number()
		.min(1, 'TECは1以上である必要があります')
		.max(255, 'TECは255以下である必要があります'),
	LUK: z
		.number()
		.min(1, 'LUKは1以上である必要があります')
		.max(255, 'LUKは255以下である必要があります'),
	level: z
		.number()
		.min(1, 'レベルは1以上である必要があります')
		.max(510, 'レベルは510以下である必要があります'),
})

export type BaseStatsFormData = z.infer<typeof baseStatsSchema>
