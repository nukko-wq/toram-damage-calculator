'use client'

import { useState } from 'react'
import {
	Equipment,
	EquipmentSlots,
	CrystalSlots,
	EquipmentProperties,
} from '@/types/calculator'

interface EquipmentFormProps {
	equipment: EquipmentSlots
	crystals: CrystalSlots
	onEquipmentChange: (equipment: EquipmentSlots) => void
	onCrystalsChange: (crystals: CrystalSlots) => void
}

export default function EquipmentForm({
	equipment,
	crystals,
	onEquipmentChange,
	onCrystalsChange,
}: EquipmentFormProps) {
	const [activeTab, setActiveTab] = useState<'equipment' | 'crystals'>(
		'equipment',
	)

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

	const crystalSlots = [
		{ key: 'weapon1' as const, label: '武器クリスタ1' },
		{ key: 'weapon2' as const, label: '武器クリスタ2' },
		{ key: 'armor1' as const, label: '防具クリスタ1' },
		{ key: 'armor2' as const, label: '防具クリスタ2' },
		{ key: 'additional1' as const, label: '追加クリスタ1' },
		{ key: 'additional2' as const, label: '追加クリスタ2' },
		{ key: 'special1' as const, label: '特殊クリスタ1' },
		{ key: 'special2' as const, label: '特殊クリスタ2' },
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

	const handleCrystalPropertyChange = (
		slotKey: keyof CrystalSlots,
		property: keyof EquipmentProperties,
		value: string,
	) => {
		const numValue = parseInt(value) || 0
		const updatedCrystals = {
			...crystals,
			[slotKey]: {
				...crystals[slotKey],
				properties: {
					...crystals[slotKey].properties,
					[property]: numValue,
				},
			},
		}
		onCrystalsChange(updatedCrystals)
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
								<label className="text-xs text-gray-600 mb-1">{property}</label>
								<input
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
		<div className="bg-white rounded-lg shadow-md p-6">
			<h2 className="text-xl font-bold text-gray-800 mb-4">装備・クリスタ</h2>

			{/* タブ切り替え */}
			<div className="flex border-b border-gray-200 mb-4">
				<button
					onClick={() => setActiveTab('equipment')}
					className={`px-4 py-2 font-medium text-sm ${
						activeTab === 'equipment'
							? 'text-blue-600 border-b-2 border-blue-600'
							: 'text-gray-500 hover:text-gray-700'
					}`}
				>
					装備
				</button>
				<button
					onClick={() => setActiveTab('crystals')}
					className={`px-4 py-2 font-medium text-sm ${
						activeTab === 'crystals'
							? 'text-blue-600 border-b-2 border-blue-600'
							: 'text-gray-500 hover:text-gray-700'
					}`}
				>
					クリスタ
				</button>
			</div>

			{/* 装備タブ */}
			{activeTab === 'equipment' && (
				<div className="space-y-6">
					{equipmentSlots.map(({ key, label }) => (
						<div key={key} className="border rounded-lg p-4">
							<h3 className="text-lg font-semibold text-gray-700 mb-4">
								{label}
							</h3>
							{renderPropertyInputs(equipment[key], (property, value) =>
								handleEquipmentPropertyChange(key, property, value),
							)}
						</div>
					))}
				</div>
			)}

			{/* クリスタタブ */}
			{activeTab === 'crystals' && (
				<div className="space-y-6">
					{crystalSlots.map(({ key, label }) => (
						<div key={key} className="border rounded-lg p-4">
							<h3 className="text-lg font-semibold text-gray-700 mb-4">
								{label}
							</h3>
							{renderPropertyInputs(crystals[key], (property, value) =>
								handleCrystalPropertyChange(key, property, value),
							)}
						</div>
					))}
				</div>
			)}
		</div>
	)
}
