import { z } from 'zod'

// 料理タイプのバリデーション
export const foodTypeSchema = z.enum([
	'none',
	'okaka_onigiri',
	'sake_onigiri',
	'umeboshi_onigiri',
	'mentaiko_onigiri',
	'tuna_mayo_onigiri',
	'shoyu_ramen',
	'zokusei_pasta',
	'takoyaki',
	'yakisoba',
	'golden_fried_rice',
	'ankake_fried_rice',
	'margherita_pizza',
	'diabola_pizza',
	'seafood_pizza',
	'beef_stew',
	'white_stew',
	'beef_burger',
	'fish_burger',
])

// 料理スロットのバリデーション
export const foodSlotSchema = z
	.object({
		selectedFood: foodTypeSchema,
		level: z
			.number()
			.min(0, 'レベルは0以上である必要があります')
			.max(10, 'レベルは10以下である必要があります'),
	})
	.refine(
		(data) => {
			// 「なし」が選択されている場合はレベルは0でなければならない
			if (data.selectedFood === 'none' && data.level !== 0) {
				return false
			}
			// 「なし」以外が選択されている場合はレベルは1-10でなければならない
			if (data.selectedFood !== 'none' && (data.level < 1 || data.level > 10)) {
				return false
			}
			return true
		},
		{
			message: 'レベルが料理選択と矛盾しています',
		},
	)

// 料理フォーム全体のバリデーション
export const foodFormSchema = z.object({
	slot1: foodSlotSchema,
	slot2: foodSlotSchema,
	slot3: foodSlotSchema,
	slot4: foodSlotSchema,
	slot5: foodSlotSchema,
})

// 型推論
export type FoodFormData = z.infer<typeof foodFormSchema>
export type FoodSlotData = z.infer<typeof foodSlotSchema>
export type FoodType = z.infer<typeof foodTypeSchema>
