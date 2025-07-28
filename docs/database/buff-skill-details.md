# バフスキル詳細設計書

## 概要

全てのバフスキルの詳細仕様を記述します。
各スキルの効果計算式、パラメータ、UI表示形式を定義します。

### バフスキルの分類

1. **共通バフスキル（35個）**: 全武器種で使用可能
2. **ほぼ共通バフスキル（1個）**: 素手以外の全武器種で使用可能
3. **武器固有バフスキル**: 特定の武器種でのみ使用可能
4. **サブ武器バフスキル**: サブ武器に依存するバフスキル

**📁 分割ファイル構造**

スキル系統ごとに詳細仕様を分割整理しています：
- **ブレードスキル系統**: [buff-skills/blade-skills.md](./buff-skills/blade-skills.md) ✅
- **ハルバードスキル系統**: [buff-skills/halberd-skills.md](./buff-skills/halberd-skills.md) ✅
- **モノノフスキル系統**: [buff-skills/mononofu-skills.md](./buff-skills/mononofu-skills.md) ✅
- **サバイバルスキル系統**: [buff-skills/survival-skills.md](./buff-skills/survival-skills.md) ✅
- **バトルスキル系統**: [buff-skills/battle-skills.md](./buff-skills/battle-skills.md) ✅
- **ハンタースキル系統**: [buff-skills/hunter-skills.md](./buff-skills/hunter-skills.md) ✅
- **デュアルソードスキル系統**: [buff-skills/dualsword-skills.md](./buff-skills/dualsword-skills.md) ✅
- **サポートスキル系統**: [buff-skills/support-skills.md](./buff-skills/support-skills.md) ✅
- **パルチザンスキル系統**: [buff-skills/partisan-skills.md](./buff-skills/partisan-skills.md) ✅
- **ペット使用スキル系統**: [buff-skills/pet-skills.md](./buff-skills/pet-skills.md) ✅
- **ダークパワースキル系統**: [buff-skills/darkpower-skills.md](./buff-skills/darkpower-skills.md) ✅
- **アサシンスキル系統**: [buff-skills/assassin-skills.md](./buff-skills/assassin-skills.md) ✅
- **スプライトスキル系統**: [buff-skills/sprite-skills.md](./buff-skills/sprite-skills.md) ✅
- **その他の系統**: 順次分割予定

詳細な分割状況は [buff-skills/README.md](./buff-skills/README.md) を参照してください。

## データ構造

```typescript
interface BuffSkillDetail {
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
  weaponRequirements?: WeaponRequirement[]  // 武器制限
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

interface WeaponRequirement {
  weaponType: WeaponType      // 対象武器種
  include?: boolean           // true: 含む, false: 除く (デフォルト: true)
  subWeaponType?: SubWeaponType  // サブ武器制限
}
```

## バフスキル一覧

### A. 共通バフスキル（35個）

全武器種で使用可能なバフスキルです。

### 1. ブレードスキル系統

詳細は [buff-skills/blade-skills.md](./buff-skills/blade-skills.md) を参照してください。

**含まれるスキル:**
- 0.1 ブレードマスタリ (Ms-blade) - WeaponATK% = skillLevel × 3, ATK% = Lv1-2:1, Lv3-7:2, Lv8-10:3（片手剣・両手剣・双剣装備時）
- 1.1 ウォークライ (IsWarcry) - ATK+300, 行動速度%+50
- 1.2 バーサーク (Berserk) - 全武器：攻撃速度+1000・攻撃速度%+100・クリティカル+25・安定率%-50。片手剣・双剣：安定率%-25に軽減。両手剣：クリティカル+50に増強

### 2. シュートスキル系統

