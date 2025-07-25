'use client'

import { useState, useCallback } from 'react'
import { DamageDifferenceDisplayCorrect } from '@/components/common/DamageDifferenceDisplayCorrect'
import type { PresetEquipment } from '@/types/calculator'
import type { SlotInfo } from '@/types/damagePreview'
import { formatConditionalEffect } from '@/utils/crystalDisplayUtils'
import { EquipmentFavoritesManager } from '@/utils/equipmentFavorites'

interface EquipmentCardProps {
	equipment: PresetEquipment
	isSelected: boolean
	onClick: () => void
	// ダメージ差分表示用の追加プロパティ
	showDamageDifference?: boolean
	slotInfo?: SlotInfo
	// お気に入り機能用の新規プロパティ
	showFavoriteButton?: boolean
	onFavoriteChange?: (equipmentId: string, isFavorite: boolean) => void
}

export default function EquipmentCard({
	equipment,
	isSelected,
	onClick,
	showDamageDifference = false,
	slotInfo,
	showFavoriteButton = true,
	onFavoriteChange,
}: EquipmentCardProps) {
	const [isFavorite, setIsFavorite] = useState(() =>
		EquipmentFavoritesManager.isFavorite(equipment.id),
	)

	const handleFavoriteClick = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation() // 装備選択イベントの阻止

			const newFavoriteState = !isFavorite
			const success = EquipmentFavoritesManager.setFavorite(
				equipment.id,
				newFavoriteState,
			)

			if (success) {
				setIsFavorite(newFavoriteState)
				onFavoriteChange?.(equipment.id, newFavoriteState)
			}
		},
		[equipment.id, isFavorite, onFavoriteChange],
	)

	const formatBaseStats = () => {
		const stats = Object.entries(equipment.baseStats)
			.filter(([_, value]) => value !== undefined && value !== 0)
			.map(([key, value]) => `${key}${value > 0 ? '+' : ''}${value}`)
			.slice(0, 2) // 最大2つまで表示

		return stats.length > 0 ? stats.join(', ') : ''
	}

	const getPropertyList = () => {
		// 装備フォームと同じプロパティ名マッピング
		const propertyNameMap: Record<string, string> = {
			// 基本攻撃力系
			ATK_Rate: 'ATK',
			ATK: 'ATK',
			MATK_Rate: 'MATK',
			MATK: 'MATK',
			WeaponATK_Rate: '武器ATK',
			WeaponATK: '武器ATK',

			// 防御力系
			DEF_Rate: 'DEF',
			DEF: 'DEF',
			MDEF_Rate: 'MDEF',
			MDEF: 'MDEF',

			// 貫通系
			PhysicalPenetration_Rate: '物理貫通',
			MagicalPenetration_Rate: '魔法貫通',
			ElementAdvantage_Rate: '属性有利',

			// 威力系
			UnsheatheAttack_Rate: '抜刀威力',
			UnsheatheAttack: '抜刀威力',
			ShortRangeDamage_Rate: '近距離威力',
			LongRangeDamage_Rate: '遠距離威力',

			// クリティカル系
			CriticalDamage_Rate: 'ｸﾘﾃｨｶﾙﾀﾞﾒｰｼﾞ',
			CriticalDamage: 'ｸﾘﾃｨｶﾙﾀﾞﾒｰｼﾞ',
			Critical_Rate: 'ｸﾘﾃｨｶﾙ率',
			Critical: 'ｸﾘﾃｨｶﾙ率',

			// 安定率
			Stability_Rate: '安定率',

			// HP/MP系
			HP_Rate: 'HP',
			HP: 'HP',
			MP_Rate: 'MP',
			MP: 'MP',

			// ステータス系
			STR_Rate: 'STR',
			STR: 'STR',
			INT_Rate: 'INT',
			INT: 'INT',
			VIT_Rate: 'VIT',
			VIT: 'VIT',
			AGI_Rate: 'AGI',
			AGI: 'AGI',
			DEX_Rate: 'DEX',
			DEX: 'DEX',
			CRT_Rate: 'CRT',
			CRT: 'CRT',
			MEN_Rate: 'MEN',
			MEN: 'MEN',
			TEC_Rate: 'TEC',
			TEC: 'TEC',
			LUK_Rate: 'LUK',
			LUK: 'LUK',

			// 命中・回避系
			Accuracy_Rate: '命中',
			Accuracy: '命中',
			Dodge_Rate: '回避',
			Dodge: '回避',
			AbsoluteAccuracy_Rate: '絶対命中',
			AbsoluteDodge_Rate: '絶対回避',

			// 速度系
			AttackSpeed_Rate: '攻撃速度',
			AttackSpeed: '攻撃速度',
			CastingSpeed_Rate: '詠唱速度',
			CastingSpeed: '詠唱速度',
			MotionSpeed_Rate: '行動速度',

			// MP回復系
			AttackMPRecovery_Rate: '攻撃MP回復',
			AttackMPRecovery: '攻撃MP回復',

			// 耐性系
			PhysicalResistance_Rate: '物理耐性',
			MagicalResistance_Rate: '魔法耐性',
			AilmentResistance_Rate: '異常耐性',

			// その他戦闘系
			Aggro_Rate: 'ヘイト',
			RevivalTime_Rate: '復帰短縮',
			ItemCooldown: '道具速度',

			// 自然回復系
			NaturalHPRecovery_Rate: 'HP自然回復',
			NaturalHPRecovery: 'HP自然回復',
			NaturalMPRecovery_Rate: 'MP自然回復',
			NaturalMPRecovery: 'MP自然回復',

			// 特殊系
			ArmorBreak_Rate: '防御崩し',
			Anticipate_Rate: '先読み',
			GuardPower_Rate: 'Guard力',
			GuardRecharge_Rate: 'Guard回復',
			AvoidRecharge_Rate: 'Avoid回復',

			// ステータス連動攻撃力
			ATK_STR_Rate: 'ATK+(STR)',
			ATK_INT_Rate: 'ATK+(INT)',
			ATK_VIT_Rate: 'ATK+(VIT)',
			ATK_AGI_Rate: 'ATK+(AGI)',
			ATK_DEX_Rate: 'ATK+(DEX)',
			MATK_STR_Rate: 'MATK+(STR)',
			MATK_INT_Rate: 'MATK+(INT)',
			MATK_VIT_Rate: 'MATK+(VIT)',
			MATK_AGI_Rate: 'MATK+(AGI)',
			MATK_DEX_Rate: 'MATK+(DEX)',

			// 属性耐性
			FireResistance_Rate: '火耐性',
			WaterResistance_Rate: '水耐性',
			WindResistance_Rate: '風耐性',
			EarthResistance_Rate: '地耐性',
			LightResistance_Rate: '光耐性',
			DarkResistance_Rate: '闇耐性',
			NeutralResistance_Rate: '無耐性',

			// ダメージ軽減系
			LinearReduction_Rate: '直線軽減',
			RushReduction_Rate: '突進軽減',
			BulletReduction_Rate: '弾丸軽減',
			ProximityReduction_Rate: '周囲軽減',
			AreaReduction_Rate: '範囲軽減',
			FloorTrapReduction_Rate: '痛床軽減',
			MeteorReduction_Rate: '隕石軽減',
			BladeReduction_Rate: '射刃軽減',
			SuctionReduction_Rate: '吸引軽減',
			ExplosionReduction_Rate: '爆発軽減',

			// バリア系
			PhysicalBarrier: '物理バリア',
			MagicalBarrier: '魔法バリア',
			FractionalBarrier: '割合バリア',
			BarrierCooldown_Rate: 'バリア速度',

			// 追撃系
			PhysicalFollowup_Rate: '物理追撃',
			MagicalFollowup_Rate: '魔法追撃',
		}

		return Object.entries(equipment.properties)
			.filter(([_, value]) => value !== 0)
			.map(([key, value]) => {
				// マッピングから日本語名を取得、なければ元のキーを使用
				const propName = propertyNameMap[key] || key

				// %系プロパティかどうかを判定
				const isPercentage = key.endsWith('_Rate')
				const suffix = isPercentage ? '%' : ''

				return {
					text: `${propName}${value > 0 ? '+' : ''}${value}${suffix}`,
					isNegative: value < 0,
				}
			})
			.slice(0, 8) // 最大8つまで表示
	}

	return (
		<div
			onClick={onClick}
			className={`
				relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md w-full max-w-[100%] sm:max-w-[260px]
				${
					isSelected
						? 'border-blue-500 bg-blue-50 shadow-md'
						: 'border-gray-200 bg-white hover:border-gray-300'
				}
			`}
		>
			{/* お気に入りボタン - 右下に絶対配置 */}
			{showFavoriteButton && (
				<button
					type="button"
					onClick={handleFavoriteClick}
					className={`
						absolute bottom-2 right-2 p-1.5 rounded-full transition-all duration-200 hover:scale-110 z-10 cursor-pointer
						${
							isFavorite
								? 'text-red-500 hover:text-red-600'
								: 'text-gray-300 hover:text-red-400'
						}
					`}
					aria-label={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
				>
					<svg
						className="w-5 h-5"
						fill={isFavorite ? 'currentColor' : 'none'}
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<title>{isFavorite ? 'お気に入り済み' : 'お気に入りに追加'}</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={isFavorite ? 0 : 2}
							d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
						/>
					</svg>
				</button>
			)}

			{/* 装備名と選択マーク */}
			<div className="flex justify-between items-center mb-1 sm:mb-2">
				<h3 className="font-semibold text-gray-900">{equipment.name}</h3>
				{/* 選択状態のチェックマーク */}
				{isSelected && (
					<div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center ml-2">
						<svg
							className="w-4 h-4 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>
				)}
			</div>

			{/* ダメージ差分表示 - 装備名の下に配置 */}
			{showDamageDifference && slotInfo && !isSelected && (
				<div className="mb-1 sm:mb-2">
					{(() => {
						try {
							return (
								<DamageDifferenceDisplayCorrect
									item={equipment}
									slotInfo={slotInfo}
									size="sm"
									className="inline-block"
									options={{ debug: false }}
								/>
							)
						} catch {
							return (
								<div className="bg-red-100 text-red-600 text-xs p-1 rounded">
									Error
								</div>
							)
						}
					})()}
				</div>
			)}

			{/* 基本ステータス */}
			{formatBaseStats() && (
				<div className="text-sm text-blue-600 mb-2 font-medium">
					{formatBaseStats()}
				</div>
			)}

			{/* プロパティ */}
			{getPropertyList().length > 0 && (
				<div className="text-sm text-gray-700 mb-2 min-h-[1.25rem] flex flex-wrap gap-x-3 gap-y-1">
					{getPropertyList().map((property) => (
						<span
							key={property.text}
							className={property.isNegative ? 'text-red-500' : ''}
						>
							{property.text}
						</span>
					))}
				</div>
			)}

			{/* 条件付き効果 */}
			{equipment.conditionalEffects &&
				equipment.conditionalEffects.length > 0 && (
					<div className="text-sm text-blue-600 space-y-1 mb-2">
						{equipment.conditionalEffects.map((effect, index) => {
							const { conditionText, effectTexts } =
								formatConditionalEffect(effect)
							return (
								<div key={`${equipment.id}-condition-${index}`}>
									<div className="flex flex-wrap gap-1">
										<div className="">{conditionText}：</div>
										{effectTexts.length > 1 ? (
											<div className="flex flex-wrap gap-1">
												{effectTexts.map((effectText, effectIndex) => (
													<div
														key={`${equipment.id}-effect-${index}-${effectIndex}`}
													>
														{effectText}
														{effectIndex < effectTexts.length - 1 && ' '}
													</div>
												))}
											</div>
										) : (
											effectTexts.map((effectText, effectIndex) => (
												<div
													key={`${equipment.id}-effect-${index}-${effectIndex}`}
												>
													{effectText}
												</div>
											))
										)}
									</div>
								</div>
							)
						})}
					</div>
				)}

			{/* 説明 */}
			{equipment.description && (
				<div className="text-xs text-gray-500 line-clamp-2 mb-1">
					{equipment.description}
				</div>
			)}

			{/* 入手方法 */}
			{equipment.source && (
				<div className="text-xs text-gray-400">入手: {equipment.source}</div>
			)}
		</div>
	)
}
