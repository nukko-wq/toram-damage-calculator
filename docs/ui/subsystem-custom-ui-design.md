# サブシステム カスタム機能UI設計書

## 概要
フローティングメニューのサブシステムに、装備品カスタムとクリスタルカスタム（将来的に敵カスタム）機能を追加するUI設計。全画面表示でのカスタム設定システムを含む。

**実装状況:**
- ✅ クリスタルカスタム機能完全実装済み（新規登録・削除機能含む）
- ✅ 全画面モーダルシステム実装済み
- ✅ UI状態管理（Zustand）実装済み
- ⏳ 装備品カスタム機能（将来実装予定）
- ⏳ 敵カスタム機能（将来実装予定）

## 機能要件

### 1. サブシステムメニューの構成
```
フローティングメニュー
└── サブシステム
    ├── 装備品カスタム
    ├── クリスタルカスタム  
    └── 敵カスタム（将来実装）
```

### 2. 各カスタム機能の要件
- **装備品カスタム**: ユーザー作成装備の管理
- **クリスタルカスタム**: ユーザー作成クリスタルの管理
- **敵カスタム（将来）**: ユーザー作成敵データの管理

## UI/UXデザイン仕様

### 1. サブシステムメニューレイアウト

#### 1.1 メニューボタン構成
```typescript
// サブシステムボタンデータ構造
interface SubsystemMenuItem {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  status: 'available' | 'coming_soon'
  onClick: () => void
}

const subsystemMenuItems: SubsystemMenuItem[] = [
  {
    id: 'equipment_custom',
    title: '装備品カスタム',
    description: 'ユーザー装備の作成・編集・削除',
    icon: <EquipmentIcon />,
    status: 'available'
  },
  {
    id: 'crystal_custom', 
    title: 'クリスタルカスタム',
    description: 'ユーザークリスタルの作成・編集・削除',
    icon: <CrystalIcon />,
    status: 'available'
  },
  {
    id: 'enemy_custom',
    title: '敵カスタム',
    description: 'ユーザー敵データの作成・編集・削除',
    icon: <EnemyIcon />,
    status: 'coming_soon'
  }
]
```

#### 1.2 ボタンスタイル
- **カード形式**: 各機能を独立したカードとして表示
- **アイコン + テキスト**: 視覚的に分かりやすいレイアウト
- **ステータス表示**: 利用可能/実装予定の区別
- **ホバー効果**: インタラクション性の向上

### 2. 全画面表示システム

#### 2.1 全画面モーダル仕様
```typescript
interface FullScreenModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}
```

#### 2.2 レイアウト構造
```
┌─────────────────────────────────────────────────┐
│ ヘッダーバー                              × 閉じる │
├─────────────────────────────────────────────────┤
│                                                 │
│                メインコンテンツ                  │
│                                                 │
│                                                 │
│                                                 │
├─────────────────────────────────────────────────┤
│              フッターバー（操作ボタン）            │
└─────────────────────────────────────────────────┘
```

### 3. クリスタルカスタム画面設計

#### 3.1 メイン画面 - 機能選択
```typescript
interface CrystalCustomActions {
  newRegistration: () => void    // 新規登録
  editContent: () => void        // 内容変更
  deleteRegistration: () => void // 登録削除
}
```

#### 3.2 メイン画面レイアウト

**初期表示（操作メニューのみ）:**
```
┌─────────────────────────────────────────────────┐
│ 装備品のカスタム設定                      [終了] │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │                操作メニュー                  │ │
│ │  [新規登録]  [内容変更]  [登録削除]          │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│                                                 │
│              操作を選択してください               │
│                                                 │
│                                                 │
│                                                 │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
└─────────────────────────────────────────────────┘
```

**内容変更ボタン押下後（クリスタル一覧表示）:**
```
┌─────────────────────────────────────────────────┐
│ 装備品のカスタム設定                      [終了] │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │                操作メニュー                  │ │
│ │  [新規登録]  [内容変更]  [登録削除]          │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │               クリスタル一覧                 │ │
│ │                                             │ │
│ │  ┌─────┐                        [編集]      │ │
│ │  │武器  │  武器クリスタル1                   │ │
│ │  │クリ1│                                   │ │
│ │  └─────┘                                   │ │
│ │                                             │ │
│ │  ┌─────┐                        [編集]      │ │
│ │  │防具  │  防具クリスタル1                   │ │
│ │  │クリ1│                                   │ │
│ │  └─────┘                                   │ │
│ │                                             │ │
│ │  ┌─────┐                        [編集]      │ │
│ │  │追加  │  追加クリスタル1                   │ │
│ │  │クリ1│                                   │ │
│ │  └─────┘                                   │ │
│ │                                             │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
├─────────────────────────────────────────────────┤
│                  [キャンセル]                   │
└─────────────────────────────────────────────────┘
```

