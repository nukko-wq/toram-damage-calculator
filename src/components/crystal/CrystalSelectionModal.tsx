'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { CrystalType } from '@/types/calculator'
import { getCrystalsByType } from '@/utils/crystalDatabase'
import CrystalCard from './CrystalCard'
import type { SlotInfo } from '@/types/damagePreview'
import { CRYSTAL_NONE_ITEM } from '@/types/damagePreview'
import { CrystalFavoritesManager } from '@/utils/crystalFavorites'
import { useCrystalDamageSorting } from '@/hooks/useCrystalDamageSorting'
import { useDamageDifferenceCorrect } from '@/hooks/useDamageDifferenceCorrect'
import { useCalculatorStore } from '@/stores/calculatorStore'

interface CrystalSelectionModalProps {
	isOpen: boolean
	onClose: () => void
	onSelect: (crystalId: string | null) => void
	selectedCrystalId: string | null
	allowedTypes: CrystalType[]
	title: string
	// ダメージ差分表示用
	slotInfo?: SlotInfo
}

export default function CrystalSelectionModal({
	isOpen,
	onClose,
	onSelect,
	selectedCrystalId,
	allowedTypes,
	title,
	slotInfo,
}: CrystalSelectionModalProps) {
	const [activeFilter, setActiveFilter] = useState<'all' | CrystalType>('all')
	const [_favoritesChanged, setFavoritesChanged] = useState(0)

	// 「クリスタなし」の特別なID
	const CRYSTAL_NONE_ID = '__crystal_none__'

	// 「クリスタなし」のお気に入り状態
	const [isNoneFavorite, setIsNoneFavorite] = useState(() =>
		CrystalFavoritesManager.isFavorite(CRYSTAL_NONE_ID),
	)

	// 現在のクリスタルデータを取得
	const currentData = useCalculatorStore((state) => state.data)

	// 現在装着中のクリスタルがあるかどうかを判定
	const hasCurrentlyEquippedCrystal = useMemo(() => {
		if (!slotInfo || !currentData) return false

		if (
			slotInfo.type === 'crystal' &&
			slotInfo.category &&
			typeof slotInfo.slot === 'number'
		) {
			const slotKey = `${slotInfo.category}${slotInfo.slot + 1}`
			const currentCrystalId = (
				currentData.crystals as unknown as Record<string, string | null>
			)[slotKey]
			return currentCrystalId !== null && currentCrystalId !== undefined
		}

		return false
	}, [slotInfo, currentData])

	// useMemoを使用してavailableCrystalsを同期的に取得
	const availableCrystals = useMemo(() => {
		if (!isOpen) return []

		// 許可されたタイプのクリスタ + ノーマルクリスタを取得
		const allAllowedCrystals = [
			...allowedTypes.flatMap((type) => getCrystalsByType(type)),
			...getCrystalsByType('normal'),
		]

		// 重複を除去
		return allAllowedCrystals.filter(
			(crystal, index, self) =>
				index === self.findIndex((c) => c.id === crystal.id),
		)
	}, [isOpen, allowedTypes])

	// モーダルが開かれるたびにフィルターを初期化
	useEffect(() => {
		if (isOpen) {
			setActiveFilter('all')
		}
	}, [isOpen])

	// モーダルを閉じる関数
	const handleClose = useCallback(() => {
		onClose()
	}, [onClose])

	// お気に入り変更ハンドラー
	const handleFavoriteChange = useCallback(
		(crystalId: string, isFavorite: boolean) => {
			// 「クリスタなし」の場合は専用状態も更新
			if (crystalId === CRYSTAL_NONE_ID) {
				setIsNoneFavorite(isFavorite)
			}

			// お気に入り状態変更時の処理
			setFavoritesChanged((prev) => prev + 1) // 再レンダリングトリガー

			// 必要に応じて親コンポーネントに通知
			if (process.env.NODE_ENV === 'development') {
				console.log(
					`Crystal ${crystalId} favorite state changed to ${isFavorite}`,
				)
			}
		},
		[],
	)

	// 「クリスタなし」のお気に入りクリックハンドラー
	const handleNoneFavoriteClick = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation() // クリスタ選択イベントの阻止

			const newFavoriteState = !isNoneFavorite
			const success = CrystalFavoritesManager.setFavorite(
				CRYSTAL_NONE_ID,
				newFavoriteState,
			)

			if (success) {
				setIsNoneFavorite(newFavoriteState)
				setFavoritesChanged((prev) => prev + 1)
			}
		},
		[isNoneFavorite],
	)

	// ESCキーでモーダルを閉じる
	useEffect(() => {
		if (!isOpen) return

		const handleEscapeKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				handleClose()
			}
		}

		document.addEventListener('keydown', handleEscapeKey)
		return () => {
			document.removeEventListener('keydown', handleEscapeKey)
		}
	}, [isOpen, handleClose])

	// フィルタリング
	const filteredCrystals = useMemo(() => {
		if (activeFilter === 'all') return availableCrystals
		return availableCrystals.filter((crystal) => crystal.type === activeFilter)
	}, [availableCrystals, activeFilter])

	// ダメージ差分順でソート（クリスタなしを含む）
	const { sortedCrystals, isCalculating: isSorting } = useCrystalDamageSorting(
		filteredCrystals,
		slotInfo,
		isOpen && !!slotInfo,
	)

	// 「クリスタなし」のダメージ差分を計算
	const crystalNoneDamageResult = useDamageDifferenceCorrect(
		CRYSTAL_NONE_ITEM,
		slotInfo || { type: 'crystal', category: 'normal', slot: 0 },
		{ debug: false },
	)
	const crystalNoneDamageDifference = slotInfo
		? crystalNoneDamageResult.difference || 0
		: 0

	// お気に入り分別（ソート済みのクリスタルから）
	const { favoriteCrystals, otherCrystals } = useMemo(() => {
		const favoriteIds = CrystalFavoritesManager.getFavoriteCrystalIds()
		const favoriteSet = new Set(favoriteIds)

		// _favoritesChangedを使用してお気に入り状態の変更を検知
		const _unused = _favoritesChanged

		// 通常のクリスタルを分別
		const favorites = sortedCrystals.filter((crystal) =>
			favoriteSet.has(crystal.id),
		)
		const others = sortedCrystals.filter(
			(crystal) => !favoriteSet.has(crystal.id),
		)

		// 「クリスタなし」をダメージ差分に基づいて適切な位置に挿入
		// クリスタが装着されていない場合でも「クリスタなし」カードを表示
		{
			// biome-ignore lint/suspicious/noExplicitAny: Crystal typeと互換性のないNone用の仮想アイテム
			const crystalNoneWithDamage: any = {
				id: CRYSTAL_NONE_ID,
				name: 'クリスタなし',
				type: 'normal',
				properties: {},
				conditionalEffects: [],
				damageDifference: crystalNoneDamageDifference,
			}

			// お気に入りかどうかで分岐
			if (isNoneFavorite) {
				// お気に入りリストに挿入（ダメージ差分順）
				const insertIndex = favorites.findIndex((crystal) => {
					// biome-ignore lint/suspicious/noExplicitAny: CrystalWithDamageタイプのダメージ差分プロパティアクセス
					const crystalDamage =
						'damageDifference' in crystal &&
						typeof (crystal as any).damageDifference === 'number'
							? (crystal as any).damageDifference
							: 0
					return crystalNoneWithDamage.damageDifference > crystalDamage
				})
				if (insertIndex === -1) {
					favorites.push(crystalNoneWithDamage)
				} else {
					favorites.splice(insertIndex, 0, crystalNoneWithDamage)
				}
			} else {
				// その他リストに挿入（ダメージ差分順）
				const insertIndex = others.findIndex((crystal) => {
					// biome-ignore lint/suspicious/noExplicitAny: CrystalWithDamageタイプのダメージ差分プロパティアクセス
					const crystalDamage =
						'damageDifference' in crystal &&
						typeof (crystal as any).damageDifference === 'number'
							? (crystal as any).damageDifference
							: 0
					return crystalNoneWithDamage.damageDifference > crystalDamage
				})
				if (insertIndex === -1) {
					others.push(crystalNoneWithDamage)
				} else {
					others.splice(insertIndex, 0, crystalNoneWithDamage)
				}
			}
		}

		return {
			favoriteCrystals: favorites,
			otherCrystals: others,
		}
	}, [
		sortedCrystals,
		isNoneFavorite,
		crystalNoneDamageDifference,
		_favoritesChanged,
	])

	const getFilterLabel = (filter: string) => {
		switch (filter) {
			case 'all':
				return '全て'
			case 'weapon':
				return '武器'
			case 'armor':
				return '防具'
			case 'additional':
				return '追加'
			case 'special':
				return '特殊'
			case 'normal':
				return 'ノーマル'
			default:
				return filter
		}
	}

	const handleSelect = useCallback(
		(crystalId: string) => {
			onSelect(crystalId)
			handleClose()
		},
		[onSelect, handleClose],
	)

	const handleRemove = useCallback(() => {
		onSelect(null)
		handleClose()
	}, [onSelect, handleClose])

	const handleBackgroundClick = useCallback(
		(e: React.MouseEvent) => {
			// クリックされた要素がモーダルコンテンツ内かどうかをチェック
			if (e.target === e.currentTarget) {
				handleClose()
			}
		},
		[handleClose],
	)

	const handleContentClick = useCallback((e: React.MouseEvent) => {
		// モーダル内のクリックは伝播を停止
		e.stopPropagation()
	}, [])

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					key="modal-backdrop"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
					className="fixed inset-0 z-[10000] flex items-end justify-center p-4 bg-black/50"
					onClick={handleBackgroundClick}
					aria-labelledby="modal-title"
					aria-modal="true"
				>
					<motion.div
						key="modal-content"
						initial={{ opacity: 0, scale: 0.95, y: 8 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0, y: 0 }}
						transition={{
							type: 'tween',
							ease: 'easeOut',
							duration: 0.2,
						}}
						style={{ willChange: 'transform' }}
						className="bg-white rounded-lg shadow-xl w-[calc(100%-1rem)] max-h-[78vh] sm:max-h-[68vh] overflow-hidden h-fit"
						onClick={handleContentClick}
					>
						{/* ヘッダー */}
						<div className="flex items-center justify-between p-6 border-b">
							<h2
								id="modal-title"
								className="text-lg sm:text-xl font-bold text-gray-900"
							>
								{title}
							</h2>
							<button
								type="button"
								onClick={handleClose}
								className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
								aria-label="モーダルを閉じる"
							>
								<svg
									className="w-6 h-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<title>閉じる</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>

						{/* フィルタータブ */}
						<div className="px-4 sm:px-6 py-2 sm:py-4 border-b bg-gray-50">
							<div className="flex flex-wrap gap-2">
								<button
									type="button"
									onClick={() => setActiveFilter('all')}
									className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
										activeFilter === 'all'
											? 'bg-blue-500/80 text-white'
											: 'bg-white text-gray-700 hover:bg-gray-100'
									}`}
								>
									全て ({availableCrystals.length})
								</button>
								{([...allowedTypes, 'normal'] as CrystalType[]).map((type) => {
									const count = availableCrystals.filter(
										(c) => c.type === type,
									).length
									if (count === 0) return null

									return (
										<button
											key={type}
											type="button"
											onClick={() => setActiveFilter(type)}
											className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
												activeFilter === type
													? 'bg-blue-500/80 text-white'
													: 'bg-white text-gray-700 hover:bg-gray-100'
											}`}
										>
											{getFilterLabel(type)} ({count})
										</button>
									)
								})}
							</div>
						</div>

						{/* クリスタ一覧 */}
						<div className="p-4 sm:p-6 overflow-y-auto max-h-[48vh]">
							{/* ダメージ差分計算中の表示 */}
							{isSorting && slotInfo && (
								<div className="flex items-center justify-center py-4 mb-4 text-sm text-gray-500 bg-gray-50 rounded-lg">
									<svg
										className="w-4 h-4 mr-2 animate-spin"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										/>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										/>
									</svg>
									ダメージ差分を計算中...
								</div>
							)}
							{/* お気に入りクリスタセクション */}
							{favoriteCrystals.length > 0 && (
								<div className="mb-6">
									<h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
										<svg
											className="w-4 h-4 text-rose-500/80 mr-1"
											fill="currentColor"
											viewBox="0 0 24 24"
										>
											<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
										</svg>
										お気に入り ({favoriteCrystals.length})
									</h3>
									<div className="flex flex-wrap gap-4 justify-center sm:justify-start">
										{favoriteCrystals.map((crystal) => {
											// 「クリスタなし」の場合は専用カードを表示
											if (crystal.id === CRYSTAL_NONE_ID) {
												return (
													<div
														key={crystal.id}
														onClick={handleRemove}
														className={`
															relative w-full max-w-[100%] sm:max-w-[260px] p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md
															${
																selectedCrystalId === null
																	? 'border-blue-500 bg-blue-50 shadow-md'
																	: 'border-gray-200 bg-white hover:border-gray-300'
															}
														`}
													>
														{/* お気に入りボタン */}
														<button
															type="button"
															onClick={handleNoneFavoriteClick}
															className="absolute bottom-2 right-2 p-1.5 rounded-full transition-all duration-200 hover:scale-110 z-10 text-red-500 hover:text-red-600"
															aria-label="お気に入りから削除"
														>
															<svg
																className="w-5 h-5"
																fill="currentColor"
																viewBox="0 0 24 24"
															>
																<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
															</svg>
														</button>

														{/* クリスタなしと選択マーク */}
														<div className="flex justify-between items-center mb-1 sm:mb-2">
															<h3 className="font-semibold text-gray-900">
																クリスタなし
															</h3>
															{selectedCrystalId === null && (
																<div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center ml-2">
																	<svg
																		className="w-4 h-4 text-white"
																		fill="none"
																		stroke="currentColor"
																		viewBox="0 0 24 24"
																	>
																		<path
																			strokeLinecap="round"
																			strokeLinejoin="round"
																			strokeWidth={2}
																			d="M5 13l4 4L19 7"
																		/>
																	</svg>
																</div>
															)}
														</div>

														{/* ダメージ差分表示（他のクリスタルと同じ形式） */}
														{slotInfo && (
															<div className="mb-1 sm:mb-2">
																<div className="font-medium">
																	<span
																		className={`mr-3 text-sm ${
																			crystalNoneDamageDifference > 0
																				? 'text-blue-500'
																				: crystalNoneDamageDifference < 0
																					? 'text-red-500'
																					: 'text-gray-400'
																		}`}
																	>
																		ダメージ：
																	</span>
																	<span
																		className={`text-sm ${
																			crystalNoneDamageDifference > 0
																				? 'text-blue-600'
																				: crystalNoneDamageDifference < 0
																					? 'text-red-600'
																					: 'text-gray-500'
																		}`}
																	>
																		{crystalNoneDamageDifference === 0
																			? '±0'
																			: crystalNoneDamageDifference > 0
																				? `+${crystalNoneDamageDifference.toLocaleString()}`
																				: crystalNoneDamageDifference.toLocaleString()}
																	</span>
																</div>
															</div>
														)}
													</div>
												)
											}

											// 通常のクリスタルカード
											return (
												<CrystalCard
													key={crystal.id}
													crystal={crystal}
													isSelected={selectedCrystalId === crystal.id}
													onClick={() => handleSelect(crystal.id)}
													showDamageDifference={isOpen && !!slotInfo}
													slotInfo={slotInfo}
													showFavoriteButton={true}
													onFavoriteChange={handleFavoriteChange}
												/>
											)
										})}
									</div>
								</div>
							)}

							{/* その他のクリスタセクション */}
							{otherCrystals.length > 0 && (
								<div className="mb-6">
									<h3 className="text-sm font-medium text-gray-700 mb-3">
										その他 ({otherCrystals.length})
									</h3>
									<div className="flex flex-wrap gap-4 justify-center sm:justify-start">
										{otherCrystals.map((crystal) => {
											// 「クリスタなし」の場合は専用カードを表示
											if (crystal.id === CRYSTAL_NONE_ID) {
												return (
													<div
														key={crystal.id}
														onClick={handleRemove}
														className={`
															relative w-full max-w-[100%] sm:max-w-[260px] p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md
															${
																selectedCrystalId === null
																	? 'border-blue-500 bg-blue-50 shadow-md'
																	: 'border-gray-200 bg-white hover:border-gray-300'
															}
														`}
													>
														{/* お気に入りボタン */}
														<button
															type="button"
															onClick={handleNoneFavoriteClick}
															className="absolute bottom-2 right-2 p-1.5 rounded-full transition-all duration-200 hover:scale-110 z-10 text-gray-300 hover:text-red-400"
															aria-label="お気に入りに追加"
														>
															<svg
																className="w-5 h-5"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
																/>
															</svg>
														</button>

														{/* クリスタなしと選択マーク */}
														<div className="flex justify-between items-center mb-1 sm:mb-2">
															<h3 className="font-semibold text-gray-900">
																クリスタなし
															</h3>
															{selectedCrystalId === null && (
																<div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center ml-2">
																	<svg
																		className="w-4 h-4 text-white"
																		fill="none"
																		stroke="currentColor"
																		viewBox="0 0 24 24"
																	>
																		<path
																			strokeLinecap="round"
																			strokeLinejoin="round"
																			strokeWidth={2}
																			d="M5 13l4 4L19 7"
																		/>
																	</svg>
																</div>
															)}
														</div>

														{/* ダメージ差分表示（他のクリスタルと同じ形式） */}
														{slotInfo && (
															<div className="mb-1 sm:mb-2">
																<div className="font-medium">
																	<span
																		className={`mr-3 text-sm ${
																			crystalNoneDamageDifference > 0
																				? 'text-blue-500'
																				: crystalNoneDamageDifference < 0
																					? 'text-red-500'
																					: 'text-gray-400'
																		}`}
																	>
																		ダメージ：
																	</span>
																	<span
																		className={`text-sm ${
																			crystalNoneDamageDifference > 0
																				? 'text-blue-600'
																				: crystalNoneDamageDifference < 0
																					? 'text-red-600'
																					: 'text-gray-500'
																		}`}
																	>
																		{crystalNoneDamageDifference === 0
																			? '±0'
																			: crystalNoneDamageDifference > 0
																				? `+${crystalNoneDamageDifference.toLocaleString()}`
																				: crystalNoneDamageDifference.toLocaleString()}
																	</span>
																</div>
															</div>
														)}
													</div>
												)
											}

											// 通常のクリスタルカード
											return (
												<CrystalCard
													key={crystal.id}
													crystal={crystal}
													isSelected={selectedCrystalId === crystal.id}
													onClick={() => handleSelect(crystal.id)}
													showDamageDifference={isOpen && !!slotInfo}
													slotInfo={slotInfo}
													showFavoriteButton={true}
													onFavoriteChange={handleFavoriteChange}
												/>
											)
										})}
									</div>
								</div>
							)}

							{/* アイテムが見つからない場合 - クリスタなしを除いて判定 */}
							{favoriteCrystals.filter((c) => c.id !== CRYSTAL_NONE_ID)
								.length === 0 &&
								otherCrystals.filter((c) => c.id !== CRYSTAL_NONE_ID).length ===
									0 && (
									<div className="text-center text-gray-500 py-8">
										該当するクリスタがありません
									</div>
								)}
						</div>

						{/* フッター */}
						<div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
							<button
								type="button"
								onClick={handleClose}
								className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
							>
								キャンセル
							</button>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}
