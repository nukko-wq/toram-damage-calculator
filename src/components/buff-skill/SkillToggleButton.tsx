'use client'

interface SkillToggleButtonProps {
	isEnabled: boolean
	onToggle: (enabled: boolean) => void
}

export default function SkillToggleButton({
	isEnabled,
	onToggle,
}: SkillToggleButtonProps) {
	return (
		<button
			type="button"
			onClick={() => onToggle(!isEnabled)}
			className={`
				relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer
				${isEnabled ? 'bg-blue-500/90' : 'bg-gray-200'}
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
