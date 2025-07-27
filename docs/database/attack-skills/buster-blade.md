# バスターブレード スキル追加仕様書

## 概要

AttackSkillFormに新しい攻撃スキル「バスターブレード」を追加するための詳細仕様書です。設計書`attack-skill-form.md`と`attack-skill-calculation.md`に基づいて、系統的にスキルデータを定義します。

## 基本情報

- **スキル名**: バスターブレード
- **スキルID**: `buster_blade`
- **系統グループ**: `sword` (剣系統)
- **カテゴリ**: `blade` (ブレードスキル)
- **武器種要件**: `片手剣`, `両手剣`, `双剣`
- **消費MP**: 300
- **表示順序**: 101 (100番台: 剣系統)

## データ構造定義

### AttackSkill オブジェクト

```typescript
{
  // 基本情報
  id: 'buster_blade',
  name: 'バスターブレード',
  order: 101,                    // 剣系統100番台
  systemGroup: 'sword',          // 剣系統
  category: 'blade',             // ブレードカテゴリ
  weaponTypeRequirements: ['片手剣', '両手剣', '双剣'],
  
  // 消費・条件
  mpCost: 300,
  
  // 表示用計算式説明
  multiplierFormula: '750% + 武器種別補正',  // 武器種別による倍率補正
  fixedDamageFormula: '300',                // 固定ダメージ300
  
  // 攻撃情報（1hit攻撃）
  hits: [
    {
      hitNumber: 1,
      attackType: 'physical',
      referenceDefense: 'DEF',
      referenceResistance: 'physical',
      powerReference: 'ATK',
      
      // 表示用倍率・固定値
      multiplier: 750,           // 表示用（実際の計算は外部）
      fixedDamage: 300,          // 固定値300
      
      // 計算式説明
      multiplierFormula: '750% + 武器種別補正', // 武器種別による倍率補正
      fixedDamageFormula: '300',
      
      // 慣れ設定
      familiarity: 'physical',     // 物理慣れ参照
      familiarityGrant: 'physical', // 物理慣れ付与
      
      // 補正適用設定
      canUseUnsheathePower: false,  // 抜刀威力適用不可
      canUseLongRange: false,       // ロングレンジ適用不可
      canUseShortRangePower: true,  // 近距離威力適用可能
      canUseLongRangePower: false,  // 遠距離威力適用不可
      
      // 特殊効果（撃数別）
      specialEffects: [
        '確定クリティカル'
      ]
    }
  ]
}
```

## 計算仕様

### 計算タイプ
- **計算方式**: 武器種別による特殊計算
- **基本倍率**: 750%
- **武器種別補正**: 装備武器種により異なる
- **固定値**: 300
- **特殊計算**: あり

### 計算処理

武器種別による倍率補正を適用した特殊計算を行います：

```typescript
class BusterBladeCalculator extends SkillHitCalculator {
  calculate(input: SkillCalculationInput): SkillCalculationResult {
    const baseMultiplier = 750  // 基本倍率750%
    let weaponBonus = 0
    
    // 武器種別による補正
    switch (input.equipmentContext.mainWeaponType) {
      case '両手剣':
        weaponBonus = input.playerStats.baseSTR  // +基礎STR%
        break
      case '片手剣':
        weaponBonus = Math.floor(input.playerStats.baseDEX / 2)  // +基礎DEX/2%
        break
      case '双剣':
        weaponBonus = 0  // 補正なし
        break
      default:
        weaponBonus = 0
    }
    
    const finalMultiplier = baseMultiplier + weaponBonus
    
    return {
      hitNumber: input.hitNumber,
      calculatedMultiplier: finalMultiplier,
      calculatedFixedDamage: 300,
      calculationProcess: `750% + ${weaponBonus}% (武器種別補正) = ${finalMultiplier}%`
    }
  }
}
```

### 武器種別補正詳細

| 武器種 | 基本倍率 | 武器種別補正 | 計算例（基礎ステータス100の場合） |
|--------|----------|--------------|----------------------------------|
| 片手剣 | 750%     | +基礎DEX/2%  | 750% + 50% = 800%               |
| 両手剣 | 750%     | +基礎STR%    | 750% + 100% = 850%              |
| 双剣   | 750%     | 補正なし     | 750%                            |

## UI表示仕様

### スキル選択ドロップダウン
- **表示位置**: 剣系統グループ内、order順で最初
- **表示名**: `バスターブレード`
- **武器種フィルタ**: 片手剣・両手剣・双剣装備時のみ表示

### スキル情報表示
```
📊 バスターブレード
　　カテゴリ: 剣系 | 消費MP: 300
　　威力参照: ATK | タイプ: 物理スキル
　　慣れ参照: 物理 | 慣れ付与: 物理
　　参照防御力: DEF | 参照耐性: 物理
　　距離威力: 近距離○ | 抜刀威力: × | ロングレンジ: ×

🎯 スキル威力値
　　倍率: 750% + 武器種別補正 | 固定値: 300
　　特殊効果: 確定クリティカル
　　
　　武器種別補正:
　　・片手剣: +基礎DEX/2%
　　・両手剣: +基礎STR%
　　・双剣: 補正なし
```

