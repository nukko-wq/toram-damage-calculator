# クロスファイア(3溜め) スキル追加仕様書

## 概要

AttackSkillFormに新しい攻撃スキル「クロスファイア(3溜め)」を追加するための詳細仕様書です。設計書`attack-skill-form.md`と`attack-skill-calculation.md`に基づいて、系統的にスキルデータを定義します。

## 基本情報

- **スキル名**: クロスファイア(3溜め)
- **スキルID**: `cross_fire_3_charge`
- **系統グループ**: `bow` (弓系統)
- **カテゴリ**: `shoot` (シュート)
- **武器種要件**: `弓`, `自動弓`
- **消費MP**: 400
- **表示順序**: 501 (500番台: 弓系統)

## データ構造定義

### AttackSkill オブジェクト

```typescript
{
  // 基本情報
  id: 'cross_fire_3_charge',
  name: 'クロスファイア(3溜め)',
  order: 501,                    // 弓系統500番台
  systemGroup: 'bow',            // 弓系統
  category: 'shoot',             // シュートカテゴリ
  weaponTypeRequirements: ['弓', '自動弓'],
  
  // 消費・条件
  mpCost: 400,
  
  // 表示用計算式説明
  multiplierFormula: '弓:特殊計算、自動弓:2700%/300%x2',
  fixedDamageFormula: '400/400',
  
  // 攻撃情報（2hit攻撃）
  hits: [
    {
      hitNumber: 1,
      attackType: 'physical',
      referenceDefense: 'DEF',
      referenceResistance: 'physical',
      powerReference: 'ATK',
      
      // 表示用倍率・固定値
      multiplier: 2850,          // 弓装備時の表示用（実際は特殊計算）
      fixedDamage: 400,          // 固定ダメージ400
      
      // 慣れ設定
      adaptation: 'physical',     // 物理慣れ参照
      adaptationGrant: 'physical',  // 物理慣れ付与
      
      // 補正適用設定（仕様保留）
      canUseUnsheathePower: false,  // 抜刀威力適用（要決定）
      canUseLongRange: true,        // ロングレンジ適用可能（弓系統）
      canUseShortRangePower: true,  // 近距離威力適用可能
      canUseLongRangePower: true,   // 遠距離威力適用可能（弓系統）
      
      // 特殊効果（自動弓のみ物理貫通）
      specialEffects: ['物理貫通'] // 自動弓装備時のみ適用
    },
    {
      hitNumber: 2,
      attackType: 'physical',
      referenceDefense: 'DEF',
      referenceResistance: 'physical',
      powerReference: 'ATK',
      
      // 表示用倍率・固定値
      multiplier: 400,           // 弓装備時の表示用（200%x2）
      fixedDamage: 400,          // 固定ダメージ400
      
      // 慣れ設定
      adaptation: 'physical',     // 物理慣れ参照
      adaptationGrant: 'physical',  // 物理慣れ付与
      
      // 補正適用設定（仕様保留）
      canUseUnsheathePower: false,  // 抜刀威力適用（要決定）
      canUseLongRange: true,        // ロングレンジ適用可能（弓系統）
      canUseShortRangePower: true,  // 近距離威力適用可能
      canUseLongRangePower: true,   // 遠距離威力適用可能（弓系統）
      
      // 特殊効果（自動弓のみ物理貫通）
      specialEffects: ['物理貫通'] // 自動弓装備時のみ適用
    }
  ]
}
```

## 計算仕様

### 計算タイプ
- **計算方式**: 特殊計算（CrossFire3ChargeCalculator専用）
- **1撃目**: 弓: |2850+基礎DEXx60%|%、自動弓: 2700%、固定400ダメージ
- **2撃目**: 弓: 200%x2、自動弓: 300%x2、固定400ダメージ
- **特殊計算**: あり（武器種・基礎DEX依存）

### 計算処理

専用の`CrossFire3ChargeCalculator`を使用した特殊計算を行います：

