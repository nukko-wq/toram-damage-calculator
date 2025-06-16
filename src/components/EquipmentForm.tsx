'use client'

import { useState } from 'react'
import {
	Equipment,
	EquipmentSlots,
	EquipmentProperties,
} from '@/types/calculator'

interface EquipmentFormProps {
	equipment: EquipmentSlots
	onEquipmentChange: (equipment: EquipmentSlots) => void
}

export default function EquipmentForm({
	equipment,
	onEquipmentChange,
}: EquipmentFormProps) {
	const [activeTab, setActiveTab] = useState<keyof EquipmentSlots>('main')

	const equipmentSlots = [
		{ key: 'main' as const, label: 'メイン装備' },
		{ key: 'body' as const, label: '体装備' },
		{ key: 'additional' as const, label: '追加装備' },
		{ key: 'special' as const, label: '特殊装備' },
		{ key: 'subWeapon' as const, label: 'サブ武器' },
		{ key: 'fashion1' as const, label: 'オシャレ1' },
		{ key: 'fashion2' as const, label: 'オシャレ2' },
		{ key: 'fashion3' as const, label: 'オシャレ3' },
	]

	const propertyGroups = [
		{
			title: '攻撃力',
			properties: [
				'ATK%',
				'ATK',
				'MATK%',
				'MATK',
				'武器ATK%',
				'武器ATK',
			] as const,
		},
		{
			title: '貫通・威力',
			properties: [
				'物理貫通%',
				'魔法貫通%',
				'属性有利%',
				'抜刀威力%',
				'抜刀威力',
				'近距離威力%',
				'遠距離威力%',
			] as const,
		},
		{
			title: 'クリティカル',
			properties: [
				'クリティカルダメージ%',
				'クリティカルダメージ',
				'クリティカル率%',
				'クリティカル率',
			] as const,
		},
		{
			title: 'HP・MP',
			properties: ['安定率%', 'HP%', 'HP', 'MP'] as const,
		},
		{
			title: 'ステータス',
			properties: [
				'STR%',
				'STR',
				'INT%',
				'INT',
				'VIT%',
				'VIT',
				'AGI%',
				'AGI',
				'DEX%',
				'DEX',
			] as const,
		},
		{
			title: '命中・回避',
			properties: ['命中%', '命中', '回避%', '回避'] as const,
		},
		{
			title: '速度',
			properties: ['攻撃速度%', '攻撃速度', '詠唱速度%', '詠唱速度'] as const,
		},
	]

	const handleEquipmentPropertyChange = (
		slotKey: keyof EquipmentSlots,
		property: keyof EquipmentProperties,
		value: string,
	) => {
		const numValue = parseInt(value) || 0
		const updatedEquipment = {
			...equipment,
			[slotKey]: {
				...equipment[slotKey],
				properties: {
					...equipment[slotKey].properties,
					[property]: numValue,
				},
			},
		}
		onEquipmentChange(updatedEquipment)
	}

	const renderPropertyInputs = (
		item: Equipment,
		onPropertyChange: (
			property: keyof EquipmentProperties,
			value: string,
		) => void,
	) => (
		<div className="space-y-4">
			{propertyGroups.map((group) => (
				<div key={group.title} className="border rounded-lg p-4">
					<h4 className="font-medium text-gray-700 mb-3">{group.title}</h4>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
						{group.properties.map((property) => (
							<div key={property} className="flex flex-col">
								<label
									htmlFor={`${item.name}-${property}`}
									className="text-xs text-gray-600 mb-1"
								>
									{property}
								</label>
								<input
									id={`${item.name}-${property}`}
									type="number"
									value={item.properties[property] || 0}
									onChange={(e) => onPropertyChange(property, e.target.value)}
									className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	)

	return (
		<section className="bg-white rounded-lg shadow-md p-6 lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-4">
			<h2 className="text-xl font-bold text-gray-800 mb-4">装備</h2>

			{/* タブヘッダー */}
			<div className="border-b border-gray-200 mb-6">
				<nav className="grid grid-cols-4 gap-2">
					{equipmentSlots.map(({ key, label }) => (
						<button
							key={key}
							type="button"
							onClick={() => setActiveTab(key)}
							className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
								activeTab === key
									? 'bg-blue-500 text-white border-b-2 border-blue-500'
									: 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
							}`}
						>
							{label}
						</button>
					))}
				</nav>
			</div>

			{/* タブコンテンツ */}
			<div className="space-y-4">
				<h3 className="text-lg font-semibold text-gray-700">
					{equipmentSlots.find((slot) => slot.key === activeTab)?.label}
				</h3>
				{renderPropertyInputs(equipment[activeTab], (property, value) =>
					handleEquipmentPropertyChange(activeTab, property, value),
				)}
			</div>
		</section>
	)
}
