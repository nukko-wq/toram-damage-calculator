# シャットアウト(出血付与時) スキル追加仕様書

## 概要

AttackSkillFormに新しい攻撃スキル「シャットアウト(出血付与時)」を追加するための詳細仕様書です。設計書`attack-skill-form.md`と`attack-skill-calculation.md`に基づいて、系統的にスキルデータを定義します。

## 基本情報

- **スキル名**: シャットアウト(出血付与時)
- **スキルID**: `shut_out_bleeding`
- **系統グループ**: `sword` (剣系統)
- **カテゴリ**: `blade` (ブレードスキル)
- **武器種要件**: `片手剣`, `双剣`, `両手剣`
- **消費MP**: 100
- **表示順序**: 106 (シャットアウト(通常)の直後)

## データ構造定義

### AttackSkill オブジェクト

```typescript
{
  // 基本情報
  id: 'shut_out_bleeding',
  name: 'シャットアウト(出血付与時)',
  order: 106,                    // シャットアウト(通常)の直後
  systemGroup: 'sword',          // 剣系統
  category: 'blade',             // ブレードカテゴリ
  weaponTypeRequirements: ['片手剣', '双剣', '両手剣'],
  
  // 消費・条件
  mpCost: 100,
  
  // 表示用計算式説明
  multiplierFormula: '武器種依存計算',
  fixedDamageFormula: '武器種依存計算',
  
  // 攻撃情報（1hit攻撃）
  hits: [
    {
      hitNumber: 1,
      attackType: 'physical',
      referenceDefense: 'DEF',
      referenceResistance: 'physical',
      powerReference: 'ATK',
      
      // 表示用倍率・固定値（基本値、実際の計算は外部）
      multiplier: 500,           // 基本500%（武器種により変動）
      fixedDamage: 100,          // 基本100（武器種により変動）
      
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
- **計算方式**: 特殊計算（武器種依存）
- **基本威力倍率**: 500%
- **基本固定ダメージ**: 100
- **特殊計算**: あり（装備武器種によって追加効果）

### 計算処理

専用の`ShutOutBleedingCalculator`を使用した武器種依存計算を行います：

```typescript
class ShutOutBleedingCalculator extends SkillHitCalculator {
  calculate(input: SkillCalculationInput): SkillCalculationResult {
    const { playerStats, equipmentContext } = input
    const weaponType = equipmentContext.mainWeapon.weaponType
    
    // 基本値
    let multiplier = 500
    let fixedDamage = 100
    let process = 'Base: 500%, 100'
    
    // 武器種別追加効果
    switch (weaponType) {
      case '両手剣':
        multiplier += 1500  // +1500%
        process += ' | 両手剣: +1500%'
        break
        
      case '片手剣': {
        const dexBonus = Math.abs(2000 + playerStats.baseDEX)
        multiplier += dexBonus
        process += ` | 片手剣: +|2000+${playerStats.baseDEX}|% = +${dexBonus}%, 物理貫通4倍`
        break
      }
      
      case '双剣': {
        const agiBonus = Math.abs(Math.floor(playerStats.baseAGI / 2))
        multiplier += 2000 + agiBonus
        fixedDamage += 100
        process += ` | 双剣: +2000%+|${playerStats.baseAGI}/2|% = +${2000 + agiBonus}%, +100固定, 物理貫通2倍`
        break
      }
      
      default:
        // 他の武器種では基本値のまま
        process += ' | 武器種効果なし'
        break
    }
    
    return {
      hitNumber: 1,
      calculatedMultiplier: multiplier,
      calculatedFixedDamage: fixedDamage,
      calculationProcess: process
    }
  }
}
```

### 計算詳細

#### 武器種別計算詳細

| 武器種 | 基本倍率 | 追加倍率 | 基本固定値 | 追加固定値 | 合計倍率 | 合計固定値 | 特殊効果 |
|--------|----------|----------|------------|------------|----------|------------|----------|
| 両手剣 | 500% | +1500% | 100 | +0 | 2000% | 100 | なし |
| 片手剣 | 500% | +\|2000+基礎DEX\|% | 100 | +0 | 500%+α | 100 | 物理貫通4倍 |
| 双剣 | 500% | +2000%+\|基礎AGI/2\|% | 100 | +100 | 2500%+β | 200 | 物理貫通2倍 |
| その他 | 500% | +0% | 100 | +0 | 500% | 100 | なし |

#### 計算例

**両手剣装備時**:
- 威力倍率: 500% + 1500% = 2000%
- 固定ダメージ: 100

**片手剣装備時（基礎DEX: 200の場合）**:
- 威力倍率: 500% + |2000+200|% = 500% + 2200% = 2700%
- 固定ダメージ: 100
- 特殊効果: 物理貫通4倍計算

**双剣装備時（基礎AGI: 180の場合）**:
- 威力倍率: 500% + 2000% + |180/2|% = 500% + 2000% + 90% = 2590%
- 固定ダメージ: 100 + 100 = 200
- 特殊効果: 物理貫通2倍計算

## UI表示仕様

### スキル選択ドロップダウン
- **表示位置**: 剣系統グループ内、order順でシャットアウト(通常)(104)の直後
- **表示名**: `シャットアウト(出血付与時)`
- **武器種フィルタ**: 片手剣、双剣、両手剣装備時のみ表示

### スキル情報表示
```
📊 シャットアウト(出血付与時)
　　カテゴリ: 剣系 | 消費MP: 100
　　威力参照: ATK | タイプ: 物理スキル
　　慣れ参照: 物理 | 慣れ付与: 物理
　　参照防御力: DEF | 参照耐性: 物理
　　距離威力: 近距離○ | 抜刀威力: × | ロングレンジ: ×

