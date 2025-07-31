// クリスタお気に入り管理ユーティリティ

import type { CrystalFavoritesData, CrystalFavorite } from '@/types/favorites'
import type { Crystal, CrystalType } from '@/types/calculator'
import { STORAGE_KEYS, StorageHelper } from './storage'

export class CrystalFavoritesManager {
	private static readonly STORAGE_KEY = STORAGE_KEYS.CRYSTAL_FAVORITES

	/**
	 * クリスタお気に入りデータを取得
	 */
	static getFavorites(): CrystalFavoritesData {
		return StorageHelper.get(CrystalFavoritesManager.STORAGE_KEY, {
			crystals: {},
			lastUpdated: new Date().toISOString(),
		})
	}

	/**
	 * クリスタのお気に入り状態を取得
	 */
	static isFavorite(crystalId: string): boolean {
		const favorites = CrystalFavoritesManager.getFavorites()
		return favorites.crystals[crystalId]?.isFavorite ?? false
	}

	/**
	 * クリスタのお気に入り状態を設定
	 */
	static setFavorite(crystalId: string, isFavorite: boolean): boolean {
		const favorites = CrystalFavoritesManager.getFavorites()

		if (isFavorite) {
			favorites.crystals[crystalId] = {
				crystalId,
				isFavorite: true,
				addedAt: new Date().toISOString(),
			}
		} else {
			delete favorites.crystals[crystalId]
		}

		favorites.lastUpdated = new Date().toISOString()
		return StorageHelper.set(CrystalFavoritesManager.STORAGE_KEY, favorites)
	}

	/**
	 * クリスタのお気に入り状態をトグル
	 */
	static toggleFavorite(crystalId: string): boolean {
		const currentState = CrystalFavoritesManager.isFavorite(crystalId)
		return CrystalFavoritesManager.setFavorite(crystalId, !currentState)
	}

	/**
	 * お気に入りクリスタIDリストを取得（新しく追加された順）
	 */
	static getFavoriteCrystalIds(): string[] {
		const favorites = CrystalFavoritesManager.getFavorites()
		return Object.keys(favorites.crystals)
			.filter((id) => favorites.crystals[id].isFavorite)
			.sort((a, b) => {
				const aTime = new Date(favorites.crystals[a].addedAt).getTime()
				const bTime = new Date(favorites.crystals[b].addedAt).getTime()
				return bTime - aTime // 新しく追加された順
			})
	}

	/**
	 * お気に入りクリスタデータをクリア
	 */
	static clearFavorites(): boolean {
		return StorageHelper.set(CrystalFavoritesManager.STORAGE_KEY, {
			crystals: {},
			lastUpdated: new Date().toISOString(),
		})
	}

	/**
	 * お気に入りクリスタ件数を取得
	 */
	static getFavoriteCount(): number {
		const favorites = CrystalFavoritesManager.getFavorites()
		return Object.keys(favorites.crystals).filter(
			(id) => favorites.crystals[id].isFavorite,
		).length
	}

	/**
	 * 特定タイプのお気に入りクリスタ件数を取得
	 */
	static getFavoriteCountByType(
		crystals: Crystal[],
		type: CrystalType | 'all',
	): number {
		const favoriteIds = CrystalFavoritesManager.getFavoriteCrystalIds()
		const favoriteSet = new Set(favoriteIds)

		return crystals.filter((crystal) => {
			if (!favoriteSet.has(crystal.id)) return false
			if (type === 'all') return true
			return crystal.type === type
		}).length
	}

	/**
	 * 特定のクリスタがお気に入りに追加された日時を取得
	 */
	static getFavoriteAddedAt(crystalId: string): Date | null {
		const favorites = CrystalFavoritesManager.getFavorites()
		const favorite = favorites.crystals[crystalId]
		if (favorite?.isFavorite) {
			return new Date(favorite.addedAt)
		}
		return null
	}
}
