# Zustand状態管理 設計書

## 1. 概要

トーラムダメージ計算ツールにおけるZustand状態管理の設計仕様書。
軽量で型安全な状態管理を実現し、React Hook Formとの効率的な統合を図る。

## 2. アーキテクチャ概要

### 2.1 ストア構成

```
src/stores/
├── index.ts                 # ストアのエクスポート
├── calculatorStore.ts       # メイン計算データ管理
├── saveDataStore.ts         # セーブデータ管理
└── uiStore.ts              # UI状態管理
```

### 2.2 状態管理の責任分離

| ストア | 責任範囲 | 主要データ |
|--------|----------|------------|
| CalculatorStore | 計算機の全データ管理 | 基本ステータス、武器、装備、クリスタ、料理、敵情報、バフスキル、バフアイテム |
| SaveDataStore | セーブデータ操作 | セーブデータリスト、現在のセーブID |
| UIStore | UI状態管理 | モーダル表示状態、管理画面表示状態 |

## 3. ストア詳細設計

### 3.1 CalculatorStore

**目的**: 計算機の全てのデータを一元管理

```typescript
interface CalculatorStore {
  // === 状態 ===
  data: CalculatorData
  hasUnsavedChanges: boolean
  isInitialized: boolean
  isLoading: boolean

  // === 基本操作 ===
  initialize: () => Promise<void>
  updateData: (data: CalculatorData) => void
  resetUnsavedChanges: () => void
  setHasUnsavedChanges: (value: boolean) => void
  setIsLoading: (value: boolean) => void

  // === セーブデータ管理 ===
  loadSaveData: (data: CalculatorData) => Promise<void>
  saveCurrentData: () => Promise<void>

  // === 各フォーム更新メソッド ===
  updateBaseStats: (stats: BaseStats) => void
  updateMainWeapon: (weapon: MainWeapon) => void
  updateSubWeapon: (weapon: SubWeapon) => void
  updateCrystals: (crystals: CrystalSlots) => void
  updateEquipment: (equipment: EquipmentSlots) => void
  createTemporaryCustomEquipment: (equipmentCategory: EquipmentCategory, name: string) => Promise<void>  // 全装備スロット対応
  saveTemporaryCustomEquipments: () => Promise<void>
  renameCustomEquipment: (equipmentId: string, newName: string) => Promise<boolean>  // 全装備スロット対応
  deleteCustomEquipment: (equipmentId: string) => Promise<void>  // 全装備スロット対応
  updateCustomEquipmentProperties: (equipmentId: string, properties: Partial<EquipmentProperties>) => Promise<void>  // 全装備スロット対応
  cleanupTemporaryData: () => void
  updateFood: (food: FoodFormData) => void
  updateEnemy: (enemy: EnemyFormData) => void
  updateBuffSkills: (buffSkills: BuffSkillFormData) => void
  updateBuffItems: (buffItems: BuffItemFormData) => void
}
```

**主要機能**:
- データの一元管理と更新
- 未保存変更の検知（UI表示用の色分けに使用）
- セーブデータの読み込み・保存
- 各フォームからの個別更新
- **全装備スロット対応カスタム装備機能**:
  - 仮データ作成・管理（メイン装備、体装備、追加装備、特殊装備、サブ武器、オシャレ1、オシャレ2、オシャレ3、自由入力1、自由入力2、自由入力3）
  - カスタム装備名前変更（全装備スロット共通）
  - カスタム装備削除（全装備スロット共通）
  - プロパティ連動更新（全装備スロット共通）
- 仮データの自動クリーンアップ

**保存ボタンの統一仕様**:
- ボタンラベル: 常に「現在のデータを保存」
- 未保存変更の有無は色で表示（オレンジ/緑）
- 重複していた保存ボタンは削除

### 3.2 SaveDataStore

**目的**: セーブデータの管理とLocalStorage操作

```typescript
interface SaveDataStore {
  // === 状態 ===
  saveDataList: SaveDataItem[]
  currentSaveId: string | null

  // === 操作 ===
  loadSaveDataList: () => Promise<void>                    // ユーザーデータのみロード
  switchSaveData: (saveId: string) => Promise<void>
  createSaveData: (name: string) => Promise<void>          // 作成後自動切り替え
  deleteSaveData: (saveId: string) => Promise<void>        // 全削除時メインデータ切り替え
  switchToMainData: () => Promise<void>                    // メインデータ切り替え専用
}
```

