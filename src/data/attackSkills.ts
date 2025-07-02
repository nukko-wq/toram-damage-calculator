import type { AttackSkill, WeaponType } from '@/types/calculator'

/**
 * 攻撃スキルマスタデータ
 * 表示専用の情報を管理（実際の計算は別システムで実行）
 */
export const attackSkillsData: AttackSkill[] = [
	// 片手剣スキル
	{
		id: 'slash',
		name: 'スラッシュ',
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
			},
		],
		description: '基本的な攻撃スキル',
	},

	// ムーンスラッシュ（特殊計算の例）
	{
		id: 'moon_slash',
		name: 'ムーンスラッシュ',
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
			},
		],
		description: '特殊な計算式を持つ多段攻撃スキル',
	},

	// 杖スキル
	{
		id: 'magic_arrow',
		name: 'マジックアロー',
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
			},
		],
		description: '基本的な魔法攻撃スキル',
	},

	// 弓スキル
	{
		id: 'power_shot',
		name: 'パワーショット',
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
			},
		],
		description: '威力を高めた射撃攻撃',
	},

	// 双剣スキル（多段攻撃の例）
	{
		id: 'dual_strike',
		name: 'デュアルストライク',
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
			},
		],
		description: '連続で攻撃する双剣スキル',
	},
]

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
