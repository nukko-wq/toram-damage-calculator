'use client'

interface NewSkillToggleButtonProps {
	isEnabled: boolean
	onToggle: (enabled: boolean) => void
}

export default function NewSkillToggleButton({
	isEnabled,
	onToggle,
}: NewSkillToggleButtonProps) {
	return (
		<button
			type="button"
			onClick={() => onToggle(!isEnabled)}
			className={`
				relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
				${isEnabled 
					? 'bg-blue-600' 
					: 'bg-gray-200'
				}
			`}
			role="switch"
			aria-checked={isEnabled}
		>
			<span
				className={`
					inline-block h-4 w-4 transform rounded-full bg-white transition-transform
					${isEnabled ? 'translate-x-6' : 'translate-x-1'}
				`}
			/>
		</button>
	)
}