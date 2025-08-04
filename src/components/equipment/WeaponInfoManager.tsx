'use client'

import { useCalculatorStore } from '@/stores'
import {
	clearWeaponInfo,
	saveWeaponInfo,
	saveSubWeaponInfo,
} from '@/utils/weaponInfoStorage'

interface WeaponInfoManagerProps {
	slotKey: 'mainWeapon' | 'subWeapon'
	equipmentId?: string
	onMessage: (message: string) => void
	onUpdate: () => void
}

export default function WeaponInfoManager({
	slotKey,
	equipmentId,
	onMessage,
	onUpdate,
}: WeaponInfoManagerProps) {
	// メイン武器情報登録ハンドラー
	const handleRegisterWeaponInfo = async () => {
		if (!equipmentId) {
			console.log('装備が選択されていません')
			onMessage('装備が選択されていません。')
			return
		}

		try {
			// WeaponFormからメイン武器データを取得
			const mainWeapon = useCalculatorStore.getState().data.mainWeapon
			console.log('メイン武器データ:', mainWeapon)

			// 新しい武器情報ストレージシステムを使用
			const success = saveWeaponInfo(
				equipmentId,
				mainWeapon.ATK,
				mainWeapon.stability,
				mainWeapon.refinement,
				mainWeapon.weaponType,
			)
			console.log('武器情報保存結果:', success)
			console.log('保存した武器種:', mainWeapon.weaponType)

			if (success) {
				onMessage('武器情報を登録しました。')
				onUpdate()
			} else {
				onMessage('武器情報の登録に失敗しました。')
			}
		} catch (error) {
			console.error('武器情報登録エラー:', error)
			onMessage('武器情報の登録に失敗しました。')
		}
	}

	// サブ武器情報登録ハンドラー
	const handleRegisterSubWeaponInfo = async () => {
		if (!equipmentId) {
			console.log('サブ武器装備が選択されていません')
			onMessage('サブ武器装備が選択されていません。')
			return
		}

		try {
			// WeaponFormからサブ武器データを取得
			const subWeapon = useCalculatorStore.getState().data.subWeapon
			console.log('サブ武器データ:', subWeapon)

			// 新しいサブ武器情報ストレージシステムを使用
			const success = saveSubWeaponInfo(
				equipmentId,
				subWeapon.ATK,
				subWeapon.stability,
				subWeapon.refinement,
				subWeapon.weaponType,
			)
			console.log('サブ武器情報保存結果:', success)
			console.log('保存したサブ武器種:', subWeapon.weaponType)

			if (success) {
				onMessage('武器情報を登録しました。')
				onUpdate()
			} else {
				onMessage('武器情報の登録に失敗しました。')
			}
		} catch (error) {
			console.error('サブ武器情報登録エラー:', error)
			onMessage('武器情報の登録に失敗しました。')
		}
	}

	// 武器情報削除ハンドラー
	const handleDeleteWeaponInfo = async () => {
		if (!equipmentId) return

		try {
			// 新しい武器情報ストレージシステムを使用してクリア
			const success = clearWeaponInfo(equipmentId)
			console.log('武器情報削除結果:', success)

			if (success) {
				onMessage('武器情報を削除しました。')
				onUpdate()
			} else {
				onMessage('武器情報の削除に失敗しました。')
			}
		} catch (error) {
			console.error('武器情報削除エラー:', error)
			onMessage('武器情報の削除に失敗しました。')
		}
	}

	const handleRegister = slotKey === 'mainWeapon' 
		? handleRegisterWeaponInfo 
		: handleRegisterSubWeaponInfo

	const weaponLabel = slotKey === 'mainWeapon' ? 'メイン武器情報' : 'サブ武器情報'

	return (
		<>
			<div className="flex gap-4 items-center mt-2 pl-3">
				<div className="text-sm font-semibold text-gray-700">
					{weaponLabel}
				</div>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={handleRegister}
						className="px-3 py-1 text-sm bg-blue-400/80 text-white rounded-md hover:bg-blue-400 transition-colors cursor-pointer"
						title={`WeaponFormの武器情報を${slotKey === 'mainWeapon' ? 'メイン装備' : 'サブ武器装備'}に登録`}
					>
						登録
					</button>
					<button
						type="button"
						onClick={handleDeleteWeaponInfo}
						className="px-3 py-1 text-sm bg-gray-400/80 text-white rounded-md hover:bg-gray-400 transition-colors cursor-pointer"
						title={`${slotKey === 'mainWeapon' ? 'メイン装備' : 'サブ武器装備'}の武器情報を削除`}
					>
						削除
					</button>
				</div>
			</div>
			<div className="mt-1 text-xs text-gray-600 pl-3 font-semibold">
				※武器能力情報を登録、または削除します。
			</div>
		</>
	)
}