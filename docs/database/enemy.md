# 敵情報データベース設計

## ファイル構成・データフロー
**データ配置**:
- **プリセットデータ**: `src/data/enemies.ts`（TypeScript静的ファイル）
- **ユーザーカスタムデータ**: LocalStorage (`custom_enemies`)

**データアクセス**:
- **プリセット敵情報**: TypeScript静的ファイルから直接取得（LocalStorageコピーなし）
- **ユーザーカスタム敵情報**: LocalStorageから取得
- **敵設定（敵ID別）**: LocalStorage (`enemy_settings_per_enemy`) + Zustandストア

**データフロー**:
```
アプリ起動
└─ プリセット敵情報: src/data/enemies.ts から直接参照
└─ ユーザー敵情報: LocalStorage (custom_enemies) から取得
└─ 敵設定: LocalStorage (enemy_settings_per_enemy) + EnemySettingsStore (Zustand)
```

**TypeScript設計の利点**:
- EnemyStatsインターフェースによる厳密な型チェック
- EnemyCategoryとPresetEnemyの型安全性保証
- 数値範囲の型制約（DEF, MDEF, レベルなど）
- nullから0への型安全な変換による一貫性確保

**ローカルストレージキー**:
- **ユーザーカスタム敵データ**: LocalStorage (`custom_enemies`)
- **敵設定（敵ID別）**: LocalStorage (`enemy_settings_per_enemy`) + Zustandストア

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

**統合敵情報インターフェース**（アプリ内使用型）:
```typescript
interface Enemy extends PresetEnemy {
  isPreset: boolean            // プリセット由来かどうか
  isCustom: boolean            // カスタム敵情報かどうか
  isFavorite: boolean          // お気に入り設定
  isModified: boolean          // 変更されたかどうか
  createdAt: string           // 作成日時 (ISO string)
  updatedAt: string           // 更新日時 (ISO string)
  modifiedAt?: string         // 変更日時 (ISO string, optional)
}

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

## 敵設定管理システム

### 敵設定の個別保存（Zustandベース）
```typescript
interface EnemySettings {
  enemyId: string                     // 敵ID（キー）
  difficulty?: BossDifficulty         // ボス難易度設定（boss カテゴリのみ）
  raidBossLevel?: number              // レイドボス レベル調整（raidBoss カテゴリのみ）
  manualOverrides?: {
    resistCritical?: number           // 確定クリティカル調整値
    requiredHIT?: number              // 必要HIT調整値
  }
  lastUpdated: string                 // 最終更新日時 (ISO string)
}

interface EnemySettingsMap {
  [enemyId: string]: EnemySettings    // 敵IDをキーとした設定マップ
}
```

### セーブデータ内の敵情報（個別セーブデータ用）
```typescript
interface SaveDataEnemyInfo {
  selectedEnemyId: string | null      // 選択中の敵ID（参照のみ）
  enemyType: 'preset' | 'custom' | null // データソースの識別
  lastSelectedAt?: string             // 最終選択日時 (ISO string)
}
```

### データフロー設計
```
1. 敵選択
   ↓
2. CalculatorStore.updateEnemy() でEnemyFormDataを更新
   ↓
3. SaveDataEnemyInfo（個別セーブデータ）に敵IDとtypeを保存
   ↓
4. 敵設定変更（レベル、確定クリティカル、必要HIT等）
   ↓
5. EnemySettingsStore（Zustand）に敵ID別で設定保存
   ↓
6. セーブデータ切り替え時
   ↓
7. SaveDataEnemyInfoから敵IDを取得 + EnemySettingsStoreから設定を取得
   ↓
8. useEnemyData()でEnemyFormDataとして統合して提供
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
- 設定が他の敵に影響する（memoization問題）
- 敵切り替え時の設定リセット不具合

### 新しい設計の利点
1. **敵別設定の分離管理**:
   - 各敵が独立した設定を持つ
   - 敵切り替え時に他の敵の設定に影響しない
   - 設定の混在やリークを防止

2. **Zustandによる状態管理**:
   - リアルタイムな状態更新とReact連携
   - LocalStorageとの自動同期
   - 適切なmemoizationとdependency管理

3. **設定の独立性**:
   - 敵Aで確定クリティカル100設定→敵Bは0（デフォルト）
   - セーブデータ間では敵選択のみ独立、設定は敵別で共有
   - 設定ロスト防止と適切な初期化

