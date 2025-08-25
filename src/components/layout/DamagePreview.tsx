'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useUIStore } from '@/stores'
import { useCalculatorStore } from '@/stores/calculatorStore'
import type {
	OptionTabType,
	OtherOptions,
	PowerOptions,
} from '@/types/calculator'
import {
	calculateDamageWithService,
	type DamageCalculationServiceResult,
} from '@/utils/damageCalculationService'
import {
	createCaptureData,
	type DamageCaptureData,
	loadCaptureData,
	saveCaptureData,
} from '@/utils/damageCaptureStorage'
import {
	getCurrentBraveMultiplier,
	getCurrentPassiveMultiplier,
} from '@/utils/damagePreviewCalculations'
import {
	createInitialOtherOptions,
	createInitialPowerOptions,
} from '@/utils/initialData'
import ExpectedValueDisplay from '@/components/damage/ExpectedValueDisplay'
import { calculateExpectedValueData } from '@/utils/expectedValueCalculations'
import { useEnemyData } from '@/hooks/useEnemyData'
import AdaptationMultiplierSlider from '@/components/ui/AdaptationMultiplierSlider'
import EnemyInfoDisplay from '@/components/ui/EnemyInfoDisplay'
import DamageTable from '@/components/ui/DamageTable'

interface DamagePreviewProps {
	isVisible: boolean
}

