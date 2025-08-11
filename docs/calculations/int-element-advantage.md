# 基礎INT属性有利補正

## 概要
基礎INTによる追加の属性有利補正は武器種により異なる計算方式が適用されます。杖・魔導具では特殊な補正計算が行われ、その他の武器種では標準的な弱点属性補正が適用されます。

**重要**: 2025年アップデートにより仕様が変更され、属性攻撃が「有利」以外でも適用されるようになりました。

## 適用条件

### 杖・魔導具装備時の特殊補正
- **メイン武器**: 杖（Staff）または魔導具（Magic Device）を装備している場合
- **対象ステータス**: 基礎INT（装備・バフなどによる補正を除く、素のINT値）
- **攻撃タイプ**: 魔法攻撃のみに適用（物理攻撃は対象外）
- **属性条件**: 
  - **適用**: 属性攻撃が「有(有利)」「有(その他)」「不利属性」の場合
  - **適用なし**: 「無」の場合は適用されない

### その他武器種の標準的弱点属性補正
- **メイン武器**: 杖・魔導具以外の全ての武器種
- **対象ステータス**: 基礎INT（装備・バフなどによる補正を除く、素のINT値）
- **攻撃タイプ**: 魔法攻撃のみに適用（物理攻撃は対象外）
- **属性条件**: 攻撃が「有(有利)」の場合のみ適用

## 計算式

### 杖・魔導具装備時の計算式
```
基礎INT属性有利補正(%) = 攻撃が属性攻撃の場合、+基礎INT/10
（有(有利)・有(その他)・不利属性すべてで適用、無属性のみ適用されない）
```

### その他武器種の計算式
```
基礎INT属性有利補正(%) = 攻撃が有(有利)の場合、+基礎INT/10
```

**注意事項:**
- +25の属性覚醒効果は既に別途実装済み（重複実装注意）
- 属性有利プロパティも既に実装済み
- 基礎INT属性有利補正は+基礎INT/10の部分のみが対象



## 詳細仕様

### 適用範囲
- **基礎INT**: 装備・クリスタ・料理・バフアイテムによる補正を除いた素のINT値を使用
- **属性攻撃**: 
  - **杖・魔導具**: 有利・その他・不利属性攻撃時に適用、無属性のみ適用されない
  - **その他武器種**: 有(有利)攻撃時のみ適用
- **攻撃種別**: 魔法攻撃のみに適用（物理攻撃は対象外）

### 計算順序
1. **基礎属性有利**: 装備・クリスタ・料理・バフアイテムからの属性有利%（既存実装）
2. **武器種判定**: メイン武器が杖・魔導具かその他武器種かを判定
3. **属性条件判定**: 属性攻撃の状態を判定
4. **基礎INT補正**: 
   - **杖・魔導具**: 属性攻撃時（有利・その他・不利）に基礎INT / 10 を適用
   - **その他武器種**: 有(有利)攻撃時のみ基礎INT / 10 を適用
5. **総属性有利**: 基礎属性有利 + 基礎INT補正（適用条件に応じて）

### 制限事項
- **ステータス制限**: 基礎INTのみが対象（補正後INTは対象外）
- **武器種別制限**: 
  - **杖・魔導具**: 属性攻撃時（有利・その他・不利）のみ適用、無属性は適用されない
  - **その他武器種**: 有(有利)攻撃時のみ適用
- **攻撃種別制限**: 魔法攻撃のみが対象（物理攻撃は対象外）
- **小数点処理**: INT()関数（小数点以下切り捨て）を適用

## 計算例

### 例1: 杖装備時（有利属性攻撃）
**入力値:**
- メイン武器: 杖
- 基礎INT: 200
- 属性攻撃: 有(有利)

**計算手順:**
1. 属性条件判定 = 有利属性（無属性以外） → 適用
2. 基礎INT属性有利補正 = INT(200 / 10) = 20%
3. **基礎INT属性有利補正: 20%**

### 例2: 魔導具装備時（有利属性攻撃）
**入力値:**
- メイン武器: 魔導具
- 基礎INT: 300
- 属性攻撃: 有(有利)

**計算手順:**
1. 属性条件判定 = 有利属性（無属性以外） → 適用
2. 基礎INT属性有利補正 = INT(300 / 10) = 30%
3. **基礎INT属性有利補正: 30%**

### 例3: 杖装備時（その他属性攻撃）
**入力値:**
- メイン武器: 杖
- 基礎INT: 200
- 属性攻撃: 有(その他)

**計算手順:**
1. 属性条件判定 = その他属性（無属性以外） → 適用
2. 基礎INT属性有利補正 = INT(200 / 10) = 20%
3. **基礎INT属性有利補正: 20%**

### 例4: 杖装備時（無属性攻撃）
**入力値:**
- メイン武器: 杖
- 基礎INT: 200
- 属性攻撃: 無

**計算手順:**
1. 属性条件判定 = 無属性 → 適用されない
2. 基礎INT属性有利補正 = 0%
3. **基礎INT属性有利補正: 0%**

### 例5: 杖装備時（不利属性攻撃）
**入力値:**
- メイン武器: 杖
- 基礎INT: 200
- 属性攻撃: 不利属性

**計算手順:**
1. 属性条件判定 = 不利属性（無属性以外） → 適用
2. 基礎INT属性有利補正 = INT(200 / 10) = 20%
3. **基礎INT属性有利補正: 20%**

### 例6: 片手剣装備時（有(有利)攻撃）
**入力値:**
- メイン武器: 片手剣
- 基礎INT: 200
- 属性攻撃: 有(有利)

