'use client'

import { useEffect, useRef } from 'react'

import MenuContent from './MenuContent'
import MenuNavigation from './MenuNavigation'
import type { MenuSection } from './hooks/useFloatingMenu'

interface MenuPanelProps {
	isOpen: boolean
	activeSection: MenuSection
	onSectionChange: (section: MenuSection) => void
	onClose: () => void
}

export default function MenuPanel({
	isOpen,
	activeSection,
	onSectionChange,
	onClose,
}: MenuPanelProps) {
	const panelRef = useRef<HTMLDivElement>(null)

	// パネル外クリックで閉じる
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node

			// FloatingMenuButtonをクリックした場合は何もしない
			const isFloatingMenuButton = (target as Element)?.closest?.(
				'[aria-controls="floating-menu-panel"]',
			)

			if (
				isOpen &&
				panelRef.current &&
				!panelRef.current.contains(target) &&
				!isFloatingMenuButton
			) {
				onClose()
			}
		}

		if (isOpen) {
			// 少し遅延させてイベントリスナーを追加（ボタンクリックとの競合を避ける）
			const timeoutId = setTimeout(() => {
				document.addEventListener('mousedown', handleClickOutside)
			}, 100)

			return () => {
				clearTimeout(timeoutId)
				document.removeEventListener('mousedown', handleClickOutside)
			}
		}
	}, [isOpen, onClose])

	if (!isOpen) return null

	return (
		<>
			{/* メニューパネル */}
			<div
				ref={panelRef}
				id="floating-menu-panel"
				className={`
					fixed top-20 right-2 sm:right-4 z-[9999]
					w-96 lg:w-[500px] max-w-[calc(100vw-1rem)]
					max-h-[calc(100vh-6rem)]
					bg-white rounded-lg shadow-2xl
					border border-gray-200
					transform transition-all duration-200 ease-out
					${isOpen ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 translate-x-4'}
				`}
				role="dialog"
				aria-modal="true"
				aria-labelledby="floating-menu-title"
			>
				{/* ヘッダー */}
				<div className="flex items-center justify-between p-4 border-b border-gray-200">
					<h2
						id="floating-menu-title"
						className="sm:text-lg font-semibold text-gray-900"
					>
						メニュー
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150"
						aria-label="メニューを閉じる"
					>
						<svg
							className="w-5 h-5"
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
					</button>
				</div>

				{/* メインコンテンツ */}
				<div className="flex h-80 lg:h-[420px]">
					{/* 左カラム - ナビゲーション */}
					<MenuNavigation
						activeSection={activeSection}
						onSectionChange={onSectionChange}
					/>

					{/* 右カラム - コンテンツ */}
					<MenuContent activeSection={activeSection} />
				</div>
			</div>
		</>
	)
}