```typescript
class CrossFire3ChargeCalculator extends SkillHitCalculator {
  calculate(input: SkillCalculationInput): SkillCalculationResult {
    const { hitNumber, playerStats, equipmentContext } = input

    switch (hitNumber) {
      case 1: {
        // 1撃目: 武器種に応じた計算
        let multiplier: number
        
        if (equipmentContext.mainWeaponType === '弓') {
          // 弓: |2850+基礎DEXx60%|%
          const dexBonus = Math.floor(playerStats.baseDEX * 0.6)
          multiplier = Math.abs(2850 + dexBonus)
        } else if (equipmentContext.mainWeaponType === '自動弓') {
          // 自動弓: 2700%
          multiplier = 2700
        } else {
          multiplier = 0 // 武器種不適合
        }
        
        // 自動弓装備時は物理貫通効果を追加
        const physicalPenetration = equipmentContext.mainWeaponType === '自動弓'
          ? Math.abs(Math.floor(playerStats.baseDEX * 0.1))
          : 0
        
        return {
          hitNumber: 1,
          calculatedMultiplier: multiplier,
          calculatedFixedDamage: 400,
          physicalPenetration: physicalPenetration,
          calculationProcess: equipmentContext.mainWeaponType === '弓'
            ? `|2850 + floor(${playerStats.baseDEX} * 0.6)| = ${multiplier}%`
            : `2700% (自動弓), 物理貫通: ${physicalPenetration}%`
        }
      }

      case 2: {
        // 2撃目: 武器種に応じた計算
        let multiplier: number
        
        if (equipmentContext.mainWeaponType === '弓') {
          // 弓: 200%x2 = 400%
          multiplier = 400
        } else if (equipmentContext.mainWeaponType === '自動弓') {
          // 自動弓: 300%x2 = 600%
          multiplier = 600
        } else {
          multiplier = 0 // 武器種不適合
        }
        
        // 自動弓装備時は物理貫通効果を追加
        const physicalPenetration = equipmentContext.mainWeaponType === '自動弓'
          ? Math.abs(Math.floor(playerStats.baseDEX * 0.1))
          : 0
        
        return {
          hitNumber: 2,
          calculatedMultiplier: multiplier,
          calculatedFixedDamage: 400,
          physicalPenetration: physicalPenetration,
          calculationProcess: equipmentContext.mainWeaponType === '弓'
            ? `200% x 2 = ${multiplier}%`
            : `300% x 2 = ${multiplier}%, 物理貫通: ${physicalPenetration}%`
        }
      }

      default:
        throw new Error(`Invalid hit number for Cross Fire (3 Charge): ${hitNumber}`)
    }
  }
}
```

### 計算詳細

#### 1撃目

| 武器種 | 威力倍率 | 固定ダメージ | 物理貫通 | 計算例（基礎DEX: 300の場合） |
|--------|----------|--------------|----------|------------------------------|
| 弓     | \|2850+基礎DEXx60%\|% | 400 | なし | \|2850 + 180\| = 3030%      |
| 自動弓 | 2700%    | 400          | \|基礎DEXx10%\|% | 2700%, 貫通: 30%             |

#### 2撃目

| 武器種 | 威力倍率 | 固定ダメージ | 物理貫通 | 計算式 |
|--------|----------|--------------|----------|--------|
| 弓     | 400% (200%x2) | 400    | なし | 200% x 2回攻撃 |
| 自動弓 | 600% (300%x2) | 400    | \|基礎DEXx10%\|% | 300% x 2回攻撃, 貫通: \|基礎DEXx10%\|% |

## 仕様決定待ち項目

### 基本仕様
- [x] **表示順序**: 弓系統500番台の配置位置（501に設定済み）
- [x] **計算方式**: 特殊計算（CrossFire3ChargeCalculator専用）

### 威力・ダメージ仕様
- [x] **基本倍率**: 1hit目（弓: |2850+基礎DEXx60%|%、自動弓: 2700%）、2hit目（弓: 200%x2、自動弓: 300%x2）
- [x] **固定ダメージ**: 1hit目・2hit目共に400固定ダメージ
- [x] **特殊効果**: 基礎DEX依存計算（弓）、物理貫通効果（自動弓）

### 補正適用仕様
- [ ] **抜刀威力**: 適用可否 (canUseUnsheathePower)
- [x] **ロングレンジ**: 適用可能 (canUseLongRange: true - 弓系統)
- [x] **距離威力**: 近距離威力適用可能、遠距離威力適用可能
- [x] **慣れ付与**: 物理慣れ付与 (adaptation: 'physical', adaptationGrant: 'physical')

### 特殊効果仕様
- [x] **貫通効果**: 自動弓装備時に物理貫通 |基礎DEXx10%|% 加算
- [ ] **クリティカル**: 確定クリティカルの有無（要決定）
- [ ] **状態異常**: 付与する状態異常効果（要決定）
- [ ] **その他効果**: 3溜めによるその他の特殊効果（要決定）

## UI表示仕様（暫定）

### スキル選択ドロップダウン
- **表示位置**: 弓系統グループ内、order順で配置
- **表示名**: `クロスファイア(3溜め)`
- **武器種フィルタ**: 弓・自動弓装備時のみ表示

