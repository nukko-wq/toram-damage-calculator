/**
 * ダメージ計算エンジン
 * トーラムオンラインの正確なダメージ計算式を実装
 */

// ============================================================================
// 型定義（設計書から）
// ============================================================================

/**
 * ダメージ計算の入力データ
 */
export interface DamageCalculationInput {
	// 基本情報
	playerLevel: number
	enemyLevel: number
	referenceStatType: 'totalATK' | 'MATK' | 'custom'
	referenceStat: number

	// 攻撃スキル情報
	attackSkill: {
		type: 'physical' | 'magical'
		multiplier: number // スキル倍率(%)
		fixedDamage: number // スキル固定値
		supportedDistances: ('short' | 'long')[] // 対応距離（距離補正有効な距離）
		canUseLongRange: boolean // ロングレンジバフの適用可否
	}

	// 耐性・防御力
	resistance: {
		physical: number // 物理耐性(%)
		magical: number // 魔法耐性(%)
		weapon: number // 武器耐性(%) ※現在は0固定
	}

	enemy: {
		DEF: number
		MDEF: number
		level: number
		category: 'mob' | 'fieldBoss' | 'boss' | 'raidBoss'
		difficulty?: 'normal' | 'hard' | 'lunatic' | 'ultimate' // boss カテゴリのみ
		raidBossLevel?: number // raidBoss カテゴリのみ
		hasDestruction: boolean // 破壊状態異常
		guaranteedCritical: number // 確定クリティカル (0-999)
	}

	// 貫通・固定値
	penetration: {
		physical: number // 物理貫通
		magical: number // 魔法貫通
	}

	unsheathe: {
		fixedDamage: number // 抜刀固定値
		rateBonus: number // 抜刀%(%)
		isActive: boolean // 抜刀攻撃かどうか
	}

	// 属性・距離・コンボ
	elementAdvantage: {
		total: number // 総属性有利(%)
		awakening: number // 属性覚醒有利(%)
		isActive: boolean // 属性攻撃有効かどうか
	}

	distance: {
		shortRange: number // 近距離威力(%)
		longRange: number // 遠距離威力(%)
	}

	combo: {
		isActive: boolean // コンボ強打有効
		multiplier: number // コンボ倍率（150%など）
	}

	// バフ倍率
	passiveMultiplier: number // パッシブ倍率の合計(%)
	braveMultiplier: number // ブレイブ倍率の合計(%)

	// UI制御値
	userSettings: {
		familiarity: number // 慣れ(50-250%)
		currentDistance: 'short' | 'long' | 'disabled' // 現在の距離判定
		damageType: 'critical' | 'graze' | 'expected' | 'white' // ダメージ判定
	}

	// 安定率
	stability: {
		rate: number // 安定率(%)（例: 70）
	}

	// クリティカル
	critical: {
		damage: number // クリティカルダメージ(%)（例: 125）
	}

	// バフスキル情報（エターナルナイトメア用）
	buffSkills: {
		eternalNightmare: {
			isEnabled: boolean
			level: number // 1-10
		}
		totalDarkPowerLevel: number // ダークパワースキル合計レベル
	}
}

/**
 * ダメージ計算の出力結果
 */
export interface DamageCalculationResult {
	baseDamage: number // 安定率適用前の基本ダメージ
	stabilityResult: {
		minDamage: number // 最小ダメージ（安定率%適用時）
		maxDamage: number // 最大ダメージ（100%時）
		averageDamage: number // 平均ダメージ
		stabilityRate: number // 安定率(%)
	}
	calculationSteps: DamageCalculationSteps
}

/**
 * 計算過程の詳細
 */
export interface DamageCalculationSteps {
	// ステップ1: 基礎ダメージ
	step1_baseDamage: {
		playerLevel: number
		referenceStat: number
		enemyLevel: number
		beforeResistance: number // (自Lv + 参照ステータス - 敵Lv)
		physicalResistanceRate: number
		magicalResistanceRate: number
		weaponResistanceRate: number
		afterResistance: number
		enemyDEF: number
		result: number
	}

