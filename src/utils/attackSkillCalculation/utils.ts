import { useCalculatorStore } from '@/stores/calculatorStore'
import type { CalculatorData } from '@/types/calculator'
import { calculateResults } from '@/utils/calculationEngine'
import { getAllDataSourceBonusesWithBuffSkills } from '@/utils/dataSourceIntegration'
import { calculateEquipmentBonuses } from '@/utils/basicStatsCalculation'
import type { BuffSkillContext, EquipmentContext, PlayerStats } from './types'

/**
 * 計算支援関数
 */
export class SkillCalculationUtils {
	/**
	 * プレイヤーステータスを取得（他のストアから）
	 */
	static getPlayerStats(): PlayerStats {
		// CalculatorStoreから現在のステータスを取得
		const store = useCalculatorStore.getState()
		const { baseStats } = store.data

		// 基本ステータス計算（既存のcalculationEngine.tsを使用）
		const results = calculateResults(store.data)

		// 全データソースのボーナスを取得して物理貫通を計算
		const allBonuses = getAllDataSourceBonusesWithBuffSkills(store.data)
		const equipmentBonuses = calculateEquipmentBonuses(allBonuses)
		const totalPhysicalPenetration = equipmentBonuses.equipmentBonus1.physicalPenetration || 0

		return {
			baseSTR: baseStats.STR,
			baseDEX: baseStats.DEX,
			baseINT: baseStats.INT,
			baseAGI: baseStats.AGI,
			baseVIT: baseStats.VIT,

			// 補正後ステータス（計算結果から取得）
			adjustedSTR: results.adjustedStats.STR,
			adjustedDEX: results.adjustedStats.DEX,
			adjustedINT: results.adjustedStats.INT,
			adjustedAGI: results.adjustedStats.AGI,
			adjustedVIT: results.adjustedStats.VIT,

			totalATK: results.basicStats.totalATK || 0,
			MATK: results.basicStats.MATK || 0,
			HP: results.basicStats.HP || 0,
			MP: results.basicStats.MP || 0,
			level: baseStats.level,
			
			// 貫通系ステータス
			physicalPenetration: 0,
			totalPhysicalPenetration: totalPhysicalPenetration,
		}
	}

	/**
	 * 装備コンテキストを取得
	 */
	static getEquipmentContext(): EquipmentContext {
		const store = useCalculatorStore.getState()
		const { mainWeapon, subWeapon } = store.data

		return {
			mainWeaponType: mainWeapon.weaponType,
			subWeaponType: subWeapon.weaponType,
			hasHalberdEquipped: mainWeapon.weaponType === '旋風槍',
			hasStaffEquipped: mainWeapon.weaponType === '杖',
		}
	}

	/**
	 * CalculatorDataからPlayerStatsに変換
	 */
	static convertToPlayerStats(calculatorData: CalculatorData): PlayerStats {
		const { baseStats } = calculatorData

		// 基本ステータス計算（既存のcalculationEngine.tsを使用）
		const results = calculateResults(calculatorData)

		// 全データソースのボーナスを取得して物理貫通を計算
		const allBonuses = getAllDataSourceBonusesWithBuffSkills(calculatorData)
		const equipmentBonuses = calculateEquipmentBonuses(allBonuses)
		const totalPhysicalPenetration = equipmentBonuses.equipmentBonus1.physicalPenetration || 0

		return {
			baseSTR: baseStats.STR,
			baseDEX: baseStats.DEX,
			baseINT: baseStats.INT,
			baseAGI: baseStats.AGI,
			baseVIT: baseStats.VIT,

			// 補正後ステータス（計算結果から取得）
			adjustedSTR: results.adjustedStats.STR,
			adjustedDEX: results.adjustedStats.DEX,
			adjustedINT: results.adjustedStats.INT,
			adjustedAGI: results.adjustedStats.AGI,
			adjustedVIT: results.adjustedStats.VIT,

			totalATK: results.basicStats.totalATK || 0,
			MATK: results.basicStats.MATK || 0,
			HP: results.basicStats.HP || 0,
			MP: results.basicStats.MP || 0,
			level: baseStats.level,
			
			// 貫通系ステータス
			physicalPenetration: 0,
			totalPhysicalPenetration: totalPhysicalPenetration,
		}
	}

	/**
	 * CalculatorDataからEquipmentContextに変換
	 */
	static convertToEquipmentContext(
		calculatorData: CalculatorData,
	): EquipmentContext {
		const { mainWeapon, subWeapon } = calculatorData

		return {
			mainWeaponType: mainWeapon.weaponType,
			subWeaponType: subWeapon.weaponType,
			hasHalberdEquipped: mainWeapon.weaponType === '旋風槍',
			hasStaffEquipped: mainWeapon.weaponType === '杖',
		}
	}

	/**
	 * CalculatorDataからBuffSkillContextに変換
	 */
	static convertToBuffSkillContext(
		calculatorData: CalculatorData,
	): BuffSkillContext {
		const { buffSkills } = calculatorData

		return {
			getBuffSkillLevel: (skillId: string): number => {
				const skill = buffSkills.skills[skillId]
				if (!skill?.isEnabled) return 0

				// スタック型の場合はstackCountを返す
				if ('stackCount' in skill) {
					return skill.stackCount || 0
				}

				// レベル型の場合はlevelを返す
				if ('level' in skill) {
					return skill.level || 0
				}

				// トグル型の場合は1を返す（有効時）
				return 1
			},
		}
	}
}
