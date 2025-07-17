/**
 * モノノフスキル系統のバフスキル計算
 */

import type { BuffSkillState, MainWeaponType } from '@/types/buffSkill'
import type {
	EquipmentProperties,
	WeaponType,
	SubWeaponType,
} from '@/types/calculator'
import type { AllBonuses } from '../../basicStatsCalculation'
import { convertWeaponType, integrateEffects } from '../types'

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