'use client'

interface MessageModalProps {
	isOpen: boolean
	onClose: () => void
	message: string
}

export default function MessageModal({
	isOpen,
	onClose,
	message,
}: MessageModalProps) {
	if (!isOpen) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* 背景オーバーレイ */}
			<div className="absolute inset-0 bg-black/50" onClick={onClose} />

			{/* モーダルコンテンツ */}
			<div className="relative bg-white rounded-lg shadow-lg p-6 w-80 max-w-[90vw]">
				<div className="text-center">
					<p className="text-gray-800 mb-4">{message}</p>
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors cursor-pointer"
					>
						OK
					</button>
				</div>
			</div>
		</div>
	)
}
