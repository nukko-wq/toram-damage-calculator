# サブシステム カスタム機能UI設計書

## 概要
フローティングメニューのサブシステムに、装備品カスタムとクリスタルカスタム（将来的に敵カスタム）機能を追加するUI設計。全画面表示でのカスタム設定システムを含む。

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

### 7. 確認画面設計

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

#### 1.1 新規作成コンポーネント
```
src/components/floating-menu/content/subsystem/
├── SubsystemMenu.tsx                    // サブシステムメニュー
├── FullScreenModal.tsx                  // 全画面モーダル
├── equipment/
│   ├── EquipmentCustomSystem.tsx        // 装備品カスタムメイン
│   ├── EquipmentCustomActions.tsx       // 操作ボタン群
│   ├── EquipmentCustomList.tsx          // 装備品一覧
│   └── EquipmentCustomEditor.tsx        // 編集フォーム
├── crystal/
│   ├── CrystalCustomSystem.tsx          // クリスタルカスタムメイン
│   ├── CrystalCustomActions.tsx         // 操作ボタン群
│   ├── CrystalCustomList.tsx            // クリスタル一覧
│   └── CrystalCustomEditor.tsx          // 編集フォーム
└── hooks/
    ├── useFullScreenModal.ts            // 全画面モーダル制御
    ├── useEquipmentCustom.ts            // 装備品カスタム制御
    └── useCrystalCustom.ts              // クリスタルカスタム制御
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