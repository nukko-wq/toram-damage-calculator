// バフアイテムお気に入り管理ユーティリティ

import type { BuffItemFavoritesData, BuffItemFavorite } from '@/types/favorites'
import type { PresetBuffItem, BuffItemCategory } from '@/types/calculator'
import { STORAGE_KEYS, StorageHelper } from './storage'

export class BuffItemFavoritesManager {
	private static readonly STORAGE_KEY = STORAGE_KEYS.BUFF_ITEM_FAVORITES

	/**
	 * バフアイテムお気に入りデータを取得
	 */
	static getFavorites(): BuffItemFavoritesData {
		return StorageHelper.get(BuffItemFavoritesManager.STORAGE_KEY, {
			buffItems: {},
			lastUpdated: new Date().toISOString(),
		})
	}

	/**
	 * バフアイテムのお気に入り状態を取得
	 */
	static isFavorite(buffItemId: string): boolean {
		const favorites = BuffItemFavoritesManager.getFavorites()
		return favorites.buffItems[buffItemId]?.isFavorite ?? false
	}

	/**
	 * バフアイテムのお気に入り状態を設定
	 */
	static setFavorite(buffItemId: string, isFavorite: boolean): boolean {
		const favorites = BuffItemFavoritesManager.getFavorites()

		if (isFavorite) {
			favorites.buffItems[buffItemId] = {
				buffItemId,
				isFavorite: true,
				addedAt: new Date().toISOString(),
			}
		} else {
			delete favorites.buffItems[buffItemId]
		}

		favorites.lastUpdated = new Date().toISOString()
		return StorageHelper.set(BuffItemFavoritesManager.STORAGE_KEY, favorites)
	}

	/**
	 * バフアイテムのお気に入り状態をトグル
	 */
	static toggleFavorite(buffItemId: string): boolean {
		const currentState = BuffItemFavoritesManager.isFavorite(buffItemId)
		return BuffItemFavoritesManager.setFavorite(buffItemId, !currentState)
	}

	/**
	 * お気に入りバフアイテムIDリストを取得（新しく追加された順）
	 */
	static getFavoriteBuffItemIds(): string[] {
		const favorites = BuffItemFavoritesManager.getFavorites()
		return Object.keys(favorites.buffItems)
			.filter((id) => favorites.buffItems[id].isFavorite)
			.sort((a, b) => {
				const aTime = new Date(favorites.buffItems[a].addedAt).getTime()
				const bTime = new Date(favorites.buffItems[b].addedAt).getTime()
				return bTime - aTime // 新しく追加された順
			})
	}

	/**
	 * お気に入りバフアイテムデータをクリア
	 */
	static clearFavorites(): boolean {
		return StorageHelper.set(BuffItemFavoritesManager.STORAGE_KEY, {
			buffItems: {},
			lastUpdated: new Date().toISOString(),
		})
	}

	/**
	 * お気に入りバフアイテム件数を取得
	 */
	static getFavoriteCount(): number {
		const favorites = BuffItemFavoritesManager.getFavorites()
		return Object.keys(favorites.buffItems).filter(
			(id) => favorites.buffItems[id].isFavorite,
		).length
	}

	/**
	 * 特定カテゴリのお気に入りバフアイテム件数を取得
	 */
	static getFavoriteCountByCategory(
		buffItems: PresetBuffItem[],
		category: BuffItemCategory,
	): number {
		const favoriteIds = BuffItemFavoritesManager.getFavoriteBuffItemIds()
		const favoriteSet = new Set(favoriteIds)

		return buffItems.filter((buffItem) => {
			if (!favoriteSet.has(buffItem.id)) return false
			return buffItem.category === category
		}).length
	}

	/**
	 * 特定のバフアイテムがお気に入りに追加された日時を取得
	 */
	static getFavoriteAddedAt(buffItemId: string): Date | null {
		const favorites = BuffItemFavoritesManager.getFavorites()
		const favorite = favorites.buffItems[buffItemId]
		if (favorite?.isFavorite) {
			return new Date(favorite.addedAt)
		}
		return null
	}
}