# SaveDataStore設計書

**目的**: セーブデータの管理とLocalStorage操作

```typescript
interface SaveDataStore {
  // === 状態 ===
  saveDataList: SaveDataItem[]
  currentSaveId: string | null

  // === 操作 ===
  loadSaveDataList: () => Promise<void>                    // ユーザーデータのみロード
  switchSaveData: (saveId: string) => Promise<void>
  createSaveData: (name: string) => Promise<void>          // 作成後自動切り替え
  deleteSaveData: (saveId: string) => Promise<void>        // 全削除時メインデータ切り替え
  switchToMainData: () => Promise<void>                    // メインデータ切り替え専用
}
```

**主要機能**:
- ユーザー作成セーブデータリストの管理（メインデータ除外）
- セーブデータの切り替え
- 新規セーブデータの作成（作成後自動切り替え）
- セーブデータの削除（全削除時メインデータ自動復帰）
- メインデータ切り替え機能