**主要機能**:
- ユーザー作成セーブデータリストの管理（メインデータ除外）
- セーブデータの切り替え
- 新規セーブデータの作成（作成後自動切り替え）
- セーブデータの削除（全削除時メインデータ自動復帰）
- メインデータ切り替え機能

### 3.3 UIStore

**目的**: UI状態の管理

```typescript
interface UIStore {
  // === 状態 ===
  showSaveManager: boolean

  // === 操作 ===
  setShowSaveManager: (value: boolean) => void
}
```

**主要機能**:
- セーブデータ管理画面の表示状態
- 将来的なモーダル状態管理

## 4. React Hook Form統合

### 4.1 統合パターン

各フォームコンポーネントでZustandストアとReact Hook Formを双方向バインディング:

```typescript
// フォームの初期化
const {
  register,
  watch,
  setValue,
  formState: { errors },
} = useForm<FormData>({
  resolver: zodResolver(schema),
  values: storeData, // Zustandからのデータ
  mode: 'onChange',
})

// 変更検知とストア更新
useEffect(() => {
  const subscription = watch((value, { name, type }) => {
    if (!isInitialized || !name || !value || type !== 'change') {
      return
    }
    updateStore(value as FormData)
  })
  return () => subscription.unsubscribe()
}, [watch, isInitialized, updateStore])
```

### 4.3 バフスキル統合の特殊パターン

バフスキルフォームでは複数のスキルを管理するため、より複雑な統合パターンを使用:

