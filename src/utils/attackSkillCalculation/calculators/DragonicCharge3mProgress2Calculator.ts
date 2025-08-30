import { SkillHitCalculator } from './SkillHitCalculator'
import type { SkillCalculationInput, SkillCalculationResult } from '../types'

/**
 * ドラゴニックチャージ(3m+進度2以下)専用計算器
 * 1hit目: 標準物理攻撃 (ATK参照、威力1000%、固定300)
 * 2hit目: 特殊物理攻撃 (ATK + 槍MATK×0.5参照、威力1000%、固定300、MDEF参照)
 */
export class DragonicCharge3mProgress2Calculator extends SkillHitCalculator {
	calculate(input: SkillCalculationInput): SkillCalculationResult {
		const { hitNumber } = input

		switch (hitNumber) {
			case 1:
				// 1hit目: 標準物理攻撃
				return {
					hitNumber: 1,
					calculatedMultiplier: 1000, // 固定1000%
					calculatedFixedDamage: 300, // 固定300
					calculationProcess: 'Fixed: 1000%, 300',
				}

			case 2:
				// 2hit目: 特殊威力参照 (ATK + 槍MATK×0.5)
				// 固定倍率・固定値を使用（威力参照は外部で処理）
				return {
					hitNumber: 2,
					calculatedMultiplier: 1000, // 固定1000%
					calculatedFixedDamage: 300, // 固定300
					calculationProcess:
						'Fixed: 1000%, 300 (PowerRef: ATK_spearMATK_half)',
				}

			default:
				throw new Error(
					`Invalid hit number for Dragonic Charge (3m+Progress2): ${hitNumber}`,
				)
		}
	}
}
