'use client'

import type { MenuSection } from './hooks/useFloatingMenu'
import SaveDataContent from './content/SaveDataContent'

interface MenuContentProps {
	activeSection: MenuSection
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
	return (
		<div className="p-4">
			<h3 className="text-lg font-semibold text-gray-900 mb-4">サブシステム</h3>
			<div className="text-sm text-gray-600">
				<p>追加ツールや計算機能がここに表示されます。</p>
				<p className="mt-2 text-xs">※この機能は今後実装予定です</p>
			</div>
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

export default function MenuContent({ activeSection }: MenuContentProps) {
	const renderContent = () => {
		switch (activeSection) {
			case 'top':
				return <TopContent />
			case 'sample':
				return <SampleDataContent />
			case 'save':
				return <SaveDataContent />
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
