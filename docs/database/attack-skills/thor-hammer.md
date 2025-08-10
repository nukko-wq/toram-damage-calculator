# トールハンマー(単発) スキル追加仕様書

## 概要

AttackSkillFormに新しい攻撃スキル「トールハンマー(単発)」を追加するための詳細仕様書です。設計書`attack-skill-form.md`と`attack-skill-calculation.md`に基づいて、系統的にスキルデータを定義します。

## 基本情報

- **スキル名**: トールハンマー(単発)
- **スキルID**: `thor_hammer_single`
- **系統グループ**: `halberd` (槍系統)
- **カテゴリ**: `halberdSkill` (ハルバードスキル)
- **武器種要件**: (保留)
- **消費MP**: 400
- **表示順序**: (保留)

## データ構造定義

### AttackSkill オブジェクト

```typescript
{
  // 基本情報
  id: 'thor_hammer_single',
  name: 'トールハンマー(単発)',
  order: (保留),                    // 系統番号 保留
  systemGroup: 'halberd',           // 槍系統
  category: 'halberdSkill',         // ハルバードスキル
  weaponTypeRequirements: (保留),   // 武器種要件 保留
  
  // 消費・条件
  mpCost: 400,
  
  // 表示用計算式説明
  multiplierFormula: '1500%',       // 倍率1500%
  fixedDamageFormula: '400',        // 固定ダメージ400
  
  // 攻撃情報（1hit攻撃）
  hits: [
    {
      hitNumber: 1,
      attackType: 'magical',          // 魔法攻撃
      referenceDefense: 'MDEF',       // 魔法防御力参照
      referenceResistance: 'magical', // 魔法耐性参照
      powerReference: 'spearMATK',    // 槍MATK参照
      
      // 表示用倍率・固定値
      multiplier: 1500,             // 倍率1500%
      fixedDamage: 400,             // 固定値400
      
      // 計算式説明
      multiplierFormula: '1500%',
      fixedDamageFormula: '400',
      
      // 慣れ設定
      adaptation: 'magical',         // 魔法慣れ参照
      adaptationGrant: 'magical',     // 魔法慣れ付与
      
      // 補正適用設定
      canUseUnsheathePower: false,    // 抜刀威力適用不可
      canUseLongRange: false,         // ロングレンジ適用不可
      canUseShortRangePower: false,   // 近距離威力適用不可
      canUseLongRangePower: false,    // 遠距離威力適用不可
      
      // 特殊効果（撃数別）
      specialEffects: ['確定クリティカル'] // 確定クリティカル
    }
  ]
}
```

## 計算仕様

### 計算タイプ
- **計算方式**: (保留)
- **基本倍率**: 1500%
- **武器種別補正**: (保留)
- **固定値**: 400
- **特殊計算**: (保留)

### 計算処理

(保留) - 他の項目追加時に実装

```typescript
// 計算処理の実装は保留
class ThorHammerSingleCalculator extends SkillHitCalculator {
  calculate(input: SkillCalculationInput): SkillCalculationResult {
    // 実装は保留
    return {
      hitNumber: input.hitNumber,
      calculatedMultiplier: 1500,
      calculatedFixedDamage: 400,
      calculationProcess: '1500% (固定倍率)'
    }
  }
}
```

### 武器種別補正詳細

(保留) - 他の項目追加時に定義

## UI表示仕様

### スキル選択ドロップダウン
- **表示位置**: 槍系統グループ内、order順での表示
- **表示名**: `トールハンマー(単発)`
- **武器種フィルタ**: (保留) - 対応武器種決定後に実装

### スキル情報表示
```
📊 トールハンマー(単発)
　　カテゴリ: 槍系 | 消費MP: 400
　　威力参照: 槍MATK | タイプ: 魔法スキル
　　慣れ参照: 魔法 | 慣れ付与: 魔法
　　参照防御力: MDEF | 参照耐性: 魔法
　　距離威力: × | 抜刀威力: × | ロングレンジ: ×

🎯 スキル威力値
　　倍率: 1500% | 固定値: 400
　　特殊効果: 確定クリティカル
```

### 詳細情報
```
📋 詳細情報 [▼]
　　必要武器: (保留)
　　前提スキル: (保留)
　　特殊効果: 確定クリティカル
　　計算方式: (保留)
　　備考: (保留)
```

