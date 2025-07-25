import type React from 'react'

const PropertySectionHeader: React.FC = () => {
	return (
		<div className="grid grid-cols-[100px_60px_60px] gap-2 py-2 px-2 border-b border-gray-200 bg-gray-50">
			<span className="text-xs font-medium text-gray-600">プロパティ</span>
			<span className="text-xs font-medium text-center text-sky-600">%</span>
			<span className="text-xs font-medium text-center text-rose-600">+</span>
		</div>
	)
}

export default PropertySectionHeader
