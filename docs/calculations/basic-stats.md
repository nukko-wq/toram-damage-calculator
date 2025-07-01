# 基本ステータス計算式

## 概要
補正後基本ステータス（STR/INT/VIT/AGI/DEX）の計算式と、その他の基本ステータス計算式について記述する。HP・MP計算と速度系計算（ASPD・CSPD・行動速度）については専用ドキュメントを参照してください。

**重要**: 2024年統一により、AllBonusesインターフェースはEquipmentPropertiesと同じ命名規則（PascalCase + アンダースコア）を使用。例：`STR_Rate`, `HP_Rate`, `AttackMPRecovery_Rate`

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

## 補正後基本ステータス計算

### STR（筋力）
```
補正後STR = INT(基礎STR × (1 + STR%/100)) + STR固定値
```

### INT（知力）
```
補正後INT = INT(基礎INT × (1 + INT%/100)) + INT固定値
```

### VIT（体力）
```
補正後VIT = INT(基礎VIT × (1 + VIT%/100)) + VIT固定値
```

### AGI（敏捷）
```
補正後AGI = INT(基礎AGI × (1 + AGI%/100)) + AGI固定値
```

### DEX（器用）
```
補正後DEX = INT(基礎DEX × (1 + DEX%/100)) + DEX固定値
```

### 計算例（STR）
**入力値:**
- 基礎STR: 200
- STR%: 15% (装備+クリスタ+バフアイテム)
- STR固定値: 30 (装備+クリスタ+バフアイテム)

**計算手順:**
1. 基礎STR × (1 + STR%/100) = 200 × (1 + 15/100) = 200 × 1.15 = 230
2. INT(230) = 230
3. 補正後STR = 230 + 30 = 260

### 構成要素
**%補正値の構成:**
- 装備/プロパティのステータス%補正
- セットしてあるクリスタのステータス%補正
- バフアイテムのステータス%補正
- 料理のステータス%補正

**固定値の構成:**
- 装備/プロパティのステータス固定値補正
- セットしてあるクリスタのステータス固定値補正
- バフアイテムのステータス固定値補正
- 料理のステータス固定値補正

## HP・MP計算

HP（ヒットポイント）とMP（マジックポイント）の計算については、専用ドキュメントを参照してください。

**詳細**: [HP・MP計算式](./hp-mp-calculation.md)

**概要**:
- **HP計算**: `HP = INT(INT(93+(補正後VIT+22.41)*Lv/3)*(1+HP%/100))+HP固定値`
- **MP計算**: `MP = INT(INT(Lv+99+TEC+補正後INT/10)*(1+MP%/100))+MP固定値`
- 両計算とも2段階のINT()関数による切り捨て処理を実施
- 装備・クリスタ・バフアイテム・料理からの補正値を統合

## 異常耐性計算

### 基本計算式
```
異常耐性(%) = INT(MEN/3.4) + 異常耐性%
```

### 詳細計算

#### 構成要素
- **MEN**: ステータスのMEN（基本値、装備補正なし）
- **異常耐性%**: 装備/プロパティ、クリスタ、バフアイテム、料理からの異常耐性%補正の合計

#### 計算例
**入力値:**
- MEN: 100
- 異常耐性%: 15% (装備+クリスタ+バフアイテム)

**計算手順:**
1. MEN基礎計算 = INT(100/3.4) = INT(29.41) = 29
2. 最終異常耐性 = 29 + 15 = 44%

## HIT・FLEE計算

HIT（命中）とFLEE（回避率）の計算については、専用ドキュメントを参照してください。

**詳細**: [HIT・FLEE計算式](./hit-flee-calculation.md)

**概要**:
- **HIT計算**: `HIT = INT((Lv+総DEX)×(1+命中%/100))+命中固定値`
- **FLEE計算**: `FLEE = INT(基礎FLEE × (1 + 回避%/100)) + 回避固定値`
- **体装備依存**: FLEEは体装備の状態とArmorTypeにより基礎計算式が4種類に分岐
- **料理特殊性**: HITは料理固定値対応、FLEEは料理補正なし

## 速度系計算（ASPD・CSPD・行動速度）

攻撃速度（ASPD）、詠唱速度（CSPD）、行動速度（Motion Speed）の計算については、専用ドキュメントを参照してください。

**詳細**: [速度系計算式](./speed-calculations.md)

**概要**:
- **ASPD計算**: `ASPD = INT((Lv + ステータスASPD + 武器補正値) × (1 + (ASPD% + ArmorType補正)/100)) + ASPD固定値`
- **CSPD計算**: `CSPD = INT((INT(Lv+補正後DEX×2.94+補正後AGI×1.16))×(1+CSPD%/100))+CSPD固定値`
- **行動速度計算**: `行動速度 = MIN(50, MAX(0, INT((ASPD-1000)/180)) + 行動速度%)`
- 武器種別ステータス補正、ArmorType補正、上下限制限など複雑な処理を含む
- 装備・クリスタ・バフアイテム・料理からの補正値を統合

