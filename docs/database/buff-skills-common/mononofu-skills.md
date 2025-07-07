# モノノフスキル系統詳細設計書

## 概要

モノノフスキル系統（category: 'mononofu'）の全武器種で使用可能なバフスキルの詳細仕様を記述します。
各スキルの効果計算式、パラメータ、UI表示形式を定義します。

## データ構造

```typescript
interface MononofuBuffSkillDetail {
  id: string                    // data-key値
  name: string                 // 表示名
  category: 'mononofu'         // スキル系統（モノノフ固定）
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

## モノノフスキル一覧

### 4.1 武士道 (Mononof)
```typescript
{
  id: 'Mononof',
  name: '武士道',
  category: 'mononofu',
  type: 'level',
  order: 601,
  maxLevel: 10,
  description: 'クリティカル率を上昇させる',
  effects: [
    {
      property: 'Critical_Rate',
      formula: 'skillLevel * 3',
      conditions: []
    }
  ],
  calculationFormula: 'クリティカル率% = skillLevel × 3',
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}

// 実装用の効果計算関数
function calculateBushidoEffects(
  skillLevel: number
): Partial<EquipmentProperties> {
  if (!skillLevel || skillLevel === 0) return {}
  
  return {
    Critical_Rate: skillLevel * 3
  }
}
```

### 4.2 明鏡止水 (mf1-1)
```typescript
{
  id: 'mf1-1',
  name: '明鏡止水',
  category: 'mononofu',
  type: 'level',
  order: 602,
  maxLevel: 10,
  description: '回避を上昇させる',
  effects: [
    {
      property: 'Dodge_Rate',
      formula: 'skillLevel * 10',
      conditions: []
    }
  ],
  calculationFormula: '回避% = skillLevel × 10',
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}

// 実装用の効果計算関数
function calculateClearMindEffects(
  skillLevel: number
): Partial<EquipmentProperties> {
  if (!skillLevel || skillLevel === 0) return {}
  
  return {
    Dodge_Rate: skillLevel * 10
  }
}
```

### 4.3 怪力乱神 (mf1)
```typescript
{
  id: 'mf1',
  name: '怪力乱神',
  category: 'mononofu',
  type: 'level',
  order: 603,
  maxLevel: 10,
  description: '攻撃力を上昇させる',
  effects: [
    {
      property: 'ATK_Rate',
      formula: 'skillLevel * 5',
      conditions: []
    }
  ],
  calculationFormula: 'ATK% = skillLevel × 5',
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}

// 実装用の効果計算関数
function calculateSupernaturalPowerEffects(
  skillLevel: number
): Partial<EquipmentProperties> {
  if (!skillLevel || skillLevel === 0) return {}
  
  return {
    ATK_Rate: skillLevel * 5
  }
}
```

### 4.4 両手持ち (sm1-1)
```typescript
{
  id: 'sm1-1',
  name: '両手持ち',
  category: 'mononofu',
  type: 'toggle',
  order: 704,
  description: 'サブ武器を装備していない時に各種能力を上昇させる',
  weaponConditionalEffects: {
    // 抜刀剣の場合（サブ武器がなしまたは巻物の場合）
    katana: {
      conditions: ['サブ武器がなしまたは巻物'],
      effects: [
        { property: 'Accuracy_Rate', formula: '+10' },
        { property: 'Stability_Rate', formula: '+10' },
        { property: 'Critical', formula: '+10' },
        { property: 'WeaponATK_Rate', formula: '+10' }
      ]
    },
    // その他の武器（サブ武器がなしの場合のみ）
    default: {
      conditions: ['サブ武器がなし'],
      effects: [
        { property: 'Accuracy_Rate', formula: '+10' },
        { property: 'Stability_Rate', formula: '+5' },
        { property: 'Critical', formula: '+5' },
        { property: 'WeaponATK_Rate', formula: '+10' }
      ]
    }
  },
  calculationFormula: `
    抜刀剣装備時（サブ武器がなしまたは巻物）:
    - 命中% = base + 10
    - 安定率% = base + 10
    - クリティカル = base + 10
    - 武器ATK% = base + 10
    
    その他武器装備時（サブ武器がなし）:
    - 命中% = base + 10
    - 安定率% = base + 5
    - クリティカル = base + 5
    - 武器ATK% = base + 10
  `,
  uiSettings: {
    parameterName: 'ON/OFF',
    showInModal: false,
    quickToggle: true
  }
}

// 実装用の効果計算関数
function calculateTwoHandsEffects(
  isEnabled: boolean,
  mainWeaponType: MainWeaponType | null,
  subWeaponType: SubWeaponType | null
): Partial<EquipmentProperties> {
  if (!isEnabled) return {}
  
  const isKatana = mainWeaponType === 'katana'
  const isSubWeaponNone = !subWeaponType || subWeaponType === 'なし'
  const isSubWeaponScroll = subWeaponType === '巻物'
  
  // 抜刀剣の場合：サブ武器がなしまたは巻物
  if (isKatana && (isSubWeaponNone || isSubWeaponScroll)) {
    return {
      Accuracy_Rate: 10,
      Stability_Rate: 10,
      Critical: 10,
      WeaponATK_Rate: 10
    }
  }
  
  // その他の武器の場合：サブ武器がなしのみ
  if (!isKatana && isSubWeaponNone) {
    return {
      Accuracy_Rate: 10,
      Stability_Rate: 5,
      Critical: 5,
      WeaponATK_Rate: 10
    }
  }
  
  // 効果条件を満たさない場合
  return {}
}
```

## 実装ステータス

- [x] 武士道 (Mononof) - 設計・実装完了
- [x] 明鏡止水 (mf1-1) - 設計・実装完了
- [x] 怪力乱神 (mf1) - 設計・実装完了
- [x] 両手持ち (sm1-1) - 設計・実装完了

## 特徴

- **武器条件依存**: 両手持ちは装備武器とサブ武器の組み合わせによって効果が変化
- **抜刀剣特例**: 抜刀剣は巻物装備時も両手持ち効果が適用される
- **クリティカル系強化**: 武士道でクリティカル率、両手持ちでクリティカル値を向上
- **バランス型**: 攻撃・防御・命中など多方面の能力向上

## 関連ファイル

- メインドキュメント: `../buff-skill-details-common.md`
- 実装ファイル: `../../src/utils/buffSkillCalculation.ts`
- データ定義: `../../src/data/buffSkills.ts`