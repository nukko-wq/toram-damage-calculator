import type { CalculationResults } from '@/types/calculationResult'
import { STAT_LABELS, SECTION_TITLES } from '@/types/calculationResult'
import StatSection from './StatSection'

interface CalculationResultContentProps {
	results: CalculationResults
	isVisible: boolean
}

export default function CalculationResultContent({
	results,
	isVisible,
}: CalculationResultContentProps) {
	if (!isVisible) {
		return null
	}

	return (
		<div
			id="calculation-result-content"
			className="bg-gray-50 border-b border-gray-200 transition-all duration-300 ease-in-out"
		>
			<div className="container mx-auto px-4 py-6">
				{/* レスポンシブグリッドレイアウト */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{/* 基本ステータス */}
					<StatSection
						title={SECTION_TITLES.basicStats}
						stats={results.basicStats}
						labels={STAT_LABELS.basicStats}
						className="md:col-span-2 lg:col-span-2"
					/>

					{/* 補正後ステータス */}
					<StatSection
						title={SECTION_TITLES.adjustedStats}
						stats={results.adjustedStats}
						labels={STAT_LABELS.adjustedStats}
						className="md:col-span-1 lg:col-span-1"
					/>

					{/* 装備品補正値1 */}
					<StatSection
						title={SECTION_TITLES.equipmentBonus1}
						stats={results.equipmentBonus1}
						labels={STAT_LABELS.equipmentBonus1}
						className="md:col-span-1 lg:col-span-1"
					/>

					{/* 装備品補正値2 */}
					<StatSection
						title={SECTION_TITLES.equipmentBonus2}
						stats={results.equipmentBonus2}
						labels={STAT_LABELS.equipmentBonus2}
						className="md:col-span-2 lg:col-span-2"
					/>

					{/* 装備品補正値3 */}
					<StatSection
						title={SECTION_TITLES.equipmentBonus3}
						stats={results.equipmentBonus3}
						labels={STAT_LABELS.equipmentBonus3}
						className="md:col-span-2 lg:col-span-2"
					/>
				</div>
			</div>
		</div>
	)
}
