interface DamagePreviewProps {
	isVisible: boolean
}

export default function DamagePreview({ isVisible }: DamagePreviewProps) {
	if (!isVisible) {
		return null
	}

	// ダミーデータ（将来はCalculatorStoreから取得）
	const dummyDamageData = {
		normalAttack: {
			min: 1234,
			max: 1567,
			average: 1401,
			critical: 2102,
		},
		skillAttack: {
			min: 2345,
			max: 2789,
			average: 2567,
			critical: 3851,
		},
		hitRate: 95.8,
		criticalRate: 12.5,
	}

	return (
		<div className="bg-gray-50 py-6">
			<div className="container mx-auto px-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* 通常攻撃 */}
					<div className="bg-white rounded-lg border border-gray-200 p-4">
						<h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
							<svg
								className="mr-2 h-5 w-5 text-orange-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M13 10V3L4 14h7v7l9-11h-7z"
								/>
							</svg>
							通常攻撃
						</h3>
						<div className="space-y-2">
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">最小ダメージ:</span>
								<span className="text-sm font-semibold text-gray-900">
									{dummyDamageData.normalAttack.min.toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">最大ダメージ:</span>
								<span className="text-sm font-semibold text-gray-900">
									{dummyDamageData.normalAttack.max.toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">平均ダメージ:</span>
								<span className="text-sm font-semibold text-orange-600">
									{dummyDamageData.normalAttack.average.toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between border-t pt-2">
								<span className="text-sm text-gray-600">クリティカル:</span>
								<span className="text-sm font-semibold text-red-600">
									{dummyDamageData.normalAttack.critical.toLocaleString()}
								</span>
							</div>
						</div>
					</div>

					{/* スキル攻撃 */}
					<div className="bg-white rounded-lg border border-gray-200 p-4">
						<h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
							<svg
								className="mr-2 h-5 w-5 text-purple-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
								/>
							</svg>
							スキル攻撃
						</h3>
						<div className="space-y-2">
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">最小ダメージ:</span>
								<span className="text-sm font-semibold text-gray-900">
									{dummyDamageData.skillAttack.min.toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">最大ダメージ:</span>
								<span className="text-sm font-semibold text-gray-900">
									{dummyDamageData.skillAttack.max.toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">平均ダメージ:</span>
								<span className="text-sm font-semibold text-purple-600">
									{dummyDamageData.skillAttack.average.toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between border-t pt-2">
								<span className="text-sm text-gray-600">クリティカル:</span>
								<span className="text-sm font-semibold text-red-600">
									{dummyDamageData.skillAttack.critical.toLocaleString()}
								</span>
							</div>
						</div>
					</div>

					{/* 補助情報 */}
					<div className="bg-white rounded-lg border border-gray-200 p-4 md:col-span-2">
						<h3 className="text-lg font-semibold text-gray-900 mb-3">
							補助情報
						</h3>
						<div className="grid grid-cols-2 gap-4">
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">命中率:</span>
								<span className="text-sm font-semibold text-green-600">
									{dummyDamageData.hitRate}%
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">クリティカル率:</span>
								<span className="text-sm font-semibold text-blue-600">
									{dummyDamageData.criticalRate}%
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* 注意書き */}
				<div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
					<div className="flex">
						<svg
							className="flex-shrink-0 h-5 w-5 text-yellow-400"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fillRule="evenodd"
								d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
								clipRule="evenodd"
							/>
						</svg>
						<div className="ml-3">
							<p className="text-sm text-yellow-700">
								<strong>開発中:</strong>{' '}
								これは表示確認用のダミーデータです。実際のダメージ計算ロジックは将来実装予定です。
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
