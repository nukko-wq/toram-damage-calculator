import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { UIStore } from '@/types/stores'

export const useUIStore = create<UIStore>()(
	devtools(
		(set, get) => ({
			// ===== 初期状態 =====
			showSaveManager: false,
			showUpdateNotifications: false,
			showStatusPreview: false,
			showDamagePreview: false,

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
		}),
		{
			name: 'ui-store',
		},
	),
)
