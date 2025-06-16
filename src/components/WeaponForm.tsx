'use client'

import {
	MainWeapon,
	SubWeapon,
	WeaponType,
	SubWeaponType,
} from '@/types/calculator'

interface WeaponFormProps {
	mainWeapon: MainWeapon
	subWeapon: SubWeapon
	onMainWeaponChange: (weapon: MainWeapon) => void
	onSubWeaponChange: (weapon: SubWeapon) => void
}

export default function WeaponForm({
	mainWeapon,
	subWeapon,
	onMainWeaponChange,
	onSubWeaponChange,
}: WeaponFormProps) {
	const weaponTypes: WeaponType[] = [
		'片手剣',
		'双剣',
		'両手剣',
		'手甲',
		'旋風槍',
		'抜刀剣',
		'弓',
		'自動弓',
		'杖',
		'魔導具',
		'素手',
	]

	const subWeaponTypes: SubWeaponType[] = ['ナイフ', '矢', 'なし']

	const handleMainWeaponChange = (
		field: keyof MainWeapon,
		value: string | number,
	) => {
		let processedValue: string | number = value
		if (field !== 'weaponType') {
			processedValue = typeof value === 'string' ? parseInt(value) || 0 : value
		}

		onMainWeaponChange({
			...mainWeapon,
			[field]: processedValue,
		})
	}

	const handleSubWeaponChange = (
		field: keyof SubWeapon,
		value: string | number,
	) => {
		let processedValue: string | number = value
		if (field !== 'weaponType') {
			processedValue = typeof value === 'string' ? parseInt(value) || 0 : value
		}

		onSubWeaponChange({
			...subWeapon,
			[field]: processedValue,
		})
	}

	return (
		<section className="bg-white rounded-lg shadow-md p-6">
			<h2 className="text-xl font-bold text-gray-800 mb-4">武器情報</h2>

			{/* メイン武器 */}
			<div className="mb-6">
				<h3 className="text-lg font-semibold text-gray-700 mb-3">メイン武器</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<div className="flex flex-col">
						<label className="text-sm font-medium text-gray-700 mb-1">
							武器種
						</label>
						<select
							value={mainWeapon.weaponType}
							onChange={(e) =>
								handleMainWeaponChange(
									'weaponType',
									e.target.value as WeaponType,
								)
							}
							className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						>
							{weaponTypes.map((type) => (
								<option key={type} value={type}>
									{type}
								</option>
							))}
						</select>
					</div>

					<div className="flex flex-col">
						<label className="text-sm font-medium text-gray-700 mb-1">
							武器ATK
						</label>
						<input
							type="number"
							value={mainWeapon.ATK}
							onChange={(e) => handleMainWeaponChange('ATK', e.target.value)}
							className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							min="0"
						/>
					</div>

					<div className="flex flex-col">
						<label className="text-sm font-medium text-gray-700 mb-1">
							安定率
						</label>
						<input
							type="number"
							value={mainWeapon.stability}
							onChange={(e) =>
								handleMainWeaponChange('stability', e.target.value)
							}
							className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							min="0"
							max="100"
						/>
					</div>

					<div className="flex flex-col">
						<label className="text-sm font-medium text-gray-700 mb-1">
							精錬値
						</label>
						<input
							type="number"
							value={mainWeapon.refinement}
							onChange={(e) =>
								handleMainWeaponChange('refinement', e.target.value)
							}
							className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							min="0"
							max="15"
						/>
					</div>
				</div>
			</div>

			{/* サブ武器 */}
			<div>
				<h3 className="text-lg font-semibold text-gray-700 mb-3">サブ武器</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="flex flex-col">
						<label className="text-sm font-medium text-gray-700 mb-1">
							武器種
						</label>
						<select
							value={subWeapon.weaponType}
							onChange={(e) =>
								handleSubWeaponChange(
									'weaponType',
									e.target.value as SubWeaponType,
								)
							}
							className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						>
							{subWeaponTypes.map((type) => (
								<option key={type} value={type}>
									{type}
								</option>
							))}
						</select>
					</div>

					<div className="flex flex-col">
						<label className="text-sm font-medium text-gray-700 mb-1">
							精錬値
						</label>
						<input
							type="number"
							value={subWeapon.refinement}
							onChange={(e) =>
								handleSubWeaponChange('refinement', e.target.value)
							}
							className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							min="0"
							max="15"
						/>
					</div>
				</div>
			</div>
		</section>
	)
}
