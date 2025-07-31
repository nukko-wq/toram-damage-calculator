'use client'

import { useState, useCallback, useEffect } from 'react'
import {
	getLastActiveSection,
	saveLastActiveSection,
} from '@/utils/floatingMenuStorage'

export type MenuSection = 'top' | 'sample' | 'save' | 'subsystem' | 'settings'

interface UseFloatingMenuReturn {
	isOpen: boolean
	activeSection: MenuSection
	openMenu: () => void
	closeMenu: () => void
	toggleMenu: () => void
	setActiveSection: (section: MenuSection) => void
}

export function useFloatingMenu(
	initialSection: MenuSection = 'top',
): UseFloatingMenuReturn {
	const [isOpen, setIsOpen] = useState(false)

	// ローカルストレージから最後の選択状態を復元
	const [activeSection, setActiveSectionState] = useState<MenuSection>(() => {
		if (typeof window !== 'undefined') {
			return getLastActiveSection()
		}
		return initialSection
	})

	const openMenu = useCallback(() => {
		setIsOpen(true)
	}, [])

	const closeMenu = useCallback(() => {
		setIsOpen(false)
	}, [])

	const toggleMenu = useCallback(() => {
		setIsOpen((prev) => !prev)
	}, [])

	// セクション変更時にローカルストレージに保存
	const setActiveSection = useCallback((section: MenuSection) => {
		setActiveSectionState(section)
		if (typeof window !== 'undefined') {
			saveLastActiveSection(section)
		}
	}, [])

	// ESCキーでメニューを閉じる
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && isOpen) {
				closeMenu()
			}
		}

		if (isOpen) {
			document.addEventListener('keydown', handleKeyDown)
		}

		return () => {
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [isOpen, closeMenu])

	return {
		isOpen,
		activeSection,
		openMenu,
		closeMenu,
		toggleMenu,
		setActiveSection,
	}
}
