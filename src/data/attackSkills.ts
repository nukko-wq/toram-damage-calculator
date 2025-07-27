import type {
	AttackSkill,
	WeaponType,
	AttackSkillSystemGroup,
} from '@/types/calculator'

/**
 * 攻撃スキルマスタデータ（定義順）
 * 表示専用の情報を管理（実際の計算は別システムで実行）
 */
const attackSkillsRawData: AttackSkill[] = [
	// 片手剣スキル
	{
		id: 'buster_blade',
		name: 'バスターブレード',
		order: 101,
		systemGroup: 'sword',
		category: 'blade',
		weaponTypeRequirements: ['片手剣', '両手剣', '双剣'],
		mpCost: 300,
		multiplierFormula: '750% + 武器種別補正',
		fixedDamageFormula: '300',
		hits: [
			{
				hitNumber: 1,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'ATK',
				multiplier: 750, // 表示用の値
				fixedDamage: 300, // 表示用の値
				multiplierFormula: [
					'片手剣装備時：威力+基礎DEX/2%',
					'両手剣装備時：威力+基礎STR%',
				],
				familiarity: 'physical',
				familiarityGrant: 'physical',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseShortRangePower: true,
				canUseLongRangePower: false,
				specialEffects: ['確定クリティカル'],
			},
		],
	},

	// ムーンスラッシュ（特殊計算の例）
	{
		id: 'moon_slash',
		name: 'ムーンスラッシュ',
		order: 102,
		systemGroup: 'sword',
		category: 'blade',
		weaponTypeRequirements: ['片手剣'],
		mpCost: 400,
		multiplierFormula: '特殊計算',
		fixedDamageFormula: '特殊計算',
		hits: [
			{
				hitNumber: 1,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'ATK',
				multiplier: 1000, // 表示用（実際の計算は外部）
				fixedDamage: 400, // 表示用（実際の計算は外部）
				familiarity: 'physical',
				familiarityGrant: 'normal',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseShortRangePower: true,
				canUseLongRangePower: false,
			},
			{
				hitNumber: 2,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'ATK',
				multiplier: 0, // 表示用（|補正後STR|%は外部計算）
				fixedDamage: 0, // 表示用（基礎INT/2は外部計算）
				multiplierFormula: '威力+補正後STR%',
				fixedDamageFormula: '固定値+基礎INT/2',
				familiarity: 'physical',
				familiarityGrant: 'normal',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseShortRangePower: true,
				canUseLongRangePower: false,
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
		hits: [
			{
				hitNumber: 1,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'ATK',
				multiplier: 200, // 表示用（実際の計算は外部）
				fixedDamage: 100, // 表示用（実際の計算は外部）
				multiplierFormula: '400+補正後STR/5%',
				fixedDamageFormula: '槍装備時：固定値+100',
				familiarity: 'physical',
				familiarityGrant: 'normal',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseShortRangePower: true,
				canUseLongRangePower: false,
			},
			{
				hitNumber: 2,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'ATK',
				multiplier: 200, // 表示用（実際の計算は外部）
				fixedDamage: 100, // 表示用（実際の計算は外部）
				multiplierFormula: '400+補正後STR/5%',
				fixedDamageFormula: '槍装備時：固定値+100',
				familiarity: 'physical',
				familiarityGrant: 'normal',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseShortRangePower: true,
				canUseLongRangePower: false,
			},
			{
				hitNumber: 3,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'ATK',
				multiplier: 200, // 表示用（実際の計算は外部）
				fixedDamage: 100, // 表示用（実際の計算は外部）
				multiplierFormula: '400+補正後STR/5%',
				fixedDamageFormula: '槍装備時：固定値+100',
				familiarity: 'physical',
				familiarityGrant: 'normal',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseShortRangePower: true,
				canUseLongRangePower: false,
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
		multiplierFormula: '威力+補正後STR/5%',
		fixedDamageFormula: '100 (旋風槍装備時+100)',
		hits: [
			{
				hitNumber: 1,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'ATK',
				multiplier: 300, // 表示用（実際の計算は外部）
				fixedDamage: 100, // 表示用（実際の計算は外部）
				multiplierFormula: '威力+補正後STR/5%',
				fixedDamageFormula: '槍装備時：威力+100% 固定値+100',
				familiarity: 'physical',
				familiarityGrant: 'normal',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseShortRangePower: true,
				canUseLongRangePower: false,
			},
			{
				hitNumber: 2,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'ATK',
				multiplier: 300, // 表示用（実際の計算は外部）
				fixedDamage: 100, // 表示用（実際の計算は外部）
				multiplierFormula: '威力+補正後STR/5%',
				fixedDamageFormula: '槍装備時：威力+100% 固定値+100',
				familiarity: 'physical',
				familiarityGrant: 'normal',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseShortRangePower: true,
				canUseLongRangePower: false,
			},
			{
				hitNumber: 3,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'ATK',
				multiplier: 300, // 表示用（実際の計算は外部）
				fixedDamage: 100, // 表示用（実際の計算は外部）
				multiplierFormula: '威力+補正後STR/5%',
				fixedDamageFormula: '槍装備時：威力+100% 固定値+100',
				familiarity: 'physical',
				familiarityGrant: 'normal',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseShortRangePower: true,
				canUseLongRangePower: false,
			},
		],
	},

	// 杖スキル
	{
		id: 'magic_arrow',
		name: '術式/アロー',
		order: 601,
		systemGroup: 'magic',
		category: 'staff',
		weaponTypeRequirements: ['杖'],
		mpCost: 5,
		multiplierFormula: '125% (杖装備時+25%)',
		fixedDamageFormula: '50',
		hits: [
			{
				hitNumber: 1,
				attackType: 'magical',
				referenceDefense: 'MDEF',
				referenceResistance: 'magical',
				powerReference: 'MATK',
				multiplier: 125, // 表示用（実際の計算は外部）
				fixedDamage: 50, // 表示用（実際の計算は外部）
				multiplierFormula: '杖装備時：威力+25%',
				familiarity: 'magical',
				familiarityGrant: 'magical',
				canUseUnsheathePower: false,
				canUseLongRange: true,
				canUseShortRangePower: true,
				canUseLongRangePower: true,
			},
		],
	},

	// サイクロンアロー（ハンタースキル）
	{
		id: 'cyclone_arrow',
		name: 'サイクロンアロー',
		order: 502,
		systemGroup: 'bow',
		category: 'hunter',
		weaponTypeRequirements: ['弓'],
		mpCost: 100,
		multiplierFormula: '100% + 矢装備時補正後DEX/2%',
		fixedDamageFormula: '100',
		hits: [
			{
				hitNumber: 1,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'totalATK',
				multiplier: 100,
				fixedDamage: 100,
				multiplierFormula: '矢装備時：威力+補正後DEX/2%',
				familiarity: 'physical',
				familiarityGrant: 'physical',
				canUseUnsheathePower: false,
				canUseLongRange: true,
				canUseShortRangePower: true,
				canUseLongRangePower: true,
			},
		],
	},

	// 両手剣スキル（Lブーメラン\u2162）
	{
		id: 'l_boomerang_3',
		name: 'Lブーメラン\u2162',
		order: 103,
		systemGroup: 'sword',
		category: 'partizan',
		weaponTypeRequirements: ['両手剣'],
		mpCost: 400,
		multiplierFormula: '特殊計算',
		fixedDamageFormula: '400',
		hits: [
			{
				hitNumber: 1,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'ATK',
				multiplier: 1350, // 表示用（実際の計算は外部）
				fixedDamage: 400,
				multiplierFormula: '威力+基礎DEX%',
				familiarity: 'normal',
				familiarityGrant: 'normal',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseShortRangePower: false,
				canUseLongRangePower: false,
				specialEffects: ['貫通ボーナス50%'],
			},
			{
				hitNumber: 2,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'ATK',
				multiplier: 1350, // 表示用（実際の計算は外部）
				fixedDamage: 400,
				multiplierFormula: '威力+基礎DEX%',
				familiarity: 'normal',
				familiarityGrant: 'normal',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseShortRangePower: false,
				canUseLongRangePower: false,
				specialEffects: ['貫通ボーナス50%'],
			},
		],
	},

	// エアスライサー（双剣スキル）
	{
		id: 'air_slasher',
		name: 'エアスライサー',
		order: 801,
		systemGroup: 'dualSword',
		category: 'dualSword',
		weaponTypeRequirements: ['双剣'],
		mpCost: 20,
		multiplierFormula: '仮の値（要仕様書設計）',
		fixedDamageFormula: '仮の値（要仕様書設計）',
		hits: [
			{
				hitNumber: 1,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'totalATK',
				multiplier: 150, // 仮の値
				fixedDamage: 50, // 仮の値
				multiplierFormula: '仮の値（要仕様書設計）',
				fixedDamageFormula: '仮の値（要仕様書設計）',
				familiarity: 'physical',
				familiarityGrant: 'normal',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseShortRangePower: true,
				canUseLongRangePower: false,
				specialEffects: ['仮の効果（要仕様書設計）'],
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
export function getSystemGroupLabel(
	systemGroup: AttackSkillSystemGroup,
): string {
	switch (systemGroup) {
		case 'sword':
			return '剣系統------'
		case 'halberd':
			return '槍系統------'
		case 'magicSwordsman':
			return '魔法剣士系統------'
		case 'knuckle':
			return '手甲系統------'
		case 'bow':
			return '弓系統------'
		case 'magic':
			return '魔法系統------'
		case 'katana':
			return '抜刀系統------'
		case 'dualSword':
			return '双剣系統------'
		case 'other':
			return 'その他------'
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
		case 'ATK':
			return 'ATK'
		case 'MATK':
			return 'MATK'
		default:
			return powerRef
	}
}
