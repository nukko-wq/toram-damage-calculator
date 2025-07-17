'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { BuffItemCategory, PresetBuffItem } from '@/types/calculator'
import {
	getBuffItemsByCategory,
} from '@/utils/buffItemDatabase'
import BuffItemCard from './BuffItemCard'
import type { SlotInfo } from '@/types/damagePreview'

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

	// モーダルを閉じる関数
	const handleClose = useCallback(() => {
		onClose()
	}, [onClose])

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

	const filteredBuffItems = useMemo(() => {
		return availableBuffItems.filter((buffItem) => {
			if (activeFilter === 'all') return true
			return buffItem.category === activeFilter
		})
	}, [availableBuffItems, activeFilter])

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
							{/* なしオプション */}
							<div className="mb-4 sm:mb-6 text-center sm:text-left">
								<button
									type="button"
									onClick={handleRemove}
									className={`
									w-full sm:min-w-[144px] max-w-[100%] sm:max-w-[260px] p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md text-left
									${
										selectedBuffItemId === null
											? 'border-blue-500 bg-blue-50 shadow-md'
											: 'border-gray-200 bg-white hover:border-gray-300'
									}
								`}
								>
									<div className="flex items-center justify-between">
										<span className="font-medium text-gray-900">
											バフアイテムなし
										</span>
										{selectedBuffItemId === null && (
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

							{/* バフアイテムレイアウト */}
							{filteredBuffItems.length > 0 ? (
								<div className="flex flex-wrap gap-4 justify-center sm:justify-start">
									{filteredBuffItems.map((buffItem) => (
										<BuffItemCard
											key={buffItem.id}
											buffItem={buffItem}
											isSelected={selectedBuffItemId === buffItem.id}
											onClick={() => handleSelect(buffItem.id)}
											showDamageDifference={isOpen && !!slotInfo}
											slotInfo={slotInfo}
										/>
									))}
								</div>
							) : (
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
