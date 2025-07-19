'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type {
	Equipment,
	EquipmentCategory,
	EquipmentProperties,
} from '@/types/calculator'
import { getCombinedEquipmentsByCategory } from '@/utils/equipmentDatabase'
import EquipmentCard from './EquipmentCard'
import type { SlotInfo } from '@/types/damagePreview'
import { EquipmentFavoritesManager } from '@/utils/equipmentFavorites'

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
	const [favoritesChanged, setFavoritesChanged] = useState(0)

	// モーダルを閉じる関数
	const handleClose = useCallback(() => {
		onClose()
	}, [onClose])

	// お気に入り変更ハンドラー
	const handleFavoriteChange = useCallback(
		(equipmentId: string, isFavorite: boolean) => {
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

	// 装備リストの表示順序: お気に入り → 通常
	const sortedEquipments = useMemo(() => {
		const favoriteIds = EquipmentFavoritesManager.getFavoriteEquipmentIds()
		const favoriteSet = new Set(favoriteIds)

		const favorites = availableEquipments.filter((eq) =>
			favoriteSet.has(eq.id),
		)
		const others = availableEquipments.filter((eq) => !favoriteSet.has(eq.id))

		return [...favorites, ...others]
	}, [availableEquipments, favoritesChanged])

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
							{/* なしオプション */}
							<div className="mb-4 sm:mb-6 text-center sm:text-left">
								<button
									type="button"
									onClick={handleRemove}
									className={`
									w-full sm:min-w-[144px] max-w-[100%] sm:max-w-[260px] p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md text-left
									${
										selectedEquipmentId === null
											? 'border-blue-500 bg-blue-50 shadow-md'
											: 'border-gray-200 bg-white hover:border-gray-300'
									}
								`}
								>
									<div className="flex items-center justify-between">
										<span className="font-medium text-gray-900">装備なし</span>
										{selectedEquipmentId === null && (
											<div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
												<svg
													className="w-4 h-4 text-white"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<title>選択済み</title>
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
								</button>
							</div>

							{/* 装備レイアウト */}
							{sortedEquipments.length > 0 ? (
								<div className="flex flex-wrap gap-4 justify-center sm:justify-start">
									{sortedEquipments.map((equipment) => (
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
									))}
								</div>
							) : (
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
