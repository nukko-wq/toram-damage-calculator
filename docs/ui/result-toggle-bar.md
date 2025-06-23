# ResultToggleBar コンポーネント設計書

## 概要

ヘッダー直下に配置される計算結果表示用のトグルボタンバー。「与ダメージ確認」と「ステータス確認」の2つのプレビュー機能を提供し、スライドダウンアニメーションで表示を切り替える。

## コンポーネント構成

### ResultToggleBar（メインコンポーネント）
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

## UI仕様

### ボタンバー設計
- **ボタン配置**: 左側に2つのトグルボタンを配置
- **ボタンラベル**: "与ダメージ確認" | "ステータス確認"
- **ボタン状態**: アクティブ（選択中）/非アクティブ/両方非選択
- **動作**: 排他的選択（1つのみアクティブ、同じボタンで閉じる）

### ボタン仕様
```typescript
interface ResultToggleButton {
  id: 'damage' | 'status'
  label: '与ダメージ確認' | 'ステータス確認'
  icon: React.ComponentType
  color: 'orange' | 'blue'  // 与ダメージ=オレンジ、ステータス=ブルー
}
```

### プレビューエリア
- **表示制御**: スライドダウンアニメーション（300ms、ease-in-out）
- **高さ**: auto（コンテンツに応じて動的調整）
- **背景**: 薄いグレー（bg-gray-50）
- **境界**: 上下にボーダーライン

## レスポンシブ設計

### デスクトップ（lg以上）
```css
.result-toggle-bar {
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
  padding: 0.75rem 1rem;
}
```

### タブレット（md-lg）
```css
.result-toggle-bar {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
}
```

### モバイル（sm未満）
```css
.result-toggle-bar {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
}
```

## 技術仕様

### TypeScript インターフェース

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

### Zustand統合

UIStore拡張:
```typescript
interface UIStore {
  // 既存フィールド...
  
  // 計算結果表示制御
  activeResultView: 'damage' | 'status' | null
  setActiveResultView: (view: 'damage' | 'status' | null) => void
  toggleResultView: (view: 'damage' | 'status') => void
}

// 実装
toggleResultView: (view) => {
  const currentView = get().activeResultView
  const newView = currentView === view ? null : view
  set({ activeResultView: newView }, false, 'toggleResultView')
}
```

## プレビューコンポーネント

### DamagePreview（与ダメージ確認）
- ダメージ計算結果のプレビュー表示
- 通常攻撃、スキル攻撃、クリティカル等の表示
- **現在は準備のみ（ダミーデータ表示）**

### StatusPreview（ステータス確認）
- 正確なHP・MP計算ロジックを使用
- 基本ステータス、計算詳細、武器情報の表示
- 計算過程の段階的表示

## スタイリング仕様

### ボタンスタイル

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

### コンテナスタイル
```css
.result-toggle-container {
  @apply bg-white border-b border-gray-200;
}

.result-toggle-content {
  @apply container mx-auto px-4 py-3;
}
```

## アクセシビリティ

### ARIA属性
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

### キーボードナビゲーション
- Tab順序: 与ダメージ確認 → ステータス確認
- Enter/Space: ボタンアクティベーション
- Arrow keys: ボタン間移動（オプション）

## データフロー

1. **ボタンクリック** → UIStore更新 → 状態変更
2. **状態変更** → プレビューエリア表示切り替え
3. **データ更新** → CalculatorStore経由で最新データ取得
4. **表示更新** → プレビューコンポーネントに反映

### 状態管理フロー
```
User Click → toggleResultView() → UIStore Update → Component Rerender → Preview Display
```

## アニメーション仕様

### スライドダウン効果
```css
.preview-area {
  transition: all 300ms ease-in-out;
  transform-origin: top;
}

.preview-enter {
  opacity: 0;
  transform: scaleY(0);
}

.preview-enter-active {
  opacity: 1;
  transform: scaleY(1);
}

.preview-exit {
  opacity: 1;
  transform: scaleY(1);
}

.preview-exit-active {
  opacity: 0;
  transform: scaleY(0);
}
```

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
        <ResultToggleBar />
        <main>{children}</main>
      </body>
    </html>
  )
}
```

### コンポーネント分離
- **Header**: サイトブランディング + セーブデータ管理
- **ResultToggleBar**: 計算結果表示制御
- **各Preview**: 専門的な計算結果表示

## パフォーマンス考慮事項

### レンダリング最適化
```typescript
export default React.memo<ResultToggleBarProps>(function ResultToggleBar({ className = '' }) {
  // implementation
}, (prevProps, nextProps) => {
  return prevProps.className === nextProps.className
})
```

### 状態更新の最適化
- 不要な再レンダリングの防止
- 状態変更時のバッチング
- メモ化による計算結果キャッシュ

## 将来拡張

### 追加予定プレビュー
- 装備比較プレビュー
- ビルド最適化提案
- エクスポート・共有プレビュー

### 拡張可能な設計
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

## 更新履歴

| 日付 | 更新内容 | 備考 |
|------|----------|------|
| 2024-06-23 | ResultToggleBar独立設計書作成 | header-component.mdから分離 |
| 2024-06-23 | StatusPreview統合完了 | 正確な計算ロジック使用 |

## 関連ドキュメント
- [ヘッダーコンポーネント設計](./header-component.md)
- [StatusPreview設計](./status-preview.md)
- [UIStore設計](../store/ui-store.md)