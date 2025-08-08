# サポートスキル系統詳細設計書

## 概要

サポートスキル系統（category: 'support'）のバフスキル詳細仕様を記述します。
全武器種で使用可能な汎用的なサポート効果を持つスキルが含まれています。

## データ構造

```typescript
interface SupportSkillDetail {
  id: string                    // data-key値
  name: string                 // 表示名
  category: 'support'          // スキル系統
  type: BuffSkillType         // UI制御タイプ
  order: number               // 表示順序
  isCircle?: boolean          // サークルバフ（味方にも効果）かどうか（デフォルト: false）
  description: string         // スキル説明
  effects: SkillEffect[]      // 効果リスト
  calculationFormula: string  // 計算式
  uiSettings: UISettings      // UI表示設定
  weaponRequirement?: object  // 武器種別要件
  damageCalculationIntegration?: object // ダメージ計算統合情報
}
```

## サポートスキル一覧

### 1. ブレイブオーラ (IsBrave)

```typescript
{
  id: 'IsBrave',
  name: 'ブレイブオーラ',
  category: 'support',
  type: 'multiParam',
  order: 2001,
  isCircle: true, // サークルバフ（UI表示で赤色）
  multiParams: {
    param1: {
      name: 'バフ使用者タイプ',
      min: 1,
      max: 2,
      default: 2,
      unit: ''
    }
  },
  description: '全武器種で使用可能な攻撃力向上スキル。バフ使用者かどうかで効果が変動',
  effects: [
    {
      property: 'WeaponATK_Rate',
      formula: '+30',
      conditions: ['全バフ使用者タイプ共通']
    },
    {
      property: 'Accuracy_Rate',
      formula: 'param1 === 1 ? -50 : 0',
      conditions: ['バフ使用者(1)の場合のみ']
    },
    {
      property: 'BraveMultiplier',
      formula: '+20',
      conditions: ['全バフ使用者タイプ共通']
    }
  ],
  calculationFormula: `
    バフ使用者(1)の場合:
    - WeaponATK_Rate: +30%
    - Accuracy_Rate: -50%
    - ブレイブ倍率: +20%
    
    バフ非使用者(2)の場合:
    - WeaponATK_Rate: +30%
    - ブレイブ倍率: +20%
  `,
  weaponRequirement: {
    description: 'すべての武器で効果があります'
  },
  damageCalculationIntegration: {
    braveMultiplier: 'damageCalculationService.tsでブレイブ倍率として使用される',
    applicationTiming: 'ダメージ計算のステップ10で適用'
  },
  uiSettings: {
    parameterName: 'バフ使用者タイプ',
    parameterUnit: '',
    showInModal: true,
    quickToggle: false,
    parameterOptions: [
      { value: 1, label: 'バフ使用者', description: 'ATK+30%, 命中-50%, ブレイブ倍率+20%' },
      { value: 2, label: 'バフ非使用者', description: 'ATK+30%, ブレイブ倍率+20%' }
    ]
  }
}

// 実装用の効果計算関数
function calculateBraveAuraEffects(
  param1: number // バフ使用者タイプ (1: 使用者, 2: 非使用者)
): Partial<EquipmentProperties> {
  if (!param1 || (param1 !== 1 && param1 !== 2)) return {}
  
  const effects: Partial<EquipmentProperties> = {
    WeaponATK_Rate: 30,
    BraveMultiplier: 20
  }
  
  // バフ使用者の場合は命中率低下も追加
  if (param1 === 1) {
    effects.Accuracy_Rate = -50
  }
  
  return effects
}
```

### 2. マナリチャージ (IsManaReCharge)

