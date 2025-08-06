# 忍者スキル系統

## スキル一覧

### 忍道 (mf2)
- **スキルタイプ**: level
- **最大レベル**: 10
- **武器制限**: なし（全ての武器で効果あり）

#### 効果
- **回避補正**: スキルレベル × 1
  - 計算式: `Dodge += skillLevel`

#### 実装詳細
```typescript
interface 忍道Effect {
  type: 'Dodge'
  value: number  // skillLevel × 1
}
```

#### 計算関数
```typescript
function calculate忍道Effects(skillLevel: number): Partial<AllBonuses> {
  if (skillLevel <= 0) return {}
  
  return {
    Dodge: skillLevel * 1
  }
}
```

#### UI表示
- スキル名: "忍道"
- レベル選択: 1-10のスライダー
- 効果表示: "回避 +{skillLevel}"

#### データ参照
- データキー: `mf2`
- カテゴリ: `ninja`
- 表示順序: 1901

### その他の忍者スキル

#### 忍術 (ninja0)
- **スキルタイプ**: level
- **最大レベル**: 10
- **実装状況**: 詳細未定義

## 実装ステータス

| スキル | データ定義 | 計算関数 | UI統合 | テスト |
|--------|------------|----------|---------|--------|
| 忍道   | ✅         | ✅       | ✅     | ✅     |
| 忍術   | ✅         | ❌       | ❌     | ❌     |

## 注意事項

1. **忍道**は全ての武器種で効果があるユニークなスキル
2. 回避力は基本ステータスの一部として処理
3. レベルタイプのスキルでシンプルな線形効果

## 関連ファイル

- スキルデータ: `src/data/buffSkills/common.ts`
- 計算関数: `src/utils/buffSkillCalculation/categories/ninjaSkills.ts` (未実装)
- UI統合: `src/components/buff-skill/SkillCard.tsx`