	// ステップ2: 固定値加算
	step2_fixedValues: {
		baseDamage: number
		unsheatheFixed: number
		skillFixed: number
		result: number
	}

	// ステップ3: 属性有利
	step3_elementAdvantage: {
		beforeAdvantage: number
		advantageRate: number
		result: number
	}

	// ステップ4: スキル倍率
	step4_skillMultiplier: {
		beforeSkill: number
		skillRate: number
		result: number
	}

	// ステップ3a: クリティカルダメージ（クリティカル時のみ）
	step3a_critical?: {
		beforeCritical: number
		criticalRate: number
		result: number
	}

	// ステップ5: 抜刀%
	step5_unsheatheRate: {
		beforeUnsheathe: number
		unsheatheRate: number
		result: number
	}

	// ステップ6: 慣れ
	step6_familiarity: {
		beforeFamiliarity: number
		familiarityRate: number
		result: number
	}

	// ステップ7: 距離
	step7_distance: {
		beforeDistance: number
		distanceRate: number
		result: number
	}

	// ステップ8: コンボ
	step8_combo: {
		beforeCombo: number
		comboRate: number
		result: number
	}

	// ステップ9: パッシブ倍率
	step9_passive: {
		beforePassive: number
		passiveRate: number
		result: number
	}

	// ステップ10: ブレイブ倍率
	step10_brave: {
		beforeBrave: number
		braveRate: number
		result: number
	}

}

// ============================================================================
// メインダメージ計算関数
// ============================================================================

/**
 * メインダメージ計算関数
 * Phase 3でステップ5-7まで実装完了
 */
export function calculateDamage(input: DamageCalculationInput): DamageCalculationResult {
	const steps = {} as DamageCalculationSteps

	// ステップ1: 基礎ダメージ計算
	const step1Result = calculateBaseDamage(input, steps)

	// ステップ2: 固定値加算
	const step2Result = applyFixedValues(step1Result, input, steps)

	// ステップ3: 属性有利補正
	let step3Result = applyElementAdvantage(step2Result, input, steps)

	// ステップ3a: クリティカルダメージ補正（クリティカル時のみ）
	if (input.userSettings.damageType === 'critical') {
		console.log('→ ステップ3a: クリティカル計算を実行')
		step3Result = applyCriticalDamage(step3Result, input, steps)
	}

	// ステップ4: スキル倍率補正
	const step4Result = applySkillMultiplier(step3Result, input, steps)

	// ステップ5: 抜刀%補正 (Phase 3で実装)
	const step5Result = applyUnsheatheRate(step4Result, input, steps)

	// ステップ6: 慣れ補正 (Phase 3で実装)
	const step6Result = applyFamiliarity(step5Result, input, steps)

	// ステップ7: 距離補正 (Phase 3で実装)
	const step7Result = applyDistance(step6Result, input, steps)

	// ステップ8: コンボ補正 (Phase 3で実装)
	const step8Result = applyCombo(step7Result, input, steps)

	// ステップ9: パッシブ倍率補正（プレースホルダー）
	const step9Result = applyPassiveMultiplier(step8Result, input, steps)

	// ステップ10: ブレイブ倍率補正
	const baseDamage = applyBraveMultiplier(step9Result, input, steps)
	console.log('最終baseDamage:', baseDamage)

	// 安定率適用
	const stabilityResult = calculateStabilityDamage(baseDamage, input.stability.rate)

	return {
		baseDamage,
		stabilityResult,
		calculationSteps: steps,
	}
}

// ============================================================================
// 個別計算関数（Phase 1実装分）
// ============================================================================

/**
 * ステップ1: 基礎ダメージ計算
 */
