import type { BuffSkillDefinition } from '@/types/buffSkill'

export const scrollSkills: BuffSkillDefinition[] = [
	{
		id: 'ninja1',
		name: '風遁の術',
		category: 'ninja',
		type: 'toggle',
		order: 1905,
		requirements: [
			{
				mainWeapon: ['oneHandSword', 'katana', 'staff', 'magicDevice'],
			},
		],
	},
]