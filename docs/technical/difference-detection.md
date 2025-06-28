# 差分検知システム設計書

## 概要

フォームのフォーカス変更ではなく、実際のデータ差分を検知して保存ボタンの表示を制御するシステムの詳細設計。

## 基本設計原則

### 1. 正確性優先
- 保存済みデータと現在データの完全な比較
- 深いオブジェクト比較による正確な差分検知
- フォーカス変更や入力中の状態は差分判定に影響しない

### 2. パフォーマンス配慮
- デバウンス処理による頻繁な比較処理の抑制
- 軽量比較オプションの提供
- 必要時のみの差分チェック実行

### 3. UX向上
- 差分がある場合のみ保存ボタンを表示
- 保存完了時の自動非表示
- 明確な視覚的フィードバック

## データ構造

### CalculatorStore拡張

```typescript
interface CalculatorStore extends CalculatorData {
  // === 既存状態 ===
  data: CalculatorData
  hasUnsavedChanges: boolean
  
  // === 差分検知関連状態（新規追加） ===
  lastSavedData: CalculatorData | null    // 保存済みデータのスナップショット
  hasRealChanges: boolean                 // 実際の差分フラグ
  
  // === 差分検知メソッド（新規追加） ===
  updateLastSavedData: (data: CalculatorData) => void
  checkForRealChanges: () => boolean
  setHasRealChanges: (value: boolean) => void
}
```

### 差分検知の実装

```typescript
// src/stores/calculatorStore.ts

import { isEqual } from 'lodash-es'

const checkForRealChanges = (): boolean => {
  const { data, lastSavedData } = get()
  
  if (!lastSavedData) {
    // 初回の場合、デフォルトデータと比較
    const defaultData = getDefaultCalculatorData()
    return !isEqual(data, defaultData)
  }
  
  // 保存済みデータと現在データの深い比較
  return !isEqual(data, lastSavedData)
}

const setHasRealChanges = (value: boolean): void => {
  set(
    { hasRealChanges: value },
    false,
    'setHasRealChanges'
  )
}

const updateLastSavedData = (data: CalculatorData): void => {
  // 深いコピーでスナップショットを保存
  set(
    { 
      lastSavedData: structuredClone(data),
      hasRealChanges: false  // 保存時は差分なし
    },
    false,
    'updateLastSavedData'
  )
}
```

## 統合フロー

### 1. データ更新時の自動差分チェック

```typescript
// 全ての更新メソッドで差分チェックを自動実行
const updateBaseStats = (baseStats: BaseStats): void => {
  set(
    (state) => {
      const newData = { ...state.data, baseStats }
      const hasChanges = !isEqual(newData, state.lastSavedData)
      
      return {
        data: newData,
        hasUnsavedChanges: true,
        hasRealChanges: hasChanges
      }
    },
    false,
    'updateBaseStats'
  )
}

const updateEquipment = (equipment: EquipmentData): void => {
  set(
    (state) => {
      const newData = { ...state.data, equipment }
      const hasChanges = !isEqual(newData, state.lastSavedData)
      
      return {
        data: newData,
        hasUnsavedChanges: true,
        hasRealChanges: hasChanges
      }
    },
    false,
    'updateEquipment'
  )
}

// 他の全ての更新メソッドも同様のパターンで実装
```

### 2. 保存時の処理

```typescript
const saveCurrentData = async (): Promise<void> => {
  try {
    const { data } = get()
    
    // LocalStorageに保存
    await saveDataToStorage(data)
    
    // 差分状態をリセット
    updateLastSavedData(data)
    
    set(
      { 
        hasUnsavedChanges: false,
        hasRealChanges: false
      },
      false,
      'saveCurrentData'
    )
    
    // 保存成功フィードバック
    showSuccessMessage('データを保存しました')
    
  } catch (error) {
    console.error('保存エラー:', error)
    showErrorMessage('保存に失敗しました')
  }
}
```

