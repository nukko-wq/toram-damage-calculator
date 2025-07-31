// 装備品お気に入り管理ユーティリティ

import type { FavoritesData, EquipmentFavorite } from '@/types/favorites'
import { STORAGE_KEYS, StorageHelper } from './storage'

export class EquipmentFavoritesManager {
	private static readonly STORAGE_KEY = STORAGE_KEYS.EQUIPMENT_FAVORITES

	/**
	 * お気に入りデータを取得
	 */
	static getFavorites(): FavoritesData {
		return StorageHelper.get(EquipmentFavoritesManager.STORAGE_KEY, {
			equipments: {},
			lastUpdated: new Date().toISOString(),
		})
	}

	/**
	 * 装備のお気に入り状態を取得
	 */
	static isFavorite(equipmentId: string): boolean {
		const favorites = EquipmentFavoritesManager.getFavorites()
		return favorites.equipments[equipmentId]?.isFavorite ?? false
	}

	/**
	 * 装備のお気に入り状態を設定
	 */
	static setFavorite(equipmentId: string, isFavorite: boolean): boolean {
		const favorites = EquipmentFavoritesManager.getFavorites()

		if (isFavorite) {
			favorites.equipments[equipmentId] = {
				equipmentId,
				isFavorite: true,
				addedAt: new Date().toISOString(),
			}
		} else {
			delete favorites.equipments[equipmentId]
		}

		favorites.lastUpdated = new Date().toISOString()
		return StorageHelper.set(EquipmentFavoritesManager.STORAGE_KEY, favorites)
	}

	/**
	 * 装備のお気に入り状態をトグル
	 */
	static toggleFavorite(equipmentId: string): boolean {
		const currentState = EquipmentFavoritesManager.isFavorite(equipmentId)
		return EquipmentFavoritesManager.setFavorite(equipmentId, !currentState)
	}

	/**
	 * お気に入り装備IDリストを取得（新しく追加された順）
	 */
	static getFavoriteEquipmentIds(): string[] {
		const favorites = EquipmentFavoritesManager.getFavorites()
		return Object.keys(favorites.equipments)
			.filter((id) => favorites.equipments[id].isFavorite)
			.sort((a, b) => {
				const aTime = new Date(favorites.equipments[a].addedAt).getTime()
				const bTime = new Date(favorites.equipments[b].addedAt).getTime()
				return bTime - aTime // 新しく追加された順
			})
	}

	/**
	 * お気に入りデータをクリア
	 */
	static clearFavorites(): boolean {
		return StorageHelper.set(EquipmentFavoritesManager.STORAGE_KEY, {
			equipments: {},
			lastUpdated: new Date().toISOString(),
		})
	}

	/**
	 * お気に入り件数を取得
	 */
	static getFavoriteCount(): number {
		const favorites = EquipmentFavoritesManager.getFavorites()
		return Object.keys(favorites.equipments).filter(
			(id) => favorites.equipments[id].isFavorite,
		).length
	}

	/**
	 * 特定の装備がお気に入りに追加された日時を取得
	 */
	static getFavoriteAddedAt(equipmentId: string): Date | null {
		const favorites = EquipmentFavoritesManager.getFavorites()
		const favorite = favorites.equipments[equipmentId]
		if (favorite?.isFavorite) {
			return new Date(favorite.addedAt)
		}
		return null
	}
}
