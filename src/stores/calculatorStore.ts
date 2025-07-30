import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {
	CalculatorStore,
	DamageCalculationResult,
	CalculationSettings,
} from '@/types/stores'
import type { CalculatorData, EnemyFormData } from '@/types/calculator'
import type { EquipmentSlots } from '@/types/calculator'
import type { BuffSkillFormData } from '@/types/buffSkill'
import {
	createInitialCalculatorData,
	migrateRegisterEffects,
	createInitialPowerOptions,
} from '@/utils/initialData'
// 敵設定はenemySettingsStoreで管理するため、このインポートは削除
import {
	saveCurrentData,
	getCurrentSaveData,
	initializeStorage,
} from '@/utils/saveDataManager'
import { calculateResults } from '@/utils/calculationEngine'
import {
	calculateDamageWithService,
	type DamageCalculationServiceResult,
} from '@/utils/damageCalculationService'
import {
	CALC_RESULT_SETTINGS_KEY,
	type CalculationResultSettings,
} from '@/types/calculationResult'
import {
	isValidCalculatorData,
} from '@/utils/differenceDetection'
import {
	saveCustomEquipment,
	deleteCustomEquipment,
	updateCustomEquipmentProperties,
	updateCustomEquipmentRefinement,
	hasTemporaryEquipments,
	hasEditSessions,
	renameCustomEquipment,
	updateEquipmentArmorType,
} from '@/utils/equipmentDatabase'
import {
	createTemporaryCustomEquipment,
	cleanupAllTemporaryEquipments,
	getAllTemporaryEquipments,
	convertTemporaryEquipmentToPersistent,
} from '@/utils/temporaryEquipmentManager'
import {
	cleanupAllEditSessions,
	cleanupCurrentEditSessions,
	getAllEditSessionEquipments,
} from '@/utils/editSessionManager'
import { createInitialEquipment } from '@/utils/initialData'

// 初期計算設定
const initialCalculationSettings: CalculationSettings = {
	includeBuffs: true,
	useAverageDamage: false,
	calculateCritical: true,
}