```typescript
{
  id: 'IsManaReCharge',
  name: 'マナリチャージ',
  category: 'support',
  type: 'toggle',
  order: 2004,
  isCircle: true, // サークルバフ（UI表示で赤色）
  description: '全武器種で使用可能なブレイブ倍率低下スキル。マナ回復効果と引き換えにダメージが減少',
  effects: [
    {
      property: 'BraveMultiplier',
      formula: '-25',
      conditions: ['ON時のみ']
    }
  ],
  calculationFormula: `
    ON時:
    - ブレイブ倍率: -25%
  `,
  weaponRequirement: {
    description: 'すべての武器で効果があります'
  },
  damageCalculationIntegration: {
    braveMultiplier: 'damageCalculationService.tsでブレイブ倍率として使用される（負の値）',
    applicationTiming: 'ダメージ計算のステップ10で適用'
  },
  uiSettings: {
    parameterName: 'ON/OFF',
    showInModal: false,
    quickToggle: true
  }
}

// 実装用の効果計算関数
function calculateManaRechargeEffects(
  isEnabled: boolean
): Partial<EquipmentProperties> {
  if (!isEnabled) return {}
  
  return {
    BraveMultiplier: -25 // ブレイブ倍率-25%
  }
}
```

### 3. ハイサイクル (IsHighCycle)

```typescript
{
  id: 'IsHighCycle',
  name: 'ハイサイクル',
  category: 'support',
  type: 'multiParam',
  order: 2002,
  isCircle: true, // サークルバフ（UI表示で赤色）
  multiParams: {
    param1: {
      name: 'バフ使用者タイプ',
      min: 1,
      max: 2,
      default: 2,
      unit: ''
    }
  },
  description: '全武器種で使用可能な詠唱速度向上スキル。バフ使用者の場合はMP回復効率が大幅低下',
  effects: [
    {
      property: 'CastingSpeed_Rate',
      formula: '+250',
      conditions: ['全バフ使用者タイプ共通']
    },
    {
      property: 'CastingSpeed',
      formula: '+550',
      conditions: ['全バフ使用者タイプ共通']
    },
    {
      property: 'NaturalMPRecovery_Rate',
      formula: 'param1 === 1 ? -25.5 : 0',
      conditions: ['バフ使用者(1)の場合のみ']
    },
    {
      property: 'AttackMPRecovery_Rate',
      formula: 'param1 === 1 ? -75.5 : 0',
      conditions: ['バフ使用者(1)の場合のみ']
    }
  ],
  calculationFormula: `
    バフ使用者(1)の場合:
    - CastingSpeed_Rate: +250%
    - CastingSpeed: +550
    - NaturalMPRecovery_Rate: -25.5%
    - AttackMPRecovery_Rate: -75.5%
    
    バフ非使用者(2)の場合:
    - CastingSpeed_Rate: +250%
    - CastingSpeed: +550
  `,
  weaponRequirement: {
    description: 'すべての武器で効果があります'
  },
  uiSettings: {
    parameterName: 'バフ使用者タイプ',
    parameterUnit: '',
    showInModal: true,
    quickToggle: false,
    parameterOptions: [
      { value: 1, label: 'バフ使用者', description: 'CastingSpeed+250%+550, MP回復効率大幅低下' },
      { value: 2, label: 'バフ非使用者', description: 'CastingSpeed+250%+550' }
    ]
  }
}

// 実装用の効果計算関数
function calculateHighCycleEffects(
  param1: number // バフ使用者タイプ (1: 使用者, 2: 非使用者)
): Partial<EquipmentProperties> {
  if (!param1 || (param1 !== 1 && param1 !== 2)) return {}
  
  const effects: Partial<EquipmentProperties> = {
    CastingSpeed_Rate: 250,
    CastingSpeed: 550
  }
  
  // バフ使用者の場合はMP回復効率大幅低下も追加
  if (param1 === 1) {
    effects.NaturalMPRecovery_Rate = -25.5
    effects.AttackMPRecovery_Rate = -75.5
  }
  
  return effects
}
```

### 4. クイックモーション (IsQuickMotion)

