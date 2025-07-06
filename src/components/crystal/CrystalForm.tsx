'use client'

import { useState } from 'react'
import type { CrystalSlots, CrystalType } from '@/types/calculator'
import { getCrystalById } from '@/utils/crystalDatabase'
import CrystalSelectionModal from './CrystalSelectionModal'
import { useCalculatorStore } from '@/stores'

interface CrystalFormProps {
	// Zustand移行後は不要（後方互換性のため残存）
	crystals?: CrystalSlots
	onChange?: (crystals: CrystalSlots) => void
}

export default function CrystalForm({ crystals, onChange }: CrystalFormProps) {
	// Zustandストアからクリスタルデータを取得
	const storeCrystals = useCalculatorStore((state) => state.data.crystals)
	const updateCrystals = useCalculatorStore((state) => state.updateCrystals)

	// Zustandストアの値を使用（完全移行）
	const effectiveCrystals = storeCrystals
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

		const newCrystals = {
			...effectiveCrystals,
			[modalState.slotKey]: crystalId,
		}

		// Zustandストアを更新
		updateCrystals(newCrystals)

		// 後方互換性のため従来のonChangeも呼び出し
		if (onChange) {
			onChange(newCrystals)
		}
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

	const renderCrystalButton = (
		slotKey: keyof CrystalSlots,
		crystalType: CrystalType,
	) => {
		const selectedCrystalId = effectiveCrystals[slotKey]
		const selectedCrystal = selectedCrystalId
			? getCrystalById(selectedCrystalId)
			: null

		const getSlotNumber = (key: string) => {
			return key.includes('1') ? '1' : '2'
		}

		return (
			<button
				key={slotKey}
				type="button"
				onClick={() =>
					openModal(
						slotKey,
						[crystalType],
						`${
							crystalType === 'weapon'
								? '武器'
								: crystalType === 'armor'
									? '防具'
									: crystalType === 'additional'
										? '追加'
										: '特殊'
						}クリスタ${getSlotNumber(slotKey)}を選択`,
					)
				}
				className="px-1 py-1 mr-2 text-sm text-left border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors min-w-0 w-full"
			>
				{selectedCrystal ? (
					<div className="flex items-center justify-between min-w-0">
						<span className="text-sm truncate min-w-0">{selectedCrystal.name}</span>
						{/* ダメージ差分表示は現在セットされているクリスタルには表示しない */}
					</div>
				) : (
					<div className="flex items-center justify-between min-w-0">
						<span className="text-gray-500">なし</span>
						<svg
							className="w-4 h-4 text-gray-400 flex-shrink-0"
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
		)
	}

	return (
		<section className="bg-white rounded-lg shadow-md p-4 md:col-start-1 md:col-end-5 md:row-start-3 md:row-end-4 xl:col-start-1 xl:col-end-3 xl:row-start-3 xl:row-end-4">
			<h2 className="text-lg font-bold text-gray-800 mb-3">クリスタ選択</h2>

			<div className="grid grid-cols-[40px_1fr_40px_1fr] gap-2">
				{/* 武器クリスタ行 */}
				<div className="text-sm font-medium text-gray-700 w-12 flex items-center">
					武器:
				</div>
				{renderCrystalButton('weapon1', 'weapon')}
				<div className="text-sm font-medium text-gray-700 w-12 flex items-center">
					防具:
				</div>
				{renderCrystalButton('armor1', 'armor')}

				{/* 2つ目のボタン行 */}
				<div />
				{renderCrystalButton('weapon2', 'weapon')}
				<div />
				{renderCrystalButton('armor2', 'armor')}

				{/* 追加クリスタ行 */}
				<div className="text-sm font-medium text-gray-700 w-12 flex items-center">
					追加:
				</div>
				{renderCrystalButton('additional1', 'additional')}
				<div className="text-sm font-medium text-gray-700 w-12 flex items-center">
					特殊:
				</div>
				{renderCrystalButton('special1', 'special')}

				{/* 2つ目のボタン行 */}
				<div />
				{renderCrystalButton('additional2', 'additional')}
				<div />
				{renderCrystalButton('special2', 'special')}
			</div>

			{/* クリスタ選択モーダル */}
			<CrystalSelectionModal
				isOpen={modalState.isOpen}
				onClose={closeModal}
				onSelect={handleCrystalChange}
				selectedCrystalId={
					modalState.slotKey ? effectiveCrystals[modalState.slotKey] : null
				}
				allowedTypes={modalState.allowedTypes}
				title={modalState.title}
				slotInfo={modalState.slotKey ? {
					type: 'crystal' as const,
					category: modalState.allowedTypes[0],
					slot: modalState.slotKey.includes('1') ? 0 : 1,
				} : undefined}
			/>
		</section>
	)
}
