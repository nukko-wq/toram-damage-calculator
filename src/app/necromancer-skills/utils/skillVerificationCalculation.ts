interface VerificationInput {
	playerLevel: number
	atk: number
	matk: number
	stabilityRate: number
	physicalPenetration: number
	criticalDamage: number
	totalElementAdvantage: number
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
	// 仮定値（ネクロマンサースキルの一般的な値）
	const assumedEnemyLevel = 143
	const assumedEnemyDEF = 143
	const assumedPhysicalResistance = 5 // %
	const referenceStat = input.atk // 物理攻撃として仮定

	// ステップ1: 基礎ダメージ計算
	// INT((自Lv + 参照ステータス - 敵Lv) × (1 - 物理耐性/100) × (1 - 武器耐性/100) - 計算後敵DEF)
	const beforeResistance = input.playerLevel + referenceStat - assumedEnemyLevel
	const afterResistance =
		beforeResistance * (1 - assumedPhysicalResistance / 100)
	const processedEnemyDEF =
		assumedEnemyDEF * (1 - input.physicalPenetration / 100)
	const step1_baseDamage = Math.floor(
		Math.max(1, afterResistance - processedEnemyDEF),
	)

	// 安定率を考慮した実測ダメージから基本ダメージを逆算
	// 実測ダメージ = 基本ダメージ × (安定率ランダム係数)
	// 平均的に安定率の中央値（(安定率 + 100) / 2）%を使用したと仮定
	const averageStabilityRate = (input.stabilityRate + 100) / 2
	const estimatedBaseDamage = Math.floor(
		(input.actualDamage * 100) / averageStabilityRate,
	)

	// スキル倍率と固定値を逆算
	// スキル適用後ダメージ = INT(属性有利適用後 × スキル倍率/100)
	// 属性有利適用後 = INT(固定値適用後 × (1 + 属性有利/100))
	// 固定値適用後 = INT(基礎ダメージ + スキル固定値)

	// 属性有利を逆算
	const step3_afterElement = Math.floor(
		estimatedBaseDamage / (1 + input.totalElementAdvantage / 100),
	)

	// 固定値を仮定して倍率を計算
	// まず固定値0と仮定して計算
	let skillFixedDamage = 0
	let step2_afterFixed = step1_baseDamage + skillFixedDamage

	// 属性有利適用
	const calculatedStep3 = Math.floor(
		step2_afterFixed * (1 + input.totalElementAdvantage / 100),
	)

	// スキル倍率を逆算
	let skillMultiplier = (step3_afterElement * 100) / calculatedStep3

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
		// この倍率で固定値を逆算
		const requiredStep3 = Math.floor(
			estimatedBaseDamage / (testMultiplier / 100),
		)
		const requiredStep2 = Math.floor(
			requiredStep3 / (1 + input.totalElementAdvantage / 100),
		)
		const testFixedDamage = Math.max(0, requiredStep2 - step1_baseDamage)

		// 検証：この固定値と倍率で計算した結果
		const verifyStep2 = Math.floor(step1_baseDamage + testFixedDamage)
		const verifyStep3 = Math.floor(
			verifyStep2 * (1 + input.totalElementAdvantage / 100),
		)
		const verifyStep4 = Math.floor((verifyStep3 * testMultiplier) / 100)
		const verifyFinalDamage = Math.floor(
			(verifyStep4 * averageStabilityRate) / 100,
		)

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
	const step3_afterElementFinal = Math.floor(
		step2_afterFixed * (1 + input.totalElementAdvantage / 100),
	)
	const step4_afterSkill = Math.floor(
		(step3_afterElementFinal * skillMultiplier) / 100,
	)

	return {
		skillMultiplier,
		skillFixedDamage,
		baseDamage: step4_afterSkill,
		calculationSteps: {
			step1_baseDamage,
			step2_afterFixed,
			step3_afterElement: step3_afterElementFinal,
			step4_afterSkill,
		},
	}
}

// 簡易版：固定値0、一般的な倍率で計算
export function calculateSimpleSkillMultiplier(
	input: VerificationInput,
): number {
	const assumedEnemyLevel = 143
	const assumedEnemyDEF = 143
	const assumedPhysicalResistance = 5
	const referenceStat = input.atk

	// 基礎ダメージ
	const beforeResistance = input.playerLevel + referenceStat - assumedEnemyLevel
	const afterResistance =
		beforeResistance * (1 - assumedPhysicalResistance / 100)
	const processedEnemyDEF =
		assumedEnemyDEF * (1 - input.physicalPenetration / 100)
	const baseDamage = Math.floor(
		Math.max(1, afterResistance - processedEnemyDEF),
	)

	// 安定率考慮
	const averageStabilityRate = (input.stabilityRate + 100) / 2
	const estimatedBaseDamage = Math.floor(
		(input.actualDamage * 100) / averageStabilityRate,
	)

	// 属性有利を逆算
	const beforeSkillMultiplier = Math.floor(
		estimatedBaseDamage / (1 + input.totalElementAdvantage / 100),
	)

	// スキル倍率を逆算
	return (beforeSkillMultiplier * 100) / baseDamage
}
