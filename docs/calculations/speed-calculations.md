# 速度系計算式

## 概要
キャラクターの攻撃速度（ASPD）、詠唱速度（CSPD）、行動速度（Motion Speed）の計算式について記述する。これらの速度系ステータスは、戦闘における行動テンポを決定する重要な要素です。

**重要**: 2024年統一により、AllBonusesインターフェースはEquipmentPropertiesと同じ命名規則（PascalCase + アンダースコア）を使用。例：`AttackSpeed_Rate`, `CastingSpeed_Rate`, `MotionSpeed_Rate`

## 数値処理に関する重要事項

### INT()関数について
本ドキュメント内で使用される`INT(数値)`は小数点以下を元の数値より小さい整数に切り捨てる関数です。

**重要な注意点:**
- 例: INT(-2.7) = -3
- ※ステータスのINTと混同しないように注意してください

### MIN/MAX関数について
- `MAX(数値,数値,…)`は各数値の最大値を求める関数
  - 例: MAX(34,26,100) = 100
- `MIN(数値,数値,…)`は各数値の最小値を求める関数
  - 例: MIN(34,26,100) = 26

## ASPD（アタックスピード）計算

### 基本計算式
```
ASPD = INT((Lv + ステータスASPD + 武器補正値) × (1 + (ASPD% + ArmorType補正 + ShieldType補正)/100)) + ASPD固定値
```

### ArmorType（防具の改造）補正
体装備の防具の改造による内部ASPD%補正：

| ArmorType | ASPD%補正 |
|-----------|----------|
| 通常 (normal) | +0% |
| 軽量化 (light) | +50% |
| 重量化 (heavy) | -50% |

**重要な注意点:**
- ArmorType補正は内部計算のみで使用され、StatusPreviewの装備品補正値には表示されません
- 最終的なASPD計算にのみ影響し、表示上のASPD%には加算されません

**ArmorType変更時の即座反映:**
- ArmorType変更時に`CalculatorStore.updateEquipmentArmorType`が呼び出される
- データベースレベル更新と同時にZustandストアの状態も強制更新される
- StatusPreviewのASPD計算が自動的に再実行され、新しいArmorType補正が即座に反映される
- 体装備以外のArmorType変更には影響しない（安全性確保）

### ShieldType（盾装備）補正
サブ武器に盾を装備している場合の内部ASPD%補正：

| SubWeaponType | ASPD%補正 |
|---------------|----------|
| 盾 (shield) | -50% |
| その他 | +0% |

**重要な注意点:**
- ShieldType補正は内部計算のみで使用され、StatusPreviewの装備品補正値には表示されません
- 最終的なASPD計算にのみ影響し、表示上のASPD%には加算されません
- ArmorType補正と同様に、内部での計算結果にのみ影響します

### ステータスASPD計算

武器種に応じてステータスからASPDを算出：

#### 武器種別ステータスASPD計算式

| 武器種 | 計算式 |
|--------|--------|
| 片手剣 | STR × 0.2 + AGI × 4.2 |
| 両手剣 | STR × 0.2 + AGI × 2.1 |
| 双剣 | STR × 0.2 + AGI × 4.2 |
| 弓 | DEX × 0.2 + AGI × 3.1 |
| 自動弓 | DEX × 0.2 + AGI × 2.2 |
| 杖 | AGI × 1.8 + INT × 0.2 |
| 魔道具 | AGI × 4.0 + INT × 0.2 |
| 手甲 | STR × 0.1 + DEX × 0.1 + AGI × 4.6 |
| 旋風槍 | STR × 0.2 + AGI × 3.5 |
| 抜刀剣 | STR × 0.3 + AGI × 3.9 |
| 素手 | AGI × 9.6 |

### 武器種補正値

各武器種固有の基本ASPD値：

| 武器種 | 補正値 |
|--------|--------|
| 片手剣 | 100 |
| 両手剣 | 50 |
| 双剣 | 100 |
| 弓 | 75 |
| 自動弓 | 30 |
| 杖 | 60 |
| 魔導具 | 90 |
| 手甲 | 120 |
| 旋風槍 | 25 |
| 抜刀剣 | 200 |
| 素手 | 1000 |

### 計算例

