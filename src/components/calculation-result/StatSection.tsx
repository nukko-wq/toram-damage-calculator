import React from 'react'
import StatItem from './StatItem'

interface StatSectionProps {
	title: string
	stats: Record<string, number>
	labels: Record<string, string>
	className?: string
}

export default React.memo<StatSectionProps>(
	({ title, stats, labels, className = '' }) => {
		return (
			<div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
				<h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
					{title}
				</h3>
				<div className="space-y-1">
					{Object.entries(stats).map(([key, value]) => (
						<StatItem
							key={key}
							name={labels[key] || key}
							value={value}
							className="hover:bg-gray-50 rounded"
						/>
					))}
				</div>
			</div>
		)
	},
	(prevProps, nextProps) => {
		// パフォーマンス最適化：statsが変更された場合のみ再レンダリング
		return (
			prevProps.title === nextProps.title &&
			JSON.stringify(prevProps.stats) === JSON.stringify(nextProps.stats)
		)
	},
)