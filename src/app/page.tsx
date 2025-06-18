'use client'

import { useState, useEffect } from 'react'
import { useCalculatorStore, useUIStore } from '@/stores'
import BaseStatsForm from '@/components/BaseStatsForm'
import WeaponForm from '@/components/WeaponForm'
import CrystalForm from '@/components/CrystalForm'
import EquipmentForm from '@/components/EquipmentForm'
import FoodForm from '@/components/FoodForm'
import NewEnemyForm from '@/components/NewEnemyForm'
import BuffSkillForm from '@/components/BuffSkillForm'
import StatsSummary from '@/components/StatsSummary'
import SaveDataManager from '@/components/SaveDataManager'
import ZustandTest from '@/components/ZustandTest'
import type { UpdateNotification } from '@/types/calculator'
import { initializeStorage } from '@/utils/saveDataManager'

export default function Home() {
	// Zustandストアからデータを取得
	const { showSaveManager, setShowSaveManager } = useUIStore()
	const {
		data,
		isInitialized,
		isLoading,
		initialize,
	} = useCalculatorStore()

	// アップデート通知（Zustand移行後も必要）
	const [updateNotifications, setUpdateNotifications] = useState<
		UpdateNotification[]
	>([])
	const [showUpdateNotifications, setShowUpdateNotifications] = useState(false)

	// アプリケーション初期化（Zustandベース）
	useEffect(() => {
		const initializeApp = async () => {
			try {
				const notifications = await initializeStorage()
				setUpdateNotifications(notifications)
				if (notifications.length > 0) {
					setShowUpdateNotifications(true)
				}
				
				// Zustandストアで初期化
				await initialize()
			} catch (error) {
				console.error('アプリケーション初期化エラー:', error)
			}
		}

		initializeApp()
	}, [initialize])


	// 全てのデータ変更はZustandストア経由で管理（props不要）
	// 各フォームコンポーネントは直接Zustandストアを参照・更新

	// 初期化が完了するまで読み込み表示（Zustandベース）
	if (!isInitialized || isLoading) {
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
								aria-label="セーブデータ管理アイコン"
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

				{/* 更新通知 */}
				{showUpdateNotifications && updateNotifications.length > 0 && (
					<div className="mb-8">
						<div className="bg-green-50 border border-green-200 rounded-md p-4">
							<div className="flex">
								<div className="flex-shrink-0">
									<svg
										className="h-5 w-5 text-green-400"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<div className="ml-3">
									<h3 className="text-sm font-medium text-green-800">
										新しいデータが追加されました
									</h3>
									<div className="mt-2 text-sm text-green-700">
										{updateNotifications.map((notification, index) => (
											<div key={`notification-${notification.type}-${index}`} className="mb-1">
												{notification.type === 'equipments' && '新しい装備'}
												{notification.type === 'crystals' && '新しいクリスタル'}
												{notification.type === 'enemies' && '新しい敵情報'}が
												{notification.count}件追加されました
											</div>
										))}
									</div>
									<div className="mt-3">
										<button
											type="button"
											onClick={() => setShowUpdateNotifications(false)}
											className="text-sm font-medium text-green-800 hover:text-green-600"
										>
											閉じる
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* セーブデータ管理パネル */}
				{showSaveManager && (
					<div className="mb-8">
						<SaveDataManager key="save-manager" />
					</div>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-[350px_100px_minmax(500px,1000px)] lg:grid-rows-[220px_250px_auto_auto_auto_250px_auto_auto_auto] gap-4">
					<BaseStatsForm />
					<WeaponForm />
					<CrystalForm />
					<EquipmentForm />
					<FoodForm />
					<NewEnemyForm />
					<BuffSkillForm />
				</div>
				<StatsSummary data={data} />
				
				{/* Zustand動作確認用（開発環境のみ） */}
				{process.env.NODE_ENV === 'development' && <ZustandTest />}
			</div>
		</div>
	)
}