#### 例1: 片手剣 + 通常防具 + サブ武器なし
**入力値:**
- Lv: 150
- STR: 200（補正後）
- AGI: 150（補正後）
- 武器種: 片手剣
- サブ武器種: なし
- ASPD%: 20%
- ASPD固定値: 50
- ArmorType: 通常 (normal)

**計算手順:**
1. ステータスASPD = STR × 0.2 + AGI × 4.2 = 200 × 0.2 + 150 × 4.2 = 40 + 630 = 670
2. 武器補正値 = 100（片手剣）
3. ASPD%適用前 = 150 + 670 + 100 = 920
4. ArmorType補正 = 0%（通常）
5. ShieldType補正 = 0%（サブ武器なし）
6. 実効ASPD% = 20% + 0% + 0% = 20%
7. ASPD%適用後 = INT(920 × (1 + 20/100)) = INT(920 × 1.20) = INT(1104) = 1104
8. 最終ASPD = 1104 + 50 = 1154

#### 例2: 片手剣 + 軽量化防具 + サブ武器なし
**入力値:**
- Lv: 150
- STR: 200（補正後）
- AGI: 150（補正後）
- 武器種: 片手剣
- サブ武器種: なし
- ASPD%: 20%
- ASPD固定値: 50
- ArmorType: 軽量化 (light)

**計算手順:**
1. ステータスASPD = STR × 0.2 + AGI × 4.2 = 200 × 0.2 + 150 × 4.2 = 40 + 630 = 670
2. 武器補正値 = 100（片手剣）
3. ASPD%適用前 = 150 + 670 + 100 = 920
4. ArmorType補正 = +50%（軽量化）
5. ShieldType補正 = 0%（サブ武器なし）
6. 実効ASPD% = 20% + 50% + 0% = 70%
7. ASPD%適用後 = INT(920 × (1 + 70/100)) = INT(920 × 1.70) = INT(1564) = 1564
8. 最終ASPD = 1564 + 50 = 1614

#### 例3: 片手剣 + 重量化防具 + サブ武器なし
**入力値:**
- Lv: 150
- STR: 200（補正後）
- AGI: 150（補正後）
- 武器種: 片手剣
- サブ武器種: なし
- ASPD%: 20%
- ASPD固定値: 50
- ArmorType: 重量化 (heavy)

**計算手順:**
1. ステータスASPD = STR × 0.2 + AGI × 4.2 = 200 × 0.2 + 150 × 4.2 = 40 + 630 = 670
2. 武器補正値 = 100（片手剣）
3. ASPD%適用前 = 150 + 670 + 100 = 920
4. ArmorType補正 = -50%（重量化）
5. ShieldType補正 = 0%（サブ武器なし）
6. 実効ASPD% = 20% + (-50%) + 0% = -30%
7. ASPD%適用後 = INT(920 × (1 + (-30)/100)) = INT(920 × 0.70) = INT(644) = 644
8. 最終ASPD = 644 + 50 = 694

#### 例4: 片手剣 + 通常防具 + 盾装備
**入力値:**
- Lv: 150
- STR: 200（補正後）
- AGI: 150（補正後）
- 武器種: 片手剣
- サブ武器種: 盾 (shield)
- ASPD%: 20%
- ASPD固定値: 50
- ArmorType: 通常 (normal)

**計算手順:**
1. ステータスASPD = STR × 0.2 + AGI × 4.2 = 200 × 0.2 + 150 × 4.2 = 40 + 630 = 670
2. 武器補正値 = 100（片手剣）
3. ASPD%適用前 = 150 + 670 + 100 = 920
4. ArmorType補正 = 0%（通常）
5. ShieldType補正 = -50%（盾装備）
6. 実効ASPD% = 20% + 0% + (-50%) = -30%
7. ASPD%適用後 = INT(920 × (1 + (-30)/100)) = INT(920 × 0.70) = INT(644) = 644
8. 最終ASPD = 644 + 50 = 694

### 構成要素

**ASPD%の構成:**
- 装備/プロパティのASPD%補正
- クリスタのASPD%補正
- バフアイテムのASPD%補正
- 料理のASPD%補正