### 4. 新規登録画面設計

#### 4.1 画面遷移フロー
```
メイン画面 → [新規登録] → 作成タイプ選択 → 名称入力 → プロパティ設定 → 確認 → 完了
```

#### 4.2 作成タイプ選択画面
```
┌─────────────────────────────────────────────────┐
│ 新規クリスタル登録 - タイプ選択             [終了] │
├─────────────────────────────────────────────────┤
│                                                 │
│          何を作成しますか？                      │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │                                             │ │
│ │  ○ 武器クリスタル                           │ │
│ │                                             │ │
│ │  ○ 防具クリスタル                           │ │
│ │                                             │ │
│ │  ○ 追加クリスタル                           │ │
│ │                                             │ │
│ │  ○ 特殊クリスタル                           │ │
│ │                                             │ │
│ │  ○ ノーマルクリスタル                       │ │
│ │                                             │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│           ※ 装備品カスタムは検討中               │
│                                                 │
├─────────────────────────────────────────────────┤
│  [次に進む]                         [キャンセル] │
└─────────────────────────────────────────────────┘
```

#### 4.3 選択フォーム仕様
```typescript
interface CrystalTypeSelectionForm {
  selectedType: CrystalType | null
  includeEquipmentCustom: boolean // 将来の装備品カスタム統合用
}

interface CrystalTypeOption {
  type: CrystalType
  label: string
  isEnabled: boolean
}

const crystalTypeOptions: CrystalTypeOption[] = [
  {
    type: 'weapon',
    label: '武器クリスタル',
    isEnabled: true
  },
  {
    type: 'armor', 
    label: '防具クリスタル',
    isEnabled: true
  },
  {
    type: 'additional',
    label: '追加クリスタル',
    isEnabled: true
  },
  {
    type: 'special',
    label: '特殊クリスタル',
    isEnabled: true
  },
  {
    type: 'normal',
    label: 'ノーマルクリスタル',
    isEnabled: true
  }
]
```

#### 4.4 ボタン仕様

**終了ボタン:**
- 全画面モーダルを閉じてメイン画面に戻る
- 未保存のデータがある場合は確認ダイアログ表示

**キャンセルボタン:**
- 前の画面（メイン画面）に戻る
- 選択状態をリセット

**次に進むボタン:**
- 選択バリデーション（何かが選択されているかチェック）
- クリスタル名称入力画面に遷移
- 選択されたタイプ情報を次の画面に引き継ぎ

### 5. クリスタル名称入力画面設計

#### 5.1 画面レイアウト
```
┌─────────────────────────────────────────────────┐
│ 新規クリスタル登録 - 名称入力             [終了] │
├─────────────────────────────────────────────────┤
│                                                 │
│          選択したタイプ：武器クリスタル          │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │                                             │ │
│ │          クリスタル名称を入力                │ │
│ │                                             │ │
│ │  名称： [________________________]          │ │
│ │                                             │ │
│ │         ※ 1-50文字で入力してください         │ │
│ │                                             │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│                                                 │
│                                                 │
│                                                 │
├─────────────────────────────────────────────────┤
│  [次に進む]         [戻る]         [キャンセル]  │
└─────────────────────────────────────────────────┘
```

#### 5.2 入力フォーム仕様
```typescript
interface CrystalNameInputForm {
  name: string
  selectedType: CrystalType // 前画面から継承
  validationErrors: {
    name?: string
  }
}

interface CrystalNameValidation {
  required: boolean // 必須入力
  minLength: 1      // 最小文字数
  maxLength: 50     // 最大文字数
  duplicateCheck: boolean // 重複名チェック
}
```

#### 5.3 バリデーションルール（Zod使用）
```typescript
import { z } from 'zod'

const CrystalNameSchema = z.object({
  name: z
    .string()
    .min(1, '名称は必須です')
    .max(50, '名称は50文字以内で入力してください')
    .refine(
      async (name, ctx) => {
        const existingCrystals = getUserCrystalsByType(ctx.selectedType)
        return !existingCrystals.some(crystal => crystal.name === name)
      },
      '同じタイプ内に同名のクリスタルが既に存在します'
    ),
  selectedType: z.enum(['weapon', 'armor', 'additional', 'special', 'normal'])
})

type CrystalNameFormData = z.infer<typeof CrystalNameSchema>
```

**バリデーション項目:**
- **必須入力**: 空文字は不可（.min(1)）
- **文字数制限**: 1-50文字（.min(1).max(50)）
- **重複チェック**: 同じタイプ内で同名不可（async .refine()）

#### 5.4 ボタン仕様

**次に進むボタン（左下）:**
- 名称バリデーションを実行
- バリデーション成功時：プロパティ設定画面に遷移
- バリデーション失敗時：エラーメッセージ表示

