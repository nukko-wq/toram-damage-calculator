import type { CalculatorData } from '@/types/calculator'
import { AttackSkillCalculator } from './AttackSkillCalculator'
import type {
	EquipmentContext,
	PlayerStats,
	SkillCalculationResult,
} from './types'
import { SkillCalculationUtils } from './utils'

/**
 * 外部からの呼び出し用サービスクラス
 */
export class AttackSkillCalculationService {
	private calculator = new AttackSkillCalculator()

	/**
	 * 現在のプレイヤー状態でスキル計算を実行
	 */
	calculateCurrentSkill(skillId: string): SkillCalculationResult[] {
		const playerStats = SkillCalculationUtils.getPlayerStats()
		const equipmentContext = SkillCalculationUtils.getEquipmentContext()

		return this.calculator.calculateSkill(
			skillId,
			playerStats,
			equipmentContext,
		)
	}

	/**
	 * CalculatorDataを使用してスキル計算を実行
	 */
	calculateSkill(
		skillId: string,
		calculatorData: CalculatorData,
	): { hits: SkillCalculationResult[] } {
		const playerStats =
			SkillCalculationUtils.convertToPlayerStats(calculatorData)
		const equipmentContext =
			SkillCalculationUtils.convertToEquipmentContext(calculatorData)

		const hits = this.calculator.calculateSkill(
			skillId,
			playerStats,
			equipmentContext,
		)

		return { hits }
	}

	/**
	 * 特定の条件でスキル計算を実行（テスト用）
	 */
	calculateSkillWithStats(
		skillId: string,
		playerStats: PlayerStats,
		equipmentContext: EquipmentContext,
	): SkillCalculationResult[] {
		return this.calculator.calculateSkill(
			skillId,
			playerStats,
			equipmentContext,
		)
	}
}

// シングルトンインスタンス
export const attackSkillCalculation = new AttackSkillCalculationService()

// 型のエクスポート
export type {
	EquipmentContext,
	PlayerStats,
	SkillCalculationInput,
	SkillCalculationResult,
} from './types'
