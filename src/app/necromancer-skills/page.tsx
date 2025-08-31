'use client'

import { useState } from 'react'
import NecromancerSkillVerificationForm from './components/NecromancerSkillVerificationForm'
import VerificationResults from './components/VerificationResults'
import { calculateSkillParameters } from './utils/skillVerificationCalculation'

interface FormData {
	playerLevel: number
	baseAtk: number
	baseDamage: number
	enhancedDamage: number
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
						2点測定法により物理系ネクロマンサースキルの倍率と固定値を数学的に正確に求めることができます
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
							<li>キャラクターの基本情報（レベル、基準ATK）を入力します</li>
							<li>
								通常のATKで物理系ネクロマンサースキルを使用してダメージを測定します
							</li>
							<li>ATK+100した状態で同じスキルを使用してダメージを測定します</li>
							<li>2つのダメージ値を入力して計算ボタンを押します</li>
							<li>
								数学的解法により、スキルの倍率と固定値が正確に算出されます
							</li>
						</ol>

						<h3 className="text-lg font-semibold mt-6 mb-2">2点測定法の利点</h3>
						<ul className="list-disc list-inside space-y-1 text-gray-700">
							<li>
								<strong>数学的正確性</strong>:
								推測ではなく連立方程式による厳密解
							</li>
							<li>
								<strong>固定値も正確</strong>: スキル倍率と固定値を同時に算出
							</li>
							<li>
								<strong>検証の簡単さ</strong>: ATK+100の装備変更のみで実現可能
							</li>
							<li>
								<strong>誤差の最小化</strong>: 理想条件で測定誤差を排除
							</li>
						</ul>

						<h3 className="text-lg font-semibold mt-6 mb-2">理想測定条件</h3>
						<ul className="list-disc list-inside space-y-1 text-gray-700">
							<li>
								<strong>敵条件</strong>: レベル1、DEF/MDEF=0、物魔耐性=0%
							</li>
							<li>
								<strong>バフ条件</strong>: 全てのバフ効果が無効
							</li>
							<li>
								<strong>安定率</strong>: 100%（ダメージ変動なし）
							</li>
							<li>
								<strong>属性・クリティカル</strong>:
								使用しない（通常ダメージのみ）
							</li>
							<li>
								<strong>計算式</strong>: ダメージ = INT((Lv + ATK - 1 + 固定値)
								× 倍率/100)
							</li>
							<li>
								<strong>推奨環境</strong>: ダミー人形での検証が最適
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	)
}
