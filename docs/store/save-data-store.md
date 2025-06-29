# SaveDataStore設計書（差分検知対応版）

**目的**: セーブデータの管理とLocalStorage操作、差分検知によるデータ整合性確保

```typescript
interface SaveDataStore {
  // === 状態 ===
  saveDataList: SaveDataItem[]
  currentSaveId: string | null

  // === 操作 ===
  loadSaveDataList: () => Promise<void>                    // ユーザーデータのみロード
  switchSaveData: (saveId: string) => Promise<void>        // 差分リセット対応
  createSaveData: (name: string) => Promise<void>          // 作成後差分リセット
  deleteSaveData: (saveId: string) => Promise<void>        // 全削除時メインデータ切り替え
  switchToMainData: () => Promise<void>                    // メインデータ切り替え専用
}

interface CalculatorStore extends CalculatorData {
  // === 差分検知関連状態 ===
  lastSavedData: CalculatorData | null    // 最後に保存されたデータのスナップショット
  hasRealChanges: boolean                 // 実際の差分があるかどうか
  
  // === 差分検知メソッド ===
  updateLastSavedData: (data: CalculatorData) => void
  checkForRealChanges: () => boolean
  setHasRealChanges: (value: boolean) => void
  
  // === 更新されたメソッド ===
  saveCurrentData: () => Promise<void>    // 保存時に差分状態をリセット
  loadSaveData: (saveId: string) => Promise<void>  // 読み込み時に差分状態をリセット
}
```

**主要機能**:
- ユーザー作成セーブデータリストの管理（メインデータ除外）
- **差分検知によるセーブデータ切り替え**（新規追加）
- 新規セーブデータの作成（作成後差分リセット）
- セーブデータの削除（全削除時メインデータ自動復帰）
- **保存済みデータの追跡とスナップショット管理**（新規追加）
- メインデータ切り替え機能

