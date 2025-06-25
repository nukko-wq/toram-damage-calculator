import type React from 'react'

interface PropertyDisplayProps {
	propertyName: string
	rateValue: number | null
	fixedValue: number | null
	propertyConfig: PropertyConfig
}

interface PropertyConfig {
	hasRate: boolean
	hasFixed: boolean
}

const PropertyDisplay: React.FC<PropertyDisplayProps> = ({
	propertyName,
	rateValue,
	fixedValue,
	propertyConfig,
}) => {
	return (
		<div className="grid grid-cols-[100px_60px_60px] gap-2 py-1 px-2">
			{/* プロパティ名 */}
			<span className="text-sm text-gray-700 font-medium truncate">
				{propertyName}
			</span>

			{/* %値 */}
			<div className="text-center">
				{propertyConfig.hasRate ? (
					<span
						className={`text-xs tabular-nums px-1 py-0.5 rounded ${
							rateValue && rateValue > 0 ? 'text-gray-900' : 'text-gray-400'
						}`}
					>
						{rateValue && rateValue > 0 ? rateValue : '-'}
					</span>
				) : (
					<span className="text-gray-300">-</span>
				)}
			</div>

			{/* +値 */}
			<div className="text-center">
				{propertyConfig.hasFixed ? (
					<span
						className={`text-xs tabular-nums px-1 py-0.5 rounded ${
							fixedValue && fixedValue > 0
								? 'bg-rose-50 text-rose-700'
								: 'text-gray-400'
						}`}
					>
						{fixedValue && fixedValue > 0 ? fixedValue : '-'}
					</span>
				) : (
					<span className="text-gray-300">-</span>
				)}
			</div>
		</div>
	)
}

export default PropertyDisplay
export type { PropertyDisplayProps, PropertyConfig }
