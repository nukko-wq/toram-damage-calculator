'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { BuffItemCategory, PresetBuffItem } from '@/types/calculator'
import {
	getBuffItemsByCategory,
} from '@/utils/buffItemDatabase'
import BuffItemCard from './BuffItemCard'
import type { SlotInfo } from '@/types/damagePreview'
import { BuffItemFavoritesManager } from '@/utils/buffItemFavorites'

interface BuffItemSelectionModalProps {
	isOpen: boolean
	onClose: () => void
	onSelect: (buffItemId: string | null) => void
	selectedBuffItemId: string | null
	category: BuffItemCategory
	title: string
	// ダメージ差分表示用
	slotInfo?: SlotInfo
}

export default function BuffItemSelectionModal({
	isOpen,
	onClose,
	onSelect,
	selectedBuffItemId,
	category,
	title,
	slotInfo,
}: BuffItemSelectionModalProps) {
	const [activeFilter, _setActiveFilter] = useState<'all' | BuffItemCategory>(
		'all',
	)
	const [availableBuffItems, setAvailableBuffItems] = useState<
		PresetBuffItem[]
	>([])
	const [favoritesChanged, setFavoritesChanged] = useState(0)
	
	// 「バフアイテムなし」の特別なID
	const BUFF_ITEM_NONE_ID = '__buff_item_none__'
	
	// 「バフアイテムなし」のお気に入り状態
	const [isNoneFavorite, setIsNoneFavorite] = useState(
		() => BuffItemFavoritesManager.isFavorite(BUFF_ITEM_NONE_ID),
	)

	// モーダルを閉じる関数
	const handleClose = useCallback(() => {
		onClose()
	}, [onClose])

	// お気に入り変更ハンドラー
	const handleFavoriteChange = useCallback(
		(buffItemId: string, isFavorite: boolean) => {
			// 「バフアイテムなし」の場合は専用状態も更新
			if (buffItemId === BUFF_ITEM_NONE_ID) {
				setIsNoneFavorite(isFavorite)
			}
			
			// お気に入り状態変更時の処理
			setFavoritesChanged((prev) => prev + 1) // 再レンダリングトリガー

			// 必要に応じて親コンポーネントに通知
			if (process.env.NODE_ENV === 'development') {
				console.log(
					`BuffItem ${buffItemId} favorite state changed to ${isFavorite}`,
				)
			}
		},
		[BUFF_ITEM_NONE_ID],
	)
	
	// 「バフアイテムなし」のお気に入りクリックハンドラー
	const handleNoneFavoriteClick = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation() // バフアイテム選択イベントの阻止

			const newFavoriteState = !isNoneFavorite
			const success = BuffItemFavoritesManager.setFavorite(
				BUFF_ITEM_NONE_ID,
				newFavoriteState,
			)

			if (success) {
				setIsNoneFavorite(newFavoriteState)
				setFavoritesChanged((prev) => prev + 1)
			}
		},
		[BUFF_ITEM_NONE_ID, isNoneFavorite],
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

	useEffect(() => {
		if (!isOpen) return

		// 指定されたカテゴリのバフアイテムを取得
		const categoryItems = getBuffItemsByCategory(category)
		setAvailableBuffItems(categoryItems)
	}, [isOpen, category])

	// バフアイテムリストの分別: お気に入り / その他
	const { favoriteBuffItems, otherBuffItems } = useMemo(() => {
		// 指定されたカテゴリのアイテムをフィルタリング（activeFilter は使用しない）
		const filtered = availableBuffItems

		// お気に入り分別
		const favoriteIds = BuffItemFavoritesManager.getFavoriteBuffItemIds()
		const favoriteSet = new Set(favoriteIds)

		const favorites = filtered.filter((buffItem) =>
			favoriteSet.has(buffItem.id),
		)
		const others = filtered.filter((buffItem) => !favoriteSet.has(buffItem.id))

		return {
			favoriteBuffItems: favorites,
			otherBuffItems: others
		}
	}, [availableBuffItems, favoritesChanged])

	const _getCategoryLabel = (categoryValue: string) => {
		switch (categoryValue) {
			case 'all':
				return '全て'
			case 'physicalPower':
				return '物理威力'
			case 'magicalPower':
				return '魔法威力'
			case 'physicalDefense':
				return '物理防御'
			case 'magicalDefense':
				return '魔法防御'
			case 'elementalAttack':
				return '属性攻撃'
			case 'elementalDefense':
				return '属性防御'
			case 'speed':
				return '速度'
			case 'casting':
				return '詠唱'
			case 'mp':
				return 'MP'
			case 'hp':
				return 'HP'
			case 'accuracy':
				return '命中'
			case 'evasion':
				return '回避'
			default:
				return categoryValue
		}
	}

	const handleSelect = useCallback(
		(buffItemId: string) => {
			onSelect(buffItemId)
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
					key="buff-item-modal-backdrop"
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
						key="buff-item-modal-content"
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

						{/* バフアイテム一覧 */}
						<div className="p-4 sm:p-6 overflow-y-auto max-h-[48vh]">
							{/* お気に入りバフアイテムセクション */}
							{(favoriteBuffItems.length > 0 || isNoneFavorite) && (
								<div className="mb-6">
									<h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
										<svg className="w-4 h-4 text-red-500 mr-1" fill="currentColor" viewBox="0 0 24 24">
											<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
										</svg>
										お気に入り ({favoriteBuffItems.length + (isNoneFavorite ? 1 : 0)})
									</h3>
									<div className="flex flex-wrap gap-4 justify-center sm:justify-start">
										{/* お気に入りの「バフアイテムなし」 */}
										{isNoneFavorite && (
											<div
												onClick={handleRemove}
												className={`
													relative w-full max-w-[100%] sm:max-w-[260px] p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md
													${
														selectedBuffItemId === null
															? 'border-blue-500 bg-blue-50 shadow-md'
															: 'border-gray-200 bg-white hover:border-gray-300'
													}
												`}
											>
												{/* お気に入りボタン - 右下に絶対配置 */}
												<button
													type="button"
													onClick={handleNoneFavoriteClick}
													className="absolute bottom-2 right-2 p-1.5 rounded-full transition-all duration-200 hover:scale-110 z-10 text-red-500 hover:text-red-600"
													aria-label="お気に入りから削除"
												>
													<svg
														className="w-5 h-5"
														fill="currentColor"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<title>お気に入り済み</title>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={0}
															d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
														/>
													</svg>
												</button>

												{/* 上部エリア：選択マーク */}
												<div className="flex justify-between items-start mb-2 min-h-[24px]">
													<div className="flex-1" />

													{/* 選択状態のチェックマーク */}
													{selectedBuffItemId === null && (
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

												{/* バフアイテムなし名 */}
												<h3 className="font-semibold text-gray-900 mb-2">バフアイテムなし</h3>
											</div>
										)}

										{/* お気に入りバフアイテムカード */}
										{favoriteBuffItems.map((buffItem) => (
											<BuffItemCard
												key={buffItem.id}
												buffItem={buffItem}
												isSelected={selectedBuffItemId === buffItem.id}
												onClick={() => handleSelect(buffItem.id)}
												showDamageDifference={isOpen && !!slotInfo}
												slotInfo={slotInfo}
												showFavoriteButton={true}
												onFavoriteChange={handleFavoriteChange}
											/>
										))}
									</div>
								</div>
							)}

							{/* その他のバフアイテムセクション */}
							{(otherBuffItems.length > 0 || !isNoneFavorite) && (
								<div className="mb-6">
									<h3 className="text-sm font-medium text-gray-700 mb-3">
										その他 ({otherBuffItems.length + (!isNoneFavorite ? 1 : 0)})
									</h3>
									<div className="flex flex-wrap gap-4 justify-center sm:justify-start">
										{/* その他の「バフアイテムなし」 */}
										{!isNoneFavorite && (
											<div
												onClick={handleRemove}
												className={`
													relative w-full max-w-[100%] sm:max-w-[260px] p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md
													${
														selectedBuffItemId === null
															? 'border-blue-500 bg-blue-50 shadow-md'
															: 'border-gray-200 bg-white hover:border-gray-300'
													}
												`}
											>
												{/* お気に入りボタン - 右下に絶対配置 */}
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
														<title>お気に入りに追加</title>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
														/>
													</svg>
												</button>

												{/* 上部エリア：選択マーク */}
												<div className="flex justify-between items-start mb-2 min-h-[24px]">
													<div className="flex-1" />

													{/* 選択状態のチェックマーク */}
													{selectedBuffItemId === null && (
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

												{/* バフアイテムなし名 */}
												<h3 className="font-semibold text-gray-900 mb-2">バフアイテムなし</h3>
											</div>
										)}

										{/* その他のバフアイテムカード */}
										{otherBuffItems.map((buffItem) => (
											<BuffItemCard
												key={buffItem.id}
												buffItem={buffItem}
												isSelected={selectedBuffItemId === buffItem.id}
												onClick={() => handleSelect(buffItem.id)}
												showDamageDifference={isOpen && !!slotInfo}
												slotInfo={slotInfo}
												showFavoriteButton={true}
												onFavoriteChange={handleFavoriteChange}
											/>
										))}
									</div>
								</div>
							)}

							{/* アイテムが見つからない場合 */}
							{favoriteBuffItems.length === 0 && otherBuffItems.length === 0 && !isNoneFavorite && (
								<div className="text-center text-gray-500 py-8">
									該当するバフアイテムがありません
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
