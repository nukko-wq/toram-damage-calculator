'use client'

import type { EquipmentSlots } from '@/types/calculator'

interface EquipmentSlotTabsProps {
	activeTab: keyof EquipmentSlots | 'register'
	onTabChange: (tab: keyof EquipmentSlots | 'register') => void
}

export default function EquipmentSlotTabs({
	activeTab,
	onTabChange,
}: EquipmentSlotTabsProps) {
	const equipmentSlots = [
		{ key: 'mainWeapon' as const, label: 'メイン装備' },
		{ key: 'body' as const, label: '体装備' },
		{ key: 'additional' as const, label: '追加装備' },
		{ key: 'special' as const, label: '特殊装備' },
		{ key: 'subWeapon' as const, label: 'サブ武器' },
		{ key: 'fashion1' as const, label: 'オシャレ1' },
		{ key: 'fashion2' as const, label: 'オシャレ2' },
		{ key: 'fashion3' as const, label: 'オシャレ3' },
		{ key: 'register' as const, label: 'レジスタ他' },
		{ key: 'freeInput1' as const, label: '自由入力1' },
		{ key: 'freeInput2' as const, label: '自由入力2' },
		{ key: 'freeInput3' as const, label: '自由入力3' },
	]

	return (
		<div className="mb-6">
			<nav className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
				{equipmentSlots.map(({ key, label }) => (
					<button
						key={key}
						type="button"
						onClick={() => onTabChange(key)}
						className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
							activeTab === key
								? 'bg-blue-500/80 text-white'
								: 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
						}`}
					>
						{label}
					</button>
				))}
			</nav>
		</div>
	)
}