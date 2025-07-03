# AttackSkillForm 設計書

## 概要

AttackSkillFormは攻撃スキル選択・表示・倍率計算を担当するコンポーネントです。ダメージ計算の基盤となるスキル情報を提供し、複雑な多段攻撃スキルにも対応します。

## 基本機能

### 主要機能
- **スキル選択**: ドロップダウンからの攻撃スキル選択
- **スキル情報表示**: 選択したスキルの詳細情報表示
- **倍率計算**: スキル固有の計算式による威力倍率算出
- **多段攻撃対応**: 最大6撃目までの段階別情報表示
- **情報更新**: 選択変更時のリアルタイム情報更新

### 表示しない機能
- **ダメージ計算**: DamagePreviewコンポーネントで実行
- **敵情報連携**: EnemyFormで管理
- **バフ効果適用**: BuffSkillFormで管理

## データ構造設計

### AttackSkill インターフェース

```typescript
interface AttackSkill {
  // 基本情報
  id: string                           // 一意識別子
  name: string                        // スキル名
  category: AttackSkillCategory        // スキルカテゴリ
  weaponTypeRequirements?: WeaponType[] // 必要武器種（指定なしは全武器対応）
  
  // 消費・条件
  mpCost: number                      // 消費MP
  levelRequirement?: number            // 必要スキルレベル
  prerequisites?: string[]            // 前提スキル
  
  // 表示用計算式説明
  multiplierFormula?: string           // 倍率の計算式説明（例: "1000%", "|補正後STR|%"）
  fixedDamageFormula?: string          // 固定値の計算式説明（例: "400", "基礎INT/2"）
  
  // 多段攻撃設定
  hits: AttackHit[]                   // 1〜6撃目の情報配列
  
  // 特殊効果
  specialEffects?: string[] // 特殊効果の説明文配列
  
  // メタ情報
  notes?: string                     // 実装・使用上の注意
}

// スキルカテゴリ
type AttackSkillCategory = 
  | 'sword'      // 片手剣
  | 'twohandSword' // 両手剣
  | 'bow'        // 弓
  | 'bowgun'     // 自動弓
  | 'staff'      // 杖
  | 'magicDevice' // 魔導具
  | 'knuckle'    // 拳甲
  | 'halberd'    // 旋棍
  | 'katana'     // 刀
  | 'dualSword'  // 双剣
  | 'martialArts' // 格闘

// 計算方式の種類
type SkillCalculationType = 
  | 'fixed'           // 固定倍率（倍率固定）
  | 'atkBased'        // ATK参照（ATK * 係数）
  | 'matkBased'       // MATK参照（MATK * 係数）
  | 'hpBased'         // HP参照
  | 'mpBased'         // MP参照
  | 'levelBased'      // レベル参照
  | 'custom'          // カスタム計算式

// 計算パラメータ
interface SkillCalculationParams {
  // 基本パラメータ
  baseMultiplier?: number     // 基本倍率%
  fixedDamage?: number       // 固定ダメージ
  
  // 参照パラメータ
  atkCoefficient?: number    // ATK係数
  matkCoefficient?: number   // MATK係数
  hpCoefficient?: number     // HP係数
  mpCoefficient?: number     // MP係数
  levelCoefficient?: number  // レベル係数
  
  // 条件パラメータ
  hpThreshold?: number       // HP閾値%
  mpThreshold?: number       // MP閾値%
  
  // カスタム計算式
  customFormula?: string     // JavaScript式文字列（eval用）
}

// 攻撃段階情報
interface AttackHit {
  hitNumber: number                    // 撃目番号（1-6）
  attackType: 'physical' | 'magical'   // 攻撃タイプ
  referenceDefense: 'DEF' | 'MDEF'     // 参照防御力
  referenceResistance: 'physical' | 'magical' // 参照耐性
  powerReference: PowerReferenceType    // 威力参照
  
  // 倍率情報（表示用）
  multiplier: number                   // 威力倍率%（表示値、実際の計算は別途）
  fixedDamage: number                  // 固定ダメージ（表示値、実際の計算は別途）
  
  // 計算式説明（各撃ごとに設定可能）
  multiplierFormula?: string           // 倍率の計算式説明（例: "1000%", "|補正後STR|%"）
  fixedDamageFormula?: string          // 固定値の計算式説明（例: "400", "基礎INT/2"）
  
  // 補正適用
  familiarity: FamiliarityType         // 慣れ参照
  familiarityGrant: FamiliarityType    // 慣れ付与
  canUseUnsheathePower: boolean        // 抜刀威力適用可否
  canUseLongRange: boolean             // ロングレンジ適用可否
  canUseDistancePower: boolean         // 距離威力適用可否
  
  // 特殊設定
  notes?: string                       // 備考
}

// 威力参照タイプ
type PowerReferenceType = 'totalATK' | 'MATK' // 将来拡張: 'spearMATK', 'STR', 'INT', etc.

// 慣れタイプ
type FamiliarityType = 'physical' | 'magical' | 'normal'

// 特殊効果
interface SkillSpecialEffect {
  description: string  // 効果の説明文（例: "物理貫通ボーナス: +20%"）
}
```

