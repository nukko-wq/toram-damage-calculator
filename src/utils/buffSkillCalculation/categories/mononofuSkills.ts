/**
 * モノノフスキル系統のバフスキル計算
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
 * 武士道の効果計算関数
 */
export function calculateBushidoEffects(
	skillLevel: number,
	mainWeaponType: MainWeaponType | null,
): Partial<EquipmentProperties> {
	if (!skillLevel || skillLevel === 0) return {}

	// 基本効果（全武器共通）
	const baseEffects = {
		HP: skillLevel * 10,
		MP: skillLevel * 10,
		Accuracy: skillLevel,
	}

	// メイン武器が抜刀剣の場合の追加効果
	if (mainWeaponType === 'katana') {
		return {
			...baseEffects,
			ATK_Rate: Math.floor((skillLevel - 3) / 5) + 2,
			WeaponATK_Rate: skillLevel * 3,
		}
	}

	return baseEffects
}

/**
 * 武士道の効果を取得
 */
export function getBushidoEffects(
	buffSkillData: Record<string, BuffSkillState> | null,
	mainWeaponType: MainWeaponType | null,
): Partial<EquipmentProperties> {
	if (!buffSkillData) return {}

	const skill = buffSkillData.Mononof
	if (!skill?.isEnabled || !skill.level) return {}

	return calculateBushidoEffects(skill.level, mainWeaponType)
}

/**
 * 怪力乱神の効果計算関数
 */
export function calculateSupernaturalPowerEffects(
	skillLevel: number,
): Partial<EquipmentProperties> {
	if (!skillLevel || skillLevel === 0) return {}

	// ATK = スキルレベル × 10
	const atkBonus = skillLevel * 10

	// 攻撃MP回復 = 5 + スキルレベル + (スキルレベル / 5) × 5（小数点以下切り捨て）
	const attackMPRecovery = 5 + skillLevel + Math.floor(skillLevel / 5) * 5

	return {
		ATK: atkBonus,
		AttackMPRecovery: attackMPRecovery,
	}
}

/**
 * 怪力乱神の効果を取得
 */
export function getSupernaturalPowerEffects(
	buffSkillData: Record<string, BuffSkillState> | null,
): Partial<EquipmentProperties> {
	if (!buffSkillData) return {}

	const skill = buffSkillData.mf1
	if (!skill?.isEnabled || !skill.level) return {}

	return calculateSupernaturalPowerEffects(skill.level)
}

/**
 * 両手持ち(sm1-1)の効果計算関数
 */
export function calculateTwoHandsEffects(
	isEnabled: boolean,
	mainWeaponType: MainWeaponType | null,
	subWeaponType: SubWeaponType | null,
): Partial<EquipmentProperties> {
	if (!isEnabled) return {}

	const isKatana = mainWeaponType === 'katana'
	const isSubWeaponNone = !subWeaponType || subWeaponType === 'なし'
	const isSubWeaponScroll = subWeaponType === '巻物'

	// 抜刀剣の場合：サブ武器がなしまたは巻物
	if (isKatana && (isSubWeaponNone || isSubWeaponScroll)) {
		return {
			Accuracy_Rate: 10,
			Stability_Rate: 10,
			Critical: 10,
			WeaponATK_Rate: 10,
		}
	}

	// その他の武器の場合：サブ武器がなしのみ
	if (!isKatana && isSubWeaponNone) {
		return {
			Accuracy_Rate: 10,
			Stability_Rate: 5,
			Critical: 5,
			WeaponATK_Rate: 10,
		}
	}

	// 効果条件を満たさない場合
	return {}
}

/**
 * モノノフスキル系統の統合効果取得
 */
export function getMononofuSkillBonuses(
	buffSkillData: Record<string, BuffSkillState> | null,
	mainWeaponType: WeaponType | null,
	subWeaponType: SubWeaponType | null,
): Partial<AllBonuses> {
	const convertedWeaponType = convertWeaponType(mainWeaponType)
	const bonuses: Partial<AllBonuses> = {}

	if (!buffSkillData) return bonuses

	// 武士道(Mononof)の処理
	const bushido = buffSkillData.Mononof
	if (bushido?.isEnabled && bushido.level) {
		const effects = calculateBushidoEffects(bushido.level, convertedWeaponType)
		integrateEffects(effects, bonuses)
	}

	// 怪力乱神(mf1)の処理
	const supernaturalPower = buffSkillData.mf1
	if (supernaturalPower?.isEnabled && supernaturalPower.level) {
		const effects = calculateSupernaturalPowerEffects(supernaturalPower.level)
		integrateEffects(effects, bonuses)
	}

	// 両手持ち(sm1-1)の処理
	const twoHands = buffSkillData['sm1-1']
	if (twoHands?.isEnabled) {
		const effects = calculateTwoHandsEffects(
			twoHands.isEnabled,
			convertedWeaponType,
			subWeaponType,
		)
		integrateEffects(effects, bonuses)
	}

	return bonuses
}
