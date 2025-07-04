# セーブデータ エクスポート・インポート機能 設計書

## 概要
フローティングメニューシステムの「セーブデータ」セクションに、セーブデータのエクスポート・インポート機能を追加する設計書。既存のSaveDataManagerコンポーネントを拡張し、データの外部出力・取り込み機能を実装する。

## 機能要件

### 1. エクスポート機能
- **全データエクスポート**: 現在のアプリケーション状態を含む全てのセーブデータを出力
- **個別データエクスポート**: 特定のセーブデータのみを出力
- **カスタムデータエクスポート**: ユーザー作成の装備・クリスタル等のカスタムデータを出力
- **形式**: JSON形式でのファイル出力
- **ファイル名**: 自動生成（`toram-calc-backup-YYYY-MM-DD-HHmmss.json`）

### 2. インポート機能
- **全データインポート**: 完全なバックアップファイルからの復元
- **個別データインポート**: 特定のセーブデータのみをインポート
- **カスタムデータインポート**: 装備・クリスタル等のカスタムデータのみをインポート
- **データ検証**: インポート前のデータ形式・互換性チェック
- **競合解決**: 同名データの上書き確認

### 3. 安全性要件
- **バックアップ確認**: インポート前の現在データのバックアップ推奨
- **データ検証**: 不正なJSONファイルの検出と拒否
- **互換性チェック**: アプリケーションバージョンとの互換性確認
- **エラーハンドリング**: 失敗時の適切なエラーメッセージ表示

## UI設計

### 1. SaveDataActionsコンポーネント拡張
既存のアクションボタンエリアにエクスポート・インポートボタンを追加：

```
┌─────────────────────────────────────────────────────┐
│ セーブデータ管理                                        │
├─────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐     │
│ │現在のデータ │ │  新規作成   │ │    その他   │     │
│ │   を保存    │ │            │ │      ▼     │     │
│ └─────────────┘ └─────────────┘ └─────────────┘     │
│                                                   │
│ ┌─────────────┐ ┌─────────────┐                   │
│ │エクスポート │ │インポート   │                   │
│ │            │ │            │                   │
│ └─────────────┘ └─────────────┘                   │
├─────────────────────────────────────────────────────┤
│ (既存のセーブデータ一覧)                              │
└─────────────────────────────────────────────────────┘
```

### 2. エクスポートモーダル
エクスポートボタンクリック時に表示：

```
┌─────────────────────────────────────────────────────┐
│ データエクスポート                                      │
├─────────────────────────────────────────────────────┤
│ エクスポート対象を選択してください                        │
│                                                     │
│ ○ 全データ (セーブデータ + カスタムデータ)               │
│ ○ セーブデータのみ                                    │
│ ○ カスタムデータのみ (装備・クリスタル等)               │
│ ○ 現在のデータのみ                                    │
│                                                     │
│ ┌─────────────────────────────────────────────────┐   │
│ │ ファイル名: toram-calc-backup-2024-01-15-143052 │   │
│ └─────────────────────────────────────────────────┘   │
│                                                     │
│ ┌─────────────┐ ┌─────────────┐                     │
│ │エクスポート │ │   キャンセル  │                     │
│ └─────────────┘ └─────────────┘                     │
└─────────────────────────────────────────────────────┘
```

### 3. インポートモーダル
インポートボタンクリック時に表示：

```
┌─────────────────────────────────────────────────────┐
│ データインポート                                        │
├─────────────────────────────────────────────────────┤
│ バックアップファイルを選択してください                    │
│                                                     │
│ ┌─────────────────────────────────────────────────┐   │
│ │ ファイルを選択またはここにドラッグ&ドロップ           │   │
│ │                                                 │   │
│ │        📁 クリックしてファイルを選択               │   │
│ │                                                 │   │
│ └─────────────────────────────────────────────────┘   │
│                                                     │
│ ⚠️ 注意：インポートにより現在のデータが上書きされる       │
│    可能性があります。事前にバックアップを取得することを   │
│    推奨します。                                      │
│                                                     │
│ ┌─────────────┐ ┌─────────────┐                     │
│ │インポート   │ │   キャンセル  │                     │
│ └─────────────┘ └─────────────┘                     │
└─────────────────────────────────────────────────────┘
```

