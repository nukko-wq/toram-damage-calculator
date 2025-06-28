# CalculatorStore 詳細設計

## 1. 概要

**目的**: 計算機の全てのデータを一元管理

CalculatorStoreは、トーラムダメージ計算ツールの中核となるストアで、全ての計算データの状態管理と操作を担当します。

## 2. インターフェース定義

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
  updateEquipmentArmorType: (equipmentId: string, armorType: ArmorType) => Promise<boolean>  // ArmorType即座反映対応
  cleanupTemporaryData: () => void
  updateFood: (food: FoodFormData) => void
  updateEnemy: (enemy: EnemyFormData) => void
  updateBuffSkills: (buffSkills: BuffSkillFormData) => void
  updateBuffItems: (buffItems: BuffItemFormData) => void
  updateRegister: (register: RegisterFormData) => void
  updateRegisterEffect: (effectId: string, enabled: boolean) => void
  updateRegisterLevel: (effectId: string, level: number, partyMembers?: number) => void
  resetRegisterData: () => void
}
```

## 3. 主要機能

### 3.1 データの一元管理と更新

- 全ての計算データを単一のストアで管理
- 各フォームからの個別更新を受け付け
- データの整合性を保証

### 3.2 未保存変更の検知

UI表示用の色分けに使用される機能:

```typescript
// 保存ボタンの統一仕様
// ボタンラベル: 常に「現在のデータを保存」
// 未保存変更の有無は色で表示（オレンジ/緑）
// 重複していた保存ボタンは削除
```

### 3.3 セーブデータの読み込み・保存

- LocalStorageとの連携
- 非同期操作によるデータ永続化
- エラーハンドリング付きの安全な操作

## 4. カスタム装備機能（全装備スロット対応）

### 4.1 対応装備スロット

- メイン装備、体装備、追加装備、特殊装備、サブ武器
- オシャレ1、オシャレ2、オシャレ3
- 自由入力1、自由入力2、自由入力3

### 4.2 仮データ管理システム

```typescript
// カスタム装備仮データ管理の特徴:
// - 仮データ作成：新規作成時はメモリ上に一時的なデータを作成
// - セーブ時永続化：「現在のデータを保存」実行時のみLocalStorageに保存
// - 自動クリーンアップ：セーブデータ切り替え・リロード時に仮データを削除
// - 保存状態表示：未保存カスタム装備の視覚的インジケーター
```

### 4.3 カスタム装備操作フロー

**新規作成フロー（全装備スロット対応）**:

```
[新規作成] → 装備名入力モーダル → 装備カテゴリに応じた初期名設定 → CalculatorStore.createTemporaryCustomEquipment → メモリ上仮データ作成 → 該当装備スロットに自動セット → 未保存変更フラグ設定
```

**名前変更フロー（全装備スロット対応）**:

```
[名前変更] → 名前変更モーダル → 現在名を初期値表示 → 新しい名前入力 → CalculatorStore.renameCustomEquipment → 全データ層で名前更新（永続データ・仮データ・編集セッション） → 装備選択UI反映 → 未保存変更フラグ設定
```

**削除フロー（全装備スロット対応）**:

```
[削除] → 削除確認モーダル → 装備名・カテゴリ表示 → CalculatorStore.deleteCustomEquipment → LocalStorage除去 → 全装備スロットから該当装備を解除 → 未保存変更フラグ設定
```

### 4.4 プロパティ連動システム

```typescript
// カスタム装備プロパティ連動の特徴:
// - リアルタイム反映：プロパティフォーム変更時の装備データ自動更新
// - 双方向同期：装備選択とプロパティ編集の整合性維持
// - 仮データ対応：永続・仮データ問わずプロパティ連動機能が動作
// - 編集セッション管理：既存カスタム装備の編集時は編集セッションで管理
// - 保存まで仮反映：永続データは「現在のデータを保存」実行時のみ更新
```

### 4.5 編集セッション管理

**セーブデータ固有の編集セッション**:

```typescript
// セーブデータ固有の編集セッション特徴：
// - 編集セッションキー：`${saveDataId}:${equipmentId}`
// - 各セーブデータで独立した編集状態を維持
// - セーブデータ切り替え時は該当セーブデータの編集セッションのみクリーンアップ
// - 異なるセーブデータ間での編集セッション混在を完全防止
```

## 5. レジスタ他システム状態管理

### 5.1 状態管理設計

**目的**: レジスタレットとギルド料理効果をCalculatorStoreに統合し、装備/プロパティシステムとの連動を実現

**データフロー**:
```
RegisterForm (UI) ↔ CalculatorStore ↔ LocalStorage (SaveData)
                          ↓
                  プロパティ変換システム
                          ↓
                    ダメージ計算エンジン
