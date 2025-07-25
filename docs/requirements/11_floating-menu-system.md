# フローティングメニューシステム要件定義

## 概要
画面右下に固定配置されたメニューボタンと、ボタン押下時に表示される右上部メニューパネルによるナビゲーションシステムの要件定義。

## 機能要件

### 1. フローティングメニューボタン

#### 1.1 配置仕様
- **位置**: 画面右下に固定配置（CSS fixed positioning）
- **座標**: 右端から16px、下端から16px
- **サイズ**: 56×56px（FAB標準サイズ）
- **形状**: 円形ボタン
- **z-index**: 最上位レイヤー（z-index: 9999）

#### 1.2 視覚デザイン
- **背景色**: プライマリカラー（青系）
- **アイコン**: ハンバーガーメニューまたはドットメニュー
- **シャドウ**: Material Design準拠のドロップシャドウ
- **ホバー効果**: 軽微な拡大とシャドウ強化
- **アクティブ状態**: アイコンの回転アニメーション（90度回転）

#### 1.3 レスポンシブ対応
- **PC**: 右下固定表示
- **タブレット**: 右下固定表示
- **モバイル**: 右下固定表示（タップ領域確保）
- **最小画面**: 適切なタップ領域（44×44px以上）を確保

#### 1.4 アクセシビリティ
- **ARIA**: `aria-label="メニューを開く"` / `aria-expanded`
- **キーボード**: Tabキーでフォーカス可能
- **スクリーンリーダー**: 適切な説明文
- **フォーカス**: 明確なフォーカスリング

### 2. メニューパネル

#### 2.1 配置仕様
- **位置**: 画面右上部に表示
- **座標**: 右端から16px、上端から80px（ヘッダー下）
- **幅**: 400px（PC）/ 320px（タブレット）/ 画面幅-32px（モバイル）
- **高さ**: コンテンツに応じて可変（最大画面高さ-160px）

#### 2.2 レイアウト構造
```
┌─────────────────────────────────────┐
│ ┌─────────┐ ┌─────────────────────┐ │
│ │  左      │ │        右           │ │
│ │  カラム  │ │      カラム         │ │
│ │         │ │                     │ │
│ │ TOP     │ │   (機能エリア)      │ │
│ │ サンプル │ │                     │ │
│ │ セーブ  │ │                     │ │
│ │ サブ    │ │                     │ │
│ │ 設定    │ │                     │ │
│ └─────────┘ └─────────────────────┘ │
└─────────────────────────────────────┘
```

#### 2.3 左カラム仕様
- **幅**: 120px
- **背景**: 軽いグレー（区切り明確化）
- **メニュー項目**:
  1. **TOP**: アプリケーショントップ機能
  2. **サンプルデータ**: プリセットデータ読み込み
  3. **セーブデータ**: セーブデータ管理（HeaderActionsと連携）
  4. **サブシステム**: 追加機能・ツール類
  5. **設定**: アプリケーション設定

#### 2.4 右カラム仕様
- **幅**: 残り領域（280px前後）
- **内容**: 左カラム選択項目に応じた機能UI
- **初期状態**: 「TOP」選択時の内容を表示
- **将来実装**: 各メニュー項目の詳細機能

#### 2.5 インタラクション
- **表示**: フェードイン + スライドイン（右から左）
- **非表示**: フェードアウト + スライドアウト（左から右）
- **アニメーション時間**: 200ms
- **イージング**: ease-out
- **オーバーレイ**: 半透明背景でメニュー外クリック時に閉じる

### 3. 状態管理

#### 3.1 表示状態
- **初期状態**: 非表示
- **開いた状態**: パネル表示 + オーバーレイ表示
- **選択状態**: 左カラムの選択項目をハイライト

#### 3.2 ライフサイクル
1. **ボタンクリック** → メニューパネル表示
2. **メニュー項目選択** → 右カラム内容更新
3. **外部クリック/ESCキー** → メニューパネル非表示
4. **同一項目再選択** → 状態維持

### 4. 技術仕様

#### 4.1 実装技術
- **フレームワーク**: React 19 + TypeScript
- **スタイリング**: Tailwind CSS v4
- **アニメーション**: Framer Motion推奨
- **状態管理**: Zustand（必要に応じて）

#### 4.2 コンポーネント構成
```
FloatingMenuSystem/
├── FloatingMenuButton.tsx     // 右下固定ボタン
├── MenuPanel.tsx              // メニューパネル本体
├── MenuNavigation.tsx         // 左カラムナビゲーション
├── MenuContent.tsx            // 右カラムコンテンツ
└── hooks/
    └── useFloatingMenu.ts     // メニュー状態管理
```

#### 4.3 CSS仕様
- **固定配置**: `position: fixed; bottom: 16px; right: 16px;`
- **レスポンシブ**: Tailwindのブレークポイント活用
- **z-index**: ヘッダーより上位、モーダルより下位

### 5. アクセシビリティ要件

#### 5.1 キーボード操作
- **Tab**: フォーカス移動
- **Enter/Space**: ボタン・項目選択
- **Escape**: メニュー閉じる
- **Arrow Keys**: 左カラム項目間移動

#### 5.2 ARIA属性
- **ボタン**: `aria-expanded`, `aria-label`
- **パネル**: `role="dialog"`, `aria-modal="true"`
- **ナビゲーション**: `role="navigation"`
- **項目**: `aria-selected`, `aria-current`

### 6. パフォーマンス要件

#### 6.1 レンダリング
- **初期描画**: 20ms以内
- **アニメーション**: 60fps維持
- **メモリ使用**: 最小限（不要時はunmount）

#### 6.2 最適化
- **React.memo**: 不要な再レンダリング防止
- **useMemo/useCallback**: 計算コスト削減
- **動的インポート**: 右カラムコンテンツの遅延読み込み

### 7. 将来拡張

#### 7.1 メニュー項目追加
- **カスタムメニュー**: ユーザー定義項目
- **プラグインシステム**: 外部機能統合
- **ショートカット**: よく使用する機能への直接アクセス

#### 7.2 右カラム機能
- **TOP**: ダッシュボード、最近の活動
- **サンプルデータ**: プリセット一覧、カテゴリ分類
- **セーブデータ**: 詳細管理、**インポート/エクスポート** → [詳細設計書](../ui/save-data-import-export.md)
- **サブシステム**: 計算ツール、シミュレーター
- **設定**: テーマ変更、言語設定、表示オプション

### 8. 品質要件

#### 8.1 ユーザビリティ
- **直感的操作**: 一般的なFABパターンに準拠
- **視覚的フィードバック**: 明確な状態表示
- **エラー防止**: 誤操作の最小化

#### 8.2 互換性
- **ブラウザ**: モダンブラウザ対応
- **デバイス**: PC/タブレット/モバイル対応
- **スクリーンサイズ**: 320px〜対応

### 9. 実装優先度

#### Phase 1（基本実装）
1. フローティングメニューボタン
2. メニューパネル基本構造
3. 左カラムナビゲーション
4. 表示/非表示アニメーション

#### Phase 2（機能拡張）
1. 右カラムコンテンツ基盤
2. TOP機能実装
3. セーブデータ連携

#### Phase 3（詳細機能）
1. サンプルデータ機能
2. サブシステム機能
3. 設定機能

## 関連ドキュメント
- [UI設計書](../ui/) - 詳細なUIコンポーネント仕様
- [技術仕様書](../technical/) - 実装技術詳細
- [アクセシビリティガイド](../accessibility/) - アクセシビリティ要件詳細