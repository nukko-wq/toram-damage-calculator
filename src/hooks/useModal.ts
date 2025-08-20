'use client'

import { useCallback, useEffect, useRef } from 'react'

/**
 * モーダルの共通処理を統合管理するカスタムフック
 * 初期化処理とESCキー処理を統合し、useEffectの重複を解消する
 */
export function useModal(
	isOpen: boolean,
	onClose: () => void,
	onOpen?: () => void,
	options: {
		preventEscapeWhenLoading?: boolean
		loadingState?: boolean
	} = {},
) {
	const { preventEscapeWhenLoading = false, loadingState = false } = options

	// モーダルが開いた時の初期化処理（初回のみ実行）
	const isInitialized = useRef(false)
	useEffect(() => {
		if (isOpen && onOpen && !isInitialized.current) {
			onOpen()
			isInitialized.current = true
		}

		// モーダルが閉じた時に初期化フラグをリセット
		if (!isOpen) {
			isInitialized.current = false
		}
	}, [isOpen, onOpen])

	// ESCキーでモーダルを閉じる処理
	useEffect(() => {
		if (!isOpen) return

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				// ローディング中のESCキー無効化オプション
				if (preventEscapeWhenLoading && loadingState) {
					return
				}
				onClose()
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [isOpen, onClose, preventEscapeWhenLoading, loadingState])
}

/**
 * 標準的なモーダル初期化処理（よく使われるパターン）
 */
export function createModalInitializer<T extends Record<string, unknown>>(
	initialValues: T,
) {
	return (setters: { [K in keyof T]: (value: T[K]) => void }) => {
		Object.entries(initialValues).forEach(([key, value]) => {
			const setter = setters[key as keyof T]
			if (setter) {
				setter(value as T[keyof T])
			}
		})
	}
}

/**
 * 名前変更モーダル用の初期化ヘルパー
 */
export function useRenameModal(
	isOpen: boolean,
	onClose: () => void,
	currentName: string,
	setNewName: (name: string) => void,
	setError: (error: string | null) => void,
	setIsRenaming: (loading: boolean) => void,
) {
	const initializeRename = () => {
		setNewName(currentName)
		setError(null)
		setIsRenaming(false)
	}

	useModal(isOpen, onClose, initializeRename)
}

/**
 * 新規作成モーダル用の初期化ヘルパー
 */
export function useCreateModal(
	isOpen: boolean,
	onClose: () => void,
	setSaveName: (name: string) => void,
	setError: (error: string | null) => void,
	setIsCreating: (loading: boolean) => void,
) {
	const initializeCreate = useCallback(() => {
		setSaveName('')
		setError(null)
		setIsCreating(false)
	}, [setSaveName, setError, setIsCreating])

	useModal(isOpen, onClose, initializeCreate)
}

/**
 * インポートモーダル用の初期化ヘルパー
 */
export function useImportModal<T>(
	isOpen: boolean,
	onClose: () => void,
	setters: {
		setError: (error: string | null) => void
		setIsValidating: (validating: boolean) => void
		setValidationResult: (result: T | null) => void
		setDragActive: (active: boolean) => void
	},
) {
	const initializeImport = () => {
		setters.setError(null)
		setters.setIsValidating(false)
		setters.setValidationResult(null)
		setters.setDragActive(false)
	}

	useModal(isOpen, onClose, initializeImport)
}
