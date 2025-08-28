# カスタムスキル 設計書

## 概要

AttackSkillFormに新しい攻撃スキル「カスタムスキル」を追加するための詳細仕様書です。ユーザーが自由に倍率と固定値、および各種パラメータを設定できるスキルとして設計します。

## 基本情報

- **スキル名**: カスタムスキル（ユーザー名前変更可能）
- **スキルID**: `custom_skill`
- **系統グループ**: `custom` (カスタム系統)
- **カテゴリ**: `custom` (カスタムカテゴリ)
- **武器種要件**: ユーザー設定可能
- **消費MP**: ユーザー設定可能
- **表示順序**: 999 (最下位表示)

## ユーザー設定可能パラメータ

### 基本設定
- **スキル名**: 自由入力（デフォルト: "カスタムスキル"）
- **倍率**: 0%～9999%（デフォルト: 100%）
- **固定値**: -9999～+9999（デフォルト: 0）
- **消費MP**: 0～9999（デフォルト: 100）

### スキルタイプ設定
- **攻撃タイプ**: 物理 / 魔法（デフォルト: 物理）
- **威力参照**: ATK / MATK / 無し（デフォルト: ATK）
- **参照防御力**: DEF / MDEF / 無し（デフォルト: DEF）
- **参照耐性**: 物理 / 魔法 / 無し（デフォルト: 物理）

### 慣れ設定
- **慣れ参照**: 物理 / 魔法 / 無し（デフォルト: 物理）
- **慣れ付与**: 物理 / 魔法 / 無し（デフォルト: 物理）

### 威力補正設定
- **距離威力**: 近距離 / 遠距離 / 無し（デフォルト: 無し）
- **抜刀威力**: 適用 / 不適用（デフォルト: 不適用）
- **ロングレンジ**: 適用 / 不適用（デフォルト: 不適用）

## データ構造定義

### AttackSkill オブジェクト

```typescript
{
  // 基本情報
  id: 'custom_skill',
  name: 'カスタムスキル',        // ユーザー設定可能
  order: 999,                    // 最下位表示
  systemGroup: 'custom',         // カスタム系統
  category: 'custom',            // カスタムカテゴリ
  weaponTypeRequirements: [],    // ユーザー設定可能（全武器対応可能）
  
  // 消費・条件
  mpCost: 100,                   // ユーザー設定可能
  
  // 表示用計算式説明
  multiplierFormula: 'ユーザー設定',
  fixedDamageFormula: 'ユーザー設定',
  
  // 攻撃情報（1hit攻撃）
  hits: [
    {
      hitNumber: 1,
      attackType: 'physical',      // ユーザー設定可能
      referenceDefense: 'DEF',     // ユーザー設定可能
      referenceResistance: 'physical', // ユーザー設定可能
      powerReference: 'ATK',       // ユーザー設定可能
      
      // ユーザー設定倍率・固定値
      multiplier: 100,             // ユーザー設定可能
      fixedDamage: 0,              // ユーザー設定可能
      
      // 慣れ設定
      adaptation: 'physical',      // ユーザー設定可能
      adaptationGrant: 'physical', // ユーザー設定可能
      
      // 補正適用設定
      canUseUnsheathePower: false, // ユーザー設定可能
      canUseLongRange: false,      // ユーザー設定可能
      canUseShortRangePower: false, // ユーザー設定可能
      canUseLongRangePower: false   // ユーザー設定可能
    }
  ]
}
```

## 計算仕様

### 計算タイプ
- **計算方式**: 標準計算（特殊計算なし）
- **1撃目**: ユーザー設定倍率%、ユーザー設定固定ダメージ
- **特殊計算**: なし

### 計算処理

標準の`StandardSkillCalculator`を使用し、ユーザー設定値をそのまま適用します：

```typescript
// 標準計算（特殊処理なし）
const result = {
  hitNumber: 1,
  calculatedMultiplier: userSettings.multiplier,    // ユーザー設定値
  calculatedFixedDamage: userSettings.fixedDamage, // ユーザー設定値
  calculationProcess: `User: ${userSettings.multiplier}%, ${userSettings.fixedDamage}`
}
```

## UI設計

### 設定フォーム
カスタムスキル選択時に追加設定パネルを表示：

