# StatusPreview コンポーネント設計書

## 概要

ヘッダー下に配置されるステータス計算結果の詳細表示コンポーネント。98項目の詳細ステータス情報を4つのセクションに整理表示し、正確なトーラムオンライン計算式を使用したリアルタイム統合・計算処理を提供する。

**継承機能**: 削除されたCalculationResultDisplay.tsxの全機能を統合
- 全入力フォームデータのリアルタイム統合・計算処理
- 98項目の詳細ステータス情報の表示
- 4つのセクション（基本ステータス、補正後ステータス、装備品補正値1-3）への整理表示

## コンポーネント構成

### StatusPreview（メインコンポーネント）
- **ファイル**: `src/components/layout/StatusPreview.tsx`
- **目的**: 正確な計算式による詳細ステータス表示
- **位置**: ResultToggleBar経由で表示制御

### 依存コンポーネント
- **StatSection**: 統一されたステータス表示セクション
- **StatItem**: 個別ステータス項目表示

## 表示内容（統合後の97項目ステータス）

### レイアウト構造
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
│ HP: 14,413      MP: 459       │
│ ATK: 2,341      基礎ATK: 1,890 │
│ MATK: 1,876                   │
│ サブ基本ATK: 156              │
│ 総ATK: 2,497                  │
│ ブリンガーAM: 124            │
│ 基本MATK: 1,542              │
│ 安定率: 85%                   │
│ サブ安定率: 75%              │
│ クリティカル率: 12%          │
│ クリティカルダメージ: 150%    │
│ 魔法クリティカル率: 8%       │
│ 魔法クリティカルダメージ: 130% │
│ 総属性有利: 25%              │
│ 属性覚醒有利: 15%            │
│ ASPD: 1,200    CSPD: 890     │
│ HIT: 234       FLEE: 189     │
│ 物理耐性: 15%   魔法耐性: 12% │
│ 異常耐性: 8%                 │
│ 行動速度: 105%               │
│ 防御崩し: 5%                 │
│ 先読み: 3%                   │
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

### 装備品補正値1（31項目）
```
┌─────── 装備品補正値1 ─────────┐
│ ATK: +150      物理貫通: +25 │
│ MATK: +120     魔法貫通: +20 │
│ 武器ATK: +200               │
│ 属性威力: +15%              │
│ 抜刀威力: +10%              │
│ 近距離威力: +8%             │
│ 遠距離威力: +5%             │
│ クリティカルダメージ: +20%  │
│ クリティカル率: +5%         │
│ STR: +15       AGI: +15     │
│ INT: +10       DEX: +10     │
│ VIT: +5                     │
│ ASPD: +200     CSPD: +150   │
│ 安定率: +5%                 │
│ 行動速度: +5%               │
│ 命中: +34      回避: +29     │
│ MP: +100                    │
│ 攻撃MP回復: +2              │
│ HP: +200                    │
│ 異常耐性: +3%               │
│ 物理耐性: +5%               │
│ 魔法耐性: +3%               │
│ ヘイト+: +15   ヘイト-: +10  │
└─────────────────────────────┘
```

### 装備品補正値2（32項目）
```
┌─────── 装備品補正値2 ─────────┐
│ ATK+(STR%): +8%             │
│ MATK+(STR%): +6%            │
│ ATK+(INT%): +10%            │
│ MATK+(INT%): +12%           │
│ ATK+(VIT%): +5%             │
│ MATK+(VIT%): +4%            │
│ ATK+(AGI%): +3%             │
│ MATK+(AGI%): +2%            │
│ ATK+(DEX%): +4%             │
│ MATK+(DEX%): +3%            │
│ 無耐性: +5%    火耐性: +8%   │
│ 水耐性: +6%    風耐性: +7%   │
│ 地耐性: +5%    光耐性: +9%   │
│ 闇耐性: +4%                 │
│ 直線軽減: +3%  突進軽減: +4% │
│ 弾丸軽減: +2%  周囲軽減: +5% │
│ 範囲軽減: +3%  痛床軽減: +2% │
│ 隕石軽減: +1%  射刃軽減: +2% │
│ 吸引軽減: +1%  爆発軽減: +3% │
│ 物理バリア: +150            │
│ 魔法バリア: +120            │
│ 割合バリア: +5%             │
│ バリア速度: +10%            │
└─────────────────────────────┘
```

