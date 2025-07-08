'use client'

import { useCallback, useMemo } from 'react'
import { useCalculatorStore } from '@/stores/calculatorStore'
import type { BuffSkillDefinition } from '@/types/buffSkill'

interface MultiParamModalProps {
	skill: BuffSkillDefinition
	isOpen: boolean
	onClose: () => void
}

export default function MultiParamModal({
	skill,
	isOpen,
	onClose,
}: MultiParamModalProps) {
	// Zustandストアから現在のスキル状態を取得
	const defaultState = useMemo(() => {
		if (skill.type === 'multiParam' && skill.multiParams) {
			return {
				isEnabled: false,
				level: skill.multiParams.param1.default,
				stackCount: skill.multiParams.param2?.default || 1,
				multiParam1: skill.multiParams.param1.default,
				multiParam2: skill.multiParams.param2?.default || 1,
				multiParam3: skill.multiParams.param3?.default || 0,
				specialParam: 0,
			}
		}
		// Fallback for other types
		return {
			isEnabled: false,
			level: 10,
			stackCount: skill.id === 'ds6' ? 100 : skill.id === 'mg2' ? 15 : 1,
			multiParam1: 10,
			multiParam2: skill.id === 'ds6' ? 100 : skill.id === 'mg2' ? 15 : 1,
			multiParam3: 0,
			specialParam: 0,
		}
	}, [skill.id, skill.type, skill.multiParams])

	const currentState = useCalculatorStore(
		useCallback(
			(state) => {
				const buffSkillsData = state.data.buffSkills.skills

				// Handle both old array format and new Record format
				if (Array.isArray(buffSkillsData)) {
					const foundSkill = buffSkillsData.find((s) => s.id === skill.id)
					if (foundSkill) {
						const defaultStackCount = skill.id === 'ds6' ? 100 : 1
						return {
							isEnabled: foundSkill.isEnabled,
							level: foundSkill.parameters.skillLevel || 10,
							stackCount: foundSkill.parameters.stackCount || defaultStackCount,
							multiParam1: foundSkill.parameters.skillLevel || 10,
							multiParam2:
								foundSkill.parameters.stackCount || defaultStackCount,
							multiParam3: foundSkill.parameters.playerCount || 0,
							specialParam: foundSkill.parameters.playerCount || 0,
						}
					}
					return defaultState
				}

				const skillState = buffSkillsData[skill.id]
				return skillState || defaultState
			},
			[skill.id, defaultState],
		),
	)

	// Zustandストアの更新関数を取得
	const updateBuffSkillState = useCalculatorStore(
		(state) => state.updateBuffSkillState,
	)

	// レベル変更ハンドラ
	const handleLevelChange = useCallback(
		(newLevel: number) => {
			const maxLevel =
				skill.type === 'multiParam' && skill.multiParams
					? skill.multiParams.param1.max
					: skill.maxLevel || 10
			const minLevel =
				skill.type === 'multiParam' && skill.multiParams
					? skill.multiParams.param1.min
					: 1
			const clampedLevel = Math.max(minLevel, Math.min(maxLevel, newLevel))

			updateBuffSkillState(skill.id, {
				...currentState,
				level: clampedLevel,
				multiParam1: clampedLevel,
			})
		},
		[
			skill.id,
			currentState,
			updateBuffSkillState,
			skill.type,
			skill.maxLevel,
			skill.multiParams,
		],
	)

	// スタック数変更ハンドラ（param2用）
	const handleStackCountChange = useCallback(
		(newStackCount: number) => {
			const maxStack =
				skill.type === 'multiParam' && skill.multiParams
					? skill.multiParams.param2?.max || 10
					: skill.maxStack || 10
			const minStack =
				skill.type === 'multiParam' && skill.multiParams
					? skill.multiParams.param2?.min || 1
					: 1
			const clampedStackCount = Math.max(
				minStack,
				Math.min(maxStack, newStackCount),
			)

			updateBuffSkillState(skill.id, {
				...currentState,
				stackCount: clampedStackCount,
				multiParam2: clampedStackCount,
			})
		},
		[
			skill.id,
			currentState,
			updateBuffSkillState,
			skill.type,
			skill.maxStack,
			skill.multiParams,
		],
	)

	// param3変更ハンドラ
	const handleParam3Change = useCallback(
		(newParam3: number) => {
			if (
				skill.type === 'multiParam' &&
				skill.multiParams &&
				skill.multiParams.param3
			) {
				const maxParam3 = skill.multiParams.param3.max
				const minParam3 = skill.multiParams.param3.min
				const clampedParam3 = Math.max(
					minParam3,
					Math.min(maxParam3, newParam3),
				)

				updateBuffSkillState(skill.id, {
					...currentState,
					multiParam3: clampedParam3,
				})
			}
		},
		[
			skill.id,
			currentState,
			updateBuffSkillState,
			skill.type,
			skill.multiParams,
		],
	)

	// 背景クリックでモーダルを閉じる
	const handleBackgroundClick = (e: React.MouseEvent) => {
		// クリックされた要素がモーダルコンテンツ内かどうかをチェック
		const modalContent = document.querySelector('[data-modal-content="true"]')
		const target = e.target as Element

		if (modalContent && !modalContent.contains(target)) {
			onClose()
		}
	}

	const handleContentClick = (e: React.MouseEvent) => {
		// モーダル内のクリックは伝播を停止
		e.stopPropagation()
	}

	// モーダルが閉じているときは何も表示しない
	if (!isOpen) return null

	return (
		<div
			className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
			onClick={handleBackgroundClick}
		>
			<div
				className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
				onClick={handleContentClick}
				data-modal-content="true"
			>
				{/* ヘッダー */}
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-lg font-semibold text-gray-800">{skill.name}</h2>
					<button
						type="button"
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
					>
						×
					</button>
				</div>

				{/* 設定UI */}
				<div className="space-y-6">
					{/* スキルレベル設定 */}
					<div>
						<div className="text-[15px] font-semibold text-gray-600 mb-3">
							{skill.type === 'multiParam' && skill.multiParams ? (
								skill.id === 'IsBrave' ? (
									<>
										いずれかを選択して下さい。
										<br />
										バフ使用者の場合: 1
										<br />
										使用者以外の場合: 2
									</>
								) : (
									`${skill.multiParams.param1.name}を入力してください。`
								)
							) : (
								'スキルレベルを入力してください。'
							)}
						</div>
						<div className="flex items-center justify-center space-x-2">
							{/* レベル -10ボタン */}
							<button
								type="button"
								onClick={() =>
									handleLevelChange((currentState.level || 10) - 10)
								}
								disabled={currentState.level <= 1}
								className="py-1 px-4 text-sm bg-rose-100 hover:bg-rose-200 border border-rose-200 rounded transition-colors cursor-pointer"
							>
								-10
							</button>

							{/* レベル -1ボタン */}
							<button
								type="button"
								onClick={() =>
									handleLevelChange((currentState.level || 10) - 1)
								}
								disabled={currentState.level <= 1}
								className="py-1 px-3 text-sm bg-rose-100 hover:bg-rose-200 border border-rose-200 rounded transition-colors cursor-pointer"
							>
								-1
							</button>

							{/* レベル表示 */}
							<div className="py-1 px-6 text-base font-medium bg-gray-100 border border-gray-200 rounded w-[80px] text-center">
								{skill.id === 'IsBrave'
									? currentState.level || 2
									: `Lv.${currentState.level || 10}`}
							</div>

							{/* レベル +1ボタン */}
							<button
								type="button"
								onClick={() =>
									handleLevelChange((currentState.level || 10) + 1)
								}
								disabled={currentState.level >= (skill.maxLevel || 10)}
								className="py-1 px-3 text-sm bg-blue-100 hover:bg-blue-200 border border-blue-200 rounded transition-colors cursor-pointer"
							>
								+1
							</button>

							{/* レベル +10ボタン */}
							<button
								type="button"
								onClick={() =>
									handleLevelChange((currentState.level || 10) + 10)
								}
								disabled={currentState.level >= (skill.maxLevel || 10)}
								className="py-1 px-4 text-sm bg-blue-100 hover:bg-blue-200 border border-blue-200 rounded transition-colors cursor-pointer"
							>
								+10
							</button>
						</div>
					</div>

					{/* 重ねがけ数設定 */}
					{skill.id !== 'IsBrave' && (
						<div>
							<div className="text-sm text-gray-600 mb-3">
								{skill.type === 'multiParam' && skill.multiParams
									? skill.id === 'dp1'
										? 'ダークパワースキルに使用した全スキルポイントを入力してください。'
										: skill.id === 'mg4'
											? 'キャストマスタリを除いたウィザードスキルの習得数を入力してください。'
											: skill.id === 'knight5-3'
												? 'バフエリア内のプレイヤーの数を入力してください。'
												: `${skill.multiParams.param2?.name || 'パラメータ2'}を入力してください。`
									: 'カウント数を入力してください。'}
							</div>
							<div className="flex items-center justify-center space-x-2">
								{/* スタック -10ボタン */}
								<button
									type="button"
									onClick={() => {
										const currentValue =
											skill.type === 'multiParam'
												? currentState.multiParam2 ||
													skill.multiParams?.param2?.default ||
													1
												: currentState.stackCount || 1
										handleStackCountChange(currentValue - 10)
									}}
									disabled={
										skill.type === 'multiParam'
											? (currentState.multiParam2 ||
													skill.multiParams?.param2?.default ||
													1) <= (skill.multiParams?.param2?.min || 1)
											: (currentState.stackCount || 1) <= 1
									}
									className="py-1 px-4 text-sm bg-rose-100 hover:bg-rose-200 border border-rose-200 rounded transition-colors cursor-pointer"
								>
									-10
								</button>

								{/* スタック -1ボタン */}
								<button
									type="button"
									onClick={() => {
										const currentValue =
											skill.type === 'multiParam'
												? currentState.multiParam2 ||
													skill.multiParams?.param2?.default ||
													1
												: currentState.stackCount || 1
										handleStackCountChange(currentValue - 1)
									}}
									disabled={
										skill.type === 'multiParam'
											? (currentState.multiParam2 ||
													skill.multiParams?.param2?.default ||
													1) <= (skill.multiParams?.param2?.min || 1)
											: (currentState.stackCount || 1) <= 1
									}
									className="py-1 px-3 text-sm bg-rose-100 hover:bg-rose-200 border border-rose-200 rounded transition-colors cursor-pointer"
								>
									-1
								</button>

								{/* スタック数表示 */}
								<div className="py-1 px-6 text-base font-medium bg-gray-100 border border-gray-200 rounded w-[80px] text-center">
									{skill.id === 'dp1'
										? `${currentState.multiParam2 || skill.multiParams?.param2?.default || 1}pt`
										: skill.id === 'IsBrave'
											? (currentState.stackCount || 2) === 1
												? '使用者'
												: '使用者以外'
											: `×${currentState.stackCount || 1}`}
								</div>

								{/* スタック +1ボタン */}
								<button
									type="button"
									onClick={() => {
										const currentValue =
											skill.type === 'multiParam'
												? currentState.multiParam2 ||
													skill.multiParams?.param2?.default ||
													1
												: currentState.stackCount || 1
										handleStackCountChange(currentValue + 1)
									}}
									disabled={
										skill.type === 'multiParam'
											? (currentState.multiParam2 ||
													skill.multiParams?.param2?.default ||
													1) >= (skill.multiParams?.param2?.max || 10)
											: (currentState.stackCount || 1) >= (skill.maxStack || 10)
									}
									className="py-1 px-3 text-sm bg-blue-100 hover:bg-blue-200 border border-blue-200 rounded transition-colors cursor-pointer"
								>
									+1
								</button>

								{/* スタック +10ボタン */}
								<button
									type="button"
									onClick={() => {
										const currentValue =
											skill.type === 'multiParam'
												? currentState.multiParam2 ||
													skill.multiParams?.param2?.default ||
													1
												: currentState.stackCount || 1
										handleStackCountChange(currentValue + 10)
									}}
									disabled={
										skill.type === 'multiParam'
											? (currentState.multiParam2 ||
													skill.multiParams?.param2?.default ||
													1) >= (skill.multiParams?.param2?.max || 10)
											: (currentState.stackCount || 1) >= (skill.maxStack || 10)
									}
									className="py-1 px-4 text-sm bg-blue-100 hover:bg-blue-200 border border-blue-200 rounded transition-colors cursor-pointer"
								>
									+10
								</button>
							</div>
						</div>
					)}

					{/* パラメータ3設定 */}
					{skill.type === 'multiParam' &&
						skill.multiParams &&
						skill.multiParams.param3 && (
							<div>
								<div className="text-sm text-gray-600 mb-3">
									{skill.id === 'mg4'
										? 'ウィザードスキルに使用した全スキルポイントを入力してください。'
										: skill.id === 'knight5-3'
											? '盾の精錬値を入力してください。'
											: `${skill.multiParams.param3.name}を入力してください。`}
								</div>
								<div className="flex items-center justify-center space-x-2">
									{/* param3 -10ボタン */}
									<button
										type="button"
										onClick={() =>
											handleParam3Change(
												(currentState.multiParam3 ||
													skill.multiParams?.param3?.default ||
													0) - 10,
											)
										}
										disabled={
											(currentState.multiParam3 ||
												skill.multiParams?.param3?.default ||
												0) <= (skill.multiParams?.param3?.min || 0)
										}
										className="py-1 px-4 text-sm bg-rose-100 hover:bg-rose-200 border border-rose-200 rounded transition-colors cursor-pointer"
									>
										-10
									</button>

									{/* param3 -1ボタン */}
									<button
										type="button"
										onClick={() =>
											handleParam3Change(
												(currentState.multiParam3 ||
													skill.multiParams?.param3?.default ||
													0) - 1,
											)
										}
										disabled={
											(currentState.multiParam3 ||
												skill.multiParams?.param3?.default ||
												0) <= (skill.multiParams?.param3?.min || 0)
										}
										className="py-1 px-3 text-sm bg-rose-100 hover:bg-rose-200 border border-rose-200 rounded transition-colors cursor-pointer"
									>
										-1
									</button>

									{/* param3表示 */}
									<div className="py-1 px-6 text-base font-medium bg-gray-100 border border-gray-200 rounded min-w-[60px] text-center">
										{currentState.multiParam3 ||
											skill.multiParams?.param3?.default ||
											0}
										{skill.multiParams?.param3?.unit || ''}
									</div>

									{/* param3 +1ボタン */}
									<button
										type="button"
										onClick={() =>
											handleParam3Change(
												(currentState.multiParam3 ||
													skill.multiParams?.param3?.default ||
													0) + 1,
											)
										}
										disabled={
											(currentState.multiParam3 ||
												skill.multiParams?.param3?.default ||
												0) >= (skill.multiParams?.param3?.max || 100)
										}
										className="py-1 px-3 text-sm bg-blue-100 hover:bg-blue-200 border border-blue-200 rounded transition-colors cursor-pointer"
									>
										+1
									</button>

									{/* param3 +10ボタン */}
									<button
										type="button"
										onClick={() =>
											handleParam3Change(
												(currentState.multiParam3 ||
													skill.multiParams?.param3?.default ||
													0) + 10,
											)
										}
										disabled={
											(currentState.multiParam3 ||
												skill.multiParams?.param3?.default ||
												0) >= (skill.multiParams?.param3?.max || 0)
										}
										className="py-1 px-4 text-sm bg-blue-100 hover:bg-blue-200 border border-blue-200 rounded transition-colors cursor-pointer"
									>
										+10
									</button>
								</div>
							</div>
						)}

					{/* 説明 */}
					{skill.id !== 'dp1' &&
						skill.id !== 'mg4' &&
						skill.id !== 'knight5-3' &&
						skill.id !== 'IsBrave' && (
							<div className="text-xs text-gray-500 text-center">
								{skill.name}はカウント数1-{skill.maxStack || 10}まで設定可能です
							</div>
						)}
				</div>

				{/* 閉じるボタン */}
				<div className="flex justify-end mt-6">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors cursor-pointer"
					>
						閉じる
					</button>
				</div>
			</div>
		</div>
	)
}
