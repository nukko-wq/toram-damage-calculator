'use client'

import { useState, useEffect } from 'react'
import BaseStatsForm from '@/components/BaseStatsForm'
import WeaponForm from '@/components/WeaponForm'
import CrystalForm from '@/components/CrystalForm'
import EquipmentForm from '@/components/EquipmentForm'
import NewEnemyForm from '@/components/NewEnemyForm'
import StatsSummary from '@/components/StatsSummary'
import SaveDataManager from '@/components/SaveDataManager'
import type { CalculatorData } from '@/types/calculator'
import { createInitialCalculatorData } from '@/utils/initialData'
import {
	saveCurrentData,
	initializeStorage,
	getCurrentSaveData,
} from '@/utils/saveDataManager'

export default function Home() {
	const [data, setData] = useState<CalculatorData>(
		createInitialCalculatorData(),
	)
	const [showSaveManager, setShowSaveManager] = useState(false)
	const [isInitialized, setIsInitialized] = useState(false)
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

	// アプリケーション初期化
	useEffect(() => {
		const initializeApp = async () => {
			try {
				await initializeStorage()
				const currentSave = getCurrentSaveData()
				setData(currentSave.data)
				setIsInitialized(true)
			} catch (error) {
				console.error('アプリケーション初期化エラー:', error)
				setIsInitialized(true) // エラーでも初期化完了とする
			}
		}

		initializeApp()
	}, [])

	// データが変更されたとき（自動保存なし）
	const handleDataChange = (newData: CalculatorData) => {
		setData(newData)
		setHasUnsavedChanges(true)
	}

	// セーブデータの読み込み
	const handleDataLoad = (loadedData: CalculatorData) => {
		setData(loadedData)
		setHasUnsavedChanges(false) // 読み込み時は未保存状態をリセット
	}

	// 現在のデータを手動保存
	const handleManualSave = async () => {
		try {
			await saveCurrentData(data)
			setHasUnsavedChanges(false) // 保存後は未保存状態をリセット
		} catch (error) {
			console.error('データ保存エラー:', error)
		}
	}

	// 初期化が完了するまで読み込み表示
	if (!isInitialized) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
					<p className="mt-4 text-gray-600">読み込み中...</p>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900">
						トーラムダメージ計算
					</h1>
					<p className="mt-2 text-gray-600">
						ステータスを入力してダメージを計算しましょう
					</p>

					{/* セーブデータ管理切り替えボタン */}
					<div className="mt-4">
						<button
							type="button"
							onClick={() => setShowSaveManager(!showSaveManager)}
							className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							<svg
								className="mr-2 h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
							{showSaveManager ? 'セーブ管理を閉じる' : 'セーブデータ管理'}
						</button>
					</div>
				</div>

				{/* セーブデータ管理パネル */}
				{showSaveManager && (
					<div className="mb-8">
						<SaveDataManager
							currentData={data}
							onDataLoad={handleDataLoad}
							onDataSave={handleManualSave}
							hasUnsavedChanges={hasUnsavedChanges}
						/>
					</div>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-[350px_100px_minmax(500px,1000px)] lg:grid-rows-[220px_250px_auto_auto_250px_auto_auto] gap-4">
					<BaseStatsForm
						stats={data.baseStats}
						onChange={(baseStats) => handleDataChange({ ...data, baseStats })}
					/>

					<WeaponForm
						mainWeapon={data.mainWeapon}
						subWeapon={data.subWeapon}
						onMainWeaponChange={(mainWeapon) =>
							handleDataChange({ ...data, mainWeapon })
						}
						onSubWeaponChange={(subWeapon) =>
							handleDataChange({ ...data, subWeapon })
						}
					/>

					<CrystalForm
						crystals={data.crystals}
						onChange={(crystals) => handleDataChange({ ...data, crystals })}
					/>

					<EquipmentForm
						equipment={data.equipment}
						onEquipmentChange={(equipment) =>
							handleDataChange({ ...data, equipment })
						}
					/>

					<NewEnemyForm
						enemyData={data.enemy}
						onChange={(enemy) => handleDataChange({ ...data, enemy })}
					/>
				</div>
				<StatsSummary data={data} />
			</div>
		</div>
	)
}
