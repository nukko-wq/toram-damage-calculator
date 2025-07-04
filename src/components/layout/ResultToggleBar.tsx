'use client'

import React, { useRef, useEffect, useState } from 'react'
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

	// ToggleBarの高さを測定するためのref
	const toggleBarRef = useRef<HTMLDivElement>(null)
	const [toggleBarHeight, setToggleBarHeight] = useState(60)

	// ToggleBarの高さを動的に測定
	useEffect(() => {
		const updateHeight = () => {
			if (toggleBarRef.current) {
				const height = toggleBarRef.current.offsetHeight
				setToggleBarHeight(height)
			}
		}

		updateHeight()

		// ResizeObserverでサイズ変更を監視
		const resizeObserver = new ResizeObserver(updateHeight)
		if (toggleBarRef.current) {
			resizeObserver.observe(toggleBarRef.current)
		}

		// スクロールイベントでも更新（sticky動作対応）
		const handleScroll = () => {
			updateHeight()
		}
		window.addEventListener('scroll', handleScroll)

		return () => {
			resizeObserver.disconnect()
			window.removeEventListener('scroll', handleScroll)
		}
	}, [])

	return (
		<>
			{/* トグルボタンバー */}
			<div 
				ref={toggleBarRef}
				className={`sticky top-0 left-0 right-0 z-40 ${className}`}
			>
				<div
					className="grid grid-cols-2 lg:grid-cols-[520px_1fr]"
					role="group"
					aria-label="計算結果表示切り替え"
				>
					{/* 与ダメージ確認ボタン */}
					<button
						type="button"
						onClick={toggleDamagePreview}
						className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer ${
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
						className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer ${
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

			{/* プレビューエリア */}
			{(showDamagePreview || showStatusPreview) && (
				<div 
					className="sticky z-30 max-h-[80vh]"
					style={{ top: `${toggleBarHeight}px` }}
				>
					<div className="flex">
						{/* 与ダメージプレビュー */}
						{showDamagePreview && (
							<div
								className="w-[520px] overflow-y-auto bg-gray-50"
								id="damage-preview"
								aria-labelledby="damage-toggle"
							>
								<DamagePreview isVisible={showDamagePreview} />
							</div>
						)}

						{/* ステータスプレビュー */}
						{showStatusPreview && (
							<div
								className="flex-1 w-[calc(100%-520px)] overflow-y-auto bg-blue-50"
								id="status-preview"
								aria-labelledby="status-toggle"
							>
								<StatusPreview isVisible={showStatusPreview} />
							</div>
						)}
					</div>
				</div>
			)}
		</>
	)
})
