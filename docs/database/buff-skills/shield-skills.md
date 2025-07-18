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

### 10.1 プロテクション (IsProtect)
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

### 10.2 イージス (IsAegis)
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

## スキル間の相互作用

### 相殺効果
プロテクションとイージスを同時に有効化した場合：
```
物理耐性% = base + 30 - 15 = base + 15
魔法耐性% = base - 15 + 30 = base + 15
```
結果として両耐性が15%ずつ上昇します。

### 戦略的活用
- **物理攻撃主体の敵**: プロテクションのみ有効化
- **魔法攻撃主体の敵**: イージスのみ有効化
- **混合攻撃の敵**: 両スキル有効化で均等防御

## 実装ステータス

- [x] プロテクション (IsProtect) - 設計・実装完了
- [x] イージス (IsAegis) - 設計・実装完了
- [x] 統合関数 (getShieldSkillBonuses) - 実装完了
- [x] 計算エンジン統合 - 完了
- [x] バフスキル統合システム - 完了

## 特徴

- **武器種制限**: なし（全武器種で使用可能）
- **効果タイプ**: トグル式（ON/OFF）
- **相反効果**: 物理と魔法の耐性がトレードオフ関係
- **累積効果**: 両スキル同時使用時の効果累積

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
// 統合関数による両スキルの効果統合
function getShieldSkillBonuses(
  buffSkillData: Record<string, BuffSkillState> | null
): Partial<EquipmentProperties> {
  const bonuses: Partial<EquipmentProperties> = {}
  
  // プロテクションの効果を統合
  const protectionBonuses = getProtectionEffects(buffSkillData)
  // イージスの効果を統合
  const aegisBonuses = getAegisEffects(buffSkillData)
  
  // 効果を累積加算
  return integrateEffects([protectionBonuses, aegisBonuses])
}
```