# デンジャーシェイク(前入力派生) スキル追加仕様書

## 概要

AttackSkillFormに新しい攻撃スキル「デンジャーシェイク(前入力派生)」を追加するための詳細仕様書です。設計書`attack-skill-form.md`と`attack-skill-calculation.md`に基づいて、系統的にスキルデータを定義します。

## 基本情報

- **スキル名**: デンジャーシェイク(前入力派生)
- **スキルID**: `danger_shake`
- **系統グループ**: `necromancer` (ネクロマンサー系統)
- **カテゴリ**: `necromancer` (ネクロマンサースキル)
- **武器種要件**: `杖`, `旋風槍`
- **消費MP**: 100
- **表示順序**: 301 (300番台: ネクロマンサー系統)

## データ構造定義

### AttackSkill オブジェクト

```typescript
{
  // 基本情報
  id: 'danger_shake',
  name: 'デンジャーシェイク(前入力派生)',
  order: 301,                    // ネクロマンサー系統300番台
  systemGroup: 'necromancer',    // ネクロマンサー系統
  category: 'necromancer',       // ネクロマンサーカテゴリ
  weaponTypeRequirements: ['杖', '旋風槍'],
  
  // 消費・条件
  mpCost: 100,
  
  // 表示用計算式説明
  multiplierFormula: '特殊計算',  // 武器種・STR依存計算
  fixedDamageFormula: '100',     // 固定ダメージ
  
  // 攻撃情報（2hit攻撃）
  hits: [
    {
      hitNumber: 1,
      attackType: 'physical',
      referenceDefense: 'DEF',
      referenceResistance: 'physical',
      powerReference: 'ATK',
      
      // 威力・固定値
      multiplier: 1000,          // 表示用（実際の計算は外部）
      fixedDamage: 100,          // 固定100ダメージ
      
      // 計算式説明
      multiplierFormula: '杖:|1000+基礎STR/2|%, 旋風槍:|750+基礎STR/2|%',
      
      // 慣れ設定
      adaptation: 'physical',    // 物理慣れ参照
      adaptationGrant: 'physical', // 物理慣れ付与
      
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
      
      // 威力・固定値
      multiplier: 1500,          // 表示用（実際の計算は外部）
      fixedDamage: 100,          // 固定100ダメージ
      
      // 計算式説明
      multiplierFormula: '杖:|1500+補正後STR|%, 旋風槍:|1000+補正後STR|%',
      
      // 慣れ設定
      adaptation: 'physical',    // 物理慣れ参照
      adaptationGrant: 'physical', // 物理慣れ付与
      
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
- **計算方式**: 特殊計算（DangerShakeCalculator専用）
- **1撃目**: 武器種・基礎STR依存計算、固定100ダメージ
- **2撃目**: 武器種・補正後STR依存計算、固定100ダメージ
- **特殊計算**: あり

### 計算処理

専用の`DangerShakeCalculator`を使用した特殊計算を行います：

```typescript
class DangerShakeCalculator extends SkillHitCalculator {
  calculate(input: SkillCalculationInput): SkillCalculationResult {
    const { hitNumber, playerStats, equipmentContext } = input

    switch (hitNumber) {
      case 1: {
        // 1撃目: 武器種・STR依存計算
        const baseSTR = playerStats.baseSTR
        let multiplier: number
        
        // 武器種による基準値の決定
        const weaponType = equipmentContext.mainWeapon?.type
        if (weaponType === '杖') {
          multiplier = Math.abs(1000 + Math.floor(baseSTR / 2))
        } else if (weaponType === '旋風槍') {
          multiplier = Math.abs(750 + Math.floor(baseSTR / 2))
        } else {
          // デフォルト（杖として扱う）
          multiplier = Math.abs(1000 + Math.floor(baseSTR / 2))
        }

        return {
          hitNumber: 1,
          calculatedMultiplier: multiplier,
          calculatedFixedDamage: 100,
          calculationProcess: `${weaponType}:|${weaponType === '旋風槍' ? 750 : 1000}+floor(${baseSTR}/2)| = ${multiplier}%, 固定100`
        }
      }

      case 2: {
        // 2撃目: 武器種・補正後STR依存計算
        const adjustedSTR = playerStats.adjustedSTR
        let multiplier: number
        
        // 武器種による基準値の決定
        const weaponType = equipmentContext.mainWeapon?.type
        if (weaponType === '杖') {
          multiplier = Math.abs(1500 + adjustedSTR)
        } else if (weaponType === '旋風槍') {
          multiplier = Math.abs(1000 + adjustedSTR)
        } else {
          // デフォルト（杖として扱う）
          multiplier = Math.abs(1500 + adjustedSTR)
        }

        return {
          hitNumber: 2,
          calculatedMultiplier: multiplier,
          calculatedFixedDamage: 100,
          calculationProcess: `${weaponType}:|${weaponType === '旋風槍' ? 1000 : 1500}+${adjustedSTR}| = ${multiplier}%, 固定100`
        }
      }

      default:
        throw new Error(`Invalid hit number for Danger Shake: ${hitNumber}`)
    }
  }
}
```

### 計算詳細

| 撃数 | 威力倍率 | 固定ダメージ | 計算式 |
|------|----------|--------------|--------|
| 1撃目 | 杖:\|1000+基礎STR/2\|%, 旋風槍:\|750+基礎STR/2\|% | 100 | 武器種・基礎STR依存 |
| 2撃目 | 杖:\|1500+補正後STR\|%, 旋風槍:\|1000+補正後STR\|% | 100 | 武器種・補正後STR依存 |

#### 計算例
**基礎STR: 200、補正後STR: 350の場合**
- **1撃目 杖**: |1000+floor(200/2)| = |1000+100| = 1100%, 100固定ダメージ
- **1撃目 旋風槍**: |750+floor(200/2)| = |750+100| = 850%, 100固定ダメージ  
- **2撃目 杖**: |1500+350| = 1850%, 100固定ダメージ
- **2撃目 旋風槍**: |1000+350| = 1350%, 100固定ダメージ

## UI表示仕様

### スキル選択ドロップダウン
- **表示位置**: ネクロマンサー系統グループ内、order順で最初に表示
- **表示名**: `デンジャーシェイク(前入力派生)`
- **武器種フィルタ**: 杖、旋風槍装備時のみ表示

### スキル情報表示
```
📊 デンジャーシェイク(前入力派生)
　　カテゴリ: ネクロマンサー系 | 消費MP: 100
　　威力参照: ATK | タイプ: 物理スキル
　　慣れ参照: 物理 | 慣れ付与: 物理
　　参照防御力: DEF | 参照耐性: 物理
　　距離威力: 近距離○ | 抜刀威力: × | ロングレンジ: ×

