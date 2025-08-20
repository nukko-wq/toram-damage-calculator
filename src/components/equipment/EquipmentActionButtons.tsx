'use client'

import type { EquipmentCategory, EquipmentSlots } from '@/types/calculator'

interface EquipmentActionButtonsProps {
	activeTab: keyof EquipmentSlots | 'register'
	equipment: any // 装備データ
	equipmentSlots: Array<{
		key: keyof EquipmentSlots | 'register'
		label: string
	}>
	onEquipmentModalOpen: () => void
	onCreateEquipment: () => void
	onRenameEquipment: () => void
	onDeleteEquipment: () => void
}

export default function EquipmentActionButtons({
	activeTab,
	equipment,
	equipmentSlots,
	onEquipmentModalOpen,
	onCreateEquipment,
	onRenameEquipment,
	onDeleteEquipment,
}: EquipmentActionButtonsProps) {
	return (
		<>
			<div className="flex gap-2">
				{/* プリセット選択ボタンを表示 - 自由入力スロットは「なし」とカスタム装備のみ選択可能 */}
				<button
					type="button"
					onClick={onEquipmentModalOpen}
					className="px-3 py-2 text-sm text-left border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors min-w-[200px]"
				>
					{equipment?.name ? (
						<div className="flex items-center justify-between">
							<span className="text-sm truncate text-gray-900">
								{equipment.name}
							</span>
							<svg
								className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-label="選択メニューを開く"
							>
								<title>選択メニューを開く</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 9l-7 7-7-7"
								/>
							</svg>
						</div>
					) : (
						<div className="flex items-center justify-between">
							<span className="text-gray-500">
								{!equipment?.id || !equipment?.name
									? 'なし'
									: ['freeInput1', 'freeInput2', 'freeInput3'].includes(
												activeTab,
											)
										? '装備選択'
										: 'プリセット選択'}
							</span>
							<svg
								className="w-4 h-4 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-label="選択メニューを開く"
							>
								<title>選択メニューを開く</title>
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

				{/* カスタム機能ボタンを表示 - 全スロットで常に表示 */}
				<button
					type="button"
					onClick={onCreateEquipment}
					className="px-3 py-1 text-sm bg-rose-400/80 text-white rounded-md hover:bg-rose-400 transition-colors cursor-pointer"
					title="新規カスタム装備を作成"
				>
					新規作成
				</button>

				{equipment?.id &&
					equipment &&
					'isCustom' in equipment &&
					equipment?.isCustom && (
						<>
							<button
								type="button"
								onClick={onRenameEquipment}
								className="px-3 py-1 text-sm bg-stone-400/80 text-white rounded-md hover:bg-stone-400 transition-colors cursor-pointer"
								title="選択中のカスタム装備の名前を変更"
							>
								名前変更
							</button>
							<button
								type="button"
								onClick={onDeleteEquipment}
								className="px-3 py-1 text-sm bg-gray-400/80 text-white rounded-md hover:bg-gray-400 transition-colors cursor-pointer"
								title="選択中のカスタム装備を削除"
							>
								削除
							</button>
						</>
					)}
			</div>
			<div className="flex mt-3">
				<p className="text-xs text-gray-600 font-semibold">
					※各装備は任意の値に変更できます。
				</p>
			</div>
		</>
	)
}