## クリティカル率計算

### 基本計算式
```
クリティカル率(%) = INT(INT(25+CRT/3.4)×(1+クリティカル率%/100))+クリティカル率固定値
```


### 詳細計算

#### 1. CRT基礎クリティカル率計算
```
CRT基礎クリティカル率 = INT(25 + CRT/3.4)
```

**構成要素:**
- **CRT**: ステータスのCRT（基本値、装備補正なし）
- **基本値25**: 全キャラクター共通のベースクリティカル率

#### 2. クリティカル率%補正適用
```
クリティカル率%適用後 = INT(CRT基礎クリティカル率 × (1 + クリティカル率%/100))
```

**構成要素:**
- **クリティカル率%**: 装備/プロパティ、クリスタ、バフアイテムのクリティカル率%(Critical_Rate)の合計
- **除外**: 料理にはクリティカル率%補正はありません

#### 3. クリティカル率固定値加算
```
最終クリティカル率 = クリティカル率%適用後 + クリティカル率固定値
```

**構成要素:**
- **クリティカル率固定値**: 装備/プロパティ、クリスタ、料理（たこ焼き）、バフアイテムのクリティカル率固定値(Critical)の合計

### 計算例

#### 例1: 標準的なケース
**入力値:**
- CRT: 100
- クリティカル率%: 20% (装備+クリスタ+バフアイテム)
- クリティカル率固定値: 15 (装備+クリスタ+料理+バフアイテム)

**計算手順:**
1. CRT基礎クリティカル率 = INT(25 + 100/3.4) = INT(25 + 29.41) = INT(54.41) = 54
2. クリティカル率%適用後 = INT(54 × (1 + 20/100)) = INT(54 × 1.20) = INT(64.8) = 64
3. 最終クリティカル率 = 64 + 15 = 79%

#### 例2: 高CRTケース
**入力値:**
- CRT: 200
- クリティカル率%: 35%
- クリティカル率固定値: 25

**計算手順:**
1. CRT基礎クリティカル率 = INT(25 + 200/3.4) = INT(25 + 58.82) = INT(83.82) = 83
2. クリティカル率%適用後 = INT(83 × (1 + 35/100)) = INT(83 × 1.35) = INT(112.05) = 112
3. 最終クリティカル率 = 112 + 25 = 137%

#### 例3: 低CRTケース
**入力値:**
- CRT: 50
- クリティカル率%: 10%
- クリティカル率固定値: 5

**計算手順:**
1. CRT基礎クリティカル率 = INT(25 + 50/3.4) = INT(25 + 14.71) = INT(39.71) = 39
2. クリティカル率%適用後 = INT(39 × (1 + 10/100)) = INT(39 × 1.10) = INT(42.9) = 42
3. 最終クリティカル率 = 42 + 5 = 47%

### 構成要素

**クリティカル率%の構成:**
- 装備/プロパティのクリティカル率%(Critical_Rate)補正
- クリスタのクリティカル率%(Critical_Rate)補正
- バフアイテムのクリティカル率%(Critical_Rate)補正
- **除外**: 料理にはクリティカル率%補正はありません

**クリティカル率固定値の構成:**
- 装備/プロパティのクリティカル率固定値(Critical)補正
- クリスタのクリティカル率固定値(Critical)補正
- 料理のクリティカル率固定値(Critical)補正（例：たこ焼き）
- バフアイテムのクリティカル率固定値(Critical)補正

### 重要な制限事項

1. **整数計算**: 2段階のINT()関数による切り捨て処理が重要
2. **料理の特殊性**: 料理にはクリティカル率%補正はないが、クリティカル率固定値補正は存在する

## クリティカルダメージ計算

### 基本計算式
```
クリティカルダメージ = INT((150+MAX(補正後STR/5,(補正後STR+補正後AGI)/10))×(1+CD%/100))+CD固定値
```

**重要な制限事項**: 300を超えた場合、300以降の数値は半減し、小数点以下は切り捨てられる。
- 例：計算結果が301 → CDは300
- 例：計算結果が304 → CDは302

### 詳細計算

#### 1. 基礎クリティカルダメージ計算
```
基礎CD = 150 + MAX(補正後STR/5, (補正後STR+補正後AGI)/10)
```

**構成要素:**
- **基本値150**: 全キャラクター共通のベースクリティカルダメージ
- **補正後STR**: 装備・クリスタ・バフアイテム・料理補正を含む最終STR値
- **補正後AGI**: 装備・クリスタ・バフアイテム・料理補正を含む最終AGI値
- **MAX関数**: STR重視(STR/5)とSTR+AGI重視((STR+AGI)/10)の高い方を採用

