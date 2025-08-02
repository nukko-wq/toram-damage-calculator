/**
 * バフスキル統合の中心となる関数群
 */

import type { BuffSkillState } from '@/types/buffSkill'
import type { SubWeaponType, WeaponType } from '@/types/calculator'
import type { AllBonuses } from '../../basicStatsCalculation'
import { getAssassinSkillBonuses } from '../categories/assassinSkills'
import {
	getBattleSkillBonuses,
	getBattleSkillBonusesWithPlayerLevel,
} from '../categories/battleSkills'
import {
	getBladeSkillBonuses,
	getBladeSkillBraveMultiplier,
	getBladeSkillPassiveMultiplier,
} from '../categories/bladeSkills'
import { getDarkPowerSkillBonuses } from '../categories/darkPowerSkills'
import { getDualSwordSkillBonuses } from '../categories/dualSwordSkills'
import { getHalberdSkillBonuses } from '../categories/halberdSkills'
import { getHunterSkillBonuses } from '../categories/hunterSkills'
// カテゴリ別インポート
import { getMasterySkillBonuses } from '../categories/masterySkills'
import { calculateHotKnowsEffects } from '../categories/minstrelSkills'
import { getMononofuSkillBonuses } from '../categories/mononofuSkills'
import { getPartisanSkillBonuses } from '../categories/partisanSkills'
import { getPriestSkillBonuses } from '../categories/priestSkills'
import { getShieldSkillBonuses } from '../categories/shieldSkills'
import { getShootSkillPassiveMultiplier } from '../categories/shootSkills'
import {
	getSpriteSkillBonuses,
	getSpriteSkillBraveMultiplier,
} from '../categories/spriteSkills'
import {
	getSupportSkillBonuses,
	getSupportSkillBraveMultiplier,
} from '../categories/supportSkills'
import { getSurvivalSkillBonuses } from '../categories/survivalSkills'

/**
 * バフスキルデータから全体の補正値を取得（基本版）
 */
export function getBuffSkillBonuses(
	buffSkillData: Record<string, BuffSkillState> | null,
	weaponType: WeaponType | null,
	enemyDEF?: number,
	enemyMDEF?: number,
	enemyLevel?: number,
	subWeaponType?: SubWeaponType | null,
	subWeaponRefinement?: number,
): Partial<AllBonuses> {
	const bonuses: Partial<AllBonuses> = {}

	if (!buffSkillData) return bonuses

	// マスタリスキル
	const masteryBonuses = getMasterySkillBonuses(buffSkillData, weaponType)
	for (const [key, value] of Object.entries(masteryBonuses)) {
		if (typeof value === 'number' && value !== 0) {
			bonuses[key as keyof AllBonuses] =
				(bonuses[key as keyof AllBonuses] || 0) + value
		}
	}

	// ブレードスキル（サブ武器情報を含む）
	const bladeBonuses = getBladeSkillBonuses(
		buffSkillData,
		weaponType,
		subWeaponType,
		subWeaponRefinement,
	)
	for (const [key, value] of Object.entries(bladeBonuses)) {
		if (typeof value === 'number' && value !== 0) {
			bonuses[key as keyof AllBonuses] =
				(bonuses[key as keyof AllBonuses] || 0) + value
		}
	}

	// ハルバードスキル
	const halberdBonuses = getHalberdSkillBonuses(buffSkillData, weaponType)
	for (const [key, value] of Object.entries(halberdBonuses)) {
		if (typeof value === 'number' && value !== 0) {
			bonuses[key as keyof AllBonuses] =
				(bonuses[key as keyof AllBonuses] || 0) + value
		}
	}

	// バトルスキル（基本）
	const battleBonuses = getBattleSkillBonuses(buffSkillData)
	for (const [key, value] of Object.entries(battleBonuses)) {
		if (typeof value === 'number' && value !== 0) {
			bonuses[key as keyof AllBonuses] =
				(bonuses[key as keyof AllBonuses] || 0) + value
		}
	}

	// サバイバルスキル
	const survivalBonuses = getSurvivalSkillBonuses(buffSkillData)
	for (const [key, value] of Object.entries(survivalBonuses)) {
		if (typeof value === 'number' && value !== 0) {
			bonuses[key as keyof AllBonuses] =
				(bonuses[key as keyof AllBonuses] || 0) + value
		}
	}

	// シールドスキル
	const shieldBonuses = getShieldSkillBonuses(buffSkillData)
	for (const [key, value] of Object.entries(shieldBonuses)) {
		if (typeof value === 'number' && value !== 0) {
			bonuses[key as keyof AllBonuses] =
				(bonuses[key as keyof AllBonuses] || 0) + value
		}
	}

	// ダークパワースキル
	const darkPowerBonuses = getDarkPowerSkillBonuses(buffSkillData)
	for (const [key, value] of Object.entries(darkPowerBonuses)) {
		if (typeof value === 'number' && value !== 0) {
			bonuses[key as keyof AllBonuses] =
				(bonuses[key as keyof AllBonuses] || 0) + value
		}
	}

	// サポートスキル
	const supportBonuses = getSupportSkillBonuses(buffSkillData)
	for (const [key, value] of Object.entries(supportBonuses)) {
		if (typeof value === 'number' && value !== 0) {
			bonuses[key as keyof AllBonuses] =
				(bonuses[key as keyof AllBonuses] || 0) + value
		}
	}

	// スプライトスキル（敵情報があれば使用、なければデフォルト値）
	const spriteBonuses = getSpriteSkillBonuses(
		buffSkillData,
		enemyDEF ?? 1000,
		enemyMDEF ?? 1000,
		enemyLevel ?? 100,
	)
	for (const [key, value] of Object.entries(spriteBonuses)) {
		if (typeof value === 'number' && value !== 0) {
			bonuses[key as keyof AllBonuses] =
				(bonuses[key as keyof AllBonuses] || 0) + value
		}
	}

	// プリーストスキル
	const priestBonuses = getPriestSkillBonuses(buffSkillData)
	for (const [key, value] of Object.entries(priestBonuses)) {
		if (typeof value === 'number' && value !== 0) {
			bonuses[key as keyof AllBonuses] =
				(bonuses[key as keyof AllBonuses] || 0) + value
		}
	}

	return bonuses
}

