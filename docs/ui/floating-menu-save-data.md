# フローティングメニュー - セーブデータ管理機能設計書

## 概要
フローティングメニューシステムの「セーブデータ」セクションに、SaveDataManagerと同等の機能を実装する設計書。既存のSaveDataManagerコンポーネントの機能をフローティングメニュー内で利用できるように統合する。

## 機能要件

### 1. 基本機能
既存のSaveDataManagerと同等の機能を提供：
- セーブデータ一覧表示
- 現在のデータ保存
- セーブデータ切り替え
- 新規セーブデータ作成
- セーブデータ削除
- セーブデータ名変更
- セーブデータ並び替え（ドラッグ&ドロップ）

### 2. UI適応
フローティングメニューのコンテンツエリアに最適化：
- **表示領域**: 右カラムの制限されたスペース（380px × 420px @lg）
- **スクロール対応**: 縦スクロールでセーブデータ一覧を表示
- **レスポンシブ**: 小画面時の適切な表示調整

## コンポーネント設計

### 1. ファイル構成
```
src/components/floating-menu/content/
├── SaveDataContent.tsx           // メインコンテンツ（MenuContentから分離）
├── SaveDataList.tsx             // セーブデータ一覧
├── SaveDataItem.tsx             // 個別セーブデータ項目
├── SaveDataActions.tsx          // アクション ボタンエリア
└── hooks/
    └── useSaveDataMenu.ts       // セーブデータメニュー専用フック
```

### 2. コンポーネント階層
```
SaveDataContent (メインコンテナ)
├── SaveDataActions (上部アクションエリア)
│   ├── 現在のデータを保存ボタン
│   └── 新規作成ボタン
├── SaveDataList (セーブデータ一覧)
│   └── SaveDataItem × N (個別項目)
│       ├── 名前表示
│       ├── 選択ボタン
│       ├── 編集ボタン
│       └── 削除ボタン
└── NewSaveDataModal (新規作成モーダル)
```

## UI設計

### 1. レイアウト構成
```
┌─────────────────────────────────────┐
│ セーブデータ管理                      │
├─────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐     │
│ │現在のデータ │ │  新規作成   │     │
│ │   を保存    │ │            │     │
│ └─────────────┘ └─────────────┘     │
├─────────────────────────────────────┤
│ 📁 メインデータ          [選択]      │
│ 📄 キャラクター1         [選択]      │
│ 📄 テスト用ビルド        [選択] ●   │
│ 📄 火力特化ビルド        [選択]      │
│ │                                   │
│ │           （スクロール）           │
│ ▼                                   │
└─────────────────────────────────────┘
```

### 2. 表示サイズ
- **コンテナ**: 右カラム全体（380px × 420px @lg）
- **ヘッダー**: 48px
- **アクションエリア**: 60px
- **リストエリア**: 残り領域（約310px）でスクロール対応

### 3. アイテム表示
- **高さ**: 各セーブデータ項目 48px
- **レイアウト**: アイコン + 名前 + アクションボタン
- **選択状態**: 現在選択中のデータをハイライト表示

## 状態管理

### 1. 既存ストア活用
SaveDataManagerと同じZustandストアを使用：
- **useCalculatorStore**: 現在のデータ、未保存変更状態
- **useSaveDataStore**: セーブデータ一覧、操作関数

### 2. メニュー専用状態
```typescript
interface SaveDataMenuState {
  isNewModalOpen: boolean
  editingItemId: string | null
  draggedItemId: string | null
  isConfirmDeleteOpen: boolean
  deleteTargetId: string | null
}
```

## 機能詳細

### 1. 現在のデータを保存
- **表示条件**: hasUnsavedChanges = true の場合のみ有効
- **視覚フィードバック**: 保存状態の明確な表示
- **エラーハンドリング**: 保存失敗時の適切な通知