**戻るボタン（真ん中下）:**
- 前の画面（タイプ選択画面）に戻る
- 入力した名称はクリア

**キャンセルボタン（右下）:**
- 新規登録処理を完全キャンセル
- メイン画面に戻る
- 入力データは破棄

### 6. プロパティ入力画面設計

#### 6.1 画面レイアウト
```
┌─────────────────────────────────────────────────┐
│ 新規クリスタル登録 - プロパティ設定       [終了] │
├─────────────────────────────────────────────────┤
│  選択タイプ：武器クリスタル  名称：カスタム武器1  │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │            現在の設定値                     │ │
│ │                                             │ │
│ │  ATK +10%  |  MATK +5   |  クリティカル +3% │ │
│ │  HP +500   |  STR +8%   |  攻撃速度 +12    │ │
│ │                                             │ │
│ │        ※ 有効なプロパティのみ表示           │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │                                             │ │
│ │            プロパティエディタ               │ │
│ │                                             │ │
│ │  [PropertyEditor コンポーネント流用]        │ │
│ │                                             │ │
│ │                                             │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
├─────────────────────────────────────────────────┤
│  [登録]          [戻る]          [キャンセル]    │
└─────────────────────────────────────────────────┘
```

#### 6.2 PropertyEditor流用の設計
```typescript
// 既存PropertyEditorの流用
interface CrystalPropertyEditorProps {
  crystalData: {
    id: string
    name: string
    type: CrystalType
    properties: Partial<EquipmentProperties>
  }
  onPropertyChange: (property: keyof EquipmentProperties, value: string) => void
  onUpdate?: () => void
}

// PropertyEditorのpropertyGroupsを流用
// 70+プロパティの定義と日本語ラベルをそのまま使用
const propertyGroups = [
  {
    title: '攻撃・威力',
    propertyPairs: [
      { properties: ['ATK_Rate', 'ATK'], type: 'pair' },
      { properties: ['MATK_Rate', 'MATK'], type: 'pair' },
      // ... 既存の定義をそのまま流用
    ]
  },
  // ... 他のグループも同様に流用
]
```

#### 6.3 現在の設定値エリア仕様
```typescript
interface CurrentPropertiesDisplay {
  // 有効なプロパティ（0以外の値）のみ表示
  activeProperties: Array<{
    label: string
    value: number
    type: 'percent' | 'fixed'
    displayValue: string // "ATK +10%", "HP +500" など
  }>
  
  // 表示レイアウト
  layout: 'grid' | 'flex-wrap' // レスポンシブ対応
  maxDisplayItems: 12 // 表示上限（多すぎる場合の対応）
}

// 表示例
const formatPropertyDisplay = (
  property: keyof EquipmentProperties,
  value: number
): string => {
  const label = getBasePropertyLabel(property) // PropertyEditorから流用
  const isPercentage = property.endsWith('_Rate')
  
  if (isPercentage) {
    return `${label} +${value}%`
  } else {
    return `${label} +${value}`
  }
}
```

#### 6.4 ボタン仕様

**登録ボタン（左下）:**
- プロパティ値のバリデーション実行
- バリデーション成功時：確認画面に遷移
- バリデーション失敗時：エラーメッセージ表示

**戻るボタン（真ん中下）:**
- 前の画面（名称入力画面）に戻る
- プロパティ設定値は保持（ユーザビリティ向上）

**キャンセルボタン（右下）:**
- 新規登録処理を完全キャンセル
- メイン画面に戻る
- 全ての入力データを破棄

#### 6.5 PropertyEditor統合の技術仕様

**コンポーネント再利用:**
```typescript
// src/components/floating-menu/content/subsystem/crystal/CrystalPropertyEditor.tsx
import PropertyEditor from '@/components/equipment/PropertyEditor'

interface CrystalPropertyEditorWrapperProps {
  crystalData: UserCrystal
  onPropertyChange: (property: keyof EquipmentProperties, value: string) => void
}

export default function CrystalPropertyEditorWrapper({
  crystalData,
  onPropertyChange
}: CrystalPropertyEditorWrapperProps) {
  // PropertyEditorに渡すための形式変換
  const equipmentLikeItem = {
    id: crystalData.id,
    name: crystalData.name,
    properties: crystalData.properties,
    // PropertyEditorが期待する他のプロパティも追加
  }

  return (
    <PropertyEditor
      item={equipmentLikeItem}
      slotKey={`crystal-${crystalData.type}`} // 仮のslotKey
      onPropertyChange={onPropertyChange}
      onMessage={() => {}} // 不要だが必須プロパティ
      onUpdate={() => {}} // 不要だが必須プロパティ  
    />
  )
}
```

**データフロー:**
```
ユーザー入力 → PropertyEditor → onPropertyChange 
            ↓
   crystalData.properties更新 → 現在の設定値エリア更新
            ↓
        登録ボタン → 確認画面 → saveUserCrystal() → LocalStorage
```

