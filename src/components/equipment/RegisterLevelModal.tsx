'use client'

import { useEffect, useState } from 'react'
import type { RegisterEffect } from '@/types/calculator'

interface RegisterLevelModalProps {
	effect: RegisterEffect
	isOpen: boolean
	onClose: () => void
	onUpdate: (effectId: string, level: number, partyMembers?: number) => void
}

export function RegisterLevelModal({
	effect,
	isOpen,
	onClose,
	onUpdate,
}: RegisterLevelModalProps) {
	const [level, setLevel] = useState(effect.level)
	const [partyMembers, setPartyMembers] = useState(effect.partyMembers || 3)

	const isFateCompanionship = effect.type === 'fateCompanionship'

	// エフェクトが変更されたときに値をリセット
	useEffect(() => {
		setLevel(effect.level)
		setPartyMembers(effect.partyMembers || 3)
	}, [effect])

	const handleUpdate = () => {
		if (isFateCompanionship) {
			// 運命共同体は常にレベル1で固定
			onUpdate(effect.id, 1, partyMembers)
		} else {
			onUpdate(effect.id, level)
		}
	}

	const handleLevelChange = (value: string) => {
		const numValue = Number.parseInt(value, 10)
		if (
			!Number.isNaN(numValue) &&
			numValue >= 1 &&
			numValue <= effect.maxLevel
		) {
			setLevel(numValue)
		}
	}

	const handlePartyMembersChange = (value: string) => {
		const numValue = Number.parseInt(value, 10)
		if (!Number.isNaN(numValue) && numValue >= 1 && numValue <= 3) {
			setPartyMembers(numValue)
		}
	}

	if (!isOpen) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* オーバーレイ */}
			<div className="fixed inset-0 bg-black/50" onClick={onClose} />

			{/* モーダルコンテンツ */}
			<div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
				<h2 className="text-xl font-bold mb-4">{effect.name}</h2>

				<div className="space-y-4">
					{/* レベル設定（運命共同体以外のみ表示） */}
					{!isFateCompanionship && (
						<div className="space-y-2">
							<label
								htmlFor="level"
								className="block text-sm font-medium text-gray-700"
							>
								レベル (1-{effect.maxLevel})
							</label>
							<input
								id="level"
								type="number"
								min={1}
								max={effect.maxLevel}
								value={level}
								onChange={(e) => handleLevelChange(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					)}

					{/* 運命共同体専用：パーティメンバー数のみ */}
					{isFateCompanionship && (
						<div className="space-y-2">
							<label
								htmlFor="partyMembers"
								className="block text-sm font-medium text-gray-700"
							>
								パーティメンバー数 (1-3)
							</label>
							<input
								id="partyMembers"
								type="number"
								min={1}
								max={3}
								value={partyMembers}
								onChange={(e) => handlePartyMembersChange(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
							<p className="text-sm text-gray-500">
								自分以外のパーティメンバー数を設定してください
							</p>
						</div>
					)}
				</div>

				<div className="flex justify-end space-x-3 mt-6">
					<button
						onClick={onClose}
						className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors cursor-pointer"
					>
						キャンセル
					</button>
					<button
						onClick={handleUpdate}
						className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
					>
						設定
					</button>
				</div>
			</div>
		</div>
	)
}
