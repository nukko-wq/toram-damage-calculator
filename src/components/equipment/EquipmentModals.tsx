'use client'

import MessageModal from '@/components/ui/MessageModal'
import type { EquipmentCategory, EquipmentSlots } from '@/types/calculator'
import { getEquipmentCategoryLabel } from '@/utils/equipmentDatabase'
import CreateEquipmentModal from './CreateEquipmentModal'
import DeleteConfirmModal from './DeleteConfirmModal'
import EquipmentSelectionModal from './EquipmentSelectionModal'
import RenameEquipmentModal from './RenameEquipmentModal'

interface EquipmentModalsProps {
	// 現在のアクティブタブ
	activeTab: keyof EquipmentSlots | 'register'
	selectedEquipmentId: string | null

	// Equipment Selection Modal
	equipmentModal: {
		isOpen: boolean
		category: EquipmentCategory | null
		title: string
	}
	onEquipmentSelect: (equipmentId: string | null) => void
	onEquipmentModalClose: () => void

	// Create Equipment Modal
	createModal: {
		isOpen: boolean
		equipmentType: keyof EquipmentSlots | null
	}
	onCreateConfirm: (equipmentName: string) => void
	onCreateCancel: () => void

	// Rename Equipment Modal
	renameModal: {
		isOpen: boolean
		equipmentId: string | null
		currentName: string
	}
	onRenameConfirm: (newName: string) => void
	onRenameCancel: () => void

	// Delete Confirm Modal
	deleteModal: {
		isOpen: boolean
		equipmentId: string | null
		equipmentName: string
	}
	onDeleteConfirm: () => void
	onDeleteCancel: () => void

	// Message Modal
	messageModal: {
		isOpen: boolean
		message: string
	}
	onMessageClose: () => void
}

export default function EquipmentModals({
	activeTab,
	selectedEquipmentId,
	equipmentModal,
	onEquipmentSelect,
	onEquipmentModalClose,
	createModal,
	onCreateConfirm,
	onCreateCancel,
	renameModal,
	onRenameConfirm,
	onRenameCancel,
	deleteModal,
	onDeleteConfirm,
	onDeleteCancel,
	messageModal,
	onMessageClose,
}: EquipmentModalsProps) {
	return (
		<>
			{/* 装備選択モーダル */}
			{activeTab !== 'register' && equipmentModal.category && (
				<EquipmentSelectionModal
					isOpen={equipmentModal.isOpen}
					onClose={onEquipmentModalClose}
					onSelect={onEquipmentSelect}
					selectedEquipmentId={selectedEquipmentId}
					category={equipmentModal.category}
					title={equipmentModal.title}
				/>
			)}

			{/* カスタム装備作成モーダル */}
			<CreateEquipmentModal
				isOpen={createModal.isOpen}
				onClose={onCreateCancel}
				onConfirm={onCreateConfirm}
				equipmentType={
					createModal.equipmentType
						? getEquipmentCategoryLabel(
								createModal.equipmentType as EquipmentCategory,
							)
						: ''
				}
			/>

			{/* カスタム装備削除確認モーダル */}
			<DeleteConfirmModal
				isOpen={deleteModal.isOpen}
				onClose={onDeleteCancel}
				onConfirm={onDeleteConfirm}
				equipmentName={deleteModal.equipmentName}
				message="この装備を削除しますか？"
			/>

			{/* カスタム装備名前変更モーダル */}
			{renameModal.equipmentId && (
				<RenameEquipmentModal
					isOpen={renameModal.isOpen}
					onClose={onRenameCancel}
					onConfirm={onRenameConfirm}
					currentName={renameModal.currentName}
					equipmentId={renameModal.equipmentId}
				/>
			)}

			{/* メッセージモーダル */}
			<MessageModal
				isOpen={messageModal.isOpen}
				onClose={onMessageClose}
				message={messageModal.message}
			/>
		</>
	)
}