'use client'

import { useMemo } from 'react'
import PropertyEditor from '@/components/equipment/PropertyEditor'
import { useUIStore } from '@/stores/uiStore'
import type { Equipment, EquipmentProperties } from '@/types/calculator'

export default function CrystalPropertyInput() {
	const {
		subsystem: {
			crystalCustom: { newRegistration },
		},
		updateCrystalFormData,
		navigateToScreen,
		goBack,
		resetCrystalForm,
	} = useUIStore()

	// PropertyEditorに渡すための仮想アイテム作成
	const virtualCrystalItem = useMemo((): Equipment => {
		return {
			id: 'temp-crystal',
			name: newRegistration.name || 'カスタムクリスタル',
			properties: newRegistration.properties,
			isCustom: true,
			isPreset: false,
			isFavorite: false,
			isModified: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}
	}, [newRegistration.name, newRegistration.properties])

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
	}, [newRegistration.properties])

	// プロパティ表示用フォーマット関数
	const formatPropertyDisplay = (
		property: keyof EquipmentProperties,
		value: number,
	): string => {
		// PropertyEditorのgetBasePropertyLabel関数の簡易版
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
		}

		const label =
			labelMap[property] || property.replace(/_Rate$/, '').replace(/_/g, '')
		const isPercentage = property.endsWith('_Rate')

		if (isPercentage) {
			return `${label} +${value}%`
		}
		return `${label} +${value}`
	}

	const handlePropertyChange = (
		property: keyof EquipmentProperties,
		value: string,
	) => {
		const numValue = parseInt(value) || 0
		updateCrystalFormData({ [property]: numValue })
	}

	const handleNext = () => {
		// プロパティ設定のバリデーション（少なくとも1つのプロパティが必要）
		if (activeProperties.length === 0) {
			alert('少なくとも1つのプロパティを設定してください')
			return
		}
		navigateToScreen('confirmation')
	}

	const handleBack = () => {
		// プロパティ設定値は保持
		goBack()
	}

	const handleCancel = () => {
		// フォームをリセットしてメイン画面に戻る
		resetCrystalForm()
		navigateToScreen('main')
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

			{/* 現在の設定値エリア */}
			<div className="mb-6">
				<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
					<h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">
						現在の設定値
					</h3>

					{activeProperties.length > 0 ? (
						<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
							{activeProperties.slice(0, 12).map(({ property, value }) => (
								<div
									key={property}
									className="text-sm bg-white px-3 py-2 rounded border text-center"
								>
									{formatPropertyDisplay(property, value)}
								</div>
							))}
							{activeProperties.length > 12 && (
								<div className="text-sm text-gray-500 px-3 py-2 text-center">
									他 {activeProperties.length - 12} 個...
								</div>
							)}
						</div>
					) : (
						<p className="text-center text-gray-500">
							※ 有効なプロパティのみ表示
						</p>
					)}
				</div>
			</div>

			{/* プロパティエディタ */}
			<div className="mb-6">
				<div className="bg-white border border-gray-200 rounded-lg p-4">
					<h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
						プロパティエディタ
					</h3>

					<PropertyEditor
						item={virtualCrystalItem}
						slotKey="additional"
						onPropertyChange={handlePropertyChange}
						onMessage={() => {}} // 不要だが必須プロパティ
						onUpdate={() => {}} // 不要だが必須プロパティ
						disableCrystalSelector={true} // クリスタ連携機能を無効化
					/>
				</div>
			</div>

			{/* ナビゲーションボタン */}
			<div className="flex justify-between items-center max-w-md mx-auto">
				<button
					type="button"
					onClick={handleNext}
					className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
				>
					登録
				</button>

				<button
					type="button"
					onClick={handleBack}
					className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors cursor-pointer"
				>
					戻る
				</button>

				<button
					type="button"
					onClick={handleCancel}
					className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors cursor-pointer"
				>
					キャンセル
				</button>
			</div>
		</div>
	)
}