/**
 * バフスキルデータから両手持ちの効果を取得（サブ武器情報が必要）
 */
export function getTwoHandsEffects(
	buffSkillData: Record<string, BuffSkillState> | null,
	mainWeaponType: WeaponType | null,
	subWeaponType: SubWeaponType | null,
): Partial<AllBonuses> {
	return getMononofuSkillBonuses(buffSkillData, mainWeaponType, subWeaponType)
}

/**
 * バフスキルデータから攻撃力UPの効果を取得（プレイヤーレベルが必要）
 */
export function getAttackUpEffects(
	buffSkillData: Record<string, BuffSkillState> | null,
	playerLevel: number,
): Partial<AllBonuses> {
	const bonuses: Partial<AllBonuses> = {}

	if (!buffSkillData) return bonuses

	// バトルスキルのプレイヤーレベル依存スキルから攻撃力UPのみ抽出
	const battleBonuses = getBattleSkillBonusesWithPlayerLevel(
		buffSkillData,
		playerLevel,
	)

	// 攻撃力UP関連のプロパティのみ抽出
	if (battleBonuses.ATK) {
		bonuses.ATK = battleBonuses.ATK
	}

	return bonuses
}

/**
 * バフスキルデータから魔法力UPの効果を取得（プレイヤーレベルが必要）
 */
export function getMagicUpEffects(
	buffSkillData: Record<string, BuffSkillState> | null,
	playerLevel: number,
): Partial<AllBonuses> {
	const bonuses: Partial<AllBonuses> = {}

	if (!buffSkillData) return bonuses

	// バトルスキルのプレイヤーレベル依存スキルから魔法力UPのみ抽出
	const battleBonuses = getBattleSkillBonusesWithPlayerLevel(
		buffSkillData,
		playerLevel,
	)

	// 魔法力UP関連のプロパティのみ抽出
	if (battleBonuses.MATK) {
		bonuses.MATK = battleBonuses.MATK
	}

	return bonuses
}

/**
 * バフスキルデータから驚異の威力の効果を取得（プレイヤーレベルが必要）
 */
export function getThreatPowerEffects(
	buffSkillData: Record<string, BuffSkillState> | null,
	playerLevel: number,
): Partial<AllBonuses> {
	// 驚異の威力は攻撃力UPと同じ計算式なので、攻撃力UPを使用
	return getAttackUpEffects(buffSkillData, playerLevel)
}

/**
 * バフスキルデータから更なる魔力の効果を取得（プレイヤーレベルが必要）
 */
export function getFurtherMagicEffects(
	buffSkillData: Record<string, BuffSkillState> | null,
	playerLevel: number,
): Partial<AllBonuses> {
	// 更なる魔力は魔法力UPと同じ計算式なので、魔法力UPを使用
	return getMagicUpEffects(buffSkillData, playerLevel)
}

/**
 * バフスキルデータから神速の軌跡の効果を取得（武器タイプが必要）
 */
export function getGodspeedTrajectoryEffects(
	buffSkillData: Record<string, BuffSkillState> | null,
	weaponType: WeaponType | null,
): Partial<AllBonuses> {
	return getDualSwordSkillBonuses(buffSkillData, weaponType)
}

/**
 * バフスキルデータから命中UPの効果を取得
 */
export function getAccuracyUpEffects(
	buffSkillData: Record<string, BuffSkillState> | null,
): Partial<AllBonuses> {
	const bonuses: Partial<AllBonuses> = {}

	if (!buffSkillData) return bonuses

	// バトルスキルのプレイヤーレベル依存スキルから命中UPのみ抽出
	const battleBonuses = getBattleSkillBonusesWithPlayerLevel(buffSkillData, 1) // レベルは不要なのでダミー値

	// 命中UP関連のプロパティのみ抽出
	if (battleBonuses.Accuracy) {
		bonuses.Accuracy = battleBonuses.Accuracy
	}

	return bonuses
}

