# オーガスラッシュ スキル追加仕様書

## 概要

AttackSkillFormに新しい攻撃スキル「オーガスラッシュ」を追加するための詳細仕様書です。設計書`attack-skill-form.md`と`attack-skill-calculation.md`に基づいて、系統的にスキルデータを定義します。

## 基本情報

- **スキル名**: オーガスラッシュ
- **スキルID**: `ogre_slash`
- **系統グループ**: `sword` (剣系統)
- **カテゴリ**: `blade` (ブレードスキル)
- **武器種要件**: `両手剣`
- **消費MP**: 500
- **表示順序**: 104 (100番台: 剣系統)

## データ構造定義

### AttackSkill オブジェクト

```typescript
{
  // 基本情報
  id: 'ogre_slash',
  name: 'オーガスラッシュ',
  order: 104,                       // 剣系統100番台
  systemGroup: 'sword',             // 剣系統
  category: 'blade',                // ブレードカテゴリ
  weaponTypeRequirements: ['両手剣'],
  
  // 消費・条件
  mpCost: 500,
  
  // 表示用計算式説明
  multiplierFormula: (保留),
  fixedDamageFormula: (保留),
  
  // 攻撃情報（2hit攻撃）
  hits: [
    {
      hitNumber: 1,
      attackType: 'physical',
      referenceDefense: 'DEF',
      referenceResistance: 'physical',
      powerReference: 'ATK',
      
      // 表示用倍率・固定値
      multiplier: 0,             // 表示用（|基礎STR+基礎VIT|%は外部計算）
      fixedDamage: 0,            // 表示用（補正後DEXは外部計算）
      
      // 計算式説明
      multiplierFormula: '威力+|基礎STR+基礎VIT|%',
      fixedDamageFormula: '固定値+補正後DEX',
      
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
      multiplier: 0,             // 表示用（|200×消費鬼力数|%は外部計算）
      fixedDamage: 500,          // 固定500ダメージ
      
      // 計算式説明
      multiplierFormula: '威力+|200×消費鬼力数|%',
      fixedDamageFormula: '固定値500',
      
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
- **計算方式**: 特殊計算（OgreSlashCalculator専用）
- **1撃目**: |基礎STR+基礎VIT|%（物理貫通100超過時加算）、補正後DEX固定ダメージ
- **2撃目**: |200×消費鬼力数|%、固定500ダメージ
- **特殊効果**: |消費鬼力×10|%の物理貫通、物理貫通100%超過時1撃目威力上昇
- **特殊計算**: あり（消費鬼力を使用）

### 計算処理

専用の`OgreSlashCalculator`を使用した特殊計算を行います：

```typescript
class OgreSlashCalculator extends SkillHitCalculator {
  calculate(input: SkillCalculationInput): SkillCalculationResult {
    const { hitNumber, playerStats } = input

    switch (hitNumber) {
      case 1: {
        // 1撃目: ステータス依存計算 + 物理貫通加算
        const baseMultiplier = Math.abs(playerStats.baseSTR + playerStats.baseVIT)
        const fixedDamage = playerStats.adjustedDEX
        
        // 物理貫通総計を計算（キャラクター基本値 + スキル特殊効果）
        const demonPowerCount = input.buffSkillContext?.getBuffSkillLevel('ogre_slash') || 0
        const skillPenetration = Math.abs(demonPowerCount * 10)
        const totalPenetration = playerStats.physicalPenetration + skillPenetration
        
        // 物理貫通100%超過分を1撃目威力に加算
        const penetrationBonus = totalPenetration > 100 ? totalPenetration - 100 : 0
        const finalMultiplier = baseMultiplier + penetrationBonus

        return {
          hitNumber: 1,
          calculatedMultiplier: finalMultiplier,
          calculatedFixedDamage: fixedDamage,
          calculationProcess: `|${playerStats.baseSTR}+${playerStats.baseVIT}| + 貫通加算${penetrationBonus} = ${finalMultiplier}%, ${playerStats.adjustedDEX}`,
          specialEffects: {
            physicalPenetration: skillPenetration
          }
        }
      }

      case 2: {
        // 2撃目: 消費鬼力依存計算
        const demonPowerCount = input.buffSkillContext?.getBuffSkillLevel('ogre_slash') || 0
        const multiplier = Math.abs(200 * demonPowerCount)
        const fixedDamage = 500

        return {
          hitNumber: 2,
          calculatedMultiplier: multiplier,
          calculatedFixedDamage: fixedDamage,
          calculationProcess: `|200×${demonPowerCount}| = ${multiplier}%, 500固定`,
          specialEffects: {
            physicalPenetration: Math.abs(demonPowerCount * 10)
          }
        }
      }

      default:
        throw new Error(`Invalid hit number for Ogre Slash: ${hitNumber}`)
    }
  }
}
```

### 計算詳細

| 撃数 | 威力倍率 | 固定ダメージ | 計算式 |
|------|----------|--------------|--------|
| 1撃目 | \|基礎STR+基礎VIT\|% + 貫通加算 | 補正後DEX | STR+VIT絶対値% + (総物理貫通-100)%, 補正後DEX |
| 2撃目 | \|200×消費鬼力数\|% | 500 | 鬼力依存威力%, 固定500 |

#### 計算例（基礎STR: 200、基礎VIT: 150、補正後DEX: 180、消費鬼力: 5、キャラ物理貫通: 80%の場合）
- **スキル物理貫通**: |5×10| = 50%
- **総物理貫通**: 80% + 50% = 130%
- **貫通加算**: 130% - 100% = 30%
- **1撃目**: |200+150| + 30 = 350% + 30% = 380%, 180固定ダメージ
- **2撃目**: |200×5| = 1000%, 500固定ダメージ、物理貫通+50%

#### 貫通加算の詳細
- **基準値**: 物理貫通100%
- **加算対象**: 100%を超過した分のみ
- **加算方式**: 超過1%につき1撃目威力+1%
- **計算順序**: キャラクター基本物理貫通 + スキル特殊効果物理貫通 → 合計から100%を引いた値を1撃目に加算

## UI表示仕様

### スキル選択ドロップダウン
- **表示位置**: 剣系統グループ内、order順で`moon_slash`(103)の後
- **表示名**: `オーガスラッシュ`
- **武器種フィルタ**: 両手剣装備時のみ表示

### スキル情報表示
```
📊 オーガスラッシュ
　　カテゴリ: 剣系 | 消費MP: 500
　　威力参照: ATK | タイプ: 物理スキル
　　慣れ参照: 物理 | 慣れ付与: 物理
　　参照防御力: DEF | 参照耐性: 物理
　　距離威力: 近距離○ | 抜刀威力: × | ロングレンジ: ×

