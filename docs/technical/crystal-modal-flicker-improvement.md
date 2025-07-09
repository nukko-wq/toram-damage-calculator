# クリスタ選択モーダルのチラツキ改善計画書

## 1. 現在の問題点

### 1.1 問題の詳細
- クリスタ選択モーダルを開くと、前回表示時のクリスタルが一瞬表示されてしまう
- ユーザーエクスペリエンスに悪影響を与える視覚的なノイズとなっている

### 1.2 問題の発生頻度
- モーダルを開くたびに発生
- 特に前回とは異なるスロットのモーダルを開いた際に顕著

## 2. 原因分析

### 2.1 コードレベルの原因

**CrystalSelectionModal.tsx:48-64 のuseEffect**
```typescript
useEffect(() => {
    if (!isOpen) return

    // 許可されたタイプのクリスタ + ノーマルクリスタを取得
    const allAllowedCrystals = [
        ...allowedTypes.flatMap((type) => getCrystalsByType(type)),
        ...getCrystalsByType('normal'),
    ]

    // 重複を除去
    const uniqueCrystals = allAllowedCrystals.filter(
        (crystal, index, self) =>
            index === self.findIndex((c) => c.id === crystal.id),
    )

    setAvailableCrystals(uniqueCrystals)
}, [isOpen, allowedTypes])
```

**CrystalSelectionModal.tsx:30**
```typescript
const [availableCrystals, setAvailableCrystals] = useState<Crystal[]>([])
```

### 2.2 発生メカニズム

1. **初期状態**: `availableCrystals` が空配列 `[]` で初期化される
2. **モーダルオープン**: `isOpen` が `true` になる
3. **レンダリング**: 空の `availableCrystals` で最初のレンダリングが発生
4. **useEffect実行**: `isOpen` 変更により useEffect が実行される
5. **データ取得**: `getCrystalsByType` でクリスタルデータを取得
6. **状態更新**: `setAvailableCrystals` でデータを更新
7. **再レンダリング**: 新しいデータで再レンダリング

### 2.3 チラツキの発生箇所

**CrystalSelectionModal.tsx:257-274**
```typescript
{filteredCrystals.length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCrystals.map((crystal) => (
            <CrystalCard
                key={crystal.id}
                crystal={crystal}
                isSelected={selectedCrystalId === crystal.id}
                onClick={() => handleSelect(crystal.id)}
                showDamageDifference={isOpen && !!slotInfo}
                slotInfo={slotInfo}
            />
        ))}
    </div>
) : (
    <div className="text-center text-gray-500 py-8">
        該当するクリスタがありません
    </div>
)}
```

## 3. 根本原因

### 3.1 状態管理の問題
- `availableCrystals` の初期値が空配列のため、最初のレンダリングで「該当するクリスタがありません」が表示される
- その後、useEffectでデータが取得されて再レンダリングが発生する

### 3.2 データ取得タイミングの問題
- モーダルが開いてからデータを取得するため、レンダリングと非同期処理の間にタイムラグが発生
- React の描画サイクルで、状態更新前と更新後で異なるUIが表示される

### 3.3 フィルタリングの問題
- `activeFilter` の初期値が `'all'` で、データ取得前にフィルタリングが実行される
- 前回の `allowedTypes` が残っている可能性がある

## 4. 改善提案

### 4.1 根本的な解決策（推奨アプローチ）

#### 4.1.1 メモ化による即座のデータ取得
```typescript
// useState から useMemo に変更して同期的にデータを取得
const availableCrystals = useMemo(() => {
    if (!isOpen) return []
    
    const allAllowedCrystals = [
        ...allowedTypes.flatMap((type) => getCrystalsByType(type)),
        ...getCrystalsByType('normal'),
    ]
    
    return allAllowedCrystals.filter(
        (crystal, index, self) =>
            index === self.findIndex((c) => c.id === crystal.id),
    )
}, [isOpen, allowedTypes])
```

#### 4.1.2 フィルター状態の初期化改善
```typescript
// モーダルが開かれるたびにフィルターを初期化
useEffect(() => {
    if (isOpen) {
        setActiveFilter('all')
    }
}, [isOpen])
```

#### 4.1.3 データベースアクセス最適化
```typescript
// crystalDatabase.ts の getCrystalsByType 関数をメモ化
const crystalsByTypeCache = new Map<CrystalType, Crystal[]>()

export const getCrystalsByType = (type: CrystalType): Crystal[] => {
    if (crystalsByTypeCache.has(type)) {
        return crystalsByTypeCache.get(type)!
    }
    
    const crystals = getAllCrystals().filter((crystal) => crystal.type === type)
    crystalsByTypeCache.set(type, crystals)
    return crystals
}
```

### 4.2 さらなる最適化

