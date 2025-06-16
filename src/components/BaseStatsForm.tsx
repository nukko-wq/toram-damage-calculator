'use client'

import { BaseStats } from '@/types/calculator'

interface BaseStatsFormProps {
	stats: BaseStats
	onChange: (stats: BaseStats) => void
}

export default function BaseStatsForm({ stats, onChange }: BaseStatsFormProps) {
	const handleStatChange = (stat: keyof BaseStats, value: string) => {
		const numValue = Number.parseInt(value) || 0
		onChange({
			...stats,
			[stat]: numValue,
		})
	}

	return (
		<section className="bg-white rounded-lg shadow-md p-6 lg:col-start-1 lg:col-end-3 lg:row-start-1 lg:row-end-2">
			<h2 className="text-xl font-bold text-gray-800 mb-4">基本ステータス</h2>
			<div className="flex flex-col gap-3">
				{/* レベル */}
				<div className="grid grid-cols-3 gap-4">
					<div className="flex flex-col">
						<label
							htmlFor="stat-level"
							className="text-sm font-medium text-gray-500"
						>
							レベル
						</label>
						<input
							id="stat-level"
							type="number"
							value={stats.level}
							onChange={(e) => handleStatChange('level', e.target.value)}
							className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							min="1"
						/>
					</div>
				</div>
				<div className="grid grid-cols-3 gap-4">
					{/* STR（力） */}
					<div className="flex flex-col">
						<label
							htmlFor="stat-str"
							className="text-sm font-medium text-gray-500"
						>
							STR
						</label>
						<input
							id="stat-str"
							type="number"
							value={stats.STR}
							onChange={(e) => handleStatChange('STR', e.target.value)}
							className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							min="0"
						/>
					</div>

					{/* INT（知力） */}
					<div className="flex flex-col">
						<label
							htmlFor="stat-int"
							className="text-sm font-medium text-gray-500"
						>
							INT
						</label>
						<input
							id="stat-int"
							type="number"
							value={stats.INT}
							onChange={(e) => handleStatChange('INT', e.target.value)}
							className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							min="0"
						/>
					</div>

					{/* VIT（体力） */}
					<div className="flex flex-col">
						<label
							htmlFor="stat-vit"
							className="text-sm font-medium text-gray-500"
						>
							VIT
						</label>
						<input
							id="stat-vit"
							type="number"
							value={stats.VIT}
							onChange={(e) => handleStatChange('VIT', e.target.value)}
							className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							min="0"
						/>
					</div>
				</div>

				<div className="grid grid-cols-3 gap-4">
					{/* AGI（俊敏性） */}
					<div className="flex flex-col">
						<label
							htmlFor="stat-agi"
							className="text-sm font-medium text-gray-500"
						>
							AGI
						</label>
						<input
							id="stat-agi"
							type="number"
							value={stats.AGI}
							onChange={(e) => handleStatChange('AGI', e.target.value)}
							className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							min="0"
						/>
					</div>

					{/* DEX（器用さ） */}
					<div className="flex flex-col">
						<label
							htmlFor="stat-dex"
							className="text-sm font-medium text-gray-500"
						>
							DEX
						</label>
						<input
							id="stat-dex"
							type="number"
							value={stats.DEX}
							onChange={(e) => handleStatChange('DEX', e.target.value)}
							className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							min="0"
						/>
					</div>
				</div>

				<div className="grid grid-cols-3 gap-4">
					{/* CRT（クリティカル） */}
					<div className="flex flex-col">
						<label
							htmlFor="stat-crt"
							className="text-sm font-medium text-gray-500"
						>
							CRT
						</label>
						<input
							id="stat-crt"
							type="number"
							value={stats.CRT}
							onChange={(e) => handleStatChange('CRT', e.target.value)}
							className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							min="0"
						/>
					</div>

					{/* MEN（精神力） */}
					<div className="flex flex-col">
						<label
							htmlFor="stat-men"
							className="text-sm font-medium text-gray-500"
						>
							MEN
						</label>
						<input
							id="stat-men"
							type="number"
							value={stats.MEN}
							onChange={(e) => handleStatChange('MEN', e.target.value)}
							className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							min="0"
						/>
					</div>

					{/* TEC（技術力） */}
					<div className="flex flex-col">
						<label
							htmlFor="stat-tec"
							className="text-sm font-medium text-gray-500"
						>
							TEC
						</label>
						<input
							id="stat-tec"
							type="number"
							value={stats.TEC}
							onChange={(e) => handleStatChange('TEC', e.target.value)}
							className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							min="0"
						/>
					</div>
				</div>
			</div>
		</section>
	)
}
