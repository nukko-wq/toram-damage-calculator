# 敵情報データベース設計

## ファイル構成・データフロー
**初期データ配置**:
- **プリセットデータ**: `src/data/enemies.ts`（TypeScript静的ファイル）

**アプリ起動時の処理**:
```
アプリ起動 → プリセットTypeScriptモジュールを読み込み → LocalStorageにコピー → 以降はLocalStorageから参照
```

**TypeScript移行の利点**:
- EnemyStatsインターフェースによる厳密な型チェック
- EnemyCategoryとPresetEnemyの型安全性保証
- 数値範囲の型制約（DEF, MDEF, レベルなど）
- nullから0への型安全な変換による一貫性確保

**ローカルストレージキー**:
- **プリセット敵情報（コピー済み）**: LocalStorage (`preset_enemies`)
- **ユーザーカスタムデータ**: LocalStorage (`custom_enemies`)
- **敵選択状態（共通）**: LocalStorage (`enemy_selection_state`)
- **統合アクセス**: 両方のデータを統一的に管理

## TypeScriptデータ構造

```typescript
// src/data/enemies.ts
interface EnemiesData {
  enemies: Record<EnemyCategory, PresetEnemy[]>
}

export const enemiesData: EnemiesData = {
  enemies: {
    mob: [敵情報配列],
    fieldBoss: [敵情報配列],
    boss: [敵情報配列],
    raidBoss: [敵情報配列]
  }
} as const
```

## 敵情報構造

**プリセット敵情報インターフェース**（初期配置用）:
```typescript
interface PresetEnemy {
  id: string                    // 一意識別子
  name: string                  // 敵名
  level: number                 // レベル (1-999)
  stats: EnemyStats            // 基本ステータス
  category: EnemyCategory      // 敵カテゴリ
}
```

**ローカルストレージ敵情報インターフェース**（拡張版）:
```typescript
interface LocalStorageEnemy extends PresetEnemy {
  isPreset: boolean            // プリセット由来かどうか
  isFavorite: boolean          // お気に入り設定
  createdAt: string           // 作成日時 (ISO string)
  updatedAt: string           // 更新日時 (ISO string)
}

// 統合型（アプリ内で使用する敵情報データ型）
type Enemy = LocalStorageEnemy

interface EnemyStats {
  DEF: number                  // 物理防御力 (0-9999)
  MDEF: number                 // 魔法防御力 (0-9999)
  physicalResistance: number   // 物理耐性% (-100-100)
  magicalResistance: number    // 魔法耐性% (-100-100)
  resistCritical: number       // 確定クリティカル (0-999) ※プリセット敵情報では0、全敵カテゴリでユーザーが調整可能
  requiredHIT: number          // 必要HIT (0-9999) ※プリセット敵情報では0、ユーザーが調整可能
}

type EnemyCategory = 'mob' | 'fieldBoss' | 'boss' | 'raidBoss'

// ボス戦難易度
type BossDifficulty = 'normal' | 'hard' | 'lunatic' | 'ultimate'
```

## セーブデータ分離設計

### 共通敵選択状態（全セーブデータ共通）
```typescript
interface EnemySelectionState {
  selectedId: string | null           // 選択中の敵ID
  type: 'preset' | 'custom' | null    // データソースの識別
  // ボス難易度設定（boss カテゴリのみ）
  difficulty?: BossDifficulty
  // レイドボス レベル調整（raidBoss カテゴリのみ）
  raidBossLevel?: number
  // 手動調整値（プリセット・カスタム選択後の調整用）
  manualOverrides?: {
    resistCritical?: number           // 確定クリティカル調整値
    requiredHIT?: number              // 必要HIT調整値
  }
  lastUpdated: string                 // 最終更新日時 (ISO string)
}
```

### セーブデータ内の敵情報（個別セーブデータ用）
```typescript
interface SaveDataEnemyInfo {
  selectedEnemyId: string | null      // 選択中の敵ID（参照のみ）
  lastSelectedAt?: string             // 最終選択日時 (ISO string)
}
```

### データフロー設計
```
1. 敵選択・設定変更
   ↓
2. EnemySelectionState（共通）に保存
   ↓
3. SaveDataEnemyInfo（個別）に敵IDのみ記録
   ↓
4. セーブデータ切り替え時
   ↓
5. 共通状態から該当敵の設定を読み込み表示
```

## ボス戦難易度システム

### 難易度設定
ボス系敵（`boss`, `raidBoss`）に対してのみ難易度選択が可能です。

