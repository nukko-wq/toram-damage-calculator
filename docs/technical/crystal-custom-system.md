# クリスタルカスタム機能設計書

## 概要
フロートメニューのサブシステムに、ユーザーがカスタムクリスタル（武器クリスタル、防具クリスタル、追加クリスタル、特殊クリスタル、ノーマルクリスタル）を作成・編集・管理できる機能を追加する。

**実装状況: ✅ 完全実装済み（2024年1月現在）**

## 機能要件

### 1. クリスタルカスタム機能
- **対象クリスタル種類**: 5種類のクリスタル
  - 武器クリスタル (weapon)
  - 防具クリスタル (armor) 
  - 追加クリスタル (additional)
  - 特殊クリスタル (special)
  - ノーマルクリスタル (normal)

### 2. 機能一覧（実装状況）
- ✅ カスタムクリスタルの作成（完全実装済み）
  - タイプ選択画面
  - 名称入力画面（バリデーション付き）
  - プロパティ設定画面
  - 確認画面
- ⏳ 既存カスタムクリスタルの編集（UI準備済み・実装待ち）
- ✅ カスタムクリスタルの削除（完全実装済み）
  - 削除確認ダイアログ
  - 削除成功案内画面
- ✅ カスタムクリスタル一覧表示（タイプ別グルーピング）
- ✅ プロパティエディター（装備品と同様の70+プロパティシステム）
- ⏳ お気に入り機能（データベース対応済み・UI未実装）
- ⏳ 検索・フィルター機能（将来実装予定）

## 技術仕様

### 1. 既存型定義の活用
```typescript
// 既存の型定義を使用
interface UserCrystal {
  id: string
  name: string
  type: CrystalType // 'weapon' | 'armor' | 'additional' | 'special' | 'normal'
  properties: Partial<EquipmentProperties>
  description?: string
  isCustom: true
  createdAt: string
  updatedAt: string
  isFavorite?: boolean
}

interface CustomCrystal extends PresetCrystal, LocalStorageCustomItemBase {
  isCustom: true
  description?: string
}
```

### 2. UI/UX設計

#### 2.1 フロートメニュー統合
- **メニューパス**: フロートメニュー → サブシステム → クリスタルカスタム
- **既存MenuSection**: 'subsystem'を使用
- **サブナビゲーション**: サブシステム内にクリスタルカスタム項目を追加

#### 2.2 画面構成
```
フロートメニュー
└── サブシステム
    └── クリスタルカスタム
        ├── 作成
        ├── 一覧・編集
        └── 検索・フィルター
```

### 3. コンポーネント構成

#### 3.1 実装済みコンポーネント構成
```
src/components/floating-menu/content/subsystem/
├── FullScreenModal.tsx                  // 全画面モーダル（実装済み）
└── crystal/                             // クリスタルカスタム
    ├── CrystalCustomSystem.tsx          // メインコンテナ（実装済み）
    ├── CrystalCustomMain.tsx            // メイン画面・操作選択（実装済み）
    ├── CrystalTypeSelection.tsx         // タイプ選択画面（実装済み）
    ├── CrystalNameInput.tsx             // 名称入力画面（実装済み）
    ├── CrystalPropertyInput.tsx         // プロパティ入力画面（実装済み）
    ├── CrystalConfirmation.tsx          // 新規登録確認画面（実装済み）
    └── CrystalDeleteConfirmation.tsx    // 削除確認画面（実装済み）

src/types/stores.ts                      // UI状態管理型定義（拡張済み）
src/stores/uiStore.ts                    // UIStore実装（拡張済み）
src/utils/crystalDatabase.ts             // データベース関数（削除機能追加済み）
```

#### 3.2 既存コンポーネントとの統合（実装済み）
- ✅ `src/components/floating-menu/MenuContent.tsx`にサブシステム項目追加済み
- ✅ `src/components/equipment/PropertyEditor.tsx`を再利用してプロパティエディター実装済み
  - `disableCrystalSelector`オプションでクリスタル連携機能を無効化
  - 仮想装備アイテム作成でPropertyEditorとの互換性確保
- ✅ `src/utils/crystalDatabase.ts`の拡張完了
  - `deleteUserCrystal`関数追加
  - 削除機能のエラーハンドリング強化

### 4. データ管理

#### 4.1 ストレージ統合
- **LocalStorage**: カスタムクリスタルデータの永続化
- **Zustand Store**: UI状態とリアルタイム更新管理
- **Database Layer**: `src/utils/crystalDatabase.ts`の拡張

