'use client'

interface SkillToggleButtonsProps {
	isEnabled: boolean
	onToggle: (enabled: boolean) => void
	className?: string
}

export default function SkillToggleButtons({
	isEnabled,
	onToggle,
	className = '',
}: SkillToggleButtonsProps) {
	return (
		<div className={`flex ${className}`}>
			{/* 有効ボタン */}
			<button
				type="button"
				onClick={() => onToggle(true)}
				className={`
					px-2 py-1 text-[13px] font-medium rounded-md transition-colors duration-200 outline-none
					${
						isEnabled
							? 'bg-rose-200 text-gray-700 shadow-md hover:bg-rose-200/80 transition-colors duration-200'
							: 'text-gray-600 hover:bg-rose-100 transition-colors duration-200'
					}
				`}
			>
				有効
			</button>
			{/* 無効ボタン */}
			<button
				type="button"
				onClick={() => onToggle(false)}
				className={`
					px-2 py-1 text-[13px] font-medium rounded-md transition-colors duration-200 outline-none
					${
						!isEnabled
							? 'bg-gray-200 text-gray-700 shadow-md hover:bg-gray-200/80 transition-colors duration-200'
							: 'bg-white text-gray-600 hover:bg-rose-100 transition-colors duration-200'
					}
				`}
			>
				無効
			</button>
		</div>
	)
}