```typescript
{
  id: 'IsQuickMotion',
  name: 'クイックモーション',
  category: 'support',
  type: 'multiParam',
  order: 2003,
  isCircle: true, // サークルバフ（UI表示で赤色）
  multiParams: {
    param1: {
      name: 'バフ使用者タイプ',
      min: 1,
      max: 2,
      default: 2,
      unit: ''
    }
  },
  description: '全武器種で使用可能な攻撃速度向上スキル。バフ使用者の場合はMP回復効率が低下',
  effects: [
    {
      property: 'AttackSpeed_Rate',
      formula: '+250',
      conditions: ['全バフ使用者タイプ共通']
    },
    {
      property: 'AttackSpeed',
      formula: '+1100',
      conditions: ['全バフ使用者タイプ共通']
    },
    {
      property: 'AttackMPRecovery_Rate',
      formula: 'param1 === 1 ? -70 : 0',
      conditions: ['バフ使用者(1)の場合のみ']
    }
  ],
  calculationFormula: `
    バフ使用者(1)の場合:
    - AttackSpeed_Rate: +250%
    - AttackSpeed: +1100
    - AttackMPRecovery_Rate: -70%
    
    バフ非使用者(2)の場合:
    - AttackSpeed_Rate: +250%
    - AttackSpeed: +1100
  `,
  weaponRequirement: {
    description: 'すべての武器で効果があります'
  },
  uiSettings: {
    parameterName: 'バフ使用者タイプ',
    parameterUnit: '',
    showInModal: true,
    quickToggle: false,
    parameterOptions: [
      { value: 1, label: 'バフ使用者', description: 'AttackSpeed+250%+1100, AttackMPRecovery-70%' },
      { value: 2, label: 'バフ非使用者', description: 'AttackSpeed+250%+1100' }
    ]
  }
}

// 実装用の効果計算関数
function calculateQuickMotionEffects(
  param1: number // バフ使用者タイプ (1: 使用者, 2: 非使用者)
): Partial<EquipmentProperties> {
  if (!param1 || (param1 !== 1 && param1 !== 2)) return {}
  
  const effects: Partial<EquipmentProperties> = {
    AttackSpeed_Rate: 250,
    AttackSpeed: 1100
  }
  
  // バフ使用者の場合はMP回復効率低下も追加
  if (param1 === 1) {
    effects.AttackMPRecovery_Rate = -70
  }
  
  return effects
}
```

## 実装詳細

### ブレイブ倍率システム

サポートスキル系統の特徴として、ブレイブ倍率に影響を与えるスキルが含まれています：

- **ブレイブオーラ**: +20% （攻撃力向上と引き換え）
- **マナリチャージ**: -25% （マナ回復効果と引き換え）

### 攻撃・詠唱速度システム

攻撃速度・詠唱速度に大きな影響を与えるスキル：

- **ハイサイクル**: CastingSpeed_Rate +250%, CastingSpeed +550
- **クイックモーション**: AttackSpeed_Rate +250%, AttackSpeed +1100

### multiParamタイプの実装

複数パラメータを持つ特殊なスキル：

#### ブレイブオーラ
```typescript
// バフ使用者タイプの判定
multiParam1: 1 // バフ使用者（攻撃力+30%, 命中率-50%, ブレイブ倍率+20%）
multiParam1: 2 // バフ非使用者（攻撃力+30%, ブレイブ倍率+20%）
```

#### ハイサイクル
```typescript
// バフ使用者タイプの判定
multiParam1: 1 // バフ使用者（詠唱速度大幅向上, MP回復効率大幅低下）
multiParam1: 2 // バフ非使用者（詠唱速度大幅向上のみ）
```

#### クイックモーション
```typescript
// バフ使用者タイプの判定
multiParam1: 1 // バフ使用者（攻撃速度大幅向上, MP回復効率-70%）
multiParam1: 2 // バフ非使用者（攻撃速度大幅向上のみ）
```

