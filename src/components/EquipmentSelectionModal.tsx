'use client'

import { useState, useEffect } from 'react'
import type { EquipmentType, PresetEquipment, EquipmentCategory } from '@/types/calculator'
import { getAvailableEquipmentsByCategory } from '@/utils/equipmentDatabase'
import EquipmentCard from './EquipmentCard'

interface EquipmentSelectionModalProps {
	isOpen: boolean
	onClose: () => void
	onSelect: (equipmentId: string | null) => void
	selectedEquipmentId: string | null
	category: EquipmentCategory
	title: string
}

export default function EquipmentSelectionModal({
	isOpen,
	onClose,
	onSelect,
	selectedEquipmentId,
	category,
	title,
}: EquipmentSelectionModalProps) {
	const [activeFilter, setActiveFilter] = useState<'all' | EquipmentType>('all')
	const [availableEquipments, setAvailableEquipments] = useState<PresetEquipment[]>([])

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

		// カテゴリに対応する装備を取得
		const equipments = getAvailableEquipmentsByCategory(category)
		setAvailableEquipments(equipments)
	}, [isOpen, category])

	const filteredEquipments = availableEquipments.filter(equipment => {
		if (activeFilter === 'all') return true
		return equipment.type === activeFilter
	})

	const getFilterLabel = (filter: string) => {
		switch (filter) {
			case 'all': return '全て'
			case 'weapon': return '武器'
			case 'armor': return '防具'
			case 'accessory': return 'アクセサリ'
			case 'fashion': return 'オシャレ'
			default: return filter
		}
	}

	const handleSelect = (equipmentId: string) => {
		onSelect(equipmentId)
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

	// 利用可能な装備タイプを取得
	const availableTypes = Array.from(new Set(availableEquipments.map(eq => eq.type)))

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
						<h2 id="modal-title" className="text-xl font-bold text-gray-900">{title}</h2>
						<button
							type="button"
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600 transition-colors"
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
					<div className="px-6 py-4 border-b bg-gray-50">
						<div className="flex flex-wrap gap-2">
							<button
								type="button"
								onClick={() => setActiveFilter('all')}
								className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
									activeFilter === 'all'
										? 'bg-blue-500 text-white'
										: 'bg-white text-gray-700 hover:bg-gray-100'
								}`}
							>
								全て ({availableEquipments.length})
							</button>
							{availableTypes.map((type) => {
								const count = availableEquipments.filter(
									(eq) => eq.type === type,
								).length
								if (count === 0) return null

								return (
									<button
										key={type}
										type="button"
										onClick={() => setActiveFilter(type)}
										className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
											activeFilter === type
												? 'bg-blue-500 text-white'
												: 'bg-white text-gray-700 hover:bg-gray-100'
										}`}
									>
										{getFilterLabel(type)} ({count})
									</button>
								)
							})}
						</div>
					</div>

					{/* 装備一覧 */}
					<div className="p-6 overflow-y-auto max-h-[60vh]">
						{/* なしオプション */}
						<div className="mb-6">
							<button
								type="button"
								onClick={handleRemove}
								className={`
									w-full p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md text-left
									${
										selectedEquipmentId === null
											? 'border-blue-500 bg-blue-50 shadow-md'
											: 'border-gray-200 bg-white hover:border-gray-300'
									}
								`}
							>
								<div className="flex items-center justify-between">
									<span className="font-medium text-gray-900">
										装備なし
									</span>
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

						{/* 装備グリッド */}
						{filteredEquipments.length > 0 ? (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
								{filteredEquipments.map((equipment) => (
									<EquipmentCard
										key={equipment.id}
										equipment={equipment}
										isSelected={selectedEquipmentId === equipment.id}
										onClick={() => handleSelect(equipment.id)}
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
							onClick={onClose}
							className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
						>
							キャンセル
						</button>
					</div>
				</div>
			</div>
		</dialog>
	)
}