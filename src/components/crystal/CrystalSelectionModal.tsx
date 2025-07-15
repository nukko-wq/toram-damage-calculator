'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { CrystalType } from '@/types/calculator'
import { getCrystalsByType } from '@/utils/crystalDatabase'
import CrystalCard from './CrystalCard'
import type { SlotInfo } from '@/types/damagePreview'

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

	const filteredCrystals = useMemo(() => {
		return availableCrystals.filter((crystal) => {
			if (activeFilter === 'all') return true
			return crystal.type === activeFilter
		})
	}, [availableCrystals, activeFilter])

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
											? 'bg-blue-500 text-white'
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
						<div className="p-4 sm:p-6 overflow-y-auto max-h-[48vh]">
							{/* なしオプション */}
							<div className="mb-4 sm:mb-6 text-center sm:text-left">
								<button
									type="button"
									onClick={handleRemove}
									className={`
										w-full sm:min-w-[144px] max-w-[100%] sm:max-w-[260px] p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md text-left
										${
											selectedCrystalId === null
												? 'border-blue-500 bg-blue-50 shadow-md'
												: 'border-gray-200 bg-white hover:border-gray-300'
										}
									`}
								>
									<div className="flex items-center justify-between">
										<span className="font-medium text-gray-900">
											クリスタなし
										</span>
										{selectedCrystalId === null && (
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

							{/* クリスタレイアウト */}
							{filteredCrystals.length > 0 ? (
								<div className="flex flex-wrap gap-4 justify-center sm:justify-start">
									{filteredCrystals.map((crystal) => (
										<CrystalCard
											key={crystal.id}
											crystal={crystal}
											isSelected={selectedCrystalId === crystal.id}
											onClick={() => handleSelect(crystal.id)}
											showDamageDifference={isOpen && !!slotInfo}
											slotInfo={slotInfo}
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
