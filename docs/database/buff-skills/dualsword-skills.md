# デュアルソードスキル系統詳細設計書

## 概要

デュアルソードスキル系統（category: 'dualSword'）のバフスキル詳細仕様を記述します。
双剣装備時に効果が強化される武器種別効果を持つスキルが含まれています。

## データ構造

```typescript
interface DualSwordSkillDetail {
  id: string                    // data-key値
  name: string                 // 表示名
  category: 'dualSword'        // スキル系統
  type: BuffSkillType         // UI制御タイプ
  order: number               // 表示順序
  maxLevel?: number           // 最大レベル（デフォルト10）
  description: string         // スキル説明
  effects: SkillEffect[]      // 効果リスト
  calculationFormula: string  // 計算式
  uiSettings: UISettings      // UI表示設定
  weaponRequirement?: object  // 武器種別要件
}
```

## デュアルソードスキル一覧

### 1. 神速の軌跡 (ds1-2)

```typescript
{
  id: 'ds1-2',
  name: '神速の軌跡',
  category: 'dualSword',
  type: 'level',
  order: 801,
  maxLevel: 10,
  description: 'AGIと抜刀威力を上昇させる（双剣装備時は抜刀威力がより大きく上昇）',
  effects: [
    {
      property: 'AGI',
      formula: 'skillLevel + Math.max(skillLevel - 5, 0)',
      conditions: []
    },
    {
      property: 'UnsheatheAttack',
      formula: 'mainWeapon === "dualSword" ? (15 + skillLevel) : (5 + skillLevel)',
      conditions: ['武器種によって効果値変動']
    }
  ],
  calculationFormula: 'AGI = スキルレベル + MAX(スキルレベル - 5, 0)\n双剣以外: 抜刀威力 = 5 + スキルレベル\n双剣装備時: 抜刀威力 = 15 + スキルレベル',
  example: {
    skillLevel: 10,
    calculation: 'AGI = 10 + MAX(10 - 5, 0) = 10 + 5 = 15\n双剣以外: 抜刀威力 = 5 + 10 = 15\n双剣装備時: 抜刀威力 = 15 + 10 = 25',
    result: 'AGI +15, 抜刀威力 +15(双剣以外) / +25(双剣)'
  },
  weaponRequirement: {
    description: '全武器種で使用可能、双剣装備時は抜刀威力の効果が強化される'
  },
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}

// 実装用の効果計算関数
function calculateGodspeedTrajectoryEffects(
  skillLevel: number,
  mainWeaponType: MainWeaponType | null
): Partial<EquipmentProperties> {
  if (!skillLevel || skillLevel === 0) return {}
  
  // AGI = スキルレベル + MAX(スキルレベル - 5, 0)
  const agiBonus = skillLevel + Math.max(skillLevel - 5, 0)
  
  // 抜刀威力 = 双剣装備時は15+スキルレベル、それ以外は5+スキルレベル
  const isDualSword = mainWeaponType === 'dualSword'
  const unsheatheAttackBonus = isDualSword ? (15 + skillLevel) : (5 + skillLevel)
  
  return {
    AGI: agiBonus,
    UnsheatheAttack: unsheatheAttackBonus
  }
}
```

## 実装詳細

### 武器種別効果システム

神速の軌跡は双剣装備時に抜刀威力効果が強化される特殊なスキルです：

- **双剣装備時**: 抜刀威力 = 15 + スキルレベル
- **その他武器装備時**: 抜刀威力 = 5 + スキルレベル

### 計算式の特徴

1. **AGI計算**: スキルレベル5以下は等倍、6以上は追加ボーナスあり
   - スキルレベル1-5: AGI = スキルレベル
   - スキルレベル6-10: AGI = スキルレベル + (スキルレベル - 5)

2. **抜刀威力計算**: 双剣装備時は基本値+10のボーナス

3. **MAX関数**: `Math.max(skillLevel - 5, 0)` で負の値を防止

### レベル別効果値

| スキルレベル | AGI | 抜刀威力(双剣以外) | 抜刀威力(双剣) |
|-------------|-----|------------------|---------------|
| 1           | 1   | 6                | 16            |
| 2           | 2   | 7                | 17            |
| 3           | 3   | 8                | 18            |
| 4           | 4   | 9                | 19            |
| 5           | 5   | 10               | 20            |
| 6           | 7   | 11               | 21            |
| 7           | 9   | 12               | 22            |
| 8           | 11  | 13               | 23            |
| 9           | 13  | 14               | 24            |
| 10          | 15  | 15               | 25            |

### 実装パターン

```typescript
// buffSkillCalculation.ts での実装例
export function calculateGodspeedTrajectoryEffects(
  skillLevel: number,
  mainWeaponType: MainWeaponType | null
): Partial<EquipmentProperties> {
  if (!skillLevel || skillLevel === 0) return {}
  
  // AGI = スキルレベル + MAX(スキルレベル - 5, 0)
  const agiBonus = skillLevel + Math.max(skillLevel - 5, 0)
  
  // 抜刀威力 = 双剣装備時は15+スキルレベル、それ以外は5+スキルレベル
  const isDualSword = mainWeaponType === 'dualSword'
  const unsheatheAttackBonus = isDualSword ? (15 + skillLevel) : (5 + skillLevel)
  
  return {
    AGI: agiBonus,
    UnsheatheAttack: unsheatheAttackBonus
  }
}
```

## UI仕様

### レベル設定タイプ

- **パラメータ名**: スキルレベル
- **範囲**: 1-10
- **UI**: モーダル表示、+1/-1ボタン、直接入力
- **単位**: Lv

## 武器種別要件

- **全武器種対応**: すべての武器で使用可能
- **双剣特殊効果**: 双剣装備時は抜刀威力効果が強化される
- **効果差**: 双剣と他武器で10ポイントの差

## 関連ファイル

- **メインドキュメント**: `../buff-skill-details-common.md`
- **実装ファイル**: `../../src/utils/buffSkillCalculation.ts`
- **データ定義**: `../../src/data/buffSkills.ts`
- **型定義**: `../../src/types/buffSkill.ts`

## 更新履歴

| 日付 | 更新内容 | 備考 |
|------|----------|------|
| 2025-01-XX | デュアルソードスキル系統を個別ファイルに分離 | buff-skill-details-common.mdから移動 |