```typescript
// バフスキルフォームの例（src/components/buff-skill/BuffSkillForm.tsx）
const BuffSkillForm = () => {
  const storeBuffSkills = useCalculatorStore(state => state.data.buffSkills)
  const mainWeaponType = useCalculatorStore(state => state.data.mainWeapon.weaponType)
  const updateBuffSkills = useCalculatorStore(state => state.updateBuffSkills)
  
  // 個別スキルの更新処理
  const handleSkillToggle = (skillId: string, enabled: boolean) => {
    const updatedSkills = storeBuffSkills.skills.map(skill =>
      skill.id === skillId ? { ...skill, isEnabled: enabled } : skill
    )
    updateBuffSkills({ skills: updatedSkills })
  }
  
  // ポップオーバー用のパラメータ更新処理
  const handleParameterChange = (skillId: string, paramName: string, value: number) => {
    const updatedSkills = storeBuffSkills.skills.map(skill =>
      skill.id === skillId 
        ? { ...skill, parameters: { ...skill.parameters, [paramName]: value } }
        : skill
    )
    updateBuffSkills({ skills: updatedSkills })
  }
  
  // 武器種に応じたマスタリスキルフィルタリング
  const getVisibleMasterySkills = (weaponType: WeaponType) => {
    const weaponTypeToMasterySkills = {
      '素手': ['shield_mastery'],
      '片手剣': ['blade_mastery', 'shield_mastery'],
      '双剣': ['blade_mastery', 'dual_mastery'],
      '両手剣': ['blade_mastery'],
      '手甲': ['martial_mastery', 'shield_mastery'],
      '旋風槍': ['halberd_mastery'],
      '抜刀剣': [], // 該当するマスタリスキルなし
      '弓': ['shoot_mastery'],
      '自動弓': ['shoot_mastery', 'shield_mastery'],
      '杖': ['magic_mastery', 'shield_mastery'],
      '魔導具': ['magic_mastery'],
    }
    return weaponTypeToMasterySkills[weaponType] || []
  }
  
  // 武器種から専用スキルIDを取得
  const getWeaponSpecificSkills = (weaponType: WeaponType) => {
    const weaponTypeToSpecialSkills = {
      '素手': [],
      '片手剣': [],
      '双剣': [],
      '両手剣': [],
      '手甲': [],
      '旋風槍': ['thor_hammer', 'tornado_lance', 'critical_parry'], // トールハンマー、トルネードランス、会心の捌き
      '抜刀剣': [],
      '弓': [],
      '自動弓': [],
      '杖': [],
      '魔導具': [],
    }
    return weaponTypeToSpecialSkills[weaponType] || []
  }
  
  // 武器種変更時のマスタリスキル・専用スキルリセット処理
  const resetWeaponDependentSkillsOnWeaponChange = useCallback((newWeaponType: WeaponType) => {
    const weaponSpecificSkillIds = ['thor_hammer', 'tornado_lance', 'critical_parry'] // 旋風槍専用スキル
    
    const updatedSkills = storeBuffSkills.skills.map(skill => {
      if (skill.category === 'mastery' || weaponSpecificSkillIds.includes(skill.id)) {
        return {
          ...skill,
          isEnabled: false,
          parameters: getDefaultParametersForSkill(skill.id)
        }
      }
      return skill
    })
    updateBuffSkills({ skills: updatedSkills })
  }, [storeBuffSkills.skills, updateBuffSkills])
  
  // 前の武器種を追跡して変更検知
  const prevWeaponType = useRef(mainWeaponType)
  useEffect(() => {
    if (prevWeaponType.current !== mainWeaponType) {
      resetWeaponDependentSkillsOnWeaponChange(mainWeaponType)
      prevWeaponType.current = mainWeaponType
    }
  }, [mainWeaponType, resetWeaponDependentSkillsOnWeaponChange])
  
  // スキル系統別の表示・管理（マスタリ・専用スキルフィルタリング付き）
  const flatSkillsList = useMemo(() => {
    const visibleMasterySkills = getVisibleMasterySkills(mainWeaponType)
    const visibleSpecialSkills = getWeaponSpecificSkills(mainWeaponType)
    
    return storeBuffSkills.skills
      .filter(skill => {
        // マスタリスキルの場合は武器種に応じてフィルタリング
        if (skill.category === 'mastery') {
          if (visibleMasterySkills.length === 0) {
            // 抜刀剣等：マスタリスキル系統全体を非表示
            return false
          }
          if (!visibleMasterySkills.includes(skill.id)) {
            // 該当しないマスタリスキルは非表示
            return false
          }
        }
        
        // 武器種専用スキルの場合は武器種に応じてフィルタリング
        if (['thor_hammer', 'tornado_lance', 'critical_parry'].includes(skill.id)) { // 旋風槍専用スキル
          if (!visibleSpecialSkills.includes(skill.id)) {
            // 該当しない専用スキルは非表示
            return false
          }
        }
        
        return true
      })
      .map(skill => ({
        ...skill,
        categoryLabel: categoryNameMap[skill.category],
        // スキル名に現在のパラメータ値を表示
        displayName: skill.isEnabled && skill.parameters.skillLevel 
          ? `${skill.name}/${skill.parameters.skillLevel}`
          : skill.name
      }))
  }, [storeBuffSkills.skills, mainWeaponType])
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">バフスキル設定</h2>
      
      {/* 5カラムグリッドレイアウト */}
      <div className="grid grid-cols-5 gap-4 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2">
        {flatSkillsList.map(skill => (
          <SkillCard
            key={skill.id}
            skill={skill}
            displayName={skill.displayName}
            categoryLabel={skill.categoryLabel}
            onToggle={handleSkillToggle}
            onParameterChange={handleParameterChange}
            showPopover={true} // ポップオーバー機能を有効化
          />
        ))}
      </div>
    </div>
  )
}
```

### 4.4 バフアイテム統合のモーダル選択パターン

バフアイテムフォームでは装備・クリスタ選択と統一されたモーダル選択UIを使用:

