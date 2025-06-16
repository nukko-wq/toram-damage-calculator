'use client'

import { EnemyInfo } from '@/types/calculator'

interface EnemyFormProps {
	enemy: EnemyInfo
	onChange: (enemy: EnemyInfo) => void
}

export default function EnemyForm({ enemy, onChange }: EnemyFormProps) {
	const handleChange = (field: keyof EnemyInfo, value: string) => {
		const numValue = parseInt(value) || 0

		onChange({
			...enemy,
			[field]: numValue,
		})
	}

	return (
		<section className="bg-white rounded-lg shadow-md p-6 col-start-1 col-end-3 row-start-6 row-end-7">
			<h2 className="text-xl font-bold text-gray-800 mb-4">敵情報</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<div className="flex flex-col">
					<label className="text-sm font-medium text-gray-700 mb-1">
						DEF（物理防御力）
					</label>
					<input
						type="number"
						value={enemy.DEF}
						onChange={(e) => handleChange('DEF', e.target.value)}
						className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						min="0"
					/>
				</div>

				<div className="flex flex-col">
					<label className="text-sm font-medium text-gray-700 mb-1">
						MDEF（魔法防御力）
					</label>
					<input
						type="number"
						value={enemy.MDEF}
						onChange={(e) => handleChange('MDEF', e.target.value)}
						className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						min="0"
					/>
				</div>

				<div className="flex flex-col">
					<label className="text-sm font-medium text-gray-700 mb-1">
						敵レベル
					</label>
					<input
						type="number"
						value={enemy.level}
						onChange={(e) => handleChange('level', e.target.value)}
						className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						min="1"
					/>
				</div>

				<div className="flex flex-col">
					<label className="text-sm font-medium text-gray-700 mb-1">
						free値
					</label>
					<input
						type="number"
						value={enemy.freeValue}
						onChange={(e) => handleChange('freeValue', e.target.value)}
						className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						min="0"
					/>
				</div>

				<div className="flex flex-col">
					<label
						htmlFor="guaranteedCritical"
						className="text-sm font-medium text-gray-700 mb-1"
					>
						確定クリティカル
					</label>
					<input
						id="guaranteedCritical"
						type="number"
						value={enemy.guaranteedCritical}
						onChange={(e) => handleChange('guaranteedCritical', e.target.value)}
						className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						min="0"
						placeholder="例: 100"
					/>
				</div>
			</div>
		</section>
	)
}
