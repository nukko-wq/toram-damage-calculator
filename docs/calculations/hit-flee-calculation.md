# HIT・FLEE計算

## 概要
HIT（命中）とFLEE（回避率）の計算式について記述します。これらは戦闘における命中・回避の判定に使用される重要なステータスです。

**重要**: 2024年統一により、AllBonusesインターフェースはEquipmentPropertiesと同じ命名規則（PascalCase + アンダースコア）を使用。例：`Accuracy_Rate`, `Dodge_Rate`

## 数値処理に関する重要事項

### INT()関数について
本ドキュメント内で使用される`INT(数値)`は小数点以下を元の数値より小さい整数に切り捨てる関数です。

**重要な注意点:**
- 例: INT(-2.7) = -3
- ※ステータスのINTと混同しないように注意してください

## HIT（命中）計算

### 基本計算式
```
HIT = INT((Lv+総DEX)×(1+命中%/100))+命中固定値
```

### 詳細計算

#### 構成要素
- **Lv**: ステータスのレベル
- **総DEX**: 補正後ステータスのDEX（装備・クリスタ・バフアイテム・料理補正を含む）
- **命中%**: 装備/プロパティ、クリスタ、バフアイテムの命中%(Accuracy_Rate)の合計
- **命中固定値**: 装備/プロパティ、クリスタ、料理（しょうゆラーメン）、バフアイテムの命中固定値(Accuracy)の合計

#### 計算手順
1. **総DEX取得**: 補正後ステータスのDEX値を使用
2. **レベル加算**: Lv + 総DEX
3. **命中%適用**: INT((Lv + 総DEX) × (1 + 命中%/100))
4. **命中固定値加算**: %適用後 + 命中固定値

### 計算例

#### 例1: 標準的なケース
**入力値:**
- Lv: 150
- 総DEX: 250 (補正後ステータス)
- 命中%: 20% (装備+クリスタ+バフアイテム)
- 命中固定値: 30 (装備+クリスタ+料理+バフアイテム)

**計算手順:**
1. Lv + 総DEX = 150 + 250 = 400
2. 命中%適用後 = INT(400 × (1 + 20/100)) = INT(400 × 1.20) = INT(480) = 480
3. 最終HIT = 480 + 30 = 510

#### 例2: 高DEXケース
**入力値:**
- Lv: 200
- 総DEX: 350
- 命中%: 35%
- 命中固定値: 50

**計算手順:**
1. Lv + 総DEX = 200 + 350 = 550
2. 命中%適用後 = INT(550 × (1 + 35/100)) = INT(550 × 1.35) = INT(742.5) = 742
3. 最終HIT = 742 + 50 = 792

#### 例3: 低DEXケース
**入力値:**
- Lv: 100
- 総DEX: 150
- 命中%: 10%
- 命中固定値: 15

**計算手順:**
1. Lv + 総DEX = 100 + 150 = 250
2. 命中%適用後 = INT(250 × (1 + 10/100)) = INT(250 × 1.10) = INT(275) = 275
3. 最終HIT = 275 + 15 = 290

### 構成要素

**命中%の構成:**
- 装備/プロパティの命中%(Accuracy_Rate)補正
- クリスタの命中%(Accuracy_Rate)補正
- バフアイテムの命中%(Accuracy_Rate)補正
- **除外**: 料理には命中%補正はありません

**命中固定値の構成:**
- 装備/プロパティの命中固定値(Accuracy)補正
- クリスタの命中固定値(Accuracy)補正
- 料理の命中固定値(Accuracy)補正（例：しょうゆラーメン）
- バフアイテムの命中固定値(Accuracy)補正

### 重要な制限事項

1. **補正後DEX使用**: 基礎DEXではなく、全補正を適用した補正後ステータスのDEXを使用
2. **料理の特殊性**: 料理には命中%補正はないが、命中固定値補正は存在する
3. **整数計算**: INT()関数による切り捨て処理が重要

## FLEE（回避率）計算

### 基本計算式
```
FLEE = INT(基礎FLEE × (1 + 回避%/100)) + 回避固定値
```

