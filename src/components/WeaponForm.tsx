'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { mainWeaponSchema, subWeaponSchema, type MainWeaponFormData, type SubWeaponFormData } from '@/schemas/weapons'
import type {
	MainWeapon,
	SubWeapon,
	WeaponType,
	SubWeaponType,
} from '@/types/calculator'
import { useEffect } from 'react'

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

	// メイン武器フォーム
	const {
		register: registerMain,
		watch: watchMain,
		formState: { errors: errorsMain },
		reset: resetMain,
		setValue: setValueMain,
		getValues: getValuesMain,
	} = useForm<MainWeaponFormData>({
		resolver: zodResolver(mainWeaponSchema),
		defaultValues: mainWeapon,
		mode: 'onChange',
	})

	// サブ武器フォーム
	const {
		register: registerSub,
		watch: watchSub,
		formState: { errors: errorsSub },
		reset: resetSub,
		setValue: setValueSub,
		getValues: getValuesSub,
	} = useForm<SubWeaponFormData>({
		resolver: zodResolver(subWeaponSchema),
		defaultValues: subWeapon,
		mode: 'onChange',
	})

	// 入力値を範囲内に制限する関数（メイン武器）
	const handleMainBlur = (fieldName: keyof MainWeaponFormData) => {
		const value = getValuesMain(fieldName)
		if (typeof value !== 'number') return

		let min = 0
		let max = 1500

		if (fieldName === 'stability') {
			max = 100
		} else if (fieldName === 'refinement') {
			max = 15
		}

		if (value < min) {
			setValueMain(fieldName, min, { shouldValidate: true })
		} else if (value > max) {
			setValueMain(fieldName, max, { shouldValidate: true })
		}
	}

	// 入力値を範囲内に制限する関数（サブ武器）
	const handleSubBlur = (fieldName: keyof SubWeaponFormData) => {
		const value = getValuesSub(fieldName)
		if (typeof value !== 'number') return

		let min = 0
		let max = 1500

		if (fieldName === 'stability') {
			max = 100
		} else if (fieldName === 'refinement') {
			max = 15
		}

		if (value < min) {
			setValueSub(fieldName, min, { shouldValidate: true })
		} else if (value > max) {
			setValueSub(fieldName, max, { shouldValidate: true })
		}
	}

	// 外部からの変更を反映
	useEffect(() => {
		resetMain(mainWeapon)
	}, [mainWeapon, resetMain])

	useEffect(() => {
		resetSub(subWeapon)
	}, [subWeapon, resetSub])

	// フォーム値変更を監視して親に通知（メイン武器）
	useEffect(() => {
		const subscription = watchMain((value) => {
			if (Object.values(value).every((v) => v !== undefined && v !== null) && 
				Object.keys(errorsMain).length === 0) {
				onMainWeaponChange(value as MainWeapon)
			}
		})
		return () => subscription.unsubscribe()
	}, [watchMain, onMainWeaponChange, errorsMain])

	// フォーム値変更を監視して親に通知（サブ武器）
	useEffect(() => {
		const subscription = watchSub((value) => {
			if (Object.values(value).every((v) => v !== undefined && v !== null) && 
				Object.keys(errorsSub).length === 0) {
				onSubWeaponChange(value as SubWeapon)
			}
		})
		return () => subscription.unsubscribe()
	}, [watchSub, onSubWeaponChange, errorsSub])

	return (
		<section className="bg-white rounded-lg shadow-md p-6 lg:col-start-1 lg:col-end-3 lg:row-start-2 lg:row-end-3">
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
							className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							{...registerMain('weaponType')}
						>
							{weaponTypes.map((type) => (
								<option key={type} value={type}>
									{type}
								</option>
							))}
						</select>
						{errorsMain.weaponType && (
							<p className="text-red-500 text-xs mt-1">{errorsMain.weaponType.message}</p>
						)}
					</div>

					<div className="flex flex-col">
						<label className="text-sm font-medium text-gray-700 mb-1">
							武器ATK
						</label>
						<input
							type="number"
							className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
								errorsMain.ATK ? 'border-red-500' : 'border-gray-300'
							}`}
							min="0"
							max="1500"
							{...registerMain('ATK', { 
								valueAsNumber: true,
								onBlur: () => handleMainBlur('ATK')
							})}
						/>
						{errorsMain.ATK && (
							<p className="text-red-500 text-xs mt-1">{errorsMain.ATK.message}</p>
						)}
					</div>

					<div className="flex flex-col">
						<label className="text-sm font-medium text-gray-700 mb-1">
							安定率
						</label>
						<input
							type="number"
							className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
								errorsMain.stability ? 'border-red-500' : 'border-gray-300'
							}`}
							min="0"
							max="100"
							{...registerMain('stability', { 
								valueAsNumber: true,
								onBlur: () => handleMainBlur('stability')
							})}
						/>
						{errorsMain.stability && (
							<p className="text-red-500 text-xs mt-1">{errorsMain.stability.message}</p>
						)}
					</div>

					<div className="flex flex-col">
						<label className="text-sm font-medium text-gray-700 mb-1">
							精錬値
						</label>
						<input
							type="number"
							className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
								errorsMain.refinement ? 'border-red-500' : 'border-gray-300'
							}`}
							min="0"
							max="15"
							{...registerMain('refinement', { 
								valueAsNumber: true,
								onBlur: () => handleMainBlur('refinement')
							})}
						/>
						{errorsMain.refinement && (
							<p className="text-red-500 text-xs mt-1">{errorsMain.refinement.message}</p>
						)}
					</div>
				</div>
			</div>

			{/* サブ武器 */}
			<div>
				<h3 className="text-lg font-semibold text-gray-700 mb-3">サブ武器</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<div className="flex flex-col">
						<label className="text-sm font-medium text-gray-700 mb-1">
							武器種
						</label>
						<select
							className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							{...registerSub('weaponType')}
						>
							{subWeaponTypes.map((type) => (
								<option key={type} value={type}>
									{type}
								</option>
							))}
						</select>
						{errorsSub.weaponType && (
							<p className="text-red-500 text-xs mt-1">{errorsSub.weaponType.message}</p>
						)}
					</div>

					<div className="flex flex-col">
						<label className="text-sm font-medium text-gray-700 mb-1">
							武器ATK
						</label>
						<input
							type="number"
							className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
								errorsSub.ATK ? 'border-red-500' : 'border-gray-300'
							}`}
							min="0"
							max="1500"
							{...registerSub('ATK', { 
								valueAsNumber: true,
								onBlur: () => handleSubBlur('ATK')
							})}
						/>
						{errorsSub.ATK && (
							<p className="text-red-500 text-xs mt-1">{errorsSub.ATK.message}</p>
						)}
					</div>

					<div className="flex flex-col">
						<label className="text-sm font-medium text-gray-700 mb-1">
							安定率
						</label>
						<input
							type="number"
							className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
								errorsSub.stability ? 'border-red-500' : 'border-gray-300'
							}`}
							min="0"
							max="100"
							{...registerSub('stability', { 
								valueAsNumber: true,
								onBlur: () => handleSubBlur('stability')
							})}
						/>
						{errorsSub.stability && (
							<p className="text-red-500 text-xs mt-1">{errorsSub.stability.message}</p>
						)}
					</div>

					<div className="flex flex-col">
						<label className="text-sm font-medium text-gray-700 mb-1">
							精錬値
						</label>
						<input
							type="number"
							className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
								errorsSub.refinement ? 'border-red-500' : 'border-gray-300'
							}`}
							min="0"
							max="15"
							{...registerSub('refinement', { 
								valueAsNumber: true,
								onBlur: () => handleSubBlur('refinement')
							})}
						/>
						{errorsSub.refinement && (
							<p className="text-red-500 text-xs mt-1">{errorsSub.refinement.message}</p>
						)}
					</div>
				</div>
			</div>
		</section>
	)
}