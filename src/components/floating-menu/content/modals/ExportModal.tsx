'use client'

import { useCallback, useEffect, useState } from 'react'
import type { ExportOptions, ExportType } from '@/utils/exportManager'
import {
	canExport,
	generateDefaultFilename,
	generateExportPreview,
	getExportTypeDescription,
	getExportTypeLabel,
} from '@/utils/exportManager'

interface ExportModalProps {
	isOpen: boolean
	onClose: () => void
	onExport: (options: ExportOptions) => void
}

export default function ExportModal({
	isOpen,
	onClose,
	onExport,
}: ExportModalProps) {
	const [exportType, setExportType] = useState<ExportType>('full')
	const [filename, setFilename] = useState('')
	const [isExporting, setIsExporting] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [preview, setPreview] = useState({
		saveCount: 0,
		customEquipmentCount: 0,
		customCrystalCount: 0,
		hasSettings: false,
	})

	// プレビュー更新
	const updatePreview = useCallback(async (type: ExportType) => {
		try {
			const newPreview = await generateExportPreview(type)
			setPreview(newPreview)
		} catch (err) {
			console.error('Preview generation error:', err)
		}
	}, [])

	// モーダルが開いたときの初期化
	useEffect(() => {
		if (isOpen) {
			setFilename(generateDefaultFilename())
			setError(null)
			setIsExporting(false)
			updatePreview('full')
		}
	}, [isOpen, updatePreview])

	// ESCキーでモーダルを閉じる
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				onClose()
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [isOpen, onClose])

	// エクスポート種別変更
	const handleExportTypeChange = (type: ExportType) => {
		setExportType(type)
		updatePreview(type)
		setError(null)
	}

	// エクスポート実行
	const handleExport = async () => {
		const trimmedFilename = filename.trim()

		// バリデーション
		if (!trimmedFilename) {
			setError('ファイル名を入力してください')
			return
		}

		if (trimmedFilename.length > 100) {
			setError('ファイル名は100文字以内で入力してください')
			return
		}

		// エクスポート可能性チェック
		if (!canExport(exportType)) {
			setError('選択した種別のデータが存在しません')
			return
		}

		try {
			setIsExporting(true)
			setError(null)

			const options: ExportOptions = {
				type: exportType,
				filename: trimmedFilename,
			}

			await onExport(options)
		} catch (err) {
			console.error('エクスポートエラー:', err)
			setError('エクスポートに失敗しました')
		} finally {
			setIsExporting(false)
		}
	}

	// エンターキーでエクスポート
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !isExporting) {
			handleExport()
		}
	}

	// モーダル背景クリックで閉じる
	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose()
		}
	}

	if (!isOpen) return null

	return (
		<div
			className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
			onClick={handleBackdropClick}
		>
			<div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-auto">
				{/* ヘッダー */}
				<div className="flex items-center justify-between p-6 border-b border-gray-200">
					<h3 className="text-lg font-medium text-gray-900">
						データエクスポート
					</h3>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
					>
						<svg
							className="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				{/* コンテンツ */}
				<div className="p-6 space-y-6">
					{/* エクスポート種別選択 */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-3">
							エクスポート対象を選択してください
						</label>
						<div className="space-y-3">
							{(
								[
									'full',
									'save-data',
									'custom-data',
									'current-save',
								] as ExportType[]
							).map((type) => (
								<label
									key={type}
									className={`
										flex items-start p-3 border rounded-md cursor-pointer transition-colors
										${
											exportType === type
												? 'border-blue-500 bg-blue-50'
												: 'border-gray-200 hover:border-gray-300'
										}
										${!canExport(type) ? 'opacity-50 cursor-not-allowed' : ''}
									`}
								>
									<input
										type="radio"
										name="exportType"
										value={type}
										checked={exportType === type}
										onChange={(e) =>
											handleExportTypeChange(e.target.value as ExportType)
										}
										disabled={!canExport(type)}
										className="mt-1 mr-3 text-blue-600 border-gray-300 focus:ring-blue-500"
									/>
									<div className="flex-1">
										<div className="font-medium text-gray-900">
											{getExportTypeLabel(type)}
										</div>
										<div className="text-sm text-gray-600 mt-1">
											{getExportTypeDescription(type)}
										</div>
										{!canExport(type) && (
											<div className="text-xs text-red-600 mt-1">
												対象データが存在しません
											</div>
										)}
									</div>
								</label>
							))}
						</div>
					</div>

					{/* プレビュー */}
					{canExport(exportType) && (
						<div className="bg-gray-50 rounded-md p-4">
							<h4 className="text-sm font-medium text-gray-900 mb-2">
								エクスポート内容プレビュー
							</h4>
							<div className="space-y-1 text-sm text-gray-600">
								{(exportType === 'full' ||
									exportType === 'save-data' ||
									exportType === 'current-save') && (
									<div>• セーブデータ: {preview.saveCount}個</div>
								)}
								{(exportType === 'full' || exportType === 'custom-data') && (
									<>
										<div>• カスタム装備: {preview.customEquipmentCount}個</div>
										<div>
											• カスタムクリスタル: {preview.customCrystalCount}個
										</div>
									</>
								)}
								{exportType === 'full' && preview.hasSettings && (
									<div>• 設定データ: 1個</div>
								)}
							</div>
						</div>
					)}

					{/* ファイル名 */}
					<div>
						<label
							htmlFor="filename"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							ファイル名
						</label>
						<div className="flex">
							<input
								id="filename"
								type="text"
								value={filename}
								onChange={(e) => setFilename(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder="toram-calc-backup-YYYY-MM-DD-HHmmss"
								className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								disabled={isExporting}
							/>
							<span className="inline-flex items-center px-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm">
								.json
							</span>
						</div>
						<p className="mt-1 text-xs text-gray-500">
							バックアップファイルとして保存されます
						</p>
					</div>

					{error && (
						<div className="p-3 bg-red-50 border border-red-200 rounded-md">
							<div className="flex">
								<div className="flex-shrink-0">
									<svg
										className="h-5 w-5 text-red-400"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<div className="ml-3">
									<p className="text-sm text-red-800">{error}</p>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* フッター */}
				<div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
					<button
						onClick={onClose}
						disabled={isExporting}
						className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						キャンセル
					</button>
					<button
						onClick={handleExport}
						disabled={isExporting || !filename.trim() || !canExport(exportType)}
						className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
					>
						{isExporting && (
							<svg
								className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								/>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								/>
							</svg>
						)}
						{isExporting ? 'エクスポート中...' : 'エクスポート'}
					</button>
				</div>
			</div>
		</div>
	)
}
