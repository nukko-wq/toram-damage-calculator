import type { AttackSkill, WeaponType, AttackSkillSystemGroup } from '@/types/calculator'

/**
 * 攻撃スキルマスタデータ（定義順）
 * 表示専用の情報を管理（実際の計算は別システムで実行）
 */
const attackSkillsRawData: AttackSkill[] = [
	// 片手剣スキル
	{
		id: 'slash',
		name: 'スラッシュ',
		order: 101,
		systemGroup: 'sword',
		category: 'sword',
		weaponTypeRequirements: ['片手剣'],
		mpCost: 8,
		multiplierFormula: '125%',
		fixedDamageFormula: '0',
		specialEffects: ['物理貫通ボーナス: +20%'],
		hits: [
			{
				hitNumber: 1,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'totalATK',
				multiplier: 125, // 表示用の値
				fixedDamage: 0, // 表示用の値
				multiplierFormula: '125%',
				fixedDamageFormula: '0',
				familiarity: 'physical',
				familiarityGrant: 'physical',
				canUseUnsheathePower: true,
				canUseLongRange: false,
				canUseDistancePower: true,
			},
		],
	},

	// ムーンスラッシュ（特殊計算の例）
	{
		id: 'moon_slash',
		name: 'ムーンスラッシュ',
		order: 102,
		systemGroup: 'sword',
		category: 'sword',
		weaponTypeRequirements: ['片手剣'],
		mpCost: 400,
		multiplierFormula: '特殊計算',
		fixedDamageFormula: '特殊計算',
		specialEffects: ['距離威力: ○', '抜刀威力: ×', 'ロングレンジ: ×'],
		hits: [
			{
				hitNumber: 1,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'totalATK',
				multiplier: 1000, // 表示用（実際の計算は外部）
				fixedDamage: 400, // 表示用（実際の計算は外部）
				multiplierFormula: '1000%',
				fixedDamageFormula: '400',
				familiarity: 'physical',
				familiarityGrant: 'physical',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseDistancePower: true,
			},
			{
				hitNumber: 2,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'totalATK',
				multiplier: 0, // 表示用（|補正後STR|%は外部計算）
				fixedDamage: 0, // 表示用（基礎INT/2は外部計算）
				multiplierFormula: '補正後STR%',
				fixedDamageFormula: '基礎INT/2',
				familiarity: 'physical',
				familiarityGrant: 'physical',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseDistancePower: true,
			},
		],
	},

	// 旋風槍スキル
	{
		id: 'strike_stab',
		name: 'ストライクスタブ(通常時)',
		order: 201,
		systemGroup: 'halberd',
		category: 'halberd',
		weaponTypeRequirements: ['旋風槍'],
		mpCost: 200,
		multiplierFormula: '|200+補正後STR/5|%',
		fixedDamageFormula: '100 (旋風槍装備時+100)',
		specialEffects: ['距離威力: ○', '抜刀威力: ×', 'ロングレンジ: ×'],
		hits: [
			{
				hitNumber: 1,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'totalATK',
				multiplier: 200, // 表示用（実際の計算は外部）
				fixedDamage: 100, // 表示用（実際の計算は外部）
				multiplierFormula: '|200+補正後STR/5|%',
				fixedDamageFormula: '100 (旋風槍装備時+100)',
				familiarity: 'physical',
				familiarityGrant: 'physical',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseDistancePower: true,
			},
			{
				hitNumber: 2,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'totalATK',
				multiplier: 200, // 表示用（実際の計算は外部）
				fixedDamage: 100, // 表示用（実際の計算は外部）
				multiplierFormula: '|200+補正後STR/5|%',
				fixedDamageFormula: '100 (旋風槍装備時+100)',
				familiarity: 'physical',
				familiarityGrant: 'physical',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseDistancePower: true,
			},
			{
				hitNumber: 3,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'totalATK',
				multiplier: 200, // 表示用（実際の計算は外部）
				fixedDamage: 100, // 表示用（実際の計算は外部）
				multiplierFormula: '|200+補正後STR/5|%',
				fixedDamageFormula: '100 (旋風槍装備時+100)',
				familiarity: 'physical',
				familiarityGrant: 'physical',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseDistancePower: true,
			},
		],
	},

	// 旋風槍スキル（敵状態異常時）
	{
		id: 'strike_stab_ailment',
		name: 'ストライクスタブ(敵状態異常時)',
		order: 202,
		systemGroup: 'halberd',
		category: 'halberd',
		weaponTypeRequirements: ['旋風槍'],
		mpCost: 200,
		multiplierFormula: '400+補正後STRx20%',
		fixedDamageFormula: '100 (旋風槍装備時+100)',
		specialEffects: ['距離威力: ○', '抜刀威力: ×', 'ロングレンジ: ×'],
		hits: [
			{
				hitNumber: 1,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'totalATK',
				multiplier: 400, // 表示用（実際の計算は外部）
				fixedDamage: 100, // 表示用（実際の計算は外部）
				multiplierFormula: '400+補正後STRx20%',
				fixedDamageFormula: '100 (旋風槍装備時+100)',
				familiarity: 'physical',
				familiarityGrant: 'physical',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseDistancePower: true,
			},
			{
				hitNumber: 2,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'totalATK',
				multiplier: 400, // 表示用（実際の計算は外部）
				fixedDamage: 100, // 表示用（実際の計算は外部）
				multiplierFormula: '400+補正後STRx20%',
				fixedDamageFormula: '100 (旋風槍装備時+100)',
				familiarity: 'physical',
				familiarityGrant: 'physical',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseDistancePower: true,
			},
			{
				hitNumber: 3,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'totalATK',
				multiplier: 400, // 表示用（実際の計算は外部）
				fixedDamage: 100, // 表示用（実際の計算は外部）
				multiplierFormula: '400+補正後STRx20%',
				fixedDamageFormula: '100 (旋風槍装備時+100)',
				familiarity: 'physical',
				familiarityGrant: 'physical',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseDistancePower: true,
			},
		],
	},

	// 杖スキル
	{
		id: 'magic_arrow',
		name: 'マジックアロー',
		order: 601,
		systemGroup: 'magic',
		category: 'staff',
		weaponTypeRequirements: ['杖'],
		mpCost: 5,
		multiplierFormula: '100%',
		fixedDamageFormula: '0',
		hits: [
			{
				hitNumber: 1,
				attackType: 'magical',
				referenceDefense: 'MDEF',
				referenceResistance: 'magical',
				powerReference: 'MATK',
				multiplier: 100,
				fixedDamage: 0,
				multiplierFormula: '100%',
				fixedDamageFormula: '0',
				familiarity: 'magical',
				familiarityGrant: 'magical',
				canUseUnsheathePower: false,
				canUseLongRange: true,
				canUseDistancePower: false,
			},
		],
	},

	// 弓スキル
	{
		id: 'power_shot',
		name: 'パワーショット',
		order: 501,
		systemGroup: 'bow',
		category: 'bow',
		weaponTypeRequirements: ['弓'],
		mpCost: 10,
		multiplierFormula: '150%',
		fixedDamageFormula: '0',
		specialEffects: ['ロングレンジ対応'],
		hits: [
			{
				hitNumber: 1,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'totalATK',
				multiplier: 150,
				fixedDamage: 0,
				multiplierFormula: '150%',
				fixedDamageFormula: '0',
				familiarity: 'physical',
				familiarityGrant: 'physical',
				canUseUnsheathePower: true,
				canUseLongRange: true,
				canUseDistancePower: true,
			},
		],
	},

	// 双剣スキル（多段攻撃の例）
	{
		id: 'dual_strike',
		name: 'デュアルストライク',
		order: 801,
		systemGroup: 'dualSword',
		category: 'dualSword',
		weaponTypeRequirements: ['双剣'],
		mpCost: 15,
		multiplierFormula: '各撃で異なる',
		fixedDamageFormula: '0',
		specialEffects: ['連続攻撃', 'クリティカル率+5%'],
		hits: [
			{
				hitNumber: 1,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'totalATK',
				multiplier: 120,
				fixedDamage: 0,
				multiplierFormula: '120%',
				fixedDamageFormula: '0',
				familiarity: 'physical',
				familiarityGrant: 'physical',
				canUseUnsheathePower: true,
				canUseLongRange: false,
				canUseDistancePower: true,
			},
			{
				hitNumber: 2,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'totalATK',
				multiplier: 100,
				fixedDamage: 0,
				multiplierFormula: '100%',
				fixedDamageFormula: '0',
				familiarity: 'physical',
				familiarityGrant: 'physical',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseDistancePower: false,
			},
		],
	},
]

