# ブレードスキル系統詳細設計書

## 概要

ブレードスキル系統（category: 'blade'）の全武器種で使用可能なバフスキルの詳細仕様を記述します。
各スキルの効果計算式、パラメータ、UI表示形式を定義します。

## データ構造

```typescript
interface BladeBuffSkillDetail {
  id: string                    // data-key値
  name: string                 // 表示名
  category: 'blade'            // スキル系統（ブレード固定）
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

## ブレードスキル一覧

### 1.1 ウォークライ (IsWarcry)
```typescript
{
  id: 'IsWarcry',
  name: 'ウォークライ',
  category: 'blade',
  type: 'toggle',
  order: 201,
  description: '攻撃力と移動速度を上昇させる',
  effects: [
    {
      property: 'ATK',
      formula: '+300',
      conditions: []
    },
    {
      property: 'MotionSpeed_Rate',
      formula: '+50',
      conditions: []
    }
  ],
  calculationFormula: 'ATK = base + 300, 行動速度% = base + 50',
  uiSettings: {
    parameterName: 'ON/OFF',
    showInModal: false,
    quickToggle: true
  }
}

// 実装用の効果計算関数
function calculateWarcryEffects(
  isEnabled: boolean
): Partial<EquipmentProperties> {
  if (!isEnabled) return {}
  
  return {
    ATK: 300,
    MotionSpeed_Rate: 50
  }
}
```

### 1.2 ハードヒット (sm1)
```typescript
{
  id: 'sm1',
  name: 'ハードヒット',
  category: 'blade',
  type: 'level',
  order: 202,
  maxLevel: 10,
  description: '攻撃力を上昇させる',
  effects: [
    {
      property: 'ATK_Rate',
      formula: 'skillLevel * 3',
      conditions: []
    }
  ],
  calculationFormula: 'ATK% = skillLevel × 3',
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}

// 実装用の効果計算関数
function calculateHardHitEffects(
  skillLevel: number
): Partial<EquipmentProperties> {
  if (!skillLevel || skillLevel === 0) return {}
  
  return {
    ATK_Rate: skillLevel * 3
  }
}
```

### 1.3 アストラルブレイズ (sm6)
```typescript
{
  id: 'sm6',
  name: 'アストラルブレイズ',
  category: 'blade',
  type: 'toggle',
  order: 203,
  description: '武器ATKを上昇させる',
  effects: [
    {
      property: 'WeaponATK_Rate',
      formula: '+25',
      conditions: []
    }
  ],
  calculationFormula: '武器ATK% = base + 25',
  uiSettings: {
    parameterName: 'ON/OFF',
    showInModal: false,
    quickToggle: true
  }
}

// 実装用の効果計算関数
function calculateAstralBlazeEffects(
  isEnabled: boolean
): Partial<EquipmentProperties> {
  if (!isEnabled) return {}
  
  return {
    WeaponATK_Rate: 25
  }
}
```

## 実装ステータス

- [x] ウォークライ (IsWarcry) - 設計完了
- [x] ハードヒット (sm1) - 設計完了
- [x] アストラルブレイズ (sm6) - 設計完了

## 関連ファイル

- メインドキュメント: `../buff-skill-details-common.md`
- 実装ファイル: `../../src/utils/buffSkillCalculation.ts`
- データ定義: `../../src/data/buffSkills.ts`