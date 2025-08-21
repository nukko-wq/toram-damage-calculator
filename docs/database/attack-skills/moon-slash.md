# ムーンスラッシュ スキル追加仕様書

## 概要

AttackSkillFormに新しい攻撃スキル「ムーンスラッシュ」を追加するための詳細仕様書です。設計書`attack-skill-form.md`と`attack-skill-calculation.md`に基づいて、系統的にスキルデータを定義します。

## 基本情報

- **スキル名**: ムーンスラッシュ
- **スキルID**: `moon_slash`
- **系統グループ**: `sword` (剣系統)
- **カテゴリ**: `blade` (ブレードスキル)
- **武器種要件**: `片手剣`, `双剣`, `両手剣`
- **消費MP**: 400
- **表示順序**: 103 (100番台: 剣系統)

## データ構造定義

### AttackSkill オブジェクト

```typescript
{
  // 基本情報
  id: 'moon_slash',
  name: 'ムーンスラッシュ',
  order: 103,                    // 剣系統100番台
  systemGroup: 'sword',          // 剣系統
  category: 'blade',             // ブレードカテゴリ
  weaponTypeRequirements: ['片手剣', '双剣', '両手剣'],
  
  // 消費・条件
  mpCost: 400,
  
  // 表示用計算式説明
  multiplierFormula: '特殊計算',     // STR依存計算
  fixedDamageFormula: '特殊計算',    // INT依存計算
  
  // 攻撃情報（2hit攻撃）
  hits: [
    {
      hitNumber: 1,
      attackType: 'physical',
      referenceDefense: 'DEF',
      referenceResistance: 'physical',
      powerReference: 'ATK',
      
      // 表示用倍率・固定値
      multiplier: 1000,          // 表示用（実際の計算は外部）
      fixedDamage: 400,          // 表示用（実際の計算は外部）
      
      // 慣れ設定
      adaptation: 'physical',     // 物理慣れ参照
      adaptationGrant: 'physical',  // 物理慣れ付与
      
      // 補正適用設定
      canUseUnsheathePower: false,  // 抜刀威力適用不可
      canUseLongRange: false,       // ロングレンジ適用不可
      canUseShortRangePower: true,  // 近距離威力適用可能
      canUseLongRangePower: false   // 遠距離威力適用不可
    },
    {
      hitNumber: 2,
      attackType: 'physical',
      referenceDefense: 'DEF',
      referenceResistance: 'physical',
      powerReference: 'ATK',
      
      // 表示用倍率・固定値
      multiplier: 0,             // 表示用（|補正後STR|%は外部計算）
      fixedDamage: 0,            // 表示用（基礎INT/2は外部計算）
      
      // 計算式説明
      multiplierFormula: '威力+補正後STR%',
      fixedDamageFormula: '固定値+基礎INT/2',
      
      // 慣れ設定
      adaptation: 'physical',     // 物理慣れ参照
      adaptationGrant: 'physical',  // 物理慣れ付与
      
      // 補正適用設定
      canUseUnsheathePower: false,  // 抜刀威力適用不可
      canUseLongRange: false,       // ロングレンジ適用不可
      canUseShortRangePower: true,  // 近距離威力適用可能
      canUseLongRangePower: false   // 遠距離威力適用不可
    }
  ]
}
```

## 計算仕様

### 計算タイプ
- **計算方式**: 特殊計算（MoonSlashCalculator専用）
- **1撃目**: 固定1000%、固定400ダメージ
- **2撃目**: |補正後STR|%、基礎INT/2固定ダメージ
- **特殊計算**: あり

### 計算処理

専用の`MoonSlashCalculator`を使用した特殊計算を行います：

