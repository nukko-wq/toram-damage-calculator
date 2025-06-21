'use client'

import { useState } from 'react'
import { useCalculatorStore } from '@/stores'
import type { EnemyFormData, EnemyCategory } from '@/types/calculator'
import { getPresetEnemyById } from '@/utils/enemyDatabase'
import EnemySelectionModal from './EnemySelectionModal'

interface NewEnemyFormProps {
	// Zustand移行後は不要（後方互換性のため残存）
	enemyData?: EnemyFormData
	onChange?: (enemyData: EnemyFormData) => void
}

// デフォルト値の定義
const getDefaultEnemyFormData = (): EnemyFormData => ({
	selectedId: null,
	type: null,
	manualOverrides: {
		resistCritical: 0,
		requiredHIT: 0,
	},
})

export default function NewEnemyForm({
	enemyData,
	onChange,
}: NewEnemyFormProps) {
	// Zustandストアから敵データを取得
	const storeEnemyData = useCalculatorStore((state) => state.data.enemy)
	const updateEnemy = useCalculatorStore((state) => state.updateEnemy)

	// Zustandストアの値を使用（完全移行）
	const effectiveEnemyData = storeEnemyData

	// モーダル状態管理
	const [modalState, setModalState] = useState<{
		isOpen: boolean
		title: string
	}>({
		isOpen: false,
		title: '',
	})

	// 現在選択されている敵情報を取得
	const selectedEnemy =
		effectiveEnemyData.selectedId && effectiveEnemyData.type
			? getPresetEnemyById(effectiveEnemyData.selectedId)
			: null

	// モーダル開閉の処理
	const handleOpenModal = () => {
		setModalState({
			isOpen: true,
			title: '敵を選択',
		})
	}

	const handleCloseModal = () => {
		setModalState({
			isOpen: false,
			title: '',
		})
	}

	// 敵選択の処理
	const handleEnemySelect = (enemyId: string | null) => {
		if (enemyId === null) {
			// 未選択の場合
			const newData = getDefaultEnemyFormData()
			// Zustandストアを更新
			updateEnemy(newData)

			// 後方互換性のため従来のonChangeも呼び出し
			if (onChange) {
				onChange(newData)
			}
			return
		}

		const enemy = getPresetEnemyById(enemyId)
		if (!enemy) return

		const newData: EnemyFormData = {
			selectedId: enemyId,
			type: 'preset',
			manualOverrides: {
				resistCritical: 0, // プリセットは0から開始
				requiredHIT: 0, // プリセットは0から開始
			},
		}

		// Zustandストアを更新
		updateEnemy(newData)

		// 後方互換性のため従来のonChangeも呼び出し
		if (onChange) {
			onChange(newData)
		}
	}

	// 手動調整値の変更処理
	const handleManualOverrideChange = (
		field: 'resistCritical' | 'requiredHIT',
		value: string,
	) => {
		const numValue = value === '' ? 0 : Number(value)
		const newData: EnemyFormData = {
			...effectiveEnemyData,
			manualOverrides: {
				...effectiveEnemyData.manualOverrides,
				[field]: numValue,
			},
		}

		// Zustandストアを更新
		updateEnemy(newData)

		// 後方互換性のため従来のonChangeも呼び出し
		if (onChange) {
			onChange(newData)
		}
	}

	// 最終的な計算値を取得（プリセット値 + 調整値）
	const getFinalValue = (baseValue: number, overrideValue?: number): number => {
		return baseValue + (overrideValue || 0)
	}

	// カテゴリ表示名の取得
	const getCategoryDisplayName = (category: EnemyCategory): string => {
		switch (category) {
			case 'mob':
				return 'モブ'
			case 'fieldBoss':
				return 'フィールドボス'
			case 'boss':
				return 'ボス'
			case 'raidBoss':
				return 'レイドボス'
			default:
				return category
		}
	}

	// 選択済み敵の名前を取得
	const getSelectedEnemyName = (): string => {
		if (!selectedEnemy) return 'なし'
		return `${selectedEnemy.name} (Lv.${selectedEnemy.level})`
	}

	// 選択済み敵の詳細情報を取得
	const getSelectedEnemyInfo = (): string => {
		if (!selectedEnemy) return ''
		const parts = []
		if (selectedEnemy.stats.DEF > 0)
			parts.push(`DEF ${selectedEnemy.stats.DEF}`)
		if (selectedEnemy.stats.MDEF > 0)
			parts.push(`MDEF ${selectedEnemy.stats.MDEF}`)
		return parts.slice(0, 2).join(', ')
	}

	return (
		<section className="bg-white rounded-lg shadow-md p-4 lg:col-start-1 lg:col-end-3 lg:row-start-6 lg:row-end-7">
			<h2 className="text-lg font-bold text-gray-800 mb-3">敵情報</h2>

			<div className="space-y-4">
				{/* 敵選択ボタン */}
				<div className="flex items-center gap-2">
					<label className="text-sm font-medium text-gray-700 w-16 sm:w-20 flex-shrink-0">
						敵選択:
					</label>
					<button
						type="button"
						onClick={handleOpenModal}
						className={`
							flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-left transition-colors hover:bg-gray-50
							${selectedEnemy ? 'bg-blue-50 border-blue-300' : 'bg-white'}
						`}
					>
						<div className="flex items-center justify-between">
							<div className="flex-1 min-w-0">
								<div
									className={`font-medium truncate ${
										selectedEnemy ? 'text-blue-900' : 'text-gray-500'
									}`}
								>
									{getSelectedEnemyName()}
								</div>
								{selectedEnemy && (
									<div className="text-xs text-gray-600 mt-1 truncate">
										{getSelectedEnemyInfo()}
									</div>
								)}
							</div>
							<div className="ml-2 flex-shrink-0">
								<svg
									className="w-5 h-5 text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-label="選択"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M19 9l-7 7-7-7"
									/>
								</svg>
							</div>
						</div>
					</button>
				</div>

				{/* 選択された敵の基本情報表示 */}
				{selectedEnemy && (
					<div className="bg-gray-50 p-3 rounded space-y-2">
						<h3 className="text-sm font-semibold text-gray-700">
							選択中: {selectedEnemy.name}
						</h3>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
							<div>レベル: {selectedEnemy.level}</div>
							<div>DEF: {selectedEnemy.stats.DEF}</div>
							<div>MDEF: {selectedEnemy.stats.MDEF}</div>
							<div>物理耐性: {selectedEnemy.stats.physicalResistance}%</div>
							<div>魔法耐性: {selectedEnemy.stats.magicalResistance}%</div>
							<div>
								カテゴリ: {getCategoryDisplayName(selectedEnemy.category)}
							</div>
						</div>
					</div>
				)}

				{/* 手動調整値入力 */}
				{selectedEnemy && (
					<div className="space-y-2">
						<h3 className="text-sm font-semibold text-gray-700">手動調整値</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
							<div className="flex items-center gap-2">
								<label className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">
									クリ耐性:
								</label>
								<div className="flex-1 flex items-center gap-1 text-sm">
									<span className="text-gray-500">
										{selectedEnemy.stats.resistCritical}
									</span>
									<span className="text-gray-500">+</span>
									<input
										type="number"
										value={
											effectiveEnemyData.manualOverrides?.resistCritical || 0
										}
										onChange={(e) =>
											handleManualOverrideChange(
												'resistCritical',
												e.target.value,
											)
										}
										className="w-16 px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
										min="0"
										max="999"
									/>
									<span className="text-gray-500">=</span>
									<span className="font-medium">
										{getFinalValue(
											selectedEnemy.stats.resistCritical,
											effectiveEnemyData.manualOverrides?.resistCritical,
										)}
									</span>
								</div>
							</div>

							<div className="flex items-center gap-2">
								<label className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">
									必要HIT:
								</label>
								<div className="flex-1 flex items-center gap-1 text-sm">
									<span className="text-gray-500">
										{selectedEnemy.stats.requiredHIT}
									</span>
									<span className="text-gray-500">+</span>
									<input
										type="number"
										value={effectiveEnemyData.manualOverrides?.requiredHIT || 0}
										onChange={(e) =>
											handleManualOverrideChange('requiredHIT', e.target.value)
										}
										className="w-16 px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
										min="0"
										max="9999"
									/>
									<span className="text-gray-500">=</span>
									<span className="font-medium">
										{getFinalValue(
											selectedEnemy.stats.requiredHIT,
											effectiveEnemyData.manualOverrides?.requiredHIT,
										)}
									</span>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* 未選択時のメッセージ */}
				{!selectedEnemy && (
					<div className="bg-gray-50 p-3 rounded text-sm text-gray-600 text-center">
						敵選択ボタンをクリックして敵を選択してください
					</div>
				)}
			</div>

			{/* 敵選択モーダル */}
			<EnemySelectionModal
				isOpen={modalState.isOpen}
				onClose={handleCloseModal}
				onSelect={handleEnemySelect}
				selectedEnemyId={effectiveEnemyData.selectedId}
				title={modalState.title}
			/>
		</section>
	)
}
