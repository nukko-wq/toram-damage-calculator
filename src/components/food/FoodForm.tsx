'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { foodFormSchema } from '@/schemas/food'
import type { FoodFormData, FoodType } from '@/types/calculator'
import { useCalculatorStore } from '@/stores'

interface FoodFormProps {
	// Zustand移行後は不要（後方互換性のため残存）
	food?: FoodFormData
	onFoodChange?: (food: FoodFormData) => void
}

// 料理の表示名マッピング
const FOOD_DISPLAY_NAMES: Record<FoodType, string> = {
	none: 'なし',
	okaka_onigiri: 'おかかおにぎり(STR)',
	sake_onigiri: '鮭おにぎり(DEX)',
	umeboshi_onigiri: '梅干しおにぎり(INT)',
	mentaiko_onigiri: '明太子おにぎり(AGI)',
	tuna_mayo_onigiri: 'ツナマヨおにぎり(VIT)',
	shoyu_ramen: 'しょうゆラーメン(命中)',
	zokusei_pasta: '属性パスタ(属性有利共通)',
	takoyaki: 'たこ焼き(クリ率)',
	yakisoba: '焼きそば(攻撃MP回復)',
	golden_fried_rice: '黄金チャーハン(HP)',
	ankake_fried_rice: 'あんかけチャーハン(MP)',
	margherita_pizza: 'マルゲリータピザ(武器ATK+)',
	diabola_pizza: 'ディアボラピザ(ATK+)',
	seafood_pizza: 'シーフードピザ(MATK+)',
	beef_stew: 'ビーフシチュー(ヘイト+)',
	white_stew: 'ホワイトシチュー(ヘイト-)',
	beef_burger: 'ビーフバーガー(物理耐性)',
	fish_burger: 'フィッシュバーガー(魔法耐性)',
}

// 料理選択オプション
const FOOD_OPTIONS: { value: FoodType; label: string }[] = Object.entries(
	FOOD_DISPLAY_NAMES,
).map(([value, label]) => ({
	value: value as FoodType,
	label,
}))

export default function FoodForm({ food, onFoodChange }: FoodFormProps) {
	// Zustandストアから料理データを取得
	const storeFood = useCalculatorStore((state) => state.data.food)
	const updateFood = useCalculatorStore((state) => state.updateFood)

	// Zustandストアの値を使用（完全移行）
	const effectiveFood = storeFood
	const {
		register,
		watch,
		setValue,
		formState: { errors },
	} = useForm<FoodFormData>({
		resolver: zodResolver(foodFormSchema),
		values: effectiveFood,
		mode: 'onChange',
	})

	// フォームの値を監視し、変更時にコールバックを呼び出す
	const [isInitialized, setIsInitialized] = React.useState(false)

	React.useEffect(() => {
		// valuesプロパティを使用しているため、データ変更時の処理を軽量化
		setIsInitialized(false)
		const timer = setTimeout(() => setIsInitialized(true), 30)
		return () => clearTimeout(timer)
	}, [effectiveFood])

	React.useEffect(() => {
		const subscription = watch((value, { name, type }) => {
			// 初期化中やプログラム的な変更は無視
			if (!isInitialized || !name || !value || type !== 'change') {
				return
			}

			// Zustandストアを更新
			console.log('FoodForm: Updating food data:', value)
			updateFood(value as FoodFormData)

			// 後方互換性のため従来のonChangeも呼び出し
			if (onFoodChange) {
				onFoodChange(value as FoodFormData)
			}
		})
		return () => subscription.unsubscribe()
	}, [watch, onFoodChange, isInitialized, updateFood])

	// 現在の値を取得（UI表示用）
	const watchedValues = watch()

	// 料理選択が変更されたときの処理
	const handleFoodChange = (
		slotName: keyof FoodFormData,
		newFood: FoodType,
	) => {
		console.log(`FoodForm: Changing ${slotName} to ${newFood}`)
		setValue(`${slotName}.selectedFood`, newFood, { shouldValidate: true })
		// 「なし」が選択された場合はレベルを0に設定
		if (newFood === 'none') {
			setValue(`${slotName}.level`, 0, { shouldValidate: true })
		} else {
			// 「なし」以外が選択された場合は自動的に10に設定
			setValue(`${slotName}.level`, 10, { shouldValidate: true })
		}
		
		// 即座にストアを更新
		const currentValues = watch()
		const updatedValues = {
			...currentValues,
			[slotName]: {
				selectedFood: newFood,
				level: newFood === 'none' ? 0 : 10
			}
		}
		console.log('FoodForm: Manually updating store with:', updatedValues)
		updateFood(updatedValues as FoodFormData)
	}

	// レベル選択オプション生成
	const levelOptions = Array.from({ length: 10 }, (_, i) => ({
		value: i + 1,
		label: `${i + 1}`,
	}))

	// 料理スロットコンポーネント
	const FoodSlot = ({
		slotName,
		slotLabel,
	}: {
		slotName: keyof FoodFormData
		slotLabel: string
	}) => {
		const currentFood = watchedValues[slotName].selectedFood
		const showLevelSelect = currentFood !== 'none'

		return (
			<div className="flex items-center gap-2">
				{/* スロットラベル */}
				<div className="text-xs font-medium text-gray-700 w-10 flex-shrink-0">
					{slotLabel}:
				</div>

				{/* 料理選択 */}
				<div className="flex-1">
					<select
						{...register(`${slotName}.selectedFood`)}
						onChange={(e) =>
							handleFoodChange(slotName, e.target.value as FoodType)
						}
						className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						aria-label={`${slotLabel}の料理選択`}
					>
						{FOOD_OPTIONS.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
					{errors[slotName]?.selectedFood && (
						<p className="mt-1 text-xs text-red-600">
							{errors[slotName]?.selectedFood?.message}
						</p>
					)}
				</div>

				{/* レベル選択 */}
				{showLevelSelect && (
					<div className="w-12">
						<select
							{...register(`${slotName}.level`, { valueAsNumber: true })}
							className="w-full rounded-md border border-gray-300 px-1 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
							aria-label={`${slotLabel}のレベル選択`}
						>
							{levelOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
						{errors[slotName]?.level && (
							<p className="mt-1 text-xs text-red-600">
								{errors[slotName]?.level?.message}
							</p>
						)}
					</div>
				)}
			</div>
		)
	}

	return (
		<div className="rounded-lg border border-gray-200 bg-white p-4 md:col-start-1 md:col-end-5 md:row-start-4 md:row-end-5 lg:col-start-1 lg:col-end-2 lg:row-start-5 lg:row-end-6">
			<h3 className="mb-3 text-base font-semibold text-gray-900">料理設定</h3>
			<div className="space-y-2">
				<FoodSlot slotName="slot1" slotLabel="1つ目" />
				<FoodSlot slotName="slot2" slotLabel="2つ目" />
				<FoodSlot slotName="slot3" slotLabel="3つ目" />
				<FoodSlot slotName="slot4" slotLabel="4つ目" />
				<FoodSlot slotName="slot5" slotLabel="5つ目" />
			</div>
		</div>
	)
}