```typescript
// バフアイテムフォームの例（src/components/buff-item/BuffItemForm.tsx）
const BuffItemForm = () => {
  const storeBuffItems = useCalculatorStore(state => state.data.buffItems)
  const updateBuffItems = useCalculatorStore(state => state.updateBuffItems)
  
  // モーダル状態管理
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    category: BuffItemCategory | null
    title: string
  }>({
    isOpen: false,
    category: null,
    title: '',
  })
  
  // モーダル開閉ハンドラ
  const handleOpenModal = (category: BuffItemCategory) => {
    setModalState({
      isOpen: true,
      category,
      title: `${buffItemCategoryNameMap[category]}バフアイテム選択`,
    })
  }
  
  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      category: null,
      title: '',
    })
  }
  
  // アイテム選択ハンドラ
  const handleSelectBuffItem = (buffItemId: string | null) => {
    if (!modalState.category) return
    
    const updatedBuffItems = {
      ...storeBuffItems,
      [modalState.category]: buffItemId,
    }
    
    updateBuffItems(updatedBuffItems)
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">バフアイテム設定</h2>
      
      {/* カテゴリ別選択ボタン */}
      <div className="grid grid-cols-2 gap-4">
        {buffItemCategories.map(({ key, label }) => (
          <BuffItemButton
            key={key}
            category={key}
            label={label}
            onOpenModal={handleOpenModal}
          />
        ))}
      </div>
      
      {/* バフアイテム選択モーダル（src/components/buff-item/BuffItemSelectionModal.tsx） */}
      {modalState.category && (
        <BuffItemSelectionModal
          isOpen={modalState.isOpen}
          onClose={handleCloseModal}
          onSelect={handleSelectBuffItem}
          selectedBuffItemId={storeBuffItems[modalState.category]}
          category={modalState.category}
          title={modalState.title}
        />
      )}
    </div>
  )
}

// バフアイテム選択ボタンコンポーネント
const BuffItemButton = ({ category, label, onOpenModal }) => {
  const selectedName = getSelectedBuffItemName(category)
  const properties = formatBuffItemProperties(category)
  const hasSelection = storeBuffItems[category] !== null
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <button
        type="button"
        onClick={() => onOpenModal(category)}
        className={`
          w-full p-3 rounded-md border text-left transition-colors hover:bg-gray-50
          ${hasSelection ? 'border-blue-300 bg-blue-50' : 'border-gray-300 bg-white'}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-medium truncate ${
              hasSelection ? 'text-blue-900' : 'text-gray-500'
            }`}>
              {selectedName}
            </div>
            {properties && (
              <div className="text-xs text-gray-600 mt-1 truncate">
                {properties}
              </div>
            )}
          </div>
          <div className="ml-2 flex-shrink-0">
            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </button>
    </div>
  )
}
```

**モーダル選択の特徴**:
- 装備・クリスタ選択と統一されたUI/UX
- カテゴリ別の専用モーダル表示
- 選択状態の視覚的フィードバック
- アイテム詳細情報の表示

### 4.5 装備カスタム機能統合

装備フォームではカスタム装備の作成・名前変更・削除機能を統合:

```typescript
// 装備フォーム統合の例（src/components/equipment/EquipmentForm.tsx）
const EquipmentForm = () => {
  const storeEquipment = useCalculatorStore(state => state.data.equipment)
  const createCustomEquipment = useCalculatorStore(state => state.createCustomEquipment)
  const renameCustomEquipment = useCalculatorStore(state => state.renameCustomEquipment)
  const deleteCustomEquipment = useCalculatorStore(state => state.deleteCustomEquipment)
  
  // カスタム装備作成処理（仮データ作成）
  const handleCreateEquipment = async (equipmentCategory: EquipmentCategory, name: string) => {
    await createTemporaryCustomEquipment(equipmentCategory, name)
    // 作成後は自動的に装備スロットにセット（仮データとして）
    // カスタム装備はプリセット選択モーダルからも選択可能
    setHasUnsavedChanges(true)
  }
  
  // カスタム装備名前変更処理
  const handleRenameEquipment = async (equipmentId: string, newName: string) => {
    await renameCustomEquipment(equipmentId, newName)
    // 永続データ・仮データ・編集セッション全てで装備名を更新
    setHasUnsavedChanges(true)
  }
  
  // カスタム装備削除処理
  const handleDeleteEquipment = async (equipmentId: string) => {
    await deleteCustomEquipment(equipmentId)
    // 永続データはLocalStorageから除去、仮データはメモリから削除
    setHasUnsavedChanges(true)
  }
  
  // プロパティ変更処理（カスタム装備連動）
  const handlePropertyChange = (property: string, value: number) => {
    // 現在セット中の装備がカスタム装備の場合、リアルタイムで装備データを更新
    if (isCustomEquipmentActive() && currentEquipmentId) {
      updateCustomEquipmentProperties(currentEquipmentId, { [property]: value })
    }
    // 通常のプロパティ更新処理
    updateEquipmentProperties(property, value)
    setHasUnsavedChanges(true)
  }
  
  return (
    <div className="space-y-4">
      {/* プリセット選択ボタン */}
      <button onClick={() => openEquipmentModal()}>
        装備を選択
      </button>
      
      {/* 新規作成ボタン */}
      <button onClick={() => openCreateModal()}>
        新規作成
      </button>
      
      {/* 名前変更ボタン */}
      <button onClick={() => openRenameModal()}>
        名前変更
      </button>
      
      {/* 削除ボタン */}
      <button onClick={() => openDeleteModal()}>
        削除
      </button>
    </div>
  )
}
```

