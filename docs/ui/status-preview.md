# StatusPreview コンポーネントUI設計書

## 概要

ヘッダー下に配置されるステータス計算結果の詳細表示コンポーネント。98項目の詳細ステータス情報を4つのセクションに整理表示するUIコンポーネントの設計書。

**機能要件詳細**: [StatusPreview機能要件](../requirements/10_status-preview-requirements.md)を参照

**計算ロジック詳細**: [基本ステータス計算式](../calculations/basic-stats.md)を参照

## コンポーネント構成

### StatusPreview（メインコンポーネント）
- **ファイル**: `src/components/layout/StatusPreview.tsx`
- **目的**: 正確な計算式による詳細ステータス表示
- **位置**: ResultToggleBar経由で表示制御

### 依存コンポーネント
- **StatSection**: 統一されたステータス表示セクション
- **StatItem**: 個別ステータス項目表示

## UIレイアウト設計

### 全体構造
```
┌─────────────────────────────────────┐
│ ┌─────────────┐ ┌─────────────┐    │
│ │基本ステータス │ │補正後ステータス│    │
│ │(30項目)      │ │(8項目)       │    │
│ └─────────────┘ └─────────────┘    │
│ ┌─────────────┐ ┌─────────────┐    │
│ │装備品補正値1 │ │装備品補正値2 │    │
│ │(31項目)      │ │(32項目)      │    │
│ └─────────────┘ └─────────────┘    │
│ ┌─────────────┐                    │
│ │装備品補正値3 │                    │
│ │(8項目)       │                    │
│ └─────────────┘                    │
└─────────────────────────────────────┘
```

### 基本ステータス（30項目）
```
┌─────── 基本ステータス ─────────┐
│ HP 14,413      MP 459         │
│ ATK 2,341      基礎ATK 1,890   │
│ サブATK 156    サブ基礎ATK 0   │
│ 総ATK 2,497    ブリンガーAM 124│
│ MATK 1,876     基本MATK 1,542 │
│ 安定率 85%     サブ安定率 75%  │
│ クリ率 12%     クリダメ 150%   │
│ 魔クリ率 8%    魔クリダメ 130% │
│ 総属性有利 25% 属性覚醒 15%    │
│ ASPD 1,200     CSPD 890       │
│ HIT 234        FLEE 189       │
│ 物理耐性 15%   魔法耐性 12%    │
│ 異常耐性 8%    行動速度 105%   │
│ 防御崩し 5%    先読み 3%       │
└─────────────────────────────┘
```

**ATK計算仕様**:
- **武器種別**: 旋風槍の場合の計算を実装
- **計算式**: `INT((自Lv + 総武器ATK + ステータスATK + ATKアップ - ATKダウン) × (1 + ATK%/100)) + ATK固定値`
- **ステータスATK**: `基礎STR × 2.5 + 基礎AGI × 1.5`（旋風槍の場合）
- **データソース**: メイン武器の種別に基づいて計算式を選択
- **条件分岐**: 武器種が旋風槍以外の場合は暫定値を表示

**計算詳細**: [ATK計算式設計書](../calculations/atk-calculation.md)を参照

### 補正後ステータス（8項目）
```
┌─────── 補正後ステータス ─────┐
│ STR: 215      AGI: 165      │
│ INT: 210      DEX: 160      │
│ VIT: 205      CRT: 95       │
│ MEN: 115      TEC: 90       │
└─────────────────────────────┘
```

**計算方式**:
- **STR/INT/VIT/AGI/DEX**: `INT(基礎ステータス × (1 + ステータス%/100)) + ステータス固定値`
- **CRT/MEN/TEC**: 基本ステータスの値をそのまま表示（補正なし）

**データソース**:
- **基礎ステータス**: BaseStatsFormの入力値
- **ステータス%**: 装備・クリスタ・料理・バフアイテムの%補正の合計
- **ステータス固定値**: 装備・クリスタ・料理・バフアイテムの固定値補正の合計

