import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
	AttackType,
	DefenseType,
	ResistanceType,
	PowerReference,
	AdaptationType,
} from '../types/calculator'

export interface CustomSkillSettings {
	name: string
	multiplier: number
	fixedDamage: number
	mpCost: number
	attackType: AttackType
	powerReference: PowerReference
	referenceDefense: DefenseType | 'none'
	referenceResistance: ResistanceType | 'none'
	adaptation: AdaptationType | 'none'
	adaptationGrant: AdaptationType | 'none'
	distancePower: 'short' | 'long' | 'none'
	canUseUnsheathePower: boolean
	canUseLongRange: boolean
}

const defaultCustomSkillSettings: CustomSkillSettings = {
	name: 'カスタムスキル',
	multiplier: 100,
	fixedDamage: 0,
	mpCost: 100,
	attackType: 'physical',
	powerReference: 'ATK',
	referenceDefense: 'DEF',
	referenceResistance: 'physical',
	adaptation: 'physical',
	adaptationGrant: 'physical',
	distancePower: 'none',
	canUseUnsheathePower: false,
	canUseLongRange: false,
}

interface CustomSkillStore {
	settings: CustomSkillSettings
	savedPresets: Record<string, CustomSkillSettings>
	updateSettings: (newSettings: Partial<CustomSkillSettings>) => void
	resetSettings: () => void
	savePreset: (presetName: string) => void
	loadPreset: (presetName: string) => void
	deletePreset: (presetName: string) => void
	exportSettings: () => string
	importSettings: (jsonString: string) => boolean
}

export const useCustomSkillStore = create<CustomSkillStore>()(
	persist(
		(set, get) => ({
			settings: defaultCustomSkillSettings,
			savedPresets: {},

			updateSettings: (newSettings) => {
				set((state) => ({
					settings: { ...state.settings, ...newSettings },
				}))
			},

			resetSettings: () => {
				set({ settings: defaultCustomSkillSettings })
			},

			savePreset: (presetName) => {
				const { settings } = get()
				set((state) => ({
					savedPresets: {
						...state.savedPresets,
						[presetName]: { ...settings },
					},
				}))
			},

			loadPreset: (presetName) => {
				const { savedPresets } = get()
				const preset = savedPresets[presetName]
				if (preset) {
					set({ settings: { ...preset } })
				}
			},

			deletePreset: (presetName) => {
				set((state) => ({
					savedPresets: Object.fromEntries(
						Object.entries(state.savedPresets).filter(
							([key]) => key !== presetName,
						),
					),
				}))
			},

			exportSettings: () => {
				const { settings, savedPresets } = get()
				return JSON.stringify({ settings, savedPresets }, null, 2)
			},

			importSettings: (jsonString) => {
				try {
					const imported = JSON.parse(jsonString)
					if (imported.settings) {
						set({
							settings: { ...defaultCustomSkillSettings, ...imported.settings },
						})
					}
					if (imported.savedPresets) {
						set((state) => ({
							savedPresets: { ...state.savedPresets, ...imported.savedPresets },
						}))
					}
					return true
				} catch {
					return false
				}
			},
		}),
		{
			name: 'custom-skill-store',
			partialize: (state) => ({
				settings: state.settings,
				savedPresets: state.savedPresets,
			}),
		},
	),
)