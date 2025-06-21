'use client'

import type { PresetEnemy } from '@/types/calculator'

interface EnemyCardProps {
	enemy: PresetEnemy
	isSelected: boolean
	onClick: () => void
}

export default function EnemyCard({
	enemy,
	isSelected,
	onClick,
}: EnemyCardProps) {
	const getCategoryLabel = (category: string) => {
		switch (category) {
			case 'mob':
				return 'モブ'
			case 'fieldBoss':
				return 'フィールドボス'
			case 'boss':
				return 'ボス'
			case 'raidBoss':
				return 'レイドボス'
			default:
				return category
		}
	}

	const getCategoryColor = (category: string) => {
		switch (category) {
			case 'mob':
				return 'bg-gray-100 text-gray-800'
			case 'fieldBoss':
				return 'bg-green-100 text-green-800'
			case 'boss':
				return 'bg-orange-100 text-orange-800'
			case 'raidBoss':
				return 'bg-red-100 text-red-800'
			default:
				return 'bg-gray-100 text-gray-800'
		}
	}

	const formatStats = () => {
		const stats = []

		// DEF表示
		if (enemy.stats.DEF > 0) {
			stats.push(`DEF ${enemy.stats.DEF}`)
		}

		// MDEF表示
		if (enemy.stats.MDEF > 0) {
			stats.push(`MDEF ${enemy.stats.MDEF}`)
		}

		// 物理耐性表示
		if (enemy.stats.physicalResistance !== 0) {
			stats.push(
				`物理耐性 ${enemy.stats.physicalResistance > 0 ? '+' : ''}${enemy.stats.physicalResistance}%`,
			)
		}

		// 魔法耐性表示
		if (enemy.stats.magicalResistance !== 0) {
			stats.push(
				`魔法耐性 ${enemy.stats.magicalResistance > 0 ? '+' : ''}${enemy.stats.magicalResistance}%`,
			)
		}

		// 最大4つまで表示
		return stats.slice(0, 4)
	}

	const statsDisplay = formatStats()

	return (
		<div
			onClick={onClick}
			className={`
				relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0
				${
					isSelected
						? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200'
						: 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
				}
			`}
			style={{
				WebkitFontSmoothing: 'antialiased',
				MozOsxFontSmoothing: 'grayscale',
				textRendering: 'optimizeLegibility',
			}}
			role="gridcell"
			tabIndex={0}
			aria-selected={isSelected}
			aria-label={`${enemy.name} レベル${enemy.level} ${getCategoryLabel(enemy.category)}${isSelected ? ' 選択中' : ''}`}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault()
					onClick()
				}
			}}
		>
			{/* 選択状態のチェックマーク */}
			{isSelected && (
				<div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
					<svg
						className="w-4 h-4 text-white"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M5 13l4 4L19 7"
						/>
					</svg>
				</div>
			)}

			{/* レベル表示（右上） */}
			<div className="absolute top-2 left-2">
				<span className="inline-block px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
					Lv.{enemy.level}
				</span>
			</div>

			{/* カテゴリバッジ */}
			<div className="mb-2 mt-6">
				<span
					className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(enemy.category)}`}
				>
					{getCategoryLabel(enemy.category)}
				</span>
			</div>

			{/* 敵名 */}
			<h3 className="font-semibold text-gray-900 mb-2 pr-8">{enemy.name}</h3>

			{/* ステータス */}
			{statsDisplay.length > 0 && (
				<div className="text-sm text-gray-600 mb-2 space-y-1">
					{statsDisplay.map((stat, index) => (
						<div key={index} className="truncate">
							{stat}
						</div>
					))}
				</div>
			)}

			{/* デフォルト敵の場合の説明 */}
			{enemy.stats.DEF === 0 && enemy.stats.MDEF === 0 && (
				<div className="text-xs text-gray-500">
					低レベル敵・ステータス調整用
				</div>
			)}
		</div>
	)
}
