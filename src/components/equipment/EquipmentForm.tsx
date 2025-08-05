'use client'

import { useState } from 'react'
import ArmorTypeSelect from '@/components/ui/ArmorTypeSelect'
import type {
	EquipmentSlots,
} from '@/types/calculator'
import { getArmorType } from '@/utils/armorTypeStorage'
import EquipmentActionButtons from './EquipmentActionButtons'
import EquipmentModals from './EquipmentModals'
import EquipmentSlotTabs from './EquipmentSlotTabs'
import PropertyEditor from './PropertyEditor'
import { RegisterForm } from './RegisterForm'
import WeaponInfoManager from './WeaponInfoManager'
import { useEquipmentHandlers } from './useEquipmentHandlers'

interface EquipmentFormProps {
	// Zustand移行後は不要（後方互換性のため残存）
	equipment?: EquipmentSlots
	onEquipmentChange?: (equipment: EquipmentSlots) => void
}

export default function EquipmentForm({
	equipment: _equipment,
	onEquipmentChange,
}: EquipmentFormProps) {
	const [activeTab, setActiveTab] = useState<keyof EquipmentSlots | 'register'>(
		'mainWeapon',
	)
	
	// モーダル状態管理
	const [modalState, setModalState] = useState({
		isOpen: false,
		category: null as any,
		title: '',
	})
	const [createModalState, setCreateModalState] = useState({
		isOpen: false,
		equipmentType: null as any,
	})
	const [deleteModalState, setDeleteModalState] = useState({
		isOpen: false,
		equipmentId: null as string | null,
		equipmentName: '',
	})
	const [renameModalState, setRenameModalState] = useState({
		isOpen: false,
		equipmentId: null as string | null,
		currentName: '',
	})
	const [messageModalState, setMessageModalState] = useState({
		isOpen: false,
		message: '',
	})

	// カスタムフックから装備ハンドラーを取得
	const {
		effectiveEquipment,
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
	} = useEquipmentHandlers(
		{
			modalState,
			createModalState,
			deleteModalState,
			renameModalState,
			messageModalState,
		},
		{
			setModalState,
			setCreateModalState,
			setDeleteModalState,
			setRenameModalState,
			setMessageModalState,
		},
		onEquipmentChange,
	)

	const equipmentSlots = [
		{ key: 'mainWeapon' as const, label: 'メイン装備' },
		{ key: 'body' as const, label: '体装備' },
		{ key: 'additional' as const, label: '追加装備' },
		{ key: 'special' as const, label: '特殊装備' },
		{ key: 'subWeapon' as const, label: 'サブ武器' },
		{ key: 'fashion1' as const, label: 'オシャレ1' },
		{ key: 'fashion2' as const, label: 'オシャレ2' },
		{ key: 'fashion3' as const, label: 'オシャレ3' },
		{ key: 'register' as const, label: 'レジスタ他' },
		{ key: 'freeInput1' as const, label: '自由入力1' },
		{ key: 'freeInput2' as const, label: '自由入力2' },
		{ key: 'freeInput3' as const, label: '自由入力3' },
	]

	return (
		<section className="bg-white rounded-lg shadow-md p-6 md:col-start-1 md:col-end-9 md:row-start-2 md:row-end-3 xl:col-start-3 xl:col-end-4 xl:row-start-1 xl:row-end-4">
			<h2 className="text-xl font-bold text-gray-800 mb-4">装備/プロパティ</h2>

			{/* タブヘッダー */}
			<EquipmentSlotTabs 
				activeTab={activeTab} 
				onTabChange={setActiveTab} 
			/>

			{/* タブコンテンツ */}
			{activeTab === 'register' ? (
				/* レジスタ他フォーム */
				<RegisterForm />
			) : (
				<>
					<EquipmentActionButtons
						activeTab={activeTab}
						equipment={effectiveEquipment[activeTab]}
						equipmentSlots={equipmentSlots}
						onEquipmentModalOpen={() =>
							openEquipmentModal(
								activeTab as any,
								effectiveEquipment[activeTab]?.name ||
									`${equipmentSlots.find((slot) => slot.key === activeTab)?.label}を選択`,
							)
						}
						onCreateEquipment={() => handleCreateEquipment(activeTab)}
						onRenameEquipment={() => handleRenameEquipment(activeTab)}
						onDeleteEquipment={() => handleDeleteEquipment(activeTab)}
					/>

					{/* メイン装備専用：武器情報登録・削除ボタン */}
					{activeTab === 'mainWeapon' && effectiveEquipment.mainWeapon?.id && (
						<WeaponInfoManager
							slotKey="mainWeapon"
							equipmentId={effectiveEquipment.mainWeapon.id}
							onMessage={showMessage}
							onUpdate={handleUpdate}
						/>
					)}

					{/* サブ武器専用：武器情報登録・削除ボタン */}
					{activeTab === 'subWeapon' && effectiveEquipment.subWeapon?.id && (
						<WeaponInfoManager
							slotKey="subWeapon"
							equipmentId={effectiveEquipment.subWeapon.id}
							onMessage={showMessage}
							onUpdate={handleUpdate}
						/>
					)}

					{/* 体装備の防具の改造選択UI */}
					{activeTab === 'body' && effectiveEquipment.body?.id && (
						<div className="mt-4">
							<ArmorTypeSelect
								selectedType={
									getArmorType(effectiveEquipment.body.id) || 'normal'
								}
								onChange={handleArmorTypeChange}
								className="max-w-md"
							/>
						</div>
					)}

					{/* プロパティエディター */}
					{(activeTab as string) !== 'register' &&
						effectiveEquipment[activeTab as keyof EquipmentSlots] && (
							<PropertyEditor
								item={effectiveEquipment[activeTab as keyof EquipmentSlots]}
								slotKey={activeTab as keyof EquipmentSlots}
								onPropertyChange={(property, value) =>
									handleEquipmentPropertyChange(
										activeTab as keyof EquipmentSlots,
										property,
										value,
									)
								}
								onMessage={showMessage}
								onUpdate={handleUpdate}
							/>
						)}
				</>
			)}

			{/* モーダル */}
			<EquipmentModals
				activeTab={activeTab}
				selectedEquipmentId={
					effectiveEquipment[activeTab as keyof EquipmentSlots]?.id || null
				}
				slotInfo={activeTab !== 'register' ? {
					type: 'equipment' as const,
					slot: activeTab,
				} : undefined}
				equipmentModal={modalState}
				onEquipmentSelect={handlePresetEquipmentSelect}
				onEquipmentModalClose={closeEquipmentModal}
				createModal={createModalState}
				onCreateConfirm={handleCreateConfirm}
				onCreateCancel={handleCreateCancel}
				renameModal={renameModalState}
				onRenameConfirm={handleRenameConfirm}
				onRenameCancel={handleRenameCancel}
				deleteModal={deleteModalState}
				onDeleteConfirm={handleDeleteConfirm}
				onDeleteCancel={handleDeleteCancel}
				messageModal={messageModalState}
				onMessageClose={() =>
					setMessageModalState({ isOpen: false, message: '' })
				}
			/>
		</section>
	)
}