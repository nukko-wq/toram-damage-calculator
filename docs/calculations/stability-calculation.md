# 安定率（Stability Rate）計算

## 概要
安定率計算は、武器の安定率、ステータス依存の安定率、装備・クリスタ・バフアイテムからの%補正を統合して最終安定率を算出します。

**重要**: 2024年統一により、AllBonusesインターフェースはEquipmentPropertiesと同じ命名規則（PascalCase + アンダースコア）を使用。例：`Stability_Rate`

## 数値処理に関する重要事項

### INT()関数について
本ドキュメント内で使用される`INT(数値)`は小数点以下を元の数値より小さい整数に切り捨てる関数です。

**重要な注意点:**
- 例: INT(-2.7) = -3
- ※ステータスのINTと混同しないように注意してください

## 基本計算式

### 通常武器の場合
```
安定率(%) = INT(MAX(0, MIN(100, メイン武器の安定率 + ステータス安定率 + 安定率%)))
```

### 弓+矢装備時の特殊計算

#### 弓+矢の場合
**適用条件**: メイン武器が「弓」かつサブ武器が「矢」の場合
```
安定率(%) = INT(MAX(0, MIN(100, メイン武器の安定率 + ステータス安定率 + 安定率% + 矢の安定率)))
```

#### 自動弓+矢の場合
**適用条件**: メイン武器が「自動弓」かつサブ武器が「矢」の場合
```
安定率(%) = INT(MAX(0, MIN(100, メイン武器の安定率 + ステータス安定率 + 安定率% + 矢の安定率/2)))
```

**重要**: 最終結果はINT()関数（小数点以下切り捨て）が適用されます。

## 詳細計算

### 構成要素
- **メイン武器の安定率**: メイン武器固有の安定率値
- **ステータス安定率**: 武器種別に応じたSTR・DEXによる計算値
- **安定率%**: 補正後安定率(パーセント) = 装備/プロパティ + クリスタ + バフアイテムの安定率%の合計
- **矢の安定率**: 弓+矢装備時の追加安定率
  - **弓の場合**: 矢の安定率をそのまま加算
  - **自動弓の場合**: 矢の安定率/2を加算（INT適用）

### ステータス安定率の武器種別計算式
- **片手剣**: STR × 0.025 + DEX × 0.075
- **両手剣**: DEX × 0.1
- **弓**: STR × 0.05 + DEX × 0.05
- **自動弓**: STR × 0.05
- **杖**: STR × 0.05
- **魔道具**: DEX × 0.1
- **手甲**: DEX × 0.025
- **旋風槍**: STR × 0.05 + DEX × 0.05
- **抜刀剣**: STR × 0.075 + DEX × 0.025
- **素手**: DEX × 0.35
- **双剣**: 特殊計算（保留）

### 計算手順
1. **ステータス安定率計算**: 武器種別に応じたSTR・DEX係数による計算
2. **各要素の合算**: メイン武器安定率 + ステータス安定率 + 安定率%
3. **上限制限**: MIN(100, 合算値) で100%上限を適用
4. **下限制限**: MAX(0, 上限制限後値) で0%下限を適用
5. **小数点切り捨て**: INT()関数で最終結果の小数点以下を切り捨て

## 計算例

### 例1: 片手剣の場合
**入力値:**
- メイン武器の安定率: 75%
- STR: 200, DEX: 150
- 安定率%: 8% (装備/プロパティ5% + クリスタ2% + バフアイテム1%)

**計算手順:**
1. ステータス安定率 = 200 × 0.025 + 150 × 0.075 = 5 + 11.25 = 16.25
2. 合算値 = 75 + 16.25 + 8 = 99.25%
3. 上限制限 = MIN(100, 99.25) = 99.25%
4. 下限制限 = MAX(0, 99.25) = 99.25%
5. 小数点切り捨て = INT(99.25) = 99
6. **最終安定率 = 99%**

### 例2: 素手・高DEXの場合
**入力値:**
- メイン武器の安定率: 50%
- STR: 100, DEX: 400
- 安定率%: 15%

