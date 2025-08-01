# 基礎INT属性有利補正

## 概要
メイン武器に杖または魔導具を装備している場合、基礎INTによる追加の属性有利補正が適用されます。この補正は魔法武器固有の特殊補正であり、StatusPreviewの総属性有利計算に反映されます。

**重要**: 2025年アップデートにより仕様が変更され、属性攻撃が「有利」以外でも適用されるようになりました。

## 適用条件
- **メイン武器**: 杖（Staff）または魔導具（Magic Device）を装備している場合のみ
- **対象ステータス**: 基礎INT（装備・バフなどによる補正を除く、素のINT値）
- **攻撃タイプ**: 魔法攻撃のみに適用（物理攻撃は対象外）
- **属性条件**: 
  - **確定適用**: 属性攻撃が「有(有利)」の場合
  - **2025年仕様変更**: 属性攻撃が「不利属性」の場合でも、メイン武器が杖または魔導具の場合は適用される
  - **適用なし**: 「有(その他)」「無」の場合は適用されない

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
- **属性攻撃**: 
  - **確定適用**: 有利属性攻撃時
  - **2025年仕様変更**: 不利属性攻撃時でも杖・魔導具装備時は適用
  - **適用なし**: その他・無属性攻撃時は適用されない
- **攻撃種別**: 魔法攻撃のみに適用（物理攻撃は対象外）

### 計算順序
1. **基礎属性有利**: 装備・クリスタ・料理・バフアイテムからの属性有利%
2. **属性条件判定**: 属性攻撃の状態を判定
3. **基礎INT補正**: 
   - **確定**: 有利属性の場合、基礎INT / 10 で算出される追加補正
   - **2025年仕様変更**: 不利属性の場合でも杖・魔導具装備時は適用
   - **適用なし**: その他・無属性の場合は適用されない
4. **総属性有利**: 基礎属性有利 + 基礎INT補正（適用条件に応じて）

### 制限事項
- **武器制限**: 杖・魔導具装備時のみ適用
- **ステータス制限**: 基礎INTのみが対象（補正後INTは対象外）
- **属性制限**: 
  - **確定**: 有利属性攻撃時は適用
  - **2025年仕様変更**: 不利属性攻撃時でも杖・魔導具装備時は適用
  - **適用なし**: その他・無属性攻撃時は適用されない
- **小数点処理**: INT()関数（小数点以下切り捨て）を適用

## 計算例

### 例1: 杖装備時（有利属性攻撃）
**入力値:**
- メイン武器: 杖
- 基礎INT: 200
- 装備からの属性有利: 15%
- 属性攻撃: 有(有利)

**計算手順:**
1. 属性条件判定 = 有利属性攻撃 → 適用
2. 基礎INT補正 = INT(200 / 10) = INT(20) = 20%
3. 総属性有利 = 15% + 20% = 35%
4. **最終属性有利補正: 35%**

### 例2: 魔導具装備時（有利属性攻撃）
**入力値:**
- メイン武器: 魔導具
- 基礎INT: 300
- 装備からの属性有利: 10%
- 属性攻撃: 有(有利)

**計算手順:**
1. 属性条件判定 = 有利属性攻撃 → 適用
2. 基礎INT補正 = INT(300 / 10) = INT(30) = 30%
3. 総属性有利 = 10% + 30% = 40%
4. **最終属性有利補正: 40%**

### 例3: 杖装備時（その他属性攻撃）
**入力値:**
- メイン武器: 杖
- 基礎INT: 200
- 装備からの属性有利: 15%
- 属性攻撃: 有(その他)

**計算手順:**
1. 属性条件判定 = その他属性攻撃 → 適用されない
2. 基礎INT補正 = 0%（属性条件により適用されない）
3. 総属性有利 = 15% + 0% = 15%
4. **最終属性有利補正: 15%**

### 例4: 杖装備時（無属性攻撃）
**入力値:**
- メイン武器: 杖
- 基礎INT: 200
- 装備からの属性有利: 15%
- 属性攻撃: 無

**計算手順:**
1. 属性条件判定 = 無属性攻撃 → 適用されない
2. 基礎INT補正 = 0%（属性条件により適用されない）
3. 総属性有利 = 15% + 0% = 15%
4. **最終属性有利補正: 15%**

### 例5: 杖装備時（不利属性攻撃）
**入力値:**
- メイン武器: 杖
- 基礎INT: 200
- 装備からの属性有利: 15%
- 属性攻撃: 不利属性

**計算手順:**
1. 属性条件判定 = 不利属性攻撃 + 杖装備 → 適用される（2025年仕様変更）
2. 基礎INT補正 = INT(200 / 10) = INT(20) = 20%
3. 総属性有利 = 15% + 20% = 35%
4. **最終属性有利補正: 35%**

### 例6: 片手剣装備時
**入力値:**
- メイン武器: 片手剣
- 基礎INT: 250
- 装備からの属性有利: 20%
- 属性攻撃: 有(有利)

**計算手順:**
1. 武器条件判定 = 片手剣 → 適用されない
2. 基礎INT補正 = 0%（武器条件により適用されない）
3. 総属性有利 = 20% + 0% = 20%
4. **最終属性有利補正: 20%**

## 実装仕様

