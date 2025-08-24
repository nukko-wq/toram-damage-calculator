'use client'

import { useMemo, useState } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { getUserCrystalById } from '@/utils/crystalDatabase'
import { getBasePropertyLabel } from '@/components/equipment/PropertyEditor'
import type { EquipmentProperties } from '@/types/calculator'

export default function CrystalDeleteConfirmation() {
	const {
		subsystem: { crystalCustom },
		confirmDeletion,
		cancelDeletion,
		clearDeleteSuccess,
		navigateToScreen,
	} = useUIStore()

	const [isDeleting, setIsDeleting] = useState(false)

	const crystalId = crystalCustom.deleteFlow.selectedCrystalId
	const deleteSuccess = crystalCustom.deleteFlow.deleteSuccess

	// 削除対象のクリスタル情報を取得
	const crystal = useMemo(() => {
		if (!crystalId) return null
		return getUserCrystalById(crystalId)
	}, [crystalId])

	// 有効なプロパティ（0以外の値）を取得
	const activeProperties = useMemo(() => {
		if (!crystal) return []
		
		return Object.entries(crystal.properties)
			.filter(([_, value]) => value !== 0 && value !== undefined && value !== null)
			.map(([key, value]) => ({
				property: key as keyof EquipmentProperties,
				value: value as number,
			}))
	}, [crystal])

	// プロパティ表示用フォーマット関数
	const formatPropertyDisplay = (
		property: keyof EquipmentProperties,
		value: number,
	): string => {
		const label = getBasePropertyLabel(property)
		const isPercentage = property.endsWith('_Rate')

		if (isPercentage) {
			return `${label}(%) :${value}`
		}
		return `${label} :${value}`
	}

	const getTypeLabel = (type: string) => {
		switch (type) {
			case 'weapon':
				return '武器クリスタル'
			case 'armor':
				return '防具クリスタル'
			case 'additional':
				return '追加クリスタル'
			case 'special':
				return '特殊クリスタル'
			case 'normal':
				return 'ノーマルクリスタル'
			default:
				return type
		}
	}

	// 作成日時のフォーマット
	const formattedCreatedAt = useMemo(() => {
		if (!crystal?.createdAt) return ''
		return new Date(crystal.createdAt).toLocaleString('ja-JP', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
		})
	}, [crystal?.createdAt])

	const handleConfirm = async () => {
		if (!crystalId) return

		setIsDeleting(true)
		try {
			await confirmDeletion(crystalId)
			// 成功時の処理はconfirmDeletion内で実行済み
		} catch (error) {
			console.error('Crystal deletion failed:', error)
			alert('削除に失敗しました。しばらく待ってから再試行してください。')
		} finally {
			setIsDeleting(false)
		}
	}

	const handleCancel = () => {
		cancelDeletion()
		navigateToScreen('main')
	}

	const handleBackToMain = () => {
		clearDeleteSuccess()
		navigateToScreen('main')
	}

	// 削除成功後の案内表示
	if (deleteSuccess?.isSuccess) {
		return (
			<div className="p-6">
				<div className="text-center">
					<div className="mb-6">
						<div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
							<span className="text-green-600 text-2xl">✓</span>
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">
							削除が完了しました
						</h3>
						<p className="text-green-600 font-medium">
							{deleteSuccess.message}
						</p>
					</div>
					
					<button
						type="button"
						onClick={handleBackToMain}
						className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
					>
						OK
					</button>
				</div>
			</div>
		)
	}

	// クリスタルが見つからない場合
	if (!crystal) {
		return (
			<div className="p-6">
				<div className="text-center">
					<p className="text-red-600 mb-4">削除対象のクリスタルが見つかりません</p>
					<button
						type="button"
						onClick={handleCancel}
						className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
					>
						戻る
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className="p-6">
			{/* ヘッダー情報 */}
			<div className="mb-4 text-center border-b border-gray-200 pb-4">
				<p className="text-sm text-gray-600">
					削除対象：
					<span className="font-medium text-gray-900">
						{getTypeLabel(crystal.type)}
					</span>
					　名称：
					<span className="font-medium text-gray-900">{crystal.name}</span>
				</p>
			</div>

			{/* 確認メッセージ */}
			<div className="mb-6 text-center">
				<p className="text-lg font-medium text-gray-900 mb-4">
					以下のクリスタルを削除してもよろしいですか？
				</p>
			</div>

			{/* クリスタル詳細情報 */}
			<div className="mb-6">
				<div className="bg-white border border-gray-200 rounded-lg p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
						クリスタル詳細情報
					</h3>

					{/* 基本情報 */}
					<div className="mb-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
							<div>
								<span className="font-medium text-gray-700">タイプ：</span>
								<span className="text-gray-900">{getTypeLabel(crystal.type)}</span>
							</div>
							<div>
								<span className="font-medium text-gray-700">名称：</span>
								<span className="text-gray-900">{crystal.name}</span>
							</div>
							<div>
								<span className="font-medium text-gray-700">作成日：</span>
								<span className="text-gray-900">{formattedCreatedAt}</span>
							</div>
							<div>
								<span className="font-medium text-gray-700">プロパティ数：</span>
								<span className="text-gray-900">{activeProperties.length}個</span>
							</div>
						</div>
					</div>

					{/* プロパティ一覧 */}
					<div className="mb-6">
						<div className="border-t border-gray-200 pt-4">
							<h4 className="text-md font-medium text-gray-800 mb-3 text-center">
								設定プロパティ
							</h4>
							{activeProperties.length > 0 ? (
								<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
									{activeProperties.slice(0, 15).map(({ property, value }) => (
										<div
											key={property}
											className="text-sm bg-gray-50 px-3 py-2 rounded border text-center"
										>
											{formatPropertyDisplay(property, value)}
										</div>
									))}
									{activeProperties.length > 15 && (
										<div className="text-sm text-gray-500 px-3 py-2 text-center">
											他 {activeProperties.length - 15} 個...
										</div>
									)}
								</div>
							) : (
								<p className="text-center text-gray-500">
									プロパティが設定されていません
								</p>
							)}
						</div>
					</div>

					{/* 警告メッセージ */}
					<div className="border-t border-gray-200 pt-4">
						<div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
							<div className="flex items-center justify-center mb-2">
								<span className="text-red-600 text-lg mr-2">⚠️</span>
								<span className="text-red-700 font-medium">
									この操作は元に戻すことができません
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* ボタン */}
			<div className="flex justify-center space-x-6">
				<button
					type="button"
					onClick={handleConfirm}
					disabled={isDeleting}
					className={`
						px-8 py-3 rounded-lg font-medium transition-colors
						${
							isDeleting
								? 'bg-gray-300 text-gray-500 cursor-not-allowed'
								: 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
						}
					`}
				>
					{isDeleting ? '削除中...' : '削除する'}
				</button>

				<button
					type="button"
					onClick={handleCancel}
					disabled={isDeleting}
					className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50"
				>
					キャンセル
				</button>
			</div>
		</div>
	)
}