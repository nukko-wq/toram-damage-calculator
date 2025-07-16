'use client'

import { useState, useMemo, useEffect } from 'react'
import { useCalculatorStore } from '@/stores/calculatorStore'
import {
	calculateDamageWithService,
	type DamageCalculationServiceResult,
} from '@/utils/damageCalculationService'
import { getPresetEnemyById } from '@/utils/enemyDatabase'
import {
	type DamageCaptureData,
	saveCaptureData,
	loadCaptureData,
	createCaptureData,
} from '@/utils/damageCaptureStorage'
import type { PowerOptions } from '@/types/calculator'
import { createInitialPowerOptions } from '@/utils/initialData'

interface DamagePreviewProps {
	isVisible: boolean
}

export default function DamagePreview({ isVisible }: DamagePreviewProps) {
	// 威力オプション設定をZustandストアから取得（フォールバック付き）
	const powerOptions =
		useCalculatorStore((state) => state.data.powerOptions) ||
		createInitialPowerOptions()
	const updatePowerOptions = useCalculatorStore(
		(state) => state.updatePowerOptions,
	)

	// キャプチャデータの状態管理
	const [captureData, setCaptureData] = useState<DamageCaptureData | null>(null)

	// キャプチャデータの初期読み込み
	useEffect(() => {
		const loadedData = loadCaptureData()
		setCaptureData(loadedData)
	}, [])

	// Zustandストアから計算データと計算結果を取得
	const calculatorData = useCalculatorStore((state) => state.data)
	const calculationResults = useCalculatorStore(
		(state) => state.calculationResults,
	)
	const updateCalculationResults = useCalculatorStore(
		(state) => state.updateCalculationResults,
	)

	// 計算結果を更新
	useEffect(() => {
		if (!calculationResults) {
			updateCalculationResults()
		}
	}, [calculationResults, updateCalculationResults])

	// 選択されている敵の名前を取得
	const getSelectedEnemyName = (): string => {
		if (calculatorData.enemy?.selectedEnemyId) {
			const enemy = getPresetEnemyById(calculatorData.enemy.selectedEnemyId)
			if (enemy) {
				return enemy.name
			}
		}
		return '未選択'
	}

	// 実際のダメージ計算
	const damageResults = useMemo((): DamageCalculationServiceResult => {
		try {
			// サービスを使用してダメージ計算を実行
			return calculateDamageWithService(calculatorData, calculationResults, {
				powerOptions,
				debug: false,
			})
		} catch (error) {
			console.error('ダメージ計算エラー:', error)
			// エラー時はフォールバック値を返す
			return {
				normal: {
					min: 1000,
					max: 1500,
					average: 1250,
					stability: 85,
					averageStability: 92,
				},
				skill: {
					min: 1200,
					max: 1800,
					average: 1500,
					stability: 85,
					averageStability: 92,
				},
			}
		}
	}, [calculatorData, calculationResults, powerOptions])

	if (!isVisible) {
		return null
	}

	// キャプチャボタンクリック処理
	const handleCapture = () => {
		try {
			// 現在のダメージ値を取得
			const currentDamage = damageResults.normal

			// キャプチャデータを作成
			const newCaptureData = createCaptureData(
				currentDamage.min,
				currentDamage.max,
				currentDamage.average,
				currentDamage.stability,
				currentDamage.averageStability,
			)

			// LocalStorageに保存
			saveCaptureData(newCaptureData)

			// 状態を更新
			setCaptureData(newCaptureData)
		} catch (error) {
			console.error('キャプチャに失敗しました:', error)
			alert('キャプチャに失敗しました')
		}
	}

	const handlePowerOptionChange = <K extends keyof PowerOptions>(
		key: K,
		value: PowerOptions[K],
	) => {
		updatePowerOptions({ ...powerOptions, [key]: value })
	}

	// powerOptionsが存在しない場合のフォールバック表示
	if (!powerOptions) {
		return (
			<div className="bg-blue-50 py-2">
				<div className="container mx-auto px-4">
					<div className="text-center py-4">Loading...</div>
				</div>
			</div>
		)
	}

	return (
		<div className="bg-blue-50 py-2">
			<div className="container mx-auto px-4">
				{/* ダメージ表示テーブル */}
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-gray-200">
								<th className="sm:px-2 py-3 text-left text-gray-700 font-medium" />
								<th
									className="px-1 sm:px-2 py-1 sm:py-3 text-center text-gray-700 font-medium"
									colSpan={2}
								>
									現在の計算結果
								</th>
								<th
									className="px-1 py-1 sm:px-2 sm:py-3 text-center text-gray-700 font-medium"
									colSpan={2}
								>
									<button
										onClick={handleCapture}
										className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-1 cursor-pointer text-sm mx-auto"
									>
										<svg
											className="w-3 h-3"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
											/>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
											/>
										</svg>
										キャプチャ
									</button>
								</th>
							</tr>
							<tr className="border-b border-gray-200">
								<th className="sm:px-2 py-0.5 text-left text-gray-700 font-medium" />
								<th className="px-1 sm:px-2 py-0.5 text-center text-gray-700 font-medium">
									ダメージ
								</th>
								<th className="px-1 sm:px-2 py-0.5 text-center text-gray-700 font-medium">
									安定率
								</th>
								<th className="px-1 sm:px-2 py-0.5 text-center text-gray-700 font-medium">
									ダメージ
								</th>
								<th className="px-1 sm:px-2 py-0.5 text-center text-gray-700 font-medium">
									安定率
								</th>
							</tr>
						</thead>
						<tbody>
							<tr className="border-b border-gray-100">
								<td className="px-1 sm:pl-4 sm:pr-2 pb-0.5 pt-1 font-medium text-gray-700">
									最小
								</td>
								<td className="pl-1 pr-2 sm:px-4 pb-0.5 pt-1 text-right font-semibold text-gray-700 font-roboto">
									{damageResults.normal.min.toLocaleString()}
								</td>
								<td className="px-1 sm:px-4 pb-0.5 pt-1 text-center text-gray-700 font-roboto">
									{damageResults.normal.stability}%
								</td>
								<td className="pl-1 pr-2 sm:px-4 pb-0.5 pt-1 text-right font-semibold text-gray-700 font-roboto">
									{captureData
										? captureData.damageResult.minimum.damage.toLocaleString()
										: 'データなし'}
								</td>
								<td className="px-1 sm:px-4 pb-0.5 pt-1 text-center text-gray-700 font-roboto">
									{captureData
										? `${captureData.damageResult.minimum.stability}%`
										: '-'}
								</td>
							</tr>
							<tr className="border-b border-gray-100">
								<td className="px-1 sm:px-4 py-0.5 font-medium text-gray-700">
									最大
								</td>
								<td className="pl-1 pr-2 sm:px-4 py-0.5 text-right font-semibold text-gray-700 font-roboto">
									{damageResults.normal.max.toLocaleString()}
								</td>
								<td className="px-1 sm:px-4 py-0.5 text-center text-gray-600 font-roboto">
									100%
								</td>
								<td className="pl-1 pr-2 sm:px-4 py-0.5 text-right font-semibold text-gray-700 font-roboto">
									{captureData
										? captureData.damageResult.maximum.damage.toLocaleString()
										: 'データなし'}
								</td>
								<td className="px-1 sm:px-4 py-0.5 text-center text-gray-600 font-roboto">
									{captureData
										? `${captureData.damageResult.maximum.stability}%`
										: '-'}
								</td>
							</tr>
							<tr>
								<td className="px-1 sm:px-4 py-0.5 font-medium text-gray-700">
									平均
								</td>
								<td className="pl-1 pr-2 sm:px-4 py-0.5 text-right font-bold text-gray-700 font-roboto">
									{damageResults.normal.average.toLocaleString()}
								</td>
								<td className="px-1 sm:px-4 py-0.5 text-center text-gray-600 font-roboto">
									{damageResults.normal.averageStability}%
								</td>
								<td className="pl-1 pr-2 sm:px-4 py-0.5 text-right font-bold text-gray-700 font-roboto">
									{captureData
										? captureData.damageResult.average.damage.toLocaleString()
										: 'データなし'}
								</td>
								<td className="px-1 sm:px-4 py-0.5 text-center text-gray-600 font-roboto">
									{captureData
										? `${captureData.damageResult.average.stability}%`
										: '-'}
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				{/* 慣れ倍率スライダー（後で実装予定の枠） */}
				<div className="p-1 sm:p-2 flex items-center">
					<div className="text-xs sm:text-[13px] font-medium text-gray-700">
						慣れ倍率（後で実装）
					</div>
					<div className="h-8 bg-gray-100 rounded flex items-center justify-center">
						<span className="text-xs text-gray-500">スライダー実装予定</span>
					</div>
				</div>

				{/* 敵情報 */}
				<div className="p-1 sm:p-2 flex items-center gap-2">
					<p className="text-sm font-medium text-gray-700">
						敵：{getSelectedEnemyName()}
					</p>
				</div>

				{/* 威力オプション */}
				<div className=" sm:p-2">
					<ul className="flex gap-2 bg-blue-100 p-1 mb-1">
						<li className="text-[10px] sm:text-xs font-semibold text-gray-900 flex-1 text-center">
							威力オプション
						</li>
						<li className="text-[10px] sm:text-xs font-semibold text-gray-900 flex-1 text-center">
							その他
						</li>
					</ul>

					<div className="space-y-1">
						{/* ボス戦難易度 */}
						<div className="flex items-center sm:gap-4 border-b-2 border-blue-200">
							<label className="text-xs md:text-[13px] font-semibold text-gray-700 w-24">
								ボス戦難易度
							</label>
							<div className="flex sm:gap-2">
								{(['normal', 'hard', 'lunatic', 'ultimate'] as const).map(
									(difficulty) => (
										<button
											key={difficulty}
											onClick={() =>
												handlePowerOptionChange('bossDifficulty', difficulty)
											}
											className={`px-3 py-0.5 sm:py-1 text-xs md:text-[13px] rounded min-h-6 cursor-pointer ${
												powerOptions.bossDifficulty === difficulty
													? 'bg-blue-400 text-white'
													: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
											}`}
										>
											{difficulty === 'normal'
												? 'Normal'
												: difficulty === 'hard'
													? 'Hard'
													: difficulty === 'lunatic'
														? 'Lunatic'
														: 'Ultimate'}
										</button>
									),
								)}
							</div>
						</div>

						{/* スキルダメージ */}
						<div className="flex items-center sm:gap-4 border-b-2 border-blue-200">
							<label className="text-xs md:text-[13px] font-semibold text-gray-700 w-24">
								スキルダメージ
							</label>
							<div className="flex sm:gap-2">
								{(['all', 'hit1', 'hit2', 'hit3'] as const).map((hit) => (
									<button
										key={hit}
										onClick={() => handlePowerOptionChange('skillDamage', hit)}
										className={`px-3 py-1 text-xs md:text-[13px] rounded min-h-6 cursor-pointer ${
											powerOptions.skillDamage === hit
												? 'bg-blue-400 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										}`}
									>
										{hit === 'all'
											? '全て'
											: hit === 'hit1'
												? '1撃目'
												: hit === 'hit2'
													? '2撃目'
													: '3撃目'}
									</button>
								))}
							</div>
						</div>

						{/* 属性攻撃 */}
						<div className="flex items-center sm:gap-4 border-b-2 border-blue-200">
							<label className="text-xs md:text-[13px] font-semibold text-gray-700 w-24">
								属性攻撃
							</label>
							<div className="flex sm:gap-2">
								{(
									['advantageous', 'other', 'none', 'disadvantageous'] as const
								).map((element) => (
									<button
										key={element}
										onClick={() =>
											handlePowerOptionChange('elementAttack', element)
										}
										className={`px-3 py-1 text-xs md:text-[13px] rounded cursor-pointer ${
											powerOptions.elementAttack === element
												? 'bg-pink-400 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										}`}
									>
										{element === 'advantageous'
											? '有(有利)'
											: element === 'other'
												? '有(その他)'
												: element === 'none'
													? '無'
													: '不利属性'}
									</button>
								))}
							</div>
						</div>

						{/* コンボ:強打 */}
						<div className="flex items-center sm:gap-4 border-b-2 border-blue-200">
							<label className="text-xs md:text-[13px] font-semibold text-gray-700 w-24">
								コンボ:強打
							</label>
							<div className="flex sm:gap-2">
								{[
									{ value: true, label: '有効' },
									{ value: false, label: '無効' },
								].map((option) => (
									<button
										key={option.label}
										onClick={() =>
											handlePowerOptionChange('combo', option.value)
										}
										className={`px-3 py-1 text-xs md:text-[13px] rounded cursor-pointer ${
											powerOptions.combo === option.value
												? 'bg-rose-400 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										}`}
									>
										{option.label}
									</button>
								))}
							</div>
						</div>

						{/* ダメージ判定 */}
						<div className="flex items-center sm:gap-4 border-b-2 border-blue-200">
							<label className="text-xs md:text-[13px] font-semibold text-gray-700 w-24">
								ダメージ判定
							</label>
							<div className="flex sm:gap-2">
								{(['critical', 'graze', 'white', 'expected'] as const).map(
									(type) => (
										<button
											key={type}
											onClick={() =>
												handlePowerOptionChange('damageType', type)
											}
											className={`px-3 py-1 text-xs md:text-[13px] rounded cursor-pointer ${
												powerOptions.damageType === type
													? 'bg-amber-400 text-white'
													: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
											}`}
										>
											{type === 'white'
												? '白ダメ'
												: type === 'critical'
													? 'Critical'
													: type === 'graze'
														? 'Graze'
														: '期待値'}
										</button>
									),
								)}
							</div>
						</div>

						{/* 距離判定 */}
						<div className="flex items-center sm:gap-4 border-b-2 border-blue-200">
							<label className="text-xs md:text-[13px] font-semibold text-gray-700 w-24">
								距離判定
							</label>
							<div className="flex sm:gap-2">
								{(['short', 'long', 'disabled'] as const).map((distance) => (
									<button
										key={distance}
										onClick={() =>
											handlePowerOptionChange('distance', distance)
										}
										className={`px-3 py-1 text-xs md:text-[13px] rounded cursor-pointer ${
											powerOptions.distance === distance
												? 'bg-rose-400 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										}`}
									>
										{distance === 'short'
											? '近距離'
											: distance === 'long'
												? '遠距離'
												: '無効化'}
									</button>
								))}
							</div>
						</div>

						{/* 属性威力 */}
						<div className="flex items-center sm:gap-4 border-b-2 border-blue-200">
							<label className="text-xs md:text-[13px] font-semibold text-gray-700 w-24">
								属性威力
							</label>
							<div className="flex sm:gap-2">
								{(
									[
										'enabled',
										'advantageOnly',
										'awakeningOnly',
										'disabled',
									] as const
								).map((power) => (
									<button
										key={power}
										onClick={() =>
											handlePowerOptionChange('elementPower', power)
										}
										className={`px-3 py-1 text-xs md:text-[13px] rounded cursor-pointer ${
											powerOptions.elementPower === power
												? 'bg-rose-400 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										}`}
									>
										{power === 'enabled'
											? '有効'
											: power === 'advantageOnly'
												? '有利のみ'
												: power === 'awakeningOnly'
													? '覚醒のみ'
													: '無効'}
									</button>
								))}
							</div>
						</div>

						{/* 抜刀威力 */}
						<div className="flex items-center sm:gap-4 border-b-2 border-blue-200">
							<label className="text-xs md:text-[13px] font-semibold text-gray-700 w-24">
								抜刀威力
							</label>
							<div className="flex sm:gap-2">
								{[
									{ value: true, label: '有効' },
									{ value: false, label: '無効' },
								].map((option) => (
									<button
										key={option.label}
										onClick={() =>
											handlePowerOptionChange('unsheathe', option.value)
										}
										className={`px-3 py-1 text-xs md:text-[13px] rounded cursor-pointer ${
											powerOptions.unsheathe === option.value
												? 'bg-rose-400 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										}`}
									>
										{option.label}
									</button>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
