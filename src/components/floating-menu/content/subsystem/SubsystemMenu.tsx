'use client'

interface SubsystemMenuItem {
	id: string
	title: string
	description: string
	status: 'available' | 'coming_soon'
	onClick: () => void
}

interface SubsystemMenuProps {
	onItemClick: (itemId: string) => void
}

export default function SubsystemMenu({ onItemClick }: SubsystemMenuProps) {
	const subsystemMenuItems: SubsystemMenuItem[] = [
		{
			id: 'crystal_custom',
			title: 'クリスタカスタム',
			description: 'ユーザークリスタの作成・編集・削除',
			status: 'available',
			onClick: () => onItemClick('crystal_custom'),
		},
		{
			id: 'enemy_custom',
			title: '敵カスタム',
			description: 'ユーザー敵データの作成・編集・削除',
			status: 'coming_soon',
			onClick: () => onItemClick('enemy_custom'),
		},
	]

	return (
		<div className="space-y-3">
			{subsystemMenuItems.map((item) => (
				<button
					key={item.id}
					type="button"
					onClick={item.onClick}
					disabled={item.status === 'coming_soon'}
					className={`
						w-full p-4 rounded-lg border-2 transition-all duration-200 text-left
						${
							item.status === 'available'
								? 'border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 cursor-pointer'
								: 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
						}
					`}
				>
					<div className="flex flex-col space-y-2">
						<div className="flex items-center justify-between">
							<h3 className="font-semibold text-gray-900">{item.title}</h3>
							{item.status === 'coming_soon' && (
								<span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded">
									実装予定
								</span>
							)}
						</div>
						<p className="text-sm text-gray-600">{item.description}</p>
					</div>
				</button>
			))}
		</div>
	)
}