### 7. 新規登録 確認画面設計

#### 7.1 画面レイアウト
```
┌─────────────────────────────────────────────────┐
│ 新規クリスタル登録 - 確認                 [終了] │
├─────────────────────────────────────────────────┤
│  選択タイプ：武器クリスタル  名称：カスタム武器1  │
├─────────────────────────────────────────────────┤
│                                                 │
│          以下の内容で登録しますか？              │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │            設定されたプロパティ             │ │
│ │                                             │ │
│ │  ATK +10%  |  MATK +5   |  クリティカル +3% │ │
│ │  HP +500   |  STR +8%   |  攻撃速度 +12    │ │
│ │  物理貫通 +7%  |  短距離威力 +15%           │ │
│ │                                             │ │
│ │        ※ 有効なプロパティのみ表示           │ │
│ │                                             │ │
│ │  プロパティ数：7個                           │ │
│ │  作成日時：2024/01/15 14:30                 │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│                                                 │
│                                                 │
├─────────────────────────────────────────────────┤
│             [はい]        [いいえ]              │
└─────────────────────────────────────────────────┘
```

#### 7.2 表示データ仕様
```typescript
interface ConfirmationData {
  // 基本情報
  selectedType: CrystalType
  name: string
  
  // プロパティ情報
  activeProperties: Array<{
    property: keyof EquipmentProperties
    value: number
    displayValue: string // "ATK +10%", "HP +500" など
  }>
  
  // メタ情報
  propertyCount: number
  createdAt: string // ISO形式の日時
}

// 表示フォーマット関数（プロパティ入力画面と共通化）
const formatPropertyForConfirmation = (
  property: keyof EquipmentProperties,
  value: number
): string => {
  const label = getBasePropertyLabel(property)
  const isPercentage = property.endsWith('_Rate')
  
  if (isPercentage) {
    return `${label} +${value}%`
  } else {
    return `${label} +${value}`
  }
}
```

#### 7.3 プロパティ表示の仕様
- **レイアウト**: 3列のグリッド表示（レスポンシブ対応）
- **ソート順**: 設定値の大きい順、または重要度順
- **表示制限**: 最大20個まで表示（スクロール可能）
- **統計情報**: プロパティ数、作成日時を下部に表示

#### 7.4 ボタン仕様

**はいボタン（左下）:**
```typescript
const handleConfirm = async () => {
  try {
    // UserCrystal形式でデータ作成
    const newCrystal: UserCrystal = {
      id: generateUniqueId(),
      name: confirmationData.name,
      type: confirmationData.selectedType,
      properties: activeProperties,
      description: '', // オプション
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false
    }
    
    // LocalStorageに保存
    await saveUserCrystal(newCrystal)
    
    // 完了画面に遷移
    navigateToCompletionScreen()
  } catch (error) {
    // エラーハンドリング
    showErrorMessage('登録に失敗しました')
  }
}
```

**いいえボタン（右下）:**
- 前の画面（プロパティ設定画面）に戻る
- 入力済みの全データを保持
- ユーザーが修正を行える状態に戻る

#### 7.5 データの整合性チェック

**確認画面表示時のバリデーション:**
```typescript
interface ConfirmationValidation {
  // 必須項目チェック
  hasName: boolean           // 名称が入力されているか
  hasValidType: boolean      // 有効なタイプが選択されているか
  hasAnyProperty: boolean    // 少なくとも1つのプロパティが設定されているか
  
  // データ整合性チェック
  noDuplicateName: boolean   // 同タイプ内で重複名がないか
  validPropertyValues: boolean // プロパティ値が有効範囲内か
}

const validateBeforeConfirmation = (data: ConfirmationData): ConfirmationValidation => {
  return {
    hasName: data.name.trim().length > 0,
    hasValidType: ['weapon', 'armor', 'additional', 'special', 'normal'].includes(data.selectedType),
    hasAnyProperty: data.activeProperties.length > 0,
    noDuplicateName: !checkDuplicateName(data.name, data.selectedType),
    validPropertyValues: data.activeProperties.every(p => 
      p.value >= -999 && p.value <= 9999 && p.value !== 0
    )
  }
}
```

#### 3.3 操作ボタンの詳細仕様

**新規登録ボタン:**
- 装備品作成フォームを表示
- プロパティエディター統合
- バリデーション機能

**内容変更ボタン:**
- 既存装備品の編集機能
- 一覧から選択 → 編集モード
- リアルタイムプレビュー

**登録削除ボタン:**
- 複数選択での一括削除
- 削除確認ダイアログ
- 使用中装備品の削除制限

## 技術仕様

### 1. コンポーネント構造

