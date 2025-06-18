# Zustand移行計画書

## 1. 概要

トーラムオンライン ダメージ計算ツールの状態管理をReact Hook Form + useStateからZustandに移行する計画です。

## 2. 移行理由

### 2.1 現在の問題点
- **Props Drilling**: 6つのフォームに個別のonChangeハンドラーが必要
- **初期化の複雑さ**: 各フォームで独自の初期化管理が必要（セーブデータ切り替えバグの原因）
- **状態同期の難しさ**: フォーム間の依存関係管理が困難
- **スケーラビリティ**: 計算システム・プレビュー機能追加時の複雑化

### 2.2 Zustand選択理由
- **軽量**: Redux比較でバンドルサイズが小さい
- **シンプル**: ボイラープレートが少ない
- **TypeScript親和性**: 優秀な型推論
- **React Hook Form互換性**: 既存のフォームロジックを活用可能
- **学習コスト**: 低い

## 3. 移行スケジュール

### Phase 1: 基盤構築（2-3日）
- [ ] Zustandパッケージ導入
- [ ] ストア構造設計・実装
- [ ] 基本的なアクション定義
- [ ] テスト環境での動作確認

### Phase 2: セーブデータ管理移行（2-3日）
- [ ] SaveDataManagerのストア統合
- [ ] セーブデータ切り替えロジック移行
- [ ] 未保存変更検知の改善
- [ ] セーブデータ管理UIの簡素化

### Phase 3: フォーム状態移行（3-4日）
- [ ] BaseStatsFormの移行
- [ ] WeaponFormの移行
- [ ] FoodFormの移行
- [ ] 残りフォーム（Crystal, Equipment, Enemy）の移行

### Phase 4: 統合・最適化（1-2日）
- [ ] 全体動作テスト
- [ ] パフォーマンス最適化
- [ ] 旧コード削除・クリーンアップ
- [ ] ドキュメント更新

**総工数**: 8-12日

## 4. ストア設計

### 4.1 メインストア構造
```typescript
interface CalculatorStore {
  // ===== データ状態 =====
  data: CalculatorData
  
  // ===== UI状態 =====
  hasUnsavedChanges: boolean
  isLoading: boolean
  showSaveManager: boolean
  isInitialized: boolean
  
  // ===== 将来の計算結果 =====
  calculationResult: DamageCalculationResult | null
  isCalculating: boolean
  
  // ===== 基本アクション =====
  updateData: (updates: Partial<CalculatorData>) => void
  setData: (data: CalculatorData) => void
  resetUnsavedChanges: () => void
  
  // ===== セーブデータ管理 =====
  loadSaveData: (data: CalculatorData) => Promise<void>
  saveCurrentData: () => Promise<void>
  switchSaveData: (saveId: string) => Promise<void>
  
  // ===== 個別フォーム更新 =====
  updateBaseStats: (stats: BaseStats) => void
  updateMainWeapon: (weapon: MainWeapon) => void
  updateSubWeapon: (weapon: SubWeapon) => void
  updateCrystals: (crystals: CrystalSlots) => void
  updateEquipment: (equipment: EquipmentSlots) => void
  updateFood: (food: FoodFormData) => void
  updateEnemy: (enemy: EnemyFormData) => void
  
  // ===== 将来の計算機能 =====
  calculateDamage: () => Promise<void>
  updateCalculationSettings: (settings: CalculationSettings) => void
}
```

### 4.2 ストア分割案
```typescript
// メインストア（データ管理）
const useCalculatorStore = create<CalculatorStore>(...)

// UIストア（UI状態管理）
const useUIStore = create<UIStore>(...)

// セーブデータストア（セーブデータ管理）
const useSaveDataStore = create<SaveDataStore>(...)
```

## 5. 移行戦略

### 5.1 React Hook Form統合パターン
```typescript
// Before（現在）
function BaseStatsForm({ stats, onChange }) {
  const { register, watch } = useForm({ values: stats })
  
  useEffect(() => {
    const subscription = watch((value) => {
      onChange(value) // Props drilling
    })
    return subscription.unsubscribe()
  }, [watch, onChange])
}

// After（Zustand）
function BaseStatsForm() {
  const { data, updateBaseStats } = useCalculatorStore()
  const { register, watch } = useForm({ 
    values: data.baseStats,
    mode: 'onChange'
  })
  
  useEffect(() => {
    const subscription = watch((value, { type }) => {
      if (type === 'change') {
        updateBaseStats(value) // 直接ストア更新
      }
    })
    return subscription.unsubscribe()
  }, [watch, updateBaseStats])
}
```

### 5.2 セーブデータ管理統合
```typescript
const useCalculatorStore = create<CalculatorStore>((set, get) => ({
  // 状態
  data: createInitialCalculatorData(),
  hasUnsavedChanges: false,
  isLoading: false,
  
  // セーブデータ読み込み（初期化問題の根本解決）
  loadSaveData: async (saveData) => {
    set({ isLoading: true, hasUnsavedChanges: false })
    
    // フレーム待機で確実な初期化
    await new Promise(resolve => setTimeout(resolve, 0))
    
    set({
      data: saveData,
      hasUnsavedChanges: false,
      isLoading: false
    })
  },
  
  // 統一された更新メソッド
  updateData: (updates) => set((state) => ({
    data: { ...state.data, ...updates },
    hasUnsavedChanges: true
  }))
}))
```

