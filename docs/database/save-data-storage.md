# セーブデータ管理システム

## 基本コンセプト

### デフォルトセーブデータ（メインデータ）
- システム起動時に自動的に使用される「メインデータ」
- **初回アクセス時に自動作成される**
- 削除不可、名前変更不可、常に存在する
- 全ての計算機能の基準となるデータ

### ユーザーセーブデータ
- ユーザーが任意で作成・管理できるセーブデータ
- 名前付きで保存、複数作成可能
- 作成、読み込み、更新、削除、並び替え、名前変更が可能

## セーブデータの構造

```typescript
interface SaveData {
  id: string                    // 一意識別子
  name: string                  // セーブデータ名
  isDefault: boolean            // デフォルトデータフラグ
  createdAt: string            // 作成日時 (ISO string)
  updatedAt: string            // 更新日時 (ISO string)
  order: number                // 表示順序
  data: {
    baseStats: BaseStatsFormData    // キャラクターベースステータス
    weapons: WeaponFormData         // 武器設定（選択された装備IDの参照）
    crystals: CrystalFormData       // クリスタル設定（選択されたクリスタルIDの参照）
    equipments: EquipmentFormData   // 装備設定（選択された装備IDの参照、体装備armorType含む）
    food: FoodFormData             // 料理設定
    enemy: EnemyFormData           // 敵設定
    buffSkills: BuffSkillFormData   // バフスキル設定
    buffItems: BuffItemFormData     // バフアイテム設定
    powerOptions: PowerOptions      // ダメージプレビュー威力オプション設定（v2.0で追加）
    attackSkill: AttackSkillFormData // 攻撃スキル設定（実装済み）
    register: RegisterFormData      // レジスター設定（実装済み）
  }
}

// デフォルトセーブデータ
interface DefaultSaveData extends SaveData {
  id: "default"
  name: "メインデータ"
  isDefault: true
  // 削除不可、名前変更不可
}
```

## データ参照システム

### 参照の仕組み（統合データアクセス方式）

```typescript
// セーブデータの装備選択例（簡素化）
interface EquipmentFormData {
  mainWeapon: {
    selectedId: string | null    // 装備ID（プリセット・カスタム統合済み）
  }
  body: {
    selectedId: string | null
  }
  // ... 他の装備スロット
}

// セーブデータの敵情報選択例（簡素化）
interface EnemyFormData {
  selectedId: string | null      // 敵情報ID（プリセット・カスタム統合済み）
  // 手動入力値（プリセット・カスタム選択後の調整用）
  manualOverrides?: {
    resistCritical?: number      // 選択した敵情報からの調整値
    requiredHIT?: number         // 選択した敵情報からの調整値
  }
}
```

### データアクセス関数

```typescript
// 統合データアクセス（プリセット・カスタムを区別せず取得）
function getEquipmentById(id: string): Equipment | null {
  // プリセット（コピー済み）とカスタムを統合して検索
  const allEquipments = [...getPresetEquipments(), ...getCustomEquipments()]
  return allEquipments.find(eq => eq.id === id) || null
}

function getEnemyById(id: string): Enemy | null {
  // プリセット（コピー済み）とカスタムを統合して検索
  const allEnemies = [...getPresetEnemies(), ...getCustomEnemies()]
  return allEnemies.find(enemy => enemy.id === id) || null
}

function getCrystalById(id: string): Crystal | null {
  // プリセット（コピー済み）とカスタムを統合して検索
  const allCrystals = [...getPresetCrystals(), ...getCustomCrystals()]
  return allCrystals.find(crystal => crystal.id === id) || null
}

function getBuffItemById(id: string): BuffItem | null {
  // プリセットバフアイテムのみ（ユーザーカスタム不可）
  const presetBuffItems = getPresetBuffItems()
  return presetBuffItems.find(item => item.id === id) || null
}
```

## 体装備の防具の改造（ArmorType）保存仕様

### データ保存場所
```typescript
// 各装備データ内に保存（プリセット・カスタム共通）
PresetEquipment.armorType: 'normal' | 'heavy' | 'light'
CustomEquipment.armorType: 'normal' | 'heavy' | 'light'
```

### 保存タイミング
- **即座保存**: ユーザーが防具の改造選択ボタンをクリックした際に装備データを直接更新
- **編集セッション不使用**: 他のプロパティと異なり、編集セッション機能は使用せず直接保存
- **グローバル共有**: 装備データに保存されるため、全セーブデータ間で共有される
- **装備固有設定**: 同じ装備を選択すれば、どのセーブデータでも同じarmorTypeが適用される

### デフォルト値管理
- **新規装備データ**: 新規作成時にarmorType: 'normal'を設定
- **プリセット装備**: システム提供プリセットのarmorTypeは初期状態で'normal'
- **既存データマイグレーション**: armorTypeプロパティが存在しない装備は'normal'として扱う
- **後方互換性**: 古い装備データでもエラーなく動作するよう配慮

