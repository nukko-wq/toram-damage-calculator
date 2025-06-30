'use client'

interface ToggleSwitchProps {
	checked: boolean
	onChange: (checked: boolean) => void
	size?: 'sm' | 'md' | 'lg'
	disabled?: boolean
}

export default function ToggleSwitch({
	checked,
	onChange,
	size = 'sm',
	disabled = false,
}: ToggleSwitchProps) {
	const sizeClasses = {
		sm: 'w-8 h-4',
		md: 'w-10 h-5',
		lg: 'w-12 h-6',
	}

	const thumbSizeClasses = {
		sm: 'w-3 h-3',
		md: 'w-4 h-4',
		lg: 'w-5 h-5',
	}

	const translateClasses = {
		sm: checked ? 'translate-x-4' : 'translate-x-0',
		md: checked ? 'translate-x-5' : 'translate-x-0',
		lg: checked ? 'translate-x-6' : 'translate-x-0',
	}

	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			disabled={disabled}
			onClick={() => onChange(!checked)}
			className={`
        relative inline-flex ${sizeClasses[size]} rounded-full border-2 border-transparent
        transition-colors duration-100 ease-in-out focus:outline-none
        ${checked ? 'bg-blue-500/90' : 'bg-gray-200'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
		>
			<span
				className={`
          ${thumbSizeClasses[size]} inline-block rounded-full bg-white shadow transform
          transition duration-100 ease-in-out ${translateClasses[size]}
        `}
			/>
		</button>
	)
}
