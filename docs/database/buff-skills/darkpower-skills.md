# ダークパワースキル系統詳細設計書

## 概要

ダークパワースキル系統（category: 'darkPower'）のバフスキル詳細仕様を記述します。
ダークパワー系統は特殊な敵DEF・MDEF減算効果を持つ系統で、複雑なパラメータ計算が特徴です。

## データ構造

```typescript
interface DarkPowerSkillDetail {
  id: string                    // data-key値
  name: string                 // 表示名
  category: 'darkPower'        // スキル系統（ダークパワー固定）
  type: BuffSkillType         // UI制御タイプ
  order: number               // 表示順序
  description: string         // スキル説明
  effects: SkillEffect[]      // 効果リスト
  calculationFormula: string  // 基本計算式
  enemyDebuffFormula: string  // 敵デバフ計算式
  uiSettings: UISettings      // UI表示設定
  specialNotes: string[]      // 特別な実装注意点
}
```

## ダークパワースキル一覧

### 7.1 エターナルナイトメア (dp1)

```typescript
{
  id: 'dp1',
  name: 'エターナルナイトメア',
  category: 'darkPower',
  type: 'multiParam',
  multiParams: {
    param1: {
      name: 'スキルレベル',
      min: 1,
      max: 10,
      default: 10,
      unit: 'Lv'
    },
    param2: {
      name: 'スキルポイント合計',
      min: 25,
      max: 80,
      default: 80,
      unit: 'pt'
    }
  },
  order: 1401,
  description: 'スキルレベルとスキルポイント合計でHP率と属性耐性を上昇させ、敵のDEF・MDEFを減算する',
  effects: [
    {
      property: 'HP_Rate',
      formula: 'Math.abs(2 * skillLevel)',
      conditions: ['絶対値計算']
    },
    {
      property: 'DarkResistance_Rate',
      formula: '+5',
      conditions: ['固定値']
    },
    {
      property: 'LightResistance_Rate',
      formula: '-5',
      conditions: ['固定値']
    }
  ],
  calculationFormula: `
    プレイヤー効果:
    - HP% = |2 × スキルレベル|%
    - 闇耐性% = +5%
    - 光耐性% = -5%
  `,
  enemyDebuffFormula: `
    敵DEF・MDEF減算効果:
    減算値 = Math.min(
      スキルポイント合計 × (スキルレベル × 0.5),
      Normal難易度DEF/MDEF × 0.5
    )
    
    計算例（スキルLv10、スキルポイント80pt、Normal敵DEF2000の場合）:
    減算値 = Math.min(80 × (10 × 0.5), 2000 × 0.5)
          = Math.min(80 × 5, 1000)
          = Math.min(400, 1000)
          = 400
    最終敵DEF = 2000 - 400 = 1600
  `,
  weaponRequirement: {
    description: 'すべての武器で効果があります'
  },
  damageCalculationIntegration: {
    playerEffects: 'HP率と属性耐性は基本ステータス計算で適用',
    enemyDebuff: 'ダメージ計算時に敵DEF・MDEFから減算値を控除',
    applicationTiming: 'ダメージ計算のステップ3（DEF・MDEF計算）で適用',
    difficultyHandling: 'ボス戦時もNormal難易度のDEF/MDEFを参照して上限計算'
  },
  uiSettings: {
    parameterName: 'スキルレベル・スキルポイント',
    showInModal: true,
    quickToggle: false,
    param1Label: 'スキルレベル',
    param2Label: 'ダークパワー全スキルポイント',
    param1Description: 'エターナルナイトメアのスキルレベル（1-10）',
    param2Description: 'ダークパワー系統で使用した全スキルポイント（25-80pt）'
  },
  specialNotes: [
    'HP率の計算は絶対値を使用（|2 × スキルレベル|%）',
    '敵DEF・MDEF減算効果は実装済み',
    'ダークパワー系統の全習得スキルポイントが必要',
    'ボス戦時の減算計算ではNormal難易度のDEF/MDEFを参照',
    '例: Hard難易度でもNormal値の半分で上限計算を行う',
    'multiParam2がダークパワー全習得スキルポイントを表す',
    'スキルポイント範囲は25pt（最低限）～80pt（全取得）'
  ]
}

// 実装用の効果計算関数
function calculateEternalNightmareEffects(
  skillLevel: number,    // 1-10
  totalSkillPoints: number // 25-80
): {
  playerEffects: Partial<EquipmentProperties>,
  enemyDebuff: { defReduction: number, mdefReduction: number }
} {
  if (!skillLevel || skillLevel < 1 || skillLevel > 10) {
    return { playerEffects: {}, enemyDebuff: { defReduction: 0, mdefReduction: 0 } }
  }
  
  const clampedSkillPoints = Math.max(25, Math.min(80, totalSkillPoints))
  
  // プレイヤー効果
  const playerEffects: Partial<EquipmentProperties> = {
    HP_Rate: Math.abs(2 * skillLevel), // HP率（絶対値）
    DarkResistance_Rate: 5,            // 闇耐性+5%
    LightResistance_Rate: -5           // 光耐性-5%
  }
  
  // 敵デバフ効果（実際の減算はダメージ計算時に行う）
  const baseReduction = clampedSkillPoints * (skillLevel * 0.5)
  
  return {
    playerEffects,
    enemyDebuff: {
      defReduction: baseReduction,   // 実際の上限適用はダメージ計算時
      mdefReduction: baseReduction   // 実際の上限適用はダメージ計算時
    }
  }
}
```