```
┌─ カスタムスキル設定 ─────────────────┐
│ スキル名: [カスタムスキル        ] │
│                                   │
│ ◆ 基本威力                        │
│ 倍率:     [100    ]%             │
│ 固定値:   [0      ]              │
│ 消費MP:   [100    ]              │
│                                   │
│ ◆ スキルタイプ                     │
│ 攻撃タイプ: ○物理 ○魔法            │
│ 威力参照:   ○ATK ○MATK ○無し       │
│ 参照防御:   ○DEF ○MDEF ○無し       │
│ 参照耐性:   ○物理 ○魔法 ○無し       │
│                                   │
│ ◆ 慣れ設定                        │
│ 慣れ参照:   ○物理 ○魔法 ○無し       │
│ 慣れ付与:   ○物理 ○魔法 ○無し       │
│                                   │
│ ◆ 威力補正                        │
│ 距離威力:   ○近距離 ○遠距離 ○無し   │
│ 抜刀威力:   □適用                 │
│ ロングレンジ: □適用                │
└───────────────────────────────────┘
```

### スキル選択ドロップダウン
- **表示位置**: 最下位（order: 999）
- **表示名**: `カスタムスキル` または ユーザー設定名
- **武器種フィルタ**: ユーザー設定に応じて表示/非表示

### スキル情報表示
```
📊 カスタムスキル
　　カテゴリ: カスタム | 消費MP: [ユーザー設定値]
　　威力参照: [ユーザー設定] | タイプ: [ユーザー設定]
　　慣れ参照: [ユーザー設定] | 慣れ付与: [ユーザー設定]
　　参照防御力: [ユーザー設定] | 参照耐性: [ユーザー設定]
　　距離威力: [ユーザー設定] | 抜刀威力: [ユーザー設定] | ロングレンジ: [ユーザー設定]

🎯 スキル威力値
　　1hit: 倍率: [ユーザー設定]% | 固定値: [ユーザー設定]
　　特殊効果: ユーザーカスタム設定
```

## 設定パネル仕様

### フォームバリデーション
```typescript
const customSkillSchema = z.object({
  name: z.string().min(1).max(50),
  multiplier: z.number().min(0).max(9999),
  fixedDamage: z.number().min(-9999).max(9999),
  mpCost: z.number().min(0).max(9999),
  
  attackType: z.enum(['physical', 'magical']),
  powerReference: z.enum(['ATK', 'MATK', 'none']),
  referenceDefense: z.enum(['DEF', 'MDEF', 'none']),
  referenceResistance: z.enum(['physical', 'magical', 'none']),
  
  adaptation: z.enum(['physical', 'magical', 'none']),
  adaptationGrant: z.enum(['physical', 'magical', 'none']),
  
  distancePower: z.enum(['short', 'long', 'none']),
  canUseUnsheathePower: z.boolean(),
  canUseLongRange: z.boolean(),
})
```

### デフォルト設定
```typescript
const defaultCustomSkillSettings = {
  name: 'カスタムスキル',
  multiplier: 100,
  fixedDamage: 0,
  mpCost: 100,
  
  attackType: 'physical',
  powerReference: 'ATK',
  referenceDefense: 'DEF',
  referenceResistance: 'physical',
  
  adaptation: 'physical',
  adaptationGrant: 'physical',
  
  distancePower: 'none',
  canUseUnsheathePower: false,
  canUseLongRange: false,
}
```

## 実装ファイル

### 1. src/data/attackSkills.ts
カスタムスキルの基本データを追加

### 2. src/components/forms/CustomSkillSettingsPanel.tsx
設定パネルコンポーネントを新規作成

### 3. src/stores/customSkillStore.ts
カスタムスキル設定の状態管理を新規作成

### 4. src/utils/attackSkillCalculation/calculators/CustomSkillCalculator.ts
ユーザー設定値をそのまま返す計算器を新規作成

## 利用シーン

1. **スキル検証**: ネクロマンサー検証で求めた倍率・固定値を入力してダメージ計算
2. **仮想スキル**: 未実装スキルの威力想定やバランス検証
3. **テスト用途**: 特定条件でのダメージ計算テスト
4. **カスタムビルド**: オリジナルスキル設定での計算実験

## 保存・共有機能

### ローカル保存
- LocalStorageにカスタムスキル設定を保存
- 複数のカスタムスキルプリセットを管理可能
- インポート/エクスポート機能

### 設定例
```json
{
  "customSkills": [
    {
      "id": "verified_necro_skill_1",
      "name": "検証済みネクロスキル1",
      "multiplier": 257.5,
      "fixedDamage": 300,
      "attackType": "physical",
      "powerReference": "ATK"
    }
  ]
}
```

この設計により、ネクロマンサー検証で求めた正確な倍率・固定値を使って実際のダメージ計算ができるようになります。