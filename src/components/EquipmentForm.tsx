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
			propertyPairs: [
				{ properties: ['ATK_Rate', 'ATK'], type: 'pair' },
				{ properties: ['MATK_Rate', 'MATK'], type: 'pair' },
				{ properties: ['WeaponATK_Rate', 'WeaponATK'], type: 'pair' },
				{ properties: ['PhysicalPenetration_Rate'], type: 'percent' },
				{ properties: ['MagicalPenetration_Rate'], type: 'percent' },
				{ properties: ['ElementAdvantage_Rate'], type: 'percent' },
				{
					properties: ['UnsheatheAttack_Rate', 'UnsheatheAttack'],
					type: 'pair',
				},
				{ properties: ['ShortRangeDamage_Rate'], type: 'percent' },
				{ properties: ['LongRangeDamage_Rate'], type: 'percent' },
				{ properties: ['CriticalDamage_Rate', 'CriticalDamage'], type: 'pair' },
				{ properties: ['Critical_Rate', 'Critical'], type: 'pair' },
				{ properties: ['Stability_Rate'], type: 'percent' },
			] as const,
		},
		{
			title: 'ステータス',
			propertyPairs: [
				{ properties: ['HP_Rate', 'HP'], type: 'pair' },
				{ properties: ['MP_Rate', 'MP'], type: 'pair' },
				{ properties: ['STR_Rate', 'STR'], type: 'pair' },
				{ properties: ['INT_Rate', 'INT'], type: 'pair' },
				{ properties: ['VIT_Rate', 'VIT'], type: 'pair' },
				{ properties: ['AGI_Rate', 'AGI'], type: 'pair' },
				{ properties: ['DEX_Rate', 'DEX'], type: 'pair' },
				{ properties: ['Accuracy_Rate', 'Accuracy'], type: 'pair' },
				{ properties: ['Dodge_Rate', 'Dodge'], type: 'pair' },
				{ properties: ['AttackSpeed_Rate', 'AttackSpeed'], type: 'pair' },
				{ properties: ['CastingSpeed_Rate', 'CastingSpeed'], type: 'pair' },
				{ properties: ['MotionSpeed_Rate'], type: 'percent' },
			] as const,
		},
		{
			title: '継戦補助',
			propertyPairs: [
				{
					properties: ['AttackMPRecovery_Rate', 'AttackMPRecovery'],
					type: 'pair',
				},
				{ properties: ['PhysicalResistance_Rate'], type: 'percent' },
				{ properties: ['MagicalResistance_Rate'], type: 'percent' },
				{ properties: ['AilmentResistance_Rate'], type: 'percent' },
				{ properties: ['Aggro_Rate'], type: 'percent' },
				{ properties: ['RevivalTime_Rate'], type: 'percent' },
				{
					properties: ['NaturalHPRecovery_Rate', 'NaturalHPRecovery'],
					type: 'pair',
				},
				{
					properties: ['NaturalMPRecovery_Rate', 'NaturalMPRecovery'],
					type: 'pair',
				},
			] as const,
		},
		{
			title: '戦闘補助',
			propertyPairs: [
				{ properties: ['ArmorBreak_Rate'], type: 'percent' },
				{ properties: ['Anticipate_Rate'], type: 'percent' },
				{ properties: ['GuardPower_Rate'], type: 'percent' },
				{ properties: ['GuardRecharge_Rate'], type: 'percent' },
				{ properties: ['AvoidRecharge_Rate'], type: 'percent' },
				{ properties: ['AbsoluteAccuracy_Rate'], type: 'percent' },
				{ properties: ['AbsoluteDodge_Rate'], type: 'percent' },
				{ properties: ['ItemCooldown'], type: 'fixed' },
			] as const,
		},
		// 低頻度（使用頻度低）
		{
			title: 'ステータス連動攻撃力',
			propertyPairs: [
				{ properties: ['ATK_STR_Rate'], type: 'percent' },
				{ properties: ['ATK_INT_Rate'], type: 'percent' },
				{ properties: ['ATK_VIT_Rate'], type: 'percent' },
				{ properties: ['ATK_AGI_Rate'], type: 'percent' },
				{ properties: ['ATK_DEX_Rate'], type: 'percent' },
				{ properties: ['MATK_STR_Rate'], type: 'percent' },
				{ properties: ['MATK_INT_Rate'], type: 'percent' },
				{ properties: ['MATK_VIT_Rate'], type: 'percent' },
				{ properties: ['MATK_AGI_Rate'], type: 'percent' },
				{ properties: ['MATK_DEX_Rate'], type: 'percent' },
			] as const,
		},
		{
			title: '属性耐性',
			propertyPairs: [
				{ properties: ['FireResistance_Rate'], type: 'percent' },
				{ properties: ['WaterResistance_Rate'], type: 'percent' },
				{ properties: ['WindResistance_Rate'], type: 'percent' },
				{ properties: ['EarthResistance_Rate'], type: 'percent' },
				{ properties: ['LightResistance_Rate'], type: 'percent' },
				{ properties: ['DarkResistance_Rate'], type: 'percent' },
				{ properties: ['NeutralResistance_Rate'], type: 'percent' },
			] as const,
		},
		{
			title: 'ダメージ軽減',
			propertyPairs: [
				{ properties: ['LinearReduction_Rate'], type: 'percent' },
				{ properties: ['RushReduction_Rate'], type: 'percent' },
				{ properties: ['BulletReduction_Rate'], type: 'percent' },
				{ properties: ['ProximityReduction_Rate'], type: 'percent' },
				{ properties: ['AreaReduction_Rate'], type: 'percent' },
				{ properties: ['FloorTrapReduction_Rate'], type: 'percent' },
				{ properties: ['MeteorReduction_Rate'], type: 'percent' },
				{ properties: ['BladeReduction_Rate'], type: 'percent' },
				{ properties: ['SuctionReduction_Rate'], type: 'percent' },
				{ properties: ['ExplosionReduction_Rate'], type: 'percent' },
			] as const,
		},
		{
			title: 'バリア/追撃',
			propertyPairs: [
				{ properties: ['PhysicalBarrier'], type: 'fixed' },
				{ properties: ['MagicalBarrier'], type: 'fixed' },
				{ properties: ['FractionalBarrier'], type: 'fixed' },
				{ properties: ['BarrierCooldown_Rate'], type: 'percent' },
				{ properties: ['PhysicalFollowup_Rate'], type: 'percent' },
				{ properties: ['MagicalFollowup_Rate'], type: 'percent' },
			] as const,
		},
	] as const

	// プロパティのベース名を取得する関数
	const getBasePropertyLabel = (
		property: keyof EquipmentProperties,
	): string => {
		const baseLabels: Record<string, string> = {
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
			AbsoluteAccuracy_Rate: '絶対命中',
			AbsoluteDodge_Rate: '絶対回避',

			// 速度系
			AttackSpeed_Rate: '攻撃速度',
			AttackSpeed: '攻撃速度',
			CastingSpeed_Rate: '詠唱速度',
			CastingSpeed: '詠唱速度',
			MotionSpeed_Rate: '行動速度',

			// MP回復系
			AttackMPRecovery_Rate: '攻撃MP回復',
			AttackMPRecovery: '攻撃MP回復',

			// 耐性系
			PhysicalResistance_Rate: '物理耐性',
			MagicalResistance_Rate: '魔法耐性',
			AilmentResistance_Rate: '異常耐性',

			// その他戦闘系
			Aggro_Rate: 'ヘイト',
			RevivalTime_Rate: '復帰短縮',
			ItemCooldown: '道具速度',

			// 自然回復系
			NaturalHPRecovery_Rate: 'HP自然回復',
			NaturalHPRecovery: 'HP自然回復',
			NaturalMPRecovery_Rate: 'MP自然回復',
			NaturalMPRecovery: 'MP自然回復',

			// 特殊系
			ArmorBreak_Rate: '防御崩し',
			Anticipate_Rate: '先読み',
			GuardPower_Rate: 'Guard力',
			GuardRecharge_Rate: 'Guard回復',
			AvoidRecharge_Rate: 'Avoid回復',

			// ステータス連動攻撃力
			ATK_STR_Rate: 'ATK+(STR)',
			ATK_INT_Rate: 'ATK+(INT)',
			ATK_VIT_Rate: 'ATK+(VIT)',
			ATK_AGI_Rate: 'ATK+(AGI)',
			ATK_DEX_Rate: 'ATK+(DEX)',
			MATK_STR_Rate: 'MATK+(STR)',
			MATK_INT_Rate: 'MATK+(INT)',
			MATK_VIT_Rate: 'MATK+(VIT)',
			MATK_AGI_Rate: 'MATK+(AGI)',
			MATK_DEX_Rate: 'MATK+(DEX)',

			// 属性耐性
			FireResistance_Rate: '火耐性',
			WaterResistance_Rate: '水耐性',
			WindResistance_Rate: '風耐性',
			EarthResistance_Rate: '地耐性',
			LightResistance_Rate: '光耐性',
			DarkResistance_Rate: '闇耐性',
			NeutralResistance_Rate: '無耐性',

			// ダメージ軽減系
			LinearReduction_Rate: '直線軽減',
			RushReduction_Rate: '突進軽減',
			BulletReduction_Rate: '弾丸軽減',
			ProximityReduction_Rate: '周囲軽減',
			AreaReduction_Rate: '範囲軽減',
			FloorTrapReduction_Rate: '痛床軽減',
			MeteorReduction_Rate: '隕石軽減',
			BladeReduction_Rate: '射刃軽減',
			SuctionReduction_Rate: '吸引軽減',
			ExplosionReduction_Rate: '爆発軽減',

			// バリア系
			PhysicalBarrier: '物理バリア',
			MagicalBarrier: '魔法バリア',
			FractionalBarrier: '割合バリア',
			BarrierCooldown_Rate: 'バリア速度',

			// 追撃系
			PhysicalFollowup_Rate: '物理追撃',
			MagicalFollowup_Rate: '魔法追撃',
		}

		// プロパティ名から対応するベース名を返す
		for (const [key, label] of Object.entries(baseLabels)) {
			if (property === key) return label
		}

		// フォールバック: _Rateを除去してベース名を生成
		return property.replace(/_Rate$/, '').replace(/_/g, '')
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
		<div className="overflow-x-auto w-full">
			<div className="flex gap-4 min-w-max">
				{propertyGroups.map((group) => (
					<div
						key={group.title}
						className="w-[240px] flex-shrink-0 border-gray-300 rounded-lg p-3"
					>
						<h4 className="font-medium text-gray-700 mb-3 text-sm sticky top-0 bg-white">
							{group.title}
						</h4>
						{/* 列見出し */}
						<div className="grid grid-cols-[100px_60px_60px] gap-1 mb-2">
							<div className="text-gray-700 text-sm">プロパティ</div>
							<div className="text-center text-gray-700 text-sm">%</div>
							<div className="text-center text-gray-700 text-sm">+</div>
						</div>
						{/* プロパティ行 */}
						<div className="space-y-1">
							{group.propertyPairs.map((pair) => (
								<div
									key={pair.properties[0]}
									className="grid grid-cols-[100px_60px_60px] gap-1 items-center"
								>
									<div
										className="text-xs text-gray-700 font-medium truncate"
										title={getBasePropertyLabel(pair.properties[0])}
									>
										{getBasePropertyLabel(pair.properties[0])}
									</div>
									{pair.type === 'pair' ? (
										// ペア項目: %系と固定値系
										<>
											<input
												id={`${item.name}-${pair.properties[0]}`}
												type="number"
												value={item.properties[pair.properties[0]] || 0}
												onChange={(e) =>
													onPropertyChange(pair.properties[0], e.target.value)
												}
												className="px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent w-full"
											/>
											<input
												id={`${item.name}-${pair.properties[1]}`}
												type="number"
												value={item.properties[pair.properties[1]] || 0}
												onChange={(e) =>
													onPropertyChange(pair.properties[1], e.target.value)
												}
												className="px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent w-full"
											/>
										</>
									) : pair.type === 'percent' ? (
										// %系単独項目: %列に配置
										<>
											<input
												id={`${item.name}-${pair.properties[0]}`}
												type="number"
												value={item.properties[pair.properties[0]] || 0}
												onChange={(e) =>
													onPropertyChange(pair.properties[0], e.target.value)
												}
												className="px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent w-full"
											/>
											<div /> {/* 空白の固定値列 */}
										</>
									) : (
										// 固定値単独項目: 固定値列に配置
										<>
											<div /> {/* 空白の%列 */}
											<input
												id={`${item.name}-${pair.properties[0]}`}
												type="number"
												value={item.properties[pair.properties[0]] || 0}
												onChange={(e) =>
													onPropertyChange(pair.properties[0], e.target.value)
												}
												className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent w-full"
											/>
										</>
									)}
								</div>
							))}
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
