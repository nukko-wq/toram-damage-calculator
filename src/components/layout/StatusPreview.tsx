import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useResponsiveStateManager } from '@/hooks/useKeyboardShortcut'
import { useCalculatorStore, useSaveDataStore, useUIStore } from '@/stores'
import type { FilterOption } from '@/types/bonusCalculation'
import {
	calculateAdjustedStats,
	calculateAilmentResistance,
	calculateAnticipate,
	calculateArmorBreak,
	calculateASPD,
	calculateATK,
	calculateCriticalDamage,
	calculateCriticalRate,
	calculateCSPD,
	calculateElementAwakeningAdvantage,
	calculateEquipmentBonuses,
	calculateFLEE,
	calculateHIT,
	calculateHP,
	calculateINTElementAdvantage,
	calculateMATK,
	calculateMagicalCriticalDamage,
	calculateMagicalCriticalRate,
	calculateMagicalResistance,
	calculateMotionSpeed,
	calculateMP,
	calculatePhysicalResistance,
	calculateSpearMATK,
	calculateStability,
	calculateSubATK,
	calculateTotalATK,
	calculateTotalElementAdvantage,
	getBodyArmorType,
	getSpellBurstLevel,
} from '@/utils/basicStatsCalculation'
import {
	getAllDataSourceBonusesWithBuffSkills,
	getDetailedDataSourceBonuses,
} from '@/utils/dataSourceIntegration'
import StatSection from './StatSection'

interface StatusPreviewProps {
	isVisible: boolean
}

// 基本ステータス表示カテゴリ定義
interface BasicStatsDisplayCategory {
	value: 'base' | 'physical' | 'magical' | 'hybrid' | 'tank'
	label: string
	itemCount: number
}

const BASIC_STATS_CATEGORIES: BasicStatsDisplayCategory[] = [
	{ value: 'base', label: 'ベース', itemCount: 28 },
	{ value: 'physical', label: '物理', itemCount: 17 },
	{ value: 'magical', label: '魔法', itemCount: 18 },
	{ value: 'hybrid', label: '物理/魔法', itemCount: 22 },
	{ value: 'tank', label: '壁', itemCount: 18 },
]

