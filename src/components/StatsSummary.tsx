'use client'

import type {
	CalculatorData,
	BaseStats,
	EquipmentProperties,
} from '@/types/calculator'
import { getCrystalById } from '@/utils/crystalDatabase'

interface StatsSummaryProps {
	data: CalculatorData
}

export default function StatsSummary({ data }: StatsSummaryProps) {
	const calculateTotalStats = () => {
		const totalStats: BaseStats & Partial<EquipmentProperties> = {
			...data.baseStats,
			'ATK%': 0,
			ATK: 0,
			'MATK%': 0,
			MATK: 0,
			'武器ATK%': 0,
			武器ATK: 0,
			'物理貫通%': 0,
			'魔法貫通%': 0,
			'属性有利%': 0,
			'抜刀威力%': 0,
			抜刀威力: 0,
			'近距離威力%': 0,
			'遠距離威力%': 0,
			'クリティカルダメージ%': 0,
			クリティカルダメージ: 0,
			'クリティカル率%': 0,
			クリティカル率: 0,
			'安定率%': 0,
			'HP%': 0,
			HP: 0,
			MP: 0,
			'STR%': 0,
			'INT%': 0,
			'VIT%': 0,
			'AGI%': 0,
			'DEX%': 0,
			'命中%': 0,
			命中: 0,
			'回避%': 0,
			回避: 0,
			'攻撃速度%': 0,
			攻撃速度: 0,
			'詠唱速度%': 0,
			詠唱速度: 0,
		}

		// 装備からの補正値を合計
		const allEquipment = Object.values(data.equipment)

		for (const equipment of allEquipment) {
			for (const [key, value] of Object.entries(equipment.properties)) {
				if (typeof value === 'number' && key in totalStats) {
					const currentValue = totalStats[key as keyof typeof totalStats]
					if (typeof currentValue === 'number') {
						;(totalStats as any)[key] = currentValue + value
					}
				}
			}
		}

		// クリスタからの補正値を合計
		for (const crystalId of Object.values(data.crystals)) {
			if (crystalId) {
				const crystal = getCrystalById(crystalId)
				if (crystal) {
					for (const [key, value] of Object.entries(crystal.properties)) {
						if (typeof value === 'number' && key in totalStats) {
							const currentValue = totalStats[key as keyof typeof totalStats]
							if (typeof currentValue === 'number') {
								;(totalStats as any)[key] = currentValue + value
							}
						}
					}
				}
			}
		}

		// ステータス%補正を適用
		totalStats.STR += Math.floor(
			(data.baseStats.STR * (totalStats['STR%'] || 0)) / 100,
		)
		totalStats.INT += Math.floor(
			(data.baseStats.INT * (totalStats['INT%'] || 0)) / 100,
		)
		totalStats.VIT += Math.floor(
			(data.baseStats.VIT * (totalStats['VIT%'] || 0)) / 100,
		)
		totalStats.AGI += Math.floor(
			(data.baseStats.AGI * (totalStats['AGI%'] || 0)) / 100,
		)
		totalStats.DEX += Math.floor(
			(data.baseStats.DEX * (totalStats['DEX%'] || 0)) / 100,
		)

		return totalStats
	}

	const totalStats = calculateTotalStats()

	const statGroups = [
		{
			title: '基本ステータス',
			stats: [
				{ key: 'STR', label: 'STR（力）', value: totalStats.STR },
				{ key: 'INT', label: 'INT（知力）', value: totalStats.INT },
				{ key: 'VIT', label: 'VIT（体力）', value: totalStats.VIT },
				{ key: 'AGI', label: 'AGI（俊敏性）', value: totalStats.AGI },
				{ key: 'DEX', label: 'DEX（器用さ）', value: totalStats.DEX },
				{ key: 'CRT', label: 'CRT（クリティカル）', value: totalStats.CRT },
				{ key: 'MEN', label: 'MEN（精神力）', value: totalStats.MEN },
				{ key: 'TEC', label: 'TEC（技術力）', value: totalStats.TEC },
			],
		},
		{
			title: '攻撃力',
			stats: [
				{ key: 'ATK%', label: 'ATK%', value: totalStats['ATK%'] },
				{ key: 'ATK', label: 'ATK', value: totalStats.ATK },
				{ key: 'MATK%', label: 'MATK%', value: totalStats['MATK%'] },
				{ key: 'MATK', label: 'MATK', value: totalStats.MATK },
				{ key: '武器ATK%', label: '武器ATK%', value: totalStats['武器ATK%'] },
				{ key: '武器ATK', label: '武器ATK', value: totalStats['武器ATK'] },
			],
		},
		{
			title: '貫通・威力',
			stats: [
				{
					key: '物理貫通%',
					label: '物理貫通%',
					value: totalStats['物理貫通%'],
				},
				{
					key: '魔法貫通%',
					label: '魔法貫通%',
					value: totalStats['魔法貫通%'],
				},
				{
					key: '属性有利%',
					label: '属性有利%',
					value: totalStats['属性有利%'],
				},
				{
					key: '抜刀威力%',
					label: '抜刀威力%',
					value: totalStats['抜刀威力%'],
				},
				{ key: '抜刀威力', label: '抜刀威力', value: totalStats['抜刀威力'] },
				{
					key: '近距離威力%',
					label: '近距離威力%',
					value: totalStats['近距離威力%'],
				},
				{
					key: '遠距離威力%',
					label: '遠距離威力%',
					value: totalStats['遠距離威力%'],
				},
			],
		},
		{
			title: 'クリティカル',
			stats: [
				{
					key: 'クリティカルダメージ%',
					label: 'クリティカルダメージ%',
					value: totalStats['クリティカルダメージ%'],
				},
				{
					key: 'クリティカルダメージ',
					label: 'クリティカルダメージ',
					value: totalStats['クリティカルダメージ'],
				},
				{
					key: 'クリティカル率%',
					label: 'クリティカル率%',
					value: totalStats['クリティカル率%'],
				},
				{
					key: 'クリティカル率',
					label: 'クリティカル率',
					value: totalStats['クリティカル率'],
				},
			],
		},
	]

	return (
		<div className="bg-white rounded-lg shadow-md p-6">
			<h2 className="text-xl font-bold text-gray-800 mb-4">ステータス合計</h2>
			<div className="space-y-6">
				{statGroups.map((group) => (
					<div key={group.title} className="border rounded-lg p-4">
						<h3 className="font-medium text-gray-700 mb-3">{group.title}</h3>
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
							{group.stats.map((stat) => (
								<div
									key={stat.key}
									className="flex justify-between items-center"
								>
									<span className="text-sm text-gray-600">{stat.label}</span>
									<span className="font-medium text-gray-900">
										{stat.value || 0}
									</span>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