### データ構造例
```typescript
// プリセット装備データ（equipments.ts）
{
  id: "iron_armor",
  name: "アイアンアーマー", 
  type: "armor",
  category: ["body"],
  baseStats: { DEF: 100 },
  properties: {},
  armorType: "heavy"  // この装備の防具の改造設定
}

// ユーザーカスタム装備データ（LocalStorage）
{
  id: "custom_armor_1",
  name: "カスタムアーマー1",
  category: "body", 
  properties: { DEF: 150 },
  armorType: "light",  // この装備の防具の改造設定
  isCustom: true
}

// セーブデータでは装備IDのみ参照
{
  id: "save1", 
  name: "テストデータ",
  data: {
    equipments: {
      body: {
        id: "iron_armor"  // 装備IDを参照、armorTypeは装備データから取得
      }
    }
  }
}
```

## メインデータのデフォルト値

```typescript
const DEFAULT_MAIN_DATA: DefaultSaveData = {
  id: "default",
  name: "メインデータ",
  isDefault: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  order: 0,
  data: {
    baseStats: getDefaultBaseStats(),      // レベル1、全ステータス最小値
    weapons: getDefaultWeapons(),          // 武器未選択状態
    crystals: getDefaultCrystals(),        // クリスタル未選択状態
    equipments: getDefaultEquipments(),    // 装備未選択状態（体装備armorType: 'normal'）
    food: getDefaultFood(),               // 料理未選択状態（全スロット「なし」）
    enemy: getDefaultEnemy(),              // 敵の基本設定
    buffSkills: getDefaultBuffSkills(),     // バフスキル未選択状態（全スキルOFF）
    buffItems: getDefaultBuffItems(),      // バフアイテム未選択状態（全カテゴリ「なし」）
    powerOptions: getDefaultPowerOptions(), // 威力オプションデフォルト設定（v2.0で追加）
    attackSkill: getDefaultAttackSkill(),  // 攻撃スキル未選択状態（実装済み）
    register: getDefaultRegister()         // レジスター設定デフォルト（実装済み）
  }
}
```

## セーブデータ管理UI

### セーブデータ選択・管理画面

```
ヘッダー部分に「セーブデータ」ボタン → セーブデータ管理モーダル
```

**モーダル構成**:
- **タイトル**: 「セーブデータ管理」
- **現在のセーブデータ表示**: 現在使用中のセーブデータ名
- **セーブデータリスト**: 
  - ユーザー作成データのみ表示（並び替え可能）
  - デフォルトデータ（メインデータ）は非表示
- **アクションボタン**:
  - 新規作成、読み込み、名前変更、削除、並び替え
  - 現在のデータを保存、キャンセル

### セーブデータ操作フロー

**新規作成フロー**:
```
[新規作成] → 名前入力モーダル → 現在の入力内容をコピーして新規セーブデータ作成 → 作成されたデータに自動切り替え → 元のセーブデータの変更は破棄
```

**読み込みフロー**:
```
セーブデータ選択 → [読み込み] → 確認ダイアログ → 選択したデータを読み込み → UI状態更新
```

**名前変更フロー**:
```
セーブデータ選択 → [名前変更] → 名前変更モーダル → 名前更新
```

**削除フロー**:
```
セーブデータ選択 → [削除] → 確認ダイアログ → 削除実行 → リスト更新 → [全ユーザーデータ削除時] → メインデータに自動切り替え
```

**並び替えフロー**:
```
[並び替え] → ドラッグ&ドロップ形式の並び替えUI → [保存] → 順序更新
```

**ユーザーデータ全削除時の動作**:
- 全てのユーザー作成セーブデータが削除された場合
- 自動的にメインデータ（デフォルトデータ）に切り替え
- セーブデータリストは空の状態で表示

## セーブデータ管理API

### 基本操作

```typescript
// セーブデータ作成
async function createSaveData(name: string, copyCurrentData: boolean = true): Promise<SaveData> {
  const newSaveData: SaveData = {
    id: generateUniqueId(),
    name: name,
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    order: getNextOrder(),
    data: copyCurrentData ? getCurrentFormData() : getDefaultFormData()
  }
  
  const saveDataList = getSaveDataList()
  saveDataList.push(newSaveData)
  saveSaveDataList(saveDataList)
  
  return newSaveData
}

// セーブデータ読み込み
async function loadSaveData(id: string): Promise<SaveData | null> {
  const saveDataList = getSaveDataList()
  const saveData = saveDataList.find(data => data.id === id)
  
  if (saveData) {
    setCurrentSaveId(id)
    applyToForms(saveData.data)
  }
  
  return saveData || null
}

// セーブデータ更新
async function updateSaveData(id: string, updatedData: Partial<SaveData>): Promise<boolean> {
  const saveDataList = getSaveDataList()
  const index = saveDataList.findIndex(data => data.id === id)
  
  if (index !== -1) {
    saveDataList[index] = {
      ...saveDataList[index],
      ...updatedData,
      updatedAt: new Date().toISOString()
    }
    saveSaveDataList(saveDataList)
    return true
  }
  
  return false
}

// セーブデータ削除
async function deleteSaveData(id: string): Promise<boolean> {
  if (id === "default") {
    return false // デフォルトデータは削除不可
  }
  
  const saveDataList = getSaveDataList()
  const filteredList = saveDataList.filter(data => data.id !== id)
  
  if (filteredList.length < saveDataList.length) {
    saveSaveDataList(filteredList)
    
    // 削除されたデータが現在のデータの場合、メインデータに切り替え
    if (getCurrentSaveId() === id) {
      setCurrentSaveId("default")
      const defaultData = await loadSaveData("default")
      if (defaultData) {
        applyToForms(defaultData.data)
      }
    }
    
    return true
  }
  
  return false
}
```

