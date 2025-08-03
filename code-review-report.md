# Toram Online ダメージ計算機 コードレビューレポート

## プロジェクト概要
- **プロジェクト名**: Toram Online ダメージ計算機
- **技術スタック**: Next.js 15 + React 19 + TypeScript + Zustand + React Hook Form + Zod + Tailwind CSS v4
- **開発ツール**: Biome (linting/formatting)
- **レビュー実施日**: 2025-08-03

## 総合評価

### 🟢 優良な点
1. **明確なアーキテクチャ設計**: 3ストア（calculator, saveData, ui）による状態管理の分離
2. **型安全性**: TypeScriptを活用した厳密な型定義
3. **データ検証**: Zod schemaによる包括的なバリデーション
4. **コード品質管理**: Biomeによる一貫したフォーマット・リント
5. **詳細なドキュメント**: 計算式や仕様の文書化

### 🟡 改善が必要な点
1. **TODOコメントの多さ**: 未実装機能の残存
2. **any型の使用**: 一部でany型が使用されている
3. **コンソールログの残存**: デバッグ用のconsole.logが多数残存
4. **複雑な計算ロジック**: 一部の関数が長大で理解困難

### 🔴 重要な問題
1. **セキュリティ**: LocalStorageの直接操作時の脆弱性
2. **パフォーマンス**: 大量のuseEffectによる再レンダリング問題

---

## 1. ロジックの正確性評価

### ✅ 良好な点
- **計算式の正確性**: 基本ステータス計算（HP/MP）でゲームの正確な計算式を実装
- **型安全な計算**: TypeScriptによる計算結果の型保証
- **バリデーション**: Zodによる入力値検証

```typescript
// 良い例: 正確なHP計算式の実装
export function calculateHP(stats: BaseStats, bonuses: AllBonuses = {}): HPCalculationSteps {
    const vitPercent = bonuses.VIT_Rate || 0
    const vitFixed = bonuses.VIT || 0
    const adjustedVIT = stats.VIT * (1 + vitPercent / 100) + vitFixed
    
    const baseHP = Math.floor(93 + ((adjustedVIT + 22.41) * stats.level) / 3)
    const hpPercent = bonuses.HP_Rate || 0
    const hpAfterPercent = Math.floor(baseHP * (1 + hpPercent / 100))
    const hpFixed = bonuses.HP || 0
    const finalHP = hpAfterPercent + hpFixed
    
    return { adjustedVIT, baseHP, hpAfterPercent, finalHP }
}
```

### ⚠️ 問題点
- **未実装の計算ロジック**: `calculationEngine.ts`で多数のTODOが残存
- **ダミー実装**: 一部計算が仮実装のまま

```typescript
// 問題例: 未実装の統合ロジック
export const combineEquipmentProperties = (equipment: any) => {
    // TODO: 装備品プロパティの統合ロジック
    return {}
}
```

**推奨改善策**:
1. TODOを段階的に実装し、完成までのロードマップを作成
2. 仮実装箇所には明確なコメントと期待される動作を記述

---

## 2. コードの複雑さと簡潔性

### ✅ 良好な点
- **適切な関数分割**: 計算ロジックが機能別に分離
- **再利用可能なユーティリティ**: データベースアクセス層の抽象化

### ⚠️ 改善が必要な箇所

#### 長大な関数
```typescript
// 問題例: 600行を超える長大な関数
export const calculateResults = (data: CalculatorData): CalculationResults => {
    // 300行以上の処理...
}
```

#### 複雑なuseEffect
```typescript
// 問題例: 複雑な依存関係を持つuseEffect
useEffect(() => {
    const subscription = watch((value, { name, type }) => {
        if (!isInitialized || !name || !value || type !== 'change') {
            return
        }
        // 複雑な処理...
    })
    return () => subscription.unsubscribe()
}, [watch, isInitialized, updateBaseStats])
```

**推奨改善策**:
1. 長大な関数を小さな関数に分割
2. カスタムフックで複雑なロジックを抽象化
3. Computed values（useMemo）で計算を最適化

---

## 3. 変数名・関数名の可読性

### ✅ 優秀な命名
```typescript
// 良い例: 明確で説明的な命名
calculateAdjustedStats()
getBuffSkillBonuses()
validateSaveDataReferences()
```

### ⚠️ 改善が必要な命名
```typescript
// 問題例: 略語の多用
const vitPercent = bonuses.VIT_Rate || 0
const aspdCalculation = calculateASPD(...)

// 推奨改善
const vitalityPercent = bonuses.VIT_Rate || 0
const attackSpeedCalculation = calculateASPD(...)
```

**推奨改善策**:
1. 略語の使用を最小限に抑制
2. ビジネス用語（ゲーム用語）には適切なコメントを追加

---

## 4. DRY原則と再利用性

### ✅ 良好な実装
- **統一されたデータアクセス層**: `*Database.ts`ファイルでプリセット・カスタムデータを統合
- **共通バリデーション**: Zodスキーマの再利用

### ⚠️ 重複コード

#### LocalStorage操作の重複
```typescript
// 問題例: 同様のLocalStorage操作が多数存在
localStorage.setItem(key, JSON.stringify(data))
const stored = localStorage.getItem(key)
```

