import React from 'react'

const PropertyDoubleSectionHeader: React.FC = () => {
	return (
		<div className="grid grid-cols-[90px_40px_40px_90px_40px_40px] gap-2 py-2 px-2 border-b border-gray-200 bg-gray-50">
			<span className="text-xs font-medium text-gray-600">プロパティ</span>
			<span className="text-xs font-medium text-center text-sky-600">%</span>
			<span className="text-xs font-medium text-center text-sky-600">+</span>
			<span className="text-xs font-medium text-gray-600">プロパティ</span>
			<span className="text-xs font-medium text-center text-sky-600">%</span>
			<span className="text-xs font-medium text-center text-sky-600">+</span>
		</div>
	)
}

export default PropertyDoubleSectionHeader
