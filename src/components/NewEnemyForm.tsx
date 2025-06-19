'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCalculatorStore } from '@/stores'
import type {
	PresetEnemy,
	UserEnemy,
	EnemyFormData,
	EnemyCategory,
} from '@/types/calculator'
import { enemyFormDataSchema } from '@/schemas/enemy'
import {
	getAllEnemies,
	getEnemiesByCategory,
	getEnemyById,
	getCategoryDisplayName,
} from '@/utils/enemyDatabase'

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
	const [selectedCategory, setSelectedCategory] = useState<
		EnemyCategory | 'all'
	>('all')

	const {
		register,
		watch,
		setValue,
		formState: { errors },
	} = useForm<EnemyFormData>({
		resolver: zodResolver(enemyFormDataSchema),
		defaultValues: enemyData,
		mode: 'onChange',
	})

	// 現在選択されている敵情報を取得
	const selectedEnemy =
		effectiveEnemyData.selectedId && effectiveEnemyData.type
			? getEnemyById(effectiveEnemyData.selectedId)
			: null

	// カテゴリ別の敵情報を取得
	const availableEnemies =
		selectedCategory === 'all'
			? getAllEnemies()
			: getEnemiesByCategory(selectedCategory)

	// プリセット選択の処理
	const handleEnemySelect = (enemyId: string) => {
		if (enemyId === '') {
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

		const enemy = getEnemyById(enemyId)
		if (!enemy) return

		const isPreset = !('createdAt' in enemy)
		const newData: EnemyFormData = {
			selectedId: enemyId,
			type: isPreset ? 'preset' : 'custom',
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

	return (
		<section className="bg-white rounded-lg shadow-md p-4 lg:col-start-1 lg:col-end-3 lg:row-start-6 lg:row-end-7">
			<h2 className="text-lg font-bold text-gray-800 mb-3">敵情報</h2>

			<div className="space-y-4">
				{/* カテゴリフィルター */}
				<div className="flex items-center gap-2">
					<label className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">
						カテゴリ:
					</label>
					<select
						value={selectedCategory}
						onChange={(e) =>
							setSelectedCategory(e.target.value as EnemyCategory | 'all')
						}
						className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
					>
						<option value="all">全て</option>
						<option value="mob">モブ</option>
						<option value="fieldBoss">フィールドボス</option>
						<option value="boss">ボス</option>
						<option value="raidBoss">レイドボス</option>
					</select>
				</div>

				{/* 敵選択 */}
				<div className="flex items-center gap-2">
					<label className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">
						敵選択:
					</label>
					<select
						value={effectiveEnemyData.selectedId || ''}
						onChange={(e) => handleEnemySelect(e.target.value)}
						className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
					>
						<option value="">-- 敵を選択 --</option>
						{availableEnemies.map((enemy) => (
							<option key={enemy.id} value={enemy.id}>
								{enemy.name} (Lv.{enemy.level}) [
								{getCategoryDisplayName(enemy.category)}]
							</option>
						))}
					</select>
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
						敵を選択してください
					</div>
				)}
			</div>
		</section>
	)
}