### 詳細情報
```
📋 詳細情報 [▼]
　　必要武器: 片手剣、両手剣、双剣
　　前提スキル: なし
　　特殊効果: 確定クリティカル
　　計算方式: 武器種別による特殊計算
　　備考: 装備武器種により倍率が変動する汎用剣系スキル
```

## 実装ファイル更新

### 1. src/data/attackSkills.ts
既存の`attackSkillsRawData`配列に新しいスキルオブジェクトを追加

### 2. src/utils/attackSkillCalculation/AttackSkillCalculator.ts
`getCalculatorForSkill`メソッドに`buster_blade`ケースを追加

### 3. src/utils/attackSkillCalculation/calculators/BusterBladeCalculator.ts
武器種別による特殊計算を実装した専用計算機を作成

### 3. 型定義更新
`src/types/calculator.ts`の`AttackSkillCategory`に`blade`が既に含まれていることを確認

## 現在の実装状況

### 完了済み
- スキルデータの基本構造定義
- UI表示の基本仕様
- 特殊効果（確定クリティカル）の設定
- 武器種要件の詳細化（片手剣、両手剣、双剣）
- 倍率計算式の詳細仕様（750% + 武器種別補正）
- 計算過程の詳細表示仕様

### 実装予定
- BusterBladeCalculator専用クラスの作成
- 武器種別判定ロジックの実装
- 基礎ステータス取得処理の実装

### 実装予定
- BusterBladeCalculator専用クラスの作成
- 武器種別判定ロジックの実装
- 基礎ステータス取得処理の実装
- テストケースの作成
- エラーハンドリング

## テストケース（仮）

### 単体テスト
```typescript
describe('バスターブレード Skill', () => {
  test('スキルデータの取得', () => {
    const skill = getAttackSkillById('buster_blade')
    expect(skill).toBeDefined()
    expect(skill?.name).toBe('バスターブレード')
    expect(skill?.mpCost).toBe(300)
    expect(skill?.weaponTypeRequirements).toContain('片手剣')
  })
  
  test('基本情報の確認', () => {
    const skill = getAttackSkillById('buster_blade')
    expect(skill?.hits).toHaveLength(1)
    expect(skill?.hits[0].specialEffects).toContain('確定クリティカル')
    expect(skill?.hits[0].fixedDamage).toBe(300)
    expect(skill?.weaponTypeRequirements).toEqual(['片手剣', '両手剣', '双剣'])
  })
  
  test('武器種別補正の計算', () => {
    const calculator = new BusterBladeCalculator()
    
    // 片手剣の場合（基礎DEX/2）
    const oneHandSwordResult = calculator.calculate({
      skillId: 'buster_blade',
      hitNumber: 1,
      playerStats: { baseDEX: 100 },
      equipmentContext: { mainWeaponType: '片手剣' }
    })
    expect(oneHandSwordResult.calculatedMultiplier).toBe(800) // 750 + 50
    
    // 両手剣の場合（基礎STR）
    const twoHandSwordResult = calculator.calculate({
      skillId: 'buster_blade',
      hitNumber: 1,
      playerStats: { baseSTR: 100 },
      equipmentContext: { mainWeaponType: '両手剣' }
    })
    expect(twoHandSwordResult.calculatedMultiplier).toBe(850) // 750 + 100
    
    // 双剣の場合（補正なし）
    const dualSwordResult = calculator.calculate({
      skillId: 'buster_blade',
      hitNumber: 1,
      playerStats: {},
      equipmentContext: { mainWeaponType: '双剣' }
    })
    expect(dualSwordResult.calculatedMultiplier).toBe(750) // 750 + 0
  })
})
```

## 実装優先度

### 高優先度
1. **スキルデータ追加**: `attackSkills.ts`への追加
2. **計算器連携**: `AttackSkillCalculator.ts`の更新
3. **基本表示機能**: UI表示の確認

### 中優先度
1. **特殊計算実装**: BusterBladeCalculator専用クラスの作成
2. **武器種フィルタ**: 片手剣・両手剣・双剣装備時のみ表示
3. **テスト実装**: 単体・統合テスト

### 低優先度
1. **パフォーマンス最適化**: 計算処理の最適化
2. **エラーハンドリング**: エッジケースの対応
3. **ドキュメント更新**: 技術文書の更新

## 将来の拡張

### 関連スキル
- 他のブレード系スキルの追加
- ブレードスキルのカテゴリ統一
- 片手剣系スキルのグループ化

### 計算式拡張
- 装備ボーナスの適用
- バフ効果との連携
- 敵状態による補正適用

### UI改善
- ブレード系スキルのグループ化表示
- スキル系統の視覚的区別
- 計算過程の詳細表示

## 備考

この仕様書は詳細な計算仕様を含む完全版です。武器種別による特殊計算を実装することで、3つの武器種（片手剣、両手剣、双剣）に対応した汎用性の高いスキルとなっています。

この仕様書に基づいて、系統的かつ安全にバスターブレードスキルを実装できます。既存の設計パターンに従うことで、保守性と拡張性を確保します。