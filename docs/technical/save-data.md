# セーブデータ管理仕様

## 保存ボタンの統一仕様

### 保存ボタンラベル
- 統一表記: 「現在のデータを保存」
- 未保存の変更の有無に関わらず同じテキスト表示

### 視覚的フィードバック
```typescript
// ボタンの色分けによる状態表示
interface SaveButtonProps {
  hasUnsavedChanges: boolean
  onClick: () => void
}

// 未保存の変更あり: bg-orange-600 (オレンジ色)
// 未保存の変更なし: bg-green-600 (緑色)
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

## セーブデータ操作フロー

### 保存操作
1. 「現在のデータを保存」ボタンクリック
2. 現在の全フォームデータを収集
3. バリデーション実行
4. LocalStorageに保存
5. hasUnsavedChanges状態をfalseに更新
6. 保存成功フィードバック表示

### 読み込み操作
1. セーブデータリストから選択
2. 該当データをLocalStorageから読み込み
3. 全フォームに値を設定
4. hasUnsavedChanges状態をfalseに初期化
5. 読み込み成功フィードバック表示

### 削除操作
1. 削除確認ダイアログ表示
2. 確認後LocalStorageから削除
3. セーブデータリスト更新
4. 削除成功フィードバック表示