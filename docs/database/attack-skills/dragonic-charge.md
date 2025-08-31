# ドラゴニックチャージ(3m+進度2以下) スキル追加仕様書

## 概要

AttackSkillFormに新しい攻撃スキル「ドラゴニックチャージ(3m+進度2以下)」を追加するための詳細仕様書です。設計書`attack-skill-form.md`と`attack-skill-calculation.md`に基づいて、系統的にスキルデータを定義します。

## 基本情報

- **スキル名**: ドラゴニックチャージ(3m+進度2以下)
- **スキルID**: `dragonic_charge_3m_progress2`
- **系統グループ**: `halberd` (槍系統)
- **カテゴリ**: `halberd` (ハルバードスキル)
- **武器種要件**: `旋風槍`
- **消費MP**: 300
- **表示順序**: 207 (200番台: 槍系統)

## データ構造定義

### AttackSkill オブジェクト

```typescript
{
  // 基本情報
  id: 'dragonic_charge_3m_progress2',
  name: 'ドラゴニックチャージ(3m+進度2以下)',
  order: 207,                    // 槍系統200番台
  systemGroup: 'halberd',        // 槍系統
  category: 'halberd',           // ハルバードカテゴリ
  weaponTypeRequirements: ['旋風槍'],
  
  // 消費・条件
  mpCost: 300,
  
  // 表示用計算式説明
  multiplierFormula: '1000%',    // 両hit 1000%
  fixedDamageFormula: '300',     // 固定値300
  
  // 攻撃情報（2hit攻撃）
  hits: [
    {
      hitNumber: 1,
      attackType: 'physical',      // 物理攻撃
      referenceDefense: 'DEF',     // DEF参照
      referenceResistance: 'physical', // 物理耐性参照
      powerReference: 'ATK',       // ATK参照
      
      // 威力・固定値
      multiplier: 1000,            // 威力倍率 1000%
      fixedDamage: 300,            // 固定ダメージ 300
      
      // 慣れ設定
      adaptation: 'physical',      // 物理慣れ参照
      adaptationGrant: 'physical', // 物理慣れ付与
      
      // 補正適用設定
      canUseUnsheathePower: false, // 抜刀威力適用不可
      canUseLongRange: true,       // ロングレンジ適用可能
      canUseShortRangePower: true, // 近距離威力適用可能
      canUseLongRangePower: false, // 遠距離威力適用不可
      
      // 特殊効果
      specialEffects: ['物理貫通ボーナス+20%', '必中スキル']
    },
    {
      hitNumber: 2,
      attackType: 'physical',      // 物理攻撃
      referenceDefense: 'MDEF',    // MDEF参照
      referenceResistance: 'physical', // 物理耐性参照
      powerReference: 'ATK_spearMATK_half', // 特殊参照: ATK + 槍MATK×0.5
      
      // 威力・固定値
      multiplier: 1000,            // 威力倍率 1000%
      fixedDamage: 0,              // 固定ダメージ 0
      
      // 慣れ設定
      adaptation: 'physical',      // 物理慣れ参照
      adaptationGrant: 'physical', // 物理慣れ付与
      
      // 補正適用設定
      canUseUnsheathePower: false, // 抜刀威力適用不可
      canUseLongRange: true,       // ロングレンジ適用可能
      canUseShortRangePower: true, // 近距離威力適用可能
      canUseLongRangePower: false  // 遠距離威力適用不可
    }
  ]
}
```

## 計算仕様

### 計算タイプ
- **計算方式**: 特殊計算（2撃目の威力参照が特殊）
- **攻撃回数**: 2hit
- **威力倍率**: 両hit 1000%
- **固定ダメージ**: 1hit目 300、2hit目 0
- **特殊計算**: あり（2撃目の威力参照が特殊）

### 計算処理

計算処理の詳細は仕様確定後に実装予定：

