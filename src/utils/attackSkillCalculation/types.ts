import type { WeaponType, SubWeaponType } from '@/types/calculator'

/**
 * プレイヤーステータス（計算に必要な値）
 */
export interface PlayerStats {
	// 基本ステータス
	baseSTR: number
	baseDEX: number
	baseINT: number
	baseAGI: number
	baseVIT: number

	// 補正後ステータス
	adjustedSTR: number
	adjustedDEX: number
	adjustedINT: number
	adjustedAGI: number
	adjustedVIT: number

	// 計算済み値
	totalATK: number
	MATK: number
	HP: number
	MP: number
	level: number
}

/**
 * 装備情報（計算に必要な値）
 */
export interface EquipmentContext {
	mainWeaponType: WeaponType | null
	subWeaponType: SubWeaponType | null
	// 特定装備の判定用
	hasHalberdEquipped: boolean // 旋風槍装備判定
	// 将来拡張: 他の特殊装備判定
}

/**
 * 計算結果
 */
export interface SkillCalculationResult {
	hitNumber: number
	calculatedMultiplier: number // 計算された実際の倍率%
	calculatedFixedDamage: number // 計算された実際の固定値
	calculationProcess?: string // 計算過程の説明（デバッグ用）
}

/**
 * スキル計算入力
 */
export interface SkillCalculationInput {
	skillId: string
	hitNumber: number
	playerStats: PlayerStats
	equipmentContext: EquipmentContext
}
