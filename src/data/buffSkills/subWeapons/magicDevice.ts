import type { BuffSkillDefinition } from '@/types/buffSkill'

export const magicDeviceSubSkills: BuffSkillDefinition[] = [
	{
		id: 'mg2',
		name: '急速チャージ',
		category: 'magic',
		type: 'stack',
		maxStack: 15,
		order: 401,
	},
	{
		id: 'mw1',
		name: 'P:コンバージョン',
		category: 'magicBlade',
		type: 'toggle',
		order: 1003,
	},
	{
		id: 'mw2',
		name: 'エンチャントバースト',
		category: 'magicBlade',
		type: 'toggle',
		order: 1004,
	},
	{
		id: 'mw3',
		name: 'デュアルブリンガー-旧',
		category: 'magicBlade',
		type: 'toggle',
		order: 1005,
	},
	{
		id: 'mw4',
		name: 'レゾナンス？',
		category: 'magicBlade',
		type: 'level',
		order: 1006,
	},
]