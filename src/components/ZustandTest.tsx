'use client'

import { useCalculatorStore, useUIStore } from '@/stores'

/**
 * Zustandストアの動作確認用テストコンポーネント
 * 開発環境でのみ使用
 */
export default function ZustandTest() {
	const {
		data,
		hasUnsavedChanges,
		isLoading,
		isInitialized,
		updateBaseStats,
		initialize,
		resetUnsavedChanges,
	} = useCalculatorStore()

	const { showSaveManager, setShowSaveManager } = useUIStore()

	const handleTestBaseStatsUpdate = () => {
		updateBaseStats({
			...data.baseStats,
			STR: data.baseStats.STR + 10,
		})
	}

	const handleTestInitialize = async () => {
		try {
			await initialize()
			console.log('✅ Zustand初期化成功')
		} catch (error) {
			console.error('❌ Zustand初期化失敗:', error)
		}
	}

	return (
		<div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 rounded-lg p-4 shadow-lg z-50">
			<h3 className="text-sm font-bold text-yellow-800 mb-2">
				🧪 Zustand Test Panel
			</h3>

			<div className="space-y-2 text-xs">
				<div>
					<strong>状態:</strong>
					<ul className="ml-2">
						<li>初期化済み: {isInitialized ? '✅' : '❌'}</li>
						<li>読み込み中: {isLoading ? '⏳' : '✅'}</li>
						<li>未保存変更: {hasUnsavedChanges ? '⚠️' : '✅'}</li>
						<li>STR値: {data.baseStats.STR}</li>
						<li>セーブ管理表示: {showSaveManager ? '✅' : '❌'}</li>
					</ul>
				</div>

				<div className="space-y-1">
					<button
						onClick={handleTestInitialize}
						className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
					>
						初期化テスト
					</button>

					<button
						onClick={handleTestBaseStatsUpdate}
						className="w-full px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
					>
						STR +10 (変更テスト)
					</button>

					<button
						onClick={() => resetUnsavedChanges()}
						className="w-full px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
					>
						未保存変更リセット
					</button>

					<button
						onClick={() => setShowSaveManager(!showSaveManager)}
						className="w-full px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
					>
						セーブ管理切り替え
					</button>
				</div>
			</div>
		</div>
	)
}
