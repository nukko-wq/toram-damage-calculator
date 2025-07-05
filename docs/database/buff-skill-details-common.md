# 共通バフスキル詳細設計書

## 概要

全武器種で使用可能な共通バフスキル（35個）の詳細仕様を記述します。
各スキルの効果計算式、パラメータ、UI表示形式を定義します。

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

#### 1.1 ウォークライ (IsWarcry)
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
```

#### 1.2 ハードヒット (sm1)
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
```

#### 1.3 アストラルブレイズ (sm6)
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
```

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

#### 2.2 パワーショット (ar4)
```typescript
{
  id: 'ar4',
  name: 'パワーショット',
  category: 'shoot',
  type: 'level',
  order: 302,
  maxLevel: 10,
  description: '弓装備時の攻撃力を上昇させる',
  effects: [
    {
      property: 'ATK_Rate',
      formula: 'skillLevel * 2',
      conditions: ['武器種が弓または自動弓']
    }
  ],
  calculationFormula: 'ATK% = skillLevel × 2 (弓系武器装備時のみ)',
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}
```

### 3. マーシャルスキル系統

#### 3.1 スマッシュ (ma1)
```typescript
{
  id: 'ma1',
  name: 'スマッシュ',
  category: 'martial',
  type: 'level',
  order: 401,
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
```

#### 3.2 アシュラオーラ (ma2)
```typescript
{
  id: 'ma2',
  name: 'アシュラオーラ',
  category: 'martial',
  type: 'toggle',
  order: 402,
  description: '攻撃速度を上昇させる',
  effects: [
    {
      property: 'AttackSpeed_Rate',
      formula: '+100',
      conditions: []
    }
  ],
  calculationFormula: '攻撃速度% = base + 100',
  uiSettings: {
    parameterName: 'ON/OFF',
    showInModal: false,
    quickToggle: true
  }
}
```

### 4. ハルバードスキル系統

#### 4.1 クイックオーラ (hb1)
```typescript
{
  id: 'hb1',
  name: 'クイックオーラ',
  category: 'halberd',
  type: 'level',
  order: 501,
  maxLevel: 10,
  description: '攻撃速度を上昇させる',
  effects: [
    {
      property: 'AttackSpeed_Rate',
      formula: 'skillLevel * 10',
      conditions: []
    }
  ],
  calculationFormula: '攻撃速度% = skillLevel × 10',
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}
```

#### 4.2 神速の捌手 (godspeed_parry)
```typescript
{
  id: 'godspeed_parry',
  name: '神速の捌手',
  category: 'halberd',
  type: 'stack',
  order: 602,
  maxStack: 3,
  description: '攻撃速度と行動速度を上昇させる代わりに、MPと耐性が減少する',
  weaponConditionalEffects: {
    // 旋風槍装備時の効果
    halberd: {
      effects: [
        { property: 'AttackSpeed', formula: 'stackCount * 400' },
        { property: 'MotionSpeed_Rate', formula: 'stackCount * 10' },
        { property: 'MP', formula: 'stackCount * -100' },
        { property: 'PhysicalResistance_Rate', formula: 'stackCount * -25' },
        { property: 'MagicalResistance_Rate', formula: 'stackCount * -25' },
        { property: 'AvoidRecharge_Rate', formula: 'stackCount * 10' }
      ]
    },
    // その他武器装備時の効果
    default: {
      effects: [
        { property: 'AttackSpeed', formula: 'stackCount * 300' },
        { property: 'MotionSpeed_Rate', formula: 'stackCount * 10' },
        { property: 'MP', formula: 'stackCount * -100' },
        { property: 'PhysicalResistance_Rate', formula: 'stackCount * -70' },
        { property: 'MagicalResistance_Rate', formula: 'stackCount * -70' },
        { property: 'AvoidRecharge_Rate', formula: 'stackCount * 10' }
      ]
    }
  },
  calculationFormula: `
    旋風槍装備時:
    - 攻撃速度 = stackCount × 400
    - 行動速度% = stackCount × 10
    - MP = stackCount × -100
    - 物理耐性% = stackCount × -25
    - 魔法耐性% = stackCount × -25
    - Avoid回復% = stackCount × 10
    
    その他武器装備時:
    - 攻撃速度 = stackCount × 300
    - 行動速度% = stackCount × 10
    - MP = stackCount × -100
    - 物理耐性% = stackCount × -70
    - 魔法耐性% = stackCount × -70
    - Avoid回復% = stackCount × 10
  `,
  uiSettings: {
    parameterName: '重ねがけ数',
    parameterUnit: '回',
    showInModal: true,
    quickToggle: false
  }
}

// 実装用の効果計算関数
function calculateGodspeedParryEffects(
  stackCount: number,
  weaponType: MainWeaponType | null
): Partial<EquipmentProperties> {
  if (!stackCount || stackCount === 0) return {}
  
  const isHalberd = weaponType === 'halberd'
  
  return {
    AttackSpeed: stackCount * (isHalberd ? 400 : 300),
    MotionSpeed_Rate: stackCount * 10,
    MP: stackCount * -100,
    PhysicalResistance_Rate: stackCount * (isHalberd ? -25 : -70),
    MagicalResistance_Rate: stackCount * (isHalberd ? -25 : -70),
    AvoidRecharge_Rate: stackCount * 10
  }
}
```

### 5. モノノフスキル系統

#### 5.1 武士道 (Mononof)
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
```

#### 5.2 明鏡止水 (mf1-1)
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
```

#### 5.3 怪力乱神 (mf1)
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
```

### 6. スプライトスキル系統

#### 6.1 パワーウェーブ (sprite1)
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

#### 6.2 ヒール (heal1)
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

### 7. プリーストスキル系統

#### 7.1 聖なる加護 (pr1)
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

#### 7.2 ネメシス (nemesis1)
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

### 8. ウィザードスキル系統

#### 8.1 チェインキャスト (mg4)
```typescript
{
  id: 'mg4',
  name: 'チェインキャスト',
  category: 'wizard',
  type: 'stack',
  order: 901,
  maxStack: 10,
  description: '詠唱速度を重ねがけで上昇させる',
  effects: [
    {
      property: 'CastingSpeed_Rate',
      formula: 'stackCount * 15',
      conditions: []
    }
  ],
  calculationFormula: '詠唱速度% = stackCount × 15',
  uiSettings: {
    parameterName: '重ねがけ数',
    parameterUnit: '回',
    showInModal: true,
    quickToggle: false
  }
}
```

#### 8.2 マジックマスタリ (mg1)
```typescript
{
  id: 'mg1',
  name: 'マジックマスタリ',
  category: 'wizard',
  type: 'level',
  order: 902,
  maxLevel: 10,
  description: '魔法攻撃力を上昇させる',
  effects: [
    {
      property: 'MATK_Rate',
      formula: 'skillLevel * 3',
      conditions: []
    }
  ],
  calculationFormula: 'MATK% = skillLevel × 3',
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}
```

### 9. ダークパワースキル系統

#### 9.1 ダークパワー (DarkPower)
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

### 10. シールドスキル系統

#### 10.1 ハードボディ (shield3)
```typescript
{
  id: 'shield3',
  name: 'ハードボディ',
  category: 'shield',
  type: 'level',
  order: 1101,
  maxLevel: 10,
  description: '物理防御力を上昇させる',
  effects: [
    {
      property: 'DEF_Rate',
      formula: 'skillLevel * 10',
      conditions: []
    }
  ],
  calculationFormula: 'DEF% = skillLevel × 10',
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}
```

### 11. ナイトスキル系統

#### 11.1 チャレンジ (challenge1)
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

### 12. ハンタースキル系統

#### 12.1 レンジャーズサイト (hunter1)
```typescript
{
  id: 'hunter1',
  name: 'レンジャーズサイト',
  category: 'hunter',
  type: 'level',
  order: 1301,
  maxLevel: 10,
  description: '命中を上昇させる',
  effects: [
    {
      property: 'Accuracy_Rate',
      formula: 'skillLevel * 10',
      conditions: []
    }
  ],
  calculationFormula: '命中% = skillLevel × 10',
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}
```

### 13. アサシンスキル系統

#### 13.1 ヴァニッシュ (vanish1)
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

### 14. ニンジャスキル系統

#### 14.1 忍術 (ninja2)
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

### 15. サポートスキル系統

#### 15.1 ファーストエイド (support1)
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

### 16. サバイバルスキル系統

#### 16.1 HPブースト (survival1)
```typescript
{
  id: 'survival1',
  name: 'HPブースト',
  category: 'survival',
  type: 'level',
  order: 1701,
  maxLevel: 10,
  description: '最大HPを上昇させる',
  effects: [
    {
      property: 'HP_Rate',
      formula: 'skillLevel * 20',
      conditions: []
    }
  ],
  calculationFormula: 'HP% = skillLevel × 20',
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}
```

#### 16.2 MPブースト (survival2)
```typescript
{
  id: 'survival2',
  name: 'MPブースト',
  category: 'survival',
  type: 'level',
  order: 1702,
  maxLevel: 10,
  description: '最大MPを上昇させる',
  effects: [
    {
      property: 'MP_Rate',
      formula: 'skillLevel * 20',
      conditions: []
    }
  ],
  calculationFormula: 'MP% = skillLevel × 20',
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}
```

### 17. バトルスキル系統

#### 17.1 バトルタクティクス (battle1)
```typescript
{
  id: 'battle1',
  name: 'バトルタクティクス',
  category: 'battle',
  type: 'level',
  order: 1801,
  maxLevel: 10,
  description: '攻撃力とクリティカル率を上昇させる',
  effects: [
    {
      property: 'ATK_Rate',
      formula: 'skillLevel * 2',
      conditions: []
    },
    {
      property: 'Critical_Rate',
      formula: 'skillLevel * 2',
      conditions: []
    }
  ],
  calculationFormula: 'ATK% = skillLevel × 2, クリティカル率% = skillLevel × 2',
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}
```

### 18. ペット使用スキル系統

#### 18.1 アニマル (pet1)
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

### 19. ミンストレルスキル系統

#### 19.1 インスピレーション (minstrel1)
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

### 20. パルチザンスキル系統

#### 20.1 ガード (partisan1)
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