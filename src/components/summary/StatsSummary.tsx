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
			ATK_Rate: 0,
			ATK: 0,
			MATK_Rate: 0,
			MATK: 0,
			WeaponATK_Rate: 0,
			WeaponATK: 0,
			PhysicalPenetration_Rate: 0,
			MagicalPenetration_Rate: 0,
			ElementAdvantage_Rate: 0,
			UnsheatheAttack_Rate: 0,
			UnsheatheAttack: 0,
			ShortRangeDamage_Rate: 0,
			LongRangeDamage_Rate: 0,
			CriticalDamage_Rate: 0,
			CriticalDamage: 0,
			Critical_Rate: 0,
			Critical: 0,
			Stability_Rate: 0,
			HP_Rate: 0,
			HP: 0,
			MP: 0,
			STR_Rate: 0,
			INT_Rate: 0,
			VIT_Rate: 0,
			AGI_Rate: 0,
			DEX_Rate: 0,
			Accuracy_Rate: 0,
			Accuracy: 0,
			Dodge_Rate: 0,
			Dodge: 0,
			AttackSpeed_Rate: 0,
			AttackSpeed: 0,
			CastingSpeed_Rate: 0,
			CastingSpeed: 0,
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
			(data.baseStats.STR * (totalStats.STR_Rate || 0)) / 100,
		)
		totalStats.INT += Math.floor(
			(data.baseStats.INT * (totalStats.INT_Rate || 0)) / 100,
		)
		totalStats.VIT += Math.floor(
			(data.baseStats.VIT * (totalStats.VIT_Rate || 0)) / 100,
		)
		totalStats.AGI += Math.floor(
			(data.baseStats.AGI * (totalStats.AGI_Rate || 0)) / 100,
		)
		totalStats.DEX += Math.floor(
			(data.baseStats.DEX * (totalStats.DEX_Rate || 0)) / 100,
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
				{ key: 'ATK_Rate', label: 'ATK%', value: totalStats.ATK_Rate },
				{ key: 'ATK', label: 'ATK', value: totalStats.ATK },
				{ key: 'MATK_Rate', label: 'MATK%', value: totalStats.MATK_Rate },
				{ key: 'MATK', label: 'MATK', value: totalStats.MATK },
				{
					key: 'WeaponATK_Rate',
					label: '武器ATK%',
					value: totalStats.WeaponATK_Rate,
				},
				{ key: 'WeaponATK', label: '武器ATK', value: totalStats.WeaponATK },
			],
		},
		{
			title: '貫通・威力',
			stats: [
				{
					key: 'PhysicalPenetration_Rate',
					label: '物理貫通%',
					value: totalStats.PhysicalPenetration_Rate,
				},
				{
					key: 'MagicalPenetration_Rate',
					label: '魔法貫通%',
					value: totalStats.MagicalPenetration_Rate,
				},
				{
					key: 'ElementAdvantage_Rate',
					label: '属性有利%',
					value: totalStats.ElementAdvantage_Rate,
				},
				{
					key: 'UnsheatheAttack_Rate',
					label: '抜刀威力%',
					value: totalStats.UnsheatheAttack_Rate,
				},
				{
					key: 'UnsheatheAttack',
					label: '抜刀威力',
					value: totalStats.UnsheatheAttack,
				},
				{
					key: 'ShortRangeDamage_Rate',
					label: '近距離威力%',
					value: totalStats.ShortRangeDamage_Rate,
				},
				{
					key: 'LongRangeDamage_Rate',
					label: '遠距離威力%',
					value: totalStats.LongRangeDamage_Rate,
				},
			],
		},
		{
			title: 'クリティカル',
			stats: [
				{
					key: 'CriticalDamage_Rate',
					label: 'クリティカルダメージ%',
					value: totalStats.CriticalDamage_Rate,
				},
				{
					key: 'CriticalDamage',
					label: 'クリティカルダメージ',
					value: totalStats.CriticalDamage,
				},
				{
					key: 'Critical_Rate',
					label: 'クリティカル率%',
					value: totalStats.Critical_Rate,
				},
				{
					key: 'Critical',
					label: 'クリティカル率',
					value: totalStats.Critical,
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
