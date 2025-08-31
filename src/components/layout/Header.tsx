'use client'

import Link from 'next/link'
import React from 'react'
import HeaderTitle from './HeaderTitle'

interface HeaderProps {
	className?: string
}

export default React.memo<HeaderProps>(function Header({ className = '' }) {
	return (
		<header
			role="banner"
			aria-label="メインヘッダー"
			className={`bg-white border-b border-gray-200 shadow-sm col-start-1 col-end-5 row-start-1 row-end-2 ${className}`}
		>
			<div className="container mx-auto px-4 py-2 sm:py-3">
				<div className="flex flex-col sm:gap-4 md:flex-row md:justify-between md:items-center">
					{/* サイトタイトル */}
					<HeaderTitle />

					{/* ナビゲーション */}
					<nav className="flex flex-wrap gap-4">
						<Link
							href="/"
							className="text-blue-600 hover:text-blue-800 transition-colors"
						>
							メイン計算機
						</Link>
						<Link
							href="/necromancer-skills"
							className="text-blue-600 hover:text-blue-800 transition-colors"
						>
							ネクロマンサー検証
						</Link>
					</nav>
				</div>
			</div>
		</header>
	)
})