**ASPD固定値の構成:**
- 装備/プロパティのASPD固定値補正
- クリスタのASPD固定値補正
- バフアイテムのASPD固定値補正
- 料理のASPD固定値補正

**ArmorType補正（内部計算のみ）:**
- 体装備の防具の改造設定による内部ASPD%補正
- StatusPreview表示には影響しない
- 通常: 0%、軽量化: +50%、重量化: -50%

**ShieldType補正（内部計算のみ）:**
- サブ武器に盾を装備している場合の内部ASPD%補正
- StatusPreview表示には影響しない
- 盾: -50%、その他: 0%

## 行動速度（Motion Speed）計算

### 基本計算式
```
行動速度 = MIN(50, MAX(0, INT((ASPD-1000)/180)) + 行動速度%)
```

### 詳細計算

#### 1. ASPDベース行動速度計算
```
ASPDベース行動速度 = INT((ASPD-1000)/180)
```

**説明:**
- ASPDから1000を減算した値を180で除算し、INT()関数で切り捨て
- ASPD 1000未満の場合は負数になる

#### 2. 下限制限適用
```
制限後ベース行動速度 = MAX(0, ASPDベース行動速度)
```

**説明:**
- 0未満の値を0に制限（下限制限）

#### 3. 行動速度%補正適用
```
補正後行動速度 = 制限後ベース行動速度 + 行動速度%
```

**構成要素:**
- **行動速度%**: 装備/プロパティ、クリスタ、バフアイテムの行動速度%(MotionSpeed_Rate)の合計
- **注意**: 料理には行動速度%はありません

#### 4. 上限制限適用
```
最終行動速度 = MIN(50, 補正後行動速度)
```

**説明:**
- 最終的な行動速度は最大50%に制限

### 計算例

#### 例1: 標準的なケース
**入力値:**
- ASPD: 1540
- 行動速度%: 15% (装備+クリスタ+バフアイテム)

**計算手順:**
1. ASPDベース行動速度 = INT((1540-1000)/180) = INT(540/180) = INT(3.0) = 3
2. 制限後ベース行動速度 = MAX(0, 3) = 3
3. 補正後行動速度 = 3 + 15 = 18
4. 最終行動速度 = MIN(50, 18) = 18%

#### 例2: 低ASPDケース
**入力値:**
- ASPD: 800
- 行動速度%: 10%

**計算手順:**
1. ASPDベース行動速度 = INT((800-1000)/180) = INT(-200/180) = INT(-1.11) = -2
2. 制限後ベース行動速度 = MAX(0, -2) = 0
3. 補正後行動速度 = 0 + 10 = 10
4. 最終行動速度 = MIN(50, 10) = 10%

#### 例3: 高ASPDケース
**入力値:**
- ASPD: 2800
- 行動速度%: 30%

**計算手順:**
1. ASPDベース行動速度 = INT((2800-1000)/180) = INT(1800/180) = INT(10.0) = 10
2. 制限後ベース行動速度 = MAX(0, 10) = 10
3. 補正後行動速度 = 10 + 30 = 40
4. 最終行動速度 = MIN(50, 40) = 40%

#### 例4: 上限到達ケース
**入力値:**
- ASPD: 3000
- 行動速度%: 50%

**計算手順:**
1. ASPDベース行動速度 = INT((3000-1000)/180) = INT(2000/180) = INT(11.11) = 11
2. 制限後ベース行動速度 = MAX(0, 11) = 11
3. 補正後行動速度 = 11 + 50 = 61
4. 最終行動速度 = MIN(50, 61) = 50% (上限制限)

### 構成要素

**行動速度%の構成:**
- 装備/プロパティの行動速度%(MotionSpeed_Rate)補正
- クリスタの行動速度%(MotionSpeed_Rate)補正
- バフアイテムの行動速度%(MotionSpeed_Rate)補正
- **除外**: 料理には行動速度%補正はありません

### 重要な制限事項

1. **下限制限**: ASPDベースの行動速度は0%未満にはならない
2. **上限制限**: 最終的な行動速度は50%を超えない
3. **料理除外**: 料理アイテムからの行動速度%補正は存在しない
4. **整数計算**: ASPD計算部分ではINT()関数による切り捨て処理が重要
5. **ArmorType補正**: 防具の改造による補正は内部計算のみで、UI表示のASPD%には反映されない