## 6. 技術仕様

### 6.1 パッケージ導入
```bash
npm install zustand
npm install --save-dev @types/zustand
```

### 6.2 ディレクトリ構造
```
src/
├── stores/
│   ├── calculatorStore.ts      # メインストア
│   ├── saveDataStore.ts        # セーブデータ管理
│   ├── uiStore.ts             # UI状態管理
│   └── index.ts               # ストアエクスポート
├── hooks/
│   ├── useCalculatorData.ts   # 計算データ用カスタムフック
│   └── useSaveDataManager.ts  # セーブデータ管理用フック
└── types/
    └── stores.ts              # ストア型定義
```

### 6.3 TypeScript型定義
```typescript
// src/types/stores.ts
export interface CalculatorStore {
  // データ
  data: CalculatorData
  hasUnsavedChanges: boolean
  isLoading: boolean
  
  // アクション
  updateData: (updates: Partial<CalculatorData>) => void
  loadSaveData: (data: CalculatorData) => Promise<void>
  // ... 他のアクション
}

export interface SaveDataStore {
  saveDataList: SaveData[]
  currentSaveId: string
  isLoading: boolean
  
  loadSaveDataList: () => Promise<void>
  switchSaveData: (saveId: string) => Promise<void>
  // ... 他のアクション
}
```

## 7. 移行時の注意点

### 7.1 既存機能の保持
- [ ] React Hook Formのバリデーション機能維持
- [ ] フォームのUI/UX変更なし
- [ ] セーブデータ形式の互換性維持
- [ ] 既存のZodスキーマ活用

### 7.2 パフォーマンス考慮
- [ ] 必要な場所でのselectors使用
- [ ] 不要な再レンダリング防止
- [ ] メモ化の適切な使用

### 7.3 テスト戦略
- [ ] ストア単体テスト
- [ ] フォーム統合テスト
- [ ] セーブデータ切り替えテスト
- [ ] エンドツーエンドテスト

## 8. 移行後の利点

### 8.1 開発効率向上
- **Props Drilling解消**: フォーム間の状態共有が簡単
- **バグ減少**: 初期化問題の根本解決
- **コード量削減**: 個別onChangeハンドラー不要

### 8.2 機能拡張の容易さ
- **計算システム**: リアルタイム計算の実装が簡単
- **プレビュー機能**: 状態監視によるリアルタイムプレビュー
- **履歴機能**: Undo/Redo機能の実装が可能

### 8.3 保守性向上
- **一元管理**: 状態管理ロジックの集約
- **型安全性**: TypeScriptによる型チェック強化
- **デバッグ性**: Zustand DevToolsによるデバッグ支援

## 9. リスク管理

### 9.1 技術的リスク
| リスク | 影響度 | 対策 |
|--------|---------|------|
| Zustand学習コスト | 低 | 事前学習・ドキュメント整備 |
| React Hook Form互換性 | 中 | プロトタイプでの検証 |
| パフォーマンス劣化 | 低 | ベンチマーク・最適化 |

### 9.2 スケジュール遅延対策
- **段階的移行**: フェーズごとの動作確認
- **ロールバック計画**: 各フェーズでのバックアップ
- **並行開発**: 新機能開発への影響最小化

## 10. 成功指標

### 10.1 技術指標
- [ ] セーブデータ切り替えバグの完全解決
- [ ] Props Drillingの完全解消（0個のonChangeプロップス）
- [ ] コード行数20%削減
- [ ] TypeScriptエラー0件

### 10.2 UX指標
- [ ] セーブデータ切り替え時間50%短縮
- [ ] フォーム応答性向上
- [ ] エラー発生率90%削減

## 11. 今後の発展

### 11.1 Phase 5: 計算システム統合（移行完了後）
```typescript
const useCalculatorStore = create((set, get) => ({
  // リアルタイム計算
  updateData: (updates) => {
    set((state) => ({ data: { ...state.data, ...updates } }))
    // 自動計算トリガー
    get().calculateDamage()
  },
  
  calculateDamage: async () => {
    const { data } = get()
    set({ isCalculating: true })
    const result = await performDamageCalculation(data)
    set({ calculationResult: result, isCalculating: false })
  }
}))
```

### 11.2 Phase 6: プレビュー機能
- リアルタイムダメージプレビュー
- 装備変更時の即座反映
- 複数パターンの比較表示

---

**作成日**: 2025-01-17  
**対象システム**: トーラムオンライン ダメージ計算ツール  
**移行対象**: React Hook Form + useState → Zustand  
**予想工数**: 8-12日  
**開始予定**: 計算システム実装前  