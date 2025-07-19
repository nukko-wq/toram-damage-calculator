// お気に入り機能の型定義

export interface EquipmentFavorite {
	equipmentId: string
	isFavorite: boolean
	addedAt: string // ISO string
}

export interface FavoritesData {
	equipments: Record<string, EquipmentFavorite>
	lastUpdated: string
}