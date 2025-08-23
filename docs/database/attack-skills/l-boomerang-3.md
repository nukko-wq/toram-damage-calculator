# Lブーメラン\u2162 スキル追加仕様書

## 概要

AttackSkillFormに新しい攻撃スキル「Lブーメラン\u2162」を追加するための詳細仕様書です。設計書`attack-skill-form.md`と`attack-skill-calculation.md`に基づいて、系統的にスキルデータを定義します。

## 基本情報

- **スキル名**: Lブーメラン\u2162
- **スキルID**: `l_boomerang_3`
- **系統グループ**: `sword` (剣系統)
- **カテゴリ**: `partisan` (パルチザンスキル)
- **武器種要件**: `両手剣`
- **消費MP**: 400
- **表示順序**: 107 (剣系統、オーガスラッシュの後)

## データ構造定義

### AttackSkill オブジェクト

```typescript
{
  // 基本情報
  id: 'l_boomerang_3',
  name: 'Lブーメラン\u2162',
  order: 108,                    // 剣系統100番台、オーガスラッシュの後
  systemGroup: 'sword',          // 剣系統
  category: 'partisan',          // パルチザンカテゴリ
  weaponTypeRequirements: ['両手剣'],
  
  // 消費・条件
  mpCost: 400,
  
  // 表示用計算式説明
  multiplierFormula: '特殊計算',     // DEX依存計算
  fixedDamageFormula: '400',         // 固定ダメージ400
  
  // 攻撃情報（2hit攻撃）
  hits: [
    {
      hitNumber: 1,
      attackType: 'physical',
      referenceDefense: 'DEF',
      referenceResistance: 'physical',
      powerReference: 'ATK',
      
      // 表示用倍率・固定値
      multiplier: 1350,          // 表示用（実際の計算は外部）
      fixedDamage: 400,          // 固定値400
      
      // 計算式説明
      multiplierFormula: '|1350+基礎DEX|%',
      
      // 慣れ設定
      adaptation: 'normal',        // 通常慣れ参照
      adaptationGrant: 'normal',
      
      // 補正適用設定
      canUseUnsheathePower: false,   // 抜刀威力適用可能
      canUseLongRange: false,       // ロングレンジ適用不可
      canUseShortRangePower: false,  // 近距離威力適用可能
      canUseLongRangePower: false   // 遠距離威力適用不可
    }
    {
      hitNumber: 2,
      attackType: 'physical',
      referenceDefense: 'DEF',
      referenceResistance: 'physical',
      powerReference: 'ATK',
      
      // 表示用倍率・固定値
      multiplier: 1350,          // 表示用（実際の計算は外部）
      fixedDamage: 400,          // 固定値400
      
      // 計算式説明
      multiplierFormula: '|1350+基礎DEX|%',
      
      // 慣れ設定
      adaptation: 'normal',        // 通常慣れ参照
      adaptationGrant: 'normal',
      
      // 補正適用設定
      canUseUnsheathePower: false,   // 抜刀威力適用可能
      canUseLongRange: false,       // ロングレンジ適用不可
      canUseShortRangePower: false,  // 近距離威力適用可能
      canUseLongRangePower: false   // 遠距離威力適用不可
    }
  ],
  
  // 特殊効果
  specialEffects: [
    '物理攻撃',
    '両手剣専用スキル',
    'ブーメラン系スキル'
  ]
}
```

## 計算仕様

### 計算タイプ
- **計算方式**: `StandardCalculator` (固定倍率計算)
- **倍率**: 特殊計算
- **固定値**: 400
- **特殊計算**: あり

### 計算処理

既存の`StandardCalculator`を使用：

```typescript
class StandardCalculator extends SkillHitCalculator {
  calculate(input: SkillCalculationInput): SkillCalculationResult {
    const hit = this.getSkillHit(input.skillId, input.hitNumber)
    
    return {
      hitNumber: input.hitNumber,
      calculatedMultiplier: hit.multiplier,      // 250
      calculatedFixedDamage: hit.fixedDamage,    // 0
      calculationProcess: `Fixed values: ${hit.multiplier}%, ${hit.fixedDamage}`
    }
  }
}
```

## UI表示仕様

### スキル選択ドロップダウン
- **表示位置**: 剣系統グループ内、order順でオーガスラッシュ(107)の後
- **表示名**: `Lブーメラン\u2162`
- **武器種フィルタ**: 両手剣装備時のみ表示

