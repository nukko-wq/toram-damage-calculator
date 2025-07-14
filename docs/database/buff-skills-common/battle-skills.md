# バトルスキル系統詳細設計書

## 概要

バトルスキル系統（category: 'battle'）の全武器種で使用可能なバフスキルの詳細仕様を記述します。
各スキルの効果計算式、パラメータ、UI表示形式を定義します。

## データ構造

```typescript
interface BattleBuffSkillDetail {
  id: string                    // data-key値
  name: string                 // 表示名
  category: 'battle'           // スキル系統（バトル固定）
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

## バトルスキル一覧

### 17.1 クリティカルup (oh1)
```typescript
{
  id: 'oh1',
  name: 'クリティカルup',
  category: 'battle',
  type: 'toggle',
  order: 2202,
  description: 'クリティカル率とクリティカルダメージを上昇させる',
  effects: [
    {
      property: 'Critical',
      formula: '5',
      conditions: []
    },
    {
      property: 'CriticalDamage_Rate',
      formula: '5',
      conditions: []
    }
  ],
  calculationFormula: 'クリティカル率 = base + 5, クリティカルダメージ% = base + 5',
  uiSettings: {
    parameterName: 'ON/OFF',
    showInModal: false,
    quickToggle: true
  }
}

// 実装用の効果計算関数
function calculateCriticalUpEffects(
  isEnabled: boolean
): Partial<EquipmentProperties> {
  if (!isEnabled) return {}
  
  return {
    Critical: 5,
    CriticalDamage_Rate: 5
  }
}
```

### 17.2 攻撃力UP (exATK1)
```typescript
{
  id: 'exATK1',
  name: '攻撃力UP',
  category: 'battle',
  type: 'level',
  order: 2204,
  maxLevel: 10,
  description: 'プレイヤーレベルに比例してATKを上昇させる',
  effects: [
    {
      property: 'ATK',
      formula: 'Math.floor(playerLevel * (25 * skillLevel / 10) / 100)',
      conditions: []
    }
  ],
  calculationFormula: 'ATK = Math.floor(プレイヤーレベル × (25 × スキルレベル ÷ 10) ÷ 100)',
  example: {
    playerLevel: 305,
    skillLevel: 10,
    calculation: 'Math.floor(305 × (25 × 10 ÷ 10) ÷ 100) = Math.floor(305 × 25 ÷ 100) = Math.floor(76.25) = 76',
    result: 'ATK +76'
  },
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}

// 実装用の効果計算関数
function calculateAttackUpEffects(
  skillLevel: number,
  playerLevel: number
): Partial<EquipmentProperties> {
  if (!skillLevel || skillLevel === 0) return {}
  
  // ATK = Math.floor(プレイヤーレベル × (25 × スキルレベル ÷ 10) ÷ 100)
  const atkBonus = Math.floor(playerLevel * (25 * skillLevel / 10) / 100)
  
  return {
    ATK: atkBonus
  }
}
```

### 17.3 魔法力UP (exMATK1)
```typescript
{
  id: 'exMATK1',
  name: '魔法力UP',
  category: 'battle',
  type: 'level',
  order: 2206,
  maxLevel: 10,
  description: 'プレイヤーレベルに比例してMATKを上昇させる',
  effects: [
    {
      property: 'MATK',
      formula: 'Math.floor(playerLevel * (25 * skillLevel / 10) / 100)',
      conditions: []
    }
  ],
  calculationFormula: 'MATK = Math.floor(プレイヤーレベル × (25 × スキルレベル ÷ 10) ÷ 100)',
  example: {
    playerLevel: 305,
    skillLevel: 10,
    calculation: 'Math.floor(305 × (25 × 10 ÷ 10) ÷ 100) = Math.floor(305 × 25 ÷ 100) = Math.floor(76.25) = 76',
    result: 'MATK +76'
  },
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}

// 実装用の効果計算関数
function calculateMagicUpEffects(
  skillLevel: number,
  playerLevel: number
): Partial<EquipmentProperties> {
  if (!skillLevel || skillLevel === 0) return {}
  
  // MATK = Math.floor(プレイヤーレベル × (25 × スキルレベル ÷ 10) ÷ 100)
  const matkBonus = Math.floor(playerLevel * (25 * skillLevel / 10) / 100)
  
  return {
    MATK: matkBonus
  }
}
```

### 17.4 驚異の威力 (exATK2)
```typescript
{
  id: 'exATK2',
  name: '驚異の威力',
  category: 'battle',
  type: 'level',
  order: 2205,
  maxLevel: 10,
  description: 'プレイヤーレベルに比例してATKを上昇させる（攻撃力UPより高い効果）',
  effects: [
    {
      property: 'ATK',
      formula: 'Math.floor(playerLevel * (25 * skillLevel / 10) / 100)',
      conditions: []
    }
  ],
  calculationFormula: 'ATK = Math.floor(プレイヤーレベル × (25 × スキルレベル ÷ 10) ÷ 100)',
  example: {
    playerLevel: 305,
    skillLevel: 10,
    calculation: 'Math.floor(305 × (25 × 10 ÷ 10) ÷ 100) = Math.floor(305 × 25 ÷ 100) = Math.floor(76.25) = 76',
    result: 'ATK +76'
  },
  note: '攻撃力UP (exATK1) と同じ計算式を使用',
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}

