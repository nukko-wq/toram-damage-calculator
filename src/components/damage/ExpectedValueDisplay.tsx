'use client'

import { useState } from 'react'
import type { ExpectedValueParams } from '@/utils/expectedValueCalculations'

// パーセント表示用のフォーマット関数（小数点以下0の場合は整数表示）
const formatPercentage = (value: number): string => {
	return value % 1 === 0 ? `${value}%` : `${value.toFixed(1)}%`
}

interface ExpectedValueDisplayProps {
	expectedValue: number
	averageStability: number
	powerEfficiency: number
	params: ExpectedValueParams
}

type TabType = 'basic' | 'ratio' | 'capture' | 'compare'

export default function ExpectedValueDisplay({
	expectedValue,
	averageStability,
	powerEfficiency,
	params,
}: ExpectedValueDisplayProps) {
	const [activeTab, setActiveTab] = useState<TabType | null>(null)

	const handleTabClick = (tab: TabType) => {
		setActiveTab(activeTab === tab ? null : tab)
	}

	return (
		<div className="space-y-4">
			{/* 3カラム表示 */}
			<div className="grid grid-cols-3 gap-4 bg-white p-4 rounded-lg border">
				<div className="text-center">
					<div className="text-sm text-gray-600 mb-1">期待値</div>
					<div className="text-xl font-bold text-gray-900">
						{expectedValue.toLocaleString()}
					</div>
				</div>
				<div className="text-center border-l border-gray-200 pl-4">
					<div className="text-sm text-gray-600 mb-1">平均安定率</div>
					<div className="text-xl font-bold text-gray-900">
						{averageStability.toFixed(1)}%
					</div>
				</div>
				<div className="text-center border-l border-gray-200 pl-4">
					<div className="text-sm text-gray-600 mb-1">威力発揮率</div>
					<div className="text-xl font-bold text-gray-900">
						{powerEfficiency.toFixed(1)}%
					</div>
				</div>
			</div>

			{/* タブメニュー */}
			<div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
				<button
					onClick={() => handleTabClick('basic')}
					className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
						activeTab === 'basic'
							? 'bg-white text-blue-600 shadow-sm'
							: 'text-gray-600 hover:text-gray-900'
					}`}
				>
					基本情報
				</button>
				<button
					onClick={() => handleTabClick('ratio')}
					className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
						activeTab === 'ratio'
							? 'bg-white text-blue-600 shadow-sm'
							: 'text-gray-600 hover:text-gray-900'
					}`}
				>
					割合表示
				</button>
				<button
					onClick={() => handleTabClick('capture')}
					className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
						activeTab === 'capture'
							? 'bg-white text-blue-600 shadow-sm'
							: 'text-gray-600 hover:text-gray-900'
					}`}
				>
					一時記録
				</button>
				<button
					onClick={() => handleTabClick('compare')}
					className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors opacity-50 cursor-not-allowed ${
						activeTab === 'compare'
							? 'bg-white text-blue-600 shadow-sm'
							: 'text-gray-600'
					}`}
					disabled
				>
					比較設定
				</button>
			</div>

			{/* タブコンテンツ */}
			{activeTab && (
				<div className="bg-white p-4 rounded-lg border">
					{activeTab === 'basic' && <BasicInfoTab params={params} />}
					{activeTab === 'ratio' && <RatioDisplayTab />}
					{activeTab === 'capture' && (
						<CaptureTab
							expectedValue={expectedValue}
							averageStability={averageStability}
							powerEfficiency={powerEfficiency}
						/>
					)}
				</div>
			)}
		</div>
	)
}

