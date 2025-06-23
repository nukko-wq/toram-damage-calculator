import { useCalculatorStore } from '@/stores'
import { calculateHP, calculateMP, aggregateAllBonuses } from '@/utils/basicStatsCalculation'
import StatSection from './StatSection'

interface StatusPreviewProps {
	isVisible: boolean
}

export default function StatusPreview({ isVisible }: StatusPreviewProps) {
	const { data } = useCalculatorStore()

	if (!isVisible) {
		return null
	}

	// 正確なHP・MP計算を実行
	const baseStats = data.baseStats
	
	// TODO: 実際の装備・クリスタ・料理・バフから補正値を集計
	// 現在は仮の補正値を使用
	const allBonuses = aggregateAllBonuses(
		{}, // equipment bonuses
		{}, // crystal bonuses  
		{}, // food bonuses
		{}  // buff bonuses
	)

	const hpCalculation = calculateHP(baseStats, allBonuses)
	const mpCalculation = calculateMP(baseStats, allBonuses)

	// 基本ステータス計算結果
	const calculatedStats = {
		HP: hpCalculation.finalHP,
		MP: mpCalculation.finalMP,
		レベル: baseStats.level,
		STR: baseStats.STR,
		INT: baseStats.INT,
		VIT: baseStats.VIT,
		AGI: baseStats.AGI,
		DEX: baseStats.DEX,
		CRT: baseStats.CRT,
		MEN: baseStats.MEN,
		TEC: baseStats.TEC,
	}

	// HP計算の詳細
	const hpDetails = {
		'補正後VIT': Math.floor(hpCalculation.adjustedVIT),
		'HP基本値': hpCalculation.baseHP,
		'HP%適用後': hpCalculation.hpAfterPercent,
		'最終HP': hpCalculation.finalHP,
	}

	// MP計算の詳細
	const mpDetails = {
		'MP基本値': mpCalculation.baseMP,
		'MP%適用後': mpCalculation.mpAfterPercent,
		'最終MP': mpCalculation.finalMP,
	}

	// 武器情報（簡易版）
	const weaponInfo = {
		'メイン武器ATK': data.mainWeapon.ATK,
		'メイン武器安定率': data.mainWeapon.stability,
		'サブ武器ATK': data.subWeapon.ATK,
		'サブ武器安定率': data.subWeapon.stability,
	}

	return (
		<div className="bg-gray-50 border-b border-gray-200 transition-all duration-300 ease-in-out">
			<div className="container mx-auto px-4 py-6">
				{/* レスポンシブグリッドレイアウト */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{/* 基本ステータス */}
					<StatSection
						title="基本ステータス"
						stats={calculatedStats}
						labels={{
							HP: 'HP',
							MP: 'MP',
							レベル: 'レベル',
							STR: 'STR',
							INT: 'INT',
							VIT: 'VIT',
							AGI: 'AGI',
							DEX: 'DEX',
							CRT: 'CRT',
							MEN: 'MEN',
							TEC: 'TEC',
						}}
						className="md:col-span-2 lg:col-span-2"
					/>

					{/* HP計算詳細 */}
					<StatSection
						title="HP計算詳細"
						stats={hpDetails}
						labels={{
							'補正後VIT': '補正後VIT',
							'HP基本値': 'HP基本値',
							'HP%適用後': 'HP%適用後',
							'最終HP': '最終HP',
						}}
						className="md:col-span-1 lg:col-span-1"
					/>

					{/* MP計算詳細 */}
					<StatSection
						title="MP計算詳細"
						stats={mpDetails}
						labels={{
							'MP基本値': 'MP基本値',
							'MP%適用後': 'MP%適用後',
							'最終MP': '最終MP',
						}}
						className="md:col-span-1 lg:col-span-1"
					/>

					{/* 武器情報 */}
					<StatSection
						title="武器情報"
						stats={weaponInfo}
						labels={{
							'メイン武器ATK': 'メイン武器ATK',
							'メイン武器安定率': 'メイン武器安定率',
							'サブ武器ATK': 'サブ武器ATK',
							'サブ武器安定率': 'サブ武器安定率',
						}}
						className="md:col-span-2 lg:col-span-2"
					/>
				</div>

				{/* 計算式の説明 */}
				<div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
					<div className="flex">
						<svg
							className="flex-shrink-0 h-5 w-5 text-blue-400"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fillRule="evenodd"
								d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
								clipRule="evenodd"
							/>
						</svg>
						<div className="ml-3">
							<h3 className="text-sm font-medium text-blue-800">
								正確な計算式使用
							</h3>
							<div className="mt-2 text-sm text-blue-700">
								<p><strong>HP計算式:</strong> INT(INT(93+(補正後VIT+22.41)*Lv/3)*(1+HP%/100))+HP固定値</p>
								<p><strong>MP計算式:</strong> INT(INT(Lv+99+TEC+総INT/10)*(1+MP%/100))+MP固定値</p>
								<p className="mt-1 text-xs">現在は装備・クリスタ補正なしの基本値を表示しています。</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}