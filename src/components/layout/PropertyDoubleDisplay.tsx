import type React from 'react'
import type { PropertyConfig } from './PropertyDisplay'

interface PropertyDisplayData {
	propertyName: string
	rateValue: number | null
	fixedValue: number | null
	propertyConfig: PropertyConfig
}

interface PropertyDoubleDisplayProps {
	property1: PropertyDisplayData
	property2?: PropertyDisplayData
	className?: string
}

const PropertyDoubleDisplay: React.FC<PropertyDoubleDisplayProps> = ({
	property1,
	property2,
	className = '',
}) => {
	const renderProperty = (property: PropertyDisplayData | undefined) => {
		if (!property) {
			return (
				<>
					<span className="text-sm text-gray-300">-</span>
					<span className="text-center text-gray-300">-</span>
					<span className="text-center text-gray-300">-</span>
				</>
			)
		}

		return (
			<>
				{/* プロパティ名 */}
				<span className="font-semibold text-[12px] md:text-[13px] text-gray-700 truncate">
					{property.propertyName}
				</span>

				{/* %値 */}
				<div className="text-center">
					{property.propertyConfig.hasRate ? (
						<span
							className={`font-semibold text-[13px] px-1 py-0.5 rounded ${
								property.rateValue !== null && property.rateValue !== 0
									? property.rateValue > 0
										? 'text-gray-900'
										: 'text-red-600'
									: 'text-gray-400'
							}`}
						>
							{property.rateValue !== null && property.rateValue !== 0
								? property.rateValue
								: '-'}
						</span>
					) : (
						<span className="text-gray-300">-</span>
					)}
				</div>

				{/* +値 */}
				<div className="text-center">
					{property.propertyConfig.hasFixed ? (
						<span
							className={`font-semibold text-[13px] tabular-nums px-1 py-0.5 rounded ${
								property.fixedValue !== null && property.fixedValue !== 0
									? property.fixedValue > 0
										? 'text-gray-900'
										: 'text-red-600'
									: 'text-gray-400'
							}`}
						>
							{property.fixedValue !== null && property.fixedValue !== 0
								? property.fixedValue
								: '-'}
						</span>
					) : (
						<span className="text-gray-300">-</span>
					)}
				</div>
			</>
		)
	}

	return (
		<div
			className={`grid grid-cols-[80px_40px_40px_80px_40px_40px] md:grid-cols-[90px_40px_40px_90px_40px_40px] items-center gap-2 py-0.5 px-2 hover:bg-blue-100/80 rounded border-b border-blue-200 ${className}`}
		>
			{/* プロパティ1 */}
			{renderProperty(property1)}

			{/* プロパティ2 */}
			{renderProperty(property2)}
		</div>
	)
}

export default PropertyDoubleDisplay
export type { PropertyDoubleDisplayProps, PropertyDisplayData }
