# カスタムデータ管理システム

## 概要

ユーザーが作成・管理できるカスタムデータ（装備、クリスタル、敵情報）の設計とローカルストレージでの管理方法について説明します。

### カスタムデータの特徴
- 全セーブデータ間で共有される独立したデータ
- プリセットデータとは別々に管理
- 一元的な管理で重複排除と効率的なストレージ利用
- 統合APIによるプリセット・カスタムデータの透過的なアクセス

## ユーザーカスタム装備データ構造

### UserEquipmentインターフェース

```typescript
interface UserEquipment {
  id: string                      // 一意識別子（ユーザー生成）
  name: string                    // 装備名（ユーザー入力）
  category: EquipmentCategory     // 装備カテゴリ（全11スロット対応）
  properties: Partial<EquipmentProperties> // 付与プロパティ（全カテゴリ共通）
  weaponStats?: WeaponStats       // mainWeapon, subWeaponカテゴリ専用：武器基本ステータス（オプション）
  crystalSlots?: CrystalSlots     // mainWeapon, body, additional, special専用：クリスタル枠（オプション）
  createdAt: string               // 作成日時 (ISO string)
  updatedAt: string               // 更新日時 (ISO string)
  isFavorite: boolean             // お気に入り設定
}

// 技術仕様書と同一の型定義
interface WeaponStats {
  ATK?: number       // 武器ATK（省略時はWeaponFormの値を使用）
  stability?: number // 安定率（省略時はWeaponFormの値を使用）
  refinement?: number // 精錬値（省略時はWeaponFormの値を使用）
}

interface CrystalSlots {
  slot1?: string     // クリスタルID（省略時は未装着）
  slot2?: string     // クリスタルID（省略時は未装着）
}

type EquipmentCategory = 
  | 'mainWeapon'      // メイン装備
  | 'body'            // 体装備
  | 'additional'      // 追加装備
  | 'special'         // 特殊装備
  | 'subWeapon'       // サブ武器
  | 'fashion1'        // オシャレ装備1
  | 'fashion2'        // オシャレ装備2
  | 'fashion3'        // オシャレ装備3
  | 'freeInput1'      // 自由入力1
  | 'freeInput2'      // 自由入力2
  | 'freeInput3'      // 自由入力3
```

### カスタム装備の管理機能

**メイン装備カスタム機能（新機能）**:
- 新規作成機能：装備選択UI内の「新規作成」ボタンから装備名入力モーダル起動
- プロパティ初期化：新規作成時は全プロパティをリセット状態で開始
- 即座保存：作成確定時にLocalStorageへ即座に保存（custom_equipmentsキー）
- 自動装備セット：新規作成完了後、作成した装備を自動的に装備スロットにセット
- 削除機能：装備選択UI内の「削除」ボタンから削除確認モーダル起動
- 削除確認：カスタム装備削除時の確認ダイアログでセーフティ確保
- LocalStorage除去：削除確定時にcustom_equipmentsから該当装備を除去
- プリセット統合：カスタム装備をプリセット選択モーダルで選択可能
- グローバル共有：カスタム装備は全セーブデータ間で共有（toram_custom_equipmentsキー使用）
- データ統合API：プリセット装備とカスタム装備を統合して提供するAPI

**作成・編集機能**:
- 装備作成フォーム（プリセットからコピー or 新規作成）
- 装備カテゴリ選択（11カテゴリから選択）
- 全プロパティの手動入力・調整（%系: -1000～1000、固定値: -99999～99999）
- mainWeaponの場合：武器基本ステータス設定（ATK、安定率、精錬値）
- mainWeapon/body/additional/specialの場合：クリスタルスロット設定
- お気に入り設定（よく使用する装備の管理）

**検索・フィルタリング**:
- 名前による検索
- カテゴリによるフィルタリング
- お気に入りによるフィルタリング
- プロパティ値による絞り込み（特定のプロパティを持つ装備）
- 作成日・更新日での並び替え

## ユーザーカスタムクリスタルデータ構造

### UserCrystalインターフェース

```typescript
interface UserCrystal {
  id: string                       // 一意識別子（ユーザー生成）
  name: string                     // クリスタル名（ユーザー入力）
  type: CrystalType               // クリスタルタイプ
  properties: Partial<EquipmentProperties> // 付与プロパティ
  description?: string             // 説明文（オプション）
  isCustom: true                  // カスタムクリスタル識別フラグ
  createdAt: string               // 作成日時 (ISO string)
  updatedAt: string               // 更新日時 (ISO string)
  isFavorite?: boolean            // お気に入り設定（オプション）
}

// クリスタルタイプ定義（技術仕様書と同一）
type CrystalType = 'weapon' | 'armor' | 'additional' | 'special' | 'normal'

// 既存のPresetCrystalとの統合型
type Crystal = PresetCrystal | UserCrystal
```

