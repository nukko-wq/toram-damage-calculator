'use client'

import { useState } from 'react'
import NecromancerSkillVerificationForm from './components/NecromancerSkillVerificationForm'
import VerificationResults from './components/VerificationResults'
import { calculateSkillParameters } from './utils/skillVerificationCalculation'

interface FormData {
	playerLevel: number
	atk: number
	actualDamage: number
}

export default function NecromancerSkillsPage() {
	const [results, setResults] = useState<{
		skillMultiplier: number
		skillFixedDamage: number
		baseDamage: number
		calculationSteps: {
			step1_baseDamage: number
			step2_afterFixed: number
			step3_afterElement: number
			step4_afterSkill: number
		}
	} | null>(null)

	const handleCalculate = (data: FormData) => {
		const calculationResults = calculateSkillParameters(data)
		setResults(calculationResults)
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="container mx-auto px-4">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						ネクロマンサースキル検証
					</h1>
					<p className="text-gray-600">
						物理系ネクロマンサースキルの倍率と固定値を実測ダメージから逆算して求めることができます
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* 入力フォーム */}
					<div className="bg-white rounded-lg shadow-lg p-6">
						<h2 className="text-xl font-semibold text-gray-800 mb-6">
							パラメータ入力
						</h2>
						<NecromancerSkillVerificationForm onCalculate={handleCalculate} />
					</div>

					{/* 結果表示 */}
					<div className="bg-white rounded-lg shadow-lg p-6">
						<h2 className="text-xl font-semibold text-gray-800 mb-6">
							計算結果
						</h2>
						<VerificationResults results={results} />
					</div>
				</div>

				{/* 使用方法説明 */}
				<div className="mt-8 bg-white rounded-lg shadow-lg p-6">
					<h2 className="text-xl font-semibold text-gray-800 mb-4">使用方法</h2>
					<div className="prose max-w-none">
						<ol className="list-decimal list-inside space-y-2 text-gray-700">
							<li>キャラクターの基本情報（レベル、ATK）を入力します</li>
							<li>検証したい物理系ネクロマンサースキルを使用して敵にダメージを与えます</li>
							<li>「与えたダメージ」欄に実測値を入力します</li>
							<li>
								「スキル倍率・固定値を計算」ボタンを押すと、推定されたスキルの倍率と固定値が表示されます
							</li>
						</ol>

						<h3 className="text-lg font-semibold mt-6 mb-2">完全理想条件での計算</h3>
						<ul className="list-disc list-inside space-y-1 text-gray-700">
							<li><strong>敵条件</strong>: レベル1、DEF/MDEF=0、物魔耐性=0%</li>
							<li><strong>バフ条件</strong>: コンボ、パッシブ、ブレイブ、抜刀%、慣れ、距離補正は全て無効</li>
							<li><strong>安定率</strong>: 100%（ダメージ変動なし）</li>
							<li><strong>属性有利</strong>: 0%（属性補正なし）</li>
							<li><strong>クリティカル</strong>: 使用しない（通常ダメージのみ）</li>
							<li><strong>計算式</strong>: 実測ダメージ = INT((自Lv + ATK - 1 + 固定値) × スキル倍率/100)</li>
							<li><strong>最適環境</strong>: ダミー人形での検証が最も正確（条件が完全に一致）</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	)
}
