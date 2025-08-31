'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef } from 'react'

interface FullScreenModalProps {
	isOpen: boolean
	onClose: () => void
	title: string
	children: React.ReactNode
}

export default function FullScreenModal({
	isOpen,
	onClose,
	title,
	children,
}: FullScreenModalProps) {
	// ESCキーでモーダルを閉じる
	useEffect(() => {
		if (!isOpen) return

		const handleEscapeKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose()
			}
		}

		document.addEventListener('keydown', handleEscapeKey)
		return () => {
			document.removeEventListener('keydown', handleEscapeKey)
		}
	}, [isOpen, onClose])

	// スクロール位置保存用ref
	const scrollPositionRef = useRef<number>(0)

	// 背景スクロール防止（position: fixed方式）
	const lockScroll = useCallback(() => {
		// 現在のスクロール位置を保存
		scrollPositionRef.current =
			window.pageYOffset || document.documentElement.scrollTop

		// bodyを固定してスクロールを防止
		document.body.style.position = 'fixed'
		document.body.style.top = `-${scrollPositionRef.current}px`
		document.body.style.width = '100%'
	}, [])

	const unlockScroll = useCallback(() => {
		// bodyのスタイルをリセット
		document.body.style.position = ''
		document.body.style.top = ''
		document.body.style.width = ''

		// 保存したスクロール位置に復元
		window.scrollTo(0, scrollPositionRef.current)
	}, [])

	useEffect(() => {
		if (isOpen) {
			lockScroll()
		} else {
			unlockScroll()
		}

		return () => {
			// クリーンアップ時に確実にスタイルをリセット
			unlockScroll()
		}
	}, [isOpen, lockScroll, unlockScroll])

	const handleBackgroundClick = (e: React.MouseEvent) => {
		// 背景クリックでは閉じない（意図的な操作のみで閉じる）
		e.stopPropagation()
	}

	const handleContentClick = (e: React.MouseEvent) => {
		e.stopPropagation()
	}

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					key="fullscreen-modal"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.3, ease: 'easeInOut' }}
					className="fixed inset-0 z-[10000] bg-white bg-opacity-50"
					onClick={handleBackgroundClick}
				>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3, ease: 'easeInOut' }}
						className="h-full w-full bg-white shadow-2xl flex flex-col"
						onClick={handleContentClick}
					>
						{/* ヘッダー */}
						<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
							<h2 className="text-xl font-semibold text-gray-900">{title}</h2>
							<button
								type="button"
								onClick={onClose}
								className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 cursor-pointer"
								aria-label="モーダルを閉じる"
							>
								終了
							</button>
						</div>

						{/* メインコンテンツ */}
						<div className="flex-1 overflow-y-auto">{children}</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}
