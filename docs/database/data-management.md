# データ管理パターン

## 初期化・プリセットデータコピー処理（TypeScript版）
```typescript
// TypeScriptモジュールからプリセットデータをインポート
import { equipmentsData } from '@/data/equipments'
import { crystalsData } from '@/data/crystals'
import { enemiesData } from '@/data/enemies'
import { buffItemsData } from '@/data/buffItems'

// プリセットデータの初期化処理（型安全版）
async function initializePresetData(): Promise<void> {
  // 装備プリセットデータのコピー（型安全）
  await copyPresetEquipmentsToLocalStorage(equipmentsData)
  
  // クリスタルプリセットデータのコピー（型安全）
  await copyPresetCrystalsToLocalStorage(crystalsData)
  
  // 敵情報プリセットデータのコピー（型安全）
  await copyPresetEnemiesToLocalStorage(enemiesData)
  
  // バフアイテムプリセットデータのコピー（型安全）
  await copyPresetBuffItemsToLocalStorage(buffItemsData)
}

// プリセットデータコピー関数（型安全版）
async function copyPresetEquipmentsToLocalStorage(data: EquipmentsData): Promise<void>
async function copyPresetCrystalsToLocalStorage(data: CrystalsData): Promise<void>
async function copyPresetEnemiesToLocalStorage(data: EnemiesData): Promise<void>
async function copyPresetBuffItemsToLocalStorage(data: BuffItemsData): Promise<void>
```

**TypeScript移行の利点**:
- コンパイル時の型チェックによるデータ整合性保証
- プロパティ名の統一性強制（EquipmentProperties準拠）
- インポート時の型安全性
- エディタでの自動補完とエラー検出

## データアクセス層（統合済み）
```typescript
// 装備データ取得（プリセット+カスタム統合）
function getAllEquipments(): Equipment[]
function getEquipmentsByCategory(category: EquipmentCategory): Equipment[]
function getEquipmentById(id: string): Equipment | null

// クリスタルデータ取得（プリセット+カスタム統合）
function getAllCrystals(): Crystal[]
function getCrystalsByType(type: CrystalType): Crystal[]
function getCrystalById(id: string): Crystal | null

// 敵情報データ取得（プリセット+カスタム統合）
function getAllEnemies(): Enemy[]
function getEnemiesByCategory(category: EnemyCategory): Enemy[]
function getEnemyById(id: string): Enemy | null

// お気に入り管理
function toggleEquipmentFavorite(id: string): void
function toggleCrystalFavorite(id: string): void
function toggleEnemyFavorite(id: string): void

// データ更新（プリセット由来データも編集可能）
function updateEquipment(id: string, updates: Partial<Equipment>): void
function updateCrystal(id: string, updates: Partial<Crystal>): void
function updateEnemy(id: string, updates: Partial<Enemy>): void

// カスタムデータ作成
function createCustomEquipment(equipment: Omit<Equipment, 'isPreset' | 'createdAt' | 'updatedAt'>): void
function createCustomCrystal(crystal: Omit<Crystal, 'isPreset' | 'createdAt' | 'updatedAt'>): void
function createCustomEnemy(enemy: Omit<Enemy, 'isPreset' | 'createdAt' | 'updatedAt'>): void

// クリスタル取得（装備カテゴリ対応）
function getAvailableCrystalsForEquipment(equipmentCategory: EquipmentCategory): Crystal[]
// mainWeapon: weapon + normal
// body: armor + normal
// additional: additional + normal 
// special: special + normal
// その他の装備カテゴリ: 空配列
```

## データバリデーション
- 全ての数値フィールドに適切な範囲制限
- 必須フィールドの検証
- 一意性制約（ID重複チェック）
- プロパティ値の型安全性保証

## 武器組み合わせシステム

### 武器種定義

**拡張WeaponType型定義**:
```typescript
export type WeaponType =
  | '片手剣'
  | '双剣'
  | '両手剣'
  | '手甲'
  | '旋風槍'
  | '抜刀剣'
  | '弓'
  | '自動弓'
  | '杖'
  | '魔導具'
  | '素手'

export type SubWeaponType = 
  | 'ナイフ' 
  | '矢' 
  | '盾'
  | '魔道具'
  | '手甲'
  | '巻物'
  | '片手剣'
  | '抜刀剣'
  | 'なし'
```