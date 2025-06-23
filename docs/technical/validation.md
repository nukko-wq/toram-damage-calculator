# フォームバリデーション仕様

## 基本ステータスバリデーション
```typescript
const baseStatsSchema = z.object({
  STR: z.number().min(1).max(510),
  INT: z.number().min(1).max(510),
  VIT: z.number().min(1).max(510),
  AGI: z.number().min(1).max(510),
  DEX: z.number().min(1).max(510),
  CRT: z.number().min(1).max(255),
  MEN: z.number().min(1).max(255),
  TEC: z.number().min(1).max(255),
  level: z.number().min(1).max(510),
})
```

## 武器バリデーション
```typescript
const weaponSchema = z.object({
  weaponType: z.string(),
  ATK: z.number().min(0).max(1500),
  stability: z.number().min(0).max(100),
  refinement: z.number().min(0).max(15),
})
```

## 敵情報バリデーション
```typescript
const enemySchema = z.object({
  level: z.number().min(1).max(999),
  DEF: z.number().min(0).max(9999),
  MDEF: z.number().min(0).max(9999),
  physicalResistance: z.number().min(-100).max(100),
  magicalResistance: z.number().min(-100).max(100),
  resistCritical: z.number().min(0).max(999),    // プリセットでは0、ユーザー調整可能
  requiredHIT: z.number().min(0).max(9999),      // プリセットでは0、ユーザー調整可能
})
```

## バフスキルバリデーション

```typescript
const buffSkillFormDataSchema = z.object({
  skills: z.array(buffSkillSchema),
})
```

## バリデーション共通ルール

### 数値フィールド共通制限
- **基本ステータス**: 1-510（レベルも同様）
- **クリティカル系ステータス**: 1-255
- **武器ATK**: 0-1500
- **安定率**: 0-100%
- **精錬値**: 0-15
- **敵レベル**: 1-999
- **敵防御力**: 0-9999
- **耐性**: -100-100%

### エラーメッセージ日本語化
- 範囲外の値に対する適切な日本語エラーメッセージ
- 必須フィールド未入力時の分かりやすい説明
- バリデーション失敗時のフィールド特定とハイライト

### リアルタイムバリデーション
- 入力中のリアルタイム検証
- 無効な値の即座な視覚的フィードバック
- フォーム送信前の全項目検証