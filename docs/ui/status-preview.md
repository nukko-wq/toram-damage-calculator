# StatusPreview UI設計書

## 概要

ヘッダー下に配置されるステータス計算結果の詳細表示コンポーネント。98項目の詳細ステータス情報を4つのセクションに整理表示するUIコンポーネントの設計書。

**機能要件詳細**: [StatusPreview機能要件](../requirements/10_status-preview-requirements.md)を参照  
**計算仕様詳細**: [StatusPreview 計算仕様詳細](./status-preview-calculations.md)を参照  
**実装ガイド**: [StatusPreview 実装ガイド](./status-preview-implementation.md)を参照  
**データ仕様**: [StatusPreview データ仕様](./status-preview-data.md)を参照

## コンポーネント構成

### StatusPreview（メインコンポーネント）
- **ファイル**: `src/components/layout/StatusPreview.tsx`
- **目的**: 正確な計算式による詳細ステータス表示
- **位置**: ResultToggleBar経由で表示制御

### 依存コンポーネント
- **StatSection**: 統一されたステータス表示セクション
- **StatItem**: 個別ステータス項目表示

## UIレイアウト設計

### 全体構造
```
┌─────────────────────────────────────┐
│ ┌─────────────┐ ┌─────────────┐    │
│ │基本ステータス │ │補正後ステータス│    │
│ │(30項目)      │ │(8項目)       │    │
│ └─────────────┘ └─────────────┘    │
│ ┌─────────────┐ ┌─────────────┐    │
│ │装備品補正値1 │ │装備品補正値2 │    │
│ │(31項目)      │ │(32項目)      │    │
│ └─────────────┘ └─────────────┘    │
│ ┌─────────────┐                    │
│ │装備品補正値3 │                    │
│ │(8項目)       │                    │
│ └─────────────┘                    │
└─────────────────────────────────────┘
```

### 基本ステータス（30項目）
```
┌─────── 基本ステータス ─────────┐
│ HP 14,413      MP 459         │
│ ATK 2,341      基礎ATK 1,890   │
│ サブATK 156    サブ基礎ATK 0   │
│ 総ATK 2,497    ブリンガーAM 124│
│ MATK 1,876     基本MATK 1,542 │
│ 安定率 85%     サブ安定率 75%  │
│ クリ率 12%     クリダメ 150%   │
│ 魔クリ率 8%    魔クリダメ 130% │
│ 総属性有利 25% 属性覚醒 15%    │
│ ASPD 1,200     CSPD 890       │
│ HIT 234        FLEE 189       │
│ 物理耐性 15%   魔法耐性 12%    │
│ 異常耐性 8%    行動速度 18%    │
│ 防御崩し 5%    先読み 3%       │
└─────────────────────────────┘
```

### 補正後ステータス（8項目）
```
┌─────── 補正後ステータス ─────┐
│ STR: 215      AGI: 165      │
│ INT: 210      DEX: 160      │
│ VIT: 205      CRT: 95       │
│ MEN: 115      TEC: 90       │
└─────────────────────────────┘
```

### 装備品補正値1（31プロパティ - 2プロパティ/行表示）
```
┌─────────────── 装備品補正値1 ───────────────┐
│ プロパティ      %    +    プロパティ      %    +  │
│ ─────────────────────────────────────── │
│ ATK           15  150    物理貫通      25   -   │
│ MATK          12  120    魔法貫通      20   -   │
│ 武器ATK       10  200    属性威力      15   -   │
│ 抜刀威力      10   -     近距離威力    8    -   │
│ 遠距離威力    5    -     クリダメ      20   5   │
│ クリ率        5    2     STR           10  15   │
│ AGI           8   15     INT           12  10   │
│ DEX           6   10     VIT           5    5   │
│ ASPD          15  200    CSPD          10  150  │
│ 安定率        5    -     行動速度      5    -   │
│ 命中          8   34     回避          6   29   │
│ HP            10  200    MP            8   100  │
│ 攻撃MP回復    3    2     異常耐性      3    -   │
│ 物理耐性      5    -     魔法耐性      3    -   │
│ ヘイト        15   -     (空き)         -    -   │
└─────────────────────────────────────────┘
```

### 装備品補正値2（31プロパティ - 2プロパティ/行表示）
```
┌─────────────── 装備品補正値2 ───────────────┐
│ プロパティ      %    +    プロパティ      %    +  │
│ ─────────────────────────────────────── │
│ ATK(STR)      8    -     MATK(STR)     6    -   │
│ ATK(INT)      10   -     MATK(INT)     12   -   │
│ ATK(VIT)      5    -     MATK(VIT)     4    -   │
│ ATK(AGI)      3    -     MATK(AGI)     2    -   │
│ ATK(DEX)      4    -     MATK(DEX)     3    -   │
│ 無耐性        5    -     火耐性        8    -   │
│ 水耐性        6    -     風耐性        7    -   │
│ 地耐性        5    -     光耐性        9    -   │
│ 闇耐性        4    -     直線軽減      3    -   │
│ 突進軽減      4    -     弾丸軽減      2    -   │
│ 周囲軽減      5    -     範囲軽減      3    -   │
│ 痛床軽減      2    -     隕石軽減      1    -   │
│ 射刃軽減      2    -     吸引軽減      1    -   │
│ 爆発軽減      3    -     物理バリア    -   150  │
│ 魔法バリア    -   120    割合バリア    -    5   │
│ バリア速度    10   -     (空き)         -    -   │
└─────────────────────────────────────────┘
```

