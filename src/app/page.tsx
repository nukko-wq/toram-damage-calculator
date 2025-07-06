'use client'

import { useEffect, useState } from 'react'
import { useCalculatorStore } from '@/stores'
import type { UpdateNotification } from '@/types/calculator'
import { initializeStorage } from '@/utils/saveDataManager'
import BaseStatsForm from '@/components/base-stats/BaseStatsForm'
import BuffItemForm from '@/components/buff-item/BuffItemForm'
import BuffSkillForm from '@/components/buff-skill/BuffSkillForm'
import CrystalForm from '@/components/crystal/CrystalForm'
import EnemyForm from '@/components/enemy/EnemyForm'
import EquipmentForm from '@/components/equipment/EquipmentForm'
import FoodForm from '@/components/food/FoodForm'
import WeaponForm from '@/components/weapon/WeaponForm'
import AttackSkillForm from '@/components/attack-skill/AttackSkillForm'

export default function Home() {
	// Zustandストアからデータを取得
	const { isInitialized, isLoading, initialize } = useCalculatorStore()

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
		<div className="min-h-screen bg-gray-50 py-2 sm:py-8">
			<div className="max-w-[1500px] mx-auto px-2 sm:px-6 lg:px-8">
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
										aria-label="成功アイコン"
									>
										<title>成功</title>
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
											<div
												key={`notification-${notification.type}-${index}`}
												className="mb-1"
											>
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

				<div className="grid grid-cols-[1fr] grid-rows-[repeat(9,auto)] md:grid-cols-[repeat(8,1fr)] md:grid-rows-[repeat(6,auto)] xl:grid-cols-[350px_100px_minmax(500px,1000px)] xl:grid-rows-[220px_250px_auto_auto_auto_250px_auto_auto_auto_auto] gap-2 md:gap-4">
					<BaseStatsForm />
					<WeaponForm />
					<EquipmentForm />
					<CrystalForm />
					<BuffItemForm />
					<FoodForm />
					<BuffSkillForm />
					<AttackSkillForm />
					<EnemyForm />
				</div>
			</div>
		</div>
	)
}
