# StatusPreview 実装ガイド

## 概要

StatusPreviewコンポーネントの実装に必要なTypeScriptコード例、実装指針、パフォーマンス最適化について記述する。

**メインUI設計**: [StatusPreview UI設計書](./status-preview.md)を参照  
**計算仕様**: [StatusPreview 計算仕様詳細](./status-preview-calculations.md)を参照  
**データ仕様**: [StatusPreview データ仕様](./status-preview-data.md)を参照

## UIコンポーネント設計

### PropertyDisplayコンポーネント

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

### セクションヘッダー

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

## データバインディングパターン

### 2プロパティ/行表示用データ構造

```typescript
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

## 計算実装例

### ASPD計算実装（ArmorType補正対応）

```typescript
function calculateASPD(
  stats: BaseStats,
  weapon: { weaponType: WeaponTypeEnum },
  adjustedStats: AdjustedStatsCalculation,
  bonuses: AllBonuses,
  armorType: ArmorType = 'normal'
): ASPDCalculationSteps {
  // 1. 武器種別ステータスASPD計算
  const weaponTypeKey = getWeaponTypeKey(weapon.weaponType)
  const weaponType = WEAPON_TYPES[weaponTypeKey]
  const statusASPD = weaponType.statusASPDFormula(adjustedStats)
  
  // 2. 武器補正値取得
  const weaponBaseCorrection = weaponType.aspdCorrection
  
  // 3. ArmorType補正計算（内部計算のみ）
  const armorTypeBonus = getArmorTypeASPDBonus(armorType)
  
  // 4. 実効ASPD%計算
  const aspdPercent = bonuses.AttackSpeed_Rate || 0
  const effectiveASPDPercent = aspdPercent + armorTypeBonus
  
  // 5. ASPD計算
  const aspdBeforePercent = stats.level + statusASPD + weaponBaseCorrection
  const aspdAfterPercent = Math.floor(aspdBeforePercent * (1 + effectiveASPDPercent / 100))
  const aspdFixed = bonuses.AttackSpeed || 0
  const finalASPD = aspdAfterPercent + aspdFixed
  
  return { 
    statusASPD, 
    weaponBaseCorrection, 
    armorTypeBonus,
    effectiveASPDPercent,
    finalASPD 
  }
}

// ArmorType補正値取得関数
function getArmorTypeASPDBonus(armorType: ArmorType): number {
  switch (armorType) {
    case 'light': return 50   // 軽量化: +50%
    case 'heavy': return -50  // 重量化: -50%
    case 'normal':
    default: return 0         // 通常: +0%
  }
}
```

### FLEE計算実装

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

function calculateFLEE(
  level: number,
  adjustedAGI: number,
  bodyEquipment: Equipment | null,
  allBonuses: AllBonuses = {}
): FLEECalculationSteps {
  // 1. 体装備状態の判定
  const { hasBodyEquipment, armorType } = getBodyEquipmentStatus(bodyEquipment)
  
  // 2. 基礎FLEE計算（4パターン）
  let baseFLEE: number
  
  if (!hasBodyEquipment) {
    // 体装備なし
    baseFLEE = Math.floor(75 + level * 3/2 + adjustedAGI * 2)
  } else {
    // 体装備あり（ArmorTypeに応じて分岐）
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
  
  // 3. 回避%適用（装備+クリスタ+バフアイテム、料理除外）
  const dodgePercent = allBonuses.Dodge_Rate || 0
  const fleeAfterPercent = Math.floor(baseFLEE * (1 + dodgePercent / 100))
  
  // 4. 回避固定値加算（装備+クリスタ+バフアイテム、料理除外）
  const dodgeFixed = allBonuses.Dodge || 0
  const finalFLEE = fleeAfterPercent + dodgeFixed
  
  return {
    level,
    adjustedAGI,
    hasBodyEquipment,
    armorType,
    baseFLEE,
    dodgePercent,
    fleeAfterPercent,
    dodgeFixed,
    finalFLEE,
  }
}

// 体装備の状態とArmorTypeを判定する関数
function getBodyEquipmentStatus(bodyEquipment: Equipment | null): {
  hasBodyEquipment: boolean
  armorType: ArmorType
} {
  if (!bodyEquipment || !bodyEquipment.id) {
    return { hasBodyEquipment: false, armorType: 'normal' }
  }
  
  return { 
    hasBodyEquipment: true, 
    armorType: bodyEquipment.armorType || 'normal' 
  }
}
```

### 装備品補正値計算実装

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

// aggregateAllBonuses関数での統合
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

## メインコンポーネント実装

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

## パフォーマンス最適化

### メモ化実装

```typescript
const calculatedStats = useMemo(() => ({
  HP: hpCalculation.finalHP,
  MP: mpCalculation.finalMP,
  // other stats...
}), [hpCalculation, mpCalculation, baseStats])

// StatusPreviewコンポーネント内でのFLEE計算統合
const fleeCalculation = useMemo(() => {
  return calculateFLEE(
    baseStats.level,
    adjustedStatsCalculation.AGI,
    data.equipment.body,  // 体装備データ
    allBonuses
  )
}, [baseStats.level, adjustedStatsCalculation.AGI, data.equipment.body, allBonuses])
```

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

## エラー処理

### エラー表示コンポーネント

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

## インタラクション設計

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

## アクセシビリティ

### ARIA属性の実装

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

## データソース

```typescript
const { data } = useCalculatorStore()
const baseStats = data.baseStats
```

## 武器種設定への追加項目

**ASPD計算対応:**
- `statusASPDFormula`: ステータスASPD計算関数
- `aspdCorrection`: 武器種補正値

**ArmorType設定への追加項目:**
- `armorType`: 体装備の防具の改造設定（'normal' | 'light' | 'heavy'）
- ArmorType補正は内部計算のみで使用され、UI表示には影響しない

## 重要な実装注意点

### FLEE計算
1. **INT()関数の使用**: 各計算段階でMath.floor()を使用して切り捨て処理を行う
2. **料理除外**: 料理からの回避補正は存在しないため、AllBonusesの計算時に料理データを除外
3. **ArmorType連動**: 体装備のArmorType変更時にFLEE値が即座に更新される
4. **体装備なし処理**: 体装備が選択されていない場合の特別な計算式を適用
5. **負数対応**: 重量化時の基礎FLEE計算で負数が発生する可能性があるため適切に処理

### ASPD計算
1. **ArmorType補正の内部処理**: UI表示のASPD%には影響しない
2. **武器種別対応**: 全11種の武器種に対応した計算式
3. **即座反映**: ArmorType変更時の自動更新対応

## 更新履歴

| 日付 | 更新内容 | 備考 |
|------|----------|------|
| 2025-06-28 | StatusPreview実装ガイドを専用ファイルに分離 | status-preview.mdからTypeScript実装例とコードを抽出 |

## 関連ドキュメント
- [StatusPreview UI設計書](./status-preview.md) - メインUI設計とレイアウト
- [StatusPreview 計算仕様詳細](./status-preview-calculations.md) - 各ステータスの計算仕様
- [StatusPreview データ仕様](./status-preview-data.md) - データ構造とインターフェース
- [基本ステータス計算式](../calculations/basic-stats.md) - 計算ロジックの詳細
- [速度系計算式](../calculations/speed-calculations.md) - ASPD・CSPD・行動速度計算の詳細