### 実装上の考慮点
- 敵別設定はZustandストアとLocalStorageで二重管理
- セーブデータ削除時も敵設定は保持
- デフォルト値の適切な提供（確定クリティカル: 0、レイドボスレベル: 288）

### Zustandストア実装詳細
```typescript
// src/stores/enemySettingsStore.ts
export const useEnemySettingsStore = create<EnemySettingsStore>()(
  devtools(
    (set, get) => ({
      settingsMap: {},
      
      // 敵設定取得（デフォルト値自動提供）
      getEnemySettings: (enemyId: string) => {
        const { settingsMap } = get()
        return settingsMap[enemyId] || getDefaultEnemySettings(enemyId)
      },
      
      // 敵設定更新（LocalStorageと同期）
      updateEnemySettings: (enemyId: string, updates) => {
        set((state) => {
          const currentSettings = state.settingsMap[enemyId] || getDefaultEnemySettings(enemyId)
          const updatedSettings: EnemySettings = {
            ...currentSettings,
            ...updates,
            enemyId,
            lastUpdated: new Date().toISOString(),
          }
          const newSettingsMap = {
            ...state.settingsMap,
            [enemyId]: updatedSettings,
          }
          // LocalStorageに保存
          try {
            localStorage.setItem('enemy_settings_per_enemy', JSON.stringify(newSettingsMap))
          } catch (error) {
            console.error('Failed to save enemy settings to localStorage:', error)
          }
          return { settingsMap: newSettingsMap }
        })
      },
      
      // ボス難易度設定
      setBossDifficulty: (enemyId, difficulty) => {
        get().updateEnemySettings(enemyId, { difficulty })
      },
      
      // レイドボスレベル設定
      setRaidBossLevel: (enemyId, level) => {
        get().updateEnemySettings(enemyId, { raidBossLevel: level })
      },
      
      // 手動調整値設定
      setManualOverrides: (enemyId, overrides) => {
        const currentSettings = get().getEnemySettings(enemyId)
        const newOverrides = {
          ...currentSettings.manualOverrides,
          ...overrides,
        }
        get().updateEnemySettings(enemyId, { manualOverrides: newOverrides })
      },
      
      // その他のメソッド
      resetEnemySettings: (enemyId) => { /* 実装済み */ },
      loadFromLocalStorage: () => { /* 実装済み */ },
      saveToLocalStorage: () => { /* 実装済み */ }
    }),
    { name: 'enemy-settings-store' }
  )
)
```

## EnemyFormDataとuseEnemyDataの統合

EnemyFormコンポーネントでは、セーブデータの敵選択情報とZustandの敵設定を統合した`EnemyFormData`を使用します：

```typescript
// src/hooks/useEnemyData.ts
export function useEnemyData() {
  const saveDataEnemyInfo = useCalculatorStore((state) => state.data.enemy)
  const getEnemySettings = useEnemySettingsStore((state) => state.getEnemySettings)

  const enemyFormData = useMemo((): EnemyFormData => {
    // 選択された敵がない場合のデフォルト値
    if (!saveDataEnemyInfo.selectedEnemyId) {
      return {
        selectedId: null,
        type: null,
        difficulty: 'normal',
        raidBossLevel: 288,
        manualOverrides: {
          resistCritical: 0,
          requiredHIT: 0,
        },
      }
    }

    // 選択された敵の設定を取得
    const enemySettings = getEnemySettings(saveDataEnemyInfo.selectedEnemyId)

    return {
      selectedId: saveDataEnemyInfo.selectedEnemyId,
      type: saveDataEnemyInfo.enemyType,
      difficulty: enemySettings.difficulty,
      raidBossLevel: enemySettings.raidBossLevel,
      manualOverrides: enemySettings.manualOverrides,
    }
  }, [saveDataEnemyInfo, getEnemySettings])

  return { enemyFormData }
}
```

## ローカルストレージ保存形式

**敵設定データ（enemy_settings_per_enemy）**:
```json
{
  "[敵ID]": {
    "enemyId": "敵ID",
    "difficulty": "normal" | "hard" | "lunatic" | "ultimate",
    "raidBossLevel": 288,
    "manualOverrides": {
      "resistCritical": 85,
      "requiredHIT": 120
    },
    "lastUpdated": "2025-01-15T10:30:00.000Z"
  }
}
```