### 装備品補正値3（8プロパティ - 2プロパティ/行表示）
```
┌─────────────── 装備品補正値3 ───────────────┐
│ プロパティ      %    +    プロパティ      %    +  │
│ ─────────────────────────────────────── │
│ 物理追撃      8    -     魔法追撃      6    -   │
│ HP自然回復   12   15     MP自然回復   10   10   │
│ 絶対命中      8    5     絶対回避      6    3   │
│ 復帰短縮      20   -     道具速度      -   15   │
└─────────────────────────────────────────┘
```

## データ表示仕様

### プロパティ表示パターン

#### 2プロパティ/行レイアウトパターン

**基本構造**: `プロパティ名1 | %1 | +1 | プロパティ名2 | %2 | +2`

```
プロパティ      %    +    プロパティ      %    +
─────────────────────────────────────
ATK           15  150    物理貫通      25   -     // 両方あり + %のみ
HP            10  200    MP            8   100    // 両方あり + 両方あり
物理バリア    -   150    魔法バリア    -   120    // +のみ + +のみ
```

#### 表示パターン詳細

**両方表示プロパティ**: 両方の列に値を表示
```
ATK           15  150    MATK          12  120
HP            10  200    MP            8   100
STR           5   15     AGI           8   15
```

**%のみプロパティ**: +列は「-」表示
```
ヘイト        15   -     火耐性        8    -
属性威力      15   -     安定率        5    -
物理貫通      25   -     魔法貫通      20   -
```

**+のみプロパティ**: %列は「-」表示
```
道具速度      -   15     物理バリア    -   150
魔法バリア    -   120    割合バリア    -    5
```

### 数値表示フォーマット
- **整数値**: カンマ区切り（例: 14,413）
- **パーセント**: %記号付き（例: +15%、85%）
- **固定値**: 符号付き数値（例: +150、-50）
- **ゼロ値**: 「0」で表示（非表示にしない）

### 色分け表示
- **基本値**: 通常色（黒）
- **正の補正値**: 強調色（青）
- **負の補正値**: 警告色（赤）
- **計算結果**: 結果色（緑）

## レスポンシブ設計

### ブレークポイント対応
- **sm未満**: 1列表示
- **md以上**: 2列表示
- **lg以上**: 4列表示

### グリッドレイアウト
```css
.status-grid {
  display: grid;
  grid-template-columns: 1fr;                           /* mobile */
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);              /* tablet */
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);              /* desktop */
  }
}

/* 各セクションのサイズ調整 */
.basic-stats { @apply md:col-span-2 lg:col-span-2; }
.adjusted-stats { @apply md:col-span-1 lg:col-span-1; }
.equipment-bonus-1 { @apply md:col-span-2 lg:col-span-2; }
.equipment-bonus-2 { @apply md:col-span-2 lg:col-span-2; }
.equipment-bonus-3 { @apply md:col-span-1 lg:col-span-1; }
```

## スタイリング仕様

### コンテナ
```css
.status-preview {
  @apply bg-gray-50 border-b border-gray-200 
         transition-all duration-300 ease-in-out;
}

.status-container {
  @apply container mx-auto px-4 py-6;
}
```

### 計算式説明部分
```css
.formula-explanation {
  @apply mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md;
}

.formula-content {
  @apply text-sm text-blue-700;
}

.formula-note {
  @apply mt-1 text-xs;
}
```

## インタラクション設計

### 表示制御
- ResultToggleBarからの表示/非表示制御
- スライドダウン/アップアニメーション（300ms）
- フェードイン/アウト効果

### 値変更時の視覚フィードバック
```css
// 変更時のアニメーション
.stat-changed {
  @apply bg-yellow-100 border-yellow-300 
         transition-colors duration-500 ease-out
}
```

### 計算過程の詳細表示（将来実装）
- 各ステータス項目をクリックで詳細展開
- 計算式と中間値の表示
- ツールチップでの簡単な説明

## アクセシビリティ

### ARIA属性
```tsx
<div 
  role="region" 
  aria-label="ステータス計算結果"
  aria-live="polite"
>
  <StatSection 
    title="基本ステータス"
    role="group"
    aria-labelledby="basic-stats-title"
  />
</div>
```

### キーボードナビゲーション
- Tab順序: セクション間の論理的な移動
- 各StatSectionは独立したフォーカス領域

