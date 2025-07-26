# アサシンスキル系統詳細設計書

## 概要

アサシンスキル系統（category: 'assassin'）のバフスキル詳細仕様を記述します。
アサシンスキル系統はサブ武器に依存する効果を持ち、暗殺系統特有の攻撃力と貫通効果が特徴です。

## データ構造

```typescript
interface AssassinSkillDetail {
  id: string                    // data-key値
  name: string                 // 表示名
  category: 'assassin'         // スキル系統（アサシン固定）
  type: BuffSkillType         // UI制御タイプ
  order: number               // 表示順序
  description: string         // スキル説明
  effects: SkillEffect[]      // 効果リスト
  calculationFormula: string  // 計算式
  weaponRequirement?: object  // 武器種別要件
  subWeaponConditions?: object // サブ武器条件
  uiSettings: UISettings      // UI表示設定
}
```

## アサシンスキル一覧

### 11.1 シーカーリウス (oh1-2)

```typescript
{
  id: 'oh1-2',
  name: 'シーカーリウス',
  category: 'assassin',
  type: 'toggle',
  order: 1801,
  description: 'サブ武器の種類によって攻撃力と物理貫通の効果が変化する',
  effects: [
    {
      property: 'ATK',
      formula: 'subWeapon === "ナイフ" || subWeapon === "巻物" ? +100 : +50',
      conditions: ['サブ武器による効果変化']
    },
    {
      property: 'PhysicalPenetration_Rate',
      formula: 'subWeapon === "ナイフ" || subWeapon === "巻物" ? +25 : +10',
      conditions: ['サブ武器による効果変化']
    }
  ],
  calculationFormula: `
    ナイフ・巻物装備時:
    - ATK: +100
    - 物理貫通率: +25%
    
    その他のサブ武器装備時:
    - ATK: +50
    - 物理貫通率: +10%
  `,
  weaponRequirement: {
    description: 'すべての武器で効果があります',
    subWeaponConditions: {
      enhanced: ['ナイフ', '巻物'],
      normal: ['その他のサブ武器']
    }
  },
  damageCalculationIntegration: {
    atkBonus: '基本ステータス計算でATKに加算',
    penetration: 'ダメージ計算で物理貫通として適用',
    subWeaponDependency: 'サブ武器タイプに応じて効果値が変動'
  },
  uiSettings: {
    parameterName: 'ON/OFF',
    showInModal: false,
    quickToggle: true
  }
}

// 実装用の効果計算関数
function calculateSeekerliusEffects(
  isEnabled: boolean,
  subWeaponType: SubWeaponType | null
): Partial<EquipmentProperties> {
  if (!isEnabled) return {}
  
  // サブ武器タイプによる効果判定
  const isEnhancedSubWeapon = subWeaponType === 'knife' || subWeaponType === 'scroll'
  
  if (isEnhancedSubWeapon) {
    // ナイフ・巻物装備時（強化効果）
    return {
      ATK: 100,
      PhysicalPenetration_Rate: 25
    }
  } else {
    // その他のサブ武器装備時（通常効果）
    return {
      ATK: 50,
      PhysicalPenetration_Rate: 10
    }
  }
}
```

### 11.2 暗殺の極意 (assassin5-1)

```typescript
{
  id: 'assassin5-1',
  name: '暗殺の極意',
  category: 'assassin',
  type: 'toggle',
  order: 1802,
  description: 'クリティカル率とクリティカルダメージを大幅に上昇させる',
  effects: [
    {
      property: 'Critical',
      formula: '+25',
      conditions: ['固定値']
    },
    {
      property: 'CriticalDamage_Rate',
      formula: '+50',
      conditions: ['固定値']
    }
  ],
  calculationFormula: `
    ON時:
    - クリティカル: +25
    - クリティカルダメージ率: +50%
  `,
  weaponRequirement: {
    description: 'すべての武器で効果があります'
  },
  damageCalculationIntegration: {
    critical: '基本ステータス計算でクリティカル値に加算',
    criticalDamage: 'ダメージ計算でクリティカルダメージ率に適用',
    applicationTiming: 'クリティカル判定とダメージ計算で使用'
  },
  uiSettings: {
    parameterName: 'ON/OFF',
    showInModal: false,
    quickToggle: true
  }
}

// 実装用の効果計算関数
function calculateAssassinMasteryEffects(
  isEnabled: boolean
): Partial<EquipmentProperties> {
  if (!isEnabled) return {}
  
  return {
    Critical: 25,              // クリティカル+25
    CriticalDamage_Rate: 50    // クリティカルダメージ率+50%
  }
}
```

