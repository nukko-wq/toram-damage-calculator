import { useCalculatorStore } from '@/stores'
import {
	calculateHP,
	calculateMP,
	aggregateAllBonuses,
} from '@/utils/basicStatsCalculation'
import StatSection from './StatSection'

interface StatusPreviewProps {
	isVisible: boolean
}

export default function StatusPreview({ isVisible }: StatusPreviewProps) {
	const { data } = useCalculatorStore()

	if (!isVisible) {
		return null
	}

	// 正確なHP・MP計算を実行
	const baseStats = data.baseStats

	// TODO: 実際の装備・クリスタ・料理・バフから補正値を集計
	// 現在は仮の補正値を使用
	const allBonuses = aggregateAllBonuses(
		{}, // equipment bonuses
		{}, // crystal bonuses
		{}, // food bonuses
		{}, // buff bonuses
	)

	const hpCalculation = calculateHP(baseStats, allBonuses)
	const mpCalculation = calculateMP(baseStats, allBonuses)

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

	// 補正後ステータス (8項目)
	const adjustedStats = {
		STR: baseStats.STR, // TODO: 装備・クリスタ補正後の値
		AGI: baseStats.AGI,
		INT: baseStats.INT,
		DEX: baseStats.DEX,
		VIT: Math.floor(hpCalculation.adjustedVIT), // HP計算で使用した補正後VIT
		CRT: baseStats.CRT,
		MEN: baseStats.MEN,
		TEC: baseStats.TEC,
	}

	// 装備品補正値1 (31項目のうち基本的な項目)
	const equipmentBonus1 = {
		ATK: 0, // TODO: 装備からのATK補正
		physicalPenetration: 0, // TODO: 物理貫通
		MATK: 0, // TODO: 装備からのMATK補正
		magicalPenetration: 0, // TODO: 魔法貫通
		weaponATK: data.mainWeapon.ATK, // 武器ATK（現在値）
		elementPower: 0, // TODO: 属性威力
		unsheatheAttack: 0, // TODO: 抜刀威力
		shortRangeDamage: 0, // TODO: 近距離威力
		longRangeDamage: 0, // TODO: 遠距離威力
		criticalDamage: 0, // TODO: クリティカルダメージ補正
		criticalRate: 0, // TODO: クリティカル率補正
		STR: 0, // TODO: STR補正
		AGI: 0, // TODO: AGI補正
		INT: 0, // TODO: INT補正
		DEX: 0, // TODO: DEX補正
		VIT: 0, // TODO: VIT補正
		ASPD: 0, // TODO: ASPD補正
		CSPD: 0, // TODO: CSPD補正
		stability: 0, // TODO: 安定率補正
		motionSpeed: 0, // TODO: 行動速度補正
		accuracy: 0, // TODO: 命中補正
		dodge: 0, // TODO: 回避補正
		MP: 0, // TODO: MP補正
		attackMPRecovery: 0, // TODO: 攻撃MP回復
		HP: 0, // TODO: HP補正
		ailmentResistance: 0, // TODO: 異常耐性補正
		physicalResistance: 0, // TODO: 物理耐性補正
		magicalResistance: 0, // TODO: 魔法耐性補正
		aggroPlus: 0, // TODO: ヘイト+
		aggroMinus: 0, // TODO: ヘイト-
	}

	// 装備品補正値2 (32項目のうち基本的な項目)
	const equipmentBonus2 = {
		ATK_STR: 0, // TODO: ATK+(STR%)
		MATK_STR: 0, // TODO: MATK+(STR%)
		ATK_INT: 0, // TODO: ATK+(INT%)
		MATK_INT: 0, // TODO: MATK+(INT%)
		ATK_VIT: 0, // TODO: ATK+(VIT%)
		MATK_VIT: 0, // TODO: MATK+(VIT%)
		ATK_AGI: 0, // TODO: ATK+(AGI%)
		MATK_AGI: 0, // TODO: MATK+(AGI%)
		ATK_DEX: 0, // TODO: ATK+(DEX%)
		MATK_DEX: 0, // TODO: MATK+(DEX%)
		neutralResistance: 0, // TODO: 無耐性
		fireResistance: 0, // TODO: 火耐性
		waterResistance: 0, // TODO: 水耐性
		windResistance: 0, // TODO: 風耐性
		earthResistance: 0, // TODO: 地耐性
		lightResistance: 0, // TODO: 光耐性
		darkResistance: 0, // TODO: 闇耐性
		linearReduction: 0, // TODO: 直線軽減
		rushReduction: 0, // TODO: 突進軽減
		bulletReduction: 0, // TODO: 弾丸軽減
		proximityReduction: 0, // TODO: 周囲軽減
		areaReduction: 0, // TODO: 範囲軽減
		floorTrapReduction: 0, // TODO: 痛床軽減
		meteorReduction: 0, // TODO: 隕石軽減
		bladeReduction: 0, // TODO: 射刃軽減
		suctionReduction: 0, // TODO: 吸引軽減
		explosionReduction: 0, // TODO: 爆発軽減
		physicalBarrier: 0, // TODO: 物理バリア
		magicalBarrier: 0, // TODO: 魔法バリア
		fractionalBarrier: 0, // TODO: 割合バリア
		barrierCooldown: 0, // TODO: バリア速度
	}

	// 装備品補正値3 (8項目)
	const equipmentBonus3 = {
		physicalFollowup: 0, // TODO: 物理追撃
		magicalFollowup: 0, // TODO: 魔法追撃
		naturalHPRecovery: 0, // TODO: HP自然回復
		naturalMPRecovery: 0, // TODO: MP自然回復
		absoluteAccuracy: 0, // TODO: 絶対命中
		absoluteDodge: 0, // TODO: 絶対回避
		revivalTime: 0, // TODO: 復帰短縮
		itemCooldown: 0, // TODO: 道具速度
	}

	return (
		<div className="bg-gray-50 border-b border-gray-200 transition-all duration-300 ease-in-out">
			<div className="px-4 py-6">
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
							criticalRate: 'クリティカル率',
							criticalDamage: 'クリティカルダメージ',
							magicCriticalRate: '魔法クリティカル率',
							magicCriticalDamage: '魔法クリティカルダメージ',
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
							criticalDamage: 'クリティカルダメージ',
							criticalRate: 'クリティカル率',
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
						displayMode="property"
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
						displayMode="property"
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
						displayMode="property"
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

				{/* 実装状況の説明 */}
				<div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
					<div className="flex">
						<svg
							className="flex-shrink-0 h-5 w-5 text-yellow-400"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fillRule="evenodd"
								d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
								clipRule="evenodd"
							/>
						</svg>
						<div className="ml-3">
							<h3 className="text-sm font-medium text-yellow-800">
								実装状況 (Phase 2: 部分実装)
							</h3>
							<div className="mt-2 text-sm text-yellow-700">
								<p>
									<strong>✅ 実装済み:</strong>{' '}
									HP・MP計算（正確なトーラム計算式）
								</p>
								<p>
									<strong>🔄 部分実装:</strong>{' '}
									基本ステータス表示構造（98項目対応）
								</p>
								<p>
									<strong>❌ 未実装:</strong>{' '}
									装備・クリスタ・バフ補正値の統合計算
								</p>
								<p className="mt-1 text-xs">
									現在は基本ステータスとHP・MPのみ正確な値を表示。その他は0または仮値です。
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