#### 4.2.1 重複除去処理の最適化
```typescript
// Set を使用してより効率的な重複除去
const availableCrystals = useMemo(() => {
    if (!isOpen) return []
    
    const crystalSet = new Set<Crystal>()
    
    // 許可されたタイプのクリスタルを追加
    allowedTypes.forEach(type => {
        getCrystalsByType(type).forEach(crystal => crystalSet.add(crystal))
    })
    
    // ノーマルクリスタルを追加
    getCrystalsByType('normal').forEach(crystal => crystalSet.add(crystal))
    
    return Array.from(crystalSet)
}, [isOpen, allowedTypes])
```

#### 4.2.2 事前計算による高速化
```typescript
// CrystalForm.tsx でモーダルを開く前にデータを事前計算
const openModal = useCallback((slotKey: keyof CrystalSlots, allowedTypes: CrystalType[], title: string) => {
    // モーダルを開く前にデータを事前計算（バックグラウンドで実行）
    const precomputedCrystals = [
        ...allowedTypes.flatMap((type) => getCrystalsByType(type)),
        ...getCrystalsByType('normal'),
    ]
    
    setModalState({
        isOpen: true,
        slotKey,
        allowedTypes,
        title,
        precomputedCrystals, // 事前計算されたデータを渡す
    })
}, [])
```

### 4.3 長期的な改善策

#### 4.3.1 グローバル状態管理の活用
- Zustand ストアにクリスタルデータをキャッシュ
- アプリケーション起動時に全データを事前ロード

#### 4.3.2 仮想化によるパフォーマンス向上
- 大量のクリスタルカードを効率的に表示
- react-window などの仮想化ライブラリを検討

## 5. 実装優先度

### 5.1 優先度 High（即座に実装）
1. **useMemo による同期的なデータ取得** - 根本的な解決
2. **フィルター状態の初期化改善** - チラツキの完全な解決

### 5.2 優先度 Medium（次期実装）
1. **データベースアクセス最適化** - キャッシュによる高速化
2. **メモ化による最適化** - パフォーマンス向上

### 5.3 優先度 Low（将来的な改善）
1. **グローバル状態管理の活用** - アーキテクチャ改善
2. **重複除去処理の最適化** - Set を使用した効率化

## 6. 実装手順

### 6.1 Phase 1: useMemo による同期的なデータ取得
1. useState から useMemo への変更
2. 同期的なデータ取得によるチラツキ防止
3. useEffect の削除

### 6.2 Phase 2: フィルター状態の初期化改善
1. モーダルが開かれるたびにフィルターを初期化
2. 前回の状態が残らないようにする

### 6.3 Phase 3: データベースアクセス最適化
1. getCrystalsByType 関数のメモ化
2. キャッシュによる高速化

## 7. 実装結果

### 7.1 完了した改善
- ✅ **useMemo による同期的なデータ取得** - CrystalSelectionModal.tsx で実装
- ✅ **フィルター状態の初期化改善** - モーダルオープン時の自動初期化
- ✅ **データベースアクセス最適化** - crystalDatabase.ts でキャッシュ機能追加

### 7.2 期待される効果
- モーダル表示時のチラツキが解消される
- より滑らかなモーダル表示を実現
- データ取得処理の最適化

### 7.3 パフォーマンス
- 不要な再レンダリングを削減
- キャッシュによる高速なデータアクセス
- 同期的なデータ取得によるレンダリング最適化

### 7.4 保守性
- 状態管理が明確になる
- デバッグしやすいコードになる
- ローディング状態が不要になり、コードが簡潔になる

## 8. 技術的な変更点

### 8.1 CrystalSelectionModal.tsx
```typescript
// 変更前: useState + useEffect
const [availableCrystals, setAvailableCrystals] = useState<Crystal[]>([])
useEffect(() => {
  if (!isOpen) return
  // 非同期的なデータ取得
}, [isOpen, allowedTypes])

// 変更後: useMemo による同期的なデータ取得
const availableCrystals = useMemo(() => {
  if (!isOpen) return []
  // 同期的なデータ取得
}, [isOpen, allowedTypes])
```

### 8.2 crystalDatabase.ts
```typescript
// キャッシュ機能の追加
const crystalsByTypeCache = new Map<CrystalType, Crystal[]>()

export const getCrystalsByType = (type: CrystalType): Crystal[] => {
  if (crystalsByTypeCache.has(type)) {
    const cached = crystalsByTypeCache.get(type)
    return cached || []
  }
  
  const crystals = getAllCrystals().filter((crystal) => crystal.type === type)
  crystalsByTypeCache.set(type, crystals)
  return crystals
}
```

## 9. 新たなパフォーマンス問題の発見

### 9.1 問題の概要
チラツキ問題は解決されましたが、新たにモーダル表示時の遅延問題が発生しています。調査の結果、**ダメージ差分計算**が主要なボトルネックであることが判明しました。

### 9.2 パフォーマンス問題の詳細分析

#### **重大なボトルネック: DamageDifferenceDisplayCorrect**

**問題の規模:**
- モーダル内で最大20個のクリスタが同時表示
- 各クリスタでダメージ差分計算が実行
- 1つの差分計算で2回の完全な計算エンジン実行