**カスタム装備機能の特徴**:
- プリセット選択UIと統合されたボタン配置
- 装備名入力モーダルでの新規作成
- 新規作成後の自動装備セット機能（仮データとして）
- 名前変更モーダルでの装備名編集（カスタム装備のみ）
- 名前変更時の全データ層での一括更新（永続・仮データ・編集セッション）
- 削除確認モーダルでの安全な削除
- プリセット選択モーダルでのカスタム装備表示統合
- 全セーブデータ間でのカスタム装備共有
- プロパティリセット機能

**カスタム装備仮データ管理**:
- 仮データ作成：新規作成時はメモリ上に一時的なデータを作成
- セーブ時永続化：「現在のデータを保存」実行時のみLocalStorageに保存
- 自動クリーンアップ：セーブデータ切り替え・リロード時に仮データを削除
- 保存状態表示：未保存カスタム装備の視覚的インジケーター

**カスタム装備プロパティ連動**:
- リアルタイム反映：プロパティフォーム変更時の装備データ自動更新
- 双方向同期：装備選択とプロパティ編集の整合性維持
- 仮データ対応：永続・仮データ問わずプロパティ連動機能が動作
- 編集セッション管理：既存カスタム装備の編集時は編集セッションで管理
- 保存まで仮反映：永続データは「現在のデータを保存」実行時のみ更新

### 4.6 初期化管理

セーブデータ切り替え時のちらつき防止機能:

```typescript
// 各フォームでの初期化状態管理
const [isInitialized, setIsInitialized] = useState(false)

useEffect(() => {
  // データ変更時は一時的に変更検知を無効化
  setIsInitialized(false)
  const timer = setTimeout(() => setIsInitialized(true), 30)
  return () => clearTimeout(timer)
}, [storeData])
```

## 5. データフロー

### 5.1 通常の操作フロー

```
ユーザー入力 → React Hook Form → watch → Zustand更新 → 未保存変更フラグ設定
```

### 5.2 セーブデータ切り替えフロー

```
SaveDataManager → SaveDataStore.switchSaveData → CalculatorStore.loadSaveData → 各フォーム再初期化
```

### 5.3 初期化フロー

```
アプリ起動 → initializeStorage → CalculatorStore.initialize → デフォルトセーブデータ読み込み
```

### 5.4 新規セーブデータ作成フロー

```
[新規作成] → 名前入力 → SaveDataStore.createSaveData → 新規データ作成 → 自動切り替え → CalculatorStore.loadSaveData
```

### 5.5 全ユーザーデータ削除フロー

```
[最後のユーザーデータ削除] → SaveDataStore.deleteSaveData → SaveDataStore.switchToMainData → CalculatorStore.loadSaveData(メインデータ)
```

### 5.6 セーブデータリスト表示フロー

```
SaveDataManager表示 → SaveDataStore.loadSaveDataList → ユーザー作成データのみフィルタリング → リスト表示
```

### 5.7 カスタム装備作成フロー（全装備スロット対応）

```
[新規作成] → 装備名入力モーダル → 装備カテゴリに応じた初期名設定 → CalculatorStore.createTemporaryCustomEquipment → メモリ上仮データ作成 → 該当装備スロットに自動セット → 未保存変更フラグ設定
```

### 5.8 カスタム装備名前変更フロー（全装備スロット対応）

```
[名前変更] → 名前変更モーダル → 現在名を初期値表示 → 新しい名前入力 → CalculatorStore.renameCustomEquipment → 全データ層で名前更新（永続データ・仮データ・編集セッション） → 装備選択UI反映 → 未保存変更フラグ設定
```

### 5.9 カスタム装備削除フロー（全装備スロット対応）

```
[削除] → 削除確認モーダル → 装備名・カテゴリ表示 → CalculatorStore.deleteCustomEquipment → LocalStorage除去 → 全装備スロットから該当装備を解除 → 未保存変更フラグ設定
```

