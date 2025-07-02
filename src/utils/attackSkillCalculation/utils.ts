import { useCalculatorStore } from '@/stores/calculatorStore'
import { calculateResults } from '@/utils/calculationEngine'
import type { CalculatorData } from '@/types/calculator'
import type { EquipmentContext, PlayerStats } from './types'

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
		}
	}

	/**
	 * CalculatorDataからPlayerStatsに変換
	 */
	static convertToPlayerStats(calculatorData: CalculatorData): PlayerStats {
		const { baseStats } = calculatorData

		// 基本ステータス計算（既存のcalculationEngine.tsを使用）
		const results = calculateResults(calculatorData)

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
		}
	}

	/**
	 * CalculatorDataからEquipmentContextに変換
	 */
	static convertToEquipmentContext(calculatorData: CalculatorData): EquipmentContext {
		const { mainWeapon, subWeapon } = calculatorData

		return {
			mainWeaponType: mainWeapon.weaponType,
			subWeaponType: subWeapon.weaponType,
			hasHalberdEquipped: mainWeapon.weaponType === '旋風槍',
		}
	}
}