# ファントムミサイル スキル追加仕様書

## 概要

AttackSkillFormに新しい攻撃スキル「ファントムミサイル」を追加するための詳細仕様書です。設計書`attack-skill-form.md`と`attack-skill-calculation.md`に基づいて、系統的にスキルデータを定義します。

## 基本情報

- **スキル名**: ファントムミサイル
- **スキルID**: `phantom_missile`
- **系統グループ**: `necromancer` (ネクロマンサー系統)
- **カテゴリ**: `necromancer` (ネクロマンサースキル)
- **武器種要件**: `杖`
- **消費MP**: 500
- **表示順序**: 303 (300番台: ネクロマンサー系統)

## データ構造定義

### AttackSkill オブジェクト

```typescript
{
  // 基本情報
  id: 'phantom_missile',
  name: 'ファントムミサイル',
  order: 303,                    // ネクロマンサー系統300番台
  systemGroup: 'necromancer',    // ネクロマンサー系統
  category: 'necromancer',       // ネクロマンサーカテゴリ
  weaponTypeRequirements: ['杖'],
  
  // 消費・条件
  mpCost: 500,
  
  // 表示用計算式説明
  multiplierFormula: '保留',     // 威力計算式（未定）
  fixedDamageFormula: '500',     // 固定ダメージ
  
  // 攻撃情報（10hit攻撃）
  hits: [
    {
      hitNumber: 1,
      attackType: 'magical',     // 魔法攻撃
      referenceDefense: 'MDEF',  // MDEF参照
      referenceResistance: 'magical', // 魔法耐性参照
      powerReference: 'MATK',    // MATK参照
      multiplier: 100,           // 威力倍率 100%
      fixedDamage: 500,          // 固定500ダメージ
      adaptation: 'magical',     // 魔法慣れ参照
      adaptationGrant: 'magical', // 魔法慣れ付与
      canUseUnsheathePower: false, // 抜刀威力適用不可
      canUseLongRange: true,       // ロングレンジ適用可能
      canUseShortRangePower: true, // 近距離威力適用可能
      canUseLongRangePower: true   // 遠距離威力適用可能
    },
    {
      hitNumber: 2,
      attackType: 'magical',
      referenceDefense: 'MDEF',
      referenceResistance: 'magical',
      powerReference: 'MATK',
      multiplier: 167,           // 威力倍率 166.67% → 167%
      fixedDamage: 500,
      adaptation: 'magical',
      adaptationGrant: 'magical',
      canUseUnsheathePower: false,
      canUseLongRange: true,
      canUseShortRangePower: true,
      canUseLongRangePower: true
    },
    {
      hitNumber: 3,
      attackType: 'magical',
      referenceDefense: 'MDEF',
      referenceResistance: 'magical',
      powerReference: 'MATK',
      multiplier: 233,           // 威力倍率 233.33% → 233%
      fixedDamage: 500,
      adaptation: 'magical',
      adaptationGrant: 'magical',
      canUseUnsheathePower: false,
      canUseLongRange: true,
      canUseShortRangePower: true,
      canUseLongRangePower: true
    },
    {
      hitNumber: 4,
      attackType: 'magical',
      referenceDefense: 'MDEF',
      referenceResistance: 'magical',
      powerReference: 'MATK',
      multiplier: 300,           // 威力倍率 300%
      fixedDamage: 500,
      adaptation: 'magical',
      adaptationGrant: 'magical',
      canUseUnsheathePower: false,
      canUseLongRange: true,
      canUseShortRangePower: true,
      canUseLongRangePower: true
    },
    {
      hitNumber: 5,
      attackType: 'magical',
      referenceDefense: 'MDEF',
      referenceResistance: 'magical',
      powerReference: 'MATK',
      multiplier: 367,           // 威力倍率 366.67% → 367%
      fixedDamage: 500,
      adaptation: 'magical',
      adaptationGrant: 'magical',
      canUseUnsheathePower: false,
      canUseLongRange: true,
      canUseShortRangePower: true,
      canUseLongRangePower: true
    },
    {
      hitNumber: 6,
      attackType: 'magical',
      referenceDefense: 'MDEF',
      referenceResistance: 'magical',
      powerReference: 'MATK',
      multiplier: 433,           // 威力倍率 433.33% → 433%
      fixedDamage: 500,
      adaptation: 'magical',
      adaptationGrant: 'magical',
      canUseUnsheathePower: false,
      canUseLongRange: true,
      canUseShortRangePower: true,
      canUseLongRangePower: true
    },
    {
      hitNumber: 7,
      attackType: 'magical',
      referenceDefense: 'MDEF',
      referenceResistance: 'magical',
      powerReference: 'MATK',
      multiplier: 500,           // 威力倍率 500%
      fixedDamage: 500,
      adaptation: 'magical',
      adaptationGrant: 'magical',
      canUseUnsheathePower: false,
      canUseLongRange: true,
      canUseShortRangePower: true,
      canUseLongRangePower: true
    },
    {
      hitNumber: 8,
      attackType: 'magical',
      referenceDefense: 'MDEF',
      referenceResistance: 'magical',
      powerReference: 'MATK',
      multiplier: 567,           // 威力倍率 566.67% → 567%
      fixedDamage: 500,
      adaptation: 'magical',
      adaptationGrant: 'magical',
      canUseUnsheathePower: false,
      canUseLongRange: true,
      canUseShortRangePower: true,
      canUseLongRangePower: true
    },
    {
      hitNumber: 9,
      attackType: 'magical',
      referenceDefense: 'MDEF',
      referenceResistance: 'magical',
      powerReference: 'MATK',
      multiplier: 633,           // 威力倍率 633.33% → 633%
      fixedDamage: 500,
      adaptation: 'magical',
      adaptationGrant: 'magical',
      canUseUnsheathePower: false,
      canUseLongRange: true,
      canUseShortRangePower: true,
      canUseLongRangePower: true
    },
    {
      hitNumber: 10,
      attackType: 'magical',
      referenceDefense: 'MDEF',
      referenceResistance: 'magical',
      powerReference: 'MATK',
      multiplier: 700,           // 威力倍率 700%
      fixedDamage: 500,
      adaptation: 'magical',
      adaptationGrant: 'magical',
      canUseUnsheathePower: false,
      canUseLongRange: true,
      canUseShortRangePower: true,
      canUseLongRangePower: true
    }
  ]
}
```

