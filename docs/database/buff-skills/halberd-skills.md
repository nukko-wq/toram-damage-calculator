# ハルバードスキル系統詳細設計書

## 概要

ハルバードスキル系統（category: 'halberd'）の全武器種で使用可能なバフスキルの詳細仕様を記述します。
各スキルの効果計算式、パラメータ、UI表示形式を定義します。

## データ構造

```typescript
interface HalberdBuffSkillDetail {
  id: string                    // data-key値
  name: string                 // 表示名
  category: 'halberd'          // スキル系統（ハルバード固定）
  type: BuffSkillType         // UI制御タイプ
  order: number               // 表示順序
  maxLevel?: number           // 最大レベル（デフォルト10）
  maxStack?: number           // 最大重ねがけ数
  description: string         // スキル説明
  effects: SkillEffect[]      // 効果リスト
  calculationFormula: string  // 計算式
  uiSettings: UISettings      // UI表示設定
}
```

## ハルバードスキル一覧

### 4.1 クイックオーラ (hb1)
```typescript
{
  id: 'hb1',
  name: 'クイックオーラ',
  category: 'halberd',
  type: 'level',
  order: 601,
  maxLevel: 10,
  description: '攻撃速度を上昇させる',
  effects: [
    {
      property: 'AttackSpeed',
      formula: 'skillLevel * 50',
      conditions: []
    },
    {
      property: 'AttackSpeed_Rate',
      formula: 'Math.floor(skillLevel * 2.5)',
      conditions: []
    }
  ],
  calculationFormula: '攻撃速度 = skillLevel × 50, 攻撃速度% = Math.floor(skillLevel × 2.5)',
  example: {
    skillLevel: 10,
    calculation: 'AttackSpeed = 10 × 50 = 500, AttackSpeed_Rate = Math.floor(10 × 2.5) = Math.floor(25) = 25',
    result: '攻撃速度 +500, 攻撃速度% +25'
  },
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}

// 実装用の効果計算関数
function calculateQuickAuraEffects(
  skillLevel: number
): Partial<EquipmentProperties> {
  if (!skillLevel || skillLevel === 0) return {}
  
  return {
    AttackSpeed: skillLevel * 50,
    AttackSpeed_Rate: Math.floor(skillLevel * 2.5)
  }
}
```

### 4.2 神速の捌手 (godspeed_parry)
```typescript
{
  id: 'godspeed_parry',
  name: '神速の捌手',
  category: 'halberd',
  type: 'stack',
  order: 602,
  maxStack: 3,
  description: '攻撃速度と行動速度を上昇させる代わりに、MPと耐性が減少する',
  weaponConditionalEffects: {
    // 旋風槍装備時の効果
    halberd: {
      effects: [
        { property: 'AttackSpeed', formula: 'stackCount * 400' },
        { property: 'MotionSpeed_Rate', formula: 'stackCount * 10' },
        { property: 'MP', formula: 'stackCount * -100' },
        { property: 'PhysicalResistance_Rate', formula: 'stackCount * -25' },
        { property: 'MagicalResistance_Rate', formula: 'stackCount * -25' },
        { property: 'AvoidRecharge_Rate', formula: 'stackCount * 10' }
      ]
    },
    // その他武器装備時の効果
    default: {
      effects: [
        { property: 'AttackSpeed', formula: 'stackCount * 300' },
        { property: 'MotionSpeed_Rate', formula: 'stackCount * 10' },
        { property: 'MP', formula: 'stackCount * -100' },
        { property: 'PhysicalResistance_Rate', formula: 'stackCount * -70' },
        { property: 'MagicalResistance_Rate', formula: 'stackCount * -70' },
        { property: 'AvoidRecharge_Rate', formula: 'stackCount * 10' }
      ]
    }
  },
  calculationFormula: `
    旋風槍装備時:
    - 攻撃速度 = stackCount × 400
    - 行動速度% = stackCount × 10
    - MP = stackCount × -100
    - 物理耐性% = stackCount × -25
    - 魔法耐性% = stackCount × -25
    - Avoid回復% = stackCount × 10
    
    その他武器装備時:
    - 攻撃速度 = stackCount × 300
    - 行動速度% = stackCount × 10
    - MP = stackCount × -100
    - 物理耐性% = stackCount × -70
    - 魔法耐性% = stackCount × -70
    - Avoid回復% = stackCount × 10
  `,
  uiSettings: {
    parameterName: '重ねがけ数',
    parameterUnit: '回',
    showInModal: true,
    quickToggle: false
  }
}

// 実装用の効果計算関数
function calculateGodspeedParryEffects(
  stackCount: number,
  weaponType: MainWeaponType | null
): Partial<EquipmentProperties> {
  if (!stackCount || stackCount === 0) return {}
  
  const isHalberd = weaponType === 'halberd'
  
  return {
    AttackSpeed: stackCount * (isHalberd ? 400 : 300),
    MotionSpeed_Rate: stackCount * 10,
    MP: stackCount * -100,
    PhysicalResistance_Rate: stackCount * (isHalberd ? -25 : -70),
    MagicalResistance_Rate: stackCount * (isHalberd ? -25 : -70),
    AvoidRecharge_Rate: stackCount * 10
  }
}
```

## 実装ステータス

- [x] クイックオーラ (hb1) - 設計・実装完了
- [x] 神速の捌手 (godspeed_parry) - 設計・実装完了

## 特徴

- **武器依存効果**: 神速の捌手は装備武器によって効果値が変化
- **スタック効果**: 神速の捌手は重ねがけ可能（最大3回）
- **デメリット効果**: 神速の捌手はMPと耐性にマイナス効果

## 関連ファイル

- メインドキュメント: `../buff-skill-details-common.md`
- 実装ファイル: `../../src/utils/buffSkillCalculation.ts`
- データ定義: `../../src/data/buffSkills.ts`