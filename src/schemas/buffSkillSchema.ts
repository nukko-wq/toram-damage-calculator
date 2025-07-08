import { z } from 'zod'

// バフスキル状態のスキーマ
export const buffSkillStateSchema = z.object({
	isEnabled: z.boolean(),
	level: z
		.number()
		.min(1, 'レベルは1以上である必要があります')
		.max(100, 'レベルは100以下である必要があります')
		.optional(),
	stackCount: z
		.number()
		.min(1, 'スタック数は1以上である必要があります')
		.max(15, 'スタック数は15以下である必要があります')
		.optional(),
	specialParam: z
		.number()
		.min(0, '特殊パラメータは0以上である必要があります')
		.optional(),
})

// バフスキルフォームデータのスキーマ
export const buffSkillSchema = z.object({
	skills: z.record(z.string(), buffSkillStateSchema),
})

export type BuffSkillSchemaType = z.infer<typeof buffSkillSchema>
