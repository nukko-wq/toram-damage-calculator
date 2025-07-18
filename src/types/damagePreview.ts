// ダメージプレビュー機能の型定義

import type {
	PresetCrystal,
	CrystalType,
	PresetEquipment,
	EquipmentSlots,
	BuffItemCategory,
	BuffItem as CalculatorBuffItem,
} from './calculator'

// クリスタルエイリアス
export type Crystal = PresetCrystal

// 装備エイリアス
export type Equipment = PresetEquipment

// 装備スロット型
export type EquipmentSlot = keyof EquipmentSlots

// バフアイテムエイリアス
export type BuffItem = CalculatorBuffItem

/**
 * スロット情報
 */
export interface SlotInfo {
	type: 'crystal' | 'equipment' | 'buffItem'
	category?: CrystalType | BuffItemCategory // crystal, buffItem用
	slot?: number | EquipmentSlot // crystal, equipment用
}

/**
 * ダメージプレビュー結果
 */
export interface DamagePreviewResult {
	maxDamage: number
	minDamage: number
	baseDamage: number
	averageDamage: number
}

/**
 * ダメージ差分計算結果
 */
export interface DamageDifferenceResult {
	difference: number
	isCalculating: boolean
	error: Error | null
	currentDamage: number
	simulatedDamage: number
}

/**
 * アイテム型の統合
 */
export type PreviewItem = Crystal | Equipment | BuffItem

/**
 * ダメージ差分計算オプション
 */
export interface DamageDifferenceOptions {
	/**
	 * 計算を無効化するかどうか
	 */
	disabled?: boolean
	/**
	 * デバッグログを出力するかどうか
	 */
	debug?: boolean
}
