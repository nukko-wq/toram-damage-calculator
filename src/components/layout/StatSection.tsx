import React from 'react'
import StatItem from './StatItem'
import PropertyDisplay from './PropertyDisplay'
import PropertySectionHeader from './PropertySectionHeader'
import PropertyDoubleDisplay from './PropertyDoubleDisplay'
import PropertyDoubleSectionHeader from './PropertyDoubleSectionHeader'
import type { PropertyConfig } from './PropertyDisplay'
import type { PropertyDisplayData } from './PropertyDoubleDisplay'

interface StatSectionProps {
	title: string
	stats: Record<string, number>
	labels: Record<string, string>
	className?: string
	displayMode?: 'normal' | 'property' | 'property-double'
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
				) : displayMode === 'property-double' ? (
					<div>
						<PropertyDoubleSectionHeader />
						<div className="space-y-0">
							{(() => {
								// プロパティを2つずつペアにする
								const entries = Object.entries(stats)
								const pairs: Array<{
									property1: PropertyDisplayData
									property2?: PropertyDisplayData
								}> = []

								for (let i = 0; i < entries.length; i += 2) {
									const [key1, value1] = entries[i]
									const config1 = propertyConfigs[key1] || {
										hasRate: false,
										hasFixed: true,
									}
									const baseKey1 = key1.replace('_Rate', '')
									const isRateKey1 = key1.endsWith('_Rate')
									const rateValue1 = isRateKey1
										? value1
										: stats[`${key1}_Rate`] || null
									const fixedValue1 = isRateKey1
										? stats[baseKey1] || null
										: value1

									const property1: PropertyDisplayData = {
										propertyName: labels[key1] || key1,
										rateValue: config1.hasRate ? rateValue1 : null,
										fixedValue: config1.hasFixed ? fixedValue1 : null,
										propertyConfig: config1,
									}

									let property2: PropertyDisplayData | undefined
									if (i + 1 < entries.length) {
										const [key2, value2] = entries[i + 1]
										const config2 = propertyConfigs[key2] || {
											hasRate: false,
											hasFixed: true,
										}
										const baseKey2 = key2.replace('_Rate', '')
										const isRateKey2 = key2.endsWith('_Rate')
										const rateValue2 = isRateKey2
											? value2
											: stats[`${key2}_Rate`] || null
										const fixedValue2 = isRateKey2
											? stats[baseKey2] || null
											: value2

										property2 = {
											propertyName: labels[key2] || key2,
											rateValue: config2.hasRate ? rateValue2 : null,
											fixedValue: config2.hasFixed ? fixedValue2 : null,
											propertyConfig: config2,
										}
									}

									pairs.push({ property1, property2 })
								}

								return pairs.map((pair) => (
									<PropertyDoubleDisplay
										key={`${pair.property1.propertyName}-${pair.property2?.propertyName || 'empty'}`}
										property1={pair.property1}
										property2={pair.property2}
									/>
								))
							})()}
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