### スキル情報表示（暫定）
```
📊 クロスファイア(3溜め)
　　カテゴリ: 弓系 | 消費MP: 400
　　威力参照: ATK | タイプ: 物理スキル
　　慣れ参照: 物理 | 慣れ付与: 物理
　　参照防御力: DEF | 参照耐性: 物理
　　距離威力: 近距離○ | 遠距離○ | 抜刀威力: TBD | ロングレンジ: ○

🎯 スキル威力値
　　1hit: 倍率: 弓:|2850+基礎DEXx60%|%、自動弓:2700% | 固定値: 400
　　2hit: 倍率: 弓:200%x2、自動弓:300%x2 | 固定値: 400
　　特殊効果: 基礎DEX依存計算（弓）、物理貫通|基礎DEXx10%|%（自動弓）
```

### 詳細情報（暫定）
```
📋 詳細情報 [▼]
　　必要武器: 弓、自動弓
　　前提スキル: TBD
　　特殊効果: 2段攻撃、TBD
　　計算方式: TBD
　　備考: 3溜めの弓系統スキル
```

## 実装ファイル更新予定

### 1. src/data/attackSkills.ts
既存の`attackSkillsRawData`配列に新しいスキルオブジェクトを追加

### 2. src/utils/attackSkillCalculation/AttackSkillCalculator.ts
`getCalculatorForSkill`メソッドに`cross_fire_3_charge`ケースを追加

### 3. src/utils/attackSkillCalculation/calculators/CrossFire3ChargeCalculator.ts
特殊計算が必要な場合、専用計算機を作成

### 4. src/utils/attackSkillCalculation/calculators/index.ts
必要に応じてCrossFire3ChargeCalculatorのエクスポートを追加

### 5. 型定義確認
`src/types/calculator.ts`の`AttackSkillCategory`に`shoot`が既に含まれていることを確認

## 実装優先度

### 完了済み
- スキルの基本情報設定（名前、ID、系統、カテゴリ、武器種要件）
- 消費MP設定（400）
- 表示順序設定（501）
- 撃数設定（2hit攻撃）
- 威力仕様設定（弓: |2850+基礎DEXx60%|%/200%x2、自動弓: 2700%/300%x2）
- 固定ダメージ設定（1hit目・2hit目共に400）
- 計算方式設定（特殊計算）
- 基本的なデータ構造の定義
- 弓系統の特性を考慮した補正適用設定（ロングレンジ、近距離・遠距離威力適用可能）
- 慣れ設定（物理慣れ参照・付与）
- 物理貫通効果設定（自動弓装備時 |基礎DEXx10%|% 加算）
- CrossFire3ChargeCalculator計算クラスの仕様設計

### 仕様決定待ち（低優先度）
1. **特殊効果の決定**: 3溜めによるその他の特殊効果（クリティカル、状態異常等）
2. **抜刀威力適用の決定**: 適用可否の決定

### 実装予定（仕様決定後）
1. **スキルデータ追加**: `attackSkills.ts`への追加
2. **計算器連携**: `AttackSkillCalculator.ts`の更新
3. **専用計算器**: 必要に応じて専用計算クラス作成
4. **テスト実装**: 単体・統合テスト

## 将来の拡張

### 関連スキル
- 他のクロスファイア系スキル（1溜め、2溜め等）の追加
- シュート系スキルのカテゴリ統一
- 弓系統スキルのグループ化

### 計算式拡張
- 装備ボーナスの適用
- バフ効果との連携
- 敵状態による補正適用
- 距離による威力補正

### UI改善
- シュート系スキルのグループ化表示
- スキル系統の視覚的区別
- 計算過程の詳細表示
- 溜め段階の表示改善

## 備考

この仕様書は基本構造のみを定義した初期版です。詳細な威力計算、特殊効果、補正適用等の仕様は別途決定し、この文書を更新する必要があります。

弓系統スキルとしての特性（ロングレンジ適用可能、遠距離威力適用可能等）は既に考慮されていますが、3溜めによる特殊効果等の詳細仕様は保留となっています。

仕様決定後は、既存のスキル実装パターンに従って系統的かつ安全に実装を進めることができます。

## 次のステップ

1. **仕様決定**: 上記「仕様決定待ち項目」の各項目を決定
2. **仕様書更新**: 決定した仕様に基づいて本文書を更新
3. **実装**: 更新された仕様書に基づいて実装を実行
4. **テスト**: 実装したスキルの動作確認とテスト