### スキル情報表示
```
📊 Lブーメラン\u2162
　　カテゴリ: 両手剣 | 消費MP: 400
　　威力参照: ATK | タイプ: 物理スキル
　　慣れ参照: 通常 | 慣れ付与: 物理
　　参照防御力: DEF | 参照耐性: 物理
　　距離威力: × | 抜刀威力: × | ロングレンジ: ×

🎯 スキル威力値
　　1hit: 倍率: |1350 + 基礎DEX|% | 固定値: 400
　　2hit: 倍率: |1500 + 基礎DEX|% | 固定値: 400
```

### 詳細情報
```
📋 詳細情報 [▼]
　　必要武器: 両手剣
　　前提スキル: なし
　　特殊効果: 物理攻撃、両手剣専用スキル、ブーメラン系スキル
　　計算方式: 固定倍率
　　備考: 基本的な両手剣ブーメラン攻撃スキル
```

## 実装ファイル更新

### 1. src/data/attackSkills.ts
既存の`attackSkillsRawData`配列に新しいスキルオブジェクトを追加

### 2. src/utils/attackSkillCalculation/AttackSkillCalculator.ts
`getCalculatorForSkill`メソッドに`l_boomerang_3`ケースを追加（StandardCalculatorを使用）

### 3. 型定義更新
`src/types/calculator.ts`の`AttackSkillCategory`に`partisan`が既に含まれていることを確認


## テストケース

### 単体テスト
```typescript
describe('Lブーメラン\u2162 Skill', () => {
  test('スキルデータの取得', () => {
    const skill = getAttackSkillById('l_boomerang_3')
    expect(skill).toBeDefined()
    expect(skill?.name).toBe('Lブーメラン\u2162')
    expect(skill?.mpCost).toBe(400)
    expect(skill?.weaponTypeRequirements).toContain('両手剣')
  })
  
  test('計算結果の検証', () => {
    const calculator = new LBoomerang3Calculator()
    const playerStats = { ...mockPlayerStats, baseDEX: 100 }
    
    // 1撃目のテスト
    const result1 = calculator.calculate({
      skillId: 'l_boomerang_3',
      hitNumber: 1,
      playerStats,
      equipmentContext: mockEquipmentContext
    })
    expect(result1.calculatedMultiplier).toBe(1450) // |1350+100| = 1450
    expect(result1.calculatedFixedDamage).toBe(400)
    
    // 2撃目のテスト
    const result2 = calculator.calculate({
      skillId: 'l_boomerang_3',
      hitNumber: 2,
      playerStats,
      equipmentContext: mockEquipmentContext
    })
    expect(result2.calculatedMultiplier).toBe(1450) // |1350+100| = 1450
    expect(result2.calculatedFixedDamage).toBe(400)
  })
})
```

### 統合テスト
```typescript
describe('Lブーメラン\u2162 Integration', () => {
  test('AttackSkillFormでの選択', () => {
    // 両手剣装備での選択可能性テスト
    // スキル情報表示のテスト
    // 計算結果の統合テスト
  })
})
```

## 実装優先度

### 高優先度
1. **スキルデータ追加**: `attackSkills.ts`への追加
2. **計算器連携**: `AttackSkillCalculator.ts`の更新
3. **基本表示機能**: UI表示の確認

### 中優先度
1. **武器種フィルタ**: 両手剣装備時のみ表示
2. **詳細情報表示**: 特殊効果の表示
3. **テスト実装**: 単体・統合テスト

### 低優先度
1. **パフォーマンス最適化**: 計算処理の最適化
2. **エラーハンドリング**: エッジケースの対応
3. **ドキュメント更新**: 技術文書の更新

## 将来の拡張

### 関連スキル
- Lブーメラン、Lブーメラン\u2161の追加
- ブーメラン系スキルのカテゴリ統一
- 系統グループの見直し（partisan専用グループ検討）

### 計算式拡張
- 装備ボーナスの適用
- バフ効果との連携
- 敵状態による補正適用

### UI改善
- ブーメラン系スキルのグループ化表示
- スキル系統の視覚的区別
- 計算過程の詳細表示

この仕様書に基づいて、系統的かつ安全にLブーメラン\u2162スキルを実装できます。既存の設計パターンに従うことで、保守性と拡張性を確保します。