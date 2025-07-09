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

		// 装備フォームと同じプロパティ名マッピング
		const propertyNameMap: Record<string, string> = {
			// 基本攻撃力系
			ATK_Rate: 'ATK',
			ATK: 'ATK',
			MATK_Rate: 'MATK',
			MATK: 'MATK',
			WeaponATK_Rate: '武器ATK',
			WeaponATK: '武器ATK',

			// 防御力系
			DEF_Rate: 'DEF',
			DEF: 'DEF',
			MDEF_Rate: 'MDEF',
			MDEF: 'MDEF',

			// 貫通系
			PhysicalPenetration_Rate: '物理貫通',
			MagicalPenetration_Rate: '魔法貫通',
			ElementAdvantage_Rate: '属性有利',

			// 威力系
			UnsheatheAttack_Rate: '抜刀威力',
			UnsheatheAttack: '抜刀威力',
			ShortRangeDamage_Rate: '近距離威力',
			LongRangeDamage_Rate: '遠距離威力',

			// クリティカル系
			CriticalDamage_Rate: 'ｸﾘﾃｨｶﾙﾀﾞﾒｰｼﾞ',
			CriticalDamage: 'ｸﾘﾃｨｶﾙﾀﾞﾒｰｼﾞ',
			Critical_Rate: 'ｸﾘﾃｨｶﾙ率',
			Critical: 'ｸﾘﾃｨｶﾙ率',

			// 安定率
			Stability_Rate: '安定率',

			// HP/MP系
			HP_Rate: 'HP',
			HP: 'HP',
			MP_Rate: 'MP',
			MP: 'MP',

			// ステータス系
			STR_Rate: 'STR',
			STR: 'STR',
			INT_Rate: 'INT',
			INT: 'INT',
			VIT_Rate: 'VIT',
			VIT: 'VIT',
			AGI_Rate: 'AGI',
			AGI: 'AGI',
			DEX_Rate: 'DEX',
			DEX: 'DEX',
			CRT_Rate: 'CRT',
			CRT: 'CRT',
			MEN_Rate: 'MEN',
			MEN: 'MEN',
			TEC_Rate: 'TEC',
			TEC: 'TEC',
			LUK_Rate: 'LUK',
			LUK: 'LUK',

			// 命中・回避系
			Accuracy_Rate: '命中',
			Accuracy: '命中',
			Dodge_Rate: '回避',
			Dodge: '回避',

			// 速度系
			AttackSpeed_Rate: '攻撃速度',
			AttackSpeed: '攻撃速度',
			CastingSpeed_Rate: '詠唱速度',
			CastingSpeed: '詠唱速度',

			// 耐性系
			PhysicalResistance_Rate: '物理耐性',
			MagicalResistance_Rate: '魔法耐性',

			// 属性耐性
			FireResistance_Rate: '火耐性',
			WaterResistance_Rate: '水耐性',
			WindResistance_Rate: '風耐性',
			EarthResistance_Rate: '地耐性',
			LightResistance_Rate: '光耐性',
			DarkResistance_Rate: '闇耐性',
			NeutralResistance_Rate: '無耐性',
		}

		const props = Object.entries(buffItem.properties)
			.filter(([_, value]) => value !== 0)
			.map(([key, value]) => {
				// マッピングから日本語名を取得、なければ元のキーを使用
				const propName = propertyNameMap[key] || key

				// %系プロパティかどうかを判定
				const isPercentage = key.endsWith('_Rate')
				const suffix = isPercentage ? '%' : ''

				return `${propName}${value > 0 ? '+' : ''}${value}${suffix}`
			})
			.slice(0, 2) // 最大2つまで表示

		return props.join(', ')
	}

	// バフアイテム選択ボタンコンポーネント（ラベル無し版）
	const BuffItemButton = ({ category }: { category: BuffItemCategory }) => {
		const selectedName = getSelectedBuffItemName(category)
		const properties = formatBuffItemProperties(category)
		const hasSelection = effectiveBuffItems[category] !== null

		return (
			<button
				type="button"
				onClick={() => handleOpenModal(category)}
				className={`
					px-1 py-1 w-full text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-left transition-colors hover:bg-gray-50
					${hasSelection ? 'bg-blue-50 border-blue-300' : 'bg-white'}
				`}
			>
				<div className="flex items-center justify-between">
					<div className="flex-1 min-w-0">
						<div
							className={`text-sm truncate ${
								hasSelection ? 'text-gray-900' : 'text-gray-500'
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
							className="w-4 h-4 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-label="選択"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</div>
				</div>
			</button>
		)
	}

	return (
		<div className="rounded-lg shadow-md bg-white p-4 md:col-start-5 md:col-end-9 md:row-start-3 md:row-end-5 xl:col-start-2 xl:col-end-4 xl:row-start-5 xl:row-end-6">
			<h3 className="mb-4 text-base font-semibold text-gray-900">
				バフアイテム設定
			</h3>

			{/* 12カテゴリのバフアイテム選択ボタン（WeaponFormスタイルに合わせたグリッド配置） */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
				{buffItemCategories.map(({ key, label }) => (
					<div key={key} className="flex items-center gap-2">
						<div className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">
							{label}:
						</div>
						<div className="flex-1 mr-6">
							<BuffItemButton category={key} />
						</div>
					</div>
				))}
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
					slotInfo={{
						type: 'buffItem' as const,
						category: modalState.category,
					}}
				/>
			)}
		</div>
	)
}
