import React from 'react'

interface HeaderActionsProps {
	showSaveManager: boolean
	onToggleSaveManager: () => void
	className?: string
}

export default React.memo<HeaderActionsProps>(function HeaderActions({
	showSaveManager,
	onToggleSaveManager,
	className = '',
}) {
	return (
		<div className={`flex flex-col sm:flex-row gap-2 sm:gap-3 ${className}`}>
			{/* セーブデータ管理ボタン */}
			<button
				type="button"
				onClick={onToggleSaveManager}
				className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
				aria-expanded={showSaveManager}
				aria-controls="save-manager"
			>
				<svg
					className="mr-2 h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
				<span className="whitespace-nowrap">
					{showSaveManager ? 'セーブ管理を閉じる' : 'セーブデータ管理'}
				</span>
			</button>
		</div>
	)
}, (prevProps, nextProps) => {
	return prevProps.showSaveManager === nextProps.showSaveManager
})