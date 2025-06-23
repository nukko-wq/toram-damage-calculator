# 装備カスタム機能UI仕様

## 全装備スロットカスタム操作

- **対象スロット**: メイン装備、体装備、追加装備、特殊装備、サブ武器、オシャレ1、オシャレ2、オシャレ3（全8スロット）
- 装備選択UI内にカスタム機能を統合配置
- プリセット選択ボタンの右に「新規作成」ボタン配置
- 新規作成ボタンの右に「名前変更」ボタン配置（カスタム装備選択時のみ表示）
- 名前変更ボタンの右に「削除」ボタン配置（カスタム装備選択時のみ表示）
- プリセット装備選択時は名前変更・削除ボタンを非表示（誤操作防止）

## モーダル機能

### 新規作成機能
```typescript
interface CreateEquipmentModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (equipmentName: string) => void
  equipmentType: string  // 装備カテゴリに対応する表示名
}
```

### 名前変更機能
```typescript
interface RenameEquipmentModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (newName: string) => void
  currentName: string
  equipmentId: string
}
```

### 削除確認機能
```typescript
interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  equipmentName: string
  message: string
}
```

## カスタム装備ボタン表示条件

```typescript
// 名前変更・削除ボタンの表示判定（全装備スロット共通）
const showCustomEquipmentButtons = (slotKey: keyof EquipmentSlots) => (
  effectiveEquipment[slotKey].id && 
  'isCustom' in effectiveEquipment[slotKey] && 
  effectiveEquipment[slotKey].isCustom
)

// 各スロットでの表示制御
const showRenameButton = (slotKey: keyof EquipmentSlots) => 
  showCustomEquipmentButtons(slotKey)

const showDeleteButton = (slotKey: keyof EquipmentSlots) => 
  showCustomEquipmentButtons(slotKey)

// 新規作成ボタンは全スロットで常時表示
const showCreateButton = true  // 全装備スロットで表示
```

## UI動作仕様（全装備スロット対応）

- **新規作成クリック** → 装備名入力モーダル表示 → 装備カテゴリに応じた初期名設定 → 入力確定でカスタム装備作成 → 自動的に該当装備スロットにセット
- **名前変更クリック** → 名前変更モーダル表示 → 現在名を初期値として設定 → 新しい名前入力 → 確定で名前更新（カスタム装備のみ）
- **削除クリック** → 削除確認モーダル表示 → 装備名と装備カテゴリを表示 → 確定でカスタム装備を削除（カスタム装備のみ）
- **プリセット装備選択時** → 名前変更・削除ボタン非表示（システム装備保護）
- **プリセット選択モーダル** → カスタム装備も選択可能（装備カテゴリ別にフィルタリング、統合表示）
- **カスタム装備識別** → 視覚的に区別表示（アイコン、ラベル等）
- **武器系装備特別対応** → メイン装備・サブ武器では武器ステータス（ATK、安定率、精錬値）も初期化

## カスタム装備保存管理システム

- 編集セッション管理：カスタム装備のプロパティ編集時は編集セッションを作成し、永続データとは分離して管理
- セーブ時永続化：「現在のデータを保存」実行時のみ編集内容をLocalStorageに永続保存
- 編集破棄機能：保存せずにセーブデータ切り替え・ブラウザリロード時は編集セッションを削除し、永続データを復元
- 保存状態表示：編集中カスタム装備の視覚的インジケーター（オレンジ色警告表示）

## カスタム装備プロパティ連動システム

- 編集セッション連動：カスタム装備セット中のプロパティ入力変更を編集セッションに記録
- フォーム値優先：プロパティフォームは編集セッション値を優先表示、永続データは変更しない
- 装備選択UI連動：装備選択モーダルも編集セッション値を反映表示
- データ整合性：永続データと編集セッションデータを明確に分離管理

## カスタム装備統合仕様

```typescript
interface EquipmentSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (equipmentId: string | null) => void
  selectedEquipmentId: string | null
  category: EquipmentCategory
  title: string
  includeCustomEquipments?: boolean // カスタム装備を含むかどうか
}

// 統合装備データ構造
interface CombinedEquipmentData {
  presetEquipments: PresetEquipment[]
  customEquipments: UserEquipment[]
  totalCount: number
}

// カスタム装備編集セッション管理
interface CustomEquipmentEditSession {
  equipmentId: string                               // 編集対象装備ID
  originalData: UserEquipment                       // 永続データ（元の値）
  editedData: UserEquipment                         // 編集中データ
  isModified: boolean                               // 編集有無フラグ
  startedAt: string                                 // 編集開始日時
  lastModified: string                              // 最終変更日時
}

// カスタム装備状態管理
interface CustomEquipmentState {
  isTemporary: boolean        // 新規作成の仮データかどうか
  hasEditSession: boolean     // 編集セッション中かどうか
  needsSaving: boolean        // 保存が必要かどうか
  lastModified: string        // 最終更新日時
}

// プロパティ表示制御
interface PropertyDisplayConfig {
  useEditedValues: boolean    // 編集値を優先表示するか
  showOriginalValues: boolean // 元の値も表示するか
  highlightChanges: boolean   // 変更箇所をハイライトするか
}
```

## カスタム装備データフロー（改善版）

### 新規作成フロー
```
新規作成 → 仮データ作成（メモリ） → プロパティ編集 → 仮データ更新
                                          ↓
セーブ実行 → LocalStorage永続化 ← 現在のデータを保存
           → 仮データ削除
```

### 既存装備編集フロー
```
カスタム装備選択 → 永続データ読み込み → プロパティ編集開始
                                          ↓
プロパティ変更 → 編集セッション作成 → 編集データ更新（永続データは不変）
                                          ↓
セーブ実行 → 編集データを永続データに反映 → 編集セッション削除
```

### 編集破棄フロー
```
リロード/セーブデータ切り替え → 編集セッション削除 → 永続データ復元
```

## プロパティ連動フロー（改善版）

```
プロパティフォーム表示 → 編集セッション値を優先表示
                          ↓
プロパティフォーム変更 → カスタム装備判定 → 編集セッション更新
                                ↓
装備選択モーダル → 編集セッション値を反映表示
```

## 具体例：ATK変更フロー

```
1. カスタム武器ATK=5で保存済み（永続データ：ATK=5）
2. 武器を選択 → フォーム表示：ATK=5
3. ATK=10に変更 → 編集セッション作成：{セーブID:装備ID, 原本:ATK=5, 編集中:ATK=10}
4. 装備選択UI → ATK=10表示（編集中値を反映）
5a. 保存実行 → 永続データATK=10に更新 → 編集セッション削除
5b. リロード/切り替え → 編集セッション削除 → フォーム復元：ATK=5
```

## セーブデータ固有の編集セッション管理

```
編集セッションキー形式：${saveDataId}:${equipmentId}
例：
- セーブ1の武器A → "save1:weaponA"
- セーブ2の武器A → "save2:weaponA"
- メインデータの武器A → "default:weaponA"

セーブデータ切り替え時：
1. 新しいセーブデータID設定
2. 前のセーブデータの編集セッション削除
3. 新しいセーブデータのデータ読み込み
```