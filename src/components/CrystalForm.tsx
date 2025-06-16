'use client'

import { useEffect, useState } from 'react'
import type { CrystalSlots, CrystalType } from '@/types/calculator'
import { getCrystalsByType, getCrystalById } from '@/utils/crystalDatabase'

interface CrystalFormProps {
	crystals: CrystalSlots
	onChange: (crystals: CrystalSlots) => void
}

export default function CrystalForm({ crystals, onChange }: CrystalFormProps) {
	const [availableCrystals, setAvailableCrystals] = useState<{
		weapon: any[]
		armor: any[]
		additional: any[]
		special: any[]
		normal: any[]
	}>({
		weapon: [],
		armor: [],
		additional: [],
		special: [],
		normal: [],
	})

	// クリスタデータを読み込み
	useEffect(() => {
		setAvailableCrystals({
			weapon: getCrystalsByType('weapon'),
			armor: getCrystalsByType('armor'),
			additional: getCrystalsByType('additional'),
			special: getCrystalsByType('special'),
			normal: getCrystalsByType('normal'),
		})
	}, [])

	const handleCrystalChange = (
		slotKey: keyof CrystalSlots,
		crystalId: string
	) => {
		onChange({
			...crystals,
			[slotKey]: crystalId === '' ? null : crystalId,
		})
	}

	const crystalSlots = [
		{
			title: '武器クリスタ',
			type: 'weapon' as CrystalType,
			slots: [
				{ key: 'weapon1' as const, label: '武器クリスタ1' },
				{ key: 'weapon2' as const, label: '武器クリスタ2' },
			],
		},
		{
			title: '防具クリスタ',
			type: 'armor' as CrystalType,
			slots: [
				{ key: 'armor1' as const, label: '防具クリスタ1' },
				{ key: 'armor2' as const, label: '防具クリスタ2' },
			],
		},
		{
			title: '追加クリスタ',
			type: 'additional' as CrystalType,
			slots: [
				{ key: 'additional1' as const, label: '追加クリスタ1' },
				{ key: 'additional2' as const, label: '追加クリスタ2' },
			],
		},
		{
			title: '特殊クリスタ',
			type: 'special' as CrystalType,
			slots: [
				{ key: 'special1' as const, label: '特殊クリスタ1' },
				{ key: 'special2' as const, label: '特殊クリスタ2' },
			],
		},
	]

	const renderCrystalSelect = (
		slotKey: keyof CrystalSlots,
		label: string,
		crystalType: CrystalType
	) => {
		const selectedCrystalId = crystals[slotKey]
		const selectedCrystal = selectedCrystalId
			? getCrystalById(selectedCrystalId)
			: null
		
		// 指定されたタイプのクリスタ + ノーマルクリスタを取得
		const specificCrystals = availableCrystals[crystalType] || []
		const normalCrystals = availableCrystals.normal || []

		return (
			<div key={slotKey} className="space-y-2">
				<label htmlFor={`crystal-${slotKey}`} className="text-sm font-medium text-gray-700">{label}</label>
				<select
					id={`crystal-${slotKey}`}
					value={selectedCrystalId || ''}
					onChange={(e) => handleCrystalChange(slotKey, e.target.value)}
					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				>
					<option value="">なし</option>
					{specificCrystals.length > 0 && (
						<optgroup label={`${crystalType === 'weapon' ? '武器' : crystalType === 'armor' ? '防具' : crystalType === 'additional' ? '追加' : '特殊'}専用`}>
							{specificCrystals.map((crystal) => (
								<option key={crystal.id} value={crystal.id}>
									{crystal.name}
								</option>
							))}
						</optgroup>
					)}
					{normalCrystals.length > 0 && (
						<optgroup label="ノーマル">
							{normalCrystals.map((crystal) => (
								<option key={crystal.id} value={crystal.id}>
									{crystal.name}
								</option>
							))}
						</optgroup>
					)}
				</select>
				
				{selectedCrystal && (
					<div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
						{selectedCrystal.description}
					</div>
				)}
			</div>
		)
	}

	return (
		<div className="bg-white rounded-lg shadow-md p-6">
			<h2 className="text-xl font-bold text-gray-800 mb-4">クリスタ選択</h2>
			
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{crystalSlots.map(({ title, type, slots }) => (
					<div key={type} className="border rounded-lg p-4">
						<h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
						<div className="space-y-4">
							{slots.map(({ key, label }) =>
								renderCrystalSelect(key, label, type)
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}