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
			.slice(0, 4) // 最大4つまで表示

		// 2つずつのグループに分ける
		const rows: string[] = []
		for (let i = 0; i < props.length; i += 2) {
			const row = props.slice(i, i + 2).join(', ')
			rows.push(row)
		}

		return rows
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
			{formatProperties().length > 0 && (
				<div className="text-sm text-gray-600 mb-2 min-h-[1.25rem]">
					{formatProperties().map((row) => (
						<div key={row} className="flex flex-wrap gap-x-3">
							{row}
						</div>
					))}
				</div>
			)}
		</div>
	)
}