#### 2. クリティカルダメージ%補正適用
```
CD%適用後 = INT(基礎CD × (1 + CD%/100))
```

**構成要素:**
- **CD%(CriticalDamage_Rate)**: 装備/プロパティ、クリスタ、バフアイテムのクリティカルダメージ%(CriticalDamage_Rate)の合計
- **除外**: 料理にはクリティカルダメージ%補正はありません

#### 3. クリティカルダメージ固定値加算
```
最終CD = CD%適用後 + CD固定値
```

**構成要素:**
- **CD固定値(CriticalDamage)**: 装備/プロパティ、クリスタ、バフアイテムのクリティカルダメージ固定値(CriticalDamage)の合計

#### 4. 300超過時の半減処理
300を超えた場合の特殊計算：
```
if (最終CD > 300) {
  超過分 = 最終CD - 300
  半減後超過分 = INT(超過分 / 2)
  最終CD = 300 + 半減後超過分
}
```

### 計算例

#### 例1: 標準的なケース（300以下）
**入力値:**
- 補正後STR: 200
- 補正後AGI: 150
- CD%: 25% (装備+クリスタ+バフアイテム)
- CD固定値: 20 (装備+クリスタ+バフアイテム)

**計算手順:**
1. MAX判定: MAX(200/5, (200+150)/10) = MAX(40, 35) = 40
2. 基礎CD = 150 + 40 = 190
3. CD%適用後 = INT(190 × (1 + 25/100)) = INT(190 × 1.25) = INT(237.5) = 237
4. 最終CD = 237 + 20 = 257
5. 300以下のため半減処理なし
6. **最終クリティカルダメージ = 257**

#### 例2: 高AGIケース（300以下）
**入力値:**
- 補正後STR: 150
- 補正後AGI: 350
- CD%: 30%
- CD固定値: 25

**計算手順:**
1. MAX判定: MAX(150/5, (150+350)/10) = MAX(30, 50) = 50
2. 基礎CD = 150 + 50 = 200
3. CD%適用後 = INT(200 × (1 + 30/100)) = INT(200 × 1.30) = INT(260) = 260
4. 最終CD = 260 + 25 = 285
5. 300以下のため半減処理なし
6. **最終クリティカルダメージ = 285**

#### 例3: 高数値ケース（300超過・半減適用）
**入力値:**
- 補正後STR: 300
- 補正後AGI: 250
- CD%: 40%
- CD固定値: 30

**計算手順:**
1. MAX判定: MAX(300/5, (300+250)/10) = MAX(60, 55) = 60
2. 基礎CD = 150 + 60 = 210
3. CD%適用後 = INT(210 × (1 + 40/100)) = INT(210 × 1.40) = INT(294) = 294
4. 固定値加算後 = 294 + 30 = 324
5. 300超過のため半減処理: 超過分 = 324 - 300 = 24
6. 半減後超過分 = INT(24 / 2) = INT(12) = 12
7. **最終クリティカルダメージ = 300 + 12 = 312**

#### 例4: 極端な高数値ケース（300超過・半減適用）
**入力値:**
- 補正後STR: 510
- 補正後AGI: 300
- CD%: 50%
- CD固定値: 40

**計算手順:**
1. MAX判定: MAX(510/5, (510+300)/10) = MAX(102, 81) = 102
2. 基礎CD = 150 + 102 = 252
3. CD%適用後 = INT(252 × (1 + 50/100)) = INT(252 × 1.50) = INT(378) = 378
4. 固定値加算後 = 378 + 40 = 418
5. 300超過のため半減処理: 超過分 = 418 - 300 = 118
6. 半減後超過分 = INT(118 / 2) = INT(59) = 59
7. **最終クリティカルダメージ = 300 + 59 = 359**

### 構成要素

**クリティカルダメージ%(CriticalDamage_Rate)の構成:**
- 装備/プロパティのクリティカルダメージ%(CriticalDamage_Rate)補正
- クリスタのクリティカルダメージ%(CriticalDamage_Rate)補正
- バフアイテムのクリティカルダメージ%(CriticalDamage_Rate)補正
- **除外**: 料理にはクリティカルダメージ%補正はありません

**クリティカルダメージ固定値(CriticalDamage)の構成:**
- 装備/プロパティのクリティカルダメージ固定値(CriticalDamage)補正
- クリスタのクリティカルダメージ固定値(CriticalDamage)補正
- バフアイテムのクリティカルダメージ固定値(CriticalDamage)補正
- **除外**: 料理にはクリティカルダメージ固定値補正はありません

### TypeScript実装例

