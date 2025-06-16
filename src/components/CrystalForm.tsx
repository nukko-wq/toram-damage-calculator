'use client'

import { useState } from 'react'
import type { CrystalSlots, CrystalType } from '@/types/calculator'
import { getCrystalById } from '@/utils/crystalDatabase'
import CrystalSelectionModal from './CrystalSelectionModal'

interface CrystalFormProps {
	crystals: CrystalSlots
	onChange: (crystals: CrystalSlots) => void
}

export default function CrystalForm({ crystals, onChange }: CrystalFormProps) {
	const [modalState, setModalState] = useState<{
		isOpen: boolean
		slotKey: keyof CrystalSlots | null
		allowedTypes: CrystalType[]
		title: string
	}>({
		isOpen: false,
		slotKey: null,
		allowedTypes: [],
		title: '',
	})

	const handleCrystalChange = (crystalId: string | null) => {
		if (!modalState.slotKey) return

		onChange({
			...crystals,
			[modalState.slotKey]: crystalId,
		})
	}

	const openModal = (
		slotKey: keyof CrystalSlots,
		allowedTypes: CrystalType[],
		title: string,
	) => {
		setModalState({
			isOpen: true,
			slotKey,
			allowedTypes,
			title,
		})
	}

	const closeModal = () => {
		setModalState({
			isOpen: false,
			slotKey: null,
			allowedTypes: [],
			title: '',
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

	const renderCrystalSlot = (
		slotKey: keyof CrystalSlots,
		label: string,
		crystalType: CrystalType,
	) => {
		const selectedCrystalId = crystals[slotKey]
		const selectedCrystal = selectedCrystalId
			? getCrystalById(selectedCrystalId)
			: null

		return (
			<div key={slotKey} className="space-y-2">
				<label className="text-sm font-medium text-gray-700">{label}</label>

				<button
					onClick={() => openModal(slotKey, [crystalType], `${label}を選択`)}
					className="w-full p-3 text-left border border-gray-300 rounded-md hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
				>
					{selectedCrystal ? (
						<div className="space-y-1">
							<div className="flex items-center justify-between">
								<span className="font-medium text-gray-900">
									{selectedCrystal.name}
								</span>
								<span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
									{selectedCrystal.type === 'weapon'
										? '武器'
										: selectedCrystal.type === 'armor'
											? '防具'
											: selectedCrystal.type === 'additional'
												? '追加'
												: selectedCrystal.type === 'special'
													? '特殊'
													: 'ノーマル'}
								</span>
							</div>
							{selectedCrystal.description && (
								<div className="text-xs text-gray-500 truncate">
									{selectedCrystal.description}
								</div>
							)}
						</div>
					) : (
						<div className="flex items-center justify-between">
							<span className="text-gray-500">クリスタを選択...</span>
							<svg
								className="w-5 h-5 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 9l-7 7-7-7"
								/>
							</svg>
						</div>
					)}
				</button>
			</div>
		)
	}

	return (
		<section className="bg-white rounded-lg shadow-md p-6">
			<h2 className="text-xl font-bold text-gray-800 mb-4">クリスタ選択</h2>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{crystalSlots.map(({ title, type, slots }) => (
					<div key={type} className="border rounded-lg p-4">
						<h3 className="text-lg font-semibold text-gray-700 mb-4">
							{title}
						</h3>
						<div className="space-y-4">
							{slots.map(({ key, label }) =>
								renderCrystalSlot(key, label, type),
							)}
						</div>
					</div>
				))}
			</div>

			{/* クリスタ選択モーダル */}
			<CrystalSelectionModal
				isOpen={modalState.isOpen}
				onClose={closeModal}
				onSelect={handleCrystalChange}
				selectedCrystalId={
					modalState.slotKey ? crystals[modalState.slotKey] : null
				}
				allowedTypes={modalState.allowedTypes}
				title={modalState.title}
			/>
		</section>
	)
}
