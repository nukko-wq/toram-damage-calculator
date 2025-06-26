import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {
	CalculatorStore,
	DamageCalculationResult,
	CalculationSettings,
} from '@/types/stores'
import type { EquipmentSlots } from '@/types/calculator'
import { createInitialCalculatorData } from '@/utils/initialData'
import {
	saveCurrentData,
	getCurrentSaveData,
	initializeStorage,
} from '@/utils/saveDataManager'
import { calculateResults } from '@/utils/calculationEngine'
import {
	CALC_RESULT_SETTINGS_KEY,
	type CalculationResultSettings,
} from '@/types/calculationResult'
import {
	createCustomEquipment,
	saveCustomEquipment,
	deleteCustomEquipment,
	updateCustomEquipmentProperties,
	hasTemporaryEquipments,
	hasEditSessions,
	renameCustomEquipment,
} from '@/utils/equipmentDatabase'
import {
	createTemporaryCustomEquipment,
	cleanupAllTemporaryEquipments,
	getAllTemporaryEquipments,
	convertTemporaryEquipmentToPersistent,
	isTemporaryEquipment,
} from '@/utils/temporaryEquipmentManager'
import {
	cleanupAllEditSessions,
	cleanupCurrentEditSessions,
	getAllEditSessionEquipments,
	convertAllEditSessionsToPersistent,
	setCurrentSaveDataId,
} from '@/utils/editSessionManager'
import { createInitialEquipment } from '@/utils/initialData'

// 初期計算設定
const initialCalculationSettings: CalculationSettings = {
	includeBuffs: true,
	useAverageDamage: false,
	calculateCritical: true,
}