```typescript
interface CriticalDamageCalculationSteps {
  adjustedSTR: number
  adjustedAGI: number
  strDivision: number
  strAgiDivision: number
  maxValue: number
  baseCriticalDamage: number
  cdPercent: number
  cdAfterPercent: number
  cdFixed: number
  cdBeforeLimit: number
  isOver300: boolean
  excessAmount?: number
  halvedExcess?: number
  finalCriticalDamage: number
}

function calculateCriticalDamage(
  adjustedSTR: number,
  adjustedAGI: number,
  allBonuses: AllBonuses = {}
): CriticalDamageCalculationSteps {
  // 1. MAX計算
  const strDivision = adjustedSTR / 5
  const strAgiDivision = (adjustedSTR + adjustedAGI) / 10
  const maxValue = Math.max(strDivision, strAgiDivision)
  
  // 2. 基礎クリティカルダメージ
  const baseCriticalDamage = 150 + maxValue
  
  // 3. CD%適用
  const cdPercent = allBonuses.CriticalDamage_Rate || 0
  const cdAfterPercent = Math.floor(baseCriticalDamage * (1 + cdPercent / 100))
  
  // 4. CD固定値加算
  const cdFixed = allBonuses.CriticalDamage || 0
  const cdBeforeLimit = cdAfterPercent + cdFixed
  
  // 5. 300超過時の半減処理
  let finalCriticalDamage: number
  let isOver300 = false
  let excessAmount: number | undefined
  let halvedExcess: number | undefined
  
  if (cdBeforeLimit > 300) {
    isOver300 = true
    excessAmount = cdBeforeLimit - 300
    halvedExcess = Math.floor(excessAmount / 2)
    finalCriticalDamage = 300 + halvedExcess
  } else {
    finalCriticalDamage = cdBeforeLimit
  }
  
  return {
    adjustedSTR,
    adjustedAGI,
    strDivision,
    strAgiDivision,
    maxValue,
    baseCriticalDamage,
    cdPercent,
    cdAfterPercent,
    cdFixed,
    cdBeforeLimit,
    isOver300,
    excessAmount,
    halvedExcess,
    finalCriticalDamage,
  }
}
```

### 重要な制限事項

1. **MAX関数**: STR/5と(STR+AGI)/10の高い方を採用する複合計算
2. **300超過半減**: 300を超えた部分は半減される特殊制限
3. **INT()関数**: %適用時と半減処理時に小数点以下切り捨て
4. **料理除外**: 料理にはクリティカルダメージ補正（%・固定値とも）は存在しない
5. **補正後ステータス使用**: 基礎STR・AGIではなく、全補正適用後の値を使用

## MATK（魔法攻撃力）計算

### 基本計算式
```
MATK = INT((自Lv+総武器MATK+ステータスMATK+MATKアップ(ｽﾃｰﾀｽ%)-MATKダウン(ｽﾃｰﾀｽ%))×(1+MATK%/100))+MATK固定値
```

### 詳細計算

#### 総武器MATK
```
総武器MATK = INT(武器ATK×(1+(精錬値^2)/100)+精錬値)+INT(武器ATK×武器ATK%)+武器ATK固定値
```

**適用条件:**
- **杖・魔導具装備時**: 総武器MATKが適用される
- **手甲装備時**: 総武器ATK/2が総武器MATKとして適用される（この時点では小数点以下の切り捨ては行われず、MATK計算に使われる）
- **その他の武器**: 武器のATKが基礎MATKに適用されることはない

#### ステータスMATK
武器種別によってステータスMATKの計算式が異なります：

- **片手剣**: 補正後INT × 3 + 補正後DEX × 1
- **両手剣**: 補正後INT × 3 + 補正後DEX × 1
- **弓**: 補正後INT × 3 + 補正後DEX × 1
- **自動弓**: 補正後INT × 3 + 補正後DEX × 1
- **杖**: 補正後INT × 4 + 補正後DEX × 1
- **魔道具**: 補正後INT × 4 + 補正後DEX × 1
- **手甲**: 補正後INT × 4 + 補正後DEX × 1
- **旋風槍**: 補正後INT × 2 + 補正後DEX × 1 + 補正後AGI × 1
- **抜刀剣**: 補正後INT × 1.5 + 補正後DEX × 1
- **素手**: 補正後INT × 3 + 補正後DEX × 1

**重要**: 基礎ステータスではなく、**補正後ステータス**（装備・クリスタ・バフアイテム・料理補正を含む）を使用します。この時点では切り捨てが行われず、MATK計算に使われます（抜刀剣で小数点以下が発生した場合、MATK%計算時まで保持される）。

#### MATKアップ(ｽﾃｰﾀｽ%)・MATKダウン(ｽﾃｰﾀｽ%)（ステータス連動攻撃力）
基礎ステータスのプロパティ数値%だけMATKが増加または減少します。小数点以下は切り捨てられます。

**プロパティ:**
- MATK_STR_Rate: MATK+(STR)%
- MATK_INT_Rate: MATK+(INT)%
- MATK_VIT_Rate: MATK+(VIT)%
- MATK_AGI_Rate: MATK+(AGI)%
- MATK_DEX_Rate: MATK+(DEX)%