#### 2.1 ロングレンジ (LongRange)
```typescript
{
  id: 'LongRange',
  name: 'ロングレンジ',
  category: 'shoot',
  type: 'level',
  order: 302,
  maxLevel: 10,
  description: 'AttackSkillのロングレンジ(canUseLongRange)が有効な場合にパッシブ倍率を上昇させる',
  effects: [
    {
      property: 'PassiveDamage_Rate',
      formula: 'skillLevel',
      conditions: ['AttackSkillのcanUseLongRange=true']
    }
  ],
  calculationFormula: 'パッシブ倍率% = skillLevel',
  weaponRequirements: [
    {
      weaponType: 'all',
      description: '全ての武器で効果があります'
    }
  ],
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  },
  specialMechanics: {
    longRangeCondition: true,
    note: 'canUseLongRangePowerとは違う条件です。AttackSkillのcanUseLongRangeプロパティが有効な場合のみ効果があります。'
  }
}
```

**計算例:**
- スキルレベル10: パッシブ倍率+10%
- スキルレベル5: パッシブ倍率+5%

**適用条件:**
- AttackSkillのcanUseLongRange=trueの場合のみ効果発動
- canUseLongRangePowerとは異なる条件

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

詳細は [buff-skills/halberd-skills.md](./buff-skills/halberd-skills.md) を参照してください。

**含まれるスキル:**
- 3.1 クイックオーラ (hb1) - 攻撃速度 = skillLevel × 50, 攻撃速度% = Math.floor(skillLevel × 2.5)
- 3.2 神速の捌手 (godspeed_parry) - 武器依存の複合効果（スタック型）

### 4. モノノフスキル系統

詳細は [buff-skills/mononofu-skills.md](./buff-skills/mononofu-skills.md) を参照してください。

**含まれるスキル:**
- 4.1 武士道 (Mononof) - HP = skillLevel × 10, MP = skillLevel × 10, Accuracy = skillLevel（全武器）。抜刀剣装備時追加：ATK% = Math.floor((skillLevel - 3) / 5) + 2, WeaponATK% = skillLevel × 3
- 4.2 明鏡止水 (mf1-1) - 回避% = skillLevel × 10
- 4.3 怪力乱神 (mf1) - ATK = skillLevel × 10, AttackMPRecovery = 5 + skillLevel + Math.floor(skillLevel / 5) × 5（すべての武器で効果有）
- 4.4 両手持ち (sm1-1) - 武器依存の複合効果（トグル型）

### 5. スプライトスキル系統

詳細は [buff-skills/sprite-skills.md](./buff-skills/sprite-skills.md) を参照してください。

**含まれるスキル:**
- 5.1 エンハンス (IsEnhance) - ブレイブ倍率+10%、ATK・MATKを敵の防御力に応じて上昇

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

詳細は [buff-skills/darkpower-skills.md](./buff-skills/darkpower-skills.md) を参照してください。

**含まれるスキル:**
- 7.1 エターナルナイトメア (dp1) - 複雑パラメータ（スキルレベル・スキルポイント合計）による HP率・属性耐性・敵DEF/MDEF減算効果

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

詳細は [buff-skills/hunter-skills.md](./buff-skills/hunter-skills.md) を参照してください。

**含まれるスキル:**
- 9.1 カムフラージュ (hunter5-2) - 基本ステータスレベル依存ATK・クリティカル上昇（武器種別効果）

### 10. シールドスキル系統
詳細は [buff-skills/shield-skills.md](./buff-skills/shield-skills.md) を参照してください。
**含まれるスキル:**
- 10.1 プロテクション (IsProtect) - 物理耐性+30%, 魔法耐性-15%（全武器種対応）
- 10.2 イージス (IsAegis) - 物理耐性-15%, 魔法耐性+30%（全武器種対応）

### 11. アサシンスキル系統

詳細は [buff-skills/assassin-skills.md](./buff-skills/assassin-skills.md) を参照してください。

**含まれるスキル:**
- 11.1 シーカーリウス (oh1-2) - サブ武器によるATK・物理貫通率変動（ナイフ・巻物で強化効果）
- 11.2 暗殺の極意 (assassin5-1) - クリティカル+25、クリティカルダメージ率+50%

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

詳細は [buff-skills/support-skills.md](./buff-skills/support-skills.md) を参照してください。

**含まれるスキル:**
- 12.1 ブレイブオーラ (IsBrave) - 武器ATK+30%、ブレイブ倍率+20%（バフ使用者時命中率-50%）
- 12.2 マナリチャージ (IsManaReCharge) - ブレイブ倍率-25%

