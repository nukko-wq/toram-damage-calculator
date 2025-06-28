# StatusPreview データ仕様

## 概要

StatusPreviewコンポーネントで使用されるデータ構造、TypeScriptインターフェース、データフロー、データバインディングパターンについて詳細に記述する。

**メインUI設計**: [StatusPreview UI設計書](./status-preview.md)を参照  
**計算仕様**: [StatusPreview 計算仕様詳細](./status-preview-calculations.md)を参照  
**実装ガイド**: [StatusPreview 実装ガイド](./status-preview-implementation.md)を参照

## TypeScript インターフェース

### StatusPreviewコンポーネント

```typescript
interface StatusPreviewProps {
  isVisible: boolean
}
```

### 計算結果データ構造（98項目）

```typescript
// 98項目の詳細計算結果（CalculationResultDisplay.tsxから継承）
interface CalculationResults {
  // 基本ステータス（30項目）
  basicStats: {
    HP: number                          // HP計算結果
    MP: number                          // MP計算結果
    ATK: number                         // ATK計算結果（武器種別対応）
    baseATK: number                     // 基礎ATK（表示時のみ小数点以下切り捨て）
    subATK: number                      // サブ武器ATK（双剣時は計算値、非双剣時はサブ武器ATK）
    subBaseATK: number                  // サブ武器基礎ATK（双剣時は計算値、非双剣時は0）
    totalATK: number                    // 総ATK（暫定値）
    bringerAM: number                   // ブリンガーAM（暫定値）
    MATK: number                        // MATK（暫定値）
    baseMATK: number                    // 基本MATK（暫定値）
    stabilityRate: number               // メイン武器安定率
    subStabilityRate: number            // サブ武器安定率
    criticalRate: number                // クリティカル率（計算結果）
    criticalDamage: number              // クリティカルダメージ（暫定値）
    magicCriticalRate: number           // 魔法クリティカル率（暫定値）
    magicCriticalDamage: number         // 魔法クリティカルダメージ（暫定値）
    totalElementAdvantage: number       // 総属性有利（暫定値）
    elementAwakeningAdvantage: number   // 属性覚醒有利（暫定値）
    ASPD: number                        // 攻撃速度（武器種別計算結果）
    CSPD: number                        // 詠唱速度（計算結果）
    HIT: number                         // 命中（計算結果）
    FLEE: number                        // 回避（体装備状態・ArmorType依存計算結果）
    physicalResistance: number          // 物理耐性（計算結果）
    magicalResistance: number           // 魔法耐性（暫定値）
    ailmentResistance: number           // 異常耐性（暫定値）
    motionSpeed: number                 // 行動速度（ASPD依存計算結果）
    armorBreak: number                  // 防御崩し（計算結果）
    anticipate: number                  // 先読み（計算結果）
  }
  
  // 補正後ステータス（8項目）
  adjustedStats: {
    STR: number      // INT(基礎STR × (1 + STR%/100)) + STR固定値
    AGI: number      // INT(基礎AGI × (1 + AGI%/100)) + AGI固定値
    INT: number      // INT(基礎INT × (1 + INT%/100)) + INT固定値
    DEX: number      // INT(基礎DEX × (1 + DEX%/100)) + DEX固定値
    VIT: number      // INT(基礎VIT × (1 + VIT%/100)) + VIT固定値
    CRT: number      // 基本ステータスの値をそのまま表示
    MEN: number      // 基本ステータスの値をそのまま表示
    TEC: number      // 基本ステータスの値をそのまま表示
  }
  
  // 装備品補正値1（31項目）
  equipmentBonus1: {
    ATK: number
    physicalPenetration: number
    MATK: number
    magicalPenetration: number
    weaponATK: number
    elementPower: number
    unsheatheAttack: number
    shortRangeDamage: number
    longRangeDamage: number
    criticalDamage: number
    criticalRate: number
    STR: number
    AGI: number
    INT: number
    DEX: number
    VIT: number
    ASPD: number
    CSPD: number
    stability: number
    motionSpeed: number
    accuracy: number
    dodge: number
    MP: number
    attackMPRecovery: number
    HP: number
    ailmentResistance: number
    physicalResistance: number
    magicalResistance: number
    aggroPlus: number
    aggroMinus: number
  }
  
  // 装備品補正値2（32項目）
  equipmentBonus2: {
    ATK_STR: number
    MATK_STR: number
    ATK_INT: number
    MATK_INT: number
    ATK_VIT: number
    MATK_VIT: number
    ATK_AGI: number
    MATK_AGI: number
    ATK_DEX: number
    MATK_DEX: number
    neutralResistance: number
    fireResistance: number
    waterResistance: number
    windResistance: number
    earthResistance: number
    lightResistance: number
    darkResistance: number
    linearReduction: number
    rushReduction: number
    bulletReduction: number
    proximityReduction: number
    areaReduction: number
    floorTrapReduction: number
    meteorReduction: number
    bladeReduction: number
    suctionReduction: number
    explosionReduction: number
    physicalBarrier: number
    magicalBarrier: number
    fractionalBarrier: number
    barrierCooldown: number
  }
  
  // 装備品補正値3（8項目）
  equipmentBonus3: {
    physicalFollowup: number
    magicalFollowup: number
    naturalHPRecovery: number
    naturalMPRecovery: number
    absoluteAccuracy: number
    absoluteDodge: number
    revivalTime: number
    itemCooldown: number
  }
}
```