**計算手順:**
1. ステータス安定率 = 400 × 0.35 = 140
2. 合算値 = 50 + 140 + 15 = 205%
3. 上限制限 = MIN(100, 205) = 100%
4. 下限制限 = MAX(0, 100) = 100%
5. 小数点切り捨て = INT(100) = 100
6. **最終安定率 = 100%**

### 例3: 魔道具の場合
**入力値:**
- メイン武器の安定率: 65%
- STR: 50, DEX: 250
- 安定率%: 5%

**計算手順:**
1. ステータス安定率 = 250 × 0.1 = 25
2. 合算値 = 65 + 25 + 5 = 95%
3. 上限制限 = MIN(100, 95) = 95%
4. 下限制限 = MAX(0, 95) = 95%
5. 小数点切り捨て = INT(95) = 95
6. **最終安定率 = 95%**

### 例4: 旋風槍の場合
**入力値:**
- メイン武器の安定率: 60%
- STR: 510, DEX: 1
- 安定率%: 0% (補正なし)

**計算手順:**
1. ステータス安定率 = 510 × 0.05 + 1 × 0.05 = 25.5 + 0.05 = 25.55
2. 合算値 = 60 + 25.55 + 0 = 85.55%
3. 上限制限 = MIN(100, 85.55) = 85.55%
4. 下限制限 = MAX(0, 85.55) = 85.55%
5. 小数点切り捨て = INT(85.55) = 85
6. **最終安定率 = 85%**

### 例5: 弓+矢の場合
**入力値:**
- メイン武器（弓）の安定率: 70%
- STR: 180, DEX: 220
- 安定率%: 6%
- 矢の安定率: 15%

**計算手順:**
1. ステータス安定率 = 180 × 0.05 + 220 × 0.05 = 9 + 11 = 20
2. 合算値 = 70 + 20 + 6 + 15 = 111%
3. 上限制限 = MIN(100, 111) = 100%
4. 下限制限 = MAX(0, 100) = 100%
5. 小数点切り捨て = INT(100) = 100
6. **最終安定率 = 100%**

### 例6: 自動弓+矢の場合
**入力値:**
- メイン武器（自動弓）の安定率: 65%
- STR: 300, DEX: 100
- 安定率%: 4%
- 矢の安定率: 20%

**計算手順:**
1. ステータス安定率 = 300 × 0.05 = 15
2. 矢の安定率（半減） = 20 / 2 = 10
3. 合算値 = 65 + 15 + 4 + 10 = 94%
4. 上限制限 = MIN(100, 94) = 94%
5. 下限制限 = MAX(0, 94) = 94%
6. 小数点切り捨て = INT(94) = 94
7. **最終安定率 = 94%**

## 構成要素

### 安定率%（パーセント）の構成
- 装備/プロパティの安定率%(Stability_Rate)補正
- クリスタの安定率%(Stability_Rate)補正
- バフアイテムの安定率%(Stability_Rate)補正

## TypeScript実装例