## パフォーマンス最適化

### メモ化
```typescript
const calculatedStats = useMemo(() => ({
  HP: hpCalculation.finalHP,
  MP: mpCalculation.finalMP,
  // other stats...
}), [hpCalculation, mpCalculation, baseStats])
```

### 計算最適化
- 必要時のみ再計算実行
- 中間結果の適切なキャッシュ
- 大量データでの性能考慮

## データフロー

### 入力データ
1. **BaseStats**: Zustandストアから取得
2. **AllBonuses**: 装備・クリスタ・料理・バフから集計

### 計算処理
1. **補正値集計**: aggregateAllBonuses()
2. **基本ステータス計算**: HP, MP, ATK, ASPD等の各種計算
3. **補正後ステータス計算**: STR, INT, VIT, AGI, DEX等の補正計算

### 表示データ
1. **基本ステータス**: 計算結果を含む全ステータス
2. **補正後ステータス**: 補正後の基本ステータス
3. **装備品補正値**: 4つのソースから統合された補正値

## エラー表示設計

### 計算エラー時の表示
```typescript
const ErrorDisplay: React.FC<{ error: string }> = ({ error }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
      <div className="text-red-600 font-medium">計算エラー</div>
      <div className="text-red-500 text-sm mt-1">{error}</div>
    </div>
  )
}
```

### ローディング状態
```typescript
const LoadingDisplay: React.FC = () => {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gray-200 rounded-lg h-32" />
      ))}
    </div>
  )
}
```

## 更新履歴

| 日付 | 更新内容 | 備考 |
|------|----------|------|
| 2024-06-23 | StatusPreview独立設計書作成 | header-component.mdから分離 |
| 2024-06-23 | UI設計書に特化した内容に変更 | 計算ロジックをrequirements/に分離 |
| 2024-06-23 | 装備品補正値計算仕様を追加 | 4ソース加算方式の詳細化 |
| 2024-06-24 | 基礎ATK仕様を更新 | 基礎ATK＝ステータスATKであることを明記 |
| 2024-06-24 | 基礎ATK計算式を修正 | 正しい基礎ATK計算式に変更 |
| 2024-06-24 | サブATK仕様を追加 | 双剣専用のサブATK・サブ基礎ATK計算仕様を追加 |
| 2024-06-25 | 行動速度計算仕様を追加 | ASPD依存の行動速度計算式と表示要件を追加 |
| 2024-06-26 | クリティカル率計算仕様を追加 | 実装済みクリティカル率計算の詳細仕様を記述 |
| 2024-06-26 | HIT計算仕様を更新 | 実装済みHIT計算の詳細仕様を記述 |
| 2024-06-26 | 物理耐性計算仕様を追加 | 4データソース統合による物理耐性計算仕様を記述 |
| 2024-06-26 | TypeScript型定義を更新 | 実装済み計算項目の型定義コメントを更新 |
| 2024-06-26 | 魔法耐性計算仕様を追加 | 4データソース統合による魔法耐性計算仕様を記述 |
| 2024-06-26 | 防御崩し計算仕様を追加 | 3データソース統合による防御崩し計算仕様を記述 |
| 2024-06-26 | 先読み計算仕様を追加 | 3データソース統合による先読み計算仕様を記述 |
| 2024-06-26 | CSPD（詠唱速度）計算仕様を追加 | INT関数2段階処理、Lv+補正後DEX・AGI依存計算仕様を記述 |
| 2024-06-26 | 総属性有利計算仕様を追加 | 4データソース統合による総属性有利計算仕様を記述 |
| 2025-06-28 | ASPD計算にArmorType補正を追加 | 軽量化+50%、重量化-50%、内部計算のみでUI表示に影響しない仕様を追加 |
| 2025-06-28 | FLEE計算仕様と実装ガイダンスを追加 | 体装備状態・ArmorType依存の4パターン基礎FLEE計算、実装コード例、自動更新仕様を追加 |
| 2025-06-28 | ファイル分割による整理 | 計算仕様、実装ガイド、データ仕様を専用ファイルに分離してUI設計に特化 |

## 関連ドキュメント
- [StatusPreview機能要件](../requirements/10_status-preview-requirements.md) - 機能仕様の詳細
- [StatusPreview 計算仕様詳細](./status-preview-calculations.md) - 各ステータスの計算仕様
- [StatusPreview 実装ガイド](./status-preview-implementation.md) - TypeScript実装例とコード
- [StatusPreview データ仕様](./status-preview-data.md) - データ構造とインターフェース
- [基本ステータス計算式](../calculations/basic-stats.md) - 計算ロジックの詳細
- [速度系計算式](../calculations/speed-calculations.md) - ASPD・CSPD・行動速度計算の詳細
- [HP・MP計算式](../calculations/hp-mp-calculation.md) - HP・MP計算の詳細
- [ヘッダーコンポーネント設計](./header-component.md)
- [結果トグルバー設計](./result-toggle-bar.md)