# クリスタル選択時ダメージ差分プレビュー機能設計書

## 概要

CrystalForm、EquipmentForm、BuffItemFormにおいて、アイテム選択時にそのアイテムをセットした場合のダメージ差分をリアルタイムで表示する機能の設計書。

## 機能要件

### 基本機能
- **対象フォーム**: CrystalForm、EquipmentForm、BuffItemForm
- **表示位置**: 各アイテムカードの上部
- **表示内容**: 現在のダメージ最大値との差分
- **更新タイミング**: アイテム選択モーダル表示時、リアルタイム計算

### 表示仕様
- **正の差分**: `+1,234` (緑色)
- **負の差分**: `-567` (赤色)
- **差分なし**: `±0` (グレー色)
- **計算不可**: `---` (グレー色)

## 技術仕様

### データフロー

```typescript
// 1. 現在のダメージ計算結果を取得
const currentDamageResult = useCalculatorStore(state => state.calculationResults)
const currentMaxDamage = getCurrentMaxDamage(currentDamageResult)

// 2. 仮想的にアイテムをセットした状態でダメージを計算
const simulatedData = simulateItemEquip(currentData, targetItem, slotInfo)
const simulatedDamageResult = calculateDamagePreview(simulatedData)
const simulatedMaxDamage = getCurrentMaxDamage(simulatedDamageResult)

// 3. 差分を計算
const damageDifference = simulatedMaxDamage - currentMaxDamage
```

### 核心となる関数

#### 1. ダメージシミュレーション関数

```typescript
/**
 * アイテム装着シミュレーション
 */
export function simulateItemEquip(
  currentData: CalculatorData,
  item: Crystal | Equipment | BuffItem,
  slotInfo: SlotInfo
): CalculatorData {
  const simulatedData = JSON.parse(JSON.stringify(currentData)) // Deep copy
  
  switch (slotInfo.type) {
    case 'crystal':
      simulatedData.crystals[slotInfo.category][slotInfo.slot] = item as Crystal
      break
    case 'equipment':
      simulatedData.equipment[slotInfo.slot as EquipmentSlot] = item as Equipment
      break
    case 'buffItem':
      simulatedData.buffItems[slotInfo.category] = item as BuffItem
      break
  }
  
  return simulatedData
}

/**
 * ダメージプレビュー計算（軽量版）
 */
export function calculateDamagePreview(data: CalculatorData): DamagePreviewResult {
  // 基本ステータス計算（軽量版）
  const results = calculateResults(data)
  
  // ダメージ計算（現在のDamagePreviewと同じロジック）
  const damageInput = createDamageInputFromCalculatorData(data, results)
  const damageResult = calculateDamage(damageInput)
  
  return {
    maxDamage: damageResult.stabilityResult.maxDamage,
    minDamage: damageResult.stabilityResult.minDamage,
    baseDamage: damageResult.baseDamage
  }
}

/**
 * 現在の最大ダメージ取得
 */
export function getCurrentMaxDamage(results: CalculationResults | null): number {
  if (!results) return 0
  
  // 現在のDamagePreviewと同じロジックで最大ダメージを計算
  // 通常攻撃の最大ダメージを返す
  const damageInput = createDamageInputFromResults(results)
  const damageResult = calculateDamage(damageInput)
  
  return damageResult.stabilityResult.maxDamage
}
```

#### 2. フック定義

```typescript
/**
 * アイテム選択時のダメージ差分計算フック
 */
export function useDamageDifference(
  item: Crystal | Equipment | BuffItem | null,
  slotInfo: SlotInfo
) {
  const currentData = useCalculatorStore(state => state.data)
  const currentResults = useCalculatorStore(state => state.calculationResults)
  
  return useMemo(() => {
    if (!item || !currentResults) {
      return { difference: 0, isCalculating: false, error: null }
    }
    
    try {
      // 現在のダメージ
      const currentMaxDamage = getCurrentMaxDamage(currentResults)
      
      // シミュレーション
      const simulatedData = simulateItemEquip(currentData, item, slotInfo)
      const simulatedResult = calculateDamagePreview(simulatedData)
      
      // 差分計算
      const difference = simulatedResult.maxDamage - currentMaxDamage
      
      return { difference, isCalculating: false, error: null }
    } catch (error) {
      console.error('Damage difference calculation failed:', error)
      return { difference: 0, isCalculating: false, error: error as Error }
    }
  }, [item, currentData, currentResults, slotInfo])
}
```

#### 3. UIコンポーネント

