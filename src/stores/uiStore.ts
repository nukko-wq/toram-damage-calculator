import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { UIStore } from '@/types/stores'

export const useUIStore = create<UIStore>()(
	devtools(
		(set) => ({
			// ===== 初期状態 =====
			showSaveManager: false,
			showUpdateNotifications: false,

			// ===== アクション =====
			setShowSaveManager: (value) => {
				set(
					{ showSaveManager: value },
					false,
					'setShowSaveManager',
				)
			},

			setShowUpdateNotifications: (value) => {
				set(
					{ showUpdateNotifications: value },
					false,
					'setShowUpdateNotifications',
				)
			},
		}),
		{
			name: 'ui-store',
		},
	),
)