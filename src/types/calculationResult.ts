// ステータス計算結果の型定義

export interface CalculationResults {
	// 基本ステータス（29項目）
	basicStats: {
		HP: number
		MP: number
		ATK: number
		subBaseATK: number
		totalATK: number
		bringerAM: number
		MATK: number
		baseMATK: number
		stabilityRate: number
		subStabilityRate: number
		criticalRate: number
		criticalDamage: number
		magicCriticalRate: number
		magicCriticalDamage: number
		totalElementAdvantage: number
		elementAwakeningAdvantage: number
		ASPD: number
		CSPD: number
		HIT: number
		FLEE: number
		physicalResistance: number
		magicalResistance: number
		ailmentResistance: number
		motionSpeed: number
		armorBreak: number
		anticipate: number
	}

	// 補正後ステータス（8項目）
	adjustedStats: {
		STR: number
		AGI: number
		INT: number
		DEX: number
		VIT: number
		CRT: number
		MEN: number
		TEC: number
	}

	// 装備品補正値1（31項目）
	equipmentBonus1: {
		ATK: number
		physicalPenetration: number
		MATK: number
		magicalPenetration: number
		weaponATK: number
		elementPower: number
		unsheatheAttack: number
		shortRangeDamage: number
		longRangeDamage: number
		criticalDamage: number
		criticalRate: number
		STR: number
		AGI: number
		INT: number
		DEX: number
		VIT: number
		ASPD: number
		CSPD: number
		stability: number
		motionSpeed: number
		accuracy: number
		dodge: number
		MP: number
		attackMPRecovery: number
		HP: number
		ailmentResistance: number
		physicalResistance: number
		magicalResistance: number
		aggroPlus: number
		aggroMinus: number
	}

	// 装備品補正値2（32項目）
	equipmentBonus2: {
		ATK_STR: number
		MATK_STR: number
		ATK_INT: number
		MATK_INT: number
		ATK_VIT: number
		MATK_VIT: number
		ATK_AGI: number
		MATK_AGI: number
		ATK_DEX: number
		MATK_DEX: number
		neutralResistance: number
		fireResistance: number
		waterResistance: number
		windResistance: number
		earthResistance: number
		lightResistance: number
		darkResistance: number
		linearReduction: number
		rushReduction: number
		bulletReduction: number
		proximityReduction: number
		areaReduction: number
		floorTrapReduction: number
		meteorReduction: number
		bladeReduction: number
		suctionReduction: number
		explosionReduction: number
		physicalBarrier: number
		magicalBarrier: number
		fractionalBarrier: number
		barrierCooldown: number
	}

	// 装備品補正値3（8項目）
	equipmentBonus3: {
		physicalFollowup: number
		magicalFollowup: number
		naturalHPRecovery: number
		naturalMPRecovery: number
		absoluteAccuracy: number
		absoluteDodge: number
		revivalTime: number
		itemCooldown: number
	}
}

// 表示状態の設定
export interface CalculationResultSettings {
	isVisible: boolean
	lastToggleTime: string
}

// LocalStorageキー定数
export const CALC_RESULT_SETTINGS_KEY = 'calculationResultSettings'

