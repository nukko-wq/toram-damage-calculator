'use client'

import { useState, useEffect } from 'react'
import type { CrystalType } from '@/types/calculator'
import { getCrystalsByType, getAllCrystals } from '@/utils/crystalDatabase'
import CrystalCard from './CrystalCard'

interface CrystalSelectionModalProps {
	isOpen: boolean
	onClose: () => void
	onSelect: (crystalId: string | null) => void
	selectedCrystalId: string | null
	allowedTypes: CrystalType[]
	title: string
}

export default function CrystalSelectionModal({
	isOpen,
	onClose,
	onSelect,
	selectedCrystalId,
	allowedTypes,
	title,
}: CrystalSelectionModalProps) {
	const [activeFilter, setActiveFilter] = useState<'all' | CrystalType>('all')
	const [availableCrystals, setAvailableCrystals] = useState<any[]>([])

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

		// 許可されたタイプのクリスタ + ノーマルクリスタを取得
		const allAllowedCrystals = [
			...allowedTypes.flatMap(type => getCrystalsByType(type)),
			...getCrystalsByType('normal')
		]

		// 重複を除去
		const uniqueCrystals = allAllowedCrystals.filter(
			(crystal, index, self) => 
				index === self.findIndex(c => c.id === crystal.id)
		)

		setAvailableCrystals(uniqueCrystals)
	}, [isOpen, allowedTypes])

	const filteredCrystals = availableCrystals.filter(crystal => {
		if (activeFilter === 'all') return true
		return crystal.type === activeFilter
	})

	const getFilterLabel = (filter: string) => {
		switch (filter) {
			case 'all': return '全て'
			case 'weapon': return '武器'
			case 'armor': return '防具'
			case 'additional': return '追加'
			case 'special': return '特殊'
			case 'normal': return 'ノーマル'
			default: return filter
		}
	}

	const handleSelect = (crystalId: string) => {
		onSelect(crystalId)
		onClose()
	}

	const handleRemove = () => {
		onSelect(null)
		onClose()
	}

	const handleBackgroundClick = (e: React.MouseEvent) => {
		// モーダル外をクリックした場合のみ閉じる
		if (e.target === e.currentTarget) {
			onClose()
		}
	}

	const handleContentClick = (e: React.MouseEvent) => {
		// モーダル内のクリックは伝播を停止
		e.stopPropagation()
	}

	if (!isOpen) return null

	return (
		<div 
			className="fixed inset-0 z-50 overflow-y-auto"
			onClick={handleBackgroundClick}
		>
			{/* オーバーレイ */}
			<div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

			{/* モーダルコンテンツ */}
			<div className="relative min-h-screen flex items-center justify-center p-4">
				<div 
					className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
					onClick={handleContentClick}
				>
					{/* ヘッダー */}
					<div className="flex items-center justify-between p-6 border-b">
						<h2 className="text-xl font-bold text-gray-900">{title}</h2>
						<button
							type="button"
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600 transition-colors"
							aria-label="モーダルを閉じる"
						>
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<title>閉じる</title>
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
								全て ({availableCrystals.length})
							</button>
							{(['normal', ...allowedTypes] as CrystalType[]).map(type => {
								const count = availableCrystals.filter(c => c.type === type).length
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

					{/* クリスタ一覧 */}
					<div className="p-6 overflow-y-auto max-h-[60vh]">
						{/* なしオプション */}
						<div className="mb-6">
							<button
								type="button"
								onClick={handleRemove}
								className={`
									w-full p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md text-left
									${selectedCrystalId === null 
										? 'border-blue-500 bg-blue-50 shadow-md' 
										: 'border-gray-200 bg-white hover:border-gray-300'
									}
								`}
							>
								<div className="flex items-center justify-between">
									<span className="font-medium text-gray-900">クリスタなし</span>
									{selectedCrystalId === null && (
										<div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
											<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<title>選択済み</title>
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
											</svg>
										</div>
									)}
								</div>
							</button>
						</div>

						{/* クリスタグリッド */}
						{filteredCrystals.length > 0 ? (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
								{filteredCrystals.map(crystal => (
									<CrystalCard
										key={crystal.id}
										crystal={crystal}
										isSelected={selectedCrystalId === crystal.id}
										onClick={() => handleSelect(crystal.id)}
									/>
								))}
							</div>
						) : (
							<div className="text-center text-gray-500 py-8">
								該当するクリスタがありません
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
		</div>
	)
}