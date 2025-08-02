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

### 0.1 ブレードマスタリ (Ms-blade)
```typescript
{
  id: 'Ms-blade',
  name: 'ブレードマスタリ',
  category: 'mastery',
  type: 'level',
  order: 101,
  maxLevel: 10,
  description: '片手剣・両手剣・双剣装備時に武器ATKとATKを上昇させる',
  effects: [
    {
      property: 'WeaponATK_Rate',
      formula: 'skillLevel * 3',
      conditions: ['片手剣・両手剣・双剣装備時']
    },
    {
      property: 'ATK_Rate',
      formula: 'skillLevel >= 8 ? 3 : skillLevel >= 3 ? 2 : 1',
      conditions: ['片手剣・両手剣・双剣装備時']
    }
  ],
  calculationFormula: 'WeaponATK% = skillLevel × 3, ATK% = Lv1-2:1, Lv3-7:2, Lv8-10:3',
  weaponRequirements: [
    { weaponType: '片手剣', include: true },
    { weaponType: '両手剣', include: true },
    { weaponType: '双剣', include: true }
  ],
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}

// 実装用の効果計算関数
function calculateBladeMasteryEffects(
  skillLevel: number,
  weaponType: MainWeaponType | null
): Partial<EquipmentProperties> {
  const bladeWeapons: MainWeaponType[] = [
    'oneHandSword',
    'twoHandSword',
    'dualSword',
  ]
  if (!weaponType || !bladeWeapons.includes(weaponType) || skillLevel <= 0)
    return {}

  // WeaponATK%計算
  const weaponATKRate = skillLevel * 3

  // ATK%計算（スキルレベル別）
  let atkRate = 0
  if (skillLevel >= 1 && skillLevel <= 2) {
    atkRate = 1
  } else if (skillLevel >= 3 && skillLevel <= 7) {
    atkRate = 2
  } else if (skillLevel >= 8 && skillLevel <= 10) {
    atkRate = 3
  }

  return {
    WeaponATK_Rate: weaponATKRate,
    ATK_Rate: atkRate,
  }
}
```

### 1.1 ウォークライ (IsWarcry)
```typescript
{
  id: 'IsWarcry',
  name: 'ウォークライ',
  category: 'blade',
  type: 'multiParam',
  multiParams: {
    param1: {
      name: '武器タイプ',
      min: 1,
      max: 2,
      default: 2,
      unit: ''
    }
  },
  order: 201,
  description: '武器タイプに応じて攻撃力率を上昇させる。全武器で効果があります',
  effects: [
    {
      property: 'ATK_Rate',
      formula: 'param1 === 1 ? +15 : +10',
      conditions: ['両手剣(1): +15%, 両手剣以外(2): +10%']
    }
  ],
  calculationFormula: `
    両手剣(1)の場合:
    - ATK_Rate: +15%
    
    両手剣以外(2)の場合:
    - ATK_Rate: +10%
  `,
  uiSettings: {
    parameterName: '武器タイプ',
    parameterUnit: '',
    showInModal: true,
    quickToggle: false,
    parameterOptions: [
      { value: 1, label: '両手剣', description: 'ATK率+15%' },
      { value: 2, label: '両手剣以外', description: 'ATK率+10%' }
    ]
  }
}

// 実装用の効果計算関数
function calculateWarCryEffects(
  weaponTypeParam: number // 1: 両手剣, 2: 両手剣以外
): Partial<EquipmentProperties> {
  if (!weaponTypeParam || (weaponTypeParam !== 1 && weaponTypeParam !== 2)) return {}

  // 武器タイプに応じた効果
  if (weaponTypeParam === 1) {
    // 両手剣の場合
    return {
      ATK_Rate: 15, // ATK率+15%
    }
  } else {
    // 両手剣以外の場合
    return {
      ATK_Rate: 10, // ATK率+10%
    }
  }
}
```

