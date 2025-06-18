# 武器情報フォーム UI改善計画書

## 改善の背景

### 現在の問題点
- **サイズ過大**: 全体的に縦・横のスペースを大量消費
- **冗長なレイアウト**: メイン武器とサブ武器が縦に配置され、縦長になりすぎ
- **統一性不足**: BaseStatsFormやEquipmentFormとのデザイン一貫性がない
- **エラーメッセージ**: レイアウト崩れの原因となるエラーメッセージ表示
- **重複感**: 同じ入力フィールドが2回縦に繰り返されて冗長

### 改善の目標
- **2カラムレイアウト**: メイン武器とサブ武器を左右に配置
- **コンパクト化**: 他のコンポーネントとのバランス調整
- **視覚的統一**: BaseStatsFormスタイルとの一貫性確保
- **スペース効率**: 縦スペースの大幅削減

## 改善内容

### 1. レイアウト構造の変更

#### 従来レイアウト（問題のある構成）
```
【武器情報】
メイン武器
├─ 武器種     武器ATK   安定率    精錬値
├─ [select]  [input]  [input]  [input]
├─ エラー     エラー     エラー     エラー

サブ武器
├─ 武器種     武器ATK   安定率    精錬値  
├─ [select]  [input]  [input]  [input]
├─ エラー     エラー     エラー     エラー
```

#### 改善後レイアウト（2カラム設計）
```
【武器情報】
┌─────────────────┬─────────────────┐
│   メイン武器      │   サブ武器       │
├─────────────────┼─────────────────┤
│武器種: [select]   │武器種: [select]  │
│ATK:   [input]     │ATK:   [input]    │
│安定率: [input]    │安定率: [input]   │
│精錬値: [input]    │精錬値: [input]   │
└─────────────────┴─────────────────┘
```