## CSPD（詠唱速度）計算

### 基本計算式
```
CSPD = INT((INT(Lv+補正後DEX×2.94+補正後AGI×1.16))×(1+CSPD%/100))+CSPD固定値
```

### 詳細計算

#### 1. ベースCSPD計算
```
ベースCSPD = INT(Lv + 補正後DEX × 2.94 + 補正後AGI × 1.16)
```

**構成要素:**
- **Lv**: キャラクターレベル
- **補正後DEX**: 補正後ステータスのDEX（装備・クリスタ・バフアイテム・料理補正を含む）
- **補正後AGI**: 補正後ステータスのAGI（装備・クリスタ・バフアイテム・料理補正を含む）

#### 2. CSPD%補正適用
```
CSPD%適用後 = INT(ベースCSPD × (1 + CSPD%/100))
```

**構成要素:**
- **CSPD%**: 装備/プロパティ、クリスタ、バフアイテムのCSPD%(CastingSpeed_Rate)補正の合計

#### 3. CSPD固定値加算
```
最終CSPD = CSPD%適用後 + CSPD固定値
```

**構成要素:**
- **CSPD固定値**: 装備/プロパティ、クリスタ、バフアイテムのCSPD固定値(CastingSpeed)補正の合計

### 計算例

#### 例1: 標準的なケース
**入力値:**
- レベル: 200
- 補正後DEX: 180
- 補正後AGI: 150
- CSPD%: 25% (装備+クリスタ+バフアイテム)
- CSPD固定値: 100 (装備+クリスタ+バフアイテム)

**計算手順:**
1. ベースCSPD = INT(200 + 180 × 2.94 + 150 × 1.16) = INT(200 + 529.2 + 174) = INT(903.2) = 903
2. CSPD%適用後 = INT(903 × (1 + 25/100)) = INT(903 × 1.25) = INT(1128.75) = 1128
3. 最終CSPD = 1128 + 100 = 1228

#### 例2: 高AGI・DEXケース
**入力値:**
- レベル: 250
- 補正後DEX: 220
- 補正後AGI: 200
- CSPD%: 40%
- CSPD固定値: 150

**計算手順:**
1. ベースCSPD = INT(250 + 220 × 2.94 + 200 × 1.16) = INT(250 + 646.8 + 232) = INT(1128.8) = 1128
2. CSPD%適用後 = INT(1128 × (1 + 40/100)) = INT(1128 × 1.40) = INT(1579.2) = 1579
3. 最終CSPD = 1579 + 150 = 1729

### 構成要素

**CSPD%の構成:**
- 装備/プロパティのCSPD%(CastingSpeed_Rate)補正
- クリスタのCSPD%(CastingSpeed_Rate)補正
- バフアイテムのCSPD%(CastingSpeed_Rate)補正

**CSPD固定値の構成:**
- 装備/プロパティのCSPD固定値(CastingSpeed)補正
- クリスタのCSPD固定値(CastingSpeed)補正
- バフアイテムのCSPD固定値(CastingSpeed)補正

### 重要な制限事項

1. **補正後ステータス使用**: 基礎DEX・AGIではなく、全補正を適用した補正後ステータスを使用
2. **料理除外**: 料理からのCSPD%・CSPD固定値補正は存在しない
3. **整数計算**: INT()関数による切り捨て処理が2段階で重要
4. **DEX重要度**: DEX × 2.94 でAGI × 1.16 よりもDEXの影響が大きい

## TypeScript実装例

### ASPD計算

