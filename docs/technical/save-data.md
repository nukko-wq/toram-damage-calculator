# セーブデータ管理仕様

## 差分検知による保存ボタン制御

### 基本方針
- **データ変更のみで保存ボタン表示**: フォーカス変更ではなく実際のデータ差分を検知
- **正確な変更検知**: 保存済みデータと現在データの深い比較による差分判定
- **パフォーマンス配慮**: デバウンス処理による頻繁な差分チェックの抑制

### 差分検知システム
```typescript
interface CalculatorStore extends CalculatorData {
  // 差分検知用の状態
  lastSavedData: CalculatorData | null    // 最後に保存されたデータのスナップショット
  hasRealChanges: boolean                 // 実際の差分があるかどうか
  
  // 差分検知メソッド
  updateLastSavedData: (data: CalculatorData) => void
  checkForRealChanges: () => boolean
  setHasRealChanges: (value: boolean) => void
}

// 差分検知の実装
const checkForRealChanges = (): boolean => {
  const { data, lastSavedData } = get()
  
  if (!lastSavedData) {
    // 初回の場合、デフォルトデータと比較
    return !isEqual(data, getDefaultCalculatorData())
  }
  
  // 保存済みデータと現在のデータを深い比較
  return !isEqual(data, lastSavedData)
}
```

### 保存ボタン表示制御

#### 表示条件
- **表示**: `hasRealChanges === true` の場合のみ
- **非表示**: 保存済みデータと差分がない場合

#### 表示パターン
```typescript
interface SaveButtonProps {
  hasRealChanges: boolean
  onClick: () => void
}

// 実際の差分がある場合のみ表示
const SaveButton: React.FC<SaveButtonProps> = ({ hasRealChanges, onClick }) => {
  if (!hasRealChanges) {
    return null  // 差分がない場合は非表示
  }
  
  return (
    <button
      onClick={onClick}
      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md"
    >
      現在のデータを保存
    </button>
  )
}
```

### 保存ボタンラベル
- 統一表記: 「現在のデータを保存」
- 差分がある場合のみ表示（色分けは不要）

### 視覚的フィードバック
```typescript
// 差分がある場合のみオレンジ色で表示
.save-button {
  @apply bg-orange-600 hover:bg-orange-700 text-white;
  @apply px-4 py-2 rounded-md font-medium;
  @apply transition-colors duration-200;
}

// 差分がない場合は非表示
.save-button.hidden {
  @apply hidden;
}
```

### 削除された機能
- 従来の「現在のデータを保存」ボタン（重複排除）
- 「未保存の変更を保存」テキスト表記

## SaveDataManager UI構成

### メインアクション
- 現在のデータを保存ボタン（色で変更状態を表示）
- 新規セーブ作成ボタン
- キャンセルボタン

### セーブデータリスト
- 既存セーブデータの一覧表示
- 各アイテムの読み込み・編集・削除機能

## LocalStorage設計

### 保存データ構造
```typescript
interface LocalStorageData {
  custom_equipments: PresetEquipment[]
  custom_crystals: PresetCrystal[]
  custom_enemies: PresetEnemy[]
  user_settings: UserSettings
  saved_builds: CalculatorData[]
}
```

### データ同期パターン
- 読み込み時: プリセット + ユーザーカスタムを統合
- 保存時: ユーザーカスタムデータのみLocalStorageに保存
- エラーハンドリング: try-catchでLocalStorageアクセスエラーを処理

## パフォーマンス最適化

### データロード最適化
- 遅延ロード: 必要な装備カテゴリのみロード
- メモ化: 計算結果のキャッシュ
- バーチャルスクロール: 大量アイテム表示時

### フォーム最適化
- debounce: 入力値変更の処理遅延
- 分割バリデーション: フィールド単位での検証
- 最適化されたrerender: 不要な再描画を防止

## エラーハンドリング

### データ読み込みエラー
- JSONパースエラー処理
- LocalStorageアクセスエラー処理
- フォールバック機能

### バリデーションエラー
- リアルタイムエラー表示
- エラーメッセージの国際化対応

## データ変更検知フロー

### フォーム変更時のフロー
```
ユーザー入力 → React Hook Form watch → CalculatorStore更新 → 差分チェック → hasRealChanges更新 → 保存ボタン表示制御
```

### 差分チェックの詳細
1. **データ更新時**: 全てのストア更新メソッドで自動的にcheckForRealChanges()を実行
2. **デバウンス処理**: 頻繁な変更時は500ms後に差分チェックを実行
3. **深い比較**: lodash.isEqualによる完全な差分検知
4. **状態更新**: hasRealChanges状態を更新して保存ボタンの表示を制御

### パフォーマンス最適化
```typescript
// デバウンス付きの差分チェック
const debouncedChangeCheck = debounce(() => {
  const hasChanges = checkForRealChanges()
  setHasRealChanges(hasChanges)
}, 500)

// 軽量差分チェック（主要フィールドのみ）
const hasLightDifferences = (currentData, savedData) => {
  return (
    !isEqual(currentData.baseStats, savedData.baseStats) ||
    !isEqual(currentData.equipment.main, savedData.equipment.main) ||
    !isEqual(currentData.equipment.body, savedData.equipment.body)
  )
}
```

## セーブデータ操作フロー

### 保存操作（更新版）
1. 「現在のデータを保存」ボタンクリック
2. 現在の全フォームデータを収集
3. バリデーション実行
4. LocalStorageに保存
5. **lastSavedDataを現在データで更新**（新規追加）
6. **hasRealChanges状態をfalseに更新**（変更）
7. hasUnsavedChanges状態をfalseに更新
8. **保存ボタンを非表示に変更**（新規追加）
9. 保存成功フィードバック表示

### 読み込み操作（更新版）
1. セーブデータリストから選択
2. 該当データをLocalStorageから読み込み
3. 全フォームに値を設定
4. **lastSavedDataを読み込みデータで更新**（新規追加）
5. **hasRealChanges状態をfalseに初期化**（新規追加）
6. hasUnsavedChanges状態をfalseに初期化
7. **保存ボタンを非表示に設定**（新規追加）
8. 読み込み成功フィードバック表示

### 削除操作
1. 削除確認ダイアログ表示
2. 確認後LocalStorageから削除
3. セーブデータリスト更新
4. 削除成功フィードバック表示

### 新規セーブデータ作成操作（更新版）
1. 新規作成ボタンクリック
2. セーブデータ名入力
3. 現在データを新しいセーブデータとして作成
4. **lastSavedDataを作成データで更新**（新規追加）
5. **hasRealChanges状態をfalseに更新**（新規追加）
6. 作成したセーブデータに自動切り替え
7. **保存ボタンを非表示に設定**（新規追加）
8. 作成成功フィードバック表示