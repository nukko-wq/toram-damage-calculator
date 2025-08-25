/**
 * ダメージ計算エンジン
 * トーラムオンラインの正確なダメージ計算式を実装
 */

// ログのオン・オフを制御するフラグ
const DEBUG_LOG_ENABLED = false

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
		skillId?: string // スキルID（スキル固有効果用）
		hitNumber?: number // ヒット番号（スキル固有効果用）
	}

	// 武器情報（スキル特殊効果計算用）
	weapon?: {
		mainWeaponType: string | null // メイン武器種
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
		// エターナルナイトメア用: Normal難易度のDEF/MDEF（ボス戦時の減算上限計算用）
		normalDEF?: number
		normalMDEF?: number
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
		adaptation: number // 慣れ(50-250%)
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

	// レジスタ効果情報（無の構え用）
	register?: {
		voidStance?: {
			isEnabled: boolean
			level: number // 1-10
		}
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

	// ステップ2a: クリティカルダメージ（クリティカル時のみ）
	step2a_critical?: {
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
	step6_adaptation: {
		beforeAdaptation: number
		adaptationRate: number
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
export function calculateDamage(
	input: DamageCalculationInput,
): DamageCalculationResult {
	const steps = {} as DamageCalculationSteps

	if (DEBUG_LOG_ENABLED) {
		console.log('=== 計算ステップ詳細 ===')
		console.log('damageType:', input.userSettings.damageType)
		console.log('combo.isActive:', input.combo.isActive)
		console.log('combo.multiplier:', input.combo.multiplier)
	}

	// ステップ1: 基礎ダメージ計算
	if (DEBUG_LOG_ENABLED) {
		console.log('\n--- ステップ1: 基礎ダメージ計算 ---')
	}
	const step1Result = calculateBaseDamage(input, steps)
	if (DEBUG_LOG_ENABLED) {
		const hasDecimal = step1Result % 1 !== 0
		console.log(
			`ステップ1結果: ${step1Result}${hasDecimal ? ' (小数点あり)' : ' (整数)'}`,
		)
	}

	// ステップ2: 固定値加算
	if (DEBUG_LOG_ENABLED) {
		console.log('\n--- ステップ2: 固定値加算 ---')
	}
	let step2Result = applyFixedValues(step1Result, input, steps)
	if (DEBUG_LOG_ENABLED) {
		const hasDecimal = step2Result % 1 !== 0
		console.log(
			`ステップ2結果: ${step2Result}${hasDecimal ? ' (小数点あり)' : ' (整数)'}`,
		)
	}

	// ステップ2a: クリティカルダメージ補正（クリティカル・Graze時）
	if (
		input.userSettings.damageType === 'critical' ||
		input.userSettings.damageType === 'graze'
	) {
		if (DEBUG_LOG_ENABLED) {
			console.log('\n--- ステップ2a: クリティカル計算 ---')
		}
		step2Result = applyCriticalDamage(step2Result, input, steps)
		if (DEBUG_LOG_ENABLED) {
			const hasDecimal = step2Result % 1 !== 0
			console.log(
				`ステップ2a結果: ${step2Result}${hasDecimal ? ' (小数点あり)' : ' (整数)'}`,
			)
		}
	}

	// ステップ3: 属性有利補正
	if (DEBUG_LOG_ENABLED) {
		console.log('\n--- ステップ3: 属性有利補正 ---')
	}
	const step3Result = applyElementAdvantage(step2Result, input, steps)
	if (DEBUG_LOG_ENABLED) {
		const hasDecimal = step3Result % 1 !== 0
		console.log(
			`ステップ3結果: ${step3Result}${hasDecimal ? ' (小数点あり)' : ' (整数)'}`,
		)
	}

	// ステップ4: スキル倍率補正
	if (DEBUG_LOG_ENABLED) {
		console.log('\n--- ステップ4: スキル倍率補正 ---')
	}
	const step4Result = applySkillMultiplier(step3Result, input, steps)
	if (DEBUG_LOG_ENABLED) {
		const hasDecimal = step4Result % 1 !== 0
		console.log(
			`ステップ4結果: ${step4Result}${hasDecimal ? ' (小数点あり)' : ' (整数)'}`,
		)
	}

	// ステップ5: 抜刀%補正 (Phase 3で実装)
	if (DEBUG_LOG_ENABLED) {
		console.log('\n--- ステップ5: 抜刀%補正 ---')
	}
	const step5Result = applyUnsheatheRate(step4Result, input, steps)
	if (DEBUG_LOG_ENABLED) {
		const hasDecimal = step5Result % 1 !== 0
		console.log(
			`ステップ5結果: ${step5Result}${hasDecimal ? ' (小数点あり)' : ' (整数)'}`,
		)
	}

	// ステップ6: 慣れ補正 (Phase 3で実装)
	if (DEBUG_LOG_ENABLED) {
		console.log('\n--- ステップ6: 慣れ補正 ---')
	}
	const step6Result = applyAdaptation(step5Result, input, steps)
	if (DEBUG_LOG_ENABLED) {
		const hasDecimal = step6Result % 1 !== 0
		console.log(
			`ステップ6結果: ${step6Result}${hasDecimal ? ' (小数点あり)' : ' (整数)'}`,
		)
	}

	// ステップ7: 距離補正 (Phase 3で実装)
	if (DEBUG_LOG_ENABLED) {
		console.log('\n--- ステップ7: 距離補正 ---')
	}
	const step7Result = applyDistance(step6Result, input, steps)
	if (DEBUG_LOG_ENABLED) {
		const hasDecimal = step7Result % 1 !== 0
		console.log(
			`ステップ7結果: ${step7Result}${hasDecimal ? ' (小数点あり)' : ' (整数)'}`,
		)
	}

	// ステップ8: コンボ補正 (Phase 3で実装)
	if (DEBUG_LOG_ENABLED) {
		console.log('\n--- ステップ8: コンボ補正 ---')
	}
	// コンボ補正は小数点を保持したまま計算
	const step8Result = applyCombo(step7Result, input, steps)
	if (DEBUG_LOG_ENABLED) {
		const hasDecimal = step8Result % 1 !== 0
		console.log(
			`ステップ8結果: ${step8Result}${hasDecimal ? ' (小数点あり)' : ' (整数)'}`,
		)
	}

	// ステップ9: パッシブ倍率補正（プレースホルダー）
	if (DEBUG_LOG_ENABLED) {
		console.log('\n--- ステップ9: パッシブ倍率補正 ---')
	}
	const step9Result = applyPassiveMultiplier(step8Result, input, steps)
	if (DEBUG_LOG_ENABLED) {
		const hasDecimal = step9Result % 1 !== 0
		console.log(
			`ステップ9結果: ${step9Result}${hasDecimal ? ' (小数点あり)' : ' (整数)'}`,
		)
	}

	// ステップ10: ブレイブ倍率補正
	if (DEBUG_LOG_ENABLED) {
		console.log('\n--- ステップ10: ブレイブ倍率補正 ---')
	}
	const baseDamage = applyBraveMultiplier(step9Result, input, steps)
	if (DEBUG_LOG_ENABLED) {
		const hasDecimal = baseDamage % 1 !== 0
		console.log(
			`ステップ10結果: ${baseDamage}${hasDecimal ? ' (小数点あり)' : ' (整数)'}`,
		)

		console.log('\n=== 最終結果 ===')
		console.log(
			`最終baseDamage: ${baseDamage}${hasDecimal ? ' (小数点あり)' : ' (整数)'}`,
		)
	}

	// 安定率適用
	const stabilityResult = calculateStabilityDamage(
		baseDamage,
		input.stability.rate,
	)

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

	// 耐性適用（小数点処理せずにそのまま保持）
	const mainResistance =
		input.attackSkill.type === 'physical'
			? input.resistance.physical
			: input.resistance.magical
	const weaponResistance = input.resistance.weapon

	if (DEBUG_LOG_ENABLED) {
		console.log('=== ステップ1: 基礎ダメージ計算詳細 ===')
		console.log(`自レベル: ${input.playerLevel}`)
		console.log(`参照ステータス: ${input.referenceStat}`)
		console.log(`敵レベル: ${input.enemyLevel}`)
		console.log(
			`耐性適用前: ${beforeResistance} = ${input.playerLevel} + ${input.referenceStat} - ${input.enemyLevel}`,
		)
		console.log(`攻撃タイプ: ${input.attackSkill.type}`)
		console.log(`主耐性: ${mainResistance}%`)
		console.log(`武器耐性: ${weaponResistance}%`)
	}

	// (1 - 主耐性/100) × (1 - 武器耐性/100) の計算
	const mainMultiplier = (100 - mainResistance) / 100
	const weaponMultiplier = (100 - weaponResistance) / 100
	const combinedMultiplier = mainMultiplier * weaponMultiplier

	if (DEBUG_LOG_ENABLED) {
		console.log(`主耐性倍率: ${mainMultiplier} = (100 - ${mainResistance})/100`)
		console.log(
			`武器耐性倍率: ${weaponMultiplier} = (100 - ${weaponResistance})/100`,
		)
		console.log(
			`合成耐性倍率: ${combinedMultiplier} = ${mainMultiplier} × ${weaponMultiplier}`,
		)
	}

	const afterResistance = beforeResistance * combinedMultiplier

	if (DEBUG_LOG_ENABLED) {
		console.log(
			`耐性適用後: ${afterResistance} = ${beforeResistance} × ${combinedMultiplier}`,
		)
	}

	// 敵防御力処理
	const enemyDefense =
		input.attackSkill.type === 'physical' ? input.enemy.DEF : input.enemy.MDEF
	const defenseType = input.attackSkill.type === 'physical' ? 'DEF' : 'MDEF'
	const processedDefense = processEnemyDefense(enemyDefense, input, defenseType)

	// 防御力減算前に小数点を切り捨て
	const afterResistanceFloored = Math.floor(afterResistance)

	// 処理後DEFも小数点を切り捨て
	const processedDefenseFloored = Math.floor(processedDefense)

	if (DEBUG_LOG_ENABLED) {
		console.log(`敵${defenseType}: ${enemyDefense}`)
		if (processedDefense !== processedDefenseFloored) {
			console.log(
				`処理後${defenseType}: ${processedDefense} → ${processedDefenseFloored} (小数点切り捨て)`,
			)
		} else {
			console.log(`処理後${defenseType}: ${processedDefenseFloored}`)
		}
		if (afterResistance !== afterResistanceFloored) {
			console.log(
				`防御力減算前: ${afterResistance} → ${afterResistanceFloored} (小数点切り捨て)`,
			)
		} else {
			console.log(`防御力減算前: ${afterResistanceFloored}`)
		}
	}

	// 両方とも切り捨て後の値で減算
	const result = afterResistanceFloored - processedDefenseFloored

	if (DEBUG_LOG_ENABLED) {
		console.log(
			`最終結果: ${result} = ${afterResistanceFloored} - ${processedDefenseFloored}`,
		)
		console.log(`最低保証後: ${Math.max(1, result)}`)
		console.log('======================================')
	}

	// 計算過程を記録
	steps.step1_baseDamage = {
		playerLevel: input.playerLevel,
		referenceStat: input.referenceStat,
		enemyLevel: input.enemyLevel,
		beforeResistance,
		physicalResistanceRate: input.resistance.physical,
		magicalResistanceRate: input.resistance.magical,
		weaponResistanceRate: input.resistance.weapon,
		afterResistance: afterResistanceFloored, // 切り捨て後の値を記録
		enemyDEF: processedDefenseFloored, // 切り捨て後の値を記録
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

	if (DEBUG_LOG_ENABLED) {
		console.log('=== ステップ2: 固定値加算詳細 ===')
		console.log(`基礎ダメージ: ${baseDamage}`)
		console.log(`抜刀アクティブ: ${input.unsheathe.isActive}`)
		console.log(`抜刀固定値: ${unsheatheFixed}`)
		console.log(`スキル固定値: ${skillFixed}`)
		console.log(
			`計算式: Math.floor(${baseDamage} + ${unsheatheFixed} + ${skillFixed})`,
		)
	}

	const result = Math.floor(baseDamage + unsheatheFixed + skillFixed)

	if (DEBUG_LOG_ENABLED) {
		console.log(`固定値加算後: ${result}`)
		console.log(`最低保証後: ${Math.max(1, result)}`)
		console.log('======================================')
	}

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

	if (DEBUG_LOG_ENABLED) {
		console.log('=== ステップ3: 属性有利補正詳細 ===')
		console.log(`属性有利アクティブ: ${input.elementAdvantage.isActive}`)
		console.log(`総属性有利: ${input.elementAdvantage.total}%`)
		console.log(`属性覚醒有利: ${input.elementAdvantage.awakening}%`)
		console.log(`合計属性有利: ${advantageRate}%`)
		console.log(
			`計算式: Math.floor(${beforeAdvantage} × (1 + ${advantageRate}/100))`,
		)
	}

	const result = Math.floor(beforeAdvantage * (1 + advantageRate / 100))

	if (DEBUG_LOG_ENABLED) {
		console.log(`属性有利適用後: ${result}`)
		console.log(`最低保証後: ${Math.max(1, result)}`)
		console.log('======================================')
	}

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

	if (DEBUG_LOG_ENABLED) {
		console.log('=== ステップ4: スキル倍率補正詳細 ===')
		console.log(`スキル倍率（元）: ${input.attackSkill.multiplier}%`)
		console.log(`スキル倍率（切捨後）: ${skillRate}%`)
		console.log(`計算式: Math.floor((${beforeSkill} × ${skillRate})/100)`)
	}

	const result = Math.floor((beforeSkill * skillRate) / 100)

	if (DEBUG_LOG_ENABLED) {
		console.log(`スキル倍率適用後: ${result}`)
		console.log(`最低保証後: ${Math.max(1, result)}`)
		console.log('======================================')
	}

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

	if (DEBUG_LOG_ENABLED) {
		console.log('=== ステップ5: 抜刀%補正詳細 ===')
		console.log(`抜刀アクティブ: ${input.unsheathe.isActive}`)
		console.log(`抜刀%ボーナス: ${unsheatheRate}%`)
		console.log(
			`計算式: Math.floor(${beforeUnsheathe} × (1 + ${unsheatheRate}/100))`,
		)
	}

	const result = Math.floor(beforeUnsheathe * (1 + unsheatheRate / 100))

	if (DEBUG_LOG_ENABLED) {
		console.log(`抜刀%適用後: ${result}`)
		console.log(`最低保証後: ${Math.max(1, result)}`)
		console.log('======================================')
	}

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
function applyAdaptation(
	beforeAdaptation: number,
	input: DamageCalculationInput,
	steps: DamageCalculationSteps,
): number {
	const adaptationRate = input.userSettings.adaptation

	if (DEBUG_LOG_ENABLED) {
		console.log('=== ステップ6: 慣れ補正詳細 ===')
		console.log(`慣れ値: ${adaptationRate}%`)
		console.log(
			`計算式: Math.floor(${beforeAdaptation} × ${adaptationRate}/100)`,
		)
	}

	const result = Math.floor(beforeAdaptation * (adaptationRate / 100))

	if (DEBUG_LOG_ENABLED) {
		console.log(`慣れ適用後: ${result}`)
		console.log(`最低保証後: ${Math.max(1, result)}`)
		console.log('======================================')
	}

	// 計算過程を記録
	steps.step6_adaptation = {
		beforeAdaptation,
		adaptationRate,
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

	// パッシブ倍率、ブレイブ倍率、クリティカル倍率がある場合は距離補正で小数点を保持
	let result: number
	const hasPassiveMultiplier =
		input.passiveMultiplier && input.passiveMultiplier > 0
	const hasBraveMultiplier = input.braveMultiplier && input.braveMultiplier > 0
	const isCritical = input.userSettings.damageType === 'critical'

	const hasMultiplierAfterDistance =
		isCritical || hasPassiveMultiplier || hasBraveMultiplier

	if (hasMultiplierAfterDistance) {
		// 後続に倍率補正がある場合：小数点を保持して次のステップに渡す
		result = beforeDistance * (1 + distanceRate / 100)
		if (DEBUG_LOG_ENABLED) {
			console.log('=== 距離補正: 小数点保持 (後続倍率補正あり) ===')
			console.log(
				`後続倍率: パッシブ(${input.passiveMultiplier}%) ブレイブ(${input.braveMultiplier}%) クリティカル(${isCritical})`,
			)
			console.log(`${beforeDistance} × (1 + ${distanceRate}/100) = ${result}`)
		}
	} else {
		// 後続に倍率補正がない場合：切り捨て
		result = Math.floor(beforeDistance * (1 + distanceRate / 100))
		if (DEBUG_LOG_ENABLED) {
			console.log('=== 距離補正: 切り捨て (後続倍率補正なし) ===')
			console.log(
				`Math.floor(${beforeDistance} × (1 + ${distanceRate}/100)) = ${result}`,
			)
		}
	}

	// 計算過程を記録（表示用は切り捨て値）
	steps.step7_distance = {
		beforeDistance,
		distanceRate,
		result: Math.floor(result),
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
	let comboRate = input.combo.isActive ? input.combo.multiplier : 100

	// 無の構えの効果適用（強打が無効かつ無の構えが有効の場合）
	if (!input.combo.isActive && input.register?.voidStance?.isEnabled) {
		const voidStanceLevel = input.register.voidStance.level
		const voidStanceMultiplier = 1 + voidStanceLevel * 0.01
		comboRate = Math.floor(comboRate * voidStanceMultiplier)

		if (DEBUG_LOG_ENABLED) {
			console.log('=== 無の構え効果適用 ===')
			console.log('無の構えレベル:', voidStanceLevel)
			console.log('無の構え倍率:', voidStanceMultiplier)
			console.log(
				'適用前コンボ倍率:',
				input.combo.isActive ? input.combo.multiplier : 100,
			)
			console.log('適用後コンボ倍率:', comboRate)
		}
	}

	if (DEBUG_LOG_ENABLED) {
		console.log('=== COMBO CALCULATION (Step 8) ===')
		console.log('beforeCombo (距離適用後):', beforeCombo)
		console.log('combo.isActive:', input.combo.isActive)
		console.log('combo.multiplier:', input.combo.multiplier)
		console.log('comboRate (使用される倍率):', comboRate)
	}

	// パッシブ倍率、ブレイブ倍率、クリティカル倍率がある場合はコンボ補正で小数点を保持
	const hasPassiveMultiplier =
		input.passiveMultiplier && input.passiveMultiplier > 0
	const hasBraveMultiplier = input.braveMultiplier && input.braveMultiplier > 0
	const isCritical = input.userSettings.damageType === 'critical'

	const hasMultiplierAfterCombo =
		isCritical || hasPassiveMultiplier || hasBraveMultiplier

	let result: number
	if (hasMultiplierAfterCombo) {
		// 後続に倍率補正がある場合：小数点を保持
		result = beforeCombo * (comboRate / 100)
		if (DEBUG_LOG_ENABLED) {
			console.log('=== コンボ補正: 小数点保持 (後続倍率補正あり) ===')
			console.log(
				`後続倍率: パッシブ(${input.passiveMultiplier}%) ブレイブ(${input.braveMultiplier}%) クリティカル(${isCritical})`,
			)
			console.log(
				`計算式: ${beforeCombo} * ${comboRate}/100 = ${result} (小数点保持)`,
			)
		}
	} else {
		// 後続に倍率補正がない場合：切り捨て
		result = Math.floor(beforeCombo * (comboRate / 100))
		if (DEBUG_LOG_ENABLED) {
			console.log('=== コンボ補正: 切り捨て (後続倍率補正なし) ===')
			console.log(
				`計算式: Math.floor(${beforeCombo} * ${comboRate}/100) = ${result} (切り捨て)`,
			)
		}
	}

	if (DEBUG_LOG_ENABLED) {
		console.log('result (コンボ適用後):', result)
	}

	// 計算過程を記録（表示用は切り捨て値）
	steps.step8_combo = {
		beforeCombo,
		comboRate,
		result: Math.floor(result), // 表示用は切り捨て
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
	// バフスキルから取得したパッシブ倍率を適用
	const passiveRate = input.passiveMultiplier

	if (DEBUG_LOG_ENABLED) {
		console.log('=== PASSIVE MULTIPLIER DEBUG ===')
		console.log('beforePassive:', beforePassive)
		console.log('input.passiveMultiplier:', input.passiveMultiplier)
		console.log('passiveRate:', passiveRate)
	}

	// ブレイブ倍率がある場合は小数点を保持、ない場合は切り捨て
	const hasBreaveMultiplier = input.braveMultiplier > 0
	const calculationResult = beforePassive * (1 + passiveRate / 100)
	const result = hasBreaveMultiplier
		? calculationResult
		: Math.floor(calculationResult)

	if (DEBUG_LOG_ENABLED) {
		if (hasBreaveMultiplier) {
			console.log(
				'計算式: ' +
					beforePassive +
					' * (1 + ' +
					passiveRate +
					'/100) = ' +
					result +
					' (小数点保持: ブレイブ倍率' +
					input.braveMultiplier +
					'%あり)',
			)
		} else {
			console.log(
				'計算式: Math.floor(' +
					beforePassive +
					' * (1 + ' +
					passiveRate +
					'/100)) = ' +
					result +
					' (最終切り捨て: ブレイブ倍率なし)',
			)
		}
		console.log('result:', result)
		console.log('===============================')
	}

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
	// ブレイブ倍率を適用
	const braveRate = input.braveMultiplier

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
 * ステップ2a: クリティカルダメージ補正（固定値加算後に適用）
 */
function applyCriticalDamage(
	step2Result: number,
	input: DamageCalculationInput,
	steps: DamageCalculationSteps,
): number {
	if (DEBUG_LOG_ENABLED) {
		console.log('=== CRITICAL DAMAGE CALCULATION (Step 2a) ===')
		console.log('step2Result (固定値適用後):', step2Result)
	}

	// クリティカルダメージ倍率を取得
	const criticalRate = input.critical.damage

	if (DEBUG_LOG_ENABLED) {
		console.log('criticalRate (クリティカルダメージ%):', criticalRate)

		// ステップ2a: 固定値加算の後、属性有利の前にクリティカル倍率を適用
		console.log('=== ステップ2a: クリティカル倍率適用（属性有利の前） ===')
		console.log(`固定値適用後: ${step2Result}`)
		console.log(`クリティカル倍率: ${criticalRate}%`)
		console.log(`計算式: Math.floor(${step2Result} * ${criticalRate}/100)`)
		console.log(`= Math.floor(${step2Result} * ${criticalRate / 100})`)
		console.log(`= Math.floor(${step2Result * (criticalRate / 100)})`)
	}

	const result = Math.floor(step2Result * (criticalRate / 100))

	if (DEBUG_LOG_ENABLED) {
		console.log('result (クリティカル適用後):', result)
	}

	// 計算過程を記録
	steps.step2a_critical = {
		beforeCritical: step2Result,
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

	// 1. ボス難易度による防御力補正は既にDamagePreview.tsxで適用済みなのでここでは行わない
	// ボス難易度計算は`calculateBossDifficultyStats`で処理済み

	// 2. 破壊状態異常による半減（小数点以下切り上げ）
	// Phase 3では未実装
	if (input.enemy.hasDestruction) {
		// processed = Math.ceil(processed / 2)
		// Phase 3では無視
	}

	// 3. エターナルナイトメア減算
	if (input.buffSkills.eternalNightmare.isEnabled) {
		const calculatedReduction =
			input.buffSkills.eternalNightmare.level *
			input.buffSkills.totalDarkPowerLevel *
			0.5

		// ボス戦の場合はNormal難易度のDEF/MDEFを参照、そうでなければ現在の値を使用
		let referenceDef = processed
		if (
			input.enemy.category === 'boss' &&
			input.enemy.difficulty !== 'normal'
		) {
			referenceDef =
				defenseType === 'DEF'
					? (input.enemy.normalDEF ?? processed)
					: (input.enemy.normalMDEF ?? processed)
		}

		const halfDefense = referenceDef * 0.5
		const eternalReduction = Math.min(calculatedReduction, halfDefense)
		console.log('エターナルナイトメア減算:', {
			skillLevel: input.buffSkills.eternalNightmare.level,
			totalDarkPowerLevel: input.buffSkills.totalDarkPowerLevel,
			calculatedReduction: calculatedReduction,
			defenseType: defenseType,
			currentDefense: processed,
			referenceDefense: referenceDef,
			halfDefense: halfDefense,
			finalReduction: eternalReduction,
			beforeReduction: processed,
			afterReduction: Math.max(0, processed - eternalReduction),
			isBossWithDifficulty:
				input.enemy.category === 'boss' && input.enemy.difficulty !== 'normal',
		})
		processed = Math.max(0, processed - eternalReduction)
	}

	// 4. 貫通による低下（%計算、小数点以下切り捨て）
	// 貫通値は参照防御力の種類に応じて適用
	// - 物理貫通：DEF参照時のみ有効（%として適用）
	// - 魔法貫通：MDEF参照時のみ有効（%として適用）
	// 計算式：(M)DEF × (1 - 貫通%/100)
	let penetrationRate = 0
	if (defenseType === 'DEF') {
		penetrationRate = input.penetration.physical

		// スキル特殊効果による物理貫通倍率適用
		const physicalPenetrationMultiplier = getSkillPhysicalPenetrationMultiplier(
			input.attackSkill.skillId,
			input.weapon?.mainWeaponType,
		)
		penetrationRate = penetrationRate * physicalPenetrationMultiplier

		if (DEBUG_LOG_ENABLED && physicalPenetrationMultiplier > 1) {
			console.log(
				`スキル特殊効果による物理貫通倍率: ${physicalPenetrationMultiplier}倍 (スキルID: ${input.attackSkill.skillId}, 武器: ${input.weapon?.mainWeaponType})`,
			)
		}

		// スキル固有の貫通ボーナス適用
		const skillPenetrationBonus = getSkillPenetrationBonus(
			input.attackSkill.skillId,
			input.attackSkill.hitNumber,
			'physical',
		)
		penetrationRate += skillPenetrationBonus

		if (DEBUG_LOG_ENABLED && skillPenetrationBonus > 0) {
			console.log(
				`スキル固有貫通ボーナス: +${skillPenetrationBonus}% (スキルID: ${input.attackSkill.skillId})`,
			)
		}
	} else if (defenseType === 'MDEF') {
		penetrationRate = input.penetration.magical

		// スキル固有の貫通ボーナス適用
		const skillPenetrationBonus = getSkillPenetrationBonus(
			input.attackSkill.skillId,
			input.attackSkill.hitNumber,
			'magical',
		)
		penetrationRate += skillPenetrationBonus

		if (DEBUG_LOG_ENABLED && skillPenetrationBonus > 0) {
			console.log(
				`スキル固有貫通ボーナス: +${skillPenetrationBonus}% (スキルID: ${input.attackSkill.skillId})`,
			)
		}
	}

	// 貫通率の上限を100%に制限
	penetrationRate = Math.min(100, penetrationRate)

	if (DEBUG_LOG_ENABLED) {
		console.log('貫通計算詳細:')
		console.log(
			`  基本貫通: ${defenseType === 'DEF' ? input.penetration.physical : input.penetration.magical}%`,
		)
		console.log(`  合計貫通: ${penetrationRate}%`)
		console.log(`  計算式: ${processed} × (1 - ${penetrationRate}/100)`)
	}

	// 貫通計算（小数点を保持したまま返す）
	processed = processed * (1 - penetrationRate / 100)

	if (DEBUG_LOG_ENABLED) {
		console.log(`  貫通適用後: ${processed}`)
	}

	// 小数点を保持したまま返す（Math.floorは基礎ダメージ計算で適用）
	return processed
}

/**
 * スキル固有の貫通ボーナスを取得
 */
function getSkillPenetrationBonus(
	skillId?: string,
	_hitNumber?: number,
	penetrationType?: 'physical' | 'magical',
): number {
	if (!skillId || _hitNumber === undefined || penetrationType !== 'physical') {
		return 0
	}

	// Lブーメラン3の物理貫通+50%ボーナス
	if (skillId === 'l_boomerang_3') {
		return 50
	}

	// 他のスキル固有効果を追加する場合はここに記述

	return 0
}

/**
 * スキル特殊効果による物理貫通倍率を取得
 */
function getSkillPhysicalPenetrationMultiplier(
	skillId?: string,
	mainWeaponType?: string | null,
): number {
	if (!skillId || !mainWeaponType) {
		return 1
	}

	// シャットアウト(出血付与時)の物理貫通倍率効果
	if (skillId === 'shut_out_bleeding') {
		switch (mainWeaponType) {
			case '片手剣':
				return 4 // 物理貫通4倍
			case '双剣':
				return 2 // 物理貫通2倍
			default:
				return 1 // 他の武器種は倍率なし
		}
	}

	// 他のスキルの物理貫通倍率効果を追加する場合はここに記述

	return 1
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
			adaptation: 100,
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
	if (DEBUG_LOG_ENABLED) {
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
		console.log(
			`  ${steps.step1_baseDamage.playerLevel} + ${steps.step1_baseDamage.referenceStat} - ${steps.step1_baseDamage.enemyLevel} = ${steps.step1_baseDamage.beforeResistance}`,
		)
		console.log(`  耐性適用後: ${steps.step1_baseDamage.afterResistance}`)
		console.log(`  敵防御力: ${steps.step1_baseDamage.enemyDEF}`)
		console.log(`  結果: ${steps.step1_baseDamage.result}`)

		console.log('\nステップ2: 固定値加算')
		console.log(`  基礎ダメージ: ${steps.step2_fixedValues.baseDamage}`)
		console.log(`  抜刀固定値: ${steps.step2_fixedValues.unsheatheFixed}`)
		console.log(`  スキル固定値: ${steps.step2_fixedValues.skillFixed}`)
		console.log(`  結果: ${steps.step2_fixedValues.result}`)

		console.log('\nステップ3: 属性有利補正')
		console.log(
			`  固定値適用後: ${steps.step3_elementAdvantage.beforeAdvantage}`,
		)
		console.log(`  属性有利: ${steps.step3_elementAdvantage.advantageRate}%`)
		console.log(`  結果: ${steps.step3_elementAdvantage.result}`)

		console.log('\nステップ4: スキル倍率補正')
		console.log(`  属性有利適用後: ${steps.step4_skillMultiplier.beforeSkill}`)
		console.log(`  スキル倍率: ${steps.step4_skillMultiplier.skillRate}%`)
		console.log(`  結果: ${steps.step4_skillMultiplier.result}`)
	}
}
