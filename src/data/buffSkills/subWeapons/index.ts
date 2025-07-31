import type { BuffSkillDefinition } from '@/types/buffSkill'
import { arrowSkills } from './arrow'
import { magicDeviceSubSkills } from './magicDevice'
import { scrollSkills } from './scroll'
import { bowSpecialSkills } from './bowSpecial'

// サブ武器特殊スキル
export const SUB_WEAPON_SKILLS: Record<string, BuffSkillDefinition[]> = {
	arrow: arrowSkills,
	magicDevice: magicDeviceSubSkills,
	scroll: scrollSkills,
	bowSpecial: bowSpecialSkills,
}