```typescript
// 実装予定（仕様確定後）
class DragonicCharge3mProgress2Calculator extends SkillHitCalculator {
  calculate(input: SkillCalculationInput): SkillCalculationResult {
    // 実装内容は仕様確定後に決定
  }
}
```

### 計算詳細

| 撃数 | 威力倍率 | 固定ダメージ | 威力参照 | 参照防御力 | 特殊効果 | 計算式 |
|------|----------|--------------|----------|----------|----------|--------|
| 1hit | 1000% | 300 | ATK | DEF | 物理貫通+20%、必中 | 標準的な物理攻撃計算 |
| 2hit | 1000% | 300 | ATK_spearMATK_half | MDEF | なし | ATK + 槍MATK×0.5参照 |

#### 計算例（ATK: 2000、槍MATK: 800の場合）
- **1hit**: 威力参照=2000(ATK) × 1000% + 300固定 = 20,300ダメージ（対DEF）
  - 物理貫通ボーナス+20%、必中スキル適用
- **2hit**: 威力参照=2000(ATK)+400(槍MATK×0.5)=2400 × 1000% + 300固定 = 24,300ダメージ（対MDEF）
  - 特殊効果なし

## UI表示仕様

### スキル選択ドロップダウン
- **表示位置**: 槍系統グループ内、order順で表示
- **表示名**: `ドラゴニックチャージ(3m+進度2以下)`
- **武器種フィルタ**: 旋風槍装備時のみ表示

### スキル情報表示
```
📊 ドラゴニックチャージ(3m+進度2以下)
　　カテゴリ: 槍系 | 消費MP: 300
　　威力参照: ATK/ATK_spearMATK_half | タイプ: 物理スキル
　　慣れ参照: 物理 | 慣れ付与: 物理
　　参照防御力: DEF/MDEF | 参照耐性: 物理
　　距離威力: 近距離○ | 抜刀威力: × | ロングレンジ: ○

🎯 スキル威力値
　　1hit: 倍率: 1000% | 固定値: 300 | 威力参照: ATK | 参照防御力: DEF | 特殊効果: 物理貫通+20%、必中
　　2hit: 倍率: 1000% | 固定値: 300 | 威力参照: ATK_spearMATK_half | 参照防御力: MDEF
　　特殊効果: 2段攻撃、2撃目特殊威力参照
```

### 詳細情報
```
📋 詳細情報 [▼]
　　必要武器: 旋風槍
　　前提スキル: なし
　　特殊効果: 2段攻撃、1撃目物理貫通+20%・必中、2撃目特殊威力参照
　　計算方式: 特殊計算（威力参照）
　　備考: 槍系統スキル（3m+進度2以下条件、2撃とも固定ダメージ300）
```

## 実装ファイル更新

### 1. src/data/attackSkills.ts
既存の`attackSkillsRawData`配列に新しいスキルオブジェクトを追加（仕様確定後）

### 2. src/utils/attackSkillCalculation/AttackSkillCalculator.ts
`getCalculatorForSkill`メソッドに`dragonic_charge_3m_progress2`ケースを追加（仕様確定後）

### 3. src/utils/attackSkillCalculation/calculators/DragonicCharge3mProgress2Calculator.ts
特殊計算を実装した専用計算機を作成（仕様確定後）

### 4. src/utils/attackSkillCalculation/calculators/index.ts
DragonicCharge3mProgress2Calculatorのエクスポートを追加（仕様確定後）

### 5. 型定義更新
`src/types/calculator.ts`の`AttackSkillCategory`に`halberd`が既に含まれていることを確認

## 現在の実装状況

### 確定済み
- スキルの基本情報（名前、ID、系統、武器要件）
- 消費MP（300）
- 固定ダメージ（両hit 300）
- 武器種要件（旋風槍）
- 攻撃回数（2hit攻撃）
- 攻撃タイプ（物理攻撃、1hit目: DEF参照、2hit目: MDEF参照、物理耐性参照）
- 慣れ設定（物理慣れ参照・付与）
- 補正適用設定（抜刀威力×、近距離威力○、ロングレンジ○）
- 威力参照設定（1hit目: ATK、2hit目: ATK_spearMATK_half）
- 威力倍率（両hit 1000%）
- 特殊効果（1hit目: 物理貫通ボーナス+20%、必中スキル）

