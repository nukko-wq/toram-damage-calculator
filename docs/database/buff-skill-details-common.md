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
- **デュアルソードスキル系統**: [buff-skills-common/dualsword-skills.md](./buff-skills-common/dualsword-skills.md) ✅
- **サポートスキル系統**: [buff-skills-common/support-skills.md](./buff-skills-common/support-skills.md) ✅
- **パルチザンスキル系統**: [buff-skills-common/partisan-skills.md](./buff-skills-common/partisan-skills.md) ✅
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

#### 2.2 武士弓術 (ar1)
```typescript
{
  id: 'ar1',
  name: '武士弓術',
  category: 'shoot',
  type: 'toggle',
  order: 301,
  description: 'サブ武器の抜刀剣による武器ATKと安定率の向上',
  effects: [
    {
      property: 'WeaponATK',
      formula: 'subWeaponATK',
      conditions: ['メイン武器が弓', 'サブ武器が抜刀剣']
    },
    {
      property: 'Stability_Rate',
      formula: 'Math.floor(subWeaponStability / 4)',
      conditions: ['メイン武器が弓', 'サブ武器が抜刀剣']
    }
  ],
  calculationFormula: 'WeaponATK = base + サブ武器の武器ATK, Stability% = base + Math.floor(サブ武器の安定率 / 4)',
  weaponRequirement: {
    description: 'メイン武器が弓でサブ武器が抜刀剣で効果があります'
  },
  uiSettings: {
    parameterName: 'ON/OFF',
    showInModal: false,
    quickToggle: true
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
- 4.3 怪力乱神 (mf1) - ATK = skillLevel × 10, AttackMPRecovery = 5 + skillLevel + Math.floor(skillLevel / 5) × 5（すべての武器で効果有）
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

詳細は [buff-skills-common/support-skills.md](./buff-skills-common/support-skills.md) を参照してください。

**含まれるスキル:**
- 12.1 ブレイブオーラ (IsBrave) - 武器ATK+30%、ブレイブ倍率+20%（バフ使用者時命中率-50%）
- 12.2 マナリチャージ (IsManaReCharge) - ブレイブ倍率-25%

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

**含まれるスキル:**
- 15.1 ブレイブアップ (IsPetBrave) - ATK%+10%, ATK+75, AttackSpeed%+20%, AttackSpeed+300
- 15.2 マインドアップ (IsPetMind) - MATK%+10%, MATK+75, CastingSpeed%+20%, CastingSpeed+300
- 15.3 カットアップ (IsPetCut) - PhysicalResistance%+35%, MagicalResistance%+35%
- 15.4 クリティカルアップ (IsPetCri) - CriticalDamage+12

#### 15.1 ブレイブアップ (IsPetBrave)
```typescript
{
  id: 'IsPetBrave',
  name: 'ブレイブアップ',
  category: 'pet',
  type: 'toggle',
  order: 2301,
  description: 'ペットによる攻撃力と攻撃速度の複合強化',
  effects: [
    {
      property: 'ATK_Rate',
      formula: '+10',
      conditions: []
    },
    {
      property: 'ATK',
      formula: '+75',
      conditions: []
    },
    {
      property: 'AttackSpeed_Rate',
      formula: '+20',
      conditions: []
    },
    {
      property: 'AttackSpeed',
      formula: '+300',
      conditions: []
    }
  ],
  calculationFormula: 'ATK% = base + 10, ATK = base + 75, AttackSpeed% = base + 20, AttackSpeed = base + 300',
  weaponRequirement: {
    description: 'すべての武器で効果があります'
  },
  uiSettings: {
    parameterName: 'ON/OFF',
    showInModal: false,
    quickToggle: true
  }
}
```

#### 15.2 マインドアップ (IsPetMind)
```typescript
{
  id: 'IsPetMind',
  name: 'マインドアップ',
  category: 'pet',
  type: 'toggle',
  order: 2302,
  description: 'ペットによる魔法攻撃力と詠唱速度の複合強化',
  effects: [
    {
      property: 'MATK_Rate',
      formula: '+10',
      conditions: []
    },
    {
      property: 'MATK',
      formula: '+75',
      conditions: []
    },
    {
      property: 'CastingSpeed_Rate',
      formula: '+20',
      conditions: []
    },
    {
      property: 'CastingSpeed',
      formula: '+300',
      conditions: []
    }
  ],
  calculationFormula: 'MATK% = base + 10, MATK = base + 75, CastingSpeed% = base + 20, CastingSpeed = base + 300',
  weaponRequirement: {
    description: 'すべての武器で効果があります'
  },
  uiSettings: {
    parameterName: 'ON/OFF',
    showInModal: false,
    quickToggle: true
  }
}
```

#### 15.3 カットアップ (IsPetCut)
```typescript
{
  id: 'IsPetCut',
  name: 'カットアップ',
  category: 'pet',
  type: 'toggle',
  order: 2303,
  description: 'ペットによる物理・魔法耐性の複合強化',
  effects: [
    {
      property: 'PhysicalResistance_Rate',
      formula: '+35',
      conditions: []
    },
    {
      property: 'MagicalResistance_Rate',
      formula: '+35',
      conditions: []
    }
  ],
  calculationFormula: 'PhysicalResistance% = base + 35, MagicalResistance% = base + 35',
  weaponRequirement: {
    description: 'すべての武器で効果があります'
  },
  uiSettings: {
    parameterName: 'ON/OFF',
    showInModal: false,
    quickToggle: true
  }
}
```

#### 15.4 クリティカルアップ (IsPetCri)
```typescript
{
  id: 'IsPetCri',
  name: 'クリティカルアップ',
  category: 'pet',
  type: 'toggle',
  order: 2304,
  description: 'ペットによるクリティカルダメージ強化',
  effects: [
    {
      property: 'CriticalDamage',
      formula: '+12',
      conditions: []
    }
  ],
  calculationFormula: 'CriticalDamage = base + 12',
  weaponRequirement: {
    description: 'すべての武器で効果があります'
  },
  uiSettings: {
    parameterName: 'ON/OFF',
    showInModal: false,
    quickToggle: true
  }
}
```

### 16. デュアルソードスキル系統

詳細は [buff-skills-common/dualsword-skills.md](./buff-skills-common/dualsword-skills.md) を参照してください。

**含まれるスキル:**
- 16.1 神速の軌跡 (ds1-2) - AGI・抜刀威力上昇（双剣装備時抜刀威力強化）

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