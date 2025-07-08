'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import type { CrystalType, Crystal } from '@/types/calculator'
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
	const [isAnimating, setIsAnimating] = useState(false)
	const [shouldRender, setShouldRender] = useState(false)

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

	// アニメーション状態の管理
	useEffect(() => {
		if (isOpen) {
			// モーダルを開く時
			setShouldRender(true)
			// 次のフレームでアニメーション開始（より確実に）
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					setIsAnimating(true)
				})
			})
		} else {
			// モーダルを閉じる時
			setIsAnimating(false)
			// アニメーション完了後にDOMから削除
			const timer = setTimeout(() => {
				setShouldRender(false)
			}, 300) // 最長のアニメーション時間と同期
			return () => clearTimeout(timer)
		}
	}, [isOpen])

	// アニメーション付きでモーダルを閉じる関数
	const handleClose = useCallback(() => {
		if (!isAnimating) return // 既にアニメーション中の場合は無視

		// まずアニメーションを開始
		setIsAnimating(false)
		
		// アニメーション完了後にonCloseを呼び出し
		setTimeout(() => {
			onClose()
		}, 300) // 最長のアニメーション時間と同期
	}, [isAnimating, onClose])

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

	const filteredCrystals = availableCrystals.filter((crystal) => {
		if (activeFilter === 'all') return true
		return crystal.type === activeFilter
	})

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

	const handleSelect = (crystalId: string) => {
		onSelect(crystalId)
		handleClose()
	}

	const handleRemove = () => {
		onSelect(null)
		handleClose()
	}

	const handleBackgroundClick = useCallback((e: React.MouseEvent) => {
		// アニメーション中は無効化
		if (!isAnimating) return

		// クリックされた要素がモーダルコンテンツ内かどうかをチェック
		const modalContent = document.querySelector('[data-modal-content="true"]')
		const target = e.target as Element

		if (modalContent && !modalContent.contains(target)) {
			handleClose()
		}
	}, [isAnimating, handleClose])

	const handleDialogKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Escape') {
			handleClose()
		}
		// EnterキーやSpaceキーで背景クリックと同様の動作をする場合
		// (実際にはEscapeで十分なので、この部分は省略可能)
	}

	const handleContentClick = (e: React.MouseEvent) => {
		// モーダル内のクリックは伝播を停止
		e.stopPropagation()
	}

	const handleContentKeyDown = (e: React.KeyboardEvent) => {
		// キーイベントの伝播を停止（必要に応じて）
		e.stopPropagation()
	}

	if (!shouldRender) return null

	return (
		<>
			{/* モーダル */}
			<dialog
				open={shouldRender}
				className={`fixed inset-0 z-50 overflow-y-auto p-0 m-0 w-full h-full bg-black/50 transition-opacity duration-200 ease-out ${
					isAnimating ? 'opacity-100' : 'opacity-0'
				}`}
				onKeyDown={handleDialogKeyDown}
				onClick={handleBackgroundClick}
				aria-labelledby="modal-title"
				aria-modal="true"
			>
				<div className="min-h-screen flex items-center justify-center p-4">
					<div
						className={`relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden transition-all duration-200 ease-out ${
							isAnimating 
								? 'scale-100 opacity-100 translate-y-0' 
								: 'scale-95 opacity-0 translate-y-2'
						}`}
						onClick={handleContentClick}
						onKeyDown={handleContentKeyDown}
						data-modal-content="true"
					>
						{/* ヘッダー */}
						<div className="flex items-center justify-between p-6 border-b">
							<h2 id="modal-title" className="text-xl font-bold text-gray-900">
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
								{(['normal', ...allowedTypes] as CrystalType[]).map((type) => {
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
						<div className={`p-6 overflow-y-auto max-h-[60vh] transition-opacity duration-300 ease-out ${
							isAnimating ? 'opacity-100' : 'opacity-0'
						}`}>
							{/* なしオプション */}
							<div className="mb-6">
								<button
									type="button"
									onClick={handleRemove}
									className={`
										w-full p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md text-left
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

							{/* クリスタグリッド */}
							{filteredCrystals.length > 0 ? (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
					</div>
				</div>
			</dialog>
		</>
	)
}
