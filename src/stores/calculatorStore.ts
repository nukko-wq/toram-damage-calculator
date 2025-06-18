import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { CalculatorStore, DamageCalculationResult, CalculationSettings } from '@/types/stores'
import { createInitialCalculatorData } from '@/utils/initialData'
import { saveCurrentData, getCurrentSaveData, initializeStorage } from '@/utils/saveDataManager'

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
				set(
					{ data },
					false,
					'setData',
				)
			},

			resetUnsavedChanges: () => {
				set(
					{ hasUnsavedChanges: false },
					false,
					'resetUnsavedChanges',
				)
			},

			setHasUnsavedChanges: (value) => {
				set(
					{ hasUnsavedChanges: value },
					false,
					'setHasUnsavedChanges',
				)
			},

			setIsLoading: (value) => {
				set(
					{ isLoading: value },
					false,
					'setIsLoading',
				)
			},

			// ===== セーブデータ管理 =====
			loadSaveData: async (data) => {
				// isLoadingを使わずに直接データを更新（ちらつき防止）
				set({
					data,
					hasUnsavedChanges: false,
				})

				// 最小限の遅延でフォームの変更検知を無効化（ちらつき最小化）
				setTimeout(() => {
					set({ hasUnsavedChanges: false })
				}, 30)
			},

			saveCurrentData: async () => {
				try {
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

			// ===== 初期化 =====
			initialize: async () => {
				try {
					set({ isLoading: true })

					// ストレージ初期化
					await initializeStorage()

					// 現在のセーブデータを読み込み
					const currentSave = getCurrentSaveData()
					set({
						data: currentSave.data,
						hasUnsavedChanges: false,
						isInitialized: true,
						isLoading: false,
					})
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