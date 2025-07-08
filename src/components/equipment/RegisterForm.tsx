'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerFormDataSchema } from '@/schemas/register'
import { useCalculatorStore } from '@/stores/calculatorStore'
import type { RegisterFormData } from '@/types/calculator'
import { RegisterEffectItem } from './RegisterEffectItem'
import { RegisterLevelModal } from './RegisterLevelModal'

interface RegisterFormProps {
	className?: string
}

export function RegisterForm({ className }: RegisterFormProps) {
	const { data, updateRegister } = useCalculatorStore()
	const [selectedEffectId, setSelectedEffectId] = useState<string | null>(null)

	const form = useForm<RegisterFormData>({
		resolver: zodResolver(registerFormDataSchema),
		defaultValues: data.register,
		mode: 'onChange',
	})

	const watchedData = form.watch()

	// フォームデータが変更されたときにストアを更新
	const handleFormChange = () => {
		const formData = form.getValues()
		updateRegister(formData)
	}

	// エフェクトのオン/オフ切り替え
	const handleToggleEffect = (effectId: string, enabled: boolean) => {
		const updatedEffects = watchedData.effects.map((effect) =>
			effect.id === effectId ? { ...effect, isEnabled: enabled } : effect,
		)

		form.setValue('effects', updatedEffects)
		updateRegister({ effects: updatedEffects })
	}

	// レベル設定モーダルを開く
	const handleOpenLevelModal = (effectId: string) => {
		setSelectedEffectId(effectId)
	}

	// レベル設定モーダルを閉じる
	const handleCloseLevelModal = () => {
		setSelectedEffectId(null)
	}

	// レベル更新
	const handleUpdateLevel = (
		effectId: string,
		level: number,
		partyMembers?: number,
	) => {
		const updatedEffects = watchedData.effects.map((effect) =>
			effect.id === effectId
				? {
						...effect,
						level,
						...(partyMembers !== undefined && { partyMembers }),
					}
				: effect,
		)

		form.setValue('effects', updatedEffects)
		updateRegister({ effects: updatedEffects })
		setSelectedEffectId(null)
	}

	const selectedEffect = selectedEffectId
		? watchedData.effects.find((effect) => effect.id === selectedEffectId)
		: null

	return (
		<div className={className}>
			<div className="space-y-6">
				{/* レジスタレット効果 */}
				<div>
					<h3 className="text-lg font-semibold mb-4 text-slate-700">
						レジスタレット効果
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						{watchedData.effects
							.filter(
								(effect) =>
									!['deliciousIngredientTrade', 'freshFruitTrade'].includes(
										effect.type,
									),
							)
							.map((effect) => (
								<RegisterEffectItem
									key={effect.id}
									effect={effect}
									onToggle={handleToggleEffect}
									onOpenLevelModal={handleOpenLevelModal}
								/>
							))}
					</div>
				</div>

				{/* ギルド料理効果 */}
				<div>
					<h3 className="text-lg font-semibold mb-4 text-slate-700">
						ギルド料理効果
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						{watchedData.effects
							.filter((effect) =>
								['deliciousIngredientTrade', 'freshFruitTrade'].includes(
									effect.type,
								),
							)
							.map((effect) => (
								<RegisterEffectItem
									key={effect.id}
									effect={effect}
									onToggle={handleToggleEffect}
									onOpenLevelModal={handleOpenLevelModal}
								/>
							))}
					</div>
				</div>
			</div>

			{/* レベル設定モーダル */}
			{selectedEffect && (
				<RegisterLevelModal
					effect={selectedEffect}
					isOpen={selectedEffectId !== null}
					onClose={handleCloseLevelModal}
					onUpdate={handleUpdateLevel}
				/>
			)}
		</div>
	)
}
