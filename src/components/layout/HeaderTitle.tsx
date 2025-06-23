interface HeaderTitleProps {
	className?: string
}

export default function HeaderTitle({ className = '' }: HeaderTitleProps) {
	return (
		<div className={`flex items-center gap-2 ${className}`}>
			{/* サイトアイコン */}
			<div className="flex items-center justify-center w-8 h-8 text-2xl">
				⚔️
			</div>
			
			{/* サイトタイトル */}
			<h1 className="text-xl md:text-2xl font-semibold text-gray-900">
				トーラムダメージ計算
			</h1>
		</div>
	)
}