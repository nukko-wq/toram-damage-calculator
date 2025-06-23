'use client'

import { useCalculatorStore } from '@/stores'
import CalculationResultContent from './CalculationResultContent'

export default function CalculationResultDisplay() {
	const calculationResults = useCalculatorStore((state) => state.calculationResults)
	const isVisible = useCalculatorStore((state) => state.isCalculationResultVisible)

	return (
		<div className="w-full">
			{/* 計算結果コンテンツ（ヘッダーのボタンで制御） */}
			{calculationResults && (
				<CalculationResultContent
					results={calculationResults}
					isVisible={isVisible}
				/>
			)}
		</div>
	)
}