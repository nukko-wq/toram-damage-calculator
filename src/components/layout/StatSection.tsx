import React from 'react'
import StatItem from './StatItem'
import PropertyDisplay from './PropertyDisplay'
import PropertySectionHeader from './PropertySectionHeader'
import type { PropertyConfig } from './PropertyDisplay'

interface StatSectionProps {
	title: string
	stats: Record<string, number>
	labels: Record<string, string>
	className?: string
	displayMode?: 'normal' | 'property'
	propertyConfigs?: Record<string, PropertyConfig>
}

export default React.memo<StatSectionProps>(
	({
		title,
		stats,
		labels,
		className = '',
		displayMode = 'normal',
		propertyConfigs = {},
	}) => {
		return (
			<div
				className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}
			>
				<h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
					{title}
				</h3>

				{displayMode === 'property' ? (
					<div>
						<PropertySectionHeader />
						<div className="space-y-0">
							{Object.entries(stats).map(([key, value]) => {
								const config = propertyConfigs[key] || {
									hasRate: false,
									hasFixed: true,
								}
								const baseKey = key.replace('_Rate', '')
								const isRateKey = key.endsWith('_Rate')

								// %のキーの場合、対応する固定値を探す
								const rateValue = isRateKey
									? value
									: stats[`${key}_Rate`] || null
								const fixedValue = isRateKey ? stats[baseKey] || null : value

								return (
									<PropertyDisplay
										key={key}
										propertyName={labels[key] || key}
										rateValue={config.hasRate ? rateValue : null}
										fixedValue={config.hasFixed ? fixedValue : null}
										propertyConfig={config}
									/>
								)
							})}
						</div>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
						{Object.entries(stats).map(([key, value]) => (
							<StatItem
								key={key}
								name={labels[key] || key}
								value={value}
								className="hover:bg-gray-50 rounded"
							/>
						))}
					</div>
				)}
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
