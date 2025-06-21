'use client'

import type { PresetBuffItem } from '@/types/calculator'

interface BuffItemCardProps {
	buffItem: PresetBuffItem
	isSelected: boolean
	onClick: () => void
}

export default function BuffItemCard({
	buffItem,
	isSelected,
	onClick,
}: BuffItemCardProps) {
	const getCategoryLabel = (category: string) => {
		switch (category) {
			case 'physicalPower':
				return '物理威力'
			case 'magicalPower':
				return '魔法威力'
			case 'physicalDefense':
				return '物理防御'
			case 'magicalDefense':
				return '魔法防御'
			case 'elementalAttack':
				return '属性攻撃'
			case 'elementalDefense':
				return '属性防御'
			case 'speed':
				return '速度'
			case 'casting':
				return '詠唱'
			case 'mp':
				return 'MP'
			case 'hp':
				return 'HP'
			case 'accuracy':
				return '命中'
			case 'evasion':
				return '回避'
			default:
				return category
		}
	}

	const getCategoryColor = (category: string) => {
		switch (category) {
			case 'physicalPower':
				return 'bg-red-100 text-red-800'
			case 'magicalPower':
				return 'bg-purple-100 text-purple-800'
			case 'physicalDefense':
				return 'bg-blue-100 text-blue-800'
			case 'magicalDefense':
				return 'bg-indigo-100 text-indigo-800'
			case 'elementalAttack':
				return 'bg-orange-100 text-orange-800'
			case 'elementalDefense':
				return 'bg-emerald-100 text-emerald-800'
			case 'speed':
				return 'bg-yellow-100 text-yellow-800'
			case 'casting':
				return 'bg-cyan-100 text-cyan-800'
			case 'mp':
				return 'bg-blue-100 text-blue-800'
			case 'hp':
				return 'bg-green-100 text-green-800'
			case 'accuracy':
				return 'bg-amber-100 text-amber-800'
			case 'evasion':
				return 'bg-pink-100 text-pink-800'
			default:
				return 'bg-gray-100 text-gray-800'
		}
	}

	const formatProperties = () => {
		const props = Object.entries(buffItem.properties)
			.filter(([_, value]) => value !== 0)
			.map(([key, value]) => {
				// プロパティ名を日本語に変換
				const propName = key
					.replace('_Rate', '%')
					.replace('PhysicalPenetration_Rate', '物理貫通%')
					.replace('MagicalPenetration_Rate', '魔法貫通%')
					.replace('ElementAdvantage_Rate', '属性有利%')
					.replace('PhysicalResistance_Rate', '物理耐性%')
					.replace('MagicalResistance_Rate', '魔法耐性%')
					.replace('FireResistance_Rate', '火耐性%')
					.replace('WaterResistance_Rate', '水耐性%')
					.replace('EarthResistance_Rate', '地耐性%')
					.replace('WindResistance_Rate', '風耐性%')
					.replace('LightResistance_Rate', '光耐性%')
					.replace('DarkResistance_Rate', '闇耐性%')
					.replace('NeutralResistance_Rate', '無耐性%')
					.replace('ATK_Rate', 'ATK%')
					.replace('MATK_Rate', 'MATK%')
					.replace('DEF_Rate', 'DEF%')
					.replace('HP_Rate', 'HP%')
					.replace('MP_Rate', 'MP%')
					.replace('Accuracy_Rate', '命中%')
					.replace('AttackSpeed', '攻撃速度')
					.replace('CastingSpeed', '詠唱速度')
					.replace('Accuracy', '命中')
					.replace('Dodge', '回避')
					.replace('ATK', 'ATK')
					.replace('MATK', 'MATK')
					.replace('HP', 'HP')
					.replace('MP', 'MP')

				return `${propName}${value > 0 ? '+' : ''}${value}`
			})
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

			{/* カテゴリバッジ */}
			<div className="mb-2">
				<span
					className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(buffItem.category)}`}
				>
					{getCategoryLabel(buffItem.category)}
				</span>
			</div>

			{/* バフアイテム名 */}
			<h3 className="font-semibold text-gray-900 mb-2 pr-8">{buffItem.name}</h3>

			{/* プロパティ */}
			<div className="text-sm text-gray-600 mb-2 min-h-[1.25rem]">
				{formatProperties()}
			</div>

			{/* 効果説明（プロパティから生成） */}
			<div className="text-xs text-gray-500">
				{Object.keys(buffItem.properties).length}種類の効果
			</div>
		</div>
	)
}
