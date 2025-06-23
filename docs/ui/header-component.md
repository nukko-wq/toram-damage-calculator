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

## 計算結果ボタンバー（ヘッダー下コンポーネント）

### 概要
ヘッダーの直下に配置される計算結果表示用のトグルボタンバー。与ダメージ確認とステータス確認の2つのプレビュー機能を提供します。

### コンポーネント構成

#### ResultToggleBar（メインコンポーネント）
- **ファイル**: `src/components/layout/ResultToggleBar.tsx`
- **目的**: 計算結果の表示制御とプレビューエリア管理
- **位置**: ヘッダー直下、メインコンテンツの上

### レイアウト構造

```
┌─────────────────── Header ───────────────────┐
│ ⚔️ トーラムダメージ計算    [セーブデータ管理] │
└─────────────────────────────────────────────┘
┌─────── ResultToggleBar ─────────────────────┐
│ [与ダメージ確認] [ステータス確認]           │
└─────────────────────────────────────────────┘
┌─────── Preview Area ────────────────────────┐
│ ▼ 選択されたプレビューの内容をスライドダウン   │
└─────────────────────────────────────────────┘
```

### UI仕様

#### ボタンバー設計
- **ボタン配置**: 左側に2つのトグルボタンを配置
- **ボタンラベル**: "与ダメージ確認" | "ステータス確認"
- **ボタン状態**: アクティブ（選択中）/非アクティブ/両方非選択
- **動作**: 排他的選択（1つのみアクティブ、同じボタンで閉じる）

#### ボタン仕様
```typescript
interface ResultToggleButton {
  id: 'damage' | 'status'
  label: '与ダメージ確認' | 'ステータス確認'
  icon: React.ComponentType
  color: 'orange' | 'blue'  // 与ダメージ=オレンジ、ステータス=ブルー
}
```

#### プレビューエリア
- **表示制御**: スライドダウンアニメーション（300ms、ease-in-out）
- **高さ**: auto（コンテンツに応じて動的調整）
- **背景**: 薄いグレー（bg-gray-50）
- **境界**: 上下にボーダーライン

### レスポンシブ設計

**デスクトップ（lg以上）**:
```css
.result-toggle-bar {
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
  padding: 0.75rem 1rem;
}
```

**タブレット（md-lg）**:
```css
.result-toggle-bar {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
}
```

**モバイル（sm未満）**:
```css
.result-toggle-bar {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
}
```

### 技術仕様

#### TypeScript インターフェース

```typescript
interface ResultToggleBarProps {
  className?: string
}

interface ResultToggleState {
  activeResult: 'damage' | 'status' | null
}

interface DamagePreviewProps {
  isVisible: boolean
  data?: DamageCalculationResult
}

interface StatusPreviewProps {
  isVisible: boolean
  data?: CalculationResults
}
```

#### Zustand統合

新しいUIStore拡張:
```typescript
interface UIStore {
  // 既存フィールド...
  
  // 計算結果表示制御
  activeResultView: 'damage' | 'status' | null
  setActiveResultView: (view: 'damage' | 'status' | null) => void
  toggleResultView: (view: 'damage' | 'status') => void
}
```

### コンポーネント分割

#### ResultToggleBar.tsx（メインコンポーネント）
- ボタンバーのレイアウト管理
- プレビューエリアの表示制御
- 状態管理とアニメーション制御

#### DamagePreview.tsx（与ダメージ確認）
- ダメージ計算結果のプレビュー表示
- 通常攻撃、スキル攻撃、クリティカル等の表示
- **現在は準備のみ（ダミーデータ表示）**

#### StatusPreview.tsx（ステータス確認）
- 既存のCalculationResultContentを活用
- 基本ステータス、補正後ステータス等の表示
- 簡易版表示（主要項目のみ）

### スタイリング仕様

#### ボタンスタイル
```css
/* 与ダメージ確認ボタン */
.damage-toggle-btn {
  @apply inline-flex items-center px-4 py-2 border border-transparent 
         text-sm font-medium rounded-md transition-colors duration-200
         focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.damage-toggle-btn.active {
  @apply text-white bg-orange-600 hover:bg-orange-700 
         focus:ring-orange-500;
}

.damage-toggle-btn.inactive {
  @apply text-orange-700 bg-orange-100 hover:bg-orange-200 
         focus:ring-orange-500;
}

/* ステータス確認ボタン */
.status-toggle-btn {
  @apply inline-flex items-center px-4 py-2 border border-transparent 
         text-sm font-medium rounded-md transition-colors duration-200
         focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.status-toggle-btn.active {
  @apply text-white bg-blue-600 hover:bg-blue-700 
         focus:ring-blue-500;
}

.status-toggle-btn.inactive {
  @apply text-blue-700 bg-blue-100 hover:bg-blue-200 
         focus:ring-blue-500;
}
```

### アクセシビリティ

#### ARIA属性
```tsx
<div role="tablist" aria-label="計算結果表示">
  <button
    role="tab"
    aria-selected={activeResult === 'damage'}
    aria-controls="damage-preview"
    id="damage-toggle"
  >
    与ダメージ確認
  </button>
  <button
    role="tab"
    aria-selected={activeResult === 'status'}
    aria-controls="status-preview"
    id="status-toggle"
  >
    ステータス確認
  </button>
</div>

<div
  role="tabpanel"
  aria-labelledby="damage-toggle"
  id="damage-preview"
  hidden={activeResult !== 'damage'}
>
  {/* ダメージプレビューコンテンツ */}
</div>
```

### データフロー

1. **ボタンクリック** → UIStore更新 → 状態変更
2. **状態変更** → プレビューエリア表示切り替え
3. **データ更新** → CalculatorStore経由で最新データ取得
4. **表示更新** → プレビューコンポーネントに反映

### 統合方針

#### layout.tsx統合
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
        <ResultToggleBar />
        <main>{children}</main>
      </body>
    </html>
  )
}
```

### 将来拡張

#### 追加予定機能
- ダメージ計算ロジック完成後の詳細表示
- 複数の計算パターン比較機能
- エクスポート・共有機能
- 計算履歴表示

#### 拡張可能な設計
```typescript
interface ResultViewConfig {
  views: ResultView[]
  defaultView?: string
  showIcons: boolean
  allowMultipleActive: boolean
}

interface ResultView {
  id: string
  label: string
  icon?: React.ComponentType
  component: React.ComponentType
  color: string
  badge?: string | number
}
```