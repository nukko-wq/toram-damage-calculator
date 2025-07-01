import { useMemo, useState } from 'react'
import { useCalculatorStore } from '@/stores'
import {
	calculateHP,
	calculateMP,
	calculateATK,
	calculateSubATK,
	calculateASPD,
	calculateMotionSpeed,
	calculateCriticalRate,
	calculateCriticalDamage,
	calculateMATK,
	calculateHIT,
	calculatePhysicalResistance,
	calculateMagicalResistance,
	calculateArmorBreak,
	calculateAnticipate,
	calculateCSPD,
	calculateFLEE,
	calculateTotalElementAdvantage,
	calculateStability,
	calculateAdjustedStats,
	aggregateAllBonuses,
	calculateEquipmentBonuses,
	calculateAilmentResistance,
	getBodyArmorType,
} from '@/utils/basicStatsCalculation'
import {
	getEquipmentBonuses,
	getCrystalBonuses,
	getFoodBonuses,
	getBuffBonuses,
} from '@/utils/dataSourceIntegration'
import StatSection from './StatSection'

interface StatusPreviewProps {
	isVisible: boolean
}

export default function StatusPreview({ isVisible }: StatusPreviewProps) {
	const { data } = useCalculatorStore()

	// 表示状態管理
	const [visibleSections, setVisibleSections] = useState({
		basicStats: true,
		adjustedStats: false,
		equipmentBonus1: false,
		equipmentBonus2: false,
		equipmentBonus3: false,
	})

	// セクション表示の切り替え
	const toggleSection = (section: keyof typeof visibleSections) => {
		setVisibleSections((prev) => ({
			...prev,
			[section]: !prev[section],
		}))
	}

	// 正確なHP・MP計算を実行
	const baseStats = data.baseStats

	// データソース別のメモ化
	const equipmentBonuses = useMemo(() => {
		return getEquipmentBonuses(data.equipment)
	}, [data.equipment])

	const crystalBonuses = useMemo(
		() => getCrystalBonuses(data.crystals),
		[data.crystals],
	)

	const foodBonuses = useMemo(() => getFoodBonuses(data.food), [data.food])

	const buffBonuses = useMemo(
		() => getBuffBonuses(data.buffItems),
		[data.buffItems],
	)

	// 統合計算のメモ化
	const calculationResults = useMemo(() => {
		const allBonuses = aggregateAllBonuses(
			equipmentBonuses,
			crystalBonuses,
			foodBonuses,
			buffBonuses,
		)

		// 全ての効果を統合した最終ボーナス値を作成
		const finalBonuses = { ...allBonuses }
		
		// レジスタ効果を統合
		if (data.register?.effects) {
			const maxHpUpEffect = data.register.effects.find(effect => 
				effect.type === 'maxHpUp' && effect.isEnabled
			)
			if (maxHpUpEffect) {
				finalBonuses.HP = (finalBonuses.HP || 0) + (maxHpUpEffect.level * 10)
			}

			const maxMpUpEffect = data.register.effects.find(effect => 
				effect.type === 'maxMpUp' && effect.isEnabled
			)
			if (maxMpUpEffect) {
				finalBonuses.MP = (finalBonuses.MP || 0) + (maxMpUpEffect.level * 1)
			}

			const physicalAttackUpEffect = data.register.effects.find(effect => 
				effect.type === 'physicalAttackUp' && effect.isEnabled
			)
			if (physicalAttackUpEffect) {
				finalBonuses.ATK = (finalBonuses.ATK || 0) + (physicalAttackUpEffect.level * 1)
			}

			const magicAttackUpEffect = data.register.effects.find(effect => 
				effect.type === 'magicalAttackUp' && effect.isEnabled
			)
			if (magicAttackUpEffect) {
				finalBonuses.MATK = (finalBonuses.MATK || 0) + (magicAttackUpEffect.level * 1)
			}

			const accuracyUpEffect = data.register.effects.find(effect => 
				effect.type === 'accuracyUp' && effect.isEnabled
			)
			if (accuracyUpEffect) {
				finalBonuses.Accuracy = (finalBonuses.Accuracy || 0) + (accuracyUpEffect.level * 1)
			}

			const evasionUpEffect = data.register.effects.find(effect => 
				effect.type === 'evasionUp' && effect.isEnabled
			)
			if (evasionUpEffect) {
				finalBonuses.Dodge = (finalBonuses.Dodge || 0) + (evasionUpEffect.level * 1)
			}

			const attackSpeedUpEffect = data.register.effects.find(effect => 
				effect.type === 'attackSpeedUp' && effect.isEnabled
			)
			if (attackSpeedUpEffect) {
				finalBonuses.AttackSpeed = (finalBonuses.AttackSpeed || 0) + (attackSpeedUpEffect.level * 1)
			}

			const magicalSpeedUpEffect = data.register.effects.find(effect => 
				effect.type === 'magicalSpeedUp' && effect.isEnabled
			)
			if (magicalSpeedUpEffect) {
				finalBonuses.CastingSpeed = (finalBonuses.CastingSpeed || 0) + (magicalSpeedUpEffect.level * 1)
			}

			const fateCompanionshipEffect = data.register.effects.find(effect => 
				effect.type === 'fateCompanionship' && effect.isEnabled
			)
			if (fateCompanionshipEffect) {
				const bonusPercent = (fateCompanionshipEffect.partyMembers || 1) * 1
				finalBonuses.ATK_Rate = (finalBonuses.ATK_Rate || 0) + bonusPercent
				finalBonuses.MATK_Rate = (finalBonuses.MATK_Rate || 0) + bonusPercent
			}

			// ギルド料理効果
			const deliciousIngredientTradeEffect = data.register.effects.find(effect => 
				effect.type === 'deliciousIngredientTrade' && effect.isEnabled
			)
			if (deliciousIngredientTradeEffect) {
				finalBonuses.HP = (finalBonuses.HP || 0) + (deliciousIngredientTradeEffect.level * 100)
			}

			const freshFruitTradeEffect = data.register.effects.find(effect => 
				effect.type === 'freshFruitTrade' && effect.isEnabled
			)
			if (freshFruitTradeEffect) {
				finalBonuses.MP = (finalBonuses.MP || 0) + (freshFruitTradeEffect.level * 10)
			}
		}

		// TODO: 将来的にバフスキル効果もここに統合

		// 料理の効果をデバッグ
		console.log('料理データソースデバッグ:', {
			rawFoodData: data.food,
			foodBonuses: foodBonuses,
			foodAggroValue: foodBonuses.Aggro || 0,
			foodAggroRateValue: foodBonuses.Aggro_Rate || 0,
		})

		// デバッグ: 攻撃MP回復、物理耐性、魔法耐性、異常耐性、ヘイトの値を確認
		console.log('ステータスデバッグ:', {
			attackMP: {
				equipment: equipmentBonuses.AttackMPRecovery || 0,
				equipment_rate: equipmentBonuses.AttackMPRecovery_Rate || 0,
				total: allBonuses.AttackMPRecovery || 0,
				total_rate: allBonuses.AttackMPRecovery_Rate || 0,
			},
			physicalResist: {
				equipment: equipmentBonuses.PhysicalResistance_Rate || 0,
				equipment_rate: equipmentBonuses.PhysicalResistance_Rate || 0,
				crystal: crystalBonuses.PhysicalResistance_Rate || 0,
				crystal_rate: crystalBonuses.PhysicalResistance_Rate || 0,
				buff: buffBonuses.PhysicalResistance_Rate || 0,
				buff_rate: buffBonuses.PhysicalResistance_Rate || 0,
				total: allBonuses.PhysicalResistance_Rate || 0,
				total_rate: allBonuses.PhysicalResistance_Rate || 0,
			},
			magicalResist: {
				equipment: equipmentBonuses.MagicalResistance_Rate || 0,
				equipment_rate: equipmentBonuses.MagicalResistance_Rate || 0,
				crystal: crystalBonuses.MagicalResistance_Rate || 0,
				crystal_rate: crystalBonuses.MagicalResistance_Rate || 0,
				buff: buffBonuses.MagicalResistance_Rate || 0,
				buff_rate: buffBonuses.MagicalResistance_Rate || 0,
				total: allBonuses.MagicalResistance_Rate || 0,
				total_rate: allBonuses.MagicalResistance_Rate || 0,
			},
			ailmentResist: {
				equipment: equipmentBonuses.AilmentResistance_Rate || 0,
				equipment_rate: equipmentBonuses.AilmentResistance_Rate || 0,
				total: allBonuses.AilmentResistance_Rate || 0,
				total_rate: allBonuses.AilmentResistance_Rate || 0,
			},
			aggro: {
				equipment_plus: Math.max(0, equipmentBonuses.Aggro || 0),
				equipment_plus_rate: Math.max(0, equipmentBonuses.Aggro_Rate || 0),
				equipment_minus: Math.abs(Math.min(0, equipmentBonuses.Aggro || 0)),
				equipment_minus_rate: Math.abs(
					Math.min(0, equipmentBonuses.Aggro_Rate || 0),
				),
				food_aggro: foodBonuses.Aggro || 0,
				food_aggro_rate: foodBonuses.Aggro_Rate || 0,
				total_plus: Math.max(0, allBonuses.Aggro || 0),
				total_plus_rate: Math.max(0, allBonuses.Aggro_Rate || 0),
				total_minus: Math.abs(Math.min(0, allBonuses.Aggro || 0)),
				total_minus_rate: Math.abs(Math.min(0, allBonuses.Aggro_Rate || 0)),
			},
			naturalRecovery: {
				equipment_hp: equipmentBonuses.NaturalHPRecovery || 0,
				equipment_hp_rate: equipmentBonuses.NaturalHPRecovery_Rate || 0,
				equipment_mp: equipmentBonuses.NaturalMPRecovery || 0,
				equipment_mp_rate: equipmentBonuses.NaturalMPRecovery_Rate || 0,
				crystal_hp: crystalBonuses.NaturalHPRecovery || 0,
				crystal_hp_rate: crystalBonuses.NaturalHPRecovery_Rate || 0,
				crystal_mp: crystalBonuses.NaturalMPRecovery || 0,
				crystal_mp_rate: crystalBonuses.NaturalMPRecovery_Rate || 0,
				total_hp: allBonuses.NaturalHPRecovery || 0,
				total_hp_rate: allBonuses.NaturalHPRecovery_Rate || 0,
				total_mp: allBonuses.NaturalMPRecovery || 0,
				total_mp_rate: allBonuses.NaturalMPRecovery_Rate || 0,
			},
			absolute: {
				equipment_accuracy: equipmentBonuses.AbsoluteAccuracy_Rate || 0,
				equipment_accuracy_rate: equipmentBonuses.AbsoluteAccuracy_Rate || 0,
				equipment_dodge: equipmentBonuses.AbsoluteDodge_Rate || 0,
				equipment_dodge_rate: equipmentBonuses.AbsoluteDodge_Rate || 0,
				total_accuracy: allBonuses.AbsoluteAccuracy_Rate || 0,
				total_accuracy_rate: allBonuses.AbsoluteAccuracy_Rate || 0,
				total_dodge: allBonuses.AbsoluteDodge_Rate || 0,
				total_dodge_rate: allBonuses.AbsoluteDodge_Rate || 0,
			},
			itemCooldown: {
				equipment: equipmentBonuses.ItemCooldown || 0,
				total: allBonuses.ItemCooldown || 0,
			},
			elementalResistance: {
				fire: {
					equipment: equipmentBonuses.FireResistance_Rate || 0,
					equipment_rate: equipmentBonuses.FireResistance_Rate || 0,
					total: allBonuses.FireResistance_Rate || 0,
					total_rate: allBonuses.FireResistance_Rate || 0,
				},
				water: {
					equipment: equipmentBonuses.WaterResistance_Rate || 0,
					equipment_rate: equipmentBonuses.WaterResistance_Rate || 0,
					total: allBonuses.WaterResistance_Rate || 0,
					total_rate: allBonuses.WaterResistance_Rate || 0,
				},
				wind: {
					equipment: equipmentBonuses.WindResistance_Rate || 0,
					equipment_rate: equipmentBonuses.WindResistance_Rate || 0,
					total: allBonuses.WindResistance_Rate || 0,
					total_rate: allBonuses.WindResistance_Rate || 0,
				},
				earth: {
					equipment: equipmentBonuses.EarthResistance_Rate || 0,
					equipment_rate: equipmentBonuses.EarthResistance_Rate || 0,
					total: allBonuses.EarthResistance_Rate || 0,
					total_rate: allBonuses.EarthResistance_Rate || 0,
				},
				light: {
					equipment: equipmentBonuses.LightResistance_Rate || 0,
					equipment_rate: equipmentBonuses.LightResistance_Rate || 0,
					total: allBonuses.LightResistance_Rate || 0,
					total_rate: allBonuses.LightResistance_Rate || 0,
				},
				dark: {
					equipment: equipmentBonuses.DarkResistance_Rate || 0,
					equipment_rate: equipmentBonuses.DarkResistance_Rate || 0,
					total: allBonuses.DarkResistance_Rate || 0,
					total_rate: allBonuses.DarkResistance_Rate || 0,
				},
				neutral: {
					equipment: equipmentBonuses.NeutralResistance_Rate || 0,
					equipment_rate: equipmentBonuses.NeutralResistance_Rate || 0,
					total: allBonuses.NeutralResistance_Rate || 0,
					total_rate: allBonuses.NeutralResistance_Rate || 0,
				},
			},
		})

		const adjustedStatsCalculation = calculateAdjustedStats(
			baseStats,
			finalBonuses,
		)

		// 体装備のArmorTypeを取得
		const bodyArmorType = getBodyArmorType(data.equipment.body)

		return {
			allBonuses: finalBonuses,
			equipmentBonuses: calculateEquipmentBonuses(finalBonuses),
			hpCalculation: calculateHP(baseStats, finalBonuses),
			mpCalculation: calculateMP(baseStats, finalBonuses),
			atkCalculation: calculateATK(baseStats, data.mainWeapon, data.subWeapon, adjustedStatsCalculation, finalBonuses),
			subATKCalculation: calculateSubATK(
				baseStats,
				data.mainWeapon,
				data.subWeapon,
				adjustedStatsCalculation,
				finalBonuses,
			),
			aspdCalculation: calculateASPD(
				baseStats,
				data.mainWeapon,
				adjustedStatsCalculation,
				finalBonuses,
				bodyArmorType,
			),
			motionSpeedCalculation: (() => {
				const aspd = calculateASPD(
					baseStats,
					data.mainWeapon,
					adjustedStatsCalculation,
					finalBonuses,
					bodyArmorType,
				).finalASPD
				return calculateMotionSpeed(aspd, finalBonuses)
			})(),
			criticalRateCalculation: calculateCriticalRate(baseStats.CRT, finalBonuses),
			criticalDamageCalculation: calculateCriticalDamage(
				adjustedStatsCalculation.STR,
				adjustedStatsCalculation.AGI,
				finalBonuses,
			),
			hitCalculation: calculateHIT(
				baseStats.level,
				adjustedStatsCalculation.DEX,
				finalBonuses,
			),
			fleeCalculation: calculateFLEE(
				baseStats.level,
				adjustedStatsCalculation.AGI,
				data.equipment.body,
				finalBonuses,
			),
			physicalResistanceCalculation: calculatePhysicalResistance(finalBonuses),
			magicalResistanceCalculation: calculateMagicalResistance(finalBonuses),
			armorBreakCalculation: calculateArmorBreak(finalBonuses),
			anticipateCalculation: calculateAnticipate(finalBonuses),
			cspdCalculation: calculateCSPD(
				baseStats.level,
				adjustedStatsCalculation.DEX,
				adjustedStatsCalculation.AGI,
				finalBonuses,
			),
			totalElementAdvantageCalculation:
				calculateTotalElementAdvantage(finalBonuses),
			stabilityCalculation: calculateStability(
				data.mainWeapon.stability,
				data.mainWeapon.weaponType,
				adjustedStatsCalculation,
				finalBonuses,
				data.subWeapon,
			),
			ailmentResistanceCalculation: calculateAilmentResistance(
				baseStats,
				finalBonuses,
			),
			adjustedStatsCalculation,
		}
	}, [
		equipmentBonuses,
		crystalBonuses,
		foodBonuses,
		buffBonuses,
		baseStats,
		data.mainWeapon,
		data.subWeapon,
		data.equipment.body,
		data.register, // レジスタデータを依存関係に追加
		data.food, // 料理データを依存関係に追加（デバッグログ用）
	])

	const {
		allBonuses: finalBonuses,
		equipmentBonuses: calculatedEquipmentBonuses,
		hpCalculation,
		mpCalculation,
		atkCalculation,
		subATKCalculation,
		aspdCalculation,
		motionSpeedCalculation,
		criticalRateCalculation,
		criticalDamageCalculation,
		hitCalculation,
		fleeCalculation,
		physicalResistanceCalculation,
		magicalResistanceCalculation,
		armorBreakCalculation,
		anticipateCalculation,
		cspdCalculation,
		totalElementAdvantageCalculation,
		stabilityCalculation,
		ailmentResistanceCalculation,
		adjustedStatsCalculation,
	} = calculationResults
	const { equipmentBonus1, equipmentBonus2, equipmentBonus3 } =
		calculatedEquipmentBonuses

	// MATK計算（ATK計算結果が必要なため、useMemoの外で実行）
	const matkCalculation = calculateMATK(
		baseStats.level,
		data.mainWeapon.weaponType,
		data.mainWeapon.ATK,
		data.mainWeapon.refinement,
		atkCalculation.totalWeaponATK, // 手甲用の総武器ATK
		baseStats, // 基礎ステータス（MATKアップ用）
		adjustedStatsCalculation, // 補正後ステータス（ステータスMATK用）
		finalBonuses, // 全ての効果を統合した最終ボーナス値を使用
	)


	// デバッグ: equipmentBonus3の全プロパティを確認
	console.log('equipmentBonus3 プロパティ:', {
		naturalHPRecovery: equipmentBonus3.naturalHPRecovery,
		naturalHPRecovery_Rate: equipmentBonus3.naturalHPRecovery_Rate,
		naturalMPRecovery: equipmentBonus3.naturalMPRecovery,
		naturalMPRecovery_Rate: equipmentBonus3.naturalMPRecovery_Rate,
		revivalTime: equipmentBonus3.revivalTime,
		revivalTime_Rate: equipmentBonus3.revivalTime_Rate,
		absoluteAccuracy: equipmentBonus3.absoluteAccuracy,
		absoluteAccuracy_Rate: equipmentBonus3.absoluteAccuracy_Rate,
		absoluteDodge: equipmentBonus3.absoluteDodge,
		absoluteDodge_Rate: equipmentBonus3.absoluteDodge_Rate,
		itemCooldown: equipmentBonus3.itemCooldown,
		allKeys: Object.keys(equipmentBonus3),
		specialKeys: Object.keys(equipmentBonus3).filter(
			(key) =>
				key.includes('natural') ||
				key.includes('Natural') ||
				key.includes('revival') ||
				key.includes('Revival') ||
				key.includes('absolute') ||
				key.includes('Absolute') ||
				key.includes('item') ||
				key.includes('Item') ||
				key.includes('tool') ||
				key.includes('Tool'),
		),
	})

	// デバッグ: equipmentBonus2の属性耐性を確認
	console.log('equipmentBonus2 属性耐性:', {
		fireResistance: equipmentBonus2.fireResistance,
		fireResistance_Rate: equipmentBonus2.fireResistance_Rate,
		waterResistance: equipmentBonus2.waterResistance,
		waterResistance_Rate: equipmentBonus2.waterResistance_Rate,
		windResistance: equipmentBonus2.windResistance,
		windResistance_Rate: equipmentBonus2.windResistance_Rate,
		earthResistance: equipmentBonus2.earthResistance,
		earthResistance_Rate: equipmentBonus2.earthResistance_Rate,
		lightResistance: equipmentBonus2.lightResistance,
		lightResistance_Rate: equipmentBonus2.lightResistance_Rate,
		darkResistance: equipmentBonus2.darkResistance,
		darkResistance_Rate: equipmentBonus2.darkResistance_Rate,
		neutralResistance: equipmentBonus2.neutralResistance,
		neutralResistance_Rate: equipmentBonus2.neutralResistance_Rate,
		allKeys: Object.keys(equipmentBonus2),
		resistanceKeys: Object.keys(equipmentBonus2).filter(
			(key) => key.includes('Resistance') || key.includes('resistance'),
		),
	})

	if (!isVisible) {
		return null
	}

	// TODO: 将来的には全98項目の計算を実装
	// 現在は基本的な項目のみ計算

	// 基本ステータス (30項目のうち実装可能な項目)
	const basicStats = {
		HP: hpCalculation.finalHP,
		MP: mpCalculation.finalMP,
		ATK: atkCalculation.finalATK, // 武器種別ATK計算結果
		baseATK: Math.floor(atkCalculation.baseATK), // 基礎ATK（表示時のみ小数点以下切り捨て）
		// サブATKとサブ基礎ATKは双剣の場合のみ計算、他は null で - 表示
		subATK: data.mainWeapon.weaponType === '双剣' && subATKCalculation
			? subATKCalculation.subFinalATK // 双剣時は計算値
			: null, // 非双剣時は null で - 表示
		subBaseATK: data.mainWeapon.weaponType === '双剣' && subATKCalculation
			? Math.floor(subATKCalculation.subBaseATK) // 双剣時は計算値
			: null, // 非双剣時は null で - 表示
		totalATK: 0, // TODO: 総ATK計算
		bringerAM: 0, // TODO: ブリンガーAM計算
		MATK: matkCalculation.finalMATK, // MATK計算結果
		baseMATK: matkCalculation.baseMATK, // 基本MATK計算結果
		stabilityRate: stabilityCalculation.finalStability, // 安定率計算結果
		// サブ安定率は常時表示（双剣・弓+矢以外は null で - 表示）
		subStabilityRate: (() => {
			if (data.mainWeapon.weaponType === '双剣' && subATKCalculation) {
				return subATKCalculation.subStability // サブ安定率（計算後）
			}
			if ((data.mainWeapon.weaponType === '弓' || data.mainWeapon.weaponType === '自動弓') && data.subWeapon.weaponType === '矢') {
				return data.subWeapon.stability // 矢の安定率をそのまま表示
			}
			return null // その他は null で - 表示
		})(),
		criticalRate: criticalRateCalculation.finalCriticalRate, // クリティカル率計算結果
		criticalDamage: criticalDamageCalculation.finalCriticalDamage, // クリティカルダメージ計算結果
		magicCriticalRate: 0, // TODO: 魔法クリティカル率
		magicCriticalDamage: 130, // TODO: 魔法クリティカルダメージ
		totalElementAdvantage:
			totalElementAdvantageCalculation.finalTotalElementAdvantage, // 総属性有利計算結果
		elementAwakeningAdvantage: 0, // TODO: 属性覚醒有利
		ASPD: aspdCalculation.finalASPD, // 攻撃速度計算結果
		CSPD: cspdCalculation.finalCSPD, // CSPD計算結果
		HIT: hitCalculation.finalHIT, // HIT計算結果
		FLEE: fleeCalculation.finalFLEE, // FLEE計算結果
		physicalResistance: physicalResistanceCalculation.finalPhysicalResistance, // 物理耐性計算結果
		magicalResistance: magicalResistanceCalculation.finalMagicalResistance, // 魔法耐性計算結果
		ailmentResistance: ailmentResistanceCalculation, // 異常耐性計算結果
		motionSpeed: motionSpeedCalculation.finalMotionSpeed, // 行動速度計算結果
		armorBreak: armorBreakCalculation.finalArmorBreak, // 防御崩し計算結果
		anticipate: anticipateCalculation.finalAnticipate, // 先読み計算結果
	}

	// 補正後ステータス (8項目) - 正確な計算結果を使用
	const adjustedStats: Record<string, number> = {
		STR: adjustedStatsCalculation.STR,
		AGI: adjustedStatsCalculation.AGI,
		INT: adjustedStatsCalculation.INT,
		DEX: adjustedStatsCalculation.DEX,
		VIT: adjustedStatsCalculation.VIT,
		CRT: adjustedStatsCalculation.CRT,
		MEN: adjustedStatsCalculation.MEN,
		TEC: adjustedStatsCalculation.TEC,
	}

	// 装備品補正値1〜3は計算された値を使用
	// 現在は仮値だが、将来的には calculateEquipmentBonuses の結果を使用

	return (
		<div className=" border-b border-blue-200 transition-all duration-300 ease-in-out">
			<div className="flex flex-col items-center px-4 pt-2">
				{/* セクション表示切り替えボタン */}
				<div className="mb-3 flex flex-wrap gap-2">
					<button
						type="button"
						onClick={() => toggleSection('basicStats')}
						className={`px-3 py-1 text-xs md:text-sm rounded transition-colors cursor-pointer ${
							visibleSections.basicStats
								? 'bg-blue-500 text-white'
								: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
						}`}
					>
						基本ステータス
					</button>
					<button
						type="button"
						onClick={() => toggleSection('adjustedStats')}
						className={`px-3 py-1 text-xs md:text-sm rounded transition-colors cursor-pointer ${
							visibleSections.adjustedStats
								? 'bg-blue-500 text-white'
								: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
						}`}
					>
						補正後ステータス
					</button>
					<button
						type="button"
						onClick={() => toggleSection('equipmentBonus1')}
						className={`px-3 py-1 text-xs md:text-sm rounded transition-colors cursor-pointer ${
							visibleSections.equipmentBonus1
								? 'bg-blue-500 text-white'
								: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
						}`}
					>
						装備品補正値1
					</button>
					<button
						type="button"
						onClick={() => toggleSection('equipmentBonus2')}
						className={`px-3 py-1 text-xs md:text-sm rounded transition-colors cursor-pointer ${
							visibleSections.equipmentBonus2
								? 'bg-blue-500 text-white'
								: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
						}`}
					>
						装備品補正値2
					</button>
					<button
						type="button"
						onClick={() => toggleSection('equipmentBonus3')}
						className={`px-3 py-1 text-xs md:text-sm rounded transition-colors cursor-pointer ${
							visibleSections.equipmentBonus3
								? 'bg-blue-500 text-white'
								: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
						}`}
					>
						装備品補正値3
					</button>
				</div>
				{/* レスポンシブグリッドレイアウト - 5つのセクション */}
				<div className="flex gap-6 flex-wrap justify-center">
					{/* 基本ステータス (30項目) */}
					{visibleSections.basicStats && (
						<StatSection
							title="基本ステータス"
							stats={basicStats}
							labels={{
								HP: 'HP',
								MP: 'MP',
								ATK: 'ATK',
								baseATK: '基礎ATK',
								subATK: 'サブATK', // 常時表示（ラベル位置統一のため）
								subBaseATK: 'サブ基礎ATK', // 常時表示（ラベル位置統一のため）
								totalATK: '総ATK',
								bringerAM: 'ブリンガーAM',
								MATK: 'MATK',
								baseMATK: '基本MATK',
								stabilityRate: '安定率(%)',
								subStabilityRate: 'サブ安定率(%)', // 常時表示（ラベル位置統一のため）
								criticalRate: 'ｸﾘﾃｨｶﾙ率',
								criticalDamage: 'ｸﾘﾃｨｶﾙﾀﾞﾒｰｼﾞ',
								magicCriticalRate: '魔法ｸﾘﾃｨｶﾙ率',
								magicCriticalDamage: '魔法ｸﾘﾃｨｶﾙﾀﾞﾒｰｼﾞ',
								totalElementAdvantage: '総属性有利(%)',
								elementAwakeningAdvantage: '属性覚醒有利(%)',
								ASPD: 'ASPD',
								CSPD: 'CSPD',
								HIT: 'HIT',
								FLEE: 'FLEE',
								physicalResistance: '物理耐性(%)',
								magicalResistance: '魔法耐性(%)',
								ailmentResistance: '異常耐性(%)',
								motionSpeed: '行動速度(%)',
								armorBreak: '防御崩し(%)',
								anticipate: '先読み(%)',
							}}
							className=""
						/>
					)}

					{/* 補正後ステータス (8項目) */}
					{visibleSections.adjustedStats && (
						<StatSection
							title="補正後ステータス"
							stats={adjustedStats}
							labels={{
								STR: 'STR',
								AGI: 'AGI',
								INT: 'INT',
								DEX: 'DEX',
								VIT: 'VIT',
								CRT: 'CRT',
								MEN: 'MEN',
								TEC: 'TEC',
							}}
							className=""
						/>
					)}

					{/* 装備品補正値1 (31項目) */}
					{visibleSections.equipmentBonus1 && (
						<StatSection
							title="装備品補正値1"
							stats={{
								...equipmentBonus1,
							}}
							labels={{
								ATK: 'ATK',
								physicalPenetration: '物理貫通',
								MATK: 'MATK',
								magicalPenetration: '魔法貫通',
								weaponATK: '武器ATK',
								elementPower: '属性威力',
								unsheatheAttack: '抜刀威力',
								shortRangeDamage: '近距離威力',
								longRangeDamage: '遠距離威力',
								criticalDamage: 'ｸﾘﾃｨｶﾙﾀﾞﾒｰｼﾞ',
								criticalRate: 'ｸﾘﾃｨｶﾙ率',
								STR: 'STR',
								AGI: 'AGI',
								INT: 'INT',
								DEX: 'DEX',
								VIT: 'VIT',
								ASPD: 'ASPD',
								CSPD: 'CSPD',
								stability: '安定率',
								motionSpeed: '行動速度',
								accuracy: '命中',
								dodge: '回避',
								MP: 'MP',
								attackMPRecovery: '攻撃MP回復',
								HP: 'HP',
								ailmentResistance: '異常耐性',
								physicalResistance: '物理耐性',
								magicalResistance: '魔法耐性',
								aggro: 'ヘイト(%)',
							}}
							displayMode="property-double"
							propertyOrder={[
								'ATK',
								'physicalPenetration',
								'MATK',
								'magicalPenetration',
								'weaponATK',
								'',
								'elementPower',
								'unsheatheAttack',
								'shortRangeDamage',
								'longRangeDamage',
								'criticalDamage',
								'criticalRate',
								'STR',
								'AGI',
								'INT',
								'DEX',
								'VIT',
								'',
								'ASPD',
								'CSPD',
								'stability',
								'motionSpeed',
								'accuracy',
								'dodge',
								'MP',
								'attackMPRecovery',
								'HP',
								'ailmentResistance',
								'physicalResistance',
								'magicalResistance',
								'aggro',
								'',
							]}
							propertyConfigs={{
								ATK: { hasRate: true, hasFixed: true },
								physicalPenetration: { hasRate: true, hasFixed: false },
								MATK: { hasRate: true, hasFixed: true },
								magicalPenetration: { hasRate: true, hasFixed: false },
								weaponATK: { hasRate: true, hasFixed: true },
								elementPower: { hasRate: true, hasFixed: false },
								unsheatheAttack: { hasRate: true, hasFixed: false },
								shortRangeDamage: { hasRate: true, hasFixed: false },
								longRangeDamage: { hasRate: true, hasFixed: false },
								criticalDamage: { hasRate: true, hasFixed: true },
								criticalRate: { hasRate: true, hasFixed: true },
								STR: { hasRate: true, hasFixed: true },
								AGI: { hasRate: true, hasFixed: true },
								INT: { hasRate: true, hasFixed: true },
								DEX: { hasRate: true, hasFixed: true },
								VIT: { hasRate: true, hasFixed: true },
								ASPD: { hasRate: true, hasFixed: true },
								CSPD: { hasRate: true, hasFixed: true },
								stability: { hasRate: true, hasFixed: false },
								motionSpeed: { hasRate: true, hasFixed: false },
								accuracy: { hasRate: true, hasFixed: true },
								dodge: { hasRate: true, hasFixed: true },
								MP: { hasRate: true, hasFixed: true },
								attackMPRecovery: { hasRate: true, hasFixed: true },
								HP: { hasRate: true, hasFixed: true },
								ailmentResistance: { hasRate: true, hasFixed: false },
								physicalResistance: { hasRate: true, hasFixed: false },
								magicalResistance: { hasRate: true, hasFixed: false },
								aggro: { hasRate: true, hasFixed: true },
							}}
							className=""
						/>
					)}

					{/* 装備品補正値2 (32項目) */}
					{visibleSections.equipmentBonus2 && (
						<StatSection
							title="装備品補正値2"
							stats={equipmentBonus2}
							labels={{
								ATK_STR: 'ATK+(STR%)',
								MATK_STR: 'MATK+(STR%)',
								ATK_INT: 'ATK+(INT%)',
								MATK_INT: 'MATK+(INT%)',
								ATK_VIT: 'ATK+(VIT%)',
								MATK_VIT: 'MATK+(VIT%)',
								ATK_AGI: 'ATK+(AGI%)',
								MATK_AGI: 'MATK+(AGI%)',
								ATK_DEX: 'ATK+(DEX%)',
								MATK_DEX: 'MATK+(DEX%)',
								neutralResistance: '無耐性',
								fireResistance: '火耐性',
								waterResistance: '水耐性',
								windResistance: '風耐性',
								earthResistance: '地耐性',
								lightResistance: '光耐性',
								darkResistance: '闇耐性',
								linearReduction: '直線軽減',
								rushReduction: '突進軽減',
								bulletReduction: '弾丸軽減',
								proximityReduction: '周囲軽減',
								areaReduction: '範囲軽減',
								floorTrapReduction: '痛床軽減',
								meteorReduction: '隕石軽減',
								bladeReduction: '射刃軽減',
								suctionReduction: '吸引軽減',
								explosionReduction: '爆発軽減',
								physicalBarrier: '物理バリア',
								magicalBarrier: '魔法バリア',
								fractionalBarrier: '割合バリア',
								barrierCooldown: 'バリア速度',
							}}
							displayMode="property-double"
							propertyOrder={[
								'ATK_STR',
								'MATK_STR',
								'ATK_INT',
								'MATK_INT',
								'ATK_VIT',
								'MATK_VIT',
								'ATK_AGI',
								'MATK_AGI',
								'ATK_DEX',
								'MATK_DEX',
								'neutralResistance',
								'',
								'fireResistance',
								'waterResistance',
								'windResistance',
								'earthResistance',
								'lightResistance',
								'darkResistance',
								'linearReduction',
								'rushReduction',
								'bulletReduction',
								'proximityReduction',
								'areaReduction',
								'floorTrapReduction',
								'meteorReduction',
								'bladeReduction',
								'suctionReduction',
								'explosionReduction',
								'physicalBarrier',
								'magicalBarrier',
								'fractionalBarrier',
								'barrierCooldown',
							]}
							propertyConfigs={{
								ATK_STR: { hasRate: true, hasFixed: false },
								MATK_STR: { hasRate: true, hasFixed: false },
								ATK_INT: { hasRate: true, hasFixed: false },
								MATK_INT: { hasRate: true, hasFixed: false },
								ATK_VIT: { hasRate: true, hasFixed: false },
								MATK_VIT: { hasRate: true, hasFixed: false },
								ATK_AGI: { hasRate: true, hasFixed: false },
								MATK_AGI: { hasRate: true, hasFixed: false },
								ATK_DEX: { hasRate: true, hasFixed: false },
								MATK_DEX: { hasRate: true, hasFixed: false },
								neutralResistance: { hasRate: true, hasFixed: false },
								fireResistance: { hasRate: true, hasFixed: false },
								waterResistance: { hasRate: true, hasFixed: false },
								windResistance: { hasRate: true, hasFixed: false },
								earthResistance: { hasRate: true, hasFixed: false },
								lightResistance: { hasRate: true, hasFixed: false },
								darkResistance: { hasRate: true, hasFixed: false },
								linearReduction: { hasRate: true, hasFixed: false },
								rushReduction: { hasRate: true, hasFixed: false },
								bulletReduction: { hasRate: true, hasFixed: false },
								proximityReduction: { hasRate: true, hasFixed: false },
								areaReduction: { hasRate: true, hasFixed: false },
								floorTrapReduction: { hasRate: true, hasFixed: false },
								meteorReduction: { hasRate: true, hasFixed: false },
								bladeReduction: { hasRate: true, hasFixed: false },
								suctionReduction: { hasRate: true, hasFixed: false },
								explosionReduction: { hasRate: true, hasFixed: false },
								physicalBarrier: { hasRate: false, hasFixed: true },
								magicalBarrier: { hasRate: false, hasFixed: true },
								fractionalBarrier: { hasRate: false, hasFixed: true },
								barrierCooldown: { hasRate: true, hasFixed: false },
							}}
							className=""
						/>
					)}

					{/* 装備品補正値3 (8項目) */}
					{visibleSections.equipmentBonus3 && (
						<StatSection
							title="装備品補正値3"
							stats={equipmentBonus3}
							labels={{
								physicalFollowup: '物理追撃',
								magicalFollowup: '魔法追撃',
								naturalHPRecovery: 'HP自然回復',
								naturalMPRecovery: 'MP自然回復',
								absoluteAccuracy: '絶対命中',
								absoluteDodge: '絶対回避',
								revivalTime: '復帰短縮',
								itemCooldown: '道具速度',
							}}
							displayMode="property-double"
							propertyOrder={[
								'physicalFollowup',
								'magicalFollowup',
								'naturalHPRecovery',
								'naturalMPRecovery',
								'absoluteAccuracy',
								'absoluteDodge',
								'revivalTime',
								'itemCooldown',
							]}
							propertyConfigs={{
								physicalFollowup: { hasRate: true, hasFixed: false },
								magicalFollowup: { hasRate: true, hasFixed: false },
								naturalHPRecovery: { hasRate: true, hasFixed: true },
								naturalMPRecovery: { hasRate: true, hasFixed: true },
								absoluteAccuracy: { hasRate: true, hasFixed: true },
								absoluteDodge: { hasRate: true, hasFixed: true },
								revivalTime: { hasRate: true, hasFixed: false },
								itemCooldown: { hasRate: false, hasFixed: true },
							}}
							className=""
						/>
					)}
				</div>
			</div>
		</div>
	)
}
