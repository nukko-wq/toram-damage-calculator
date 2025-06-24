import React from 'react'
import StatRow from './StatRow'
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
	propertyOrder?: string[]
}

export default React.memo<StatSectionProps>(
	({
		title,
		stats,
		labels,
		className = '',
		displayMode = 'normal',
		propertyConfigs = {},
		propertyOrder,
	}) => {
		return (
			<div
				className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}
			>
				<h3 className="font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
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
								// プロパティを整理してペアを作成
								console.log(`StatSection ${title} received stats:`, stats)
								console.log(
									`StatSection ${title} propertyOrder:`,
									propertyOrder,
								)

								const pairs: Array<{
									property1: PropertyDisplayData
									property2?: PropertyDisplayData
								}> = []

								// propertyOrderが指定されている場合はその順序で処理、そうでなければObject.entriesの順序で処理
								const orderedKeys = propertyOrder || Object.keys(stats)
								console.log(`StatSection ${title} orderedKeys:`, orderedKeys)

								// プロパティを関数で作成
								const createProperty = (
									key: string,
								): PropertyDisplayData | null => {
									if (key === '' || stats[key] === undefined) return null

									const config = propertyConfigs[key] || {
										hasRate: false,
										hasFixed: true,
									}
									const baseKey = key.replace('_Rate', '')
									const isRateKey = key.endsWith('_Rate')

									let rateValue: number | null = null
									let fixedValue: number | null = null
									let displayName: string

									if (isRateKey) {
										displayName = baseKey
										rateValue = stats[key] || null
										fixedValue = stats[baseKey] || null
									} else {
										displayName = key
										fixedValue = stats[key] || null
										rateValue = stats[`${key}_Rate`] || null
									}

									return {
										propertyName: labels[displayName] || displayName,
										rateValue: config.hasRate ? rateValue : null,
										fixedValue: config.hasFixed ? fixedValue : null,
										propertyConfig: config,
									}
								}

								// orderedKeysを2つずつペアにして処理
								for (let i = 0; i < orderedKeys.length; i += 2) {
									const key1 = orderedKeys[i]
									const key2 = orderedKeys[i + 1]

									const property1 = createProperty(key1)
									const property2 = key2 ? createProperty(key2) : undefined

									// property1が有効な場合のみペアを追加
									if (property1) {
										pairs.push({ property1, property2: property2 || undefined })
									}
								}

								return pairs.map((pair, index) => (
									<PropertyDoubleDisplay
										key={`${pair.property1.propertyName}-${pair.property2?.propertyName || 'empty'}`}
										property1={pair.property1}
										property2={pair.property2}
										className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}
									/>
								))
							})()}
						</div>
					</div>
				) : (
					<div className="space-y-0">
						{(() => {
							const entries = Object.entries(stats)
							const rows: React.ReactElement[] = []

							for (let i = 0; i < entries.length; i += 2) {
								const [leftKey, leftValue] = entries[i]
								const rightEntry = entries[i + 1]
								const rowIndex = Math.floor(i / 2)

								const leftStat = {
									name: labels[leftKey] || leftKey,
									value: leftValue,
								}

								const rightStat = rightEntry
									? {
											name: labels[rightEntry[0]] || rightEntry[0],
											value: rightEntry[1],
										}
									: undefined

								rows.push(
									<StatRow
										key={`row-${i}`}
										leftStat={leftStat}
										rightStat={rightStat}
										className={rowIndex % 2 === 0 ? 'bg-gray-100' : 'bg-white'}
									/>,
								)
							}

							return rows
						})()}
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
