// 敵情報バリデーションスキーマ

import { z } from 'zod'

// 敵基本ステータス用スキーマ
export const enemyStatsSchema = z.object({
	DEF: z
		.number()
		.min(0, 'DEFは0以上である必要があります')
		.max(9999, 'DEFは9999以下である必要があります'),
	MDEF: z
		.number()
		.min(0, 'MDEFは0以上である必要があります')
		.max(9999, 'MDEFは9999以下である必要があります'),
	physicalResistance: z
		.number()
		.min(-100, '物理耐性は-100以上である必要があります')
		.max(100, '物理耐性は100以下である必要があります'),
	magicalResistance: z
		.number()
		.min(-100, '魔法耐性は-100以上である必要があります')
		.max(100, '魔法耐性は100以下である必要があります'),
	resistCritical: z
		.number()
		.min(0, 'クリティカル耐性は0以上である必要があります')
		.max(999, 'クリティカル耐性は999以下である必要があります'),
	requiredHIT: z
		.number()
		.min(0, '必要HITは0以上である必要があります')
		.max(9999, '必要HITは9999以下である必要があります'),
})

// プリセット敵情報用スキーマ
export const presetEnemySchema = z.object({
	id: z.string().min(1, 'IDは必須です'),
	name: z.string().min(1, '敵名は必須です'),
	level: z
		.number()
		.min(1, 'レベルは1以上である必要があります')
		.max(999, 'レベルは999以下である必要があります'),
	stats: enemyStatsSchema,
	category: z.enum(['mob', 'fieldBoss', 'boss', 'raidBoss'], {
		errorMap: () => ({ message: '有効なカテゴリを選択してください' }),
	}),
})

// ユーザーカスタム敵情報用スキーマ
export const userEnemySchema = presetEnemySchema.extend({
	createdAt: z.string(),
	updatedAt: z.string(),
	isFavorite: z.boolean(),
})

// 敵フォームデータ用スキーマ
export const enemyFormDataSchema = z.object({
	selectedId: z.string().nullable(),
	type: z.enum(['preset', 'custom']).nullable(),
	manualOverrides: z
		.object({
			resistCritical: z
				.number()
				.min(0, 'クリティカル耐性は0以上である必要があります')
				.max(999, 'クリティカル耐性は999以下である必要があります')
				.optional(),
			requiredHIT: z
				.number()
				.min(0, '必要HITは0以上である必要があります')
				.max(9999, '必要HITは9999以下である必要があります')
				.optional(),
		})
		.optional(),
})

// 敵情報検索用スキーマ
export const enemySearchSchema = z.object({
	query: z.string().optional(),
	category: z.enum(['mob', 'fieldBoss', 'boss', 'raidBoss']).optional(),
	minLevel: z.number().min(1).max(999).optional(),
	maxLevel: z.number().min(1).max(999).optional(),
})

// 型エクスポート
export type EnemyStatsFormData = z.infer<typeof enemyStatsSchema>
export type PresetEnemyFormData = z.infer<typeof presetEnemySchema>
export type UserEnemyFormData = z.infer<typeof userEnemySchema>
export type EnemyFormData = z.infer<typeof enemyFormDataSchema>
export type EnemySearchFormData = z.infer<typeof enemySearchSchema>