### 3. 読み込み時の処理

```typescript
const loadSaveData = async (saveId: string): Promise<void> => {
  try {
    // セーブデータを読み込み
    const savedData = await loadDataFromStorage(saveId)
    
    // データを設定
    set({ data: savedData }, false, 'loadSaveData')
    
    // 差分状態をリセット
    updateLastSavedData(savedData)
    
    set(
      { 
        hasUnsavedChanges: false,
        hasRealChanges: false
      },
      false,
      'resetChangeFlags'
    )
    
  } catch (error) {
    console.error('読み込みエラー:', error)
    showErrorMessage('読み込みに失敗しました')
  }
}
```

## React Hook Form統合

### useSaveDataManager Hook拡張

```typescript
// src/hooks/useSaveDataManager.ts

export const useSaveDataManager = () => {
  const hasUnsavedChanges = useCalculatorStore(state => state.hasUnsavedChanges)
  const hasRealChanges = useCalculatorStore(state => state.hasRealChanges)
  const checkForRealChanges = useCalculatorStore(state => state.checkForRealChanges)
  const setHasRealChanges = useCalculatorStore(state => state.setHasRealChanges)
  const saveCurrentData = useCalculatorStore(state => state.saveCurrentData)
  
  // デバウンス付きの差分チェック
  const debouncedChangeCheck = useMemo(
    () => debounce(() => {
      const hasChanges = checkForRealChanges()
      setHasRealChanges(hasChanges)
    }, 500),
    [checkForRealChanges, setHasRealChanges]
  )
  
  // フォーム変更時の差分チェック
  useEffect(() => {
    if (hasUnsavedChanges) {
      debouncedChangeCheck()
    }
  }, [hasUnsavedChanges, debouncedChangeCheck])
  
  // クリーンアップ
  useEffect(() => {
    return () => {
      debouncedChangeCheck.cancel()
    }
  }, [debouncedChangeCheck])
  
  return {
    hasUnsavedChanges,
    hasRealChanges,
    shouldShowSaveButton: hasRealChanges,
    saveCurrentData,
    // ... 他のメソッド
  }
}
```

### フォーム内での利用

```typescript
// 各フォームコンポーネントでの実装例
const BaseStatsForm: React.FC = () => {
  const storeData = useCalculatorStore(state => state.data.baseStats)
  const updateBaseStats = useCalculatorStore(state => state.updateBaseStats)
  const { hasRealChanges, saveCurrentData } = useSaveDataManager()
  
  const {
    register,
    watch,
    formState: { errors },
  } = useForm<BaseStatsFormData>({
    resolver: zodResolver(baseStatsSchema),
    values: storeData,
    mode: 'onChange',
  })
  
  // 変更検知（差分チェックは自動実行される）
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (!isInitialized || !name || type !== 'change') {
        return
      }
      
      updateBaseStats(value as BaseStatsFormData)
      // hasRealChangesは自動的に更新される
    })
    return () => subscription.unsubscribe()
  }, [watch, isInitialized, updateBaseStats])
  
  return (
    <form className="space-y-4">
      {/* フォーム要素 */}
      <div className="grid grid-cols-2 gap-4">
        <input
          {...register('level')}
          type="number"
          placeholder="レベル"
        />
        <input
          {...register('STR')}
          type="number"
          placeholder="STR"
        />
        {/* 他のフィールド */}
      </div>
      
      {/* 差分がある場合のみ保存ボタンを表示 */}
      {hasRealChanges && (
        <div className="mt-4">
          <button
            type="button"
            onClick={saveCurrentData}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            現在のデータを保存
          </button>
        </div>
      )}
    </form>
  )
}
```

## パフォーマンス最適化

### 1. 軽量差分チェック

