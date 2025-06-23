interface CalculationResultHeaderProps {
	isVisible: boolean
	onToggle: () => void
}

export default function CalculationResultHeader({
	isVisible,
	onToggle,
}: CalculationResultHeaderProps) {
	return (
		<div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
			<div className="container mx-auto px-4 py-3">
				<button
					type="button"
					onClick={onToggle}
					className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
					aria-expanded={isVisible}
					aria-controls="calculation-result-content"
				>
					<svg
						className={`w-4 h-4 transition-transform duration-200 ${
							isVisible ? 'rotate-180' : ''
						}`}
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M19 9l-7 7-7-7"
						/>
					</svg>
					<span className="font-medium">
						{isVisible ? '計算結果を非表示' : '計算結果を表示'}
					</span>
				</button>
			</div>
		</div>
	)
}