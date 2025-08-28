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
	const initialMultiplier = damageDiff
	
	// 数学的解法で初期推定を求める
	// 固定値を推定し、その周辺で精密探索
	let bestResult = {
		multiplier: initialMultiplier,
		fixedDamage: 0,
		error: Infinity,
		verifyDamage1: 0,
		verifyDamage2: 0,
	}
	
	// Step 1: 粗い探索で大まかな範囲を特定
	for (let testMultiplier = Math.max(50, initialMultiplier - 100); testMultiplier <= initialMultiplier + 100; testMultiplier += 1) {
		// 固定値を逆算
		const estimatedFixed = (input.baseDamage * 100 / testMultiplier) - baseValue1
		
		// 固定値の候補を推定値周辺で探索
		for (let testFixed = Math.max(-50, Math.floor(estimatedFixed) - 20); testFixed <= Math.floor(estimatedFixed) + 20; testFixed++) {
			// 検証：この倍率と固定値で計算した結果
			const verifyDamage1 = Math.floor((baseValue1 + testFixed) * testMultiplier / 100)
			const verifyDamage2 = Math.floor((baseValue2 + testFixed) * testMultiplier / 100)
			
			const error1 = Math.abs(verifyDamage1 - input.baseDamage)
			const error2 = Math.abs(verifyDamage2 - input.enhancedDamage)
			const totalError = error1 + error2
			
			if (totalError < bestResult.error) {
				bestResult = {
					multiplier: testMultiplier,
					fixedDamage: testFixed,
					error: totalError,
					verifyDamage1,
					verifyDamage2,
				}
				
				// 完全一致が見つかった場合は探索を終了
				if (totalError === 0) {
					break
				}
			}
		}
		
		if (bestResult.error === 0) {
			break
		}
	}
	
	// Step 2: 粗い探索の結果を基に小数点で精密探索
	if (bestResult.error > 0) {
		const roughMultiplier = bestResult.multiplier
		const roughFixed = bestResult.fixedDamage
		
		for (let testMultiplier = roughMultiplier - 2; testMultiplier <= roughMultiplier + 2; testMultiplier += 0.1) {
			for (let testFixed = roughFixed - 5; testFixed <= roughFixed + 5; testFixed++) {
				// 検証：この倍率と固定値で計算した結果
				const verifyDamage1 = Math.floor((baseValue1 + testFixed) * testMultiplier / 100)
				const verifyDamage2 = Math.floor((baseValue2 + testFixed) * testMultiplier / 100)
				
				const error1 = Math.abs(verifyDamage1 - input.baseDamage)
				const error2 = Math.abs(verifyDamage2 - input.enhancedDamage)
				const totalError = error1 + error2
				
				if (totalError < bestResult.error) {
					bestResult = {
						multiplier: Math.round(testMultiplier * 10) / 10,
						fixedDamage: testFixed,
						error: totalError,
						verifyDamage1,
						verifyDamage2,
					}
					
					if (totalError === 0) {
						break
					}
				}
			}
			
			if (bestResult.error === 0) {
				break
			}
		}
	}
	
	// 最適解を採用
	const skillMultiplier = bestResult.multiplier
	const skillFixedDamage = bestResult.fixedDamage
	
	// 計算過程の表示用（正しい計算順序）
	const step1_baseDamage = baseValue1
	const step2_afterFixed = step1_baseDamage + skillFixedDamage // 固定値は単純加算（INT適用なし）
	const step3_afterElement = step2_afterFixed // 属性有利0%なので変化なし
	const step4_afterSkill = Math.floor(step3_afterElement * skillMultiplier / 100) // INT関数はここで適用
	
	return {
		skillMultiplier,
		skillFixedDamage,
		baseDamage: step4_afterSkill, // 推定パラメータでの計算結果
		calculationSteps: {
			step1_baseDamage,
			step2_afterFixed,
			step3_afterElement,
			step4_afterSkill,
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
