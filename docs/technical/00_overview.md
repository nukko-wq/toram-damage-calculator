# 基本技術仕様

## 概要
本仕様書は、トーラムオンライン ダメージ計算ツールの技術的な実装詳細とデータベース構造を定義します。

## 技術スタック
- **フロントエンド**: Next.js 15 + React 19
- **言語**: TypeScript (strict mode)
- **スタイリング**: Tailwind CSS v4
- **状態管理**: Zustand (軽量で型安全)
- **フォームバリデーション**: Zod + React Hook Form
- **データ管理**: JSON + LocalStorage
- **コードフォーマット**: Biome

## プロジェクト構造

```
src/
├── app/                    # Next.js App Router
├── components/             # Reactコンポーネント（機能別ディレクトリ構造）
│   ├── base-stats/         # 基本ステータスフォーム
│   ├── weapon/             # 武器フォーム
│   ├── crystal/            # クリスタル関連（フォーム、カード、モーダル）
│   ├── equipment/          # 装備関連（フォーム、カード、モーダル、エディター）
│   ├── enemy/              # 敵関連（フォーム、カード、モーダル）
│   ├── food/               # 料理フォーム
│   ├── buff-skill/         # バフスキル関連（フォーム、カード、パラメータ）
│   ├── buff-item/          # バフアイテム関連（フォーム、カード、モーダル）
│   ├── save-data/          # セーブデータ管理関連
│   ├── ui/                 # 汎用UIコンポーネント
│   ├── summary/            # 結果表示・サマリー
│   └── __tests__/          # テスト用コンポーネント
├── stores/                 # Zustand状態管理ストア
├── types/                  # TypeScript型定義
├── schemas/                # Zodバリデーションスキーマ
├── data/                   # 静的データ（JSON）
├── utils/                  # ユーティリティ関数
└── hooks/                  # カスタムフック（今後必要に応じて）
```

## 状態管理アーキテクチャ

### Zustand ストア構成

#### ストア分割戦略
```
src/stores/
├── index.ts                # 全ストアのエクスポート
├── calculatorStore.ts      # 計算機データ管理
├── saveDataStore.ts        # セーブデータ管理  
└── uiStore.ts             # UI状態管理
```

#### CalculatorStore
**責任**: 計算機の全データを一元管理
```typescript
interface CalculatorStore {
  data: CalculatorData
  hasUnsavedChanges: boolean
  isInitialized: boolean
  isLoading: boolean
  
  // 基本操作
  initialize: () => Promise<void>
  updateData: (data: CalculatorData) => void
  
  // 個別フォーム更新
  updateBaseStats: (stats: BaseStats) => void
  updateMainWeapon: (weapon: MainWeapon) => void
  updateSubWeapon: (weapon: SubWeapon) => void
  updateCrystals: (crystals: CrystalSlots) => void
  updateEquipment: (equipment: EquipmentSlots) => void
  updateFood: (food: FoodFormData) => void
  updateEnemy: (enemy: EnemyFormData) => void
  updateBuffSkills: (buffSkills: BuffSkillFormData) => void
  updateBuffItems: (buffItems: BuffItemFormData) => void
  
  // セーブデータ連携
  loadSaveData: (data: CalculatorData) => Promise<void>
  saveCurrentData: () => Promise<void>
}
```

#### SaveDataStore
**責任**: セーブデータの管理とLocalStorage操作
```typescript
interface SaveDataStore {
  saveDataList: SaveDataItem[]        // ユーザー作成データのみ
  currentSaveId: string | null
  
  loadSaveDataList: () => Promise<void>                    // ユーザーデータのみロード
  switchSaveData: (saveId: string) => Promise<void>
  createSaveData: (name: string) => Promise<void>          // 作成後自動切り替え
  deleteSaveData: (saveId: string) => Promise<void>        // 全削除時メインデータ切り替え
  switchToMainData: () => Promise<void>                    // メインデータ切り替え専用
}
```

**新しい動作仕様**:
- `saveDataList`: デフォルトデータ（メインデータ）は含まない
- `createSaveData`: 作成後に自動的に作成したデータに切り替え
- `deleteSaveData`: 全ユーザーデータ削除時は自動的にメインデータに切り替え
- `switchToMainData`: 明示的なメインデータ切り替え機能

#### UIStore
**責任**: UI状態の管理
```typescript
interface UIStore {
  showSaveManager: boolean
  setShowSaveManager: (value: boolean) => void
}
```

### React Hook Form統合

#### 統合パターン
```typescript
// Zustandデータとの双方向バインディング
const storeData = useCalculatorStore(state => state.data.baseStats)
const updateStore = useCalculatorStore(state => state.updateBaseStats)

const form = useForm<FormData>({
  values: storeData, // Zustandからの自動同期
  mode: 'onChange',
})

// 変更をZustandに反映
useEffect(() => {
  const subscription = form.watch((value, { name, type }) => {
    if (isInitialized && name && value && type === 'change') {
      updateStore(value as FormData)
    }
  })
  return () => subscription.unsubscribe()
}, [form.watch, isInitialized, updateStore])
```

#### 初期化管理
セーブデータ切り替え時のちらつき防止:
```typescript
const [isInitialized, setIsInitialized] = useState(false)

useEffect(() => {
  setIsInitialized(false)
  const timer = setTimeout(() => setIsInitialized(true), 30)
  return () => clearTimeout(timer)
}, [storeData])
```

### パフォーマンス最適化

- **セレクター活用**: 必要なデータのみ取得
- **細かい粒度**: 個別フィールドレベルでの更新
- **軽量初期化**: `values`プロパティによる自動同期
- **DevTools統合**: デバッグとモニタリング