function calculateBaseDamage(
	input: DamageCalculationInput,
	steps: DamageCalculationSteps,
): number {
	const beforeResistance =
		input.playerLevel + input.referenceStat - input.enemyLevel

	// 耐性適用（浮動小数点精度問題を避けるため整数演算を使用）
	const mainResistance = input.attackSkill.type === 'physical' 
		? input.resistance.physical 
		: input.resistance.magical
	const weaponResistance = input.resistance.weapon

	// (1 - 主耐性/100) × (1 - 武器耐性/100) を整数演算で計算
	// = (100 - 主耐性) × (100 - 武器耐性) / 10000
	const mainMultiplierNumerator = 100 - mainResistance
	const weaponMultiplierNumerator = 100 - weaponResistance
	const combinedNumerator = mainMultiplierNumerator * weaponMultiplierNumerator

	const afterResistance = (beforeResistance * combinedNumerator) / 10000

	// 敵防御力処理
	const enemyDefense =
		input.attackSkill.type === 'physical' ? input.enemy.DEF : input.enemy.MDEF
	const defenseType = input.attackSkill.type === 'physical' ? 'DEF' : 'MDEF'
	const processedDefense = processEnemyDefense(enemyDefense, input, defenseType)

	const result = Math.floor(afterResistance - processedDefense)

	// 計算過程を記録
	steps.step1_baseDamage = {
		playerLevel: input.playerLevel,
		referenceStat: input.referenceStat,
		enemyLevel: input.enemyLevel,
		beforeResistance,
		physicalResistanceRate: input.resistance.physical,
		magicalResistanceRate: input.resistance.magical,
		weaponResistanceRate: input.resistance.weapon,
		afterResistance,
		enemyDEF: processedDefense,
		result,
	}

	return Math.max(1, result) // 最低1ダメージ保証
}

/**
 * ステップ2: 固定値加算
 */
function applyFixedValues(
	baseDamage: number,
	input: DamageCalculationInput,
	steps: DamageCalculationSteps,
): number {
	const unsheatheFixed = input.unsheathe.isActive
		? input.unsheathe.fixedDamage
		: 0
	const skillFixed = input.attackSkill.fixedDamage

	const result = Math.floor(baseDamage + unsheatheFixed + skillFixed)

	// 計算過程を記録
	steps.step2_fixedValues = {
		baseDamage,
		unsheatheFixed,
		skillFixed,
		result,
	}

	return Math.max(1, result) // 最低1ダメージ保証
}

/**
 * ステップ3: 属性有利補正
 */
function applyElementAdvantage(
	beforeAdvantage: number,
	input: DamageCalculationInput,
	steps: DamageCalculationSteps,
): number {
	const advantageRate = input.elementAdvantage.isActive
		? input.elementAdvantage.total + input.elementAdvantage.awakening
		: 0

	const result = Math.floor(beforeAdvantage * (1 + advantageRate / 100))

	// 計算過程を記録
	steps.step3_elementAdvantage = {
		beforeAdvantage,
		advantageRate,
		result,
	}

	return Math.max(1, result) // 最低1ダメージ保証
}

/**
 * ステップ4: スキル倍率補正
 */
function applySkillMultiplier(
	beforeSkill: number,
	input: DamageCalculationInput,
	steps: DamageCalculationSteps,
): number {
	// スキル倍率の小数点を切り捨て（例：334.4% → 334%）
	const skillRate = Math.floor(input.attackSkill.multiplier)

	const result = Math.floor((beforeSkill * skillRate) / 100)

	// 計算過程を記録
	steps.step4_skillMultiplier = {
		beforeSkill,
		skillRate,
		result,
	}

	return Math.max(1, result) // 最低1ダメージ保証
}

/**
 * ステップ5: 抜刀%補正
 */
function applyUnsheatheRate(
	beforeUnsheathe: number,
	input: DamageCalculationInput,
	steps: DamageCalculationSteps,
): number {
	const unsheatheRate = input.unsheathe.isActive ? input.unsheathe.rateBonus : 0

	const result = Math.floor(beforeUnsheathe * (1 + unsheatheRate / 100))

	// 計算過程を記録
	steps.step5_unsheatheRate = {
		beforeUnsheathe,
		unsheatheRate,
		result,
	}

	return Math.max(1, result) // 最低1ダメージ保証
}

/**
 * ステップ6: 慣れ補正
 */
