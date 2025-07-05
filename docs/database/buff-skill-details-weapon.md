# 武器固有バフスキル詳細設計書

## 概要

各武器種専用のバフスキルの詳細仕様を記述します。
武器種ごとにマスタリスキルと固有スキルの効果計算式、条件、UI表示形式を定義します。

## データ構造

```typescript
interface WeaponBuffSkillDetail {
  id: string                    // data-key値
  name: string                 // 表示名
  category: BuffSkillCategory  // スキル系統
  type: BuffSkillType         // UI制御タイプ
  order: number               // 表示順序
  weaponRequirement: WeaponRequirement // 武器要件
  maxLevel?: number           // 最大レベル
  maxStack?: number           // 最大重ねがけ数
  description: string         // スキル説明
  effects: WeaponSkillEffect[] // 効果リスト
  calculationFormula: string  // 計算式
  conditionalEffects?: ConditionalEffect[] // 条件付き効果
  uiSettings: UISettings      // UI表示設定
}

interface WeaponSkillEffect {
  property: EquipmentProperty
  formula: string
  conditions: string[]
  weaponTypeModifier?: string // 武器種による計算式変更
}

interface ConditionalEffect {
  condition: string           // 適用条件
  effects: WeaponSkillEffect[]
  priority: number           // 適用優先度
}

interface WeaponRequirement {
  mainWeapon: MainWeaponType[]
  excludeWeapon?: MainWeaponType[]
  subWeapon?: SubWeaponType[]
  description: string        // 要件説明
}
```

## 武器種別スキル詳細

### 1. 片手剣 (oneHandSword)

#### 1.1 ブレードマスタリ (Ms-blade)

**buffSkills.ts 実装**:
```typescript
{
  id: 'Ms-blade',
  name: 'ブレードマスタリ',
  category: 'mastery',
  type: 'level',
  maxLevel: 10,
  order: 101,
}
```

**効果仕様**:
- **適用条件**: メイン武器が片手剣、両手剣、双剣の場合のみ効果あり
- **効果内容**:
  - WeaponATK_Rate: `スキルレベル × 3%`
  - ATK_Rate: スキルレベル段階別固定値
    - Lv1-2: 1%
    - Lv3-7: 2% 
    - Lv8-10: 3%

**計算式**:
```
WeaponATK% = skillLevel × 3
ATK% = 段階別固定値
  if (skillLevel >= 1 && skillLevel <= 2) return 1
  if (skillLevel >= 3 && skillLevel <= 7) return 2  
  if (skillLevel >= 8 && skillLevel <= 10) return 3
```

