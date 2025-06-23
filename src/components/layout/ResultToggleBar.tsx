'use client'

import React from 'react'
import { useUIStore } from '@/stores'
import DamagePreview from './DamagePreview'
import StatusPreview from './StatusPreview'

interface ResultToggleBarProps {
	className?: string
}

export default React.memo<ResultToggleBarProps>(function ResultToggleBar({
	className = '',
}) {
	const { activeResultView, toggleResultView } = useUIStore()

	return (
		<div className={`bg-white border-b border-gray-200 ${className}`}>
			{/* トグルボタンバー */}
			<div className="container mx-auto px-4 py-3">
				<div
					className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:justify-start"
					role="tablist"
					aria-label="計算結果表示"
				>
					{/* 与ダメージ確認ボタン */}
					<button
						type="button"
						onClick={() => toggleResultView('damage')}
						className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
							activeResultView === 'damage'
								? 'text-white bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
								: 'text-orange-700 bg-orange-100 hover:bg-orange-200 focus:ring-orange-500'
						}`}
						role="tab"
						aria-selected={activeResultView === 'damage'}
						aria-controls="damage-preview"
						id="damage-toggle"
					>
						<svg
							className="mr-2 h-4 w-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M13 10V3L4 14h7v7l9-11h-7z"
							/>
						</svg>
						<span className="whitespace-nowrap">与ダメージ確認</span>
					</button>

					{/* ステータス確認ボタン */}
					<button
						type="button"
						onClick={() => toggleResultView('status')}
						className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
							activeResultView === 'status'
								? 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
								: 'text-blue-700 bg-blue-100 hover:bg-blue-200 focus:ring-blue-500'
						}`}
						role="tab"
						aria-selected={activeResultView === 'status'}
						aria-controls="status-preview"
						id="status-toggle"
					>
						<svg
							className="mr-2 h-4 w-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
							/>
						</svg>
						<span className="whitespace-nowrap">ステータス確認</span>
					</button>
				</div>
			</div>

			{/* プレビューエリア */}
			<div
				className={`overflow-hidden transition-all duration-300 ease-in-out ${
					activeResultView ? 'max-h-screen border-t border-gray-200' : 'max-h-0'
				}`}
			>
				{/* 与ダメージプレビュー */}
				<div
					role="tabpanel"
					aria-labelledby="damage-toggle"
					id="damage-preview"
					hidden={activeResultView !== 'damage'}
				>
					<DamagePreview isVisible={activeResultView === 'damage'} />
				</div>

				{/* ステータスプレビュー */}
				<div
					role="tabpanel"
					aria-labelledby="status-toggle"
					id="status-preview"
					hidden={activeResultView !== 'status'}
				>
					<StatusPreview isVisible={activeResultView === 'status'} />
				</div>
			</div>
		</div>
	)
})