### 必要な追加実装
1. **基礎INT取得**: 補正前の基礎INT値を取得する機能
2. **武器種判定**: メイン武器が杖・魔導具かどうかの判定
3. **属性状態判定**: DamagePreviewの属性攻撃設定が「有(有利)」かどうかの判定
4. **補正計算**: 基礎INT / 10 の計算機能
5. **統合計算**: StatusPreviewの総属性有利計算への統合

### TypeScript実装例
```typescript
interface INTElementAdvantageCalculationSteps {
  baseINT: number
  weaponType: WeaponType
  elementAttack: 'advantageous' | 'other' | 'none' | 'disadvantageous'
  isWeaponApplicable: boolean
  isElementApplicable: boolean
  isApplicable: boolean
  intElementAdvantage: number
  baseElementAdvantage: number
  totalElementAdvantage: number
  note?: string
}

function calculateINTElementAdvantage(
  baseINT: number,
  weaponType: WeaponType,
  elementAttack: 'advantageous' | 'other' | 'none' | 'disadvantageous',
  baseElementAdvantage: number = 0
): INTElementAdvantageCalculationSteps {
  // 1. 武器条件判定
  const isWeaponApplicable = weaponType === '杖' || weaponType === '魔導具'
  
  // 2. 属性条件判定（2025年アップデート後の仕様変更対応）
  let isElementApplicable: boolean
  let note: string | undefined
  
  switch (elementAttack) {
    case 'advantageous':
      isElementApplicable = true // 確定適用
      break
    case 'disadvantageous':
      // 2025年仕様変更: 不利属性でも杖・魔導具装備時は適用
      isElementApplicable = isWeaponApplicable
      if (isWeaponApplicable) {
        note = '2025年仕様変更により不利属性でも杖・魔導具装備時は適用'
      }
      break
    case 'other':
    case 'none':
      isElementApplicable = false // 適用されない
      break
    default:
      isElementApplicable = false
  }
  
  // 3. 総合適用可否判定
  const isApplicable = isWeaponApplicable && isElementApplicable
  
  // 4. 基礎INT補正計算
  const intElementAdvantage = isApplicable ? Math.floor(baseINT / 10) : 0
  
  // 5. 総属性有利計算
  const totalElementAdvantage = baseElementAdvantage + intElementAdvantage
  
  return {
    baseINT,
    weaponType,
    elementAttack,
    isWeaponApplicable,
    isElementApplicable,
    isApplicable,
    intElementAdvantage,
    baseElementAdvantage,
    totalElementAdvantage,
    note,
  }
}
```

## 検証データ

### テスト条件
- レベル: 200
- 基礎INT: 250
- 装備属性有利: 20%

### 期待結果（属性攻撃：有(有利)）
| 武器種 | 基礎INT補正 | 総属性有利 | 状態 |
|--------|-------------|------------|------|
| 杖 | 25% | 45% | 🔄 |
| 魔導具 | 25% | 45% | 🔄 |
| 片手剣 | 0% | 20% | 🔄 |

### 期待結果（属性攻撃：有(その他)）
| 武器種 | 基礎INT補正 | 総属性有利 | 状態 |
|--------|-------------|------------|------|
| 杖 | 0% | 20% | 🔄 |
| 魔導具 | 0% | 20% | 🔄 |
| 片手剣 | 0% | 20% | 🔄 |

### 期待結果（属性攻撃：無）
| 武器種 | 基礎INT補正 | 総属性有利 | 状態 |
|--------|-------------|------------|------|
| 杖 | 0% | 20% | 🔄 |
| 魔導具 | 0% | 20% | 🔄 |
| 片手剣 | 0% | 20% | 🔄 |

### 期待結果（属性攻撃：不利属性）- 2025年仕様変更
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
- [ ] 属性状態判定機能（DamagePreview連携）
- [ ] 計算関数実装（仕様変更対応）
- [ ] StatusPreview統合
- [ ] DamagePreview統合
- [ ] 仕様調査（その他・無・不利属性での適用可否）
- [ ] テストケース作成

## 注意事項

1. **基礎ステータス**: 装備・バフ補正を除いた基礎値のみが対象
2. **武器制限**: 杖・魔導具以外では適用されない
3. **属性制限**: 
   - **確定**: 有利属性攻撃時は適用
   - **2025年仕様変更**: 不利属性攻撃時でも杖・魔導具装備時は適用
   - **適用なし**: その他・無属性攻撃時は適用されない
4. **魔法攻撃限定**: 魔法攻撃のみに適用される特殊補正（物理攻撃は対象外）
5. **UI連携**: DamagePreviewの属性攻撃設定とStatusPreviewの総属性有利表示が連動
6. **仕様変更対応**: 2025年アップデートにより不利属性でも杖・魔導具装備時は適用されるように変更

## 関連ドキュメント

- [基本ステータス計算](./basic-stats.md) - 基礎ステータスの計算方法
- [MATK計算](./matk-calculation.md) - 魔法攻撃力計算
- [ダメージ計算](./damage-calculation.md) - 全体的なダメージ計算フロー
- [計算式概要](./overview.md) - 計算システム全体の概要

## 更新履歴

| 日付 | 更新者 | 更新内容 |
|------|--------|----------|
| 2025-07-27 | Claude | 初版作成（詳細仕様待ち） |
| 2025-07-27 | Claude | 仕様変更対応（2025年アップデート後の適用条件変更を反映） |

## 待機事項

以下の詳細仕様の調査・提供をお待ちしています：

1. **適用タイミング**: 他の補正との計算順序
2. **特殊条件**: 特定の条件下での動作変更の有無