// 基本情報タブ
function BasicInfoTab({ params }: { params: ExpectedValueParams }) {
	const {
		criticalRate,
		hitRate,
		playerCriticalStat,
		enemyRequiredCritical,
		playerHitStat,
		enemyRequiredHit,
	} = params

	return (
		<div className="space-y-4">
			<div className="text-sm text-gray-600 mb-4">
				※複数HITの場合、表示は全ての平均値になります。
			</div>

			<div className="space-y-3">
				<div>
					<div className="font-medium text-gray-900 mb-2">
						1.クリティカル発生率... {formatPercentage(criticalRate)}
					</div>
					<div className="ml-4 space-y-1 text-sm text-gray-700">
						<div>◎自身のクリティカル率： {playerCriticalStat}</div>
						<div>
							◎クリティカル発生率100%に必要なクリティカル率：{' '}
							{enemyRequiredCritical}
						</div>
						<div className="text-xs text-gray-500 mt-1">
							※確定クリティカル特性の場合は、クリティカル発生率100%になります。
						</div>
					</div>
				</div>

				<div>
					<div className="font-medium text-gray-900 mb-2">
						2.命中率... {formatPercentage(hitRate)}
					</div>
					<div className="ml-4 space-y-1 text-sm text-gray-700">
						<div>◎自身のHIT値： {playerHitStat}</div>
						<div>◎命中率100%に必要なHIT値： {enemyRequiredHit}</div>
						<div className="text-xs text-gray-500 mt-1">
							※魔法/必中特性の場合は、命中率100%になります。
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

// 割合表示タブ
function RatioDisplayTab() {
	// TODO: 実際のデータから計算
	const occurrenceRatio = {
		critical: 45.0,
		glaze: 30.0,
		white: 20.0,
		miss: 5.0,
	}

	const damageRatio = {
		critical: 60.0,
		glaze: 25.0,
		white: 15.0,
		miss: 0.0,
	}

	return (
		<div className="space-y-8">
			{/* 発生割合 */}
			<div>
				<h3 className="font-medium text-gray-900 mb-4">発生割合（%）</h3>
				<div className="mb-4">
					<HorizontalBarChart data={occurrenceRatio} />
				</div>
				<div className="flex flex-wrap gap-4 justify-center">
					{Object.entries(occurrenceRatio).map(([type, value]) => (
						<div key={type} className="flex items-center gap-2">
							<div className={`w-4 h-4 rounded ${getBarColor(type)}`} />
							<span className="text-sm text-gray-700 capitalize">{type}</span>
							<span className="text-sm text-gray-900 font-medium">
								{formatPercentage(value)}
							</span>
						</div>
					))}
				</div>
			</div>

			{/* 与ダメージ割合 */}
			<div>
				<h3 className="font-medium text-gray-900 mb-4">与ダメージ割合（%）</h3>
				<div className="mb-4">
					<HorizontalBarChart data={damageRatio} />
				</div>
				<div className="flex flex-wrap gap-4 justify-center">
					{Object.entries(damageRatio).map(([type, value]) => (
						<div key={type} className="flex items-center gap-2">
							<div className={`w-4 h-4 rounded ${getBarColor(type)}`} />
							<span className="text-sm text-gray-700 capitalize">{type}</span>
							<span className="text-sm text-gray-900 font-medium">
								{formatPercentage(value)}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

// 水平バーチャートコンポーネント
function HorizontalBarChart({ data }: { data: Record<string, number> }) {
	let cumulativeWidth = 0

	return (
		<div className="w-full h-8 bg-gray-200 overflow-hidden flex">
			{Object.entries(data).map(([type, value]) => {
				const width = value
				const segment = (
					<div
						key={type}
						className={`h-full ${getBarColor(type)}`}
						style={{ width: `${width}%` }}
						title={`${type}: ${formatPercentage(value)}`}
					/>
				)
				cumulativeWidth += width
				return segment
			})}
		</div>
	)
}

// バーの色を取得
function getBarColor(type: string): string {
	switch (type) {
		case 'critical':
			return 'bg-yellow-400/90'
		case 'glaze':
			return 'bg-rose-400/90'
		case 'white':
			return 'bg-gray-300/90'
		case 'miss':
			return 'bg-gray-400/90'
		default:
			return 'bg-gray-200/90'
	}
}

// 一時記録タブ
function CaptureTab({
	expectedValue,
	averageStability,
	powerEfficiency,
}: {
	expectedValue: number
	averageStability: number
	powerEfficiency: number
}) {
	const [capturedData, setCapturedData] = useState<{
		expectedValue: number
		averageStability: number
		powerEfficiency: number
		capturedAt: string
	} | null>(null)

	const handleCapture = () => {
		const data = {
			expectedValue,
			averageStability,
			powerEfficiency,
			capturedAt: new Date().toISOString(),
		}
		setCapturedData(data)
		// TODO: LocalStorageに保存
	}

	return (
		<div className="space-y-4">
			{/* キャプチャボタン */}
			<div className="flex justify-center">
				<button
					onClick={handleCapture}
					className="px-4 py-2 bg-blue-500/80 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
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
					現在の値をキャプチャ
				</button>
			</div>

			{/* キャプチャデータ表示 */}
			{capturedData ? (
				<div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border">
					<div className="text-center">
						<div className="text-sm text-gray-600 mb-1">期待値</div>
						<div className="text-lg font-bold text-gray-900">
							{capturedData.expectedValue.toLocaleString()}
						</div>
					</div>
					<div className="text-center border-l border-gray-200 pl-4">
						<div className="text-sm text-gray-600 mb-1">平均安定率</div>
						<div className="text-lg font-bold text-gray-900">
							{capturedData.averageStability.toFixed(1)}%
						</div>
					</div>
					<div className="text-center border-l border-gray-200 pl-4">
						<div className="text-sm text-gray-600 mb-1">威力発揮率</div>
						<div className="text-lg font-bold text-gray-900">
							{capturedData.powerEfficiency.toFixed(1)}%
						</div>
					</div>
				</div>
			) : (
				<div className="text-center text-gray-500 py-8">
					記録データがありません
				</div>
			)}
		</div>
	)
}