// シンプルなデータ更新ヘルパー
const createDataUpdate = (set: any, get: any) => {
	return (dataUpdates: Partial<CalculatorData>, actionName: string) => {
		set(
			(state: CalculatorStore) => {
				const newData = { ...state.data, ...dataUpdates }

				// データ更新時に計算結果も自動更新
				const results = calculateResults(newData)

				return {
					data: newData,
					hasUnsavedChanges: true, // データ変更時は常に未保存状態
					calculationResults: results, // 計算結果を自動更新
					baselineDamageResult: null, // データ更新時はクリア
				}
			},
			false,
			actionName,
		)
	}
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

			// ===== 削除された差分検知システム =====
			// lastSavedData: null,
			// lastSavedUIState: null,
			// hasRealChanges: false,

			// ===== ステータス計算結果表示 =====
			calculationResults: null,
			isCalculationResultVisible: false,

			// ===== ダメージ計算結果キャッシュ =====
			baselineDamageResult: null,

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
				// powerOptionsが存在しない場合はデフォルト値で補完
				const migratedData = {
					...data,
					powerOptions: data.powerOptions || createInitialPowerOptions(),
					adaptationMultiplier: data.adaptationMultiplier ?? 100, // 慣れ倍率のマイグレーション
				}
				set({ data: migratedData }, false, 'setData')
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

			// ===== 削除された差分検知メソッド =====
			// updateLastSavedData: (data) => {...},
			// checkForRealChanges: () => {...},
			// updateLastSavedUIState: (saveId) => {...},
			// setHasRealChanges: (value) => {...},

			// ===== セーブデータ管理 =====
			loadSaveData: async (data) => {
				// セーブデータ切り替え時に仮データをクリーンアップ
				cleanupAllTemporaryEquipments()

				// 編集セッションは全てクリーンアップ（セーブデータ切り替え時は編集状態をリセット）
				cleanupAllEditSessions()

				// データ整合性チェック
				const validData = isValidCalculatorData(data)
					? (() => {
							// 既存データのレジスタ効果を移行（新効果があれば追加）
							const migratedData = { ...data }
							if (migratedData.register) {
								migratedData.register = migrateRegisterEffects(
									migratedData.register,
								)
							}
							// 慣れ倍率のマイグレーション
							if (migratedData.adaptationMultiplier === undefined) {
								migratedData.adaptationMultiplier = 100
							}
							return migratedData
						})()
					: (() => {
							console.warn(
								'読み込みデータが無効です。デフォルトデータを使用します。',
							)
							return createInitialCalculatorData()
						})()

				// 計算結果を更新
				const results = calculateResults(validData)

				// データを設定
				set({
					data: validData,
					hasUnsavedChanges: false,
					calculationResults: results, // 計算結果も更新
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

					// 保存完了後、未保存フラグをリセット
					set({
						hasUnsavedChanges: false,
					})
				} catch (error) {
					console.error('データ保存エラー:', error)
					throw error
				}
			},

			// checkUIChanges: 削除（差分検知機能の一部）

			// ===== 個別フォーム更新 =====
			updateBaseStats: (stats) => {
				const dataUpdate = createDataUpdate(set, get)
				dataUpdate({ baseStats: stats }, 'updateBaseStats')
			},

			updateMainWeapon: (weapon) => {
				const dataUpdate = createDataUpdate(set, get)
				dataUpdate({ mainWeapon: weapon }, 'updateMainWeapon')
			},

			updateSubWeapon: (weapon) => {
				const dataUpdate = createDataUpdate(set, get)
				dataUpdate({ subWeapon: weapon }, 'updateSubWeapon')
			},

			updateCrystals: (crystals) => {
				const dataUpdate = createDataUpdate(set, get)
				dataUpdate({ crystals }, 'updateCrystals')
			},

			updateEquipment: (equipment) => {
				const dataUpdate = createDataUpdate(set, get)
				dataUpdate({ equipment }, 'updateEquipment')
			},

			updateFood: (food) => {
				const dataUpdate = createDataUpdate(set, get)
				dataUpdate({ food }, 'updateFood')
			},

			updateEnemy: (enemy) => {
				// 敵設定はEnemyFormコンポーネント側でenemySettingsStoreに直接保存される
				// ここでは個別データ（敵選択情報）のみ保存
				const dataUpdate = createDataUpdate(set, get)
				dataUpdate(
					{
						enemy: {
							selectedEnemyId: enemy.selectedId,
							enemyType: enemy.type,
							lastSelectedAt: enemy.selectedId
								? new Date().toISOString()
								: undefined,
						},
					},
					'updateEnemy',
				)
			},

			updateAttackSkill: (attackSkill) => {
				const dataUpdate = createDataUpdate(set, get)
				dataUpdate({ attackSkill }, 'updateAttackSkill')
			},

			updateBuffSkills: (buffSkills) => {
				const dataUpdate = createDataUpdate(set, get)
				dataUpdate({ buffSkills }, 'updateBuffSkills')
			},

			updateBuffSkillState: (skillId, state) => {
				const { data } = get()
				const buffSkillsData = data.buffSkills.skills

				let updatedSkills: Record<
					string,
					import('@/types/buffSkill').BuffSkillState
				>

				// Handle both old array format and new Record format
				if (Array.isArray(buffSkillsData)) {
					// Convert array format to Record format
					updatedSkills = {}
					for (const skill of buffSkillsData) {
						if (skill.id === skillId) {
							updatedSkills[skillId] = state
						} else {
							updatedSkills[skill.id] = {
								isEnabled: skill.isEnabled,
								level: skill.parameters.skillLevel || 10,
								stackCount: skill.parameters.stackCount || 1,
								specialParam: skill.parameters.playerCount || 0,
							}
						}
					}
					// Add new skill if it doesn't exist
					if (!updatedSkills[skillId]) {
						updatedSkills[skillId] = state
					}
				} else {
					// New format: Record<string, BuffSkillState>
					const currentSkills = buffSkillsData as Record<
						string,
						import('@/types/buffSkill').BuffSkillState
					>
					updatedSkills = {
						...currentSkills,
						[skillId]: state,
					}
				}

				const updatedBuffSkills: BuffSkillFormData = {
					skills: updatedSkills,
				}

				const dataUpdate = createDataUpdate(set, get)
				dataUpdate(
					{ buffSkills: updatedBuffSkills },
					`updateBuffSkillState:${skillId}`,
				)
			},

			updateSkillParameter: (skillId, paramType, value) => {
				const { data } = get()
				const buffSkillsData = data.buffSkills.skills

				let updatedSkills: Record<
					string,
					import('@/types/buffSkill').BuffSkillState
				>

				// Handle both old array format and new Record format
				if (Array.isArray(buffSkillsData)) {
					// Convert array format to Record format
					updatedSkills = {}
					for (const skill of buffSkillsData) {
						if (skill.id === skillId) {
							const currentState = {
								isEnabled: skill.isEnabled,
								level: skill.parameters.skillLevel || 10,
								stackCount: skill.parameters.stackCount || 1,
								specialParam: skill.parameters.playerCount || 0,
							}
							updatedSkills[skillId] = {
								...currentState,
								[paramType]: value,
							}
						} else {
							updatedSkills[skill.id] = {
								isEnabled: skill.isEnabled,
								level: skill.parameters.skillLevel || 10,
								stackCount: skill.parameters.stackCount || 1,
								specialParam: skill.parameters.playerCount || 0,
							}
						}
					}
					// Add new skill if it doesn't exist
					if (!updatedSkills[skillId]) {
						updatedSkills[skillId] = {
							isEnabled: false,
							level: 10,
							stackCount: 1,
							specialParam: 0,
							[paramType]: value,
						}
					}
				} else {
					// New format: Record<string, BuffSkillState>
					const currentSkills = buffSkillsData as Record<
						string,
						import('@/types/buffSkill').BuffSkillState
					>
					const currentSkillState = currentSkills[skillId] || {
						isEnabled: false,
						level: 10,
						stackCount: 1,
						specialParam: 0,
					}

					const updatedSkillState = {
						...currentSkillState,
						[paramType]: value,
					}

					updatedSkills = {
						...currentSkills,
						[skillId]: updatedSkillState,
					}
				}

				const updatedBuffSkills: BuffSkillFormData = {
					skills: updatedSkills,
				}

				const dataUpdate = createDataUpdate(set, get)
				dataUpdate(
					{ buffSkills: updatedBuffSkills },
					`updateSkillParameter:${skillId}:${paramType}`,
				)
			},

			updateBuffItems: (buffItems) => {
				const dataUpdate = createDataUpdate(set, get)
				dataUpdate({ buffItems }, 'updateBuffItems')
			},

			updateRegister: (register) => {
				const dataUpdate = createDataUpdate(set, get)
				dataUpdate({ register }, 'updateRegister')
			},

			updatePowerOptions: (powerOptions) => {
				const dataUpdate = createDataUpdate(set, get)
				dataUpdate({ powerOptions }, 'updatePowerOptions')
			},

			updateAdaptationMultiplier: (adaptationMultiplier: number) => {
				const dataUpdate = createDataUpdate(set, get)
				dataUpdate({ adaptationMultiplier }, 'updateAdaptationMultiplier')
			},

			updateRegisterEffect: (effectId, enabled) => {
				const { data } = get()
				const updatedRegister = {
					...data.register,
					effects: data.register.effects.map((effect) =>
						effect.id === effectId ? { ...effect, isEnabled: enabled } : effect,
					),
				}
				const dataUpdate = createDataUpdate(set, get)
				dataUpdate({ register: updatedRegister }, 'updateRegisterEffect')
			},

			updateRegisterLevel: (effectId, level, partyMembers) => {
				const { data } = get()
				const updatedRegister = {
					...data.register,
					effects: data.register.effects.map((effect) =>
						effect.id === effectId
							? {
									...effect,
									level,
									...(partyMembers !== undefined && { partyMembers }),
								}
							: effect,
					),
				}
				const dataUpdate = createDataUpdate(set, get)
				dataUpdate({ register: updatedRegister }, 'updateRegisterLevel')
			},

			resetRegisterData: () => {
				const { data } = get()
				const resetRegister = {
					effects: data.register.effects.map((effect) => ({
						...effect,
						isEnabled: false,
						level: 1,
						...(effect.type === 'fateCompanionship' && {
							partyMembers: 3,
						}),
					})),
				}
				const dataUpdate = createDataUpdate(set, get)
				dataUpdate({ register: resetRegister }, 'resetRegisterData')
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
						// データベースレイヤーでの変更を検知するため、差分チェックを強制実行
						const dataUpdate = createDataUpdate(set, get)
						dataUpdate({}, 'updateCustomEquipmentProperties')
					}
					return success
				} catch (error) {
					console.error('カスタム装備プロパティ更新エラー:', error)
					throw error
				}
			},

			// カスタム装備の精錬値を更新
			updateCustomEquipmentRefinement: async (equipmentId, refinement) => {
				try {
					const success = updateCustomEquipmentRefinement(
						equipmentId,
						refinement,
					)
					if (success) {
						// データベースレイヤーでの変更を検知するため、差分チェックを強制実行
						const dataUpdate = createDataUpdate(set, get)
						dataUpdate({}, 'updateCustomEquipmentRefinement')
					}
					return success
				} catch (error) {
					console.error('カスタム装備精錬値更新エラー:', error)
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
					hasRealChanges: get().hasUnsavedChanges, // 差分検知削除により、hasUnsavedChangesと同一
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

			updateEquipmentArmorType: async (equipmentId, armorType) => {
				try {
					const success = updateEquipmentArmorType(equipmentId, armorType)
					if (success) {
						const { data } = get()
						// 体装備のIDが一致する場合、ストアの装備データを更新
						if (data.equipment.body?.id === equipmentId) {
							const updatedEquipment = {
								...data.equipment,
								body: {
									...data.equipment.body,
									armorType,
								},
							}
							// 差分検知システムを使用してデータを更新
							const dataUpdate = createDataUpdate(set, get)
							dataUpdate(
								{ equipment: updatedEquipment },
								'updateEquipmentArmorType',
							)
						} else {
							// 体装備以外やカスタム装備の場合も差分チェックを強制実行
							// データベースレイヤーでの変更を検知するため、空の更新をトリガー
							const dataUpdate = createDataUpdate(set, get)
							dataUpdate({}, 'updateEquipmentArmorType')
						}
					}
					return success
				} catch (error) {
					console.error('ArmorType更新エラー:', error)
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

			// ===== ダメージ計算結果キャッシュアクション =====
			updateBaselineDamageResult: () => {
				const { data, calculationResults } = get()
				
				if (!calculationResults) {
					// 基本計算結果がない場合は先に計算
					const results = calculateResults(data)
					set({ calculationResults: results })
				}

				try {
					// powerOptionsを取得（フォールバック付き）
					const powerOptions = data.powerOptions || createInitialPowerOptions()
					
					// 基準ダメージを計算してキャッシュ
					const damageResult = calculateDamageWithService(
						data,
						get().calculationResults || calculateResults(data),
						{ powerOptions, debug: false }
					)
					
					set({ baselineDamageResult: damageResult })
				} catch (error) {
					console.error('基準ダメージ計算エラー:', error)
					set({ baselineDamageResult: null })
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

					// 敵設定ストアの初期化
					const { useEnemySettingsStore } = await import('./enemySettingsStore')
					useEnemySettingsStore.getState().loadFromLocalStorage()

					// レジスタ効果の移行（新効果があれば追加）
					const migratedData = { ...currentSave.data }
					if (migratedData.register) {
						migratedData.register = migrateRegisterEffects(
							migratedData.register,
						)
					}
					// 慣れ倍率のマイグレーション（初期化時）
					if (migratedData.adaptationMultiplier === undefined) {
						migratedData.adaptationMultiplier = 100
					}

					// 初期化時のデータ設定
					set({
						data: migratedData,
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