```typescript
class MoonSlashCalculator extends SkillHitCalculator {
  calculate(input: SkillCalculationInput): SkillCalculationResult {
    const { hitNumber, playerStats } = input

    switch (hitNumber) {
      case 1:
        // 1撃目: 固定威力
        return {
          hitNumber: 1,
          calculatedMultiplier: 1000,    // 固定1000%
          calculatedFixedDamage: 400,    // 固定400
          calculationProcess: 'Fixed: 1000%, 400'
        }

      case 2: {
        // 2撃目: ステータス依存計算
        const multiplier = Math.abs(playerStats.adjustedSTR)
        const fixedDamage = Math.floor(playerStats.baseINT / 2)

        return {
          hitNumber: 2,
          calculatedMultiplier: multiplier,
          calculatedFixedDamage: fixedDamage,
          calculationProcess: `|${playerStats.adjustedSTR}| = ${multiplier}%, floor(${playerStats.baseINT}/2) = ${fixedDamage}`
        }
      }

      default:
        throw new Error(`Invalid hit number for Moon Slash: ${hitNumber}`)
    }
  }
}
```

### 計算詳細

| 撃数 | 威力倍率 | 固定ダメージ | 計算式 |
|------|----------|--------------|--------|
| 1撃目 | 1000% | 400 | 固定値 |
| 2撃目 | \|補正後STR\|% | 基礎INT/2 | STR絶対値%, INT/2（切り捨て） |

#### 計算例（補正後STR: 150、基礎INT: 200の場合）
- **1撃目**: 1000%, 400固定ダメージ
- **2撃目**: |150| = 150%, floor(200/2) = 100固定ダメージ

## UI表示仕様

### スキル選択ドロップダウン
- **表示位置**: 剣系統グループ内、order順で`buster_blade`(101)の後、シャットアウト(通常)(104)の前
- **表示名**: `ムーンスラッシュ`
- **武器種フィルタ**: 片手剣、双剣、両手剣装備時のみ表示

### スキル情報表示
```
📊 ムーンスラッシュ
　　カテゴリ: 剣系 | 消費MP: 400
　　威力参照: ATK | タイプ: 物理スキル
　　慣れ参照: 物理 | 慣れ付与: 物理
　　参照防御力: DEF | 参照耐性: 物理
　　距離威力: 近距離○ | 抜刀威力: × | ロングレンジ: ×

🎯 スキル威力値
　　1hit: 倍率: 1000% | 固定値: 400
　　2hit: 倍率: |補正後STR|% | 固定値: 基礎INT/2
　　特殊効果: 特殊計算（ステータス依存）
```

### 詳細情報
```
📋 詳細情報 [▼]
　　必要武器: 片手剣、双剣、両手剣
　　前提スキル: なし
　　特殊効果: 2段攻撃、ステータス依存計算
　　計算方式: 特殊計算
　　備考: 1撃目固定威力、2撃目STR・INT依存の剣系統専用スキル
```

## 実装ファイル更新

### 1. src/data/attackSkills.ts
既存の`attackSkillsRawData`配列に新しいスキルオブジェクトを追加（完了済み）

### 2. src/utils/attackSkillCalculation/AttackSkillCalculator.ts
`getCalculatorForSkill`メソッドに`moon_slash`ケースを追加（完了済み）

### 3. src/utils/attackSkillCalculation/calculators/MoonSlashCalculator.ts
特殊計算を実装した専用計算機を作成（完了済み）

### 4. src/utils/attackSkillCalculation/calculators/index.ts
MoonSlashCalculatorのエクスポートを追加（完了済み）

### 5. 型定義更新
`src/types/calculator.ts`の`AttackSkillCategory`に`blade`が既に含まれていることを確認

## 現在の実装状況

### 完了済み
- スキルデータの基本構造定義
- MoonSlashCalculator専用クラスの作成
- AttackSkillCalculatorとの連携
- 特殊計算ロジックの実装（固定値 + ステータス依存）
- UI表示の基本仕様
- 2段攻撃の実装
- STR絶対値とINT/2計算の実装

### 実装済み特徴
- **2段攻撃**: 1撃目固定威力、2撃目ステータス依存
- **特殊計算**: 補正後STRの絶対値を威力倍率として使用
- **INT依存**: 基礎INTの半分（切り捨て）を固定ダメージに追加
- **片手剣専用**: 武器種要件で片手剣のみに限定

## テストケース

