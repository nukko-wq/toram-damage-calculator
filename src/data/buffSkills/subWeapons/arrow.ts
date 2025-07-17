import type { BuffSkillDefinition } from '@/types/buffSkill'

export const arrowSkills: BuffSkillDefinition[] = [
	{
		id: 'bw1',
		name: 'パライズショット',
		category: 'shoot',
		type: 'toggle',
		order: 303,
		requirements: [
			{
				mainWeapon: ['oneHandSword', 'halberd', 'staff'],
			},
		],
	},
]