import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { UIStore } from '@/types/stores'

// ローカルストレージから初期カテゴリ状態を取得
const getInitialStatusPreviewCategories = (): Record<
	string,
	'base' | 'physical' | 'magical' | 'hybrid' | 'tank'
> => {
	if (typeof window === 'undefined') return {}

	try {
		const stored = localStorage.getItem('ui-store')
		if (stored) {
			const parsed = JSON.parse(stored)
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
			}),
			{
				name: 'ui-store',
				partialize: (state) => ({
					statusPreviewCategories: state.statusPreviewCategories,
				}),
			},
		),
		{
			name: 'ui-store',
		},
	),
)
