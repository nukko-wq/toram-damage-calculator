# 料理データベース設計

## 料理システム設計

**料理の概念**:
- 料理は5枠のスロットシステム
- 各スロットに異なる料理を設定可能
- 各料理に1-10のレベル設定（「なし」を除く）
- バフ効果はレベルに応じて強度が変化

## 料理データ構造

**FoodFormDataインターフェース**:
```typescript
interface FoodFormData {
  slot1: FoodSlotData
  slot2: FoodSlotData
  slot3: FoodSlotData
  slot4: FoodSlotData
  slot5: FoodSlotData
}

interface FoodSlotData {
  selectedFood: FoodType    // 選択された料理タイプ
  level: number            // 料理レベル (1-10、「なし」の場合は0)
}

type FoodType = 
  | 'none'                    // なし
  | 'okaka_onigiri'          // おかかおにぎり(STR)
  | 'sake_onigiri'           // 鮭おにぎり(DEX)
  | 'umeboshi_onigiri'       // 梅干しおにぎり(INT)
  | 'mentaiko_onigiri'       // 明太子おにぎり(AGI)
  | 'tuna_mayo_onigiri'      // ツナマヨおにぎり(VIT)
  | 'shoyu_ramen'            // しょうゆラーメン(命中)
  | 'zokusei_pasta'          // 属性パスタ(属性有利共通)
  | 'takoyaki'               // たこ焼き(クリ率)
  | 'yakisoba'               // 焼きそば(攻撃MP回復)
  | 'golden_fried_rice'      // 黄金チャーハン(HP)
  | 'ankake_fried_rice'      // あんかけチャーハン(MP)
  | 'margherita_pizza'       // マルゲリータピザ(武器ATK+)
  | 'diabola_pizza'          // ディアボラピザ(ATK+)
  | 'seafood_pizza'          // シーフードピザ(MATK+)
  | 'beef_stew'              // ビーフシチュー(ヘイト+)
  | 'white_stew'             // ホワイトシチュー(ヘイト-)
  | 'beef_burger'            // ビーフバーガー(物理耐性)
  | 'fish_burger'            // フィッシュバーガー(魔法耐性)
```

## 料理効果システム（将来実装予定）

**料理効果の概念**:
- 各料理にはゲーム内で定義された効果が存在
- レベル1-10に応じて効果値が変化
- 実際の効果値計算は後のフェーズで実装予定

## 料理システムバリデーション

**Zodスキーマ定義**:
```typescript
export const foodSlotSchema = z.object({
  selectedFood: z.string(),
  level: z.number()
    .min(0, 'レベルは0以上である必要があります')
    .max(10, 'レベルは10以下である必要があります')
    .refine((value, ctx) => {
      // 「なし」が選択されている場合はレベルは0でなければならない
      const selectedFood = ctx.parent?.selectedFood
      if (selectedFood === 'none' && value !== 0) {
        return false
      }
      // 「なし」以外が選択されている場合はレベルは1-10でなければならない
      if (selectedFood !== 'none' && (value < 1 || value > 10)) {
        return false
      }
      return true
    }, 'レベルが料理選択と矛盾しています')
})

export const foodFormSchema = z.object({
  slot1: foodSlotSchema,
  slot2: foodSlotSchema,
  slot3: foodSlotSchema,
  slot4: foodSlotSchema,
  slot5: foodSlotSchema
})

export type FoodFormData = z.infer<typeof foodFormSchema>
```

## 料理システムUI仕様

**料理選択UI**:
- 5つの料理スロットを表示
- 各スロットでselectドロップダウンによる料理選択
- 料理選択後、レベル設定用の数値入力フィールド表示
- 「なし」選択時はレベル入力フィールドを非表示

**レベル入力仕様**:
- 数値入力フィールド（1-10の範囲制限）
- レベル変更時のリアルタイムバリデーション

## デフォルト値

```typescript
const getDefaultFood = (): FoodFormData => ({
  slot1: { selectedFood: 'none', level: 0 },
  slot2: { selectedFood: 'none', level: 0 },
  slot3: { selectedFood: 'none', level: 0 },
  slot4: { selectedFood: 'none', level: 0 },
  slot5: { selectedFood: 'none', level: 0 }
})
```