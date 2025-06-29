# HP・MP計算式

## 概要
キャラクターの基本的な生存力を表すHPとMPの計算式について記述する。

**重要**: 2024年統一により、AllBonusesインターフェースはEquipmentPropertiesと同じ命名規則（PascalCase + アンダースコア）を使用。例：`VIT_Rate`, `HP_Rate`, `INT_Rate`, `MP_Rate`

## 数値処理に関する重要事項

### INT()関数について
本ドキュメント内で使用される`INT(数値)`は小数点以下を元の数値より小さい整数に切り捨てる関数です。

**重要な注意点:**
- 例: INT(-2.7) = -3
- ※ステータスのINTと混同しないように注意してください

### 計算における端数処理
- **HP・MP計算**: INT()関数による切り捨て処理を2段階で実施
- **負数の切り捨て**: INT(-2.7) = -3（より小さい整数への切り捨て）
- **整数計算**: 各計算段階で小数点以下切り捨て処理が重要

## HP（ヒットポイント）計算

### 基本計算式
```
HP = INT(INT(93+(補正後VIT+22.41)*Lv/3)*(1+HP%/100))+HP固定値
```


### 詳細計算

#### 1. 補正後VIT計算
```
補正後VIT = ステータスのVIT × (1 + VIT%/100) + VIT固定値
```

**構成要素:**
- **VIT%**: 装備/プロパティとセットしてあるクリスタ、バフアイテムのVIT%の合計
- **VIT固定値**: 装備/プロパティとセットしてあるクリスタ、バフアイテムのVIT固定値の合計

**計算例:**
- ステータスのVIT: 200
- VIT%: 15% (装備+クリスタ)
- VIT固定値: 30 (装備+クリスタ)
- 補正後VIT = 200 × (1 + 15/100) + 30 = 200 × 1.15 + 30 = 230 + 30 = 260

#### 2. HP基本値計算
```
HP基本値 = INT(93 + (補正後VIT + 22.41) × Lv / 3)
```

**計算例:**
- 補正後VIT: 260
- Lv: 150
- HP基本値 = INT(93 + (260 + 22.41) × 150 / 3)
- HP基本値 = INT(93 + 282.41 × 50)
- HP基本値 = INT(93 + 14120.5)
- HP基本値 = INT(14213.5) = 14213

#### 3. HP%補正適用
```
HP%適用後 = INT(HP基本値 × (1 + HP%/100))
```

**構成要素:**
- **HP%**: 装備/プロパティとセットしてあるクリスタ、バフアイテムのHP%の合計

**計算例:**
- HP基本値: 14213
- HP%: 25% (装備+クリスタ+バフアイテム)
- HP%適用後 = INT(14213 × (1 + 25/100))
- HP%適用後 = INT(14213 × 1.25)
- HP%適用後 = INT(17766.25) = 17766

#### 4. 最終HP計算
```
最終HP = HP%適用後 + HP固定値
```

**構成要素:**
- **HP固定値**: 装備/プロパティとセットしてあるクリスタ、バフアイテムのHP固定値の合計

**計算例:**
- HP%適用後: 17766
- HP固定値: 200 (装備+クリスタ+バフアイテム)
- 最終HP = 17766 + 200 = 17966

### 完全計算例
**入力値:**
- ステータスのVIT: 200
- Lv: 150
- VIT%: 15%
- VIT固定値: 30
- HP%: 25%
- HP固定値: 200

**計算手順:**
1. 補正後VIT = 200 × (1 + 15/100) + 30 = 260
2. HP基本値 = INT(93 + (260 + 22.41) × 150 / 3) = INT(14213.5) = 14213
3. HP%適用後 = INT(14213 × (1 + 25/100)) = INT(17766.25) = 17766
4. 最終HP = 17766 + 200 = 17966

## MP（マジックポイント）計算

### 基本計算式
```
MP = INT(INT(Lv+99+TEC+補正後INT/10)*(1+MP%/100))+MP固定値
```


### 詳細計算

#### 1. 補正後INT計算
```
補正後INT = INT(基礎INT × (1 + INT%/100)) + INT固定値
```

