import { useMemo } from 'react'
import { useCalculatorStore } from '@/stores'
import {
	calculateHP,
	calculateMP,
	calculateAdjustedStats,
	aggregateAllBonuses,
	calculateEquipmentBonuses,
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

		return {
			allBonuses,
			equipmentBonuses: calculateEquipmentBonuses(
				equipmentBonuses,
				crystalBonuses,
				foodBonuses,
				buffBonuses,
			),
			hpCalculation: calculateHP(baseStats, allBonuses),
			mpCalculation: calculateMP(baseStats, allBonuses),
			adjustedStatsCalculation: calculateAdjustedStats(baseStats, allBonuses),
		}
	}, [equipmentBonuses, crystalBonuses, foodBonuses, buffBonuses, baseStats])

	const {
		equipmentBonuses: calculatedEquipmentBonuses,
		hpCalculation,
		mpCalculation,
		adjustedStatsCalculation,
	} = calculationResults
	const { equipmentBonus1, equipmentBonus2, equipmentBonus3 } =
		calculatedEquipmentBonuses

	if (!isVisible) {
		return null
	}

	// TODO: 将来的には全98項目の計算を実装
	// 現在は基本的な項目のみ計算

	// 基本ステータス (30項目のうち実装可能な項目)
	const basicStats = {
		HP: hpCalculation.finalHP,
		MP: mpCalculation.finalMP,
		ATK: data.mainWeapon.ATK, // メイン武器ATK（暫定）
		baseATK: 0, // TODO: 基礎ATK計算
		subATK: data.subWeapon.ATK, // サブ武器ATK
		subBaseATK: 0, // TODO: サブ武器基礎ATK
		totalATK: 0, // TODO: 総ATK計算
		bringerAM: 0, // TODO: ブリンガーAM計算
		MATK: 0, // TODO: MATK計算
		baseMATK: 0, // TODO: 基本MATK計算
		stabilityRate: data.mainWeapon.stability, // メイン武器安定率
		subStabilityRate: data.subWeapon.stability, // サブ武器安定率
		criticalRate: 0, // TODO: クリティカル率計算
		criticalDamage: 150, // TODO: クリティカルダメージ計算
		magicCriticalRate: 0, // TODO: 魔法クリティカル率
		magicCriticalDamage: 130, // TODO: 魔法クリティカルダメージ
		totalElementAdvantage: 0, // TODO: 総属性有利
		elementAwakeningAdvantage: 0, // TODO: 属性覚醒有利
		ASPD: 0, // TODO: 攻撃速度計算
		CSPD: 0, // TODO: 詠唱速度計算
		HIT: 0, // TODO: 命中計算
		FLEE: 0, // TODO: 回避計算
		physicalResistance: 0, // TODO: 物理耐性
		magicalResistance: 0, // TODO: 魔法耐性
		ailmentResistance: 0, // TODO: 異常耐性
		motionSpeed: 100, // TODO: 行動速度計算
		armorBreak: 0, // TODO: 防御崩し
		anticipate: 0, // TODO: 先読み
	}

	// 補正後ステータス (8項目) - 正確な計算結果を使用
	const adjustedStats = adjustedStatsCalculation

	// 装備品補正値1〜3は計算された値を使用
	// 現在は仮値だが、将来的には calculateEquipmentBonuses の結果を使用

	return (
		<div className=" border-b border-blue-200 transition-all duration-300 ease-in-out">
			<div className="px-4 py-2">
				{/* レスポンシブグリッドレイアウト - 5つのセクション */}
				<div className="flex gap-6 flex-wrap">
					{/* 基本ステータス (30項目) */}
					<StatSection
						title="基本ステータス"
						stats={basicStats}
						labels={{
							HP: 'HP',
							MP: 'MP',
							ATK: 'ATK',
							baseATK: '基礎ATK',
							subATK: 'サブATK',
							subBaseATK: 'サブ基礎ATK',
							totalATK: '総ATK',
							bringerAM: 'ブリンガーAM',
							MATK: 'MATK',
							baseMATK: '基本MATK',
							stabilityRate: '安定率',
							subStabilityRate: 'サブ安定率',
							criticalRate: 'ｸﾘﾃｨｶﾙ率',
							criticalDamage: 'ｸﾘﾃｨｶﾙﾀﾞﾒｰｼﾞ',
							magicCriticalRate: '魔法ｸﾘﾃｨｶﾙ率',
							magicCriticalDamage: '魔法ｸﾘﾃｨｶﾙﾀﾞﾒｰｼﾞ',
							totalElementAdvantage: '総属性有利',
							elementAwakeningAdvantage: '属性覚醒有利',
							ASPD: 'ASPD',
							CSPD: 'CSPD',
							HIT: 'HIT',
							FLEE: 'FLEE',
							physicalResistance: '物理耐性',
							magicalResistance: '魔法耐性',
							ailmentResistance: '異常耐性',
							motionSpeed: '行動速度',
							armorBreak: '防御崩し',
							anticipate: '先読み',
						}}
						className=""
					/>

					{/* 補正後ステータス (8項目) */}
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

					{/* 装備品補正値1 (31項目) */}
					<StatSection
						title="装備品補正値1"
						stats={equipmentBonus1}
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
							aggroPlus: 'ヘイト+',
							aggroMinus: 'ヘイト-',
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
							'aggroPlus',
							'aggroMinus',
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
							aggroPlus: { hasRate: true, hasFixed: false },
							aggroMinus: { hasRate: true, hasFixed: false },
						}}
						className=""
					/>

					{/* 装備品補正値2 (32項目) */}
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

					{/* 装備品補正値3 (8項目) */}
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
				</div>
			</div>
		</div>
	)
}
