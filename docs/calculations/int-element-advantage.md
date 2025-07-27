# 基礎INT属性有利補正

## 概要
メイン武器に杖または魔導具を装備している場合、基礎INTによる追加の属性有利補正が適用されます。この補正は魔法武器固有の特殊補正であり、他の武器種では適用されません。

## 適用条件
- **メイン武器**: 杖（Staff）または魔導具（Magic Device）を装備している場合のみ
- **対象ステータス**: 基礎INT（装備・バフなどによる補正を除く、素のINT値）
- **攻撃タイプ**: 魔法攻撃のみに適用（物理攻撃は対象外）

## 計算式

### 基本計算式
```
基礎INT属性有利補正(%) = 基礎INT / 10
```

### 武器種別適用条件
| 武器種 | 適用可否 | 補正式 |
|--------|----------|--------|
| 杖 | ✓ | 基礎INT / 10 |
| 魔導具 | ✓ | 基礎INT / 10 |
| その他 | ✗ | 適用されない |

## 詳細仕様

### 適用範囲
- **基礎INT**: 装備・クリスタ・料理・バフアイテムによる補正を除いた素のINT値を使用
- **属性攻撃**: 全ての属性攻撃（火・水・風・土・光・闇・無）に適用
- **攻撃種別**: 魔法攻撃のみに適用（物理攻撃は対象外）

### 計算順序
1. **基礎属性有利**: 装備・クリスタ・料理・バフアイテムからの属性有利%
2. **基礎INT補正**: 基礎INT / 10 で算出される追加補正
3. **総属性有利**: 基礎属性有利 + 基礎INT補正

### 制限事項
- **武器制限**: 杖・魔導具装備時のみ適用
- **ステータス制限**: 基礎INTのみが対象（補正後INTは対象外）
- **小数点処理**: INT()関数（小数点以下切り捨て）を適用

## 計算例

### 例1: 杖装備時
**入力値:**
- メイン武器: 杖
- 基礎INT: 200
- 装備からの属性有利: 15%

**計算手順:**
1. 基礎INT補正 = INT(200 / 10) = INT(20) = 20%
2. 総属性有利 = 15% + 20% = 35%
3. **最終属性有利補正: 35%**

### 例2: 魔導具装備時
**入力値:**
- メイン武器: 魔導具
- 基礎INT: 300
- 装備からの属性有利: 10%

**計算手順:**
1. 基礎INT補正 = INT(300 / 10) = INT(30) = 30%
2. 総属性有利 = 10% + 30% = 40%
3. **最終属性有利補正: 40%**

### 例3: 片手剣装備時
**入力値:**
- メイン武器: 片手剣
- 基礎INT: 250
- 装備からの属性有利: 20%

**計算手順:**
1. 基礎INT補正 = 0%（適用されない）
2. 総属性有利 = 20% + 0% = 20%
3. **最終属性有利補正: 20%**

## 実装仕様

### 必要な追加実装
1. **基礎INT取得**: 補正前の基礎INT値を取得する機能
2. **武器種判定**: メイン武器が杖・魔導具かどうかの判定
3. **補正計算**: 基礎INT / 10 の計算機能
4. **統合計算**: 既存の属性有利計算への統合

### TypeScript実装例
```typescript
interface INTElementAdvantageCalculationSteps {
  baseINT: number
  weaponType: WeaponType
  isApplicable: boolean
  intElementAdvantage: number
  baseElementAdvantage: number
  totalElementAdvantage: number
}

function calculateINTElementAdvantage(
  baseINT: number,
  weaponType: WeaponType,
  baseElementAdvantage: number = 0
): INTElementAdvantageCalculationSteps {
  // 1. 適用可否判定
  const isApplicable = isINTElementAdvantageApplicable(weaponType)
  
  // 2. 基礎INT補正計算
  const intElementAdvantage = isApplicable ? Math.floor(baseINT / 10) : 0
  
  // 3. 総属性有利計算
  const totalElementAdvantage = baseElementAdvantage + intElementAdvantage
  
  return {
    baseINT,
    weaponType,
    isApplicable,
    intElementAdvantage,
    baseElementAdvantage,
    totalElementAdvantage,
  }
}

function isINTElementAdvantageApplicable(weaponType: WeaponType): boolean {
  return weaponType === '杖' || weaponType === '魔導具'
}
```

## 検証データ

### テスト条件
- レベル: 200
- 基礎INT: 250
- 装備属性有利: 20%

### 期待結果
| 武器種 | 基礎INT補正 | 総属性有利 | 状態 |
|--------|-------------|------------|------|
| 杖 | 25% | 45% | 🔄 |
| 魔導具 | 25% | 45% | 🔄 |
| 片手剣 | 0% | 20% | 🔄 |

**凡例:**
- ✅: 検証済み（正確）
- 🔄: 検証待ち
- ❌: 要修正

## 実装状況

- [ ] 基礎INT取得機能
- [ ] 武器種判定機能
- [ ] 補正係数定義
- [ ] 計算関数実装
- [ ] 既存システムへの統合
- [ ] テストケース作成

## 注意事項

1. **基礎ステータス**: 装備・バフ補正を除いた基礎値のみが対象
2. **武器制限**: 杖・魔導具以外では適用されない
3. **魔法攻撃限定**: 魔法攻撃のみに適用される特殊補正（物理攻撃は対象外）
4. **既存システム**: 現在の属性有利計算に追加される形で実装

## 関連ドキュメント

- [基本ステータス計算](./basic-stats.md) - 基礎ステータスの計算方法
- [MATK計算](./matk-calculation.md) - 魔法攻撃力計算
- [ダメージ計算](./damage-calculation.md) - 全体的なダメージ計算フロー
- [計算式概要](./overview.md) - 計算システム全体の概要

## 更新履歴

| 日付 | 更新者 | 更新内容 |
|------|--------|----------|
| 2025-07-27 | Claude | 初版作成（詳細仕様待ち） |

## 待機事項

以下の詳細仕様の提供をお待ちしています：

1. **補正係数**: 杖・魔導具それぞれの正確な補正係数
2. **上限制限**: 基礎INT補正に上限があるかどうか
3. **適用タイミング**: 他の補正との計算順序
4. **特殊条件**: 特定の条件下での動作変更の有無