```typescript
// src/utils/lightDifferenceCheck.ts

export const hasLightDifferences = (
  currentData: CalculatorData,
  savedData: CalculatorData | null
): boolean => {
  if (!savedData) return true
  
  // 頻繁に変更される主要フィールドのみチェック
  const keyFields = [
    'baseStats',
    'equipment.main',
    'equipment.body',
    'buffSkills.skills'
  ]
  
  return keyFields.some(fieldPath => {
    const currentValue = get(currentData, fieldPath)
    const savedValue = get(savedData, fieldPath)
    return !isEqual(currentValue, savedValue)
  })
}
```

### 2. 段階的差分チェック

```typescript
// 段階的な差分チェック戦略
const performDifferenceCheck = (): boolean => {
  const { data, lastSavedData } = get()
  
  if (!lastSavedData) return true
  
  // 1. 軽量チェックを最初に実行
  if (!hasLightDifferences(data, lastSavedData)) {
    return false
  }
  
  // 2. 軽量チェックで差分が見つかった場合のみ完全チェック
  return !isEqual(data, lastSavedData)
}
```

### 3. メモ化による最適化

```typescript
// 計算結果のメモ化
const useMemoizedDifferenceCheck = () => {
  const data = useCalculatorStore(state => state.data)
  const lastSavedData = useCalculatorStore(state => state.lastSavedData)
  
  return useMemo(() => {
    if (!lastSavedData) return true
    return !isEqual(data, lastSavedData)
  }, [data, lastSavedData])
}
```

## デバッグとテスト

### 1. デバッグ用ログ

```typescript
const checkForRealChanges = (): boolean => {
  const { data, lastSavedData } = get()
  
  if (!lastSavedData) {
    console.debug('[DifferenceCheck] No saved data, has changes: true')
    return true
  }
  
  const hasChanges = !isEqual(data, lastSavedData)
  console.debug('[DifferenceCheck] Comparison result:', {
    hasChanges,
    currentDataKeys: Object.keys(data),
    savedDataKeys: Object.keys(lastSavedData)
  })
  
  return hasChanges
}
```

### 2. テスト用ヘルパー

```typescript
// src/utils/testHelpers.ts

export const createTestDataWithChanges = (
  baseData: CalculatorData,
  changes: Partial<CalculatorData>
): CalculatorData => {
  return {
    ...baseData,
    ...changes
  }
}

export const assertNoDifferences = (
  data1: CalculatorData,
  data2: CalculatorData
): void => {
  expect(isEqual(data1, data2)).toBe(true)
}

export const assertHasDifferences = (
  data1: CalculatorData,
  data2: CalculatorData
): void => {
  expect(isEqual(data1, data2)).toBe(false)
}
```

## エラーハンドリング

### 1. 差分チェック失敗時の処理

```typescript
const safeCheckForRealChanges = (): boolean => {
  try {
    return checkForRealChanges()
  } catch (error) {
    console.error('差分チェックエラー:', error)
    // エラー時は安全側に倒して差分ありとみなす
    return true
  }
}
```

### 2. データ破損時の復旧

```typescript
const validateAndCheckDifferences = (): boolean => {
  const { data, lastSavedData } = get()
  
  // データ整合性チェック
  if (!isValidCalculatorData(data)) {
    console.warn('現在データが無効です')
    return true
  }
  
  if (lastSavedData && !isValidCalculatorData(lastSavedData)) {
    console.warn('保存データが無効です、リセットします')
    set({ lastSavedData: null }, false, 'resetInvalidSavedData')
    return true
  }
  
  return safeCheckForRealChanges()
}
```

## 更新履歴

| 日付 | 更新内容 | 備考 |
|------|----------|------|
| 2025-06-28 | 差分検知システム設計書作成 | フォーカス変更ベースから差分検知ベースへの移行設計 |

## 関連ドキュメント
- [セーブデータ管理仕様](./save-data.md) - 保存ボタン制御の基本仕様
- [React Hook Form統合](../store/integration.md) - フォーム統合パターン
- [SaveDataStore設計書](../store/save-data-store.md) - ストア設計の詳細