/**
 * ダメージ差分表示コンポーネント（シンプル版）
 * 型エラーを避けつつ基本機能を提供
 */

'use client'

import type { 
	PreviewItem, 
	SlotInfo, 
	DamageDifferenceOptions 
} from '@/types/damagePreview'
import { useDamageDifferenceSimple } from '@/hooks/useDamageDifferenceSimple'

interface DamageDifferenceDisplaySimpleProps {
	item: PreviewItem
	slotInfo: SlotInfo
	className?: string
	options?: DamageDifferenceOptions
	size?: 'sm' | 'md' | 'lg'
}

/**
 * ダメージ差分表示コンポーネント（シンプル版）
 */
export function DamageDifferenceDisplaySimple({ 
	item, 
	slotInfo, 
	className = '',
	options = {},
	size = 'sm'
}: DamageDifferenceDisplaySimpleProps) {
	const { difference, isCalculating, error } = useDamageDifferenceSimple(item, slotInfo, options)
	
	// デバッグモード時のみログ出力
	if (options.debug) {
		console.log('🎨 DamageDifferenceDisplaySimple render:', {
			itemName: item.name,
			difference,
			isCalculating,
			error: !!error,
			className,
			size
		})
	}
	
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
				...
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
	
	return (
		<div className={`${sizeClasses[size]} font-medium ${getColorClass(difference)} ${className}`}>
			{formatDifference(difference)}
		</div>
	)
}

/**
 * バッジ形式でのダメージ差分表示（シンプル版）
 */
interface DamageDifferenceBadgeSimpleProps {
	item: PreviewItem
	slotInfo: SlotInfo
	className?: string
	options?: DamageDifferenceOptions
}

export function DamageDifferenceBadgeSimple({ 
	item, 
	slotInfo, 
	className = '',
	options = {}
}: DamageDifferenceBadgeSimpleProps) {
	const { difference, isCalculating, error } = useDamageDifferenceSimple(item, slotInfo, options)
	
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