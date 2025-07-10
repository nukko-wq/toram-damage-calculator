/**
 * 正しいダメージ計算エンジンを使ったダメージ差分表示コンポーネント
 */

'use client'

import type {
	PreviewItem,
	SlotInfo,
	DamageDifferenceOptions,
} from '@/types/damagePreview'
import { useDamageDifferenceCorrect } from '@/hooks/useDamageDifferenceCorrect'

interface DamageDifferenceDisplayCorrectProps {
	item: PreviewItem
	slotInfo: SlotInfo
	className?: string
	options?: DamageDifferenceOptions
	size?: 'sm' | 'md' | 'lg'
}

/**
 * 正しいダメージ計算エンジンを使ったダメージ差分表示コンポーネント
 */
export function DamageDifferenceDisplayCorrect({
	item,
	slotInfo,
	className = '',
	options = {},
	size = 'sm',
}: DamageDifferenceDisplayCorrectProps) {
	const { difference, isCalculating, error } = useDamageDifferenceCorrect(
		item,
		slotInfo,
		options,
	)

	// サイズ別のクラス
	const sizeClasses = {
		sm: 'text-xs',
		md: 'text-sm',
		lg: 'text-base',
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

	// ラベル色クラスの決定（「ダメージ：」部分）
	const getLabelColorClass = (diff: number): string => {
		if (diff > 0) return 'text-blue-500'
		if (diff < 0) return 'text-red-500'
		return 'text-gray-400'
	}

	// 値の色クラスの決定
	const getValueColorClass = (diff: number): string => {
		if (diff > 0) return 'text-blue-600'
		if (diff < 0) return 'text-red-600'
		return 'text-gray-500'
	}

	return (
		<div className={`${sizeClasses[size]} font-medium ${className}`}>
			<span className={`${getLabelColorClass(difference)} mr-3 text-sm`}>
				ダメージ：
			</span>
			<span className={`${getValueColorClass(difference)} text-sm`}>
				{formatDifference(difference)}
			</span>
		</div>
	)
}

/**
 * バッジ形式での正しいダメージ差分表示
 */
interface DamageDifferenceBadgeCorrectProps {
	item: PreviewItem
	slotInfo: SlotInfo
	className?: string
	options?: DamageDifferenceOptions
}

export function DamageDifferenceBadgeCorrect({
	item,
	slotInfo,
	className = '',
	options = {},
}: DamageDifferenceBadgeCorrectProps) {
	const { difference, isCalculating, error } = useDamageDifferenceCorrect(
		item,
		slotInfo,
		options,
	)

	// 計算中またはエラー時は非表示
	if (isCalculating || error || difference === 0) {
		return null
	}

	const formatDifference = (diff: number): string => {
		return diff > 0 ? `+${diff.toLocaleString()}` : diff.toLocaleString()
	}

	const getBadgeClass = (diff: number): string => {
		const baseClass =
			'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'
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
