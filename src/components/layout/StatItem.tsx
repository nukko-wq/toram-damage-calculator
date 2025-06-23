interface StatItemProps {
	name: string
	value: number
	className?: string
}

export default function StatItem({ name, value, className = '' }: StatItemProps) {
	// 数値のフォーマット（3桁区切り）
	const formatValue = (num: number): string => {
		return num.toLocaleString('ja-JP')
	}

	return (
		<div className={`flex justify-between items-center py-1 px-2 ${className}`}>
			<span className="text-sm text-gray-700 font-medium">{name}:</span>
			<span className="text-sm text-gray-900 font-semibold tabular-nums">
				{formatValue(value)}
			</span>
		</div>
	)
}