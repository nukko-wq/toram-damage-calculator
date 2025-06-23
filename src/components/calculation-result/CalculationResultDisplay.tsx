'use client'

import { useCalculatorStore } from '@/stores'
import CalculationResultHeader from './CalculationResultHeader'
import CalculationResultContent from './CalculationResultContent'

export default function CalculationResultDisplay() {
	const calculationResults = useCalculatorStore((state) => state.calculationResults)
	const isVisible = useCalculatorStore((state) => state.isCalculationResultVisible)
	const toggleVisibility = useCalculatorStore((state) => state.toggleCalculationResultVisibility)

	return (
		<div className="w-full">
			{/* トグルボタンヘッダー */}
			<CalculationResultHeader
				isVisible={isVisible}
				onToggle={toggleVisibility}
			/>

			{/* 計算結果コンテンツ */}
			{calculationResults && (
				<CalculationResultContent
					results={calculationResults}
					isVisible={isVisible}
				/>
			)}
		</div>
	)
}