### 2. ラベル配置の改善

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
.section-gap { margin-bottom: 24px; }   /* mb-6 */
.field-gap { gap: 16px; }               /* gap-4 */
.input { padding: 12px 16px; }          /* px-3 py-2 */
.title { font-size: 20px; }             /* text-xl */
.subtitle { font-size: 18px; }          /* text-lg */
```

#### 改善後のスタイル
```css
/* コンパクトなサイズ設定 */
.container { padding: 16px; }           /* p-4 */
.section-gap { margin-bottom: 12px; }   /* mb-3 */
.field-gap { gap: 8px; }                /* gap-2 */
.input { padding: 4px 8px; }            /* px-2 py-1 */
.title { font-size: 18px; }             /* text-lg */
.subtitle { font-size: 14px; }          /* text-sm */
```

### 4. フィールド配置の最適化

#### レスポンシブ対応
```css
/* デスクトップ: 2カラムレイアウト */
@media (min-width: 768px) {
  .weapon-grid {
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
}

/* モバイル: 1カラムレイアウト */
@media (max-width: 767px) {
  .weapon-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
```

#### フィールド内レイアウト
- **各武器カラム内**: 縦並び4項目（武器種、ATK、安定率、精錬値）
- **ラベル配置**: 左側固定幅（`w-16`）
- **入力フィールド**: 右側可変幅（`flex-1`）

### 5. エラーメッセージの除去

#### BaseStatsFormとの統一
- **エラーメッセージ削除**: レイアウト崩れの原因を除去
- **バリデーション維持**: React Hook FormとZodによるバリデーション継続
- **視覚的フィードバック削除**: エラー状態でのボーダー色変更も削除

## 技術実装

### 1. コンポーネント構造

```tsx
// 改善後の構造
<section className="bg-white rounded-lg shadow-md p-4 lg:col-start-1 lg:col-end-3 lg:row-start-2 lg:row-end-3">
  <h2 className="text-lg font-bold text-gray-800 mb-3">武器情報</h2>
  
  {/* 2カラムレイアウト */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    
    {/* メイン武器カラム */}
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">メイン武器</h3>
      <div className="space-y-2">
        <WeaponField label="武器種" name="weaponType" type="select" options={weaponTypes} register={registerMain} />
        <WeaponField label="ATK" name="ATK" type="number" max={1500} register={registerMain} handleBlur={handleMainBlur} />
        <WeaponField label="安定率" name="stability" type="number" max={100} register={registerMain} handleBlur={handleMainBlur} />
        <WeaponField label="精錬値" name="refinement" type="number" max={15} register={registerMain} handleBlur={handleMainBlur} />
      </div>
    </div>
    
    {/* サブ武器カラム */}
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">サブ武器</h3>
      <div className="space-y-2">
        <WeaponField label="武器種" name="weaponType" type="select" options={subWeaponTypes} register={registerSub} />
        <WeaponField label="ATK" name="ATK" type="number" max={1500} register={registerSub} handleBlur={handleSubBlur} />
        <WeaponField label="安定率" name="stability" type="number" max={100} register={registerSub} handleBlur={handleSubBlur} />
        <WeaponField label="精錬値" name="refinement" type="number" max={15} register={registerSub} handleBlur={handleSubBlur} />
      </div>
    </div>
    
  </div>
</section>
```

### 2. WeaponFieldコンポーネント

```tsx
interface WeaponFieldProps {
  label: string
  name: string
  type: 'select' | 'number'
  options?: string[]
  max?: number
  register: any
  handleBlur?: (name: string) => void
}

const WeaponField = ({ label, name, type, options, max, register, handleBlur }: WeaponFieldProps) => (
  <div className="flex items-center gap-2">
    <label 
      htmlFor={name}
      className="text-sm font-medium text-gray-700 w-16 flex-shrink-0"
    >
      {label}:
    </label>
    <div className="flex-1">
      {type === 'select' ? (
        <select
          id={name}
          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent w-full"
          {...register(name)}
        >
          {options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          type="number"
          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent w-full"
          min="0"
          max={max}
          {...register(name, {
            valueAsNumber: true,
            onBlur: () => handleBlur?.(name),
          })}
        />
      )}
    </div>
  </div>
)
```

### 3. レスポンシブ対応

```css
/* デスクトップ・タブレット: 2カラム */
.weapon-grid {
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

/* モバイル: 1カラム */
@media (max-width: 767px) {
  .weapon-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

/* 入力フィールドの統一 */
.weapon-input {
  padding: 4px 8px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}
```

## 実装結果予測

### 達成される改善点
1. **スペース削減**: 縦スペース使用量を約60%削減
2. **視覚的統一**: BaseStatsFormと一貫したデザイン言語
3. **2カラム効率**: 横スペースを有効活用してコンパクト化
4. **レイアウト安定**: エラーメッセージ除去による安定したUI
5. **コンポーネント統一**: 他のフォームとのバランス改善

### レスポンシブ対応
- **デスクトップ**: 2カラムレイアウトで効率的配置
- **タブレット**: 2カラム維持でコンパクト表示
- **モバイル**: 1カラムに自動調整

### ユーザーエクスペリエンス向上
- **比較しやすさ**: メイン武器とサブ武器を並べて比較可能
- **効率的入力**: 関連項目が近接配置され入力しやすい
- **視覚的整理**: 2つの武器が明確に分離された表示
- **一貫性**: 他のフォームコンポーネントとの統一感
- **コンパクト性**: 画面全体のバランス改善

### 比較表

| 項目 | 改善前 | 改善後 |
|------|--------|--------|
| レイアウト | 縦並び | 2カラム横並び |
| 縦スペース | 大（高さ約400px） | 小（高さ約160px） |
| ラベル配置 | 上部 | 左側 |
| エラー表示 | あり（レイアウト崩れ） | なし（安定） |
| 統一性 | 低 | 高（他コンポーネントと統一） |
| 比較性 | 低（離れて配置） | 高（並べて表示） |

---

**実装日:** 2025-06-18  
**対象ファイル:** `src/components/WeaponForm.tsx`  
**実装者:** Claude Code  
**ステータス:** 計画完了・実装待ち