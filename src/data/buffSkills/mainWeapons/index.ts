import type { BuffSkillDefinition, MainWeaponType } from '@/types/buffSkill'
import { oneHandSwordSkills } from './oneHandSword'
import { dualSwordSkills } from './dualSword'
import { twoHandSwordSkills } from './twoHandSword'
import { knuckleSkills } from './knuckle'
import { halberdSkills } from './halberd'
import { katanaSkills } from './katana'
import { bowSkills } from './bow'
import { bowgunSkills } from './bowgun'
import { staffSkills } from './staff'
import { magicDeviceSkills } from './magicDevice'
import { bareHandsSkills } from './bareHands'

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