export default function DamagePreview({ isVisible }: DamagePreviewProps) {
	// UIStoreから高さ管理を取得
	const { damagePreviewHeight, setDamagePreviewHeight } = useUIStore()

	// リサイズ関連の状態管理
	const containerRef = useRef<HTMLDivElement>(null)
	const [isResizing, setIsResizing] = useState(false)
	const [startY, setStartY] = useState(0)
	const [startHeight, setStartHeight] = useState(damagePreviewHeight)

	// 威力オプション設定をZustandストアから取得（フォールバック付き）
	const powerOptions =
		useCalculatorStore((state) => state.data.powerOptions) ||
		createInitialPowerOptions()
	const updatePowerOptions = useCalculatorStore(
		(state) => state.updatePowerOptions,
	)

	// その他オプション設定をZustandストアから取得（フォールバック付き）
	const otherOptions =
		useCalculatorStore((state) => state.data.otherOptions) ||
		createInitialOtherOptions()
	const updateOtherOptions = useCalculatorStore(
		(state) => state.updateOtherOptions,
	)

	// オプションタブ状態をZustandストアから取得
	const optionTab =
		useCalculatorStore((state) => state.data.optionTab) || 'power'
	const updateOptionTab = useCalculatorStore((state) => state.updateOptionTab)

	// 慣れ倍率をZustandストアから取得・更新
	const adaptationMultiplier = useCalculatorStore(
		(state) => state.data.adaptationMultiplier || 100,
	)
	const updateAdaptationMultiplier = useCalculatorStore(
		(state) => state.updateAdaptationMultiplier,
	)


	// キャプチャデータの状態管理
	const [captureData, setCaptureData] = useState<DamageCaptureData | null>(null)

	// Zustandストアから計算データと計算結果を取得
	const calculatorData = useCalculatorStore((state) => state.data)
	const calculationResults = useCalculatorStore(
		(state) => state.calculationResults,
	)
	
	// 敵データを取得
	const { enemyFormData } = useEnemyData()
	const updateCalculationResults = useCalculatorStore(
		(state) => state.updateCalculationResults,
	)

	// 基準ダメージ結果更新用のアクション
	const updateBaselineDamageResult = useCalculatorStore(
		(state) => state.updateBaselineDamageResult,
	)

	// キャプチャデータ初期化の関数をuseMemoで最適化
	const initialCaptureData = useMemo(() => {
		return loadCaptureData()
	}, [])

	// 初期化とフィールド監視を統合したuseEffect
	useEffect(() => {
		// 1. キャプチャデータの初期読み込み（初回のみ）
		if (captureData === null) {
			setCaptureData(initialCaptureData)
		}

		// 2. 計算結果を更新（必要な場合のみ）
		if (!calculationResults) {
			updateCalculationResults()
		}

		// 4. ダメージ計算結果を更新（計算結果が取得できた場合）
		if (calculationResults) {
			updateBaselineDamageResult()
		}
	}, [
		captureData,
		initialCaptureData,
		calculationResults,
		updateCalculationResults,
		updateBaselineDamageResult,
	])


	// 実際のダメージ計算
	const damageResults = useMemo((): DamageCalculationServiceResult => {
		try {
			// サービスを使用してダメージ計算を実行
			return calculateDamageWithService(calculatorData, calculationResults, {
				powerOptions,
				debug: false,
				adaptationMultiplier,
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
	}, [calculatorData, calculationResults, powerOptions, adaptationMultiplier])

	// 期待値表示用データ計算
	const expectedValueData = useMemo(() => {
		return calculateExpectedValueData(calculatorData, calculationResults, enemyFormData, adaptationMultiplier)
	}, [calculatorData, calculationResults, enemyFormData, adaptationMultiplier])

	// キャプチャボタンクリック処理（useCallbackで最適化）
	const handleCapture = useCallback(() => {
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
	}, [damageResults.normal])

	const handlePowerOptionChange = useCallback(
		<K extends keyof PowerOptions>(key: K, value: PowerOptions[K]) => {
			updatePowerOptions({ ...powerOptions, [key]: value })
		},
		[powerOptions, updatePowerOptions],
	)

	const handleOtherOptionChange = useCallback(
		<K extends keyof OtherOptions>(key: K, value: OtherOptions[K]) => {
			updateOtherOptions({ ...otherOptions, [key]: value })
		},
		[otherOptions, updateOtherOptions],
	)

	const handleTabChange = useCallback(
		(tab: OptionTabType) => {
			updateOptionTab(tab)
		},
		[updateOptionTab],
	)

	// リサイズ関連のイベントハンドラー
	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			setIsResizing(true)
			setStartY(e.clientY)
			setStartHeight(damagePreviewHeight)
			e.preventDefault()
		},
		[damagePreviewHeight],
	)

	const handleTouchStart = useCallback(
		(e: React.TouchEvent) => {
			setIsResizing(true)
			setStartY(e.touches[0].clientY)
			setStartHeight(damagePreviewHeight)
			e.preventDefault()
		},
		[damagePreviewHeight],
	)

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isResizing) return
			const deltaY = e.clientY - startY
			const newHeight = startHeight + deltaY // 下に動かすと高さを大きく、上に動かすと高さを小さく
			setDamagePreviewHeight(newHeight)
		},
		[isResizing, startY, startHeight, setDamagePreviewHeight],
	)

	const handleTouchMove = useCallback(
		(e: TouchEvent) => {
			if (!isResizing) return
			const deltaY = e.touches[0].clientY - startY
			const newHeight = startHeight + deltaY
			setDamagePreviewHeight(newHeight)
			e.preventDefault()
		},
		[isResizing, startY, startHeight, setDamagePreviewHeight],
	)

	const handleEnd = useCallback(() => {
		setIsResizing(false)
	}, [])

	// リサイズイベントの登録
	useEffect(() => {
		if (isResizing) {
			document.addEventListener('mousemove', handleMouseMove)
			document.addEventListener('mouseup', handleEnd)
			document.addEventListener('touchmove', handleTouchMove, {
				passive: false,
			})
			document.addEventListener('touchend', handleEnd)

			return () => {
				document.removeEventListener('mousemove', handleMouseMove)
				document.removeEventListener('mouseup', handleEnd)
				document.removeEventListener('touchmove', handleTouchMove)
				document.removeEventListener('touchend', handleEnd)
			}
		}
	}, [isResizing, handleMouseMove, handleTouchMove, handleEnd])

	if (!isVisible) {
		return null
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
		<div
			ref={containerRef}
			className="relative bg-blue-50"
			style={{ height: `${damagePreviewHeight}px`, overflow: 'hidden' }}
		>
			{/* リサイズハンドル */}
			<div
				className={`absolute bottom-0 left-0 right-0 h-3 bg-blue-200/50 hover:bg-blue-300/70 cursor-row-resize flex items-center justify-center transition-colors ${
					isResizing ? 'bg-blue-400/70' : ''
				}`}
				onMouseDown={handleMouseDown}
				onTouchStart={handleTouchStart}
				tabIndex={0}
				role="button"
				aria-label="DamagePreviewの高さを調整"
				title="ドラッグして高さを調整"
			>
				<div className="w-8 h-1 bg-gray-400 rounded-full" />
			</div>

			<div
				className="container mx-auto px-4 h-full overflow-y-auto py-1 sm:py-2"
				style={{ paddingBottom: '12px' }} // リサイズハンドル分のスペースを確保
			>
				{/* ダメージ表示部分 */}
				{powerOptions.damageType === 'expected' ? (
					<ExpectedValueDisplay
						expectedValue={expectedValueData.expectedValue}
						averageStability={expectedValueData.averageStability}
						powerEfficiency={expectedValueData.powerEfficiency}
						params={expectedValueData.params}
						occurrenceRatio={expectedValueData.occurrenceRatio}
						damageRatio={expectedValueData.damageRatio}
					/>
				) : (
					<DamageTable
						damageResults={damageResults.normal}
						captureData={captureData}
						onCapture={handleCapture}
					/>
				)}

				{/* 慣れ倍率スライダー */}
				<AdaptationMultiplierSlider
					value={adaptationMultiplier}
					onChange={updateAdaptationMultiplier}
				/>

				{/* 敵情報 */}
				<EnemyInfoDisplay selectedEnemyId={calculatorData.enemy?.selectedEnemyId || null} />

				{/* 威力オプション */}
				<div className=" sm:p-2">
					<ul className="flex gap-2 bg-blue-100 p-1 mb-1">
						<li
							className={`text-[10px] sm:text-xs font-semibold flex-1 text-center cursor-pointer px-2 py-1 rounded ${
								optionTab === 'power'
									? 'bg-blue-500 text-white'
									: 'text-gray-900 hover:bg-blue-200'
							}`}
							onClick={() => handleTabChange('power')}
						>
							威力オプション
						</li>
						<li
							className={`text-[10px] sm:text-xs font-semibold flex-1 text-center cursor-pointer px-2 py-1 rounded ${
								optionTab === 'other'
									? 'bg-blue-500 text-white'
									: 'text-gray-900 hover:bg-blue-200'
							}`}
							onClick={() => handleTabChange('other')}
						>
							その他
						</li>
					</ul>

					{/* タブコンテンツ */}
					{optionTab === 'power' && (
						<div className="space-y-0.5 sm:space-y-1">
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
											onClick={() =>
												handlePowerOptionChange('skillDamage', hit)
											}
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
										[
											'advantageous',
											'other',
											'none',
											'disadvantageous',
										] as const
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
					)}

					{optionTab === 'other' && (
						<div className="space-y-0.5 sm:space-y-1">
							{/* 敵状態異常：破壊 */}
							<div className="flex items-center sm:gap-4 border-b-2 border-blue-200">
								<label className="text-xs md:text-[13px] font-semibold text-gray-700 w-24">
									敵状態異常：破壊
								</label>
								<div className="flex sm:gap-2">
									{['applied', 'none'].map((status) => (
										<button
											key={status}
											onClick={() =>
												handleOtherOptionChange(
													'enemyStatusDestroy',
													status as 'applied' | 'none',
												)
											}
											className={`px-3 py-1 text-xs md:text-[13px] rounded cursor-pointer ${
												otherOptions.enemyStatusDestroy === status
													? 'bg-red-400 text-white'
													: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
											}`}
										>
											{status === 'applied' ? '付与' : 'なし'}
										</button>
									))}
								</div>
							</div>

							{/* 敵状態異常：衰弱 */}
							<div className="flex items-center sm:gap-4 border-b-2 border-blue-200">
								<label className="text-xs md:text-[13px] font-semibold text-gray-700 w-24">
									敵状態異常：衰弱
								</label>
								<div className="flex sm:gap-2">
									{['applied', 'none'].map((status) => (
										<button
											key={status}
											onClick={() =>
												handleOtherOptionChange(
													'enemyStatusWeaken',
													status as 'applied' | 'none',
												)
											}
											className={`px-3 py-1 text-xs md:text-[13px] rounded cursor-pointer ${
												otherOptions.enemyStatusWeaken === status
													? 'bg-red-400 text-white'
													: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
											}`}
										>
											{status === 'applied' ? '付与' : 'なし'}
										</button>
									))}
								</div>
							</div>

							{/* 敵状態異常：暗闇 */}
							<div className="flex items-center sm:gap-4 border-b-2 border-blue-200">
								<label className="text-xs md:text-[13px] font-semibold text-gray-700 w-24">
									敵状態異常：暗闇
								</label>
								<div className="flex sm:gap-2">
									{['applied', 'none'].map((status) => (
										<button
											key={status}
											onClick={() =>
												handleOtherOptionChange(
													'enemyStatusBlind',
													status as 'applied' | 'none',
												)
											}
											className={`px-3 py-1 text-xs md:text-[13px] rounded cursor-pointer ${
												otherOptions.enemyStatusBlind === status
													? 'bg-red-400 text-white'
													: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
											}`}
										>
											{status === 'applied' ? '付与' : 'なし'}
										</button>
									))}
								</div>
							</div>

							{/* スキル：強打 */}
							<div className="flex items-center sm:gap-4 border-b-2 border-blue-200">
								<label className="text-xs md:text-[13px] font-semibold text-gray-700 w-24">
									スキル：強打
								</label>
								<div className="flex sm:gap-2">
									{['activated', 'inactive'].map((status) => (
										<button
											key={status}
											onClick={() =>
												handleOtherOptionChange(
													'skillPowerHit',
													status as 'activated' | 'inactive',
												)
											}
											className={`px-3 py-1 text-xs md:text-[13px] rounded cursor-pointer ${
												otherOptions.skillPowerHit === status
													? 'bg-orange-400 text-white'
													: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
											}`}
										>
											{status === 'activated' ? '発動' : '未発動'}
										</button>
									))}
								</div>
							</div>

							{/* スキル：集中 */}
							<div className="flex items-center sm:gap-4 border-b-2 border-blue-200">
								<label className="text-xs md:text-[13px] font-semibold text-gray-700 w-24">
									スキル：集中
								</label>
								<div className="flex sm:gap-2">
									{['activated', 'inactive'].map((status) => (
										<button
											key={status}
											onClick={() =>
												handleOtherOptionChange(
													'skillConcentration',
													status as 'activated' | 'inactive',
												)
											}
											className={`px-3 py-1 text-xs md:text-[13px] rounded cursor-pointer ${
												otherOptions.skillConcentration === status
													? 'bg-orange-400 text-white'
													: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
											}`}
										>
											{status === 'activated' ? '発動' : '未発動'}
										</button>
									))}
								</div>
							</div>

							{/* パッシブ倍率(+%) */}
							<div className="flex items-center sm:gap-4 border-b-2 border-blue-200">
								<label className="text-xs md:text-[13px] font-semibold text-gray-700 w-24">
									パッシブ倍率(+%)
								</label>
								<div className="flex items-center sm:gap-2">
									{/* モード選択 */}
									{['manual', 'auto'].map((mode) => (
										<button
											key={mode}
											onClick={() =>
												handleOtherOptionChange('passiveMultiplier', {
													...otherOptions.passiveMultiplier,
													mode: mode as 'manual' | 'auto',
												})
											}
											className={`px-2 py-1 text-xs rounded cursor-pointer ${
												otherOptions.passiveMultiplier.mode === mode
													? 'bg-green-400 text-white'
													: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
											}`}
										>
											{mode === 'manual' ? '手動入力' : '自動計算'}
										</button>
									))}
									{/* 自動計算時の現在の倍率表示 */}
									{otherOptions.passiveMultiplier.mode === 'auto' && (
										<span className="text-xs text-gray-600 font-mono">
											{getCurrentPassiveMultiplier(calculatorData)}%
										</span>
									)}
									{/* 手動入力時のみ数値入力フィールドを表示 */}
									{otherOptions.passiveMultiplier.mode === 'manual' && (
										<input
											type="number"
											value={otherOptions.passiveMultiplier.value || 0}
											onChange={(e) =>
												handleOtherOptionChange('passiveMultiplier', {
													...otherOptions.passiveMultiplier,
													value: Number(e.target.value),
												})
											}
											className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
											placeholder="0"
										/>
									)}
								</div>
							</div>

							{/* ブレイブ倍率(+%) */}
							<div className="flex items-center sm:gap-4 border-b-2 border-blue-200">
								<label className="text-xs md:text-[13px] font-semibold text-gray-700 w-24">
									ブレイブ倍率(+%)
								</label>
								<div className="flex items-center sm:gap-2">
									{/* モード選択 */}
									{['manual', 'auto'].map((mode) => (
										<button
											key={mode}
											onClick={() =>
												handleOtherOptionChange('braveMultiplier', {
													...otherOptions.braveMultiplier,
													mode: mode as 'manual' | 'auto',
												})
											}
											className={`px-2 py-1 text-xs rounded cursor-pointer ${
												otherOptions.braveMultiplier.mode === mode
													? 'bg-green-400 text-white'
													: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
											}`}
										>
											{mode === 'manual' ? '手動入力' : '自動計算'}
										</button>
									))}
									{/* 自動計算時の現在の倍率表示 */}
									{otherOptions.braveMultiplier.mode === 'auto' && (
										<span className="text-xs text-gray-600 font-mono">
											{getCurrentBraveMultiplier(calculatorData)}%
										</span>
									)}
									{/* 手動入力時のみ数値入力フィールドを表示 */}
									{otherOptions.braveMultiplier.mode === 'manual' && (
										<input
											type="number"
											value={otherOptions.braveMultiplier.value || 0}
											onChange={(e) =>
												handleOtherOptionChange('braveMultiplier', {
													...otherOptions.braveMultiplier,
													value: Number(e.target.value),
												})
											}
											className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
											placeholder="0"
										/>
									)}
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