**実装用計算関数**:
```typescript
function calculateBladeMasteryEffects(
  skillLevel: number,
  weaponType: MainWeaponType | null
): Partial<EquipmentProperties> {
  const bladeWeapons: MainWeaponType[] = ['oneHandSword', 'twoHandSword', 'dualSword']
  if (!weaponType || !bladeWeapons.includes(weaponType) || skillLevel <= 0) return {}
  
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

#### 1.2 素早い斬撃 (sm2)
```typescript
{
  id: 'sm2',
  name: '素早い斬撃',
  category: 'blade',
  type: 'level',
  order: 202,
  maxLevel: 10,
  weaponRequirement: {
    mainWeapon: ['oneHandSword', 'dualSword'],
    description: '片手剣または双剣装備時'
  },
  description: '攻撃速度を上昇させる',
  effects: [
    {
      property: 'AttackSpeed_Rate',
      formula: 'skillLevel * 5',
      conditions: ['剣系武器装備時']
    }
  ],
  calculationFormula: '攻撃速度% = skillLevel × 5',
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}
```

#### 1.3 バーサーク (sm3-2)
```typescript
{
  id: 'sm3-2',
  name: 'バーサーク',
  category: 'blade',
  type: 'toggle',
  order: 203,
  weaponRequirement: {
    mainWeapon: ['oneHandSword'],
    description: '片手剣装備時'
  },
  description: '攻撃力大幅上昇、防御力大幅減少',
  effects: [
    {
      property: 'ATK_Rate',
      formula: '+50',
      conditions: ['片手剣装備時']
    },
    {
      property: 'DEF_Rate',
      formula: '-30',
      conditions: ['片手剣装備時']
    }
  ],
  calculationFormula: 'ATK% = base + 50, DEF% = base - 30',
  uiSettings: {
    parameterName: 'ON/OFF',
    showInModal: false,
    quickToggle: true
  }
}
```

#### 1.4 オーラブレード (4-OH)
```typescript
{
  id: '4-OH',
  name: 'オーラブレード',
  category: 'blade',
  type: 'toggle',
  order: 206,
  weaponRequirement: {
    mainWeapon: ['oneHandSword'],
    description: '片手剣装備時'
  },
  description: '武器ATKを上昇させる',
  effects: [
    {
      property: 'WeaponATK_Rate',
      formula: '+30',
      conditions: ['片手剣装備時']
    }
  ],
  calculationFormula: '武器ATK% = base + 30',
  uiSettings: {
    parameterName: 'ON/OFF',
    showInModal: false,
    quickToggle: true
  }
}
```

### 2. 双剣 (dualSword)

#### 2.1 ブレードマスタリ (Ms-blade)
※ 片手剣セクション（1.1）を参照。双剣でも同じ効果。

#### 2.2 デュアルマスタリ (DSpena1)
```typescript
{
  id: 'DSpena1',
  name: 'デュアルマスタリ',
  category: 'mastery',
  type: 'level',
  order: 102,
  maxLevel: 10,
  weaponRequirement: {
    mainWeapon: ['dualSword'],
    description: '双剣装備時'
  },
  description: '双剣専用の攻撃力上昇',
  effects: [
    {
      property: 'ATK_Rate',
      formula: 'skillLevel * 3',
      conditions: ['双剣装備時']
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

#### 2.2 双剣の鍛錬 (DSpena2)
```typescript
{
  id: 'DSpena2',
  name: '双剣の鍛錬',
  category: 'dualSword',
  type: 'level',
  order: 701,
  maxLevel: 10,
  weaponRequirement: {
    mainWeapon: ['dualSword'],
    description: '双剣装備時'
  },
  description: 'クリティカル率と攻撃速度を上昇',
  effects: [
    {
      property: 'Critical_Rate',
      formula: 'skillLevel * 2',
      conditions: ['双剣装備時']
    },
    {
      property: 'AttackSpeed_Rate',
      formula: 'skillLevel * 3',
      conditions: ['双剣装備時']
    }
  ],
  calculationFormula: 'クリティカル率% = skillLevel × 2, 攻撃速度% = skillLevel × 3',
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}
```

#### 2.3 シュツルムリーパー (ds3)
```typescript
{
  id: 'ds3',
  name: 'シュツルムリーパー',
  category: 'dualSword',
  type: 'level',
  order: 704,
  maxLevel: 100,
  weaponRequirement: {
    mainWeapon: ['dualSword'],
    description: '双剣装備時'
  },
  description: 'レベルに応じて攻撃力が大幅上昇',
  effects: [
    {
      property: 'ATK_Rate',
      formula: 'Math.floor(skillLevel / 4) * 5',
      conditions: ['双剣装備時']
    }
  ],
  calculationFormula: 'ATK% = Math.floor(skillLevel / 4) × 5',
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}
```

#### 2.4 セイバーオーラ (ds6)
```typescript
{
  id: 'ds6',
  name: 'セイバーオーラ',
  category: 'dualSword',
  type: 'stack',
  order: 707,
  maxStack: 10,
  weaponRequirement: {
    mainWeapon: ['dualSword'],
    description: '双剣装備時'
  },
  description: '重ねがけで攻撃力上昇',
  effects: [
    {
      property: 'ATK_Rate',
      formula: 'stackCount * 8',
      conditions: ['双剣装備時']
    }
  ],
  calculationFormula: 'ATK% = stackCount × 8',
  uiSettings: {
    parameterName: '重ねがけ数',
    parameterUnit: '回',
    showInModal: true,
    quickToggle: false
  }
}
```

### 3. 両手剣 (twoHandSword)

#### 3.1 ブレードマスタリ (Ms-blade)
※ 片手剣セクション（1.1）を参照。両手剣でも同じ効果。

#### 3.2 両手剣マスタリ (Ms-twohand)
```typescript
{
  id: 'Ms-twohand',
  name: '両手剣マスタリ',
  category: 'mastery',
  type: 'level',
  order: 103,
  maxLevel: 10,
  weaponRequirement: {
    mainWeapon: ['twoHandSword'],
    description: '両手剣装備時'
  },
  description: '両手剣の攻撃力を上昇させる',
  effects: [
    {
      property: 'ATK_Rate',
      formula: 'skillLevel * 4',
      conditions: ['両手剣装備時']
    }
  ],
  calculationFormula: 'ATK% = skillLevel × 4',
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}
```

#### 3.2 重い一撃 (th1)
```typescript
{
  id: 'th1',
  name: '重い一撃',
  category: 'blade',
  type: 'level',
  order: 208,
  maxLevel: 10,
  weaponRequirement: {
    mainWeapon: ['twoHandSword'],
    description: '両手剣装備時'
  },
  description: '攻撃力上昇、攻撃速度減少',
  effects: [
    {
      property: 'ATK_Rate',
      formula: 'skillLevel * 6',
      conditions: ['両手剣装備時']
    },
    {
      property: 'AttackSpeed_Rate',
      formula: 'skillLevel * -2',
      conditions: ['両手剣装備時']
    }
  ],
  calculationFormula: 'ATK% = skillLevel × 6, 攻撃速度% = skillLevel × -2',
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}
```

### 4. 手甲 (knuckle)

#### 4.1 マーシャルマスタリ (Ms-Marchal)

**buffSkills.ts 実装**:
```typescript
{
  id: 'Ms-Marchal',
  name: 'マーシャルマスタリ',
  category: 'mastery',
  type: 'level',
  maxLevel: 10,
  order: 101,
}
```

**効果仕様**:
- **適用条件**: メイン武器が手甲の場合のみ効果あり
- **効果内容**:
  - WeaponATK_Rate: `スキルレベル × 3%`
  - ATK_Rate: スキルレベル段階別固定値
    - Lv1-2: 1%
    - Lv3-7: 2% 
    - Lv8-10: 3%

**計算式**:
```
WeaponATK% = skillLevel × 3
ATK% = 段階別固定値
  if (skillLevel >= 1 && skillLevel <= 2) return 1
  if (skillLevel >= 3 && skillLevel <= 7) return 2  
  if (skillLevel >= 8 && skillLevel <= 10) return 3
```

**実装用計算関数**:
```typescript
function calculateMartialMasteryEffects(
  skillLevel: number,
  weaponType: MainWeaponType | null
): Partial<EquipmentProperties> {
  if (weaponType !== 'knuckle' || skillLevel <= 0) return {}
  
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

#### 4.2 強力な追撃 (ma2-2)
```typescript
{
  id: 'ma2-2',
  name: '強力な追撃',
  category: 'martial',
  type: 'level',
  order: 403,
  maxLevel: 10,
  weaponRequirement: {
    mainWeapon: ['knuckle'],
    description: '手甲装備時'
  },
  description: '物理追撃を発生させる',
  effects: [
    {
      property: 'PhysicalFollowup_Rate',
      formula: 'skillLevel * 5',
      conditions: ['手甲装備時']
    }
  ],
  calculationFormula: '物理追撃% = skillLevel × 5',
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}
```

### 5. 旋風槍 (halberd)

#### 5.1 ハルバードマスタリ (Ms-halberd)

**buffSkills.ts 実装**:
```typescript
{
  id: 'Ms-halberd',
  name: 'ハルバードマスタリ',
  category: 'mastery',
  type: 'level',
  maxLevel: 10,
  order: 101,
}
```

**効果仕様**:
- **適用条件**: メイン武器が旋風槍の場合のみ効果あり
- **効果内容**:
  - WeaponATK_Rate: `スキルレベル × 3%`
  - ATK_Rate: スキルレベル段階別固定値
    - Lv1-2: 1%
    - Lv3-7: 2% 
    - Lv8-10: 3%

**計算式**:
```
WeaponATK% = skillLevel × 3
ATK% = 段階別固定値
  if (skillLevel >= 1 && skillLevel <= 2) return 1
  if (skillLevel >= 3 && skillLevel <= 7) return 2  
  if (skillLevel >= 8 && skillLevel <= 10) return 3
```

**実装用計算関数**:
```typescript
function calculateHalberdMasteryEffects(
  skillLevel: number,
  weaponType: MainWeaponType | null
): Partial<EquipmentProperties> {
  if (weaponType !== 'halberd' || skillLevel <= 0) return {}
  
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
    ATK_Rate: atkRate
  }
}
```

#### 5.2 バッシュ (hb2)
```typescript
{
  id: 'hb2',
  name: 'バッシュ',
  category: 'halberd',
  type: 'level',
  order: 503,
  maxLevel: 10,
  weaponRequirement: {
    mainWeapon: ['halberd'],
    description: '旋風槍装備時'
  },
  description: '攻撃力とスタン確率を上昇',
  effects: [
    {
      property: 'ATK_Rate',
      formula: 'skillLevel * 4',
      conditions: ['旋風槍装備時']
    }
  ],
  calculationFormula: 'ATK% = skillLevel × 4',
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}
```

### 6. 抜刀剣 (katana)

#### 6.1 抜刀剣マスタリ (Ms-katana)
```typescript
{
  id: 'Ms-katana',
  name: '抜刀剣マスタリ',
  category: 'mastery',
  type: 'level',
  order: 106,
  maxLevel: 10,
  weaponRequirement: {
    mainWeapon: ['katana'],
    description: '抜刀剣装備時'
  },
  description: '抜刀剣の攻撃力を上昇させる',
  effects: [
    {
      property: 'ATK_Rate',
      formula: 'skillLevel * 3',
      conditions: ['抜刀剣装備時']
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

#### 6.2 抜刀威力強化 (katana1)
```typescript
{
  id: 'katana1',
  name: '抜刀威力強化',
  category: 'mononofu',
  type: 'level',
  order: 604,
  maxLevel: 10,
  weaponRequirement: {
    mainWeapon: ['katana'],
    description: '抜刀剣装備時'
  },
  description: '抜刀威力を上昇させる',
  effects: [
    {
      property: 'UnsheatheAttack_Rate',
      formula: 'skillLevel * 10',
      conditions: ['抜刀剣装備時']
    }
  ],
  calculationFormula: '抜刀威力% = skillLevel × 10',
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}
```

### 7. 弓 (bow)

#### 7.1 シュートマスタリ (Ms-shoot)

**buffSkills.ts 実装**:
```typescript
{
  id: 'Ms-shoot',
  name: 'シュートマスタリ',
  category: 'mastery',
  type: 'level',
  maxLevel: 10,
  order: 101,
}
```

**効果仕様**:
- **適用条件**: メイン武器が弓、自動弓の場合のみ効果あり
- **効果内容**:
  - WeaponATK_Rate: `スキルレベル × 3%`
  - ATK_Rate: スキルレベル段階別固定値
    - Lv1-2: 1%
    - Lv3-7: 2% 
    - Lv8-10: 3%

**計算式**:
```
WeaponATK% = skillLevel × 3
ATK% = 段階別固定値
  if (skillLevel >= 1 && skillLevel <= 2) return 1
  if (skillLevel >= 3 && skillLevel <= 7) return 2  
  if (skillLevel >= 8 && skillLevel <= 10) return 3
```

**実装用計算関数**:
```typescript
function calculateShootMasteryEffects(
  skillLevel: number,
  weaponType: MainWeaponType | null
): Partial<EquipmentProperties> {
  const shootWeapons: MainWeaponType[] = ['bow', 'bowgun']
  if (!weaponType || !shootWeapons.includes(weaponType) || skillLevel <= 0) return {}
  
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

#### 7.2 フォーカス (hunter5-1)
```typescript
{
  id: 'hunter5-1',
  name: 'フォーカス',
  category: 'hunter',
  type: 'level',
  order: 1302,
  maxLevel: 10,
  weaponRequirement: {
    mainWeapon: ['bow'],
    subWeapon: ['arrow', 'katana'],
    description: '弓+矢または弓+抜刀剣装備時'
  },
  description: 'クリティカル率と命中を上昇',
  effects: [
    {
      property: 'Critical_Rate',
      formula: 'skillLevel * 5',
      conditions: ['弓+矢または弓+抜刀剣装備時']
    },
    {
      property: 'Accuracy_Rate',
      formula: 'skillLevel * 3',
      conditions: ['弓+矢または弓+抜刀剣装備時']
    }
  ],
  calculationFormula: 'クリティカル率% = skillLevel × 5, 命中% = skillLevel × 3',
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}
```

### 8. 自動弓 (bowgun)

#### 8.1 シュートマスタリ (Ms-shoot)
※ 弓セクション（7.1）を参照。自動弓でも同じ効果。

### 9. 杖 (staff)

#### 9.1 マジックマスタリ (Ms-magic)

**buffSkills.ts 実装**:
```typescript
{
  id: 'Ms-magic',
  name: 'マジックマスタリ',
  category: 'mastery',
  type: 'level',
  maxLevel: 10,
  order: 101,
}
```

**効果仕様**:
- **適用条件**: メイン武器が杖、魔道具の場合のみ効果あり
- **効果内容**:
  - WeaponATK_Rate: `スキルレベル × 3%`
  - MATK_Rate: スキルレベル段階別固定値
    - Lv1-2: 1%
    - Lv3-7: 2% 
    - Lv8-10: 3%

**計算式**:
```
WeaponATK% = skillLevel × 3
MATK% = 段階別固定値
  if (skillLevel >= 1 && skillLevel <= 2) return 1
  if (skillLevel >= 3 && skillLevel <= 7) return 2  
  if (skillLevel >= 8 && skillLevel <= 10) return 3
```

**実装用計算関数**:
```typescript
function calculateMagicMasteryEffects(
  skillLevel: number,
  weaponType: MainWeaponType | null
): Partial<EquipmentProperties> {
  const magicWeapons: MainWeaponType[] = ['staff', 'magicDevice']
  if (!weaponType || !magicWeapons.includes(weaponType) || skillLevel <= 0) return {}
  
  // WeaponATK%計算
  const weaponATKRate = skillLevel * 3
  
  // MATK%計算（スキルレベル別）
  let matkRate = 0
  if (skillLevel >= 1 && skillLevel <= 2) {
    matkRate = 1
  } else if (skillLevel >= 3 && skillLevel <= 7) {
    matkRate = 2
  } else if (skillLevel >= 8 && skillLevel <= 10) {
    matkRate = 3
  }
  
  return {
    WeaponATK_Rate: weaponATKRate,
    MATK_Rate: matkRate,
  }
}
```

#### 9.2 ファミリア (mg3)
```typescript
{
  id: 'mg3',
  name: 'ファミリア',
  category: 'wizard',
  type: 'level',
  order: 903,
  maxLevel: 10,
  weaponRequirement: {
    mainWeapon: ['staff'],
    description: '杖装備時'
  },
  description: '魔法攻撃力とMP回復を上昇',
  effects: [
    {
      property: 'MATK_Rate',
      formula: 'skillLevel * 3',
      conditions: ['杖装備時']
    },
    {
      property: 'NaturalMPRecovery_Rate',
      formula: 'skillLevel * 5',
      conditions: ['杖装備時']
    }
  ],
  calculationFormula: 'MATK% = skillLevel × 3, MP自然回復% = skillLevel × 5',
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}
```

### 10. 魔導具 (magicDevice)

#### 10.1 マジックマスタリ (Ms-magic)

魔導具のマジックマスタリは杖と同じ実装となります。

**buffSkills.ts 実装**: 杖セクションと同じ Ms-magic を使用
**効果仕様**: 杖セクションと同じ  
**計算式**: 杖セクションと同じ
**実装用計算関数**: 杖セクションと同じ

参照: 9.1 マジックマスタリ (Ms-magic)

### 11. 素手 (bareHands)

#### 11.1 素手マスタリ (Ms-barehand)
```typescript
{
  id: 'Ms-barehand',
  name: '素手マスタリ',
  category: 'mastery',
  type: 'level',
  order: 111,
  maxLevel: 10,
  weaponRequirement: {
    mainWeapon: ['bareHands'],
    description: '素手時'
  },
  description: '素手の攻撃力を上昇させる',
  effects: [
    {
      property: 'ATK_Rate',
      formula: 'skillLevel * 5',
      conditions: ['素手時']
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

## サブ武器特殊スキル

### 1. 矢装備専用スキル

#### 1.1 パライズショット (bw1)
```typescript
{
  id: 'bw1',
  name: 'パライズショット',
  category: 'shoot',
  type: 'toggle',
  order: 303,
  weaponRequirement: {
    mainWeapon: ['oneHandSword', 'halberd', 'staff'],
    subWeapon: ['arrow'],
    description: '片手剣/旋風槍/杖+矢装備時'
  },
  description: '攻撃にマヒ効果を付与',
  effects: [
    {
      property: 'ATK_Rate',
      formula: '+10',
      conditions: ['対応武器+矢装備時']
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

### 2. 魔道具サブ武器スキル

#### 2.1 急速チャージ (mg2)
```typescript
{
  id: 'mg2',
  name: '急速チャージ',
  category: 'wizard',
  type: 'stack',
  order: 904,
  maxStack: 15,
  weaponRequirement: {
    subWeapon: ['magicDevice'],
    description: 'サブ武器に魔道具装備時'
  },
  description: '詠唱速度を重ねがけで大幅上昇',
  effects: [
    {
      property: 'CastingSpeed_Rate',
      formula: 'stackCount * 20',
      conditions: ['サブ武器に魔道具装備時']
    }
  ],
  calculationFormula: '詠唱速度% = stackCount × 20',
  uiSettings: {
    parameterName: '重ねがけ数',
    parameterUnit: '回',
    showInModal: true,
    quickToggle: false
  }
}
```

#### 2.2 エンチャントバースト (mw2)
```typescript
{
  id: 'mw2',
  name: 'エンチャントバースト',
  category: 'magicBlade',
  type: 'toggle',
  order: 1004,
  weaponRequirement: {
    subWeapon: ['magicDevice'],
    description: 'サブ武器に魔道具装備時'
  },
  description: '魔法攻撃力を上昇させる',
  effects: [
    {
      property: 'MATK_Rate',
      formula: '+25',
      conditions: ['サブ武器に魔道具装備時']
    }
  ],
  calculationFormula: 'MATK% = base + 25',
  uiSettings: {
    parameterName: 'ON/OFF',
    showInModal: false,
    quickToggle: true
  }
}
```

### 3. 巻物装備専用スキル

#### 3.1 風遁の術 (ninja1)
```typescript
{
  id: 'ninja1',
  name: '風遁の術',
  category: 'ninja',
  type: 'toggle',
  order: 1502,
  weaponRequirement: {
    mainWeapon: ['oneHandSword', 'katana', 'staff', 'magicDevice'],
    subWeapon: ['scroll'],
    description: '対応武器+巻物装備時'
  },
  description: '回避と移動速度を上昇',
  effects: [
    {
      property: 'Dodge_Rate',
      formula: '+50',
      conditions: ['対応武器+巻物装備時']
    },
    {
      property: 'MotionSpeed_Rate',
      formula: '+30',
      conditions: ['対応武器+巻物装備時']
    }
  ],
  calculationFormula: '回避% = base + 50, 行動速度% = base + 30',
  uiSettings: {
    parameterName: 'ON/OFF',
    showInModal: false,
    quickToggle: true
  }
}
```

## 武器固有スキル統合ロジック

### 1. スキル選択ロジック

```typescript
function getWeaponSpecificSkills(
  mainWeapon: MainWeaponType | null,
  subWeapon: SubWeaponType | null
): WeaponBuffSkillDetail[] {
  const skills: WeaponBuffSkillDetail[] = []
  
  // マスタリスキル追加
  if (mainWeapon && mainWeapon !== 'bareHands') {
    const masterySkill = getMasterySkill(mainWeapon)
    if (masterySkill) skills.push(masterySkill)
  }
  
  // 武器固有スキル追加
  const weaponSkills = getMainWeaponSkills(mainWeapon)
  skills.push(...weaponSkills)
  
  // サブ武器スキル追加
  const subWeaponSkills = getSubWeaponSkills(mainWeapon, subWeapon)
  skills.push(...subWeaponSkills)
  
  // 重複除去と要件チェック
  return deduplicateAndValidateSkills(skills, mainWeapon, subWeapon)
}
```

### 2. 武器要件チェック

```typescript
function validateWeaponRequirement(
  skill: WeaponBuffSkillDetail,
  mainWeapon: MainWeaponType | null,
  subWeapon: SubWeaponType | null
): boolean {
  const req = skill.weaponRequirement
  
  // メイン武器チェック
  if (req.mainWeapon?.length > 0) {
    if (!mainWeapon || !req.mainWeapon.includes(mainWeapon)) {
      return false
    }
  }
  
  // 除外武器チェック
  if (req.excludeWeapon?.length > 0) {
    if (mainWeapon && req.excludeWeapon.includes(mainWeapon)) {
      return false
    }
  }
  
  // サブ武器チェック
  if (req.subWeapon?.length > 0) {
    if (!subWeapon || !req.subWeapon.includes(subWeapon)) {
      return false
    }
  }
  
  return true
}
```

### 3. 効果計算統合

```typescript
function calculateWeaponSkillEffects(
  skills: Record<string, BuffSkillState>,
  skillDefinitions: WeaponBuffSkillDetail[],
  currentWeapons: { main: MainWeaponType | null, sub: SubWeaponType | null }
): Partial<EquipmentProperties> {
  const result: Partial<EquipmentProperties> = {}
  
  for (const skill of skillDefinitions) {
    const state = skills[skill.id]
    if (!state?.isEnabled) continue
    
    // 武器要件の動的チェック
    if (!validateWeaponRequirement(skill, currentWeapons.main, currentWeapons.sub)) {
      continue
    }
    
    // 効果計算
    for (const effect of skill.effects) {
      if (areConditionsMet(effect.conditions, currentWeapons)) {
        const value = evaluateWeaponFormula(effect.formula, state, currentWeapons)
        
        // 累積加算
        if (result[effect.property]) {
          result[effect.property]! += value
        } else {
          result[effect.property] = value
        }
      }
    }
  }
  
  return result
}
```

## UI統合仕様

### 1. 武器変更時の自動更新
- 武器変更 → 利用可能スキル再計算 → UI更新
- 要件を満たさなくなったスキルは自動無効化
- 新しく利用可能になったスキルはデフォルト値で追加

### 2. 条件付き表示
- スキル名横に武器要件アイコン表示
- 要件を満たさない場合はグレーアウト
- ツールチップで要件詳細表示

### 3. エラーハンドリング
- 不正な武器組み合わせの検出
- 要件違反スキルの警告表示
- 自動復旧機能

これにより、各武器種に特化したバフスキルシステムが完全に定義され、実装可能になります。