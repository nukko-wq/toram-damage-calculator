'use client'

import React from 'react'

interface FooterProps {
	className?: string
}

export default React.memo<FooterProps>(function Footer({ className = '' }) {
	return (
		<footer
			role="contentinfo"
			aria-label="フッター"
			className={`bg-white border-t border-gray-200 shadow-sm col-start-1 col-end-5 row-start-5 row-end-6 ${className}`}
		>
			<div className="container mx-auto px-4 py-2 sm:py-3">
				<div className="flex items-center justify-center">
					<div className="text-sm text-gray-600">
						© 2025 トーラムダメージ計算ツール
					</div>
				</div>
			</div>
		</footer>
	)
})