### 1.2 バーサーク (Berserk)
```typescript
{
  id: 'Berserk',
  name: 'バーサーク',
  category: 'blade',
  type: 'toggle',
  order: 202,
  description: '攻撃速度・クリティカルを大幅上昇、安定率が減少（武器種により効果変動）',
  effects: [
    {
      property: 'AttackSpeed',
      formula: '+1000',
      conditions: ['全武器種共通']
    },
    {
      property: 'AttackSpeed_Rate',
      formula: '+100',
      conditions: ['全武器種共通']
    },
    {
      property: 'Critical',
      formula: 'weaponType === "twoHandSword" ? +50 : +25',
      conditions: ['両手剣装備時: +50, その他: +25']
    },
    {
      property: 'Stability_Rate',
      formula: 'weaponType === "oneHandSword" || weaponType === "dualSword" ? -25 : -50',
      conditions: ['片手剣・双剣装備時: -25%, その他: -50%']
    }
  ],
  calculationFormula: `
    全武器共通: 攻撃速度 = base + 1000, 攻撃速度% = base + 100
    片手剣・双剣装備時: クリティカル = base + 25, 安定率% = base - 25
    両手剣装備時: クリティカル = base + 50, 安定率% = base - 25
    その他武器装備時: クリティカル = base + 25, 安定率% = base - 50
  `,
  weaponEffects: {
    oneHandSword: { Critical: 25, Stability_Rate: -25 },
    twoHandSword: { Critical: 50, Stability_Rate: -25 },
    dualSword: { Critical: 25, Stability_Rate: -25 },
    other: { Critical: 25, Stability_Rate: -50 }
  },
  uiSettings: {
    parameterName: 'ON/OFF',
    showInModal: false,
    quickToggle: true
  }
}

// 実装用の効果計算関数
function calculateBerserkEffects(
  isEnabled: boolean,
  weaponType: MainWeaponType | null
): Partial<EquipmentProperties> {
  if (!isEnabled) return {}
  
  // 全武器種共通効果
  const baseEffects: Partial<EquipmentProperties> = {
    AttackSpeed: 1000,
    AttackSpeed_Rate: 100
  }
  
  // 武器種別効果計算
  let weaponSpecificEffects: Partial<EquipmentProperties> = {}
  
  if (weaponType === 'oneHandSword' || weaponType === 'dualSword') {
    // 片手剣・双剣装備時
    weaponSpecificEffects = {
      Critical: 25,
      Stability_Rate: -25
    }
  } else if (weaponType === 'twoHandSword') {
    // 両手剣装備時
    weaponSpecificEffects = {
      Critical: 50,
      Stability_Rate: -25
    }
  } else {
    // その他の武器装備時
    weaponSpecificEffects = {
      Critical: 25,
      Stability_Rate: -50
    }
  }
  
  return {
    ...baseEffects,
    ...weaponSpecificEffects
  }
}
```

### 1.3 オーラブレード (AuraBlade)
```typescript
{
  id: '4-OH',  // 片手剣用ID
  id: '4-DS',  // 双剣用ID  
  id: '4-TH',  // 両手剣用ID
  name: 'オーラブレード',
  category: 'blade',
  type: 'toggle',
  order: 206,
  description: '武器種に応じてブレイブ倍率を上昇させる',
  effects: [
    {
      property: 'BraveMultiplier',
      formula: 'weaponType === "oneHandSword" ? 20 : weaponType === "twoHandSword" ? 30 : weaponType === "dualSword" ? 10 : 0',
      conditions: ['片手剣: +20%, 両手剣: +30%, 双剣: +10%']
    }
  ],
  calculationFormula: `
    片手剣装備時: ブレイブ倍率 = base + 20%
    両手剣装備時: ブレイブ倍率 = base + 30%
    双剣装備時: ブレイブ倍率 = base + 10%
    その他武器装備時: 効果なし
  `,
  weaponRequirements: [
    { weaponType: '片手剣', include: true },
    { weaponType: '両手剣', include: true },
    { weaponType: '双剣', include: true }
  ],
  weaponEffects: {
    oneHandSword: { BraveMultiplier: 20 },
    twoHandSword: { BraveMultiplier: 30 },
    dualSword: { BraveMultiplier: 10 },
    other: { BraveMultiplier: 0 }
  },
  uiSettings: {
    parameterName: 'ON/OFF',
    showInModal: false,
    quickToggle: true
  }
}

// 実装用の効果計算関数
function calculateAuraBladeEffects(
  isEnabled: boolean,
  weaponType: MainWeaponType | null
): number {
  if (!isEnabled) return 0
  
  // 武器種別ブレイブ倍率計算
  switch (weaponType) {
    case 'oneHandSword':
      return 20  // +20%
    case 'twoHandSword':
      return 30  // +30%
    case 'dualSword':
      return 10  // +10%
    default:
      return 0   // 効果なし
  }
}
```

## 実装ステータス

- [x] ブレードマスタリ (Ms-blade) - 設計・実装完了
- [x] ウォークライ (IsWarcry) - 設計・実装完了（multiParam対応）
- [x] バーサーク (Berserk) - 設計・実装完了
- [x] オーラブレード (AuraBlade) - 設計完了・実装待ち

## 特徴

- **武器種制限**: ブレードマスタリとオーラブレードは片手剣・両手剣・双剣装備時のみ効果発動
- **段階的効果**: ブレードマスタリのATK%効果はスキルレベル帯によって段階的に変化
- **パラメータ選択効果**: ウォークライは武器タイプパラメータ（両手剣 or 両手剣以外）により効果が変動
  - 両手剣(1): ATK率+15%
  - 両手剣以外(2): ATK率+10%（デフォルト）
- **武器種別効果変動**: 
  - **バーサーク**: 武器種により効果が変化
    - 片手剣・双剣: 安定率減少が軽減 (-25%)
    - 両手剣: クリティカル増加が強化 (+50)
    - その他武器: 標準効果 (クリティカル+25、安定率-50%)
  - **オーラブレード**: 武器種別ブレイブ倍率効果
    - 片手剣: ブレイブ倍率+20%
    - 両手剣: ブレイブ倍率+30%（最大効果）
    - 双剣: ブレイブ倍率+10%
    - その他武器: 効果なし

## 関連ファイル

- メインドキュメント: `../buff-skill-details.md`
- 実装ファイル: `../../src/utils/buffSkillCalculation/categories/masterySkills.ts`
- データ定義: `../../src/data/buffSkills/mainWeapons/`