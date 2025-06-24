import React from 'react'
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
}

const PropertyDoubleDisplay: React.FC<PropertyDoubleDisplayProps> = ({
	property1,
	property2,
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
				<span className="text-sm text-gray-700 truncate">
					{property.propertyName}
				</span>

				{/* %値 */}
				<div className="text-center">
					{property.propertyConfig.hasRate ? (
						<span
							className={`text-xs tabular-nums px-1 py-0.5 rounded ${
								property.rateValue && property.rateValue > 0
									? 'bg-sky-50 text-sky-700'
									: 'text-gray-400'
							}`}
						>
							{property.rateValue && property.rateValue > 0
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
							className={`text-xs tabular-nums px-1 py-0.5 rounded ${
								property.fixedValue && property.fixedValue > 0
									? 'bg-blue-50 text-blue-700'
									: 'text-gray-400'
							}`}
						>
							{property.fixedValue && property.fixedValue > 0
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
		<div className="grid grid-cols-[80px_40px_40px_80px_40px_40px] gap-2 py-1 px-2">
			{/* プロパティ1 */}
			{renderProperty(property1)}

			{/* プロパティ2 */}
			{renderProperty(property2)}
		</div>
	)
}

export default PropertyDoubleDisplay
export type { PropertyDoubleDisplayProps, PropertyDisplayData }
