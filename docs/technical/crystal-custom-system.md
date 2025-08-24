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
- ✅ 既存カスタムクリスタルの編集（実装完了）
  - 編集対象選択画面（クリスタル一覧から選択）
  - 既存値が入った状態でのタイプ選択画面
  - 既存値が入った状態での名称入力画面（バリデーション付き）
  - 既存値が入った状態でのプロパティ設定画面（「再登録」ボタン）
  - 確認画面（「はい」ボタン）
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

**設計済み編集機能のデータフロー:**
- 編集操作: `CrystalCustomMain`（内容変更） → 編集対象一覧 → 編集ボタン → 既存データ読み込み → タイプ選択（既存値） → 名称入力（既存値） → プロパティ設定（既存値） → 確認（再登録表記） → `updateUserCrystal()`
- 編集モード管理: `editMode: 'edit'` → `currentEditId` で編集対象を特定 → 既存データを各画面にプリセット
- 初期値設定フロー: `getUserCrystalById(currentEditId)` → 既存データ取得 → `newRegistration`に設定 → 各画面でリアルタイム反映

### 5. 編集機能の詳細設計

#### 5.1 編集フローの画面遷移
```
CrystalCustomMain (editMode: 'create')
  ↓ [内容変更ボタン]
CrystalCustomMain (editMode: 'edit') → 編集対象一覧表示
  ↓ [各クリスタルの編集ボタン]
タイプ選択画面 (既存タイプが選択済み)
  ↓ [次へボタン]
名称入力画面 (既存名称が入力済み)
  ↓ [次へボタン]
プロパティ設定画面 (既存プロパティが設定済み)
  ↓ [再登録ボタン]
確認画面 (ボタン表記: 「はい」)
  ↓ [はいボタン]
完了画面 (メッセージ: 「更新しました」)
```

#### 5.2 編集機能の技術仕様
- **編集モード管理**: `UIStore.crystalCustom.editMode: 'edit'`
- **編集対象特定**: `UIStore.crystalCustom.currentEditId: string`
- **既存データ読み込み**: 編集開始時に`getUserCrystalById()`で既存データを`newRegistration`に設定
- **UI表示制御**: 各画面で`editMode === 'edit'`の場合にボタンテキストを変更
  - プロパティ設定画面: 「登録」→「再登録」
  - 確認画面: 常に「はい」（新規作成・編集共通）
- **データ更新**: `updateUserCrystal()`関数で既存クリスタルを更新（LocalStorage）

#### 5.2.1 フォーム初期値設定の詳細仕様
編集モードでは、各画面のフォームに既存データを初期値として自動設定する：

- **タイプ選択画面**:
  - `newRegistration.selectedType`に既存クリスタルの`type`を設定
  - 対応するタイプボタンが選択済み状態で表示

- **名称入力画面**:
  - `newRegistration.name`に既存クリスタルの`name`を設定
  - input要素の`defaultValue`または`value`に既存名称が入力済み状態

- **プロパティ設定画面**:
  - `newRegistration.properties`に既存クリスタルの`properties`を完全コピー
  - PropertyEditorコンポーネントの各入力フィールドに既存値が表示
  - 「現在の設定値エリア」には既存のアクティブプロパティが表示

- **確認画面**:
  - 既存データをベースとした変更内容を表示
  - 確認メッセージ: 編集時「以下の内容で更新しますか？」、新規時「以下の内容で登録しますか？」
  - ボタンのテキスト: 常に「はい」（新規作成・編集共通）

#### 5.2.2 初期値設定のタイミング
```typescript
// 編集ボタンクリック時のアクション例
const handleEditCrystal = (crystalId: string) => {
  const existingCrystal = getUserCrystalById(crystalId)
  if (existingCrystal) {
    // UIStore状態更新
    setCrystalEditMode('edit', crystalId)
    updateCrystalFormData({
      selectedType: existingCrystal.type,
      name: existingCrystal.name,
      properties: { ...existingCrystal.properties }
    })
    navigateToScreen('type_selection')
  }
}
```

#### 5.3 編集と新規作成の共通化
- **画面コンポーネント**: 既存の`CrystalTypeSelection`、`CrystalNameInput`、`CrystalPropertyInput`、`CrystalConfirmation`を再利用
- **状態管理**: 同一の`newRegistration`オブジェクトを使用、編集時は初期値として既存データを設定
- **バリデーション**: 新規作成と同一のバリデーションルールを適用
- **プロパティエディター**: `PropertyEditor`コンポーネントを再利用、既存プロパティが初期値として設定

#### 5.3.1 各コンポーネントの初期値対応
各画面コンポーネントは`editMode`と`newRegistration`の状態を監視し、適切に初期値を表示する：

```typescript
// タイプ選択画面の例
const CrystalTypeSelection = () => {
  const { editMode, newRegistration } = useUIStore()
  
  // 編集モードでは既存タイプが選択済み状態
  const selectedType = newRegistration.selectedType
  
  return (
    <div>
      {crystalTypes.map(type => (
        <button 
          key={type}
          className={selectedType === type ? 'selected' : ''}
          onClick={() => selectCrystalType(type)}
        >
          {type}
        </button>
      ))}
    </div>
  )
}

// 名称入力画面の例
const CrystalNameInput = () => {
  const { editMode, newRegistration, setCrystalName } = useUIStore()
  
  return (
    <input
      type="text"
      value={newRegistration.name} // 編集時は既存名称が表示
      onChange={(e) => setCrystalName(e.target.value)}
      placeholder="クリスタル名を入力"
    />
  )
}

// プロパティ設定画面の例
const CrystalPropertyInput = () => {
  const { newRegistration } = useUIStore()
  
  const virtualItem = {
    properties: newRegistration.properties // 編集時は既存プロパティを引き継ぎ
  }
  
  return <PropertyEditor item={virtualItem} {...props} />
}
```

### 6. バリデーション

#### 6.1 入力検証
- クリスタル名: 必須、1-50文字
- クリスタル種類: 5種類から選択必須
- プロパティ: 数値範囲チェック
- 重複チェック: 同名クリスタルの防止

#### 6.2 Zodスキーマ
```typescript
// src/schemas/crystalCustom.ts
const CrystalCustomSchema = z.object({
  name: z.string().min(1).max(50),
  type: z.enum(['weapon', 'armor', 'additional', 'special', 'normal']),
  properties: EquipmentPropertiesSchema.partial(),
  description: z.string().max(200).optional()
})
```

### 7. 実装フェーズ（完了状況）

#### ✅ Phase 1: 基盤実装（完了）
- ✅ コンポーネント構造作成完了
- ✅ 基本CRUD機能実装完了（作成・削除）
- ✅ LocalStorage統合完了

#### 🔄 Phase 2: UI/UX強化（一部完了・設計完了）
- ✅ プロパティエディター実装完了
- ✅ 編集機能実装完了
  - 編集フロー実装完了（タイプ → 名称 → プロパティ → 確認）
  - 既存データプリセット機能実装完了
  - ボタン表記仕様実装完了
    - プロパティ設定画面: 「登録」→「再登録」（編集時）
    - 確認画面: 常に「はい」（新規作成・編集共通）
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