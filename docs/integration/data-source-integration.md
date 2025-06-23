# データソース統合設計書

## 概要

装備品補正値計算における4つのデータソース（装備品・クリスタ・料理・バフアイテム）の統合設計。StatusPreviewでの計算に必要なデータを各フォームから取得し、統一的な形式で処理する仕組みを定義する。

## 統合アーキテクチャ

### データフロー
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│装備フォーム  │  │クリスタル    │  │料理フォーム  │  │バフフォーム  │
│             │  │フォーム      │  │             │  │             │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
       │                │                │                │
       │ equipment      │ crystal        │ food           │ buff
       │ bonuses        │ bonuses        │ bonuses        │ bonuses
       │                │                │                │
       ▼                ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                aggregateAllBonuses()                             │
│              (4ソース統合計算エンジン)                            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│            calculateEquipmentBonuses()                           │
│          (装備品補正値1〜3分割計算)                              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   StatusPreview                                 │
│              (2プロパティ/行表示)                                │
└─────────────────────────────────────────────────────────────────┘
```

## データソース仕様

### 1. 装備品データソース

#### データ構造
```typescript
interface EquipmentBonusSource {
  // 装備スロット別データ取得
  main: EquipmentSlotBonus      // メイン武器
  body: EquipmentSlotBonus      // ボディ
  additional: EquipmentSlotBonus // アディショナル
  special: EquipmentSlotBonus   // スペシャル
  sub: EquipmentSlotBonus       // サブ武器
  fashion1: EquipmentSlotBonus  // ファッション1
  fashion2: EquipmentSlotBonus  // ファッション2
  fashion3: EquipmentSlotBonus  // ファッション3
}

interface EquipmentSlotBonus {
  equipmentId?: string          // 装備品ID
  selectedProperties: Array<{   // 選択されたプロパティ
    propertyId: string
    value: number
    isPercentage: boolean
  }>
  refinementLevel: number       // 精錬レベル (0-15)
}
```

#### 取得方法
```typescript
// Zustandストアから取得
const equipmentData = useCalculatorStore((state) => state.data.equipment)

function getEquipmentBonuses(equipmentData: EquipmentData): Partial<AllBonuses> {
  const bonuses: Partial<AllBonuses> = {}
  
  // 8スロット分のプロパティを統合
  const allSlots = [
    equipmentData.main,
    equipmentData.body,
    equipmentData.additional,
    equipmentData.special,
    equipmentData.sub,
    equipmentData.fashion1,
    equipmentData.fashion2,
    equipmentData.fashion3
  ]
  
  for (const slot of allSlots) {
    if (!slot.selectedProperties) continue
    
    for (const prop of slot.selectedProperties) {
      const key = prop.isPercentage ? `${prop.propertyId}_Rate` : prop.propertyId
      bonuses[key] = (bonuses[key] || 0) + prop.value
    }
  }
  
  return bonuses
}
```

### 2. クリスタルデータソース

#### データ構造
```typescript
interface CrystalBonusSource {
  weapon1: CrystalSlotBonus     // 武器クリスタル1
  weapon2: CrystalSlotBonus     // 武器クリスタル2
  armor1: CrystalSlotBonus      // 防具クリスタル1
  armor2: CrystalSlotBonus      // 防具クリスタル2
  additional1: CrystalSlotBonus // アディショナル1
  additional2: CrystalSlotBonus // アディショナル2
  special1: CrystalSlotBonus    // スペシャル1
  special2: CrystalSlotBonus    // スペシャル2
}

interface CrystalSlotBonus {
  crystalId?: string            // クリスタルID
  effects: Array<{              // クリスタル効果
    propertyId: string
    value: number
    isPercentage: boolean
  }>
}
```

#### 取得方法
```typescript
const crystalData = useCalculatorStore((state) => state.data.crystals)

function getCrystalBonuses(crystalData: CrystalData): Partial<AllBonuses> {
  const bonuses: Partial<AllBonuses> = {}
  
  // 8スロット分のクリスタル効果を統合
  const allSlots = [
    crystalData.weapon1,
    crystalData.weapon2,
    crystalData.armor1,
    crystalData.armor2,
    crystalData.additional1,
    crystalData.additional2,
    crystalData.special1,
    crystalData.special2
  ]
  
  for (const slot of allSlots) {
    if (!slot.effects) continue
    
    for (const effect of slot.effects) {
      const key = effect.isPercentage ? `${effect.propertyId}_Rate` : effect.propertyId
      bonuses[key] = (bonuses[key] || 0) + effect.value
    }
  }
  
  return bonuses
}
```

### 3. 料理データソース

#### データ構造
```typescript
interface FoodBonusSource {
  selectedFoods: Array<{         // 選択中の料理
    foodId: string              // 料理ID
    level: number               // 料理レベル (1-10)
    propertyType: string        // 効果プロパティ
    value: number               // 効果値
    isPercentage: boolean       // %効果かどうか
  }>
}
```

#### 取得方法
```typescript
const foodData = useCalculatorStore((state) => state.data.food)