### 単体テスト
```typescript
describe('ムーンスラッシュ Skill', () => {
  test('スキルデータの取得', () => {
    const skill = getAttackSkillById('moon_slash')
    expect(skill).toBeDefined()
    expect(skill?.name).toBe('ムーンスラッシュ')
    expect(skill?.mpCost).toBe(400)
    expect(skill?.weaponTypeRequirements).toEqual(['片手剣', '双剣', '両手剣'])
    expect(skill?.hits).toHaveLength(2)
  })
  
  test('1撃目の固定計算', () => {
    const calculator = new MoonSlashCalculator()
    const result = calculator.calculate({
      skillId: 'moon_slash',
      hitNumber: 1,
      playerStats: mockPlayerStats,
      equipmentContext: mockEquipmentContext
    })
    expect(result.calculatedMultiplier).toBe(1000)
    expect(result.calculatedFixedDamage).toBe(400)
  })
  
  test('2撃目のステータス依存計算', () => {
    const calculator = new MoonSlashCalculator()
    const playerStats = { 
      ...mockPlayerStats, 
      adjustedSTR: -120,  // 負の値でもテスト
      baseINT: 250 
    }
    
    const result = calculator.calculate({
      skillId: 'moon_slash',
      hitNumber: 2,
      playerStats,
      equipmentContext: mockEquipmentContext
    })
    expect(result.calculatedMultiplier).toBe(120) // |−120| = 120
    expect(result.calculatedFixedDamage).toBe(125) // floor(250/2) = 125
  })
})
```

### 統合テスト
```typescript
describe('ムーンスラッシュ Integration', () => {
  test('AttackSkillFormでの選択', () => {
    // 片手剣、双剣、両手剣装備での選択可能性テスト
    // スキル情報表示のテスト
    // 2段攻撃の計算結果統合テスト
  })
  
  test('計算エンジンとの連携', () => {
    const calculator = new AttackSkillCalculator()
    const results = calculator.calculateSkill('moon_slash', playerStats, equipmentContext)
    expect(results).toHaveLength(2)
    expect(results[0].hitNumber).toBe(1)
    expect(results[1].hitNumber).toBe(2)
  })
})
```

## 実装優先度

### 完了済み（高優先度）
1. ✅ **スキルデータ追加**: `attackSkills.ts`への追加
2. ✅ **計算器連携**: `AttackSkillCalculator.ts`の更新
3. ✅ **専用計算実装**: MoonSlashCalculator専用クラスの作成
4. ✅ **特殊計算ロジック**: STR絶対値・INT/2計算の実装

### 実装済み（中優先度）
1. ✅ **武器種フィルタ**: 片手剣、双剣、両手剣装備時のみ表示
2. ✅ **2段攻撃**: 異なる計算式を持つ2撃の実装
3. ✅ **基本表示機能**: UI表示の基本動作

### 今後の課題（低優先度）
1. **テスト実装**: 単体・統合テスト
2. **エラーハンドリング**: エッジケースの対応
3. **パフォーマンス最適化**: 計算処理の最適化
4. **ドキュメント更新**: 技術文書の更新

## 将来の拡張

### 関連スキル
- 他のムーン系スキルの追加
- ブレード系スキルのカテゴリ統一
- 剣系統スキルのグループ化

### 計算式拡張
- 装備ボーナスの適用
- バフ効果との連携
- 敵状態による補正適用
- クリティカル計算との連携

### UI改善
- ブレード系スキルのグループ化表示
- スキル系統の視覚的区別
- 計算過程の詳細表示
- 2段攻撃の表示改善

## 備考

この仕様書は既存実装から逆算して作成した完全版です。ムーンスラッシュは以下の特徴を持つ特殊な片手剣スキルとして実装されています：

1. **固定威力 + ステータス依存の2段構成**
2. **STR絶対値による威力計算**（負の値でも正の威力として計算）
3. **INT/2による固定ダメージ追加**（切り捨て処理）
4. **剣系統専用スキル**として武器種制限（片手剣、双剣、両手剣）

既存の実装は安定しており、この仕様書に基づいて保守・拡張が可能です。特殊計算ロジックが適切に分離されているため、他の類似スキルの実装時にも参考にできる設計となっています。