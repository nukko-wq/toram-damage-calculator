'use client'

import { useState, useCallback } from 'react'
import type { PresetBuffItem } from '@/types/calculator'
import { DamageDifferenceDisplayCorrect } from '@/components/common/DamageDifferenceDisplayCorrect'
import type { SlotInfo } from '@/types/damagePreview'
import { BuffItemFavoritesManager } from '@/utils/buffItemFavorites'

interface BuffItemCardProps {
	buffItem: PresetBuffItem
	isSelected: boolean
	onClick: () => void
	// ダメージ差分表示用の追加プロパティ
	showDamageDifference?: boolean
	slotInfo?: SlotInfo
	// お気に入り機能用の新規プロパティ
	showFavoriteButton?: boolean
	onFavoriteChange?: (buffItemId: string, isFavorite: boolean) => void
}

export default function BuffItemCard({
	buffItem,
	isSelected,
	onClick,
	showDamageDifference = false,
	slotInfo,
	showFavoriteButton = true,
	onFavoriteChange,
}: BuffItemCardProps) {
	const [isFavorite, setIsFavorite] = useState(() =>
		BuffItemFavoritesManager.isFavorite(buffItem.id),
	)

	const handleFavoriteClick = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation() // バフアイテム選択イベントの阻止

			const newFavoriteState = !isFavorite
			const success = BuffItemFavoritesManager.setFavorite(
				buffItem.id,
				newFavoriteState,
			)

			if (success) {
				setIsFavorite(newFavoriteState)
				onFavoriteChange?.(buffItem.id, newFavoriteState)
			}
		},
		[buffItem.id, isFavorite, onFavoriteChange],
	)
	const formatProperties = () => {
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

			// 速度系
			AttackSpeed_Rate: '攻撃速度',
			AttackSpeed: '攻撃速度',
			CastingSpeed_Rate: '詠唱速度',
			CastingSpeed: '詠唱速度',

			// 耐性系
			PhysicalResistance_Rate: '物理耐性',
			MagicalResistance_Rate: '魔法耐性',

			// 属性耐性
			FireResistance_Rate: '火耐性',
			WaterResistance_Rate: '水耐性',
			WindResistance_Rate: '風耐性',
			EarthResistance_Rate: '地耐性',
			LightResistance_Rate: '光耐性',
			DarkResistance_Rate: '闇耐性',
			NeutralResistance_Rate: '無耐性',
		}

		const props = Object.entries(buffItem.properties)
			.filter(([_, value]) => value !== 0)
			.map(([key, value]) => {
				// マッピングから日本語名を取得、なければ元のキーを使用
				const propName = propertyNameMap[key] || key

				// %系プロパティかどうかを判定
				const isPercentage = key.endsWith('_Rate')
				const suffix = isPercentage ? '%' : ''

				return `${propName}${value > 0 ? '+' : ''}${value}${suffix}`
			})
			.slice(0, 4) // 最大4つまで表示

		// 2つずつのグループに分ける
		const rows: string[] = []
		for (let i = 0; i < props.length; i += 2) {
			const row = props.slice(i, i + 2).join(', ')
			rows.push(row)
		}

		return rows
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

			{/* バフアイテム名と選択マーク */}
			<div className="flex justify-between items-center mb-1 sm:mb-2">
				<h3 className="font-semibold text-gray-900">{buffItem.name}</h3>
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

			{/* ダメージ差分表示 - バフアイテム名の下に配置 */}
			{showDamageDifference && slotInfo && !isSelected && (
				<div className="mb-1 sm:mb-2">
					{(() => {
						try {
							return (
								<DamageDifferenceDisplayCorrect
									item={{
										...buffItem,
										isPreset: true,
										isFavorite: false,
										createdAt: new Date().toISOString(),
										updatedAt: new Date().toISOString(),
									}}
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

			{/* プロパティ */}
			{formatProperties().length > 0 && (
				<div className="text-sm text-gray-700 mb-2 min-h-[1.25rem] flex flex-wrap gap-x-3 gap-y-1 pr-6">
					{formatProperties().map((row) => (
						<span key={row}>{row}</span>
					))}
				</div>
			)}
		</div>
	)
}