## 実装詳細

### サブ武器依存システム

アサシンスキル系統の特徴として、サブ武器の種類により効果が変動します：

#### サブ武器分類
```typescript
// 強化効果対象サブ武器
const ENHANCED_SUB_WEAPONS = ['knife', 'scroll'] // ナイフ、巻物

// 通常効果対象サブ武器
const NORMAL_SUB_WEAPONS = ['arrow', 'shield', 'knuckle', 'magicDevice', 'none'] // その他
```

#### 効果計算パターン
```typescript
// アサシンスキル統合計算例
export function getAssassinSkillBonuses(
  buffSkillData: Record<string, BuffSkillState> | null,
  subWeaponType: SubWeaponType | null
): Partial<AllBonuses> {
  const bonuses: Partial<AllBonuses> = {}
  
  if (!buffSkillData) return bonuses
  
  // シーカーリウス (oh1-2) の処理
  const seekerlius = buffSkillData['oh1-2']
  if (seekerlius?.isEnabled) {
    const effects = calculateSeekerliusEffects(seekerlius.isEnabled, subWeaponType)
    integrateEffects(effects, bonuses)
  }
  
  // 暗殺の極意 (assassin5-1) の処理
  const assassinMastery = buffSkillData['assassin5-1']
  if (assassinMastery?.isEnabled) {
    const effects = calculateAssassinMasteryEffects(assassinMastery.isEnabled)
    integrateEffects(effects, bonuses)
  }
  
  return bonuses
}
```

### UI仕様

#### toggleタイプ（両スキル共通）

- **パラメータ名**: ON/OFF
- **UI**: クイックトグル、モーダル表示なし
- **表示形式**: 「シーカーリウス」「暗殺の極意」（スキル名のみ）

### 武器種別要件

両スキルとも全武器種で使用可能：

- **対象武器**: すべての武器
- **制限**: なし
- **効果変動**: シーカーリウスのみサブ武器により効果変動

### サブ武器効果詳細

**シーカーリウスのサブ武器別効果:**

| サブ武器タイプ | ATK | 物理貫通率 | 分類 |
|---------------|-----|-----------|------|
| ナイフ | +100 | +25% | 強化効果 |
| 巻物 | +100 | +25% | 強化効果 |
| 矢 | +50 | +10% | 通常効果 |
| 盾 | +50 | +10% | 通常効果 |
| 手甲 | +50 | +10% | 通常効果 |
| 魔道具 | +50 | +10% | 通常効果 |
| なし | +50 | +10% | 通常効果 |

## 実装ステータス

- [x] シーカーリウス (oh1-2) - 設計・実装完了（サブ武器依存効果含む）
- [x] 暗殺の極意 (assassin5-1) - 設計・実装完了

## 特徴

- **サブ武器依存**: シーカーリウスはサブ武器タイプにより効果が大きく変動
- **クリティカル特化**: 暗殺の極意は高いクリティカル効果を提供
- **貫通効果**: シーカーリウスは珍しい物理貫通率上昇効果
- **全武器対応**: どちらのスキルも全武器種で使用可能
- **固定効果**: 暗殺の極意は武器・サブ武器に関係なく固定効果

## 関連ファイル

- **メインドキュメント**: `../buff-skill-details.md`
- **実装ファイル**: `../../src/utils/buffSkillCalculation/categories/assassinSkills.ts`
- **データ定義**: `../../src/data/buffSkills/common.ts`
- **型定義**: `../../src/types/buffSkill.ts`

## 更新履歴

| 日付 | 更新内容 | 備考 |
|------|----------|------|
| 2025-01-XX | アサシンスキル系統を個別ファイルに分離 | buff-skill-details.mdから移動 |
| 2025-01-XX | 暗殺の極意の詳細仕様を追加 | 既存データから詳細を補完 |