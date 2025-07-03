interface HeaderTitleProps {
	className?: string
}

export default function HeaderTitle({ className = '' }: HeaderTitleProps) {
	return (
		<div className={`flex-1 ${className}`}>
			{/* サイトタイトル */}
			<h1 className="text-xl md:text-2xl font-semibold text-gray-900 text-center">
				トーラムダメージ計算
			</h1>
		</div>
	)
}
