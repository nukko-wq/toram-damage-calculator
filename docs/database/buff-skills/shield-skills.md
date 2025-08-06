# シールドスキル系統詳細設計書

## 概要

シールドスキル系統（category: 'shield'）の全武器種で使用可能なバフスキルの詳細仕様を記述します。
物理耐性と魔法耐性のバランス調整を通じて、敵の攻撃タイプに応じた防御戦略を提供します。

## データ構造

```typescript
interface ShieldBuffSkillDetail {
  id: string                    // data-key値
  name: string                 // 表示名
  category: 'shield'           // スキル系統（シールド固定）
  type: BuffSkillType         // UI制御タイプ
  order: number               // 表示順序
  description: string         // スキル説明
  effects: SkillEffect[]      // 効果リスト
  calculationFormula: string  // 計算式
  uiSettings: UISettings      // UI表示設定
}
```

## シールドスキル一覧

### 10.1 シールドマスタリ (Ms-Shield)
```typescript
{
  id: 'Ms-Shield',
  name: 'シールドマスタリ',
  category: 'mastery', // マスタリスキル
  type: 'toggle',
  order: 103,
  description: '盾装備時に攻撃速度を大幅に上昇させる',
  effects: [
    {
      property: 'AttackSpeed_Rate',
      formula: '+50',
      conditions: ['盾装備時のみ効果あり']
    }
  ],
  calculationFormula: 'AttackSpeed% = base + 50 (盾装備時のみ)',
  weaponRequirements: [
    {
      subWeaponType: 'shield',
      description: '盾装備時のみ効果があります'
    }
  ],
  uiSettings: {
    parameterName: 'ON/OFF',
    showInModal: false,
    quickToggle: true
  }
}

// 実装用の効果計算関数
function calculateShieldMasteryEffects(
  isEnabled: boolean,
  hasShield: boolean
): Partial<EquipmentProperties> {
  if (!isEnabled || !hasShield) return {}
  
  return {
    AttackSpeed_Rate: 50
  }
}
```

### 10.2 プロテクション (IsProtect)
```typescript
{
  id: 'IsProtect',
  name: 'プロテクション',
  category: 'shield',
  type: 'toggle',
  order: 1501,
  description: '物理耐性を大幅に上昇させるが魔法耐性が低下する',
  effects: [
    {
      property: 'PhysicalResistance_Rate',
      formula: '+30',
      conditions: []
    },
    {
      property: 'MagicalResistance_Rate',
      formula: '-15',
      conditions: []
    }
  ],
  calculationFormula: 'PhysicalResistance% = base + 30, MagicalResistance% = base - 15',
  weaponRequirements: [
    // 全武器種で使用可能
  ],
  uiSettings: {
    parameterName: 'ON/OFF',
    showInModal: false,
    quickToggle: true
  }
}

// 実装用の効果計算関数
function calculateProtectionEffects(
  isEnabled: boolean
): Partial<EquipmentProperties> {
  if (!isEnabled) return {}
  
  return {
    PhysicalResistance_Rate: 30,
    MagicalResistance_Rate: -15
  }
}
```

### 10.3 イージス (IsAegis)
```typescript
{
  id: 'IsAegis',
  name: 'イージス',
  category: 'shield',
  type: 'toggle',
  order: 1502,
  description: '魔法耐性を大幅に上昇させるが物理耐性が低下する',
  effects: [
    {
      property: 'PhysicalResistance_Rate',
      formula: '-15',
      conditions: []
    },
    {
      property: 'MagicalResistance_Rate',
      formula: '+30',
      conditions: []
    }
  ],
  calculationFormula: 'PhysicalResistance% = base - 15, MagicalResistance% = base + 30',
  weaponRequirements: [
    // 全武器種で使用可能
  ],
  uiSettings: {
    parameterName: 'ON/OFF',
    showInModal: false,
    quickToggle: true
  }
}

// 実装用の効果計算関数
function calculateAegisEffects(
  isEnabled: boolean
): Partial<EquipmentProperties> {
  if (!isEnabled) return {}
  
  return {
    PhysicalResistance_Rate: -15,
    MagicalResistance_Rate: 30
  }
}
```

### 10.4 フォースシールド (shield1)
```typescript
{
  id: 'shield1',
  name: 'フォースシールド',
  category: 'shield',
  type: 'level',
  order: 1503,
  maxLevel: 10,
  description: 'サブ武器が盾の場合にHPと物理耐性を上昇させる',
  effects: [
    {
      property: 'HP',
      formula: 'skillLevel * 50',
      conditions: ['サブ武器が盾の場合のみ効果あり']
    },
    {
      property: 'PhysicalResistance_Rate',
      formula: 'skillLevel',
      conditions: ['サブ武器が盾の場合のみ効果あり']
    }
  ],
  calculationFormula: 'HP = skillLevel × 50, PhysicalResistance% = |skillLevel|% (サブ武器が盾の場合のみ)',
  weaponRequirements: [
    {
      subWeaponType: 'shield',
      description: 'サブ武器が盾の場合のみ効果があります'
    }
  ],
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}

// 実装用の効果計算関数
function calculateForceShieldEffects(
  skillLevel: number,
  hasShield: boolean
): Partial<EquipmentProperties> {
  if (!skillLevel || !hasShield) return {}
  
  return {
    HP: skillLevel * 50,
    PhysicalResistance_Rate: skillLevel
  }
}
```

