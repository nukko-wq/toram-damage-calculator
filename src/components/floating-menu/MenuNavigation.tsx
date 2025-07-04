'use client'

import type React from 'react'
import type { MenuSection } from './hooks/useFloatingMenu'

interface MenuNavigationProps {
	activeSection: MenuSection
	onSectionChange: (section: MenuSection) => void
}

interface MenuItem {
	id: MenuSection
	label: string
	icon: React.ReactNode
	description: string
}

const menuItems: MenuItem[] = [
	{
		id: 'top',
		label: 'TOP',
		description: 'ダッシュボード',
		icon: (
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
					d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
				/>
			</svg>
		),
	},
	{
		id: 'sample',
		label: 'サンプルデータ',
		description: 'プリセット読み込み',
		icon: (
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
					d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
				/>
			</svg>
		),
	},
	{
		id: 'save',
		label: 'セーブデータ',
		description: 'データ管理',
		icon: (
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
					d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
				/>
			</svg>
		),
	},
	{
		id: 'subsystem',
		label: 'サブシステム',
		description: '追加ツール',
		icon: (
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
					d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
				/>
			</svg>
		),
	},
	{
		id: 'settings',
		label: '設定',
		description: 'アプリ設定',
		icon: (
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
					d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
				/>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
				/>
			</svg>
		),
	},
]

export default function MenuNavigation({
	activeSection,
	onSectionChange,
}: MenuNavigationProps) {
	return (
		<nav
			className="w-30 bg-gray-50 border-r border-gray-200 flex flex-col"
			role="navigation"
			aria-label="メニューナビゲーション"
		>
			{menuItems.map((item) => (
				<button
					key={item.id}
					type="button"
					onClick={() => onSectionChange(item.id)}
					className={`
						cursor-pointer
						w-full p-3 text-left transition-colors duration-150
						hover:bg-gray-100 focus:outline-none focus:bg-gray-100
						border-b border-gray-100 last:border-b-0
						${
							activeSection === item.id
								? 'bg-blue-50 text-blue-700 border-r-2 border-r-blue-500'
								: 'text-gray-700'
						}
					`}
					aria-selected={activeSection === item.id}
					aria-current={activeSection === item.id ? 'page' : undefined}
					title={item.description}
				>
					<div className="flex items-center space-x-2">
						<div
							className={`
							flex-shrink-0
							${activeSection === item.id ? 'text-blue-600' : 'text-gray-500'}
						`}
						>
							{item.icon}
						</div>
						<div className="min-w-0 flex-1">
							<div className="text-xs sm:text-sm font-medium truncate">
								{item.label}
							</div>
						</div>
					</div>
				</button>
			))}
		</nav>
	)
}
