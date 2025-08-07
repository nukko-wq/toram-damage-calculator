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
		console.log('useFormSync: initialize called')
		setIsInitialized(false)
		const timer = setTimeout(() => {
			console.log('useFormSync: initialization complete, setting isInitialized to true')
			setIsInitialized(true)
		}, debounceMs)
		return () => clearTimeout(timer)
	}, [debounceMs])

	// 初期化を自動実行
	useEffect(() => {
		initialize()
	}, [initialize])

	// フォーム変更監視を統合
	useEffect(() => {
		console.log('useFormSync: Setting up watch subscription, isInitialized:', isInitialized)
		const subscription = watchFunction((value, { name, type }) => {
			console.log('useFormSync: Watch callback triggered:', { name, type, isInitialized, hasValue: value !== undefined && value !== null })
			
			// 初期化中やプログラム的な変更は無視
			if (!isInitialized || !name || value === undefined || value === null) {
				console.log('useFormSync: Skipping update due to conditions:', { isInitialized, name, hasValue: value !== undefined && value !== null })
				return
			}

			// バリデーション関数が提供されている場合は検証
			const isValid = validationFunction ? validationFunction(value) : true
			console.log('useFormSync: Validation result:', isValid)
			
			if (isValid) {
				console.log('useFormSync: Calling updateFunction with:', value)
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
		console.log('useWeaponFormSync: Initializing...')
		setIsInitialized(false)
		const timer = setTimeout(() => {
			console.log('useWeaponFormSync: Initialization complete')
			setIsInitialized(true)
		}, debounceMs)
		return () => clearTimeout(timer)
	}, [debounceMs])

	// 武器フォーム専用の変更監視
	useEffect(() => {
		const subscription = watchFunction((value, { name, type }) => {
			console.log('useWeaponFormSync watch triggered:', { name, type, value, isInitialized })
			
			// 初期化中やプログラム的な変更は無視
			if (!isInitialized || !name || value === undefined || value === null) {
				console.log('useWeaponFormSync: Skipping due to conditions')
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

	console.log('useWeaponFormSync: Current state:', { isInitialized })
	
	return {
		isInitialized,
		initialize,
	}
}