## 計算仕様

### 計算タイプ
- **計算方式**: 標準計算（StandardCalculator使用）
- **攻撃回数**: 10hit攻撃
- **威力倍率**: 漸増式（100%→700%、合計4000%）
- **固定ダメージ**: 全hit 500
- **特殊計算**: なし

### 計算処理

標準計算を使用します。各hitの威力倍率は固定値として定義されています：

```typescript
// StandardCalculatorを使用した標準計算
// 各hitは固定威力倍率・固定ダメージによる標準的な攻撃スキル
// 計算式: n hit目 = 100 + (200/3) × (n-1) %
```

### 威力倍率の計算式

**基本公式**: `n hit目 = 100 + (200/3) × (n-1)` %

各hitの詳細倍率：
- 1hit目: 100% = 100 + (200/3) × 0 = 100%
- 2hit目: 167% = 100 + (200/3) × 1 ≈ 166.67%
- 3hit目: 233% = 100 + (200/3) × 2 ≈ 233.33%
- 4hit目: 300% = 100 + (200/3) × 3 = 300%
- 5hit目: 367% = 100 + (200/3) × 4 ≈ 366.67%
- 6hit目: 433% = 100 + (200/3) × 5 ≈ 433.33%
- 7hit目: 500% = 100 + (200/3) × 6 = 500%
- 8hit目: 567% = 100 + (200/3) × 7 ≈ 566.67%
- 9hit目: 633% = 100 + (200/3) × 8 ≈ 633.33%
- 10hit目: 700% = 100 + (200/3) × 9 = 700%

**合計威力**: 4000%

### 計算詳細

| 撃数 | 威力倍率 | 固定ダメージ | 計算式 |
|------|----------|--------------|--------|
| 1hit目 | 100% | 500 | 100 + (200/3) × 0 |
| 2hit目 | 167% | 500 | 100 + (200/3) × 1 |
| 3hit目 | 233% | 500 | 100 + (200/3) × 2 |
| 4hit目 | 300% | 500 | 100 + (200/3) × 3 |
| 5hit目 | 367% | 500 | 100 + (200/3) × 4 |
| 6hit目 | 433% | 500 | 100 + (200/3) × 5 |
| 7hit目 | 500% | 500 | 100 + (200/3) × 6 |
| 8hit目 | 567% | 500 | 100 + (200/3) × 7 |
| 9hit目 | 633% | 500 | 100 + (200/3) × 8 |
| 10hit目 | 700% | 500 | 100 + (200/3) × 9 |
| **合計** | **4000%** | **5000** | **10段攻撃** |

## UI表示仕様

### スキル選択ドロップダウン
- **表示位置**: ネクロマンサー系統グループ内、order順で表示
- **表示名**: `ファントムミサイル`
- **武器種フィルタ**: 杖装備時のみ表示

### スキル情報表示
```
📊 ファントムミサイル
　　カテゴリ: ネクロマンサー系 | 消費MP: 500
　　威力参照: MATK | タイプ: 魔法攻撃
　　慣れ参照: 魔法 | 慣れ付与: 魔法
　　参照防御力: MDEF | 参照耐性: 魔法
　　距離威力: 近距離○遠距離○ | 抜刀威力: × | ロングレンジ: ○

🎯 スキル威力値
　　1hit: 倍率: 100% | 固定値: 500
　　2hit: 倍率: 167% | 固定値: 500
　　3hit: 倍率: 233% | 固定値: 500
　　4hit: 倍率: 300% | 固定値: 500
　　5hit: 倍率: 367% | 固定値: 500
　　6hit: 倍率: 433% | 固定値: 500
　　7hit: 倍率: 500% | 固定値: 500
　　8hit: 倍率: 567% | 固定値: 500
　　9hit: 倍率: 633% | 固定値: 500
　　10hit: 倍率: 700% | 固定値: 500
　　合計威力: 4000% | 合計固定値: 5000
　　特殊効果: 10段連続攻撃、漸増威力
```