🎯 スキル威力値
　　1hit: 倍率: 杖|1000+基礎STR/2|%, 旋風槍|750+基礎STR/2|% | 固定値: 100
　　2hit: 倍率: 杖|1500+補正後STR|%, 旋風槍|1000+補正後STR|% | 固定値: 100
　　特殊効果: 2連続攻撃、武器種・STR依存威力計算
```

### 詳細情報
```
📋 詳細情報 [▼]
　　必要武器: 杖、旋風槍
　　前提スキル: なし
　　特殊効果: 2段攻撃、物理攻撃
　　計算方式: 特殊計算
　　備考: ネクロマンサー系統の2連撃物理スキル（武器種・STR依存の特殊計算）
```

## 実装ファイル更新

### 1. src/data/attackSkills.ts
既存の`attackSkillsRawData`配列に新しいスキルオブジェクトを追加

### 2. src/utils/attackSkillCalculation/AttackSkillCalculator.ts
`getCalculatorForSkill`メソッドに`danger_shake`ケースを追加

### 3. src/utils/attackSkillCalculation/calculators/DangerShakeCalculator.ts
武器種・STR依存の特殊計算を実装した専用計算機を作成

### 4. src/utils/attackSkillCalculation/calculators/index.ts
DangerShakeCalculatorのエクスポートを追加

### 5. 型定義更新
`src/types/calculator.ts`の`AttackSkillCategory`と`SystemGroup`にネクロマンサー関連の項目を追加

## 現在の実装状況

### 確定済み
- スキルデータの基本構造定義（2hit攻撃）
- UI表示の基本仕様
- 武器種要件（杖、旋風槍）
- 近距離威力適用の設定
- 攻撃タイプ（物理攻撃、DEF・物理耐性参照）
- **1撃目威力倍率**: 杖|1000+基礎STR/2|%, 旋風槍|750+基礎STR/2|%
- **2撃目威力倍率**: 杖|1500+補正後STR|%, 旋風槍|1000+補正後STR|%
- **固定ダメージ**: 両撃100固定
- **慣れ設定**: 両撃とも物理慣れ参照・付与
- **特殊計算**: DangerShakeCalculator専用計算

### 実装完了
すべての仕様が確定し、実装準備完了

## テストケース

### 基本テスト（実装後）
```typescript
describe('デンジャーシェイク Skill', () => {
  test('スキルデータの取得', () => {
    const skill = getAttackSkillById('danger_shake')
    expect(skill).toBeDefined()
    expect(skill?.name).toBe('デンジャーシェイク(前入力派生)')
    expect(skill?.mpCost).toBe(100)
    expect(skill?.weaponTypeRequirements).toEqual(['杖', '旋風槍'])
    expect(skill?.hits).toHaveLength(2)
  })
  
  
  test('1撃目の武器種・STR依存計算', () => {
    const calculator = new DangerShakeCalculator()
    const playerStats = { ...mockPlayerStats, baseSTR: 200 }
    
    // 杖装備時
    const staffResult = calculator.calculate({
      skillId: 'danger_shake',
      hitNumber: 1,
      playerStats,
      equipmentContext: { ...mockEquipmentContext, mainWeapon: { type: '杖' } }
    })
    expect(staffResult.calculatedMultiplier).toBe(1100) // |1000+floor(200/2)| = 1100
    expect(staffResult.calculatedFixedDamage).toBe(100)
    
    // 旋風槍装備時
    const spearResult = calculator.calculate({
      skillId: 'danger_shake',
      hitNumber: 1,
      playerStats,
      equipmentContext: { ...mockEquipmentContext, mainWeapon: { type: '旋風槍' } }
    })
    expect(spearResult.calculatedMultiplier).toBe(850) // |750+floor(200/2)| = 850
    expect(spearResult.calculatedFixedDamage).toBe(100)
  })
  
  test('2撃目の武器種・補正後STR依存計算', () => {
    const calculator = new DangerShakeCalculator()
    const playerStats = { ...mockPlayerStats, adjustedSTR: 350 }
    
    // 杖装備時
    const staffResult = calculator.calculate({
      skillId: 'danger_shake',
      hitNumber: 2,
      playerStats,
      equipmentContext: { ...mockEquipmentContext, mainWeapon: { type: '杖' } }
    })
    expect(staffResult.calculatedMultiplier).toBe(1850) // |1500+350| = 1850
    expect(staffResult.calculatedFixedDamage).toBe(100)
    
    // 旋風槍装備時
    const spearResult = calculator.calculate({
      skillId: 'danger_shake',
      hitNumber: 2,
      playerStats,
      equipmentContext: { ...mockEquipmentContext, mainWeapon: { type: '旋風槍' } }
    })
    expect(spearResult.calculatedMultiplier).toBe(1350) // |1000+350| = 1350
    expect(spearResult.calculatedFixedDamage).toBe(100)
  })
})
```

### 統合テスト（実装後）
```typescript
describe('デンジャーシェイク Integration', () => {
  test('AttackSkillFormでの選択', () => {
    // 杖、旋風槍装備での選択可能性テスト
    // スキル情報表示のテスト
    // 2段攻撃の表示テスト
  })
  
  
  test('計算エンジンとの連携', () => {
    const calculator = new AttackSkillCalculator()
    const playerStats = { baseSTR: 200, adjustedSTR: 350, ...mockPlayerStats }
    const equipmentContext = { ...mockEquipmentContext, mainWeapon: { type: '杖' } }
    
    const results = calculator.calculateSkill('danger_shake', playerStats, equipmentContext)
    expect(results).toHaveLength(2)
    expect(results[0].hitNumber).toBe(1)
    expect(results[0].calculatedMultiplier).toBe(1100)
    expect(results[1].hitNumber).toBe(2)
    expect(results[1].calculatedMultiplier).toBe(1850)
  })
})
```

## 実装優先度

### 実装準備完了
1. ✅ **スキルデータ追加**: `attackSkills.ts`への完全なスキルオブジェクト追加
2. ✅ **型定義更新**: ネクロマンサー系統の追加
3. ✅ **基本表示機能**: UI表示の完全実装
4. ✅ **武器種フィルタ**: 杖、旋風槍装備時のみ表示
5. ✅ **DangerShakeCalculator実装**: 完全な特殊計算ロジック
6. ✅ **慣れ設定**: 両撃とも物理慣れ参照・付与
7. ✅ **特殊計算ロジック**: 武器種判定・STR依存計算の完成

### 実装可能
1. **テスト実装**: 詳細なテストケース実装
2. **エラーハンドリング**: エッジケースの対応
3. **パフォーマンス最適化**: 計算処理の最適化
4. **ドキュメント更新**: 技術文書の更新

## 将来の拡張

### 関連スキル
- 他のネクロマンサー系スキルの追加
- 闇属性スキルのカテゴリ統一
- ネクロマンサー系統スキルのグループ化

### 計算式拡張
- 装備ボーナスの適用
- バフ効果との連携
- 敵状態による補正適用
- クリティカル計算との連携

### UI改善
- ネクロマンサー系スキルのグループ化表示
- スキル系統の視覚的区別
- 計算過程の詳細表示
- 2段攻撃の表示改善

## 備考

この仕様書はデンジャーシェイクスキルの設計書です。現在、基本構造は確定していますが、威力・固定値と慣れ設定は検証中のため保留状態です。

### 確定している特徴
1. **2連続攻撃**（2hitスキル）
2. **物理攻撃**（DEF・物理耐性を参照）
3. **近距離威力対応**（近距離威力ボーナスが適用可能）
4. **ネクロマンサー専用**として武器種制限（杖、旋風槍）

### 確定している特徴
- **1撃目威力倍率**: 杖|1000+基礎STR/2|%, 旋風槍|750+基礎STR/2|%
- **2撃目威力倍率**: 杖|1500+補正後STR|%, 旋風槍|1000+補正後STR|%
- **固定ダメージ**: 両撃100固定ダメージ
- **特殊計算**: 武器種判定・STR依存の複雑な計算式

### 完成した仕様
すべての仕様が確定し、実装可能な状態です。

**デンジャーシェイク(前入力派生)**は、武器種と基礎STR/補正後STRに依存する特殊な計算式を持つ2連撃物理スキルとして完成しました。