import { useState } from 'react'
import { useCalculatorStore } from '@/stores'
import type {
	ArmorType,
	EquipmentCategory,
	EquipmentProperties,
	EquipmentSlots,
} from '@/types/calculator'
import { getArmorType, saveArmorType } from '@/utils/armorTypeStorage'
import {
	getCombinedEquipmentById,
} from '@/utils/equipmentDatabase'
import {
	getWeaponInfo,
} from '@/utils/weaponInfoStorage'
import {
	getEquipmentAllCrystals,
} from '@/utils/equipmentCrystalStorage'

interface ModalStates {
	modalState: {
		isOpen: boolean
		category: EquipmentCategory | null
		title: string
	}
	createModalState: {
		isOpen: boolean
		equipmentType: keyof EquipmentSlots | null
	}
	deleteModalState: {
		isOpen: boolean
		equipmentId: string | null
		equipmentName: string
	}
	renameModalState: {
		isOpen: boolean
		equipmentId: string | null
		currentName: string
	}
	messageModalState: {
		isOpen: boolean
		message: string
	}
}

interface ModalActions {
	setModalState: React.Dispatch<React.SetStateAction<ModalStates['modalState']>>
	setCreateModalState: React.Dispatch<React.SetStateAction<ModalStates['createModalState']>>
	setDeleteModalState: React.Dispatch<React.SetStateAction<ModalStates['deleteModalState']>>
	setRenameModalState: React.Dispatch<React.SetStateAction<ModalStates['renameModalState']>>
	setMessageModalState: React.Dispatch<React.SetStateAction<ModalStates['messageModalState']>>
}

