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
		// 高頻度（よく使う）
		{
			title: '攻撃・威力',
			percentProperties: [
				'ATK_Rate',
				'MATK_Rate',
				'WeaponATK_Rate',
				'PhysicalPenetration_Rate',
				'MagicalPenetration_Rate',
				'ElementAdvantage_Rate',
				'UnsheatheAttack_Rate',
				'ShortRangeDamage_Rate',
				'LongRangeDamage_Rate',
				'CriticalDamage_Rate',
				'Critical_Rate',
				'Stability_Rate',
			] as const,
			fixedProperties: [
				'ATK',
				'MATK',
				'WeaponATK',
				'UnsheatheAttack',
				'CriticalDamage',
				'Critical',
			] as const,
		},
		{
			title: 'ステータス',
			percentProperties: [
				'HP_Rate',
				'MP_Rate',
				'STR_Rate',
				'INT_Rate',
				'VIT_Rate',
				'AGI_Rate',
				'DEX_Rate',
				'Accuracy_Rate',
				'Dodge_Rate',
				'AttackSpeed_Rate',
				'CastingSpeed_Rate',
				'MotionSpeed_Rate',
			] as const,
			fixedProperties: [
				'HP',
				'MP',
				'STR',
				'INT',
				'VIT',
				'AGI',
				'DEX',
				'Accuracy',
				'Dodge',
				'AttackSpeed',
				'CastingSpeed',
			] as const,
		},
		{
			title: '継戦補助',
			percentProperties: [
				'AttackMPRecovery_Rate',
				'PhysicalResistance_Rate',
				'MagicalResistance_Rate',
				'AilmentResistance_Rate',
				'Aggro_Rate',
				'RevivalTime_Rate',
				'NaturalHPRecovery_Rate',
				'NaturalMPRecovery_Rate',
			] as const,
			fixedProperties: [
				'AttackMPRecovery',
				'NaturalHPRecovery',
				'NaturalMPRecovery',
			] as const,
		},
		{
			title: '戦闘補助',
			percentProperties: [
				'ArmorBreak_Rate',
				'Anticipate_Rate',
				'GuardPower_Rate',
				'GuardRecharge_Rate',
				'AvoidRecharge_Rate',
				'AbsoluteAccuracy_Rate',
				'AbsoluteDodge_Rate',
			] as const,
			fixedProperties: ['ItemCooldown'] as const,
		},
		// 低頻度（使用頻度低）
		{
			title: 'ステータス連動攻撃力',
			percentProperties: [
				'ATK_STR_Rate',
				'ATK_INT_Rate',
				'ATK_VIT_Rate',
				'ATK_AGI_Rate',
				'ATK_DEX_Rate',
				'MATK_STR_Rate',
				'MATK_INT_Rate',
				'MATK_VIT_Rate',
				'MATK_AGI_Rate',
				'MATK_DEX_Rate',
			] as const,
			fixedProperties: [] as const,
		},
		{
			title: '属性耐性',
			percentProperties: [
				'FireResistance_Rate',
				'WaterResistance_Rate',
				'WindResistance_Rate',
				'EarthResistance_Rate',
				'LightResistance_Rate',
				'DarkResistance_Rate',
				'NeutralResistance_Rate',
			] as const,
			fixedProperties: [] as const,
		},
		{
			title: 'ダメージ軽減',
			percentProperties: [
				'LinearReduction_Rate',
				'RushReduction_Rate',
				'BulletReduction_Rate',
				'ProximityReduction_Rate',
				'AreaReduction_Rate',
				'FloorTrapReduction_Rate',
				'MeteorReduction_Rate',
				'BladeReduction_Rate',
				'SuctionReduction_Rate',
				'ExplosionReduction_Rate',
			] as const,
			fixedProperties: [] as const,
		},
		{
			title: 'バリア/追撃',
			percentProperties: [
				'BarrierCooldown_Rate',
				'PhysicalFollowup_Rate',
				'MagicalFollowup_Rate',
			] as const,
			fixedProperties: [
				'PhysicalBarrier',
				'MagicalBarrier',
				'FractionalBarrier',
			] as const,
		},
	] as const

	// プロパティの日本語ラベル
	const getPropertyLabel = (property: keyof EquipmentProperties): string => {
		const labels: Record<keyof EquipmentProperties, string> = {
			// 基本攻撃力系
			ATK_Rate: 'ATK%',
			ATK: 'ATK',
			MATK_Rate: 'MATK%',
			MATK: 'MATK',
			WeaponATK_Rate: '武器ATK%',
			WeaponATK: '武器ATK',

			// 防御力系
			DEF_Rate: 'DEF%',
			DEF: 'DEF',
			MDEF_Rate: 'MDEF%',
			MDEF: 'MDEF',

			// 貫通系
			PhysicalPenetration_Rate: '物理貫通%',
			MagicalPenetration_Rate: '魔法貫通%',
			ElementAdvantage_Rate: '属性有利%',

			// 威力系
			UnsheatheAttack_Rate: '抜刀威力%',
			UnsheatheAttack: '抜刀威力',
			ShortRangeDamage_Rate: '近距離威力%',
			LongRangeDamage_Rate: '遠距離威力%',

			// クリティカル系
			CriticalDamage_Rate: 'クリティカルダメージ%',
			CriticalDamage: 'クリティカルダメージ',
			Critical_Rate: 'クリティカル率%',
			Critical: 'クリティカル率',

			// 安定率
			Stability_Rate: '安定率%',

			// HP/MP系
			HP_Rate: 'HP%',
			HP: 'HP',
			MP_Rate: 'MP%',
			MP: 'MP',

			// ステータス系
			STR_Rate: 'STR%',
			STR: 'STR',
			INT_Rate: 'INT%',
			INT: 'INT',
			VIT_Rate: 'VIT%',
			VIT: 'VIT',
			AGI_Rate: 'AGI%',
			AGI: 'AGI',
			DEX_Rate: 'DEX%',
			DEX: 'DEX',
			CRT_Rate: 'CRT%',
			CRT: 'CRT',
			MEN_Rate: 'MEN%',
			MEN: 'MEN',
			TEC_Rate: 'TEC%',
			TEC: 'TEC',
			LUK_Rate: 'LUK%',
			LUK: 'LUK',

			// 命中・回避系
			Accuracy_Rate: '命中%',
			Accuracy: '命中',
			Dodge_Rate: '回避%',
			Dodge: '回避',
			AbsoluteAccuracy_Rate: '絶対命中%',
			AbsoluteDodge_Rate: '絶対回避%',

			// 速度系
			AttackSpeed_Rate: '攻撃速度%',
			AttackSpeed: '攻撃速度',
			CastingSpeed_Rate: '詠唱速度%',
			CastingSpeed: '詠唱速度',
			MotionSpeed_Rate: '行動速度%',

			// MP回復系
			AttackMPRecovery_Rate: '攻撃MP回復%',
			AttackMPRecovery: '攻撃MP回復',

			// 耐性系
			PhysicalResistance_Rate: '物理耐性%',
			MagicalResistance_Rate: '魔法耐性%',
			AilmentResistance_Rate: '異常耐性%',

			// その他戦闘系
			Aggro_Rate: 'ヘイト%',
			RevivalTime_Rate: '復帰短縮%',
			ItemCooldown: '道具速度',

			// 自然回復系
			NaturalHPRecovery_Rate: 'HP自然回復%',
			NaturalHPRecovery: 'HP自然回復',
			NaturalMPRecovery_Rate: 'MP自然回復%',
			NaturalMPRecovery: 'MP自然回復',

			// 特殊系
			ArmorBreak_Rate: '防御崩し%',
			Anticipate_Rate: '先読み%',
			GuardPower_Rate: 'Guard力%',
			GuardRecharge_Rate: 'Guard回復%',
			AvoidRecharge_Rate: 'Avoid回復%',

			// ステータス連動攻撃力
			ATK_STR_Rate: 'ATK+(STR)%',
			ATK_INT_Rate: 'ATK+(INT)%',
			ATK_VIT_Rate: 'ATK+(VIT)%',
			ATK_AGI_Rate: 'ATK+(AGI)%',
			ATK_DEX_Rate: 'ATK+(DEX)%',
			MATK_STR_Rate: 'MATK+(STR)%',
			MATK_INT_Rate: 'MATK+(INT)%',
			MATK_VIT_Rate: 'MATK+(VIT)%',
			MATK_AGI_Rate: 'MATK+(AGI)%',
			MATK_DEX_Rate: 'MATK+(DEX)%',

			// 属性耐性
			FireResistance_Rate: '火耐性%',
			WaterResistance_Rate: '水耐性%',
			WindResistance_Rate: '風耐性%',
			EarthResistance_Rate: '地耐性%',
			LightResistance_Rate: '光耐性%',
			DarkResistance_Rate: '闇耐性%',
			NeutralResistance_Rate: '無耐性%',

			// ダメージ軽減系
			LinearReduction_Rate: '直線軽減%',
			RushReduction_Rate: '突進軽減%',
			BulletReduction_Rate: '弾丸軽減%',
			ProximityReduction_Rate: '周囲軽減%',
			AreaReduction_Rate: '範囲軽減%',
			FloorTrapReduction_Rate: '痛床軽減%',
			MeteorReduction_Rate: '隕石軽減%',
			BladeReduction_Rate: '射刃軽減%',
			SuctionReduction_Rate: '吸引軽減%',
			ExplosionReduction_Rate: '爆発軽減%',

			// バリア系
			PhysicalBarrier: '物理バリア',
			MagicalBarrier: '魔法バリア',
			FractionalBarrier: '割合バリア',
			BarrierCooldown_Rate: 'バリア速度%',

			// 追撃系
			PhysicalFollowup_Rate: '物理追撃%',
			MagicalFollowup_Rate: '魔法追撃%',
		}
		return labels[property] || property
	}

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
		<div className="flex overflow-x-scroll w-full max-w-[95vw]">
			<div className="grid grid-cols-8 gap-4 min-w-fit">
				{propertyGroups.map((group) => (
					<div
						key={group.title}
						className="min-w-40 border border-gray-300 rounded-lg p-3"
					>
						<h4 className="font-medium text-gray-700 mb-3 text-sm sticky top-0 bg-white">
							{group.title}
						</h4>
						<div className="grid grid-cols-2 gap-2">
							{/* 左カラム: %系プロパティ */}
							<div className="space-y-2">
								{group.percentProperties.map((property) => (
									<div key={property} className="flex flex-col">
										<label
											htmlFor={`${item.name}-${property}`}
											className="text-xs text-gray-600 mb-1"
										>
											{getPropertyLabel(property)}
										</label>
										<input
											id={`${item.name}-${property}`}
											type="number"
											value={item.properties[property] || 0}
											onChange={(e) =>
												onPropertyChange(property, e.target.value)
											}
											className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent w-full"
										/>
									</div>
								))}
							</div>
							{/* 右カラム: 固定値系プロパティ */}
							<div className="space-y-2">
								{group.fixedProperties.map((property) => (
									<div key={property} className="flex flex-col">
										<label
											htmlFor={`${item.name}-${property}`}
											className="text-xs text-gray-600 mb-1"
										>
											{getPropertyLabel(property)}
										</label>
										<input
											id={`${item.name}-${property}`}
											type="number"
											value={item.properties[property] || 0}
											onChange={(e) =>
												onPropertyChange(property, e.target.value)
											}
											className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent w-full"
										/>
									</div>
								))}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	)

	return (
		<section className="bg-white rounded-lg shadow-md p-6 lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-4">
			<h2 className="text-xl font-bold text-gray-800 mb-4">装備</h2>

			{/* タブヘッダー */}
			<div className="border-b border-gray-200 mb-6">
				<nav className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