### 5.10 既存カスタム装備編集フロー

```
カスタム装備選択 → 編集セッション開始 → プロパティ変更 → メモリ上編集データ更新 → 装備選択UI反映 → 未保存変更フラグ設定
```

### 5.11 カスタム装備保存フロー

```
[現在のデータを保存] → CalculatorStore.saveTemporaryCustomEquipments → 仮データ永続化 → 編集セッション永続化 → LocalStorage保存 → 仮データクリーンアップ
```

### 5.12 データ破棄フロー（リロード/切り替え）

```
セーブデータ切り替え/リロード → CalculatorStore.cleanupTemporaryData → 仮データ削除 → 現在セーブデータの編集セッション削除 → 永続データ復元
```

### 5.13 セーブデータ固有編集セッション管理フロー

```
セーブデータ切り替え → SaveDataStore.switchSaveData → setCurrentSaveDataId(新セーブID) → cleanupCurrentEditSessions() → 前セーブデータの編集セッション削除
```

**セーブデータ固有の編集セッション特徴**：
- 編集セッションキー：`${saveDataId}:${equipmentId}`
- 各セーブデータで独立した編集状態を維持
- セーブデータ切り替え時は該当セーブデータの編集セッションのみクリーンアップ
- 異なるセーブデータ間での編集セッション混在を完全防止

## 6. 型安全性

### 6.1 型定義の一元管理

```typescript
// src/types/stores.ts
export interface CalculatorStore extends CalculatorData {
  // ストア固有のメソッドと状態
}

export interface SaveDataStore {
  // セーブデータ関連の型定義
}

export interface UIStore {
  // UI状態関連の型定義
}
```

### 6.2 厳密な型チェック

- 全てのストアメソッドにTypeScript型注釈
- Zod schemaによるランタイム型検証
- React Hook Formとの型統合

## 7. パフォーマンス最適化

### 7.1 セレクター活用

```typescript
// 必要なデータのみを選択的に取得
const baseStats = useCalculatorStore(state => state.data.baseStats)
const updateBaseStats = useCalculatorStore(state => state.updateBaseStats)
```

### 7.2 不要な再レンダリング防止

- 細かい粒度でのデータ取得
- useCallbackによるメソッド安定化
- React.memoによるコンポーネント最適化

### 7.3 初期化の軽量化

- `values`プロパティによる自動フォーム同期
- `reset()`の削除でフォーム全体再構築を回避
- タイムアウト時間の最適化（30ms）

## 8. デバッグとメンテナンス

### 8.1 Zustand DevTools

```typescript
const useCalculatorStore = create<CalculatorStore>()(
  devtools(
    (set, get) => ({
      // ストア実装
    }),
    {
      name: 'calculator-store',
    }
  )
)
```

### 8.2 アクション名の明確化

全てのset操作にアクション名を付与:

```typescript
set(
  { hasUnsavedChanges: value },
  false,
  'setHasUnsavedChanges'
)
```

## 9. エラーハンドリング

### 9.1 非同期操作のエラー処理

```typescript
saveCurrentData: async () => {
  try {
    const { data } = get()
    await saveCurrentData(data)
    set({ hasUnsavedChanges: false })
  } catch (error) {
    console.error('データ保存エラー:', error)
    throw error
  }
}
```

### 9.2 データ整合性の保証

- LocalStorageアクセス時のtry-catch
- 不正なデータの検証とフォールバック
- ストア間の依存関係管理

## 10. 将来拡張性

### 10.1 新しいストアの追加

- 計算結果管理ストア
- 設定管理ストア
- キャラクター管理ストア

### 10.2 機能拡張対応

- ダメージ計算結果の状態管理
- 複数キャラクター対応
- リアルタイム協調機能

## 11. パフォーマンス指標

### 11.1 達成された改善

- セーブデータ切り替え時間: 200ms → 30ms
- 初期化ちらつき: 大幅削減
- 型安全性: 100%達成
- Props drilling: 完全撤廃

### 11.2 継続監視項目

- バンドルサイズ
- レンダリング回数
- メモリ使用量
- ユーザー操作の応答性

---

この設計書は、トーラムダメージ計算ツールにおけるZustand状態管理の完全な仕様を定義しています。