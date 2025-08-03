'use client'

import { useEffect } from 'react'

/**
 * キーボードショートカットを管理するカスタムフック
 * 複数のコンポーネントで重複するキーボードイベント処理を統合
 */
export function useKeyboardShortcut(
	key: string,
	callback: () => void,
	conditions: {
		isActive?: boolean
		preventDefault?: boolean
		stopPropagation?: boolean
		modifiers?: {
			ctrl?: boolean
			alt?: boolean
			shift?: boolean
			meta?: boolean
		}
	} = {},
) {
	const {
		isActive = true,
		preventDefault = false,
		stopPropagation = false,
		modifiers = {},
	} = conditions

	useEffect(() => {
		if (!isActive) return

		const handleKeyDown = (event: KeyboardEvent) => {
			// モディファイアキーのチェック
			const ctrlMatch = modifiers.ctrl ? event.ctrlKey : !event.ctrlKey
			const altMatch = modifiers.alt ? event.altKey : !event.altKey
			const shiftMatch = modifiers.shift ? event.shiftKey : !event.shiftKey
			const metaMatch = modifiers.meta ? event.metaKey : !event.metaKey

			if (
				event.key === key &&
				ctrlMatch &&
				altMatch &&
				shiftMatch &&
				metaMatch
			) {
				if (preventDefault) {
					event.preventDefault()
				}
				if (stopPropagation) {
					event.stopPropagation()
				}
				callback()
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [key, callback, isActive, preventDefault, stopPropagation, modifiers])
}

/**
 * ESCキー専用のショートカットフック（よく使われるパターン）
 */
export function useEscapeKey(
	callback: () => void,
	isActive: boolean = true,
	preventWhen?: boolean,
) {
	useKeyboardShortcut('Escape', callback, {
		isActive: isActive && !preventWhen,
		preventDefault: false,
		stopPropagation: false,
	})
}

/**
 * 外部クリック検知フック（モーダルやポップオーバーでよく使用）
 */
export function useOutsideClick(
	ref: React.RefObject<HTMLElement>,
	callback: () => void,
	isActive: boolean = true,
) {
	useEffect(() => {
		if (!isActive) return

		const handleClickOutside = (event: MouseEvent) => {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				callback()
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [ref, callback, isActive])
}

/**
 * フローティングメニュー用の特殊処理を含むESCキーフック
 */
export function useFloatingMenuEscape(
	callback: () => void,
	isOpen: boolean,
	excludeSelector?: string,
) {
	useEffect(() => {
		if (!isOpen) return

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				callback()
			}
		}

		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Element

			// 除外セレクターがある場合はチェック
			if (excludeSelector && target?.closest?.(excludeSelector)) {
				return
			}

			// メニューパネル以外をクリックした場合
			if (target && !target.closest('[data-floating-menu-panel]')) {
				callback()
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		document.addEventListener('mousedown', handleClickOutside)

		return () => {
			document.removeEventListener('keydown', handleKeyDown)
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [isOpen, callback, excludeSelector])
}