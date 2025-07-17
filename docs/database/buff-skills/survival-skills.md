# サバイバルスキル系統詳細設計書

## 概要

サバイバルスキル系統（category: 'survival'）の全武器種で使用可能なバフスキルの詳細仕様を記述します。
各スキルの効果計算式、パラメータ、UI表示形式を定義します。

## データ構造

```typescript
interface SurvivalBuffSkillDetail {
  id: string                    // data-key値
  name: string                 // 表示名
  category: 'survival'         // スキル系統（サバイバル固定）
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

## サバイバルスキル一覧

### 13.1 HPブースト (oh4)
```typescript
{
  id: 'oh4',
  name: 'HPブースト',
  category: 'survival',
  type: 'level',
  order: 2101,
  maxLevel: 10,
  description: '最大HPを上昇させる',
  effects: [
    {
      property: 'HP',
      formula: 'skillLevel * 100',
      conditions: []
    },
    {
      property: 'HP_Rate',
      formula: 'skillLevel * 2',
      conditions: []
    }
  ],
  calculationFormula: 'HP = skillLevel × 100, HP% = skillLevel × 2',
  example: {
    skillLevel: 10,
    calculation: 'HP = 10 × 100 = 1000, HP% = 10 × 2 = 20',
    result: 'HP +1000, HP% +20'
  },
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}

// 実装用の効果計算関数
function calculateHPBoostEffects(
  skillLevel: number
): Partial<EquipmentProperties> {
  if (!skillLevel || skillLevel === 0) return {}
  
  return {
    HP: skillLevel * 100,
    HP_Rate: skillLevel * 2
  }
}
```

### 13.2 MPブースト (oh2)
```typescript
{
  id: 'oh2',
  name: 'MPブースト',
  category: 'survival',
  type: 'level',
  order: 2102,
  maxLevel: 10,
  description: '最大MPを上昇させる',
  effects: [
    {
      property: 'MP',
      formula: 'skillLevel * 30',
      conditions: []
    }
  ],
  calculationFormula: 'MP = skillLevel × 30',
  example: {
    skillLevel: 10,
    calculation: 'MP = 10 × 30 = 300',
    result: 'MP +300'
  },
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}

// 実装用の効果計算関数
function calculateMPBoostEffects(
  skillLevel: number
): Partial<EquipmentProperties> {
  if (!skillLevel || skillLevel === 0) return {}
  
  return {
    MP: skillLevel * 30
  }
}
```

## 実装ステータス

- [x] HPブースト (oh4) - 設計・実装完了
- [x] MPブースト (oh2) - 設計・実装完了

## 特徴

- **基本ステータス強化**: HP・MPの基本ステータスを直接向上
- **パーセンテージ効果**: HPブーストはHP%による倍率効果も付与
- **レベル依存**: 両スキルともスキルレベルに比例した効果
- **汎用性**: すべての武器種で効果を発揮

## 関連ファイル

- メインドキュメント: `../buff-skill-details-common.md`
- 実装ファイル: `../../src/utils/buffSkillCalculation.ts`
- データ定義: `../../src/data/buffSkills.ts`