### ダメージ計算統合

両スキルともダメージ計算のステップ10（ブレイブ倍率補正）で使用されます：

```typescript
// damageCalculationService.ts での使用例
const braveMultiplier = getBuffSkillBraveMultiplier(buffSkillData)
// ブレイブオーラ有効時: +20%
// マナリチャージ有効時: -25%
// 両方有効時: +20% + (-25%) = -5%
```

## UI仕様

### multiParamタイプ

#### ブレイブオーラ
- **パラメータ名**: バフ使用者タイプ
- **選択肢**: 1（バフ使用者）, 2（バフ非使用者）
- **デフォルト**: 2（バフ非使用者）
- **UI**: モーダル表示、選択肢ボタン

#### ハイサイクル
- **パラメータ名**: バフ使用者タイプ
- **選択肢**: 1（バフ使用者）, 2（バフ非使用者）
- **デフォルト**: 2（バフ非使用者）
- **UI**: モーダル表示、選択肢ボタン

#### クイックモーション
- **パラメータ名**: バフ使用者タイプ
- **選択肢**: 1（バフ使用者）, 2（バフ非使用者）
- **デフォルト**: 2（バフ非使用者）
- **UI**: モーダル表示、選択肢ボタン

### toggleタイプ

#### マナリチャージ
- **パラメータ名**: ON/OFF
- **UI**: クイックトグル、モーダル表示なし

## 武器種別要件

サポートスキル系統のすべてのスキルは全武器種で使用可能です：

- **対象武器**: すべての武器
- **制限**: なし
- **効果変動**: 武器種による効果の違いなし

## 実装パターン

```typescript
// supportSkills.ts での実装例
export function getSupportSkillBonuses(
  buffSkillData: Record<string, BuffSkillState> | null,
): Partial<AllBonuses> {
  const bonuses: Partial<AllBonuses> = {}

  if (!buffSkillData) return bonuses

  // ブレイブオーラ（IsBrave）の処理
  const braveAura = buffSkillData.IsBrave
  if (braveAura?.isEnabled && braveAura.multiParam1) {
    const effects = calculateBraveAuraEffects(braveAura.multiParam1)
    integrateEffects(effects, bonuses)
  }

  // ハイサイクル（IsHighCycle）の処理
  const highCycle = buffSkillData.IsHighCycle
  if (highCycle?.isEnabled) {
    const effects = calculateHighCycleEffects(highCycle.isEnabled)
    integrateEffects(effects, bonuses)
  }

  // クイックモーション（IsQuickMotion）の処理
  const quickMotion = buffSkillData.IsQuickMotion
  if (quickMotion?.isEnabled && quickMotion.multiParam1) {
    const effects = calculateQuickMotionEffects(quickMotion.multiParam1)
    integrateEffects(effects, bonuses)
  }

  // マナリチャージ（IsManaReCharge）の処理
  const manaRecharge = buffSkillData.IsManaReCharge
  if (manaRecharge?.isEnabled) {
    const effects = calculateManaRechargeEffects(manaRecharge.isEnabled)
    integrateEffects(effects, bonuses)
  }

  return bonuses
}
```

## 関連ファイル

- **メインドキュメント**: `../buff-skill-details-common.md`
- **実装ファイル**: `../../src/utils/buffSkillCalculation.ts`
- **データ定義**: `../../src/data/buffSkills.ts`
- **型定義**: `../../src/types/buffSkill.ts`

## 更新履歴

| 日付 | 更新内容 | 備考 |
|------|----------|------|
| 2025-01-XX | サポートスキル系統を個別ファイルに分離 | buff-skill-details-common.mdから移動 |
| 2025-01-XX | ファーストエイドを削除 | 12.1を削除し、番号を調整 |
| 2025-01-XX | isCircleフラグを追加 | ブレイブオーラ、ハイサイクル、クイックモーションをサークルバフとして定義（UI表示で赤色） |