### 補正値統合インターフェース

```typescript
interface AllBonuses {
  VIT?: number            // VIT固定値の合計
  VIT_Rate?: number       // VIT%の合計
  HP?: number             // HP固定値の合計
  HP_Rate?: number        // HP%の合計
  MP?: number             // MP固定値の合計
  MP_Rate?: number        // MP%の合計
  AttackSpeed?: number    // ASPD固定値の合計
  AttackSpeed_Rate?: number // ASPD%の合計（ArmorType補正は含まない）
  MotionSpeed_Rate?: number  // 行動速度%の合計（装備+クリスタ+バフアイテム、料理除外）
  // 注意: ArmorType補正は内部計算のみで、AllBonusesには含まれない
}
```

### 計算ステップインターフェース

#### ASPD計算ステップ
```typescript
interface ASPDCalculationSteps {
  level: number
  statusASPD: number
  weaponBaseASPD: number
  aspdPercent: number
  armorTypeBonus: number
  effectiveASPDPercent: number
  aspdBase: number
  aspdAfterPercent: number
  aspdFixed: number
  finalASPD: number
}
```

#### FLEE計算ステップ
```typescript
interface FLEECalculationSteps {
  level: number
  adjustedAGI: number
  hasBodyEquipment: boolean
  armorType: ArmorType
  baseFLEE: number
  dodgePercent: number
  fleeAfterPercent: number
  dodgeFixed: number
  finalFLEE: number
}
```

#### HP計算ステップ
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
```

#### MP計算ステップ
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
```

### プロパティ表示データ構造

```typescript
interface PropertyDisplayData {
  propertyName: string
  rateValue: number | null
  fixedValue: number | null
  propertyConfig: PropertyConfig
}

interface PropertyDoubleDisplayData {
  property1: PropertyDisplayData
  property2?: PropertyDisplayData  // 奇数個の場合は空
}

interface PropertyConfig {
  hasRate: boolean     // %値を持つかどうか
  hasFixed: boolean    // 固定値を持つかどうう
  displayName: string  // 表示名
}
```

### 補正値計算ソース

```typescript
interface BonusCalculationSources {
  equipment: Record<string, number>  // 装備品からの補正値
  crystal: Record<string, number>    // クリスタルからの補正値  
  food: Record<string, number>       // 料理からの補正値
  buff: Record<string, number>       // バフからの補正値
}
```

## データフロー

### 入力データ
1. **BaseStats**: Zustandストアから取得
2. **AllBonuses**: 装備・クリスタ・料理・バフから集計（将来実装）

### 計算処理
1. **補正値集計**: aggregateAllBonuses()
2. **HP計算**: calculateHP()
3. **MP計算**: calculateMP()
4. **ATK計算**: calculateATK() - 武器種別対応
5. **ASPD計算**: calculateASPD() - 武器種別対応、ArmorType補正対応
6. **行動速度計算**: calculateMotionSpeed() - ASPD依存計算

### 表示データ
1. **基本ステータス**: 計算結果を含む全ステータス
2. **計算詳細**: HP・MPの段階的計算過程
3. **武器情報**: メイン・サブ武器の基本データ

## データソース定義

### Zustandストアからの取得

```typescript
const { data } = useCalculatorStore()
const baseStats = data.baseStats
```

### 補正値ソース別の取得

#### 装備品補正値
```typescript
const equipmentBonuses = useMemo(() => {
  return getEquipmentBonuses(data.equipment)
}, [data.equipment])
```

#### クリスタル補正値
```typescript
const crystalBonuses = useMemo(
  () => getCrystalBonuses(data.crystals),
  [data.crystals],
)
```

#### 料理補正値
```typescript
const foodBonuses = useMemo(() => getFoodBonuses(data.food), [data.food])
```