### 装備品補正値1（31プロパティ - 2プロパティ/行表示）
```
┌─────────────── 装備品補正値1 ───────────────┐
│ プロパティ      %    +    プロパティ      %    +  │
│ ─────────────────────────────────────── │
│ ATK           15  150    物理貫通      25   -   │
│ MATK          12  120    魔法貫通      20   -   │
│ 武器ATK       10  200    属性威力      15   -   │
│ 抜刀威力      10   -     近距離威力    8    -   │
│ 遠距離威力    5    -     クリダメ      20   5   │
│ クリ率        5    2     STR           10  15   │
│ AGI           8   15     INT           12  10   │
│ DEX           6   10     VIT           5    5   │
│ ASPD          15  200    CSPD          10  150  │
│ 安定率        5    -     行動速度      5    -   │
│ 命中          8   34     回避          6   29   │
│ HP            10  200    MP            8   100  │
│ 攻撃MP回復    3    2     異常耐性      3    -   │
│ 物理耐性      5    -     魔法耐性      3    -   │
│ ヘイト        15   -     (空き)         -    -   │
└─────────────────────────────────────────┘
```

### 装備品補正値2（31プロパティ - 2プロパティ/行表示）
```
┌─────────────── 装備品補正値2 ───────────────┐
│ プロパティ      %    +    プロパティ      %    +  │
│ ─────────────────────────────────────── │
│ ATK(STR)      8    -     MATK(STR)     6    -   │
│ ATK(INT)      10   -     MATK(INT)     12   -   │
│ ATK(VIT)      5    -     MATK(VIT)     4    -   │
│ ATK(AGI)      3    -     MATK(AGI)     2    -   │
│ ATK(DEX)      4    -     MATK(DEX)     3    -   │
│ 無耐性        5    -     火耐性        8    -   │
│ 水耐性        6    -     風耐性        7    -   │
│ 地耐性        5    -     光耐性        9    -   │
│ 闇耐性        4    -     直線軽減      3    -   │
│ 突進軽減      4    -     弾丸軽減      2    -   │
│ 周囲軽減      5    -     範囲軽減      3    -   │
│ 痛床軽減      2    -     隕石軽減      1    -   │
│ 射刃軽減      2    -     吸引軽減      1    -   │
│ 爆発軽減      3    -     物理バリア    -   150  │
│ 魔法バリア    -   120    割合バリア    -    5   │
│ バリア速度    10   -     (空き)         -    -   │
└─────────────────────────────────────────┘
```

### 装備品補正値3（8プロパティ - 2プロパティ/行表示）
```
┌─────────────── 装備品補正値3 ───────────────┐
│ プロパティ      %    +    プロパティ      %    +  │
│ ─────────────────────────────────────── │
│ 物理追撃      8    -     魔法追撃      6    -   │
│ HP自然回復   12   15     MP自然回復   10   10   │
│ 絶対命中      8    5     絶対回避      6    3   │
│ 復帰短縮      20   -     道具速度      -   15   │
└─────────────────────────────────────────┘
```

## データ表示仕様

### プロパティ表示パターン

#### 1. 2プロパティ/行レイアウトパターン

**基本構造**: `プロパティ名1 | %1 | +1 | プロパティ名2 | %2 | +2`

```
プロパティ      %    +    プロパティ      %    +
─────────────────────────────────────
ATK           15  150    物理貫通      25   -     // 両方あり + %のみ
HP            10  200    MP            8   100    // 両方あり + 両方あり
物理バリア    -   150    魔法バリア    -   120    // +のみ + +のみ
```

#### 2. 各パターンの表示例

**両方表示プロパティ**: 両方の列に値を表示
```
ATK           15  150    MATK          12  120
HP            10  200    MP            8   100
STR           5   15     AGI           8   15
```

**%のみプロパティ**: +列は「-」表示
```
ヘイト        15   -     火耐性        8    -
属性威力      15   -     安定率        5    -
物理貫通      25   -     魔法貫通      20   -
```

**+のみプロパティ**: %列は「-」表示
```
道具速度      -   15     物理バリア    -   150
魔法バリア    -   120    割合バリア    -    5
```

### 数値表示フォーマット
- **整数値**: カンマ区切り（例: 14,413）
- **パーセント**: %記号付き（例: +15%、85%）
- **固定値**: 符号付き数値（例: +150、-50）
- **ゼロ値**: 「0」で表示（非表示にしない）

### 色分け表示
- **基本値**: 通常色（黒）
- **正の補正値**: 強調色（青）
- **負の補正値**: 警告色（赤）
- **計算結果**: 結果色（緑）

## 技術仕様

### TypeScript インターフェース

