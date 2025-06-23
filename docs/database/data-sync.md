# データ同期・バージョン管理システム

## プリセットデータ更新システム

### 概要

システム側でプリセットデータが更新された場合（新敵情報追加、装備追加等）、既存ユーザーが新しいデータにアクセスできるようにするバージョン管理システムの設計です。

### 解決方法：バージョン管理システム
- プリセットデータにバージョン情報を付与
- アプリ起動時にバージョンチェック
- 新バージョン検出時に差分更新実行
- ユーザー編集済みデータの保護

## バージョン管理の仕組み

### プリセットデータバージョン情報

```json
{
  "version": "1.2.0",
  "releaseDate": "2025-01-17",
  "equipments": {
    "version": "1.1.0",
    "checksum": "abc123def456"
  },
  "crystals": {
    "version": "1.0.1", 
    "checksum": "def456ghi789"
  },
  "enemies": {
    "version": "1.2.0",
    "checksum": "ghi789jkl012"
  }
}
```

### バージョンチェック方式
- 各プリセットデータファイル（装備、クリスタル、敵情報）に個別バージョン
- チェックサムによるデータ整合性確認
- セマンティックバージョニング（major.minor.patch）

### バージョン情報の型定義

```typescript
interface PresetVersionInfo {
  version: string
  releaseDate: string
  equipments: { version: string, checksum: string }
  crystals: { version: string, checksum: string }
  enemies: { version: string, checksum: string }
  buffItems: { version: string, checksum: string }
  lastUpdated: string  // ISO date
}
```

## 差分更新の仕組み

### 更新対象の判定

```typescript
interface UpdateCheckResult {
  needsUpdate: boolean
  equipmentsUpdate: boolean
  crystalsUpdate: boolean
  enemiesUpdate: boolean
  oldVersion: string
  newVersion: string
}
```

### 差分更新の原則
1. **新規追加のみ**: 既存アイテムは変更しない
2. **ユーザー編集保護**: 編集済みプリセットデータは上書きしない
3. **ID衝突回避**: 新アイテムのIDが既存と重複する場合はスキップ
4. **ロールバック不可**: 一度更新したら元には戻せない

### 更新処理フロー

```
バージョンチェック 
→ 新規アイテム抽出 
→ ID衝突チェック 
→ ユーザー編集チェック 
→ 安全な新規アイテムのみ追加 
→ ローカルバージョン更新
```

## データ保護メカニズム

### 編集済みデータの識別

```typescript
interface LocalStoragePresetItem {
  id: string
  name: string
  // ... その他のプロパティ
  isPreset: true
  isFavorite: boolean          // ユーザーが変更可能
  isModified: boolean          // ユーザーが編集したかどうか
  modifiedAt?: string          // 最終編集日時
  originalChecksum?: string    // 元データのチェックサム
  createdAt: string
  updatedAt: string
}
```

### 保護されるケース
- `isFavorite`がtrueに変更されたアイテム
- プロパティ値が編集されたアイテム
- 名前が変更されたアイテム
- `isModified: true`が設定されたアイテム

### 更新されるケース
- 全く手を加えていないプリセットデータのアイテム
- システム側で完全に新規追加されたアイテム

## ユーザー体験

### 起動時の更新体験

```
アプリ起動 
→ "新しいデータを確認中..." 
→ "新しい敵情報が3件追加されました" 
→ 通常のアプリ画面
```

### 更新通知の例
- 「新しい敵情報が追加されました（3件）」
- 「新しい装備が追加されました（5件）」  
- 「新しいクリスタルが追加されました（2件）」

### 更新エラー時の対応
- ネットワークエラー：既存データで継続、次回起動時に再試行
- データ破損エラー：エラーログ記録、既存データで継続
- 容量不足エラー：容量確保の提案表示

## 差分更新の実装例

### 新規アイテム抽出処理

