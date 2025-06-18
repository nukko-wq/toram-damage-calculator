# BaseStatsForm UI改善計画書

## 改善の背景

### 現在の問題点
- **サイズが過大**: メイン装備フォームと比べてBaseStatsFormが大きすぎて目立ちすぎている
- **縦長レイアウト**: 4行に分かれた3列グリッドで縦のスペースを過度に占有
- **パディング過多**: `p-6`とフィールド間の`gap-3`により無駄なスペースが多い
- **入力フィールドサイズ**: `px-3 py-2`で入力フィールドが大きすぎる
- **視覚的バランス**: 他のフォームコンポーネントとの一貫性が欠如

### 改善の目標
- **コンパクト化**: 縦のスペース使用量を大幅に削減
- **視覚的統一**: EquipmentFormとの一貫性確保
- **使いやすさ維持**: 機能性を損なわないレイアウト改善
- **スッキリしたデザイン**: 無駄なスペースを削除し、洗練された外観

## 改善内容

### 1. レイアウトの最適化

#### 従来レイアウト（構造は維持）
```
【レベル】
レベル    |         |

【メインステータス（第1行）】
STR      | INT     | VIT

【メインステータス（第2行）】
AGI      | DEX     |

【特殊ステータス】
CRT      | MEN     | TEC
```

#### 改善後レイアウト（意味のまとまりを保持）
```
【レベル】
レベル: □

【メインステータス（第1行）】
STR: □   INT: □   VIT: □

【メインステータス（第2行）】
AGI: □   DEX: □

【特殊ステータス】
CRT: □   MEN: □   TEC: □
```

### 2. ラベル配置の変更

#### 現在の構成
- **ラベル位置**: 各入力フィールドの上部
- **レイアウト**: 縦並び（label + input）
- **問題**: 縦のスペースを大量消費

#### 改善後の構成
- **ラベル位置**: 各入力フィールドの左側
- **レイアウト**: 横並び（label: input）
- **効果**: 縦スペースを約60%削減

### 3. サイズとスペーシングの最適化

#### 従来のスタイル
```css
/* 問題のあるサイズ設定 */
.container { padding: 24px; }           /* p-6 */
.field-gap { gap: 12px; }               /* gap-3 */
.input { padding: 12px 16px; }          /* px-3 py-2 */
.grid-gap { gap: 16px; }                /* gap-4 */
```

#### 改善後のスタイル
```css
/* コンパクトなサイズ設定 */
.container { padding: 16px; }           /* p-4 */
.field-gap { gap: 8px; }                /* gap-2 */
.input { padding: 6px 8px; }            /* px-2 py-1.5 */
.grid-gap { gap: 12px; }                /* gap-3 */
```

### 4. 入力フィールドの改善

#### サイズの最適化
- **従来**: `px-3 py-2` (大きすぎる)
- **改善後**: `px-2 py-1` (コンパクト)
- **幅制限**: `w-16` (64px) で統一

#### フォントサイズの調整
- **従来**: デフォルトサイズ (16px)
- **改善後**: `text-sm` (14px) でコンパクト化

### 5. グリッドレイアウトの改善

#### 現在のグリッド構造を維持
```css
/* 現在の4行構造を保持 */
.level-row { grid-template-columns: 1fr 1fr 1fr; }        /* レベルのみ使用 */
.main-stats-1 { grid-template-columns: 1fr 1fr 1fr; }     /* STR, INT, VIT */
.main-stats-2 { grid-template-columns: 1fr 1fr 1fr; }     /* AGI, DEX, 空 */
.special-stats { grid-template-columns: 1fr 1fr 1fr; }    /* CRT, MEN, TEC */
```

#### 意味のあるグループ化
- **レベル行**: キャラクターの基本レベル
- **メインステータス（第1行）**: STR, INT, VIT（力・知力・体力）
- **メインステータス（第2行）**: AGI, DEX（俊敏性・器用さ）
  - **実装理由**: 5つのメインステータスを3列グリッドに配置するため行を分割
- **特殊ステータス行**: CRT, MEN, TEC（クリティカル・精神力・技術力）

## 技術実装

### 1. コンポーネント構造

