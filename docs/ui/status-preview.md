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

### 補正後ステータス（8項目）
```
┌─────── 補正後ステータス ─────┐
│ STR: 215      AGI: 165      │
│ INT: 210      DEX: 160      │
│ VIT: 205      CRT: 95       │
│ MEN: 115      TEC: 90       │
└─────────────────────────────┘
```

### 装備品補正値1（31プロパティ - 3列表示）
```
┌────── 装備品補正値1 ───────┐
│ プロパティ      %     +      │
│ ───────────────────── │
│ ATK           15   150    │
│ MATK          12   120    │
│ 武器ATK       10   200    │
│ 物理貫通      25    -     │
│ 魔法貫通      20    -     │
│ 属性威力      15    -     │
│ 抜刀威力      10    -     │
│ 近距離威力    8     -     │
│ 遠距離威力    5     -     │
│ クリダメ      20    5     │
│ クリ率        5     2     │
│ STR           10   15     │
│ AGI           8    15     │
│ INT           12   10     │
│ DEX           6    10     │
│ VIT           5    5      │
│ ASPD          15   200    │
│ CSPD          10   150    │
│ 安定率        5     -     │
│ 行動速度      5     -     │
│ 命中          8    34     │
│ 回避          6    29     │
│ HP            10   200    │
│ MP            8    100    │
│ 攻撃MP回復    3    2      │
│ 異常耐性      3     -     │
│ 物理耐性      5     -     │
│ 魔法耐性      3     -     │
│ ヘイト        15    -     │
└───────────────────────┘
```

### 装備品補正値2（16プロパティ - 3列表示）
```
┌────── 装備品補正値2 ───────┐
│ プロパティ      %     +      │
│ ───────────────────── │
│ ATK(STR)      8     -     │
│ MATK(STR)     6     -     │
│ ATK(INT)      10    -     │
│ MATK(INT)     12    -     │
│ ATK(VIT)      5     -     │
│ MATK(VIT)     4     -     │
│ ATK(AGI)      3     -     │
│ MATK(AGI)     2     -     │
│ ATK(DEX)      4     -     │
│ MATK(DEX)     3     -     │
│ 無耐性        5     -     │
│ 火耐性        8     -     │
│ 水耐性        6     -     │
│ 風耐性        7     -     │
│ 地耐性        5     -     │
│ 光耐性        9     -     │
│ 闇耐性        4     -     │
│ 直線軽減      3     -     │
│ 突進軽減      4     -     │
│ 弾丸軽減      2     -     │
│ 周囲軽減      5     -     │
│ 範囲軽減      3     -     │
│ 痛床軽減      2     -     │
│ 隕石軍減      1     -     │
│ 射刃軽減      2     -     │
│ 吸引軽減      1     -     │
│ 爆発軽減      3     -     │
│ 物理バリア    -    150    │
│ 魔法バリア    -    120    │
│ 割合バリア    -    5      │
│ バリア速度    10    -     │
└───────────────────────┘
```

### 装備品補正値3（7プロパティ - 3列表示）
```
┌────── 装備品補正値3 ───────┐
│ プロパティ      %     +      │
│ ───────────────────── │
│ 物理追撃      8     -     │
│ 魔法追撃      6     -     │
│ HP自然回復   12   15     │
│ MP自然回復   10   10     │
│ 絶対命中      8    5      │
│ 絶対回避      6    3      │
│ 復帰短縮      20   -     │
│ 道具速度      -   15     │
└───────────────────────┘
```

## データ表示仕様

### プロパティ表示パターン

#### 1. 3列レイアウトパターン

**基本構造**: `プロパティ名 | % | +`

```
プロパティ      %     +
─────────────────────
ATK           15   150     // 両方あり
HP            10    -      // %のみ
物理バリア    -    150     // +のみ
```

#### 2. 各パターンの表示例

**両方表示プロパティ**: 両方の列に値を表示
```
ATK           15   150
HP            10   200  
STR           5    15
```

**%のみプロパティ**: +列は「-」表示
```
ヘイト        15    -
火耐性        8     -
属性威力      15    -
```

**+のみプロパティ**: %列は「-」表示
```
道具速度      -    15
物理バリア    -   150
魔法バリア    -   120
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
    HP: number
    MP: number
    ATK: number
    baseATK: number
    subBaseATK: number
    totalATK: number
    bringerAM: number
    MATK: number
    baseMATK: number
    stabilityRate: number
    subStabilityRate: number
    criticalRate: number
    criticalDamage: number
    magicCriticalRate: number
    magicCriticalDamage: number
    totalElementAdvantage: number
    elementAwakeningAdvantage: number
    ASPD: number
    CSPD: number
    HIT: number
    FLEE: number
    physicalResistance: number
    magicalResistance: number
    ailmentResistance: number
    motionSpeed: number
    armorBreak: number
    anticipate: number
  }
  
  // 補正後ステータス（8項目）
  adjustedStats: {
    STR: number
    AGI: number
    INT: number
    DEX: number
    VIT: number
    CRT: number
    MEN: number
    TEC: number
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
const PropertySectionHeader: React.FC = () => {
  return (
    <div className="grid grid-cols-[100px_60px_60px] gap-2 py-2 px-2 border-b border-gray-200 bg-gray-50">
      <span className="text-xs font-medium text-gray-600">プロパティ</span>
      <span className="text-xs font-medium text-center text-sky-600">%</span>
      <span className="text-xs font-medium text-center text-rose-600">+</span>
    </div>
  )
}
```

### データバインディングパターン

```typescript
// 装備品補正値セクションの表示データ構造
interface EquipmentBonusDisplayData {
  propertyName: string
  rateValue: number | null  // %値（ない場合はnull）
  fixedValue: number | null // 固定値（ない場合はnull）
  propertyConfig: PropertyConfig
}

// 表示データの変換
const formatEquipmentBonusSection = (
  bonusData: EquipmentBonusResult
): EquipmentBonusDisplayData[] => {
  return Object.entries(bonusData).map(([key, value]) => {
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

## 更新履歴

| 日付 | 更新内容 | 備考 |
|------|----------|------|
| 2024-06-23 | StatusPreview独立設計書作成 | header-component.mdから分離 |
| 2024-06-23 | UI設計書に特化した内容に変更 | 計算ロジックをrequirements/に分離 |

## 関連ドキュメント
- [StatusPreview機能要件](../requirements/10_status-preview-requirements.md) - 機能仕様の詳細
- [基本ステータス計算式](../calculations/basic-stats.md) - 計算ロジックの詳細
- [ヘッダーコンポーネント設計](./header-component.md)
- [結果トグルバー設計](./result-toggle-bar.md)