### 順序管理

```typescript
// セーブデータ並び替え
async function reorderSaveData(reorderedIds: string[]): Promise<boolean> {
  const saveDataList = getSaveDataList()
  const reorderedList = reorderedIds.map((id, index) => {
    const saveData = saveDataList.find(data => data.id === id)
    if (saveData) {
      return { ...saveData, order: index, updatedAt: new Date().toISOString() }
    }
    return null
  }).filter(Boolean) as SaveData[]
  
  if (reorderedList.length === saveDataList.length) {
    saveSaveDataList(reorderedList)
    return true
  }
  
  return false
}
```

## 初期化処理

```typescript
export async function initializeStorage(): Promise<void> {
  try {
    // バージョンチェック・プリセットデータ更新
    await checkAndUpdatePresetData()
    
    // メインデータの確保
    await ensureDefaultSaveData()
    
    // 現在のセーブデータ設定
    const currentSaveId = localStorage.getItem(STORAGE_KEYS.CURRENT_SAVE_ID)
    if (!currentSaveId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_SAVE_ID, "default")
    }
    
    // データ整合性チェック
    await validateStorageIntegrity()
  } catch (error) {
    console.error('ストレージ初期化エラー:', error)
    // フォールバック処理
    await resetToDefault()
  }
}

// メインデータ確保
async function ensureDefaultSaveData(): Promise<void> {
  const saveDataList = getSaveDataList()
  const defaultData = saveDataList.find(data => data.id === "default")
  
  if (!defaultData) {
    const newDefaultData = { ...DEFAULT_MAIN_DATA }
    saveDataList.unshift(newDefaultData) // 先頭に追加
    saveSaveDataList(saveDataList)
  }
}
```

## LocalStorage キー

```typescript
const STORAGE_KEYS = {
  SAVE_DATA_LIST: 'toram_save_data_list',           // SaveData[]
  CURRENT_SAVE_ID: 'toram_current_save_id',         // string
  // 威力オプション関連は各セーブデータ内に含まれるため、専用キーは不要
} as const
```

## 威力オプション設定（PowerOptions）管理

### 概要
ダメージプレビューの威力オプション設定は、セーブデータ内に含めて管理されます。

### PowerOptions データ構造
```typescript
interface PowerOptions {
  bossDifficulty: 'normal' | 'hard' | 'lunatic' | 'ultimate'  // ボス戦難易度
  skillDamage: 'all' | 'hit1' | 'hit2' | 'hit3'              // スキルダメージ
  elementAttack: 'advantageous' | 'other' | 'none' | 'disadvantageous'  // 属性攻撃
  combo: boolean                                              // コンボ:強打
  damageType: 'critical' | 'graze' | 'expected' | 'white'    // ダメージ判定
  distance: 'short' | 'long' | 'disabled'                    // 距離判定
  elementPower: 'enabled' | 'advantageOnly' | 'awakeningOnly' | 'disabled'  // 属性威力
  unsheathe: boolean                                          // 抜刀威力
}

const DEFAULT_POWER_OPTIONS: PowerOptions = {
  bossDifficulty: 'normal',
  skillDamage: 'all',
  elementAttack: 'advantageous',
  combo: false,
  damageType: 'white',
  distance: 'disabled',
  elementPower: 'enabled',
  unsheathe: false
}
```

### 保存・読み込み仕様
- **保存場所**: 各セーブデータの `data.powerOptions` フィールド
- **保存タイミング**: 威力オプション変更時の自動保存、または「現在のデータを保存」ボタン
- **読み込みタイミング**: セーブデータ切り替え時に復元
- **デフォルト処理**: 既存セーブデータに威力オプションが存在しない場合はデフォルト値を適用

## 関連ドキュメント

- [ストレージ概要](./storage-overview.md) - 全体設計の概要
- [カスタムデータ管理](./custom-data-storage.md) - ユーザーカスタムデータの管理
- [データ同期・バージョン管理](./data-sync.md) - プリセットデータの更新システム
- [パフォーマンス・エラーハンドリング](./storage-optimization.md) - 最適化とエラー処理