// 実装用の効果計算関数
function calculateThreatPowerEffects(
  skillLevel: number,
  playerLevel: number
): Partial<EquipmentProperties> {
  if (!skillLevel || skillLevel === 0) return {}
  
  // ATK = Math.floor(プレイヤーレベル × (25 × スキルレベル ÷ 10) ÷ 100)
  const atkBonus = Math.floor(playerLevel * (25 * skillLevel / 10) / 100)
  
  return {
    ATK: atkBonus
  }
}
```

### 17.5 更なる魔力 (exMATK2)
```typescript
{
  id: 'exMATK2',
  name: '更なる魔力',
  category: 'battle',
  type: 'level',
  order: 2207,
  maxLevel: 10,
  description: 'プレイヤーレベルに比例してMATKを上昇させる（魔法力UPより高い効果）',
  effects: [
    {
      property: 'MATK',
      formula: 'Math.floor(playerLevel * (25 * skillLevel / 10) / 100)',
      conditions: []
    }
  ],
  calculationFormula: 'MATK = Math.floor(プレイヤーレベル × (25 × スキルレベル ÷ 10) ÷ 100)',
  example: {
    playerLevel: 305,
    skillLevel: 10,
    calculation: 'Math.floor(305 × (25 × 10 ÷ 10) ÷ 100) = Math.floor(305 × 25 ÷ 100) = Math.floor(76.25) = 76',
    result: 'MATK +76'
  },
  note: '魔法力UP (exMATK1) と同じ計算式を使用',
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}

// 実装用の効果計算関数
function calculateFurtherMagicEffects(
  skillLevel: number,
  playerLevel: number
): Partial<EquipmentProperties> {
  if (!skillLevel || skillLevel === 0) return {}
  
  // MATK = Math.floor(プレイヤーレベル × (25 × スキルレベル ÷ 10) ÷ 100)
  const matkBonus = Math.floor(playerLevel * (25 * skillLevel / 10) / 100)
  
  return {
    MATK: matkBonus
  }
}
```

### 17.6 命中UP (exHIT)
```typescript
{
  id: 'exHIT',
  name: '命中UP',
  category: 'battle',
  type: 'level',
  order: 2208,
  maxLevel: 10,
  description: 'すべての武器で命中を上昇させる',
  effects: [
    {
      property: 'Accuracy',
      formula: 'skillLevel',
      conditions: []
    }
  ],
  calculationFormula: 'Accuracy = skillLevel',
  example: {
    skillLevel: 10,
    calculation: 'Accuracy = 10',
    result: 'Accuracy +10'
  },
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}

// 実装用の効果計算関数
function calculateAccuracyUpEffects(
  skillLevel: number
): Partial<EquipmentProperties> {
  if (!skillLevel || skillLevel === 0) return {}
  
  return {
    Accuracy: skillLevel
  }
}
```

### 17.7 回避UP (exFREE)
```typescript
{
  id: 'exFREE',
  name: '回避UP',
  category: 'battle',
  type: 'level',
  order: 2209,
  maxLevel: 10,
  description: 'すべての武器で回避を上昇させる',
  effects: [
    {
      property: 'Dodge',
      formula: 'skillLevel',
      conditions: []
    }
  ],
  calculationFormula: 'Dodge = skillLevel',
  example: {
    skillLevel: 10,
    calculation: 'Dodge = 10',
    result: 'Dodge +10'
  },
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}

// 実装用の効果計算関数
function calculateDodgeUpEffects(
  skillLevel: number
): Partial<EquipmentProperties> {
  if (!skillLevel || skillLevel === 0) return {}
  
  return {
    Dodge: skillLevel
  }
}
```

## 実装ステータス

- [x] クリティカルup (oh1) - 設計・実装完了
- [x] 攻撃力UP (exATK1) - 設計・実装完了
- [x] 魔法力UP (exMATK1) - 設計・実装完了
- [x] 驚異の威力 (exATK2) - 設計・実装完了
- [x] 更なる魔力 (exMATK2) - 設計・実装完了
- [x] 命中UP (exHIT) - 設計・実装完了
- [x] 回避UP (exFREE) - 設計・実装完了

## 特徴

- **プレイヤーレベル依存**: 攻撃力UP系・魔法力UP系スキルはプレイヤーレベルに依存
- **共通計算式**: 同系統のスキル（攻撃力UP/驚異の威力、魔法力UP/更なる魔力）は同じ計算式
- **瞬間効果**: クリティカルupは固定値による即座の効果
- **スキルレベル依存**: 命中UP・回避UPはスキルレベルに比例した単純な加算効果

## 関連ファイル

- メインドキュメント: `../buff-skill-details-common.md`
- 実装ファイル: `../../src/utils/buffSkillCalculation.ts`
- データ定義: `../../src/data/buffSkills.ts`