export function useEquipmentHandlers(
	modalStates: ModalStates,
	modalActions: ModalActions,
	onEquipmentChange?: (equipment: EquipmentSlots) => void,
) {
	const storeEquipment = useCalculatorStore((state) => state.data.equipment)
	const updateEquipment = useCalculatorStore((state) => state.updateEquipment)
	const createTemporaryCustomEquipment = useCalculatorStore(
		(state) => state.createTemporaryCustomEquipment,
	)
	const renameCustomEquipment = useCalculatorStore(
		(state) => state.renameCustomEquipment,
	)
	const deleteCustomEquipment = useCalculatorStore(
		(state) => state.deleteCustomEquipment,
	)
	const updateCustomEquipmentProperties = useCalculatorStore(
		(state) => state.updateCustomEquipmentProperties,
	)
	const updateMainWeapon = useCalculatorStore((state) => state.updateMainWeapon)
	const updateSubWeapon = useCalculatorStore((state) => state.updateSubWeapon)
	const updateCrystals = useCalculatorStore((state) => state.updateCrystals)

	const {
		modalState,
		createModalState,
		deleteModalState,
		renameModalState,
		messageModalState,
	} = modalStates

	const {
		setModalState,
		setCreateModalState,
		setDeleteModalState,
		setRenameModalState,
		setMessageModalState,
	} = modalActions

	// 装備プロパティ変更ハンドラー
	const handleEquipmentPropertyChange = (
		slotKey: keyof EquipmentSlots,
		property: keyof EquipmentProperties,
		value: string,
	) => {
		const numValue = Number.parseInt(value) || 0
		const currentEquipment = storeEquipment[slotKey]

		if (!currentEquipment) return

		// カスタム装備の場合、プロパティ連動更新を実行
		if (
			currentEquipment.id &&
			'isCustom' in currentEquipment &&
			currentEquipment.isCustom
		) {
			updateCustomEquipmentProperties(currentEquipment.id, {
				[property]: numValue,
			})
		}

		const updatedEquipment = {
			...storeEquipment,
			[slotKey]: {
				...currentEquipment,
				properties: {
					...currentEquipment.properties,
					[property]: numValue,
				},
				// プロパティを手動変更した場合はプリセットIDをクリア
				presetId: null,
			},
		}

		// Zustandストアを更新
		updateEquipment(updatedEquipment)

		// 後方互換性のため従来のonChangeも呼び出し
		if (onEquipmentChange) {
			onEquipmentChange(updatedEquipment)
		}
	}

	// プリセット装備選択ハンドラー
	const handlePresetEquipmentSelect = (equipmentId: string | null) => {
		if (!modalState.category) return

		const slotKey = modalState.category as keyof EquipmentSlots

		if (equipmentId === null) {
			// 装備なしを選択
			const updatedEquipment = {
				...storeEquipment,
				[slotKey]: {
					name: '',
					properties: {},
					presetId: null,
				},
			}

			// Zustandストアを更新
			updateEquipment(updatedEquipment)

			// 後方互換性のため従来のonChangeも呼び出し
			if (onEquipmentChange) {
				onEquipmentChange(updatedEquipment)
			}
		} else {
			// プリセット・カスタム装備を選択（統合データから取得）
			const equipment = getCombinedEquipmentById(equipmentId)
			if (equipment) {
				const updatedEquipment = {
					...storeEquipment,
					[slotKey]: {
						name: equipment.name,
						properties: { ...equipment.properties },
						presetId:
							'isCustom' in equipment && equipment.isCustom
								? null
								: equipmentId,
						id: equipment.id,
						isCustom: 'isCustom' in equipment && equipment.isCustom,
					},
				}

				// Zustandストアを更新
				updateEquipment(updatedEquipment)

				// メイン装備が選択された場合、保存されている武器情報をWeaponFormに復元
				if (slotKey === 'mainWeapon') {
					const weaponInfo = getWeaponInfo(equipmentId)
					if (weaponInfo) {
						console.log('武器情報をWeaponFormに復元:', weaponInfo)
						const currentMainWeapon =
							useCalculatorStore.getState().data.mainWeapon
						const updatedMainWeapon = {
							...currentMainWeapon,
							ATK: weaponInfo.ATK,
							stability: weaponInfo.stability,
							refinement: weaponInfo.refinement,
							...(weaponInfo.weaponType && {
								weaponType: weaponInfo.weaponType,
							}),
						}
						updateMainWeapon(updatedMainWeapon)
					}
				}

				// サブ武器が選択された場合、保存されている武器情報をWeaponFormに復元
				if (slotKey === 'subWeapon') {
					const weaponInfo = getWeaponInfo(equipmentId)
					if (weaponInfo) {
						console.log('サブ武器情報をWeaponFormに復元:', weaponInfo)
						const currentSubWeapon =
							useCalculatorStore.getState().data.subWeapon

						const updatedSubWeapon = {
							...currentSubWeapon,
							ATK: weaponInfo.ATK,
							stability: weaponInfo.stability,
							refinement: weaponInfo.refinement,
							...(weaponInfo.subWeaponType && {
								weaponType: weaponInfo.subWeaponType,
							}),
						}
						updateSubWeapon(updatedSubWeapon)
					}
				}

				// 対象装備（メイン・体・追加・特殊装備）でクリスタ情報を復元
				if (['mainWeapon', 'body', 'additional', 'special'].includes(slotKey)) {
					const crystalInfo = getEquipmentAllCrystals(equipmentId)
					if (crystalInfo.slot1 || crystalInfo.slot2) {
						console.log('クリスタ情報をCrystalFormに復元:', crystalInfo)
						
						// 装備スロットとクリスタタイプのマッピング
						const crystalTypeMap: Record<string, string> = {
							mainWeapon: 'weapon',
							body: 'armor',
							additional: 'additional',
							special: 'special',
						}
						
						const crystalType = crystalTypeMap[slotKey]
						if (crystalType) {
							const currentCrystals = useCalculatorStore.getState().data.crystals
							const updatedCrystals = { ...currentCrystals }
							
							// 1つ目のクリスタスロットを復元
							if (crystalInfo.slot1) {
								const crystalSlotKey = `${crystalType}1` as keyof import('@/types/calculator').CrystalSlots
								updatedCrystals[crystalSlotKey] = crystalInfo.slot1
							}
							
							// 2つ目のクリスタスロットを復元
							if (crystalInfo.slot2) {
								const crystalSlotKey = `${crystalType}2` as keyof import('@/types/calculator').CrystalSlots
								updatedCrystals[crystalSlotKey] = crystalInfo.slot2
							}
							
							updateCrystals(updatedCrystals)
						}
					}
				}

				// 後方互換性のため従来のonChangeも呼び出し
				if (onEquipmentChange) {
					onEquipmentChange(updatedEquipment)
				}
			}
		}
	}

	// モーダル操作
	const openEquipmentModal = (category: EquipmentCategory, title: string) => {
		setModalState({
			isOpen: true,
			category,
			title,
		})
	}

	const closeEquipmentModal = () => {
		setModalState({
			isOpen: false,
			category: null,
			title: '',
		})
	}

	// カスタム装備作成のハンドラー
	const handleCreateEquipment = (slotKey: keyof EquipmentSlots) => {
		setCreateModalState({
			isOpen: true,
			equipmentType: slotKey,
		})
	}

	const handleCreateConfirm = async (equipmentName: string) => {
		if (!createModalState.equipmentType) return

		try {
			await createTemporaryCustomEquipment(
				createModalState.equipmentType as EquipmentCategory,
				equipmentName,
			)
			setCreateModalState({
				isOpen: false,
				equipmentType: null,
			})
		} catch (error) {
			console.error('カスタム装備作成エラー:', error)
		}
	}

	const handleCreateCancel = () => {
		setCreateModalState({
			isOpen: false,
			equipmentType: null,
		})
	}

	// カスタム装備削除のハンドラー
	const handleDeleteEquipment = (slotKey: keyof EquipmentSlots) => {
		const equipment = storeEquipment[slotKey]
		if (!equipment?.id) return

		// 装備名を取得（統合装備データから）
		const equipmentData = getCombinedEquipmentById(equipment.id)
		const equipmentName = equipmentData?.name || equipment.name || '不明な装備'

		setDeleteModalState({
			isOpen: true,
			equipmentId: equipment.id,
			equipmentName,
		})
	}

	const handleDeleteConfirm = async () => {
		if (!deleteModalState.equipmentId) return

		try {
			await deleteCustomEquipment(deleteModalState.equipmentId)
			setDeleteModalState({
				isOpen: false,
				equipmentId: null,
				equipmentName: '',
			})
		} catch (error) {
			console.error('カスタム装備削除エラー:', error)
		}
	}

	const handleDeleteCancel = () => {
		setDeleteModalState({
			isOpen: false,
			equipmentId: null,
			equipmentName: '',
		})
	}

	// カスタム装備名前変更のハンドラー
	const handleRenameEquipment = (slotKey: keyof EquipmentSlots) => {
		const equipment = storeEquipment[slotKey]
		if (!equipment?.id) return

		// 装備名を取得（統合装備データから）
		const equipmentData = getCombinedEquipmentById(equipment.id)
		const currentName = equipmentData?.name || equipment.name || '不明な装備'

		setRenameModalState({
			isOpen: true,
			equipmentId: equipment.id,
			currentName,
		})
	}

	const handleRenameConfirm = async (newName: string) => {
		if (!renameModalState.equipmentId) return

		try {
			await renameCustomEquipment(renameModalState.equipmentId, newName)
			setRenameModalState({
				isOpen: false,
				equipmentId: null,
				currentName: '',
			})
		} catch (error) {
			console.error('カスタム装備名前変更エラー:', error)
		}
	}

	const handleRenameCancel = () => {
		setRenameModalState({
			isOpen: false,
			equipmentId: null,
			currentName: '',
		})
	}

	// ArmorType変更のハンドラー
	const handleArmorTypeChange = (newArmorType: ArmorType) => {
		const currentEquipment = storeEquipment.body
		if (!currentEquipment?.id) return

		// armorTypeStorageに直接保存
		saveArmorType(currentEquipment.id, newArmorType)

		// UIを更新するため、装備データを再読み込み
		const updatedEquipment = { ...storeEquipment }
		updateEquipment(updatedEquipment)
	}

	// メッセージモーダル表示
	const showMessage = (message: string) => {
		setMessageModalState({
			isOpen: true,
			message,
		})
	}

	// UI更新処理
	const handleUpdate = () => {
		// UIを更新するため、装備データを再読み込み
		const updatedEquipment = { ...storeEquipment }
		updateEquipment(updatedEquipment)
	}

	return {
		// データ
		effectiveEquipment: storeEquipment,
		// ハンドラー
		handleEquipmentPropertyChange,
		handlePresetEquipmentSelect,
		openEquipmentModal,
		closeEquipmentModal,
		handleCreateEquipment,
		handleCreateConfirm,
		handleCreateCancel,
		handleDeleteEquipment,
		handleDeleteConfirm,
		handleDeleteCancel,
		handleRenameEquipment,
		handleRenameConfirm,
		handleRenameCancel,
		handleArmorTypeChange,
		showMessage,
		handleUpdate,
	}
}