**構成要素:**
- **INT%**: 装備/プロパティとセットしてあるクリスタ、バフアイテム、料理のINT%の合計
- **INT固定値**: 装備/プロパティとセットしてあるクリスタ、バフアイテム、料理のINT固定値の合計

**計算例:**
- 基礎INT: 150
- INT%: 20% (装備+クリスタ+バフアイテム+料理)
- INT固定値: 40 (装備+クリスタ+バフアイテム+料理)
- 補正後INT = INT(150 × (1 + 20/100)) + 40 = INT(150 × 1.2) + 40 = INT(180) + 40 = 180 + 40 = 220

#### 2. MP基本値計算
```
MP基本値 = INT(Lv + 99 + TEC + 補正後INT/10)
```

**構成要素:**
- **Lv**: ステータスのレベル（基本値、装備補正なし）
- **TEC**: ステータスのTEC（基本値、装備補正なし）
- **補正後INT**: 上記で計算した補正済みINT値

**計算例:**
- Lv: 120
- TEC: 80  
- 補正後INT: 220
- MP基本値 = INT(120 + 99 + 80 + 220/10)
- MP基本値 = INT(120 + 99 + 80 + 22)
- MP基本値 = INT(321) = 321

#### 3. 最終MP計算
```
最終MP = INT(MP基本値 × (1 + MP%/100)) + MP固定値
```

**構成要素:**
- **MP%**: 装備/プロパティとセットしてあるクリスタ、バフアイテムのMP%の合計
- **MP固定値**: 装備/プロパティとセットしてあるクリスタ、バフアイテムのMP固定値の合計

**計算例:**
- MP基本値: 321
- MP%: 30% (装備+クリスタ+バフアイテム)
- MP固定値: 100 (装備+クリスタ+バフアイテム)
- 最終MP = INT(321 × (1 + 30/100)) + 100
- 最終MP = INT(321 × 1.3) + 100
- 最終MP = INT(417.3) + 100 = 417 + 100 = 517

### 完全計算例
**入力値:**
- 基礎INT: 150
- Lv: 120
- TEC: 80
- INT%: 20%
- INT固定値: 40
- MP%: 30%
- MP固定値: 100

**計算手順:**
1. 補正後INT = INT(150 × 1.2) + 40 = 180 + 40 = 220
2. MP基本値 = INT(120 + 99 + 80 + 220/10) = INT(321) = 321
3. 最終MP = INT(321 × 1.3) + 100 = INT(417.3) + 100 = 417 + 100 = 517

## 実装における注意点

### 端数処理
- **HP計算**: INT()関数による切り捨て処理を2段階で実施
  - HP基本値計算時: `INT(93+(補正後VIT+22.41)*Lv/3)`
  - HP%適用時: `INT(HP基本値*(1+HP%/100))`
- **MP計算**: INT()関数による切り捨て処理を2段階で実施
  - MP基本値計算時: `INT(Lv+99+TEC+総INT/10)`
  - MP%適用時: `INT(MP基本値*(1+MP%/100))`

### 構成要素

#### HP計算の構成要素
**VIT%補正値の構成:**
- 装備/プロパティのVIT%補正
- セットしてあるクリスタのVIT%補正
- バフアイテムのVIT%補正
- 料理のVIT%補正

**VIT固定値の構成:**
- 装備/プロパティのVIT固定値補正
- セットしてあるクリスタのVIT固定値補正
- バフアイテムのVIT固定値補正
- 料理のVIT固定値補正

**HP%補正値の構成:**
- 装備/プロパティのHP%補正
- セットしてあるクリスタのHP%補正
- バフアイテムのHP%補正

**HP固定値の構成:**
- 装備/プロパティのHP固定値補正
- セットしてあるクリスタのHP固定値補正
- バフアイテムのHP固定値補正
- **レジスタ効果（最大HPアップ）**: `maxHpUpレベル × 10`

#### MP計算の構成要素
**INT%補正値の構成:**
- 装備/プロパティのINT%補正
- セットしてあるクリスタのINT%補正
- バフアイテムのINT%補正
- 料理のINT%補正

