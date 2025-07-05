/**
 * ダメージ差分表示コンポーネント
 * アイテム選択時のダメージ差分を視覚的に表示
 */

'use client'

import type { 
	PreviewItem, 
	SlotInfo, 
	DamageDifferenceOptions 
} from '@/types/damagePreview'
import { useDamageDifference } from '@/hooks/useDamageDifference'

interface DamageDifferenceDisplayProps {
	item: PreviewItem
	slotInfo: SlotInfo
	className?: string
	options?: DamageDifferenceOptions
	/**
	 * 表示モード
	 * - compact: 数値のみ表示
	 * - detailed: 詳細情報も表示
	 */
	mode?: 'compact' | 'detailed'
	/**
	 * サイズ
	 */
	size?: 'sm' | 'md' | 'lg'
}

/**
 * ダメージ差分表示コンポーネント
 */
export function DamageDifferenceDisplay({ 
	item, 
	slotInfo, 
	className = '',
	options = {},
	mode = 'compact',
	size = 'sm'
}: DamageDifferenceDisplayProps) {
	const { difference, isCalculating, error } = useDamageDifference(item, slotInfo, options)
	
	// サイズ別のクラス
	const sizeClasses = {
		sm: 'text-xs',
		md: 'text-sm',
		lg: 'text-base'
	}
	
	// 計算中の表示
	if (isCalculating) {
		return (
			<div className={`${sizeClasses[size]} text-gray-400 ${className}`}>
				{mode === 'detailed' ? '計算中...' : '...'}
			</div>
		)
	}
	
	// エラー時の表示
	if (error) {
		return (
			<div className={`${sizeClasses[size]} text-gray-400 ${className}`}>
				---
			</div>
		)
	}
	
	// 差分値のフォーマット
	const formatDifference = (diff: number): string => {
		if (diff === 0) return '±0'
		return diff > 0 ? `+${diff.toLocaleString()}` : diff.toLocaleString()
	}
	
	// 色クラスの決定
	const getColorClass = (diff: number): string => {
		if (diff > 0) return 'text-green-600 dark:text-green-400'
		if (diff < 0) return 'text-red-600 dark:text-red-400'
		return 'text-gray-400 dark:text-gray-500'
	}
	
	// アイコンの決定
	const getIcon = (diff: number): string => {
		if (diff > 0) return '↗'
		if (diff < 0) return '↘'
		return '→'
	}
	
	if (mode === 'detailed') {
		return (
			<div className={`flex items-center gap-1 ${className}`}>
				<span className={`${sizeClasses[size]} ${getColorClass(difference)}`}>
					{getIcon(difference)}
				</span>
				<span className={`${sizeClasses[size]} font-medium ${getColorClass(difference)}`}>
					{formatDifference(difference)}
				</span>
			</div>
		)
	}
	
	// compact モード
	return (
		<div className={`${sizeClasses[size]} font-medium ${getColorClass(difference)} ${className}`}>
			{formatDifference(difference)}
		</div>
	)
}

/**
 * バッジ形式でのダメージ差分表示
 */
interface DamageDifferenceBadgeProps {
	item: PreviewItem
	slotInfo: SlotInfo
	className?: string
	options?: DamageDifferenceOptions
}

export function DamageDifferenceBadge({ 
	item, 
	slotInfo, 
	className = '',
	options = {}
}: DamageDifferenceBadgeProps) {
	const { difference, isCalculating, error } = useDamageDifference(item, slotInfo, options)
	
	// 計算中またはエラー時は非表示
	if (isCalculating || error || difference === 0) {
		return null
	}
	
	const formatDifference = (diff: number): string => {
		return diff > 0 ? `+${diff.toLocaleString()}` : diff.toLocaleString()
	}
	
	const getBadgeClass = (diff: number): string => {
		const baseClass = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'
		if (diff > 0) {
			return `${baseClass} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`
		}
		return `${baseClass} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`
	}
	
	return (
		<span className={`${getBadgeClass(difference)} ${className}`}>
			{formatDifference(difference)}
		</span>
	)
}

/**
 * プログレスバー形式でのダメージ差分表示
 */