#### 1.1 実装済みコンポーネント構造
```
src/components/floating-menu/content/subsystem/
├── SubsystemMenu.tsx                    // サブシステムメニュー（計画中）
├── FullScreenModal.tsx                  // 全画面モーダル（実装済み）
├── equipment/                           // 装備品カスタム（将来実装）
│   └── （未実装）
└── crystal/                             // クリスタルカスタム（実装済み）
    ├── CrystalCustomSystem.tsx          // クリスタルカスタムメイン（実装済み）
    ├── CrystalCustomMain.tsx            // メイン画面・操作ボタン群（実装済み）
    ├── CrystalTypeSelection.tsx         // タイプ選択画面（実装済み）
    ├── CrystalNameInput.tsx             // 名称入力画面（実装済み）
    ├── CrystalPropertyInput.tsx         // プロパティ入力画面（実装済み）
    ├── CrystalConfirmation.tsx          // 新規登録確認画面（実装済み）
    └── CrystalDeleteConfirmation.tsx    // 削除確認画面（実装済み）

src/types/
├── stores.ts                            // UI状態管理型定義（拡張済み）
└── calculator.ts                        // 既存の型定義

src/stores/
└── uiStore.ts                           // UIStore実装（拡張済み）

src/utils/
└── crystalDatabase.ts                   // データベース関数（削除機能追加済み）
```

#### 1.2 既存コンポーネントの拡張
```typescript
// src/components/floating-menu/MenuContent.tsx
function SubsystemContent() {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">サブシステム</h3>
      <SubsystemMenu />
    </div>
  )
}
```

### 2. 状態管理

#### 2.1 UI状態管理（Zustand）
```typescript
interface SubsystemUIState {
  // 全画面モーダル状態
  fullScreenModal: {
    isOpen: boolean
    type: 'equipment' | 'crystal' | 'enemy' | null
    title: string
  }
  
  // 各カスタム機能の状態
  equipmentCustom: {
    selectedItems: string[]
    editMode: 'list' | 'edit' | 'create'
    currentEditId: string | null
  }
  
  crystalCustom: {
    selectedItems: string[]
    editMode: 'list' | 'edit' | 'create'
    currentEditId: string | null
  }
}
```

#### 2.2 アクション
```typescript
interface SubsystemUIActions {
  // モーダル制御
  openFullScreenModal: (type: CustomType, title: string) => void
  closeFullScreenModal: () => void
  
  // 画面遷移制御
  navigateToScreen: (screen: NavigationScreen) => void
  goBack: () => void
  goNext: () => void
  
  // クリスタルタイプ選択
  selectCrystalType: (type: CrystalType) => void
  clearCrystalTypeSelection: () => void
  
  // 編集モード制御
  setCrystalEditMode: (mode: EditMode, id?: string) => void
  selectItems: (type: CustomType, ids: string[]) => void
  
  // フォームデータ管理
  updateFormData: (data: Partial<UserCrystal>) => void
  setValidationErrors: (errors: Record<string, string>) => void
  resetForm: () => void
}

type NavigationScreen = 'main' | 'type_selection' | 'detail_input' | 'confirmation'
```

### 5. 装備品カスタム統合の検討

#### 5.1 現状の装備品カスタム機能
現在、装備品カスタム機能は以下の場所で既に実装されている：
- `src/components/equipment/` - 装備品カスタム関連コンポーネント
- `src/utils/customEquipmentManager.ts` - カスタム装備品管理

#### 5.2 統合案の検討

**Option A: サブシステムで統一管理**
```typescript
// サブシステムで全てのカスタム機能を統合
const customOptions: CustomOption[] = [
  { type: 'weapon_crystal', label: '武器クリスタル' },
  { type: 'armor_crystal', label: '防具クリスタル' },
  { type: 'additional_crystal', label: '追加クリスタル' },
  { type: 'special_crystal', label: '特殊クリスタル' },
  { type: 'normal_crystal', label: 'ノーマルクリスタル' },
  { type: 'equipment', label: '装備品' },        // 新規追加
  { type: 'weapon', label: '武器' },             // 新規追加
]
```

**Option B: 現状維持 + リンク**
```typescript
// クリスタル専用のサブシステムとして実装
// 装備品カスタムは既存システムを維持し、
// サブシステムからリンクまたは案内のみ表示
```

#### 5.3 推奨案：**Option B（現状維持 + リンク）**

**理由：**
1. **既存システムの安定性** - 現在動作している装備品カスタム機能を変更しない
2. **段階的実装** - クリスタルカスタムを先行実装し、後で統合を検討
3. **ユーザー体験の一貫性** - 既存のユーザーが慣れ親しんだ操作を維持

**実装方法：**
```typescript
// 新規登録画面に注記として表示
const equipmentCustomMessage = {
  title: "装備品カスタムについて",
  message: "装備品（武器・防具）のカスタム作成は、メインフォームの「装備品」セクションで行えます。",
  linkText: "装備品カスタムを開く",
  action: () => closeSubsystemAndScrollToEquipment()
}
```

