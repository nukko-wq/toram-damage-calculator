/**
 * バフスキル計算の共通型定義
 */

import type { MainWeaponType } from '@/types/buffSkill'
import type {
	EquipmentProperties,
	WeaponType,
} from '@/types/calculator'
import type { AllBonuses } from '../basicStatsCalculation'

/**
 * WeaponType（日本語）からMainWeaponType（英語）への変換関数
 */
export function convertWeaponType(
	weaponType: WeaponType | null,
): MainWeaponType | null {
	if (!weaponType) return null

	const conversionMap: Record<WeaponType, MainWeaponType> = {
		片手剣: 'oneHandSword',
		双剣: 'dualSword',
		両手剣: 'twoHandSword',
		手甲: 'knuckle',
		旋風槍: 'halberd',
		抜刀剣: 'katana',
		弓: 'bow',
		自動弓: 'bowgun',
		杖: 'staff',
		魔導具: 'magicDevice',
		素手: 'bareHands',
	}

	return conversionMap[weaponType] || null
}

/**
 * 共通の効果統合関数
 * EquipmentPropertiesをAllBonusesに変換して統合
 */
export function integrateEffects(
	effects: Partial<EquipmentProperties>,
	bonuses: Partial<AllBonuses>,
): void {
	for (const [key, value] of Object.entries(effects)) {
		if (typeof value === 'number' && value !== 0) {
			bonuses[key as keyof AllBonuses] =
				(bonuses[key as keyof AllBonuses] || 0) + value
		}
	}
}