interface DamageDifferenceProgressProps {
	item: PreviewItem
	slotInfo: SlotInfo
	maxValue?: number // 比較用の最大値
	className?: string
	options?: DamageDifferenceOptions
}

export function DamageDifferenceProgress({ 
	item, 
	slotInfo, 
	maxValue = 10000, // デフォルト最大値
	className = '',
	options = {}
}: DamageDifferenceProgressProps) {
	const { difference, isCalculating, error } = useDamageDifference(item, slotInfo, options)
	
	if (isCalculating || error) {
		return (
			<div className={`w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 ${className}`}>
				<div className="bg-gray-400 h-2 rounded-full animate-pulse w-1/3" />
			</div>
		)
	}
	
	// パーセンテージ計算（±100%の範囲）
	const percentage = Math.min(Math.abs(difference) / maxValue * 100, 100)
	const isPositive = difference > 0
	
	return (
		<div className={`w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 ${className}`}>
			<div 
				className={`h-2 rounded-full transition-all duration-300 ${
					isPositive 
						? 'bg-green-600 dark:bg-green-400' 
						: 'bg-red-600 dark:bg-red-400'
				}`}
				style={{ width: `${percentage}%` }}
			/>
		</div>
	)
}

/**
 * ツールチップ付きダメージ差分表示
 */
interface DamageDifferenceTooltipProps {
	item: PreviewItem
	slotInfo: SlotInfo
	children: React.ReactNode
	className?: string
	options?: DamageDifferenceOptions
}

export function DamageDifferenceTooltip({ 
	item, 
	slotInfo, 
	children,
	className = '',
	options = {}
}: DamageDifferenceTooltipProps) {
	const { difference, currentDamage, simulatedDamage, isCalculating, error } = useDamageDifference(item, slotInfo, options)
	
	const formatNumber = (num: number) => num.toLocaleString()
	
	const getTooltipContent = () => {
		if (isCalculating) return '計算中...'
		if (error) return 'エラー: 計算できませんでした'
		
		return `現在: ${formatNumber(currentDamage)} → 変更後: ${formatNumber(simulatedDamage)}`
	}
	
	return (
		<div className={`group relative ${className}`} title={getTooltipContent()}>
			{children}
			
			{/* ツールチップ */}
			<div className="invisible group-hover:visible absolute z-10 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg dark:bg-gray-700 bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap">
				{getTooltipContent()}
				<div className="tooltip-arrow" />
			</div>
		</div>
	)
}

/**
 * 複数アイテム用のダメージ差分比較表示
 */
interface DamageDifferenceComparisonProps {
	items: Array<{ item: PreviewItem; slotInfo: SlotInfo; label?: string }>
	className?: string
	options?: DamageDifferenceOptions
}

export function DamageDifferenceComparison({ 
	items, 
	className = '',
	options = {}
}: DamageDifferenceComparisonProps) {
	const differences = items.map(({ item, slotInfo }) => 
		useDamageDifference(item, slotInfo, options)
	)
	
	const maxDifference = Math.max(...differences.map(d => Math.abs(d.difference)))
	
	return (
		<div className={`space-y-2 ${className}`}>
			{items.map(({ item, label }, index) => {
				const { difference } = differences[index]
				const percentage = maxDifference > 0 ? Math.abs(difference) / maxDifference * 100 : 0
				
				return (
					<div key={item.id} className="flex items-center justify-between">
						<span className="text-sm truncate flex-1">
							{label || item.name}
						</span>
						<div className="flex items-center gap-2">
							<div className="w-16 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
								<div 
									className={`h-2 rounded-full ${
										difference > 0 
											? 'bg-green-600 dark:bg-green-400' 
											: 'bg-red-600 dark:bg-red-400'
									}`}
									style={{ width: `${percentage}%` }}
								/>
							</div>
							<span className={`text-xs font-medium w-16 text-right ${
								difference > 0 
									? 'text-green-600 dark:text-green-400' 
									: 'text-red-600 dark:text-red-400'
							}`}>
								{difference > 0 ? `+${difference.toLocaleString()}` : difference.toLocaleString()}
							</span>
						</div>
					</div>
				)
			})}
		</div>
	)
}