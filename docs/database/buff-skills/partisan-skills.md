# パルチザンスキル系統 バフスキル詳細設計書

## 概要

パルチザンスキル系統の共通バフスキルの詳細仕様を記述します。
各スキルの効果計算式、パラメータ、UI表示形式を定義します。

## データ構造

```typescript
interface CommonBuffSkillDetail {
  id: string                    // data-key値
  name: string                 // 表示名
  category: BuffSkillCategory  // スキル系統
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

## パルチザンスキル系統

### 18.1 前線維持Ⅱ (pal1)

```typescript
{
  id: 'pal1',
  name: '前線維持Ⅱ',
  category: 'partisan',
  type: 'level',
  order: 2501,
  maxLevel: 10,
  description: '基本ステータスのレベルとスキルレベルに応じてHPを大幅に上昇させる',
  effects: [
    {
      property: 'HP',
      formula: '10 * (skillLevel * 10 + baseStatsLevel)',
      conditions: []
    }
  ],
  calculationFormula: 'HP = 10 × (スキルレベル × 10 + 基本ステータスレベル)',
  example: {
    baseStatsLevel: 305,
    skillLevel: 10,
    calculation: 'HP = 10 × (10 × 10 + 305) = 10 × (100 + 305) = 10 × 405 = 4050',
    result: 'HP +4050'
  },
  weaponRequirement: {
    description: 'すべての武器で効果があります'
  },
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}
```

### 効果計算関数

```typescript
// 実装用の効果計算関数
function calculateFrontlineMaintenance2Effects(
  skillLevel: number,
  baseStatsLevel: number
): Partial<EquipmentProperties> {
  if (!skillLevel || skillLevel === 0) return {}
  
  // HP = 10 × (スキルレベル × 10 + 基本ステータスレベル)
  const hpBonus = 10 * (skillLevel * 10 + baseStatsLevel)
  
  return {
    HP: hpBonus
  }
}
```

## スキル詳細説明

### 前線維持Ⅱ

**基本効果:**
- 基本ステータスのレベルとスキルレベルの両方を参照してHPを上昇
- 基本ステータスレベルが高いほど効果が大きい

**計算例:**
- 基本ステータスレベル305、スキルレベル10の場合
- HP = 10 × (10 × 10 + 305) = 4050

**武器要件:**
- すべての武器で効果があります

**UI仕様:**
- レベル型スキル（1-10）
- モーダル表示対応
- +1/-1、+10/-10ボタン対応

## 実装仕様

### 計算エンジン統合

```typescript
function calculatePartisanSkillEffects(
  skills: Record<string, BuffSkillState>,
  baseStatsLevel: number
): Partial<EquipmentProperties> {
  const result: Partial<EquipmentProperties> = {}
  
  // 前線維持Ⅱ
  const pal1 = skills['pal1']
  if (pal1?.isEnabled && pal1.level) {
    const effects = calculateFrontlineMaintenance2Effects(pal1.level, baseStatsLevel)
    Object.assign(result, effects)
  }
  
  return result
}
```

### バリデーション

```typescript
function validatePartisanSkills(skills: Record<string, BuffSkillState>): boolean {
  // 前線維持Ⅱのバリデーション
  const pal1 = skills['pal1']
  if (pal1?.isEnabled) {
    if (!pal1.level || pal1.level < 1 || pal1.level > 10) {
      return false
    }
  }
  
  return true
}
```

## 拡張予定

### 追加予定スキル
- 他のパルチザンスキルの追加予定
- 新規スキルの効果設計

### 計算式の拡張
- 武器種別による効果変動
- 他スキルとの相互作用
- 条件付き効果の実装

この設計書により、パルチザンスキル系統のバフスキルの詳細仕様と実装方針が明確化されます。