```typescript
/**
 * ダメージ差分表示コンポーネント
 */
interface DamageDifferenceDisplayProps {
  item: Crystal | Equipment | BuffItem
  slotInfo: SlotInfo
  className?: string
}

export function DamageDifferenceDisplay({ 
  item, 
  slotInfo, 
  className = '' 
}: DamageDifferenceDisplayProps) {
  const { difference, isCalculating, error } = useDamageDifference(item, slotInfo)
  
  if (isCalculating) {
    return (
      <div className={`text-xs text-gray-400 ${className}`}>
        計算中...
      </div>
    )
  }
  
  if (error) {
    return (
      <div className={`text-xs text-gray-400 ${className}`}>
        ---
      </div>
    )
  }
  
  const formatDifference = (diff: number): string => {
    if (diff === 0) return '±0'
    return diff > 0 ? `+${diff.toLocaleString()}` : diff.toLocaleString()
  }
  
  const getColorClass = (diff: number): string => {
    if (diff > 0) return 'text-green-600'
    if (diff < 0) return 'text-red-600'
    return 'text-gray-400'
  }
  
  return (
    <div className={`text-xs font-medium ${getColorClass(difference)} ${className}`}>
      {formatDifference(difference)}
    </div>
  )
}
```

### スロット情報の型定義

```typescript
/**
 * スロット情報
 */
export interface SlotInfo {
  type: 'crystal' | 'equipment' | 'buffItem'
  category?: CrystalCategory | BuffItemCategory // crystal, buffItem用
  slot?: number | EquipmentSlot // crystal, equipment用
}

/**
 * ダメージプレビュー結果
 */
export interface DamagePreviewResult {
  maxDamage: number
  minDamage: number
  baseDamage: number
}
```

## 実装計画

### Phase 1: 基盤実装
1. **シミュレーション関数の実装**
   - `simulateItemEquip`
   - `calculateDamagePreview`
   - `getCurrentMaxDamage`

2. **フックの実装**
   - `useDamageDifference`

3. **UIコンポーネントの実装**
   - `DamageDifferenceDisplay`

### Phase 2: CrystalFormへの適用
1. **CrystalCardの更新**
   - カード上部にダメージ差分表示を追加
   - 選択モーダル内の各クリスタルカードに適用

2. **パフォーマンス最適化**
   - 計算結果のメモ化
   - 不要な再計算の防止

### Phase 3: 他フォームへの展開
1. **EquipmentFormへの適用**
   - 装備選択時のダメージ差分表示

2. **BuffItemFormへの適用**
   - バフアイテム選択時のダメージ差分表示

## パフォーマンス考慮事項

### 最適化ポイント
1. **計算の軽量化**
   - 必要最小限のステータス再計算
   - ダメージ計算の簡略化オプション

2. **メモ化**
   - アイテムごとの計算結果キャッシュ
   - 基本データ変更時のみ再計算

3. **非同期処理**
   - 重い計算のWorker化（将来）
   - 段階的な計算結果表示

### 制約事項
- **計算精度**: 完全なダメージ計算は重いため、簡略版を使用
- **更新頻度**: ベースデータ変更時のみ全体再計算
- **表示遅延**: 計算に時間がかかる場合は「計算中」表示

## テストケース

### 単体テスト
1. **シミュレーション関数**
   - 正常なアイテム装着シミュレーション
   - 不正なスロット指定のエラーハンドリング

2. **ダメージ差分計算**
   - 正の差分、負の差分、差分なしのケース
   - 計算エラー時の処理

### 統合テスト
1. **CrystalForm連携**
   - クリスタル選択時の差分表示
   - リアルタイム更新の動作確認

2. **パフォーマンステスト**
   - 大量のアイテム表示時の応答性
   - 連続操作時のメモリ使用量

## 将来の拡張

### 機能拡張
1. **比較モード**
   - 複数アイテムの同時比較
   - ソート機能（差分順）

2. **詳細表示**
   - ATK、クリティカル等の個別差分
   - グラフィカルな差分表示

3. **推奨アイテム**
   - 最適なアイテムの自動提案
   - ビルド最適化支援

## ファイル構成

```
src/
├── hooks/
│   └── useDamageDifference.ts          # ダメージ差分計算フック
├── utils/
│   ├── damageSimulation.ts             # シミュレーション関数群
│   └── damagePreviewCalculation.ts     # 軽量ダメージ計算
├── components/
│   ├── common/
│   │   └── DamageDifferenceDisplay.tsx # 差分表示コンポーネント
│   ├── crystal/
│   │   ├── CrystalCard.tsx            # 更新: 差分表示追加
│   │   └── CrystalSelectionModal.tsx   # 更新: 差分表示追加
│   ├── equipment/
│   │   └── EquipmentCard.tsx          # 将来: 差分表示追加
│   └── buff-item/
│       └── BuffItemCard.tsx           # 将来: 差分表示追加
└── types/
    └── damagePreview.ts               # 型定義
```

このように、段階的に実装し、最終的に全フォームで統一されたダメージ差分プレビュー機能を提供します。