'use client'

import { useState } from 'react'
import type { BuffItemFormData, BuffItemCategory } from '@/types/calculator'
import { useCalculatorStore } from '@/stores'
import { getBuffItemById } from '@/utils/buffItemDatabase'
import {
	buffItemCategoryNameMap,
	getDefaultBuffItems,
} from '@/utils/buffItemDefaults'
import BuffItemSelectionModal from './BuffItemSelectionModal'

interface BuffItemFormProps {
	// Zustand移行後は不要（後方互換性のため残存）
	buffItems?: BuffItemFormData
	onBuffItemsChange?: (buffItems: BuffItemFormData) => void
}

export default function BuffItemForm({ onBuffItemsChange }: BuffItemFormProps) {
	// Zustandストアからバフアイテムデータを取得
	const storeBuffItems = useCalculatorStore((state) => state.data.buffItems)
	const updateBuffItems = useCalculatorStore((state) => state.updateBuffItems)

	// Zustandストアの値を使用（完全移行）
	const effectiveBuffItems = storeBuffItems || getDefaultBuffItems()

	const [modalState, setModalState] = useState<{
		isOpen: boolean
		category: BuffItemCategory | null
		title: string
	}>({
		isOpen: false,
		category: null,
		title: '',
	})

	// バフアイテムカテゴリの定義（表示順序込み）
	const buffItemCategories: Array<{
		key: BuffItemCategory
		label: string
	}> = [
		{ key: 'physicalPower', label: '物理威力' },
		{ key: 'magicalPower', label: '魔法威力' },
		{ key: 'physicalDefense', label: '物理防御' },
		{ key: 'magicalDefense', label: '魔法防御' },
		{ key: 'elementalAttack', label: '属性攻撃' },
		{ key: 'elementalDefense', label: '属性防御' },
		{ key: 'speed', label: '速度' },
		{ key: 'casting', label: '詠唱' },
		{ key: 'mp', label: 'MP' },
		{ key: 'hp', label: 'HP' },
		{ key: 'accuracy', label: '命中' },
		{ key: 'evasion', label: '回避' },
	]

	const handleOpenModal = (category: BuffItemCategory) => {
		setModalState({
			isOpen: true,
			category,
			title: `${buffItemCategoryNameMap[category]}バフアイテム選択`,
		})
	}

	const handleCloseModal = () => {
		setModalState({
			isOpen: false,
			category: null,
			title: '',
		})
	}

	const handleSelectBuffItem = (buffItemId: string | null) => {
		if (!modalState.category) return

		const updatedBuffItems = {
			...effectiveBuffItems,
			[modalState.category]: buffItemId,
		}

		// Zustandストアを更新
		updateBuffItems(updatedBuffItems)

		// 後方互換性のため従来のonChangeも呼び出し
		if (onBuffItemsChange) {
			onBuffItemsChange(updatedBuffItems)
		}
	}

	const getSelectedBuffItemName = (category: BuffItemCategory): string => {
		const selectedId = effectiveBuffItems[category]
		if (!selectedId) return 'なし'

		const buffItem = getBuffItemById(selectedId)
		return buffItem ? buffItem.name : 'なし'
	}

	const formatBuffItemProperties = (category: BuffItemCategory): string => {
		const selectedId = effectiveBuffItems[category]
		if (!selectedId) return ''

		const buffItem = getBuffItemById(selectedId)
		if (!buffItem) return ''

		const props = Object.entries(buffItem.properties)
			.filter(([_, value]) => value !== 0)
			.map(([key, value]) => {
				// プロパティ名を簡潔に表示
				const propName = key
					.replace('_Rate', '%')
					.replace('PhysicalPenetration_Rate', '物理貫通%')
					.replace('MagicalPenetration_Rate', '魔法貫通%')
					.replace('ElementAdvantage_Rate', '属性有利%')
					.replace('PhysicalResistance_Rate', '物理耐性%')
					.replace('MagicalResistance_Rate', '魔法耐性%')
					.replace('ATK_Rate', 'ATK%')
					.replace('MATK_Rate', 'MATK%')
					.replace('DEF_Rate', 'DEF%')
					.replace('HP_Rate', 'HP%')
					.replace('MP_Rate', 'MP%')
					.replace('AttackSpeed', '攻撃速度')
					.replace('CastingSpeed', '詠唱速度')

				return `${propName}${value > 0 ? '+' : ''}${value}`
			})
			.slice(0, 2) // 最大2つまで表示

		return props.join(', ')
	}

	// バフアイテム選択ボタンコンポーネント
	const BuffItemButton = ({
		category,
		label,
	}: {
		category: BuffItemCategory
		label: string
	}) => {
		const selectedName = getSelectedBuffItemName(category)
		const properties = formatBuffItemProperties(category)
		const hasSelection = effectiveBuffItems[category] !== null

		return (
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">
					{label}
				</label>
				<button
					type="button"
					onClick={() => handleOpenModal(category)}
					className={`
						w-full p-3 rounded-md border text-left transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
						${
							hasSelection
								? 'border-blue-300 bg-blue-50'
								: 'border-gray-300 bg-white'
						}
					`}
				>
					<div className="flex items-center justify-between">
						<div className="flex-1 min-w-0">
							<div
								className={`text-sm font-medium truncate ${
									hasSelection ? 'text-blue-900' : 'text-gray-500'
								}`}
							>
								{selectedName}
							</div>
							{properties && (
								<div className="text-xs text-gray-600 mt-1 truncate">
									{properties}
								</div>
							)}
						</div>
						<div className="ml-2 flex-shrink-0">
							<svg
								className="w-5 h-5 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</div>
					</div>
				</button>
			</div>
		)
	}

	return (
		<div className="rounded-lg border border-gray-200 bg-white p-4 col-start-2 col-end-4 row-start-5 row-end-6">
			<h3 className="mb-4 text-base font-semibold text-gray-900">
				バフアイテム設定
			</h3>

			{/* 12カテゴリのバフアイテム選択ボタン */}
			<div className="grid grid-cols-2 gap-4">
				{buffItemCategories.map(({ key, label }) => (
					<BuffItemButton key={key} category={key} label={label} />
				))}
			</div>

			{/* 説明テキスト */}
			<div className="mt-4 text-xs text-gray-500">
				各カテゴリから1つずつバフアイテムを選択できます。クリックしてアイテムを選択してください。
			</div>

			{/* バフアイテム選択モーダル */}
			{modalState.category && (
				<BuffItemSelectionModal
					isOpen={modalState.isOpen}
					onClose={handleCloseModal}
					onSelect={handleSelectBuffItem}
					selectedBuffItemId={effectiveBuffItems[modalState.category]}
					category={modalState.category}
					title={modalState.title}
				/>
			)}
		</div>
	)
}