### 8. クリスタル削除機能設計

#### 8.1 削除フロー
```
メイン画面 → [登録削除] → 削除対象選択 → 削除確認ダイアログ → 削除完了
```

#### 8.2 削除確認ダイアログ画面設計

##### 8.2.1 画面レイアウト

**削除確認画面:**
```
┌─────────────────────────────────────────────────┐
│ クリスタル削除 - 削除確認                 [終了] │
├─────────────────────────────────────────────────┤
│  削除対象：武器クリスタル  名称：カスタム武器1    │
├─────────────────────────────────────────────────┤
│                                                 │
│    以下のクリスタルを削除してもよろしいですか？  │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │            クリスタル詳細情報               │ │
│ │                                             │ │
│ │  タイプ：武器クリスタル                     │ │
│ │  名称：カスタム武器1                        │ │
│ │  作成日：2024/01/15 14:30                   │ │
│ │                                             │ │
│ │  ━━━━━━━ 設定プロパティ ━━━━━━━        │ │
│ │                                             │ │
│ │  ATK +10%  |  MATK +5   |  クリティカル +3% │ │
│ │  HP +500   |  STR +8%   |  攻撃速度 +12    │ │
│ │  物理貫通 +7%  |  短距離威力 +15%           │ │
│ │                                             │ │
│ │  プロパティ数：7個                           │ │
│ │                                             │ │
│ │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━        │ │
│ │                                             │ │
│ │  ⚠️  この操作は元に戻すことができません      │ │
│ │                                             │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│                                                 │
├─────────────────────────────────────────────────┤
│           [削除する]         [キャンセル]        │
└─────────────────────────────────────────────────┘
```

**削除成功画面:**
```
┌─────────────────────────────────────────────────┐
│ クリスタル削除 - 削除完了                 [終了] │
├─────────────────────────────────────────────────┤
│                                                 │
│                                                 │
│                    ┌────┐                      │
│                    │ ✓  │                      │ 
│                    └────┘                      │
│                                                 │
│              削除が完了しました                 │
│                                                 │
│          "カスタム武器1"を削除しました          │
│                                                 │
│                                                 │
│                                                 │
│                                                 │
│                                                 │
│                                                 │
├─────────────────────────────────────────────────┤
│                    [OK]                         │
└─────────────────────────────────────────────────┘
```

##### 8.2.2 表示データ仕様
```typescript
interface DeleteConfirmationData {
  // クリスタル基本情報
  crystal: {
    id: string
    name: string
    type: CrystalType
    createdAt: string
    updatedAt?: string
  }
  
  // プロパティ情報
  activeProperties: Array<{
    property: keyof EquipmentProperties
    value: number
    displayValue: string // "ATK +10%", "HP +500" など
  }>
  
  // メタ情報
  propertyCount: number
  formattedCreatedAt: string // "2024/01/15 14:30" 形式
}

// 削除対象クリスタルの詳細取得
const getDeleteConfirmationData = (crystalId: string): DeleteConfirmationData => {
  const crystal = getUserCrystalById(crystalId)
  if (!crystal) throw new Error('Crystal not found')
  
  const activeProperties = Object.entries(crystal.properties)
    .filter(([_, value]) => value !== 0 && value !== undefined && value !== null)
    .map(([key, value]) => ({
      property: key as keyof EquipmentProperties,
      value: value as number,
      displayValue: formatPropertyDisplay(key as keyof EquipmentProperties, value as number)
    }))
  
  return {
    crystal: {
      id: crystal.id,
      name: crystal.name,
      type: crystal.type,
      createdAt: crystal.createdAt,
      updatedAt: crystal.updatedAt
    },
    activeProperties,
    propertyCount: activeProperties.length,
    formattedCreatedAt: new Date(crystal.createdAt).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}
```

##### 8.2.3 クリスタル情報表示仕様
```typescript
interface CrystalInfoDisplay {
  // 基本情報セクション
  basicInfo: {
    type: {
      label: string      // "武器クリスタル"
      icon?: string     // タイプアイコン
    }
    name: string        // "カスタム武器1"
    createdAt: string   // "2024/01/15 14:30"
    updatedAt?: string  // 更新日（存在する場合）
  }
  
  // プロパティセクション
  properties: {
    title: string                    // "設定プロパティ"
    items: PropertyDisplayItem[]     // プロパティ一覧
    count: number                    // "プロパティ数：7個"
    layout: 'grid-3-col'            // 3列グリッド表示
  }
  
  // 警告セクション
  warning: {
    message: string   // "この操作は元に戻すことができません"
    icon: '⚠️'       // 警告アイコン
    style: 'danger'  // スタイル種別
  }
}
```

##### 8.2.4 ボタン仕様

