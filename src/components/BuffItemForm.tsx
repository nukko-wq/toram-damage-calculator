'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { buffItemFormDataSchema } from '@/schemas/buffItems'
import type { BuffItemFormData, BuffItemCategory } from '@/types/calculator'
import { useCalculatorStore } from '@/stores'
import { getBuffItemsByCategory } from '@/utils/buffItemDatabase'
import { buffItemCategoryNameMap } from '@/utils/buffItemDefaults'

interface BuffItemFormProps {
	// Zustand移行後は不要（後方互換性のため残存）
	buffItems?: BuffItemFormData
	onBuffItemsChange?: (buffItems: BuffItemFormData) => void
}

export default function BuffItemForm({
	buffItems,
	onBuffItemsChange,
}: BuffItemFormProps) {
	// Zustandストアからバフアイテムデータを取得
	const storeBuffItems = useCalculatorStore((state) => state.data.buffItems)
	const updateBuffItems = useCalculatorStore((state) => state.updateBuffItems)

	// Zustandストアの値を使用（完全移行）
	const effectiveBuffItems = storeBuffItems
	const {
		register,
		watch,
		formState: { errors },
	} = useForm<BuffItemFormData>({
		resolver: zodResolver(buffItemFormDataSchema),
		values: effectiveBuffItems,
		mode: 'onChange',
	})

	// フォームの値を監視し、変更時にコールバックを呼び出す
	const [isInitialized, setIsInitialized] = React.useState(false)

	React.useEffect(() => {
		// valuesプロパティを使用しているため、データ変更時の処理を軽量化
		setIsInitialized(false)
		const timer = setTimeout(() => setIsInitialized(true), 30)
		return () => clearTimeout(timer)
	}, [effectiveBuffItems])

	React.useEffect(() => {
		const subscription = watch((value, { name, type }) => {
			// 初期化中やプログラム的な変更は無視
			if (!isInitialized || !name || !value || type !== 'change') {
				return
			}

			// Zustandストアを更新
			updateBuffItems(value as BuffItemFormData)

			// 後方互換性のため従来のonChangeも呼び出し
			if (onBuffItemsChange) {
				onBuffItemsChange(value as BuffItemFormData)
			}
		})
		return () => subscription.unsubscribe()
	}, [watch, onBuffItemsChange, isInitialized, updateBuffItems])

	// バフアイテムカテゴリの定義（表示順序込み）
	const buffItemCategories: BuffItemCategory[] = [
		'physicalPower',
		'magicalPower',
		'physicalDefense',
		'magicalDefense',
		'elementalAttack',
		'elementalDefense',
		'speed',
		'casting',
		'mp',
		'hp',
		'accuracy',
		'evasion',
	]

	// バフアイテム選択コンポーネント
	const BuffItemSelect = ({
		category,
		categoryLabel,
	}: {
		category: BuffItemCategory
		categoryLabel: string
	}) => {
		const items = getBuffItemsByCategory(category)

		return (
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">
					{categoryLabel}
				</label>
				<select
					{...register(category)}
					className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
					aria-label={`${categoryLabel}のバフアイテム選択`}
				>
					<option value="">なし</option>
					{items.map((item) => (
						<option key={item.id} value={item.id}>
							{item.name}
						</option>
					))}
				</select>
				{errors[category] && (
					<p className="mt-1 text-xs text-red-600">
						{errors[category]?.message}
					</p>
				)}
			</div>
		)
	}

	return (
		<div className="rounded-lg border border-gray-200 bg-white p-4 col-start-2 col-end-4 row-start-5 row-end-6">
			<h3 className="mb-4 text-base font-semibold text-gray-900">
				バフアイテム設定
			</h3>

			{/* 12カテゴリのバフアイテム選択 */}
			<div className="grid grid-cols-2 gap-4">
				{buffItemCategories.map((category) => (
					<BuffItemSelect
						key={category}
						category={category}
						categoryLabel={buffItemCategoryNameMap[category]}
					/>
				))}
			</div>
		</div>
	)
}