### 詳細情報
```
📋 詳細情報 [▼]
　　必要武器: 杖
　　前提スキル: なし（保留）
　　特殊効果: 10段連続攻撃、漸増威力（100%→700%）
　　距離補正: 近距離○、遠距離○、ロングレンジ○
　　計算方式: 標準計算
　　備考: ネクロマンサー系統の10段攻撃魔法スキル（合計威力4000%）
```

## 実装ファイル更新

### 1. src/data/attackSkills.ts
既存の`attackSkillsRawData`配列に新しいスキルオブジェクトを追加（保留状態で）

### 2. src/utils/attackSkillCalculation/AttackSkillCalculator.ts
`getCalculatorForSkill`メソッドに`phantom_missile`ケースを追加（StandardCalculator使用予定）

### 3. 専用計算機（必要に応じて）
特殊計算が必要な場合は`PhantomMissileCalculator.ts`を作成

### 4. 型定義更新
必要に応じて新しい型定義を追加

## 現在の実装状況

### 確定済み
- **スキル名**: ファントムミサイル
- **武器種要件**: 杖のみ
- **消費MP**: 500
- **固定ダメージ**: 500
- **系統**: ネクロマンサー系統
- **攻撃タイプ**: magical（魔法攻撃）
- **参照防御力**: MDEF
- **参照耐性**: magical（魔法耐性）
- **慣れ参照**: magical（魔法慣れ参照）
- **慣れ付与**: magical（魔法慣れ付与）

### 保留中
- **威力倍率**: 計算式・数値
- ~~**威力参照**: ATK/MATK/totalATK~~（確定済み）
- ~~**慣れ設定**: 参照・付与タイプ~~（確定済み）
- **距離・抜刀補正**: 適用可否
- **特殊効果**: 有無・内容
- **計算方式**: 標準/特殊

### 未実装
- 完全なスキルデータ定義
- 計算機実装
- テストケース

## テストケース（実装後）

### 基本テスト
```typescript
describe('ファントムミサイル Skill', () => {
  test('スキルデータの取得', () => {
    const skill = getAttackSkillById('phantom_missile')
    expect(skill).toBeDefined()
    expect(skill?.name).toBe('ファントムミサイル')
    expect(skill?.mpCost).toBe(500)
    expect(skill?.weaponTypeRequirements).toEqual(['杖'])
    expect(skill?.hits).toHaveLength(1)
    expect(skill?.hits[0].fixedDamage).toBe(500)
  })
  
  test('杖装備時のスキル選択可能性', () => {
    // 杖装備での選択可能性テスト
  })
  
  test('計算機の動作確認', () => {
    // 実装後に詳細テストを追加
  })
})
```

## 実装優先度

### Phase 1: 基本実装
1. **スキルデータ追加**: 保留項目を含む基本データ構造
2. **UI表示**: スキル選択・情報表示の基本機能
3. **武器種フィルタ**: 杖装備時のみ表示

### Phase 2: 仕様確定
1. **攻撃タイプ決定**: physical/magicalの決定
2. **威力計算式確定**: 具体的な計算方式・数値の決定
3. **特殊効果決定**: 特殊効果の有無・内容の決定

### Phase 3: 完全実装
1. **計算機実装**: 確定した仕様による計算処理
2. **テスト実装**: 完全なテストケース
3. **ドキュメント更新**: 最終仕様書の更新

## 将来の拡張

### 関連スキル
- 他のネクロマンサー系スキルとの連携
- 魔法系スキルとのカテゴリ統一
- ミサイル系スキルのシリーズ化

### 計算式候補
- **魔法系**: MATK参照、MDEF・魔法耐性参照
- **物理系**: ATK参照、DEF・物理耐性参照  
- **特殊系**: INT依存、複合計算式

### UI改善
- ネクロマンサー系スキルの統一表示
- 保留項目の視覚的区別
- 仕様確定状況の表示

## 備考

この仕様書はファントムミサイルスキルの設計書です。現在、基本情報（スキル名・武器要件・消費MP・固定ダメージ）のみが確定しており、その他の仕様は今後の検討待ちです。

### 確定している要素
1. **スキル名**: ファントムミサイル
2. **武器種制限**: 杖のみ
3. **消費MP**: 500
4. **固定ダメージ**: 500
5. **系統分類**: ネクロマンサー系統
6. **攻撃タイプ**: magical（魔法攻撃）
7. **参照防御力**: MDEF
8. **参照耐性**: magical（魔法耐性）
9. **慣れ参照**: magical（魔法慣れ参照）
10. **慣れ付与**: magical（魔法慣れ付与）
11. **威力参照**: MATK
12. **距離補正**: 近距離○、遠距離○
13. **ロングレンジ**: 適用可能
14. **抜刀威力**: 適用不可

### 検討が必要な要素
1. **特殊効果**: 追加効果の有無

実装は段階的に進める予定で、まず基本データ構造を作成し、仕様確定後に完全な機能を実装する方針です。