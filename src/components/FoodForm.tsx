'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { foodFormSchema } from '@/schemas/food'
import type { FoodFormData, FoodType } from '@/types/calculator'

interface FoodFormProps {
	food: FoodFormData
	onFoodChange: (food: FoodFormData) => void
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
	const {
		register,
		watch,
		setValue,
		formState: { errors },
	} = useForm<FoodFormData>({
		resolver: zodResolver(foodFormSchema),
		defaultValues: food,
		mode: 'onChange',
	})

	// フォームの値を監視し、変更時にコールバックを呼び出す
	React.useEffect(() => {
		const subscription = watch((value, { name }) => {
			if (name && value) {
				onFoodChange(value as FoodFormData)
			}
		})
		return () => subscription.unsubscribe()
	}, [watch, onFoodChange])

	// 現在の値を取得（UI表示用）
	const watchedValues = watch()

	// 料理選択が変更されたときの処理
	const handleFoodChange = (
		slotName: keyof FoodFormData,
		newFood: FoodType,
	) => {
		setValue(`${slotName}.selectedFood`, newFood)
		// 「なし」が選択された場合はレベルを0に設定
		if (newFood === 'none') {
			setValue(`${slotName}.level`, 0)
		} else {
			// 「なし」以外が選択された場合で現在のレベルが0の場合は1に設定
			const currentLevel = watchedValues[slotName].level
			if (currentLevel === 0) {
				setValue(`${slotName}.level`, 1)
			}
		}
	}

	// 料理スロットコンポーネント
	const FoodSlot = ({
		slotName,
		slotLabel,
	}: {
		slotName: keyof FoodFormData
		slotLabel: string
	}) => {
		const currentFood = watchedValues[slotName].selectedFood
		const showLevelInput = currentFood !== 'none'

		return (
			<div className="flex flex-col gap-2">
				<div className="text-sm font-medium text-gray-700">{slotLabel}</div>
				<div className="flex items-center gap-4">
					{/* 料理選択 */}
					<div className="flex-1">
						<select
							{...register(`${slotName}.selectedFood`)}
							onChange={(e) =>
								handleFoodChange(slotName, e.target.value as FoodType)
							}
							className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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

					{/* レベル入力 */}
					{showLevelInput ? (
						<div className="w-20">
							<div className="block text-xs text-gray-600">レベル</div>
							<input
								type="number"
								min="1"
								max="10"
								{...register(`${slotName}.level`, { valueAsNumber: true })}
								className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
							/>
							{errors[slotName]?.level && (
								<p className="mt-1 text-xs text-red-600">
									{errors[slotName]?.level?.message}
								</p>
							)}
						</div>
					) : (
						<div className="w-20">
							<div className="block text-xs text-gray-400">レベル</div>
							<div className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-center text-sm text-gray-400">
								-
							</div>
						</div>
					)}
				</div>
			</div>
		)
	}

	return (
		<div className="rounded-lg border border-gray-200 bg-white p-6">
			<h3 className="mb-4 text-lg font-semibold text-gray-900">料理設定</h3>
			<div className="space-y-4">
				<FoodSlot slotName="slot1" slotLabel="スロット1" />
				<FoodSlot slotName="slot2" slotLabel="スロット2" />
				<FoodSlot slotName="slot3" slotLabel="スロット3" />
				<FoodSlot slotName="slot4" slotLabel="スロット4" />
				<FoodSlot slotName="slot5" slotLabel="スロット5" />
			</div>
		</div>
	)
}
