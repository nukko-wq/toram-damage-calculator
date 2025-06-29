'use client'

import { useState, useCallback, useEffect } from 'react'

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
	const [activeSection, setActiveSection] =
		useState<MenuSection>(initialSection)

	const openMenu = useCallback(() => {
		setIsOpen(true)
	}, [])

	const closeMenu = useCallback(() => {
		setIsOpen(false)
	}, [])

	const toggleMenu = useCallback(() => {
		setIsOpen((prev) => !prev)
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