🎯 スキル威力値
　　1hit: 倍率: 基本500%+武器種効果 | 固定値: 基本100+武器種効果
　　特殊効果: 武器種依存計算（両手剣/片手剣/双剣）+ 物理貫通計算
```

### 詳細情報
```
📋 詳細情報 [▼]
　　必要武器: 片手剣、双剣、両手剣
　　前提スキル: なし
　　特殊効果: 武器種依存計算 + 物理貫通計算（片手剣4倍、双剣2倍）
　　計算方式: 特殊計算（ShutOutBleedingCalculator）
　　備考: 出血付与時の超高威力版、片手剣・双剣は物理貫通強化付き
```

## 武器種判定仕様

### 武器種取得方法
```typescript
const weaponType = equipmentContext.mainWeapon.weaponType
```

### サポート武器種
- `'両手剣'`: +1500%威力倍率
- `'片手剣'`: +|2000+基礎DEX|%威力倍率 + 物理貫通4倍計算  
- `'双剣'`: +2000%+|基礎AGI/2|%威力倍率 + 100固定ダメージ + 物理貫通2倍計算
- その他: 基本値のまま（500%, 100）

### ステータス参照
- **基礎DEX**: `playerStats.baseDEX`
- **基礎AGI**: `playerStats.baseAGI`
- 計算時に`Math.abs()`で絶対値、`Math.floor()`で切り捨て処理

## 実装ファイル更新

### 1. src/data/attackSkills.ts
既存の`attackSkillsRawData`配列に新しいスキルオブジェクトを追加（剣系統、ブレードカテゴリとして）

### 2. src/utils/attackSkillCalculation/AttackSkillCalculator.ts
`getCalculatorForSkill`メソッドに`shut_out_bleeding`ケースを追加

### 3. src/utils/attackSkillCalculation/calculators/ShutOutBleedingCalculator.ts
武器種依存計算を実装した専用計算機を作成

### 4. src/utils/attackSkillCalculation/calculators/index.ts
ShutOutBleedingCalculatorのエクスポートを追加

### 5. 型定義更新
`src/types/calculator.ts`の`AttackSkillCategory`に`blade`が既に含まれていることを確認済み

## 現在の実装状況

### 仕様確定済み
- スキル名: シャットアウト(出血付与時)
- 系統グループ: sword (剣系統)
- カテゴリ: blade (ブレードスキル)
- 武器種要件: 片手剣、双剣、両手剣
- 消費MP: 100
- 威力倍率: 基本500% + 武器種効果
- 固定ダメージ: 基本100 + 武器種効果
- 攻撃タイプ: 物理
- 慣れ参照・付与: 物理
- Hit数: 1hit
- 補正適用: 近距離威力○、抜刀威力×、ロングレンジ×
- 特殊計算: 武器種依存（両手剣+1500%、片手剣+|2000+基礎DEX|%+物理貫通4倍、双剣+2000%+|基礎AGI/2|%+100固定+物理貫通2倍）

### 保留事項
なし（全仕様確定済み、order値106で配置済み）

## テストケース

### 単体テスト
```typescript
describe('シャットアウト(出血付与時) Skill', () => {
  test('スキルデータの取得', () => {
    const skill = getAttackSkillById('shut_out_bleeding')
    expect(skill).toBeDefined()
    expect(skill?.name).toBe('シャットアウト(出血付与時)')
    expect(skill?.mpCost).toBe(100)
    expect(skill?.hits).toHaveLength(1)
  })
  
  test('両手剣装備時の計算', () => {
    const calculator = new ShutOutBleedingCalculator()
    const equipmentContext = { 
      ...mockEquipmentContext, 
      mainWeapon: { weaponType: '両手剣' } 
    }
    const result = calculator.calculate({
      skillId: 'shut_out_bleeding',
      hitNumber: 1,
      playerStats: mockPlayerStats,
      equipmentContext
    })
    expect(result.calculatedMultiplier).toBe(2000)  // 500 + 1500
    expect(result.calculatedFixedDamage).toBe(100)
  })

  test('片手剣装備時の計算', () => {
    const calculator = new ShutOutBleedingCalculator()
    const playerStats = { 
      ...mockPlayerStats, 
      baseDEX: 200 
    }
    const equipmentContext = { 
      ...mockEquipmentContext, 
      mainWeapon: { weaponType: '片手剣' } 
    }
    
    const result = calculator.calculate({
      skillId: 'shut_out_bleeding',
      hitNumber: 1,
      playerStats,
      equipmentContext
    })
    expect(result.calculatedMultiplier).toBe(2700)  // 500 + |2000+200| = 500 + 2200
    expect(result.calculatedFixedDamage).toBe(100)
  })

  test('双剣装備時の計算', () => {
    const calculator = new ShutOutBleedingCalculator()
    const playerStats = { 
      ...mockPlayerStats, 
      baseAGI: 180 
    }
    const equipmentContext = { 
      ...mockEquipmentContext, 
      mainWeapon: { weaponType: '双剣' } 
    }
    
    const result = calculator.calculate({
      skillId: 'shut_out_bleeding',
      hitNumber: 1,
      playerStats,
      equipmentContext
    })
    expect(result.calculatedMultiplier).toBe(2590)  // 500 + 2000 + |180/2| = 500 + 2000 + 90
    expect(result.calculatedFixedDamage).toBe(200)  // 100 + 100
  })
})
```

### 統合テスト
```typescript
describe('シャットアウト(出血付与時) Integration', () => {
  test('AttackSkillFormでの選択', () => {
    // 片手剣、双剣、両手剣装備での選択可能性テスト
    // スキル情報表示のテスト
    // 武器種別計算の結果統合テスト
  })
  
  test('計算エンジンとの連携', () => {
    const calculator = new AttackSkillCalculator()
    const results = calculator.calculateSkill('shut_out_bleeding', playerStats, equipmentContext)
    expect(results).toHaveLength(1)
    expect(results[0].hitNumber).toBe(1)
    // 武器種に応じて計算結果が変わることを確認
  })

  test('武器種変更時の動的計算', () => {
    // 武器種を変更した際に計算結果が適切に更新されることを確認
    const calculator = new AttackSkillCalculator()
    
    // 両手剣での計算
    const twoHandedResult = calculator.calculateSkill('shut_out', playerStats, {
      ...equipmentContext,
      mainWeapon: { weaponType: '両手剣' }
    })
    expect(twoHandedResult[0].calculatedMultiplier).toBe(2000)
    
    // 片手剣での計算
    const oneHandedResult = calculator.calculateSkill('shut_out', playerStats, {
      ...equipmentContext, 
      mainWeapon: { weaponType: '片手剣' }
    })
    expect(oneHandedResult[0].calculatedMultiplier).toBeGreaterThan(2500)
    expect(oneHandedResult[0].calculatedMultiplier).toBeLessThan(3000)
  })
})
```

## 実装優先度

### 高優先度
1. **スキルデータ追加**: `attackSkills.ts`への追加
2. **ShutOutBleedingCalculator実装**: 武器種依存計算の実装
3. **AttackSkillCalculator連携**: 専用計算機との連携実装

### 中優先度
1. **武器種判定テスト**: 各武器種での計算結果検証
2. **動的計算テスト**: 装備変更時の再計算確認

### 低優先度
1. **テスト実装**: 単体・統合テスト
2. **ドキュメント更新**: 技術文書の更新

## 将来の拡張

### 関連スキル
- シャットアウト(他バリエーション)の追加可能性
- 同系統スキルのカテゴリ統一

### 計算式拡張
- 装備ボーナスの適用
- バフ効果との連携
- 敵状態による補正適用

## 備考

この仕様書はシャットアウト(出血付与時)スキルの基本仕様を定義したものです。以下の特徴を持つ剣系統の超高威力スキルとして設計されています：

1. **武器種依存スキル**: 基本500%威力・100固定ダメージ + 武器種別大幅強化効果
2. **物理攻撃**: 物理慣れ参照・付与の標準的な物理スキル
3. **1hit攻撃**: シンプルな単発攻撃
4. **低消費MP**: 100MPの低コストスキル
5. **剣系統スキル**: 片手剣、双剣、両手剣専用のブレードスキル
6. **特殊計算**: 装備武器種によって威力が大幅に変動
7. **物理貫通効果**: 片手剣4倍、双剣2倍の物理貫通計算

シャットアウト(通常)の出血付与時強化版として、全武器種で大幅に威力が向上しており、特に片手剣・双剣では物理貫通計算による追加ダメージ効果を持つ極めて強力なスキルとして実装されます。