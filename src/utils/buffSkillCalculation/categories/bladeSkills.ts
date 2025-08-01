/**
 * ブレードスキル系統のバフスキル計算
 */

import type { BuffSkillState, MainWeaponType } from '@/types/buffSkill'
import type {
	EquipmentProperties,
	SubWeaponType,
	WeaponType,
} from '@/types/calculator'
import type { AllBonuses } from '../../basicStatsCalculation'
import { convertWeaponType, integrateEffects } from '../types'

/**
 * 素早い斬撃の効果計算関数
 */
export function calculateQuickSlashEffects(
	skillLevel: number,
	weaponType: MainWeaponType | null,
): Partial<EquipmentProperties> {
	const bladeWeapons: MainWeaponType[] = [
		'oneHandSword',
		'twoHandSword',
		'dualSword',
	]
	if (!weaponType || !bladeWeapons.includes(weaponType) || skillLevel <= 0)
		return {}

	return {
		AttackSpeed: skillLevel * 10,
		AttackSpeed_Rate: skillLevel * 1,
	}
}

/**
 * 匠の剣術(sm4)のパッシブ倍率計算関数
 */
export function calculateTakumiKenjutsuPassiveMultiplier(
	isEnabled: boolean,
	weaponType: MainWeaponType | null,
): number {
	const bladeWeapons: MainWeaponType[] = [
		'oneHandSword',
		'twoHandSword',
		'dualSword',
	]
	if (!isEnabled || !weaponType || !bladeWeapons.includes(weaponType)) return 0

	return 20 // パッシブ倍率 +20%
}

/**
 * ウォークライの効果計算関数
 */
export function calculateWarCryEffects(
	weaponTypeParam: number, // 1: 両手剣, 2: 両手剣以外
): Partial<EquipmentProperties> {
	if (!weaponTypeParam || (weaponTypeParam !== 1 && weaponTypeParam !== 2))
		return {}

	// 武器タイプに応じた効果
	if (weaponTypeParam === 1) {
		// 両手剣の場合
		return {
			ATK_Rate: 15, // ATK率+15%
		}
	}
	// 両手剣以外の場合
	return {
		ATK_Rate: 10, // ATK率+10%
	}
}

/**
 * バーサークの効果計算関数
 */
export function calculateBerserkEffects(
	isEnabled: boolean,
	weaponType: MainWeaponType | null,
): Partial<EquipmentProperties> {
	if (!isEnabled) return {}

	// 全武器種共通効果
	const baseEffects: Partial<EquipmentProperties> = {
		AttackSpeed: 1000,
		AttackSpeed_Rate: 100,
	}

	// 武器種別効果計算
	let weaponSpecificEffects: Partial<EquipmentProperties> = {}

	if (weaponType === 'oneHandSword' || weaponType === 'dualSword') {
		// 片手剣・双剣装備時
		weaponSpecificEffects = {
			Critical: 25,
			Stability_Rate: -25,
		}
	} else if (weaponType === 'twoHandSword') {
		// 両手剣装備時
		weaponSpecificEffects = {
			Critical: 50,
			Stability_Rate: -25,
		}
	} else {
		// その他の武器装備時
		weaponSpecificEffects = {
			Critical: 25,
			Stability_Rate: -50,
		}
	}

	return {
		...baseEffects,
		...weaponSpecificEffects,
	}
}

/**
 * オーラブレード(AuraBlade)のブレイブ倍率計算関数
 */
export function calculateAuraBladeEffects(
	isEnabled: boolean,
	weaponType: MainWeaponType | null,
): number {
	if (!isEnabled) return 0

	// 武器種別ブレイブ倍率計算
	switch (weaponType) {
		case 'oneHandSword':
			return 20 // +20%
		case 'twoHandSword':
			return 30 // +30%
		case 'dualSword':
			return 10 // +10%
		default:
			return 0 // 効果なし
	}
}

/**
 * バスターブレード(BusterBlade)の効果計算関数
 */
export function calculateBusterBladeEffects(
	isEnabled: boolean,
	weaponType: MainWeaponType | null,
	subWeaponType?: SubWeaponType | null,
	shieldRefinement?: number,
): Partial<EquipmentProperties> {
	if (!isEnabled) return {}

	// 対象武器種チェック
	const bladeWeapons: MainWeaponType[] = [
		'oneHandSword',
		'twoHandSword',
		'dualSword',
	]
	if (!weaponType || !bladeWeapons.includes(weaponType)) return {}

	// 片手剣+盾の特殊条件チェック
	if (weaponType === 'oneHandSword' && subWeaponType === '盾') {
		// 片手剣+盾装備時: 武器ATK率 = 10 + 盾の精錬値
		const weaponATKRate = 10 + (shieldRefinement || 0)
		return {
			WeaponATK_Rate: weaponATKRate,
		}
	}

	// 基本効果: 武器ATK率+10%
	return {
		WeaponATK_Rate: 10,
	}
}