export const useCalculatorStore = create<CalculatorStore>()(
	devtools(
		(set, get) => ({
			// ===== 初期状態 =====
			data: createInitialCalculatorData(),
			hasUnsavedChanges: false,
			isLoading: false,
			isInitialized: false,
			calculationResult: null,
			isCalculating: false,
			calculationSettings: initialCalculationSettings,

			// ===== ステータス計算結果表示 =====
			calculationResults: null,
			isCalculationResultVisible: false,

			// ===== 基本アクション =====
			updateData: (updates) => {
				set(
					(state) => ({
						data: { ...state.data, ...updates },
						hasUnsavedChanges: true,
					}),
					false,
					'updateData',
				)
			},

			setData: (data) => {
				set({ data }, false, 'setData')
			},

			resetUnsavedChanges: () => {
				set({ hasUnsavedChanges: false }, false, 'resetUnsavedChanges')
			},

			setHasUnsavedChanges: (value) => {
				set({ hasUnsavedChanges: value }, false, 'setHasUnsavedChanges')
			},

			setIsLoading: (value) => {
				set({ isLoading: value }, false, 'setIsLoading')
			},

			// ===== セーブデータ管理 =====
			loadSaveData: async (data) => {
				// セーブデータ切り替え時に仮データをクリーンアップ
				cleanupAllTemporaryEquipments()

				// 編集セッションは全てクリーンアップ（セーブデータ切り替え時は編集状態をリセット）
				cleanupAllEditSessions()

				// isLoadingを使わずに直接データを更新（ちらつき防止）
				set({
					data,
					hasUnsavedChanges: false,
				})

				// フォームの変更検知を同期的に無効化（遅延によるちらつきを防止）
				// setTimeout削除により、より予測可能な状態管理を実現
			},

			saveCurrentData: async () => {
				try {
					// 仮データと編集セッションを永続化
					await get().saveTemporaryCustomEquipments()
					await get().saveEditSessions()

					const { data } = get()
					await saveCurrentData(data)
					set({ hasUnsavedChanges: false })
				} catch (error) {
					console.error('データ保存エラー:', error)
					throw error
				}
			},

			// ===== 個別フォーム更新 =====
			updateBaseStats: (stats) => {
				set(
					(state) => ({
						data: { ...state.data, baseStats: stats },
						hasUnsavedChanges: true,
					}),
					false,
					'updateBaseStats',
				)
			},

			updateMainWeapon: (weapon) => {
				set(
					(state) => ({
						data: { ...state.data, mainWeapon: weapon },
						hasUnsavedChanges: true,
					}),
					false,
					'updateMainWeapon',
				)
			},

			updateSubWeapon: (weapon) => {
				set(
					(state) => ({
						data: { ...state.data, subWeapon: weapon },
						hasUnsavedChanges: true,
					}),
					false,
					'updateSubWeapon',
				)
			},

			updateCrystals: (crystals) => {
				set(
					(state) => ({
						data: { ...state.data, crystals },
						hasUnsavedChanges: true,
					}),
					false,
					'updateCrystals',
				)
			},

			updateEquipment: (equipment) => {
				set(
					(state) => ({
						data: { ...state.data, equipment },
						hasUnsavedChanges: true,
					}),
					false,
					'updateEquipment',
				)
			},

			updateFood: (food) => {
				set(
					(state) => ({
						data: { ...state.data, food },
						hasUnsavedChanges: true,
					}),
					false,
					'updateFood',
				)
			},

			updateEnemy: (enemy) => {
				set(
					(state) => ({
						data: { ...state.data, enemy },
						hasUnsavedChanges: true,
					}),
					false,
					'updateEnemy',
				)
			},

			updateBuffSkills: (buffSkills) => {
				set(
					(state) => ({
						data: { ...state.data, buffSkills },
						hasUnsavedChanges: true,
					}),
					false,
					'updateBuffSkills',
				)
			},

			updateBuffItems: (buffItems) => {
				set(
					(state) => ({
						data: { ...state.data, buffItems },
						hasUnsavedChanges: true,
					}),
					false,
					'updateBuffItems',
				)
			},

			updateRegister: (register) => {
				set(
					(state) => ({
						data: { ...state.data, register },
						hasUnsavedChanges: true,
					}),
					false,
					'updateRegister',
				)
			},

			updateRegisterEffect: (effectId, enabled) => {
				set(
					(state) => ({
						data: {
							...state.data,
							register: {
								...state.data.register,
								effects: state.data.register.effects.map((effect) =>
									effect.id === effectId
										? { ...effect, isEnabled: enabled }
										: effect,
								),
							},
						},
						hasUnsavedChanges: true,
					}),
					false,
					'updateRegisterEffect',
				)
			},

			updateRegisterLevel: (effectId, level, partyMembers) => {
				set(
					(state) => ({
						data: {
							...state.data,
							register: {
								...state.data.register,
								effects: state.data.register.effects.map((effect) =>
									effect.id === effectId
										? {
												...effect,
												level,
												...(partyMembers !== undefined && { partyMembers }),
											}
										: effect,
								),
							},
						},
						hasUnsavedChanges: true,
					}),
					false,
					'updateRegisterLevel',
				)
			},

			resetRegisterData: () => {
				set(
					(state) => ({
						data: {
							...state.data,
							register: {
								effects: state.data.register.effects.map((effect) => ({
									...effect,
									isEnabled: false,
									level: 1,
									...(effect.type === 'fateCompanionship' && {
										partyMembers: 3,
									}),
								})),
							},
						},
						hasUnsavedChanges: true,
					}),
					false,
					'resetRegisterData',
				)
			},

			// ===== カスタム装備管理 =====
			createTemporaryCustomEquipment: async (equipmentCategory, name) => {
				try {
					// 仮データとしてカスタム装備を作成（LocalStorageには保存しない）
					const temporaryEquipment = createTemporaryCustomEquipment(
						name,
						equipmentCategory,
					)

					// 作成した仮データ装備を自動的に装備スロットにセット
					const equipmentCategoryToSlotMap: Record<
						string,
						keyof EquipmentSlots
					> = {
						main: 'main',
						body: 'body',
						additional: 'additional',
						special: 'special',
						subWeapon: 'subWeapon',
						fashion1: 'fashion1',
						fashion2: 'fashion2',
						fashion3: 'fashion3',
						freeInput1: 'freeInput1',
						freeInput2: 'freeInput2',
						freeInput3: 'freeInput3',
					}

					const slotKey = equipmentCategoryToSlotMap[equipmentCategory]
					if (slotKey) {
						set(
							(state) => ({
								data: {
									...state.data,
									equipment: {
										...state.data.equipment,
										[slotKey]: {
											id: temporaryEquipment.id,
											name: temporaryEquipment.name,
											properties: {},
											isPreset: false,
											isCustom: true,
										},
									},
								},
								hasUnsavedChanges: true,
							}),
							false,
							'createTemporaryCustomEquipment',
						)
					}
				} catch (error) {
					console.error('仮データ装備作成エラー:', error)
					throw error
				}
			},

			// 仮データを永続化（「現在のデータを保存」時に呼び出し）
			saveTemporaryCustomEquipments: async () => {
				try {
					const temporaryEquipments = getAllTemporaryEquipments()

					for (const tempEquipment of temporaryEquipments) {
						// 仮データを永続データに変換
						const persistentEquipment = convertTemporaryEquipmentToPersistent(
							tempEquipment.id,
						)
						if (persistentEquipment) {
							// LocalStorageに保存
							saveCustomEquipment(persistentEquipment)
						}
					}

					// 仮データをクリーンアップ
					cleanupAllTemporaryEquipments()
				} catch (error) {
					console.error('仮データ永続化エラー:', error)
					throw error
				}
			},

			// 編集セッションを永続化（「現在のデータを保存」時に呼び出し）
			saveEditSessions: async () => {
				try {
					const editSessionEquipments = getAllEditSessionEquipments()

					for (const editedEquipment of editSessionEquipments) {
						// 編集セッション内容を永続データに反映
						saveCustomEquipment(editedEquipment)
					}

					// 編集セッションを確実にクリーンアップ
					// 保存処理完了後は編集セッションを全てクリアして永続データを優先
					cleanupAllEditSessions()

					// さらに念のため、現在のセーブデータのセッションも個別にクリア
					cleanupCurrentEditSessions()
				} catch (error) {
					console.error('編集セッション永続化エラー:', error)
					throw error
				}
			},

			// プロパティ連動更新
			updateCustomEquipmentProperties: async (equipmentId, properties) => {
				try {
					const success = updateCustomEquipmentProperties(
						equipmentId,
						properties,
					)
					if (success) {
						set(
							(state) => ({ ...state, hasUnsavedChanges: true }),
							false,
							'updateCustomEquipmentProperties',
						)
					}
					return success
				} catch (error) {
					console.error('カスタム装備プロパティ更新エラー:', error)
					throw error
				}
			},

			// 仮データと編集セッションのクリーンアップ
			cleanupTemporaryData: () => {
				cleanupAllTemporaryEquipments()
				cleanupCurrentEditSessions() // 現在のセーブデータに関連する編集セッションのみをクリーンアップ
			},

			// 未保存データの状態を取得
			getUnsavedDataStatus: () => {
				return {
					hasUnsavedChanges: get().hasUnsavedChanges,
					hasTemporaryEquipments: hasTemporaryEquipments(),
					hasEditSessions: hasEditSessions(),
				}
			},

			renameCustomEquipment: async (equipmentId, newName) => {
				try {
					const success = renameCustomEquipment(equipmentId, newName)
					if (success) {
						// 現在選択中の装備がこのIDだった場合、表示名を更新
						const { data } = get()
						const updatedEquipment = { ...data.equipment }
						let hasChanges = false

						Object.keys(updatedEquipment).forEach((key) => {
							const equipmentSlot =
								updatedEquipment[key as keyof typeof updatedEquipment]
							if (equipmentSlot && equipmentSlot.id === equipmentId) {
								updatedEquipment[key as keyof typeof updatedEquipment] = {
									...equipmentSlot,
									name: newName,
								}
								hasChanges = true
							}
						})

						if (hasChanges) {
							set(
								(state) => ({
									data: { ...state.data, equipment: updatedEquipment },
									hasUnsavedChanges: true,
								}),
								false,
								'renameCustomEquipment',
							)
						} else {
							// 装備が選択されていない場合でも未保存変更フラグを設定
							set(
								(state) => ({ ...state, hasUnsavedChanges: true }),
								false,
								'renameCustomEquipment',
							)
						}
					}
					return success
				} catch (error) {
					console.error('カスタム装備名前変更エラー:', error)
					throw error
				}
			},

			deleteCustomEquipment: async (equipmentId) => {
				try {
					// LocalStorageから削除
					deleteCustomEquipment(equipmentId)

					// 現在選択中の装備がこのIDだった場合、選択を解除
					const { data } = get()
					const updatedEquipment = { ...data.equipment }
					let hasChanges = false

					Object.keys(updatedEquipment).forEach((key) => {
						const equipmentSlot =
							updatedEquipment[key as keyof typeof updatedEquipment]
						if (equipmentSlot && equipmentSlot.id === equipmentId) {
							updatedEquipment[key as keyof typeof updatedEquipment] =
								createInitialEquipment()
							hasChanges = true
						}
					})

					if (hasChanges) {
						set(
							(state) => ({
								data: { ...state.data, equipment: updatedEquipment },
								hasUnsavedChanges: true,
							}),
							false,
							'deleteCustomEquipment',
						)
					}
				} catch (error) {
					console.error('カスタム装備削除エラー:', error)
					throw error
				}
			},

			// ===== 将来の計算機能 =====
			calculateDamage: async () => {
				const { data } = get()
				set({ isCalculating: true })

				try {
					// TODO: 実際のダメージ計算ロジックを実装
					// 現在はモック実装
					await new Promise((resolve) => setTimeout(resolve, 500))

					const mockResult: DamageCalculationResult = {
						totalDamage: 1000,
						criticalDamage: 1500,
						averageDamage: 1250,
						hitRate: 95,
						criticalRate: 25,
						details: {
							baseDamage: 800,
							weaponATK: data.mainWeapon.ATK,
							statBonus: data.baseStats.STR * 2,
							equipmentBonus: 100,
							crystalBonus: 50,
							foodBonus: 30,
						},
					}

					set({ calculationResult: mockResult, isCalculating: false })
				} catch (error) {
					console.error('ダメージ計算エラー:', error)
					set({ isCalculating: false })
					throw error
				}
			},

			updateCalculationSettings: (settings) => {
				set(
					(state) => ({
						calculationSettings: { ...state.calculationSettings, ...settings },
					}),
					false,
					'updateCalculationSettings',
				)
			},

			// ===== ステータス計算結果表示アクション =====
			updateCalculationResults: () => {
				const currentData = get().data
				const results = calculateResults(currentData)
				set({ calculationResults: results })
			},

			toggleCalculationResultVisibility: () => {
				const newVisibility = !get().isCalculationResultVisible
				set({ isCalculationResultVisible: newVisibility })

				// LocalStorageに状態を保存
				const settings: CalculationResultSettings = {
					isVisible: newVisibility,
					lastToggleTime: new Date().toISOString(),
				}
				localStorage.setItem(CALC_RESULT_SETTINGS_KEY, JSON.stringify(settings))
			},

			initializeCalculationResultVisibility: () => {
				try {
					const saved = localStorage.getItem(CALC_RESULT_SETTINGS_KEY)
					if (saved) {
						const settings: CalculationResultSettings = JSON.parse(saved)
						set({ isCalculationResultVisible: settings.isVisible })
					}
				} catch (error) {
					console.warn('計算結果表示設定の読み込みに失敗:', error)
					// デフォルトは非表示
					set({ isCalculationResultVisible: false })
				}
			},

			// ===== 初期化 =====
			initialize: async () => {
				try {
					set({ isLoading: true })

					// ストレージ初期化
					await initializeStorage()

					// 現在のセーブデータを読み込み
					const currentSave = getCurrentSaveData()

					// saveDataStoreの初期化も実行
					const { useSaveDataStore } = await import('./saveDataStore')
					await useSaveDataStore.getState().loadSaveDataList()

					set({
						data: currentSave.data,
						hasUnsavedChanges: false,
						isInitialized: true,
						isLoading: false,
					})

					// 計算結果表示設定の初期化（将来実装）
					// const store = get()
					// store.initializeCalculationResultVisibility()
					// store.updateCalculationResults()
				} catch (error) {
					console.error('アプリケーション初期化エラー:', error)
					set({ isInitialized: true, isLoading: false })
					throw error
				}
			},
		}),
		{
			name: 'calculator-store',
		},
	),
)
