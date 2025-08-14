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
				conditionalEffects: [
					{
						condition: { type: 'subWeapon', weaponType: '盾' },
						properties: { Aggro_Rate: -50 },
						description: '盾装備時: ヘイト-50%',
					},
				],
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
			{
				id: 'f7c8d9e0-1234-5678-9abc-def012345678',
				name: 'ベリュム',
				type: 'weapon',
				properties: {
					ATK_Rate: 9,
					AttackMPRecovery: 6,
					Anticipate_Rate: 13,
					MP: -100,
				},
			},
			{
				id: 'a1b2c3d4-5678-9012-3456-789abcdef012',
				name: 'デフォーミス',
				type: 'weapon',
				properties: {
					ATK_Rate: 11,
					AttackMPRecovery: 8,
					Anticipate_Rate: 14,
					MP: -200,
				},
			},
			{
				id: 'e4f5g6h7-8901-2345-6789-012345678901',
				name: 'フビット',
				type: 'weapon',
				properties: {
					ATK_Rate: 6,
					PhysicalPenetration_Rate: 20,
					Aggro_Rate: -15,
					AilmentResistance_Rate: -15,
					MP: -200,
				},
			},
			{
				id: 'b8c9d0e1-2345-6789-0123-456789abcdef',
				name: 'バテュード',
				type: 'weapon',
				properties: {
					MATK_Rate: 10,
					MagicalPenetration_Rate: 7,
					Aggro_Rate: -11,
					MDEF_Rate: -30,
				},
			},
			{
				id: 'c3d4e5f6-7890-1234-5678-9012345678ab',
				name: '春方の夢見草',
				type: 'weapon',
				properties: {
					MATK_Rate: 11,
					Critical: 13,
					Aggro_Rate: -13,
				},
			},
			{
				id: 'd7e8f9a0-1234-5678-9012-3456789abcde',
				name: '原初の誘月華',
				type: 'weapon',
				properties: {
					ATK_Rate: 10,
					MATK_Rate: 10,
					HP_Rate: 10,
					Anticipate_Rate: 10,
					ArmorBreak_Rate: 10,
					MP: -200,
				},
			},
			{
				id: 'e2f3g4h5-6789-0123-4567-890123456789',
				name: 'バクザン',
				type: 'weapon',
				properties: {
					ATK_Rate: 11,
					DEX_Rate: 9,
					AttackSpeed_Rate: 7,
				},
			},
			{
				id: 'a55c4230-135b-4bbb-b089-5fc041c88c15',
				name: '死霊使いウササマⅡ',
				type: 'weapon',
				properties: {
					MATK_Rate: 7,
					CastingSpeed_Rate: 14,
					MotionSpeed_Rate: 3,
					HP_Rate: -15,
					AttackMPRecovery_Rate: -30,
				},
			},
			{
				id: 'e5703e08-4942-484a-9cae-a883cbc25f2b',
				name: 'ロンディネ',
				type: 'weapon',
				properties: {
					MATK_Rate: 11,
					DEX_Rate: 9,
					CastingSpeed_Rate: 7,
				},
			},
		],
		armor: [
			{
				id: '049bea51-bcde-47f0-a6d8-8556cc74b628',
				name: 'アルタダール',
				type: 'armor',
				properties: {
					Stability_Rate: 11,
					STR_Rate: 6,
					VIT_Rate: 6,
				},
				conditionalEffects: [
					{
						condition: { type: 'armor', armorType: 'light' },
						properties: {
							ShortRangeDamage_Rate: 11,
							Stability_Rate: -5,
						},
						description: '軽鎧装備時: 近距離威力+11%, 安定率-5%',
					},
					{
						condition: { type: 'armor', armorType: 'heavy' },
						properties: { LongRangeDamage_Rate: 11 },
						description: '重鎧装備時: 遠距離威力+11%',
					},
				],
			},
			{
				id: 'ebc3fa48-5a5a-4134-94ff-dd20ad0133bc',
				name: 'バングルドム',
				type: 'armor',
				properties: {
					ATK_Rate: 10,
					MATK_Rate: 10,
					AttackSpeed_Rate: 10,
					CastingSpeed_Rate: 10,
					HP_Rate: -20,
				},
				conditionalEffects: [
					{
						condition: { type: 'subWeapon', weaponType: '盾' },
						properties: { DEX_Rate: 5 },
						description: '盾装備時: DEX+5%',
					},
					{
						condition: { type: 'armor', armorType: 'light' },
						properties: { MagicalPenetration_Rate: 5 },
						description: '軽鎧装備時: 魔法貫通+5%',
					},
				],
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
			{
				id: '1a2b3c4d-5e6f-7890-1234-56789abcdef0',
				name: 'ビーモズ',
				type: 'armor',
				properties: {
					ATK_Rate: 6,
					MATK_Rate: 6,
					PhysicalPenetration_Rate: 8,
					MagicalPenetration_Rate: 8,
					Critical: 17,
					MP: -150,
				},
			},
			{
				id: '2b3c4d5e-6f78-9012-3456-789abcdef012',
				name: 'レオナルド博士Ⅱ',
				type: 'armor',
				properties: {
					MATK_Rate: 3,
					LongRangeDamage_Rate: 6,
					Critical_Rate: 20,
					HP: 6000,
					AilmentResistance_Rate: 5,
				},
			},
			{
				id: '3c4d5e6f-7890-1234-5678-9abcdef01234',
				name: '魔神クウィーザ',
				type: 'armor',
				properties: {
					MP: 1000,
					CastingSpeed: 300,
					MotionSpeed_Rate: 1,
				},
			},
			{
				id: '4d5e6f78-9012-3456-789a-bcdef0123456',
				name: 'ビルロッシュ',
				type: 'armor',
				properties: {
					HP_Rate: 60,
					PhysicalResistance_Rate: -7,
					MagicalResistance_Rate: -7,
				},
				conditionalEffects: [
					{
						condition: { type: 'mainWeapon', weaponType: '片手剣' },
						properties: { Aggro_Rate: 15 },
						description: '片手剣装備時：ヘイト+15%',
					},
					{
						condition: { type: 'mainWeapon', weaponType: '手甲' },
						properties: { Aggro_Rate: 15 },
						description: '手甲装備時：ヘイト+15%',
					},
				],
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
				conditionalEffects: [
					{
						condition: { type: 'subWeapon', weaponType: '盾' },
						properties: { MotionSpeed_Rate: 1 },
						description: '盾装備時: 行動速度+1%',
					},
				],
			},
			{
				id: '106dc3d9-2869-4c6d-b63a-b8350e39faf2',
				name: 'マギフィレーシア',
				type: 'additional',
				properties: {
					MATK_Rate: 9,
					INT_Rate: 3,
					Stability_Rate: 6,
				},
				conditionalEffects: [
					{
						condition: { type: 'mainWeapon', weaponType: '杖' },
						properties: { ArmorBreak_Rate: 10 },
						description: '杖装備時: 防御崩し+10%',
					},
					{
						condition: { type: 'mainWeapon', weaponType: '魔導具' },
						properties: { BladeReduction_Rate: 20 },
						description: '魔導具装備時: 射刃軽減+20%',
					},
					{
						condition: { type: 'subWeapon', weaponType: '魔導具' },
						properties: { BladeReduction_Rate: 20 },
						description: '魔導具装備時: 射刃軽減+20%',
					},
				],
			},
			{
				id: '70dfc8a7-b07d-426f-812d-9f80ec496a61',
				name: 'アイヤーク',
				type: 'additional',
				properties: {
					MATK_Rate: 10,
					MagicalPenetration_Rate: 10,
					HP_Rate: 24,
					Aggro_Rate: -15,
				},
				conditionalEffects: [
					{
						condition: { type: 'mainWeapon', weaponType: '杖' },
						properties: { MotionSpeed_Rate: 1 },
						description: '杖装備時: 行動速度+1%',
					},
				],
			},
			{
				id: '9009d232-56a9-414d-a191-9d5a7009d212',
				name: 'ペリプラスティ改',
				type: 'additional',
				properties: {
					MATK_Rate: 5,
					CastingSpeed_Rate: 75,
					LongRangeDamage_Rate: -16,
				},
			},
			{
				id: '558ffe22-f81a-4b76-a3b4-8dc50084ba81',
				name: 'いにしえの女帝',
				type: 'additional',
				properties: {
					ShortRangeDamage_Rate: -10,
					MATK_Rate: 3,
					CastingSpeed_Rate: 50,
				},
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
			{
				id: '5e6f7890-1234-5678-9abc-def012345678',
				name: 'シカノカーミ',
				type: 'special',
				properties: {
					ShortRangeDamage_Rate: 5,
					AttackMPRecovery: 20,
					Accuracy: 50,
				},
				conditionalEffects: [
					{
						condition: { type: 'mainWeapon', weaponType: '旋風槍' },
						properties: { LongRangeDamage_Rate: 5 },
						description: '旋風槍装備時: 遠距離威力+5%',
					},
				],
			},
			{
				id: '6f789012-3456-789a-bcde-f01234567890',
				name: '星の魔導士',
				type: 'special',
				properties: {
					MATK_Rate: 9,
					CastingSpeed_Rate: 9,
					Anticipate_Rate: 9,
				},
				conditionalEffects: [
					{
						condition: { type: 'mainWeapon', weaponType: '杖' },
						properties: { Aggro_Rate: -9 },
						description: '杖装備時: ヘイト-9%',
					},
					{
						condition: { type: 'subWeapon', weaponType: '盾' },
						properties: { Aggro_Rate: 9 },
						description: '盾装備時: ヘイト+9%',
					},
				],
			},
			{
				id: '78901234-5678-9abc-def0-123456789012',
				name: '機械紳メイプル',
				type: 'special',
				properties: {
					MP: 200,
					ShortRangeDamage_Rate: 10,
					PhysicalResistance_Rate: 10,
					MagicalResistance_Rate: 10,
					AilmentResistance_Rate: 5,
					FractionalBarrier: 5,
				},
				conditionalEffects: [
					{
						condition: { type: 'armor', armorType: 'heavy' },
						properties: { PhysicalResistance_Rate: 15 },
						description: '重鎧装備時: 物理耐性+15%',
					},
				],
			},
			{
				id: '89012345-6789-abcd-ef01-23456789abcd',
				name: '黒リグシー',
				type: 'special',
				properties: {
					AttackMPRecovery: 20,
					AttackSpeed: 300,
					AilmentResistance_Rate: 10,
					Aggro_Rate: 40,
				},
				conditionalEffects: [
					{
						condition: { type: 'armor', armorType: 'light' },
						properties: { BarrierCooldown_Rate: 10 },
						description: '軽鎧装備時：バリア速度+10%',
					},
					{
						condition: { type: 'armor', armorType: 'heavy' },
						properties: { FractionalBarrier: 10 },
						description: '重鎧装備時：割合バリア+10%',
					},
				],
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
					MagicalResistance_Rate: -15,
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
			{
				id: '9012345a-bcde-f012-3456-789abcdef012',
				name: '暴獣リグシー',
				type: 'normal',
				properties: {
					HP_Rate: 15,
					AttackSpeed_Rate: 20,
					ATK_Rate: 10,
					MP: -100,
				},
			},
			{
				id: 'a123456b-cdef-0123-4567-89abcdef0123',
				name: 'リマシナ',
				type: 'normal',
				properties: {
					AilmentResistance_Rate: 5,
					PhysicalResistance_Rate: 5,
					MagicalResistance_Rate: 5,
				},
			},
			{
				id: 'b234567c-def0-1234-5678-9abcdef01234',
				name: 'ルトセーザ',
				type: 'normal',
				properties: {
					ATK_Rate: 10,
					MATK_Rate: 10,
					AttackMPRecovery: 4,
					MP: -200,
				},
			},
			{
				id: 'c345678d-ef01-2345-6789-abcdef012345',
				name: '尉竜ルディス',
				type: 'normal',
				properties: {
					ShortRangeDamage_Rate: 9,
					Accuracy_Rate: 5,
					MP: 200,
					HP: -300,
					Critical: -7,
				},
			},
			{
				id: 'af5e8b04-0b14-43f6-bdc6-88c0a01fcc24',
				name: 'ピヌグールガ',
				type: 'normal',
				properties: {
					ATK_Rate: 11,
					MATK_Rate: 11,
					AttackSpeed: -300,
					CastingSpeed: -300,
				},
			},
			{
				id: '04adc4c6-3f9c-4448-8fb0-9186ffe48e25',
				name: 'コロン大親分',
				type: 'normal',
				properties: {
					MATK_Rate: 10,
					Critical_Rate: 20,
					Accuracy: -40,
				},
			},
		],
	},
} as const

// 後方互換性のためのエクスポート
export default crystalsData
