# ステータス計算結果表示システム

## CalculationResultDisplayコンポーネント概要

**目的**: フォーム入力の調整と同時に計算結果をリアルタイムで確認できる統合表示システム

**主要機能**:
- 画面上部のトグルボタンによるスライドダウン表示制御
- 97項目の詳細ステータス情報を4つのセクションに整理表示
- 全入力フォームデータのリアルタイム統合・計算処理
- LocalStorageによる表示状態の永続化

## コンポーネント構造

```typescript
// src/components/calculation-result/CalculationResultDisplay.tsx

interface CalculationResultDisplayProps {
  // プロパティは不要（Zustandから直接データ取得）
}

interface CalculationResults {
  // 基本ステータス（29項目）
  basicStats: {
    HP: number
    MP: number
    ATK: number
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
```

## UI設計仕様

### レイアウト構造
```
┌─────────────────────────────────────┐
│ [▼] 計算結果を表示              │ ← トグルボタン（ヘッダー固定）
└─────────────────────────────────────┘
┌─────────────────────────────────────┐ ← スライドダウンエリア
│ ┌─────────────┐ ┌─────────────┐    │
│ │基本ステータス │ │補正後ステータス│    │
│ │(29項目)      │ │(8項目)       │    │
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

### アニメーション仕様
- **展開**: height: 0 → height: auto（duration: 300ms, ease-in-out）
- **収縮**: height: auto → height: 0（duration: 300ms, ease-in-out）
- **初期状態**: 収縮状態（非表示）

### レスポンシブ設計
- **デスクトップ**: 4カラム表示（基本ステータス | 補正後ステータス | 装備品補正値1 | 装備品補正値2）+ 装備品補正値3（独立行）
- **タブレット**: 2カラム表示（各セクションを2×3グリッド配置）
- **モバイル**: 1カラム表示（縦積み配置）

## データ統合処理仕様

### データソース統合
```typescript
// src/utils/calculationEngine.ts

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
```

## 状態管理統合

### Zustand Store拡張
```typescript
// src/stores/calculatorStore.ts

interface CalculatorStore {
  // 既存フィールド...
  
  // 計算結果キャッシュ
  calculationResults: CalculationResults | null
  
  // 計算結果の更新
  updateCalculationResults: () => void
  
  // 表示状態管理
  isCalculationResultVisible: boolean
  toggleCalculationResultVisibility: () => void
}

// リアルタイム計算の実装
const useCalculatorStore = create<CalculatorStore>((set, get) => ({
  // 既存実装...
  
  calculationResults: null,
  isCalculationResultVisible: false,
  
  updateCalculationResults: () => {
    const currentData = get().data
    const results = calculateResults(currentData)
    set({ calculationResults: results })
  },
  
  toggleCalculationResultVisibility: () => {
    set(state => ({
      isCalculationResultVisible: !state.isCalculationResultVisible
    }))
    // LocalStorageに状態を保存
    localStorage.setItem(
      'calculationResultVisible',
      JSON.stringify(!get().isCalculationResultVisible)
    )
  }
}))
```

## コンポーネント実装詳細

### ファイル構造
```
src/components/calculation-result/
├── CalculationResultDisplay.tsx    # メインコンポーネント
├── CalculationResultHeader.tsx     # トグルボタンヘッダー
├── CalculationResultContent.tsx    # 結果表示コンテンツ
├── StatSection.tsx                 # ステータスセクション汎用コンポーネント
└── StatItem.tsx                    # 個別ステータス項目コンポーネント
```

### コンポーネント責任分離
- **CalculationResultDisplay**: 全体の表示制御・アニメーション管理
- **CalculationResultHeader**: トグルボタンの表示・クリックハンドリング
- **CalculationResultContent**: 計算結果データの表示・レイアウト管理
- **StatSection**: セクション別のステータス表示（基本ステータス、補正後ステータス等）
- **StatItem**: 個別のステータス項目表示（名前、値、単位の表示）

## LocalStorage設計

### 保存データ構造
```typescript
// 表示状態の永続化
interface CalculationResultSettings {
  isVisible: boolean              // 表示/非表示状態
  lastToggleTime: string         // 最終切り替え時刻
}

// LocalStorageキー
const CALC_RESULT_SETTINGS_KEY = 'calculationResultSettings'
```

## パフォーマンス最適化

### 計算結果キャッシュ戦略
- データ変更検知: Zustandのサブスクリプション機能を活用
- 差分計算: 変更されたデータ部分のみ再計算
- メモ化: React.memoとuseMemoによるレンダリング最適化

### レンダリング最適化
```typescript
// StatSectionコンポーネントのメモ化
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

## ステータス項目詳細

### 基本ステータス（29項目）
- HP, MP, ATK, サブ基本ATK, 総ATK, ブリンガーAM
- MATK, 基本MATK, 安定率, サブ安定率
- クリティカル率, クリティカルダメージ, 魔法クリティカル率, 魔法クリティカルダメージ
- 総属性有利, 属性覚醒有利, ASPD, CSPD, HIT, FLEE
- 物理耐性, 魔法耐性, 異常耐性, 行動速度, 防御崩し, 先読み

### 補正後ステータス（8項目）
- STR, AGI, INT, DEX, VIT, CRT, MEN, TEC

### 装備品補正値1（31項目）
- 攻撃系: ATK, 物理貫通, MATK, 魔法貫通, 武器ATK, 属性威力
- 威力系: 抜刀威力, 近距離威力, 遠距離威力, クリティカルダメージ, クリティカル率
- ステータス系: STR, AGI, INT, DEX, VIT
- 速度系: ASPD, CSPD, 安定率, 行動速度
- 戦闘系: 命中, 回避, MP, 攻撃MP回復, HP
- 耐性系: 異常耐性, 物理耐性, 魔法耐性, ヘイト+, ヘイト-

### 装備品補正値2（32項目）
- ステータス連動: ATK+(STR/INT/VIT/AGI/DEX), MATK+(STR/INT/VIT/AGI/DEX)
- 属性耐性: 無/火/水/風/地/光/闇耐性
- ダメージ軽減: 直線/突進/弾丸/周囲/範囲/痛床/隕石/射刃/吸引/爆発軽減
- バリア系: 物理/魔法/割合バリア, バリア速度

### 装備品補正値3（8項目）
- 追撃系: 物理追撃, 魔法追撃
- 回復系: HP自然回復, MP自然回復
- 特殊系: 絶対命中, 絶対回避, 復帰短縮, 道具速度