**計算式:**
```
MATKアップ合計 = INT(基礎STR × MATK_STR_Rate/100) + INT(基礎INT × MATK_INT_Rate/100) + 
                INT(基礎VIT × MATK_VIT_Rate/100) + INT(基礎AGI × MATK_AGI_Rate/100) + 
                INT(基礎DEX × MATK_DEX_Rate/100)
```

#### 構成要素
- **自Lv**: ステータスのレベル
- **総武器MATK**: 武器種別に応じた武器攻撃力（上記参照）
- **ステータスMATK**: 武器種別に応じたステータス攻撃力（**補正後ステータス**を使用、上記参照）
- **MATKアップ**: ステータス連動攻撃力の増加分（**基礎ステータス**を使用）
- **MATKダウン**: ステータス連動攻撃力の減少分（**基礎ステータス**を使用）
- **基本MATK**: `自Lv+総武器MATK+ステータスMATK+MATKアップ(ｽﾃｰﾀｽ%)-MATKダウン(ｽﾃｰﾀｽ%)`
- **MATK%**: 装備/プロパティ、クリスタ、バフアイテムのMATK%(MATK_Rate)の合計
- **MATK固定値**: 装備/プロパティ、クリスタ、料理、バフアイテムのMATK固定値(MATK)の合計

#### 計算手順
1. **総武器MATK計算**: 武器種別に応じて計算
2. **ステータスMATK計算**: 武器種別×**補正後ステータス値**で計算
3. **MATKアップ・ダウン計算**: 各**基礎ステータス**連動分を合計
4. **基本MATK計算**: Lv + 総武器MATK + ステータスMATK + MATKアップ - MATKダウン
5. **MATK%適用**: INT(基本MATK × (1 + MATK%/100))
6. **MATK固定値加算**: %適用後 + MATK固定値

### 計算例

#### 例1: 杖装備ケース
**入力値:**
- Lv: 150
- 武器ATK: 200, 精錬値: 10, 武器ATK%: 30%, 武器ATK固定値: 50
- 基礎INT: 300, 基礎DEX: 180
- 補正後INT: 350, 補正後DEX: 220（装備・クリスタ等補正適用後）
- MATKアップ(INT25%): 基礎INT300 → 75増加
- MATK%: 40%
- MATK固定値: 80

**計算手順:**
1. 総武器MATK = INT(200×(1+(10^2)/100)+10) + INT(200×30/100) + 50 = INT(200×2.0+10) + 60 + 50 = 410 + 60 + 50 = 520
2. ステータスMATK = 350×4 + 220×1 = 1400 + 220 = 1620（補正後ステータス使用）
3. MATKアップ = INT(300×25/100) = 75, MATKダウン = 0（基礎ステータス使用）
4. 基本MATK = 150 + 520 + 1620 + 75 - 0 = 2365
5. MATK%適用後 = INT(2365×(1+40/100)) = INT(2365×1.40) = INT(3311) = 3311
6. 最終MATK = 3311 + 80 = 3391

#### 例2: 手甲装備ケース
**入力値:**
- Lv: 120
- 総武器ATK: 800（計算済み）
- 基礎INT: 250, 基礎DEX: 200
- 補正後INT: 290, 補正後DEX: 240（装備・クリスタ等補正適用後）
- MATKアップなし
- MATK%: 25%
- MATK固定値: 40

**計算手順:**
1. 総武器MATK = 800/2 = 400（小数点なし）
2. ステータスMATK = 290×4 + 240×1 = 1160 + 240 = 1400（補正後ステータス使用）
3. MATKアップ = 0, MATKダウン = 0
4. 基本MATK = 120 + 400 + 1400 + 0 - 0 = 1920
5. MATK%適用後 = INT(1920×(1+25/100)) = INT(1920×1.25) = INT(2400) = 2400
6. 最終MATK = 2400 + 40 = 2440

#### 例3: 抜刀剣装備ケース（小数点発生）
**入力値:**
- Lv: 180
- 総武器MATK: 0（抜刀剣は武器MATKなし）
- 基礎INT: 333, 基礎DEX: 150
- 補正後INT: 380, 補正後DEX: 190（装備・クリスタ等補正適用後）
- MATKアップなし
- MATK%: 50%
- MATK固定値: 60

**計算手順:**
1. 総武器MATK = 0
2. ステータスMATK = 380×1.5 + 190×1 = 570 + 190 = 760（補正後ステータス使用、小数点なし）
3. MATKアップ = 0, MATKダウン = 0
4. 基本MATK = 180 + 0 + 760 + 0 - 0 = 940
5. MATK%適用後 = INT(940×(1+50/100)) = INT(940×1.50) = INT(1410) = 1410
6. 最終MATK = 1410 + 60 = 1470

### TypeScript実装例

