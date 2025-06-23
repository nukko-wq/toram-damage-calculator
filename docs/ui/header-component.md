# ヘッダーコンポーネント設計書

## 概要

アプリケーション全体の共通ヘッダーコンポーネント。サイトタイトル、ナビゲーション、アクションボタンを含む統一されたインターフェースを提供します。

## コンポーネント構成

### Header（メインヘッダー）
- **ファイル**: `src/components/ui/Header.tsx`
- **目的**: アプリケーション全体の共通ヘッダー
- **レスポンシブ対応**: デスクトップ・タブレット・モバイル

### レイアウト構造

```
┌─────────────────────────────────────────────────────────────┐
│ [🗡️] トーラムダメージ計算    [セーブデータ管理] [計算結果表示] │
└─────────────────────────────────────────────────────────────┘
```

**デスクトップレイアウト**:
- 左側: サイトロゴ + タイトル
- 右側: アクションボタン群（セーブデータ管理、計算結果表示）

**モバイルレイアウト**:
- 上段: サイトロゴ + タイトル
- 下段: アクションボタン群（縦並び配置）

## UI仕様

### サイトタイトル部分
- **アイコン**: ⚔️ または 🗡️（剣のアイコン）
- **タイトル**: "トーラムダメージ計算"
- **フォント**: 日本語対応、セミボールド
- **色**: プライマリカラー（青系）

### アクションボタン
1. **セーブデータ管理ボタン**
   - 現在の実装を流用
   - アイコン: 📋 または 💾
   - ラベル: "セーブデータ管理"

2. **計算結果表示ボタン**
   - 計算結果の表示/非表示を切り替え
   - アイコン: 📊 または ▼（状態に応じて変化）
   - ラベル: "計算結果を表示" / "計算結果を非表示"

### レスポンシブ設計

**ブレークポイント**:
- `sm`: 640px以上（モバイル）
- `md`: 768px以上（タブレット）
- `lg`: 1024px以上（デスクトップ）

**デスクトップ（lg以上）**:
```css
display: flex
justify-content: space-between
align-items: center
```

**タブレット（md-lg）**:
```css
display: flex
flex-direction: column
gap: 1rem
```

**モバイル（sm未満）**:
```css
display: flex
flex-direction: column
gap: 0.75rem
```

## 技術仕様

### TypeScript インターフェース

```typescript
interface HeaderProps {
  className?: string
}

interface HeaderActionsProps {
  showSaveManager: boolean
  onToggleSaveManager: () => void
  showCalculationResult: boolean
  onToggleCalculationResult: () => void
}
```

### Zustand統合

ヘッダーコンポーネントは以下のストアと連携:

```typescript
// UIStore
const { showSaveManager, setShowSaveManager } = useUIStore()

// CalculatorStore
const { 
  isCalculationResultVisible, 
  toggleCalculationResultVisibility 
} = useCalculatorStore()
```

### スタイリング

**Tailwind CSS クラス構成**:
```css
/* ヘッダーコンテナ */
.header-container {
  @apply sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm;
}

/* タイトル部分 */
.header-title {
  @apply flex items-center gap-2 text-xl font-semibold text-gray-900;
}

/* アクションボタン */
.header-action-btn {
  @apply inline-flex items-center px-4 py-2 border border-transparent 
         text-sm font-medium rounded-md text-white bg-blue-600 
         hover:bg-blue-700 focus:outline-none focus:ring-2 
         focus:ring-blue-500 focus:ring-offset-2;
}
```

## コンポーネント分割

### Header.tsx（メインコンポーネント）
- 全体のレイアウト管理
- レスポンシブ制御
- Zustandストアとの統合

### HeaderTitle.tsx（サブコンポーネント）
- サイトタイトルとアイコンの表示
- ブランディング要素の管理

### HeaderActions.tsx（サブコンポーネント）
- アクションボタン群の管理
- ボタンの状態表示とイベント処理

## アクセシビリティ

### ARIA属性
```tsx
<header role="banner" aria-label="メインヘッダー">
  <h1 aria-label="サイトタイトル">トーラムダメージ計算</h1>
  <nav role="navigation" aria-label="ヘッダーアクション">
    <button aria-expanded={showSaveManager} aria-controls="save-manager">
      セーブデータ管理
    </button>
    <button aria-expanded={showCalculationResult} aria-controls="calculation-result">
      計算結果表示
    </button>
  </nav>
</header>
```

### キーボードナビゲーション
- Tab順序: タイトル → セーブデータ管理ボタン → 計算結果表示ボタン
- Enter/Space: ボタンアクティベーション
- Escape: モーダル系の閉じる動作（必要に応じて）

## パフォーマンス考慮事項

### メモ化
```typescript
export const Header = memo(() => {
  // implementation
})

export const HeaderActions = memo<HeaderActionsProps>(({ 
  showSaveManager, 
  onToggleSaveManager,
  showCalculationResult,
  onToggleCalculationResult 
}) => {
  // implementation
}, (prevProps, nextProps) => {
  return (
    prevProps.showSaveManager === nextProps.showSaveManager &&
    prevProps.showCalculationResult === nextProps.showCalculationResult
  )
})
```

### 最適化ポイント
- 状態変更時の不要な再レンダリング防止
- アイコンのSVG最適化
- レスポンシブ用のCSSの最適化

## 統合方針

### layout.tsx統合
```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  )
}
```

### 既存コードの移行
1. `src/app/page.tsx`からヘッダー関連コードを抽出
2. セーブデータ管理ボタンをHeaderActionsに移動
3. 計算結果表示ボタンをHeaderActionsに移動
4. レスポンシブスタイルの統合

## 分離されたコンポーネント

### 関連コンポーネント
ヘッダーと連携する以下のコンポーネントは独立した設計書で管理:

- **ResultToggleBar**: 計算結果表示制御 → [result-toggle-bar.md](./result-toggle-bar.md)
- **StatusPreview**: ステータス計算結果詳細表示 → [status-preview.md](./status-preview.md)
- **DamagePreview**: ダメージ計算結果表示（将来実装）

### 統合レイアウト
```typescript
// layout.tsx
<Header />           // サイトブランディング + セーブデータ管理
<ResultToggleBar />  // 計算結果表示制御
<main>{children}</main>
```