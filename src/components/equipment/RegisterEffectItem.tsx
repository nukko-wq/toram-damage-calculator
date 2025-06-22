'use client'

import ToggleSwitch from '@/components/ui/ToggleSwitch'
import type { RegisterEffect } from '@/types/calculator'

interface RegisterEffectItemProps {
	effect: RegisterEffect
	onToggle: (effectId: string, enabled: boolean) => void
	onOpenLevelModal: (effectId: string) => void
}

export function RegisterEffectItem({
	effect,
	onToggle,
	onOpenLevelModal,
}: RegisterEffectItemProps) {
	const handleToggle = (checked: boolean) => {
		onToggle(effect.id, checked)
	}

	const handleNameClick = () => {
		onOpenLevelModal(effect.id)
	}

	const getLevelDisplay = () => {
		if (effect.type === 'fateCompanionship') {
			return `Lv.${effect.level} (パーティ${effect.partyMembers || 3}人)`
		}
		return `Lv.${effect.level}`
	}

	return (
		<div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors">
			<div className="flex items-center space-x-3 flex-1">
				{/* オン/オフ切り替えスイッチ */}
				<ToggleSwitch
					checked={effect.isEnabled}
					onChange={handleToggle}
					size="sm"
				/>

				{/* エフェクト名とレベル表示 */}
				<div className="flex-1">
					<button
						type="button"
						onClick={handleNameClick}
						className="p-0 text-left hover:text-blue-600 transition-colors cursor-pointer"
					>
						<div>
							<div className="font-medium text-slate-900">{effect.name}</div>
							<div className="text-sm text-slate-500">{getLevelDisplay()}</div>
						</div>
					</button>
				</div>
			</div>

			{/* 有効状態インジケーター */}
			<div className="shrink-0">
				{effect.isEnabled ? (
					<div className="w-2 h-2 bg-green-500 rounded-full"></div>
				) : (
					<div className="w-2 h-2 bg-slate-300 rounded-full"></div>
				)}
			</div>
		</div>
	)
}
