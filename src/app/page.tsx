'use client'

import { useState } from 'react'
import BaseStatsForm from '@/components/BaseStatsForm'
import WeaponForm from '@/components/WeaponForm'
import EquipmentForm from '@/components/EquipmentForm'
import EnemyForm from '@/components/EnemyForm'
import StatsSummary from '@/components/StatsSummary'
import type { CalculatorData } from '@/types/calculator'
import { createInitialCalculatorData } from '@/utils/initialData'

export default function Home() {
	const [data, setData] = useState<CalculatorData>(
		createInitialCalculatorData(),
	)

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900">
						トーラムダメージ計算
					</h1>
					<p className="mt-2 text-gray-600">
						ステータスを入力してダメージを計算しましょう
					</p>
				</div>

				<div className="space-y-8">
					<BaseStatsForm
						stats={data.baseStats}
						onChange={(baseStats) => setData({ ...data, baseStats })}
					/>

					<WeaponForm
						mainWeapon={data.mainWeapon}
						subWeapon={data.subWeapon}
						onMainWeaponChange={(mainWeapon) =>
							setData({ ...data, mainWeapon })
						}
						onSubWeaponChange={(subWeapon) => setData({ ...data, subWeapon })}
					/>

					<EquipmentForm
						equipment={data.equipment}
						crystals={data.crystals}
						onEquipmentChange={(equipment) => setData({ ...data, equipment })}
						onCrystalsChange={(crystals) => setData({ ...data, crystals })}
					/>

					<EnemyForm
						enemy={data.enemy}
						onChange={(enemy) => setData({ ...data, enemy })}
					/>

					<StatsSummary data={data} />
				</div>
			</div>
		</div>
	)
}
