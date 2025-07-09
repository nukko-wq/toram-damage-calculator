'use client'

import { useState, useEffect } from 'react'
import type { BuffItemCategory, PresetBuffItem } from '@/types/calculator'
import {
	getBuffItemsByCategory,
	getPresetBuffItems,
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
	const [activeFilter, setActiveFilter] = useState<'all' | BuffItemCategory>(
		'all',
	)
	const [availableBuffItems, setAvailableBuffItems] = useState<
		PresetBuffItem[]
	>([])

	// ESCキーでモーダルを閉じる
	useEffect(() => {
		if (!isOpen) return

		const handleEscapeKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose()
			}
		}

		document.addEventListener('keydown', handleEscapeKey)
		return () => {
			document.removeEventListener('keydown', handleEscapeKey)
		}
	}, [isOpen, onClose])

	useEffect(() => {
		if (!isOpen) return

		// 指定されたカテゴリのバフアイテムを取得
		const categoryItems = getBuffItemsByCategory(category)
		setAvailableBuffItems(categoryItems)
	}, [isOpen, category])

	const filteredBuffItems = availableBuffItems.filter((buffItem) => {
		if (activeFilter === 'all') return true
		return buffItem.category === activeFilter
	})

	const getCategoryLabel = (categoryValue: string) => {
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

	const handleSelect = (buffItemId: string) => {
		onSelect(buffItemId)
		onClose()
	}

	const handleRemove = () => {
		onSelect(null)
		onClose()
	}

	const handleBackgroundClick = (e: React.MouseEvent) => {
		// クリックされた要素がモーダルコンテンツ内かどうかをチェック
		const modalContent = document.querySelector('[data-modal-content="true"]')
		const target = e.target as Element

		if (modalContent && !modalContent.contains(target)) {
			onClose()
		}
	}

	const handleContentClick = (e: React.MouseEvent) => {
		// モーダル内のクリックは伝播を停止
		e.stopPropagation()
	}

	if (!isOpen) return null

	// 利用可能なカテゴリを取得（現在のカテゴリのみ）
	const availableCategories = [category]

	return (
		<dialog
			open={isOpen}
			className="fixed inset-0 z-50 overflow-y-auto p-0 m-0 w-full h-full bg-black/50 transition-opacity"
			onClick={handleBackgroundClick}
			aria-labelledby="modal-title"
			aria-modal="true"
		>
			<div className="min-h-screen flex items-center justify-center p-4">
				<div
					className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden outline-none"
					onClick={handleContentClick}
					data-modal-content="true"
				>
					{/* ヘッダー */}
					<div className="flex items-center justify-between p-6 border-b">
						<h2 id="modal-title" className="text-xl font-bold text-gray-900">
							{title}
						</h2>
						<button
							type="button"
							onClick={onClose}
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
					<div className="p-6 overflow-y-auto max-h-[60vh]">
						{/* なしオプション */}
						<div className="mb-6">
							<button
								type="button"
								onClick={handleRemove}
								className={`
									w-full p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md text-left
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

						{/* バフアイテムグリッド */}
						{filteredBuffItems.length > 0 ? (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
							onClick={onClose}
							className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
						>
							キャンセル
						</button>
					</div>
				</div>
			</div>
		</dialog>
	)
}
