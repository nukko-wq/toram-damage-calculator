/**
 * バフスキル計算の統合エクスポート
 */

// メイン統合関数
export {
	getBuffSkillBonuses,
	getTwoHandsEffects,
	getAttackUpEffects,
	getMagicUpEffects,
	getThreatPowerEffects,
	getFurtherMagicEffects,
	getGodspeedTrajectoryEffects,
	getAccuracyUpEffects,
	getDodgeUpEffects,
	getCamouflageEffects,
	getFrontlineMaintenance2Effects,
	getBuffSkillPassiveMultiplier,
	getBuffSkillPassiveMultiplierWithSkillCategory,
	getBuffSkillBraveMultiplier,
} from './integration/mainIntegrator'

// 個別計算関数のエクスポート（必要に応じて）
export { getPetCriticalUpEffects, getPetBraveUpEffects } from './categories/petSkills'

// 共通ユーティリティ
export { convertWeaponType, integrateEffects } from './types'

// 個別カテゴリの計算関数（詳細な制御が必要な場合）
export * from './categories/masterySkills'
export * from './categories/bladeSkills'
export * from './categories/halberdSkills'
export * from './categories/mononofuSkills'
export * from './categories/battleSkills'
export * from './categories/survivalSkills'
export * from './categories/hunterSkills'
export * from './categories/dualSwordSkills'
export * from './categories/supportSkills'
export * from './categories/partisanSkills'
export * from './categories/petSkills'