```typescript
async function extractNewItems<T extends { id: string }>(
  currentItems: T[],
  latestItems: T[]
): Promise<T[]> {
  const currentIds = new Set(currentItems.map(item => item.id))
  return latestItems.filter(item => !currentIds.has(item.id))
}

// 使用例：敵情報の新規追加分を抽出
const newEnemies = await extractNewItems(
  getLocalPresetEnemies(),
  await getLatestPresetEnemies()
)
```

### 安全な追加処理

```typescript
async function safelyAddNewItems<T extends LocalStoragePresetItem>(
  storageKey: string,
  newItems: T[]
): Promise<number> {
  const existingItems = getFromLocalStorage<T[]>(storageKey) || []
  const existingIds = new Set(existingItems.map(item => item.id))
  
  // ID衝突チェック
  const safeItems = newItems.filter(item => !existingIds.has(item.id))
  
  // 新規アイテムにメタデータ追加
  const itemsWithMeta = safeItems.map(item => ({
    ...item,
    isPreset: true,
    isFavorite: false,
    isModified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }))
  
  // ローカルストレージに追加
  const updatedItems = [...existingItems, ...itemsWithMeta]
  saveToLocalStorage(storageKey, updatedItems)
  
  return safeItems.length
}
```

## 初期化・更新処理の実装

### アプリ起動時の初期化処理

```typescript
export async function initializeStorage(): Promise<void> {
  try {
    // バージョンチェック・プリセットデータ更新
    await checkAndUpdatePresetData()
    
    // メインデータの確保
    await ensureDefaultSaveData()
    
    // 現在のセーブデータ設定
    const currentSaveId = localStorage.getItem(STORAGE_KEYS.CURRENT_SAVE_ID)
    if (!currentSaveId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_SAVE_ID, "default")
    }
    
    // データ整合性チェック
    await validateStorageIntegrity()
  } catch (error) {
    console.error('ストレージ初期化エラー:', error)
    // フォールバック処理
    await resetToDefault()
  }
}
```

### プリセットデータチェック・更新関数

```typescript
async function checkAndUpdatePresetData(): Promise<void> {
  // 現在のローカルバージョンを取得
  const localVersion = getLocalPresetVersion()
  
  // システム側の最新バージョンを取得
  const latestVersion = await getLatestPresetVersion()
  
  // 初回アクセス（ローカルバージョンなし）
  if (!localVersion) {
    await initialCopyPresetData()
    await saveLocalPresetVersion(latestVersion)
    return
  }
  
  // バージョン比較
  const updateCheck = compareVersions(localVersion, latestVersion)
  
  if (updateCheck.needsUpdate) {
    await performDifferentialUpdate(updateCheck)
    await saveLocalPresetVersion(latestVersion)
  }
}
```

### 初回プリセットデータコピー

```typescript
async function initialCopyPresetData(): Promise<void> {
  await copyPresetEquipmentsToLocalStorage()
  await copyPresetCrystalsToLocalStorage()
  await copyPresetEnemiesToLocalStorage()
  await copyPresetBuffItemsToLocalStorage()
}
```

### 差分更新実行

```typescript
async function performDifferentialUpdate(updateCheck: UpdateCheckResult): Promise<void> {
  if (updateCheck.equipmentsUpdate) {
    await updatePresetEquipments()
  }
  if (updateCheck.crystalsUpdate) {
    await updatePresetCrystals()
  }
  if (updateCheck.enemiesUpdate) {
    await updatePresetEnemies()
  }
}
```

## バージョン比較・管理

### バージョン比較ロジック