```

### 5.2 レジスタ操作メソッド

```typescript
// 全体データ更新
updateRegister: (register: RegisterFormData) => void
// 個別効果のオン/オフ切り替え
updateRegisterEffect: (effectId: string, enabled: boolean) => void
// レベル設定（運命共同体は特殊処理）
updateRegisterLevel: (effectId: string, level: number, partyMembers?: number) => void
// 初期化
resetRegisterData: () => void
```

### 5.3 プロパティシステム連動

**自動変換とリアルタイム反映**:

```typescript
// CalculatorStore内でのプロパティ統合
const getCalculatedProperties = (): Partial<EquipmentProperties> => {
  const equipmentProps = calculateEquipmentProperties(data.equipment)
  const registerProps = convertRegisterToProperties(data.register)
  const buffSkillProps = convertBuffSkillsToProperties(data.buffSkills)
  const buffItemProps = convertBuffItemsToProperties(data.buffItems)
  
  // 全プロパティを統合
  return mergeProperties([
    equipmentProps,
    registerProps,
    buffSkillProps,
    buffItemProps
  ])
}
```

### 5.4 未保存変更の検知

**レジスタ他変更の監視**:

```typescript
// CalculatorStore内での変更検知
const updateRegisterEffect = (effectId: string, enabled: boolean) => {
  set((state) => ({
    data: {
      ...state.data,
      register: {
        ...state.data.register,
        [effectId]: {
          ...state.data.register[effectId],
          enabled
        }
      }
    },
    hasUnsavedChanges: true // 変更フラグ設定
  }))
}
```

## 6. React Hook Form統合

### 6.1 基本統合パターン

各フォームコンポーネントでの標準的な統合:

```typescript
const FormComponent = () => {
  const storeData = useCalculatorStore(state => state.data.formData)
  const updateData = useCalculatorStore(state => state.updateFormData)
  const isInitialized = useCalculatorStore(state => state.isInitialized)
  
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: storeData, // Zustandからのデータ自動同期
    mode: 'onChange',
  })

  // 変更検知とストア更新
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (!isInitialized || !name || !value || type !== 'change') {
        return
      }
      updateData(value as FormData)
    })
    return () => subscription.unsubscribe()
  }, [watch, isInitialized, updateData])
}
```

### 6.2 バフスキル統合の特殊パターン

バフスキルフォームでは複数のスキルを管理するため、より複雑な統合パターンを使用:

```typescript
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
}
```

### 6.3 バフアイテム統合のモーダル選択パターン

バフアイテムフォームでは装備・クリスタ選択と統一されたモーダル選択UIを使用:

```typescript
const BuffItemForm = () => {
  const storeBuffItems = useCalculatorStore(state => state.data.buffItems)
  const updateBuffItems = useCalculatorStore(state => state.updateBuffItems)
  
  // アイテム選択ハンドラ
  const handleSelectBuffItem = (buffItemId: string | null) => {
    if (!modalState.category) return
    
    const updatedBuffItems = {
      ...storeBuffItems,
      [modalState.category]: buffItemId,
    }
    
    updateBuffItems(updatedBuffItems)
  }
}
```

**モーダル選択の特徴**:
- 装備・クリスタ選択と統一されたUI/UX
- カテゴリ別の専用モーダル表示
- 選択状態の視覚的フィードバック
- アイテム詳細情報の表示

### 6.4 装備カスタム機能統合

装備フォームではカスタム装備の作成・名前変更・削除機能を統合:

```typescript
const EquipmentForm = () => {
  const storeEquipment = useCalculatorStore(state => state.data.equipment)
  const createCustomEquipment = useCalculatorStore(state => state.createCustomEquipment)
  const renameCustomEquipment = useCalculatorStore(state => state.renameCustomEquipment)
  const deleteCustomEquipment = useCalculatorStore(state => state.deleteCustomEquipment)
  
  // カスタム装備作成処理（仮データ作成）
  const handleCreateEquipment = async (equipmentCategory: EquipmentCategory, name: string) => {
    await createTemporaryCustomEquipment(equipmentCategory, name)
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

## 7. ArmorType即座反映システム

### 7.1 ArmorType更新の特殊処理

**目的**: 体装備のArmorType変更時に、ASPD計算へ即座に反映

**問題**: ArmorType変更がデータベースレベルでのみ実行され、Zustandストアの状態が更新されないため、StatusPreviewのASPD計算が即座に反映されない

**解決策**: `updateEquipmentArmorType`メソッドでの強制的ストア状態更新

```typescript
updateEquipmentArmorType: async (equipmentId, armorType) => {
  try {
    const success = updateEquipmentArmorType(equipmentId, armorType)
    if (success) {
      // ArmorType変更を即座に反映するためにストア状態を強制更新
      set((state) => {
        const newState = { ...state, hasUnsavedChanges: true }
        // 体装備のIDが一致する場合、ストアの装備データを更新
        if (state.data.equipment.body?.id === equipmentId) {
          newState.data = {
            ...state.data,
            equipment: {
              ...state.data.equipment,
              body: {
                ...state.data.equipment.body,
                armorType,
              },
            },
          }
        }
        return newState
      }, false, 'updateEquipmentArmorType')
    }
    return success
  } catch (error) {
    console.error('ArmorType更新エラー:', error)
    throw error
  }
}
```

### 7.2 ArmorType変更フロー

**変更フロー**:
```
[ArmorType変更] → ArmorTypeSelect.onChange → EquipmentForm.handleArmorTypeChange → CalculatorStore.updateEquipmentArmorType → データベース更新 + ストア状態強制更新 → StatusPreview自動再計算 → ASPD即座反映
```

**重要な特徴**:
- データベースレベルとストアレベルの両方を同期更新
- 体装備以外のArmorType変更は影響なし（IDチェックにより安全）
- 未保存変更フラグの自動設定
- エラーハンドリングによる安全な操作

### 7.3 ASPD計算連動

**計算フロー**:
```typescript
// StatusPreviewでの自動計算
const bodyArmorType = getBodyArmorType(data.equipment.body)
const aspdCalculation = calculateASPD(
  baseStats,
  data.mainWeapon,
  adjustedStatsCalculation,
  allBonuses,
  bodyArmorType,  // ストア状態から取得したArmorTypeを使用
)
```

**連動の特徴**:
- ストア状態変更により自動的にStatusPreviewが再レンダリング
- ArmorType補正（軽量化 +50%, 重量化 -50%）が内部的にASPD%計算に適用
- 装備品補正値には表示されない（内部計算のみ）
- リアルタイムでのASPD値更新

## 8. データクリーンアップ

### 7.1 自動クリーンアップ機能

仮データの自動クリーンアップ:

```typescript
cleanupTemporaryData: () => void
```

### 7.2 クリーンアップタイミング

- セーブデータ切り替え時
- ページリロード時
- 新しいセーブデータ読み込み時
- アプリケーション終了時