**計算手順:**
1. 武器条件判定 = 片手剣 → その他武器種
2. 属性条件判定 = 有(有利)攻撃 → 適用
3. 基礎INT属性有利補正 = INT(200 / 10) = 20%
4. **基礎INT属性有利補正: 20%**

### 例7: 両手剣装備時（有(有利)攻撃）
**入力値:**
- メイン武器: 両手剣
- 基礎INT: 150
- 属性攻撃: 有(有利)

**計算手順:**
1. 武器条件判定 = 両手剣 → その他武器種
2. 属性条件判定 = 有(有利)攻撃 → 適用
3. 基礎INT属性有利補正 = INT(150 / 10) = 15%
4. **基礎INT属性有利補正: 15%**

### 例8: 片手剣装備時（その他属性攻撃）
**入力値:**
- メイン武器: 片手剣
- 基礎INT: 200
- 属性攻撃: 有(その他)

**計算手順:**
1. 武器条件判定 = 片手剣 → その他武器種
2. 属性条件判定 = その他属性（有(有利)でない）→ 適用されない
3. 基礎INT属性有利補正 = 0%
4. **基礎INT属性有利補正: 0%**

## 実装仕様

### 必要な追加実装
1. **基礎INT取得**: 補正前の基礎INT値を取得する機能
2. **武器種判定**: メイン武器が杖・魔導具かどうかの判定
3. **属性状態判定**: DamagePreviewの属性攻撃設定が「有(有利)」かどうかの判定
4. **補正計算**: 基礎INT / 10 の計算機能
5. **統合計算**: StatusPreviewの総属性有利計算への統合

### TypeScript実装例

#### 基礎INT属性有利補正計算関数
```typescript
interface INTElementAdvantageCalculationSteps {
  baseINT: number
  weaponType: WeaponType
  elementAttack: 'advantageous' | 'other' | 'none' | 'disadvantageous'
  isWeaponStaffOrMagicDevice: boolean
  isElementApplicable: boolean
  intElementAdvantage: number
  calculationType: 'staff_magic_device' | 'standard_weapon'
}

function calculateINTElementAdvantage(
  baseINT: number,
  weaponType: WeaponType,
  elementAttack: 'advantageous' | 'other' | 'none' | 'disadvantageous'
): INTElementAdvantageCalculationSteps {
  // 1. 武器種別判定
  const isWeaponStaffOrMagicDevice = weaponType === '杖' || weaponType === '魔導具'
  const calculationType: 'staff_magic_device' | 'standard_weapon' = isWeaponStaffOrMagicDevice 
    ? 'staff_magic_device' 
    : 'standard_weapon'
  
  // 2. 基礎INT属性有利補正計算（+基礎INT/10の部分のみ）
  let intElementAdvantage = 0
  let isElementApplicable = false

  if (isWeaponStaffOrMagicDevice) {
    // 杖・魔導具の場合: 属性攻撃すべてで適用（有利・その他・不利）
    if (elementAttack !== 'none') {
      intElementAdvantage = Math.floor(baseINT / 10)
      isElementApplicable = true
    }
  } else {
    // その他武器種の場合: 有(有利)攻撃のみで適用
    if (elementAttack === 'advantageous') {
      intElementAdvantage = Math.floor(baseINT / 10)
      isElementApplicable = true
    }
  }
  
  return {
    baseINT,
    weaponType,
    elementAttack,
    isWeaponStaffOrMagicDevice,
    isElementApplicable,
    intElementAdvantage,
    calculationType,
  }
}
```

#### 個別実装例（参考）

**杖・魔導具専用実装:**
```typescript
function calculateStaffMagicDeviceINTAdvantage(
  baseINT: number,
  elementAttack: 'advantageous' | 'other' | 'none' | 'disadvantageous'
): number {
  // 属性攻撃の場合、+基礎INT/10（有利・その他・不利すべて適用）
  if (elementAttack !== 'none') {
    return Math.floor(baseINT / 10)
  }
  return 0
}
```

**その他武器種専用実装:**
```typescript
function calculateStandardWeaponINTAdvantage(
  baseINT: number,
  elementAttack: 'advantageous' | 'other' | 'none' | 'disadvantageous'
): number {
  // 有(有利)攻撃の場合のみ、+基礎INT/10
  if (elementAttack === 'advantageous') {
    return Math.floor(baseINT / 10)
  }
  return 0
}
```


## 実装状況

- [ ] 基礎INT取得機能
- [ ] 武器種判定機能（杖・魔導具 vs その他武器種）
- [ ] 属性状態判定機能（DamagePreview連携）
- [ ] 基礎INT属性有利補正計算関数実装
- [ ] StatusPreview統合（既存の総属性有利計算に統合）
- [ ] テストケース作成

## 注意事項

1. **基礎ステータス**: 装備・バフ補正を除いた基礎値のみが対象
2. **武器種別の違い**: 
   - **杖・魔導具**: 属性攻撃で適用（有利・その他・不利すべて、無属性のみ除外）
   - **その他武器種**: 有(有利)攻撃のみで適用
3. **補正内容**: +基礎INT/10の部分のみ（+25の属性覚醒や属性有利プロパティは別途実装済み）
4. **魔法攻撃限定**: 魔法攻撃のみに適用される特殊補正（物理攻撃は対象外）
5. **UI連携**: DamagePreviewの属性攻撃設定との連携が必要
6. **重複実装注意**: 属性覚醒(+25)と属性有利プロパティは既存実装との重複に注意

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