**削除するボタン（左下）:**
```typescript
const handleDelete = async () => {
  try {
    // 削除前の最終確認（オプション）
    const doubleConfirm = window.confirm(
      `"${crystal.name}"を完全に削除しますか？\nこの操作は元に戻すことができません。`
    )
    
    if (!doubleConfirm) return
    
    // クリスタル削除実行
    await deleteUserCrystal(crystal.id)
    
    // 成功メッセージ表示
    showSuccessMessage(`"${crystal.name}"を削除しました`)
    
    // 削除一覧画面に戻る（自動的に一覧更新）
    navigateToScreen('delete_list')
    
  } catch (error) {
    // エラーハンドリング
    showErrorMessage('削除に失敗しました')
    console.error('Crystal deletion failed:', error)
  }
}
```

**キャンセルボタン（右下）:**
- 前の画面（削除対象選択画面）に戻る
- 削除処理は実行されない
- 選択状態は保持される

##### 8.2.5 削除対象選択からの遷移仕様
```typescript
// 削除対象選択画面から削除確認画面への遷移
interface DeleteFlowState {
  selectedCrystalId: string      // 選択されたクリスタルID
  confirmationData: DeleteConfirmationData  // 確認画面表示用データ
  returnScreen: 'delete_list'    // 戻り先画面
}

// 削除対象選択画面での削除ボタンクリック処理
const handleDeleteButtonClick = (crystalId: string) => {
  try {
    // 削除確認データを準備
    const confirmationData = getDeleteConfirmationData(crystalId)
    
    // UI状態を更新
    setDeleteFlowState({
      selectedCrystalId: crystalId,
      confirmationData,
      returnScreen: 'delete_list'
    })
    
    // 削除確認画面に遷移
    navigateToScreen('delete_confirmation')
    
  } catch (error) {
    showErrorMessage('クリスタル情報の取得に失敗しました')
  }
}
```

#### 8.3 削除機能の技術仕様

##### 8.3.1 データ削除処理
```typescript
// src/utils/crystalDatabase.ts に削除関数を追加
export const deleteUserCrystal = async (crystalId: string): Promise<void> => {
  try {
    // 現在のユーザークリスタル一覧を取得
    const userCrystals = getUserCrystals()
    
    // 指定IDのクリスタルが存在するか確認
    const crystalExists = userCrystals.some(crystal => crystal.id === crystalId)
    if (!crystalExists) {
      throw new Error(`Crystal with ID ${crystalId} not found`)
    }
    
    // 削除対象を除外した新しい配列を作成
    const updatedCrystals = userCrystals.filter(crystal => crystal.id !== crystalId)
    
    // LocalStorageを更新
    localStorage.setItem('userCrystals', JSON.stringify(updatedCrystals))
    
    // 削除成功ログ
    console.log(`Crystal deleted successfully: ${crystalId}`)
    
  } catch (error) {
    console.error('Failed to delete crystal:', error)
    throw error
  }
}

// バルク削除（複数選択削除）用関数
export const deleteMultipleUserCrystals = async (crystalIds: string[]): Promise<void> => {
  try {
    const userCrystals = getUserCrystals()
    const updatedCrystals = userCrystals.filter(crystal => 
      !crystalIds.includes(crystal.id)
    )
    
    localStorage.setItem('userCrystals', JSON.stringify(updatedCrystals))
    console.log(`Multiple crystals deleted: ${crystalIds.join(', ')}`)
    
  } catch (error) {
    console.error('Failed to delete multiple crystals:', error)
    throw error
  }
}
```

##### 8.3.2 削除後の状態管理
```typescript
// UI状態の更新処理
interface DeleteResultState {
  success: boolean
  deletedCrystalName: string
  message: string
  timestamp: string
}

// 削除完了後のUIStore更新
const updateUIStateAfterDeletion = (deletedCrystal: UserCrystal) => {
  // 削除成功状態をセット
  setDeleteResult({
    success: true,
    deletedCrystalName: deletedCrystal.name,
    message: `"${deletedCrystal.name}"を削除しました`,
    timestamp: new Date().toISOString()
  })
  
  // 編集モードを一覧表示に戻す
  setCrystalEditMode('list')
  
  // 削除確認画面から削除一覧画面に遷移
  navigateToScreen('delete_list')
  
  // 一覧の再読み込みをトリガー
  triggerCrystalListReload()
}
```