### 基礎FLEE計算（体装備とArmorTypeに依存）

体装備の状態とArmorTypeによって基礎FLEE計算式が変わります：

#### 体装備なし
```
基礎FLEE = INT(75 + Lv × 3/2 + 補正後AGI × 2)
```

#### 体装備あり（通常）
```
基礎FLEE = INT(Lv + 補正後AGI)
```

#### 体装備あり（軽量化）
```
基礎FLEE = INT(30 + Lv × 5/4 + 補正後AGI × 7/4)
```

#### 体装備あり（重量化）
```
基礎FLEE = INT(-15 + Lv/2 + 補正後AGI × 3/4)
```

### 詳細計算

#### 構成要素
- **基礎FLEE**: 体装備の状態とArmorTypeに応じた計算式で算出
- **補正後AGI**: `INT(基礎AGI × (1 + AGI%/100)) + AGI固定値`
- **回避%**: 装備/プロパティ、クリスタ、バフアイテムのDodge_Rate補正の合計
- **回避固定値**: 装備/プロパティ、クリスタ、バフアイテムのDodge補正の合計

**注意点**: 料理からの回避補正は存在しません。

#### 計算例1（体装備なし）
**入力値:**
- レベル: 200
- 補正後AGI: 300
- 回避%: 20% (装備+クリスタ+バフアイテム)
- 回避固定値: 50 (装備+クリスタ+バフアイテム)

**計算手順:**
1. 基礎FLEE = INT(75 + 200 × 3/2 + 300 × 2) = INT(75 + 300 + 600) = INT(975) = 975
2. 回避%適用後 = INT(975 × (1 + 20/100)) = INT(975 × 1.2) = INT(1170) = 1170
3. 最終FLEE = 1170 + 50 = 1220

#### 計算例2（体装備あり・軽量化）
**入力値:**
- レベル: 200
- 補正後AGI: 300
- 回避%: 15% (装備+クリスタ+バフアイテム)
- 回避固定値: 30 (装備+クリスタ+バフアイテム)

**計算手順:**
1. 基礎FLEE = INT(30 + 200 × 5/4 + 300 × 7/4) = INT(30 + 250 + 525) = INT(805) = 805
2. 回避%適用後 = INT(805 × (1 + 15/100)) = INT(805 × 1.15) = INT(925.75) = 925
3. 最終FLEE = 925 + 30 = 955

#### 計算例3（体装備あり・重量化）
**入力値:**
- レベル: 150
- 補正後AGI: 250
- 回避%: 10%
- 回避固定値: 20

**計算手順:**
1. 基礎FLEE = INT(-15 + 150/2 + 250 × 3/4) = INT(-15 + 75 + 187.5) = INT(247.5) = 247
2. 回避%適用後 = INT(247 × (1 + 10/100)) = INT(247 × 1.10) = INT(271.7) = 271
3. 最終FLEE = 271 + 20 = 291

#### 計算例4（体装備あり・通常）
**入力値:**
- レベル: 180
- 補正後AGI: 280
- 回避%: 25%
- 回避固定値: 40

**計算手順:**
1. 基礎FLEE = INT(180 + 280) = INT(460) = 460
2. 回避%適用後 = INT(460 × (1 + 25/100)) = INT(460 × 1.25) = INT(575) = 575
3. 最終FLEE = 575 + 40 = 615

### 構成要素

**回避%の構成:**
- 装備/プロパティの回避%(Dodge_Rate)補正
- クリスタの回避%(Dodge_Rate)補正
- バフアイテムの回避%(Dodge_Rate)補正
- **除外**: 料理には回避%補正はありません

**回避固定値の構成:**
- 装備/プロパティの回避固定値(Dodge)補正
- クリスタの回避固定値(Dodge)補正
- バフアイテムの回避固定値(Dodge)補正
- **除外**: 料理には回避固定値補正はありません

### TypeScript実装例

