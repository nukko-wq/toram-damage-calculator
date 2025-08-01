/**
 * 装備プリセットデータ（TypeScript版）
 *
 * 型安全性とエディタ補完により開発効率を向上
 * EquipmentPropertiesインターフェースによる厳密な型チェック
 */

import type { PresetEquipment } from '@/types/calculator'

// 装備カテゴリの型定義
type EquipmentCategory =
	| 'mainWeapon'
	| 'body'
	| 'additional'
	| 'special'
	| 'subWeapon'
	| 'fashion1'
	| 'fashion2'
	| 'fashion3'
	| 'freeInput1'
	| 'freeInput2'
	| 'freeInput3'

// 装備データの型定義
interface EquipmentsData {
	equipments: Record<EquipmentCategory, PresetEquipment[]>
}

// 装備プリセットデータ
export const equipmentsData: EquipmentsData = {
	equipments: {
		mainWeapon: [
			{
				id: '5ecbbbad-1fb8-4e44-b36b-8181cc268f15',
				name: '槍有利23%A15%S10%',
				properties: {
					ATK_Rate: 15,
					ElementAdvantage_Rate: 23,
					STR_Rate: 10,
					NaturalHPRecovery: -30,
					Dodge: -16,
				},
			},
			{
				id: 'ee0de0d7-8402-4dca-9294-5527f5abb53c',
				name: '槍有利23%A10%S10%C30',
				properties: {
					ElementAdvantage_Rate: 23,
					CriticalDamage_Rate: 10,
					STR_Rate: 10,
					Critical: 30,
					NaturalHPRecovery: -30,
					Dodge: -16,
				},
			},
			{
				id: '0b54f5ce-8be9-428c-8229-b51f6db9773b',
				name: '槍汎用A15%S10%',
				properties: {
					ATK_Rate: 15,
					STR_Rate: 10,
					NaturalHPRecovery: -30,
					Dodge: -16,
				},
			},
			{
				id: '5e9e7299-a596-46ab-9cfe-72b69423bdc4',
				name: '両手有利23%A15%S10%',
				properties: {
					ATK_Rate: 15,
					ElementAdvantage_Rate: 23,
					STR_Rate: 10,
					NaturalHPRecovery: -30,
					Dodge: -16,
				},
			},
			{
				id: '9ce5ed42-1857-4145-86f5-c95882bae220',
				name: '両手有利23%A10%S10%C30',
				properties: {
					ElementAdvantage_Rate: 23,
					CriticalDamage_Rate: 10,
					STR_Rate: 10,
					Critical: 30,
					NaturalHPRecovery: -30,
					Dodge: -16,
				},
			},
			{
				id: '57b356a8-661e-4ab1-9af6-bbfa1f5ad08b',
				name: '両手汎用A15%S10%',
				properties: {
					ATK_Rate: 15,
					STR_Rate: 10,
					NaturalHPRecovery: -30,
					Dodge: -16,
				},
			},
			{
				id: 'dca4f0a5-f4aa-4ec0-a3bf-c48d2536b746',
				name: 'パトリダブレイド',
				properties: {
					ElementAdvantage_Rate: 25,
					ATK_Rate: 12,
					STR_Rate: 10,
					AttackMPRecovery: 15,
					Accuracy_Rate: 30,
					Anticipate_Rate: 10,
					EarthResistance_Rate: 15,
					AilmentResistance_Rate: 10,
				},
			},
			{
				id: 'f8b2c4d6-e9a1-4c3b-8f2d-5e7a9b1c3d4f',
				name: '10周年魔導具',
				properties: {
					MATK_Rate: 15,
					INT_Rate: 10,
					ElementAdvantage_Rate: 23,
				},
			},
			{
				id: '794a928f-b6eb-42bc-bfa1-13f4d3295a3d',
				name: 'ディグニダー',
				properties: {
					Anticipate_Rate: 30,
					ArmorBreak_Rate: 30,
					Aggro_Rate: 30,
					Critical: 90,
				},
			},
		],
		body: [
			{
				id: 'c1cd1a6b-03f2-470d-a59e-d036a077f174',
				name: '有利-クリダメ%-STR%-クリ率',
				properties: {
					ElementAdvantage_Rate: 23,
					CriticalDamage_Rate: 11,
					STR_Rate: 10,
					Critical: 29,
					MATK_Rate: -13,
					MagicalPenetration_Rate: -7,
					Accuracy: -14,
					Accuracy_Rate: -6,
				},
			},
			{
				id: 'cd287974-decd-4fbe-8c20-52d6801159f8',
				name: '有利23%S10%CD11%CD23',
				properties: {
					ElementAdvantage_Rate: 23,
					CriticalDamage_Rate: 11,
					CriticalDamage: 23,
					STR_Rate: 10,
					MATK_Rate: -15,
					MagicalPenetration_Rate: -9,
					Accuracy: -16,
					Accuracy_Rate: -6,
				},
			},
			{
				id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
				name: '汎用A12%S10%CD21C25',
				properties: {
					ATK_Rate: 12,
					STR_Rate: 10,
					CriticalDamage: 21,
					Critical: 25,
					MATK_Rate: -12,
					MagicalPenetration_Rate: -7,
					Accuracy: -16,
					Accuracy_Rate: -5,
				},
			},
			{
				id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
				name: '星辰の舟衣(近)',
				properties: {
					HP: 7500,
					Critical: 25,
					ShortRangeDamage_Rate: 10,
					PhysicalPenetration_Rate: 5,
					MagicalPenetration_Rate: 5,
					Anticipate_Rate: 20,
					DarkResistance_Rate: 30,
				},
				conditionalEffects: [
					{
						condition: { type: 'mainWeapon', weaponType: '両手剣' },
						properties: { MP: 200 },
						description: '両手剣装備時: MP+200',
					},
				],
			},
			{
				id: 'a3e5f7b9-d1c2-4a6b-9e8f-2d4c6a8b0e2f',
				name: '有利22%MATK10%INT10%',
				properties: {
					ElementAdvantage_Rate: 22,
					MATK_Rate: 10,
					INT_Rate: 10,
				},
			},
		],
		additional: [
			{
				id: 'a688033d-c8de-4005-a264-91cc333f261c',
				name: '本命覆面チョコ',
				properties: {
					ATK_Rate: 10,
					STR_Rate: 10,
					Critical: 10,
					MP: -300,
				},
			},
			{
				id: 'bdf06bb8-f59f-4a7c-817f-7466638bda7e',
				name: 'ジンジャーウィンク',
				properties: {
					ATK_Rate: 9,
					PhysicalPenetration_Rate: 18,
					MeteorReduction_Rate: 27,
					Critical_Rate: -5,
				},
			},
			{
				id: '562db16b-3f72-40b5-b79d-b5adb0b63ae0',
				name: 'ナイアータティアラ',
				properties: {
					PhysicalPenetration_Rate: 15,
					Critical: 25,
					Accuracy_Rate: 100,
					AttackSpeed: -1000,
				},
			},
			{
				id: 'a8cb6d76-5a0d-411d-9052-a50639079268',
				name: 'シャドウホーン',
				properties: {
					HP: 5000,
					AGI_Rate: 10,
					ATK_Rate: 10,
					Accuracy_Rate: 50,
					Accuracy: 100,
					AbsoluteAccuracy_Rate: 5,
				},
			},
			{
				id: 'eq001-2345-6789-abcd-ef0123456789',
				name: '魅力的なくちびる',
				properties: {
					PhysicalResistance_Rate: 40,
					AilmentResistance_Rate: 20,
					MotionSpeed_Rate: 10,
				},
			},
			{
				id: 'eq002-3456-789a-bcde-f01234567890',
				name: 'エクトピエズム(軽鎧装備)',
				properties: {
					MP: 500,
					MotionSpeed_Rate: 4,
					Anticipate_Rate: 30,
					AvoidRecharge_Rate: 20,
				},
			},
			{
				id: 'eq003-4567-89ab-cdef-012345678901',
				name: 'シュメッタヘアピン',
				properties: {
					MATK_Rate: 9,
					INT_Rate: 9,
					MagicalResistance_Rate: 9,
				},
			},
			{
				id: 'eq004-5678-9abc-def0-123456789012',
				name: 'ジンジャーサンタ',
				properties: {
					MATK_Rate: 11,
					INT_Rate: 10,
					HP: 9000,
					DarkResistance_Rate: 8,
				},
			},
			{
				id: 'eq005-6789-abcd-ef01-234567890123',
				name: 'エルモターバン',
				properties: {
					STR_Rate: 10,
					INT_Rate: 10,
					PhysicalPenetration_Rate: 10,
					MagicalPenetration_Rate: 10,
				},
			},
			{
				id: 'eq006-789a-bcde-f012-345678901234',
				name: 'くわえクナイ',
				properties: {
					PhysicalPenetration_Rate: 10,
					MotionSpeed_Rate: 10,
				},
			},
			{
				id: 'eq007-89ab-cdef-0123-456789012345',
				name: 'ブルーローズウィング',
				properties: {
					ShortRangeDamage_Rate: 11,
					AttackSpeed: 1000,
					LongRangeDamage_Rate: -10,
					HP: -2000,
					Dodge: 100,
					AvoidRecharge_Rate: 10,
				},
			},
			{
				id: 'eq008-9abc-def0-1234-567890123456',
				name: 'ほおひげ',
				properties: {
					STR_Rate: 5,
					ShortRangeDamage_Rate: 6,
					AttackSpeed: 400,
				},
			},
			{
				id: 'eq024-abcd-ef01-2345-67890123456a',
				name: 'キンピカファーファン',
				properties: {
					Anticipate_Rate: 30,
					ArmorBreak_Rate: 30,
					Aggro_Rate: 50,
					NeutralResistance_Rate: 40,
				},
			},
		],
		special: [
			{
				id: '27a9e068-9c56-4cc6-8419-e2756bf6ee79',
				name: 'スチールリング(力)',
				properties: {
					HP: 1500,
					MP: 300,
					ATK_Rate: 5,
					Aggro_Rate: -10,
				},
			},
			{
				id: 'aed00f67-77b8-4b97-8e6d-edc295724fa6',
				name: '時駆けの懐中時計',
				properties: {
					AttackSpeed: 1000,
					PhysicalResistance_Rate: -9,
					MagicalResistance_Rate: -9,
				},
			},
			{
				id: 'eq009-abcd-ef01-2345-678901234567',
				name: '鮭トバのお守り',
				properties: {
					MP: 200,
					Stability_Rate: 10,
					MagicalPenetration_Rate: 5,
				},
			},
			{
				id: 'eq010-bcde-f012-3456-789012345678',
				name: '冥氷の指輪(力)',
				properties: {
					MP: 500,
					ATK_Rate: 3,
					Anticipate_Rate: 7,
					PhysicalFollowup_Rate: 50,
					BladeReduction_Rate: 10,
				},
			},
			{
				id: 'eq011-cdef-0123-4567-890123456789',
				name: '星詠みのランプ',
				properties: {
					MP: 300,
					MagicalPenetration_Rate: 10,
					NaturalMPRecovery_Rate: 20,
				},
			},
			{
				id: 'eq012-def0-1234-5678-90123456789a',
				name: '竜落子の腕輪',
				properties: {
					MP: 400,
					Critical: 20,
				},
			},
			{
				id: 'eq013-ef01-2345-6789-0123456789ab',
				name: '爛漫の守石',
				properties: {
					MP: 200,
					AttackSpeed: 750,
					CastingSpeed: 750,
					AilmentResistance_Rate: -8,
				},
			},
			{
				id: 'eq014-f012-3456-789a-bcdef0123456',
				name: '熊戦士の帯',
				properties: {
					ShortRangeDamage_Rate: 2,
					Critical: 15,
				},
				conditionalEffects: [
					{
						condition: { type: 'mainWeapon', weaponType: '両手剣' },
						properties: { Critical: 15 },
						description: '両手剣装備時: クリティカル率+15',
					},
				],
			},
		],
		subWeapon: [
			{
				id: '66e9d621-080a-4994-bf4c-9ab26e9754ec',
				name: 'メディカルメッサー',
				properties: {
					Critical: 20,
					Critical_Rate: 20,
					ArmorBreak_Rate: 10,
					AilmentResistance_Rate: 10,
				},
			},
			{
				id: '9beb779e-4841-4950-9e86-2a9c4fecaf5e',
				name: '蛙戦士の短剣',
				properties: {
					ShortRangeDamage_Rate: 1,
					MotionSpeed_Rate: 3,
					Accuracy_Rate: 5,
					Aggro_Rate: -10,
				},
			},
			{
				id: 'eq016-1234-5678-9abc-def012345678',
				name: '刺身包丁(水+)',
				properties: {
					ElementAdvantage_Rate: 5,
					WaterResistance_Rate: 10,
					Aggro_Rate: -15,
				},
			},
			{
				id: 'eq017-2345-6789-abcd-ef0123456789',
				name: 'キッチンナイフ(地+)',
				properties: {
					ElementAdvantage_Rate: 5,
					EarthResistance_Rate: 10,
					Aggro_Rate: -15,
				},
			},
			{
				id: 'eq018-3456-789a-bcde-f01234567890',
				name: '檎の枝剣(風+)',
				properties: {
					ElementAdvantage_Rate: 5,
					WindResistance_Rate: 5,
					AttackSpeed_Rate: 5,
				},
			},
			{
				id: 'eq019-4567-89ab-cdef-012345678901',
				name: '白獣の短剣(闇+)',
				properties: {
					ElementAdvantage_Rate: 5,
					DarkResistance_Rate: 10,
					AvoidRecharge_Rate: 15,
					Dodge: 20,
				},
			},
			{
				id: 'eq020-5678-9abc-def0-123456789012',
				name: 'ツッパリダガー(光+)',
				properties: {
					ElementAdvantage_Rate: 5,
					Critical: 10,
					AttackSpeed_Rate: 15,
				},
			},
			{
				id: 'eq021-6789-abcd-ef01-234567890123',
				name: '溶解ナイフ(無+)',
				properties: {
					ElementAdvantage_Rate: 5,
					PhysicalPenetration_Rate: 5,
					ArmorBreak_Rate: 5,
					WaterResistance_Rate: -15,
				},
			},
			{
				id: 'eq022-789a-bcde-f012-345678901234',
				name: 'ムーンライトダガー',
				properties: {
					MATK_Rate: 4,
					DEX_Rate: 2,
					MotionSpeed_Rate: 2,
				},
			},
			{
				id: 'eq023-89ab-cdef-0123-456789012345',
				name: 'チューニングナイフ',
				properties: {
					Stability_Rate: 10,
					Critical: 10,
					BladeReduction_Rate: 10,
				},
			},
			{
				id: '7c9e1f3a-8b4d-4e2c-9a6f-1b3e5d7a9c2e',
				name: '忍術巻物・雷遁',
				properties: {
					Stability_Rate: 5,
				},
				conditionalEffects: [
					{
						condition: { type: 'mainWeapon', weaponType: '抜刀剣' },
						properties: { Accuracy_Rate: 10 },
						description: '抜刀剣装備時: 命中+10%',
					},
				],
			},
			{
				id: 'f78ec8a2-93e8-4457-a0bd-351922cb89c6',
				name: '十露盤の盾',
				properties: {
					GuardRecharge_Rate: 35,
					GuardPower_Rate: 25,
					AttackMPRecovery: 10,
					CastingSpeed: 300,
					LightResistance_Rate: 30,
					Aggro_Rate: 60,
				},
			},
		],
		fashion1: [
			{
				id: 'b4b9ebe9-0bc2-4b59-bda8-13f7325349ad',
				name: 'その1',
				properties: {
					ShortRangeDamage_Rate: 3,
				},
			},
		],
		fashion2: [
			{
				id: '3cbe4be8-5083-446c-aa07-1eec00609a79',
				name: 'その1',
				properties: {
					PhysicalPenetration_Rate: 7,
				},
			},
		],
		fashion3: [
			{
				id: '02bde450-f045-4326-a045-ef7681dfd162',
				name: 'その1',
				properties: {
					ATK_Rate: 3,
				},
			},
		],
		freeInput1: [
			{
				id: '1beb4c82-f986-480e-a2a9-5b327108330f',
				name: 'カスタム入力',
				properties: {},
			},
		],
		freeInput2: [
			{
				id: 'c3bb8cb2-9e72-415a-9b7f-250bc20ef387',
				name: 'カスタム入力',
				properties: {},
			},
		],
		freeInput3: [
			{
				id: '16169ec9-a5a0-4165-a974-8cf1ba2884d0',
				name: 'カスタム入力',
				properties: {},
			},
		],
	},
} as const

// 後方互換性のためのエクスポート
export default equipmentsData
