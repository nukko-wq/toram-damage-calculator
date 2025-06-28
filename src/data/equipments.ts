/**
 * 装備プリセットデータ（TypeScript版）
 * 
 * 型安全性とエディタ補完により開発効率を向上
 * EquipmentPropertiesインターフェースによる厳密な型チェック
 */

import type { EquipmentProperties, ArmorType } from '@/types/calculator'

// 装備アイテムの型定義（JSONデータ構造に合わせて簡略化）
interface EquipmentItem {
	id: string
	name: string
	properties: Partial<EquipmentProperties>
	weaponStats?: {
		ATK?: number
		stability?: number
		refinement?: number
	}
	crystalSlots?: {
		slot1?: string | null
		slot2?: string | null
	}
	armorType?: ArmorType // 防具の改造タイプ（体装備のみ使用）
}

// 装備カテゴリの型定義
type EquipmentCategory = 'mainWeapon' | 'body' | 'additional' | 'special' | 'subWeapon' | 'fashion1' | 'fashion2' | 'fashion3' | 'freeInput1' | 'freeInput2' | 'freeInput3'

// 装備データの型定義
interface EquipmentsData {
	equipments: Record<EquipmentCategory, EquipmentItem[]>
}

// 装備プリセットデータ
export const equipmentsData: EquipmentsData = {
	equipments: {
		mainWeapon: [
			{
				id: "5ecbbbad-1fb8-4e44-b36b-8181cc268f15",
				name: "槍有利23%A10%S10%C29",
				properties: {
					ATK_Rate: 10,
					ElementAdvantage_Rate: 23,
					Critical: 29,
					STR_Rate: 10,
					NaturalHPRecovery: -27,
					Dodge: -14
				},
				crystalSlots: {
					slot1: null,
					slot2: null
				}
			},
			{
				id: "ee0de0d7-8402-4dca-9294-5527f5abb53c",
				name: "有利-クリダメ%-STR%-クリ率",
				weaponStats: {
					ATK: 927,
					stability: 60,
					refinement: 15
				},
				properties: {
					ElementAdvantage_Rate: 22,
					CriticalDamage_Rate: 10,
					STR_Rate: 10,
					Critical_Rate: 10
				}
			}
		],
		body: [
			{
				id: "c1cd1a6b-03f2-470d-a59e-d036a077f174",
				name: "有利-クリダメ%-STR%-クリ率",
				properties: {
					ElementAdvantage_Rate: 22,
					CriticalDamage_Rate: 10,
					STR_Rate: 10,
					Critical_Rate: 27,
					MATK_Rate: -13,
					MagicalPenetration_Rate: -7,
					Accuracy: -14,
					Accuracy_Rate: -6
				},
				armorType: 'normal'
			},
			{
				id: "cd287974-decd-4fbe-8c20-52d6801159f8",
				name: "有利-クリダメ-クリダメ%-クリ率",
				properties: {
					ElementAdvantage_Rate: 22,
					CriticalDamage: 22,
					CriticalDamage_Rate: 10,
					Critical_Rate: 27
				},
				armorType: 'normal'
			}
		],
		additional: [
			{
				id: "a688033d-c8de-4005-a264-91cc333f261c",
				name: "本命覆面チョコ",
				properties: {
					ATK_Rate: 10,
					STR_Rate: 10,
					Critical: 10,
					MP: -100
				}
			},
			{
				id: "bdf06bb8-f59f-4a7c-817f-7466638bda7e",
				name: "ジンジャーウィンク",
				properties: {
					ATK_Rate: 9,
					PhysicalPenetration_Rate: 18,
					MeteorReduction_Rate: 27,
					Critical_Rate: -5
				}
			},
			{
				id: "562db16b-3f72-40b5-b79d-b5adb0b63ae0",
				name: "ナイアータティアラ",
				properties: {
					PhysicalPenetration_Rate: 15,
					Critical: 25,
					Accuracy_Rate: 100,
					AttackSpeed: -1000
				}
			},
			{
				id: "a8cb6d76-5a0d-411d-9052-a50639079268",
				name: "シャドウホーン",
				properties: {
					HP: 5000,
					AGI_Rate: 10,
					ATK_Rate: 10,
					Accuracy_Rate: 50,
					Accuracy: 100,
					AbsoluteAccuracy_Rate: 5
				}
			}
		],
		special: [
			{
				id: "27a9e068-9c56-4cc6-8419-e2756bf6ee79",
				name: "スチールリング(力)",
				properties: {
					HP: 1500,
					MP: 300,
					ATK_Rate: 5,
					Aggro_Rate: -10
				}
			},
			{
				id: "aed00f67-77b8-4b97-8e6d-edc295724fa6",
				name: "時駆けの懐中時計",
				properties: {
					AttackSpeed: 1000,
					PhysicalResistance_Rate: -9,
					MagicalResistance_Rate: -9
				}
			}
		],
		subWeapon: [
			{
				id: "66e9d621-080a-4994-bf4c-9ab26e9754ec",
				name: "メディカルメッサー",
				properties: {
					Critical: 20,
					Critical_Rate: 20,
					ArmorBreak_Rate: 10,
					AilmentResistance_Rate: 10
				}
			},
			{
				id: "9beb779e-4841-4950-9e86-2a9c4fecaf5e",
				name: "蛙戦士の短剣",
				properties: {
					ShortRangeDamage_Rate: 1,
					MotionSpeed_Rate: 3,
					Accuracy_Rate: 5,
					Aggro_Rate: -10
				}
			}
		],
		fashion1: [
			{
				id: "b4b9ebe9-0bc2-4b59-bda8-13f7325349ad",
				name: "その1",
				properties: {
					ShortRangeDamage_Rate: 3
				}
			}
		],
		fashion2: [
			{
				id: "3cbe4be8-5083-446c-aa07-1eec00609a79",
				name: "その1",
				properties: {
					PhysicalPenetration_Rate: 7
				}
			}
		],
		fashion3: [
			{
				id: "02bde450-f045-4326-a045-ef7681dfd162",
				name: "その1",
				properties: {
					ATK_Rate: 3
				}
			}
		],
		freeInput1: [
			{
				id: "1beb4c82-f986-480e-a2a9-5b327108330f",
				name: "カスタム入力",
				properties: {}
			}
		],
		freeInput2: [
			{
				id: "c3bb8cb2-9e72-415a-9b7f-250bc20ef387",
				name: "カスタム入力",
				properties: {}
			}
		],
		freeInput3: [
			{
				id: "16169ec9-a5a0-4165-a974-8cf1ba2884d0",
				name: "カスタム入力",
				properties: {}
			}
		]
	}
} as const

// 後方互換性のためのエクスポート
export default equipmentsData