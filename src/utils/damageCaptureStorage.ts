/**
 * ダメージキャプチャデータの型定義とLocalStorage操作
 */

import { safeJSONParse } from './storage'

// ダメージ計算結果の型定義
export interface DamageCalculationResult {
	minimum: {
		damage: number // 最小ダメージ
		stability: number // 最小時の安定率(%)
	}
	maximum: {
		damage: number // 最大ダメージ
		stability: number // 最大時の安定率(%)
	}
	average: {
		damage: number // 平均ダメージ
		stability: number // 平均安定率(%)
	}
	calculatedAt: string // 計算時刻
}

// キャプチャデータの型定義
export interface DamageCaptureData {
	damageResult: DamageCalculationResult // ダメージ計算結果
	capturedAt: string // キャプチャ時刻（内部管理用）
}

// LocalStorageキー（全セーブデータ共通）
const DAMAGE_CAPTURE_KEY = 'damageCaptureData'

/**
 * キャプチャデータをLocalStorageに保存
 */
export const saveCaptureData = (data: DamageCaptureData): void => {
	try {
		localStorage.setItem(DAMAGE_CAPTURE_KEY, JSON.stringify(data))
	} catch (error) {
		console.error('Failed to save capture data:', error)
		throw new Error('キャプチャデータの保存に失敗しました')
	}
}

/**
 * キャプチャデータをLocalStorageから読み込み
 */
export const loadCaptureData = (): DamageCaptureData | null => {
	try {
		const stored = localStorage.getItem(DAMAGE_CAPTURE_KEY)
		return stored ? safeJSONParse(stored, null) : null
	} catch (error) {
		console.error('Failed to load capture data:', error)
		// 破損データの場合は削除して null を返す
		clearCaptureData()
		return null
	}
}

/**
 * キャプチャデータをLocalStorageから削除
 */
export const clearCaptureData = (): void => {
	try {
		localStorage.removeItem(DAMAGE_CAPTURE_KEY)
	} catch (error) {
		console.error('Failed to clear capture data:', error)
	}
}

/**
 * 現在のダメージ計算結果からキャプチャデータを生成
 */
export const createCaptureData = (
	min: number,
	max: number,
	average: number,
	stability: number,
	averageStability: number,
): DamageCaptureData => {
	const now = new Date().toISOString()

	return {
		damageResult: {
			minimum: {
				damage: min,
				stability: stability,
			},
			maximum: {
				damage: max,
				stability: 100, // 最大値時は常に100%
			},
			average: {
				damage: average,
				stability: averageStability, // 計算済みの平均安定率を使用
			},
			calculatedAt: now,
		},
		capturedAt: now,
	}
}
