# パフォーマンス最適化・エラーハンドリング

## データサイズ管理

### 容量制限
- LocalStorageの一般的な制限: 5-10MB
- 推定データサイズ: 
  - 1セーブデータあたり約5-10KB（参照情報のみ）
  - カスタム装備1個あたり約1-2KB
  - カスタムクリスタル1個あたり約0.5-1KB
  - カスタム敵情報1個あたり約0.3-0.5KB
- 目安: 500-1000個のセーブデータ + 数百個のカスタムアイテムが保存可能

### 容量監視

```typescript
interface StorageUsage {
  totalSize: number      // 使用中の総サイズ（バイト）
  maxSize: number       // 推定最大サイズ
  usage: number         // 使用率（0-1）
  warning: boolean      // 警告レベル（80%以上）
  critical: boolean     // 危険レベル（95%以上）
}

interface StorageStats {
  totalSize: number      // 使用中のストレージサイズ（バイト）
  estimatedLimit: number // 推定制限サイズ
  usagePercentage: number // 使用率（%）
  lastChecked: string    // 最終チェック日時
}
```

## パフォーマンス最適化

### 読み書き最適化

**遅延読み込み**:
- 必要時のみデータを読み込み
- セーブデータリストは概要のみ先行読み込み
- 詳細データは選択時に読み込み

**バッチ処理**:
- 複数の変更をまとめて保存
- 非同期処理で重い処理のPromise化
- データキャッシュで頻繁にアクセスするデータのメモリキャッシュ

### メモリ管理

**キャッシュ戦略**:
- 現在のセーブデータはメモリにキャッシュ
- 未使用のセーブデータは適時解放
- LRUキャッシュによる効率的なメモリ使用

**メモリリーク防止**:
```typescript
// キャッシュサイズ制限
const MAX_CACHE_SIZE = 50; // セーブデータ最大キャッシュ数
const MAX_CUSTOM_CACHE_SIZE = 200; // カスタムデータ最大キャッシュ数

// 定期的なキャッシュクリーンアップ
setInterval(() => {
  cleanupExpiredCache();
}, 5 * 60 * 1000); // 5分毎
```

## エラーハンドリング・データ整合性

### データ検証

**保存時検証**:
```typescript
interface DataValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  brokenReferences: { type: string, id: string }[]  // 破損した参照の一覧
}

export function validateSaveData(data: SaveData): DataValidation
export function validateCustomEquipment(equipment: UserEquipment): DataValidation
export function validateCustomCrystal(crystal: UserCrystal): DataValidation
export function validateCustomEnemy(enemy: UserEnemy): DataValidation
export function validateBuffSkillData(buffSkills: BuffSkillFormData): DataValidation
export function validateReferences(saveData: SaveData): DataValidation
```

**整合性チェック**:
- 必須フィールドの存在確認
- データ型の検証
- 値の範囲チェック
- **参照整合性の確認**（重要）:
  - セーブデータが参照するカスタム装備・クリスタル・敵情報の存在確認
  - 削除されたアイテムへの参照を自動修復
  - 循環参照の検出と防止
- **バフスキルデータの検証**:
  - スキルIDの有効性確認
  - パラメータ値の範囲チェック
  - 武器種とマスタリスキルの整合性確認
  - **特殊パラメータスキルの複合検証**:
    - エターナルナイトメア: skillLevel(1-10) + spUsed(25-80)
    - ナイトプレッジ: skillLevel(1-10) + playerCount(0-4) + refinement(1-15)
    - ブレイブ: isCaster(0 or 1)の値検証

### エラー復旧

**データ破損対応**:
1. 破損データの検出
2. **参照エラーの自動修復**:
   - 削除されたカスタムアイテムへの参照を null に変更
   - セーブデータの機能を維持しつつ、エラーを解決
3. デフォルト値での初期化
4. ユーザーへの通知とオプション提示

**カスタムデータ削除時の影響確認**:
- 削除予定のカスタムアイテムを参照しているセーブデータを検索
- 影響を受けるセーブデータの一覧表示
- 削除前の確認ダイアログでの警告表示

**容量不足対応**:
1. 古いセーブデータの自動削除提案
2. 不要データの削除支援

### エラーハンドリング実装例

```typescript
// 参照整合性チェック
export function validateReferences(saveData: SaveData): DataValidation {
  const brokenReferences: { type: string, id: string }[] = []
  const errors: string[] = []
  
  // 装備参照チェック
  Object.entries(saveData.data.equipments).forEach(([slot, equipment]) => {
    if (equipment.selectedId && !getEquipmentById(equipment.selectedId)) {
      brokenReferences.push({ type: 'equipment', id: equipment.selectedId })
      errors.push(`装備スロット「${slot}」の参照が破損しています`)
    }
  })
  
  // クリスタル参照チェック
  Object.entries(saveData.data.crystals).forEach(([slot, crystal]) => {
    if (crystal.selectedId && !getCrystalById(crystal.selectedId)) {
      brokenReferences.push({ type: 'crystal', id: crystal.selectedId })
      errors.push(`クリスタルスロット「${slot}」の参照が破損しています`)
    }
  })
  
  // 敵情報参照チェック
  if (saveData.data.enemy.selectedId && !getEnemyById(saveData.data.enemy.selectedId)) {
    brokenReferences.push({ type: 'enemy', id: saveData.data.enemy.selectedId })
    errors.push('敵情報の参照が破損しています')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings: [],
    brokenReferences
  }
}

// 自動修復処理
export function autoRepairSaveData(saveData: SaveData): SaveData {
  const validation = validateReferences(saveData)
  
  if (!validation.isValid) {
    const repairedData = { ...saveData }
    
    // 破損した参照をnullに変更
    validation.brokenReferences.forEach(ref => {
      switch (ref.type) {
        case 'equipment':
          Object.keys(repairedData.data.equipments).forEach(slot => {
            if (repairedData.data.equipments[slot].selectedId === ref.id) {
              repairedData.data.equipments[slot].selectedId = null
            }
          })
          break
        case 'crystal':
          Object.keys(repairedData.data.crystals).forEach(slot => {
            if (repairedData.data.crystals[slot].selectedId === ref.id) {
              repairedData.data.crystals[slot].selectedId = null
            }
          })
          break
        case 'enemy':
          if (repairedData.data.enemy.selectedId === ref.id) {
            repairedData.data.enemy.selectedId = null
          }
          break
      }
    })
    
    return repairedData
  }
  
  return saveData
}
```

