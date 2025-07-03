'use client'

import { useState } from 'react'

interface DamagePreviewProps {
	isVisible: boolean
}

// ダメージ計算結果の型定義
interface DamageResult {
	min: number
	max: number
	average: number
	stability: number // 安定率(%)
}

// 威力オプション設定の型定義
interface PowerOptions {
	bossDifficulty: 'normal' | 'hard' | 'lunatic' | 'ultimate'
	skillDamage: 'all' | 'hit1' | 'hit2' | 'hit3'
	elementAttack: 'advantageous' | 'other' | 'none' | 'disadvantageous'
	combo: boolean
	damageType: 'critical' | 'graze' | 'normal' | 'expected'
	distance: 'short' | 'long' | 'disabled'
	elementPower: 'enabled' | 'advantageOnly' | 'awakeningOnly' | 'disabled'
	unsheathe: boolean
}

export default function DamagePreview({ isVisible }: DamagePreviewProps) {
	// 威力オプション設定の状態管理
	const [powerOptions, setPowerOptions] = useState<PowerOptions>({
		bossDifficulty: 'normal',
		skillDamage: 'all',
		elementAttack: 'advantageous',
		combo: false,
		damageType: 'expected',
		distance: 'disabled',
		elementPower: 'enabled',
		unsheathe: false,
	})

	if (!isVisible) {
		return null
	}

	// ダミーデータ（将来は実際の計算結果に置き換え）
	const dummyNormalAttack: DamageResult = {
		min: 10000,
		max: 20000,
		average: 15000,
		stability: 95,
	}

	const dummySkillAttack: DamageResult = {
		min: 9000,
		max: 15000,
		average: 13000,
		stability: 90,
	}

	const handleScreenshot = () => {
		// スクリーンショット機能（将来実装）
		console.log('キャプチャ機能は将来実装予定です')
	}

	const updatePowerOption = <K extends keyof PowerOptions>(
		key: K,
		value: PowerOptions[K],
	) => {
		setPowerOptions((prev) => ({ ...prev, [key]: value }))
	}

	return (
		<div className="bg-blue-50 py-2">
			<div className="container mx-auto px-4">
				{/* キャプチャボタン */}
				<div className="mb-4 flex justify-end">
					<button
						onClick={handleScreenshot}
						className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 cursor-pointer"
					>
						<svg
							className="w-4 h-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
							/>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
							/>
						</svg>
						キャプチャ
					</button>
				</div>

				{/* ダメージ表示テーブル */}
				<div className="bg-white rounded-lg border border-gray-200 mb-6 overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-gray-200">
								<th className="px-4 py-3 text-left text-gray-600 font-medium">
									ダメージ
								</th>
								<th className="px-4 py-3 text-center text-gray-600 font-medium">
									通常攻撃
								</th>
								<th className="px-4 py-3 text-center text-gray-600 font-medium">
									安定率
								</th>
								<th className="px-4 py-3 text-center text-gray-600 font-medium">
									スキル攻撃
								</th>
								<th className="px-4 py-3 text-center text-gray-600 font-medium">
									安定率
								</th>
							</tr>
						</thead>
						<tbody>
							<tr className="border-b border-gray-100">
								<td className="px-4 py-3 font-medium text-gray-700">最小</td>
								<td className="px-4 py-3 text-center font-semibold text-blue-600">
									{dummyNormalAttack.min.toLocaleString()}
								</td>
								<td className="px-4 py-3 text-center text-gray-600">
									{dummyNormalAttack.stability}%
								</td>
								<td className="px-4 py-3 text-center font-semibold text-purple-600">
									{dummySkillAttack.min.toLocaleString()}
								</td>
								<td className="px-4 py-3 text-center text-gray-600">
									{dummySkillAttack.stability}%
								</td>
							</tr>
							<tr className="border-b border-gray-100">
								<td className="px-4 py-3 font-medium text-gray-700">最大</td>
								<td className="px-4 py-3 text-center font-semibold text-blue-600">
									{dummyNormalAttack.max.toLocaleString()}
								</td>
								<td className="px-4 py-3 text-center text-gray-600">100%</td>
								<td className="px-4 py-3 text-center font-semibold text-purple-600">
									{dummySkillAttack.max.toLocaleString()}
								</td>
								<td className="px-4 py-3 text-center text-gray-600">100%</td>
							</tr>
							<tr>
								<td className="px-4 py-3 font-medium text-gray-700">平均</td>
								<td className="px-4 py-3 text-center font-bold text-orange-600">
									{dummyNormalAttack.average.toLocaleString()}
								</td>
								<td className="px-4 py-3 text-center text-gray-600">
									{dummyNormalAttack.stability}%
								</td>
								<td className="px-4 py-3 text-center font-bold text-orange-600">
									{dummySkillAttack.average.toLocaleString()}
								</td>
								<td className="px-4 py-3 text-center text-gray-600">
									{dummySkillAttack.stability}%
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				{/* 慣れ倍率スライダー（後で実装予定の枠） */}
				<div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex items-center gap-2">
					<div className="text-[13px] font-medium text-gray-700">
						慣れ倍率（後で実装）
					</div>
					<div className="h-8 bg-gray-100 rounded flex items-center justify-center">
						<span className="text-xs text-gray-500">スライダー実装予定</span>
					</div>
				</div>

				{/* 敵情報 */}
				<div className="p-2 flex items-center gap-2">
					<p className="text-xs sm:text-[13px] font-medium text-gray-700">
						敵：ラフィー
					</p>
				</div>

				{/* 威力オプション */}
				<div className=" sm:p-2">
					<ul className="flex gap-2 bg-blue-100 p-1">
						<li className="text-[10px] sm:text-xs font-semibold text-gray-900 flex-1 text-center">
							威力オプション
						</li>
						<li className="text-[10px] sm:text-xs font-semibold text-gray-900 flex-1 text-center">
							その他
						</li>
					</ul>

					<div className="space-y-1">
						{/* ボス戦難易度 */}
						<div className="flex items-center sm:gap-4 border-b-2 border-blue-200">
							<label className="text-xs md:text-[13px] font-semibold text-gray-700 w-24">
								ボス戦難易度
							</label>
							<div className="flex sm:gap-2">
								{(['normal', 'hard', 'lunatic', 'ultimate'] as const).map(
									(difficulty) => (
										<button
											key={difficulty}
											onClick={() =>
												updatePowerOption('bossDifficulty', difficulty)
											}
											className={`px-3 py-0.5 sm:py-1 text-xs md:text-[13px] rounded ${
												powerOptions.bossDifficulty === difficulty
													? 'bg-blue-400 text-white'
													: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
											}`}
										>
											{difficulty === 'normal'
												? 'Normal'
												: difficulty === 'hard'
													? 'Hard'
													: difficulty === 'lunatic'
														? 'Lunatic'
														: 'Ultimate'}
										</button>
									),
								)}
							</div>
						</div>

						{/* スキルダメージ */}
						<div className="flex items-center sm:gap-4 border-b-2 border-blue-200">
							<label className="text-xs md:text-[13px] font-semibold text-gray-700 w-24">
								スキルダメージ
							</label>
							<div className="flex sm:gap-2">
								{(['all', 'hit1', 'hit2', 'hit3'] as const).map((hit) => (
									<button
										key={hit}
										onClick={() => updatePowerOption('skillDamage', hit)}
										className={`px-3 py-1 text-xs md:text-[13px] rounded ${
											powerOptions.skillDamage === hit
												? 'bg-blue-400 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										}`}
									>
										{hit === 'all'
											? '全て'
											: hit === 'hit1'
												? '1撃目'
												: hit === 'hit2'
													? '2撃目'
													: '3撃目'}
									</button>
								))}
							</div>
						</div>

						{/* 属性攻撃 */}
						<div className="flex items-center sm:gap-4 border-b-2 border-blue-200">
							<label className="text-xs md:text-[13px] font-semibold text-gray-700 w-24">
								属性攻撃
							</label>
							<div className="flex sm:gap-2">
								{(
									['advantageous', 'other', 'none', 'disadvantageous'] as const
								).map((element) => (
									<button
										key={element}
										onClick={() => updatePowerOption('elementAttack', element)}
										className={`px-3 py-1 text-xs md:text-[13px] rounded ${
											powerOptions.elementAttack === element
												? 'bg-pink-400 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										}`}
									>
										{element === 'advantageous'
											? '有(有利)'
											: element === 'other'
												? '有(その他)'
												: element === 'none'
													? '無'
													: '不利属性'}
									</button>
								))}
							</div>
						</div>

						{/* コンボ:強打 */}
						<div className="flex items-center sm:gap-4 border-b-2 border-blue-200">
							<label className="text-xs md:text-[13px] font-semibold text-gray-700 w-24">
								コンボ:強打
							</label>
							<div className="flex sm:gap-2">
								{[
									{ value: true, label: '有効' },
									{ value: false, label: '無効' },
								].map((option) => (
									<button
										key={option.label}
										onClick={() => updatePowerOption('combo', option.value)}
										className={`px-3 py-1 text-xs md:text-[13px] rounded ${
											powerOptions.combo === option.value
												? 'bg-rose-400 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										}`}
									>
										{option.label}
									</button>
								))}
							</div>
						</div>

						{/* ダメージ判定 */}
						<div className="flex items-center sm:gap-4 border-b-2 border-blue-200">
							<label className="text-xs md:text-[13px] font-semibold text-gray-700 w-24">
								ダメージ判定
							</label>
							<div className="flex sm:gap-2">
								{(['critical', 'graze', 'normal', 'expected'] as const).map(
									(type) => (
										<button
											key={type}
											onClick={() => updatePowerOption('damageType', type)}
											className={`px-3 py-1 text-xs md:text-[13px] rounded ${
												powerOptions.damageType === type
													? 'bg-amber-400 text-white'
													: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
											}`}
										>
											{type === 'critical'
												? 'Critical'
												: type === 'graze'
													? 'Graze'
													: type === 'normal'
														? '白ダメ'
														: '期待値'}
										</button>
									),
								)}
							</div>
						</div>

						{/* 距離判定 */}
						<div className="flex items-center sm:gap-4 border-b-2 border-blue-200">
							<label className="text-xs md:text-[13px] font-semibold text-gray-700 w-24">
								距離判定
							</label>
							<div className="flex sm:gap-2">
								{(['short', 'long', 'disabled'] as const).map((distance) => (
									<button
										key={distance}
										onClick={() => updatePowerOption('distance', distance)}
										className={`px-3 py-1 text-xs md:text-[13px] rounded ${
											powerOptions.distance === distance
												? 'bg-rose-400 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										}`}
									>
										{distance === 'short'
											? '近距離'
											: distance === 'long'
												? '遠距離'
												: '無効化'}
									</button>
								))}
							</div>
						</div>

						{/* 属性威力 */}
						<div className="flex items-center sm:gap-4 border-b-2 border-blue-200">
							<label className="text-xs md:text-[13px] font-semibold text-gray-700 w-24">
								属性威力
							</label>
							<div className="flex sm:gap-2">
								{(
									[
										'enabled',
										'advantageOnly',
										'awakeningOnly',
										'disabled',
									] as const
								).map((power) => (
									<button
										key={power}
										onClick={() => updatePowerOption('elementPower', power)}
										className={`px-3 py-1 text-xs md:text-[13px] rounded ${
											powerOptions.elementPower === power
												? 'bg-rose-400 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										}`}
									>
										{power === 'enabled'
											? '有効'
											: power === 'advantageOnly'
												? '有利のみ'
												: power === 'awakeningOnly'
													? '覚醒のみ'
													: '無効'}
									</button>
								))}
							</div>
						</div>

						{/* 抜刀威力 */}
						<div className="flex items-center sm:gap-4 border-b-2 border-blue-200">
							<label className="text-xs md:text-[13px] font-semibold text-gray-700 w-24">
								抜刀威力
							</label>
							<div className="flex sm:gap-2">
								{[
									{ value: true, label: '有効' },
									{ value: false, label: '無効' },
								].map((option) => (
									<button
										key={option.label}
										onClick={() => updatePowerOption('unsheathe', option.value)}
										className={`px-3 py-1 text-xs md:text-[13px] rounded ${
											powerOptions.unsheathe === option.value
												? 'bg-rose-400 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										}`}
									>
										{option.label}
									</button>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
