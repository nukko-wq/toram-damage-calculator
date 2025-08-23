# クリスタルカスタム機能設計書

## 概要
フロートメニューのサブシステムに、ユーザーがカスタムクリスタル（武器クリスタル、防具クリスタル、追加クリスタル、特殊クリスタル、ノーマルクリスタル）を作成・編集・管理できる機能を追加する。

## 機能要件

### 1. クリスタルカスタム機能
- **対象クリスタル種類**: 5種類のクリスタル
  - 武器クリスタル (weapon)
  - 防具クリスタル (armor) 
  - 追加クリスタル (additional)
  - 特殊クリスタル (special)
  - ノーマルクリスタル (normal)

### 2. 機能一覧
- カスタムクリスタルの作成
- 既存カスタムクリスタルの編集
- カスタムクリスタルの削除
- カスタムクリスタル一覧表示
- プロパティエディター（装備品と同様の70+プロパティシステム）
- お気に入り機能
- 検索・フィルター機能

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

#### 3.1 新規作成コンポーネント
```
src/components/floating-menu/content/subsystem/
├── CrystalCustomSystem.tsx        // メインコンテナ
├── CrystalCustomList.tsx          // カスタムクリスタル一覧
├── CrystalCustomEditor.tsx        // 作成・編集フォーム
├── CrystalCustomModal.tsx         // モーダル統合
├── CrystalPropertyEditor.tsx      // プロパティエディター
└── hooks/
    ├── useCrystalCustomManager.ts // カスタムクリスタル管理
    └── useCrystalValidation.ts    // バリデーション
```

#### 3.2 既存コンポーネントとの統合
- `src/components/floating-menu/MenuContent.tsx`にサブシステム項目追加
- `src/components/equipment/PropertyEditor.tsx`を参考にしてプロパティエディター実装
- `src/utils/crystalDatabase.ts`の拡張

### 4. データ管理

#### 4.1 ストレージ統合
- **LocalStorage**: カスタムクリスタルデータの永続化
- **Zustand Store**: UI状態とリアルタイム更新管理
- **Database Layer**: `src/utils/crystalDatabase.ts`の拡張

#### 4.2 データフロー
```
UI操作 → Hook → Zustand Store → LocalStorage
                ↓
         crystalDatabase.ts → 統合データ提供
```

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

### 6. 実装フェーズ

#### Phase 1: 基盤実装
- コンポーネント構造作成
- 基本CRUD機能実装
- LocalStorage統合

#### Phase 2: UI/UX強化
- プロパティエディター実装
- 検索・フィルター機能
- バリデーション強化

#### Phase 3: 統合・最適化
- 既存システムとの統合テスト
- パフォーマンス最適化
- エラーハンドリング強化

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

## 注意事項

### 1. データ整合性
- カスタムクリスタルと既存システムの整合性確保
- 削除時の依存関係チェック

### 2. ストレージ制限
- LocalStorageサイズ制限への配慮
- データ圧縮の検討

### 3. 移行サポート
- 既存データとの互換性維持
- バージョンアップ時のデータ移行