## ストレージ管理API

```typescript
// src/utils/storageManager.ts

// 容量管理
export function getStorageUsage(): StorageUsage {
  const used = JSON.stringify(localStorage).length
  const estimated = 5 * 1024 * 1024 // 5MB推定
  
  return {
    totalSize: used,
    maxSize: estimated,
    usage: used / estimated,
    warning: used / estimated > 0.8,
    critical: used / estimated > 0.95
  }
}

export function cleanupOldData(): Promise<void> {
  // 古いデータの削除ロジック
  // - 使用されていないカスタムデータ
  // - 長期間アクセスされていないセーブデータ
  // - 破損したデータの削除
}

export function validateStorageIntegrity(): Promise<boolean> {
  // ストレージ全体の整合性チェック
  // - 全セーブデータの検証
  // - 参照整合性の確認
  // - 必要に応じて自動修復
}

// データ移行
export function migrateStorageVersion(fromVersion: string, toVersion: string): Promise<void> {
  // バージョン間のデータ移行処理
}

export function getCurrentStorageVersion(): string {
  return localStorage.getItem(STORAGE_KEYS.STORAGE_VERSION) || '1.0.0'
}
```

## セキュリティ・プライバシー

### データ保護

**ローカルストレージの特性**:
- ブラウザローカルに保存（外部送信なし）
- ドメイン別分離
- ユーザーによる削除可能

**注意事項**:
- ブラウザのプライベートモードでは永続化されない
- ブラウザデータ削除時に消失する可能性
- 端末間での同期は行われない

### 将来の共有機能

**コード共有システム（将来実装予定）**:
- セーブデータを短いコードに変換
- コードを入力して他のユーザーの設定を読み込み
- SNSやフォーラムでの設定共有を想定

```typescript
// 将来の共有機能のための準備（未実装）
// export function generateShareCode(saveDataId: string): Promise<string>
// export function loadFromShareCode(shareCode: string): Promise<SaveData>
```

## 実装優先度

### Phase 1（高優先度）
- **初回アクセス時のメインデータ自動作成**
- **プリセットデータのバージョン管理システム**
- **差分更新機能（新規アイテム追加対応）**
- 基本的なセーブデータ CRUD 操作
- セーブデータ管理UI
- 基本的なエラーハンドリング

### Phase 2（中優先度）
- 並び替え機能
- ストレージ容量監視
- プリセットデータ更新の通知UI
- 参照整合性チェック
- 自動修復機能

### Phase 3（低優先度）
- 高度な検索・フィルタリング
- データ分析・統計機能
- 手動更新チェック機能
- コード共有システム
- 高度なキャッシュ戦略

## 技術仕様

### 依存関係

**依存パッケージ**:
- `uuid`: 一意ID生成
- `date-fns`: 日時処理

**既存技術スタックとの統合**:
- Zod: データバリデーション
- React Hook Form: フォーム状態管理
- TypeScript: 型安全性

### コンポーネント構成

```
SaveDataManager/
├── SaveDataModal.tsx              // セーブデータ管理モーダル
├── SaveDataList.tsx              // セーブデータリスト
├── SaveDataItem.tsx              // セーブデータ項目
├── SaveDataNameModal.tsx         // 名前入力モーダル
├── SaveDataSortable.tsx          // 並び替え機能
└── hooks/
    ├── useSaveDataManager.ts     // セーブデータ管理ロジック
    └── useStorageMonitor.ts     // ストレージ監視
```

### モニタリング機能

```typescript
// ストレージ監視フック
export function useStorageMonitor() {
  const [usage, setUsage] = useState<StorageUsage>()
  
  useEffect(() => {
    const updateUsage = () => {
      setUsage(getStorageUsage())
    }
    
    updateUsage()
    const interval = setInterval(updateUsage, 30000) // 30秒毎
    
    return () => clearInterval(interval)
  }, [])
  
  return {
    usage,
    needsCleanup: usage?.warning || false,
    isCritical: usage?.critical || false
  }
}
```

## 関連ドキュメント

- [ストレージ概要](./storage-overview.md) - 全体設計の概要
- [セーブデータ管理](./save-data-storage.md) - セーブデータの詳細設計
- [カスタムデータ管理](./custom-data-storage.md) - ユーザーカスタムデータの管理
- [データ同期・バージョン管理](./data-sync.md) - プリセットデータの更新システム