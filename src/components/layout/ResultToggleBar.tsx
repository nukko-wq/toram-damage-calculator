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
	const {
		showStatusPreview,
		showDamagePreview,
		toggleStatusPreview,
		toggleDamagePreview,
	} = useUIStore()

	return (
		<div className={`bg-white border-b border-gray-200 ${className}`}>
			{/* トグルボタンバー */}
			<div className="px-4 py-2">
				<div
					className="grid grid-cols-2 gap-2"
					role="group"
					aria-label="計算結果表示切り替え"
				>
					{/* 与ダメージ確認ボタン */}
					<button
						type="button"
						onClick={toggleDamagePreview}
						className={`inline-flex items-center justify-center px-4 py-2 rounded-md border text-sm font-medium transition-colors duration-200 ${
							showDamagePreview
								? 'bg-orange-600 text-white border-orange-600 hover:bg-orange-700'
								: 'bg-white text-orange-600 border-orange-300 hover:bg-orange-50'
						}`}
						aria-pressed={showDamagePreview}
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
						onClick={toggleStatusPreview}
						className={`inline-flex items-center justify-center px-4 py-2 rounded-md border text-sm font-medium transition-colors duration-200 ${
							showStatusPreview
								? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
								: 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
						}`}
						aria-pressed={showStatusPreview}
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

			{/* プレビューエリア - 2カラム表示 */}
			{(showDamagePreview || showStatusPreview) && (
				<div className="border-t border-gray-200">
					<div
						className={`grid gap-4 p-4 ${
							showDamagePreview && showStatusPreview
								? 'lg:grid-cols-[520px_1fr]'
								: 'grid-cols-1'
						}`}
					>
						{/* 与ダメージプレビュー */}
						{showDamagePreview && (
							<div
								className="bg-orange-50 rounded-lg border border-orange-200"
								id="damage-preview"
								aria-labelledby="damage-toggle"
							>
								<DamagePreview isVisible={showDamagePreview} />
							</div>
						)}

						{/* ステータスプレビュー */}
						{showStatusPreview && (
							<div
								className="bg-blue-50 rounded-lg border border-blue-200"
								id="status-preview"
								aria-labelledby="status-toggle"
							>
								<StatusPreview isVisible={showStatusPreview} />
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	)
})