/**
 * バフスキルデータから回避UPの効果を取得
 */
export function getDodgeUpEffects(
	buffSkillData: Record<string, BuffSkillState> | null,
): Partial<AllBonuses> {
	const bonuses: Partial<AllBonuses> = {}

	if (!buffSkillData) return bonuses

	// バトルスキルのプレイヤーレベル依存スキルから回避UPのみ抽出
	const battleBonuses = getBattleSkillBonusesWithPlayerLevel(buffSkillData, 1) // レベルは不要なのでダミー値

	// 回避UP関連のプロパティのみ抽出
	if (battleBonuses.Dodge) {
		bonuses.Dodge = battleBonuses.Dodge
	}

	return bonuses
}

/**
 * バフスキルデータからカムフラージュの効果を取得（基本ステータスレベルと武器タイプが必要）
 */
export function getCamouflageEffects(
	buffSkillData: Record<string, BuffSkillState> | null,
	baseStatsLevel: number,
	weaponType: WeaponType | null,
): Partial<AllBonuses> {
	return getHunterSkillBonuses(buffSkillData, baseStatsLevel, weaponType)
}

/**
 * バフスキルデータから前線維持Ⅱの効果を取得（基本ステータスレベルが必要）
 */
export function getFrontlineMaintenance2Effects(
	buffSkillData: Record<string, BuffSkillState> | null,
	baseStatsLevel: number,
): Partial<AllBonuses> {
	return getPartisanSkillBonuses(buffSkillData, baseStatsLevel)
}

/**
 * バフスキルデータからパッシブ倍率を取得
 */
export function getBuffSkillPassiveMultiplier(
	buffSkillData: Record<string, BuffSkillState> | null,
	weaponType: WeaponType | null,
): number {
	return getBladeSkillPassiveMultiplier(buffSkillData, weaponType)
}

/**
 * バフスキルデータからパッシブ倍率を取得（攻撃スキルカテゴリ考慮版）
 */
export function getBuffSkillPassiveMultiplierWithSkillCategory(
	buffSkillData: Record<string, BuffSkillState> | null,
	weaponType: WeaponType | null,
	attackSkillCategory?: string,
	canUseLongRange?: boolean,
	attackSkillId?: string,
): number {
	let totalPassiveMultiplier = 0

	// ブレードスキル系統のパッシブ倍率
	totalPassiveMultiplier += getBladeSkillPassiveMultiplier(
		buffSkillData,
		weaponType,
		attackSkillCategory,
		attackSkillId,
	)

	// シュートスキル系統のパッシブ倍率（ロングレンジ）
	if (canUseLongRange !== undefined) {
		totalPassiveMultiplier += getShootSkillPassiveMultiplier(
			buffSkillData,
			canUseLongRange,
		)
	}

	return totalPassiveMultiplier
}

/**
 * バフスキルデータからブレイブ倍率を取得
 * 複数のブレイブ倍率スキルを加算して合計値を返す
 */
export function getBuffSkillBraveMultiplier(
	buffSkillData: Record<string, BuffSkillState> | null,
	weaponType?: WeaponType | null,
	enemyDEF?: number,
	enemyMDEF?: number,
	enemyLevel?: number,
): number {
	let totalBraveMultiplier = getSupportSkillBraveMultiplier(buffSkillData)

	// ブレードスキルのブレイブ倍率も追加（オーラブレード）
	if (weaponType !== undefined) {
		totalBraveMultiplier += getBladeSkillBraveMultiplier(
			buffSkillData,
			weaponType,
		)
	}

	// エンハンスのブレイブ倍率も追加
	if (
		enemyDEF !== undefined &&
		enemyMDEF !== undefined &&
		enemyLevel !== undefined
	) {
		totalBraveMultiplier += getSpriteSkillBraveMultiplier(
			buffSkillData,
			enemyDEF,
			enemyMDEF,
			enemyLevel,
		)
	}

	return totalBraveMultiplier
}

/**
 * バフスキルデータからアサシンスキルの効果を取得（サブ武器情報が必要）
 */
export function getAssassinSkillEffects(
	buffSkillData: Record<string, BuffSkillState> | null,
	subWeaponType: SubWeaponType | null,
): Partial<AllBonuses> {
	return getAssassinSkillBonuses(buffSkillData, subWeaponType)
}

/**
 * バフスキルデータからエンハンスの効果を取得（敵情報が必要）
 */
export function getEnhanceSkillEffects(
	buffSkillData: Record<string, BuffSkillState> | null,
	enemyDEF: number,
	enemyMDEF: number,
	enemyLevel: number,
): Partial<AllBonuses> {
	return getSpriteSkillBonuses(buffSkillData, enemyDEF, enemyMDEF, enemyLevel)
}