```typescript
function compareVersions(localVersion: PresetVersionInfo, remoteVersion: PresetVersionInfo): UpdateCheckResult {
  const needsUpdate = 
    localVersion.equipments.version !== remoteVersion.equipments.version ||
    localVersion.crystals.version !== remoteVersion.crystals.version ||
    localVersion.enemies.version !== remoteVersion.enemies.version ||
    localVersion.buffItems.version !== remoteVersion.buffItems.version
  
  return {
    needsUpdate,
    equipmentsUpdate: localVersion.equipments.version !== remoteVersion.equipments.version,
    crystalsUpdate: localVersion.crystals.version !== remoteVersion.crystals.version,
    enemiesUpdate: localVersion.enemies.version !== remoteVersion.enemies.version,
    oldVersion: localVersion.version,
    newVersion: remoteVersion.version
  }
}
```

### チェックサム検証

```typescript
function validateChecksum(data: any[], expectedChecksum: string): boolean {
  const dataString = JSON.stringify(data)
  const actualChecksum = calculateChecksum(dataString)
  return actualChecksum === expectedChecksum
}

function calculateChecksum(data: string): string {
  // チェックサム計算ロジック（例：SHA-256ハッシュ）
  return btoa(data).slice(0, 12) // 簡易実装例
}
```

## エラーハンドリング

### 更新エラーの種類と対応

```typescript
interface UpdateError {
  type: 'network' | 'checksum' | 'storage' | 'parsing'
  message: string
  retryable: boolean
}

async function handleUpdateError(error: UpdateError): Promise<void> {
  switch (error.type) {
    case 'network':
      // ネットワークエラー：次回起動時に再試行
      scheduleRetry()
      break
    case 'checksum':
      // チェックサム不一致：データ破損として記録
      logDataCorruption(error)
      break
    case 'storage':
      // ストレージ容量不足：容量確保の提案
      showStorageFullDialog()
      break
    case 'parsing':
      // データ形式エラー：既存データで継続
      logParsingError(error)
      break
  }
}
```

### フォールバック戦略

```typescript
async function resetToDefault(): Promise<void> {
  try {
    // 破損したデータをクリアして初期状態に戻す
    clearCorruptedData()
    
    // デフォルトのプリセットデータを読み込み
    await loadDefaultPresetData()
    
    // メインデータを再作成
    await createDefaultSaveData()
    
    console.log('ストレージを初期状態にリセットしました')
  } catch (error) {
    console.error('フォールバック処理に失敗:', error)
    // 最終手段：ページリロードを提案
    showCriticalErrorDialog()
  }
}
```

## LocalStorage キー

```typescript
const STORAGE_KEYS = {
  // バージョン管理
  PRESET_VERSION: 'toram_preset_version',           // PresetVersionInfo
  LAST_UPDATE_CHECK: 'toram_last_update_check',     // string (ISO date)
  
  // プリセットデータ（コピー済み、お気に入り・編集可能）
  PRESET_EQUIPMENTS: 'toram_preset_equipments',     // LocalStorageEquipment[]
  PRESET_CRYSTALS: 'toram_preset_crystals',         // LocalStorageCrystal[]
  PRESET_ENEMIES: 'toram_preset_enemies',           // LocalStorageEnemy[]
  PRESET_BUFF_ITEMS: 'toram_preset_buff_items',     // LocalStorageBuffItem[]
} as const
```

## 実装優先度

### Phase 1（高優先度）
- **初回アクセス時のメインデータ自動作成**
- **プリセットデータのバージョン管理システム**
- **差分更新機能（新規アイテム追加対応）**
- 基本的なバージョンチェック機能

### Phase 2（中優先度）
- プリセットデータ更新の通知UI
- 手動更新チェック機能
- 更新履歴の表示

### Phase 3（低優先度）
- 高度なチェックサム検証
- 更新のロールバック機能
- データの詳細な整合性チェック

## 関連ドキュメント

- [ストレージ概要](./storage-overview.md) - 全体設計の概要
- [セーブデータ管理](./save-data-storage.md) - セーブデータの詳細設計
- [カスタムデータ管理](./custom-data-storage.md) - ユーザーカスタムデータの管理
- [パフォーマンス・エラーハンドリング](./storage-optimization.md) - 最適化とエラー処理