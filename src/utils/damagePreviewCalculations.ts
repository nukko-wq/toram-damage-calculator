/**
 * DamagePreview用の計算ロジック
 * パッシブ倍率・ブレイブ倍率の計算をUI層から分離
 */

import type { CalculatorData } from '@/types/calculator'
import { getAttackSkillById } from '@/data/attackSkills'
import { getPresetEnemyById } from '@/utils/enemyDatabase'
import {
	getBuffSkillPassiveMultiplier,
	getBuffSkillPassiveMultiplierWithSkillCategory,
	getBuffSkillBraveMultiplier,
	getShootSkillPassiveMultiplier,
} from '@/utils/buffSkillCalculation'

/**
 * 現在のパッシブ倍率を取得（自動計算用）
 * 実際のダメージ計算と同じロジックを使用
 */
export function getCurrentPassiveMultiplier(
	calculatorData: CalculatorData,
): number {
	try {
		// バフスキルデータを取得
		const buffSkillsData = calculatorData.buffSkills.skills

		// 攻撃スキルが選択されているかチェック
		const selectedSkillId = calculatorData.attackSkill?.selectedSkillId
		if (selectedSkillId) {
			// 攻撃スキルが選択されている場合
			const selectedSkill = getAttackSkillById(selectedSkillId)
			if (selectedSkill && selectedSkill.hits.length > 0) {
				// 実際のダメージ計算と同じロジックを使用
				// 最初のヒットのcanUseLongRangeを使用（複数ヒットの場合は最初のもの）
				const firstHit = selectedSkill.hits[0]
				const passiveMultiplier =
					getBuffSkillPassiveMultiplierWithSkillCategory(
						buffSkillsData,
						calculatorData.mainWeapon.weaponType,
						selectedSkill.category,
						firstHit.canUseLongRange, // スキルデータから実際の値を取得
						selectedSkill.id,
					)
				return Math.round(passiveMultiplier * 100) / 100
			}
		}

		// 攻撃スキルが選択されていない場合（通常攻撃）
		// 通常攻撃の場合は、ロングレンジスキルが有効かつレベル > 0の場合のみ適用
		const longRangeSkill = buffSkillsData?.LongRange
		const canUseLongRange =
			longRangeSkill?.isEnabled && (longRangeSkill.level ?? 0) > 0

		const passiveMultiplier = getBuffSkillPassiveMultiplier(
			buffSkillsData,
			calculatorData.mainWeapon.weaponType,
		)

		// 通常攻撃でロングレンジが有効な場合は追加で適用
		if (canUseLongRange) {
			const longRangeMultiplier = getShootSkillPassiveMultiplier(
				buffSkillsData,
				canUseLongRange,
			)
			return Math.round((passiveMultiplier + longRangeMultiplier) * 100) / 100
		}

		return Math.round(passiveMultiplier * 100) / 100 // 小数第2位まで
	} catch (error) {
		console.error('パッシブ倍率計算エラー:', error)
		return 0
	}
}

/**
 * 現在のブレイブ倍率を取得（自動計算用）
 * 実際のダメージ計算と同じロジックを使用
 */
export function getCurrentBraveMultiplier(
	calculatorData: CalculatorData,
): number {
	try {
		// 実際のダメージ計算と同じロジックを使用
		// エンハンススキルのブレイブ倍率を適用するため、敵情報を含めて計算

		// 敵情報を取得
		let enemyInfo = null
		if (calculatorData.enemy?.selectedEnemyId) {
			enemyInfo = getPresetEnemyById(calculatorData.enemy.selectedEnemyId)
		}

		// デフォルト値を設定
		const defaultEnemyDEF = 1000
		const defaultEnemyMDEF = 1000
		const defaultEnemyLevel = 100

		// Normal難易度のDEF/MDEFを使用（エンハンス計算用）
		const normalEnemyDEF = enemyInfo?.stats.DEF ?? defaultEnemyDEF
		const normalEnemyMDEF = enemyInfo?.stats.MDEF ?? defaultEnemyMDEF
		const enemyLevel = enemyInfo?.level ?? defaultEnemyLevel

		// 敵情報を含めてブレイブ倍率を計算（エンハンス含む）
		const braveMultiplier = getBuffSkillBraveMultiplier(
			calculatorData.buffSkills.skills,
			normalEnemyDEF,
			normalEnemyMDEF,
			enemyLevel,
		)
		return Math.round(braveMultiplier * 100) / 100 // 小数第2位まで
	} catch (error) {
		console.error('ブレイブ倍率計算エラー:', error)
		return 0
	}
}