function applyFamiliarity(
	beforeFamiliarity: number,
	input: DamageCalculationInput,
	steps: DamageCalculationSteps,
): number {
	const familiarityRate = input.userSettings.familiarity

	const result = Math.floor(beforeFamiliarity * (familiarityRate / 100))

	// 計算過程を記録
	steps.step6_familiarity = {
		beforeFamiliarity,
		familiarityRate,
		result,
	}

	return Math.max(1, result) // 最低1ダメージ保証
}

/**
 * ステップ7: 距離補正
 */
function applyDistance(
	beforeDistance: number,
	input: DamageCalculationInput,
	steps: DamageCalculationSteps,
): number {
	let distanceRate = 0

	// 距離補正の適用判定
	if (input.userSettings.currentDistance !== 'disabled') {
		const currentDistance = input.userSettings.currentDistance
		
		// 距離補正対応スキルかどうかをチェック
		if (input.attackSkill.supportedDistances.includes(currentDistance)) {
			if (currentDistance === 'short') {
				distanceRate = input.distance.shortRange
			} else if (currentDistance === 'long') {
				distanceRate = input.distance.longRange
			}
		}
	}

	const result = Math.floor(beforeDistance * (1 + distanceRate / 100))

	// 計算過程を記録
	steps.step7_distance = {
		beforeDistance,
		distanceRate,
		result,
	}

	return Math.max(1, result) // 最低1ダメージ保証
}

/**
 * ステップ8: コンボ補正
 */
function applyCombo(
	beforeCombo: number,
	input: DamageCalculationInput,
	steps: DamageCalculationSteps,
): number {
	const comboRate = input.combo.isActive ? input.combo.multiplier : 100

	const result = Math.floor(beforeCombo * (comboRate / 100))

	// 計算過程を記録
	steps.step8_combo = {
		beforeCombo,
		comboRate,
		result,
	}

	return Math.max(1, result) // 最低1ダメージ保証
}

/**
 * ステップ9: パッシブ倍率補正（プレースホルダー）
 */
function applyPassiveMultiplier(
	beforePassive: number,
	input: DamageCalculationInput,
	steps: DamageCalculationSteps,
): number {
	// Phase 3ではプレースホルダー実装（倍率は適用せず）
	const passiveRate = 0 // input.passiveMultiplier

	const result = Math.floor(beforePassive * (1 + passiveRate / 100))

	// 計算過程を記録
	steps.step9_passive = {
		beforePassive,
		passiveRate,
		result,
	}

	return Math.max(1, result) // 最低1ダメージ保証
}

/**
 * ステップ10: ブレイブ倍率補正
 */
function applyBraveMultiplier(
	beforeBrave: number,
	input: DamageCalculationInput,
	steps: DamageCalculationSteps,
): number {
	// Phase 3ではプレースホルダー実装（倍率は適用せず）
	const braveRate = 0 // input.braveMultiplier

	const result = Math.floor(beforeBrave * (1 + braveRate / 100))

	// 計算過程を記録
	steps.step10_brave = {
		beforeBrave,
		braveRate,
		result,
	}

	return Math.max(1, result) // 最低1ダメージ保証
}

/**
 * ステップ3a: クリティカルダメージ補正（属性有利後に適用）
 */
function applyCriticalDamage(
	step3Result: number,
	input: DamageCalculationInput,
	steps: DamageCalculationSteps,
): number {
	console.log('=== CRITICAL DAMAGE CALCULATION (Step 3a) ===')
	console.log('step3Result (有利適用後):', step3Result)
	
	// クリティカルダメージ倍率を取得
	const criticalRate = input.critical.damage
	console.log('criticalRate (クリティカルダメージ%):', criticalRate)
	
	// ステップ3a: 属性有利の後、スキル倍率の前にクリティカル倍率を適用
	console.log('=== ステップ3a: クリティカル倍率適用（スキル倍率の前） ===')
	console.log(`有利適用後: ${step3Result}`)
	console.log(`クリティカル倍率: ${criticalRate}%`)
	console.log(`計算式: Math.floor(${step3Result} * ${criticalRate}/100)`)
	console.log(`= Math.floor(${step3Result} * ${criticalRate / 100})`)
	console.log(`= Math.floor(${step3Result * (criticalRate / 100)})`)
	const result = Math.floor(step3Result * (criticalRate / 100))
	console.log('result (クリティカル適用後):', result)

	// 計算過程を記録
	steps.step3a_critical = {
		beforeCritical: step3Result,
		criticalRate,
		result,
	}

	return Math.max(1, result) // 最低1ダメージ保証
}