```typescript
interface StatusPreviewProps {
  isVisible: boolean
}

// 98項目の詳細計算結果（CalculationResultDisplay.tsxから継承）
interface CalculationResults {
  // 基本ステータス（30項目）
  basicStats: {
    HP: number                          // HP計算結果
    MP: number                          // MP計算結果
    ATK: number                         // ATK計算結果（武器種別対応）
    baseATK: number                     // 基礎ATK（暫定値）
    subATK: number                      // サブ武器ATK
    subBaseATK: number                  // サブ武器基礎ATK（暫定値）
    totalATK: number                    // 総ATK（暫定値）
    bringerAM: number                   // ブリンガーAM（暫定値）
    MATK: number                        // MATK（暫定値）
    baseMATK: number                    // 基本MATK（暫定値）
    stabilityRate: number               // メイン武器安定率
    subStabilityRate: number            // サブ武器安定率
    criticalRate: number                // クリティカル率（暫定値）
    criticalDamage: number              // クリティカルダメージ（暫定値）
    magicCriticalRate: number           // 魔法クリティカル率（暫定値）
    magicCriticalDamage: number         // 魔法クリティカルダメージ（暫定値）
    totalElementAdvantage: number       // 総属性有利（暫定値）
    elementAwakeningAdvantage: number   // 属性覚醒有利（暫定値）
    ASPD: number                        // 攻撃速度（暫定値）
    CSPD: number                        // 詠唱速度（暫定値）
    HIT: number                         // 命中（暫定値）
    FLEE: number                        // 回避（暫定値）
    physicalResistance: number          // 物理耐性（暫定値）
    magicalResistance: number           // 魔法耐性（暫定値）
    ailmentResistance: number           // 異常耐性（暫定値）
    motionSpeed: number                 // 行動速度（暫定値）
    armorBreak: number                  // 防御崩し（暫定値）
    anticipate: number                  // 先読み（暫定値）
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

interface AllBonuses {
  VIT?: number          // VIT固定値の合計
  VIT_Rate?: number     // VIT%の合計
  HP?: number           // HP固定値の合計
  HP_Rate?: number      // HP%の合計
  MP?: number           // MP固定値の合計
  MP_Rate?: number      // MP%の合計
}
```

### UIコンポーネント設計

#### StatItemコンポーネントの拡張

```typescript
interface PropertyDisplayProps {
  propertyName: string
  rateValue: number | null
  fixedValue: number | null
  propertyConfig: PropertyConfig
}

const PropertyDisplay: React.FC<PropertyDisplayProps> = ({ 
  propertyName, 
  rateValue, 
  fixedValue, 
  propertyConfig 
}) => {
  return (
    <div className="grid grid-cols-[100px_60px_60px] gap-2 py-1 px-2">
      {/* プロパティ名 */}
      <span className="text-sm text-gray-700 font-medium truncate">
        {propertyName}
      </span>
      
      {/* %値 */}
      <div className="text-center">
        {propertyConfig.hasRate ? (
          <span className={cn(
            "text-xs tabular-nums px-1 py-0.5 rounded",
            rateValue > 0 ? "bg-sky-50 text-sky-700" : "text-gray-400"
          )}>
            {rateValue > 0 ? rateValue : '-'}
          </span>
        ) : (
          <span className="text-gray-300">-</span>
        )}
      </div>
      
      {/* +値 */}
      <div className="text-center">
        {propertyConfig.hasFixed ? (
          <span className={cn(
            "text-xs tabular-nums px-1 py-0.5 rounded",
            fixedValue > 0 ? "bg-rose-50 text-rose-700" : "text-gray-400"
          )}>
            {fixedValue > 0 ? fixedValue : '-'}
          </span>
        ) : (
          <span className="text-gray-300">-</span>
        )}
      </div>
    </div>
  )
}
```

#### セクションヘッダーの追加

```typescript
// 2プロパティ/行表示用ヘッダー
const PropertyDoubleSectionHeader: React.FC = () => {
  return (
    <div className="grid grid-cols-[80px_40px_40px_80px_40px_40px] gap-2 py-2 px-2 border-b border-gray-200 bg-gray-50">
      <span className="text-xs font-medium text-gray-600">プロパティ</span>
      <span className="text-xs font-medium text-center text-sky-600">%</span>
      <span className="text-xs font-medium text-center text-rose-600">+</span>
      <span className="text-xs font-medium text-gray-600">プロパティ</span>
      <span className="text-xs font-medium text-center text-sky-600">%</span>
      <span className="text-xs font-medium text-center text-rose-600">+</span>
    </div>
  )
}
```

### データバインディングパターン

