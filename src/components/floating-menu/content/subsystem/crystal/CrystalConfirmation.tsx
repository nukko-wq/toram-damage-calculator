'use client'

import { useMemo } from 'react'
import { useUIStore } from '@/stores/uiStore'
import type { EquipmentProperties, UserCrystal } from '@/types/calculator'
import { saveUserCrystal, updateUserCrystal, getUserCrystalById } from '@/utils/crystalDatabase'

export default function CrystalConfirmation() {
	const {
		subsystem: {
			crystalCustom: { newRegistration, editMode, currentEditId },
		},
		navigateToScreen,
		goBack,
		closeFullScreenModal,
		resetCrystalForm,
	} = useUIStore()

	// 有効なプロパティ（0以外の値）を取得
	const activeProperties = useMemo(() => {
		return Object.entries(newRegistration.properties)
			.filter(
				([_, value]) => value !== 0 && value !== undefined && value !== null,
			)
			.map(([key, value]) => ({
				property: key as keyof EquipmentProperties,
				value: value as number,
			}))
			.sort((a, b) => Math.abs(b.value) - Math.abs(a.value)) // 値の大きい順
	}, [newRegistration.properties])

	// プロパティ表示用フォーマット関数
	const formatPropertyDisplay = (
		property: keyof EquipmentProperties,
		value: number,
	): string => {
		const labelMap: Record<string, string> = {
			ATK_Rate: 'ATK',
			MATK_Rate: 'MATK',
			HP_Rate: 'HP',
			MP_Rate: 'MP',
			STR_Rate: 'STR',
			INT_Rate: 'INT',
			VIT_Rate: 'VIT',
			AGI_Rate: 'AGI',
			DEX_Rate: 'DEX',
			Critical_Rate: 'クリティカル',
			AttackSpeed_Rate: '攻撃速度',
			PhysicalPenetration_Rate: '物理貫通',
			MagicalPenetration_Rate: '魔法貫通',
			ShortRangeDamage_Rate: '短距離威力',
			LongRangeDamage_Rate: '遠距離威力',
		}

		const label =
			labelMap[property] || property.replace(/_Rate$/, '').replace(/_/g, '')
		const isPercentage = property.endsWith('_Rate')

		if (isPercentage) {
			return `${label} +${value}%`
		}
		return `${label} +${value}`
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

	// バリデーション
	const validateData = () => {
		const errors: string[] = []

		if (!newRegistration.name.trim()) {
			errors.push('名称が入力されていません')
		}

		if (!newRegistration.selectedType) {
			errors.push('クリスタルタイプが選択されていません')
			return errors
		}

		if (activeProperties.length === 0) {
			errors.push('プロパティが設定されていません')
		}

		return errors
	}

	const handleConfirm = () => {
		const validationErrors = validateData()
		if (validationErrors.length > 0) {
			alert(`登録できません:\n${validationErrors.join('\n')}`)
			return
		}

		// この時点でselectedTypeがnullでないことが確定している
		if (!newRegistration.selectedType) {
			alert('クリスタルタイプが選択されていません')
			return
		}

		try {
			if (editMode === 'edit' && currentEditId) {
				// 編集モード：既存クリスタルを更新
				const updates = {
					name: newRegistration.name,
					type: newRegistration.selectedType,
					properties: newRegistration.properties,
				}

				// LocalStorageで更新（既存のupdateUserCrystal関数を使用）
				updateUserCrystal(currentEditId, updates)
			} else {
				// 新規作成モード
				const newCrystal: UserCrystal = {
					id: `custom_crystal_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
					name: newRegistration.name,
					type: newRegistration.selectedType,
					properties: newRegistration.properties,
					description: '',
					isCustom: true,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					isFavorite: false,
				}

				// LocalStorageに保存
				saveUserCrystal(newCrystal)
			}

			// 成功時の処理
			navigateToScreen('completion')

			// 少し遅延してから完了画面を閉じる
			setTimeout(() => {
				resetCrystalForm()
				closeFullScreenModal()
			}, 2000)
		} catch (error) {
			console.error('Crystal save error:', error)
			const actionText = editMode === 'edit' ? '更新' : '登録'
			alert(`${actionText}に失敗しました。もう一度お試しください。`)
		}
	}

	const handleDecline = () => {
		// プロパティ設定画面に戻る（データは保持）
		goBack()
	}

	const currentTime = new Date().toLocaleString('ja-JP')
	const buttonText = 'はい'

	return (
		<div className="p-6">
			{/* ヘッダー情報 */}
			<div className="mb-4 text-center border-b border-gray-200 pb-4">
				<p className="text-sm text-gray-600">
					選択タイプ：
					<span className="font-medium text-gray-900">
						{newRegistration.selectedType
							? getTypeLabel(newRegistration.selectedType)
							: '未選択'}
					</span>
					　名称：
					<span className="font-medium text-gray-900">
						{newRegistration.name || '未入力'}
					</span>
				</p>
			</div>

			{/* 確認メッセージ */}
			<div className="mb-6 text-center">
				<h3 className="text-lg font-semibold text-gray-900">
					以下の内容で{editMode === 'edit' ? '更新' : '登録'}しますか？
				</h3>
			</div>

			{/* 設定プロパティ表示 */}
			<div className="mb-6">
				<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
					<h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
						設定されたプロパティ
					</h4>

					{activeProperties.length > 0 ? (
						<>
							<div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
								{activeProperties.slice(0, 20).map(({ property, value }) => (
									<div
										key={property}
										className="text-sm bg-white px-3 py-2 rounded border text-center font-medium"
									>
										{formatPropertyDisplay(property, value)}
									</div>
								))}
							</div>

							{/* 統計情報 */}
							<div className="border-t border-gray-300 pt-3 text-center text-sm text-gray-600">
								<p>プロパティ数：{activeProperties.length}個</p>
								<p>作成日時：{currentTime}</p>
							</div>
						</>
					) : (
						<p className="text-center text-gray-500 py-8">
							プロパティが設定されていません
						</p>
					)}

					{activeProperties.length === 0 && (
						<div className="text-center">
							<p className="text-red-600 text-sm">
								※ 少なくとも1つのプロパティを設定してください
							</p>
						</div>
					)}
				</div>
			</div>

			{/* ナビゲーションボタン */}
			<div className="flex justify-center space-x-8">
				<button
					type="button"
					onClick={handleConfirm}
					disabled={activeProperties.length === 0}
					className={`
						px-8 py-3 rounded-lg font-medium transition-colors
						${
							activeProperties.length > 0
								? 'bg-green-600 hover:bg-green-700 text-white'
								: 'bg-gray-300 text-gray-500 cursor-not-allowed'
						}
					`}
				>
					{buttonText}
				</button>

				<button
					type="button"
					onClick={handleDecline}
					className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
				>
					いいえ
				</button>
			</div>
		</div>
	)
}
