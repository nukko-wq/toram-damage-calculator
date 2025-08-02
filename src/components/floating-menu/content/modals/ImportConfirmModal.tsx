'use client'

import { useEffect, useState } from 'react'
import type {
	ImportOptions,
	ImportValidationResult,
} from '@/utils/importManager'

interface ImportConfirmModalProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: (options: ImportOptions) => void
	validationResult: ImportValidationResult | null
}

export default function ImportConfirmModal({
	isOpen,
	onClose,
	onConfirm,
	validationResult,
}: ImportConfirmModalProps) {
	const [createBackup, setCreateBackup] = useState(true)
	const [mergeMode, setMergeMode] = useState<'replace' | 'merge' | 'skip'>(
		'merge',
	)
	const [isImporting, setIsImporting] = useState(false)

	// モーダルが開いたときの初期化
	useEffect(() => {
		if (isOpen) {
			setCreateBackup(true)
			setMergeMode('merge')
			setIsImporting(false)
		}
	}, [isOpen])

	// ESCキーでモーダルを閉じる
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen && !isImporting) {
				onClose()
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [isOpen, isImporting, onClose])

	// インポート実行
	const handleConfirm = async () => {
		if (!validationResult?.isValid) return

		const options: ImportOptions = {
			createBackup,
			mergeMode,
		}

		try {
			setIsImporting(true)
			await onConfirm(options)
		} finally {
			setIsImporting(false)
		}
	}

	// モーダル背景クリックで閉じる
	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget && !isImporting) {
			onClose()
		}
	}

	if (!isOpen || !validationResult) return null

	const hasConflicts =
		validationResult.conflicts &&
		Object.values(validationResult.conflicts).some(
			(arr: string[]) => arr.length > 0,
		)

	return (
		<div
			className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
			onClick={handleBackdropClick}
		>
			<div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-auto">
				{/* ヘッダー */}
				<div className="flex items-center justify-between p-6 border-b border-gray-200">
					<h3 className="text-lg font-medium text-gray-900">インポート確認</h3>
					{!isImporting && (
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
					)}
				</div>

				{/* コンテンツ */}
				<div className="p-6 space-y-6">
					{/* インポート内容サマリー */}
					<div>
						<h4 className="text-sm font-medium text-gray-900 mb-3">
							以下のデータがインポートされます：
						</h4>
						<div className="bg-gray-50 rounded-md p-4 space-y-2">
							{validationResult.data?.saveData && (
								<div className="flex items-center text-sm text-gray-700">
									<svg
										className="w-4 h-4 mr-2 text-green-500"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clipRule="evenodd"
										/>
									</svg>
									セーブデータ:{' '}
									{validationResult.data.saveData.saves?.length || 0}個
								</div>
							)}
							{validationResult.data?.customData?.equipment && (
								<div className="flex items-center text-sm text-gray-700">
									<svg
										className="w-4 h-4 mr-2 text-green-500"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clipRule="evenodd"
										/>
									</svg>
									カスタム装備:{' '}
									{validationResult.data.customData.equipment.length}個
								</div>
							)}
							{validationResult.data?.customData?.crystals && (
								<div className="flex items-center text-sm text-gray-700">
									<svg
										className="w-4 h-4 mr-2 text-green-500"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clipRule="evenodd"
										/>
									</svg>
									カスタムクリスタル:{' '}
									{validationResult.data.customData.crystals.length}個
								</div>
							)}
							{validationResult.data?.settings && (
								<div className="flex items-center text-sm text-gray-700">
									<svg
										className="w-4 h-4 mr-2 text-green-500"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clipRule="evenodd"
										/>
									</svg>
									設定データ: 1個
								</div>
							)}
						</div>
					</div>

					{/* 競合警告 */}
					{hasConflicts && (
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
									<h4 className="text-sm font-medium text-yellow-800 mb-2">
										競合するデータ：
									</h4>
									<div className="text-sm text-yellow-700 space-y-1">
										{(validationResult.conflicts?.saveData?.length || 0) >
											0 && (
											<div>
												<strong>セーブデータ:</strong>{' '}
												{validationResult.conflicts?.saveData?.join(', ')}
											</div>
										)}
										{(validationResult.conflicts?.equipment?.length || 0) >
											0 && (
											<div>
												<strong>カスタム装備:</strong>{' '}
												{validationResult.conflicts?.equipment?.join(', ')}
											</div>
										)}
										{(validationResult.conflicts?.crystals?.length || 0) >
											0 && (
											<div>
												<strong>カスタムクリスタル:</strong>{' '}
												{validationResult.conflicts?.crystals?.join(', ')}
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					)}

					{/* インポートオプション */}
					<div className="space-y-4">
						<h4 className="text-sm font-medium text-gray-900">
							インポートオプション
						</h4>

						{/* バックアップ作成 */}
						<div className="flex items-start">
							<div className="flex items-center h-5">
								<input
									id="create-backup"
									type="checkbox"
									checked={createBackup}
									onChange={(e) => setCreateBackup(e.target.checked)}
									disabled={isImporting}
									className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
								/>
							</div>
							<div className="ml-3">
								<label
									htmlFor="create-backup"
									className="text-sm font-medium text-gray-700"
								>
									既存データをバックアップしてからインポートする
								</label>
								<p className="text-xs text-gray-500 mt-1">
									推奨:
									インポート前に現在のデータをエクスポートしてバックアップを作成します
								</p>
							</div>
						</div>

						{/* 競合解決モード */}
						{hasConflicts && (
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									競合するデータの処理方法
								</label>
								<div className="space-y-2">
									<label className="flex items-center">
										<input
											type="radio"
											name="mergeMode"
											value="merge"
											checked={mergeMode === 'merge'}
											onChange={(e) =>
												setMergeMode(e.target.value as 'merge' | 'replace')
											}
											disabled={isImporting}
											className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
										/>
										<span className="ml-2 text-sm text-gray-700">
											<strong>名前を変更してインポート</strong> -
											競合するデータは「(インポート)」を付けて保存
										</span>
									</label>
									<label className="flex items-center">
										<input
											type="radio"
											name="mergeMode"
											value="replace"
											checked={mergeMode === 'replace'}
											onChange={(e) =>
												setMergeMode(e.target.value as 'merge' | 'replace')
											}
											disabled={isImporting}
											className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
										/>
										<span className="ml-2 text-sm text-gray-700">
											<strong>上書きしてインポート</strong> -
											既存のデータを置き換える
										</span>
									</label>
									<label className="flex items-center">
										<input
											type="radio"
											name="mergeMode"
											value="skip"
											checked={mergeMode === 'skip'}
											onChange={(e) =>
												setMergeMode(e.target.value as 'merge' | 'replace')
											}
											disabled={isImporting}
											className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
										/>
										<span className="ml-2 text-sm text-gray-700">
											<strong>スキップ</strong> -
											競合するデータはインポートしない
										</span>
									</label>
								</div>
							</div>
						)}
					</div>

					{/* 警告メッセージ */}
					{validationResult.warnings &&
						validationResult.warnings.length > 0 && (
							<div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
								<h5 className="text-sm font-medium text-yellow-800 mb-1">
									警告:
								</h5>
								<ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
									{validationResult.warnings.map((warning: string) => (
										<li key={warning}>{warning}</li>
									))}
								</ul>
							</div>
						)}

					{/* 最終確認 */}
					<div className="bg-red-50 border border-red-200 rounded-md p-4">
						<div className="flex">
							<div className="flex-shrink-0">
								<svg
									className="h-5 w-5 text-red-400"
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
								<p className="text-sm text-red-800">
									<strong>重要:</strong>{' '}
									この操作により、現在のデータが変更される可能性があります。
									{mergeMode === 'replace' && ' 既存のデータが上書きされます。'}
									実行前に必要なデータのバックアップを確認してください。
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* フッター */}
				<div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
					<button
						onClick={onClose}
						disabled={isImporting}
						className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						キャンセル
					</button>
					<button
						onClick={handleConfirm}
						disabled={isImporting}
						className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
					>
						{isImporting && (
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
						{isImporting ? 'インポート中...' : 'インポート実行'}
					</button>
				</div>
			</div>
		</div>
	)
}
