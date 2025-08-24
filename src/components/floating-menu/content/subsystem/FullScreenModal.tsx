'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'

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

	// 背景スクロール防止
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = ''
		}

		return () => {
			document.body.style.overflow = ''
		}
	}, [isOpen])

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
					className="fixed inset-0 z-[10000] bg-black bg-opacity-50"
					onClick={handleBackgroundClick}
				>
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 50 }}
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