**具体的な重い処理:**
1. **calculateResults関数の繰り返し実行**
   - 基準状態とシミュレーション後の両方で実行
   - 70+のプロパティを持つ複雑な計算処理
   - 基本ステータス + 装備 + クリスタ + 料理 + バフスキルの統合計算

2. **calculateDamageWithService（571行の大規模関数）**
   - 攻撃スキル計算システムの完全実行
   - 複数の条件分岐とループ処理
   - 敵情報取得と難易度調整計算

3. **データのディープコピー**
   - `JSON.parse(JSON.stringify(currentData))`による大きなオブジェクトの完全複製
   - CalculatorDataオブジェクトの複数回コピー

4. **メモ化の不適切な実装**
   - 8個の依存関係を持つuseMemo
   - 頻繁に変更される値（debug, disabled）も依存対象
   - 実質的にほぼ毎回再計算が発生

**計算量の試算:**
```
最大20個のクリスタ × 2回の計算エンジン実行 × 複雑な計算処理 = 膨大な処理時間
```

#### **追加のパフォーマンス負荷**

1. **強制コンソールログ**
   - 各コンポーネントで常時実行される詳細ログ
   - 150行以上のデバッグ情報出力
   - オブジェクトの深い階層の出力

2. **同期処理によるUIブロック**
   - すべての計算が同期的に実行
   - ユーザーインターフェースの応答性低下

### 9.3 パフォーマンス改善計画

#### **Phase 1: 緊急対応（即座に実装）**

1. **ダメージ差分計算の遅延読み込み**
   ```typescript
   // 遅延表示によるパフォーマンス改善
   const [showDifference, setShowDifference] = useState(false)
   
   useEffect(() => {
     const timer = setTimeout(() => setShowDifference(true), 100)
     return () => clearTimeout(timer)
   }, [])
   ```

2. **計算結果のキャッシュ化**
   ```typescript
   // LRUキャッシュによる計算結果の保存
   const calculationCache = new Map()
   const cacheKey = `${item.id}-${JSON.stringify(slotInfo)}`
   ```

3. **コンソールログの条件分岐**
   ```typescript
   // 開発環境でのみログ出力
   if (process.env.NODE_ENV === 'development') {
     console.log(...)
   }
   ```

#### **Phase 2: 中期対応（1-2週間後）**

1. **非同期計算の導入**
   ```typescript
   // Web WorkerまたはsetTimeoutによる非同期処理
   const calculateAsync = useCallback((data) => {
     return new Promise((resolve) => {
       setTimeout(() => {
         const result = calculateResults(data)
         resolve(result)
       }, 0)
     })
   }, [])
   ```

2. **仮想化による表示最適化**
   - react-window導入
   - 画面内のアイテムのみレンダリング

3. **メモ化の最適化**
   ```typescript
   // 依存配列の最小化
   const memoizedResult = useMemo(() => {
     return calculateDifference(item, slotInfo)
   }, [item.id, slotInfo.type, slotInfo.slot]) // 最小限の依存関係
   ```

#### **Phase 3: 長期対応（1ヶ月後）**

1. **計算エンジンのアーキテクチャ改善**
   - 増分計算アルゴリズムの導入
   - 変更されたプロパティのみ再計算

2. **Web Worker完全移行**
   - 計算処理の完全バックグラウンド化
   - メインスレッドの解放

3. **計算結果の永続化**
   - IndexedDBによる長期キャッシュ
   - セッション間での計算結果共有

### 9.4 期待される効果

#### **Phase 1実装後:**
- モーダル表示時間: 50-70%短縮
- 初期表示の改善

#### **Phase 2実装後:**
- レスポンス時間: 80-90%改善
- スムーズなスクロールとインタラクション

#### **Phase 3実装後:**
- ほぼ即座のモーダル表示
- 大量データでも高速動作

### 9.5 実装優先度

| 優先度 | 施策 | 期待効果 | 実装難易度 |
|--------|------|----------|------------|
| **緊急** | ダメージ差分の遅延読み込み | 70%改善 | 低 |
| **緊急** | コンソールログの最適化 | 20%改善 | 低 |
| **高** | 計算結果キャッシュ | 80%改善 | 中 |
| **高** | 非同期計算導入 | 90%改善 | 中 |
| **中** | 仮想化導入 | 50%改善 | 高 |
| **低** | Web Worker完全移行 | 95%改善 | 高 |

## 10. 結論

チラツキ問題の解決により、新たなパフォーマンス問題が顕在化しました。**ダメージ差分計算**が主要なボトルネックとなっており、特に複数のクリスタが同時表示される場合に深刻な遅延を引き起こしています。

段階的な改善アプローチにより、短期的には遅延読み込みとキャッシュ化で大幅な改善を図り、長期的には計算アーキテクチャの根本的な見直しを行うことで、高速で快適なユーザーエクスペリエンスを実現します。