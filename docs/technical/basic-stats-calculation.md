# 基本ステータス計算システム

## 概要
トーラムオンラインの正確な計算式に基づくHP・MP計算システムの技術仕様。

## 実装ファイル

### 計算ロジック
- **ファイル**: `src/utils/basicStatsCalculation.ts`
- **役割**: HP・MP計算の核となるロジック
- **特徴**: ゲーム内計算式の完全再現

### UI表示
- **ファイル**: `src/components/layout/StatusPreview.tsx`
- **役割**: 計算結果の可視化
- **特徴**: 段階的計算過程の表示

## 計算式仕様

### HP計算
```typescript
export function calculateHP(stats: BaseStats, bonuses: AllBonuses = {}): HPCalculationSteps {
  // 1. 補正後VIT計算
  const adjustedVIT = stats.VIT * (1 + vitPercent / 100) + vitFixed

  // 2. HP基本値計算
  const baseHP = Math.floor(93 + (adjustedVIT + 22.41) * stats.level / 3)

  // 3. HP%補正適用
  const hpAfterPercent = Math.floor(baseHP * (1 + hpPercent / 100))

  // 4. HP固定値加算
  const finalHP = hpAfterPercent + hpFixed
}
```

### MP計算
```typescript
export function calculateMP(stats: BaseStats, bonuses: AllBonuses = {}): MPCalculationSteps {
  // 1. MP基本値計算
  const baseMP = Math.floor(stats.level + 99 + stats.TEC + stats.INT / 10)

  // 2. MP%補正適用
  const mpAfterPercent = Math.floor(baseMP * (1 + mpPercent / 100))

  // 3. MP固定値加算
  const finalMP = mpAfterPercent + mpFixed
}
```

## データ構造

### AllBonuses型
```typescript
interface AllBonuses {
  VIT?: number          // VIT固定値の合計
  VIT_Rate?: number     // VIT%の合計
  HP?: number           // HP固定値の合計
  HP_Rate?: number      // HP%の合計
  MP?: number           // MP固定値の合計
  MP_Rate?: number      // MP%の合計
}
```

### 計算ステップ型
```typescript
// HP計算の中間結果
interface HPCalculationSteps {
  adjustedVIT: number      // 補正後VIT
  baseHP: number          // HP基本値
  hpAfterPercent: number  // HP%適用後
  finalHP: number         // 最終HP
}

// MP計算の中間結果
interface MPCalculationSteps {
  baseMP: number          // MP基本値
  mpAfterPercent: number  // MP%適用後
  finalMP: number         // 最終MP
}
```

## 補正値集計システム

### 設計方針
- 装備・クリスタ・料理・バフアイテムの補正値を統一的に扱う
- 将来的な拡張性を考慮した設計
- 型安全性の確保

### 集計関数
```typescript
export function aggregateAllBonuses(
  equipment: Partial<AllBonuses> = {},
  crystals: Partial<AllBonuses> = {},
  foods: Partial<AllBonuses> = {},
  buffs: Partial<AllBonuses> = {}
): AllBonuses
```

## 表示システム

### StatusPreview統合
- 基本ステータス表示
- HP計算詳細表示
- MP計算詳細表示
- 武器情報表示
- 計算式の説明表示

### StatSection活用
- 統一されたUI表示
- 数値のフォーマット（3桁区切り）
- レスポンシブ対応

## パフォーマンス考慮事項

### 計算頻度
- フォーム入力変更時のリアルタイム計算
- 必要に応じた計算結果のメモ化
- 大量データでのパフォーマンス最適化

### メモリ使用量
- 中間計算結果の適切な管理
- 不要なオブジェクト生成の回避

## エラーハンドリング

### 入力値検証
- 数値範囲の妥当性チェック
- 必須パラメータの存在確認
- 異常値に対する適切な処理

### 計算エラー対応
- Math.floor()による安全な切り捨て処理
- NaN/Infinityの検出と処理
- フォールバック値の提供

## テスト戦略

### 単体テスト
- 各計算関数の独立テスト
- 境界値でのテスト
- 異常値入力でのテスト

### 統合テスト
- UI表示との統合テスト
- 実際のゲームデータでの検証
- パフォーマンステスト

## 今後の拡張計画

### Phase 1（完了）
- 基本HP・MP計算ロジックの実装
- StatusPreviewでの表示

### Phase 2（次期実装）
- 装備・クリスタ補正値の自動集計
- リアルタイム計算更新

### Phase 3（将来実装）
- 他のステータス計算（ATK、DEF等）
- 複数ビルド比較機能

## 関連ドキュメント
- [基本ステータス計算式](../calculations/basic-stats.md)
- [ヘッダーコンポーネント設計](../ui/header-component.md)
- [計算式概要](../calculations/overview.md)