```typescript
interface ASPDCalculationSteps {
  level: number
  statusASPD: number
  weaponBaseASPD: number
  aspdPercent: number
  armorTypeBonus: number
  shieldTypeBonus: number
  effectiveASPDPercent: number
  aspdBase: number
  aspdAfterPercent: number
  aspdFixed: number
  finalASPD: number
}

function calculateASPD(
  level: number,
  stats: AdjustedStats,
  weaponType: WeaponType,
  subWeaponType: SubWeaponType,
  allBonuses: AllBonuses,
  armorType: ArmorType = 'normal'
): ASPDCalculationSteps {
  // 1. ステータスASPD計算（武器種別）
  const statusASPD = calculateStatusASPD(stats, weaponType)
  
  // 2. 武器補正値取得
  const weaponBaseASPD = getWeaponBaseASPD(weaponType)
  
  // 3. ASPD%計算（装備+クリスタ+バフアイテム+料理）
  const aspdPercent = allBonuses.AttackSpeed_Rate || 0
  
  // 4. ArmorType補正計算（内部計算のみ）
  const armorTypeBonus = getArmorTypeASPDBonus(armorType)
  
  // 5. ShieldType補正計算（内部計算のみ）
  const shieldTypeBonus = getShieldTypeASPDBonus(subWeaponType)
  
  // 6. 実効ASPD%計算
  const effectiveASPDPercent = aspdPercent + armorTypeBonus + shieldTypeBonus
  
  // 7. ASPD基本値計算
  const aspdBase = level + statusASPD + weaponBaseASPD
  
  // 8. ASPD%適用
  const aspdAfterPercent = Math.floor(aspdBase * (1 + effectiveASPDPercent / 100))
  
  // 9. ASPD固定値加算
  const aspdFixed = allBonuses.AttackSpeed || 0
  const finalASPD = aspdAfterPercent + aspdFixed
  
  return {
    level,
    statusASPD,
    weaponBaseASPD,
    aspdPercent,
    armorTypeBonus,
    shieldTypeBonus,
    effectiveASPDPercent,
    aspdBase,
    aspdAfterPercent,
    aspdFixed,
    finalASPD,
  }
}

function getArmorTypeASPDBonus(armorType: ArmorType): number {
  switch (armorType) {
    case 'light': return 50   // 軽量化: +50%
    case 'heavy': return -50  // 重量化: -50%
    case 'normal':
    default: return 0         // 通常: +0%
  }
}

function getShieldTypeASPDBonus(subWeaponType: SubWeaponType): number {
  switch (subWeaponType) {
    case 'shield': return -50  // 盾: -50%
    default: return 0          // その他: +0%
  }
}
```

### 行動速度計算

```typescript
interface MotionSpeedCalculationSteps {
  aspd: number
  aspdBaseMotion: number
  clampedBaseMotion: number
  motionSpeedPercent: number
  motionAfterPercent: number
  finalMotionSpeed: number
}

function calculateMotionSpeed(
  aspd: number,
  allBonuses: AllBonuses
): MotionSpeedCalculationSteps {
  // 1. ASPDベース行動速度計算
  const aspdBaseMotion = Math.floor((aspd - 1000) / 180)
  
  // 2. 下限制限適用（0未満を0に制限）
  const clampedBaseMotion = Math.max(0, aspdBaseMotion)
  
  // 3. 行動速度%補正適用
  const motionSpeedPercent = allBonuses.MotionSpeed_Rate || 0
  const motionAfterPercent = clampedBaseMotion + motionSpeedPercent
  
  // 4. 上限制限適用（50%上限）
  const finalMotionSpeed = Math.min(50, motionAfterPercent)
  
  return {
    aspd,
    aspdBaseMotion,
    clampedBaseMotion,
    motionSpeedPercent,
    motionAfterPercent,
    finalMotionSpeed,
  }
}
```

### CSPD計算

```typescript
interface CSPDCalculationSteps {
  level: number
  adjustedDEX: number
  adjustedAGI: number
  baseCSPD: number
  cspdPercent: number
  cspdAfterPercent: number
  cspdFixed: number
  finalCSPD: number
}

function calculateCSPD(
  level: number,
  adjustedDEX: number,
  adjustedAGI: number,
  allBonuses: AllBonuses
): CSPDCalculationSteps {
  // 1. ベースCSPD計算
  const baseCSPD = Math.floor(level + adjustedDEX * 2.94 + adjustedAGI * 1.16)
  
  // 2. CSPD%適用
  const cspdPercent = allBonuses.CastingSpeed_Rate || 0
  const cspdAfterPercent = Math.floor(baseCSPD * (1 + cspdPercent / 100))
  
  // 3. CSPD固定値加算
  const cspdFixed = allBonuses.CastingSpeed || 0
  const finalCSPD = cspdAfterPercent + cspdFixed
  
  return {
    level,
    adjustedDEX,
    adjustedAGI,
    baseCSPD,
    cspdPercent,
    cspdAfterPercent,
    cspdFixed,
    finalCSPD,
  }
}
```

