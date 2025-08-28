'use client'

interface VerificationResultsProps {
	results?: {
		skillMultiplier: number
		skillFixedDamage: number
		baseDamage: number
		calculationSteps: {
			step1_baseDamage: number
			step2_afterFixed: number
			step3_afterElement: number
			step4_afterSkill: number
		}
	} | null
}

export default function VerificationResults({
	results,
}: VerificationResultsProps) {
	if (!results) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-500">
					パラメータを入力して計算ボタンを押してください
				</p>
			</div>
		)
	}

	const { skillMultiplier, skillFixedDamage, baseDamage, calculationSteps } =
		results

	return (
		<div className="space-y-6">
			{/* スキル情報 */}
			<div className="bg-blue-50 p-4 rounded-lg">
				<h3 className="text-lg font-semibold text-blue-800 mb-3">
					推定スキル情報
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<div className="text-sm text-blue-600">スキル倍率</div>
						<div className="text-xl font-bold text-blue-800">
							{skillMultiplier.toFixed(1)}%
						</div>
					</div>
					<div>
						<div className="text-sm text-blue-600">スキル固定値</div>
						<div className="text-xl font-bold text-blue-800">
							+{skillFixedDamage.toLocaleString()}
						</div>
					</div>
				</div>
			</div>

			{/* 計算過程 */}
			<div className="space-y-4">
				<h3 className="text-lg font-semibold text-gray-800">計算過程</h3>

				<div className="space-y-2">
					<div className="flex justify-between items-center py-2 border-b">
						<span className="text-sm text-gray-600">
							ステップ1: 基礎ダメージ
						</span>
						<span className="font-mono">
							{calculationSteps.step1_baseDamage.toLocaleString()}
						</span>
					</div>

					<div className="flex justify-between items-center py-2 border-b">
						<span className="text-sm text-gray-600">
							ステップ2: 固定値適用後
						</span>
						<span className="font-mono">
							{calculationSteps.step2_afterFixed.toLocaleString()}
						</span>
					</div>

					<div className="flex justify-between items-center py-2 border-b">
						<span className="text-sm text-gray-600">
							ステップ3: 属性有利適用後
						</span>
						<span className="font-mono">
							{calculationSteps.step3_afterElement.toLocaleString()}
						</span>
					</div>

					<div className="flex justify-between items-center py-2 border-b">
						<span className="text-sm text-gray-600">
							ステップ4: スキル倍率適用後
						</span>
						<span className="font-mono">
							{calculationSteps.step4_afterSkill.toLocaleString()}
						</span>
					</div>

					<div className="flex justify-between items-center py-2 bg-gray-50 rounded px-2 font-semibold">
						<span className="text-gray-800">最終基本ダメージ</span>
						<span className="font-mono text-lg">
							{baseDamage.toLocaleString()}
						</span>
					</div>
				</div>
			</div>

			{/* 検証情報 */}
			<div className="bg-blue-50 p-4 rounded-lg">
				<h4 className="text-sm font-semibold text-blue-800 mb-2">
					2点測定法による数学的解法結果
				</h4>
				<ul className="text-xs text-blue-700 space-y-1">
					<li>• <strong>解法方式</strong>: 2つの実測値から連立方程式を解いて算出</li>
					<li>• <strong>精度</strong>: 推測値ではなく数学的に正確な解</li>
					<li>• <strong>計算式</strong>: ダメージ = INT((Lv + ATK - 1 + 固定値) × 倍率/100)</li>
					<li>• <strong>測定条件</strong>: 理想条件（敵Lv1、全バフ無効、安定率100%）</li>
					<li>• <strong>測定方法</strong>: 通常ATK vs ATK+100での2回測定</li>
					<li>• <strong>推奨環境</strong>: ダミー人形での検証が最適</li>
				</ul>
			</div>
		</div>
	)
}