### 4. インポート確認ダイアログ
ファイル選択後のデータ検証結果表示：

```
┌─────────────────────────────────────────────────────┐
│ インポート確認                                          │
├─────────────────────────────────────────────────────┤
│ 以下のデータがインポートされます：                        │
│                                                     │
│ ✓ セーブデータ: 5個                                   │
│ ✓ カスタム装備: 12個                                  │
│ ✓ カスタムクリスタル: 8個                              │
│ ✓ 設定データ: 1個                                     │
│                                                     │
│ ⚠️ 競合するデータ：                                    │
│ • セーブデータ「メインビルド」→ 上書きされます            │
│ • カスタム装備「炎神の剣」→ 上書きされます              │
│                                                     │
│ □ 既存データをバックアップしてからインポートする          │
│                                                     │
│ ┌─────────────┐ ┌─────────────┐                     │
│ │実行         │ │   キャンセル  │                     │
│ └─────────────┘ └─────────────┘                     │
└─────────────────────────────────────────────────────┘
```

## データ形式設計

### 1. エクスポートデータ構造
```typescript
interface ExportData {
  // メタデータ
  version: string           // アプリケーションバージョン
  exportDate: string       // エクスポート日時 (ISO 8601)
  exportType: ExportType   // エクスポート種別
  
  // セーブデータ
  saveData?: {
    saves: SaveDataItem[]
    currentSaveId: string | null
  }
  
  // カスタムデータ
  customData?: {
    equipment: CustomEquipmentItem[]
    crystals: CustomCrystalItem[]
    // 将来的に他のカスタムデータ
  }
  
  // 設定データ
  settings?: {
    theme: string
    language: string
    // その他の設定
  }
}

type ExportType = 'full' | 'save-data' | 'custom-data' | 'current-save'
```

### 2. インポートデータ検証
```typescript
interface ImportValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  data?: ExportData
  conflicts?: {
    saveData: string[]      // 競合するセーブデータ名
    equipment: string[]     // 競合するカスタム装備名
    crystals: string[]      // 競合するカスタムクリスタル名
  }
}
```

## 実装設計

### 1. ファイル構成
```
src/
├── components/floating-menu/content/
│   ├── SaveDataActions.tsx           # エクスポート・インポートボタン追加
│   ├── modals/
│   │   ├── ExportModal.tsx           # エクスポートモーダル
│   │   ├── ImportModal.tsx           # インポートモーダル
│   │   └── ImportConfirmModal.tsx    # インポート確認モーダル
│   └── hooks/
│       ├── useExportData.ts          # エクスポート機能
│       ├── useImportData.ts          # インポート機能
│       └── useFileHandler.ts         # ファイル操作共通
└── utils/
    ├── exportManager.ts              # エクスポート処理
    ├── importManager.ts              # インポート処理
    └── dataValidator.ts              # データ検証
```

### 2. コンポーネント設計

#### SaveDataActions.tsx 拡張
```typescript
interface SaveDataActionsProps {
  onSave: () => void
  onCreateNew: () => void
  onExport: () => void        // 新規追加
  onImport: () => void        // 新規追加
  hasUnsavedChanges: boolean
}

const SaveDataActions: React.FC<SaveDataActionsProps> = ({
  onSave,
  onCreateNew,
  onExport,
  onImport,
  hasUnsavedChanges
}) => {
  return (
    <div className="space-y-3">
      {/* 既存のボタン */}
      <div className="flex gap-2">
        <Button onClick={onSave} disabled={!hasUnsavedChanges}>
          現在のデータを保存
        </Button>
        <Button onClick={onCreateNew} variant="outline">
          新規作成
        </Button>
      </div>
      
      {/* エクスポート・インポートボタン */}
      <div className="flex gap-2">
        <Button onClick={onExport} variant="outline" size="sm">
          エクスポート
        </Button>
        <Button onClick={onImport} variant="outline" size="sm">
          インポート
        </Button>
      </div>
    </div>
  )
}
```

