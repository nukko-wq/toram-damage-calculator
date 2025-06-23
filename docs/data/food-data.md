# 料理データ設計書

## 概要

トーラムオンラインの料理システムのデータ構造と仕様を定義する設計書。料理は装備品補正値に加算される追加ボーナス値として計算に統合される。

## 料理システム仕様

### 基本仕様
- **効果時間**: 30分間持続
- **レベル範囲**: Lv1〜Lv10
- **重複**: 同種料理は重複不可、異種料理は併用可能
- **計算統合**: 装備品・クリスタル・バフのプロパティと合算

### 計算への統合
```typescript
// HP計算への統合例
const totalHPBonus = {
  equipment: equipmentHPBonus,    // 装備品からのHP(+)
  crystal: crystalHPBonus,        // クリスタルからのHP(+)
  food: foodHPBonus,              // 料理からのHP(+)
  buff: buffHPBonus               // バフからのHP(+)
}

const finalHPBonus = totalHPBonus.equipment + totalHPBonus.crystal + totalHPBonus.food + totalHPBonus.buff
```

## データ構造

### TypeScript インターフェース
```typescript
interface FoodEffect {
  id: string
  name: string
  category: 'HP' | 'MP' | 'ATK' | 'MATK' | 'DEF' | 'MDEF' | 'STAT' | 'RESIST'
  propertyType: string  // 'HP', 'MP', 'ATK', 'STR', etc.
  isPercentage: boolean // true: %, false: 固定値
  levels: Array<{
    level: number
    value: number
  }>
  description?: string
}

interface FoodDatabase {
  foods: FoodEffect[]
}
```

## 料理データ一覧

### HP系料理

#### 黄金チャーハン(HP)
HP固定値を増加させる基本的な料理。

| レベル | HP(+) | 効果値 |
|--------|-------|--------|
| Lv1    | +400  | 400    |
| Lv2    | +800  | 800    |
| Lv3    | +1,200| 1,200  |
| Lv4    | +1,600| 1,600  |
| Lv5    | +2,000| 2,000  |
| Lv6    | +2,600| 2,600  |
| Lv7    | +3,200| 3,200  |
| Lv8    | +3,800| 3,800  |
| Lv9    | +4,400| 4,400  |
| Lv10   | +5,000| 5,000  |

```typescript
const goldenFriedRice: FoodEffect = {
  id: 'golden_fried_rice',
  name: '黄金チャーハン(HP)',
  category: 'HP',
  propertyType: 'HP',
  isPercentage: false,
  levels: [
    { level: 1, value: 400 },
    { level: 2, value: 800 },
    { level: 3, value: 1200 },
    { level: 4, value: 1600 },
    { level: 5, value: 2000 },
    { level: 6, value: 2600 },
    { level: 7, value: 3200 },
    { level: 8, value: 3800 },
    { level: 9, value: 4400 },
    { level: 10, value: 5000 }
  ],
  description: 'HP固定値を増加させる基本料理'
}
```

### MP系料理
※今後追加予定

### ATK系料理
※今後追加予定

### ステータス系料理
※今後追加予定

### 耐性系料理
※今後追加予定

## ファイル構成

### 料理データファイル
```
src/data/
├── foods.json                 # 全料理データのマスター
├── foods/
│   ├── hp-foods.json         # HP系料理データ
│   ├── mp-foods.json         # MP系料理データ
│   ├── attack-foods.json     # 攻撃系料理データ
│   ├── status-foods.json     # ステータス系料理データ
│   └── resist-foods.json     # 耐性系料理データ
└── foods-database.ts         # 料理データアクセス層
```

### データアクセス層
```typescript
// src/utils/foodDatabase.ts
export class FoodDatabase {
  static getAllFoods(): FoodEffect[] {
    return foodsData.foods
  }
  
  static getFoodById(id: string): FoodEffect | undefined {
    return foodsData.foods.find(food => food.id === id)
  }
  
  static getFoodsByCategory(category: string): FoodEffect[] {
    return foodsData.foods.filter(food => food.category === category)
  }
  
  static getFoodEffect(id: string, level: number): number {
    const food = this.getFoodById(id)
    if (!food) return 0
    
    const levelData = food.levels.find(l => l.level === level)
    return levelData?.value || 0
  }
}
```

## UI統合仕様

### 料理選択UI
- **場所**: メインフォームの料理セクション
- **機能**: 料理種別選択、レベル設定、効果プレビュー
- **表示**: 料理名、現在レベル、効果値、継続時間

### ステータス計算への統合
- **統合先**: `src/utils/basicStatsCalculation.ts`
- **関数**: `aggregateAllBonuses()` 内で料理効果を加算
- **表示**: StatusPreviewの装備品補正値セクションに含める

## バリデーション仕様

### レベル制限
- **最小値**: 1
- **最大値**: 10
- **デフォルト**: 1

### データ整合性
- **必須フィールド**: id, name, category, propertyType, levels
- **レベルデータ**: level 1-10の連続性を保証
- **値の範囲**: 正の整数値のみ許可

## パフォーマンス最適化

### データローディング
- **初期ロード**: 必要な料理データのみロード
- **遅延ロード**: カテゴリ別の分割ロード対応
- **キャッシュ**: 計算結果のメモ化

### 計算最適化
- **事前計算**: レベル別効果値のルックアップテーブル
- **差分更新**: 料理変更時のみ再計算実行

## 拡張性

### 新料理追加
1. 料理データをJSONファイルに追加
2. 必要に応じて新カテゴリを定義
3. UI選択肢に自動追加される仕組み

### 複合効果料理
- **将来対応**: 複数プロパティに影響する料理
- **データ構造**: `effects: Array<{propertyType: string, value: number}>` 形式

## 更新履歴

| 日付 | 更新内容 | 備考 |
|------|----------|------|
| 2024-06-23 | 料理データ設計書作成 | 黄金チャーハン(HP)データ追加 |
| 2024-06-23 | 基本構造とTypeScript型定義 | データアクセス層設計完了 |

## 関連ドキュメント
- [基本ステータス計算式](../calculations/basic-stats.md) - 計算ロジックとの統合
- [StatusPreview設計](../ui/status-preview.md) - UI表示との連携
- [バフシステム要件](../requirements/05_buff-systems.md) - バフとの関係性