```typescript
// 2プロパティ/行表示用データ構造
interface PropertyDoubleDisplayData {
  property1: PropertyDisplayData
  property2?: PropertyDisplayData  // 奇数個の場合は空
}

interface PropertyDisplayData {
  propertyName: string
  rateValue: number | null
  fixedValue: number | null
  propertyConfig: PropertyConfig
}

// 2プロパティ/行形式への変換
const formatEquipmentBonusDoubleSection = (
  bonusData: EquipmentBonusResult
): PropertyDoubleDisplayData[] => {
  const singleProperties = Object.entries(bonusData).map(([key, value]) => {
    const config = PROPERTY_DISPLAY_CONFIG[key]
    const isRateProperty = key.endsWith('_Rate')
    const basePropertyName = isRateProperty ? key.replace('_Rate', '') : key
    
    return {
      propertyName: PROPERTY_LABELS[basePropertyName],
      rateValue: config.hasRate ? bonusData[`${basePropertyName}_Rate`] || null : null,
      fixedValue: config.hasFixed ? bonusData[basePropertyName] || null : null,
      propertyConfig: config
    }
  })
  
  // 2つずつペアに分割
  const pairs: PropertyDoubleDisplayData[] = []
  for (let i = 0; i < singleProperties.length; i += 2) {
    pairs.push({
      property1: singleProperties[i],
      property2: singleProperties[i + 1] || undefined
    })
  }
  
  return pairs
}
```

### データソース

```typescript
const { data } = useCalculatorStore()
const baseStats = data.baseStats
```

## レスポンシブ設計

### ブレークポイント対応
- **sm未満**: 1列表示
- **md以上**: 2列表示
- **lg以上**: 4列表示

### グリッドレイアウト
```css
.status-grid {
  display: grid;
  grid-template-columns: 1fr;                           /* mobile */
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);              /* tablet */
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);              /* desktop */
  }
}

/* 各セクションのサイズ調整 */
.basic-stats { @apply md:col-span-2 lg:col-span-2; }
.hp-details { @apply md:col-span-1 lg:col-span-1; }
.mp-details { @apply md:col-span-1 lg:col-span-1; }
.weapon-info { @apply md:col-span-2 lg:col-span-2; }
```

## スタイリング仕様

### コンテナ
```css
.status-preview {
  @apply bg-gray-50 border-b border-gray-200 
         transition-all duration-300 ease-in-out;
}

.status-container {
  @apply container mx-auto px-4 py-6;
}
```

### 計算式説明部分
```css
.formula-explanation {
  @apply mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md;
}

.formula-content {
  @apply text-sm text-blue-700;
}

.formula-note {
  @apply mt-1 text-xs;
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

### 表示データ
1. **基本ステータス**: 計算結果を含む全ステータス
2. **計算詳細**: HP・MPの段階的計算過程
3. **武器情報**: メイン・サブ武器の基本データ

## アクセシビリティ

### ARIA属性
```tsx
<div 
  role="region" 
  aria-label="ステータス計算結果"
  aria-live="polite"
>
  <StatSection 
    title="基本ステータス"
    role="group"
    aria-labelledby="basic-stats-title"
  />
</div>
```

### キーボードナビゲーション
- Tab順序: セクション間の論理的な移動
- 各StatSectionは独立したフォーカス領域

## パフォーマンス最適化

### メモ化
```typescript
const calculatedStats = useMemo(() => ({
  HP: hpCalculation.finalHP,
  MP: mpCalculation.finalMP,
  // other stats...
}), [hpCalculation, mpCalculation, baseStats])
```

### 計算最適化
- 必要時のみ再計算実行
- 中間結果の適切なキャッシュ
- 大量データでの性能考慮

## インタラクション設計

### 表示制御
- ResultToggleBarからの表示/非表示制御
- スライドダウン/アップアニメーション（300ms）
- フェードイン/アウト効果

### 値変更時の視覚フィードバック
```typescript
// 値が変更された項目のハイライト表示
interface StatItemProps {
  name: string
  value: number
  isChanged?: boolean  // 変更フラグ
  previousValue?: number  // 変更前の値
}

// 変更時のアニメーション
.stat-changed {
  @apply bg-yellow-100 border-yellow-300 
         transition-colors duration-500 ease-out
}
```

### 計算過程の詳細表示（将来実装）
- 各ステータス項目をクリックで詳細展開
- 計算式と中間値の表示
- ツールチップでの簡単な説明

## パフォーマンス最適化

### レンダリング最適化
```typescript
// StatSectionコンポーネントのメモ化
export const StatSection = React.memo<StatSectionProps>(({ 
  title, 
  stats, 
  className 
}) => {
  return (
    <div className={cn("bg-white rounded-lg border p-4", className)}>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(stats).map(([key, value]) => (
          <StatItem key={key} name={key} value={value} />
        ))}
      </div>
    </div>
  )
})