#### ExportModal.tsx
```typescript
interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (options: ExportOptions) => void
}

interface ExportOptions {
  type: ExportType
  filename: string
  includeSettings: boolean
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExport
}) => {
  const [exportType, setExportType] = useState<ExportType>('full')
  const [filename, setFilename] = useState(generateDefaultFilename())
  const [includeSettings, setIncludeSettings] = useState(true)
  
  const handleExport = () => {
    onExport({
      type: exportType,
      filename,
      includeSettings
    })
    onClose()
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="データエクスポート">
      {/* エクスポートオプション */}
      <RadioGroup value={exportType} onChange={setExportType}>
        <RadioButton value="full">全データ</RadioButton>
        <RadioButton value="save-data">セーブデータのみ</RadioButton>
        <RadioButton value="custom-data">カスタムデータのみ</RadioButton>
        <RadioButton value="current-save">現在のデータのみ</RadioButton>
      </RadioGroup>
      
      {/* ファイル名 */}
      <Input 
        label="ファイル名"
        value={filename}
        onChange={setFilename}
      />
      
      {/* アクション */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          キャンセル
        </Button>
        <Button onClick={handleExport}>
          エクスポート
        </Button>
      </div>
    </Modal>
  )
}
```

#### ImportModal.tsx
```typescript
interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (file: File) => void
}

const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type === 'application/json') {
        onImport(file)
        onClose()
      } else {
        // エラー表示
      }
    }
  }
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    handleFileSelect(e.dataTransfer.files)
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="データインポート">
      {/* ドラッグ&ドロップエリア */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        <div className="text-gray-500">
          ファイルを選択またはここにドラッグ&ドロップ
        </div>
      </div>
      
      {/* 注意事項 */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-sm text-yellow-800">
          ⚠️ 注意：インポートにより現在のデータが上書きされる可能性があります。
          事前にバックアップを取得することを推奨します。
        </p>
      </div>
    </Modal>
  )
}
```

### 3. 処理フロー

#### エクスポート処理
```typescript
const exportManager = {
  async exportData(options: ExportOptions): Promise<void> {
    const data = await this.collectExportData(options.type)
    const jsonData = this.formatExportData(data)
    this.downloadFile(jsonData, options.filename)
  },
  
  async collectExportData(type: ExportType): Promise<ExportData> {
    const exportData: ExportData = {
      version: APP_VERSION,
      exportDate: new Date().toISOString(),
      exportType: type
    }
    
    switch (type) {
      case 'full':
        exportData.saveData = await this.getSaveData()
        exportData.customData = await this.getCustomData()
        exportData.settings = await this.getSettings()
        break
      case 'save-data':
        exportData.saveData = await this.getSaveData()
        break
      case 'custom-data':
        exportData.customData = await this.getCustomData()
        break
      case 'current-save':
        exportData.saveData = await this.getCurrentSaveData()
        break
    }
    
    return exportData
  },
  
  downloadFile(data: ExportData, filename: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
}
```

#### インポート処理
```typescript
const importManager = {
  async validateImportFile(file: File): Promise<ImportValidationResult> {
    try {
      const text = await file.text()
      const data = JSON.parse(text) as ExportData
      
      // データ形式検証
      const validation = this.validateDataStructure(data)
      if (!validation.isValid) {
        return validation
      }
      
      // バージョン互換性チェック
      const compatibilityCheck = this.checkCompatibility(data.version)
      if (!compatibilityCheck.isValid) {
        return compatibilityCheck
      }
      
      // 競合チェック
      const conflicts = await this.checkConflicts(data)
      
      return {
        isValid: true,
        errors: [],
        warnings: [],
        data,
        conflicts
      }
    } catch (error) {
      return {
        isValid: false,
        errors: ['無効なJSONファイルです'],
        warnings: []
      }
    }
  },
  
  async importData(data: ExportData, options: ImportOptions): Promise<void> {
    // バックアップ作成（オプション）
    if (options.createBackup) {
      await this.createBackup()
    }
    
    // データインポート
    if (data.saveData) {
      await this.importSaveData(data.saveData, options)
    }
    
    if (data.customData) {
      await this.importCustomData(data.customData, options)
    }
    
    if (data.settings) {
      await this.importSettings(data.settings, options)
    }
    
    // ストア更新
    await this.refreshStores()
  }
}
```

