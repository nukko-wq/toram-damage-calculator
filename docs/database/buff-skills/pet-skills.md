# ペット使用スキル系統詳細設計書

## 概要

ペット使用スキル系統（category: 'pet'）の全武器種で使用可能なバフスキルの詳細仕様を記述します。
各スキルの効果計算式、パラメータ、UI表示形式を定義します。

## データ構造

```typescript
interface PetBuffSkillDetail {
  id: string                    // data-key値
  name: string                 // 表示名
  category: 'pet'              // スキル系統（ペット固定）
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

## ペット使用スキル一覧

### 15.1 ブレイブアップ (IsPetBrave)
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

// 実装用の効果計算関数
function calculatePetBraveUpEffects(
  isEnabled: boolean
): Partial<EquipmentProperties> {
  if (!isEnabled) return {}
  
  return {
    ATK_Rate: 10,
    ATK: 75,
    AttackSpeed_Rate: 20,
    AttackSpeed: 300
  }
}
```

### 15.2 マインドアップ (IsPetMind)
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

// 実装用の効果計算関数
function calculatePetMindUpEffects(
  isEnabled: boolean
): Partial<EquipmentProperties> {
  if (!isEnabled) return {}
  
  return {
    MATK_Rate: 10,
    MATK: 75,
    CastingSpeed_Rate: 20,
    CastingSpeed: 300
  }
}
```

### 15.3 カットアップ (IsPetCut)
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

// 実装用の効果計算関数
function calculatePetCutUpEffects(
  isEnabled: boolean
): Partial<EquipmentProperties> {
  if (!isEnabled) return {}
  
  return {
    PhysicalResistance_Rate: 35,
    MagicalResistance_Rate: 35
  }
}
```

### 15.4 クリティカルアップ (IsPetCri)
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

// 実装用の効果計算関数
function calculatePetCriticalUpEffects(
  isEnabled: boolean
): Partial<EquipmentProperties> {
  if (!isEnabled) return {}
  
  return {
    CriticalDamage: 12
  }
}
```

## 実装ステータス

- [x] ブレイブアップ (IsPetBrave) - 設計・実装完了
- [x] マインドアップ (IsPetMind) - 設計・実装完了
- [x] カットアップ (IsPetCut) - 設計・実装完了
- [x] クリティカルアップ (IsPetCri) - 設計・実装完了

## 特徴

- **固定値効果**: 全てのペットスキルは固定値効果（レベル依存なし）
- **複合効果**: 複数のプロパティを同時に強化するスキルが多い
- **全武器対応**: 全てのペットスキルは武器種に関係なく効果を発揮
- **トグル型**: 全てON/OFFで制御するトグル型スキル

## 関連ファイル

- メインドキュメント: `../buff-skill-details.md`
- 実装ファイル: `../../src/utils/buffSkillCalculation/categories/petSkills.ts`
- データ定義: `../../src/data/buffSkills/common.ts`