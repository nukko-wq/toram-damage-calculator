'use client'

import type { PresetEquipment } from '@/types/calculator'

interface EquipmentCardProps {
	equipment: PresetEquipment
	isSelected: boolean
	onClick: () => void
}

export default function EquipmentCard({
	equipment,
	isSelected,
	onClick,
}: EquipmentCardProps) {
	const getTypeLabel = (type: string) => {
		switch (type) {
			case 'weapon':
				return '武器'
			case 'armor':
				return '防具'
			case 'accessory':
				return 'アクセサリ'
			case 'fashion':
				return 'オシャレ'
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
			case 'accessory':
				return 'bg-green-100 text-green-800'
			case 'fashion':
				return 'bg-purple-100 text-purple-800'
			default:
				return 'bg-gray-100 text-gray-800'
		}
	}

	const formatBaseStats = () => {
		const stats = Object.entries(equipment.baseStats)
			.filter(([_, value]) => value !== undefined && value !== 0)
			.map(([key, value]) => `${key}${value > 0 ? '+' : ''}${value}`)
			.slice(0, 2) // 最大2つまで表示

		return stats.length > 0 ? stats.join(', ') : ''
	}

	const formatProperties = () => {
		const props = Object.entries(equipment.properties)
			.filter(([_, value]) => value !== 0)
			.map(
				([key, value]) =>
					`${key}${value > 0 ? '+' : ''}${value}${key.includes('%') ? '' : ''}`,
			)
			.slice(0, 3) // 最大3つまで表示

		return props.length > 0 ? props.join(', ') : ''
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
					className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(equipment.type)}`}
				>
					{getTypeLabel(equipment.type)}
				</span>
			</div>

			{/* 装備名 */}
			<h3 className="font-semibold text-gray-900 mb-2 pr-8">
				{equipment.name}
			</h3>

			{/* 基本ステータス */}
			{formatBaseStats() && (
				<div className="text-sm text-blue-600 mb-2 font-medium">
					{formatBaseStats()}
				</div>
			)}

			{/* プロパティ */}
			{formatProperties() && (
				<div className="text-sm text-gray-600 mb-2 min-h-[1.25rem]">
					{formatProperties()}
				</div>
			)}

			{/* 説明 */}
			{equipment.description && (
				<div className="text-xs text-gray-500 line-clamp-2 mb-1">
					{equipment.description}
				</div>
			)}

			{/* 入手方法 */}
			{equipment.source && (
				<div className="text-xs text-gray-400">入手: {equipment.source}</div>
			)}
		</div>
	)
}