```typescript
export interface MATKCalculationSteps {
	level: number
	weaponATK: number
	weaponMATK: number
	statusMATK: number
	matkUpTotal: number
	matkDownTotal: number
	baseMATK: number
	matkPercent: number
	matkAfterPercent: number
	matkFixed: number
	finalMATK: number
}

export const calculateMATK = (
	level: number,
	weaponType: WeaponType,
	weaponATK: number,
	refinementLevel: number,
	totalWeaponATK: number,
	baseStats: BaseStats,
	adjustedStats: AdjustedStats,
	bonuses: AllBonuses,
): MATKCalculationSteps => {
	// 総武器MATK計算
	let weaponMATK = 0
	if (weaponType === 'staff' || weaponType === 'magicDevice') {
		// 杖・魔導具: 総武器MATKを適用
		const weaponATKPercent = bonuses.WeaponATK_Rate || 0
		const weaponATKFixed = bonuses.WeaponATK || 0
		weaponMATK = Math.floor(weaponATK * (1 + (refinementLevel ** 2) / 100) + refinementLevel) +
		            Math.floor(weaponATK * weaponATKPercent / 100) + weaponATKFixed
	} else if (weaponType === 'knuckle') {
		// 手甲: 総武器ATK/2（小数点保持）
		weaponMATK = totalWeaponATK / 2
	}
	// その他の武器種は weaponMATK = 0

	// ステータスMATK計算（補正後ステータスを使用）
	const { INT, DEX, AGI } = adjustedStats
	let statusMATK = 0
	switch (weaponType) {
		case 'oneHandSword':
		case 'twoHandSword':
		case 'bow':
		case 'bowgun':
		case 'bareHand':
			statusMATK = INT * 3 + DEX * 1
			break
		case 'staff':
		case 'magicDevice':
		case 'knuckle':
			statusMATK = INT * 4 + DEX * 1
			break
		case 'halberd':
			statusMATK = INT * 2 + DEX * 1 + AGI * 1
			break
		case 'katana':
			statusMATK = INT * 1.5 + DEX * 1 // 小数点保持
			break
	}

	// MATKアップ・ダウン計算（基礎ステータスを使用）
	const matkUpSTR = Math.floor(baseStats.STR * (bonuses.MATK_STR_Rate || 0) / 100)
	const matkUpINT = Math.floor(baseStats.INT * (bonuses.MATK_INT_Rate || 0) / 100)
	const matkUpVIT = Math.floor(baseStats.VIT * (bonuses.MATK_VIT_Rate || 0) / 100)
	const matkUpAGI = Math.floor(baseStats.AGI * (bonuses.MATK_AGI_Rate || 0) / 100)
	const matkUpDEX = Math.floor(baseStats.DEX * (bonuses.MATK_DEX_Rate || 0) / 100)
	
	const matkUpTotal = matkUpSTR + matkUpINT + matkUpVIT + matkUpAGI + matkUpDEX
	const matkDownTotal = 0 // 必要に応じて実装

	// 基本MATK計算
	const baseMATK = level + weaponMATK + statusMATK + matkUpTotal - matkDownTotal

	// MATK%適用
	const matkPercent = bonuses.MATK_Rate || 0
	const matkAfterPercent = Math.floor(baseMATK * (1 + matkPercent / 100))

	// MATK固定値加算
	const matkFixed = bonuses.MATK || 0
	const finalMATK = matkAfterPercent + matkFixed

	return {
		level,
		weaponATK,
		weaponMATK,
		statusMATK,
		matkUpTotal,
		matkDownTotal,
		baseMATK,
		matkPercent,
		matkAfterPercent,
		matkFixed,
		finalMATK,
	}
}
```


## 総属性有利（Total Element Advantage）計算

### 基本計算式
```
総属性有利(%) = 装備/プロパティ属性有利% + クリスタ属性有利% + 料理属性有利% + バフアイテム属性有利%
```

### 詳細計算

#### 構成要素
- **装備/プロパティ属性有利%**: 装備品のプロパティからの属性有利%(ElementAdvantage_Rate)補正
- **クリスタ属性有利%**: セットしてあるクリスタからの属性有利%(ElementAdvantage_Rate)補正
- **料理属性有利%**: 料理からの属性有利%(ElementAdvantage_Rate)補正（例：属性パスタ（有利共通））
- **バフアイテム属性有利%**: バフアイテムからの属性有利%(ElementAdvantage_Rate)補正

#### 計算手順
1. **各ソースから属性有利%を取得**
2. **単純合算**: 全ての属性有利%補正を加算

### 計算例

#### 例1: 標準的なケース
**入力値:**
- 装備/プロパティ属性有利%: 15%
- クリスタ属性有利%: 10%
- 料理属性有利%: 12% (属性パスタLv8)
- バフアイテム属性有利%: 8%

**計算手順:**
1. 最終総属性有利 = 15% + 10% + 12% + 8% = 45%

