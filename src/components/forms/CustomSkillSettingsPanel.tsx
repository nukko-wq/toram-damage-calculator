'use client'

import React from 'react'
import { useCustomSkillStore } from '../../stores/customSkillStore'
import type { CustomSkillSettings } from '../../stores/customSkillStore'

interface CustomSkillSettingsPanelProps {
	isVisible: boolean
}

export default function CustomSkillSettingsPanel({
	isVisible,
}: CustomSkillSettingsPanelProps) {
	const {
		settings,
		updateSettings,
		resetSettings,
		savedPresets,
		savePreset,
		loadPreset,
		deletePreset,
	} = useCustomSkillStore()

	// フォーム値の直接更新
	const handleInputChange = (
		field: keyof CustomSkillSettings,
		value: string | number | boolean,
	) => {
		updateSettings({ [field]: value })
	}

	const handleReset = () => {
		resetSettings()
	}

	const handleSavePreset = () => {
		const presetName = prompt('プリセット名を入力してください:')
		if (presetName) {
			savePreset(presetName)
		}
	}

	const handleLoadPreset = (presetName: string) => {
		loadPreset(presetName)
	}

	if (!isVisible) {
		return null
	}

	return (
		<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-lg font-semibold text-yellow-800">
					カスタムスキル設定
				</h3>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={handleSavePreset}
						className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
					>
						プリセット保存
					</button>
					<button
						type="button"
						onClick={handleReset}
						className="text-sm bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
					>
						リセット
					</button>
				</div>
			</div>

			<div className="space-y-6">
				{/* 基本威力設定 */}
				<div className="space-y-4">
					<h4 className="font-medium text-gray-700">◆ 基本設定</h4>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								スキル名
							</label>
							<input
								value={settings.name}
								type="text"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								onChange={(e) => handleInputChange('name', e.target.value)}
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								消費MP
							</label>
							<input
								value={settings.mpCost}
								type="number"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								onChange={(e) =>
									handleInputChange('mpCost', Number(e.target.value))
								}
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								倍率 (%)
							</label>
							<input
								value={settings.multiplier}
								type="number"
								step="1"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								onChange={(e) =>
									handleInputChange('multiplier', Number(e.target.value))
								}
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								固定値
							</label>
							<input
								value={settings.fixedDamage}
								type="number"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								onChange={(e) =>
									handleInputChange('fixedDamage', Number(e.target.value))
								}
							/>
						</div>
					</div>
				</div>

				{/* スキルタイプ設定 */}
				<div className="space-y-4">
					<h4 className="font-medium text-gray-700">◆ スキルタイプ</h4>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								攻撃タイプ
							</label>
							<div className="space-y-2">
								<label className="flex items-center">
									<input
										type="radio"
										value="physical"
										checked={settings.attackType === 'physical'}
										className="mr-2"
										onChange={() => handleInputChange('attackType', 'physical')}
									/>
									物理
								</label>
								<label className="flex items-center">
									<input
										type="radio"
										value="magical"
										checked={settings.attackType === 'magical'}
										className="mr-2"
										onChange={() => handleInputChange('attackType', 'magical')}
									/>
									魔法
								</label>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								威力参照
							</label>
							<select
								value={settings.powerReference}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								onChange={(e) =>
									handleInputChange('powerReference', e.target.value)
								}
							>
								<option value="totalATK">総ATK</option>
								<option value="ATK">ATK</option>
								<option value="MATK">MATK</option>
								<option value="spearMATK">槍MATK</option>
							</select>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								参照防御力
							</label>
							<select
								value={settings.referenceDefense}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								onChange={(e) =>
									handleInputChange('referenceDefense', e.target.value)
								}
							>
								<option value="DEF">DEF</option>
								<option value="MDEF">MDEF</option>
								<option value="none">無し</option>
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								参照耐性
							</label>
							<select
								value={settings.referenceResistance}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								onChange={(e) =>
									handleInputChange('referenceResistance', e.target.value)
								}
							>
								<option value="physical">物理</option>
								<option value="magical">魔法</option>
								<option value="none">無し</option>
							</select>
						</div>
					</div>
				</div>

				{/* 慣れ設定 */}
				<div className="space-y-4">
					<h4 className="font-medium text-gray-700">◆ 慣れ設定</h4>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								慣れ参照
							</label>
							<select
								value={settings.adaptation}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								onChange={(e) =>
									handleInputChange('adaptation', e.target.value)
								}
							>
								<option value="physical">物理</option>
								<option value="magical">魔法</option>
								<option value="normal">通常</option>
								<option value="none">無し</option>
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								慣れ付与
							</label>
							<select
								value={settings.adaptationGrant}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								onChange={(e) =>
									handleInputChange('adaptationGrant', e.target.value)
								}
							>
								<option value="physical">物理</option>
								<option value="magical">魔法</option>
								<option value="normal">通常</option>
								<option value="none">無し</option>
							</select>
						</div>
					</div>
				</div>

				{/* 威力補正設定 */}
				<div className="space-y-4">
					<h4 className="font-medium text-gray-700">◆ 威力補正</h4>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								距離威力
							</label>
							<select
								value={settings.distancePower}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								onChange={(e) =>
									handleInputChange('distancePower', e.target.value)
								}
							>
								<option value="none">無し</option>
								<option value="short">近距離</option>
								<option value="long">遠距離</option>
							</select>
						</div>

						<div className="flex items-center">
							<label className="flex items-center">
								<input
									type="checkbox"
									checked={settings.canUseUnsheathePower}
									className="mr-2"
									onChange={(e) =>
										handleInputChange('canUseUnsheathePower', e.target.checked)
									}
								/>
								抜刀威力適用
							</label>
						</div>

						<div className="flex items-center">
							<label className="flex items-center">
								<input
									type="checkbox"
									checked={settings.canUseLongRange}
									className="mr-2"
									onChange={(e) =>
										handleInputChange('canUseLongRange', e.target.checked)
									}
								/>
								ロングレンジ適用
							</label>
						</div>
					</div>
				</div>

				{/* プリセット管理 */}
				{Object.keys(savedPresets).length > 0 && (
					<div className="space-y-4">
						<h4 className="font-medium text-gray-700">◆ 保存済みプリセット</h4>
						<div className="flex flex-wrap gap-2">
							{Object.keys(savedPresets).map((presetName) => (
								<div
									key={presetName}
									className="flex items-center gap-2 bg-gray-100 rounded px-3 py-2"
								>
									<span className="text-sm">{presetName}</span>
									<button
										type="button"
										onClick={() => handleLoadPreset(presetName)}
										className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
									>
										読込
									</button>
									<button
										type="button"
										onClick={() => deletePreset(presetName)}
										className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
									>
										削除
									</button>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