```typescript
interface FLEECalculationSteps {
  level: number
  adjustedAGI: number
  baseFLEE: number
  dodgePercent: number
  fleeAfterPercent: number
  dodgeFixed: number
  finalFLEE: number
}

function calculateFLEE(
  level: number,
  adjustedAGI: number,
  hasBodyEquipment: boolean,
  armorType: ArmorType = 'normal',
  allBonuses: AllBonuses = {}
): FLEECalculationSteps {
  // 1. 基礎FLEE計算（体装備状態とArmorTypeに依存）
  let baseFLEE: number
  
  if (!hasBodyEquipment) {
    // 体装備なし
    baseFLEE = Math.floor(75 + level * 3/2 + adjustedAGI * 2)
  } else {
    // 体装備あり
    switch (armorType) {
      case 'light':
        // 軽量化
        baseFLEE = Math.floor(30 + level * 5/4 + adjustedAGI * 7/4)
        break
      case 'heavy':
        // 重量化
        baseFLEE = Math.floor(-15 + level/2 + adjustedAGI * 3/4)
        break
      case 'normal':
      default:
        // 通常
        baseFLEE = Math.floor(level + adjustedAGI)
        break
    }
  }
  
  // 2. 回避%適用
  const dodgePercent = allBonuses.Dodge_Rate || 0
  const fleeAfterPercent = Math.floor(baseFLEE * (1 + dodgePercent / 100))
  
  // 3. 回避固定値加算
  const dodgeFixed = allBonuses.Dodge || 0
  const finalFLEE = fleeAfterPercent + dodgeFixed
  
  return {
    level,
    adjustedAGI,
    baseFLEE,
    dodgePercent,
    fleeAfterPercent,
    dodgeFixed,
    finalFLEE,
  }
}

interface HITCalculationSteps {
  level: number
  adjustedDEX: number
  baseHIT: number
  accuracyPercent: number
  hitAfterPercent: number
  accuracyFixed: number
  finalHIT: number
}

function calculateHIT(
  level: number,
  adjustedDEX: number,
  allBonuses: AllBonuses = {}
): HITCalculationSteps {
  // 1. 基本HIT計算
  const baseHIT = level + adjustedDEX
  
  // 2. 命中%適用
  const accuracyPercent = allBonuses.Accuracy_Rate || 0
  const hitAfterPercent = Math.floor(baseHIT * (1 + accuracyPercent / 100))
  
  // 3. 命中固定値加算
  const accuracyFixed = allBonuses.Accuracy || 0
  const finalHIT = hitAfterPercent + accuracyFixed
  
  return {
    level,
    adjustedDEX,
    baseHIT,
    accuracyPercent,
    hitAfterPercent,
    accuracyFixed,
    finalHIT,
  }
}
```

## 重要な制限事項

### HIT計算の制限事項
1. **補正後DEX使用**: 基礎DEXではなく、全補正を適用した補正後ステータスのDEXを使用
2. **料理の特殊性**: 料理には命中%補正はないが、命中固定値補正は存在する
3. **整数計算**: INT()関数による切り捨て処理が重要

### FLEE計算の制限事項
1. **体装備状態依存**: 体装備の有無とArmorTypeにより基礎FLEE計算式が大きく変わる
2. **補正後AGI使用**: 基礎AGIではなく、全補正を適用した補正後ステータスのAGIを使用
3. **料理除外**: 料理からの回避補正（%・固定値とも）は存在しない
4. **整数計算**: 2段階のINT()関数による切り捨て処理が重要

## 更新履歴

| 日付 | 更新内容 | 備考 |
|------|----------|------|
| 2024-06-25 | HIT（命中）計算式を追加 | INT()関数使用、Lv+補正後DEX依存、料理固定値対応 |
| 2025-06-28 | FLEE（回避率）計算式を追加 | 体装備状態とArmorType依存、4種類の基礎FLEE計算式、INT関数使用、2段階計算、料理除外 |
| 2025-07-01 | basic-stats.mdから分離 | 専用ファイルとして独立、TypeScript実装例を追加 |

## 関連ドキュメント
- [基本ステータス計算式](./basic-stats.md) - その他の基本ステータス計算
- [計算式概要](./overview.md)