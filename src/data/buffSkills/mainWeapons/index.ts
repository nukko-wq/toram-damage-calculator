import type { BuffSkillDefinition, MainWeaponType } from '@/types/buffSkill'
import { bareHandsSkills } from './bareHands'
import { bowSkills } from './bow'
import { bowgunSkills } from './bowgun'
import { dualSwordSkills } from './dualSword'
import { halberdSkills } from './halberd'
import { katanaSkills } from './katana'
import { knuckleSkills } from './knuckle'
import { magicDeviceSkills } from './magicDevice'
import { oneHandSwordSkills } from './oneHandSword'
import { staffSkills } from './staff'
import { twoHandSwordSkills } from './twoHandSword'

// 武器固有スキル定義
export const WEAPON_SPECIFIC_SKILLS: Record<
	MainWeaponType,
	BuffSkillDefinition[]
> = {
	oneHandSword: oneHandSwordSkills,
	dualSword: dualSwordSkills,
	twoHandSword: twoHandSwordSkills,
	knuckle: knuckleSkills,
	halberd: halberdSkills,
	katana: katanaSkills,
	bow: bowSkills,
	bowgun: bowgunSkills,
	staff: staffSkills,
	magicDevice: magicDeviceSkills,
	bareHands: bareHandsSkills,
}