#### 4.2 データフロー（実装済み）
```
UI操作 → UIStore(Zustand) → crystalDatabase.ts → LocalStorage
         ↓
  リアルタイム状態管理 ← 統合データ提供
```

**実装済み機能のデータフロー:**
- 新規作成: `CrystalCustomMain` → タイプ選択 → 名称入力 → プロパティ設定 → 確認 → `saveUserCrystal()`
- 削除操作: 削除ボタンクリック → 削除確認画面 → `deleteUserCrystal()` → 削除成功画面
- 状態管理: 全てZustandのUIStoreで統一管理

### 5. バリデーション

#### 5.1 入力検証
- クリスタル名: 必須、1-50文字
- クリスタル種類: 5種類から選択必須
- プロパティ: 数値範囲チェック
- 重複チェック: 同名クリスタルの防止

#### 5.2 Zodスキーマ
```typescript
// src/schemas/crystalCustom.ts
const CrystalCustomSchema = z.object({
  name: z.string().min(1).max(50),
  type: z.enum(['weapon', 'armor', 'additional', 'special', 'normal']),
  properties: EquipmentPropertiesSchema.partial(),
  description: z.string().max(200).optional()
})
```

### 6. 実装フェーズ（完了状況）

#### ✅ Phase 1: 基盤実装（完了）
- ✅ コンポーネント構造作成完了
- ✅ 基本CRUD機能実装完了（作成・削除）
- ✅ LocalStorage統合完了

#### ⏳ Phase 2: UI/UX強化（一部完了）
- ✅ プロパティエディター実装完了
- ⏳ 検索・フィルター機能（将来実装予定）
- ✅ バリデーション強化完了

#### ✅ Phase 3: 統合・最適化（完了）
- ✅ 既存システムとの統合完了
  - CrystalFormで作成したカスタムクリスタルが自動表示
  - PropertyEditorとの完全統合
- ✅ エラーハンドリング強化完了
- ✅ UI状態管理（Zustand）による最適化完了

## 設計原則

### 1. 既存パターンの踏襲
- 装備品カスタム機能の設計パターンを参考
- 既存のモーダルシステムと統一
- プロパティエディターの再利用

### 2. TypeScript厳密性
- 型安全性の確保
- Runtime型チェック（Zod使用）
- インターフェースの一貫性

### 3. ユーザビリティ
- 直感的な操作フロー
- リアルタイムプレビュー
- エラーメッセージの明確化

### 4. パフォーマンス
- 遅延読み込み（Lazy Loading）
- メモ化（React.memo）
- 不要な再レンダリング防止

## 参考実装

### 既存の類似機能
- `src/components/equipment/` - 装備品カスタム機能
- `src/components/crystal/` - 既存クリスタル機能
- `src/utils/customEquipmentManager.ts` - カスタム装備品管理

### 活用可能な共通コンポーネント
- `PropertyEditor.tsx` - プロパティ編集
- `DeleteConfirmModal.tsx` - 削除確認
- モーダルシステム全般

## 実装済み削除機能の詳細

### 削除機能アーキテクチャ
- **削除フロー**: 削除ボタン → 削除確認ダイアログ → 削除実行 → 成功案内
- **UI状態管理**: `UIStore.crystalCustom.deleteFlow`で削除状態を管理
- **データベース**: `deleteUserCrystal()`で安全な削除処理
- **エラーハンドリング**: 削除失敗時の適切な状態復旧

### 削除確認ダイアログの特徴
- クリスタルの完全な詳細情報表示（タイプ、名称、プロパティ一覧、作成日時）
- 警告メッセージ「この操作は元に戻すことができません」
- 削除成功後の案内画面（緑のチェックマークと成功メッセージ）

### セキュリティと安全性
- 削除前の存在確認
- 削除処理中の重複実行防止
- 削除失敗時の適切なエラーハンドリング
- LocalStorage更新の原子性確保

## 注意事項

### 1. データ整合性（実装済み対策）
- ✅ カスタムクリスタルと既存システムの整合性確保済み
- ✅ 削除時のIDベース存在チェック実装済み

### 2. ストレージ制限
- LocalStorageサイズ制限への配慮
- データ圧縮の検討

### 3. 移行サポート
- 既存データとの互換性維持
- バージョンアップ時のデータ移行