// StatItemコンポーネント
export const StatItem: React.FC<StatItemProps> = ({ 
  name, 
  value, 
  isChanged,
  previousValue 
}) => {
  return (
    <div className={cn(
      "flex justify-between items-center py-1 px-2 rounded",
      isChanged && "stat-changed"
    )}>
      <span className="text-sm text-gray-600">{name}</span>
      <span className="font-mono text-sm">
        {formatDisplayValue(value)}
      </span>
    </div>
  )
}
```

## エラー表示設計

### 計算エラー時の表示
```typescript
// エラー状態の表示コンポーネント
const ErrorDisplay: React.FC<{ error: string }> = ({ error }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
      <div className="text-red-600 font-medium">計算エラー</div>
      <div className="text-red-500 text-sm mt-1">{error}</div>
    </div>
  )
}

// 異常値の表示
const formatDisplayValue = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '---'
  if (isNaN(value)) return 'エラー'
  if (!isFinite(value)) return '∞'
  return value.toLocaleString()
}
```

### ローディング状態
```typescript
const LoadingDisplay: React.FC = () => {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gray-200 rounded-lg h-32" />
      ))}
    </div>
  )
}
```

## 実装例

### StatusPreviewコンポーネント
```typescript
export const StatusPreview: React.FC<StatusPreviewProps> = ({ isVisible }) => {
  const calculationResults = useCalculatorStore((state) => state.calculationResults)
  
  if (!isVisible) return null
  
  if (!calculationResults) {
    return <LoadingDisplay />
  }
  
  return (
    <div className="status-preview">
      <div className="status-container">
        <div className="status-grid">
          <StatSection 
            title="基本ステータス"
            stats={calculationResults.basicStats}
            className="basic-stats"
          />
          <StatSection 
            title="補正後ステータス"
            stats={calculationResults.adjustedStats}
            className="adjusted-stats"
          />
          <StatSection 
            title="装備品補正値1"
            stats={calculationResults.equipmentBonus1}
            className="equipment-bonus-1"
          />
          <StatSection 
            title="装備品補正値2"
            stats={calculationResults.equipmentBonus2}
            className="equipment-bonus-2"
          />
          <StatSection 
            title="装備品補正値3"
            stats={calculationResults.equipmentBonus3}
            className="equipment-bonus-3"
          />
        </div>
      </div>
    </div>
  )
}
```

## 装備品補正値計算仕様

### 計算方法

装備品補正値1〜3の各プロパティ値は、以下の4つのソースからの値を加算して算出される：

```typescript
// 各プロパティの計算式
equipmentBonusValue = equipmentValue + crystalValue + foodValue + buffValue
```

### データソース詳細

#### 1. 装備品/プロパティ (Equipment Properties)
- **ソース**: 装備フォームで設定された8スロットの装備品
- **対象**: メイン、ボディ、アディショナル、スペシャル、サブ武器、ファッション1-3
- **取得**: 各装備品の選択されたプロパティ値

#### 2. クリスタル (Crystal Properties)  
- **ソース**: クリスタルフォームで設定された8スロットのクリスタル
- **対象**: 武器クリスタル×2、防具クリスタル×2、アディショナルクリスタル×2、スペシャルクリスタル×2
- **取得**: 各クリスタルの効果値

#### 3. 料理 (Food Effects)
- **ソース**: 料理選択フォームで設定された料理とレベル
- **対象**: HP系、MP系、ATK系等の各種料理
- **取得**: 選択された料理の指定レベル効果値
- **詳細**: [料理データ設計書](../data/food-data.md)参照

#### 4. バフアイテム (Buff Items)
- **ソース**: バフアイテム選択フォームで設定されたアイテム
- **対象**: 各種バフアイテム、スキルバフ
- **取得**: 選択されたバフの効果値

### 計算実装例

```typescript
// 装備品補正値計算の実装例
interface BonusCalculationSources {
  equipment: Record<string, number>  // 装備品からの補正値
  crystal: Record<string, number>    // クリスタルからの補正値  
  food: Record<string, number>       // 料理からの補正値
  buff: Record<string, number>       // バフからの補正値
}

function calculateEquipmentBonus(
  propertyName: string,
  sources: BonusCalculationSources
): number {
  const equipmentValue = sources.equipment[propertyName] || 0
  const crystalValue = sources.crystal[propertyName] || 0
  const foodValue = sources.food[propertyName] || 0
  const buffValue = sources.buff[propertyName] || 0
  
  return equipmentValue + crystalValue + foodValue + buffValue
}