## 実装ファイル更新

### 1. src/data/attackSkills.ts
既存の`attackSkillsRawData`配列に新しいスキルオブジェクトを追加

### 2. src/utils/attackSkillCalculation/AttackSkillCalculator.ts
`getCalculatorForSkill`メソッドに`thor_hammer_single`ケースを追加

### 3. src/utils/attackSkillCalculation/calculators/ThorHammerSingleCalculator.ts
専用計算機クラスを作成（詳細実装は保留）

### 4. 型定義更新
`src/types/calculator.ts`の型定義確認・更新（必要に応じて）

## 現在の実装状況

### 完了済み
- スキル基本情報の一部定義（名前、ID、消費MP、倍率、固定値）
- 系統グループとカテゴリの決定（槍系統、ハルバードスキル）
- 攻撃タイプの決定（魔法攻撃、MDEF参照、魔法耐性参照）
- 威力参照の決定（槍MATK参照）
- 慣れ設定の決定（魔法慣れ参照・付与）
- 補正適用設定の決定（各種補正適用不可）
- 特殊効果の決定（確定クリティカル）
- 基本データ構造の枠組み作成

### 保留中（他の項目追加時に実装予定）
- 武器種要件の決定
- 計算方式の詳細実装
- UI表示の詳細仕様
- テストケースの作成

### 実装予定（保留解除後）
- ThorHammerSingleCalculator専用クラスの作成
- 計算ロジックの実装
- UI統合
- テストケース作成

## テストケース（仮）

```typescript
describe('トールハンマー(単発) Skill', () => {
  test('スキルデータの取得', () => {
    const skill = getAttackSkillById('thor_hammer_single')
    expect(skill).toBeDefined()
    expect(skill?.name).toBe('トールハンマー(単発)')
    expect(skill?.mpCost).toBe(400)
    // 他の項目は保留中のため、テストは実装時に追加
  })
  
  test('基本情報の確認', () => {
    const skill = getAttackSkillById('thor_hammer_single')
    expect(skill?.hits).toHaveLength(1)
    expect(skill?.hits[0].multiplier).toBe(1500)
    expect(skill?.hits[0].fixedDamage).toBe(400)
    expect(skill?.hits[0].specialEffects).toContain('確定クリティカル')
  })
  
  // 計算テストは保留中（計算方式決定後に実装）
})
```

## 実装優先度

### 高優先度
1. **保留項目の決定**: 武器種等の残り仕様決定
2. **スキルデータ追加**: `attackSkills.ts`への追加
3. **基本表示機能**: UI表示の確認

### 中優先度
1. **計算実装**: 専用計算機クラスの作成
2. **UI統合**: 完全なUI表示機能の実装
3. **テスト実装**: 単体・統合テスト

### 低優先度
1. **パフォーマンス最適化**: 計算処理の最適化
2. **エラーハンドリング**: エッジケースの対応
3. **ドキュメント更新**: 技術文書の更新

## 将来の拡張

### 関連スキル
- 他のハンマー系スキルの追加（保留項目決定後に検討）
- メイス系スキルのカテゴリ統一（保留項目決定後に検討）

### 計算式拡張
- 装備ボーナスの適用（保留項目決定後に実装）
- バフ効果との連携（保留項目決定後に実装）
- 敵状態による補正適用（保留項目決定後に実装）

### UI改善
- ハンマー系スキルのグループ化表示（保留項目決定後に実装）
- スキル系統の視覚的区別（保留項目決定後に実装）
- 計算過程の詳細表示（保留項目決定後に実装）

## 備考

この仕様書は基本的な攻撃スキル情報（倍率1500%、固定値400、消費MP400）と魔法攻撃設定を定義した仕様書です。槍系統のハルバードスキルとして、槍MATKを参照する魔法攻撃スキルとして設計されています。

残りの保留項目（武器種要件、特殊効果）が決定次第、この仕様書を更新し、段階的に実装を進める予定です。既存の設計パターンに従うことで、保守性と拡張性を確保します。

**注意**: powerReferenceで使用している`'spearMATK'`は、実装では新しい値として定義が必要になる可能性があります。