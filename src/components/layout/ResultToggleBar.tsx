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
		<div className={`sticky top-0 left-0 right-0 z-40 ${className}`}>
			{/* トグルボタンバー */}
			<div className="">
				<div
					className="grid grid-cols-2 lg:grid-cols-[520px_1fr]"
					role="group"
					aria-label="計算結果表示切り替え"
				>
					{/* 与ダメージ確認ボタン */}
					<button
						type="button"
						onClick={toggleDamagePreview}
						className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors duration-200 ${
							showDamagePreview
								? 'bg-blue-300 text-white'
								: 'bg-blue-300 text-white'
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
						className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors duration-200 ${
							showStatusPreview
								? 'bg-blue-300 text-white'
								: 'bg-blue-300 text-white'
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

			{/* プレビューエリア - 固定位置でmain要素に重なる */}
			{(showDamagePreview || showStatusPreview) && (
				<div className="absolute top-full left-0 right-0 z-30 max-h-[80vh] overflow-y-auto">
					<div className="grid grid-cols-[520px_1fr]">
						{/* 与ダメージプレビュー */}
						{showDamagePreview ? (
							<div
								className="bg-orange-50 rounded-lg"
								id="damage-preview"
								aria-labelledby="damage-toggle"
							>
								<DamagePreview isVisible={showDamagePreview} />
							</div>
						) : (
							<div /> /* プレースホルダー */
						)}

						{/* ステータスプレビュー */}
						{showStatusPreview && (
							<div
								className="bg-blue-50"
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