// フィルタードロップダウンコンポーネント
interface FilterDropdownProps {
	value: FilterOption
	onChange: (value: FilterOption) => void
	className?: string
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
	value,
	onChange,
	className,
}) => {
	const options = [
		{ value: 'calculation', label: '全ての合計値' },
		{ value: 'mainWeapon', label: 'メイン装備' },
		{ value: 'subWeapon', label: 'サブ装備' },
		{ value: 'body', label: '体装備' },
		{ value: 'additional', label: '追加装備' },
		{ value: 'special', label: '特殊装備' },
		{ value: 'enchantment', label: 'エンチャント' },
		{ value: 'freeInput1', label: '自由入力1' },
		{ value: 'freeInput2', label: '自由入力2' },
		{ value: 'freeInput3', label: '自由入力3' },
		{ value: 'crystal', label: 'クリスタ' },
		{ value: 'food', label: '料理' },
		{ value: 'buffItems', label: 'アイテムバフ' },
		{ value: 'buffSkills', label: 'スキルバフ' },
		{ value: 'register', label: 'レジスタ他' },
	]

	return (
		<select
			value={value}
			onChange={(e) => onChange(e.target.value as FilterOption)}
			className={`px-2 py-1 text-xs border border-gray-300 outline-none rounded ${className}`}
		>
			{options.map((option) => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	)
}

const INITIAL_VISIBLE_SECTIONS = {
	basicStats: true,
	adjustedStats: false,
	equipmentBonus1: false,
	equipmentBonus2: false,
	equipmentBonus3: false,
}

export default function StatusPreview({ isVisible }: StatusPreviewProps) {
	const { data } = useCalculatorStore()
	const { currentSaveId } = useSaveDataStore()
	const {
		getStatusPreviewCategory,
		setStatusPreviewCategory,
		statusPreviewHeight,
		setStatusPreviewHeight,
	} = useUIStore()

	// リサイズ関連の状態管理
	const containerRef = useRef<HTMLDivElement>(null)
	const [isResizing, setIsResizing] = useState(false)
	const [startY, setStartY] = useState(0)
	const [startHeight, setStartHeight] = useState(statusPreviewHeight)

	// レスポンシブ状態管理をカスタムフックで最適化
	const {
		isMobile,
		visibleSections,
		activeSection,
		toggleSection,
		handleMobileSectionChange,
	} = useResponsiveStateManager(INITIAL_VISIBLE_SECTIONS, 'basicStats')

	// 基本ステータスカテゴリ状態管理（UIStoreから取得）
	const basicStatsCategory = getStatusPreviewCategory(currentSaveId)
	const handleBasicStatsCategoryChange = (
		category: BasicStatsDisplayCategory['value'],
	) => {
		setStatusPreviewCategory(currentSaveId, category)
	}

	// フィルター状態管理
	const [filters, setFilters] = useState({
		equipmentBonus1: 'calculation' as FilterOption,
		equipmentBonus2: 'calculation' as FilterOption,
		equipmentBonus3: 'calculation' as FilterOption,
	})

	// フィルター変更処理
	const handleFilterChange = (
		section: keyof typeof filters,
		value: FilterOption,
	) => {
		setFilters((prev) => ({
			...prev,
			[section]: value,
		}))
	}

	// リサイズ関連のイベントハンドラー
	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			setIsResizing(true)
			setStartY(e.clientY)
			setStartHeight(statusPreviewHeight)
			e.preventDefault()
		},
		[statusPreviewHeight],
	)

	const handleTouchStart = useCallback(
		(e: React.TouchEvent) => {
			setIsResizing(true)
			setStartY(e.touches[0].clientY)
			setStartHeight(statusPreviewHeight)
			e.preventDefault()
		},
		[statusPreviewHeight],
	)

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isResizing) return
			const deltaY = e.clientY - startY
			const newHeight = startHeight + deltaY // 下に動かすと高さを大きく、上に動かすと高さを小さく
			setStatusPreviewHeight(newHeight)
		},
		[isResizing, startY, startHeight, setStatusPreviewHeight],
	)

	const handleTouchMove = useCallback(
		(e: TouchEvent) => {
			if (!isResizing) return
			const deltaY = e.touches[0].clientY - startY
			const newHeight = startHeight + deltaY
			setStatusPreviewHeight(newHeight)
			e.preventDefault()
		},
		[isResizing, startY, startHeight, setStatusPreviewHeight],
	)

	const handleEnd = useCallback(() => {
		setIsResizing(false)
	}, [])

	// リサイズイベントの登録
	useEffect(() => {
		if (isResizing) {
			document.addEventListener('mousemove', handleMouseMove)
			document.addEventListener('mouseup', handleEnd)
			document.addEventListener('touchmove', handleTouchMove, {
				passive: false,
			})
			document.addEventListener('touchend', handleEnd)

			return () => {
				document.removeEventListener('mousemove', handleMouseMove)
				document.removeEventListener('mouseup', handleEnd)
				document.removeEventListener('touchmove', handleTouchMove)
				document.removeEventListener('touchend', handleEnd)
			}
		}
	}, [isResizing, handleMouseMove, handleTouchMove, handleEnd])

	// 正確なHP・MP計算を実行
	const baseStats = data.baseStats

	// PowerOptionsを取得（DamagePreviewの設定を参照）
	const powerOptions = data.powerOptions

	// 統合計算のメモ化
	const calculationResults = useMemo(() => {
		// バフスキルを含む全データソースのボーナスを取得（レジスタ効果も含まれる）
		const finalBonuses = getAllDataSourceBonusesWithBuffSkills(data)

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
			atkCalculation: calculateATK(
				baseStats,
				data.mainWeapon,
				data.subWeapon,
				adjustedStatsCalculation,
				finalBonuses,
			),
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
				data.subWeapon?.weaponType,
			),
			motionSpeedCalculation: (() => {
				const aspd = calculateASPD(
					baseStats,
					data.mainWeapon,
					adjustedStatsCalculation,
					finalBonuses,
					bodyArmorType,
					data.subWeapon?.weaponType,
				).finalASPD
				return calculateMotionSpeed(aspd, finalBonuses)
			})(),
			criticalRateCalculation: calculateCriticalRate(
				baseStats.CRT,
				finalBonuses,
			),
			criticalDamageCalculation: calculateCriticalDamage(
				adjustedStatsCalculation.STR,
				adjustedStatsCalculation.AGI,
				finalBonuses,
			),
			magicalCriticalDamageCalculation: (() => {
				// まず物理クリティカルダメージを計算
				const physicalCD = calculateCriticalDamage(
					adjustedStatsCalculation.STR,
					adjustedStatsCalculation.AGI,
					finalBonuses,
				)
				// バフスキルからスペルバーストの状態を取得
				// スペルバーストはtoggleタイプで、有効時はレベル10として扱う
				const spellBurstSkill = data.buffSkills.skills.sf1
				const spellBurstLevel = spellBurstSkill?.isEnabled ? 10 : 0
				return calculateMagicalCriticalDamage(
					physicalCD.finalCriticalDamage,
					spellBurstLevel,
				)
			})(),
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
			totalElementAdvantageCalculation: (() => {
				// 属性覚醒効果を計算（+25）
				const elementAwakeningResult = calculateElementAwakeningAdvantage(
					powerOptions,
					data.enemy.selectedEnemyId,
					data.buffSkills,
				)

				// INT属性有利補正を計算
				const intElementAdvantageResult = calculateINTElementAdvantage(
					baseStats.INT, // 基礎INT（装備・バフ補正を除く）
					data.mainWeapon.weaponType,
					powerOptions?.elementAttack || 'none',
				)

				// 熱情の歌の効果を計算
				const hotKnowsSkill = data.buffSkills?.skills?.IsHotKnows
				let hotKnowsEffect = 0
				if (
					hotKnowsSkill?.isEnabled &&
					hotKnowsSkill.stackCount &&
					powerOptions
				) {
					const {
						calculateHotKnowsEffects,
					} = require('@/utils/buffSkillCalculation/categories/minstrelSkills')
					const hotKnowsResult = calculateHotKnowsEffects(
						hotKnowsSkill.stackCount,
						powerOptions,
					)
					hotKnowsEffect = hotKnowsResult.ElementAdvantage_Rate || 0
				}

				// スキル種別に応じて総属性有利を計算
				const baseElementAdvantage = finalBonuses.ElementAdvantage_Rate || 0
				const isStaffOrMagicDevice =
					data.mainWeapon.weaponType === '杖' ||
					data.mainWeapon.weaponType === '魔導具'

				// 物理スキル: 属性覚醒+25 + 属性有利プロパティ
				const physicalTotal =
					elementAwakeningResult.finalElementAwakeningAdvantage +
					baseElementAdvantage

				// 魔法スキル: 属性覚醒+25 + INT補正（条件満たす場合） + 属性有利プロパティ
				const magicalTotal =
					elementAwakeningResult.finalElementAwakeningAdvantage +
					intElementAdvantageResult.intElementAdvantage +
					baseElementAdvantage

				// 表示用に両方の値を含むオブジェクトを返す
				return {
					...calculateTotalElementAdvantage(finalBonuses, hotKnowsEffect),
					physicalSkillTotal: physicalTotal,
					magicalSkillTotal: magicalTotal,
					elementAwakening:
						elementAwakeningResult.finalElementAwakeningAdvantage,
					intElementAdvantage: intElementAdvantageResult.intElementAdvantage,
					baseElementAdvantage: baseElementAdvantage,
					isStaffOrMagicDevice,
				}
			})(),
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
			elementAwakeningAdvantageCalculation: calculateElementAwakeningAdvantage(
				powerOptions,
				data.enemy.selectedEnemyId,
				data.buffSkills,
			),
			adjustedStatsCalculation,
		}
	}, [data, baseStats, powerOptions])

	// 詳細データソースボーナス取得（フィルター表示用）
	const detailedBonuses = useMemo(() => {
		return getDetailedDataSourceBonuses(data)
	}, [data])

	// フィルター適用後の表示用補正値計算
	const filteredEquipmentBonuses = useMemo(() => {
		// フィルター適用ロジック
		const getFilteredBonuses = (
			detailedBonuses: ReturnType<typeof getDetailedDataSourceBonuses>,
			filter: FilterOption,
		) => {
			switch (filter) {
				case 'calculation':
					// 全ての合計値（既存のロジック）
					return getAllDataSourceBonusesWithBuffSkills(data)
				case 'mainWeapon':
					return detailedBonuses.equipment.mainWeapon
				case 'subWeapon':
					return detailedBonuses.equipment.subWeapon
				case 'body':
					return detailedBonuses.equipment.body
				case 'additional':
					return detailedBonuses.equipment.additional
				case 'special':
					return detailedBonuses.equipment.special
				case 'enchantment':
					return detailedBonuses.equipment.enchantment
				case 'freeInput1':
					return detailedBonuses.equipment.freeInput1
				case 'freeInput2':
					return detailedBonuses.equipment.freeInput2
				case 'freeInput3':
					return detailedBonuses.equipment.freeInput3
				case 'crystal':
					return detailedBonuses.crystal
				case 'food':
					return detailedBonuses.food
				case 'buffItems':
					return detailedBonuses.buffItems
				case 'buffSkills':
					return detailedBonuses.buffSkills
				case 'register':
					return detailedBonuses.register
				default:
					return {}
			}
		}

		const filtered1 = getFilteredBonuses(
			detailedBonuses,
			filters.equipmentBonus1,
		)
		const filtered2 = getFilteredBonuses(
			detailedBonuses,
			filters.equipmentBonus2,
		)
		const filtered3 = getFilteredBonuses(
			detailedBonuses,
			filters.equipmentBonus3,
		)

		return {
			equipmentBonus1: calculateEquipmentBonuses(filtered1).equipmentBonus1,
			equipmentBonus2: calculateEquipmentBonuses(filtered2).equipmentBonus2,
			equipmentBonus3: calculateEquipmentBonuses(filtered3).equipmentBonus3,
		}
	}, [detailedBonuses, filters, data])

	const {
		allBonuses: finalBonuses,
		hpCalculation,
		mpCalculation,
		atkCalculation,
		subATKCalculation,
		aspdCalculation,
		motionSpeedCalculation,
		criticalRateCalculation,
		criticalDamageCalculation,
		magicalCriticalDamageCalculation,
		hitCalculation,
		fleeCalculation,
		physicalResistanceCalculation,
		magicalResistanceCalculation,
		armorBreakCalculation,
		anticipateCalculation,
		cspdCalculation,
		stabilityCalculation,
		ailmentResistanceCalculation,
		elementAwakeningAdvantageCalculation,
		adjustedStatsCalculation,
	} = calculationResults

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
	// 槍MATK計算（旋風槍装備時のみ）
	const spearMatkCalculation =
		data.mainWeapon.weaponType === '旋風槍'
			? calculateSpearMATK(
					baseStats.level,
					data.mainWeapon.weaponType,
					atkCalculation.totalWeaponATK, // 総武器ATK
					baseStats, // 基礎ステータス（MATKアップ用）
					adjustedStatsCalculation, // 補正後ステータス（槍ステータスMATK用）
					finalBonuses, // 全ての効果を統合した最終ボーナス値を使用
				)
			: null

	// 魔法クリティカル率計算（DamagePreviewの設定を考慮）
	const magicalCriticalRateCalculation = useMemo(() => {
		// 物理クリティカル率を取得
		const physicalCriticalRate = criticalRateCalculation.finalCriticalRate

		// スペルバーストレベル取得
		const spellBurstLevel = getSpellBurstLevel(data.buffSkills.skills)

		// 武器種判定（杖または魔導具）
		const isStaffOrMagicDevice =
			data.mainWeapon.weaponType === '杖' ||
			data.mainWeapon.weaponType === '魔導具'

		// DamagePreviewの設定を取得
		const powerOptions = data.powerOptions || { elementAttack: 'none' }
		const otherOptions = data.otherOptions || { enemyStatusWeaken: 'none' }

		// 衰弱状態の判定
		const isWeakened = otherOptions.enemyStatusWeaken === 'applied'

		// 弱点属性一致の判定
		const isWeakElementMatch = powerOptions.elementAttack === 'advantageous'

		// 無属性攻撃の判定
		const isNeutralElement = powerOptions.elementAttack === 'none'

		// 魔法クリティカル率計算（全条件を考慮）
		return calculateMagicalCriticalRate(
			physicalCriticalRate,
			spellBurstLevel,
			isWeakened,
			isWeakElementMatch,
			isStaffOrMagicDevice,
			isNeutralElement,
		)
	}, [
		criticalRateCalculation,
		data.buffSkills.skills,
		data.mainWeapon.weaponType,
		data.powerOptions,
		data.otherOptions,
	])

	// 総ATK計算（ATK・サブATK計算結果が必要なため、useMemoの外で実行）
	const totalATKCalculation = calculateTotalATK(
		data.mainWeapon.weaponType,
		atkCalculation.finalATK,
		subATKCalculation?.subFinalATK || 0,
	)

	if (!isVisible) {
		return null
	}

	// カテゴリ別データ取得関数
	const getBasicStatsByCategory = (
		category: BasicStatsDisplayCategory['value'],
	): Record<string, number | null> => {
		const baseStats = {
			HP: hpCalculation.finalHP,
			MP: mpCalculation.finalMP,
			ATK: atkCalculation.finalATK,
			baseATK: Math.floor(atkCalculation.baseATK),
			subATK:
				data.mainWeapon.weaponType === '双剣' && subATKCalculation
					? subATKCalculation.subFinalATK
					: null,
			subBaseATK:
				data.mainWeapon.weaponType === '双剣' && subATKCalculation
					? Math.floor(subATKCalculation.subBaseATK)
					: null,
			totalATK: totalATKCalculation.totalATK,
			bringerAM: 0,
			MATK: matkCalculation.finalMATK,
			baseMATK: matkCalculation.baseMATK,
			stabilityRate: stabilityCalculation.finalStability,
			subStabilityRate: (() => {
				if (data.mainWeapon.weaponType === '双剣' && subATKCalculation) {
					return subATKCalculation.subStability
				}
				if (
					(data.mainWeapon.weaponType === '弓' ||
						data.mainWeapon.weaponType === '自動弓') &&
					data.subWeapon.weaponType === '矢'
				) {
					return data.subWeapon.stability
				}
				return null
			})(),
			criticalRate: criticalRateCalculation.finalCriticalRate,
			criticalDamage: criticalDamageCalculation.finalCriticalDamage,
			magicCriticalRate:
				magicalCriticalRateCalculation.finalMagicalCriticalRate,
			magicCriticalDamage:
				magicalCriticalDamageCalculation.finalMagicalCriticalDamage,
			totalElementAdvantage:
				calculationResults.totalElementAdvantageCalculation.physicalSkillTotal,
			elementAwakeningAdvantage:
				elementAwakeningAdvantageCalculation.finalElementAwakeningAdvantage,
			ASPD: aspdCalculation.finalASPD,
			CSPD: cspdCalculation.finalCSPD,
			HIT: hitCalculation.finalHIT,
			FLEE: fleeCalculation.finalFLEE,
			physicalResistance: physicalResistanceCalculation.finalPhysicalResistance,
			magicalResistance: magicalResistanceCalculation.finalMagicalResistance,
			ailmentResistance: ailmentResistanceCalculation,
			motionSpeed: motionSpeedCalculation.finalMotionSpeed,
			armorBreak: armorBreakCalculation.finalArmorBreak,
			anticipate: anticipateCalculation.finalAnticipate,
		}

		switch (category) {
			case 'physical': {
				// 物理スキル用の属性覚醒有利（属性覚醒25のみ）
				const physicalElementAwakeningAdvantage =
					calculationResults.totalElementAdvantageCalculation.elementAwakening

				return {
					HP: baseStats.HP,
					MP: baseStats.MP,
					ATK: baseStats.ATK,
					baseATK: baseStats.baseATK,
					subATK: baseStats.subATK,
					subBaseATK: baseStats.subBaseATK,
					totalATK: baseStats.totalATK,
					bringerAM: baseStats.bringerAM,
					stabilityRate: baseStats.stabilityRate,
					subStabilityRate: baseStats.subStabilityRate,
					criticalRate: baseStats.criticalRate,
					criticalDamage: baseStats.criticalDamage,
					totalElementAdvantage:
						calculationResults.totalElementAdvantageCalculation
							.physicalSkillTotal,
					elementAwakeningAdvantage: physicalElementAwakeningAdvantage,
					shortRangeDamage:
						calculationResults.equipmentBonuses.equipmentBonus1
							.shortRangeDamage || 0,
					longRangeDamage:
						calculationResults.equipmentBonuses.equipmentBonus1
							.longRangeDamage || 0,
					physicalPenetration:
						calculationResults.equipmentBonuses.equipmentBonus1
							.physicalPenetration || 0,
					magicalPenetration:
						calculationResults.equipmentBonuses.equipmentBonus1
							.magicalPenetration || 0,
					unsheatheAttackRate:
						(
							calculationResults.equipmentBonuses.equipmentBonus1
								.unsheatheAttack as { rate?: number }
						)?.rate || 0,
					unsheatheAttackFixed:
						(
							calculationResults.equipmentBonuses.equipmentBonus1
								.unsheatheAttack as { fixed?: number }
						)?.fixed || 0,
					armorBreak: baseStats.armorBreak,
					anticipate: baseStats.anticipate,
					motionSpeed: baseStats.motionSpeed,
					ASPD: baseStats.ASPD,
					CSPD: baseStats.CSPD,
					HIT: baseStats.HIT,
					FLEE: baseStats.FLEE,
				} as Record<string, number | null>
			}

			case 'magical': {
				// 魔法スキル用の属性覚醒有利（属性覚醒25 + INT属性有利補正）
				const magicalElementAwakeningAdvantage =
					calculationResults.totalElementAdvantageCalculation.elementAwakening +
					calculationResults.totalElementAdvantageCalculation
						.intElementAdvantage

				return {
					HP: baseStats.HP,
					MP: baseStats.MP,
					MATK: baseStats.MATK,
					baseMATK: baseStats.baseMATK,
					stabilityRate: baseStats.stabilityRate,
					subStabilityRate: baseStats.subStabilityRate,
					magicCriticalRate: baseStats.magicCriticalRate,
					magicCriticalDamage: baseStats.magicCriticalDamage,
					totalElementAdvantage:
						calculationResults.totalElementAdvantageCalculation
							.magicalSkillTotal,
					elementAwakeningAdvantage: magicalElementAwakeningAdvantage,
					shortRangeDamage:
						calculationResults.equipmentBonuses.equipmentBonus1
							.shortRangeDamage || 0,
					longRangeDamage:
						calculationResults.equipmentBonuses.equipmentBonus1
							.longRangeDamage || 0,
					physicalPenetration:
						calculationResults.equipmentBonuses.equipmentBonus1
							.physicalPenetration || 0,
					magicalPenetration:
						calculationResults.equipmentBonuses.equipmentBonus1
							.magicalPenetration || 0,
					unsheatheAttackRate:
						(
							calculationResults.equipmentBonuses.equipmentBonus1
								.unsheatheAttack as { rate?: number }
						)?.rate || 0,
					unsheatheAttackFixed:
						(
							calculationResults.equipmentBonuses.equipmentBonus1
								.unsheatheAttack as { fixed?: number }
						)?.fixed || 0,
					armorBreak: baseStats.armorBreak,
					anticipate: baseStats.anticipate,
					motionSpeed: baseStats.motionSpeed,
					ASPD: baseStats.ASPD,
					CSPD: baseStats.CSPD,
					HIT: baseStats.HIT,
					FLEE: baseStats.FLEE,
				} as Record<string, number | null>
			}

			case 'hybrid': {
				// ハイブリッド用の属性覚醒有利（魔法スキルベース：属性覚醒25 + INT属性有利補正）
				const hybridElementAwakeningAdvantage =
					calculationResults.totalElementAdvantageCalculation.elementAwakening +
					calculationResults.totalElementAdvantageCalculation
						.intElementAdvantage

				return {
					HP: baseStats.HP,
					MP: baseStats.MP,
					ATK: baseStats.ATK,
					baseATK: baseStats.baseATK,
					subATK: baseStats.subATK,
					subBaseATK: baseStats.subBaseATK,
					totalATK: baseStats.totalATK,
					bringerAM: baseStats.bringerAM,
					MATK: baseStats.MATK,
					baseMATK: baseStats.baseMATK,
					spearMATK: spearMatkCalculation?.finalSpearMATK || 0,
					spearBaseMATK: spearMatkCalculation?.spearBaseMATK || 0,
					stabilityRate: baseStats.stabilityRate,
					subStabilityRate: baseStats.subStabilityRate,
					criticalRate: baseStats.criticalRate,
					criticalDamage: baseStats.criticalDamage,
					magicCriticalRate: baseStats.magicCriticalRate,
					magicCriticalDamage: baseStats.magicCriticalDamage,
					totalElementAdvantage:
						calculationResults.totalElementAdvantageCalculation
							.magicalSkillTotal,
					elementAwakeningAdvantage: hybridElementAwakeningAdvantage,
					shortRangeDamage:
						calculationResults.equipmentBonuses.equipmentBonus1
							.shortRangeDamage || 0,
					longRangeDamage:
						calculationResults.equipmentBonuses.equipmentBonus1
							.longRangeDamage || 0,
					physicalPenetration:
						calculationResults.equipmentBonuses.equipmentBonus1
							.physicalPenetration || 0,
					magicalPenetration:
						calculationResults.equipmentBonuses.equipmentBonus1
							.magicalPenetration || 0,
					unsheatheAttackRate:
						(
							calculationResults.equipmentBonuses.equipmentBonus1
								.unsheatheAttack as { rate?: number }
						)?.rate || 0,
					unsheatheAttackFixed:
						(
							calculationResults.equipmentBonuses.equipmentBonus1
								.unsheatheAttack as { fixed?: number }
						)?.fixed || 0,
					armorBreak: baseStats.armorBreak,
					anticipate: baseStats.anticipate,
					motionSpeed: baseStats.motionSpeed,
					ASPD: baseStats.ASPD,
					CSPD: baseStats.CSPD,
					HIT: baseStats.HIT,
					FLEE: baseStats.FLEE,
				} as Record<string, number | null>
			}

			case 'tank':
				return {
					HP: baseStats.HP,
					MP: baseStats.MP,
					ASPD: baseStats.ASPD,
					CSPD: baseStats.CSPD,
					HIT: baseStats.HIT,
					FLEE: baseStats.FLEE,
					criticalRate: baseStats.criticalRate,
					stabilityRate: baseStats.stabilityRate,
					physicalResistance: baseStats.physicalResistance,
					magicalResistance: baseStats.magicalResistance,
					ailmentResistance: baseStats.ailmentResistance,
					motionSpeed: baseStats.motionSpeed,
					armorBreak: baseStats.armorBreak,
					anticipate: baseStats.anticipate,
					physicalBarrier:
						calculationResults.equipmentBonuses.equipmentBonus2
							.physicalBarrier || 0,
					magicalBarrier:
						calculationResults.equipmentBonuses.equipmentBonus2
							.magicalBarrier || 0,
					fractionalBarrier:
						calculationResults.equipmentBonuses.equipmentBonus2
							.fractionalBarrier || 0,
					barrierCooldown:
						calculationResults.equipmentBonuses.equipmentBonus2
							.barrierCooldown_Rate || 0,
					guardPower:
						calculationResults.equipmentBonuses.equipmentBonus2
							.guardPower_Rate || 0,
					guardRecovery:
						calculationResults.equipmentBonuses.equipmentBonus2
							.guardRecovery_Rate || 0,
					aggro:
						calculationResults.equipmentBonuses.equipmentBonus1.aggro_Rate || 0,
					darkResistance:
						calculationResults.equipmentBonuses.equipmentBonus2
							.darkResistance_Rate || 0,
				} as Record<string, number | null>

			default: {
				// 'base'
				// 攻撃スキルの設定に基づいて物理または魔法スキル用の総属性有利を判定
				let attackSkillType: 'physical' | 'magical' = 'physical' // デフォルトは物理

				if (data.attackSkill?.selectedSkillId) {
					try {
						const { getAttackSkillById } = require('@/data/attackSkills')
						const skill = getAttackSkillById(data.attackSkill.selectedSkillId)
						if (skill?.hits?.[0]?.attackType) {
							attackSkillType = skill.hits[0].attackType as
								| 'physical'
								| 'magical'
						}
					} catch (error) {
						// エラー時はデフォルトの物理を使用
						console.warn('攻撃スキル情報の取得に失敗:', error)
					}
				}

				const totalElementAdvantageValue =
					attackSkillType === 'magical'
						? calculationResults.totalElementAdvantageCalculation
								.magicalSkillTotal
						: calculationResults.totalElementAdvantageCalculation
								.physicalSkillTotal

				// ベースカテゴリの属性覚醒有利もスキルタイプに応じて変更
				const baseElementAwakeningAdvantage =
					attackSkillType === 'magical'
						? calculationResults.totalElementAdvantageCalculation
								.elementAwakening +
							calculationResults.totalElementAdvantageCalculation
								.intElementAdvantage
						: calculationResults.totalElementAdvantageCalculation
								.elementAwakening

				return {
					...baseStats,
					totalElementAdvantage: totalElementAdvantageValue,
					elementAwakeningAdvantage: baseElementAwakeningAdvantage,
				} as Record<string, number | null>
			}
		}
	}

	// カテゴリ別ラベル定義
	const getBasicStatsLabelsByCategory = (
		category: BasicStatsDisplayCategory['value'],
	) => {
		const baseLabels = {
			HP: 'HP',
			MP: 'MP',
			ASPD: 'ASPD',
			CSPD: 'CSPD',
			HIT: 'HIT',
			FLEE: 'FLEE',
			totalElementAdvantage: '総属性有利(%)',
			elementAwakeningAdvantage: '属性覚醒有利(%)',
			stabilityRate: '安定率(%)',
			subStabilityRate: 'サブ安定率(%)',
			motionSpeed: '行動速度(%)',
			armorBreak: '防御崩し(%)',
			anticipate: '先読み(%)',
		}

		switch (category) {
			case 'physical':
				return {
					...baseLabels,
					ATK: 'ATK',
					baseATK: '基礎ATK',
					subATK: 'サブATK',
					subBaseATK: 'サブ基礎ATK',
					totalATK: '総ATK',
					bringerAM: 'BringerA/M',
					criticalRate: 'ｸﾘﾃｨｶﾙ率',
					criticalDamage: 'ｸﾘﾃｨｶﾙﾀﾞﾒｰｼﾞ',
					shortRangeDamage: '近距離の威力(%)',
					longRangeDamage: '遠距離の威力(%)',
					physicalPenetration: '物理貫通(%)',
					magicalPenetration: '魔法貫通(%)',
					unsheatheAttackRate: '抜刀威力(%)',
					unsheatheAttackFixed: '抜刀威力+',
				}

			case 'magical':
				return {
					...baseLabels,
					MATK: 'MATK',
					baseMATK: '基礎MATK',
					magicCriticalRate: '魔法ｸﾘﾃｨｶﾙ率',
					magicCriticalDamage: '魔法ｸﾘﾃｨｶﾙﾀﾞﾒｰｼﾞ',
					shortRangeDamage: '近距離の威力(%)',
					longRangeDamage: '遠距離の威力(%)',
					physicalPenetration: '物理貫通(%)',
					magicalPenetration: '魔法貫通(%)',
					unsheatheAttackRate: '抜刀威力(%)',
					unsheatheAttackFixed: '抜刀威力+',
				}

			case 'hybrid':
				return {
					...baseLabels,
					ATK: 'ATK',
					baseATK: '基礎ATK',
					subATK: 'サブATK',
					subBaseATK: 'サブ基礎ATK',
					totalATK: '総ATK',
					bringerAM: 'BringerA/M',
					MATK: 'MATK',
					baseMATK: '基礎MATK',
					spearMATK: '槍MATK',
					spearBaseMATK: '槍基礎MATK',
					criticalRate: 'ｸﾘﾃｨｶﾙ率',
					criticalDamage: 'ｸﾘﾃｨｶﾙﾀﾞﾒｰｼﾞ',
					magicCriticalRate: '魔法ｸﾘﾃｨｶﾙ率',
					magicCriticalDamage: '魔法ｸﾘﾃｨｶﾙﾀﾞﾒｰｼﾞ',
					shortRangeDamage: '近距離の威力(%)',
					longRangeDamage: '遠距離の威力(%)',
					physicalPenetration: '物理貫通(%)',
					magicalPenetration: '魔法貫通(%)',
					unsheatheAttackRate: '抜刀威力(%)',
					unsheatheAttackFixed: '抜刀威力+',
				}

			case 'tank':
				return {
					...baseLabels,
					criticalRate: 'ｸﾘﾃｨｶﾙ率',
					physicalResistance: '物理耐性(%)',
					magicalResistance: '魔法耐性(%)',
					ailmentResistance: '異常耐性(%)',
					physicalBarrier: '物理バリア',
					magicalBarrier: '魔法バリア',
					fractionalBarrier: '割合バリア',
					barrierCooldown: 'バリア速度(%)',
					guardPower: 'Guard力(%)',
					guardRecovery: 'Guard回復(%)',
					aggro: 'ヘイト(%)',
					darkResistance: '闇耐性(%)',
				}

			default: {
				// 'base'
				return {
					...baseLabels,
					ATK: 'ATK',
					baseATK: '基礎ATK',
					subATK: 'サブATK',
					subBaseATK: 'サブ基礎ATK',
					totalATK: '総ATK',
					bringerAM: 'ブリンガーAM',
					MATK: 'MATK',
					baseMATK: '基本MATK',
					criticalRate: 'ｸﾘﾃｨｶﾙ率',
					criticalDamage: 'ｸﾘﾃｨｶﾙﾀﾞﾒｰｼﾞ',
					magicCriticalRate: '魔法ｸﾘﾃｨｶﾙ率',
					magicCriticalDamage: '魔法ｸﾘﾃｨｶﾙﾀﾞﾒｰｼﾞ',
					physicalResistance: '物理耐性(%)',
					magicalResistance: '魔法耐性(%)',
					ailmentResistance: '異常耐性(%)',
				}
			}
		}
	}

	// カテゴリ別表示順序定義
	const getBasicStatsDisplayOrder = (
		category: BasicStatsDisplayCategory['value'],
	): string[] => {
		switch (category) {
			case 'physical':
				return [
					'HP',
					'MP',
					'ATK',
					'baseATK',
					'subATK',
					'subBaseATK',
					'totalATK',
					'bringerAM',
					'stabilityRate',
					'subStabilityRate',
					'criticalRate',
					'criticalDamage',
					'totalElementAdvantage',
					'elementAwakeningAdvantage',
					'shortRangeDamage',
					'longRangeDamage',
					'physicalPenetration',
					'magicalPenetration',
					'unsheatheAttackRate',
					'unsheatheAttackFixed',
					'armorBreak',
					'anticipate',
					'motionSpeed',
					'', // 行動速度の右にスペース
					'ASPD',
					'CSPD',
					'HIT',
					'FLEE',
				]
			case 'magical':
				return [
					'HP',
					'MP',
					'MATK',
					'baseMATK',
					'stabilityRate',
					'subStabilityRate',
					'magicCriticalRate',
					'magicCriticalDamage',
					'totalElementAdvantage',
					'elementAwakeningAdvantage',
					'shortRangeDamage',
					'longRangeDamage',
					'physicalPenetration',
					'magicalPenetration',
					'unsheatheAttackRate',
					'unsheatheAttackFixed',
					'armorBreak',
					'anticipate',
					'motionSpeed',
					'',
					'ASPD',
					'CSPD',
					'HIT',
					'FLEE',
				]
			case 'hybrid':
				return [
					'HP',
					'MP',
					'ATK',
					'baseATK',
					'subATK',
					'subBaseATK',
					'totalATK',
					'bringerAM',
					'MATK',
					'baseMATK',
					'spearMATK',
					'spearBaseMATK',
					'stabilityRate',
					'subStabilityRate',
					'criticalRate',
					'criticalDamage',
					'magicCriticalRate',
					'magicCriticalDamage',
					'totalElementAdvantage',
					'elementAwakeningAdvantage',
					'shortRangeDamage',
					'longRangeDamage',
					'physicalPenetration',
					'magicalPenetration',
					'unsheatheAttackRate',
					'unsheatheAttackFixed',
					'armorBreak',
					'anticipate',
					'motionSpeed',
					'',
					'ASPD',
					'CSPD',
					'HIT',
					'FLEE',
				]
			case 'tank':
				return [
					'HP',
					'MP',
					'ASPD',
					'CSPD',
					'HIT',
					'FLEE',
					'criticalRate',
					'stabilityRate',
					'physicalResistance',
					'magicalResistance',
					'ailmentResistance',
					'motionSpeed',
					'armorBreak',
					'anticipate',
					'physicalBarrier',
					'magicalBarrier',
					'fractionalBarrier',
					'barrierCooldown',
					'guardPower',
					'guardRecovery',
					'aggro',
					'darkResistance',
				]
			default: {
				// 'base'
				return [
					'HP',
					'MP',
					'ATK',
					'baseATK',
					'subATK',
					'subBaseATK',
					'totalATK',
					'bringerAM',
					'MATK',
					'baseMATK',
					'stabilityRate',
					'subStabilityRate',
					'criticalRate',
					'criticalDamage',
					'magicCriticalRate',
					'magicCriticalDamage',
					'totalElementAdvantage',
					'elementAwakeningAdvantage',
					'ASPD',
					'CSPD',
					'HIT',
					'FLEE',
					'physicalResistance',
					'magicalResistance',
					'ailmentResistance',
					'motionSpeed',
					'armorBreak',
					'anticipate',
				]
			}
		}
	}

	// TODO: 将来的には全98項目の計算を実装
	// 現在は基本的な項目のみ計算

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
		<div
			ref={containerRef}
			className="relative bg-blue-50"
			style={{ height: `${statusPreviewHeight}px`, overflow: 'hidden' }}
		>
			{/* リサイズハンドル */}
			<div
				className={`absolute bottom-0 left-0 right-0 h-3 bg-blue-200/50 hover:bg-blue-300/70 cursor-row-resize flex items-center justify-center transition-colors ${
					isResizing ? 'bg-blue-400/70' : ''
				}`}
				onMouseDown={handleMouseDown}
				onTouchStart={handleTouchStart}
				tabIndex={0}
				role="button"
				aria-label="StatusPreviewの高さを調整"
				title="ドラッグして高さを調整"
			>
				<div className="w-8 h-1 bg-gray-400 rounded-full" />
			</div>

			<div
				className="flex flex-col items-center px-1 sm:px-4 py-2 h-full overflow-y-auto"
				style={{ paddingBottom: '12px' }} // リサイズハンドル分のスペースを確保
			>
				{/* セクション表示切り替えボタン */}
				<div className="mb-3 flex flex-wrap gap-2">
					<button
						type="button"
						onClick={() =>
							isMobile
								? handleMobileSectionChange('basicStats')
								: toggleSection('basicStats')
						}
						className={`px-3 py-1 text-xs md:text-sm rounded transition-colors cursor-pointer ${
							(
								isMobile
									? activeSection === 'basicStats'
									: visibleSections.basicStats
							)
								? 'bg-blue-500/80 text-white'
								: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
						}`}
					>
						基本ステータス
					</button>
					<button
						type="button"
						onClick={() =>
							isMobile
								? handleMobileSectionChange('adjustedStats')
								: toggleSection('adjustedStats')
						}
						className={`px-3 py-1 text-xs md:text-sm rounded transition-colors cursor-pointer ${
							(
								isMobile
									? activeSection === 'adjustedStats'
									: visibleSections.adjustedStats
							)
								? 'bg-blue-500/80 text-white'
								: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
						}`}
					>
						補正後ステータス
					</button>
					<button
						type="button"
						onClick={() =>
							isMobile
								? handleMobileSectionChange('equipmentBonus1')
								: toggleSection('equipmentBonus1')
						}
						className={`px-3 py-1 text-xs md:text-sm rounded transition-colors cursor-pointer ${
							(
								isMobile
									? activeSection === 'equipmentBonus1'
									: visibleSections.equipmentBonus1
							)
								? 'bg-blue-500/80 text-white'
								: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
						}`}
					>
						装備品補正値1
					</button>
					<button
						type="button"
						onClick={() =>
							isMobile
								? handleMobileSectionChange('equipmentBonus2')
								: toggleSection('equipmentBonus2')
						}
						className={`px-3 py-1 text-xs md:text-sm rounded transition-colors cursor-pointer ${
							(
								isMobile
									? activeSection === 'equipmentBonus2'
									: visibleSections.equipmentBonus2
							)
								? 'bg-blue-500/80 text-white'
								: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
						}`}
					>
						装備品補正値2
					</button>
					<button
						type="button"
						onClick={() =>
							isMobile
								? handleMobileSectionChange('equipmentBonus3')
								: toggleSection('equipmentBonus3')
						}
						className={`px-3 py-1 text-xs md:text-sm rounded transition-colors cursor-pointer ${
							(
								isMobile
									? activeSection === 'equipmentBonus3'
									: visibleSections.equipmentBonus3
							)
								? 'bg-blue-500/80 text-white'
								: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
						}`}
					>
						装備品補正値3
					</button>
				</div>
				{/* レスポンシブグリッドレイアウト - 5つのセクション */}
				<div
					className={`flex gap-6 flex-wrap justify-center ${isMobile ? 'flex-col items-center' : ''}`}
				>
					{/* 基本ステータス (カテゴリ別表示対応) */}
					{visibleSections.basicStats && (
						<div className="stat-section">
							<div className="flex items-center justify-between mb-2">
								<h3 className="text-sm font-semibold">基本ステータス</h3>
								<select
									value={basicStatsCategory}
									onChange={(e) =>
										handleBasicStatsCategoryChange(
											e.target.value as BasicStatsDisplayCategory['value'],
										)
									}
									className="ml-2 px-2 py-1 text-xs border border-gray-300 rounded outline-none"
								>
									{BASIC_STATS_CATEGORIES.map((category) => (
										<option key={category.value} value={category.value}>
											{category.label}
										</option>
									))}
								</select>
							</div>
							<StatSection
								title=""
								stats={getBasicStatsByCategory(basicStatsCategory)}
								labels={getBasicStatsLabelsByCategory(basicStatsCategory)}
								displayMode="normal"
								propertyOrder={getBasicStatsDisplayOrder(basicStatsCategory)}
								className=""
							/>
						</div>
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
						<div className="stat-section">
							<div className="flex items-center justify-between mb-2">
								<h3 className="text-sm font-semibold">装備品補正値1</h3>
								<FilterDropdown
									value={filters.equipmentBonus1}
									onChange={(value) =>
										handleFilterChange('equipmentBonus1', value)
									}
									className="ml-2"
								/>
							</div>
							<StatSection
								title=""
								stats={{
									...filteredEquipmentBonuses.equipmentBonus1,
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
									aggro: 'ヘイト',
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
									unsheatheAttack: { hasRate: true, hasFixed: true },
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
						</div>
					)}

					{/* 装備品補正値2 (32項目) */}
					{visibleSections.equipmentBonus2 && (
						<div className="stat-section">
							<div className="flex items-center justify-between mb-2">
								<h3 className="text-sm font-semibold">装備品補正値2</h3>
								<FilterDropdown
									value={filters.equipmentBonus2}
									onChange={(value) =>
										handleFilterChange('equipmentBonus2', value)
									}
									className="ml-2"
								/>
							</div>
							<StatSection
								title=""
								stats={filteredEquipmentBonuses.equipmentBonus2}
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
						</div>
					)}

					{/* 装備品補正値3 (8項目) */}
					{visibleSections.equipmentBonus3 && (
						<div className="stat-section">
							<div className="flex items-center justify-between mb-2">
								<h3 className="text-sm font-semibold">装備品補正値3</h3>
								<FilterDropdown
									value={filters.equipmentBonus3}
									onChange={(value) =>
										handleFilterChange('equipmentBonus3', value)
									}
									className="ml-2"
								/>
							</div>
							<StatSection
								title=""
								stats={filteredEquipmentBonuses.equipmentBonus3}
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
					)}
				</div>
			</div>
		</div>
	)
}
