/**
 * バフアイテムプリセットデータ（TypeScript版）
 *
 * 型安全性とエディタ補完により開発効率を向上
 * EquipmentPropertiesインターフェースによる厳密な型チェック
 */

import type { BuffItemCategory, PresetBuffItem } from '@/types/calculator'

// バフアイテムデータの型定義
interface BuffItemsData {
	buffItems: Record<BuffItemCategory, PresetBuffItem[]>
}

// バフアイテムプリセットデータ
export const buffItemsData: BuffItemsData = {
	buffItems: {
		physicalPower: [
			{
				id: '0b3d0239-43ae-433d-96dc-6e44f90d0e3c',
				name: 'ペネトレートオイル',
				category: 'physicalPower',
				properties: {
					ATK_Rate: 3,
					PhysicalPenetration_Rate: 10,
				},
			},
			{
				id: '793edb74-85f1-474c-8208-9cad89bfee7e',
				name: 'みなぎる丸薬',
				category: 'physicalPower',
				properties: {
					ATK: 50,
					ATK_Rate: 5,
				},
			},
			{
				id: '71e58693-8fc2-4274-b405-d8246e3a848f',
				name: 'ランタンケーキ',
				category: 'physicalPower',
				properties: {
					ATK_Rate: 10,
				},
			},
			{
				id: 'ec65e74c-b7ca-4303-8e2f-95e5a75fcf5b',
				name: 'スラッシュオイル',
				category: 'physicalPower',
				properties: {
					ATK_Rate: 3,
					UnsheatheAttack_Rate: 5,
				},
			},
			{
				id: '248471e1-6c31-4ac1-adc8-c4764849d1c9',
				name: 'パンプソンパフェ',
				category: 'physicalPower',
				properties: {
					ATK_Rate: 6,
				},
			},
		],
		magicalPower: [
			{
				id: 'c3d902bf-c99b-45f4-90f4-2b6ca33781fe',
				name: '魔法障壁の石板',
				category: 'magicalPower',
				properties: {
					MATK_Rate: 5,
					MagicalPenetration_Rate: 10,
				},
			},
			{
				id: 'a781dca1-7c85-4cc4-992c-d2f22fb38fb3',
				name: '魔道士の秘薬',
				category: 'magicalPower',
				properties: {
					MATK_Rate: 5,
					MATK: 50,
				},
			},
			{
				id: 'd6729bda-c4b5-4eac-a811-4ee16585c339',
				name: '苦いプルプル',
				category: 'magicalPower',
				properties: {
					MATK_Rate: -4,
					CastingSpeed: 800,
				},
			},
		],
		physicalDefense: [
			{
				id: 'aa3124ae-dab4-4e57-bd64-c91d426db073',
				name: '謎のポーション(Y)',
				category: 'physicalDefense',
				properties: {
					ATK_Rate: 1,
				},
			},
			{
				id: '4aae1d40-840e-44b3-90bd-fa27de1c810d',
				name: '銀杏の炊き込みご飯',
				category: 'physicalDefense',
				properties: {
					PhysicalResistance_Rate: 25,
					MagicalResistance_Rate: 25,
				},
			},
		],
		magicalDefense: [
			{
				id: 'cfb7382e-e457-49a6-939c-16753e186901',
				name: '謎のポーション(P)',
				category: 'magicalDefense',
				properties: {
					MATK_Rate: 1,
				},
			},
		],
		elementalAttack: [
			{
				id: '9887dd73-3709-4d3c-84a8-898b1c502f54',
				name: 'ゾンビケーキ(有利共通)',
				category: 'elementalAttack',
				properties: {
					ElementAdvantage_Rate: 5,
					AttackSpeed: 100,
					CastingSpeed: 100,
				},
			},
			{
				id: '829bd7c6-d6d2-4789-97c8-e0585932dc76',
				name: 'かぼちゃの飴玉(有利共通)',
				category: 'elementalAttack',
				properties: {
					ElementAdvantage_Rate: 5,
					AttackSpeed: 100,
					CastingSpeed: 100,
				},
			},
			{
				id: '41cf5d08-48de-4e38-8a1b-16aa44474d58',
				name: 'かぼちゃクッキー(有利共通)',
				category: 'elementalAttack',
				properties: {
					ElementAdvantage_Rate: 5,
					AttackSpeed: 100,
					CastingSpeed: 100,
				},
			},
			{
				id: 'e96647d9-4edb-4b82-a339-25be215d3003',
				name: 'ジンジャーケーキ(有利共通)',
				category: 'elementalAttack',
				properties: {
					ElementAdvantage_Rate: 5,
					AttackSpeed: 100,
					CastingSpeed: 100,
				},
			},
			{
				id: 'b378522c-6078-442b-a087-d1f5ca41ef06',
				name: 'ジャックプリン(有利共通)',
				category: 'elementalAttack',
				properties: {
					ElementAdvantage_Rate: 5,
					AttackSpeed: 100,
					CastingSpeed: 100,
				},
			},
			{
				id: 'a46e7c22-2311-41d6-8e22-dcc446d83875',
				name: 'ブラックバーム(有利共通)',
				category: 'elementalAttack',
				properties: {
					ElementAdvantage_Rate: 5,
					AttackSpeed: 100,
					CastingSpeed: 100,
				},
			},
			{
				id: 'b19816b5-24a7-4b57-b3e1-16c7a86ebf72',
				name: 'パンプキンスープ(有利共通)',
				category: 'elementalAttack',
				properties: {
					ElementAdvantage_Rate: 5,
					AttackSpeed: 100,
					CastingSpeed: 100,
				},
			},
		],
		elementalDefense: [
			{
				id: '99041d06-24f5-4a5a-8a67-04fb51161621',
				name: '属性ケーキ類(共通)',
				category: 'elementalDefense',
				properties: {
					MP: 100,
				},
			},
			{
				id: '12e24ed6-4fdc-4a32-bd01-a2da537cc03d',
				name: 'たこけん焼き(共通)',
				category: 'elementalDefense',
				properties: {
					Critical: 15,
				},
			},
		],
		speed: [
			{
				id: '78649227-01e6-4c37-93c5-4dd85dce50a7',
				name: 'テラスピードポッド',
				category: 'speed',
				properties: {
					AttackSpeed: 1000,
				},
			},
			{
				id: '1dbb5b97-06ee-4602-9c0f-84b353b73668',
				name: 'ギガスピードポッド',
				category: 'speed',
				properties: {
					AttackSpeed: 750,
				},
			},
		],
		casting: [
			{
				id: '9bb01a2b-3765-4daf-ba36-0f350f8df91c',
				name: 'リスニングホン',
				category: 'casting',
				properties: {
					CastingSpeed: 700,
				},
			},
			{
				id: '2955cee9-bdc5-4414-9e9f-63df2c9e0ab7',
				name: 'ぶどうゼリー',
				category: 'casting',
				properties: {
					CastingSpeed: 300,
					MP: 300,
				},
			},
		],
		mp: [
			{
				id: '927e4ba4-2cf9-43fa-85f4-989b38bc4516',
				name: 'アドマジクルⅢ',
				category: 'mp',
				properties: {
					MP: 300,
				},
			},
			{
				id: '509fc242-0b59-456c-b340-d53f490208f5',
				name: 'アドマジクルⅣ',
				category: 'mp',
				properties: {
					MP: 400,
				},
			},
			{
				id: '814a4671-236b-4547-8dad-9096195d2ef3',
				name: 'アドマジクルⅤ',
				category: 'mp',
				properties: {
					MP: 500,
				},
			},
			{
				id: 'ecadf062-43a3-49b2-995f-87ac80acf9fc',
				name: 'アドマジクルⅥ',
				category: 'mp',
				properties: {
					MP: 600,
				},
			},
			{
				id: '8a873057-846d-4f4b-9ac5-858dafde6703',
				name: 'アドマジクルSP',
				category: 'mp',
				properties: {
					MP: 1000,
				},
			},
			{
				id: '03bbfe51-9234-40e2-9290-a651de6dfb7a',
				name: 'ロノーゴ海老ソテー',
				category: 'mp',
				properties: {
					MP: 300,
					CastingSpeed: 250,
				},
			},
			{
				id: '2e82bdee-d593-4180-9d21-01687cfc6eda',
				name: 'ソウルプリン',
				category: 'mp',
				properties: {
					MP: 300,
					HP: 1000,
				},
			},
			{
				id: 'e2248663-d8e7-4227-ab78-df63e946a244',
				name: 'キニナーレ',
				category: 'mp',
				properties: {
					MP: 100,
					Aggro_Rate: 20,
				},
			},
		],
		hp: [
			{
				id: 'f4ce514f-6e6a-4e74-b5ce-fa0195ea8875',
				name: 'ドラゴンステーキ',
				category: 'hp',
				properties: {
					HP: 1500,
					AttackSpeed: 250,
				},
			},
			{
				id: '91a533b2-1df4-4697-b8c5-b6419d9a72c9',
				name: 'プラスバイタⅥ',
				category: 'hp',
				properties: {
					HP: 3000,
				},
			},
		],
		accuracy: [
			{
				id: '07fa3f6e-c6fe-4357-a598-d078eb403421',
				name: '戦霊の輪',
				category: 'accuracy',
				properties: {
					Accuracy: 60,
				},
			},
			{
				id: '704d1a47-2583-4959-b5f0-ccbceba7ec8f',
				name: '葉桜茶',
				category: 'accuracy',
				properties: {
					Accuracy_Rate: 12,
					Critical: 6,
				},
			},
			{
				id: '294e0bb6-ac37-4055-ac14-b96000b73bb1',
				name: 'エスカルバター焼き',
				category: 'accuracy',
				properties: {
					Accuracy: 30,
					Critical: 5,
				},
			},
		],
		evasion: [
			{
				id: 'e55b6395-b356-4f3d-a7e2-72d38f938c03',
				name: '黄金ポム酒',
				category: 'evasion',
				properties: {
					Accuracy: 50,
					Dodge: 50,
				},
			},
			{
				id: 'f25c18d9-0942-4a38-abe0-fccea29b68fe',
				name: '白いプルプル',
				category: 'evasion',
				properties: {
					Dodge: 50,
				},
			},
		],
	},
} as const

// 後方互換性のためのエクスポート
export default buffItemsData