```typescript
interface StabilityCalculationSteps {
  weaponType: WeaponType
  mainWeaponStability: number
  subWeaponStability?: number
  STR: number
  DEX: number
  statusStability: number
  stabilityPercent: number
  totalBeforeLimit: number
  afterUpperLimit: number
  afterLowerLimit: number
  finalStability: number
}

function calculateStability(
  weaponType: WeaponType,
  subWeaponType: SubWeaponType | null,
  mainWeaponStability: number,
  subWeaponStability: number = 0,
  adjustedSTR: number,
  adjustedDEX: number,
  allBonuses: AllBonuses = {}
): StabilityCalculationSteps {
  // 1. ステータス安定率計算
  let statusStability = 0
  
  switch (weaponType) {
    case 'oneHandSword':
      statusStability = adjustedSTR * 0.025 + adjustedDEX * 0.075
      break
    case 'twoHandSword':
      statusStability = adjustedDEX * 0.1
      break
    case 'bow':
      statusStability = adjustedSTR * 0.05 + adjustedDEX * 0.05
      break
    case 'bowgun':
      statusStability = adjustedSTR * 0.05
      break
    case 'staff':
      statusStability = adjustedSTR * 0.05
      break
    case 'magicDevice':
      statusStability = adjustedDEX * 0.1
      break
    case 'knuckle':
      statusStability = adjustedDEX * 0.025
      break
    case 'halberd':
      statusStability = adjustedSTR * 0.05 + adjustedDEX * 0.05
      break
    case 'katana':
      statusStability = adjustedSTR * 0.075 + adjustedDEX * 0.025
      break
    case 'bareHand':
      statusStability = adjustedDEX * 0.35
      break
    case 'dualSword':
      // 双剣は特殊計算のため保留
      statusStability = 0
      break
  }
  
  // 2. 安定率%補正
  const stabilityPercent = allBonuses.Stability_Rate || 0
  
  // 3. 矢の安定率処理
  let arrowStability = 0
  if (subWeaponType === 'arrow') {
    if (weaponType === 'bow') {
      // 弓+矢: そのまま加算
      arrowStability = subWeaponStability
    } else if (weaponType === 'bowgun') {
      // 自動弓+矢: 半減
      arrowStability = subWeaponStability / 2
    }
  }
  
  // 4. 合算
  const totalBeforeLimit = mainWeaponStability + statusStability + stabilityPercent + arrowStability
  
  // 5. 上限・下限制限
  const afterUpperLimit = Math.min(100, totalBeforeLimit)
  const afterLowerLimit = Math.max(0, afterUpperLimit)
  
  // 6. 小数点切り捨て
  const finalStability = Math.floor(afterLowerLimit)
  
  return {
    weaponType,
    mainWeaponStability,
    subWeaponStability: subWeaponType === 'arrow' ? subWeaponStability : undefined,
    STR: adjustedSTR,
    DEX: adjustedDEX,
    statusStability,
    stabilityPercent,
    totalBeforeLimit,
    afterUpperLimit,
    afterLowerLimit,
    finalStability,
  }
}
```

## 魔法安定率計算

魔法攻撃における安定率計算は、物理安定率を基に計算されます。

### 基本計算式

#### 魔法安定率（倍率下限）
```
魔法安定率下限(%) = MAX(0, MIN(90, INT((物理安定率 + 100) / 2)))
```

#### 魔法安定率（倍率上限）
```
魔法安定率上限(%) = MAX(100, MIN(110, 100 + INT((物理安定率 - 80) / 2)))
```

### 詳細計算

#### 構成要素
- **物理安定率**: 上記で計算した最終物理安定率（0-100%）
- **魔法安定率下限**: 魔法ダメージの最低倍率
- **魔法安定率上限**: 魔法ダメージの最高倍率

#### 計算手順
1. **物理安定率を取得**: 上記の物理安定率計算結果を使用
2. **下限計算**: INT((物理安定率 + 100) / 2) を計算し、0-90%で制限
3. **上限計算**: 100 + INT((物理安定率 - 80) / 2) を計算し、100-110%で制限
4. **ダメージ倍率決定**: 実際の魔法ダメージ計算時に下限～上限の範囲から無作為に抽出

### 計算例

#### 例1: 標準的なケース
**入力値:**
- 物理安定率: 80%

**計算手順:**
1. 魔法安定率下限 = MAX(0, MIN(90, INT((80 + 100) / 2))) = MAX(0, MIN(90, INT(90))) = MAX(0, MIN(90, 90)) = 90%
2. 魔法安定率上限 = MAX(100, MIN(110, 100 + INT((80 - 80) / 2))) = MAX(100, MIN(110, 100 + 0)) = 100%
3. **魔法ダメージ倍率範囲**: 90% ～ 100%

#### 例2: 高安定率ケース
**入力値:**
- 物理安定率: 100%

**計算手順:**
1. 魔法安定率下限 = MAX(0, MIN(90, INT((100 + 100) / 2))) = MAX(0, MIN(90, 100)) = 90%
2. 魔法安定率上限 = MAX(100, MIN(110, 100 + INT((100 - 80) / 2))) = MAX(100, MIN(110, 110)) = 110%
3. **魔法ダメージ倍率範囲**: 90% ～ 110%

