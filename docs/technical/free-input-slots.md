# 自由入力装備スロット拡張

## 自由入力スロット追加概要

**目的**: プロパティ試行専用の装備スロットを追加し、ユーザーが自由にプロパティの組み合わせを試せる環境を提供

**追加装備スロット**:
- 自由入力1 (freeInput1)
- 自由入力2 (freeInput2)  
- 自由入力3 (freeInput3)

**装備タブレイアウト変更**:
従来の8装備スロットから11装備スロットに拡張

## 自由入力スロットの特徴

### 制限事項
- プリセット装備選択機能なし（プリセット選択ボタン非表示）
- カスタム装備機能のみ対応（新規作成・名前変更・削除）
- 武器ステータス（ATK、安定率、精錬値）は初期化対象外

### 利用可能機能
- 全プロパティの手動入力（他の装備スロットと同一のプロパティセット）
- カスタム装備の新規作成（装備名入力モーダル、初期値は空文字列）
- カスタム装備の名前変更（選択中のカスタム装備のみ）
- カスタム装備の削除（選択中のカスタム装備のみ）
- プロパティ連動機能（編集中データの仮保存・永続保存）

## データ構造の変更

### EquipmentSlotsインターフェース拡張
```typescript
interface EquipmentSlots {
  main: Equipment
  body: Equipment
  additional: Equipment
  special: Equipment
  subWeapon: Equipment
  fashion1: Equipment
  fashion2: Equipment
  fashion3: Equipment
  freeInput1: Equipment  // 新規追加
  freeInput2: Equipment  // 新規追加
  freeInput3: Equipment  // 新規追加
}
```

### EquipmentCategoryタイプ拡張
```typescript
type EquipmentCategory = 
  | 'main'
  | 'body'
  | 'additional'
  | 'special'
  | 'subWeapon'
  | 'fashion1'
  | 'fashion2'
  | 'fashion3'
  | 'freeInput1'  // 新規追加
  | 'freeInput2'  // 新規追加
  | 'freeInput3'  // 新規追加
```

## UI実装仕様

### 装備タブ構成
```typescript
const equipmentSlots = [
  { key: 'main' as const, label: 'メイン装備' },
  { key: 'body' as const, label: '体装備' },
  { key: 'additional' as const, label: '追加装備' },
  { key: 'special' as const, label: '特殊装備' },
  { key: 'subWeapon' as const, label: 'サブ武器' },
  { key: 'fashion1' as const, label: 'オシャレ1' },
  { key: 'fashion2' as const, label: 'オシャレ2' },
  { key: 'fashion3' as const, label: 'オシャレ3' },
  { key: 'freeInput1' as const, label: '自由入力1' },  // 新規追加
  { key: 'freeInput2' as const, label: '自由入力2' },  // 新規追加
  { key: 'freeInput3' as const, label: '自由入力3' },  // 新規追加
]
```

### タブレイアウト調整
- グリッドレイアウトを4列から適切な列数に調整
- レスポンシブ対応（sm: 2列、md: 3列、lg: 4列等）

### 自由入力スロットのボタン表示制御
```typescript
const showCustomEquipmentButtons = (slotKey: keyof EquipmentSlots) => {
  // 自由入力スロットは常にカスタム機能ボタンを表示
  if (['freeInput1', 'freeInput2', 'freeInput3'].includes(slotKey)) {
    return true
  }
  
  // 通常スロットは既存の判定ロジック
  return (
    effectiveEquipment[slotKey].id && 
    'isCustom' in effectiveEquipment[slotKey] && 
    effectiveEquipment[slotKey].isCustom
  )
}

const showPresetSelectionButton = (slotKey: keyof EquipmentSlots) => {
  // 自由入力スロットはプリセット選択ボタンを非表示
  return !['freeInput1', 'freeInput2', 'freeInput3'].includes(slotKey)
}
```

## カテゴリ別初期化処理の調整

### equipmentDatabase.ts の調整
```typescript
export function getEquipmentCategoryDisplayName(category: EquipmentCategory): string {
  switch (category) {
    // 既存ケース...
    case 'freeInput1': return '自由入力1'
    case 'freeInput2': return '自由入力2'
    case 'freeInput3': return '自由入力3'
    default: return category
  }
}

export function createCustomEquipment(
  equipmentCategory: EquipmentCategory,
  name: string,
): UserEquipment {
  // 自由入力スロットは武器ステータス初期化対象外
  const isWeaponType = ['main', 'subWeapon'].includes(equipmentCategory)
  
  const customEquipment: UserEquipment = {
    // 基本プロパティ...
    weaponStats: isWeaponType ? {
      ATK: 0,
      stability: 0,
      refinement: 0,
    } : undefined,
    // 自由入力スロットはクリスタルスロット対象外
    crystalSlots: ['main', 'body', 'additional', 'special'].includes(
      equipmentCategory,
    ) ? {
      slot1: undefined,
      slot2: undefined,
    } : undefined,
  }
  
  return customEquipment
}
```

## データ管理とバリデーション

### Zodスキーマ更新
```typescript
const equipmentSlotsSchema = z.object({
  main: equipmentSchema,
  body: equipmentSchema,
  additional: equipmentSchema,
  special: equipmentSchema,
  subWeapon: equipmentSchema,
  fashion1: equipmentSchema,
  fashion2: equipmentSchema,
  fashion3: equipmentSchema,
  freeInput1: equipmentSchema,  // 新規追加
  freeInput2: equipmentSchema,  // 新規追加
  freeInput3: equipmentSchema,  // 新規追加
})
```

### カスタム装備データ管理
- 自由入力スロットのカスタム装備も既存の仕組みで管理
- LocalStorageでの永続化対象
- セーブデータ間での共有対象
- 編集セッション管理対象

## プロパティ表示の統一

### 全スロット共通プロパティセット
自由入力スロットでも既存の装備スロットと同一のプロパティが利用可能：

- 攻撃・威力系（ATK%/+、MATK%/+、武器ATK%/+、貫通系、威力系等）
- ステータス系（HP/MP、STR/INT/VIT/AGI/DEX、命中/回避、速度系等）
- 継戦補助系（MP回復、耐性、ヘイト、自然回復等）
- 戦闘補助系（防御崩し、先読み、Guard系等）
- 低頻度系（ステータス連動攻撃力、属性耐性、ダメージ軽減、バリア/追撃等）

## レスポンシブデザイン対応

### タブナビゲーション調整
```typescript
<nav className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
  {equipmentSlots.map(({ key, label }) => (
    <button key={key} /* タブボタン実装 */>
      {label}
    </button>
  ))}
</nav>
```

### 画面サイズ別表示
- モバイル: 2列表示で縦にスクロール
- タブレット: 3-4列表示
- デスクトップ: 6列表示で1行に収納