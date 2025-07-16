# 共通バフスキル詳細設計書

## 概要

全武器種で使用可能な共通バフスキル（35個）の詳細仕様を記述します。
各スキルの効果計算式、パラメータ、UI表示形式を定義します。

**📁 分割ファイル構造**

スキル系統ごとに詳細仕様を分割整理しています：
- **ブレードスキル系統**: [buff-skills-common/blade-skills.md](./buff-skills-common/blade-skills.md) ✅
- **ハルバードスキル系統**: [buff-skills-common/halberd-skills.md](./buff-skills-common/halberd-skills.md) ✅
- **モノノフスキル系統**: [buff-skills-common/mononofu-skills.md](./buff-skills-common/mononofu-skills.md) ✅
- **サバイバルスキル系統**: [buff-skills-common/survival-skills.md](./buff-skills-common/survival-skills.md) ✅
- **バトルスキル系統**: [buff-skills-common/battle-skills.md](./buff-skills-common/battle-skills.md) ✅
- **ハンタースキル系統**: [buff-skills-common/hunter-skills.md](./buff-skills-common/hunter-skills.md) ✅
- **その他の系統**: 順次分割予定

詳細な分割状況は [buff-skills-common/README.md](./buff-skills-common/README.md) を参照してください。

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

interface SkillEffect {
  property: EquipmentProperty  // 影響するプロパティ
  formula: string             // 計算式
  conditions?: string[]       // 適用条件
}