function getFoodBonuses(foodData: FoodData): Partial<AllBonuses> {
  const bonuses: Partial<AllBonuses> = {}
  
  for (const food of foodData.selectedFoods) {
    const key = food.isPercentage ? `${food.propertyType}_Rate` : food.propertyType
    bonuses[key] = (bonuses[key] || 0) + food.value
  }
  
  return bonuses
}
```

### 4. バフアイテムデータソース

#### データ構造
```typescript
interface BuffBonusSource {
  activeBuffs: Array<{           // アクティブなバフ
    buffId: string              // バフID
    duration: number            // 残り時間（秒）
    effects: Array<{            // バフ効果
      propertyId: string
      value: number
      isPercentage: boolean
    }>
  }>
}
```

#### 取得方法
```typescript
const buffData = useCalculatorStore((state) => state.data.buffs)

function getBuffBonuses(buffData: BuffData): Partial<AllBonuses> {
  const bonuses: Partial<AllBonuses> = {}
  
  for (const buff of buffData.activeBuffs) {
    // 時間切れバフは除外
    if (buff.duration <= 0) continue
    
    for (const effect of buff.effects) {
      const key = effect.isPercentage ? `${effect.propertyId}_Rate` : effect.propertyId
      bonuses[key] = (bonuses[key] || 0) + effect.value
    }
  }
  
  return bonuses
}
```

## 統合実装

### StatusPreview での実装

```typescript
// src/components/layout/StatusPreview.tsx
export default function StatusPreview({ isVisible }: StatusPreviewProps) {
  const { data } = useCalculatorStore()
  
  if (!isVisible) return null
  
  // 4つのデータソースから補正値を取得
  const equipmentBonuses = getEquipmentBonuses(data.equipment)
  const crystalBonuses = getCrystalBonuses(data.crystals)
  const foodBonuses = getFoodBonuses(data.food)
  const buffBonuses = getBuffBonuses(data.buffs)
  
  // 全補正値を統合
  const allBonuses = aggregateAllBonuses(
    equipmentBonuses,
    crystalBonuses,
    foodBonuses,
    buffBonuses,
  )
  
  // 装備品補正値1〜3を計算
  const { equipmentBonus1, equipmentBonus2, equipmentBonus3 } = 
    calculateEquipmentBonuses(
      equipmentBonuses,
      crystalBonuses,
      foodBonuses,
      buffBonuses,
    )
  
  // HP・MP計算
  const hpCalculation = calculateHP(data.baseStats, allBonuses)
  const mpCalculation = calculateMP(data.baseStats, allBonuses)
  
  // UI表示...
}
```

### データ取得ユーティリティ関数

```typescript
// src/utils/dataSourceIntegration.ts
export {
  getEquipmentBonuses,
  getCrystalBonuses,
  getFoodBonuses,
  getBuffBonuses
}

// 全データソースを一括取得するヘルパー
export function getAllDataSourceBonuses(data: CalculatorData) {
  return {
    equipment: getEquipmentBonuses(data.equipment),
    crystal: getCrystalBonuses(data.crystals),
    food: getFoodBonuses(data.food),
    buff: getBuffBonuses(data.buffs)
  }
}
```

## エラーハンドリング

### データ不整合対応
```typescript
function getEquipmentBonuses(equipmentData: EquipmentData): Partial<AllBonuses> {
  try {
    const bonuses: Partial<AllBonuses> = {}
    
    // nullチェック
    if (!equipmentData) return bonuses
    
    // 各スロットの安全な処理
    const slots = Object.values(equipmentData).filter(Boolean)
    
    for (const slot of slots) {
      if (!slot?.selectedProperties) continue
      
      for (const prop of slot.selectedProperties) {
        if (!prop?.propertyId || typeof prop.value !== 'number') continue
        
        const key = prop.isPercentage ? `${prop.propertyId}_Rate` : prop.propertyId
        bonuses[key] = (bonuses[key] || 0) + prop.value
      }
    }
    
    return bonuses
  } catch (error) {
    console.error('Equipment bonus calculation error:', error)
    return {}
  }
}
```

### バリデーション
```typescript
function validatePropertyValue(value: number, propertyId: string): number {
  // 数値チェック
  if (typeof value !== 'number' || isNaN(value)) return 0
  
  // 範囲チェック（プロパティ別）
  if (propertyId.includes('Rate')) {
    // %系は-100〜1000の範囲
    return Math.max(-100, Math.min(1000, value))
  } else {
    // 固定値系は-9999〜9999の範囲
    return Math.max(-9999, Math.min(9999, value))
  }
}
```

## パフォーマンス最適化

### メモ化による最適化
```typescript
import { useMemo } from 'react'

