/**
 * バフスキル効果計算ユーティリティ
 *
 * バフスキルの効果値を計算し、装備プロパティ形式で返す
 */

import type { BuffSkillState, MainWeaponType } from '@/types/buffSkill'
import type { EquipmentProperties, WeaponType } from '@/types/calculator'
import type { AllBonuses } from './basicStatsCalculation'

/**
 * WeaponType（日本語）からMainWeaponType（英語）への変換関数
 */
function convertWeaponType(weaponType: WeaponType | null): MainWeaponType | null {
	if (!weaponType) return null
	
	const conversionMap: Record<WeaponType, MainWeaponType> = {
		'片手剣': 'oneHandSword',
		'双剣': 'dualSword',
		'両手剣': 'twoHandSword',
		'手甲': 'knuckle',
		'旋風槍': 'halberd',
		'抜刀剣': 'katana',
		'弓': 'bow',
		'自動弓': 'bowgun',
		'杖': 'staff',
		'魔導具': 'magicDevice',
		'素手': 'bareHands',
	}
	
	return conversionMap[weaponType] || null
}

/**
 * 神速の捌手の効果計算関数
 */
export function calculateGodspeedParryEffects(
	stackCount: number,
	weaponType: MainWeaponType | null,
): Partial<EquipmentProperties> {
	if (stackCount <= 0) return {}

	const isHalberd = weaponType === 'halberd'

	return {
		AttackSpeed: stackCount * (isHalberd ? 400 : 300),
		MotionSpeed_Rate: stackCount * 10,
		MP: stackCount * -100,
		PhysicalResistance_Rate: stackCount * (isHalberd ? -25 : -70),
		MagicalResistance_Rate: stackCount * (isHalberd ? -25 : -70),
		AvoidRecharge_Rate: stackCount * 10,
	}
}

/**
 * バフスキルデータから全体の補正値を取得
 */
export function getBuffSkillBonuses(
	buffSkillData: Record<string, BuffSkillState> | null,
	weaponType: WeaponType | null,
): Partial<AllBonuses> {
	const convertedWeaponType = convertWeaponType(weaponType)
	const bonuses: Partial<AllBonuses> = {}

	if (!buffSkillData) return bonuses

	// 神速の捌手の処理
	const godspeedParry = buffSkillData['godspeed_parry']
	if (godspeedParry?.isEnabled && godspeedParry.stackCount) {
		const effects = calculateGodspeedParryEffects(
			godspeedParry.stackCount,
			convertedWeaponType,
		)

		// EquipmentPropertiesをAllBonusesに変換して統合
		for (const [key, value] of Object.entries(effects)) {
			if (typeof value === 'number' && value !== 0) {
				bonuses[key as keyof AllBonuses] =
					(bonuses[key as keyof AllBonuses] || 0) + value
			}
		}
	}

	return bonuses
}

/**
 * プロパティ値のバリデーション
 */
function validateBuffSkillPropertyValue(
	value: number,
	propertyId: string,
): number {
	// 数値チェック
	if (typeof value !== 'number' || Number.isNaN(value)) return 0

	// 範囲チェック（プロパティ別）
	if (propertyId.includes('Rate')) {
		// %系は-100〜1000の範囲
		return Math.max(-100, Math.min(1000, value))
	}
	// 固定値系は-9999〜9999の範囲
	return Math.max(-9999, Math.min(9999, value))
}