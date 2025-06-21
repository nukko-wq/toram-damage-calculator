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

	return (
		<button
			type="button"
			onClick={onClick}
			className={`
				relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 w-full text-left
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
			aria-pressed={isSelected}
			aria-label={`${enemy.name} レベル${enemy.level} ${getCategoryLabel(enemy.category)}${isSelected ? ' 選択中' : ''}`}
		>
			{/* 選択状態のチェックマーク */}
			{isSelected && (
				<div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
					<svg
						className="w-4 h-4 text-white"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
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
		</button>
	)
}
