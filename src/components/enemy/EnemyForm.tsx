'use client'

import { useState } from 'react'
import { useEnemyData } from '@/hooks/useEnemyData'
import { useCalculatorStore } from '@/stores'
import { useEnemySettingsStore } from '@/stores/enemySettingsStore'
import type { BossDifficulty, EnemyFormData } from '@/types/calculator'
import { calculateBossDifficultyStats } from '@/utils/bossDifficultyCalculation'
import { getPresetEnemyById } from '@/utils/enemyDatabase'
import {
	calculateRaidBossStats,
	isSelditeFLEEUnknown,
} from '@/utils/raidBossCalculation'
import EnemySelectionModal from './EnemySelectionModal'

export default function EnemyForm() {
	// 新しい敵データ取得システムを使用
	const { enemyFormData } = useEnemyData()
	const updateEnemy = useCalculatorStore((state) => state.updateEnemy)

	// 敵設定ストアのアクション
	const setRaidBossLevel = useEnemySettingsStore(
		(state) => state.setRaidBossLevel,
	)
	const setManualOverrides = useEnemySettingsStore(
		(state) => state.setManualOverrides,
	)

	// 実際のデータは新システムから取得
	const effectiveEnemyData = enemyFormData

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
	const handleEnemySelect = (enemyId: string) => {
		const enemy = getPresetEnemyById(enemyId)
		if (!enemy) return

		// 敵選択時は現在の共通設定を保持
		const newData: EnemyFormData = {
			...effectiveEnemyData,
			selectedId: enemyId,
			type: 'preset',
		}

		// Zustandストアを更新
		updateEnemy(newData)
	}

	// 手動調整値の変更処理
	const handleManualOverrideChange = (
		field: 'resistCritical' | 'requiredHIT',
		value: string,
	) => {
		if (!effectiveEnemyData.selectedId) return

		const numValue = value === '' ? 0 : Number(value)

		// 敵ごとの設定を更新
		const currentOverrides = effectiveEnemyData.manualOverrides || {}
		const newOverrides = {
			...currentOverrides,
			[field]: numValue,
		}
		setManualOverrides(effectiveEnemyData.selectedId, newOverrides)

		const newData: EnemyFormData = {
			...effectiveEnemyData,
			manualOverrides: newOverrides,
		}

		// Zustandストアを更新
		updateEnemy(newData)
	}

	// レイドボスステータス計算
	const getRaidBossStats = (level: number) => {
		if (!selectedEnemy || selectedEnemy.category !== 'raidBoss') return null
		return calculateRaidBossStats(selectedEnemy.id, level)
	}

	// 難易度別ステータス計算（表示専用）
	const getBossDifficultyStats = (difficulty: BossDifficulty) => {
		if (!selectedEnemy || selectedEnemy.category !== 'boss') return null
		return calculateBossDifficultyStats(
			selectedEnemy.level,
			selectedEnemy.stats,
			difficulty,
		)
	}

	// レイドボスレベル変更処理
	const handleRaidBossLevelChange = (level: string) => {
		if (!effectiveEnemyData.selectedId) return

		// 空文字の場合はそのまま保持（入力中の状態）
		if (level === '') {
			// 敵ごとの設定は288にリセット（undefinedは許可されないため）
			setRaidBossLevel(effectiveEnemyData.selectedId, 288)

			const newData: EnemyFormData = {
				...effectiveEnemyData,
				raidBossLevel: undefined,
			}
			updateEnemy(newData)
			return
		}

		const numLevel = Math.max(1, Math.min(999, Number(level) || 1))

		// 敵ごとの設定を更新
		setRaidBossLevel(effectiveEnemyData.selectedId, numLevel)

		const newData: EnemyFormData = {
			...effectiveEnemyData,
			raidBossLevel: numLevel,
		}
		updateEnemy(newData)
	}

	// 選択済み敵の名前を取得
	const getSelectedEnemyName = (): string => {
		if (!selectedEnemy) return '敵を選択してください'
		return `${selectedEnemy.name} (Lv.${selectedEnemy.level})`
	}

	return (
		<section className="bg-white rounded-lg shadow-md p-4 md:col-start-1 md:col-end-5 md:row-start-6 md:row-end-7 xl:col-start-1 xl:col-end-3 xl:row-start-6 xl:row-end-8">
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

				{/* 選択された敵の詳細情報表示 */}
				{selectedEnemy && (
					<div className="bg-gray-50 rounded-lg p-4 space-y-2 sm:space-y-4">
						{/* 基本情報表示 */}
						<div className="grid grid-cols-2 gap-4 text-xs">
							<div>
								<span className="font-medium text-gray-700 pl-4">
									◆ 物理耐性:
								</span>
								<span className="ml-2 text-gray-900">
									{selectedEnemy.stats.physicalResistance}%
								</span>
							</div>
							<div>
								<span className="font-medium text-gray-700 pl-4">
									◆ 魔法耐性:
								</span>
								<span className="ml-2 text-gray-900">
									{selectedEnemy.stats.magicalResistance}%
								</span>
							</div>
						</div>

						{/* レイドボスレベル調整 */}
						{selectedEnemy.category === 'raidBoss' && (
							<div className="space-y-3">
								<h4 className="text-sm font-medium text-gray-800">
									レベル調整
								</h4>
								<div className="flex items-center gap-2">
									<label className="text-sm text-gray-700">レベル:</label>
									<input
										type="number"
										value={effectiveEnemyData.raidBossLevel ?? ''}
										onChange={(e) => handleRaidBossLevelChange(e.target.value)}
										className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
										min="1"
										max="999"
										placeholder="288"
									/>
								</div>
							</div>
						)}

						{/* ステータステーブル */}
						<div className="overflow-x-auto">
							<table className="w-full text-xs border-collapse">
								<thead>
									<tr className="bg-gray-100">
										<th className="border border-gray-300 px-2 py-1 text-left font-medium">
											ステータス
										</th>
										{selectedEnemy.category === 'boss' ? (
											<>
												<th className="border border-gray-300 px-2 py-1 text-center font-medium">
													Normal
												</th>
												<th className="border border-gray-300 px-2 py-1 text-center font-medium">
													Hard
												</th>
												<th className="border border-gray-300 px-2 py-1 text-center font-medium">
													Lunatic
												</th>
												<th className="border border-gray-300 px-2 py-1 text-center font-medium">
													Ultimate
												</th>
											</>
										) : selectedEnemy.category === 'raidBoss' ? (
											<th className="border border-gray-300 px-2 py-1 text-center font-medium">
												計算値
											</th>
										) : (
											<th className="border border-gray-300 px-2 py-1 text-center font-medium">
												-
											</th>
										)}
									</tr>
								</thead>
								<tbody>
									{/* レベル行 */}
									<tr>
										<td className="border border-gray-300 px-2 py-1 font-medium bg-gray-50">
											レベル
										</td>
										{selectedEnemy.category === 'boss' ? (
											<>
												<td className="border border-gray-300 px-2 py-1 text-center">
													{getBossDifficultyStats('normal')?.level}
												</td>
												<td className="border border-gray-300 px-2 py-1 text-center">
													{getBossDifficultyStats('hard')?.level}
												</td>
												<td className="border border-gray-300 px-2 py-1 text-center">
													{getBossDifficultyStats('lunatic')?.level}
												</td>
												<td className="border border-gray-300 px-2 py-1 text-center">
													{getBossDifficultyStats('ultimate')?.level}
												</td>
											</>
										) : selectedEnemy.category === 'raidBoss' ? (
											<td className="border border-gray-300 px-2 py-1 text-center">
												{effectiveEnemyData.raidBossLevel ?? 288}
											</td>
										) : (
											<td className="border border-gray-300 px-2 py-1 text-center">
												{selectedEnemy.level}
											</td>
										)}
									</tr>
									{/* DEF行 */}
									<tr>
										<td className="border border-gray-300 px-2 py-1 font-medium bg-gray-50">
											DEF
										</td>
										{selectedEnemy.category === 'boss' ? (
											<>
												<td className="border border-gray-300 px-2 py-1 text-center">
													{getBossDifficultyStats('normal')?.stats.DEF}
												</td>
												<td className="border border-gray-300 px-2 py-1 text-center">
													{getBossDifficultyStats('hard')?.stats.DEF}
												</td>
												<td className="border border-gray-300 px-2 py-1 text-center">
													{getBossDifficultyStats('lunatic')?.stats.DEF}
												</td>
												<td className="border border-gray-300 px-2 py-1 text-center">
													{getBossDifficultyStats('ultimate')?.stats.DEF}
												</td>
											</>
										) : selectedEnemy.category === 'raidBoss' ? (
											<td className="border border-gray-300 px-2 py-1 text-center">
												{getRaidBossStats(
													effectiveEnemyData.raidBossLevel ?? 288,
												)?.DEF || 0}
											</td>
										) : (
											<td className="border border-gray-300 px-2 py-1 text-center">
												{selectedEnemy.stats.DEF}
											</td>
										)}
									</tr>
									{/* MDEF行 */}
									<tr>
										<td className="border border-gray-300 px-2 py-1 font-medium bg-gray-50">
											MDEF
										</td>
										{selectedEnemy.category === 'boss' ? (
											<>
												<td className="border border-gray-300 px-2 py-1 text-center">
													{getBossDifficultyStats('normal')?.stats.MDEF}
												</td>
												<td className="border border-gray-300 px-2 py-1 text-center">
													{getBossDifficultyStats('hard')?.stats.MDEF}
												</td>
												<td className="border border-gray-300 px-2 py-1 text-center">
													{getBossDifficultyStats('lunatic')?.stats.MDEF}
												</td>
												<td className="border border-gray-300 px-2 py-1 text-center">
													{getBossDifficultyStats('ultimate')?.stats.MDEF}
												</td>
											</>
										) : selectedEnemy.category === 'raidBoss' ? (
											<td className="border border-gray-300 px-2 py-1 text-center">
												{getRaidBossStats(
													effectiveEnemyData.raidBossLevel ?? 288,
												)?.MDEF || 0}
											</td>
										) : (
											<td className="border border-gray-300 px-2 py-1 text-center">
												{selectedEnemy.stats.MDEF}
											</td>
										)}
									</tr>
									{/* レイドボス専用：物理耐性、魔法耐性 */}
									{selectedEnemy.category === 'raidBoss' && (
										<>
											<tr>
												<td className="border border-gray-300 px-2 py-1 font-medium bg-gray-50">
													物理耐性
												</td>
												<td className="border border-gray-300 px-2 py-1 text-center">
													{getRaidBossStats(
														effectiveEnemyData.raidBossLevel ?? 288,
													)?.physicalResistance || 0}
													%
												</td>
											</tr>
											<tr>
												<td className="border border-gray-300 px-2 py-1 font-medium bg-gray-50">
													魔法耐性
												</td>
												<td className="border border-gray-300 px-2 py-1 text-center">
													{getRaidBossStats(
														effectiveEnemyData.raidBossLevel ?? 288,
													)?.magicalResistance || 0}
													%
												</td>
											</tr>
											<tr>
												<td className="border border-gray-300 px-2 py-1 font-medium bg-gray-50">
													必要HIT
												</td>
												<td className="border border-gray-300 px-2 py-1 text-center">
													{getRaidBossStats(
														effectiveEnemyData.raidBossLevel ?? 288,
													)?.requiredHIT || 0}
												</td>
											</tr>
										</>
									)}
								</tbody>
							</table>
						</div>
					</div>
				)}

				{/* 手動調整値入力 */}
				{selectedEnemy && (
					<div className="bg-white rounded-lg border border-gray-200 p-4">
						<div className="flex flex-col gap-4">
							{/* 確定クリティカル */}
							<div className="flex gap-2 items-center">
								<label className="text-xs font-medium text-gray-700 min-w-[116px]">
									確定クリティカル
								</label>
								<div className="flex items-center gap-2">
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
										className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
										min="0"
										max="999"
									/>
								</div>
							</div>

							{/* 必要HIT */}
							<div className="flex gap-2 items-center">
								<label className="text-xs font-medium text-gray-700 min-w-[116px]">
									必要HIT
									{selectedEnemy.category === 'raidBoss' &&
										isSelditeFLEEUnknown(selectedEnemy.id) && (
											<span className="ml-1 text-xs text-orange-600">
												(FLEE値不明)
											</span>
										)}
								</label>
								<div className="flex items-center gap-2">
									<input
										type="number"
										value={effectiveEnemyData.manualOverrides?.requiredHIT || 0}
										onChange={(e) =>
											handleManualOverrideChange('requiredHIT', e.target.value)
										}
										className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
										min="0"
										max="9999"
									/>
								</div>
							</div>
						</div>
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
