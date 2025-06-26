import type React from 'react'

const PropertyDoubleSectionHeader: React.FC = () => {
	return (
		<div className="grid grid-cols-[80px_40px_40px_80px_40px_40px] md:grid-cols-[90px_40px_40px_90px_40px_40px] gap-2 py-1 px-2 border-b border-blue-200">
			<span className="text-[13px] font-semibold text-gray-600" />
			<span className="text-[13px] font-semibold text-center text-gray-600">
				%
			</span>
			<span className="text-[13px] font-semibold text-center text-gray-600">
				+
			</span>
			<span className="text-[13px] font-semibold text-gray-600" />
			<span className="text-[13px] font-semibold text-center text-gray-600">
				%
			</span>
			<span className="text-[13px] font-semibold text-center text-gray-600">
				+
			</span>
		</div>
	)
}

export default PropertyDoubleSectionHeader