// ============================================================================
// ヘルパー関数
// ============================================================================

/**
 * 敵防御力の処理（破壊・エターナルナイトメア・貫通・ボス難易度）
 * Phase 3でボス難易度補正を追加
 */
function processEnemyDefense(
	defense: number,
	input: DamageCalculationInput,
	defenseType: 'DEF' | 'MDEF',
): number {
	let processed = defense

	// 1. ボス難易度による防御力補正
	if (input.enemy.category === 'boss' && input.enemy.difficulty) {
		const difficultyMultiplier = getBossDifficultyDefenseMultiplier(input.enemy.difficulty)
		processed = Math.floor(processed * difficultyMultiplier)
	}

	// 2. 破壊状態異常による半減（小数点以下切り上げ）
	// Phase 3では未実装
	if (input.enemy.hasDestruction) {
		// processed = Math.ceil(processed / 2)
		// Phase 3では無視
	}

	// 3. エターナルナイトメア減算
	// Phase 3では未実装
	if (input.buffSkills.eternalNightmare.isEnabled) {
		// const eternalReduction = input.buffSkills.eternalNightmare.level * input.buffSkills.totalDarkPowerLevel * 0.5
		// processed = Math.max(0, processed - eternalReduction)
		// Phase 3では無視
	}

	// 4. 貫通による低下（%計算、小数点以下切り捨て）
	// 貫通値は参照防御力の種類に応じて適用
	// - 物理貫通：DEF参照時のみ有効（%として適用）
	// - 魔法貫通：MDEF参照時のみ有効（%として適用）
	// 計算式：(M)DEF × (1 - 貫通%/100)
	let penetrationRate = 0
	if (defenseType === 'DEF') {
		penetrationRate = input.penetration.physical
	} else if (defenseType === 'MDEF') {
		penetrationRate = input.penetration.magical
	}

	processed = Math.floor(processed * (1 - penetrationRate / 100))

	return processed
}

/**
 * ボス難易度による防御力倍率を取得
 */
function getBossDifficultyDefenseMultiplier(difficulty: 'normal' | 'hard' | 'lunatic' | 'ultimate'): number {
	switch (difficulty) {
		case 'normal': return 1.0   // 100%
		case 'hard': return 1.2     // 120%
		case 'lunatic': return 1.5  // 150%
		case 'ultimate': return 2.0 // 200%
		default: return 1.0
	}
}

/**
 * 安定率ダメージ計算
 */
function calculateStabilityDamage(
	baseDamage: number,
	stabilityRate: number,
): {
	minDamage: number
	maxDamage: number
	averageDamage: number
	stabilityRate: number
} {
	// 最小ダメージ = 基本ダメージ × 安定率%
	const minDamage = Math.floor((baseDamage * stabilityRate) / 100)

	// 最大ダメージ = 基本ダメージ × 100%
	const maxDamage = baseDamage

	// 平均ダメージ = (最小 + 最大) / 2
	const averageDamage = Math.floor((minDamage + maxDamage) / 2)

	return {
		minDamage,
		maxDamage,
		averageDamage,
		stabilityRate,
	}
}

/**
 * ランダムダメージ生成（実際のダメージシミュレーション用）
 */
export function generateRandomDamage(
	baseDamage: number,
	stabilityRate: number,
): number {
	// ランダム係数: 安定率% ～ 100% の範囲
	const randomRange = 100 - stabilityRate
	const randomValue = Math.random() * randomRange
	const finalRate = (stabilityRate + randomValue) / 100

	return Math.floor(baseDamage * finalRate)
}

// ============================================================================
// デフォルト入力データ生成関数（開発・テスト用）
// ============================================================================