### 保留項目
1. **計算方式**: 専用計算器の実装
2. **特殊効果**: 進度条件の具体的な実装方法  
3. **計算実装**: ATK_spearMATK_half参照の計算ロジック実装

## テストケース

### 単体テスト（仕様確定後実装予定）
```typescript
describe('ドラゴニックチャージ(3m+進度2以下) Skill', () => {
  test('スキルデータの取得', () => {
    const skill = getAttackSkillById('dragonic_charge_3m_progress2')
    expect(skill).toBeDefined()
    expect(skill?.name).toBe('ドラゴニックチャージ(3m+進度2以下)')
    expect(skill?.mpCost).toBe(300)
    expect(skill?.weaponTypeRequirements).toEqual(['旋風槍'])
  })
  
  test('固定ダメージ計算', () => {
    // 仕様確定後に実装
  })
  
  test('進度条件の確認', () => {
    // 仕様確定後に実装
  })
})
```

### 統合テスト（仕様確定後実装予定）
```typescript
describe('ドラゴニックチャージ(3m+進度2以下) Integration', () => {
  test('AttackSkillFormでの選択', () => {
    // 旋風槍装備での選択可能性テスト
    // スキル情報表示のテスト
    // 進度条件の統合テスト
  })
  
  test('計算エンジンとの連携', () => {
    // 仕様確定後に実装
  })
})
```

## 実装優先度

### 仕様確定待ち（高優先度）
1. **攻撃仕様決定**: 威力倍率、攻撃回数の確定
2. **進度条件実装**: 「3m+進度2以下」の具体的な判定ロジック
3. **計算方式決定**: 標準計算か特殊計算かの選択

### 実装準備完了（中優先度）
1. **スキルデータ追加**: 仕様確定後即座に追加可能
2. **計算器実装**: StandardCalculatorまたは専用計算器の選択
3. **武器種フィルタ**: 旋風槍装備時のみ表示（実装済み要素の流用）

### 今後の課題（低優先度）
1. **テスト実装**: 仕様確定後の単体・統合テスト
2. **エラーハンドリング**: エッジケースの対応
3. **パフォーマンス最適化**: 計算処理の最適化
4. **ドキュメント更新**: 技術文書の更新

## 将来の拡張

### 関連スキル
- 他のドラゴニックチャージ派生スキルの追加
- 進度条件を持つ他のスキルとの統一実装
- 槍系統スキルのグループ化

### 計算式拡張
- 進度ボーナスの適用
- 距離条件との連携
- バフ効果との連携
- 敵状態による補正適用

### UI改善
- 進度条件の視覚的表示
- 条件満足/不満足の状態表示
- スキル系統の視覚的区別
- 計算過程の詳細表示

## 備考

この仕様書はドラゴニックチャージ(3m+進度2以下)スキルの基本枠組みを定義したものです。moon-slash.mdを参考に構造化していますが、以下の点が特徴的です：

### 確定している特徴
1. **旋風槍専用スキル**: 武器種要件で旋風槍のみに限定
2. **固定ダメージ300**: 確定した固定ダメージ値
3. **消費MP300**: 確定した消費MP値
4. **距離条件**: 「3m+進度2以下」という特殊な条件設定

### 未確定の要素
1. **威力計算**: 倍率や計算方式が未定
2. **攻撃タイプ**: 物理/魔法の判定が未定
3. **進度実装**: 条件判定の具体的実装方法が未定

仕様が確定次第、moon-slash.mdと同様の完全な実装が可能な状態に準備されています。特に「進度2以下」という条件は新しい要素であり、この実装が他の条件付きスキルの参考になる可能性があります。