interface VerificationInput {
	playerLevel: number
	atk: number
	actualDamage: number
}

interface VerificationResult {
	skillMultiplier: number
	skillFixedDamage: number
	baseDamage: number
	calculationSteps: {
		step1_baseDamage: number
		step2_afterFixed: number
		step3_afterElement: number
		step4_afterSkill: number
	}
}

export function calculateSkillParameters(
	input: VerificationInput,
): VerificationResult {
	// 仮定値（ネクロマンサースキル検証用の理想条件）
	const assumedEnemyLevel = 1
	const referenceStat = input.atk // 物理攻撃として仮定

	// ステップ1: 基礎ダメージ計算
	// 理想条件: INT((自Lv + 参照ステータス - 1) × 1 × 1 - 0) = INT(自Lv + 参照ステータス - 1)
	const step1_baseDamage = Math.floor(Math.max(1, input.playerLevel + referenceStat - assumedEnemyLevel))

	// 理想条件: 安定率100%（ダメージ変動なし）、属性有利0%（倍率増加なし）
	// 大幅に簡略化された計算式: 実測ダメージ = INT((基礎ダメージ + 固定値) × スキル倍率/100)
	
	// 実測ダメージからスキル倍率と固定値を逆算
	const estimatedBaseDamage = input.actualDamage

	// 固定値を仮定して倍率を計算
	// まず固定値0と仮定して計算
	let skillFixedDamage = 0
	let step2_afterFixed = step1_baseDamage + skillFixedDamage

	// スキル倍率を逆算（属性有利なしなので直接計算）
	let skillMultiplier = (estimatedBaseDamage * 100) / step2_afterFixed

	// より正確な固定値を推定するため、複数の倍率候補で計算
	const commonMultipliers = [
		100, 120, 150, 180, 200, 250, 300, 350, 400, 450, 500,
	]
	let bestResult = {
		multiplier: skillMultiplier,
		fixedDamage: skillFixedDamage,
		error: Infinity,
	}

	for (const testMultiplier of commonMultipliers) {
		// この倍率で固定値を逆算（理想条件での簡略化された計算）
		// 最終ダメージ = INT((基礎ダメージ + 固定値) × スキル倍率/100)
		const requiredStep2 = Math.floor(estimatedBaseDamage / (testMultiplier / 100))
		const testFixedDamage = Math.max(0, requiredStep2 - step1_baseDamage)

		// 検証：この固定値と倍率で計算した結果
		const verifyStep2 = Math.floor(step1_baseDamage + testFixedDamage)
		const verifyFinalDamage = Math.floor((verifyStep2 * testMultiplier) / 100)

		const error = Math.abs(verifyFinalDamage - input.actualDamage)

		if (error < bestResult.error) {
			bestResult = {
				multiplier: testMultiplier,
				fixedDamage: testFixedDamage,
				error,
			}
		}
	}

	// 最適解で最終計算
	skillMultiplier = bestResult.multiplier
	skillFixedDamage = bestResult.fixedDamage

	step2_afterFixed = Math.floor(step1_baseDamage + skillFixedDamage)
	const step3_afterSkill = Math.floor((step2_afterFixed * skillMultiplier) / 100)

	return {
		skillMultiplier,
		skillFixedDamage,
		baseDamage: step3_afterSkill,
		calculationSteps: {
			step1_baseDamage,
			step2_afterFixed,
			step3_afterElement: step2_afterFixed, // 属性有利0%なので変化なし
			step4_afterSkill: step3_afterSkill,
		},
	}
}

// 簡易版：固定値0、一般的な倍率で計算
export function calculateSimpleSkillMultiplier(
	input: VerificationInput,
): number {
	const assumedEnemyLevel = 1
	const referenceStat = input.atk

	// 基礎ダメージ（理想条件）
	const baseDamage = Math.floor(Math.max(1, input.playerLevel + referenceStat - assumedEnemyLevel))

	// 理想条件: 安定率100%、属性有利0%
	// 実測ダメージ = INT(基礎ダメージ × スキル倍率/100)
	// スキル倍率を逆算（固定値0として）
	return (input.actualDamage * 100) / baseDamage
}
