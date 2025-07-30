# メテオブレイカー スキル追加仕様書

## 概要

AttackSkillFormに新しい攻撃スキル「メテオブレイカー」を追加するための詳細仕様書です。設計書`attack-skill-form.md`と`attack-skill-calculation.md`に基づいて、系統的にスキルデータを定義します。

## 基本情報

- **スキル名**: メテオブレイカー
- **スキルID**: `meteor_breaker`
- **系統グループ**: `sword` (剣系統)
- **カテゴリ**: `blade` (ブレードスキル)
- **武器種要件**: `片手剣`, `両手剣`, `双剣`
- **消費MP**: 600
- **表示順序**: 102 (100番台: 剣系統)

## データ構造定義

### AttackSkill オブジェクト（基本構造）

```typescript
{
  // 基本情報
  id: 'meteor_breaker',
  name: 'メテオブレイカー',
  order: 102,                    // 剣系統100番台
  systemGroup: 'sword',          // 剣系統
  category: 'blade',             // ブレードカテゴリ
  weaponTypeRequirements: ['片手剣', '両手剣', '双剣'],
  
  // 消費・条件
  mpCost: 600,
  
  // 表示用計算式説明
  multiplierFormula: '600% (両手剣装備時+200%+基礎STR/10%)',
  fixedDamageFormula: '1hit目600、2hit目0',
  
  // 攻撃情報（2hit攻撃）
  hits: [
    {
      hitNumber: 1,
      attackType: 'physical',
      referenceDefense: 'DEF',
      referenceResistance: 'physical',
      powerReference: 'ATK',      // 威力参照ステータス
      
      // 表示用倍率・固定値
      multiplier: 600,            // 表示用倍率600%
      fixedDamage: 600,           // 1hit目固定ダメージ600
      
      // 計算式説明
      multiplierFormula: '両手剣装備時：威力+200%+基礎STR/10%',
      fixedDamageFormula: '600',  // 固定ダメージ600
      
      // 慣れ設定
      adaptation: 'physical',     // 物理慣れ参照
      adaptationGrant: 'physical', // 物理慣れ付与
      
      // 補正適用設定
      canUseUnsheathePower: false, // 抜刀威力適用不可
      canUseLongRange: false,      // ロングレンジ適用不可
      canUseShortRangePower: true, // 近距離威力適用可能
      canUseLongRangePower: false, // 遠距離威力適用不可
      
      // 特殊効果（要仕様決定）
      specialEffects: ['TBD']      // 特殊効果一覧
    },
    {
      hitNumber: 2,
      attackType: 'physical',
      referenceDefense: 'DEF',
      referenceResistance: 'physical',
      powerReference: 'ATK',      // 威力参照ステータス
      
      // 表示用倍率・固定値
      multiplier: 600,            // 表示用倍率600%
      fixedDamage: 0,             // 2hit目固定ダメージは0
      
      // 計算式説明
      multiplierFormula: '片手剣装備時：威力+基礎DEX/2%',
      fixedDamageFormula: '0',    // 固定ダメージ0
      
      // 慣れ設定
      adaptation: 'physical',     // 物理慣れ参照
      adaptationGrant: 'physical', // 物理慣れ付与
      
      // 補正適用設定
      canUseUnsheathePower: false, // 抜刀威力適用不可
      canUseLongRange: false,      // ロングレンジ適用不可
      canUseShortRangePower: true, // 近距離威力適用可能
      canUseLongRangePower: false, // 遠距離威力適用不可
      
      // 特殊効果（要仕様決定）
      specialEffects: ['TBD']      // 特殊効果一覧
    }
  ]
}
```

## 計算仕様

### 計算タイプ
- **計算方式**: 特殊計算（MeteorBreakerCalculator専用）
- **1撃目**: 600%（両手剣装備時+200%+基礎STR/10%）、固定600ダメージ
- **2撃目**: 600%（片手剣装備時+基礎DEX/2%）、固定0ダメージ
- **特殊計算**: あり（基礎STR・DEX依存）

### 計算処理

専用の`MeteorBreakerCalculator`を使用した特殊計算を行います：