// 日本語ラベルマッピング（表示用）
export const STAT_LABELS = {
	// 基本ステータス
	basicStats: {
		HP: 'HP',
		MP: 'MP',
		ATK: 'ATK',
		subBaseATK: 'サブ基礎ATK',
		totalATK: '総ATK',
		bringerAM: 'BringerA/M',
		MATK: 'MATK',
		baseMATK: '基礎MATK',
		stabilityRate: '安定率(%)',
		subStabilityRate: 'サブ安定率(%)',
		criticalRate: 'クリティカル率',
		criticalDamage: 'クリティカルダメージ',
		magicCriticalRate: '魔法クリティカル率',
		magicCriticalDamage: '魔法クリティカルダメージ',
		totalElementAdvantage: '総属性有利(%)',
		elementAwakeningAdvantage: '属性覚醒有利(%)',
		ASPD: 'ASPD',
		CSPD: 'CSPD',
		HIT: 'HIT',
		FLEE: 'FLEE',
		physicalResistance: '物理耐性(%)',
		magicalResistance: '魔法耐性(%)',
		ailmentResistance: '異常耐性(%)',
		motionSpeed: '行動速度(%)',
		armorBreak: '防御崩し(%)',
		anticipate: '先読み(%)',
	},

	// 補正後ステータス
	adjustedStats: {
		STR: 'STR',
		AGI: 'AGI',
		INT: 'INT',
		DEX: 'DEX',
		VIT: 'VIT',
		CRT: 'CRT',
		MEN: 'MEN',
		TEC: 'TEC',
	},

	// 装備品補正値1
	equipmentBonus1: {
		ATK: 'ATK',
		physicalPenetration: '物理貫通',
		MATK: 'MATK',
		magicalPenetration: '魔法貫通',
		weaponATK: '武器ATK',
		elementPower: '属性威力',
		unsheatheAttack: '抜刀威力',
		shortRangeDamage: '近距離威力',
		longRangeDamage: '遠距離威力',
		criticalDamage: 'ｸﾘﾃｨｶﾙﾀﾞﾒｰｼﾞ',
		criticalRate: 'ｸﾘﾃｨｶﾙ率',
		STR: 'STR',
		AGI: 'AGI',
		INT: 'INT',
		DEX: 'DEX',
		VIT: 'VIT',
		ASPD: 'ASPD',
		CSPD: 'CSPD',
		stability: '安定率',
		motionSpeed: '行動速度',
		accuracy: '命中',
		dodge: '回避',
		MP: 'MP',
		attackMPRecovery: '攻撃MP回復',
		HP: 'HP',
		ailmentResistance: '異常耐性',
		physicalResistance: '物理耐性',
		magicalResistance: '魔法耐性',
		aggroPlus: 'ヘイト+',
		aggroMinus: 'ヘイト-',
	},

	// 装備品補正値2
	equipmentBonus2: {
		ATK_STR: 'ATK+(STR%)',
		MATK_STR: 'MATK+(STR%)',
		ATK_INT: 'ATK+(INT%)',
		MATK_INT: 'MATK+(INT%)',
		ATK_VIT: 'ATK+(VIT%)',
		MATK_VIT: 'MATK+(VIT%)',
		ATK_AGI: 'ATK+(AGI%)',
		MATK_AGI: 'MATK+(AGI%)',
		ATK_DEX: 'ATK+(DEX%)',
		MATK_DEX: 'MATK+(DEX%)',
		neutralResistance: '無耐性',
		fireResistance: '火耐性',
		waterResistance: '水耐性',
		windResistance: '風耐性',
		earthResistance: '地耐性',
		lightResistance: '光耐性',
		darkResistance: '闇耐性',
		linearReduction: '直線軽減',
		rushReduction: '突進軽減',
		bulletReduction: '弾丸軽減',
		proximityReduction: '周囲軽減',
		areaReduction: '範囲軽減',
		floorTrapReduction: '痛床軽減',
		meteorReduction: '隕石軽減',
		bladeReduction: '射刃軽減',
		suctionReduction: '吸引軽減',
		explosionReduction: '爆発軽減',
		physicalBarrier: '物理バリア',
		magicalBarrier: '魔法バリア',
		fractionalBarrier: '割合バリア',
		barrierCooldown: 'バリア速度',
	},

	// 装備品補正値3
	equipmentBonus3: {
		physicalFollowup: '物理追撃',
		magicalFollowup: '魔法追撃',
		naturalHPRecovery: 'HP自然回復',
		naturalMPRecovery: 'MP自然回復',
		absoluteAccuracy: '絶対命中',
		absoluteDodge: '絶対回避',
		revivalTime: '復帰短縮',
		itemCooldown: '道具速度',
	},
} as const

// セクション名
export const SECTION_TITLES = {
	basicStats: '基本ステータス',
	adjustedStats: '補正後ステータス',
	equipmentBonus1: '装備品補正値1',
	equipmentBonus2: '装備品補正値2',
	equipmentBonus3: '装備品補正値3',
} as const