'use client'

import { useState } from 'react'
import ArmorTypeSelect from '@/components/ui/ArmorTypeSelect'
import { useCalculatorStore } from '@/stores'
import type {
	ArmorType,
	Equipment,
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
import EquipmentModals from './EquipmentModals'
import PropertyEditor from './PropertyEditor'
import { RegisterForm } from './RegisterForm'
import WeaponInfoManager from './WeaponInfoManager'

interface EquipmentFormProps {
	// Zustand移行後は不要（後方互換性のため残存）
	equipment?: EquipmentSlots
	onEquipmentChange?: (equipment: EquipmentSlots) => void
}

export default function EquipmentForm({
	equipment: _equipment,
	onEquipmentChange,
}: EquipmentFormProps) {
	// Zustandストアから装備データを取得
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

	// Zustandストアの値を使用（完全移行）
	const effectiveEquipment = storeEquipment
	const [activeTab, setActiveTab] = useState<keyof EquipmentSlots | 'register'>(
		'mainWeapon',
	)
	const [modalState, setModalState] = useState<{
		isOpen: boolean
		category: EquipmentCategory | null
		title: string
	}>({
		isOpen: false,
		category: null,
		title: '',
	})

	// カスタム装備関連のモーダル状態
	const [createModalState, setCreateModalState] = useState<{
		isOpen: boolean
		equipmentType: keyof EquipmentSlots | null
	}>({
		isOpen: false,
		equipmentType: null,
	})

	const [deleteModalState, setDeleteModalState] = useState<{
		isOpen: boolean
		equipmentId: string | null
		equipmentName: string
	}>({
		isOpen: false,
		equipmentId: null,
		equipmentName: '',
	})

	const [renameModalState, setRenameModalState] = useState<{
		isOpen: boolean
		equipmentId: string | null
		currentName: string
	}>({
		isOpen: false,
		equipmentId: null,
		currentName: '',
	})

	// メッセージモーダル状態
	const [messageModalState, setMessageModalState] = useState<{
		isOpen: boolean
		message: string
	}>({
		isOpen: false,
		message: '',
	})

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

	const handleEquipmentPropertyChange = (
		slotKey: keyof EquipmentSlots,
		property: keyof EquipmentProperties,
		value: string,
	) => {
		const numValue = Number.parseInt(value) || 0
		const currentEquipment = effectiveEquipment[slotKey]

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
			...effectiveEquipment,
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

	const handlePresetEquipmentSelect = (equipmentId: string | null) => {
		if (!modalState.category) return

		const slotKey = modalState.category as keyof EquipmentSlots

		if (equipmentId === null) {
			// 装備なしを選択
			const updatedEquipment = {
				...effectiveEquipment,
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
					...effectiveEquipment,
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

				// 後方互換性のため従来のonChangeも呼び出し
				if (onEquipmentChange) {
					onEquipmentChange(updatedEquipment)
				}
			}
		}
	}

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
		const equipment = effectiveEquipment[slotKey]
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
		const equipment = effectiveEquipment[slotKey]
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
		const currentEquipment = effectiveEquipment.body
		if (!currentEquipment?.id) return

		// armorTypeStorageに直接保存
		saveArmorType(currentEquipment.id, newArmorType)

		// UIを更新するため、装備データを再読み込み
		const updatedEquipment = { ...effectiveEquipment }
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
		const updatedEquipment = { ...effectiveEquipment }
		updateEquipment(updatedEquipment)
	}

	return (
		<section className="bg-white rounded-lg shadow-md p-6 md:col-start-1 md:col-end-9 md:row-start-2 md:row-end-3 xl:col-start-3 xl:col-end-4 xl:row-start-1 xl:row-end-4">
			<h2 className="text-xl font-bold text-gray-800 mb-4">装備/プロパティ</h2>

			{/* タブヘッダー */}
			<div className="mb-6">
				<nav className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
					{equipmentSlots.map(({ key, label }) => (
						<button
							key={key}
							type="button"
							onClick={() => setActiveTab(key)}
							className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
								activeTab === key
									? 'bg-blue-500/80 text-white'
									: 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
							}`}
						>
							{label}
						</button>
					))}
				</nav>
			</div>

			{/* タブコンテンツ */}
			{activeTab === 'register' ? (
				/* レジスタ他フォーム */
				<RegisterForm />
			) : (
				<>
					<div className="flex gap-2">
						{/* プリセット選択ボタンを表示 - 自由入力スロットは「なし」とカスタム装備のみ選択可能 */}
						<button
							type="button"
							onClick={() =>
								openEquipmentModal(
									activeTab as EquipmentCategory,
									effectiveEquipment[activeTab]?.name ||
										`${equipmentSlots.find((slot) => slot.key === activeTab)?.label}を選択`,
								)
							}
							className="px-3 py-2 text-sm text-left border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors min-w-[200px]"
						>
							{effectiveEquipment[activeTab]?.name ? (
								<div className="flex items-center justify-between">
									<span className="text-sm truncate text-gray-900">
										{effectiveEquipment[activeTab]?.name}
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
										{!effectiveEquipment[activeTab]?.id ||
										!effectiveEquipment[activeTab]?.name
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
							onClick={() => handleCreateEquipment(activeTab)}
							className="px-3 py-1 text-sm bg-rose-400/80 text-white rounded-md hover:bg-rose-400 transition-colors cursor-pointer"
							title="新規カスタム装備を作成"
						>
							新規作成
						</button>
						{effectiveEquipment[activeTab]?.id &&
							effectiveEquipment[activeTab] &&
							'isCustom' in effectiveEquipment[activeTab] &&
							effectiveEquipment[activeTab]?.isCustom && (
								<>
									<button
										type="button"
										onClick={() => handleRenameEquipment(activeTab)}
										className="px-3 py-1 text-sm bg-stone-400/80 text-white rounded-md hover:bg-stone-400 transition-colors cursor-pointer"
										title="選択中のカスタム装備の名前を変更"
									>
										名前変更
									</button>
									<button
										type="button"
										onClick={() => handleDeleteEquipment(activeTab)}
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