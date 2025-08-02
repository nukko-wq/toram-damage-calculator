// Floating Menu の設定を管理するユーティリティ

import type { MenuSection } from '@/components/floating-menu/hooks/useFloatingMenu'
import { STORAGE_KEYS, StorageHelper } from './storage'

// FloatingMenu設定の型定義
export interface FloatingMenuSettings {
	lastActiveSection: MenuSection
	updatedAt: string
}

// デフォルト設定
const defaultSettings: FloatingMenuSettings = {
	lastActiveSection: 'top',
	updatedAt: new Date().toISOString(),
}

/**
 * FloatingMenuの設定を取得
 */
export function getFloatingMenuSettings(): FloatingMenuSettings {
	return StorageHelper.get(STORAGE_KEYS.FLOATING_MENU_SETTINGS, defaultSettings)
}

/**
 * FloatingMenuの設定を保存
 */
export function saveFloatingMenuSettings(
	settings: Partial<FloatingMenuSettings>,
): boolean {
	const currentSettings = getFloatingMenuSettings()
	const newSettings: FloatingMenuSettings = {
		...currentSettings,
		...settings,
		updatedAt: new Date().toISOString(),
	}

	return StorageHelper.set(STORAGE_KEYS.FLOATING_MENU_SETTINGS, newSettings)
}

/**
 * 最後に選択されたセクションを取得
 */
export function getLastActiveSection(): MenuSection {
	const settings = getFloatingMenuSettings()
	return settings.lastActiveSection
}

/**
 * 最後に選択されたセクションを保存
 */
export function saveLastActiveSection(section: MenuSection): boolean {
	return saveFloatingMenuSettings({ lastActiveSection: section })
}

/**
 * FloatingMenu設定をリセット
 */
export function resetFloatingMenuSettings(): boolean {
	return StorageHelper.set(STORAGE_KEYS.FLOATING_MENU_SETTINGS, defaultSettings)
}
