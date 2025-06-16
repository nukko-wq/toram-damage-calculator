'use client'

import { BaseStats } from '@/types/calculator'

interface BaseStatsFormProps {
	stats: BaseStats
	onChange: (stats: BaseStats) => void
}

export default function BaseStatsForm({ stats, onChange }: BaseStatsFormProps) {
	const handleStatChange = (stat: keyof BaseStats, value: string) => {
		const numValue = parseInt(value) || 0
		onChange({
			...stats,
			[stat]: numValue,
		})
	}

	const statFields = [
		{ key: 'STR' as const, label: 'STR（力）' },
		{ key: 'INT' as const, label: 'INT（知力）' },
		{ key: 'VIT' as const, label: 'VIT（体力）' },
		{ key: 'AGI' as const, label: 'AGI（俊敏性）' },
		{ key: 'DEX' as const, label: 'DEX（器用さ）' },
		{ key: 'CRT' as const, label: 'CRT（クリティカル）' },
		{ key: 'MEN' as const, label: 'MEN（精神力）' },
		{ key: 'TEC' as const, label: 'TEC（技術力）' },
		{ key: 'level' as const, label: 'レベル' },
	]

	return (
		<section className="bg-white rounded-lg shadow-md p-6 col-start-1 col-end-3 row-start-1 row-end-2">
			<h2 className="text-xl font-bold text-gray-800 mb-4">基本ステータス</h2>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{statFields.map(({ key, label }) => (
					<div key={key} className="flex flex-col">
						<label className="text-sm font-medium text-gray-700 mb-1">
							{label}
						</label>
						<input
							type="number"
							value={stats[key]}
							onChange={(e) => handleStatChange(key, e.target.value)}
							className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							min="0"
						/>
					</div>
				))}
			</div>
		</section>
	)
}
