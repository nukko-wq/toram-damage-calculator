'use client'

import { useUIStore } from '@/stores/uiStore'
import { getUserCrystals } from '@/utils/crystalDatabase'

export default function CrystalCustomMain() {
	const {
		subsystem: { crystalCustom },
		navigateToScreen,
		setCrystalEditMode,
		resetCrystalForm,
	} = useUIStore()

	const userCrystals = getUserCrystals()

	const handleNewRegistration = () => {
		resetCrystalForm()
		navigateToScreen('type_selection')
	}

	const handleEditContent = () => {
		setCrystalEditMode('edit')
		// 一覧表示状態を設定（実際の一覧表示は次のフェーズで実装）
	}

	const handleDeleteRegistration = () => {
		setCrystalEditMode('list')
		// 削除モード（実際の実装は次のフェーズ）
	}

	const renderInitialView = () => {
		if (crystalCustom.editMode === 'list') {
			// 簡単な一覧表示
			return (
				<div className="p-6">
					<div className="mb-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							編集するクリスタルを選択
						</h3>
						<div className="space-y-3">
							{userCrystals.length === 0 ? (
								<p className="text-gray-500 text-center py-8">
									まだカスタムクリスタルが作成されていません
								</p>
							) : (
								userCrystals.map((crystal) => (
									<div
										key={crystal.id}
										className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
									>
										<div className="flex items-center space-x-4">
											<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
												<span className="text-sm font-medium text-blue-700">
													{crystal.type === 'weapon' && '武'}
													{crystal.type === 'armor' && '防'}
													{crystal.type === 'additional' && '追'}
													{crystal.type === 'special' && '特'}
													{crystal.type === 'normal' && 'ノ'}
												</span>
											</div>
											<div>
												<h4 className="font-medium text-gray-900">
													{crystal.name}
												</h4>
												<p className="text-sm text-gray-500">
													{crystal.type === 'weapon' && '武器クリスタル'}
													{crystal.type === 'armor' && '防具クリスタル'}
													{crystal.type === 'additional' && '追加クリスタル'}
													{crystal.type === 'special' && '特殊クリスタル'}
													{crystal.type === 'normal' && 'ノーマルクリスタル'}
												</p>
											</div>
										</div>
										<button
											type="button"
											className="px-4 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
										>
											編集
										</button>
									</div>
								))
							)}
						</div>
					</div>
					<div className="flex justify-center">
						<button
							type="button"
							onClick={() => setCrystalEditMode('list')}
							className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
						>
							キャンセル
						</button>
					</div>
				</div>
			)
		}

		// 初期表示（操作メニューのみ）
		return (
			<div className="p-6">
				<div className="mb-8">
					<div className="bg-white border border-gray-200 rounded-lg p-4">
						<div className="flex flex-wrap gap-4 justify-center">
							<button
								type="button"
								onClick={handleNewRegistration}
								className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
							>
								新規登録
							</button>
							<button
								type="button"
								onClick={handleEditContent}
								className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
							>
								内容変更
							</button>
							<button
								type="button"
								onClick={handleDeleteRegistration}
								className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
							>
								登録削除
							</button>
						</div>
					</div>
				</div>

				{crystalCustom.editMode !== 'edit' ? null : (
					<div className="text-center text-gray-600">
						<p>操作を選択してください</p>
					</div>
				)}
			</div>
		)
	}

	return renderInitialView()
}
