/**
 * クリスタル表示ユーティリティ
 *
 * conditionalEffectsから装備条件の表示テキストを生成する機能
 */

import type {
	ArmorType,
	ConditionalEffect,
	EquipmentCondition,
	EquipmentProperties,
} from '@/types/calculator'

/**
 * 装備条件を日本語表示に変換
 */
export function formatConditionText(condition: EquipmentCondition): string {
	switch (condition.type) {
		case 'mainWeapon':
			return `${condition.weaponType}装備時`
		case 'subWeapon':
			return `${condition.weaponType}装備時`
		case 'armor': {
			const armorTypeMap: Record<ArmorType, string> = {
				light: '軽鎧',
				heavy: '重鎧',
				normal: '通常鎧',
			}
			return `${armorTypeMap[condition.armorType]}装備時`
		}
		default:
			return '条件不明'
	}
}

/**
 * プロパティキーを日本語表示に変換
 */
export function formatPropertyName(
	propertyKey: keyof EquipmentProperties,
): string {
	const propertyNameMap: Partial<Record<keyof EquipmentProperties, string>> = {
		// 基本攻撃力系
		ATK_Rate: 'ATK',
		ATK: 'ATK',
		MATK_Rate: 'MATK',
		MATK: 'MATK',
		WeaponATK_Rate: '武器ATK',
		WeaponATK: '武器ATK',

		// 防御力系
		DEF_Rate: 'DEF',
		DEF: 'DEF',
		MDEF_Rate: 'MDEF',
		MDEF: 'MDEF',

		// 貫通系
		PhysicalPenetration_Rate: '物理貫通',
		MagicalPenetration_Rate: '魔法貫通',
		ElementAdvantage_Rate: '属性有利',

		// 威力系
		UnsheatheAttack_Rate: '抜刀威力',
		UnsheatheAttack: '抜刀威力',
		ShortRangeDamage_Rate: '近距離の威力',
		LongRangeDamage_Rate: '遠距離の威力',

		// クリティカル系
		CriticalDamage_Rate: 'クリティカルダメージ',
		CriticalDamage: 'クリティカルダメージ',
		Critical_Rate: 'クリティカル率',
		Critical: 'クリティカル率',

		// 安定率
		Stability_Rate: '安定率',

		// HP/MP系
		HP_Rate: 'HP',
		HP: 'HP',
		MP_Rate: 'MP',
		MP: 'MP',

		// ステータス系
		STR_Rate: 'STR',
		STR: 'STR',
		INT_Rate: 'INT',
		INT: 'INT',
		VIT_Rate: 'VIT',
		VIT: 'VIT',
		AGI_Rate: 'AGI',
		AGI: 'AGI',
		DEX_Rate: 'DEX',
		DEX: 'DEX',
		CRT_Rate: 'CRT',
		CRT: 'CRT',
		MEN_Rate: 'MEN',
		MEN: 'MEN',
		TEC_Rate: 'TEC',
		TEC: 'TEC',

		// 速度系
		AttackSpeed_Rate: '攻撃速度',
		AttackSpeed: '攻撃速度',
		CastingSpeed_Rate: '詠唱速度',
		CastingSpeed: '詠唱速度',
		MotionSpeed_Rate: '行動速度',

		// 命中・回避系
		Accuracy_Rate: '命中',
		Accuracy: '命中',
		Dodge_Rate: '回避',
		Dodge: '回避',

		// 耐性系
		PhysicalResistance_Rate: '物理耐性',
		MagicalResistance_Rate: '魔法耐性',
		AilmentResistance_Rate: '状態異常耐性',

		// 特殊系
		Aggro_Rate: 'ヘイト',
		Anticipate_Rate: '先読み',
		ArmorBreak_Rate: '防御崩し',
		AttackMPRecovery_Rate: '攻撃MP回復',
		AttackMPRecovery: '攻撃MP回復',
		NaturalHPRecovery_Rate: 'HP自然回復',
		NaturalHPRecovery: 'HP自然回復',
		NaturalMPRecovery_Rate: 'MP自然回復',
		NaturalMPRecovery: 'MP自然回復',
		GuardPower_Rate: 'Guard力',
		GuardRecharge_Rate: 'Guard回復',
		PhysicalBarrier: '物理バリア',
		MagicalBarrier: '魔法バリア',
		FractionalBarrier: '割合バリア',
		BarrierCooldown_Rate: 'バリア速度',
	}

	return propertyNameMap[propertyKey] || propertyKey
}

/**
 * プロパティ値を表示用文字列に変換
 */
export function formatPropertyValue(
	value: number,
	propertyKey: keyof EquipmentProperties,
): string {
	const isPercentage = propertyKey.endsWith('_Rate')
	const sign = value >= 0 ? '+' : ''
	const suffix = isPercentage ? '%' : ''

	return `${sign}${value}${suffix}`
}

/**
 * 条件付き効果を表示用JSXに変換
 */
export function formatConditionalEffect(effect: ConditionalEffect): {
	conditionText: string
	effectTexts: string[]
} {
	const conditionText = formatConditionText(effect.condition)
	const effectTexts: string[] = []

	for (const [propertyKey, value] of Object.entries(effect.properties)) {
		if (typeof value === 'number' && value !== 0) {
			const propertyName = formatPropertyName(
				propertyKey as keyof EquipmentProperties,
			)
			const propertyValue = formatPropertyValue(
				value,
				propertyKey as keyof EquipmentProperties,
			)
			effectTexts.push(`${propertyName}${propertyValue}`)
		}
	}

	return {
		conditionText,
		effectTexts,
	}
}
