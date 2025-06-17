'use client'

import type { PresetCrystal } from '@/types/calculator'

interface CrystalCardProps {
	crystal: PresetCrystal
	isSelected: boolean
	onClick: () => void
}

export default function CrystalCard({
	crystal,
	isSelected,
	onClick,
}: CrystalCardProps) {
	const getTypeLabel = (type: string) => {
		switch (type) {
			case 'weapon':
				return '武器'
			case 'armor':
				return '防具'
			case 'additional':
				return '追加'
			case 'special':
				return '特殊'
			case 'normal':
				return 'ノーマル'
			default:
				return type
		}
	}

	const getTypeColor = (type: string) => {
		switch (type) {
			case 'weapon':
				return 'bg-red-100 text-red-800'
			case 'armor':
				return 'bg-blue-100 text-blue-800'
			case 'additional':
				return 'bg-green-100 text-green-800'
			case 'special':
				return 'bg-purple-100 text-purple-800'
			case 'normal':
				return 'bg-gray-100 text-gray-800'
			default:
				return 'bg-gray-100 text-gray-800'
		}
	}

	const formatProperties = () => {
		const props = Object.entries(crystal.properties)
			.filter(([_, value]) => value !== 0)
			.map(([key, value]) => `${key}${value > 0 ? '+' : ''}${value}`)
			.slice(0, 3) // 最大3つまで表示

		return props.join(', ')
	}

	return (
		<div
			onClick={onClick}
			className={`
				relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md
				${
					isSelected
						? 'border-blue-500 bg-blue-50 shadow-md'
						: 'border-gray-200 bg-white hover:border-gray-300'
				}
			`}
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

			{/* タイプバッジ */}
			<div className="mb-2">
				<span
					className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(crystal.type)}`}
				>
					{getTypeLabel(crystal.type)}
				</span>
			</div>

			{/* クリスタ名 */}
			<h3 className="font-semibold text-gray-900 mb-2 pr-8">{crystal.name}</h3>

			{/* プロパティ */}
			<div className="text-sm text-gray-600 mb-2 min-h-[1.25rem]">
				{formatProperties()}
			</div>

			{/* 説明 */}
			{crystal.description && (
				<div className="text-xs text-gray-500 line-clamp-2">
					{crystal.description}
				</div>
			)}
		</div>
	)
}