**INT固定値の構成:**
- 装備/プロパティのINT固定値補正
- セットしてあるクリスタのINT固定値補正
- バフアイテムのINT固定値補正
- 料理のINT固定値補正

**MP%補正値の構成:**
- 装備/プロパティのMP%補正
- セットしてあるクリスタのMP%補正
- バフアイテムのMP%補正

**MP固定値の構成:**
- 装備/プロパティのMP固定値補正
- セットしてあるクリスタのMP固定値補正
- バフアイテムのMP固定値補正
- **レジスタ効果（最大MPアップ）**: `maxMpUpレベル × 1`

## TypeScript実装例

### HP計算

```typescript
interface HPCalculationSteps {
  level: number
  baseVIT: number
  vitPercent: number
  vitFixed: number
  adjustedVIT: number
  hpBase: number
  hpPercent: number
  hpAfterPercent: number
  hpFixed: number
  finalHP: number
}

function calculateHP(
  level: number,
  baseVIT: number,
  allBonuses: AllBonuses = {}
): HPCalculationSteps {
  // 1. 補正後VIT計算
  const vitPercent = allBonuses.VIT_Rate || 0
  const vitFixed = allBonuses.VIT || 0
  const adjustedVIT = Math.floor(baseVIT * (1 + vitPercent / 100)) + vitFixed
  
  // 2. HP基本値計算
  const hpBase = Math.floor(93 + (adjustedVIT + 22.41) * level / 3)
  
  // 3. HP%適用
  const hpPercent = allBonuses.HP_Rate || 0
  const hpAfterPercent = Math.floor(hpBase * (1 + hpPercent / 100))
  
  // 4. HP固定値加算
  const hpFixed = allBonuses.HP || 0
  const finalHP = hpAfterPercent + hpFixed
  
  return {
    level,
    baseVIT,
    vitPercent,
    vitFixed,
    adjustedVIT,
    hpBase,
    hpPercent,
    hpAfterPercent,
    hpFixed,
    finalHP,
  }
}
```

### MP計算

```typescript
interface MPCalculationSteps {
  level: number
  baseINT: number
  baseTEC: number
  intPercent: number
  intFixed: number
  adjustedINT: number
  mpBase: number
  mpPercent: number
  mpAfterPercent: number
  mpFixed: number
  finalMP: number
}

function calculateMP(
  level: number,
  baseINT: number,
  baseTEC: number,
  allBonuses: AllBonuses = {}
): MPCalculationSteps {
  // 1. 補正後INT計算
  const intPercent = allBonuses.INT_Rate || 0
  const intFixed = allBonuses.INT || 0
  const adjustedINT = Math.floor(baseINT * (1 + intPercent / 100)) + intFixed
  
  // 2. MP基本値計算
  const mpBase = Math.floor(level + 99 + baseTEC + adjustedINT / 10)
  
  // 3. MP%適用
  const mpPercent = allBonuses.MP_Rate || 0
  const mpAfterPercent = Math.floor(mpBase * (1 + mpPercent / 100))
  
  // 4. MP固定値加算
  const mpFixed = allBonuses.MP || 0
  const finalMP = mpAfterPercent + mpFixed
  
  return {
    level,
    baseINT,
    baseTEC,
    intPercent,
    intFixed,
    adjustedINT,
    mpBase,
    mpPercent,
    mpAfterPercent,
    mpFixed,
    finalMP,
  }
}
```

### AllBonusesインターフェース（HP・MP関連部分）

```typescript
interface AllBonuses {
  // VIT関連
  VIT?: number            // VIT固定値の合計
  VIT_Rate?: number       // VIT%の合計
  
  // INT関連
  INT?: number            // INT固定値の合計
  INT_Rate?: number       // INT%の合計
  
  // HP関連
  HP?: number             // HP固定値の合計
  HP_Rate?: number        // HP%の合計
  
  // MP関連
  MP?: number             // MP固定値の合計
  MP_Rate?: number        // MP%の合計
  
  // 他の補正値...
}
```

## 検証データ

### HP計算検証例（新計算式）
**入力データ:**
- Lv: 230
- 基礎VIT: 255
- VIT%: 0%
- VIT固定値: 0
- HP%: 0%
- HP固定値: 0

