import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { UIStore } from '@/types/stores'

export const useUIStore = create<UIStore>()(
	devtools(
		(set, get) => ({
			// ===== 初期状態 =====
			showSaveManager: false,
			showUpdateNotifications: false,
			activeResultView: null,

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

			setActiveResultView: (view) => {
				set({ activeResultView: view }, false, 'setActiveResultView')
			},

			toggleResultView: (view) => {
				const currentView = get().activeResultView
				const newView = currentView === view ? null : view
				set({ activeResultView: newView }, false, 'toggleResultView')
			},
		}),
		{
			name: 'ui-store',
		},
	),
)