## 検証データ

### ASPD計算検証例
| Lv | STR | AGI | 武器種 | サブ武器 | ASPD% | ASPD固定 | ArmorType | 期待ASPD | 実測ASPD | 状態 |
|----|-----|-----|--------|----------|-------|----------|-----------|----------|----------|------|
| 150 | 200 | 150 | 片手剣 | なし | 20% | 50 | 通常 | 1154 | - | 🔄 |
| 150 | 200 | 150 | 片手剣 | なし | 20% | 50 | 軽量化 | 1614 | - | 🔄 |
| 150 | 200 | 150 | 片手剣 | なし | 20% | 50 | 重量化 | 694 | - | 🔄 |
| 150 | 200 | 150 | 片手剣 | 盾 | 20% | 50 | 通常 | 694 | - | 🔄 |

**ASPD計算詳細例（Lv:150, STR:200, AGI:150, 片手剣, 軽量化）:**
1. ステータスASPD = 200 × 0.2 + 150 × 4.2 = 670
2. 武器補正値 = 100（片手剣）
3. ASPD基本値 = 150 + 670 + 100 = 920
4. 実効ASPD% = 20% + 50%（軽量化） + 0%（サブ武器なし） = 70%
5. ASPD%適用後 = INT(920 × 1.70) = 1564
6. 最終ASPD = 1564 + 50 = 1614

**ASPD計算詳細例（Lv:150, STR:200, AGI:150, 片手剣, 通常, 盾装備）:**
1. ステータスASPD = 200 × 0.2 + 150 × 4.2 = 670
2. 武器補正値 = 100（片手剣）
3. ASPD基本値 = 150 + 670 + 100 = 920
4. 実効ASPD% = 20% + 0%（通常） + (-50%)（盾） = -30%
5. ASPD%適用後 = INT(920 × 0.70) = 644
6. 最終ASPD = 644 + 50 = 694

### 行動速度計算検証例
| ASPD | 行動速度% | 期待行動速度 | 実測行動速度 | 状態 |
|------|-----------|-------------|-------------|------|
| 1540 | 15% | 18% | - | 🔄 |
| 800 | 10% | 10% | - | 🔄 |
| 2800 | 30% | 40% | - | 🔄 |
| 3000 | 50% | 50% | - | 🔄 |

### CSPD計算検証例
| Lv | DEX | AGI | CSPD% | CSPD固定 | 期待CSPD | 実測CSPD | 状態 |
|----|-----|-----|-------|----------|----------|----------|------|
| 200 | 180 | 150 | 25% | 100 | 1228 | - | 🔄 |
| 250 | 220 | 200 | 40% | 150 | 1729 | - | 🔄 |

## 更新履歴

| 日付 | 更新内容 | 備考 |
|------|----------|------|
| 2025-07-08 | ASPD計算式にShieldType補正を追加 | 盾装備時-50%、内部計算のみでStatusPreview表示に影響しない |
| 2025-06-28 | ASPD・CSPD・行動速度計算の専用ファイル作成 | basic-stats.mdから分離、TypeScript実装例と検証データを追加 |
| 2025-06-28 | ASPD計算式にArmorType補正を追加 | 軽量化+50%、重量化-50%、内部計算のみでUI表示に影響しない |
| 2024-06-25 | 行動速度計算式を追加 | MIN/MAX/INT関数使用、ASPD依存、50%上限制限 |
| 2024-06-26 | CSPD（詠唱速度）計算式を追加 | INT関数使用、Lv+補正後DEX・AGI依存、2段階計算、料理除外 |

**凡例:**
- ✅: 検証済み（正確）
- 🔄: 検証待ち
- ❌: 要修正

## 関連ドキュメント
- [基本ステータス計算式](./basic-stats.md) - 他の基本ステータス計算の詳細
- [HP・MP計算式](./hp-mp-calculation.md) - HP・MP計算の詳細
- [StatusPreview機能要件](../requirements/10_status-preview-requirements.md) - 機能仕様の詳細
- [StatusPreview設計](../ui/status-preview.md) - UI設計とImplementation Guide