🎯 スキル威力値
　　1hit: 倍率: |基礎STR+基礎VIT|% + 貫通加算 | 固定値: 補正後DEX
　　2hit: 倍率: |200×消費鬼力数|% | 固定値: 500
　　特殊効果: 物理貫通+|消費鬼力×10|%（バフスキル連携）
```

### 詳細情報
```
📋 詳細情報 [▼]
　　必要武器: 両手剣
　　前提スキル: なし
　　特殊効果: 2段攻撃、消費鬼力連携、物理貫通、貫通加算システム
　　計算方式: 特殊計算
　　備考: 消費鬼力を使用する両手剣専用物理スキル
```

## 実装ファイル更新

### 1. src/data/attackSkills.ts
既存の`attackSkillsRawData`配列に新しいスキルオブジェクトを追加（未実装）

### 2. src/utils/attackSkillCalculation/AttackSkillCalculator.ts
`getCalculatorForSkill`メソッドに`ogre_slash`ケースを追加（未実装）

### 3. src/utils/attackSkillCalculation/calculators/OgreSlashCalculator.ts
専用計算機を作成（未実装）

### 4. src/utils/attackSkillCalculation/calculators/index.ts
OgreSlashCalculatorのエクスポートを追加（未実装）

### 5. 型定義更新
`src/types/calculator.ts`の型定義確認

## 現在の実装状況

### 未実装
- スキルデータの基本構造定義
- 計算ロジックの設計
- UI表示の詳細仕様
- 2段攻撃の実装方針
- 武器種要件の決定
- 系統グループとカテゴリの決定

### 確定事項
- **消費MP**: 500
- **攻撃タイプ**: 物理スキル
- **慣れ参照**: 物理
- **慣れ付与**: 通常
- **参照防御力**: DEF
- **参照耐性**: 物理
- **2段攻撃**: 2hitスキル

## テストケース

### 単体テスト
```typescript
describe('オーガスラッシュ Skill', () => {
  test('スキルデータの取得', () => {
    const skill = getAttackSkillById('ogre_slash')
    expect(skill).toBeDefined()
    expect(skill?.name).toBe('オーガスラッシュ')
    expect(skill?.mpCost).toBe(500)
    expect(skill?.weaponTypeRequirements).toEqual(['両手剣'])
    expect(skill?.hits).toHaveLength(2)
  })
  
  test('1撃目の計算', () => {
    // 実装時に追加
  })
  
  test('2撃目の計算', () => {
    // 実装時に追加
  })
})
```

### 統合テスト
```typescript
describe('オーガスラッシュ Integration', () => {
  test('AttackSkillFormでの選択', () => {
    // 両手剣装備での選択可能性テスト
    // スキル情報表示のテスト
    // 2段攻撃の計算結果統合テスト
  })
  
  test('計算エンジンとの連携', () => {
    const calculator = new AttackSkillCalculator()
    const results = calculator.calculateSkill('ogre_slash', playerStats, equipmentContext)
    expect(results).toHaveLength(2)
    expect(results[0].hitNumber).toBe(1)
    expect(results[1].hitNumber).toBe(2)
  })
})
```

## 実装優先度

### 今後の実装項目（高優先度）
1. ✅ **系統グループとカテゴリの決定**: sword/blade
2. ✅ **武器種要件の決定**: 両手剣専用
3. ✅ **計算方式の設計**: 特殊計算（OgreSlashCalculator）
4. ✅ **威力倍率と固定ダメージの設定**: 1撃目・2撃目完成

### 今後の実装項目（中優先度）
1. ✅ **補正適用設定の決定**: 近距離威力○、抜刀威力×、ロングレンジ×
2. ✅ **表示順序の決定**: 104（ムーンスラッシュの後）
3. ✅ **計算ロジックの実装**: OgreSlashCalculator専用クラス（1撃目・2撃目完成）
4. **UI表示の詳細仕様**

### 今後の実装項目（低優先度）
1. ✅ **2撃目の仕様決定と実装**: 消費鬼力連携完成
2. **テスト実装**
3. **エラーハンドリング**
4. **パフォーマンス最適化**
5. **ドキュメント更新**

## 将来の拡張

### 関連スキル
- 他のオーガ系スキルの追加
- 同系統スキルのカテゴリ統一
- 系統スキルのグループ化

### 計算式拡張
- 装備ボーナスの適用
- バフ効果との連携
- 敵状態による補正適用
- クリティカル計算との連携

### UI改善
- 系統スキルのグループ化表示
- スキル系統の視覚的区別
- 計算過程の詳細表示
- 2段攻撃の表示改善

## 備考

この仕様書はオーガスラッシュの基本構造を定義したものです。以下の項目が確定しており、他の項目は今後の設計で決定する必要があります：

### 確定項目
1. **物理スキル**として慣れ参照・付与が物理
2. **2段攻撃**構成
3. **消費MP 500**
4. **DEF参照、物理耐性参照**
5. **両手剣専用**スキル
6. **ATK参照**
7. **近距離威力適用可能、抜刀威力・ロングレンジ適用不可**
8. **1撃目**: |基礎STR+基礎VIT|%威力 + 物理貫通加算、補正後DEX固定ダメージ
9. **2撃目**: |200×消費鬼力数|%威力、500固定ダメージ
10. **特殊効果**: |消費鬼力×10|%の物理貫通
11. **貫通加算システム**: 総物理貫通100%超過時、超過分を1撃目威力に加算
12. **バフスキル連携**: BuffSkillFormのオーガスラッシュ(消費鬼力0-10)

### 保留項目
1. ✅ **系統グループとカテゴリ**の決定: sword/blade
2. ✅ **武器種要件**の決定: 両手剣専用
3. ✅ **計算方式**の決定: 特殊計算（OgreSlashCalculator）
4. ✅ **威力倍率と固定ダメージ**の設定: 1撃目・2撃目完成
5. ✅ **補正適用設定**の決定: 近距離威力○、抜刀威力×、ロングレンジ×
6. ✅ **2撃目の仕様決定**: 消費鬼力連携、物理貫通効果

## バフスキル連携

オーガスラッシュは AttackSkillForm と BuffSkillForm の連携が必要な特殊スキルです：

### 連携仕様
- **BuffSkillForm側**: オーガスラッシュ（バフスキル）で「消費鬼力」を管理
- **消費鬼力範囲**: 0-10の整数値
- **AttackSkillForm側**: 消費鬼力数を参照して2撃目の威力と特殊効果を計算

### 計算連携
```typescript
// BuffSkillFormから消費鬼力数を取得
const demonPowerCount = buffSkillContext.getBuffSkillLevel('ogre_slash') || 0

// 2撃目威力計算
const hit2Multiplier = Math.abs(200 * demonPowerCount)  // |200×消費鬼力数|%

// 物理貫通計算
const physicalPenetration = Math.abs(demonPowerCount * 10)  // |消費鬼力×10|%

// 1撃目貫通加算計算
const totalPenetration = playerStats.physicalPenetration + physicalPenetration
const penetrationBonus = totalPenetration > 100 ? totalPenetration - 100 : 0
const hit1Multiplier = Math.abs(playerStats.baseSTR + playerStats.baseVIT) + penetrationBonus
```

この設計により、BuffSkillFormでの消費鬼力設定が AttackSkillForm の計算結果にリアルタイムで反映されます。