### 13. サバイバルスキル系統

詳細は [buff-skills/survival-skills.md](./buff-skills/survival-skills.md) を参照してください。

**含まれるスキル:**
- 13.1 HPブースト (oh4) - HP = skillLevel × 100, HP% = skillLevel × 2
- 13.2 MPブースト (oh2) - MP = skillLevel × 30

### 14. バトルスキル系統

詳細は [buff-skills/battle-skills.md](./buff-skills/battle-skills.md) を参照してください。

**含まれるスキル:**
- 17.1 クリティカルup (oh1) - Critical+5, CriticalDamage_Rate+5
- 17.2 攻撃力UP (exATK1) - プレイヤーレベル依存ATK計算
- 17.3 魔法力UP (exMATK1) - プレイヤーレベル依存MATK計算
- 17.4 驚異の威力 (exATK2) - 攻撃力UPと同じ計算式
- 17.5 更なる魔力 (exMATK2) - 魔法力UPと同じ計算式
- 17.6 命中UP (exHIT) - Accuracy = skillLevel
- 17.7 回避UP (exFREE) - Dodge = skillLevel

### 15. ペット使用スキル系統

詳細は [buff-skills/pet-skills.md](./buff-skills/pet-skills.md) を参照してください。

**含まれるスキル:**
- 15.1 ブレイブアップ (IsPetBrave) - ATK%+10%, ATK+75, AttackSpeed%+20%, AttackSpeed+300
- 15.2 マインドアップ (IsPetMind) - MATK%+10%, MATK+75, CastingSpeed%+20%, CastingSpeed+300
- 15.3 カットアップ (IsPetCut) - PhysicalResistance%+35%, MagicalResistance%+35%
- 15.4 クリティカルアップ (IsPetCri) - CriticalDamage+12

### 16. デュアルソードスキル系統

詳細は [buff-skills/dualsword-skills.md](./buff-skills/dualsword-skills.md) を参照してください。

**含まれるスキル:**
- 16.1 神速の軌跡 (ds1-2) - AGI・抜刀威力上昇（双剣装備時抜刀威力強化）

### 17. ミンストレルスキル系統

**含まれるスキル:**
- 17.1 インスピレーション (minstrel1) - プレイヤー数に応じたATK・MATK上昇
- 17.2 熱情の歌 (IsHotKnows) - DamagePreview属性攻撃設定連動の属性有利率変動

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

#### 17.2 熱情の歌 (IsHotKnows)
```typescript
{
  id: 'IsHotKnows',
  name: '熱情の歌',
  category: 'minstrel',
  type: 'stack',
  order: 2401,
  maxStack: 10,
  description: 'DamagePreviewの属性攻撃設定に応じて属性有利率が変動',
  effects: [
    {
      property: 'ElementAdvantage_Rate',
      formula: 'stackCount * 1.5',
      conditions: ['DamagePreview属性攻撃=有(有利)']
    },
    {
      property: 'ElementAdvantage_Rate',
      formula: '-(stackCount * 1.5)',
      conditions: ['DamagePreview属性攻撃=不利属性']
    }
  ],
  calculationFormula: '属性有利% = ±(スタック数 × 1.5) [有利: +, 不利: -]',
  weaponRequirements: [
    {
      weaponType: 'all',
      description: '全ての武器で効果があります'
    }
  ],
  uiSettings: {
    parameterName: 'スタック数',
    parameterUnit: '回',
    showInModal: true,
    quickToggle: false
  },
  specialMechanics: {
    damagePreviewIntegration: true,
    elementAdvantageConditions: {
      advantageous: '+1.5 × スタック数',
      disadvantageous: '-1.5 × スタック数',
      other: '効果なし',
      none: '効果なし'
    }
  }
}
```

**計算例:**
- スタック数10、属性攻撃=有(有利): +15%の属性有利率
- スタック数10、属性攻撃=不利属性: -15%の属性有利率
- スタック数5、属性攻撃=有(有利): +7.5%の属性有利率


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