```typescript
class MeteorBreakerCalculator extends SkillHitCalculator {
  calculate(input: SkillCalculationInput): SkillCalculationResult {
    const { hitNumber, playerStats, equipmentContext } = input

    switch (hitNumber) {
      case 1: {
        // 1撃目: 基本600% + 両手剣装備時補正
        let multiplier = 600  // 基本倍率600%
        let weaponBonus = 0
        
        if (equipmentContext.mainWeaponType === '両手剣') {
          weaponBonus = 200 + Math.floor(playerStats.baseSTR / 10)
        }
        
        const finalMultiplier = multiplier + weaponBonus
        
        return {
          hitNumber: 1,
          calculatedMultiplier: finalMultiplier,
          calculatedFixedDamage: 600,
          calculationProcess: equipmentContext.mainWeaponType === '両手剣'
            ? `600% + 200% + floor(${playerStats.baseSTR}/10)% = ${finalMultiplier}%`
            : `600% (基本倍率)`
        }
      }

      case 2: {
        // 2撃目: 基本600% + 片手剣装備時補正
        let multiplier = 600  // 基本倍率600%
        let weaponBonus = 0
        
        if (equipmentContext.mainWeaponType === '片手剣') {
          weaponBonus = Math.floor(playerStats.baseDEX / 2)
        }
        
        const finalMultiplier = multiplier + weaponBonus
        
        return {
          hitNumber: 2,
          calculatedMultiplier: finalMultiplier,
          calculatedFixedDamage: 0, // 固定ダメージなし
          calculationProcess: equipmentContext.mainWeaponType === '片手剣'
            ? `600% + floor(${playerStats.baseDEX}/2)% = ${finalMultiplier}%`
            : `600% (基本倍率)`
        }
      }

      default:
        throw new Error(`Invalid hit number for Meteor Breaker: ${hitNumber}`)
    }
  }
}
```

### 計算詳細

#### 1撃目

| 武器種 | 基本倍率 | 武器種別補正 | 計算例（基礎STR: 200の場合） |
|--------|----------|--------------|------------------------------|
| 片手剣 | 600%     | 補正なし     | 600%                        |
| 両手剣 | 600%     | +200%+基礎STR/10% | 600% + 200% + 20% = 820%    |
| 双剣   | 600%     | 補正なし     | 600%                        |

#### 2撃目

| 武器種 | 基本倍率 | 武器種別補正 | 計算例（基礎DEX: 300の場合） |
|--------|----------|--------------|------------------------------|
| 片手剣 | 600%     | +基礎DEX/2% | 600% + 150% = 750%          |
| 両手剣 | 600%     | 補正なし     | 600%                        |
| 双剣   | 600%     | 補正なし     | 600%                        |

## 仕様決定待ち項目

### 基本仕様
- [x] **消費MP**: 600
- [x] **表示順序**: 102 (剣系統100番台)
- [x] **撃数**: 2hit攻撃
- [ ] **計算方式**: 標準計算か特殊計算か

### 威力・ダメージ仕様
- [x] **基本倍率**: 1hit目600%、2hit目600%
- [x] **固定ダメージ**: 1hit目600、2hit目0
- [x] **武器種別補正**: 1hit目は両手剣装備時+200%+基礎STR/10%、2hit目は片手剣装備時+基礎DEX/2%
- [x] **特殊計算**: 基礎STR・DEX依存補正あり

### 補正適用仕様
- [x] **抜刀威力**: 適用不可 (canUseUnsheathePower: false)
- [x] **ロングレンジ**: 適用不可 (canUseLongRange: false)
- [x] **距離威力**: 近距離威力適用可能 (canUseShortRangePower: true)、遠距離威力適用不可 (canUseLongRangePower: false)
- [x] **慣れ付与**: 物理慣れ付与 (adaptation: 'physical', adaptationGrant: 'physical')

### 特殊効果仕様
- [ ] **クリティカル**: 確定クリティカルの有無
- [ ] **貫通効果**: 貫通ボーナス等の特殊効果
- [ ] **状態異常**: 付与する状態異常効果
- [ ] **その他効果**: その他の特殊効果

## UI表示仕様（暫定）

### スキル選択ドロップダウン
- **表示位置**: 剣系統グループ内、order順で`buster_blade`(101)の後
- **表示名**: `メテオブレイカー`
- **武器種フィルタ**: 片手剣・両手剣・双剣装備時のみ表示

