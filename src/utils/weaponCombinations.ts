import type { WeaponType, SubWeaponType } from '@/types/calculator'

// 武器組み合わせテーブル
export const WEAPON_COMBINATIONS: Record<WeaponType, SubWeaponType[]> = {
	素手: ['ナイフ', '矢', '盾', '魔導具', '手甲', '巻物', 'なし'],
	片手剣: ['ナイフ', '矢', '盾', '魔導具', '手甲', '巻物', 'なし'],
	双剣: ['片手剣'], // 固定、なし選択不可
	両手剣: ['なし'], // 固定、他選択不可
	手甲: ['ナイフ', '矢', '盾', '魔導具', 'なし'],
	旋風槍: ['ナイフ', '矢', 'なし'],
	抜刀剣: ['ナイフ', '巻物', 'なし'],
	弓: ['矢', '抜刀剣', 'なし'],
	自動弓: ['ナイフ', '矢', '盾', '魔導具', '手甲', 'なし'],
	杖: ['ナイフ', '矢', '盾', '魔導具', '手甲', '巻物', 'なし'],
	魔導具: ['巻物', 'なし'],
}

/**
 * 指定されたメイン武器で選択可能なサブ武器種を取得
 */
export function getAvailableSubWeaponTypes(
	mainWeaponType: WeaponType,
): SubWeaponType[] {
	return WEAPON_COMBINATIONS[mainWeaponType] || ['なし']
}

/**
 * 武器組み合わせが有効かチェック
 */
export function isValidWeaponCombination(
	mainWeaponType: WeaponType,
	subWeaponType: SubWeaponType,
): boolean {
	const availableSubWeapons = getAvailableSubWeaponTypes(mainWeaponType)
	return availableSubWeapons.includes(subWeaponType)
}

/**
 * 無効な組み合わせの場合の自動修正
 */
export function getAutoFixedSubWeapon(
	mainWeaponType: WeaponType,
): SubWeaponType {
	const availableSubWeapons = getAvailableSubWeaponTypes(mainWeaponType)

	// 双剣の場合は片手剣固定
	if (mainWeaponType === '双剣') {
		return '片手剣'
	}

	// 両手剣の場合はなし固定
	if (mainWeaponType === '両手剣') {
		return 'なし'
	}

	// その他の場合は「なし」を選択（「なし」が選択肢にない場合は最初の選択肢）
	return availableSubWeapons.includes('なし') ? 'なし' : availableSubWeapons[0]
}

/**
 * 固定武器の組み合わせかチェック
 */
export function isFixedWeaponCombination(mainWeaponType: WeaponType): boolean {
	return mainWeaponType === '双剣' || mainWeaponType === '両手剣'
}