**計算過程:**
1. 補正後VIT = 255 × (1 + 0/100) + 0 = 255
2. HP基本値 = INT(93 + (255 + 22.41) × 230 / 3) = INT(93 + 21,278.3) = INT(21,371.3) = 21,371
3. HP%適用後 = INT(21,371 × (1 + 0/100)) = INT(21,371) = 21,371
4. 最終HP = 21,371 + 0 = 21,371

**期待結果:** HP = 21,371 ✅

### MP計算検証例（新計算式）
**入力データ:**
- Lv: 230
- 基礎INT: 255
- TEC: 230
- INT%: 0%
- INT固定値: 0
- MP%: 0%
- MP固定値: 0

**計算過程:**
1. 補正後INT = INT(255 × (1 + 0/100)) + 0 = INT(255) + 0 = 255
2. MP基本値 = INT(230 + 99 + 230 + 255/10) = INT(584.5) = 584
3. MP%適用後 = INT(584 × (1 + 0/100)) = INT(584) = 584
4. 最終MP = 584 + 0 = 584

**期待結果:** MP = 584 ✅

### レジスタ効果を含むMP計算例
**入力データ:**
- Lv: 200
- 基礎INT: 300
- TEC: 150
- INT%: 15%
- INT固定値: 50
- MP%: 20%
- MP固定値: 80 (装備+クリスタ+バフアイテム)
- **maxMpUpレベル**: 30 (有効)

**計算過程:**
1. 補正後INT = INT(300 × (1 + 15/100)) + 50 = INT(345) + 50 = 395
2. MP基本値 = INT(200 + 99 + 150 + 395/10) = INT(488.5) = 488
3. MP%適用後 = INT(488 × (1 + 20/100)) = INT(585.6) = 585
4. レジスタ効果込みMP固定値 = 80 + (30 × 1) = 110
5. 最終MP = 585 + 110 = 695

**期待結果:** MP = 695 ✅ (レジスタ効果+30がMP固定値に追加)

### レジスタ効果を含むHP計算例
**入力データ:**
- Lv: 200
- 基礎VIT: 280
- VIT%: 12%
- VIT固定値: 40
- HP%: 25%
- HP固定値: 150 (装備+クリスタ+バフアイテム)
- **maxHpUpレベル**: 25 (有効)

**計算過程:**
1. 補正後VIT = 280 × (1 + 12/100) + 40 = 313.6 + 40 = 353.6
2. HP基本値 = INT(93 + (353.6 + 22.41) × 200 / 3) = INT(93 + 25,069.33) = INT(25,162.33) = 25,162
3. HP%適用後 = INT(25,162 × (1 + 25/100)) = INT(31,452.5) = 31,452
4. レジスタ効果込みHP固定値 = 150 + (25 × 10) = 400
5. 最終HP = 31,452 + 400 = 31,852

**期待結果:** HP = 31,852 ✅ (レジスタ効果+250がHP固定値に追加)

## 更新履歴

| 日付 | 更新内容 | 備考 |
|------|----------|------|
| 2024-06-23 | HP・MP計算式の初期作成 | 基本的な計算式を記述 |
| 2024-06-23 | HP計算式を正確な式に修正 | INT()関数使用、補正後VIT導入、2段階計算に変更 |
| 2024-06-23 | MP計算式を正確な式に修正 | INT()関数使用、TECとINT活用、2段階計算に変更 |
| 2025-06-28 | basic-stats.mdから分離 | HP・MP計算専用ファイルとして独立、TypeScript実装例と検証データを追加 |
| 2025-06-29 | レジスタ効果（最大HP/MPアップ）を追加 | maxHpUp（×10）とmaxMpUp（×1）のHP・MP固定値への加算方式を記述、計算例を追加 |

## 関連ドキュメント
- [基本ステータス計算式](./basic-stats.md) - 他の基本ステータス計算の詳細
- [StatusPreview機能要件](../requirements/10_status-preview-requirements.md) - 機能仕様の詳細
- [StatusPreview設計](../ui/status-preview.md) - UI設計とImplementation Guide