'use client'

import { useState } from 'react'

interface VerifyData {
	id: string
	selfLevel: number
	attack: number
	enemyLevel: number
	normalDamage: number
	boostedDamage: number
}

export default function VerifyPage() {
	const [selfLevel, setSelfLevel] = useState(305)
	const [attack, setAttack] = useState(1)
	const [enemyLevel, setEnemyLevel] = useState(1)
	const [normalDamage, setNormalDamage] = useState(0)
	const [boostedDamage, setBoostedDamage] = useState(0)
	const [verifyDataList, setVerifyDataList] = useState<VerifyData[]>([])
	const [isVerifying, setIsVerifying] = useState(false)

	// 入力値の文字列表示状態を管理
	const [selfLevelDisplay, setSelfLevelDisplay] = useState('305')
	const [attackDisplay, setAttackDisplay] = useState('')
	const [enemyLevelDisplay, setEnemyLevelDisplay] = useState('')
	const [normalDamageDisplay, setNormalDamageDisplay] = useState('')
	const [boostedDamageDisplay, setBoostedDamageDisplay] = useState('')

	// 物理耐性を計算する関数
	const calculatePhysicalResistance = (
		normalDamage: number,
		boostedDamage: number,
	): number => {
		// 公式: 100 - ATK+100の場合のダメージ + 与えたダメージ
		const resistance = 100 - boostedDamage + normalDamage
		return Math.round(resistance * 10) / 10 // 小数点第1位で四捨五入
	}

	// 検証データから物理耐性の平均値を計算
	const getAveragePhysicalResistance = (): number => {
		if (verifyDataList.length === 0) return 0

		const resistances = verifyDataList.map((data) =>
			calculatePhysicalResistance(data.normalDamage, data.boostedDamage),
		)

		const average =
			resistances.reduce((sum, resistance) => sum + resistance, 0) /
			resistances.length
		return Math.round(average * 10) / 10
	}

	// DEFを計算する関数
	const calculateDEF = (
		selfLevel: number,
		attack: number,
		enemyLevel: number,
		physicalResistance: number,
		normalDamage: number,
	): number => {
		// 公式: (自Lv+ATK-敵Lv)×(1-物理耐性/100) - 与えたダメージ
		const baseDamage =
			(selfLevel + attack - enemyLevel) * (1 - physicalResistance / 100)
		const def = baseDamage - normalDamage
		return Math.round(def * 10) / 10 // 小数点第1位で四捨五入
	}

	// 検証データからDEFの平均値を計算
	const getAverageDEF = (): number => {
		if (verifyDataList.length === 0) return 0

		const defs = verifyDataList.map((data) => {
			const physicalResistance = calculatePhysicalResistance(
				data.normalDamage,
				data.boostedDamage,
			)
			return calculateDEF(
				data.selfLevel,
				data.attack,
				data.enemyLevel,
				physicalResistance,
				data.normalDamage,
			)
		})

		const average = defs.reduce((sum, def) => sum + def, 0) / defs.length
		return Math.round(average * 10) / 10
	}

	const handleAddVerifyData = () => {
		if (normalDamage <= 0) {
			alert('与えたダメージを入力してください')
			return
		}

		if (boostedDamage <= 0) {
			alert('ATK+100の場合のダメージを入力してください')
			return
		}

		const newData: VerifyData = {
			id: `${Date.now()}_${Math.random()}`,
			selfLevel,
			attack,
			enemyLevel,
			normalDamage,
			boostedDamage,
		}

		setVerifyDataList((prev) => [...prev, newData])
	}

	const handleStartVerification = () => {
		if (verifyDataList.length === 0) {
			alert('検証データを追加してください')
			return
		}
		setIsVerifying(true)
		// TODO: 検証ロジックを実装
		setTimeout(() => {
			setIsVerifying(false)
		}, 1000)
	}

	const handleClearData = () => {
		setVerifyDataList([])
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900">
						物理耐性・DEF検証ツール
					</h1>
					<p className="mt-2 text-lg text-gray-600">
						実際のダメージと計算値を比較して物理耐性とDEFを推定します
					</p>
				</div>

				<div className="bg-white shadow rounded-lg">
					<div className="px-4 py-5 sm:p-6">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
							{/* 検証設定セクション */}
							<div>
								<h2 className="text-xl font-semibold text-gray-900 mb-4">
									パラメータ入力
								</h2>
								<div className="space-y-4">
									<div>
										<label
											htmlFor="selfLevel"
											className="block text-sm font-medium text-gray-700 mb-2"
										>
											自分のレベル
										</label>
										<input
											id="selfLevel"
											type="number"
											min="1"
											max="305"
											value={selfLevelDisplay}
											onChange={(e) => {
												const value = e.target.value
												setSelfLevelDisplay(value)

												if (value === '') {
													setSelfLevel(305) // 計算用はデフォルト値を保持
												} else {
													const parsed = Number.parseInt(value, 10)
													if (!Number.isNaN(parsed)) {
														setSelfLevel(Math.max(1, parsed))
													}
												}
											}}
											className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
										/>
									</div>

									<div>
										<label
											htmlFor="attack"
											className="block text-sm font-medium text-gray-700 mb-2"
										>
											ATK（攻撃力）
										</label>
										<input
											id="attack"
											type="number"
											min="1"
											max="99999"
											value={attackDisplay}
											onChange={(e) => {
												const value = e.target.value
												setAttackDisplay(value)

												if (value === '') {
													setAttack(1) // 計算用は最小値を保持
												} else {
													const parsed = Number.parseInt(value, 10)
													if (!Number.isNaN(parsed)) {
														setAttack(Math.max(1, parsed))
													}
												}
											}}
											placeholder="ATKを入力"
											className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
										/>
									</div>

									<div>
										<label
											htmlFor="enemyLevel"
											className="block text-sm font-medium text-gray-700 mb-2"
										>
											敵のレベル
										</label>
										<input
											id="enemyLevel"
											type="number"
											min="1"
											max="300"
											value={enemyLevelDisplay}
											onChange={(e) => {
												const value = e.target.value
												setEnemyLevelDisplay(value)

												if (value === '') {
													setEnemyLevel(1) // 計算用は最小値を保持
												} else {
													const parsed = Number.parseInt(value, 10)
													if (!Number.isNaN(parsed)) {
														setEnemyLevel(Math.max(1, parsed))
													}
												}
											}}
											placeholder="敵のレベルを入力"
											className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
										/>
									</div>

									<div>
										<label
											htmlFor="normalDamage"
											className="block text-sm font-medium text-gray-700 mb-2"
										>
											与えたダメージ
										</label>
										<input
											id="normalDamage"
											type="number"
											min="0"
											max="999999"
											value={normalDamageDisplay}
											onChange={(e) => {
												const value = e.target.value
												setNormalDamageDisplay(value)

												if (value === '') {
													setNormalDamage(0)
												} else {
													const parsed = Number.parseInt(value, 10)
													if (!Number.isNaN(parsed)) {
														setNormalDamage(Math.max(0, parsed))
													}
												}
											}}
											className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
										/>
									</div>

									<div>
										<label
											htmlFor="boostedDamage"
											className="block text-sm font-medium text-gray-700 mb-2"
										>
											ATK+100の場合のダメージ
										</label>
										<input
											id="boostedDamage"
											type="number"
											min="0"
											max="999999"
											value={boostedDamageDisplay}
											onChange={(e) => {
												const value = e.target.value
												setBoostedDamageDisplay(value)

												if (value === '') {
													setBoostedDamage(0)
												} else {
													const parsed = Number.parseInt(value, 10)
													if (!Number.isNaN(parsed)) {
														setBoostedDamage(Math.max(0, parsed))
													}
												}
											}}
											className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
										/>
									</div>

									<div className="pt-4 space-y-2">
										<button
											type="button"
											onClick={handleAddVerifyData}
											className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
										>
											検証データを追加
										</button>
										<button
											type="button"
											onClick={handleStartVerification}
											disabled={isVerifying || verifyDataList.length === 0}
											className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
										>
											{isVerifying ? '検証中...' : '検証開始'}
										</button>
										<button
											type="button"
											onClick={handleClearData}
											className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
										>
											データクリア
										</button>
									</div>
								</div>
							</div>

							{/* 結果表示セクション */}
							<div>
								<h2 className="text-xl font-semibold text-gray-900 mb-4">
									検証データ一覧 ({verifyDataList.length}件)
								</h2>
								<div className="bg-gray-50 rounded-lg p-4 max-h-[400px] overflow-y-auto">
									{verifyDataList.length === 0 ? (
										<p className="text-gray-500 text-center py-8">
											「検証データを追加」ボタンを押してデータを追加してください
										</p>
									) : (
										<div className="space-y-2">
											{verifyDataList.map((data, index) => (
												<div
													key={data.id}
													className="bg-white p-3 rounded border flex justify-between items-center"
												>
													<div className="text-sm">
														<span className="font-medium">#{index + 1}</span>
														<span className="ml-4">自Lv:{data.selfLevel}</span>
														<span className="ml-4">ATK:{data.attack}</span>
														<span className="ml-4">敵Lv:{data.enemyLevel}</span>
														<span className="ml-4 text-red-600 font-medium">
															通常:{data.normalDamage}
														</span>
														<span className="ml-4 text-blue-600 font-medium">
															+100:{data.boostedDamage}
														</span>
													</div>
													<button
														type="button"
														onClick={() =>
															setVerifyDataList((prev) =>
																prev.filter((item) => item.id !== data.id),
															)
														}
														className="text-red-500 hover:text-red-700 text-sm"
													>
														削除
													</button>
												</div>
											))}
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* 検証結果セクション */}
				<div className="mt-8 bg-white shadow rounded-lg">
					<div className="px-4 py-5 sm:p-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-4">
							検証結果
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
							<div className="bg-blue-50 p-4 rounded-lg">
								<h3 className="font-medium text-blue-900 mb-2">推定DEF</h3>
								<p className="text-2xl font-bold text-blue-700">
									{verifyDataList.length > 0 ? getAverageDEF() : '-'}
								</p>
								<p className="text-sm text-blue-600 mt-1">
									{verifyDataList.length > 0
										? `${verifyDataList.length}件のデータから算出`
										: '検証データが不足しています'}
								</p>
							</div>
							<div className="bg-green-50 p-4 rounded-lg">
								<h3 className="font-medium text-green-900 mb-2">
									推定物理耐性
								</h3>
								<p className="text-2xl font-bold text-green-700">
									{verifyDataList.length > 0
										? `${getAveragePhysicalResistance()}%`
										: '-%'}
								</p>
								<p className="text-sm text-green-600 mt-1">
									{verifyDataList.length > 0
										? `${verifyDataList.length}件のデータから算出`
										: '検証データが不足しています'}
								</p>
							</div>
						</div>

						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											No.
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											自Lv
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											ATK
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											敵Lv
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											通常ダメージ
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											ATK+100ダメージ
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											物理耐性
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											推定DEF
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{verifyDataList.length === 0 ? (
										<tr>
											<td
												colSpan={8}
												className="px-6 py-4 text-center text-gray-500"
											>
												検証データがありません
											</td>
										</tr>
									) : (
										verifyDataList.map((data, index) => (
											<tr key={data.id}>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
													{index + 1}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
													{data.selfLevel}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
													{data.attack}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
													{data.enemyLevel}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
													{data.normalDamage}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
													{data.boostedDamage}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
													{calculatePhysicalResistance(
														data.normalDamage,
														data.boostedDamage,
													)}
													%
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
													{(() => {
														const physicalResistance =
															calculatePhysicalResistance(
																data.normalDamage,
																data.boostedDamage,
															)
														return calculateDEF(
															data.selfLevel,
															data.attack,
															data.enemyLevel,
															physicalResistance,
															data.normalDamage,
														)
													})()}
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