interface UISettings {
  parameterName: string       // パラメータ表示名
  parameterUnit?: string      // 単位（レベル、回数等）
  showInModal: boolean        // モーダル表示可否
  quickToggle: boolean        // クイックトグル対応
}
```

## 共通バフスキル一覧

### 1. ブレードスキル系統

詳細は [buff-skills-common/blade-skills.md](./buff-skills-common/blade-skills.md) を参照してください。

**含まれるスキル:**
- 1.1 ウォークライ (IsWarcry) - ATK+300, 行動速度%+50

### 2. シュートスキル系統

#### 2.1 ロングレンジ (LongRange)
```typescript
{
  id: 'LongRange',
  name: 'ロングレンジ',
  category: 'shoot',
  type: 'level',
  order: 301,
  maxLevel: 10,
  description: '遠距離威力を上昇させる',
  effects: [
    {
      property: 'LongRangeDamage_Rate',
      formula: 'skillLevel * 3',
      conditions: []
    }
  ],
  calculationFormula: '遠距離威力% = skillLevel × 3',
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}
```


### 3. ハルバードスキル系統

詳細は [buff-skills-common/halberd-skills.md](./buff-skills-common/halberd-skills.md) を参照してください。

**含まれるスキル:**
- 3.1 クイックオーラ (hb1) - 攻撃速度 = skillLevel × 50, 攻撃速度% = Math.floor(skillLevel × 2.5)
- 3.2 神速の捌手 (godspeed_parry) - 武器依存の複合効果（スタック型）

### 4. モノノフスキル系統

詳細は [buff-skills-common/mononofu-skills.md](./buff-skills-common/mononofu-skills.md) を参照してください。

**含まれるスキル:**
- 4.1 武士道 (Mononof) - クリティカル率% = skillLevel × 3
- 4.2 明鏡止水 (mf1-1) - 回避% = skillLevel × 10
- 4.3 怪力乱神 (mf1) - ATK% = skillLevel × 5
- 4.4 両手持ち (sm1-1) - 武器依存の複合効果（トグル型）

### 5. スプライトスキル系統

#### 5.1 パワーウェーブ (sprite1)
```typescript
{
  id: 'sprite1',
  name: 'パワーウェーブ',
  category: 'sprite',
  type: 'level',
  order: 701,
  maxLevel: 10,
  description: '魔法攻撃力を上昇させる',
  effects: [
    {
      property: 'MATK_Rate',
      formula: 'skillLevel * 5',
      conditions: []
    }
  ],
  calculationFormula: 'MATK% = skillLevel × 5',
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}
```

#### 5.2 ヒール (heal1)
```typescript
{
  id: 'heal1',
  name: 'ヒール',
  category: 'sprite',
  type: 'level',
  order: 702,
  maxLevel: 10,
  description: '最大HPを上昇させる',
  effects: [
    {
      property: 'HP_Rate',
      formula: 'skillLevel * 10',
      conditions: []
    }
  ],
  calculationFormula: 'HP% = skillLevel × 10',
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}
```

### 6. プリーストスキル系統

#### 6.1 聖なる加護 (pr1)
```typescript
{
  id: 'pr1',
  name: '聖なる加護',
  category: 'priest',
  type: 'level',
  order: 801,
  maxLevel: 10,
  description: '魔法防御力を上昇させる',
  effects: [
    {
      property: 'MDEF_Rate',
      formula: 'skillLevel * 10',
      conditions: []
    }
  ],
  calculationFormula: 'MDEF% = skillLevel × 10',
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}
```

#### 6.2 ネメシス (nemesis1)
```typescript
{
  id: 'nemesis1',
  name: 'ネメシス',
  category: 'priest',
  type: 'toggle',
  order: 802,
  description: 'ヘイトを上昇させる',
  effects: [
    {
      property: 'Aggro_Rate',
      formula: '+500',
      conditions: []
    }
  ],
  calculationFormula: 'ヘイト% = base + 500',
  uiSettings: {
    parameterName: 'ON/OFF',
    showInModal: false,
    quickToggle: true
  }
}
```

### 7. ダークパワースキル系統

#### 7.1 ダークパワー (DarkPower)
```typescript
{
  id: 'DarkPower',
  name: 'ダークパワー',
  category: 'darkPower',
  type: 'level',
  order: 1001,
  maxLevel: 10,
  description: '魔法攻撃力を上昇させる',
  effects: [
    {
      property: 'MATK_Rate',
      formula: 'skillLevel * 5',
      conditions: []
    }
  ],
  calculationFormula: 'MATK% = skillLevel × 5',
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}
```

### 8. ナイトスキル系統

#### 8.1 チャレンジ (challenge1)
```typescript
{
  id: 'challenge1',
  name: 'チャレンジ',
  category: 'knight',
  type: 'toggle',
  order: 1201,
  description: 'ヘイトを大幅に上昇させる',
  effects: [
    {
      property: 'Aggro_Rate',
      formula: '+1000',
      conditions: []
    }
  ],
  calculationFormula: 'ヘイト% = base + 1000',
  uiSettings: {
    parameterName: 'ON/OFF',
    showInModal: false,
    quickToggle: true
  }
}
```

### 9. ハンタースキル系統

詳細は [buff-skills-common/hunter-skills.md](./buff-skills-common/hunter-skills.md) を参照してください。

**含まれるスキル:**
- 9.1 カムフラージュ (hunter5-2) - 基本ステータスレベル依存ATK・クリティカル上昇（武器種別効果）

### 10. アサシンスキル系統

#### 10.1 ヴァニッシュ (vanish1)
```typescript
{
  id: 'vanish1',
  name: 'ヴァニッシュ',
  category: 'assassin',
  type: 'toggle',
  order: 1401,
  description: '回避を上昇させる',
  effects: [
    {
      property: 'Dodge_Rate',
      formula: '+100',
      conditions: []
    }
  ],
  calculationFormula: '回避% = base + 100',
  uiSettings: {
    parameterName: 'ON/OFF',
    showInModal: false,
    quickToggle: true
  }
}
```

### 11. ニンジャスキル系統

#### 11.1 忍術 (ninja2)
```typescript
{
  id: 'ninja2',
  name: '忍術',
  category: 'ninja',
  type: 'level',
  order: 1501,
  maxLevel: 10,
  description: '回避と移動速度を上昇させる',
  effects: [
    {
      property: 'Dodge_Rate',
      formula: 'skillLevel * 5',
      conditions: []
    },
    {
      property: 'MotionSpeed_Rate',
      formula: 'skillLevel * 3',
      conditions: []
    }
  ],
  calculationFormula: '回避% = skillLevel × 5, 行動速度% = skillLevel × 3',
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}
```

### 12. サポートスキル系統

#### 12.1 ファーストエイド (support1)
```typescript
{
  id: 'support1',
  name: 'ファーストエイド',
  category: 'support',
  type: 'level',
  order: 1601,
  maxLevel: 10,
  description: '最大HPを上昇させる',
  effects: [
    {
      property: 'HP_Rate',
      formula: 'skillLevel * 5',
      conditions: []
    }
  ],
  calculationFormula: 'HP% = skillLevel × 5',
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}
```

#### 12.2 ブレイブオーラ (IsBrave)
```typescript
{
  id: 'IsBrave',
  name: 'ブレイブオーラ',
  category: 'support',
  type: 'multiParam',
  order: 2001,
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

#### 12.3 マナリチャージ (IsManaReCharge)
```typescript
{
  id: 'IsManaReCharge',
  name: 'マナリチャージ',
  category: 'support',
  type: 'toggle',
  order: 2004,
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

### 13. サバイバルスキル系統

詳細は [buff-skills-common/survival-skills.md](./buff-skills-common/survival-skills.md) を参照してください。

**含まれるスキル:**
- 13.1 HPブースト (oh4) - HP = skillLevel × 100, HP% = skillLevel × 2
- 13.2 MPブースト (oh2) - MP = skillLevel × 30

### 14. バトルスキル系統

詳細は [buff-skills-common/battle-skills.md](./buff-skills-common/battle-skills.md) を参照してください。

**含まれるスキル:**
- 17.1 クリティカルup (oh1) - Critical+5, CriticalDamage_Rate+5
- 17.2 攻撃力UP (exATK1) - プレイヤーレベル依存ATK計算
- 17.3 魔法力UP (exMATK1) - プレイヤーレベル依存MATK計算
- 17.4 驚異の威力 (exATK2) - 攻撃力UPと同じ計算式
- 17.5 更なる魔力 (exMATK2) - 魔法力UPと同じ計算式
- 17.6 命中UP (exHIT) - Accuracy = skillLevel
- 17.7 回避UP (exFREE) - Dodge = skillLevel

### 15. ペット使用スキル系統

#### 15.1 アニマル (pet1)
```typescript
{
  id: 'pet1',
  name: 'アニマル',
  category: 'pet',
  type: 'toggle',
  order: 1901,
  description: 'ペット召喚による補助効果',
  effects: [
    {
      property: 'ATK_Rate',
      formula: '+10',
      conditions: []
    }
  ],
  calculationFormula: 'ATK% = base + 10',
  uiSettings: {
    parameterName: 'ON/OFF',
    showInModal: false,
    quickToggle: true
  }
}
```

### 16. デュアルソードスキル系統

#### 16.1 神速の軌跡 (ds1-2)
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

### 17. ミンストレルスキル系統

#### 17.1 インスピレーション (minstrel1)
```typescript
{
  id: 'minstrel1',
  name: 'インスピレーション',
  category: 'minstrel',
  type: 'special',
  order: 2001,
  description: 'プレイヤー数に応じて効果が変動',
  effects: [
    {
      property: 'ATK_Rate',
      formula: 'playerCount * 5',
      conditions: ['プレイヤー数指定']
    },
    {
      property: 'MATK_Rate',
      formula: 'playerCount * 5',
      conditions: ['プレイヤー数指定']
    }
  ],
  calculationFormula: 'ATK% = プレイヤー数 × 5, MATK% = プレイヤー数 × 5',
  uiSettings: {
    parameterName: 'プレイヤー数',
    parameterUnit: '人',
    showInModal: true,
    quickToggle: false
  }
}
```

### 18. パルチザンスキル系統

#### 18.1 ガード (partisan1)
```typescript
{
  id: 'partisan1',
  name: 'ガード',
  category: 'partisan',
  type: 'level',
  order: 2101,
  maxLevel: 10,
  description: '物理防御力を上昇させる',
  effects: [
    {
      property: 'DEF_Rate',
      formula: 'skillLevel * 5',
      conditions: []
    }
  ],
  calculationFormula: 'DEF% = skillLevel × 5',
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}
```

## スキルタイプ別UI仕様

### toggleタイプ
- モーダル表示: なし
- クイックトグル: ON/OFFボタンのみ
- パラメータ入力: 不要

### levelタイプ
- モーダル表示: あり
- パラメータ: スキルレベル (1～maxLevel)
- UI: +1/-1、+10/-10ボタン、直接入力

### stackタイプ
- モーダル表示: あり
- パラメータ: 重ねがけ数 (1～maxStack)
- UI: ドロップダウン選択

### specialタイプ
- モーダル表示: あり
- パラメータ: スキル固有の特殊値
- UI: 数値入力フィールド

## 計算エンジン統合

### 効果適用順序
1. スキル有効性チェック (isEnabled)
2. パラメータ値取得 (level, stackCount, specialParam)
3. 計算式適用
4. EquipmentPropertiesへの反映

### 計算式実装例

```typescript
function calculateBuffSkillEffects(
  skills: Record<string, BuffSkillState>,
  skillDefinitions: CommonBuffSkillDetail[]
): Partial<EquipmentProperties> {
  const result: Partial<EquipmentProperties> = {}
  
  for (const skill of skillDefinitions) {
    const state = skills[skill.id]
    if (!state?.isEnabled) continue
    
    for (const effect of skill.effects) {
      const value = evaluateFormula(effect.formula, state)
      
      // 累積加算
      if (result[effect.property]) {
        result[effect.property]! += value
      } else {
        result[effect.property] = value
      }
    }
  }
  
  return result
}

function evaluateFormula(formula: string, state: BuffSkillState): number {
  // 計算式の評価
  // 例: "skillLevel * 3" → state.level * 3
  // 例: "stackCount * 50" → state.stackCount * 50
  // 例: "playerCount * 5" → state.specialParam * 5
}
```

## データ検証

### バリデーションルール
- スキルレベル: 1 ≤ level ≤ maxLevel
- 重ねがけ数: 1 ≤ stackCount ≤ maxStack
- 特殊パラメータ: skill固有の範囲チェック

### エラーハンドリング
- 不正値の場合はデフォルト値を使用
- 範囲外の値は最小/最大値にクランプ
- 必須パラメータ不足時はスキル無効化

## 拡張性

### 新スキル追加
1. CommonBuffSkillDetailにスキル定義追加
2. 効果計算式実装
3. UI設定追加
4. バリデーションルール追加

### 計算式の複雑化
- 条件分岐対応 (武器種、レベル帯等)
- 他スキルとの相互作用
- 動的計算式 (実行時評価)

この設計書により、共通バフスキル35個の詳細仕様と実装方針が明確化されます。