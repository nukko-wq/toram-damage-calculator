interface StatRowProps {
	leftStat?: { name: string; value: number | null }
	rightStat?: { name: string; value: number | null }
	className?: string
}

export default function StatRow({
	leftStat,
	rightStat,
	className = '',
}: StatRowProps) {
	// 数値のフォーマット（3桁区切り、0値や null の場合は「-」表示）
	const formatValue = (num: number | null): string => {
		if (num === null || num === undefined || num === 0) {
			return '-'
		}
		return num.toLocaleString('ja-JP')
	}

	const renderStat = (
		stat: { name: string; value: number | null } | undefined,
	) => {
		if (!stat) {
			return <div className="flex-1" />
		}

		return (
			<div className="flex justify-between items-center py-1 px-2 flex-1">
				<span className="font-semibold text-[12px] md:text-[13px] text-gray-700 min-w-[110px]">
					{stat.name}
				</span>
				<span className="font-semibold text-[12px] md:text-[13px] text-gray-900 tabular-nums font-roboto">
					{formatValue(stat.value)}
				</span>
			</div>
		)
	}

	return (
		<div
			className={`flex hover:bg-blue-100/80 rounded border-b border-blue-200 ${className}`}
		>
			{renderStat(leftStat)}
			{renderStat(rightStat)}
		</div>
	)
}