##### 8.3.3 エラーハンドリング
```typescript
interface DeleteErrorHandling {
  // 削除処理中のエラー
  deletionFailed: {
    message: string
    action: 'retry' | 'cancel'
    originalError: Error
  }
  
  // データ整合性エラー
  crystalNotFound: {
    message: string
    action: 'back_to_list'
  }
  
  // LocalStorage関連エラー
  storageError: {
    message: string
    action: 'reload_page'
  }
}

const handleDeletionError = (error: Error, crystalId: string) => {
  if (error.message.includes('not found')) {
    showErrorMessage('削除対象のクリスタルが見つかりません')
    navigateToScreen('delete_list')
  } else if (error.message.includes('storage')) {
    showErrorMessage('データの保存に失敗しました。ページを再読み込みしてください')
  } else {
    showErrorMessage('削除に失敗しました。しばらく待ってから再試行してください')
  }
  
  console.error(`Crystal deletion failed for ID ${crystalId}:`, error)
}
```

#### 8.4 削除機能のUI状態管理（実装済み）

##### 8.4.1 UIStore拡張
```typescript
// src/types/stores.ts への追加（実装済み）
export type NavigationScreen = 'main' | 'type_selection' | 'name_input' | 'property_input' | 'confirmation' | 'completion' | 'delete_confirmation'

interface SubsystemState {
  // 既存の状態...
  
  // 削除機能用状態（実装済み）
  crystalCustom: {
    // 既存の状態...
    deleteFlow: {
      selectedCrystalId: string | null
      isDeleting: boolean
      deleteSuccess: {
        isSuccess: boolean
        deletedCrystalName: string
        message: string
      } | null
    }
  }
}

interface SubsystemActions {
  // 既存のアクション...
  
  // 削除機能用アクション（実装済み）
  selectForDeletion: (crystalId: string) => void
  confirmDeletion: (crystalId: string) => Promise<void>
  cancelDeletion: () => void
  clearDeleteSuccess: () => void
}
```

##### 8.4.2 削除確認画面コンポーネント（実装済み）
```typescript
// src/components/floating-menu/content/subsystem/crystal/CrystalDeleteConfirmation.tsx（実装済み）
export default function CrystalDeleteConfirmation() {
  const {
    subsystem: { crystalCustom },
    confirmDeletion,
    cancelDeletion,
    clearDeleteSuccess,
    navigateToScreen,
  } = useUIStore()

  const [isDeleting, setIsDeleting] = useState(false)
  const crystalId = crystalCustom.deleteFlow.selectedCrystalId
  const deleteSuccess = crystalCustom.deleteFlow.deleteSuccess

  // 削除対象のクリスタル情報を取得
  const crystal = useMemo(() => {
    if (!crystalId) return null
    return getUserCrystalById(crystalId)
  }, [crystalId])

  // 削除成功後の案内表示
  if (deleteSuccess?.isSuccess) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-green-600 text-2xl">✓</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            削除が完了しました
          </h3>
          <p className="text-green-600 font-medium">
            {deleteSuccess.message}
          </p>
          <button onClick={handleBackToMain}>OK</button>
        </div>
      </div>
    )
  }

  // 削除確認画面の表示（実装済み）
  return (
    <div className="p-6">
      {/* クリスタル詳細情報表示 */}
      {/* 削除確認ボタン */}
    </div>
  )
}
```

### 3. スタイリング仕様

#### 3.1 カラーパレット
- **プライマリ**: Blue-600 (カスタム機能のメインカラー)
- **セカンダリ**: Gray-500 (補助的なUI要素)
- **成功**: Green-600 (正常動作の表示)
- **警告**: Amber-500 (注意が必要な状態)
- **エラー**: Red-600 (エラー状態)

#### 3.2 レスポンシブ対応
- **モバイル（〜768px）**: 全画面最適化
- **タブレット（768px〜1024px）**: パディング調整
- **デスクトップ（1024px〜）**: 標準レイアウト

### 4. アニメーション・トランジション

#### 4.1 全画面モーダル
- **フェードイン/アウト**: 300ms ease-in-out
- **スライド効果**: 下から上への表示
- **バックドロップクリック**: モーダル閉じる

#### 4.2 ボタンインタラクション
- **ホバー効果**: transform scale(1.02) + shadow
- **クリック効果**: transform scale(0.98)
- **フォーカス**: outline ring-2

## アクセシビリティ

### 1. キーボードナビゲーション
- Tab/Shift+Tab でフォーカス移動
- Enterでボタン実行
- Escapeで全画面モーダル閉じる

### 2. ARIA属性
- `role="dialog"` for 全画面モーダル
- `aria-label` for アクションボタン
- `aria-describedby` for 説明テキスト

### 3. スクリーンリーダー対応
- セマンティックHTML使用
- 適切な見出しレベル構造
- フォーム要素のラベル関連付け

## 将来拡張性

### 1. 敵カスタム機能
- 同じ設計パターンでの実装
- SubsystemMenuへの追加のみ
- 既存インフラの再利用

### 2. その他カスタム機能
- バフスキルカスタム
- アタックスキルカスタム
- 設定プロファイルカスタム

### 3. エクスポート/インポート機能
- JSON形式でのデータ交換
- 他ユーザーとのシェア機能
- バックアップ/復元機能