#### 類似した計算パターンの重複
```typescript
// 問題例: 類似した統合処理
for (const [key, value] of Object.entries(bonuses)) {
    if (typeof value === 'number' && value !== 0) {
        result[key as keyof AllBonuses] = (result[key] || 0) + value
    }
}
```

**推奨改善策**:
1. StorageHelperクラスの活用推進
2. 汎用的な統合ヘルパー関数の作成

---

## 5. セキュリティ問題

### 🔴 重要な脆弱性

#### 1. LocalStorage直接操作
```typescript
// 問題例: JSONパースエラーのハンドリング不足
const stored = localStorage.getItem(key)
return stored ? JSON.parse(stored) : defaultValue // 脆弱性
```

#### 2. ユーザー入力の不適切な処理
```typescript
// 問題例: XSS攻撃の可能性
const userInput = data.customEquipment.name // サニタイズなし
```

### 推奨改善策
```typescript
// 推奨: 安全なJSONパース
function safeParseJSON<T>(jsonString: string, fallback: T): T {
    try {
        return JSON.parse(jsonString)
    } catch {
        return fallback
    }
}

// 推奨: 入力値のサニタイズ
function sanitizeUserInput(input: string): string {
    return input.replace(/[<>'"]/g, '')
}
```

### ✅ 良好な実装
- **Zodバリデーション**: 入力値の検証
- **型安全性**: TypeScriptによる型チェック

---

## 6. パフォーマンス問題

### 🔴 重要な問題

#### 1. 過度のuseEffect使用
```typescript
// 問題例: 頻繁な再計算を引き起こすuseEffect
useEffect(() => {
    // 計算処理
}, [data, bonuses, skills]) // 多数の依存関係
```

#### 2. 非効率な配列処理
```typescript
// 問題例: 毎回新しい配列を作成
const filteredItems = items.filter(...).map(...).sort(...)
```

### 推奨改善策
```typescript
// 推奨: useMemoで計算をメモ化
const calculationResult = useMemo(() => {
    return expensiveCalculation(data)
}, [data.criticalProperties])

// 推奨: useCallbackで関数をメモ化
const handleUpdate = useCallback((value) => {
    updateStore(value)
}, [updateStore])
```

### ✅ 良好な実装
- **Zustand**: 効率的な状態管理
- **React Hook Form**: 最適化されたフォーム処理

---

## 具体的な改善提案

### 1. 即座に対応すべき項目（高優先度）

1. **セキュリティ修正**
   ```typescript
   // src/utils/storage.ts に安全なJSONパース関数を追加
   export function safeJSONParse<T>(json: string, fallback: T): T {
       try {
           return JSON.parse(json)
       } catch (error) {
           console.warn('JSON parse failed:', error)
           return fallback
       }
   }
   ```

2. **console.logの削除**
   ```bash
   # 本番環境用のビルド設定でconsole.logを自動除去
   # next.config.ts に設定追加
   ```

3. **any型の置換**
   ```typescript
   // any型を具体的な型に置換
   const createDataUpdate = (
       set: StateCreator<CalculatorStore>,
       get: () => CalculatorStore
   ) => { ... }
   ```

### 2. 中期的な改善項目（中優先度）

1. **関数の分割**
   ```typescript
   // 長大な関数を小さな関数に分割
   export const calculateResults = (data: CalculatorData) => {
       const bonuses = collectAllBonuses(data)
       const adjustedStats = calculateAdjustedStats(data.baseStats, bonuses)
       const combatStats = calculateCombatStats(adjustedStats, bonuses)
       return combineResults(adjustedStats, combatStats)
   }
   ```

2. **カスタムフックの作成**
   ```typescript
   // 複雑なロジックをカスタムフックに抽出
   function useCalculationEngine(data: CalculatorData) {
       return useMemo(() => calculateResults(data), [data])
   }
   ```

### 3. 長期的な改善項目（低優先度）

1. **テストの追加**
   ```typescript
   // 重要な計算ロジックのユニットテスト
   describe('HP Calculation', () => {
       it('should calculate HP correctly', () => {
           const result = calculateHP(mockStats, mockBonuses)
           expect(result.finalHP).toBe(expectedValue)
       })
   })
   ```

2. **パフォーマンス監視**
   ```typescript
   // React DevTools Profilerでの継続的なパフォーマンス監視
   ```

---

## まとめ

### 総合評価: B+ (良好、一部改善が必要)

このプロジェクトは全体的によく設計されており、TypeScriptの活用、明確なアーキテクチャ、詳細なドキュメントなど多くの優れた点があります。

### 重要な改善点
1. **セキュリティ**: LocalStorage操作の安全性向上
2. **パフォーマンス**: useEffectの最適化
3. **保守性**: 長大な関数の分割
4. **品質**: console.logとany型の除去

### 推奨アクションプラン
1. **第1週**: セキュリティ修正とconsole.log除去
2. **第2-3週**: any型の置換と関数分割
3. **第4週**: パフォーマンス最適化
4. **継続的**: テストの段階的追加

このレビューに基づいて段階的な改善を行うことで、より安全で保守性の高いコードベースを構築できます。