### 10.5 マジカルシールド (shield2)
```typescript
{
  id: 'shield2',
  name: 'マジカルシールド',
  category: 'shield',
  type: 'level',
  order: 1504,
  maxLevel: 10,
  description: 'サブ武器が盾の場合にHPと魔法耐性を上昇させる',
  effects: [
    {
      property: 'HP',
      formula: 'skillLevel * 50',
      conditions: ['サブ武器が盾の場合のみ効果あり']
    },
    {
      property: 'MagicalResistance_Rate',
      formula: 'skillLevel',
      conditions: ['サブ武器が盾の場合のみ効果あり']
    }
  ],
  calculationFormula: 'HP = skillLevel × 50, MagicalResistance% = |skillLevel|% (サブ武器が盾の場合のみ)',
  weaponRequirements: [
    {
      subWeaponType: 'shield',
      description: 'サブ武器が盾の場合のみ効果があります'
    }
  ],
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}

// 実装用の効果計算関数
function calculateMagicalShieldEffects(
  skillLevel: number,
  hasShield: boolean
): Partial<EquipmentProperties> {
  if (!skillLevel || !hasShield) return {}
  
  return {
    HP: skillLevel * 50,
    MagicalResistance_Rate: skillLevel
  }
}
```

## スキル間の相互作用

### 盾装備時のスキル効果
以下のスキルは盾装備時のみ効果があります：
- **シールドマスタリ (Ms-Shield)**: 攻撃速度+50%
- **フォースシールド (shield1)**: HP+(skillLevel × 50)、物理耐性+(skillLevel)%
- **マジカルシールド (shield2)**: HP+(skillLevel × 50)、魔法耐性+(skillLevel)%

### プロテクション・イージスの相殺効果
プロテクションとイージスを同時に有効化した場合：
```
物理耐性% = base + 30 - 15 = base + 15
魔法耐性% = base - 15 + 30 = base + 15
```
結果として両耐性が15%ずつ上昇します。

### 戦略的活用
- **盾使用時の基本効果**: 
  - シールドマスタリで攻撃速度向上
  - フォースシールド・マジカルシールド併用でHP大幅増強と両耐性向上
- **物理攻撃主体の敵**: プロテクション + フォースシールド
- **魔法攻撃主体の敵**: イージス + マジカルシールド
- **混合攻撃の敵**: 全スキル有効化で最大防御

## 実装ステータス

- [x] シールドマスタリ (Ms-Shield) - 設計完了
- [x] プロテクション (IsProtect) - 設計・実装完了
- [x] イージス (IsAegis) - 設計・実装完了
- [x] フォースシールド (shield1) - 設計完了
- [x] マジカルシールド (shield2) - 設計完了
- [x] 統合関数 (getShieldSkillBonuses) - 実装完了
- [x] 計算エンジン統合 - 完了
- [x] バフスキル統合システム - 完了

## 特徴

- **武器種制限**: 
  - 盾装備時限定: シールドマスタリ、フォースシールド、マジカルシールド
  - 全武器種対応: プロテクション、イージス
- **効果タイプ**: 
  - トグル式: シールドマスタリ、プロテクション、イージス
  - レベル式: フォースシールド、マジカルシールド
- **HP強化効果**: フォースシールド・マジカルシールド両方でHP+(skillLevel × 50)
- **耐性特化**: フォースシールドは物理、マジカルシールドは魔法耐性を強化
- **相反効果**: プロテクション・イージス間で物理と魔法の耐性がトレードオフ関係
- **累積効果**: 全スキル同時使用時の効果累積可能

## 関連ファイル

- メインドキュメント: `../buff-skill-details.md`
- 実装ファイル: `../../src/utils/buffSkillCalculation/categories/shieldSkills.ts`
- データ定義: `../../src/data/buffSkills/common.ts`
- 統合処理: `../../src/utils/buffSkillCalculation/integration/mainIntegrator.ts`

## 技術仕様

### 計算エンジン統合
```typescript
// 物理耐性計算への統合
function calculatePhysicalResistance(bonuses: AllBonuses) {
  const physicalResistanceRate = bonuses.PhysicalResistance_Rate || 0
  return {
    finalPhysicalResistance: physicalResistanceRate,
    physicalResistance_Rate: physicalResistanceRate
  }
}

// 魔法耐性計算への統合
function calculateMagicalResistance(bonuses: AllBonuses) {
  const magicalResistanceRate = bonuses.MagicalResistance_Rate || 0
  return {
    finalMagicalResistance: magicalResistanceRate,
    magicalResistance_Rate: magicalResistanceRate
  }
}
```

### バフスキル統合システム
```typescript
// 統合関数による全シールドスキルの効果統合
function getShieldSkillBonuses(
  buffSkillData: Record<string, BuffSkillState> | null,
  hasShield: boolean = false
): Partial<EquipmentProperties> {
  const bonuses: Partial<EquipmentProperties> = {}
  
  // シールドマスタリの効果を統合（盾装備条件付き）
  const shieldMasteryBonuses = getShieldMasteryEffects(buffSkillData, hasShield)
  // プロテクションの効果を統合
  const protectionBonuses = getProtectionEffects(buffSkillData)
  // イージスの効果を統合
  const aegisBonuses = getAegisEffects(buffSkillData)
  
  // 効果を累積加算
  return integrateEffects([shieldMasteryBonuses, protectionBonuses, aegisBonuses])
}
```