### スキル情報表示（暫定）
```
📊 メテオブレイカー
　　カテゴリ: 剣系 | 消費MP: 600
　　威力参照: ATK | タイプ: 物理スキル
　　慣れ参照: 物理 | 慣れ付与: 物理
　　参照防御力: DEF | 参照耐性: 物理
　　距離威力: 近距離○ | 抜刀威力: × | ロングレンジ: ×

🎯 スキル威力値
　　1hit: 倍率: 600% (両手剣装備時+200%+基礎STR/10%) | 固定値: 600
　　2hit: 倍率: 600% (片手剣装備時+基礎DEX/2%) | 固定値: 0
　　特殊効果: 基礎STR・DEX依存計算
```

### 詳細情報（暫定）
```
📋 詳細情報 [▼]
　　必要武器: 片手剣、両手剣、双剣
　　前提スキル: TBD
　　特殊効果: 2段攻撃、TBD
　　計算方式: TBD
　　備考: 2hit攻撃の剣系統スキル
```

## 実装ファイル更新予定

### 1. src/data/attackSkills.ts
既存の`attackSkillsRawData`配列に新しいスキルオブジェクトを追加

### 2. src/utils/attackSkillCalculation/AttackSkillCalculator.ts
`getCalculatorForSkill`メソッドに`meteor_breaker`ケースを追加

### 3. src/utils/attackSkillCalculation/calculators/MeteorBreakerCalculator.ts
両手剣装備時の基礎STR依存計算を実装した専用計算機を作成

### 4. src/utils/attackSkillCalculation/calculators/index.ts
MeteorBreakerCalculatorのエクスポートを追加

### 5. 型定義確認
`src/types/calculator.ts`の`AttackSkillCategory`に`blade`が既に含まれていることを確認

## 実装優先度

### 完了済み
- スキルの基本情報設定（名前、ID、系統、カテゴリ、武器種要件）
- 消費MP設定（600）
- 表示順序設定（102）
- 撃数設定（2hit攻撃）
- 1hit目威力設定（600%、両手剣装備時+200%+基礎STR/10%）
- 1hit目固定ダメージ設定（600）
- 2hit目威力設定（600%、片手剣装備時+基礎DEX/2%）
- 2hit目固定ダメージ設定（0）
- 補正適用設定（抜刀威力×、ロングレンジ×、近距離威力○、遠距離威力×）
- 慣れ設定（adaptation: 'physical', adaptationGrant: 'physical'）
- 計算仕様設計（MeteorBreakerCalculator専用クラス）
- データ構造の基本枠組み定義
- UI表示の基本枠組み

### 仕様決定待ち（高優先度）
1. **基本仕様の決定**: 消費MP、撃数、計算方式
2. **威力仕様の決定**: 基本倍率、固定ダメージ、特殊計算
3. **補正適用の決定**: 各種威力補正の適用可否
4. **特殊効果の決定**: クリティカル、貫通等の特殊効果

### 実装予定（仕様決定後）
1. **スキルデータ追加**: `attackSkills.ts`への追加
2. **計算器連携**: `AttackSkillCalculator.ts`の更新
3. **専用計算器**: 必要に応じて専用計算クラス作成
4. **テスト実装**: 単体・統合テスト

## 将来の拡張

### 関連スキル
- 他のブレード系スキルとの統一性
- 剣系統スキルのグループ化
- メテオ系スキルの派生実装

### 計算式拡張
- 装備ボーナスの適用
- バフ効果との連携
- 敵状態による補正適用

### UI改善
- ブレード系スキルのグループ化表示
- スキル系統の視覚的区別
- 計算過程の詳細表示

## 備考

この仕様書は基本構造のみを定義した初期版です。詳細な威力計算、特殊効果、補正適用等の仕様は別途決定し、この文書を更新する必要があります。

仕様決定後は、既存のスキル実装パターンに従って系統的かつ安全に実装を進めることができます。

## 次のステップ

1. **仕様決定**: 上記「仕様決定待ち項目」の各項目を決定
2. **仕様書更新**: 決定した仕様に基づいて本文書を更新
3. **実装**: 更新された仕様書に基づいて実装を実行
4. **テスト**: 実装したスキルの動作確認とテスト