#### 例2: 料理なしケース
**入力値:**
- 装備/プロパティ属性有利%: 20%
- クリスタ属性有利%: 15%
- 料理属性有利%: 0% (なし)
- バフアイテム属性有利%: 5%

**計算手順:**
1. 最終総属性有利 = 20% + 15% + 0% + 5% = 40%

#### 例3: 高数値ケース（属性特化ビルド）
**入力値:**
- 装備/プロパティ属性有利%: 35%
- クリスタ属性有利%: 25%
- 料理属性有利%: 15% (属性パスタLv10)
- バフアイテム属性有利%: 12%

**計算手順:**
1. 最終総属性有利 = 35% + 25% + 15% + 12% = 87%

### 構成要素

**属性有利%の構成:**
- 装備/プロパティの属性有利%(ElementAdvantage_Rate)補正
- クリスタの属性有利%(ElementAdvantage_Rate)補正
- 料理の属性有利%(ElementAdvantage_Rate)補正（例：属性パスタ（有利共通））
- バフアイテムの属性有利%(ElementAdvantage_Rate)補正

### 重要な制限事項

1. **%補正のみ**: 属性有利は%補正のみで、固定値補正は存在しない
2. **単純加算**: 複雑な計算式は不要で、各ソースからの%値を直接加算
3. **全属性共通**: 特定の属性に限定されず、全ての属性攻撃に適用される
4. **基本ステータス項目**: StatusPreviewの基本ステータス30項目の1つとして表示される

## 物理・魔法耐性計算

物理耐性と魔法耐性の計算については、専用ドキュメントを参照してください。

**詳細**: [物理・魔法耐性計算式](./resistance-calculation.md)

**概要**:
- **物理耐性計算**: `物理耐性(%) = 装備/プロパティ物理耐性% + クリスタ物理耐性% + 料理物理耐性% + バフアイテム物理耐性%`
- **魔法耐性計算**: `魔法耐性(%) = 装備/プロパティ魔法耐性% + クリスタ魔法耐性% + 料理魔法耐性% + バフアイテム魔法耐性%`
- **単純合算**: どちらも4つのデータソースからの%補正を単純加算
- **料理対応**: ビーフバーガー（物理）、フィッシュバーガー（魔法）からの補正が可能

## 防御崩し計算

### 基本計算式
```
防御崩し(%) = 装備/プロパティ防御崩し% + クリスタ防御崩し% + バフアイテム防御崩し%
```

### 詳細計算

#### 構成要素
- **装備/プロパティ防御崩し%**: 装備品のプロパティからの防御崩し%(ArmorBreak_Rate)補正
- **クリスタ防御崩し%**: セットしてあるクリスタからの防御崩し%(ArmorBreak_Rate)補正
- **バフアイテム防御崩し%**: バフアイテムからの防御崩し%(ArmorBreak_Rate)補正

#### 計算手順
1. **各ソースから防御崩し%を取得**
2. **単純合算**: 全ての防御崩し%補正を加算

### 計算例

#### 例1: 標準的なケース
**入力値:**
- 装備/プロパティ防御崩し%: 8%
- クリスタ防御崩し%: 5%
- バフアイテム防御崩し%: 3%

**計算手順:**
1. 最終防御崩し = 8% + 5% + 3% = 16%

#### 例2: バフアイテムなしケース
**入力値:**
- 装備/プロパティ防御崩し%: 12%
- クリスタ防御崩し%: 6%
- バフアイテム防御崩し%: 0% (なし)

**計算手順:**
1. 最終防御崩し = 12% + 6% + 0% = 18%

### 構成要素

**防御崩し%の構成:**
- 装備/プロパティの防御崩し%(ArmorBreak_Rate)補正
- クリスタの防御崩し%(ArmorBreak_Rate)補正
- バフアイテムの防御崩し%(ArmorBreak_Rate)補正

### 重要な制限事項

1. **%補正のみ**: 防御崩しは%補正のみで、固定値補正は存在しない
2. **単純合算**: 複雑な計算はなく、全ての%補正を単純に加算
3. **料理除外**: 料理からの防御崩し%補正は存在しない

## 先読み計算

### 基本計算式
```
先読み(%) = 装備/プロパティ先読み% + クリスタ先読み% + バフアイテム先読み%
```

### 詳細計算

#### 構成要素
- **装備/プロパティ先読み%**: 装備品のプロパティからの先読み%(Anticipate)補正
- **クリスタ先読み%**: セットしてあるクリスタからの先読み%(Anticipate)補正
- **バフアイテム先読み%**: バフアイテムからの先読み%(Anticipate)補正

#### 計算手順
1. **各ソースから先読み%を取得**
2. **単純合算**: 全ての先読み%補正を加算

### 計算例

#### 例1: 標準的なケース
**入力値:**
- 装備/プロパティ先読み%: 6%
- クリスタ先読み%: 4%
- バフアイテム先読み%: 2%

