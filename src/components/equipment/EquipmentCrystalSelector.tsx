'use client'

import React, { useState, useCallback, useMemo } from 'react'
import CrystalSelectionModal from '@/components/crystal/CrystalSelectionModal'
import type { CrystalType, EquipmentSlots } from '@/types/calculator'
import type { SlotInfo } from '@/types/damagePreview'
import { getCrystalById } from '@/utils/crystalDatabase'
import {
	getEquipmentCrystal,
} from '@/utils/equipmentCrystalStorage'
import { useCalculatorStore } from '@/stores/calculatorStore'

interface EquipmentCrystalSelectorProps {
	equipmentId: string
	slotKey: keyof EquipmentSlots
	onCrystalChange?: () => void
}

// 装備スロットとクリスタタイプのマッピング
const EQUIPMENT_CRYSTAL_TYPE_MAP: Record<keyof EquipmentSlots, CrystalType[]> = {
	mainWeapon: ['weapon'],
	body: ['armor'],
	additional: ['additional'],
	special: ['special'],
	subWeapon: ['weapon'],
	fashion1: [],
	fashion2: [],
	fashion3: [],
	freeInput1: [],
	freeInput2: [],
	freeInput3: [],
}

export default function EquipmentCrystalSelector({
	equipmentId,
	slotKey,
	onCrystalChange,
}: EquipmentCrystalSelectorProps) {
	const updateCrystals = useCalculatorStore((state) => state.updateCrystals)
	const currentCrystals = useCalculatorStore((state) => state.data.crystals)
	const updateTempEquipmentCrystal = useCalculatorStore((state) => state.updateTempEquipmentCrystal)
	
	// 対象装備がクリスタ対応かどうかを判定
	const allowedTypes = EQUIPMENT_CRYSTAL_TYPE_MAP[slotKey]
	const isCrystalSupported = allowedTypes.length > 0

	// クリスタ選択モーダルの状態
	const [modalState, setModalState] = useState<{
		isOpen: boolean
		slotNumber: 1 | 2 | null
		title: string
	}>({
		isOpen: false,
		slotNumber: null,
		title: '',
	})

	// 現在の装備に紐づけられたクリスタ情報を取得
	const [slot1CrystalId, setSlot1CrystalId] = useState<string | null>(() =>
		getEquipmentCrystal(equipmentId, 1),
	)
	const [slot2CrystalId, setSlot2CrystalId] = useState<string | null>(() =>
		getEquipmentCrystal(equipmentId, 2),
	)

	// クリスタ情報を取得
	const slot1Crystal = useMemo(() => {
		return slot1CrystalId ? getCrystalById(slot1CrystalId) : null
	}, [slot1CrystalId])

	const slot2Crystal = useMemo(() => {
		return slot2CrystalId ? getCrystalById(slot2CrystalId) : null
	}, [slot2CrystalId])

	// CrystalFormのスロット情報を生成
	const getSlotInfo = (slotNumber: 1 | 2): SlotInfo => {
		const categoryMap: Record<keyof EquipmentSlots, CrystalType> = {
			mainWeapon: 'weapon',
			body: 'armor',
			additional: 'additional',
			special: 'special',
			subWeapon: 'weapon',
			fashion1: 'weapon', // フォールバック
			fashion2: 'weapon', // フォールバック
			fashion3: 'weapon', // フォールバック
			freeInput1: 'weapon', // フォールバック
			freeInput2: 'weapon', // フォールバック
			freeInput3: 'weapon', // フォールバック
		}

		return {
			type: 'crystal' as const,
			category: categoryMap[slotKey],
			slot: slotNumber - 1, // 0-based indexing
		}
	}

	// クリスタ選択モーダルを開く
	const openCrystalModal = useCallback((slotNumber: 1 | 2) => {
		const slotLabel = slotNumber === 1 ? '1つ目' : '2つ目'
		setModalState({
			isOpen: true,
			slotNumber,
			title: `クリスタ${slotLabel}を選択`,
		})
	}, [])

	// クリスタ選択モーダルを閉じる
	const closeCrystalModal = useCallback(() => {
		setModalState({
			isOpen: false,
			slotNumber: null,
			title: '',
		})
	}, [])

	// クリスタ選択処理
	const handleCrystalSelect = useCallback(
		(crystalId: string | null) => {
			if (!modalState.slotNumber) return

			const slotNumber = modalState.slotNumber

			if (crystalId) {
				// クリスタを選択した場合 - 一時的なクリスタ連携情報を更新
				updateTempEquipmentCrystal(equipmentId, slotNumber, crystalId)
				
				// ローカル状態を更新
				if (slotNumber === 1) {
					setSlot1CrystalId(crystalId)
				} else {
					setSlot2CrystalId(crystalId)
				}

				// CrystalFormにクリスタをセット
				const crystalSlotKey = `${allowedTypes[0]}${slotNumber}` as keyof import('@/types/calculator').CrystalSlots
				const updatedCrystals = {
					...currentCrystals,
					[crystalSlotKey]: crystalId,
				}
				updateCrystals(updatedCrystals)

				onCrystalChange?.()
			} else {
				// クリスタを削除した場合 - 一時的なクリスタ連携情報を更新
				updateTempEquipmentCrystal(equipmentId, slotNumber, null)
				
				// ローカル状態を更新
				if (slotNumber === 1) {
					setSlot1CrystalId(null)
				} else {
					setSlot2CrystalId(null)
				}

				// 連携解除時はCrystalFormは変更しない
				onCrystalChange?.()
			}
		},
		[modalState.slotNumber, equipmentId, allowedTypes, currentCrystals, updateCrystals, updateTempEquipmentCrystal, onCrystalChange],
	)

	// クリスタを削除
	const handleCrystalRemove = useCallback(
		(slotNumber: 1 | 2) => {
			// 一時的なクリスタ連携情報を更新
			updateTempEquipmentCrystal(equipmentId, slotNumber, null)
			
			// ローカル状態を更新
			if (slotNumber === 1) {
				setSlot1CrystalId(null)
			} else {
				setSlot2CrystalId(null)
			}

			// 連携解除時はCrystalFormは変更しない
			onCrystalChange?.()
		},
		[equipmentId, updateTempEquipmentCrystal, onCrystalChange],
	)

	// 装備が変更された際に呼び出される更新関数
	const updateCrystalState = useCallback(() => {
		setSlot1CrystalId(getEquipmentCrystal(equipmentId, 1))
		setSlot2CrystalId(getEquipmentCrystal(equipmentId, 2))
	}, [equipmentId])

	// 外部から状態更新できるように関数を公開
	// biome-ignore lint/correctness/useExhaustiveDependencies: 意図的にupdateCrystalStateを依存に含めない
	React.useEffect(() => {
		updateCrystalState()
	}, [equipmentId])

	// クリスタ対応装備でない場合は何も表示しない
	if (!isCrystalSupported) {
		return null
	}

	return (
		<div className="mt-4 space-y-3">
			<h4 className="text-sm font-medium text-gray-700">クリスタ連携</h4>
			
			{/* 1つ目のクリスタスロット */}
			<div className="flex items-center gap-2">
				<span className="text-sm text-gray-600 min-w-[60px]">クリスタ1:</span>
				<button
					type="button"
					onClick={() => openCrystalModal(1)}
					className="flex-1 px-3 py-2 text-sm text-left border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors"
				>
					{slot1Crystal ? (
						<span className="text-gray-900">{slot1Crystal.name}</span>
					) : (
						<span className="text-gray-500">連携しない</span>
					)}
				</button>
				{slot1Crystal && (
					<button
						type="button"
						onClick={() => handleCrystalRemove(1)}
						className="px-2 py-1 text-xs bg-gray-400/80 text-white rounded hover:bg-gray-400 transition-colors"
						title="連携を解除"
					>
						解除
					</button>
				)}
			</div>

			{/* 2つ目のクリスタスロット */}
			<div className="flex items-center gap-2">
				<span className="text-sm text-gray-600 min-w-[60px]">クリスタ2:</span>
				<button
					type="button"
					onClick={() => openCrystalModal(2)}
					className="flex-1 px-3 py-2 text-sm text-left border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors"
				>
					{slot2Crystal ? (
						<span className="text-gray-900">{slot2Crystal.name}</span>
					) : (
						<span className="text-gray-500">連携しない</span>
					)}
				</button>
				{slot2Crystal && (
					<button
						type="button"
						onClick={() => handleCrystalRemove(2)}
						className="px-2 py-1 text-xs bg-gray-400/80 text-white rounded hover:bg-gray-400 transition-colors"
						title="連携を解除"
					>
						解除
					</button>
				)}
			</div>

			{/* クリスタ選択モーダル */}
			<CrystalSelectionModal
				isOpen={modalState.isOpen}
				onClose={closeCrystalModal}
				onSelect={handleCrystalSelect}
				selectedCrystalId={
					modalState.slotNumber === 1 ? slot1CrystalId : slot2CrystalId
				}
				allowedTypes={allowedTypes}
				title={modalState.title}
				slotInfo={modalState.slotNumber ? getSlotInfo(modalState.slotNumber) : undefined}
			/>
		</div>
	)
}