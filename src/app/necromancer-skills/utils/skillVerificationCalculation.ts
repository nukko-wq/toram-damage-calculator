interface VerificationInput {
	playerLevel: number
	baseAtk: number
	baseDamage: number
	enhancedDamage: number
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
	// 2点測定による数学的解法
	// 測定1: baseDamage = INT((playerLevel + baseAtk - 1 + fixedDamage) × multiplier/100)
	// 測定2: enhancedDamage = INT((playerLevel + baseAtk + 100 - 1 + fixedDamage) × multiplier/100)
	
	const assumedEnemyLevel = 1
	const baseValue1 = input.playerLevel + input.baseAtk - assumedEnemyLevel // 測定1の基礎値
	const baseValue2 = input.playerLevel + input.baseAtk + 100 - assumedEnemyLevel // 測定2の基礎値（ATK+100）
	
	// 2点測定からスキル倍率と固定値を数学的に求める
	// damage1 = INT((baseValue1 + fixed) × mult/100)  
	// damage2 = INT((baseValue2 + fixed) × mult/100)
	// 
	// INTを無視した近似解として：
	// damage2 - damage1 ≈ (baseValue2 - baseValue1) × mult/100 = 100 × mult/100 = mult
	// よって mult ≈ damage2 - damage1
	
	const damageDiff = input.enhancedDamage - input.baseDamage
	const baseValueDiff = baseValue2 - baseValue1 // = 100
	
	// 初期近似: スキル倍率 ≈ ダメージ差
	let skillMultiplier = damageDiff
	
	// より正確な解を求めるため、近似値周辺で最適解を探索
	let bestResult = {
		multiplier: skillMultiplier,
		fixedDamage: 0,
		error: Infinity,
	}
	
	// 近似値±50の範囲で探索
	for (let testMultiplier = Math.max(1, skillMultiplier - 50); testMultiplier <= skillMultiplier + 50; testMultiplier++) {
		// この倍率で固定値を逆算
		// damage1 = INT((baseValue1 + fixed) × mult/100)
		// fixed = damage1 × 100/mult - baseValue1
		const calculatedFixed1 = (input.baseDamage * 100 / testMultiplier) - baseValue1
		const calculatedFixed2 = (input.enhancedDamage * 100 / testMultiplier) - baseValue2
		
		// 2つの固定値が近い値になることを確認（整数化誤差を考慮）
		const avgFixed = (calculatedFixed1 + calculatedFixed2) / 2
		const testFixedDamage = Math.max(0, Math.round(avgFixed))
		
		// 検証：この倍率と固定値で計算した結果
		const verifyDamage1 = Math.floor((baseValue1 + testFixedDamage) * testMultiplier / 100)
		const verifyDamage2 = Math.floor((baseValue2 + testFixedDamage) * testMultiplier / 100)
		
		const error1 = Math.abs(verifyDamage1 - input.baseDamage)
		const error2 = Math.abs(verifyDamage2 - input.enhancedDamage)
		const totalError = error1 + error2
		
		if (totalError < bestResult.error) {
			bestResult = {
				multiplier: testMultiplier,
				fixedDamage: testFixedDamage,
				error: totalError,
			}
		}
	}
	
	// 最適解を採用
	skillMultiplier = bestResult.multiplier
	const skillFixedDamage = bestResult.fixedDamage
	
	// 計算過程の表示用
	const step1_baseDamage = baseValue1
	const step2_afterFixed = Math.floor(step1_baseDamage + skillFixedDamage)
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

// 簡易版：2点測定による簡易計算
export function calculateSimpleSkillMultiplier(
	input: VerificationInput,
): number {
	// 2点測定での簡易計算：スキル倍率 ≈ ダメージ差
	return input.enhancedDamage - input.baseDamage
}
