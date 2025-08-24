'use client'

import { useMemo } from 'react'
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

	// クリスタルをタイプ別にグルーピング
	const groupedCrystals = useMemo(() => {
		const groups: Record<string, typeof userCrystals> = {
			weapon: [],
			armor: [],
			additional: [],
			special: [],
			normal: [],
		}

		userCrystals.forEach((crystal) => {
			if (groups[crystal.type]) {
				groups[crystal.type].push(crystal)
			}
		})

		return groups
	}, [userCrystals])

	const getTypeLabel = (type: string) => {
		switch (type) {
			case 'weapon':
				return '武器クリスタル'
			case 'armor':
				return '防具クリスタル'
			case 'additional':
				return '追加クリスタル'
			case 'special':
				return '特殊クリスタル'
			case 'normal':
				return 'ノーマルクリスタル'
			default:
				return type
		}
	}

	const getTypeIcon = (type: string) => {
		switch (type) {
			case 'weapon':
				return '武'
			case 'armor':
				return '防'
			case 'additional':
				return '追'
			case 'special':
				return '特'
			case 'normal':
				return 'ノ'
			default:
				return '?'
		}
	}

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
		if (crystalCustom.editMode === 'edit') {
			// 編集用の一覧表示
			return (
				<div className="p-6">
					<div className="mb-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							編集するクリスタルを選択
						</h3>
						<div className="space-y-4">
							{userCrystals.length === 0 ? (
								<p className="text-gray-500 text-center py-8">
									まだカスタムクリスタルが作成されていません
								</p>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{Object.entries(groupedCrystals).map(([type, crystals]) =>
										crystals.length > 0 ? (
											<div
												key={type}
												className="border border-gray-200 rounded-lg p-4"
											>
												<h4 className="text-md font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">
													{getTypeLabel(type)}
												</h4>
												<div className="space-y-3">
													{crystals.map((crystal) => (
														<div
															key={crystal.id}
															className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
														>
															<div className="flex items-center space-x-3">
																<div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
																	<span className="text-xs font-medium text-blue-700">
																		{getTypeIcon(crystal.type)}
																	</span>
																</div>
																<div className="min-w-0 flex-1">
																	<h5 className="font-medium text-gray-900 text-sm truncate">
																		{crystal.name}
																	</h5>
																</div>
															</div>
															<button
																type="button"
																className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors cursor-pointer flex-shrink-0"
															>
																編集
															</button>
														</div>
													))}
												</div>
											</div>
										) : null,
									)}
								</div>
							)}
						</div>
					</div>
					<div className="flex justify-center">
						<button
							type="button"
							onClick={() => setCrystalEditMode('create')}
							className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
						>
							キャンセル
						</button>
					</div>
				</div>
			)
		}

		if (crystalCustom.editMode === 'list') {
			// 削除用の一覧表示
			return (
				<div className="p-6">
					<div className="mb-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							削除するクリスタルを選択してください
						</h3>
						<div className="space-y-4">
							{userCrystals.length === 0 ? (
								<p className="text-gray-500 text-center py-8">
									まだカスタムクリスタルが作成されていません
								</p>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{Object.entries(groupedCrystals).map(([type, crystals]) =>
										crystals.length > 0 ? (
											<div
												key={type}
												className="border border-gray-200 rounded-lg p-4"
											>
												<h4 className="text-md font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">
													{getTypeLabel(type)}
												</h4>
												<div className="space-y-3">
													{crystals.map((crystal) => (
														<div
															key={crystal.id}
															className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
														>
															<div className="flex items-center space-x-3">
																<div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
																	<span className="text-xs font-medium text-blue-700">
																		{getTypeIcon(crystal.type)}
																	</span>
																</div>
																<div className="min-w-0 flex-1">
																	<h5 className="font-medium text-gray-900 text-sm truncate">
																		{crystal.name}
																	</h5>
																</div>
															</div>
															<button
																type="button"
																className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors cursor-pointer flex-shrink-0"
															>
																削除
															</button>
														</div>
													))}
												</div>
											</div>
										) : null,
									)}
								</div>
							)}
						</div>
					</div>
					<div className="flex justify-center">
						<button
							type="button"
							onClick={() => setCrystalEditMode('create')}
							className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
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
								className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium cursor-pointer"
							>
								新規登録
							</button>
							<button
								type="button"
								onClick={handleEditContent}
								className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium cursor-pointer"
							>
								内容変更
							</button>
							<button
								type="button"
								onClick={handleDeleteRegistration}
								className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium cursor-pointer"
							>
								登録削除
							</button>
						</div>
					</div>
				</div>
			</div>
		)
	}

	return renderInitialView()
}