/**
 * 系統別番号順でソートされた攻撃スキルデータ
 * 
 * 系統別番号体系:
 * - 100番台: 剣系統
 * - 200番台: 槍系統  
 * - 300番台: 魔法剣士系統
 * - 400番台: 手甲系統
 * - 500番台: 弓系統
 * - 600番台: 魔法系統
 * - 700番台: 抜刀系統
 * - 800番台: 双剣系統
 * - 900番台: その他
 */
export const attackSkillsData: AttackSkill[] = [...attackSkillsRawData].sort(
	(a, b) => a.order - b.order,
)

/**
 * 系統グループからラベル名を取得
 */
export function getSystemGroupLabel(systemGroup: AttackSkillSystemGroup): string {
	switch (systemGroup) {
		case 'sword': return '剣系統------'
		case 'halberd': return '槍系統------'
		case 'magicSwordsman': return '魔法剣士系統------'
		case 'knuckle': return '手甲系統------'
		case 'bow': return '弓系統------'
		case 'magic': return '魔法系統------'
		case 'katana': return '抜刀系統------'
		case 'dualSword': return '双剣系統------'
		case 'other': return 'その他------'
	}
}

/**
 * スキルIDからスキルデータを取得
 */
export function getAttackSkillById(id: string): AttackSkill | undefined {
	return attackSkillsData.find((skill) => skill.id === id)
}

/**
 * カテゴリ別にスキルを取得
 */
export function getAttackSkillsByCategory(
	category: AttackSkill['category'],
): AttackSkill[] {
	return attackSkillsData.filter((skill) => skill.category === category)
}

/**
 * 武器種に対応したスキルを取得
 */
export function getAttackSkillsByWeaponType(
	weaponType: WeaponType,
): AttackSkill[] {
	return attackSkillsData.filter(
		(skill) =>
			!skill.weaponTypeRequirements ||
			skill.weaponTypeRequirements.includes(weaponType),
	)
}

/**
 * 威力参照タイプの表示名を取得
 */
export function getPowerReferenceDisplayText(
	powerRef: AttackSkill['hits'][0]['powerReference'],
): string {
	switch (powerRef) {
		case 'totalATK':
			return '総ATK'
		case 'MATK':
			return 'MATK'
		default:
			return powerRef
	}
}