### 装備品補正値3（8項目）
```
┌─────── 装備品補正値3 ─────────┐
│ 物理追撃: +8%               │
│ 魔法追撃: +6%               │
│ HP自然回復: +15             │
│ MP自然回復: +10             │
│ 絶対命中: +5                │
│ 絶対回避: +3                │
│ 復帰短縮: +20%              │
│ 道具速度: +15%              │
└─────────────────────────────┘
```

## 計算ロジック

### HP計算式
```
HP = INT(INT(93+(補正後VIT+22.41)*Lv/3)*(1+HP%/100))+HP固定値
```

**計算段階:**
1. 補正後VIT = ステータスVIT × (1 + VIT%/100) + VIT固定値
2. HP基本値 = INT(93 + (補正後VIT + 22.41) × Lv / 3)
3. HP%適用後 = INT(HP基本値 × (1 + HP%/100))
4. 最終HP = HP%適用後 + HP固定値

### MP計算式
```
MP = INT(INT(Lv+99+TEC+総INT/10)*(1+MP%/100))+MP固定値
```

**計算段階:**
1. MP基本値 = INT(Lv + 99 + TEC + 総INT/10)
2. MP%適用後 = INT(MP基本値 × (1 + MP%/100))
3. 最終MP = MP%適用後 + MP固定値

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

### 計算ロジック統合

```typescript
import { calculateHP, calculateMP, aggregateAllBonuses } from '@/utils/basicStatsCalculation'
import { calculateResults } from '@/utils/calculationEngine'

// 統合計算処理（CalculationResultDisplay.tsxから継承）
export const calculateResults = (data: CalculatorData): CalculationResults => {
  // 1. 基本ステータスの取得
  const baseStats = data.baseStats
  
  // 2. 武器データの統合
  const weaponStats = combineWeaponStats(data.mainWeapon, data.subWeapon)
  
  // 3. 装備プロパティの統合
  const equipmentProps = combineEquipmentProperties(data.equipment)
  
  // 4. クリスタルプロパティの統合
  const crystalProps = combineCrystalProperties(data.crystals)
  
  // 5. 料理効果の統合
  const foodEffects = combineFoodEffects(data.food)
  
  // 6. バフスキル効果の統合
  const buffSkillEffects = combineBuffSkillEffects(data.buffSkills)
  
  // 7. バフアイテム効果の統合
  const buffItemEffects = combineBuffItemEffects(data.buffItems)
  
  // 8. レジスタ他効果の統合
  const registerEffects = combineRegisterEffects(data.register)
  
  // 9. 全効果の統合計算
  return integrateAllEffects({
    baseStats,
    weaponStats,
    equipmentProps,
    crystalProps,
    foodEffects,
    buffSkillEffects,
    buffItemEffects,
    registerEffects
  })
}

// StatusPreviewでの使用方法
const calculationResults = useCalculatorStore((state) => state.calculationResults)

// 現在実装済み: HP・MP計算
const allBonuses = aggregateAllBonuses(
  {}, // equipment bonuses（将来実装）
  {}, // crystal bonuses（将来実装）
  {}, // food bonuses（将来実装）
  {}  // buff bonuses（将来実装）
)

const hpCalculation = calculateHP(baseStats, allBonuses)
const mpCalculation = calculateMP(baseStats, allBonuses)
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

## 将来拡張

### Phase 2: 98項目完全計算実装
```typescript
// 全ステータス計算エンジンの実装
const calculationResults = calculateResults(data)

// 4つのセクションすべての表示
<StatSection 
  title={SECTION_TITLES.basicStats}
  stats={calculationResults.basicStats}
  labels={STAT_LABELS.basicStats}
