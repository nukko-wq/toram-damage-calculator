'use client'

import React from 'react'
import { useCalculatorStore, useUIStore } from '@/stores'
import HeaderTitle from './HeaderTitle'
import HeaderActions from './HeaderActions'

interface HeaderProps {
	className?: string
}

export default React.memo<HeaderProps>(function Header({ className = '' }) {
	const { showSaveManager, setShowSaveManager } = useUIStore()

	return (
		<header
			role="banner"
			aria-label="メインヘッダー"
			className={`sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm ${className}`}
		>
			<div className="container mx-auto px-4 py-3">
				<div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:justify-between md:items-center">
					{/* サイトタイトル */}
					<HeaderTitle />

					{/* アクションボタン */}
					<nav role="navigation" aria-label="ヘッダーアクション">
						<HeaderActions
							showSaveManager={showSaveManager}
							onToggleSaveManager={() => setShowSaveManager(!showSaveManager)}
						/>
					</nav>
				</div>
			</div>
		</header>
	)
})
