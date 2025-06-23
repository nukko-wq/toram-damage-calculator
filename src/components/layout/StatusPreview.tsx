import { useCalculatorStore } from '@/stores'

interface StatusPreviewProps {
	isVisible: boolean
}

export default function StatusPreview({ isVisible }: StatusPreviewProps) {
	const { data } = useCalculatorStore()

	if (!isVisible) {
		return null
	}

	// 基本的なステータス情報を表示（簡易版）
	const basicStats = data.baseStats
	
	// 武器情報
	const mainWeapon = data.mainWeapon
	const subWeapon = data.subWeapon

	// 簡易計算（実際の計算ロジックは将来実装）
	const calculatedStats = {
		totalHP: Math.floor(100 + basicStats.VIT * 2.5 + basicStats.level * 5),
		totalMP: Math.floor(50 + basicStats.INT * 2 + basicStats.MEN * 1.5 + basicStats.level * 2),
		totalATK: Math.floor(mainWeapon.ATK + basicStats.STR * 1.5),
		totalMATK: Math.floor(basicStats.INT * 2 + basicStats.MEN * 1.5),
		hitRate: Math.floor(basicStats.DEX * 1.5 + basicStats.level),
		dodgeRate: Math.floor(basicStats.AGI * 1.8 + basicStats.level * 0.5),
	}

	return (
		<div className="bg-gray-50 py-6">
			<div className="container mx-auto px-4">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{/* 基本ステータス */}
					<div className="bg-white rounded-lg border border-gray-200 p-4">
						<h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
							<svg
								className="mr-2 h-5 w-5 text-blue-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
								/>
							</svg>
							基本ステータス
						</h3>
						<div className="space-y-2">
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">レベル:</span>
								<span className="text-sm font-semibold text-gray-900">
									{basicStats.level}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">STR:</span>
								<span className="text-sm font-semibold text-gray-900">
									{basicStats.STR}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">INT:</span>
								<span className="text-sm font-semibold text-gray-900">
									{basicStats.INT}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">VIT:</span>
								<span className="text-sm font-semibold text-gray-900">
									{basicStats.VIT}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">AGI:</span>
								<span className="text-sm font-semibold text-gray-900">
									{basicStats.AGI}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">DEX:</span>
								<span className="text-sm font-semibold text-gray-900">
									{basicStats.DEX}
								</span>
							</div>
						</div>
					</div>

					{/* 計算後ステータス */}
					<div className="bg-white rounded-lg border border-gray-200 p-4">
						<h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
							<svg
								className="mr-2 h-5 w-5 text-green-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
								/>
							</svg>
							計算後ステータス
						</h3>
						<div className="space-y-2">
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">HP:</span>
								<span className="text-sm font-semibold text-green-600">
									{calculatedStats.totalHP.toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">MP:</span>
								<span className="text-sm font-semibold text-blue-600">
									{calculatedStats.totalMP.toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">ATK:</span>
								<span className="text-sm font-semibold text-red-600">
									{calculatedStats.totalATK.toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">MATK:</span>
								<span className="text-sm font-semibold text-purple-600">
									{calculatedStats.totalMATK.toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">命中:</span>
								<span className="text-sm font-semibold text-yellow-600">
									{calculatedStats.hitRate.toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">回避:</span>
								<span className="text-sm font-semibold text-indigo-600">
									{calculatedStats.dodgeRate.toLocaleString()}
								</span>
							</div>
						</div>
					</div>

					{/* 武器情報 */}
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
							装備武器
						</h3>
						<div className="space-y-3">
							<div>
								<div className="text-sm font-medium text-gray-700">メイン武器:</div>
								<div className="text-sm text-gray-600">
									{mainWeapon.weaponType} (ATK: {mainWeapon.ATK}, 安定率: {mainWeapon.stability}%)
								</div>
							</div>
							<div>
								<div className="text-sm font-medium text-gray-700">サブ武器:</div>
								<div className="text-sm text-gray-600">
									{subWeapon.weaponType} (ATK: {subWeapon.ATK}, 安定率: {subWeapon.stability}%)
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* 注意書き */}
				<div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
					<div className="flex">
						<svg
							className="flex-shrink-0 h-5 w-5 text-blue-400"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fillRule="evenodd"
								d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
								clipRule="evenodd"
							/>
						</svg>
						<div className="ml-3">
							<p className="text-sm text-blue-700">
								<strong>簡易計算:</strong>{' '}
								これは基本的な計算結果のプレビューです。詳細な計算結果は「ステータス確認」の詳細表示で確認できます。
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}