### クリスタルタイプシステム

**タイプ別装着制限**（要件定義書・技術仕様書準拠）:
- **weapon**: weaponクリスタルスロット専用 + normalクリスタルは全スロット装着可能
- **armor**: armorクリスタルスロット専用 + normalクリスタルは全スロット装着可能  
- **additional**: additionalクリスタルスロット専用 + normalクリスタルは全スロット装着可能
- **special**: specialクリスタルスロット専用 + normalクリスタルは全スロット装着可能
- **normal**: 全クリスタルスロット（weapon/armor/additional/special）に装着可能

**クリスタルスロット構成**（技術仕様書準拠）:
```typescript
interface CrystalSlots {
  weapon1: string | null    // weaponタイプ or normalタイプのクリスタルID
  weapon2: string | null    // weaponタイプ or normalタイプのクリスタルID
  armor1: string | null     // armorタイプ or normalタイプのクリスタルID
  armor2: string | null     // armorタイプ or normalタイプのクリスタルID
  additional1: string | null // additionalタイプ or normalタイプのクリスタルID
  additional2: string | null // additionalタイプ or normalタイプのクリスタルID
  special1: string | null   // specialタイプ or normalタイプのクリスタルID
  special2: string | null   // specialタイプ or normalタイプのクリスタルID
}
```

**作成・編集機能**:
- クリスタル作成フォーム（プリセットからコピー or 新規作成）
- クリスタルタイプ選択（5タイプから選択：weapon/armor/additional/special/normal）
- 全プロパティの手動入力・調整（技術仕様書の範囲準拠）:
  - %系プロパティ: -1000～1000
  - 固定値プロパティ: -99999～99999
- プロパティの有効/無効切り替え
- 説明文の追加（オプション）
- お気に入り設定（よく使用するクリスタルの管理）

## ユーザーカスタム敵情報データ構造

### UserEnemyインターフェース

```typescript
interface UserEnemy {
  id: string                    // 一意識別子（ユーザー生成）
  name: string                  // 敵名（ユーザー入力）
  level: number                 // レベル (1-999)
  stats: EnemyStats            // 基本ステータス
  category: EnemyCategory      // 敵カテゴリ
  createdAt: string            // 作成日時 (ISO string)
  updatedAt: string            // 更新日時 (ISO string)
  isFavorite: boolean          // お気に入り設定
}

// EnemyStatsは技術仕様書と同一
interface EnemyStats {
  DEF: number                  // 物理防御力 (0-9999)
  MDEF: number                 // 魔法防御力 (0-9999)
  physicalResistance: number   // 物理耐性% (-100-100)
  magicalResistance: number    // 魔法耐性% (-100-100)
  resistCritical: number       // クリティカル耐性 (0-999) ※プリセット敵情報では0、ユーザーが調整可能
  requiredHIT: number          // 必要HIT (0-9999) ※プリセット敵情報では0、ユーザーが調整可能
}

type EnemyCategory = 'mob' | 'fieldBoss' | 'boss' | 'raidBoss'
```

**作成・編集機能**:
- 敵情報作成フォーム（プリセットからコピー or 新規作成）
- 全ステータスの手動入力・調整
- カテゴリ選択（モブ、フィールドボス、ボス、レイドボス）
- お気に入り設定（よく使用する敵情報の管理）

## カスタムデータ管理API

### ユーザー装備管理（全装備スロット対応）

```typescript
// src/utils/customDataManager.ts

export function createTemporaryCustomEquipment(equipment: UserEquipment): Promise<string>  // 仮データ作成（IDを返す）
export function saveTemporaryCustomEquipment(id: string): Promise<void>  // 仮データをLocalStorageに永続保存
export function updateCustomEquipment(id: string, equipment: Partial<UserEquipment>): Promise<void>
export function deleteCustomEquipment(id: string): Promise<void>  // 全装備スロット対応
export function renameCustomEquipment(id: string, newName: string): Promise<void>  // 全装備スロット対応
export function getAllCustomEquipments(): UserEquipment[]  // LocalStorage + 仮データを統合
export function getCustomEquipmentsByCategory(category: EquipmentCategory): UserEquipment[]  // 全11カテゴリ対応
export function getCustomEquipmentById(id: string): UserEquipment | undefined
export function cleanupTemporaryEquipments(): void  // 仮データ全削除（セーブデータ切り替え時等）
export function getTemporaryEquipments(): UserEquipment[]  // 仮データのみ取得
export function isTemporaryEquipment(id: string): boolean  // 仮データかどうか判定
export function updateEquipmentProperties(id: string, properties: Partial<EquipmentProperties>): Promise<void>  // プロパティ連動更新（全装備スロット対応）

// 装備カテゴリ別のカスタム装備初期化
export function createCustomEquipmentByCategory(category: EquipmentCategory, name: string): UserEquipment  // カテゴリに応じた初期設定
export function getEquipmentCategoryDisplayName(category: EquipmentCategory): string  // カテゴリ表示名取得
export function validateEquipmentForCategory(equipment: UserEquipment, category: EquipmentCategory): boolean  // カテゴリ整合性チェック
```