#### 例3: 低安定率ケース
**入力値:**
- 物理安定率: 40%

**計算手順:**
1. 魔法安定率下限 = MAX(0, MIN(90, INT((40 + 100) / 2))) = MAX(0, MIN(90, 70)) = 70%
2. 魔法安定率上限 = MAX(100, MIN(110, 100 + INT((40 - 80) / 2))) = MAX(100, MIN(110, 80)) = 100%
3. **魔法ダメージ倍率範囲**: 70% ～ 100%

#### 例4: 極低安定率ケース
**入力値:**
- 物理安定率: 0%

**計算手順:**
1. 魔法安定率下限 = MAX(0, MIN(90, INT((0 + 100) / 2))) = MAX(0, MIN(90, 50)) = 50%
2. 魔法安定率上限 = MAX(100, MIN(110, 100 + INT((0 - 80) / 2))) = MAX(100, MIN(110, 60)) = 100%
3. **魔法ダメージ倍率範囲**: 50% ～ 100%

### TypeScript実装例

```typescript
interface MagicalStabilityCalculationSteps {
  physicalStability: number
  lowerLimitCalculation: number
  upperLimitCalculation: number
  magicalStabilityLower: number
  magicalStabilityUpper: number
  damageMultiplierRange: string
}

function calculateMagicalStability(
  physicalStability: number
): MagicalStabilityCalculationSteps {
  // 1. 下限計算
  const lowerLimitCalculation = Math.floor((physicalStability + 100) / 2)
  const magicalStabilityLower = Math.max(0, Math.min(90, lowerLimitCalculation))
  
  // 2. 上限計算
  const upperLimitCalculation = 100 + Math.floor((physicalStability - 80) / 2)
  const magicalStabilityUpper = Math.max(100, Math.min(110, upperLimitCalculation))
  
  // 3. ダメージ倍率範囲
  const damageMultiplierRange = `${magicalStabilityLower}% ～ ${magicalStabilityUpper}%`
  
  return {
    physicalStability,
    lowerLimitCalculation,
    upperLimitCalculation,
    magicalStabilityLower,
    magicalStabilityUpper,
    damageMultiplierRange,
  }
}
```

### 重要な制限事項

1. **物理安定率依存**: 魔法安定率は物理安定率の計算結果に完全に依存
2. **下限制限**: 魔法安定率下限は0-90%の範囲で制限
3. **上限制限**: 魔法安定率上限は100-110%の範囲で制限
4. **INT()関数**: 各計算段階で小数点以下切り捨て処理
5. **無作為抽出**: 実際のダメージ計算時は下限～上限の範囲から無作為に選択
6. **魔法攻撃専用**: 物理攻撃には適用されない

## 重要な制限事項（物理安定率）

1. **上限・下限制限**: 0%～100%の範囲で制限される
2. **MIN/MAX関数**: 上限・下限制限にMIN/MAX関数を使用
3. **小数点切り捨て**: 最終結果にINT()関数を適用して小数点以下を切り捨て
4. **料理除外**: 料理からの安定率補正は存在しない
5. **武器種依存**: ステータス安定率は武器種別により計算式が大きく異なる
6. **双剣特殊**: 双剣の安定率計算は特殊なため保留
7. **弓・自動弓特殊**: 矢装備時の特別な加算処理が存在する

## 更新履歴

| 日付 | 更新内容 | 備考 |
|------|----------|------|
| 2024-06-27 | 安定率計算式を追加 | MIN/MAX/INT関数使用、0-100%制限、武器種別ステータス安定率+3データソース統合、小数点切り捨て |
| 2025-07-01 | basic-stats.mdから分離 | 専用ファイルとして独立、弓+矢の特殊計算を詳細化 |

## 関連ドキュメント
- [基本ステータス計算式](./basic-stats.md) - その他の基本ステータス計算
- [計算式概要](./overview.md)