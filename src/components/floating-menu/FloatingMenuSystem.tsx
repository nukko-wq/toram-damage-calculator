'use client'

import CrystalCustomSystem from './content/subsystem/crystal/CrystalCustomSystem'
import FloatingMenuButton from './FloatingMenuButton'
import { useFloatingMenu } from './hooks/useFloatingMenu'
import MenuPanel from './MenuPanel'

export default function FloatingMenuSystem() {
	const { isOpen, activeSection, toggleMenu, closeMenu, setActiveSection } =
		useFloatingMenu()

	return (
		<>
			{/* フローティングメニューボタン */}
			<FloatingMenuButton isOpen={isOpen} onClick={toggleMenu} />

			{/* メニューパネル */}
			<MenuPanel
				isOpen={isOpen}
				activeSection={activeSection}
				onSectionChange={setActiveSection}
				onClose={closeMenu}
			/>

			{/* クリスタルカスタムシステム */}
			<CrystalCustomSystem />
		</>
	)
}
