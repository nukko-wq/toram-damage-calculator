'use client'

import React from 'react'

interface FloatingMenuButtonProps {
	isOpen: boolean
	onClick: () => void
	className?: string
}

export default function FloatingMenuButton({
	isOpen,
	onClick,
	className = '',
}: FloatingMenuButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`
				fixed bottom-4 right-4 z-[9999]
				w-14 h-14 rounded-full
				bg-blue-600 hover:bg-blue-700 active:bg-blue-800
				text-white
				shadow-lg hover:shadow-xl
				transition-all duration-200 ease-out
				hover:scale-105 active:scale-95
				focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50
				flex items-center justify-center
				${className}
			`}
			aria-label={isOpen ? 'メニューを閉じる' : 'メニューを開く'}
			aria-expanded={isOpen}
			aria-controls="floating-menu-panel"
		>
			<div
				className={`
					transition-transform duration-200 ease-out
					${isOpen ? 'rotate-90' : 'rotate-0'}
				`}
			>
				{isOpen ? (
					<svg
						className="w-6 h-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				) : (
					<svg
						className="w-6 h-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				)}
			</div>
		</button>
	)
}