**計算手順:**
1. 最終先読み = 6% + 4% + 2% = 12%

#### 例2: クリスタなしケース
**入力値:**
- 装備/プロパティ先読み%: 10%
- クリスタ先読み%: 0% (なし)
- バフアイテム先読み%: 3%

**計算手順:**
1. 最終先読み = 10% + 0% + 3% = 13%

### 構成要素

**先読み%の構成:**
- 装備/プロパティの先読み%(Anticipate)補正
- クリスタの先読み%(Anticipate)補正
- バフアイテムの先読み%(Anticipate)補正

### 重要な制限事項

1. **%補正のみ**: 先読みは%補正のみで、固定値補正は存在しない
2. **単純合算**: 複雑な計算はなく、全ての%補正を単純に加算
3. **料理除外**: 料理からの先読み%補正は存在しない

## 安定率（Stability Rate）計算

安定率の計算については、専用ドキュメントを参照してください。

**詳細**: [安定率計算式](./stability-calculation.md)

**概要**:
- **基本計算式**: `安定率(%) = INT(MAX(0, MIN(100, メイン武器の安定率 + ステータス安定率 + 安定率%)))`
- **弓+矢特殊処理**: 弓装備時は矢の安定率が加算、自動弓装備時は矢の安定率/2が加算
- **武器種別依存**: ステータス安定率は武器種別により計算式が大きく異なる
- **制限処理**: 0%～100%の範囲制限とINT()関数による小数点以下切り捨て

## 更新履歴

| 日付 | 更新内容 | 備考 |
|------|----------|------|
| 2024-06-23 | HP・MP計算式の初期作成 | 基本的な計算式を記述 |
| 2024-06-23 | HP計算式を正確な式に修正 | INT()関数使用、補正後VIT導入、2段階計算に変更 |
| 2024-06-23 | MP計算式を正確な式に修正 | INT()関数使用、TECとINT活用、2段階計算に変更 |
| 2024-06-25 | クリティカル率計算式を追加 | INT()関数使用、CRT依存、2段階計算、料理固定値対応 |
| 2025-06-28 | クリティカルダメージ計算式を追加 | MAX関数使用、補正後STR・AGI依存、300超過時半減処理、INT関数使用、料理除外 |
| 2024-06-25 | HIT（命中）計算式を追加 | INT()関数使用、Lv+補正後DEX依存、料理固定値対応 |
| 2025-06-28 | FLEE（回避率）計算式を追加 | 体装備状態とArmorType依存、4種類の基礎FLEE計算式、INT関数使用、2段階計算、料理除外 |
| 2025-07-01 | HIT・FLEE計算を専用ファイルに分離 | hit-flee-calculation.mdに移動、クロスリファレンス追加 |
| 2024-06-26 | 物理耐性計算式を追加 | 4データソース統合、単純加算方式、料理対応 |
| 2024-06-26 | 魔法耐性計算式を追加 | 4データソース統合、単純加算方式、フィッシュバーガー対応 |
| 2025-07-01 | 物理・魔法耐性計算を専用ファイルに分離 | resistance-calculation.mdに移動、クロスリファレンス追加 |
| 2024-06-26 | 防御崩し計算式を追加 | 3データソース統合、単純加算方式、料理除外 |
| 2024-06-26 | 先読み計算式を追加 | 3データソース統合、単純加算方式、料理除外 |
| 2024-06-26 | 総属性有利計算式を追加 | 4データソース統合、単純加算方式、属性パスタ対応 |
| 2024-06-27 | 総属性有利計算を基本ステータス項目として再配置 | HIT計算の後に移動、基本ステータス30項目の1つとして明確化 |
| 2024-06-27 | 安定率計算式を追加 | MIN/MAX/INT関数使用、0-100%制限、武器種別ステータス安定率+3データソース統合、小数点切り捨て |
| 2025-06-28 | 速度系計算（ASPD・CSPD・行動速度）を専用ファイルに分離 | speed-calculations.mdに移動、クロスリファレンス追加 |
| 2025-07-01 | 安定率計算を専用ファイルに分離 | stability-calculation.mdに移動、クロスリファレンス追加 |

## 関連ドキュメント
- [HP・MP計算式](./hp-mp-calculation.md) - HP・MP計算の詳細
- [速度系計算式](./speed-calculations.md) - ASPD・CSPD・行動速度計算の詳細
- [HIT・FLEE計算式](./hit-flee-calculation.md) - HIT・FLEE計算の詳細
- [物理・魔法耐性計算式](./resistance-calculation.md) - 物理・魔法耐性計算の詳細
- [安定率計算式](./stability-calculation.md) - 安定率計算の詳細
- [計算式概要](./overview.md)
- [装備品補正値計算](./equipment-bonuses.md)
- [クリスタ効果計算](./crystal-effects.md)