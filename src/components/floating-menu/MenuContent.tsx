'use client'

import { useUIStore } from '@/stores/uiStore'
import SaveDataContent from './content/SaveDataContent'
import SubsystemMenu from './content/subsystem/SubsystemMenu'
import type { MenuSection } from './hooks/useFloatingMenu'

interface MenuContentProps {
	activeSection: MenuSection
	onClose: () => void
}

function TopContent() {
	return (
		<div className="p-4">
			<h3 className="text-lg font-semibold text-gray-900 mb-4">
				ダッシュボード
			</h3>
			<div className="space-y-4">
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
					<h4 className="text-sm font-medium text-blue-900 mb-2">
						アプリケーション情報
					</h4>
					<p className="text-sm text-blue-700">Toram Online ダメージ計算機</p>
					<p className="text-xs text-blue-600 mt-1">Version 1.0.0</p>
				</div>
				<div className="text-sm text-gray-600">
					<p>最近の活動や統計情報がここに表示されます。</p>
					<p className="mt-2 text-xs">※この機能は今後実装予定です</p>
				</div>
			</div>
		</div>
	)
}

function SampleDataContent() {
	return (
		<div className="p-4">
			<h3 className="text-lg font-semibold text-gray-900 mb-4">
				サンプルデータ
			</h3>
			<div className="text-sm text-gray-600">
				<p>プリセットデータの読み込み機能がここに表示されます。</p>
				<p className="mt-2 text-xs">※この機能は今後実装予定です</p>
			</div>
		</div>
	)
}

function SubsystemContent() {
	const openFullScreenModal = useUIStore((state) => state.openFullScreenModal)

	const handleItemClick = (itemId: string) => {
		switch (itemId) {
			case 'crystal_custom':
				openFullScreenModal('crystal', '装備品のカスタム設定')
				break
			case 'enemy_custom':
				// 将来実装
				console.log('Enemy custom - coming soon')
				break
			default:
				console.log('Unknown item:', itemId)
		}
	}

	return (
		<div className="p-4">
			<h3 className="text-lg font-semibold text-gray-900 mb-4">サブシステム</h3>
			<SubsystemMenu onItemClick={handleItemClick} />
		</div>
	)
}

function SettingsContent() {
	return (
		<div className="p-4">
			<h3 className="text-lg font-semibold text-gray-900 mb-4">設定</h3>
			<div className="text-sm text-gray-600">
				<p>アプリケーション設定がここに表示されます。</p>
				<p className="mt-2 text-xs">※この機能は今後実装予定です</p>
			</div>
		</div>
	)
}

export default function MenuContent({
	activeSection,
	onClose,
}: MenuContentProps) {
	const renderContent = () => {
		switch (activeSection) {
			case 'top':
				return <TopContent />
			case 'sample':
				return <SampleDataContent />
			case 'save':
				return <SaveDataContent onClose={onClose} />
			case 'subsystem':
				return <SubsystemContent />
			case 'settings':
				return <SettingsContent />
			default:
				return <TopContent />
		}
	}

	return (
		<div className="flex-1 bg-white overflow-y-auto">{renderContent()}</div>
	)
}
