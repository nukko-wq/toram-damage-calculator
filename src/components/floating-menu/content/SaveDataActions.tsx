'use client'

import { useState } from 'react'
import { useCalculatorStore } from '@/stores'
import { type ExportOptions, exportData } from '@/utils/exportManager'
import {
	type ImportOptions,
	type ImportValidationResult,
	importData,
} from '@/utils/importManager'
import ExportModal from './modals/ExportModal'
import ImportConfirmModal from './modals/ImportConfirmModal'
import ImportModal from './modals/ImportModal'
import SaveConfirmModal from './modals/SaveConfirmModal'

interface SaveDataActionsProps {
	onCreateNew: () => void
}

export default function SaveDataActions({ onCreateNew }: SaveDataActionsProps) {
	const { saveCurrentData, getUnsavedDataStatus } = useCalculatorStore()

	// モーダル状態管理
	const [isSaveConfirmModalOpen, setIsSaveConfirmModalOpen] = useState(false)
	const [isExportModalOpen, setIsExportModalOpen] = useState(false)
	const [isImportModalOpen, setIsImportModalOpen] = useState(false)
	const [isImportConfirmModalOpen, setIsImportConfirmModalOpen] =
		useState(false)
	const [importValidationResult, setImportValidationResult] =
		useState<ImportValidationResult | null>(null)

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

	// エクスポート処理
	const handleExport = async (options: ExportOptions) => {
		try {
			const result = await exportData(options)
			if (result.success) {
				setIsExportModalOpen(false)
				// 成功通知（将来的にトースト通知などで表示）
				console.log('エクスポート完了:', result.filename)
			} else {
				console.error('エクスポートエラー:', result.error)
			}
		} catch (err) {
			console.error('エクスポート処理エラー:', err)
		}
	}

	// インポート開始処理
	const handleImportStart = (validationResult: ImportValidationResult) => {
		setImportValidationResult(validationResult)
		setIsImportModalOpen(false)
		setIsImportConfirmModalOpen(true)
	}

	// インポート実行処理
	const handleImportConfirm = async (options: ImportOptions) => {
		if (!importValidationResult?.data) return

		try {
			const result = await importData(importValidationResult.data, options)

			if (result.success) {
				setIsImportConfirmModalOpen(false)
				setImportValidationResult(null)
				// 成功通知
				console.log('インポート完了:', result)

				// ページリロードでデータを反映（将来的にはストア更新で対応）
				if (
					result.importedCounts.saveData > 0 ||
					result.importedCounts.customEquipment > 0 ||
					result.importedCounts.customCrystals > 0
				) {
					setTimeout(() => {
						window.location.reload()
					}, 1000)
				}
			} else {
				console.error('インポートエラー:', result.errors)
			}
		} catch (err) {
			console.error('インポート処理エラー:', err)
		}
	}

	// インポートキャンセル処理
	const handleImportCancel = () => {
		setIsImportModalOpen(false)
		setIsImportConfirmModalOpen(false)
		setImportValidationResult(null)
	}

	// 未保存データの状態を取得
	const unsavedStatus = getUnsavedDataStatus()

	return (
		<>
			<div className="p-2 sm:p-4 border-b border-gray-200">
				<div className="space-y-3">
					{/* 上段: メインアクション */}
					<div className="flex gap-2">
						{/* 現在のデータを保存ボタン */}
						<button
							type="button"
							onClick={handleSaveButtonClick}
							disabled={false}
							className={`
								flex-1 inline-flex items-center justify-center px-3 py-2 
								border border-transparent text-sm font-medium rounded-md 
								transition-colors duration-200
								text-white bg-rose-400/80 hover:bg-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer
							`}
							title="データを保存"
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
							<span className="truncate text-xs sm:text-sm">
								データを保存
								{unsavedStatus.hasTemporaryEquipments && (
									<span className="ml-1 text-xs">(仮)</span>
								)}
								{unsavedStatus.hasEditSessions && (
									<span className="ml-1 text-xs">(編)</span>
								)}
							</span>
						</button>

						{/* 新規作成ボタン */}
						<button
							type="button"
							onClick={onCreateNew}
							className="
								cursor-pointer
								flex-1 inline-flex items-center justify-center px-3 py-2 
								border border-transparent text-sm font-medium rounded-md 
								text-white bg-rose-400/80 hover:bg-rose-400 
								focus:outline-none focus:ring-2 focus:ring-blue-500 
								transition-colors duration-200
							"
							title="新しいセーブデータを作成"
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
									d="M12 4v16m8-8H4"
								/>
							</svg>
							<span className="truncate text-xs sm:text-sm">新規作成</span>
						</button>
					</div>

					{/* 下段: エクスポート・インポートボタン */}
					<div className="flex gap-2">
						{/* エクスポートボタン */}
						<button
							type="button"
							onClick={() => setIsExportModalOpen(true)}
							className="
								cursor-pointer
								flex-1 inline-flex items-center justify-center px-3 py-2 
								border border-gray-300 text-sm font-medium rounded-md 
								text-gray-700 bg-white hover:bg-gray-50 
								focus:outline-none focus:ring-2 focus:ring-blue-500 
								transition-colors duration-200
							"
							title="データをエクスポート"
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
									d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
							<span className="truncate text-xs sm:text-sm">エクスポート</span>
						</button>

						{/* インポートボタン */}
						<button
							type="button"
							onClick={() => setIsImportModalOpen(true)}
							className="
								cursor-pointer
								flex-1 inline-flex items-center justify-center px-3 py-2 
								border border-gray-300 text-sm font-medium rounded-md 
								text-gray-700 bg-white hover:bg-gray-50 
								focus:outline-none focus:ring-2 focus:ring-blue-500 
								transition-colors duration-200
							"
							title="データをインポート"
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
									d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
								/>
							</svg>
							<span className="truncate text-xs sm:text-sm">インポート</span>
						</button>
					</div>
				</div>
			</div>

			{/* エクスポートモーダル */}
			<ExportModal
				isOpen={isExportModalOpen}
				onClose={() => setIsExportModalOpen(false)}
				onExport={handleExport}
			/>

			{/* インポートモーダル */}
			<ImportModal
				isOpen={isImportModalOpen}
				onClose={handleImportCancel}
				onImport={handleImportStart}
			/>

			{/* インポート確認モーダル */}
			<ImportConfirmModal
				isOpen={isImportConfirmModalOpen}
				onClose={handleImportCancel}
				onConfirm={handleImportConfirm}
				validationResult={importValidationResult}
			/>

			{/* 保存確認モーダル */}
			<SaveConfirmModal
				isOpen={isSaveConfirmModalOpen}
				onClose={() => setIsSaveConfirmModalOpen(false)}
				onConfirm={handleSaveCurrentData}
			/>
		</>
	)
}
