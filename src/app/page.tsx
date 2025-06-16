'use client'

import { useState } from 'react'
import BaseStatsForm from '@/components/BaseStatsForm'
import WeaponForm from '@/components/WeaponForm'
import CrystalForm from '@/components/CrystalForm'
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

				<div className="space-y-8 grid lg:grid-cols-[350px_100px_minmax(500px,1fr)] lg:grid-rows-[400px_400px_auto_auto_250px_auto_auto] gap-4">
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

					<CrystalForm
						crystals={data.crystals}
						onChange={(crystals) => setData({ ...data, crystals })}
					/>

					<EquipmentForm
						equipment={data.equipment}
						onEquipmentChange={(equipment) => setData({ ...data, equipment })}
					/>

					<EnemyForm
						enemy={data.enemy}
						onChange={(enemy) => setData({ ...data, enemy })}
					/>
				</div>
				<StatsSummary data={data} />
			</div>
		</div>
	)
}