### 2. セーブデータ一覧
- **ソート**: 更新日時降順（最新が上）
- **フィルタ**: 検索機能（将来実装）
- **ページング**: 大量データ対応（必要に応じて）

### 3. セーブデータ操作
```typescript
// 切り替え
const handleSwitchSaveData = async (saveId: string) => {
  if (hasUnsavedChanges) {
    // 未保存確認ダイアログ表示
    showUnsavedChangesDialog(saveId)
  } else {
    // 直接切り替え
    await switchSaveData(saveId)
    await loadSaveData(result)
  }
}

// 削除
const handleDeleteSaveData = async (saveId: string) => {
  if (window.confirm('削除しますか？')) {
    await deleteSaveData(saveId)
  }
}

// 名前変更
const handleRenameSaveData = async (saveId: string, newName: string) => {
  await renameSaveData(saveId, newName)
}
```

### 4. ドラッグ&ドロップ
- **HTML5 Drag API**: 並び替え機能
- **視覚フィードバック**: ドラッグ中の明確な表示
- **制限**: メインデータは移動不可

## 技術仕様

### 1. 実装技術
- **ベースコンポーネント**: 既存SaveDataManagerの機能を再利用
- **共通化**: SaveDataListItem等の既存コンポーネントを活用
- **スタイリング**: Tailwind CSSでフローティングメニューに適応

### 2. パフォーマンス最適化
```typescript
// React.memo で不要な再レンダリング防止
export default React.memo(SaveDataContent)

// useMemo でリスト計算をメモ化
const sortedSaveDataList = useMemo(() => {
  return saveDataList.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}, [saveDataList])
```

### 3. エラーハンドリング
- **ネットワークエラー**: 適切なエラー表示
- **データ不整合**: 自動修復またはユーザー通知
- **ローカルストレージ**: 容量制限時の警告

## 既存コンポーネントとの違い

### 1. 表示領域の制約
- **SaveDataManager**: 独立したページ全体表示
- **SaveDataContent**: 制限されたメニュー内表示

### 2. ナビゲーション
- **SaveDataManager**: 専用の表示/非表示制御
- **SaveDataContent**: フローティングメニューの一部として動作

### 3. モーダル表示
- **SaveDataManager**: ページ全体をベースとしたモーダル
- **SaveDataContent**: メニューパネル内でのモーダル表示

## 実装フェーズ

### Phase 1: 基本実装
1. SaveDataContentコンポーネント作成
2. 既存SaveDataManagerからの機能移植
3. MenuContentでのSaveDataContent表示

### Phase 2: UI最適化
1. フローティングメニューサイズに最適化
2. スクロール動作の調整
3. レスポンシブ対応

### Phase 3: 機能拡張
1. 検索・フィルタ機能
2. バックアップ・復元機能
3. **インポート・エクスポート機能** → [詳細設計書](save-data-import-export.md)

## アクセシビリティ

### 1. キーボード操作
- **Tab/Shift+Tab**: フォーカス移動
- **Enter/Space**: 項目選択・ボタン実行
- **Arrow Keys**: リスト内移動
- **Delete**: 選択項目削除（確認付き）

### 2. ARIA属性
```tsx
<div 
  role="listbox" 
  aria-label="セーブデータ一覧"
  aria-activedescendant={activeItemId}
>
  <div 
    role="option" 
    aria-selected={isSelected}
    aria-label={`セーブデータ: ${name}`}
  >
    {/* セーブデータ項目 */}
  </div>
</div>
```

### 3. スクリーンリーダー対応
- **ライブリージョン**: 状態変更の音声通知
- **説明文**: 各操作の明確な説明
- **エラーメッセージ**: 適切なエラー通知

## 関連ドキュメント
- [SaveDataManager実装](../../src/components/save-data/SaveDataManager.tsx)
- [フローティングメニューシステム要件](../requirements/11_floating-menu-system.md)
- [Zustandストア設計](../technical/zustand-store-design.md)