/>
<StatSection 
  title={SECTION_TITLES.adjustedStats}
  stats={calculationResults.adjustedStats}
  labels={STAT_LABELS.adjustedStats}
/>
<StatSection 
  title={SECTION_TITLES.equipmentBonus1}
  stats={calculationResults.equipmentBonus1}
  labels={STAT_LABELS.equipmentBonus1}
/>
// equipmentBonus2, equipmentBonus3も同様
```

### Phase 3: 補正値自動集計
```typescript
// 装備・クリスタ・料理・バフから自動集計
const allBonuses = aggregateAllBonuses(
  calculateEquipmentBonuses(data.equipment),
  calculateCrystalBonuses(data.crystals),
  calculateFoodBonuses(data.foods),
  calculateBuffBonuses(data.buffs)
)
```

### Phase 4: リアルタイム更新
- フォーム入力変更時の即座な計算更新
- アニメーション付きの値変更表示
- 計算差分のハイライト表示
- 変更された項目の視覚的ハイライト

### Phase 5: 詳細表示機能
- 計算過程の詳細展開表示
- デバッグモードでの全中間値表示
- 計算式の対話的説明
- 複数ビルドパターンの比較表示

## パフォーマンス最適化

### 計算結果キャッシュ戦略
```typescript
// Zustandでの計算結果キャッシュ
interface CalculatorStore {
  calculationResults: CalculationResults | null
  updateCalculationResults: () => void
}

const useCalculatorStore = create<CalculatorStore>((set, get) => ({
  calculationResults: null,
  
  updateCalculationResults: () => {
    const currentData = get().data
    const results = calculateResults(currentData)
    set({ calculationResults: results })
  }
}))
```

### レンダリング最適化
```typescript
// StatSectionのメモ化（CalculationResultDisplay.tsxから継承）
export const StatSection = React.memo<StatSectionProps>(({ 
  title, 
  stats, 
  className 
}) => {
  return (
    <div className={className}>
      <h3>{title}</h3>
      {Object.entries(stats).map(([key, value]) => (
        <StatItem key={key} name={key} value={value} />
      ))}
    </div>
  )
}, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.stats) === JSON.stringify(nextProps.stats)
})
```

### 差分計算の実装
- データ変更検知: Zustandのサブスクリプション機能を活用
- 変更されたデータ部分のみ再計算
- メモ化: React.memoとuseMemoによるレンダリング最適化

## エラーハンドリング

### 計算エラー対応
```typescript
try {
  const hpCalculation = calculateHP(baseStats, allBonuses)
} catch (error) {
  console.error('HP計算エラー:', error)
  // フォールバック値の使用
}
```

### 表示エラー対応
- 異常値に対する適切な表示
- 計算不可能な場合のユーザー通知
- グレースフルな劣化

## 更新履歴

| 日付 | 更新内容 | 備考 |
|------|----------|------|
| 2024-06-23 | StatusPreview独立設計書作成 | header-component.mdから分離 |
| 2024-06-23 | 正確なHP・MP計算式実装 | ゲーム内計算式完全対応 |
| 2024-06-23 | CalculationResults型定義統合 | calculation-result-system.mdから97項目仕様を継承 |
| 2024-06-23 | CalculationResultDisplay.tsx機能統合 | 削除されたコンポーネントの全機能をStatusPreviewに統合 |
| 2024-06-23 | 基礎ATK項目追加 | 基本ステータスに基礎ATK(baseATK)を追加、30項目→98項目合計に更新 |

## 関連ドキュメント
- [基本ステータス計算式](../calculations/basic-stats.md)
- [基本ステータス計算システム](../technical/basic-stats-calculation.md)
- [ステータス計算結果表示システム](../technical/calculation-result-system.md) - 97項目仕様の詳細
- [ヘッダーコンポーネント設計](./header-component.md)
- [結果トグルバー設計](./result-toggle-bar.md)