**難易度別ステータス計算**:
- **normal**: 基準値（プリセット値そのまま）
- **hard**: レベル +10, DEF/MDEF x2
- **lunatic**: レベル +20, DEF/MDEF x4
- **ultimate**: レベル +40, DEF/MDEF x6

**適用対象**:
- `mob`, `fieldBoss`: 難易度選択なし（常にnormal扱い）
- `boss`: 難易度選択可能
- `raidBoss`: 難易度選択なし（レベル調整システムを使用）

**計算式**:
```typescript
// 難易度別レベル計算
const adjustedLevel = baseLevel + getDifficultyLevelBonus(difficulty)

// 難易度別DEF/MDEF計算
const adjustedDEF = baseDEF * getDifficultyDefMultiplier(difficulty)
const adjustedMDEF = baseMDEF * getDifficultyDefMultiplier(difficulty)

function getDifficultyLevelBonus(difficulty: BossDifficulty): number {
  switch (difficulty) {
    case 'normal': return 0
    case 'hard': return 10
    case 'lunatic': return 20
    case 'ultimate': return 40
  }
}

function getDifficultyDefMultiplier(difficulty: BossDifficulty): number {
  switch (difficulty) {
    case 'normal': return 1
    case 'hard': return 2
    case 'lunatic': return 4
    case 'ultimate': return 6
  }
}
```

**UI表示**:
- EnemyForm: ボス系敵の難易度別ステータス表示（選択不可）
- DamagePreview: ボス難易度選択UI（計算で使用）
- 選択された難易度は敵名の後に表示（例：「ピヌグールガ (Hard)」）

## レイドボス レベル調整システム

### レベル調整設定
レイドボス（`raidBoss`）に対してはユーザーがレベルを自由に設定可能です。

**レベル調整によるステータス計算**:
レイドボスのレベル変更時、DEF/MDEFは設定されたレベルに基づいて自動計算されます。

**計算式**:
レイドボス毎に固有の計算式を使用します。

```typescript
// レイドボス レベル調整時のステータス計算
function calculateRaidBossStats(raidBossId: string, level: number): EnemyStats {
  switch (raidBossId) {
    case 'ca10a211-71b5-4683-811e-3e09457edbe3': // 竜骨の魔人
      return {
        DEF: Math.floor(level * 3 / 4),
        MDEF: Math.floor(level * 3 / 2),
        physicalResistance: Math.floor(level / 10),
        magicalResistance: Math.floor(25 + level / 10),
        resistCritical: 0, // 確定クリティカル、ユーザー調整可能
        requiredHIT: Math.floor(level * 3 / 2) // FLEE値
      }
    
    // 他のレイドボスの計算式も個別に定義
    case '1a1674ab-7118-4667-b457-903841462889': // 赫灼のセルディテ
      return {
        DEF: Math.floor(level * 5 / 4),
        MDEF: Math.floor(level * 5 / 4),
        physicalResistance: Math.floor(20 + level / 10),
        magicalResistance: Math.floor(level / 10),
        resistCritical: 0, // 確定クリティカル、ユーザー調整可能
        requiredHIT: 0 // FLEE値不明のため0、ユーザー入力可能
      }
    
    // 追加のレイドボス
    case 'ice-bison-id': // 氷岩のバイソン (実際のIDに置き換える)
      return {
        DEF: Math.floor(level * 3 / 2),
        MDEF: Math.floor(level * 3 / 4),
        physicalResistance: Math.floor(25 + level / 10),
        magicalResistance: Math.floor(level / 10),
        resistCritical: 0,
        requiredHIT: Math.floor(level * 3 / 2)
      }
    
    case 'thunder-nguruma-id': // 轟雷のングルマ (実際のIDに置き換える)
      return {
        DEF: Math.floor(level * 1),
        MDEF: Math.floor(level * 1 / 4),
        physicalResistance: Math.floor(15 + level / 10),
        magicalResistance: Math.floor(15 + level / 10),
        resistCritical: 0,
        requiredHIT: Math.floor(level * 3)
      }
    
    case 'earthquake-chimera-id': // 震巌のキマイラ (実際のIDに置き換える)
      return {
        DEF: Math.floor(level * 2),
        MDEF: Math.floor(level * 1),
        physicalResistance: Math.floor(10 + level / 10),
        magicalResistance: Math.floor(20 + level / 10),
        resistCritical: 0,
        requiredHIT: Math.floor(level * 1 / 2)
      }
    
    default:
      // 未定義のレイドボスの場合はデフォルト値
      return {
        DEF: 0,
        MDEF: 0,
        physicalResistance: 0,
        magicalResistance: 0,
        resistCritical: 0,
        requiredHIT: 0
      }
  }
}
```

**レイドボス別計算式**:

