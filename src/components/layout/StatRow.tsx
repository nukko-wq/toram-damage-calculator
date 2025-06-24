interface StatRowProps {
	leftStat?: { name: string; value: number }
	rightStat?: { name: string; value: number }
	className?: string
}

export default function StatRow({
	leftStat,
	rightStat,
	className = '',
}: StatRowProps) {
	// 数値のフォーマット（3桁区切り）
	const formatValue = (num: number): string => {
		return num.toLocaleString('ja-JP')
	}

	const renderStat = (stat: { name: string; value: number } | undefined) => {
		if (!stat) {
			return <div className="flex-1" />
		}

		return (
			<div className="flex justify-between items-center py-1 px-2 flex-1">
				<span className="text-sm text-gray-700 min-w-[80px]">{stat.name}</span>
				<span className="text-sm text-gray-900 tabular-nums">
					{formatValue(stat.value)}
				</span>
			</div>
		)
	}

	return (
		<div className={`flex hover:bg-blue-100/80 rounded ${className}`}>
			{renderStat(leftStat)}
			{renderStat(rightStat)}
		</div>
	)
}
