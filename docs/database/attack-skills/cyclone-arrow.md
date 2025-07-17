# サイクロンアロー スキル追加仕様書

## 概要

AttackSkillFormに新しい攻撃スキル「サイクロンアロー」を追加するための詳細仕様書です。設計書`attack-skill-form.md`と`attack-skill-calculation.md`に基づいて、系統的にスキルデータを定義します。

## 基本情報

- **スキル名**: サイクロンアロー
- **スキルID**: `cyclone_arrow`
- **系統グループ**: `bow` (弓系統)
- **カテゴリ**: `hunter` (ハンタースキル)
- **武器種要件**: `弓`
- **消費MP**: 100
- **表示順序**: 502 (500番台: 弓系統)

## データ構造定義

### AttackSkill オブジェクト

```typescript
{
  // 基本情報
  id: 'cyclone_arrow',
  name: 'サイクロンアロー',
  order: 502,                    // 弓系統500番台
  systemGroup: 'bow',            // 弓系統
  category: 'hunter',            // ハンタースキル
  weaponTypeRequirements: ['弓'],
  
  // 消費・条件
  mpCost: 100,
  
  // 表示用計算式説明
  multiplierFormula: '100% + 矢装備時補正後DEX/2%',
  fixedDamageFormula: '100',     // 固定ダメージ100
  
  // 攻撃情報（1hit攻撃）
  hits: [
    {
      hitNumber: 1,
      attackType: 'physical',
      referenceDefense: 'DEF',
      referenceResistance: 'physical',
      powerReference: 'totalATK',
      
      // 表示用倍率・固定値
      multiplier: 100,           // 表示用（実際の計算は外部）
      fixedDamage: 100,          // 固定値100
      
      // 計算式説明
      multiplierFormula: '100% + 矢装備時補正後DEX/2%',
      fixedDamageFormula: '100',
      
      // 慣れ設定
      familiarity: 'physical',     // 物理慣れ参照
      familiarityGrant: 'physical', // 物理慣れ付与
      
      // 補正適用設定（保留）
      canUseUnsheathePower: false,  // 保留
      canUseLongRange: true,        // 弓系統のため仮設定
      canUseShortRangePower: true,  // 近距離威力適用可能
      canUseLongRangePower: true,   // 弓系統のため仮設定
      
      // 特殊効果（保留）
      specialEffects: [
        // 後で追加
      ]
    }
  ]
}
```

## 計算仕様

### 計算タイプ
- **計算方式**: サブ武器による特殊計算
- **基本倍率**: 100%
- **サブ武器補正**: 矢装備時+補正後DEX/2%
- **固定値**: 100
- **特殊計算**: あり

### 計算処理

サブ武器による倍率補正を適用した特殊計算を行います：

```typescript
class CycloneArrowCalculator extends SkillHitCalculator {
  calculate(input: SkillCalculationInput): SkillCalculationResult {
    const baseMultiplier = 100  // 基本倍率100%
    let arrowBonus = 0
    
    // サブ武器による補正
    if (input.equipmentContext.subWeaponType === '矢') {
      arrowBonus = Math.floor(input.playerStats.adjustedDEX / 2)  // +補正後DEX/2%
    }
    
    const finalMultiplier = baseMultiplier + arrowBonus
    
    return {
      hitNumber: input.hitNumber,
      calculatedMultiplier: finalMultiplier,
      calculatedFixedDamage: 100,
      calculationProcess: `100% + ${arrowBonus}% (矢装備補正) = ${finalMultiplier}%`
    }
  }
}
```

## UI表示仕様

### スキル選択ドロップダウン
- **表示位置**: 弓系統グループ内、order順で2番目
- **表示名**: `サイクロンアロー`
- **武器種フィルタ**: 弓装備時のみ表示

### スキル情報表示
```
📊 サイクロンアロー
　　カテゴリ: 弓系 | 消費MP: 100
　　威力参照: 総ATK | タイプ: 物理スキル
　　慣れ参照: 物理 | 慣れ付与: 物理
　　参照防御力: DEF | 参照耐性: 物理
　　距離威力: 近距離○ 遠距離○ | 抜刀威力: 保留 | ロングレンジ: ○

🎯 スキル威力値
　　倍率: 100% + 矢装備時補正後DEX/2% | 固定値: 100
　　特殊効果: 保留
```

### 詳細情報
```
📋 詳細情報 [▼]
　　必要武器: 弓
　　前提スキル: 保留
　　特殊効果: 保留
　　計算方式: サブ武器による特殊計算
　　備考: ハンタースキル系統の弓攻撃スキル
```

## 実装ファイル更新

### 1. src/data/attackSkills.ts
既存の`attackSkillsRawData`配列に新しいスキルオブジェクトを追加

### 2. src/utils/attackSkillCalculation/AttackSkillCalculator.ts
`getCalculatorForSkill`メソッドに`cyclone_arrow`ケースを追加

### 3. src/utils/attackSkillCalculation/calculators/CycloneArrowCalculator.ts
サブ武器による特殊計算を実装した専用計算機を作成

### 4. 型定義更新
`src/types/calculator.ts`の`AttackSkillCategory`に`hunter`が含まれていることを確認

## 現在の実装状況

### 確定済み
- スキル名: サイクロンアロー
- スキルID: cyclone_arrow
- 系統グループ: bow（弓系統）
- カテゴリ: hunter（ハンタースキル）
- 武器種要件: 弓
- 消費MP: 100
- 基本倍率: 100%
- サブ武器補正: 矢装備時+補正後DEX/2%
- 固定ダメージ: 100
- 慣れ参照: 物理
- 慣れ付与: 物理
- 計算方式: サブ武器による特殊計算

### 保留項目
- **特殊効果**: スキル固有の効果
- **補正適用**: 抜刀威力の適用可否
- **前提スキル**: 習得に必要なスキル
- **詳細仕様**: その他の細かい仕様

### 今後の追加予定
- 特殊効果の追加
- 抜刀威力適用可否の確定
- テストケースの作成

## 実装優先度

### 高優先度
1. **スキルデータ追加**: `attackSkills.ts`への追加
2. **専用計算機作成**: CycloneArrowCalculatorの実装
3. **計算機統合**: AttackSkillCalculatorとの連携

### 中優先度
1. **特殊効果の追加**: スキル固有の効果を決定
2. **抜刀威力設定**: 適用可否を確定
3. **前提スキル設定**: 習得条件の確定

### 低優先度
1. **UI調整**: 表示の最適化
2. **テスト実装**: 単体・統合テスト
3. **ドキュメント更新**: 仕様書の完成

## 将来の拡張

### 関連スキル
- 他のハンタースキルの追加
- 弓系統スキルの拡張
- 自動弓専用スキルの実装

### 計算式拡張
- 装備ボーナスの適用
- バフ効果との連携
- 敵状態による補正適用

### UI改善
- ハンタースキルのグループ化表示
- スキル系統の視覚的区別
- 計算過程の詳細表示

## 備考

この仕様書は初期設定版です。倍率や特殊効果などの詳細仕様は今後段階的に追加していきます。保留項目については、追加情報が得られ次第、仕様書を更新してください。

ハンタースキルとしての特性や、弓・自動弓装備時の特殊な動作については、詳細が確定次第、計算方式や特殊効果として実装する予定です。