### 表示データ構造

```typescript
// AttackSkillForm表示用データ
interface AttackSkillDisplayData {
  // 選択情報
  selectedSkill: AttackSkill | null
  
  // 計算結果
  calculatedHits: CalculatedHit[]
  
  // 表示設定
  showDetailedInfo: boolean
  showCalculationProcess: boolean
}

interface CalculatedHit {
  hitNumber: number
  attackType: 'physical' | 'magical'
  powerReference: string              // 表示用（例: "総ATK"）
  referenceDefense: 'DEF' | 'MDEF'
  referenceResistance: 'physical' | 'magical' // 参照耐性
  multiplier: number                  // 表示用倍率%
  fixedDamage: number                 // 表示用固定値
  
  // 計算式説明
  multiplierFormula?: string          // 倍率の計算式説明
  fixedDamageFormula?: string         // 固定値の計算式説明
  
  // 慣れ情報
  familiarityReference: FamiliarityType
  familiarityGrant: FamiliarityType
  
  // 補正適用
  canUseUnsheathePower: boolean
  canUseLongRange: boolean
  canUseDistancePower: boolean
  
  // 計算過程（詳細表示用）
  calculationDetails?: CalculationDetails
}

interface CalculationDetails {
  baseMultiplier: number
  atkContribution: number
  matkContribution: number
  otherContribution: number
  formula: string                     // 計算式の文字列表現
}
```

## UI設計

### レイアウト構成

```
┌─ AttackSkillForm ─────────────────────────────────┐
│ ┌─ スキル選択セクション ─────────────────────────┐ │
│ │ 🔽 攻撃スキル選択: [ドロップダウン]               │ │
│ │ 　　　　　　　　　　　[スキルをリセット]         │ │
│ └─────────────────────────────────────────────┘ │
│                                                   │
│ ┌─ スキル情報表示セクション ─────────────────────┐ │
│ │ 📊 スラッシュ                                   │ │
│ │ 　　カテゴリ: 片手剣 | 消費MP: 8                 │ │
│ │ 　　威力参照: 総ATK | タイプ: 物理スキル         │ │
│ │ 　　慣れ参照: 物理 | 慣れ付与: 物理              │ │
│ │ 　　参照防御力: DEF | 参照耐性: 物理             │ │
│ │ 　　距離威力: ○ | 抜刀威力: ○ | ロングレンジ: × │ │
│ │                                                │ │
│ │ 🎯 スキル威力値                                  │ │
│ │ 　　倍率: 125% | 固定値: 0                     │ │
│ │ 　　計算式: 125% (固定)                        │ │
│ └─────────────────────────────────────────────┘ │
│                                                   │
│ ┌─ 多段攻撃情報（該当する場合のみ表示）───────────┐ │
│ │ 🗡️ 多段攻撃情報                                  │ │
│ │ ┌─ 1撃目 ─┐ ┌─ 2撃目 ─┐                  │ │
│ │ │物理|DEF │ │物理|DEF │                  │ │
│ │ │物理耐性  │ │物理耐性  │                  │ │
│ │ │1000%  │ │|補正STR|%│                  │ │
│ │ │固定:400│ │基礎INT/2│                  │ │
│ │ └─────────┘ └─────────┘                  │ │
│ │ 　　全体消費MP: 400                           │ │
│ └─────────────────────────────────────────────┘ │
│                                                   │
│ ┌─ 詳細情報（展開可能）─────────────────────────┐ │
│ │ 📋 詳細情報 [▼]                                │ │
│ │ 　　必要武器: 片手剣, 双剣                      │ │
│ │ 　　前提スキル: なし                            │ │
│ │ 　　特殊効果: 物理貫通ボーナス: +20%             │ │
│ │ 　　計算方式: ATK参照                          │ │
│ │ 　　備考: 基本的な攻撃スキル                     │ │
│ └─────────────────────────────────────────────┘ │
└───────────────────────────────────────────────┘
```

