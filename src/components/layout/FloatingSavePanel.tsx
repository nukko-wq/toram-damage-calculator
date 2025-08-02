'use client'

import React, { useMemo, useRef, useState } from 'react'
import SaveConfirmModal from '@/components/floating-menu/content/modals/SaveConfirmModal'
import { useCalculatorStore, useSaveDataStore } from '@/stores'

interface FloatingSavePanelProps {
	className?: string
}

export default React.memo<FloatingSavePanelProps>(function FloatingSavePanel({
	className = '',
}) {
	// ストアからデータを取得
	const { saveCurrentData, getUnsavedDataStatus } = useCalculatorStore()
	const { saveDataList, currentSaveId, isInitialized } = useSaveDataStore()

	// モーダル状態管理
	const [isSaveConfirmModalOpen, setIsSaveConfirmModalOpen] = useState(false)

	// 安定した表示名の管理（切り替え中の一時的な不整合状態を吸収）
	const stableNameRef = useRef<string>('メインデータ')

	// セーブデータ名を直接計算（メモ化で安定化）
	const currentSaveName = useMemo(() => {
		// 初期化されていない場合は空文字を返す（ちらつき防止）
		if (!isInitialized) {
			return ''
		}

		if (currentSaveId === 'default') {
			const name = 'メインデータ'
			stableNameRef.current = name
			return name
		}

		const currentSaveData = saveDataList.find(
			(save) => save.id === currentSaveId,
		)
		if (currentSaveData?.name) {
			// 有効な名前が見つかった場合は更新
			stableNameRef.current = currentSaveData.name
			return currentSaveData.name
		}

		// セーブデータが見つからない場合は前回の安定した名前を保持（ちらつき防止）
		return stableNameRef.current
	}, [currentSaveId, saveDataList, isInitialized])

	// 保存確認ダイアログを表示
	const handleSaveButtonClick = () => {
		setIsSaveConfirmModalOpen(true)
	}

	// 現在のデータを保存（確認後）
	const handleSaveCurrentData = async () => {
		try {
			await saveCurrentData()
			setIsSaveConfirmModalOpen(false)
		} catch (err) {
			console.error('データ保存エラー:', err)
		}
	}

	// 未保存データの状態を取得
	const unsavedStatus = getUnsavedDataStatus()

	return (
		<div
			className={`fixed bottom-24 right-4 z-40 hidden sm:flex sm:flex-row gap-2 sm:gap-3 items-end bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-3 ${className}`}
		>
			{/* 現在のセーブデータ名 */}
			{currentSaveName && (
				<div className="text-sm text-gray-700 font-medium truncate max-w-32">
					{currentSaveName}
				</div>
			)}

			{/* 現在のデータを保存ボタン */}
			<button
				type="button"
				onClick={handleSaveButtonClick}
				disabled={false}
				className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md transition-colors duration-200 cursor-pointer text-white bg-rose-400/80 hover:bg-rose-400 focus:outline-none"
				title="現在のデータを保存"
			>
				<svg
					className="w-4 h-4 mr-2"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
					/>
				</svg>
				保存
				{unsavedStatus.hasTemporaryEquipments && (
					<span className="ml-1 text-xs">(仮)</span>
				)}
				{unsavedStatus.hasEditSessions && (
					<span className="ml-1 text-xs">(編)</span>
				)}
			</button>

			{/* 保存確認モーダル */}
			<SaveConfirmModal
				isOpen={isSaveConfirmModalOpen}
				onClose={() => setIsSaveConfirmModalOpen(false)}
				onConfirm={handleSaveCurrentData}
			/>
		</div>
	)
})
