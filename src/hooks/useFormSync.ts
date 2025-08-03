'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * フォームの変更監視と同期を統合管理するカスタムフック
 * useEffectを使った複雑な初期化・監視パターンを簡素化する
 */
export function useFormSync<T extends Record<string, unknown>>(
	watchFunction: (callback: (value: Partial<T>, info: { name?: string; type?: string }) => void) => { unsubscribe: () => void },
	updateFunction: (data: T) => void,
	validationFunction?: (data: Partial<T>) => boolean,
	debounceMs: number = 30,
) {
	const [isInitialized, setIsInitialized] = useState(false)

	// 初期化処理を統合
	const initialize = useCallback(() => {
		setIsInitialized(false)
		const timer = setTimeout(() => setIsInitialized(true), debounceMs)
		return () => clearTimeout(timer)
	}, [debounceMs])

	// フォーム変更監視を統合
	useEffect(() => {
		const subscription = watchFunction((value, { name, type }) => {
			// 初期化中やプログラム的な変更は無視
			if (!isInitialized || !name || !value || type !== 'change') {
				return
			}

			// バリデーション関数が提供されている場合は検証
			const isValid = validationFunction ? validationFunction(value) : true
			
			if (isValid) {
				updateFunction(value as T)
			}
		})
		
		return () => subscription.unsubscribe()
	}, [watchFunction, isInitialized, updateFunction, validationFunction])

	return {
		isInitialized,
		initialize,
	}
}

/**
 * 基本ステータス用のバリデーション関数
 */
export function validateBaseStats(value: Partial<Record<string, unknown>>): boolean {
	return Object.values(value).every(
		(v) => typeof v === 'number' && !Number.isNaN(v) && v >= 1,
	)
}

/**
 * 武器データ用のバリデーション関数
 */
export function validateWeaponData(value: Partial<Record<string, unknown>>): boolean {
	return Object.values(value).every((v) => v !== undefined && v !== null)
}

/**
 * フードデータ用のバリデーション関数
 */
export function validateFoodData(value: Partial<Record<string, unknown>>): boolean {
	return Object.values(value).every((v) => v !== undefined && v !== null)
}

/**
 * 武器フォーム用の高度なフォーム同期フック
 * メイン武器とサブ武器の相互依存関係を管理
 */
export function useWeaponFormSync<T extends Record<string, unknown>>(
	watchFunction: (callback: (value: Partial<T>, info: { name?: string; type?: string }) => void) => { unsubscribe: () => void },
	updateFunction: (data: T) => void,
	validationFunction: (data: Partial<T>) => boolean,
	options: {
		onWeaponTypeChange?: (newType: string, currentData: Partial<T>) => void
		dependentUpdateFunction?: (data: T) => void
		debounceMs?: number
	} = {},
) {
	const { onWeaponTypeChange, dependentUpdateFunction, debounceMs = 30 } = options
	const [isInitialized, setIsInitialized] = useState(false)

	// 初期化処理を統合
	const initialize = useCallback(() => {
		setIsInitialized(false)
		const timer = setTimeout(() => setIsInitialized(true), debounceMs)
		return () => clearTimeout(timer)
	}, [debounceMs])

	// 武器フォーム専用の変更監視
	useEffect(() => {
		const subscription = watchFunction((value, { name, type }) => {
			// 初期化中やプログラム的な変更は無視
			if (!isInitialized || !name || !value || type !== 'change') {
				return
			}

			// バリデーション
			if (!validationFunction(value)) {
				return
			}

			// 武器タイプ変更時の特別処理
			if (name === 'weaponType' && onWeaponTypeChange) {
				onWeaponTypeChange(value.weaponType as string, value)
			}

			// メイン更新
			updateFunction(value as T)

			// 依存データの更新（サブ武器など）
			if (dependentUpdateFunction) {
				dependentUpdateFunction(value as T)
			}
		})
		
		return () => subscription.unsubscribe()
	}, [watchFunction, isInitialized, updateFunction, validationFunction, onWeaponTypeChange, dependentUpdateFunction])

	return {
		isInitialized,
		initialize,
	}
}