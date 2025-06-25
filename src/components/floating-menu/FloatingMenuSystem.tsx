'use client'

import React from 'react'
import FloatingMenuButton from './FloatingMenuButton'
import MenuPanel from './MenuPanel'
import { useFloatingMenu } from './hooks/useFloatingMenu'

export default function FloatingMenuSystem() {
	const {
		isOpen,
		activeSection,
		toggleMenu,
		closeMenu,
		setActiveSection,
	} = useFloatingMenu()

	return (
		<>
			{/* フローティングメニューボタン */}
			<FloatingMenuButton
				isOpen={isOpen}
				onClick={toggleMenu}
			/>

			{/* メニューパネル */}
			<MenuPanel
				isOpen={isOpen}
				activeSection={activeSection}
				onSectionChange={setActiveSection}
				onClose={closeMenu}
			/>
		</>
	)
}