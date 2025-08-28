'use client'

import type { DamageCaptureData } from '@/utils/damageCaptureStorage'

interface DamageResult {
	min: number
	max: number
	average: number
	stability: number
	averageStability: number
	maxStability?: number
}

interface DamageTableProps {
	damageResults: DamageResult
	captureData: DamageCaptureData | null
	onCapture: () => void
	className?: string
}

export default function DamageTable({
	damageResults,
	captureData,
	onCapture,
	className = '',
}: DamageTableProps) {
	return (
		<div className={`overflow-x-auto ${className}`}>
			<table className="w-full text-sm">
				<thead>
					<tr className="border-b border-gray-200">
						<th className="sm:px-2 py-3 text-left text-gray-700 font-medium" />
						<th
							className="px-1 sm:px-2 py-1 sm:py-3 text-center text-gray-700 font-medium"
							colSpan={2}
						>
							現在の計算結果
						</th>
						<th
							className="px-1 py-1 sm:px-2 sm:py-3 text-center text-gray-700 font-medium"
							colSpan={2}
						>
							<button
								type="button"
								onClick={onCapture}
								className="px-3 py-1 bg-blue-500/80 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-1 cursor-pointer text-sm mx-auto"
							>
								<svg
									className="w-3 h-3"
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
						</th>
					</tr>
					<tr className="border-b border-gray-200">
						<th className="sm:px-2 py-0.5 text-left text-gray-700 font-medium" />
						<th className="px-1 sm:px-2 py-0.5 text-center text-gray-700 font-medium">
							ダメージ
						</th>
						<th className="px-1 sm:px-2 py-0.5 text-center text-gray-700 font-medium">
							安定率
						</th>
						<th className="px-1 sm:px-2 py-0.5 text-center text-gray-700 font-medium">
							ダメージ
						</th>
						<th className="px-1 sm:px-2 py-0.5 text-center text-gray-700 font-medium">
							安定率
						</th>
					</tr>
				</thead>
				<tbody>
					<tr className="border-b border-gray-100">
						<td className="px-1 sm:pl-4 sm:pr-2 pb-0.5 pt-1 font-medium text-gray-700">
							最小
						</td>
						<td className="pl-1 pr-2 sm:px-4 pb-0.5 pt-1 text-right font-semibold text-gray-700 font-roboto">
							{damageResults.min.toLocaleString()}
						</td>
						<td className="px-1 sm:px-4 pb-0.5 pt-1 text-center text-gray-700 font-roboto">
							{damageResults.stability}%
						</td>
						<td className="pl-1 pr-2 sm:px-4 pb-0.5 pt-1 text-right font-semibold text-gray-700 font-roboto">
							{captureData
								? captureData.damageResult.minimum.damage.toLocaleString()
								: 'データなし'}
						</td>
						<td className="px-1 sm:px-4 pb-0.5 pt-1 text-center text-gray-700 font-roboto">
							{captureData
								? `${captureData.damageResult.minimum.stability}%`
								: '-'}
						</td>
					</tr>
					<tr className="border-b border-gray-100">
						<td className="px-1 sm:px-4 py-0.5 font-medium text-gray-700">
							最大
						</td>
						<td className="pl-1 pr-2 sm:px-4 py-0.5 text-right font-semibold text-gray-700 font-roboto">
							{damageResults.max.toLocaleString()}
						</td>
						<td className="px-1 sm:px-4 py-0.5 text-center text-gray-600 font-roboto">
							{damageResults.maxStability
								? `${damageResults.maxStability}%`
								: '100%'}
						</td>
						<td className="pl-1 pr-2 sm:px-4 py-0.5 text-right font-semibold text-gray-700 font-roboto">
							{captureData
								? captureData.damageResult.maximum.damage.toLocaleString()
								: 'データなし'}
						</td>
						<td className="px-1 sm:px-4 py-0.5 text-center text-gray-600 font-roboto">
							{captureData
								? `${captureData.damageResult.maximum.stability}%`
								: '-'}
						</td>
					</tr>
					<tr>
						<td className="px-1 sm:px-4 py-0.5 font-medium text-gray-700">
							平均
						</td>
						<td className="pl-1 pr-2 sm:px-4 py-0.5 text-right font-bold text-gray-700 font-roboto">
							{damageResults.average.toLocaleString()}
						</td>
						<td className="px-1 sm:px-4 py-0.5 text-center text-gray-600 font-roboto">
							{damageResults.averageStability}%
						</td>
						<td className="pl-1 pr-2 sm:px-4 py-0.5 text-right font-bold text-gray-700 font-roboto">
							{captureData
								? captureData.damageResult.average.damage.toLocaleString()
								: 'データなし'}
						</td>
						<td className="px-1 sm:px-4 py-0.5 text-center text-gray-600 font-roboto">
							{captureData
								? `${captureData.damageResult.average.stability}%`
								: '-'}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	)
}
