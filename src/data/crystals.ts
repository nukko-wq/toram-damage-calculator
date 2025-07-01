/**
 * クリスタルプリセットデータ（TypeScript版）
 *
 * 型安全性とエディタ補完により開発効率を向上
 * EquipmentPropertiesインターフェースによる厳密な型チェック
 */

import type { CrystalType, PresetCrystal } from '@/types/calculator'

// クリスタルデータの型定義
interface CrystalsData {
	crystals: Record<CrystalType, PresetCrystal[]>
}

// クリスタルプリセットデータ
export const crystalsData: CrystalsData = {
	crystals: {
		weapon: [
			{
				id: '1c16cbd5-e043-4292-851d-e02a8aea721c',
				name: 'ドン・プロフンド',
				type: 'weapon',
				properties: {
					ATK_Rate: 10,
					STR_Rate: 7,
					Critical_Rate: 8,
					DEF_Rate: -27,
				},
			},
			{
				id: '69d815eb-a2a1-486e-85f4-45d31f0ed2bd',
				name: '黒衣の聖誕姫',
				type: 'weapon',
				properties: {
					ATK_Rate: 9,
					STR_Rate: 3,
					MATK_Rate: 9,
					INT_Rate: 3,
					LongRangeDamage_Rate: -6,
				},
				memo1: '盾装備時: ヘイト-50%',
				memo2: '短剣装備時: クリティカルダメージ+1%',
			},
			{
				id: 'a88d8016-d3a8-4e31-9a21-99eaf6fe107b',
				name: 'ディアルク',
				type: 'weapon',
				properties: {
					MATK_Rate: 8,
					MagicalPenetration_Rate: 20,
					CastingSpeed_Rate: -16,
				},
			},
		],
		armor: [
			{
				id: '049bea51-bcde-47f0-a6d8-8556cc74b628',
				name: 'アルタダール(軽鎧装備)',
				type: 'armor',
				properties: {
					Stability_Rate: 6,
					STR_Rate: 6,
					VIT_Rate: 6,
					ShortRangeDamage_Rate: 11,
				},
			},
			{
				id: 'ebc3fa48-5a5a-4134-94ff-dd20ad0133bc',
				name: 'バングルドム(軽鎧装備)',
				type: 'armor',
				properties: {
					ATK_Rate: 10,
					MATK_Rate: 10,
					AttackSpeed_Rate: 10,
					CastingSpeed_Rate: 10,
					HP_Rate: -20,
					MagicalPenetration_Rate: 5,
				},
			},
			{
				id: '8afa1704-3ed9-4210-86a9-f18a8ca1244f',
				name: 'デラックスファイターⅡ',
				type: 'armor',
				properties: {
					ATK_Rate: 3,
					ShortRangeDamage_Rate: 6,
					Accuracy_Rate: 15,
					HP: 6000,
					FractionalBarrier: 5,
				},
			},
			{
				id: '7eb627bf-2845-4be7-ab24-97ed8ad69e26',
				name: 'ゲーグナー',
				type: 'armor',
				properties: {
					MATK_Rate: 10,
					INT_Rate: 6,
					CastingSpeed_Rate: 40,
					AttackMPRecovery_Rate: 10,
				},
			},
		],
		additional: [
			{
				id: '5048a9e9-417b-47df-8665-62d4255cd5bd',
				name: 'キングウシキングⅡ',
				type: 'additional',
				properties: {
					ShortRangeDamage_Rate: 12,
					Accuracy: 50,
					MP: 200,
					HP_Rate: -30,
				},
			},
			{
				id: 'b2d90ff6-d9da-49de-ac2b-f5a97e36a786',
				name: 'ジブリールⅢ',
				type: 'additional',
				properties: {
					ShortRangeDamage_Rate: 9,
					LongRangeDamage_Rate: 11,
					MP: 100,
					Critical: 16,
					Anticipate_Rate: 3,
					NaturalMPRecovery: 6,
					NaturalHPRecovery_Rate: 12,
				},
			},
			{
				id: '3e9f6c60-ea8a-495e-b900-f97ff03a4ba9',
				name: 'ヴェランレフィーナ',
				type: 'additional',
				properties: {
					ATK_Rate: 8,
					PhysicalPenetration_Rate: 10,
					Critical: 12,
					MATK_Rate: -4,
					PhysicalResistance_Rate: -20,
				},
			},
			{
				id: 'ef23f54e-6347-4160-bf0c-5665324ea333',
				name: 'ゴード',
				type: 'additional',
				properties: {
					ATK_Rate: 7,
					AttackSpeed_Rate: 80,
					LongRangeDamage_Rate: -15,
				},
			},
			{
				id: 'ebfbaa8f-447c-4776-9cc6-e73e8d78a2ec',
				name: 'カスティリア',
				type: 'additional',
				properties: {
					ShortRangeDamage_Rate: 12,
					LongRangeDamage_Rate: 6,
					Accuracy_Rate: 10,
					AttackSpeed: -900,
				},
			},
			{
				id: '218b5f7c-e42d-4571-af9a-e31c8c0eab7b',
				name: 'ゴブリン・ズコット',
				type: 'additional',
				properties: {
					ATK_Rate: 10,
					PhysicalPenetration_Rate: 10,
					HP_Rate: 24,
					Aggro_Rate: -15,
				},
				memo1: '盾装備時: 行動速度+1%',
			},
		],
		special: [
			{
				id: '2cff4c23-09d3-496a-9ee4-6546c6dfbb02',
				name: 'エトワーズ',
				type: 'special',
				properties: {
					Critical_Rate: 40,
					AttackSpeed: 1100,
					MotionSpeed_Rate: 5,
					CastingSpeed_Rate: -70,
				},
			},
			{
				id: '8f13a502-2fe2-473b-9579-ab805ddafa1d',
				name: '茄竜オヴァビオ',
				type: 'special',
				properties: {
					MP: 300,
					ShortRangeDamage_Rate: 4,
					AttackSpeed: 500,
					LongRangeDamage_Rate: -12,
				},
			},
			{
				id: '533fdf6f-932b-475c-ab3f-dfafd3b97a4a',
				name: '叫声の禍影',
				type: 'special',
				properties: {
					MP: 300,
					Critical_Rate: 20,
					CastingSpeed: 1000,
					DEF_Rate: -40,
				},
			},
		],
		normal: [
			{
				id: 'e6757887-64f1-4df6-87fa-0db6e4bb1e02',
				name: 'カレリーフ',
				type: 'normal',
				properties: {
					ATK_Rate: 9,
					CriticalDamage: 12,
					MagicalPenetration_Rate: -15,
				},
			},
			{
				id: 'f0385338-4971-4372-a62f-d02f27146b9e',
				name: '彼方の残影',
				type: 'normal',
				properties: {
					ShortRangeDamage_Rate: 10,
					PhysicalPenetration_Rate: 5,
					AttackSpeed: -250,
				},
			},
			{
				id: '84f88c61-40f2-4f07-a26f-ec7be08d488b',
				name: 'ドゥターネン',
				type: 'normal',
				properties: {
					Anticipate_Rate: 6,
					ArmorBreak_Rate: 6,
					Accuracy_Rate: 30,
					Aggro_Rate: 10,
				},
			},
		],
	},
} as const

// 後方互換性のためのエクスポート
export default crystalsData