export default function StatusPreview({ isVisible }: StatusPreviewProps) {
  const { data } = useCalculatorStore()
  
  // データソース別のメモ化
  const equipmentBonuses = useMemo(() => 
    getEquipmentBonuses(data.equipment), 
    [data.equipment]
  )
  
  const crystalBonuses = useMemo(() => 
    getCrystalBonuses(data.crystals), 
    [data.crystals]
  )
  
  const foodBonuses = useMemo(() => 
    getFoodBonuses(data.food), 
    [data.food]
  )
  
  const buffBonuses = useMemo(() => 
    getBuffBonuses(data.buffs), 
    [data.buffs]
  )
  
  // 統合計算のメモ化
  const calculationResults = useMemo(() => {
    const allBonuses = aggregateAllBonuses(
      equipmentBonuses,
      crystalBonuses,
      foodBonuses,
      buffBonuses,
    )
    
    return {
      allBonuses,
      equipmentBonuses: calculateEquipmentBonuses(
        equipmentBonuses,
        crystalBonuses,
        foodBonuses,
        buffBonuses,
      ),
      hpCalculation: calculateHP(data.baseStats, allBonuses),
      mpCalculation: calculateMP(data.baseStats, allBonuses),
    }
  }, [equipmentBonuses, crystalBonuses, foodBonuses, buffBonuses, data.baseStats])
  
  // 表示処理...
}
```

## テスト仕様

### 単体テスト
```typescript
describe('データソース統合', () => {
  test('装備品補正値計算', () => {
    const mockEquipmentData = {
      main: {
        selectedProperties: [
          { propertyId: 'ATK', value: 100, isPercentage: false },
          { propertyId: 'ATK', value: 15, isPercentage: true }
        ]
      }
    }
    
    const result = getEquipmentBonuses(mockEquipmentData)
    
    expect(result.ATK).toBe(100)
    expect(result.ATK_Rate).toBe(15)
  })
  
  test('4ソース統合計算', () => {
    const equipment = { HP: 100 }
    const crystal = { HP: 50 }
    const food = { HP: 200 }
    const buff = { HP: 25 }
    
    const result = aggregateAllBonuses(equipment, crystal, food, buff)
    
    expect(result.HP).toBe(375) // 100 + 50 + 200 + 25
  })
})
```

## ファイル構成

```
src/
├── utils/
│   ├── dataSourceIntegration.ts    # データ取得・統合ユーティリティ
│   ├── equipmentBonusCalculator.ts # 装備品補正値計算
│   ├── crystalBonusCalculator.ts   # クリスタル補正値計算
│   ├── foodBonusCalculator.ts      # 料理補正値計算
│   └── buffBonusCalculator.ts      # バフ補正値計算
├── types/
│   └── bonusCalculation.ts         # 補正値計算用型定義
└── components/layout/
    └── StatusPreview.tsx           # 統合表示コンポーネント
```

## 実装優先順位

1. **Phase 1**: データ取得ユーティリティ関数の実装
2. **Phase 2**: StatusPreview での統合処理実装
3. **Phase 3**: エラーハンドリングとバリデーション追加
4. **Phase 4**: パフォーマンス最適化（メモ化）
5. **Phase 5**: テスト実装とデバッグ

## 関連ドキュメント

- [基本ステータス計算式](../calculations/basic-stats.md) - 計算エンジンとの連携
- [StatusPreview設計](../ui/status-preview.md) - UI表示仕様
- [料理データ設計](../data/food-data.md) - 料理データ構造
- [Zustandストア設計](../store/calculator-store.md) - データ管理仕様