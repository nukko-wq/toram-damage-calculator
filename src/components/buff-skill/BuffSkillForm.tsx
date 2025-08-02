'use client'

import { useMemo } from 'react'
import { useCalculatorData } from '@/hooks/useCalculatorData'
import type { MainWeaponType, SubWeaponType } from '@/types/buffSkill'
import type {
	SubWeaponType as CalculatorSubWeaponType,
	WeaponType,
} from '@/types/calculator'
import { getAvailableSkills, sortSkills } from '@/utils/buffSkillUtils'
import SkillCard from './SkillCard'

// 武器種変換関数
function convertWeaponType(weaponType: WeaponType): MainWeaponType | null {
	const weaponMap: Record<WeaponType, MainWeaponType> = {
		片手剣: 'oneHandSword',
		双剣: 'dualSword',
		両手剣: 'twoHandSword',
		手甲: 'knuckle',
		旋風槍: 'halberd',
		抜刀剣: 'katana',
		弓: 'bow',
		自動弓: 'bowgun',
		杖: 'staff',
		魔導具: 'magicDevice',
		素手: 'bareHands',
	}
	return weaponMap[weaponType] || null
}

function convertSubWeaponType(
	subWeaponType: CalculatorSubWeaponType,
): SubWeaponType | null {
	const subWeaponMap: Record<CalculatorSubWeaponType, SubWeaponType> = {
		なし: 'none',
		ナイフ: 'knife',
		矢: 'arrow',
		盾: 'shield',
		手甲: 'knuckle',
		魔導具: 'magicDevice',
		巻物: 'scroll',
		片手剣: 'knife', // 片手剣サブ武器はknife扱い
		抜刀剣: 'knife', // 抜刀剣サブ武器もknife扱いに修正
	}
	return subWeaponMap[subWeaponType] || null
}

// バフスキルフォームコンポーネント
export default function BuffSkillForm() {
	// データを取得
	const { data } = useCalculatorData()

	// 武器種を BuffSkill システム用の型に変換
	const mainWeapon = convertWeaponType(data.mainWeapon.weaponType)
	const subWeapon = convertSubWeaponType(data.subWeapon.weaponType)

	// 武器に応じたスキルを取得してソート
	const availableSkills = useMemo(() => {
		const skills = getAvailableSkills(mainWeapon, subWeapon)
		return sortSkills(skills)
	}, [mainWeapon, subWeapon])

	return (
		<div className="space-y-4 md:col-start-1 md:col-end-9 md:row-start-5 md:row-end-6 xl:col-start-1 xl:col-end-4 xl:row-start-4 xl:row-end-5 bg-white p-4 rounded-lg shadow-md">
			<div className="mb-6">
				<h2 className="text-xl font-bold text-gray-900 mb-2">バフスキル</h2>
			</div>

			<div className="grid grid-cols-2 gap-4 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3">
				{availableSkills.map((skill) => (
					<SkillCard key={skill.id} skill={skill} />
				))}
			</div>
		</div>
	)
}
