# トールハンマー(追撃5hit) スキル追加仕様書

## 概要

AttackSkillFormに新しい攻撃スキル「トールハンマー(追撃5hit)」を追加するための詳細仕様書です。設計書`attack-skill-form.md`と`attack-skill-calculation.md`に基づいて、系統的にスキルデータを定義します。

## 基本情報

- **スキル名**: トールハンマー(追撃5hit)
- **スキルID**: `thor_hammer_followup_5hit`
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
  id: 'thor_hammer_followup_5hit',
  name: 'トールハンマー(追撃5hit)',
  order: (保留),                    // 系統番号 保留
  systemGroup: 'halberd',           // 槍系統
  category: 'halberdSkill',         // ハルバードスキル
  weaponTypeRequirements: (保留),   // 武器種要件 保留
  
  // 消費・条件
  mpCost: 400,
  
  // 表示用計算式説明
  multiplierFormula: '1500% + (200+補正後INT×10%)×15',       // 倍率1500% + 追撃計算式
  fixedDamageFormula: '400 + 200',                           // 固定ダメージ400 + 追撃200
  
  // 攻撃情報（2hit攻撃）
  hits: [
    // 1hit目: メイン攻撃
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
    },
    
    // 2hit目: 追撃部分（追撃5hitをまとめて表現）
    {
      hitNumber: 2,
      attackType: 'magical',          // 魔法攻撃
      referenceDefense: 'MDEF',       // 魔法防御力参照
      referenceResistance: 'magical', // 魔法耐性参照
      powerReference: 'spearMATK',    // 槍MATK参照
      
      // 表示用倍率・固定値（追撃5hitをまとめた値）
      multiplier: 3000,             // 倍率3000%（(200+補正後INT×10%)×15の基準値）
      fixedDamage: 200,             // 固定値200（追撃用）
      
      // 計算式説明
      multiplierFormula: '(200+補正後INT×10%)×15 (追撃5hit)',
      fixedDamageFormula: '200',
      
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
- **1hit目倍率**: 1500%
- **2hit目倍率**: (200+補正後INT×10%)×15 (追撃5hit分: 1倍+2倍+3倍+4倍+5倍)
- **武器種別補正**: (保留)
- **1hit目固定値**: 400
- **2hit目固定値**: 200
- **特殊計算**: INT依存の追撃計算（基本200%に補正後INT×10%を加算）

### 計算処理

(保留) - 他の項目追加時に実装

```typescript
// 計算処理の実装は保留
class ThorHammerFollowup5HitCalculator extends SkillHitCalculator {
  calculate(input: SkillCalculationInput): SkillCalculationResult {
    // 実装は保留
    if (input.hitNumber === 1) {
      return {
        hitNumber: 1,
        calculatedMultiplier: 1500,
        calculatedFixedDamage: 400,
        calculationProcess: '1500% (メイン攻撃)'
      }
    } else if (input.hitNumber === 2) {
      // (200+補正後INT×10%)×15の計算
      const adjustedINT = input.adjustedStats?.INT || 0
      const baseMultiplier = 200 + (adjustedINT * 0.1)
      const totalMultiplier = baseMultiplier * 15 // 1倍+2倍+3倍+4倍+5倍=15倍
      return {
        hitNumber: 2,
        calculatedMultiplier: totalMultiplier,
        calculatedFixedDamage: 200,
        calculationProcess: `(200+補正後INT(${adjustedINT})×10%)×15 = (200+${adjustedINT * 0.1})×15 = ${totalMultiplier}%`
      }
    }
  }
}
```

### 武器種別補正詳細

(保留) - 他の項目追加時に定義

## UI表示仕様

### スキル選択ドロップダウン
- **表示位置**: 槍系統グループ内、order順での表示
- **表示名**: `トールハンマー(追撃5hit)`
- **武器種フィルタ**: (保留) - 対応武器種決定後に実装

### スキル情報表示
```
📊 トールハンマー(追撃5hit)
　　カテゴリ: 槍系 | 消費MP: 400
　　威力参照: 槍MATK | タイプ: 魔法スキル
　　慣れ参照: 魔法 | 慣れ付与: 魔法
　　参照防御力: MDEF | 参照耐性: 魔法
　　距離威力: × | 抜刀威力: × | ロングレンジ: ×

🎯 スキル威力値
　　1hit目: 倍率1500% | 固定値400
　　2hit目: 倍率(200+補正後INT×10%)×15 | 固定値200 (追撃5hit)
　　特殊効果: 確定クリティカル (全hit)
```

### 詳細情報
```
📋 詳細情報 [▼]
　　必要武器: (保留)
　　前提スキル: (保留)
　　特殊効果: 確定クリティカル (全hit)
　　計算方式: (保留)
　　備考: 2hit目は追撃5hitをまとめて表現
```

## 実装ファイル更新

### 1. src/data/attackSkills.ts
既存の`attackSkillsRawData`配列に新しいスキルオブジェクトを追加

### 2. src/utils/attackSkillCalculation/AttackSkillCalculator.ts
`getCalculatorForSkill`メソッドに`thor_hammer_followup_5hit`ケースを追加

### 3. src/utils/attackSkillCalculation/calculators/ThorHammerFollowup5HitCalculator.ts
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
- 2hit構成の定義（1hit目: メイン、2hit目: 追撃5hitまとめ）

### 保留中（他の項目追加時に実装予定）
- 武器種要件の決定
- 計算方式の詳細実装
- UI表示の詳細仕様
- テストケースの作成

### 実装予定（保留解除後）
- ThorHammerFollowup5HitCalculator専用クラスの作成
- 計算ロジックの実装
- UI統合
- テストケース作成

## テストケース（仮）

```typescript
describe('トールハンマー(追撃5hit) Skill', () => {
  test('スキルデータの取得', () => {
    const skill = getAttackSkillById('thor_hammer_followup_5hit')
    expect(skill).toBeDefined()
    expect(skill?.name).toBe('トールハンマー(追撃5hit)')
    expect(skill?.mpCost).toBe(400)
    // 他の項目は保留中のため、テストは実装時に追加
  })
  
  test('2hit構成の確認', () => {
    const skill = getAttackSkillById('thor_hammer_followup_5hit')
    expect(skill?.hits).toHaveLength(2)
    
    // 1hit目: メイン攻撃
    expect(skill?.hits[0].multiplier).toBe(1500)
    expect(skill?.hits[0].fixedDamage).toBe(400)
    expect(skill?.hits[0].specialEffects).toContain('確定クリティカル')
    
    // 2hit目: 追撃5hitまとめ
    expect(skill?.hits[1].multiplier).toBe(3000) // 基準値（200×15）
    expect(skill?.hits[1].fixedDamage).toBe(200) // 追撃用固定値
    expect(skill?.hits[1].specialEffects).toContain('確定クリティカル')
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
- トールハンマー(単発)、トールハンマー(追撃3hit)との関連性の明確化

### 計算式拡張
- 装備ボーナスの適用（保留項目決定後に実装）
- バフ効果との連携（保留項目決定後に実装）
- 敵状態による補正適用（保留項目決定後に実装）
- 追撃部分の詳細計算（必要に応じて実装）

### UI改善
- ハンマー系スキルのグループ化表示（保留項目決定後に実装）
- スキル系統の視覚的区別（保留項目決定後に実装）
- 計算過程の詳細表示（保留項目決定後に実装）
- 追撃部分の表示の明確化

## 備考

この仕様書は基本的な攻撃スキル情報（1hit目: 倍率1500%・固定値400、2hit目: 倍率3000%・固定値200、消費MP400）と魔法攻撃設定を定義した仕様書です。槍系統のハルバードスキルとして、槍MATKを参照する魔法攻撃スキルとして設計されています。

2hit目は追撃5hitをまとめて表現しており、実際のゲーム内では5回の追撃が発生しますが、計算上は1つのhitとして扱います。これにより計算の簡略化とUI表示の明確化を図っています。

残りの保留項目（武器種要件、特殊効果）が決定次第、この仕様書を更新し、段階的に実装を進める予定です。既存の設計パターンに従うことで、保守性と拡張性を確保します。

**注意**: powerReferenceで使用している`'spearMATK'`は、実装では新しい値として定義が必要になる可能性があります。

**追撃部分について**: 2hit目は追撃5hit分をまとめており、計算式は(200+補正後INT×10%)×1+(200+補正後INT×10%)×2+(200+補正後INT×10%)×3+(200+補正後INT×10%)×4+(200+補正後INT×10%)×5を統合して、(200+補正後INT×10%)×15として表現されます。例：補正後INT=600の場合、(200+60)×15=3900%となります。固定値は200を使用します。