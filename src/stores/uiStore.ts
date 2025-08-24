import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { UIStore, CustomType, NavigationScreen, EditMode } from '@/types/stores'
import type { CrystalType, EquipmentProperties } from '@/types/calculator'
import { safeJSONParse } from '@/utils/storage'

// ローカルストレージから初期カテゴリ状態を取得
const getInitialStatusPreviewCategories = (): Record<
	string,
	'base' | 'physical' | 'magical' | 'hybrid' | 'tank'
> => {
	if (typeof window === 'undefined') return {}

	try {
		const stored = localStorage.getItem('ui-store')
		if (stored) {
			const parsed = safeJSONParse(stored, {
				state: { statusPreviewCategories: {} },
			})
			return parsed.state?.statusPreviewCategories || {}
		}
	} catch (error) {
		console.warn(
			'Failed to load status preview categories from localStorage:',
			error,
		)
	}
	return {}
}

export const useUIStore = create<UIStore>()(
	devtools(
		persist(
			(set, get) => ({
				// ===== 初期状態 =====
				showSaveManager: false,
				showUpdateNotifications: false,
				showStatusPreview: false,
				showDamagePreview: false,
				statusPreviewCategories: getInitialStatusPreviewCategories(),
				statusPreviewHeight: 400, // デフォルトの高さ（400px）
				damagePreviewHeight: 600, // デフォルトの高さ（600px）

				// サブシステム関連の初期状態
				subsystem: {
					fullScreenModal: {
						isOpen: false,
						type: null,
						title: '',
					},
					navigation: {
						currentScreen: 'main',
						canGoBack: false,
						canGoNext: false,
					},
					crystalCustom: {
						selectedItems: [],
						editMode: 'create',
						currentEditId: null,
						newRegistration: {
							selectedType: null,
							name: '',
							properties: {},
							validationErrors: {},
						},
						deleteFlow: {
							selectedCrystalId: null,
							isDeleting: false,
							deleteSuccess: null,
						},
					},
				},

				// ===== アクション =====
				setShowSaveManager: (value) => {
					set({ showSaveManager: value }, false, 'setShowSaveManager')
				},

				setShowUpdateNotifications: (value) => {
					set(
						{ showUpdateNotifications: value },
						false,
						'setShowUpdateNotifications',
					)
				},

				setShowStatusPreview: (show) => {
					set({ showStatusPreview: show }, false, 'setShowStatusPreview')
				},

				setShowDamagePreview: (show) => {
					set({ showDamagePreview: show }, false, 'setShowDamagePreview')
				},

				toggleStatusPreview: () => {
					const current = get().showStatusPreview
					set({ showStatusPreview: !current }, false, 'toggleStatusPreview')
				},

				toggleDamagePreview: () => {
					const current = get().showDamagePreview
					set({ showDamagePreview: !current }, false, 'toggleDamagePreview')
				},

				// ===== セーブデータごとの基本ステータスカテゴリ管理 =====
				getStatusPreviewCategory: (saveId) => {
					const categories = get().statusPreviewCategories
					return categories[saveId] || 'base'
				},

				setStatusPreviewCategory: (saveId, category) => {
					set(
						(state) => ({
							statusPreviewCategories: {
								...state.statusPreviewCategories,
								[saveId]: category,
							},
						}),
						false,
						'setStatusPreviewCategory',
					)

					// calculatorStoreのcheckUIChanges関数は削除されたため、この呼び出しは不要
				},

				// ===== StatusPreviewの高さ管理 =====
				setStatusPreviewHeight: (height) => {
					// 最小高さと最大高さを制限
					const minHeight = 200
					const maxHeight = 600
					const clampedHeight = Math.max(minHeight, Math.min(maxHeight, height))
					set(
						{ statusPreviewHeight: clampedHeight },
						false,
						'setStatusPreviewHeight',
					)
				},

				// ===== DamagePreviewの高さ管理 =====
				setDamagePreviewHeight: (height) => {
					// 最小高さと最大高さを制限
					const minHeight = 200
					const maxHeight = 600
					const clampedHeight = Math.max(minHeight, Math.min(maxHeight, height))
					set(
						{ damagePreviewHeight: clampedHeight },
						false,
						'setDamagePreviewHeight',
					)
				},

				// ===== サブシステム関連のアクション =====
				// モーダル制御
				openFullScreenModal: (type: CustomType, title: string) => {
					set(
						(state) => ({
							subsystem: {
								...state.subsystem,
								fullScreenModal: {
									isOpen: true,
									type,
									title,
								},
							},
						}),
						false,
						'openFullScreenModal',
					)
				},

				closeFullScreenModal: () => {
					set(
						(state) => ({
							subsystem: {
								...state.subsystem,
								fullScreenModal: {
									isOpen: false,
									type: null,
									title: '',
								},
								navigation: {
									currentScreen: 'main',
									canGoBack: false,
									canGoNext: false,
								},
							},
						}),
						false,
						'closeFullScreenModal',
					)
				},

				// 画面遷移制御
				navigateToScreen: (screen: NavigationScreen) => {
					set(
						(state) => ({
							subsystem: {
								...state.subsystem,
								navigation: {
									...state.subsystem.navigation,
									currentScreen: screen,
									canGoBack: screen !== 'main',
									canGoNext: true, // 具体的なバリデーションは各画面で実装
								},
							},
						}),
						false,
						'navigateToScreen',
					)
				},

				goBack: () => {
					const currentScreen = get().subsystem.navigation.currentScreen
					let previousScreen: NavigationScreen = 'main'
					
					switch (currentScreen) {
						case 'type_selection':
							previousScreen = 'main'
							break
						case 'name_input':
							previousScreen = 'type_selection'
							break
						case 'property_input':
							previousScreen = 'name_input'
							break
						case 'confirmation':
							previousScreen = 'property_input'
							break
						case 'completion':
							previousScreen = 'main'
							break
						default:
							previousScreen = 'main'
					}
					
					get().navigateToScreen(previousScreen)
				},

				goNext: () => {
					const currentScreen = get().subsystem.navigation.currentScreen
					let nextScreen: NavigationScreen = 'main'
					
					switch (currentScreen) {
						case 'main':
							nextScreen = 'type_selection'
							break
						case 'type_selection':
							nextScreen = 'name_input'
							break
						case 'name_input':
							nextScreen = 'property_input'
							break
						case 'property_input':
							nextScreen = 'confirmation'
							break
						case 'confirmation':
							nextScreen = 'completion'
							break
						case 'completion':
							nextScreen = 'main'
							break
					}
					
					get().navigateToScreen(nextScreen)
				},

				// クリスタルタイプ選択
				selectCrystalType: (type: CrystalType) => {
					set(
						(state) => ({
							subsystem: {
								...state.subsystem,
								crystalCustom: {
									...state.subsystem.crystalCustom,
									newRegistration: {
										...state.subsystem.crystalCustom.newRegistration,
										selectedType: type,
									},
								},
							},
						}),
						false,
						'selectCrystalType',
					)
				},

				clearCrystalTypeSelection: () => {
					set(
						(state) => ({
							subsystem: {
								...state.subsystem,
								crystalCustom: {
									...state.subsystem.crystalCustom,
									newRegistration: {
										...state.subsystem.crystalCustom.newRegistration,
										selectedType: null,
									},
								},
							},
						}),
						false,
						'clearCrystalTypeSelection',
					)
				},

				// クリスタル名称設定
				setCrystalName: (name: string) => {
					set(
						(state) => ({
							subsystem: {
								...state.subsystem,
								crystalCustom: {
									...state.subsystem.crystalCustom,
									newRegistration: {
										...state.subsystem.crystalCustom.newRegistration,
										name,
									},
								},
							},
						}),
						false,
						'setCrystalName',
					)
				},

				// 編集モード制御
				setCrystalEditMode: (mode: EditMode, id?: string) => {
					set(
						(state) => ({
							subsystem: {
								...state.subsystem,
								crystalCustom: {
									...state.subsystem.crystalCustom,
									editMode: mode,
									currentEditId: id || null,
								},
							},
						}),
						false,
						'setCrystalEditMode',
					)
				},

				selectCrystalItems: (ids: string[]) => {
					set(
						(state) => ({
							subsystem: {
								...state.subsystem,
								crystalCustom: {
									...state.subsystem.crystalCustom,
									selectedItems: ids,
								},
							},
						}),
						false,
						'selectCrystalItems',
					)
				},

				// フォームデータ管理
				updateCrystalFormData: (data: Partial<EquipmentProperties>) => {
					set(
						(state) => ({
							subsystem: {
								...state.subsystem,
								crystalCustom: {
									...state.subsystem.crystalCustom,
									newRegistration: {
										...state.subsystem.crystalCustom.newRegistration,
										properties: {
											...state.subsystem.crystalCustom.newRegistration.properties,
											...data,
										},
									},
								},
							},
						}),
						false,
						'updateCrystalFormData',
					)
				},

				setValidationErrors: (errors: Record<string, string>) => {
					set(
						(state) => ({
							subsystem: {
								...state.subsystem,
								crystalCustom: {
									...state.subsystem.crystalCustom,
									newRegistration: {
										...state.subsystem.crystalCustom.newRegistration,
										validationErrors: errors,
									},
								},
							},
						}),
						false,
						'setValidationErrors',
					)
				},

				resetCrystalForm: () => {
					set(
						(state) => ({
							subsystem: {
								...state.subsystem,
								crystalCustom: {
									...state.subsystem.crystalCustom,
									editMode: 'create', // createモードにリセット
									currentEditId: null, // 編集IDをクリア
									newRegistration: {
										selectedType: null,
										name: '',
										properties: {},
										validationErrors: {},
									},
								},
								navigation: {
									currentScreen: 'main',
									canGoBack: false,
									canGoNext: false,
								},
							},
						}),
						false,
						'resetCrystalForm',
					)
				},

				// 削除機能用アクション
				selectForDeletion: (crystalId) => {
					set(
						(state) => ({
							subsystem: {
								...state.subsystem,
								crystalCustom: {
									...state.subsystem.crystalCustom,
									deleteFlow: {
										...state.subsystem.crystalCustom.deleteFlow,
										selectedCrystalId: crystalId,
									},
								},
							},
						}),
						false,
						'selectForDeletion',
					)
				},

				confirmDeletion: async (crystalId) => {
					// 削除前にクリスタル名を取得
					const { getUserCrystalById } = await import('../utils/crystalDatabase')
					const crystal = getUserCrystalById(crystalId)
					const crystalName = crystal ? crystal.name : 'Unknown Crystal'

					// 削除処理中状態に設定
					set(
						(state) => ({
							subsystem: {
								...state.subsystem,
								crystalCustom: {
									...state.subsystem.crystalCustom,
									deleteFlow: {
										...state.subsystem.crystalCustom.deleteFlow,
										isDeleting: true,
									},
								},
							},
						}),
						false,
						'confirmDeletion:start',
					)

					try {
						// crystalDatabase から deleteUserCrystal をインポートして実行
						const { deleteUserCrystal } = await import('../utils/crystalDatabase')
						await deleteUserCrystal(crystalId)

						// 削除成功後の状態更新
						set(
							(state) => ({
								subsystem: {
									...state.subsystem,
									crystalCustom: {
										...state.subsystem.crystalCustom,
										editMode: 'list',
										deleteFlow: {
											selectedCrystalId: null,
											isDeleting: false,
											deleteSuccess: {
												isSuccess: true,
												deletedCrystalName: crystalName,
												message: `"${crystalName}"を削除しました`,
											},
										},
									},
								},
							}),
							false,
							'confirmDeletion:success',
						)
					} catch (error) {
						console.error('Crystal deletion failed:', error)
						// エラー時は削除処理中状態を解除
						set(
							(state) => ({
								subsystem: {
									...state.subsystem,
									crystalCustom: {
										...state.subsystem.crystalCustom,
										deleteFlow: {
											...state.subsystem.crystalCustom.deleteFlow,
											isDeleting: false,
											deleteSuccess: null,
										},
									},
								},
							}),
							false,
							'confirmDeletion:error',
						)
						throw error
					}
				},

				cancelDeletion: () => {
					set(
						(state) => ({
							subsystem: {
								...state.subsystem,
								crystalCustom: {
									...state.subsystem.crystalCustom,
									editMode: 'create', // 初期画面（新規登録・内容変更・登録削除ボタン画面）に戻る
									deleteFlow: {
										selectedCrystalId: null,
										isDeleting: false,
										deleteSuccess: null,
									},
								},
								navigation: {
									...state.subsystem.navigation,
									currentScreen: 'main',
								},
							},
						}),
						false,
						'cancelDeletion',
					)
				},

				clearDeleteSuccess: () => {
					set(
						(state) => ({
							subsystem: {
								...state.subsystem,
								crystalCustom: {
									...state.subsystem.crystalCustom,
									deleteFlow: {
										...state.subsystem.crystalCustom.deleteFlow,
										deleteSuccess: null,
									},
								},
							},
						}),
						false,
						'clearDeleteSuccess',
					)
				},
			}),
			{
				name: 'ui-store',
				partialize: (state) => ({
					statusPreviewCategories: state.statusPreviewCategories,
					statusPreviewHeight: state.statusPreviewHeight,
					damagePreviewHeight: state.damagePreviewHeight,
				}),
			},
		),
		{
			name: 'ui-store',
		},
	),
)