/**
 * デフォルトの計算入力データを生成（テスト・開発用）
 */
export function createDefaultDamageInput(): DamageCalculationInput {
	return {
		playerLevel: 150,
		enemyLevel: 100,
		referenceStatType: 'totalATK',
		referenceStat: 2500,
		attackSkill: {
			type: 'physical',
			multiplier: 100,
			fixedDamage: 0,
			supportedDistances: ['short', 'long'],
			canUseLongRange: true,
		},
		resistance: {
			physical: 15,
			magical: 10,
			weapon: 0,
		},
		enemy: {
			DEF: 300,
			MDEF: 250,
			level: 100,
			category: 'mob',
			hasDestruction: false,
			guaranteedCritical: 0,
		},
		penetration: {
			physical: 50,
			magical: 30,
		},
		unsheathe: {
			fixedDamage: 0,
			rateBonus: 0,
			isActive: false,
		},
		elementAdvantage: {
			total: 0,
			awakening: 0,
			isActive: false,
		},
		distance: {
			shortRange: 0,
			longRange: 0,
		},
		combo: {
			isActive: false,
			multiplier: 100,
		},
		passiveMultiplier: 0,
		braveMultiplier: 0,
		userSettings: {
			familiarity: 100,
			currentDistance: 'disabled',
			damageType: 'white',
		},
		critical: {
			damage: 100, // デフォルト100%
		},
		stability: {
			rate: 85, // デフォルト85%
		},
		buffSkills: {
			eternalNightmare: {
				isEnabled: false,
				level: 0,
			},
			totalDarkPowerLevel: 0,
		},
	}
}

// ============================================================================
// 開発用ログ関数
// ============================================================================

/**
 * 計算過程をコンソールに出力（開発・デバッグ用）
 */
export function logCalculationSteps(result: DamageCalculationResult): void {
	console.log('=== ダメージ計算結果 ===')
	console.log(`基本ダメージ: ${result.baseDamage}`)
	console.log('\n=== 安定率適用結果 ===')
	console.log(`安定率: ${result.stabilityResult.stabilityRate}%`)
	console.log(`最小ダメージ: ${result.stabilityResult.minDamage}`)
	console.log(`最大ダメージ: ${result.stabilityResult.maxDamage}`)
	console.log(`平均ダメージ: ${result.stabilityResult.averageDamage}`)
	
	console.log('\n=== 計算過程 ===')
	const steps = result.calculationSteps

	console.log('ステップ1: 基礎ダメージ')
	console.log(`  ${steps.step1_baseDamage.playerLevel} + ${steps.step1_baseDamage.referenceStat} - ${steps.step1_baseDamage.enemyLevel} = ${steps.step1_baseDamage.beforeResistance}`)
	console.log(`  耐性適用後: ${steps.step1_baseDamage.afterResistance}`)
	console.log(`  敵防御力: ${steps.step1_baseDamage.enemyDEF}`)
	console.log(`  結果: ${steps.step1_baseDamage.result}`)

	console.log('\nステップ2: 固定値加算')
	console.log(`  基礎ダメージ: ${steps.step2_fixedValues.baseDamage}`)
	console.log(`  抜刀固定値: ${steps.step2_fixedValues.unsheatheFixed}`)
	console.log(`  スキル固定値: ${steps.step2_fixedValues.skillFixed}`)
	console.log(`  結果: ${steps.step2_fixedValues.result}`)
	
	console.log('\nステップ3: 属性有利補正')
	console.log(`  固定値適用後: ${steps.step3_elementAdvantage.beforeAdvantage}`)
	console.log(`  属性有利: ${steps.step3_elementAdvantage.advantageRate}%`)
	console.log(`  結果: ${steps.step3_elementAdvantage.result}`)
	
	console.log('\nステップ4: スキル倍率補正')
	console.log(`  属性有利適用後: ${steps.step4_skillMultiplier.beforeSkill}`)
	console.log(`  スキル倍率: ${steps.step4_skillMultiplier.skillRate}%`)
	console.log(`  結果: ${steps.step4_skillMultiplier.result}`)
}