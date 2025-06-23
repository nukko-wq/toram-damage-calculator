import { useCalculatorStore } from '@/stores'
import type { CalculationResults } from '@/types/calculationResult'
import { STAT_LABELS, SECTION_TITLES } from '@/types/calculationResult'
import StatSection from './StatSection'

interface StatusPreviewProps {
	isVisible: boolean
}

export default function StatusPreview({ isVisible }: StatusPreviewProps) {
	const calculationResults = useCalculatorStore((state) => state.calculationResults)

	if (!isVisible) {
		return null
	}

	// 計算結果が存在しない場合は簡易メッセージを表示
	if (!calculationResults) {
		return (
			<div className="bg-gray-50 py-6">
				<div className="container mx-auto px-4">
					<div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
						<div className="flex">
							<svg
								className="flex-shrink-0 h-5 w-5 text-yellow-400"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fillRule="evenodd"
									d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
									clipRule="evenodd"
								/>
							</svg>
							<div className="ml-3">
								<p className="text-sm text-yellow-700">
									<strong>計算結果なし:</strong>{' '}
									フォームに入力を行うと、ここに詳細なステータス計算結果が表示されます。
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="bg-gray-50 border-b border-gray-200 transition-all duration-300 ease-in-out">
			<div className="container mx-auto px-4 py-6">
				{/* レスポンシブグリッドレイアウト */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{/* 基本ステータス */}
					<StatSection
						title={SECTION_TITLES.basicStats}
						stats={calculationResults.basicStats}
						labels={STAT_LABELS.basicStats}
						className="md:col-span-2 lg:col-span-2"
					/>

					{/* 補正後ステータス */}
					<StatSection
						title={SECTION_TITLES.adjustedStats}
						stats={calculationResults.adjustedStats}
						labels={STAT_LABELS.adjustedStats}
						className="md:col-span-1 lg:col-span-1"
					/>

					{/* 装備品補正値1 */}
					<StatSection
						title={SECTION_TITLES.equipmentBonus1}
						stats={calculationResults.equipmentBonus1}
						labels={STAT_LABELS.equipmentBonus1}
						className="md:col-span-1 lg:col-span-1"
					/>

					{/* 装備品補正値2 */}
					<StatSection
						title={SECTION_TITLES.equipmentBonus2}
						stats={calculationResults.equipmentBonus2}
						labels={STAT_LABELS.equipmentBonus2}
						className="md:col-span-2 lg:col-span-2"
					/>

					{/* 装備品補正値3 */}
					<StatSection
						title={SECTION_TITLES.equipmentBonus3}
						stats={calculationResults.equipmentBonus3}
						labels={STAT_LABELS.equipmentBonus3}
						className="md:col-span-2 lg:col-span-2"
					/>
				</div>
			</div>
		</div>
	)
}