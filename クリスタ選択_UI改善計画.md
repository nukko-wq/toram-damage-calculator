# クリスタ選択 UI改善計画

## 現在の問題点
- 全体的にサイズが大きすぎる（他のフォームと比較して）
- ボタンのpadding（p-3）が大きい
- フォントサイズが他のフォームより大きい
- 縦の間隔が広すぎる（space-y-6, space-y-4）
- 他のフォーム（BaseStatsForm、WeaponForm）とデザイン統一性がない

## 改善目標
1. **サイズの統一**: 他のフォーム（BaseStatsForm、WeaponForm）と同じコンパクトなサイズに統一
2. **デザインの統一**: ラベルの配置、フォントサイズ、余白を他のフォームと合わせる
3. **レスポンシブ性の向上**: 限られたスペースでも使いやすいレイアウト

## 改善内容

### 1. 全体レイアウト
- **現在**: `p-6`（大きすぎる）
- **改善後**: `p-4`（他のフォームと統一）

### 2. タイトル
- **現在**: `text-xl font-bold mb-4`
- **改善後**: `text-lg font-bold mb-3`（他のフォームと統一）

### 3. グリッドレイアウト構造（NEW）
- **現在**: カテゴリ別セクション（武器クリスタ、防具クリスタ等の見出し付き）
- **改善後**: 2x2グリッドレイアウト
  ```
  武器 | [ボタン] | 防具 | [ボタン]
       | [ボタン] |      | [ボタン]
  追加 | [ボタン] | 特殊 | [ボタン]
       | [ボタン] |      | [ボタン]
  ```

### 4. カテゴリ表示方式
- **現在**: セクション見出し（武器クリスタ、防具クリスタ等）
- **改善後**: 左端のラベル（武器、防具、追加、特殊）のみ表示

### 5. グリッド配置
- **改善後**: `grid grid-cols-4 gap-2`
- 列1: カテゴリラベル（武器、防具、追加、特殊）
- 列2: 各カテゴリの1つ目のクリスタルボタン
- 列3: カテゴリラベル（武器、防具、追加、特殊）
- 列4: 各カテゴリの2つ目のクリスタルボタン

### 6. ラベル
- **現在**: `text-sm font-medium text-gray-700`（上に配置）
- **改善後**: 左端固定配置
  - `text-sm font-medium text-gray-700 w-12 flex-shrink-0`

### 7. ボタン（クリスタル選択ボタン）
- **現在**: `p-3`（大きすぎる）
- **改善後**: `px-2 py-1`（コンパクト化）
- **現在**: `text-left`
- **改善後**: `text-sm`でフォントサイズを統一

### 8. レイアウト構造
- **現在**: カテゴリ別縦積みレイアウト
- **改善後**: 2x2グリッドレイアウト（カテゴリ: ボタン1 | カテゴリ: ボタン2）

## 実装詳細

### 新しいグリッドレイアウト構造
```tsx
// 改善後の全体構造
<div className="grid grid-cols-4 gap-2">
  {/* 武器クリスタ行 */}
  <div className="text-sm font-medium text-gray-700 w-12 flex items-center">武器:</div>
  <button className="px-2 py-1 text-sm ...">{武器クリスタ1}</button>
  <div className="text-sm font-medium text-gray-700 w-12 flex items-center">防具:</div>
  <button className="px-2 py-1 text-sm ...">{防具クリスタ1}</button>
  
  {/* 2つ目のボタン行 */}
  <div></div> {/* 空セル */}
  <button className="px-2 py-1 text-sm ...">{武器クリスタ2}</button>
  <div></div> {/* 空セル */}
  <button className="px-2 py-1 text-sm ...">{防具クリスタ2}</button>
  
  {/* 追加クリスタ行 */}
  <div className="text-sm font-medium text-gray-700 w-12 flex items-center">追加:</div>
  <button className="px-2 py-1 text-sm ...">{追加クリスタ1}</button>
  <div className="text-sm font-medium text-gray-700 w-12 flex items-center">特殊:</div>
  <button className="px-2 py-1 text-sm ...">{特殊クリスタ1}</button>
  
  {/* 2つ目のボタン行 */}
  <div></div> {/* 空セル */}
  <button className="px-2 py-1 text-sm ...">{追加クリスタ2}</button>
  <div></div> {/* 空セル */}
  <button className="px-2 py-1 text-sm ...">{特殊クリスタ2}</button>
</div>
```

### サイズ調整
```tsx
// 全体コンテナ
className="bg-white rounded-lg shadow-md p-4 lg:col-start-1 lg:col-end-3 lg:row-start-3 lg:row-end-4"

// タイトル
className="text-lg font-bold text-gray-800 mb-3"

// メイングリッド
className="grid grid-cols-4 gap-2"

// カテゴリラベル
className="text-sm font-medium text-gray-700 w-12 flex items-center"

// クリスタルボタン
className="px-2 py-1 text-sm border border-gray-300 rounded ..."
```

### ボタン内容の調整
- クリスタル名の表示サイズを小さく
- 説明文の表示を簡潔に
- アイコンサイズを小さく（w-4 h-4）

## 期待される効果
1. **統一感**: 他のフォームと同じデザイン言語で統一
2. **スペース効率**: 限られた画面スペースの有効活用
3. **視認性**: コンパクトながら情報が読みやすい
4. **一貫性**: BaseStatsForm、WeaponFormと同じ操作感

## 注意点
- CrystalSelectionModalのサイズは現在のままで良い（詳細表示のため）
- クリスタルの情報表示は省略しすぎないよう調整
- レスポンシブ対応は維持する