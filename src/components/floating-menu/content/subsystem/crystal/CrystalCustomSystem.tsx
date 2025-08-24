'use client'

import { useUIStore } from '@/stores/uiStore'
import FullScreenModal from '../FullScreenModal'
import CrystalConfirmation from './CrystalConfirmation'
import CrystalCustomMain from './CrystalCustomMain'
import CrystalNameInput from './CrystalNameInput'
import CrystalPropertyInput from './CrystalPropertyInput'
import CrystalTypeSelection from './CrystalTypeSelection'

export default function CrystalCustomSystem() {
	const {
		subsystem: { fullScreenModal, navigation },
		closeFullScreenModal,
	} = useUIStore()

	const renderCurrentScreen = () => {
		switch (navigation.currentScreen) {
			case 'main':
				return <CrystalCustomMain />
			case 'type_selection':
				return <CrystalTypeSelection />
			case 'name_input':
				return <CrystalNameInput />
			case 'property_input':
				return <CrystalPropertyInput />
			case 'confirmation':
				return <CrystalConfirmation />
			case 'completion':
				return <div className="p-6 text-center">登録が完了しました！</div>
			default:
				return <CrystalCustomMain />
		}
	}

	return (
		<FullScreenModal
			isOpen={fullScreenModal.isOpen && fullScreenModal.type === 'crystal'}
			onClose={closeFullScreenModal}
			title={fullScreenModal.title}
		>
			{renderCurrentScreen()}
		</FullScreenModal>
	)
}
