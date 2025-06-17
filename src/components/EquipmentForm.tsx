'use client'

import { useState } from 'react'
import type {
	Equipment,
	EquipmentSlots,
	EquipmentProperties,
	EquipmentCategory,
} from '@/types/calculator'
import { getEquipmentById } from '@/utils/equipmentDatabase'
import EquipmentSelectionModal from './EquipmentSelectionModal'

interface EquipmentFormProps {
	equipment: EquipmentSlots
	onEquipmentChange: (equipment: EquipmentSlots) => void
}

export default function EquipmentForm({
	equipment,
	onEquipmentChange,
}: EquipmentFormProps) {
	const [activeTab, setActiveTab] = useState<keyof EquipmentSlots>('main')
	const [modalState, setModalState] = useState<{
		isOpen: boolean
		category: EquipmentCategory | null
		title: string
	}>({
		isOpen: false,
		category: null,
		title: '',
	})

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
				'ATK_Rate',
				'ATK',
				'MATK_Rate',
				'MATK',
				'WeaponATK_Rate',
				'WeaponATK',
			] as const,
		},
		{
			title: '貫通・威力',
			properties: [
				'PhysicalPenetration_Rate',
				'MagicalPenetration_Rate',
				'ElementAdvantage_Rate',
				'UnsheatheAttack_Rate',
				'UnsheatheAttack',
				'ShortRangeDamage_Rate',
				'LongRangeDamage_Rate',
			] as const,
		},
		{
			title: 'クリティカル',
			properties: [
				'CriticalDamage_Rate',
				'CriticalDamage',
				'Critical_Rate',
				'Critical',
			] as const,
		},
		{
			title: 'HP・MP',
			properties: ['Stability_Rate', 'HP_Rate', 'HP', 'MP'] as const,
		},
		{
			title: 'ステータス',
			properties: [
				'STR_Rate',
				'STR',
				'INT_Rate',
				'INT',
				'VIT_Rate',
				'VIT',
				'AGI_Rate',
				'AGI',
				'DEX_Rate',
				'DEX',
			] as const,
		},
		{
			title: '命中・回避',
			properties: ['Accuracy_Rate', 'Accuracy', 'Dodge_Rate', 'Dodge'] as const,
		},
		{
			title: '速度',
			properties: [
				'AttackSpeed_Rate',
				'AttackSpeed',
				'CastingSpeed_Rate',
				'CastingSpeed',
			] as const,
		},
	]

	const handleEquipmentPropertyChange = (
		slotKey: keyof EquipmentSlots,
		property: keyof EquipmentProperties,
		value: string,
	) => {
		const numValue = Number.parseInt(value) || 0
		const updatedEquipment = {
			...equipment,
			[slotKey]: {
				...equipment[slotKey],
				properties: {
					...equipment[slotKey].properties,
					[property]: numValue,
				},
				// プロパティを手動変更した場合はプリセットIDをクリア
				presetId: null,
			},
		}
		onEquipmentChange(updatedEquipment)
	}

	const handlePresetEquipmentSelect = (equipmentId: string | null) => {
		if (!modalState.category) return

		const slotKey = modalState.category as keyof EquipmentSlots

		if (equipmentId === null) {
			// 装備なしを選択
			const updatedEquipment = {
				...equipment,
				[slotKey]: {
					name: '',
					properties: {},
					presetId: null,
				},
			}
			onEquipmentChange(updatedEquipment)
		} else {
			// プリセット装備を選択
			const presetEquipment = getEquipmentById(equipmentId)
			if (presetEquipment) {
				const updatedEquipment = {
					...equipment,
					[slotKey]: {
						name: presetEquipment.name,
						properties: { ...presetEquipment.properties },
						presetId: equipmentId,
					},
				}
				onEquipmentChange(updatedEquipment)
			}
		}
	}

	const openEquipmentModal = (category: EquipmentCategory, title: string) => {
		setModalState({
			isOpen: true,
			category,
			title,
		})
	}

	const closeEquipmentModal = () => {
		setModalState({
			isOpen: false,
			category: null,
			title: '',
		})
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
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-semibold text-gray-700">
						{equipmentSlots.find((slot) => slot.key === activeTab)?.label}
					</h3>
					<button
						type="button"
						onClick={() =>
							openEquipmentModal(
								activeTab as EquipmentCategory,
								equipment[activeTab].name ||
									`${equipmentSlots.find((slot) => slot.key === activeTab)?.label}を選択`,
							)
						}
						className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
					>
						{equipment[activeTab].name || 'プリセット選択'}
					</button>
				</div>

				{/* 現在選択されている装備表示 */}
				{equipment[activeTab].presetId && (
					<div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
						<span className="text-sm font-medium text-blue-800">
							プリセット: {equipment[activeTab].name}
						</span>
						<div className="text-xs text-blue-600 mt-1">
							※ 下記の値を変更するとプリセットが解除されます
						</div>
					</div>
				)}

				{renderPropertyInputs(equipment[activeTab], (property, value) =>
					handleEquipmentPropertyChange(activeTab, property, value),
				)}
			</div>

			{/* 装備選択モーダル */}
			<EquipmentSelectionModal
				isOpen={modalState.isOpen}
				onClose={closeEquipmentModal}
				onSelect={handlePresetEquipmentSelect}
				selectedEquipmentId={equipment[activeTab].presetId || null}
				category={modalState.category || 'main'}
				title={modalState.title}
			/>
		</section>
	)
}
