'use client'

import { useCallback, useEffect, useState } from 'react'

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

/**
 * レスポンシブ対応と状態管理を統合するフック
 * StatusPreviewで使用される複雑な状態管理を最適化
 */
export function useResponsiveStateManager<T extends Record<string, boolean>>(
	initialVisibleSections: T,
	initialActiveSection: keyof T | null,
	breakpoint = '(max-width: 639px)',
) {
	const [isMobile, setIsMobile] = useState(false)
	const [visibleSections, setVisibleSections] = useState(initialVisibleSections)
	const [activeSection, setActiveSection] = useState<keyof T | null>(initialActiveSection)

	// ブレークポイント監視の最適化
	useEffect(() => {
		const mediaQuery = window.matchMedia(breakpoint)
		const handleChange = () => {
			setIsMobile(mediaQuery.matches)
			// モバイル切り替え時に初期状態に設定
			if (mediaQuery.matches) {
				// モバイルでは基本セクションを初期表示
				setActiveSection(initialActiveSection)
				setVisibleSections(initialVisibleSections)
			}
		}

		handleChange() // 初期状態設定
		mediaQuery.addEventListener('change', handleChange)
		return () => mediaQuery.removeEventListener('change', handleChange)
	}, [breakpoint, initialVisibleSections, initialActiveSection])

	// セクション表示の切り替え
	const toggleSection = useCallback((section: keyof T) => {
		setVisibleSections((prev) => ({
			...prev,
			[section]: !prev[section],
		}))
	}, [])

	// モバイル用セクション切り替え処理
	const handleMobileSectionChange = useCallback((section: keyof T) => {
		// 現在選択中のセクションと同じ場合はトグル（非表示）
		if (activeSection === section && visibleSections[section]) {
			setActiveSection(null) // アクティブセクションをクリア
			setVisibleSections((prev) => {
				const newState = { ...prev }
				for (const key in newState) {
					newState[key] = false as T[typeof key]
				}
				return newState
			})
		} else {
			// 新しいセクションを選択
			setActiveSection(section)
			setVisibleSections((prev) => {
				const newState = { ...prev }
				for (const key in newState) {
					newState[key] = false as T[typeof key]
				}
				newState[section] = true as T[typeof section]
				return newState
			})
		}
	}, [activeSection, visibleSections])

	return {
		isMobile,
		visibleSections,
		activeSection,
		toggleSection,
		handleMobileSectionChange,
		setVisibleSections,
		setActiveSection,
	}
}