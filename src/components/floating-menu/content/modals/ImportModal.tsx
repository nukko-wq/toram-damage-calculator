'use client'

import { useState, useEffect, useRef } from 'react'
import type { ImportValidationResult } from '@/utils/dataValidator'
import { readImportFile, canImport } from '@/utils/importManager'

interface ImportModalProps {
	isOpen: boolean
	onClose: () => void
	onImport: (validationResult: ImportValidationResult) => void
}

export default function ImportModal({
	isOpen,
	onClose,
	onImport,
}: ImportModalProps) {
	const [dragActive, setDragActive] = useState(false)
	const [isValidating, setIsValidating] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [validationResult, setValidationResult] =
		useState<ImportValidationResult | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	// モーダルが開いたときの初期化
	useEffect(() => {
		if (isOpen) {
			setError(null)
			setIsValidating(false)
			setValidationResult(null)
			setDragActive(false)
		}
	}, [isOpen])

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

	// ファイル選択処理
	const handleFileSelect = async (files: FileList | null) => {
		if (!files || files.length === 0) return

		const file = files[0]
		setError(null)
		setIsValidating(true)
		setValidationResult(null)

		try {
			const result = await readImportFile(file)
			setValidationResult(result)

			if (!result.isValid) {
				setError(result.errors?.[0] || 'ファイルの検証に失敗しました')
			}
		} catch (err) {
			console.error('ファイル読み込みエラー:', err)
			setError('ファイルの読み込みに失敗しました')
		} finally {
			setIsValidating(false)
		}
	}

	// ドラッグ&ドロップ処理
	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
	}

	const handleDragEnter = (e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setDragActive(true)
	}

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		// 親要素への移動の場合はアクティブ状態を維持
		if (!e.currentTarget.contains(e.relatedTarget as Node)) {
			setDragActive(false)
		}
	}

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setDragActive(false)
		handleFileSelect(e.dataTransfer.files)
	}

	// インポート実行
	const handleImport = () => {
		if (validationResult?.isValid) {
			onImport(validationResult)
		}
	}

	// ファイル選択ボタンクリック
	const handleFileButtonClick = () => {
		fileInputRef.current?.click()
	}

	// モーダル背景クリックで閉じる
	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose()
		}
	}

	// インポート可能性チェック
	const importAvailable = canImport()

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
						データインポート
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
					{!importAvailable && (
						<div className="p-4 bg-red-50 border border-red-200 rounded-md">
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
									<p className="text-sm text-red-800">
										インポート機能が利用できません。ブラウザの設定を確認してください。
									</p>
								</div>
							</div>
						</div>
					)}

					{/* ファイル選択エリア */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-3">
							バックアップファイルを選択してください
						</label>

						<div
							className={`
								border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
								${
									dragActive
										? 'border-blue-500 bg-blue-50'
										: 'border-gray-300 hover:border-gray-400'
								}
								${!importAvailable ? 'opacity-50 cursor-not-allowed' : ''}
							`}
							onDragOver={handleDragOver}
							onDragEnter={handleDragEnter}
							onDragLeave={handleDragLeave}
							onDrop={handleDrop}
							onClick={importAvailable ? handleFileButtonClick : undefined}
						>
							<input
								ref={fileInputRef}
								type="file"
								accept=".json"
								className="hidden"
								onChange={(e) => handleFileSelect(e.target.files)}
								disabled={!importAvailable}
							/>

							{isValidating ? (
								<div className="space-y-2">
									<svg
										className="mx-auto h-12 w-12 text-blue-500 animate-spin"
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
									<p className="text-sm text-gray-600">ファイルを検証中...</p>
								</div>
							) : (
								<div className="space-y-2">
									<svg
										className="mx-auto h-12 w-12 text-gray-400"
										stroke="currentColor"
										fill="none"
										viewBox="0 0 48 48"
									>
										<path
											d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
											strokeWidth={2}
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
									<div className="text-gray-600">
										<p className="text-base font-medium">
											ファイルを選択またはここにドラッグ&ドロップ
										</p>
										<p className="text-sm">JSONファイルのみ対応</p>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* 検証結果表示 */}
					{validationResult && (
						<div className="space-y-4">
							{/* 成功/失敗状態 */}
							<div
								className={`p-4 rounded-md ${
									validationResult.isValid
										? 'bg-green-50 border border-green-200'
										: 'bg-red-50 border border-red-200'
								}`}
							>
								<div className="flex">
									<div className="flex-shrink-0">
										{validationResult.isValid ? (
											<svg
												className="h-5 w-5 text-green-400"
												viewBox="0 0 20 20"
												fill="currentColor"
											>
												<path
													fillRule="evenodd"
													d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
													clipRule="evenodd"
												/>
											</svg>
										) : (
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
										)}
									</div>
									<div className="ml-3">
										<p
											className={`text-sm ${
												validationResult.isValid
													? 'text-green-800'
													: 'text-red-800'
											}`}
										>
											{validationResult.isValid
												? 'ファイルの検証が完了しました'
												: 'ファイルの検証に失敗しました'}
										</p>
									</div>
								</div>
							</div>

							{/* インポート内容プレビュー */}
							{validationResult.isValid && validationResult.data && (
								<div className="bg-gray-50 rounded-md p-4">
									<h4 className="text-sm font-medium text-gray-900 mb-2">
										インポート内容
									</h4>
									<div className="space-y-1 text-sm text-gray-600">
										{validationResult.data.saveData && (
											<div>
												• セーブデータ:{' '}
												{validationResult.data.saveData.saves?.length || 0}個
											</div>
										)}
										{validationResult.data.customData?.equipment && (
											<div>
												• カスタム装備:{' '}
												{validationResult.data.customData.equipment.length}個
											</div>
										)}
										{validationResult.data.customData?.crystals && (
											<div>
												• カスタムクリスタル:{' '}
												{validationResult.data.customData.crystals.length}個
											</div>
										)}
										{validationResult.data.settings && (
											<div>• 設定データ: 1個</div>
										)}
										<div className="text-xs text-gray-500 mt-2">
											エクスポート日時:{' '}
											{validationResult.data.exportDate
												? new Date(
														validationResult.data.exportDate,
													).toLocaleString('ja-JP')
												: '不明'}
										</div>
									</div>
								</div>
							)}

							{/* 競合警告 */}
							{validationResult.conflicts &&
								Object.values(validationResult.conflicts).some(
									(arr) => arr.length > 0,
								) && (
									<div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
										<div className="flex">
											<div className="flex-shrink-0">
												<svg
													className="h-5 w-5 text-yellow-400"
													viewBox="0 0 20 20"
													fill="currentColor"
												>
													<path
														fillRule="evenodd"
														d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
														clipRule="evenodd"
													/>
												</svg>
											</div>
											<div className="ml-3">
												<h4 className="text-sm font-medium text-yellow-800">
													競合するデータがあります
												</h4>
												<div className="mt-2 text-sm text-yellow-700">
													{validationResult.conflicts.saveData.length > 0 && (
														<div>
															• セーブデータ:{' '}
															{validationResult.conflicts.saveData.join(', ')}
														</div>
													)}
													{validationResult.conflicts.equipment.length > 0 && (
														<div>
															• カスタム装備:{' '}
															{validationResult.conflicts.equipment.join(', ')}
														</div>
													)}
													{validationResult.conflicts.crystals.length > 0 && (
														<div>
															• カスタムクリスタル:{' '}
															{validationResult.conflicts.crystals.join(', ')}
														</div>
													)}
													<div className="mt-1 text-xs">
														競合するデータは自動的に名前が変更されてインポートされます
													</div>
												</div>
											</div>
										</div>
									</div>
								)}

							{/* 警告とエラー */}
							{validationResult.warnings &&
								validationResult.warnings.length > 0 && (
									<div className="space-y-1">
										{validationResult.warnings.map((warning, index) => (
											<div key={index} className="text-sm text-yellow-600">
												⚠️ {warning}
											</div>
										))}
									</div>
								)}

							{validationResult.errors &&
								validationResult.errors.length > 0 && (
									<div className="space-y-1">
										{validationResult.errors.map((error, index) => (
											<div key={index} className="text-sm text-red-600">
												❌ {error}
											</div>
										))}
									</div>
								)}
						</div>
					)}

					{/* エラー表示 */}
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

					{/* 注意事項 */}
					<div className="bg-blue-50 rounded-md p-4">
						<div className="flex">
							<div className="flex-shrink-0">
								<svg
									className="h-5 w-5 text-blue-400"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fillRule="evenodd"
										d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<div className="ml-3">
								<p className="text-sm text-blue-800">
									<strong>注意:</strong>{' '}
									インポートにより現在のデータが上書きされる可能性があります。
									重要なデータは事前にエクスポートしてバックアップを取得することを推奨します。
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* フッター */}
				<div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
					<button
						onClick={onClose}
						disabled={isValidating}
						className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						キャンセル
					</button>
					<button
						onClick={handleImport}
						disabled={
							!validationResult?.isValid || isValidating || !importAvailable
						}
						className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						インポート
					</button>
				</div>
			</div>
		</div>
	)
}
