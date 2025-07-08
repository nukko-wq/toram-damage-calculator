/**
 * レジスタ効果をEquipmentPropertiesに変換するユーティリティ関数
 */

import type {
	RegisterFormData,
	RegisterEffect,
	EquipmentProperties,
} from '@/types/calculator'

/**
 * レジスタ効果をEquipmentPropertiesに変換
 * @param registerData レジスタフォームデータ
 * @returns 変換されたEquipmentProperties
 */
export function convertRegisterEffectsToProperties(
	registerData: RegisterFormData,
): Partial<EquipmentProperties> {
	const properties: Partial<EquipmentProperties> = {}

	// 各効果を処理
	for (const effect of registerData.effects) {
		if (!effect.isEnabled) continue

		switch (effect.type) {
			case 'maxHpUp':
				// 最大HPアップ: レベル × 10 を HP固定値に加算
				properties.HP = (properties.HP || 0) + effect.level * 10
				break

			case 'maxMpUp':
				// 最大MPアップ: レベル × 1 を MP固定値に加算
				properties.MP = (properties.MP || 0) + effect.level * 1
				break

			case 'physicalAttackUp':
				// 物理攻撃アップ: レベル × 1 を ATK固定値に加算
				properties.ATK = (properties.ATK || 0) + effect.level
				break

			case 'magicalAttackUp':
				// 魔法攻撃アップ: レベル × 1 を MATK固定値に加算
				properties.MATK = (properties.MATK || 0) + effect.level
				break

			case 'accuracyUp':
				// 命中アップ: レベル × 1 を Accuracy固定値に加算
				properties.Accuracy = (properties.Accuracy || 0) + effect.level
				break

			case 'evasionUp':
				// 回避アップ: レベル × 1 を Dodge固定値に加算
				properties.Dodge = (properties.Dodge || 0) + effect.level
				break

			case 'attackSpeedUp':
				// 攻撃速度アップ: レベル × 1 を AttackSpeed固定値に加算
				properties.AttackSpeed = (properties.AttackSpeed || 0) + effect.level
				break

			case 'magicalSpeedUp':
				// 魔法速度アップ: レベル × 1 を CastingSpeed固定値に加算
				properties.CastingSpeed = (properties.CastingSpeed || 0) + effect.level
				break

			case 'fateCompanionship':
				// 運命共同体: 特殊計算（レベル1固定 + パーティメンバー数効果）
				if (effect.level === 1) {
					const baseBonus = 5 // レベル1固定効果
					const partyBonus = (effect.partyMembers || 1) * 3 // パーティメンバー数効果
					const totalBonus = baseBonus + partyBonus

					properties.ATK = (properties.ATK || 0) + totalBonus
					properties.MATK = (properties.MATK || 0) + totalBonus
				}
				break

			// 他の効果は将来実装
			default:
				break
		}
	}

	return properties
}

/**
 * 特定のレジスタ効果の値を取得
 * @param registerData レジスタフォームデータ
 * @param effectType 効果タイプ
 * @returns 効果が有効な場合の計算結果、無効な場合は0
 */
export function getRegisterEffectValue(
	registerData: RegisterFormData,
	effectType: string,
): number {
	const effect = registerData.effects.find(
		(e) => e.type === effectType && e.isEnabled,
	)

	if (!effect) return 0

	switch (effectType) {
		case 'maxHpUp':
			return effect.level * 10
		case 'maxMpUp':
			return effect.level * 1
		case 'physicalAttackUp':
		case 'magicalAttackUp':
		case 'accuracyUp':
		case 'evasionUp':
		case 'attackSpeedUp':
		case 'magicalSpeedUp':
			return effect.level
		case 'fateCompanionship':
			if (effect.level === 1) {
				const baseBonus = 5
				const partyBonus = (effect.partyMembers || 1) * 3
				return baseBonus + partyBonus
			}
			return 0
		default:
			return 0
	}
}

/**
 * レジスタ効果の初期データを作成
 * @returns 初期化されたRegisterFormData
 */
export function createInitialRegisterData(): RegisterFormData {
	const effects: RegisterEffect[] = [
		{
			id: 'maxHpUp',
			name: '最大HPアップ',
			type: 'maxHpUp',
			isEnabled: false,
			level: 30,
			maxLevel: 30,
		},
		{
			id: 'maxMpUp',
			name: '最大MPアップ',
			type: 'maxMpUp',
			isEnabled: false,
			level: 30,
			maxLevel: 30,
		},
		{
			id: 'physicalAttackUp',
			name: '物理攻撃アップ',
			type: 'physicalAttackUp',
			isEnabled: false,
			level: 30,
			maxLevel: 30,
		},
		{
			id: 'magicalAttackUp',
			name: '魔法攻撃アップ',
			type: 'magicalAttackUp',
			isEnabled: false,
			level: 30,
			maxLevel: 30,
		},
		{
			id: 'accuracyUp',
			name: '命中アップ',
			type: 'accuracyUp',
			isEnabled: false,
			level: 30,
			maxLevel: 30,
		},
		{
			id: 'evasionUp',
			name: '回避アップ',
			type: 'evasionUp',
			isEnabled: false,
			level: 30,
			maxLevel: 30,
		},
		{
			id: 'attackSpeedUp',
			name: '攻撃速度アップ',
			type: 'attackSpeedUp',
			isEnabled: false,
			level: 30,
			maxLevel: 30,
		},
		{
			id: 'magicalSpeedUp',
			name: '魔法速度アップ',
			type: 'magicalSpeedUp',
			isEnabled: false,
			level: 30,
			maxLevel: 30,
		},
		{
			id: 'fateCompanionship',
			name: '運命共同体',
			type: 'fateCompanionship',
			isEnabled: false,
			level: 1, // 運命共同体は常にレベル1
			maxLevel: 1,
			partyMembers: 1, // デフォルトは1人（自分以外）
		},
	]

	return { effects }
}
