'use client'

import { useEffect, useMemo, useState } from 'react'
import type { EnemyCategory, PresetEnemy } from '@/types/calculator'
import { getPresetEnemies } from '@/utils/enemyDatabase'
import EnemyCard from './EnemyCard'

interface EnemySelectionModalProps {
	isOpen: boolean
	onClose: () => void
	onSelect: (enemyId: string) => void
	selectedEnemyId: string | null
	title: string
}

export default function EnemySelectionModal({
	isOpen,
	onClose,
	onSelect,
	selectedEnemyId,
	title,
}: EnemySelectionModalProps) {
	const [activeFilter, setActiveFilter] = useState<'all' | EnemyCategory>('all')
	const [availableEnemies, setAvailableEnemies] = useState<PresetEnemy[]>([])

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

	// 敵データの取得
	useEffect(() => {
		if (!isOpen) return

		const allEnemies = getPresetEnemies()
		setAvailableEnemies(allEnemies)
	}, [isOpen])

	// フィルター適用（メモ化）
	const filteredEnemies = useMemo(() => {
		return availableEnemies.filter((enemy) => {
			if (activeFilter === 'all') return true
			return enemy.category === activeFilter
		})
	}, [availableEnemies, activeFilter])

	const getFilterLabel = (filter: string) => {
		switch (filter) {
			case 'all':
				return '全て'
			case 'mob':
				return 'モブ'
			case 'fieldBoss':
				return 'フィールドボス'
			case 'boss':
				return 'ボス'
			case 'raidBoss':
				return 'レイドボス'
			default:
				return filter
		}
	}

	// 敵の選択
	const handleSelect = (enemyId: string) => {
		onSelect(enemyId)
		onClose()
	}

	// 背景クリックで閉じる
	const handleBackgroundClick = (e: React.MouseEvent) => {
		const modalContent = document.querySelector('[data-modal-content="true"]')
		if (modalContent && !modalContent.contains(e.target as Node)) {
			onClose()
		}
	}

	// 利用可能なフィルターを取得（メモ化）
	const availableFilters = useMemo(() => {
		const filters: ('all' | EnemyCategory)[] = ['all']
		const categories = Array.from(
			new Set(availableEnemies.map((enemy) => enemy.category)),
		) as EnemyCategory[]
		filters.push(...categories.sort())
		return filters
	}, [availableEnemies])

	if (!isOpen) return null

	return (
		<dialog
			open={isOpen}
			className="fixed inset-0 z-50 p-0 m-0 w-full h-full bg-black/50 transition-opacity"
			onClick={handleBackgroundClick}
			aria-labelledby="enemy-modal-title"
			aria-describedby="enemy-modal-description"
			role="dialog"
		>
			<div className="flex items-center justify-center min-h-full p-4 overflow-y-auto">
				<div
					data-modal-content="true"
					className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col"
					onClick={(e) => e.stopPropagation()}
				>
					{/* ヘッダー */}
					<div className="flex items-center justify-between p-6 border-b border-gray-200">
						<h2
							id="enemy-modal-title"
							className="text-xl font-semibold text-gray-900"
						>
							{title}
						</h2>
						<button
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
							aria-label="閉じる"
						>
							<svg
								className="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
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
					<div
						className="flex flex-wrap gap-2 p-4 border-b border-gray-200 bg-gray-50"
						role="tablist"
						aria-label="敵カテゴリフィルター"
					>
						{availableFilters.map((filter) => (
							<button
								key={filter}
								onClick={() => setActiveFilter(filter)}
								className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
									activeFilter === filter
										? 'bg-blue-500/80 text-white'
										: 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
								}`}
								role="tab"
								aria-selected={activeFilter === filter}
								aria-controls="enemy-list"
							>
								{getFilterLabel(filter)}
								{filter !== 'all' && (
									<span className="ml-2 text-xs opacity-75">
										(
										{
											availableEnemies.filter((e) => e.category === filter)
												.length
										}
										)
									</span>
								)}
								{filter === 'all' && (
									<span className="ml-2 text-xs opacity-75">
										({availableEnemies.length})
									</span>
								)}
							</button>
						))}
					</div>

					{/* 敵一覧 */}
					<div
						className="flex-1 overflow-y-auto p-6 min-h-0"
						id="enemy-modal-description"
					>
						<div
							id="enemy-list"
							className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4"
							role="grid"
							aria-label="敵選択一覧"
						>
							{/* 敵カード */}
							{filteredEnemies.map((enemy) => (
								<EnemyCard
									key={enemy.id}
									enemy={enemy}
									isSelected={selectedEnemyId === enemy.id}
									onClick={() => handleSelect(enemy.id)}
								/>
							))}
						</div>

						{/* 該当なしメッセージ */}
						{filteredEnemies.length === 0 && (
							<div className="text-center py-12 text-gray-500">
								<div className="text-lg font-medium mb-2">
									該当する敵が見つかりません
								</div>
								<div className="text-sm">
									フィルターを変更してお試しください
								</div>
							</div>
						)}
					</div>

					{/* フッター */}
					<div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
						<button
							onClick={onClose}
							className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
						>
							キャンセル
						</button>
					</div>
				</div>
			</div>
		</dialog>
	)
}
