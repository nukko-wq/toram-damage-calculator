'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDamageDifferenceCorrect } from '@/hooks/useDamageDifferenceCorrect'
import { useEquipmentDamageSorting } from '@/hooks/useEquipmentDamageSorting'
import { useCalculatorStore } from '@/stores/calculatorStore'
import type {
	Equipment,
	EquipmentCategory,
	EquipmentProperties,
} from '@/types/calculator'
import type { SlotInfo } from '@/types/damagePreview'
import { EQUIPMENT_NONE_ITEM } from '@/types/damagePreview'
import { getCombinedEquipmentsByCategory } from '@/utils/equipmentDatabase'
import { EquipmentFavoritesManager } from '@/utils/equipmentFavorites'
import EquipmentCard from './EquipmentCard'

interface EquipmentSelectionModalProps {
	isOpen: boolean
	onClose: () => void
	onSelect: (equipmentId: string | null) => void
	selectedEquipmentId: string | null
	category: EquipmentCategory
	title: string
	currentFormProperties?: Partial<EquipmentProperties> // 現在のフォーム値
	// ダメージ差分表示用
	slotInfo?: SlotInfo
}

export default function EquipmentSelectionModal({
	isOpen,
	onClose,
	onSelect,
	selectedEquipmentId,
	category,
	title,
	currentFormProperties,
	slotInfo,
}: EquipmentSelectionModalProps) {
	const [availableEquipments, setAvailableEquipments] = useState<Equipment[]>(
		[],
	)
	const [_favoritesChanged, setFavoritesChanged] = useState(0)

	// 「装備なし」の特別なID
	const EQUIPMENT_NONE_ID = '__equipment_none__'

	// 「装備なし」のお気に入り状態
	const [isNoneFavorite, setIsNoneFavorite] = useState(() =>
		EquipmentFavoritesManager.isFavorite(EQUIPMENT_NONE_ID),
	)

	// 現在の装備データを取得
	const currentData = useCalculatorStore((state) => state.data)

	// 現在装着中の装備があるかどうかを判定
	const hasCurrentlyEquippedItem = useMemo(() => {
		if (!slotInfo || !currentData) return false

		if (
			slotInfo.type === 'equipment' &&
			slotInfo.slot &&
			typeof slotInfo.slot === 'string'
		) {
			const slotKey = slotInfo.slot as keyof typeof currentData.equipment
			const currentEquipment = currentData.equipment[slotKey]
			return currentEquipment !== null && currentEquipment !== undefined
		}

		return false
	}, [slotInfo, currentData])

	// モーダルを閉じる関数
	const handleClose = useCallback(() => {
		onClose()
	}, [onClose])

	// お気に入り変更ハンドラー
	const handleFavoriteChange = useCallback(
		(equipmentId: string, isFavorite: boolean) => {
			// 「装備なし」の場合は専用状態も更新
			if (equipmentId === EQUIPMENT_NONE_ID) {
				setIsNoneFavorite(isFavorite)
			}

			// お気に入り状態変更時の処理
			setFavoritesChanged((prev) => prev + 1) // 再レンダリングトリガー

			// 必要に応じて親コンポーネントに通知
			if (process.env.NODE_ENV === 'development') {
				console.log(
					`Equipment ${equipmentId} favorite state changed to ${isFavorite}`,
				)
			}
		},
		[],
	)

	// 「装備なし」のお気に入りクリックハンドラー
	const handleNoneFavoriteClick = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation() // 装備選択イベントの阻止

			const newFavoriteState = !isNoneFavorite
			const success = EquipmentFavoritesManager.setFavorite(
				EQUIPMENT_NONE_ID,
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

	useEffect(() => {
		if (!isOpen) return

		// カテゴリに対応するプリセット + カスタム装備を統合して取得
		let equipments = getCombinedEquipmentsByCategory(category)

		// 自由入力スロット（freeInput1-3）の場合は、カスタム装備のみを表示
		if (['freeInput1', 'freeInput2', 'freeInput3'].includes(category)) {
			equipments = equipments.filter(
				(equipment) => 'isCustom' in equipment && equipment.isCustom,
			)
		}

		// 現在選択中の装備にフォーム値を反映
		if (selectedEquipmentId && currentFormProperties) {
			equipments = equipments.map((equipment) => {
				if (equipment.id === selectedEquipmentId) {
					return {
						...equipment,
						properties: {
							...equipment.properties,
							...currentFormProperties,
						},
					}
				}
				return equipment
			})
		}

		setAvailableEquipments(equipments)
	}, [isOpen, category, selectedEquipmentId, currentFormProperties])

	// ダメージ差分順でソート
	const { sortedEquipments, isCalculating: isSorting } =
		useEquipmentDamageSorting(
			availableEquipments,
			slotInfo,
			isOpen && !!slotInfo,
		)

	// 「装備なし」のダメージ差分を計算
	const equipmentNoneDamageResult = useDamageDifferenceCorrect(
		EQUIPMENT_NONE_ITEM,
		slotInfo || { type: 'equipment', slot: 'mainWeapon' },
		{ debug: false },
	)
	const equipmentNoneDamageDifference = slotInfo
		? equipmentNoneDamageResult.difference || 0
		: 0

	// 装備リストの分別: お気に入り / その他（ソート済みの装備から）
	const { favoriteEquipments, otherEquipments } = useMemo(() => {
		const favoriteIds = EquipmentFavoritesManager.getFavoriteEquipmentIds()
		const favoriteSet = new Set(favoriteIds)

		// 通常の装備を分別
		const favorites = sortedEquipments.filter((eq) => favoriteSet.has(eq.id))
		const others = sortedEquipments.filter((eq) => !favoriteSet.has(eq.id))

		// 「装備なし」をダメージ差分に基づいて適切な位置に挿入
		// 装備スロットが存在する場合は常に「装備なし」オプションを表示
		{
			// biome-ignore lint/suspicious/noExplicitAny: Equipment typeと互換性のないNone用の仮想アイテム
			const equipmentNoneWithDamage: any = {
				id: EQUIPMENT_NONE_ID,
				name: '装備なし',
				type: 'weapon',
				category: ['mainWeapon'],
				baseStats: {},
				properties: {},
				damageDifference: equipmentNoneDamageDifference,
			}

			// お気に入りかどうかで分岐
			if (isNoneFavorite) {
				// お気に入りリストに挿入（ダメージ差分順）
				const insertIndex = favorites.findIndex((equipment) => {
					// biome-ignore lint/suspicious/noExplicitAny: EquipmentWithDamageタイプのダメージ差分プロパティアクセス
					const equipmentDamage =
						'damageDifference' in equipment &&
						typeof (equipment as any).damageDifference === 'number'
							? (equipment as any).damageDifference
							: 0
					return equipmentNoneWithDamage.damageDifference > equipmentDamage
				})
				if (insertIndex === -1) {
					favorites.push(equipmentNoneWithDamage)
				} else {
					favorites.splice(insertIndex, 0, equipmentNoneWithDamage)
				}
			} else {
				// その他リストに挿入（ダメージ差分順）
				const insertIndex = others.findIndex((equipment) => {
					// biome-ignore lint/suspicious/noExplicitAny: EquipmentWithDamageタイプのダメージ差分プロパティアクセス
					const equipmentDamage =
						'damageDifference' in equipment &&
						typeof (equipment as any).damageDifference === 'number'
							? (equipment as any).damageDifference
							: 0
					return equipmentNoneWithDamage.damageDifference > equipmentDamage
				})
				if (insertIndex === -1) {
					others.push(equipmentNoneWithDamage)
				} else {
					others.splice(insertIndex, 0, equipmentNoneWithDamage)
				}
			}
		}

		return {
			favoriteEquipments: favorites,
			otherEquipments: others,
		}
	}, [
		sortedEquipments,
		isNoneFavorite,
		equipmentNoneDamageDifference,
		_favoritesChanged,
	])

	const handleSelect = useCallback(
		(equipmentId: string) => {
			onSelect(equipmentId)
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

						{/* 装備一覧 */}
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
							{/* お気に入り装備セクション */}
							{favoriteEquipments.length > 0 && (
								<div className="mb-6">
									<h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
										<svg
											className="w-4 h-4 text-rose-500/80 mr-1"
											fill="currentColor"
											viewBox="0 0 24 24"
										>
											<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
										</svg>
										お気に入り ({favoriteEquipments.length})
									</h3>
									<div className="flex flex-wrap gap-4 justify-center sm:justify-start">
										{favoriteEquipments.map((equipment) => {
											// 「装備なし」の場合は専用カードを表示
											if (equipment.id === EQUIPMENT_NONE_ID) {
												return (
													<div
														key={equipment.id}
														onClick={handleRemove}
														className={`
															relative w-full max-w-[100%] sm:max-w-[260px] p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md
															${
																selectedEquipmentId === null
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

														{/* 装備なしと選択マーク */}
														<div className="flex justify-between items-center mb-1 sm:mb-2">
															<h3 className="font-semibold text-gray-900">
																装備なし
															</h3>
															{selectedEquipmentId === null && (
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

														{/* ダメージ差分表示（他の装備と同じ形式） */}
														{slotInfo && (
															<div className="mb-1 sm:mb-2">
																<div className="font-medium">
																	<span
																		className={`mr-3 text-sm ${
																			equipmentNoneDamageDifference > 0
																				? 'text-blue-500'
																				: equipmentNoneDamageDifference < 0
																					? 'text-red-500'
																					: 'text-gray-400'
																		}`}
																	>
																		ダメージ：
																	</span>
																	<span
																		className={`text-sm ${
																			equipmentNoneDamageDifference > 0
																				? 'text-blue-600'
																				: equipmentNoneDamageDifference < 0
																					? 'text-red-600'
																					: 'text-gray-500'
																		}`}
																	>
																		{equipmentNoneDamageDifference === 0
																			? '±0'
																			: equipmentNoneDamageDifference > 0
																				? `+${equipmentNoneDamageDifference.toLocaleString()}`
																				: equipmentNoneDamageDifference.toLocaleString()}
																	</span>
																</div>
															</div>
														)}
													</div>
												)
											}

											// 通常の装備カード
											console.log('Rendering EquipmentCard:', {
												equipmentName: equipment.name,
												showDamageDifference: isOpen && !!slotInfo,
												slotInfo,
												isOpen,
												hasSlotInfo: !!slotInfo,
											})
											return (
												<EquipmentCard
													key={equipment.id}
													equipment={equipment}
													isSelected={selectedEquipmentId === equipment.id}
													onClick={() => handleSelect(equipment.id)}
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

							{/* その他の装備セクション */}
							{otherEquipments.length > 0 && (
								<div className="mb-6">
									<h3 className="text-sm font-medium text-gray-700 mb-3">
										その他 ({otherEquipments.length})
									</h3>
									<div className="flex flex-wrap gap-4 justify-center sm:justify-start">
										{otherEquipments.map((equipment) => {
											// 「装備なし」の場合は専用カードを表示
											if (equipment.id === EQUIPMENT_NONE_ID) {
												return (
													<div
														key={equipment.id}
														onClick={handleRemove}
														className={`
															relative w-full max-w-[100%] sm:max-w-[260px] p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md
															${
																selectedEquipmentId === null
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

														{/* 装備なしと選択マーク */}
														<div className="flex justify-between items-center mb-1 sm:mb-2">
															<h3 className="font-semibold text-gray-900">
																装備なし
															</h3>
															{selectedEquipmentId === null && (
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

														{/* ダメージ差分表示（他の装備と同じ形式） */}
														{slotInfo && (
															<div className="mb-1 sm:mb-2">
																<div className="font-medium">
																	<span
																		className={`mr-3 text-sm ${
																			equipmentNoneDamageDifference > 0
																				? 'text-blue-500'
																				: equipmentNoneDamageDifference < 0
																					? 'text-red-500'
																					: 'text-gray-400'
																		}`}
																	>
																		ダメージ：
																	</span>
																	<span
																		className={`text-sm ${
																			equipmentNoneDamageDifference > 0
																				? 'text-blue-600'
																				: equipmentNoneDamageDifference < 0
																					? 'text-red-600'
																					: 'text-gray-500'
																		}`}
																	>
																		{equipmentNoneDamageDifference === 0
																			? '±0'
																			: equipmentNoneDamageDifference > 0
																				? `+${equipmentNoneDamageDifference.toLocaleString()}`
																				: equipmentNoneDamageDifference.toLocaleString()}
																	</span>
																</div>
															</div>
														)}
													</div>
												)
											}

											// 通常の装備カード
											console.log('Rendering EquipmentCard:', {
												equipmentName: equipment.name,
												showDamageDifference: isOpen && !!slotInfo,
												slotInfo,
												isOpen,
												hasSlotInfo: !!slotInfo,
											})
											return (
												<EquipmentCard
													key={equipment.id}
													equipment={equipment}
													isSelected={selectedEquipmentId === equipment.id}
													onClick={() => handleSelect(equipment.id)}
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

							{/* アイテムが見つからない場合 */}
							{favoriteEquipments.length === 0 &&
								otherEquipments.length === 0 &&
								!hasCurrentlyEquippedItem && (
									<div className="text-center text-gray-500 py-8">
										該当する装備がありません
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
