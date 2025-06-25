# バフアイテムデータベース設計

## ファイル構成・データフロー
**初期データ配置**:
- **プリセットデータ**: `src/data/buffItems.ts`（TypeScript静的ファイル）

**アプリ起動時の処理**:
```
アプリ起動 → プリセットTypeScriptモジュールを読み込み → LocalStorageにコピー → 以降はLocalStorageから参照
```

**TypeScript移行の利点**:
- EquipmentPropertiesインターフェースによる厳密な型チェック
- エディタでの自動補完とIntelliSense
- プロパティ名の統一性強制
- コンパイル時エラー検出

**ローカルストレージキー**:
- **プリセットバフアイテム（コピー済み）**: LocalStorage (`preset_buff_items`)
- **ユーザーカスタム不可**: システム提供アイテムのみ使用

## TypeScriptデータ構造

```typescript
// src/data/buffItems.ts
interface BuffItemsData {
  buffItems: Record<BuffItemCategory, PresetBuffItem[]>
}

export const buffItemsData: BuffItemsData = {
  buffItems: {
    physicalPower: [バフアイテム配列],
    magicalPower: [バフアイテム配列],
    physicalDefense: [バフアイテム配列],
    magicalDefense: [バフアイテム配列],
    elementalAttack: [バフアイテム配列],
    elementalDefense: [バフアイテム配列],
    speed: [バフアイテム配列],
    casting: [バフアイテム配列],
    mp: [バフアイテム配列],
    hp: [バフアイテム配列],
    accuracy: [バフアイテム配列],
    evasion: [バフアイテム配列]
  }
} as const
```

## バフアイテム構造

**プリセットバフアイテムインターフェース**:
```typescript
interface PresetBuffItem {
  id: string                           // 一意識別子
  name: string                         // アイテム名
  category: BuffItemCategory           // カテゴリ
  properties: Partial<EquipmentProperties>  // 装備と同一のプロパティ構造（PascalCase統一済み）
}

type BuffItemCategory = 
  | 'physicalPower'    // 物理威力
  | 'magicalPower'     // 魔法威力
  | 'physicalDefense'  // 物理防御
  | 'magicalDefense'   // 魔法防御
  | 'elementalAttack'  // 属性攻撃
  | 'elementalDefense' // 属性防御
  | 'speed'            // 速度
  | 'casting'          // 詠唱
  | 'mp'               // MP
  | 'hp'               // HP
  | 'accuracy'         // 命中
  | 'evasion'          // 回避
```

**ローカルストレージバフアイテムインターフェース**:
```typescript
interface LocalStorageBuffItem extends PresetBuffItem {
  isPreset: boolean            // プリセット由来かどうか（常にtrue）
  isFavorite: boolean          // お気に入り設定
  createdAt: string           // 作成日時 (ISO string)
  updatedAt: string           // 更新日時 (ISO string)
}

// 統合型（アプリ内で使用するバフアイテムデータ型）
type BuffItem = LocalStorageBuffItem
```

## バフアイテムフォームデータ構造

**BuffItemFormDataインターフェース**:
```typescript
interface BuffItemFormData {
  physicalPower: string | null       // 選択されたアイテムID（null = なし）
  magicalPower: string | null
  physicalDefense: string | null
  magicalDefense: string | null
  elementalAttack: string | null
  elementalDefense: string | null
  speed: string | null
  casting: string | null
  mp: string | null
  hp: string | null
  accuracy: string | null
  evasion: string | null
}
```

## Zodバリデーション

```typescript
const buffItemFormDataSchema = z.object({
  physicalPower: z.string().nullable(),
  magicalPower: z.string().nullable(),
  physicalDefense: z.string().nullable(),
  magicalDefense: z.string().nullable(),
  elementalAttack: z.string().nullable(),
  elementalDefense: z.string().nullable(),
  speed: z.string().nullable(),
  casting: z.string().nullable(),
  mp: z.string().nullable(),
  hp: z.string().nullable(),
  accuracy: z.string().nullable(),
  evasion: z.string().nullable(),
})
```

## バフアイテムカテゴリ一覧

1. **physicalPower（物理威力）** - 物理攻撃力向上系アイテム
2. **magicalPower（魔法威力）** - 魔法攻撃力向上系アイテム
3. **physicalDefense（物理防御）** - 物理防御力向上系アイテム
4. **magicalDefense（魔法防御）** - 魔法防御力向上系アイテム
5. **elementalAttack（属性攻撃）** - 属性攻撃力向上系アイテム
6. **elementalDefense（属性防御）** - 属性防御力向上系アイテム
7. **speed（速度）** - 攻撃・詠唱・行動速度向上系アイテム
8. **casting（詠唱）** - 詠唱関連向上系アイテム
9. **mp（MP）** - MP関連向上系アイテム
10. **hp（HP）** - HP関連向上系アイテム
11. **accuracy（命中）** - 命中率向上系アイテム
12. **evasion（回避）** - 回避率向上系アイテム