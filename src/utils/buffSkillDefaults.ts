import type { BuffSkillFormData } from '@/types/buffSkill'

// デフォルトバフスキルフォームデータを生成（新形式: Record<string, BuffSkillState>）
export const getDefaultBuffSkillFormData = (): BuffSkillFormData => ({
	skills: {}, // 空のRecordから開始（スキルは動的に有効化される）
})