#### バフアイテム補正値
```typescript
const buffBonuses = useMemo(
  () => getBuffBonuses(data.buffItems),
  [data.buffItems],
)
```

## 数値表示フォーマット

### 表示フォーマット定数

```typescript
const DISPLAY_FORMATS = {
  integer: (value: number) => value.toLocaleString(),           // カンマ区切り
  percentage: (value: number) => `${value}%`,                  // %記号付き
  signedValue: (value: number) => value > 0 ? `+${value}` : `${value}`, // 符号付き
  decimal: (value: number, places: number = 1) => value.toFixed(places)  // 小数点
} as const
```

### 色分け表示定数

```typescript
const DISPLAY_COLORS = {
  basic: 'text-gray-900',      // 基本値（黒）
  positive: 'text-blue-600',   // 正の補正値（青）
  negative: 'text-red-600',    // 負の補正値（赤）
  result: 'text-green-600',    // 計算結果（緑）
  neutral: 'text-gray-400'     // ニュートラル（灰色）
} as const
```

## プロパティ設定データ

### プロパティ表示設定

```typescript
const PROPERTY_DISPLAY_CONFIG: Record<string, PropertyConfig> = {
  ATK: { hasRate: true, hasFixed: true, displayName: 'ATK' },
  MATK: { hasRate: true, hasFixed: true, displayName: 'MATK' },
  HP: { hasRate: true, hasFixed: true, displayName: 'HP' },
  MP: { hasRate: true, hasFixed: true, displayName: 'MP' },
  STR: { hasRate: true, hasFixed: true, displayName: 'STR' },
  AGI: { hasRate: true, hasFixed: true, displayName: 'AGI' },
  // 以下省略...
}
```

### プロパティラベル

```typescript
const PROPERTY_LABELS: Record<string, string> = {
  ATK: 'ATK',
  MATK: 'MATK',
  physicalPenetration: '物理貫通',
  magicalPenetration: '魔法貫通',
  weaponATK: '武器ATK',
  elementPower: '属性威力',
  unsheatheAttack: '抜刀威力',
  // 以下省略...
}
```

## レスポンシブ対応データ

### ブレークポイント設定

```typescript
const BREAKPOINTS = {
  sm: 640,   // スマートフォン
  md: 768,   // タブレット
  lg: 1024,  // デスクトップ
  xl: 1280   // 大画面
} as const

const GRID_CONFIGS = {
  mobile: 'grid-cols-1',           // 1列表示
  tablet: 'grid-cols-2',           // 2列表示  
  desktop: 'grid-cols-4'           // 4列表示
} as const
```

## ArmorType関連データ

### ArmorType定義

```typescript
type ArmorType = 'normal' | 'light' | 'heavy'

const ARMOR_TYPE_LABELS: Record<ArmorType, string> = {
  normal: '通常',
  light: '軽量化',
  heavy: '重量化'
}

const ARMOR_TYPE_ASPD_BONUS: Record<ArmorType, number> = {
  normal: 0,    // +0%
  light: 50,    // +50%
  heavy: -50    // -50%
}
```

## 武器種関連データ

### 武器種ASPD設定

```typescript
interface WeaponASPDConfig {
  statusASPDFormula: (stats: AdjustedStatsCalculation) => number
  aspdCorrection: number
}

const WEAPON_ASPD_CONFIG: Record<WeaponTypeEnum, WeaponASPDConfig> = {
  ONE_HANDED_SWORD: {
    statusASPDFormula: (stats) => stats.STR * 0.2 + stats.AGI * 4.2,
    aspdCorrection: 100
  },
  TWO_HANDED_SWORD: {
    statusASPDFormula: (stats) => stats.STR * 0.2 + stats.AGI * 2.1,
    aspdCorrection: 50
  },
  // 以下省略...
}
```

## 更新履歴

| 日付 | 更新内容 | 備考 |
|------|----------|------|
| 2025-06-28 | StatusPreviewデータ仕様を専用ファイルに分離 | status-preview.mdからデータ構造とインターフェースを抽出 |

## 関連ドキュメント
- [StatusPreview UI設計書](./status-preview.md) - メインUI設計とレイアウト
- [StatusPreview 計算仕様詳細](./status-preview-calculations.md) - 各ステータスの計算仕様
- [StatusPreview 実装ガイド](./status-preview-implementation.md) - TypeScript実装例とコード
- [基本ステータス計算式](../calculations/basic-stats.md) - 計算ロジックの詳細
- [速度系計算式](../calculations/speed-calculations.md) - ASPD・CSPD・行動速度計算の詳細