/**
 * ブレードスキル系統の統合効果取得
 */
export function getBladeSkillBonuses(
	buffSkillData: Record<string, BuffSkillState> | null,
	weaponType: WeaponType | null,
	subWeaponType?: SubWeaponType | null,
	shieldRefinement?: number,
): Partial<AllBonuses> {
	const convertedWeaponType = convertWeaponType(weaponType)
	const bonuses: Partial<AllBonuses> = {}

	if (!buffSkillData) return bonuses

	// 素早い斬撃の処理
	const quickSlash = buffSkillData['sm2']
	if (quickSlash?.isEnabled && quickSlash.level) {
		const effects = calculateQuickSlashEffects(
			quickSlash.level,
			convertedWeaponType,
		)
		integrateEffects(effects, bonuses)
	}

	// ウォークライの処理
	const warCry = buffSkillData['IsWarcry']
	if (warCry?.isEnabled && warCry.multiParam1) {
		const effects = calculateWarCryEffects(warCry.multiParam1)
		integrateEffects(effects, bonuses)
	}

	// バーサークの処理（武器種別ごとに異なるID）
	const berserkIds = ['sm3-1', 'sm3-2', 'sm3-3']
	const activeBerserk = berserkIds.find((id) => buffSkillData[id]?.isEnabled)
	if (activeBerserk) {
		const effects = calculateBerserkEffects(true, convertedWeaponType)
		integrateEffects(effects, bonuses)
	}

	// バスターブレードの処理
	const busterBlade = buffSkillData['5-BusterBlade']
	if (busterBlade?.isEnabled) {
		const effects = calculateBusterBladeEffects(
			true,
			convertedWeaponType,
			subWeaponType,
			shieldRefinement,
		)
		integrateEffects(effects, bonuses)
	}

	return bonuses
}

/**
 * ブレードスキル系統のパッシブ倍率取得
 */
export function getBladeSkillPassiveMultiplier(
	buffSkillData: Record<string, BuffSkillState> | null,
	weaponType: WeaponType | null,
	attackSkillCategory?: string,
	attackSkillId?: string,
): number {
	const convertedWeaponType = convertWeaponType(weaponType)
	let totalPassiveMultiplier = 0

	if (!buffSkillData) return totalPassiveMultiplier

	// 匠の剣術(sm4)の処理 - bladeカテゴリのスキル使用時のみ適用
	// ただし、ストームブレイザー使用時は無効
	const takumiKenjutsu = buffSkillData.sm4
	if (takumiKenjutsu?.isEnabled && attackSkillCategory === 'blade') {
		// ストームブレイザー(1スタック/10スタック)の場合は匠の剣術を無効化
		const isStormBlazer =
			attackSkillId === 'storm_blazer_1stack' ||
			attackSkillId === 'storm_blazer_10stack'

		if (!isStormBlazer) {
			totalPassiveMultiplier += calculateTakumiKenjutsuPassiveMultiplier(
				takumiKenjutsu.isEnabled,
				convertedWeaponType,
			)
		}
	}

	return totalPassiveMultiplier
}

/**
 * ブレードスキル系統のブレイブ倍率取得
 * オーラブレードによるブレイブ倍率効果を計算
 */
export function getBladeSkillBraveMultiplier(
	buffSkillData: Record<string, BuffSkillState> | null,
	weaponType: WeaponType | null,
): number {
	const convertedWeaponType = convertWeaponType(weaponType)
	let totalBraveMultiplier = 0

	if (!buffSkillData) return totalBraveMultiplier

	// オーラブレード(AuraBlade)の処理（武器種別ごとに異なるID）
	const auraBladeIds = ['4-OH', '4-DS', '4-TH'] // 片手剣、双剣、両手剣
	const activeAuraBlade = auraBladeIds.find(
		(id) => buffSkillData[id]?.isEnabled,
	)
	if (activeAuraBlade) {
		totalBraveMultiplier += calculateAuraBladeEffects(true, convertedWeaponType)
	}

	return totalBraveMultiplier
}
