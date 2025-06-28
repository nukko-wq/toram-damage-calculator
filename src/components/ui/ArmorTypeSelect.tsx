import type React from 'react'
import type { ArmorType } from '@/types/calculator'

interface ArmorTypeButtonProps {
	armorType: ArmorType
	selectedType: ArmorType
	onChange: (type: ArmorType) => void
	label: string
}

const ArmorTypeButton: React.FC<ArmorTypeButtonProps> = ({
	armorType,
	selectedType,
	onChange,
	label,
}) => {
	const isSelected = selectedType === armorType

	return (
		<button
			type="button"
			onClick={() => onChange(armorType)}
			className={`
				px-3 py-2 text-sm rounded border transition-colors
				${
					isSelected
						? 'bg-blue-500 text-white border-blue-500'
						: 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'
				}
			`}
			role="radio"
			aria-checked={isSelected}
		>
			{label}
		</button>
	)
}

interface ArmorTypeSelectProps {
	selectedType: ArmorType
	onChange: (type: ArmorType) => void
	className?: string
}

const ArmorTypeSelect: React.FC<ArmorTypeSelectProps> = ({
	selectedType,
	onChange,
	className = '',
}) => {
	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
			event.preventDefault()
			const types: ArmorType[] = ['normal', 'heavy', 'light']
			const currentIndex = types.indexOf(selectedType)
			let nextIndex: number

			if (event.key === 'ArrowLeft') {
				nextIndex = currentIndex > 0 ? currentIndex - 1 : types.length - 1
			} else {
				nextIndex = currentIndex < types.length - 1 ? currentIndex + 1 : 0
			}

			onChange(types[nextIndex])
		}
	}

	return (
		<div className={`${className}`}>
			<div className="mb-2">
				<label className="block text-sm font-medium text-gray-700">
					防具の改造
				</label>
			</div>
			<div
				role="radiogroup"
				aria-label="防具の改造"
				className="flex gap-2"
				onKeyDown={handleKeyDown}
			>
				<ArmorTypeButton
					armorType="normal"
					selectedType={selectedType}
					onChange={onChange}
					label="通常"
				/>
				<ArmorTypeButton
					armorType="heavy"
					selectedType={selectedType}
					onChange={onChange}
					label="重量化"
				/>
				<ArmorTypeButton
					armorType="light"
					selectedType={selectedType}
					onChange={onChange}
					label="軽量化"
				/>
			</div>
		</div>
	)
}

export default ArmorTypeSelect