### UI要素詳細

#### 1. スキル選択セクション
```typescript
interface SkillSelectionSection {
  skillDropdown: {
    options: AttackSkillOption[]
    selectedValue: string | null
    placeholder: "攻撃スキルを選択してください"
    searchable: true
    clearable: true
  }
  resetButton: {
    text: "スキルをリセット"
    onClick: () => void
  }
}

interface AttackSkillOption {
  value: string        // skill.id
  label: string        // skill.name
  category: string     // skill.category
  weaponReq?: string   // 必要武器（表示用）
}
```

#### 2. スキル情報表示セクション
```typescript
interface SkillInfoSection {
  basicInfo: {
    name: string
    category: string
    mpCost: number
    attackType: 'physical' | 'magical'
    powerReference: string
    familiarityRef: FamiliarityType
    familiarityGrant: FamiliarityType
    referenceDefense: 'DEF' | 'MDEF'
    referenceResistance: 'physical' | 'magical' // 参照耐性
    canUseUnsheathePower: boolean
    canUseLongRange: boolean
    canUseDistancePower: boolean
  }
  
  powerInfo: {
    multiplier: number           // 表示用倍率
    fixedDamage: number         // 表示用固定値
    multiplierFormula: string   // 倍率の計算式説明
    fixedDamageFormula: string  // 固定値の計算式説明
  }
}
```

#### 3. 多段攻撃情報セクション
```typescript
interface MultiHitSection {
  isVisible: boolean
  hits: MultiHitDisplay[]
  totalMpCost: number  // スキル全体の消費MP
}

interface MultiHitDisplay {
  hitNumber: number
  attackType: 'physical' | 'magical'
  referenceDefense: 'DEF' | 'MDEF'
  referenceResistance: 'physical' | 'magical' // 参照耐性
  multiplier: number                  // 表示用倍率%
  fixedDamage: number                 // 表示用固定値
  multiplierFormula?: string          // 倍率の計算式説明
  fixedDamageFormula?: string         // 固定値の計算式説明
}
```

## 表示システム（計算なし）

AttackSkillFormでは複雑な計算は行わず、表示専用の情報を管理します。実際の計算は別のシステム（DamagePreview等）で実装されます。

### 表示データの提供

```typescript
// AttackSkillFormの責任: 表示情報の提供のみ
function getSkillDisplayData(skill: AttackSkill): CalculatedHit[] {
  return skill.hits.map(hit => ({
    hitNumber: hit.hitNumber,
    attackType: hit.attackType,
    referenceDefense: hit.referenceDefense,
    referenceResistance: hit.referenceResistance,
    powerReference: getPowerReferenceDisplayText(hit.powerReference),
    
    // 表示値（実際の計算は外部で実行）
    multiplier: hit.multiplier,
    fixedDamage: hit.fixedDamage,
    
    // 計算式の説明文
    multiplierFormula: hit.multiplierFormula,
    fixedDamageFormula: hit.fixedDamageFormula,
    
    // 慣れ・補正情報
    familiarityReference: hit.familiarity,
    familiarityGrant: hit.familiarityGrant,
    canUseUnsheathePower: hit.canUseUnsheathePower,
    canUseLongRange: hit.canUseLongRange,
    canUseDistancePower: hit.canUseDistancePower
  }))
}

function getPowerReferenceDisplayText(powerRef: PowerReferenceType): string {
  switch (powerRef) {
    case 'totalATK': return '総ATK'
    case 'MATK': return 'MATK'
    default: return powerRef
  }
}
```

### 実際の計算は外部で

```typescript
// 別ファイル（例: DamageCalculation.ts）で実装される特殊計算
function calculateMoonSlashDamage(skillData: AttackSkill, playerStats: PlayerStats): DamageResult {
  // ムーンスラッシュの特殊計算
  const hit1 = {
    multiplier: 1000, // 固定1000%
    fixedDamage: 400  // 固定400
  }
  
  const hit2 = {
    multiplier: Math.abs(playerStats.adjustedSTR), // |補正後STR|%
    fixedDamage: Math.floor(playerStats.baseINT / 2) // 基礎INT/2
  }
  
  return { hit1, hit2 }
}
```

## データ管理

### スキルマスタデータ

