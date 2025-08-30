import type {
	AttackSkill,
	AttackSkillSystemGroup,
	WeaponType,
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
				adaptation: 'physical',
				adaptationGrant: 'physical',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseShortRangePower: true,
				canUseLongRangePower: false,
				specialEffects: ['確定クリティカル'],
				isGuaranteedCritical: true,
			},
		],
	},

	// メテオブレイカー
	{
		id: 'meteor_breaker',
		name: 'メテオブレイカー',
		order: 102,
		systemGroup: 'sword',
		category: 'blade',
		weaponTypeRequirements: ['片手剣', '両手剣', '双剣'],
		mpCost: 600,
		multiplierFormula: '600% (両手剣装備時+200%+基礎STR/10%)',
		fixedDamageFormula: '1hit目600、2hit目0',
		hits: [
			{
				hitNumber: 1,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'ATK',
				multiplier: 600, // 表示用（実際の計算は外部）
				fixedDamage: 600, // 1hit目固定ダメージ600
				multiplierFormula: '両手剣装備時：威力+200%+基礎STR/10%',
				adaptation: 'physical',
				adaptationGrant: 'physical',
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
				multiplier: 600, // 表示用（実際の計算は外部）
				fixedDamage: 0, // 2hit目固定ダメージ0
				multiplierFormula: '片手剣装備時：威力+基礎DEX/2%',
				adaptation: 'physical',
				adaptationGrant: 'physical',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseShortRangePower: true,
				canUseLongRangePower: false,
			},
		],
	},

	// ムーンスラッシュ（特殊計算の例）
	{
		id: 'moon_slash',
		name: 'ムーンスラッシュ',
		order: 103,
		systemGroup: 'sword',
		category: 'blade',
		weaponTypeRequirements: ['片手剣', '双剣', '両手剣'],
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
				adaptation: 'physical',
				adaptationGrant: 'physical',
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
				adaptation: 'physical',
				adaptationGrant: 'physical',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseShortRangePower: true,
				canUseLongRangePower: false,
			},
		],
	},

	// オーラブレード（基本計算）
	{
		id: 'aura_blade',
		name: 'オーラブレード',
		order: 104,
		systemGroup: 'sword',
		category: 'blade',
		weaponTypeRequirements: ['片手剣', '双剣', '両手剣'],
		mpCost: 300, // 保留のため仮設定
		multiplierFormula: '1500%',
		fixedDamageFormula: '200',
		hits: [
			{
				hitNumber: 1,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'ATK',
				multiplier: 1500,
				fixedDamage: 200,
				adaptation: 'physical',
				adaptationGrant: 'physical',
				canUseUnsheathePower: false,
				canUseLongRange: true,
				canUseShortRangePower: true,
				canUseLongRangePower: true,
			},
		],
	},

	// シャットアウト(通常)
	{
		id: 'shut_out',
		name: 'シャットアウト(通常)',
		order: 105,
		systemGroup: 'sword',
		category: 'blade',
		weaponTypeRequirements: ['片手剣', '双剣', '両手剣'],
		mpCost: 100,
		multiplierFormula: '500% + 武器種別補正',
		fixedDamageFormula: '100 + 武器種別補正',
		hits: [
			{
				hitNumber: 1,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'ATK',
				multiplier: 500, // 表示用（実際の計算は外部）
				fixedDamage: 100, // 表示用（実際の計算は外部）
				multiplierFormula: [
					'両手剣装備時：威力+1000%',
					'片手剣装備時：威力+基礎DEX/2%',
					'双剣装備時：威力+基礎AGI/4%',
				],
				fixedDamageFormula: '双剣装備時：固定値+100',
				adaptation: 'physical',
				adaptationGrant: 'physical',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseShortRangePower: true,
				canUseLongRangePower: false,
			},
		],
	},

	// シャットアウト(出血付与時)
	{
		id: 'shut_out_bleeding',
		name: 'シャットアウト(出血付与時)',
		order: 106,
		systemGroup: 'sword',
		category: 'blade',
		weaponTypeRequirements: ['片手剣', '双剣', '両手剣'],
		mpCost: 100,
		multiplierFormula: '500% + 武器種別補正',
		fixedDamageFormula: '100 + 武器種別補正',
		hits: [
			{
				hitNumber: 1,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'ATK',
				multiplier: 500, // 表示用（実際の計算は外部）
				fixedDamage: 100, // 表示用（実際の計算は外部）
				multiplierFormula: [
					'両手剣装備時：威力+1500%',
					'片手剣装備時：威力+|2000+基礎DEX|%',
					'双剣装備時：威力+2000%+基礎AGI/2%',
				],
				fixedDamageFormula: '双剣装備時：固定値+100',
				adaptation: 'physical',
				adaptationGrant: 'physical',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseShortRangePower: true,
				canUseLongRangePower: false,
				specialEffects: [
					'片手剣装備時：物理貫通4倍計算',
					'双剣装備時：物理貫通2倍計算',
				],
			},
		],
	},

	// オーガスラッシュ（消費鬼力連携の例）
	{
		id: 'ogre_slash',
		name: 'オーガスラッシュ',
		order: 107,
		systemGroup: 'sword',
		category: 'blade',
		weaponTypeRequirements: ['両手剣'],
		mpCost: 500,
		multiplierFormula: '特殊計算',
		fixedDamageFormula: '特殊計算',
		hits: [
			{
				hitNumber: 1,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'ATK',
				multiplier: 0, // 表示用（|基礎STR+基礎VIT|%+貫通加算は外部計算）
				fixedDamage: 0, // 表示用（補正後DEXは外部計算）
				multiplierFormula: '威力+|基礎STR+基礎VIT|%',
				fixedDamageFormula: '固定値+補正後DEX',
				adaptation: 'physical',
				adaptationGrant: 'physical',
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
				multiplier: 0, // 表示用（|200×消費鬼力数|%は外部計算）
				fixedDamage: 500, // 固定500ダメージ
				multiplierFormula: '威力+|200×消費鬼力数|%',
				fixedDamageFormula: '固定値500',
				adaptation: 'physical',
				adaptationGrant: 'physical',
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
				adaptation: 'physical',
				adaptationGrant: 'normal',
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
				adaptation: 'physical',
				adaptationGrant: 'normal',
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
				adaptation: 'physical',
				adaptationGrant: 'normal',
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
				adaptation: 'physical',
				adaptationGrant: 'normal',
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
				adaptation: 'physical',
				adaptationGrant: 'normal',
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
				adaptation: 'physical',
				adaptationGrant: 'normal',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseShortRangePower: true,
				canUseLongRangePower: false,
			},
		],
	},

	// トールハンマー(単発) - 槍系統の魔法攻撃スキル
	{
		id: 'thor_hammer_single',
		name: 'トールハンマー(単発)',
		order: 203,
		systemGroup: 'halberd',
		category: 'halberd',
		weaponTypeRequirements: ['旋風槍'], // 仮設定、要確定
		mpCost: 400,
		multiplierFormula: '1500%',
		fixedDamageFormula: '400',
		hits: [
			{
				hitNumber: 1,
				attackType: 'magical',
				referenceDefense: 'MDEF',
				referenceResistance: 'magical',
				powerReference: 'spearMATK',
				multiplier: 1500,
				fixedDamage: 400,
				adaptation: 'magical',
				adaptationGrant: 'magical',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseShortRangePower: false,
				canUseLongRangePower: false,
				specialEffects: ['確定クリティカル'],
				isGuaranteedCritical: true,
			},
		],
	},

	// トールハンマー(追撃3hit) - 槍系統の魔法攻撃スキル
	{
		id: 'thor_hammer_followup',
		name: 'トールハンマー(追撃3hit)',
		order: 204,
		systemGroup: 'halberd',
		category: 'halberd',
		weaponTypeRequirements: ['旋風槍'], // 仮設定、要確定
		mpCost: 400,
		multiplierFormula: '1500% + (200+補正後INT×10%)×6',
		fixedDamageFormula: '400 + 200',
		hits: [
			{
				hitNumber: 1,
				attackType: 'magical',
				referenceDefense: 'MDEF',
				referenceResistance: 'magical',
				powerReference: 'spearMATK',
				multiplier: 1500,
				fixedDamage: 400,
				adaptation: 'magical',
				adaptationGrant: 'magical',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseShortRangePower: false,
				canUseLongRangePower: false,
				specialEffects: ['確定クリティカル'],
				isGuaranteedCritical: true,
			},
			{
				hitNumber: 2,
				attackType: 'magical',
				referenceDefense: 'MDEF',
				referenceResistance: 'magical',
				powerReference: 'spearMATK',
				multiplier: 1200, // 基準値(200×6)
				fixedDamage: 200,
				adaptation: 'magical',
				adaptationGrant: 'magical',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseShortRangePower: false,
				canUseLongRangePower: false,
				specialEffects: ['確定クリティカル'],
				isGuaranteedCritical: true,
			},
		],
	},

	// トールハンマー(追撃5hit) - 槍系統の魔法攻撃スキル
	{
		id: 'thor_hammer_followup_5hit',
		name: 'トールハンマー(追撃5hit)',
		order: 205,
		systemGroup: 'halberd',
		category: 'halberd',
		weaponTypeRequirements: ['旋風槍'], // 仮設定、要確定
		mpCost: 400,
		multiplierFormula: '1500% + (200+補正後INT×10%)×15',
		fixedDamageFormula: '400 + 200',
		hits: [
			{
				hitNumber: 1,
				attackType: 'magical',
				referenceDefense: 'MDEF',
				referenceResistance: 'magical',
				powerReference: 'spearMATK',
				multiplier: 1500,
				fixedDamage: 400,
				adaptation: 'magical',
				adaptationGrant: 'magical',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseShortRangePower: false,
				canUseLongRangePower: false,
				specialEffects: ['確定クリティカル'],
				isGuaranteedCritical: true,
			},
			{
				hitNumber: 2,
				attackType: 'magical',
				referenceDefense: 'MDEF',
				referenceResistance: 'magical',
				powerReference: 'spearMATK',
				multiplier: 3000, // 基準値(200×15)
				fixedDamage: 200,
				adaptation: 'magical',
				adaptationGrant: 'magical',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseShortRangePower: false,
				canUseLongRangePower: false,
				specialEffects: ['確定クリティカル'],
				isGuaranteedCritical: true,
			},
		],
	},

	// トールハンマー(追撃8hit) - 槍系統の魔法攻撃スキル
	{
		id: 'thor_hammer_followup_8hit',
		name: 'トールハンマー(追撃8hit)',
		order: 206,
		systemGroup: 'halberd',
		category: 'halberd',
		weaponTypeRequirements: ['旋風槍'], // 仮設定、要確定
		mpCost: 400,
		multiplierFormula: '1500% + (200+補正後INT×10%)×36',
		fixedDamageFormula: '400 + 200',
		hits: [
			{
				hitNumber: 1,
				attackType: 'magical',
				referenceDefense: 'MDEF',
				referenceResistance: 'magical',
				powerReference: 'spearMATK',
				multiplier: 1500,
				fixedDamage: 400,
				adaptation: 'magical',
				adaptationGrant: 'magical',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseShortRangePower: false,
				canUseLongRangePower: false,
				specialEffects: ['確定クリティカル'],
				isGuaranteedCritical: true,
			},
			{
				hitNumber: 2,
				attackType: 'magical',
				referenceDefense: 'MDEF',
				referenceResistance: 'magical',
				powerReference: 'spearMATK',
				multiplier: 7200, // 基準値(200×36)
				fixedDamage: 200,
				adaptation: 'magical',
				adaptationGrant: 'magical',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseShortRangePower: false,
				canUseLongRangePower: false,
				specialEffects: ['確定クリティカル'],
				isGuaranteedCritical: true,
			},
		],
	},

	// 杖スキル
	{
		id: 'magic_arrow',
		name: '術式/アロー',
		order: 601,
		systemGroup: 'magic',
		category: 'magic',
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
				adaptation: 'magical',
				adaptationGrant: 'magical',
				canUseUnsheathePower: false,
				canUseLongRange: true,
				canUseShortRangePower: true,
				canUseLongRangePower: true,
			},
		],
	},

	// 術式/ストーム（1/6hit）- 旧仕様
	{
		id: 'storm_1_6hit',
		name: '術式/ストーム(1/6hit)-旧仕様',
		order: 602,
		systemGroup: 'magic',
		category: 'magic',
		weaponTypeRequirements: ['杖', '魔導具'],
		mpCost: 400,
		multiplierFormula: '200% (杖装備時300%)',
		fixedDamageFormula: '400',
		hits: [
			{
				hitNumber: 1,
				attackType: 'magical',
				referenceDefense: 'MDEF',
				referenceResistance: 'magical',
				powerReference: 'MATK',
				multiplier: 200, // 表示用（実際の計算は外部）
				fixedDamage: 400, // 固定ダメージ400
				multiplierFormula: '杖装備時：威力+100%',
				adaptation: 'magical',
				adaptationGrant: 'magical',
				canUseUnsheathePower: false,
				canUseLongRange: true,
				canUseShortRangePower: true,
				canUseLongRangePower: true,
			},
		],
	},

	// 術式/ストーム（1/6hit）- 新仕様
	{
		id: 'storm_1_6hit_new',
		name: '術式/ストーム(1/6hit)',
		order: 603,
		systemGroup: 'magic',
		category: 'magic',
		weaponTypeRequirements: ['杖', '魔導具'],
		mpCost: 400,
		multiplierFormula: '200% (杖装備時300%)',
		fixedDamageFormula: '420',
		hits: [
			{
				hitNumber: 1,
				attackType: 'magical',
				referenceDefense: 'MDEF',
				referenceResistance: 'magical',
				powerReference: 'MATK',
				multiplier: 200, // 表示用（実際の計算は外部）
				fixedDamage: 420, // 固定ダメージ420
				multiplierFormula: '杖装備時：威力+100%',
				adaptation: 'magical',
				adaptationGrant: 'magical',
				canUseUnsheathePower: false,
				canUseLongRange: true,
				canUseShortRangePower: true,
				canUseLongRangePower: true,
			},
		],
	},

	// 術式/ストーム（1/6hit）- ストーム延長
	{
		id: 'storm_1_6hit_extend',
		name: '術式/ストーム(1/6hit)-ストーム延長',
		order: 604,
		systemGroup: 'magic',
		category: 'magic',
		weaponTypeRequirements: ['杖', '魔導具'],
		mpCost: 400,
		multiplierFormula: '150% (杖装備時250%)',
		fixedDamageFormula: '420',
		hits: [
			{
				hitNumber: 1,
				attackType: 'magical',
				referenceDefense: 'MDEF',
				referenceResistance: 'magical',
				powerReference: 'MATK',
				multiplier: 150, // 表示用（実際の計算は外部）
				fixedDamage: 420, // 固定ダメージ420
				multiplierFormula: '杖装備時：威力+100%',
				adaptation: 'magical',
				adaptationGrant: 'magical',
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
		order: 503,
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
				adaptation: 'physical',
				adaptationGrant: 'physical',
				canUseUnsheathePower: false,
				canUseLongRange: true,
				canUseShortRangePower: true,
				canUseLongRangePower: true,
			},
		],
	},

	// クロスファイア(3溜め)（弓スキル）
	{
		id: 'cross_fire_3_charge',
		name: 'クロスファイア(3溜め)',
		order: 501,
		systemGroup: 'bow',
		category: 'shoot',
		weaponTypeRequirements: ['弓', '自動弓'],
		mpCost: 400,
		multiplierFormula: '弓:特殊計算、自動弓:2700%/300%x2',
		fixedDamageFormula: '400/400',
		hits: [
			{
				hitNumber: 1,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'ATK',
				multiplier: 2850, // 弓装備時の表示用（実際は特殊計算）
				fixedDamage: 400, // 固定ダメージ400
				adaptation: 'physical',
				adaptationGrant: 'physical',
				canUseUnsheathePower: false,
				canUseLongRange: true,
				canUseShortRangePower: true,
				canUseLongRangePower: true,
				specialEffects: ['物理貫通'], // 自動弓装備時のみ適用
			},
			{
				hitNumber: 2,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'ATK',
				multiplier: 400, // 弓装備時の表示用（200%x2）
				fixedDamage: 400, // 固定ダメージ400
				adaptation: 'physical',
				adaptationGrant: 'physical',
				canUseUnsheathePower: false,
				canUseLongRange: true,
				canUseShortRangePower: true,
				canUseLongRangePower: true,
				specialEffects: ['物理貫通'], // 自動弓装備時のみ適用
			},
		],
	},

	// クロスファイア(溜め可変)（弓スキル）
	{
		id: 'cross_fire_variable_charge',
		name: 'クロスファイア(溜め可変)',
		order: 502,
		systemGroup: 'bow',
		category: 'shoot',
		weaponTypeRequirements: ['弓', '自動弓'],
		mpCost: 400,
		multiplierFormula: '弓:特殊計算(溜め可変)、自動弓:特殊計算(溜め可変)',
		fixedDamageFormula: '400/400',
		hasVariableCharging: true,
		chargingRange: {
			min: 1,
			max: 5,
			default: 1,
		},
		hits: [
			{
				hitNumber: 1,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'ATK',
				multiplier: 1950, // 弓装備時の表示用（デフォルト値: 溜め1回）
				fixedDamage: 400, // 固定ダメージ400
				adaptation: 'physical',
				adaptationGrant: 'physical',
				canUseUnsheathePower: false,
				canUseLongRange: true,
				canUseShortRangePower: true,
				canUseLongRangePower: true,
				specialEffects: ['物理貫通'], // 自動弓装備時のみ適用
			},
			{
				hitNumber: 2,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'ATK',
				multiplier: 0, // 弓装備時の表示用（デフォルト値: 溜め1回 = 0%）
				fixedDamage: 0, // チャージ1の場合固定ダメージ0
				adaptation: 'physical',
				adaptationGrant: 'physical',
				canUseUnsheathePower: false,
				canUseLongRange: true,
				canUseShortRangePower: true,
				canUseLongRangePower: true,
				specialEffects: ['物理貫通'], // 自動弓装備時のみ適用
			},
		],
	},

	// 両手剣スキル（Lブーメラン\u2162）
	{
		id: 'l_boomerang_3',
		name: 'Lブーメラン\u2162',
		order: 108,
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
				adaptation: 'normal',
				adaptationGrant: 'normal',
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
				adaptation: 'normal',
				adaptationGrant: 'normal',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseShortRangePower: false,
				canUseLongRangePower: false,
				specialEffects: ['貫通ボーナス50%'],
			},
		],
	},

	// ストームブレイザー（10スタック）
	{
		id: 'storm_blazer_10stack',
		name: 'ストームブレイザー(10スタック)',
		order: 109,
		systemGroup: 'sword',
		category: 'blade',
		weaponTypeRequirements: ['両手剣'],
		mpCost: 200,
		multiplierFormula: '1000%',
		fixedDamageFormula: '200+補正後VIT',
		hits: [
			{
				hitNumber: 1,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'ATK',
				multiplier: 1000, // 表示用（実際の計算は外部）
				fixedDamage: 200, // 表示用（実際は200+補正後VIT）
				fixedDamageFormula: '固定値+補正後VIT',
				adaptation: 'physical',
				adaptationGrant: 'physical',
				canUseUnsheathePower: false,
				canUseLongRange: true,
				canUseShortRangePower: true,
				canUseLongRangePower: true,
			},
		],
	},

	// ストームブレイザー（1スタック）
	{
		id: 'storm_blazer_1stack',
		name: 'ストームブレイザー(1スタック)',
		order: 110,
		systemGroup: 'sword',
		category: 'blade',
		weaponTypeRequirements: ['両手剣'],
		mpCost: 200,
		multiplierFormula: '75%',
		fixedDamageFormula: '150+補正後VIT',
		hits: [
			{
				hitNumber: 1,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'ATK',
				multiplier: 75, // 表示用（実際の計算は外部）
				fixedDamage: 150, // 表示用（実際は150+補正後VIT）
				multiplierFormula: '75%',
				fixedDamageFormula: '150+補正後VIT',
				adaptation: 'physical',
				adaptationGrant: 'physical',
				canUseUnsheathePower: false,
				canUseLongRange: true,
				canUseShortRangePower: true,
				canUseLongRangePower: true,
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
				adaptation: 'physical',
				adaptationGrant: 'normal',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseShortRangePower: true,
				canUseLongRangePower: false,
				specialEffects: ['仮の効果（要仕様書設計）'],
			},
		],
	},

	// デンジャーシェイク(前入力派生)
	{
		id: 'danger_shake',
		name: 'デンジャーシェイク(前入力派生)',
		order: 301,
		systemGroup: 'necromancer',
		category: 'necromancer',
		weaponTypeRequirements: ['杖', '旋風槍'],
		mpCost: 100,
		multiplierFormula: '特殊計算',
		fixedDamageFormula: '100',
		hits: [
			{
				hitNumber: 1,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'ATK',
				multiplier: 1000, // 表示用（実際の計算は外部）
				fixedDamage: 100, // 固定100ダメージ
				multiplierFormula: '杖:|1000+基礎STR/2|%, 旋風槍:|750+基礎STR/2|%',
				adaptation: 'physical',
				adaptationGrant: 'physical',
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
				multiplier: 1500, // 表示用（実際の計算は外部）
				fixedDamage: 100, // 固定100ダメージ
				multiplierFormula: '杖:|1500+補正後STR|%, 旋風槍:|1000+補正後STR|%',
				adaptation: 'physical',
				adaptationGrant: 'physical',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseShortRangePower: true,
				canUseLongRangePower: false,
			},
		],
	},

	// カスタムスキル（ユーザー設定可能）
	{
		id: 'custom_skill',
		name: 'カスタムスキル',
		order: 999,
		systemGroup: 'custom',
		category: 'custom',
		weaponTypeRequirements: [], // 全武器対応
		mpCost: 100,
		multiplierFormula: 'ユーザー設定',
		fixedDamageFormula: 'ユーザー設定',
		hits: [
			{
				hitNumber: 1,
				attackType: 'physical',
				referenceDefense: 'DEF',
				referenceResistance: 'physical',
				powerReference: 'ATK',
				multiplier: 100,
				fixedDamage: 0,
				adaptation: 'physical',
				adaptationGrant: 'physical',
				canUseUnsheathePower: false,
				canUseLongRange: false,
				canUseShortRangePower: false,
				canUseLongRangePower: false,
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
		case 'necromancer':
			return 'ネクロマンサー系統------'
		case 'custom':
			return 'カスタム------'
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
		case 'spearMATK':
			return '槍MATK'
		default:
			return powerRef
	}
}