## 実装詳細

### 敵DEF・MDEF減算システム

ダークパワースキル系統の特徴として、敵のDEF・MDEFを減算する効果があります：

#### 計算式
```
減算値 = Math.min(
  スキルポイント合計 × (スキルレベル × 0.5),
  Normal難易度DEF/MDEF × 0.5
)
```

#### 実装パターン
```typescript
// ダメージ計算での統合例
export function applyEternalNightmareDebuff(
  normalEnemyDEF: number,
  normalEnemyMDEF: number,
  skillLevel: number,
  totalSkillPoints: number
): { adjustedDEF: number, adjustedMDEF: number } {
  
  const baseReduction = totalSkillPoints * (skillLevel * 0.5)
  
  // Normal難易度の50%を上限として減算
  const defReduction = Math.min(baseReduction, normalEnemyDEF * 0.5)
  const mdefReduction = Math.min(baseReduction, normalEnemyMDEF * 0.5)
  
  return {
    adjustedDEF: Math.max(0, normalEnemyDEF - defReduction),
    adjustedMDEF: Math.max(0, normalEnemyMDEF - mdefReduction)
  }
}
```

### UI仕様

#### multiParamタイプ（エターナルナイトメア）

- **param1**: スキルレベル（1-10、デフォルト10）
- **param2**: ダークパワー全スキルポイント（25-80pt、デフォルト80）
- **UI**: モーダル表示、両パラメータ設定可能
- **表示形式**: 「エターナルナイトメア/Lv.10」

### 武器種別要件

全武器種で使用可能：

- **対象武器**: すべての武器
- **制限**: なし
- **効果変動**: 武器種による効果の違いなし

## 実装ステータス

- [x] エターナルナイトメア (dp1) - 設計・実装完了（敵デバフ効果含む）

## 特徴

- **複雑パラメータ**: 2つのパラメータ（スキルレベル・スキルポイント合計）を使用
- **敵デバフ効果**: ゲーム内でも珍しい敵のステータス減算効果
- **絶対値計算**: HP率計算で絶対値を使用する特殊仕様
- **難易度無視**: ボス戦でもNormal難易度DEF/MDEFを参照する特殊処理
- **上限制限**: 敵DEF・MDEFの50%を上限とする減算制限

## 関連ファイル

- **メインドキュメント**: `../buff-skill-details.md`
- **実装ファイル**: `../../src/utils/buffSkillCalculation/categories/darkPowerSkills.ts`
- **データ定義**: `../../src/data/buffSkills/common.ts`
- **型定義**: `../../src/types/buffSkill.ts`

## 更新履歴

| 日付 | 更新内容 | 備考 |
|------|----------|------|
| 2025-01-XX | ダークパワースキル系統を個別ファイルに分離 | buff-skill-details.mdから移動 |