```tsx
// 改善後の構造（現在のレイアウトを維持）
<section className="bg-white rounded-lg shadow-md p-4 lg:col-start-1 lg:col-end-3 lg:row-start-1 lg:row-end-2">
  <h2 className="text-lg font-bold text-gray-800 mb-3">基本ステータス</h2>
  <div className="flex flex-col gap-2">
    
    {/* レベル行 */}
    <div className="grid grid-cols-3 gap-3">
      <StatField key="level" label="レベル" name="level" max={510} />
    </div>
    
    {/* メインステータス第1行 */}
    <div className="grid grid-cols-3 gap-3">
      <StatField key="STR" label="STR" name="STR" max={510} />
      <StatField key="INT" label="INT" name="INT" max={510} />
      <StatField key="VIT" label="VIT" name="VIT" max={510} />
    </div>
    
    {/* メインステータス第2行 */}
    <div className="grid grid-cols-3 gap-3">
      <StatField key="AGI" label="AGI" name="AGI" max={510} />
      <StatField key="DEX" label="DEX" name="DEX" max={510} />
    </div>
    
    {/* 特殊ステータス行 */}
    <div className="grid grid-cols-3 gap-3">
      <StatField key="CRT" label="CRT" name="CRT" max={255} />
      <StatField key="MEN" label="MEN" name="MEN" max={255} />
      <StatField key="TEC" label="TEC" name="TEC" max={255} />
    </div>
    
  </div>
</section>
```

### 2. StatFieldコンポーネント

```tsx
interface StatFieldProps {
  label: string
  name: keyof BaseStatsFormData
  max: number
}

const StatField = ({ label, name, max }: StatFieldProps) => (
  <div className="flex items-center gap-2">
    <label 
      htmlFor={`stat-${name}`}
      className="text-sm font-medium text-gray-700 w-12 flex-shrink-0"
    >
      {label}:
    </label>
    <div className="flex flex-col flex-1">
      <input
        id={`stat-${name}`}
        type="number"
        className={`px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent w-full ${
          errors[name] ? 'border-red-500' : 'border-gray-300'
        }`}
        min="1"
        max={max}
        {...register(name, {
          valueAsNumber: true,
          onBlur: () => handleBlur(name),
        })}
      />
      {errors[name] && (
        <span className="text-red-500 text-xs mt-1">{errors[name]?.message}</span>
      )}
    </div>
  </div>
)
```

### 3. エラーハンドリングの改善

#### コンパクトなエラー表示
- **従来**: 下部にエラーメッセージ全文表示（縦スペースを消費）
- **改善後**: 入力フィールド直下にコンパクトなエラーメッセージ
- **位置**: 各入力フィールドの下部に`text-xs`でエラー表示
- **レイアウト**: 現在の構造を維持しつつスペーシングを最適化

### 4. スタイリングの統一

#### EquipmentFormとの一貫性
```css
/* 共通スタイル */
.form-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 16px;
}

.form-title {
  font-size: 18px;
  font-weight: 700;
  color: #374151;
  margin-bottom: 12px;
}

.input-field {
  padding: 4px 8px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  width: 64px;
}
```

## 実装結果予測

### 達成される改善点
1. **スペース削減**: パディング・ギャップ最適化で縦スペース約40%削減
2. **視覚的統一**: EquipmentFormと一貫したデザイン言語
3. **コンパクト性**: 他のフォームコンポーネントとのバランス改善
4. **意味的グループ**: ステータスの論理的分類を正確に反映
   - レベル（1項目）
   - メインステータス（STR, INT, VIT, AGI, DEX - 5項目）
   - 特殊ステータス（CRT, MEN, TEC - 3項目）
5. **使いやすさ**: ラベルと入力フィールドの視覚的関連性向上

### レスポンシブ対応
- **デスクトップ**: 4行レイアウトを維持（意味のあるグループ化）
- **タブレット**: 現在の3列グリッドを維持
- **モバイル**: グリッドが適切に折り返し

### ユーザーエクスペリエンス向上
- **論理的グループ化**: レベル/メインステータス（2行）/特殊ステータスの意味的まとまりを保持
- **視認性**: ラベルを左に配置して関係性を明確化
- **効率性**: コンパクトなレイアウトで一覧性向上
- **一貫性**: 他のフォームコンポーネントとの統一感
- **学習効率**: ゲーム内のステータス構造と一致した配置
- **実装合理性**: 5つのメインステータスを3列グリッドに適切に配置

---

**実装日:** 2025-06-18  
**対象ファイル:** `src/components/BaseStatsForm.tsx`  
**実装者:** Claude Code  
**ステータス:** 計画完了・実装待ち