1. **竜骨の魔人**:
   - DEF: `Math.floor(Lv × 3 / 4)`
   - MDEF: `Math.floor(Lv × 3 / 2)`
   - 物理耐性: `Math.floor(Lv / 10)%`
   - 魔法耐性: `Math.floor(25 + Lv / 10)%`
   - 必要HIT: `Math.floor(Lv × 3 / 2)` (FLEE値)

2. **赫灼のセルディテ**:
   - DEF: `Math.floor(Lv × 5 / 4)`
   - MDEF: `Math.floor(Lv × 5 / 4)`
   - 物理耐性: `Math.floor(20 + Lv / 10)%`
   - 魔法耐性: `Math.floor(Lv / 10)%`
   - 必要HIT: `0` (FLEE値不明、ユーザー入力可能)

3. **氷岩のバイソン**:
   - DEF: `Math.floor(Lv × 3 / 2)`
   - MDEF: `Math.floor(Lv × 3 / 4)`
   - 物理耐性: `Math.floor(25 + Lv / 10)%`
   - 魔法耐性: `Math.floor(Lv / 10)%`
   - 必要HIT: `Math.floor(Lv × 3 / 2)`

4. **轟雷のングルマ**:
   - DEF: `Math.floor(Lv × 1)`
   - MDEF: `Math.floor(Lv × 1 / 4)`
   - 物理耐性: `Math.floor(15 + Lv / 10)%`
   - 魔法耐性: `Math.floor(15 + Lv / 10)%`
   - 必要HIT: `Math.floor(Lv × 3)`

5. **震巌のキマイラ**:
   - DEF: `Math.floor(Lv × 2)`
   - MDEF: `Math.floor(Lv × 1)`
   - 物理耐性: `Math.floor(10 + Lv / 10)%`
   - 魔法耐性: `Math.floor(20 + Lv / 10)%`
   - 必要HIT: `Math.floor(Lv × 1 / 2)`

**UI表示**:
- `raidBoss`選択時のみレベル入力フィールド表示
- レベル範囲: 1-999、デフォルト値: 288
- レベル変更時に全ステータス（DEF、MDEF、耐性、必要HIT）が自動更新
- レイドボス毎に異なる計算式を適用
- **FLEE値の手動入力**: 赫灼のセルディテ選択時は必要HIT（FLEE値）の手動入力フィールドを表示
- **確定クリティカル設定**: 全敵カテゴリ（mob, fieldBoss, boss, raidBoss）で確定クリティカル値（0-999）をユーザーが設定可能

## ストレージ管理の実装方針

### 従来の問題点
- セーブデータごとに敵情報の詳細設定を保存
- セーブデータ間で敵の設定が独立してしまう
- 同じ敵に対する設定の重複保存

### 新しい設計の利点
1. **共通設定の一元管理**:
   - レイドボスレベル、ボス難易度、手動調整値を共通化
   - 一度設定すれば全セーブデータで共有

2. **セーブデータの軽量化**:
   - 各セーブデータには敵IDのみ保存
   - 詳細設定は共通ストレージから参照

3. **設定の一貫性**:
   - 同じ敵を選択すれば常に同じ設定値
   - セーブデータ切り替え時の設定ロスト防止

### 実装上の考慮点
- 共通設定の変更は即座に全セーブデータに反映
- セーブデータ削除時も共通設定は保持
- 共通設定のバックアップ・復元機能

### マイグレーション計画
```typescript
// 既存データから新形式への移行
interface MigrationPlan {
  1. 既存のEnemyFormDataからEnemySelectionStateを抽出
  2. 共通ストレージ（enemy_selection_state）に保存
  3. 各セーブデータのenemyフィールドをSaveDataEnemyInfoに変換
  4. 旧形式のクリーンアップ
}
```

## mainWeapon装備の武器ステータス仕様

mainWeaponカテゴリの装備では、`weaponStats`フィールドで武器の基本ステータスを定義できます：

- **設定あり**: 装備データで定義された値を使用
- **設定なし**: WeaponFormで入力された値を使用
- **優先度**: `weaponStats` > WeaponForm入力値

```typescript
// 例：武器ステータスが設定された装備
{
  "id": "legendary_sword",
  "name": "レジェンダリーソード",
  "weaponStats": {
    "ATK": 500,
    "stability": 90,
    "refinement": 15
  },
  "properties": {
    "ATK_Rate": 20,
    "Critical_Rate": 15
  }
}

// 例：武器ステータスが未設定の装備（WeaponFormの値を使用）
{
  "id": "basic_sword",
  "name": "ベーシックソード",
  "properties": {
    "ATK%": 10 
  }
}
```