```typescript
// src/data/attackSkills.ts
export const attackSkillsData: AttackSkill[] = [
  // 片手剣スキル
  {
    id: 'slash',
    name: 'スラッシュ',
    category: 'sword',
    mpCost: 8,
    multiplierFormula: "125%",
    fixedDamageFormula: "0",
    specialEffects: [
      "物理貫通ボーナス: +20%"
    ],
    hits: [{
      hitNumber: 1,
      attackType: 'physical',
      referenceDefense: 'DEF',
      referenceResistance: 'physical',
      powerReference: 'totalATK',
      multiplier: 125,  // 表示用の値
      fixedDamage: 0,   // 表示用の値
      multiplierFormula: "125%",
      fixedDamageFormula: "0",
      familiarity: 'physical',
      familiarityGrant: 'physical',
      canUseUnsheathePower: true,
      canUseLongRange: false,
      canUseDistancePower: true
    }]
  },
  
  // ムーンスラッシュ（特殊計算の例）
  {
    id: 'moon_slash',
    name: 'ムーンスラッシュ',
    category: 'sword',
    mpCost: 400,
    multiplierFormula: "特殊計算",
    fixedDamageFormula: "特殊計算",
    specialEffects: [
      "距離威力: ○",
      "抜刀威力: ×",
      "ロングレンジ: ×"
    ],
    hits: [
      {
        hitNumber: 1,
        attackType: 'physical',
        referenceDefense: 'DEF',
        referenceResistance: 'physical',
        powerReference: 'totalATK',
        multiplier: 1000,  // 表示用（実際の計算は外部）
        fixedDamage: 400,  // 表示用（実際の計算は外部）
        multiplierFormula: "1000%",
        fixedDamageFormula: "400",
        familiarity: 'physical',
        familiarityGrant: 'physical',
        canUseUnsheathePower: false,
        canUseLongRange: false,
        canUseDistancePower: true
      },
      {
        hitNumber: 2,
        attackType: 'physical',
        referenceDefense: 'DEF',
        referenceResistance: 'physical',
        powerReference: 'totalATK',
        multiplier: 0,     // 表示用（|補正後STR|%は外部計算）
        fixedDamage: 0,    // 表示用（基礎INT/2は外部計算）
        multiplierFormula: "|補正後STR|%",
        fixedDamageFormula: "基礎INT/2",
        familiarity: 'physical',
        familiarityGrant: 'physical',
        canUseUnsheathePower: false,
        canUseLongRange: false,
        canUseDistancePower: true
      }
    ]
  }
]
```

### Zustandストア連携

```typescript
// src/types/calculator.ts に追加
interface CalculatorData {
  // 既存フィールド...
  attackSkill: AttackSkillFormData
}

interface AttackSkillFormData {
  selectedSkillId: string | null
  calculatedData: CalculatedHit[] | null
  lastCalculatedAt?: string
}
```

## 実装フェーズ

### フェーズ1: 基本実装
- [ ] AttackSkill型定義とインターフェース
- [ ] 基本的なスキル選択UI
- [ ] 固定倍率計算の実装
- [ ] 単一攻撃スキルの表示

### フェーズ2: 計算システム
- [ ] ATK/MATK参照計算の実装
- [ ] HP/MP参照計算の実装
- [ ] カスタム計算式の実装
- [ ] 計算過程の詳細表示

### フェーズ3: 多段攻撃対応
- [ ] 多段攻撃データ構造
- [ ] 多段攻撃UI表示
- [ ] 段階別計算処理
- [ ] 段階別設定値表示

### フェーズ4: 高度な機能
- [ ] スキルフィルタリング（武器種別）
- [ ] 検索機能
- [ ] 特殊効果の表示
- [ ] 計算式のリアルタイム更新

## 他システムとの連携

### データフロー
```
AttackSkillForm → CalculatorStore → DamagePreview
               ↓
         基本ステータス参照
         (総ATK, MATK, HP, MP, Level)
```

### 連携ポイント
1. **BasicStatsから**: 総ATK, MATK, HP, MP値を取得
2. **WeaponFormから**: 武器種別要件チェック
3. **CalculatorStoreへ**: 選択スキル情報を保存
4. **DamagePreviewへ**: 計算済みスキル情報を提供

この設計により、複雑な攻撃スキルシステムを体系的に管理し、ダメージ計算の基盤を提供できます。多段攻撃や特殊計算式にも対応し、将来の拡張性も確保しています。