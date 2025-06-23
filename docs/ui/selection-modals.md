# 選択モーダルUI仕様

## バフアイテム選択UI

### 選択方式
- モーダル選択方式での選択（装備・クリスタ選択UIと統一されたデザイン）
- 各カテゴリごとに選択ボタンをクリックしてモーダル表示
- オーバーレイモーダル方式でのアイテム選択画面
- グリッドレイアウトでのバフアイテム一覧表示
- バフアイテムカード形式（名前、カテゴリ、効果プロパティ表示）

### 実装仕様
```typescript
interface BuffItemSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (buffItemId: string | null) => void
  selectedBuffItemId: string | null
  category: BuffItemCategory
  title: string
}

interface BuffItemCardProps {
  buffItem: PresetBuffItem
  isSelected: boolean
  onClick: () => void
}

// バフアイテム選択ボタン
interface BuffItemButtonProps {
  category: BuffItemCategory
  label: string
  selectedItem: PresetBuffItem | null
  onOpenModal: (category: BuffItemCategory) => void
}
```

### UI構成要素
- **選択ボタン**: 各カテゴリの選択状態表示 + モーダル起動
  - 未選択時: 「なし」表示、グレー背景
  - 選択済み時: アイテム名 + 効果概要表示、青背景
- **選択モーダル**: 
  - ヘッダー: カテゴリ名 + 閉じるボタン
  - アイテムグリッド: 4列グリッドでアイテムカード表示
  - 「なし」オプション: 選択解除用
  - フッター: キャンセルボタン
- **アイテムカード**:
  - カテゴリバッジ（カラーコード付き）
  - アイテム名
  - 効果プロパティ（最大3項目表示）
  - 選択状態チェックマーク

### カテゴリカラーコード
```typescript
const categoryColors = {
  physicalPower: 'bg-red-100 text-red-800',
  magicalPower: 'bg-purple-100 text-purple-800',
  physicalDefense: 'bg-blue-100 text-blue-800',
  magicalDefense: 'bg-indigo-100 text-indigo-800',
  elementalAttack: 'bg-orange-100 text-orange-800',
  elementalDefense: 'bg-emerald-100 text-emerald-800',
  speed: 'bg-yellow-100 text-yellow-800',
  casting: 'bg-cyan-100 text-cyan-800',
  mp: 'bg-blue-100 text-blue-800',
  hp: 'bg-green-100 text-green-800',
  accuracy: 'bg-amber-100 text-amber-800',
  evasion: 'bg-pink-100 text-pink-800',
}
```

## 敵情報選択UI

### 選択方式
- モーダル選択形式での敵情報選択（装備・クリスタ選択UIと統一されたデザイン）
- 「敵を選択」ボタンをクリックしてモーダル表示
- フルスクリーンオーバーレイモーダル方式での敵選択画面
- タブ型フィルタリング機能（全て、モブ、フィールドボス、ボス、レイドボス）
- グリッドレイアウトでの敵一覧表示
- 敵カード形式での情報表示（名前、レベル、カテゴリ、基本ステータス）
- 背景クリック・ESCキーでモーダル閉じる
- 選択済み敵の情報をボタン上に表示（名前、レベル、カテゴリ）
- 手動ステータス入力機能との併用（プリセット選択後にクリティカル耐性と必要HITを調整可能）

### 実装仕様
```typescript
interface EnemySelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (enemyId: string) => void
  selectedEnemyId: string | null
  title: string
}

interface EnemyCardProps {
  enemy: PresetEnemy
  isSelected: boolean
  onClick: () => void
}

// 敵カテゴリタブ構造
interface EnemyTab {
  id: EnemyCategory | 'all'
  label: string
  count: number
}
```

### 敵カテゴリタブ機能
- **全て**: 全ての敵情報を表示（デフォルト選択）
- **モブ**: 一般モンスター
- **フィールドボス**: フィールドボス
- **ボス**: ダンジョンボス
- **レイドボス**: レイドボス

### 敵カード表示項目
- 敵名
- レベル
- カテゴリバッジ
- DEF（物理防御力）
- MDEF（魔法防御力）
- 物理・魔法耐性%
- 選択状態チェックマーク

### キーボード・マウス操作
- **ESCキー**: モーダルを閉じる
- **背景クリック**: モーダルを閉じる
- **Enterキー**: 選択中の敵を確定
- **矢印キー**: 敵選択ナビゲーション（オプション）