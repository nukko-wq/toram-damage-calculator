import type {
	PresetBuffItem,
	BuffItem,
	BuffItemCategory,
} from '@/types/calculator'
import buffItemsData from '@/data/buffItems.json'

// JSONデータからプリセットバフアイテムを取得
export const getPresetBuffItems = (): PresetBuffItem[] => {
	const items: PresetBuffItem[] = []

	// 各カテゴリのアイテムを統合
	Object.entries(buffItemsData.buffItems).forEach(
		([category, categoryItems]) => {
			const typedItems = categoryItems.map((item) => ({
				...item,
				category: item.category as BuffItemCategory,
			}))
			items.push(...typedItems)
		},
	)

	return items
}

// カテゴリ別のバフアイテム取得
export const getBuffItemsByCategory = (
	category: BuffItemCategory,
): PresetBuffItem[] => {
	const items = buffItemsData.buffItems[category] || []
	return items.map((item) => ({
		...item,
		category: item.category as BuffItemCategory,
	}))
}

// IDによるバフアイテム取得
export const getBuffItemById = (id: string): PresetBuffItem | null => {
	const allItems = getPresetBuffItems()
	return allItems.find((item) => item.id === id) || null
}

// 全バフアイテムを統合型として取得（LocalStorageBuffItem形式）
export const getAllBuffItems = (): BuffItem[] => {
	const presetItems = getPresetBuffItems()
	return presetItems.map((item) => ({
		...item,
		isPreset: true,
		isFavorite: false,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	}))
}

// カテゴリ別の統合バフアイテム取得
export const getBuffItemsByCategoryAsBuffItems = (
	category: BuffItemCategory,
): BuffItem[] => {
	const categoryItems = getBuffItemsByCategory(category)
	return categoryItems.map((item) => ({
		...item,
		isPreset: true,
		isFavorite: false,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	}))
}

// バフアイテム名で検索
export const searchBuffItemsByName = (query: string): BuffItem[] => {
	const allItems = getAllBuffItems()
	const lowercaseQuery = query.toLowerCase()

	return allItems.filter((item) =>
		item.name.toLowerCase().includes(lowercaseQuery),
	)
}

// バフアイテムの存在確認
export const buffItemExists = (id: string): boolean => {
	return getBuffItemById(id) !== null
}