### 4. 状態管理

#### SaveDataStoreの拡張
```typescript
interface SaveDataStore {
  // 既存の状態とメソッド
  // ...
  
  // エクスポート・インポート関連
  isExportModalOpen: boolean
  isImportModalOpen: boolean
  isImportConfirmModalOpen: boolean
  importValidationResult: ImportValidationResult | null
  
  // モーダル制御
  openExportModal: () => void
  closeExportModal: () => void
  openImportModal: () => void
  closeImportModal: () => void
  
  // エクスポート・インポート処理
  exportData: (options: ExportOptions) => Promise<void>
  validateImportFile: (file: File) => Promise<ImportValidationResult>
  importData: (data: ExportData, options: ImportOptions) => Promise<void>
}
```

## エラーハンドリング

### 1. エクスポート時のエラー
- **データ収集エラー**: LocalStorageアクセス失敗
- **ファイル生成エラー**: JSON変換失敗
- **ダウンロードエラー**: ブラウザ制限

### 2. インポート時のエラー
- **ファイル読み込みエラー**: ファイル形式不正
- **データ検証エラー**: 不正なデータ構造
- **バージョン互換性エラー**: 古いバージョンのデータ
- **インポート処理エラー**: LocalStorage書き込み失敗

### 3. エラー表示方法
```typescript
interface ErrorMessage {
  type: 'error' | 'warning' | 'info'
  title: string
  message: string
  actions?: ErrorAction[]
}

interface ErrorAction {
  label: string
  onClick: () => void
  variant: 'primary' | 'secondary'
}
```

## セキュリティ考慮事項

### 1. データ検証
- **型チェック**: TypeScriptによる静的型チェック
- **スキーマ検証**: Zodによるランタイム検証
- **サニタイゼーション**: 危険なデータの除去

### 2. ファイル制限
- **ファイルサイズ**: 最大10MB
- **ファイル形式**: JSON形式のみ
- **ファイル名**: 危険な文字の除去

### 3. プライバシー保護
- **ローカル処理**: すべての処理をクライアントサイドで実行
- **一時ファイル**: インポート後の一時データ削除
- **エラーログ**: 個人情報を含まない

## 実装フェーズ

### Phase 1: エクスポート機能
1. エクスポート用ユーティリティ関数実装
2. ExportModalコンポーネント実装
3. SaveDataActionsにエクスポートボタン追加
4. 基本的なエクスポート機能テスト

### Phase 2: インポート機能
1. インポート用ユーティリティ関数実装
2. ImportModalコンポーネント実装
3. データ検証機能実装
4. 基本的なインポート機能テスト

### Phase 3: 高度な機能
1. ImportConfirmModalコンポーネント実装
2. 競合解決機能実装
3. エラーハンドリング強化
4. 総合テスト

### Phase 4: UI/UX改善
1. プログレス表示実装
2. ドラッグ&ドロップ機能実装
3. アクセシビリティ対応
4. レスポンシブデザイン調整

## テスト計画

### 1. 単体テスト
- エクスポート・インポート関数
- データ検証機能
- ファイル操作機能

### 2. 統合テスト
- モーダル表示・非表示
- エクスポート・インポートフロー
- エラーハンドリング

### 3. E2Eテスト
- 完全なエクスポート・インポートサイクル
- 複数ブラウザでの動作確認
- 大量データでの性能テスト

## 関連ドキュメント
- [フローティングメニューシステム要件](../requirements/11_floating-menu-system.md)
- [SaveDataStore設計書](../store/save-data-store.md)
- [データベース設計](../database/save-data-storage.md)
- [セキュリティガイドライン](../security/data-validation.md)