/**
 * ミンストレルスキル系統のバフスキル効果計算
 */

import type { EquipmentProperties, PowerOptions } from '@/types/calculator'

/**
 * 熱情の歌の効果を計算
 *
 * @param stackCount スタック数 (1-10)
 * @param powerOptions DamagePreviewの威力オプション設定
 * @returns バフ効果
 */
export function calculateHotKnowsEffects(
	stackCount: number,
	powerOptions?: PowerOptions,
): Partial<EquipmentProperties> {
	if (!stackCount || stackCount <= 0) return {}

	// DamagePreviewの属性攻撃設定を確認
	if (!powerOptions) return {}

	const elementAttack = powerOptions.elementAttack

	// 効果計算: 1.5 × スタック数
	const effectValue = stackCount * 1.5

	switch (elementAttack) {
		case 'advantageous':
			// 有利属性の場合: +効果
			return {
				ElementAdvantage_Rate: effectValue,
			}
		case 'disadvantageous':
			// 不利属性の場合: -効果
			return {
				ElementAdvantage_Rate: -effectValue,
			}
		default:
			// その他・無属性の場合: 効果なし
			return {}
	}
}
