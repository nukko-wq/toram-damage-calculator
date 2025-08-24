'use client'

import { useState } from 'react'
import { useUIStore } from '@/stores/uiStore'
import type { CrystalType } from '@/types/calculator'

interface CrystalTypeOption {
	type: CrystalType
	label: string
	isEnabled: boolean
}

export default function CrystalTypeSelection() {
	const {
		subsystem: {
			crystalCustom: { newRegistration },
		},
		selectCrystalType,
		navigateToScreen,
		goBack,
		closeFullScreenModal,
	} = useUIStore()

	const [selectedType, setSelectedType] = useState<CrystalType | null>(
		newRegistration.selectedType,
	)

	const crystalTypeOptions: CrystalTypeOption[] = [
		{
			type: 'weapon',
			label: '武器クリスタル',
			isEnabled: true,
		},
		{
			type: 'armor',
			label: '防具クリスタル',
			isEnabled: true,
		},
		{
			type: 'additional',
			label: '追加クリスタル',
			isEnabled: true,
		},
		{
			type: 'special',
			label: '特殊クリスタル',
			isEnabled: true,
		},
		{
			type: 'normal',
			label: 'ノーマルクリスタル',
			isEnabled: true,
		},
	]

	const handleTypeSelect = (type: CrystalType) => {
		setSelectedType(type)
		selectCrystalType(type)
	}

	const handleNext = () => {
		if (selectedType) {
			navigateToScreen('name_input')
		}
	}

	const handleBack = () => {
		setSelectedType(null)
		goBack()
	}

	const handleCancel = () => {
		closeFullScreenModal()
	}

	return (
		<div className="p-6">
			<div className="mb-6 text-center">
				<h3 className="text-lg font-semibold text-gray-900 mb-2">
					何を作成しますか？
				</h3>
			</div>

			<div className="max-w-md mx-auto mb-8">
				<div className="space-y-3">
					{crystalTypeOptions.map((option) => (
						<label
							key={option.type}
							className={`
								block p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
								${
									selectedType === option.type
										? 'border-blue-500 bg-blue-50'
										: 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
								}
								${!option.isEnabled && 'opacity-50 cursor-not-allowed'}
							`}
						>
							<div className="flex items-center">
								<input
									type="radio"
									name="crystalType"
									value={option.type}
									checked={selectedType === option.type}
									onChange={() => handleTypeSelect(option.type)}
									disabled={!option.isEnabled}
									className="mr-3 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
								/>
								<span className="text-gray-900 font-medium">
									{option.label}
								</span>
							</div>
						</label>
					))}
				</div>

				<div className="mt-6 text-center text-sm text-gray-500">
					<p>※ 装備品カスタムは検討中</p>
				</div>
			</div>

			<div className="flex justify-between items-center max-w-md mx-auto">
				<button
					type="button"
					onClick={handleNext}
					disabled={!selectedType}
					className={`
						px-6 py-2 rounded-lg font-medium transition-colors
						${
							selectedType
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
