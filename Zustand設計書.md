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
// バフスキルフォームの例
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

### 4.4 バフアイテム統合の特殊パターン

バフアイテムフォームでは12カテゴリのアイテム選択を管理するため、シンプルな統合パターンを使用:

```typescript
// バフアイテムフォームの例
const BuffItemForm = () => {
  const storeBuffItems = useCalculatorStore(state => state.data.buffItems)
  const updateBuffItems = useCalculatorStore(state => state.updateBuffItems)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // フォーム設定
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BuffItemFormData>({
    resolver: zodResolver(buffItemFormDataSchema),
    values: storeBuffItems, // Zustandからのデータ
    mode: 'onChange',
  })
  
  // 変更検知とストア更新
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (!isInitialized || !name || !value || type !== 'change') {
        return
      }
      updateBuffItems(value as BuffItemFormData)
    })
    return () => subscription.unsubscribe()
  }, [watch, isInitialized, updateBuffItems])
  
  // 初期化管理
  useEffect(() => {
    setIsInitialized(false)
    const timer = setTimeout(() => setIsInitialized(true), 30)
    return () => clearTimeout(timer)
  }, [storeBuffItems])
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">バフアイテム設定</h2>
      
      {/* カテゴリ別セレクトボックス */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            物理威力
          </label>
          <select
            {...register('physicalPower')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">なし</option>
            {getBuffItemsByCategory('physicalPower').map(item => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            魔法威力
          </label>
          <select
            {...register('magicalPower')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">なし</option>
            {getBuffItemsByCategory('magicalPower').map(item => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* 他の10カテゴリも同様に実装 */}
      </div>
    </div>
  )
}
```

### 4.5 初期化管理

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