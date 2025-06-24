import type { WeaponType } from '@/types/calculator'

/**
 * 日本語の武器種から英語キーへのマッピング
 */
export const WEAPON_TYPE_MAPPING: Record<WeaponType, string> = {
	旋風槍: 'halberd',
	片手剣: '1hsword',
	両手剣: '2hsword',
	弓: 'bow',
	自動弓: 'bowgun',
	杖: 'staff',
	魔導具: 'magic-device',
	手甲: 'knuckle',
	抜刀剣: 'katana',
	双剣: 'dual-sword',
	素手: 'barehand',
}

/**
 * 日本語の武器種を英語キーに変換
 */
export function getWeaponTypeKey(weaponType: WeaponType): string {
	return WEAPON_TYPE_MAPPING[weaponType] || 'halberd'
}

/**
 * 英語キーから日本語の武器種に変換（逆変換）
 */
export function getWeaponTypeFromKey(key: string): WeaponType {
	for (const [jpType, engKey] of Object.entries(WEAPON_TYPE_MAPPING)) {
		if (engKey === key) {
			return jpType as WeaponType
		}
	}
	return '旋風槍' // デフォルト
}