### ユーザークリスタル管理

```typescript
export function createCustomCrystal(crystal: UserCrystal): Promise<void>
export function updateCustomCrystal(id: string, crystal: Partial<UserCrystal>): Promise<void>
export function deleteCustomCrystal(id: string): Promise<void>
export function renameCustomCrystal(id: string, newName: string): Promise<void>
export function getAllCustomCrystals(): UserCrystal[]
export function getCustomCrystalsByCategory(category: CrystalCategory): UserCrystal[]
export function getCustomCrystalById(id: string): UserCrystal | undefined
```

### ユーザー敵情報管理

```typescript
export function createCustomEnemy(enemy: UserEnemy): Promise<void>
export function updateCustomEnemy(id: string, enemy: Partial<UserEnemy>): Promise<void>
export function deleteCustomEnemy(id: string): Promise<void>
export function renameCustomEnemy(id: string, newName: string): Promise<void>
export function getAllCustomEnemies(): UserEnemy[]
export function getCustomEnemiesByCategory(category: EnemyCategory): UserEnemy[]
export function getCustomEnemyById(id: string): UserEnemy | undefined
```

### カスタムデータの影響確認（削除前チェック）

```typescript
export function findSaveDataUsingCustomEquipment(equipmentId: string): SaveData[]  // 全11装備スロットを検査
export function findSaveDataUsingCustomCrystal(crystalId: string): SaveData[]
export function findSaveDataUsingCustomEnemy(enemyId: string): SaveData[]
```

## セーブデータとの連携

### 装備選択の連携

```typescript
// セーブデータの装備選択
interface EquipmentFormData {
  mainWeapon: {
    selectedId: string | null    // プリセット装備ID or カスタム装備ID
    type: 'preset' | 'custom'    // データソースの識別
  }
  body: {
    selectedId: string | null
    type: 'preset' | 'custom'
  }
  // ... 他の装備スロット
}
```

### 敵情報選択の連携

```typescript
// セーブデータの敵情報選択
interface EnemyFormData {
  selectedId: string | null      // プリセット敵情報ID or カスタム敵情報ID
  type: 'preset' | 'custom'      // データソースの識別
  // 手動入力値（プリセット・カスタム選択後の調整用）
  manualOverrides?: {
    resistCritical?: number      // プリセット値（0）からの調整値
    requiredHIT?: number         // プリセット値（0）からの調整値
  }
}
```

## データ統合・検索API

### 統合データアクセス

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
```

## LocalStorage キー

```typescript
const STORAGE_KEYS = {
  // ユーザーカスタムデータ（全セーブデータで共有）
  CUSTOM_EQUIPMENTS: 'toram_custom_equipments',     // UserEquipment[] - 永続保存データ
  CUSTOM_CRYSTALS: 'toram_custom_crystals',         // UserCrystal[]
  CUSTOM_ENEMIES: 'toram_custom_enemies',           // UserEnemy[]
  
  // 一時データ（メモリ管理、永続化なし）
  TEMPORARY_EQUIPMENTS: 'memory:temp_equipments',   // UserEquipment[] - セーブ前の仮データ
} as const
```

## データ整合性・エラーハンドリング

### 削除時の影響確認
- カスタムデータを参照しているセーブデータの検索
- 削除確認ダイアログでの警告表示
- 影響を受けるセーブデータ一覧の表示

### データ整合性管理
- 削除されたカスタムデータへの参照を自動修復
- セーブデータ読み込み時の参照先存在確認
- クリスタルスロットの参照整合性チェック
- 破損した参照のエラーハンドリング

### データ検証

```typescript
interface DataValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  brokenReferences: { type: string, id: string }[]  // 破損した参照の一覧
}

export function validateCustomEquipment(equipment: UserEquipment): DataValidation
export function validateCustomCrystal(crystal: UserCrystal): DataValidation
export function validateCustomEnemy(enemy: UserEnemy): DataValidation
export function validateReferences(saveData: SaveData): DataValidation
```

## 関連ドキュメント

- [ストレージ概要](./storage-overview.md) - 全体設計の概要
- [セーブデータ管理](./save-data-storage.md) - セーブデータの詳細設計
- [データ同期・バージョン管理](./data-sync.md) - プリセットデータの更新システム
- [パフォーマンス・エラーハンドリング](./storage-optimization.md) - 最適化とエラー処理