'use client'

import { useEffect, useState } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { getUserCrystalsByType } from '@/utils/crystalDatabase'

export default function CrystalNameInput() {
	const {
		subsystem: {
			crystalCustom: { newRegistration },
		},
		setCrystalName,
		navigateToScreen,
		goBack,
		closeFullScreenModal,
		setValidationErrors,
	} = useUIStore()

	const [name, setName] = useState(newRegistration.name)
	const [localErrors, setLocalErrors] = useState<Record<string, string>>({})

	useEffect(() => {
		// ストアと同期
		setName(newRegistration.name)
	}, [newRegistration.name])

	const validateName = (nameValue: string): Record<string, string> => {
		const errors: Record<string, string> = {}

		// 必須チェック
		if (!nameValue.trim()) {
			errors.name = '名称は必須です'
			return errors
		}

		// 文字数チェック
		if (nameValue.length > 50) {
			errors.name = '名称は50文字以内で入力してください'
			return errors
		}

		// 重複チェック
		if (newRegistration.selectedType) {
			const existingCrystals = getUserCrystalsByType(
				newRegistration.selectedType,
			)
			if (existingCrystals.some((crystal) => crystal.name === nameValue)) {
				errors.name = '同じタイプ内に同名のクリスタルが既に存在します'
				return errors
			}
		}

		return errors
	}

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newName = e.target.value
		setName(newName)
		setCrystalName(newName)

		// リアルタイムバリデーション
		const errors = validateName(newName)
		setLocalErrors(errors)
		setValidationErrors(errors)
	}

	const handleNext = () => {
		const errors = validateName(name)
		setLocalErrors(errors)
		setValidationErrors(errors)

		if (Object.keys(errors).length === 0) {
			navigateToScreen('property_input')
		}
	}

	const handleBack = () => {
		// 名称はクリアしない（ユーザビリティ考慮で設計変更）
		goBack()
	}

	const handleCancel = () => {
		closeFullScreenModal()
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
			<div className="mb-4 text-center">
				<p className="text-sm text-gray-600">
					選択したタイプ：
					<span className="font-medium text-gray-900">
						{newRegistration.selectedType
							? getTypeLabel(newRegistration.selectedType)
							: '未選択'}
					</span>
				</p>
			</div>

			<div className="max-w-md mx-auto mb-8">
				<div className="bg-white border border-gray-200 rounded-lg p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
						クリスタル名称を入力
					</h3>

					<div className="mb-4">
						<label
							htmlFor="crystalName"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							名称：
						</label>
						<input
							id="crystalName"
							type="text"
							value={name}
							onChange={handleNameChange}
							placeholder="クリスタル名を入力してください"
							className={`
								w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
								${
									localErrors.name
										? 'border-red-300 focus:ring-red-500'
										: 'border-gray-300 focus:ring-blue-500'
								}
							`}
							maxLength={50}
						/>
						{localErrors.name && (
							<p className="mt-1 text-sm text-red-600">{localErrors.name}</p>
						)}
					</div>

					<p className="text-xs text-gray-500 text-center">
						※ 1-50文字で入力してください
					</p>
				</div>
			</div>

			<div className="flex justify-between items-center max-w-md mx-auto">
				<button
					type="button"
					onClick={handleNext}
					disabled={Object.keys(localErrors).length > 0 || !name.trim()}
					className={`
						px-6 py-2 rounded-lg font-medium transition-colors
						${
							Object.keys(localErrors).length === 0 && name.trim()
								? 'bg-blue-600 hover:bg-blue-700 text-white'
								: 'bg-gray-300 text-gray-500 cursor-not-allowed'
						}
					`}
				>
					次に進む
				</button>

				<button
					type="button"
					onClick={handleBack}
					className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
				>
					戻る
				</button>

				<button
					type="button"
					onClick={handleCancel}
					className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
				>
					キャンセル
				</button>
			</div>
		</div>
	)
}
