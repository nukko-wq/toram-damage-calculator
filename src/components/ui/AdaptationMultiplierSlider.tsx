'use client'

import { useCallback, useState } from 'react'

interface AdaptationMultiplierSliderProps {
	value: number
	onChange: (value: number) => void
	className?: string
}

export default function AdaptationMultiplierSlider({
	value,
	onChange,
	className = '',
}: AdaptationMultiplierSliderProps) {
	// 入力中の一時的な値を管理するローカル状態
	const [tempValue, setTempValue] = useState<string>(value.toString())

	// valueが外部から更新された場合にtempValueを同期
	const syncTempValue = useCallback(() => {
		setTempValue(value.toString())
	}, [value])

	// valueが変更されたらtempValueを同期
	if (
		tempValue !== value.toString() &&
		document.activeElement?.tagName !== 'INPUT'
	) {
		setTempValue(value.toString())
	}

	return (
		<div className={`sm:p-2 border-b-2 border-blue-200 ${className}`}>
			<div className="flex items-center gap-2 sm:gap-4">
				<div className="flex items-center gap-2">
					<label className="text-[13px] font-semibold text-gray-700">
						慣れ倍率
					</label>
					<div className="text-[13px] font-semibold text-gray-700 min-w-12 text-center">
						{value}%
					</div>
				</div>
				<div className="flex-1">
					<input
						type="range"
						min="50"
						max="250"
						value={value}
						onChange={(e) => onChange(Number(e.target.value))}
						className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
						style={{
							background: `linear-gradient(to right, oklch(62.3% 0.214 259.815 / .8) 0%, oklch(62.3% 0.214 259.815 / .8) ${((value - 50) / (250 - 50)) * 100}%, #e5e7eb ${((value - 50) / (250 - 50)) * 100}%, #e5e7eb 100%)`,
						}}
					/>
				</div>
				<div className="flex items-center gap-1">
					<input
						type="number"
						min="50"
						max="250"
						step="1"
						value={tempValue}
						onChange={(e) => {
							const inputValue = e.target.value

							// 入力値をローカル状態に保存（バックスペース削除を可能にするため）
							setTempValue(inputValue)

							// 空文字列の場合は処理終了（入力中の状態を保持）
							if (inputValue === '') {
								return
							}

							// 数値のみを許可（正規表現チェック）
							if (!/^\d+$/.test(inputValue)) {
								return
							}

							const newValue = Number(inputValue)
							// 範囲チェック
							if (newValue >= 50 && newValue <= 250) {
								onChange(newValue)
							} else if (newValue > 250) {
								onChange(250)
							}
						}}
						onMouseDown={(e) => {
							// フォーカス状態でのクリックによる値クリア機能
							if (document.activeElement === e.target) {
								onChange(50)
								setTempValue('50')
								// 次のティックでテキストを選択状態にしてユーザーが入力しやすくする
								setTimeout(() => {
									const element = e.target as HTMLInputElement
									if (element) {
										element.select()
									}
								}, 0)
							}
						}}
						onBlur={(e) => {
							// フォーカスを失った時の最終調整
							const inputValue = e.target.value
							if (inputValue === '' || Number.isNaN(Number(inputValue))) {
								onChange(50)
								setTempValue('50')
							} else {
								const newValue = Number(inputValue)
								if (newValue < 50) {
									onChange(50)
									setTempValue('50')
								} else if (newValue > 250) {
									onChange(250)
									setTempValue('250')
								}
							}
						}}
						className="w-12 pl-1.5 pr-1 py-1 text-[13px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
					/>
					<span className="text-xs text-gray-600">%</span>
				</div>
			</div>
			<div className="mt-1 text-xs text-gray-500 ml-0">
				慣れ倍率は最小50％から最大250％の範囲で変更できます。
			</div>
		</div>
	)
}