// 全プロパティの計算
function calculateAllEquipmentBonuses(
  sources: BonusCalculationSources
): Record<string, number> {
  const allProperties = new Set([
    ...Object.keys(sources.equipment),
    ...Object.keys(sources.crystal),
    ...Object.keys(sources.food),
    ...Object.keys(sources.buff)
  ])
  
  const result: Record<string, number> = {}
  
  for (const property of allProperties) {
    result[property] = calculateEquipmentBonus(property, sources)
  }
  
  return result
}
```

### 計算フロー

1. **データ収集**: 各フォームから現在の設定値を取得
2. **プロパティ集約**: 同一プロパティの値を4ソースから収集
3. **加算計算**: プロパティごとに4つの値を合計
4. **結果格納**: 装備品補正値1〜3の適切なセクションに配置
5. **UI更新**: StatusPreviewで計算結果を表示

### プロパティ分類

#### 装備品補正値1 (31プロパティ)
- **攻撃系**: ATK, MATK, 武器ATK, 物理貫通, 魔法貫通
- **属性系**: 属性威力, 抜刀威力, 近距離威力, 遠距離威力
- **クリティカル**: クリ率, クリダメ
- **ステータス**: STR, AGI, INT, DEX, VIT
- **速度系**: ASPD, CSPD, 安定率, 行動速度
- **命中回避**: 命中, 回避
- **HP/MP**: HP, MP, 攻撃MP回復
- **耐性**: 異常耐性, 物理耐性, 魔法耐性
- **ヘイト**: ヘイト+, ヘイト-

#### 装備品補正値2 (31プロパティ)  
- **ステータス依存攻撃**: ATK+(STR%), MATK+(STR%), ATK+(INT%), MATK+(INT%), etc.
- **属性耐性**: 無耐性, 火耐性, 水耐性, 風耐性, 地耐性, 光耐性, 闇耐性
- **ダメージ軽減**: 直線軽減, 突進軽減, 弾丸軽減, 周囲軽減, 範囲軽減, 痛床軽減, 隕石軽減, 射刃軽減, 吸引軽減, 爆発軽減
- **バリア**: 物理バリア, 魔法バリア, 割合バリア, バリア速度

#### 装備品補正値3 (8プロパティ)
- **追撃**: 物理追撃, 魔法追撃  
- **自然回復**: HP自然回復, MP自然回復
- **絶対系**: 絶対命中, 絶対回避
- **特殊**: 復帰短縮, 道具速度

### データ統合ポイント

#### aggregateAllBonuses関数での統合
```typescript
// src/utils/basicStatsCalculation.ts での実装
export function aggregateAllBonuses(
  equipmentBonuses: Record<string, number>,
  crystalBonuses: Record<string, number>, 
  foodBonuses: Record<string, number>,
  buffBonuses: Record<string, number>
): AllBonuses {
  // 4つのソースから値を集約して装備品補正値を計算
  const aggregated: Record<string, number> = {}
  
  // 全プロパティを収集
  const allKeys = new Set([
    ...Object.keys(equipmentBonuses),
    ...Object.keys(crystalBonuses),
    ...Object.keys(foodBonuses), 
    ...Object.keys(buffBonuses)
  ])
  
  // プロパティごとに4ソースの値を加算
  for (const key of allKeys) {
    aggregated[key] = (equipmentBonuses[key] || 0) +
                     (crystalBonuses[key] || 0) +
                     (foodBonuses[key] || 0) +
                     (buffBonuses[key] || 0)
  }
  
  return aggregated
}
```

## 更新履歴

| 日付 | 更新内容 | 備考 |
|------|----------|------|
| 2024-06-23 | StatusPreview独立設計書作成 | header-component.mdから分離 |
| 2024-06-23 | UI設計書に特化した内容に変更 | 計算ロジックをrequirements/に分離 |
| 2024-06-23 | 装備品補正値計算仕様を追加 | 4ソース加算方式の詳細化 |

## 関連ドキュメント
- [StatusPreview機能要件](../requirements/10_status-preview-requirements.md) - 機能仕様の詳細
- [基本ステータス計算式](../calculations/basic-stats.md) - 計算ロジックの詳細
- [ヘッダーコンポーネント設計](./header-component.md)
- [結果トグルバー設計](./result-toggle-bar.md)