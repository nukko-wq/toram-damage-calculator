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
  category: 'HP' | 'MP' | 'ATK' | 'MATK' | 'STAT' | 'RESIST'
  propertyType: string  // 'HP', 'MP', 'ATK', 'weaponATK', 'STR', 'INT', 'VIT', 'DEX', 'AGI', 'accuracy', 'attackMPRecovery', 'criticalRate', 'aggroPlus', 'aggroMinus', etc.
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

#### あんかけチャーハン(MP)
MP固定値を増加させる料理。

| レベル | MP(+) | 効果値 |
|--------|-------|--------|
| Lv1    | +60   | 60     |
| Lv2    | +120  | 120    |
| Lv3    | +180  | 180    |
| Lv4    | +240  | 240    |
| Lv5    | +300  | 300    |
| Lv6    | +440  | 440    |
| Lv7    | +580  | 580    |
| Lv8    | +720  | 720    |
| Lv9    | +860  | 860    |
| Lv10   | +1000 | 1000   |

```typescript
const ankakeFriedRice: FoodEffect = {
  id: 'ankake_fried_rice',
  name: 'あんかけチャーハン(MP)',
  category: 'MP',
  propertyType: 'MP',
  isPercentage: false,
  levels: [
    { level: 1, value: 60 },
    { level: 2, value: 120 },
    { level: 3, value: 180 },
    { level: 4, value: 240 },
    { level: 5, value: 300 },
    { level: 6, value: 440 },
    { level: 7, value: 580 },
    { level: 8, value: 720 },
    { level: 9, value: 860 },
    { level: 10, value: 1000 }
  ],
  description: 'MP固定値を増加させる料理'
}
```

### ATK系料理

#### マルゲリータ(武器ATK)
武器ATK固定値を増加させる料理。

| レベル | 武器ATK(+) | 効果値 |
|--------|------------|--------|
| Lv1    | +6         | 6      |
| Lv2    | +12        | 12     |
| Lv3    | +18        | 18     |
| Lv4    | +24        | 24     |
| Lv5    | +30        | 30     |
| Lv6    | +44        | 44     |
| Lv7    | +58        | 58     |
| Lv8    | +72        | 72     |
| Lv9    | +86        | 86     |
| Lv10   | +100       | 100    |

```typescript
const margherita: FoodEffect = {
  id: 'margherita',
  name: 'マルゲリータ(武器ATK)',
  category: 'ATK',
  propertyType: 'weaponATK',
  isPercentage: false,
  levels: [
    { level: 1, value: 6 },
    { level: 2, value: 12 },
    { level: 3, value: 18 },
    { level: 4, value: 24 },
    { level: 5, value: 30 },
    { level: 6, value: 44 },
    { level: 7, value: 58 },
    { level: 8, value: 72 },
    { level: 9, value: 86 },
    { level: 10, value: 100 }
  ],
  description: '武器ATK固定値を増加させる料理'
}
```

### 命中系料理

#### しょうゆラーメン(命中)
命中固定値を増加させる料理。

| レベル | 命中(+) | 効果値 |
|--------|---------|--------|
| Lv1    | +6      | 6      |
| Lv2    | +12     | 12     |
| Lv3    | +18     | 18     |
| Lv4    | +24     | 24     |
| Lv5    | +30     | 30     |
| Lv6    | +44     | 44     |
| Lv7    | +58     | 58     |
| Lv8    | +72     | 72     |
| Lv9    | +86     | 86     |
| Lv10   | +100    | 100    |

```typescript
const shoyuRamen: FoodEffect = {
  id: 'shoyu_ramen',
  name: 'しょうゆラーメン(命中)',
  category: 'STAT',
  propertyType: 'accuracy',
  isPercentage: false,
  levels: [
    { level: 1, value: 6 },
    { level: 2, value: 12 },
    { level: 3, value: 18 },
    { level: 4, value: 24 },
    { level: 5, value: 30 },
    { level: 6, value: 44 },
    { level: 7, value: 58 },
    { level: 8, value: 72 },
    { level: 9, value: 86 },
    { level: 10, value: 100 }
  ],
  description: '命中固定値を増加させる料理'
}
```

### 特殊効果系料理

#### 焼きそば(攻撃MP回復)
攻撃MP回復固定値を増加させる料理。

| レベル | 攻撃MP回復(+) | 効果値 |
|--------|---------------|--------|
| Lv1    | +2            | 2      |
| Lv2    | +4            | 4      |
| Lv3    | +6            | 6      |
| Lv4    | +8            | 8      |
| Lv5    | +10           | 10     |
| Lv6    | +14           | 14     |
| Lv7    | +18           | 18     |
| Lv8    | +22           | 22     |
| Lv9    | +26           | 26     |
| Lv10   | +30           | 30     |

```typescript
const yakisoba: FoodEffect = {
  id: 'yakisoba',
  name: '焼きそば(攻撃MP回復)',
  category: 'STAT',
  propertyType: 'attackMPRecovery',
  isPercentage: false,
  levels: [
    { level: 1, value: 2 },
    { level: 2, value: 4 },
    { level: 3, value: 6 },
    { level: 4, value: 8 },
    { level: 5, value: 10 },
    { level: 6, value: 14 },
    { level: 7, value: 18 },
    { level: 8, value: 22 },
    { level: 9, value: 26 },
    { level: 10, value: 30 }
  ],
  description: '攻撃MP回復固定値を増加させる料理'
}
```

#### たこやき(クリ率)
クリティカル率固定値を増加させる料理。

| レベル | クリ率(+) | 効果値 |
|--------|-----------|--------|
| Lv1    | +2        | 2      |
| Lv2    | +4        | 4      |
| Lv3    | +6        | 6      |
| Lv4    | +8        | 8      |
| Lv5    | +10       | 10     |
| Lv6    | +14       | 14     |
| Lv7    | +18       | 18     |
| Lv8    | +22       | 22     |
| Lv9    | +26       | 26     |
| Lv10   | +30       | 30     |

```typescript
const takoyaki: FoodEffect = {
  id: 'takoyaki',
  name: 'たこやき(クリ率)',
  category: 'STAT',
  propertyType: 'criticalRate',
  isPercentage: false,
  levels: [
    { level: 1, value: 2 },
    { level: 2, value: 4 },
    { level: 3, value: 6 },
    { level: 4, value: 8 },
    { level: 5, value: 10 },
    { level: 6, value: 14 },
    { level: 7, value: 18 },
    { level: 8, value: 22 },
    { level: 9, value: 26 },
    { level: 10, value: 30 }
  ],
  description: 'クリティカル率固定値を増加させる料理'
}
```

#### ビーフシチュー(ヘイト+)
ヘイト+固定値を増加させる料理。

| レベル | ヘイト+(+) | 効果値 |
|--------|------------|--------|
| Lv1    | +6         | 6      |
| Lv2    | +12        | 12     |
| Lv3    | +18        | 18     |
| Lv4    | +24        | 24     |
| Lv5    | +30        | 30     |
| Lv6    | +44        | 44     |
| Lv7    | +58        | 58     |
| Lv8    | +72        | 72     |
| Lv9    | +86        | 86     |
| Lv10   | +100       | 100    |

```typescript
const beefStew: FoodEffect = {
  id: 'beef_stew',
  name: 'ビーフシチュー(ヘイト+)',
  category: 'STAT',
  propertyType: 'aggroPlus',
  isPercentage: false,
  levels: [
    { level: 1, value: 6 },
    { level: 2, value: 12 },
    { level: 3, value: 18 },
    { level: 4, value: 24 },
    { level: 5, value: 30 },
    { level: 6, value: 44 },
    { level: 7, value: 58 },
    { level: 8, value: 72 },
    { level: 9, value: 86 },
    { level: 10, value: 100 }
  ],
  description: 'ヘイト+固定値を増加させる料理'
}
```

#### ホワイトシチュー(ヘイト-)
ヘイト-固定値を増加させる料理。

| レベル | ヘイト-(-) | 効果値 |
|--------|------------|--------|
| Lv1    | -6         | -6     |
| Lv2    | -12        | -12    |
| Lv3    | -18        | -18    |
| Lv4    | -24        | -24    |
| Lv5    | -30        | -30    |
| Lv6    | -44        | -44    |
| Lv7    | -58        | -58    |
| Lv8    | -72        | -72    |
| Lv9    | -86        | -86    |
| Lv10   | -100       | -100   |

```typescript
const whiteStew: FoodEffect = {
  id: 'white_stew',
  name: 'ホワイトシチュー(ヘイト-)',
  category: 'STAT',
  propertyType: 'aggroMinus',
  isPercentage: false,
  levels: [
    { level: 1, value: -6 },
    { level: 2, value: -12 },
    { level: 3, value: -18 },
    { level: 4, value: -24 },
    { level: 5, value: -30 },
    { level: 6, value: -44 },
    { level: 7, value: -58 },
    { level: 8, value: -72 },
    { level: 9, value: -86 },
    { level: 10, value: -100 }
  ],
  description: 'ヘイト-固定値を増加させる料理'
}
```

### ステータス系料理

#### おかかおにぎり(STR)
STR固定値を増加させる料理。

| レベル | STR(+) | 効果値 |
|--------|--------|--------|
| Lv1    | +2     | 2      |
| Lv2    | +4     | 4      |
| Lv3    | +6     | 6      |
| Lv4    | +8     | 8      |
| Lv5    | +10    | 10     |
| Lv6    | +14    | 14     |
| Lv7    | +18    | 18     |
| Lv8    | +22    | 22     |
| Lv9    | +26    | 26     |
| Lv10   | +30    | 30     |

```typescript
const okakaOnigiri: FoodEffect = {
  id: 'okaka_onigiri',
  name: 'おかかおにぎり(STR)',
  category: 'STAT',
  propertyType: 'STR',
  isPercentage: false,
  levels: [
    { level: 1, value: 2 },
    { level: 2, value: 4 },
    { level: 3, value: 6 },
    { level: 4, value: 8 },
    { level: 5, value: 10 },
    { level: 6, value: 14 },
    { level: 7, value: 18 },
    { level: 8, value: 22 },
    { level: 9, value: 26 },
    { level: 10, value: 30 }
  ],
  description: 'STR固定値を増加させる料理'
}
```

#### 梅干おにぎり(INT)
INT固定値を増加させる料理。

| レベル | INT(+) | 効果値 |
|--------|--------|--------|
| Lv1    | +2     | 2      |
| Lv2    | +4     | 4      |
| Lv3    | +6     | 6      |
| Lv4    | +8     | 8      |
| Lv5    | +10    | 10     |
| Lv6    | +14    | 14     |
| Lv7    | +18    | 18     |
| Lv8    | +22    | 22     |
| Lv9    | +26    | 26     |
| Lv10   | +30    | 30     |

```typescript
const umeboshiOnigiri: FoodEffect = {
  id: 'umeboshi_onigiri',
  name: '梅干おにぎり(INT)',
  category: 'STAT',
  propertyType: 'INT',
  isPercentage: false,
  levels: [
    { level: 1, value: 2 },
    { level: 2, value: 4 },
    { level: 3, value: 6 },
    { level: 4, value: 8 },
    { level: 5, value: 10 },
    { level: 6, value: 14 },
    { level: 7, value: 18 },
    { level: 8, value: 22 },
    { level: 9, value: 26 },
    { level: 10, value: 30 }
  ],
  description: 'INT固定値を増加させる料理'
}
```

#### ツナマヨおにぎり(VIT)
VIT固定値を増加させる料理。

| レベル | VIT(+) | 効果値 |
|--------|--------|--------|
| Lv1    | +2     | 2      |
| Lv2    | +4     | 4      |
| Lv3    | +6     | 6      |
| Lv4    | +8     | 8      |
| Lv5    | +10    | 10     |
| Lv6    | +14    | 14     |
| Lv7    | +18    | 18     |
| Lv8    | +22    | 22     |
| Lv9    | +26    | 26     |
| Lv10   | +30    | 30     |

```typescript
const tunaMayoOnigiri: FoodEffect = {
  id: 'tuna_mayo_onigiri',
  name: 'ツナマヨおにぎり(VIT)',
  category: 'STAT',
  propertyType: 'VIT',
  isPercentage: false,
  levels: [
    { level: 1, value: 2 },
    { level: 2, value: 4 },
    { level: 3, value: 6 },
    { level: 4, value: 8 },
    { level: 5, value: 10 },
    { level: 6, value: 14 },
    { level: 7, value: 18 },
    { level: 8, value: 22 },
    { level: 9, value: 26 },
    { level: 10, value: 30 }
  ],
  description: 'VIT固定値を増加させる料理'
}
```

#### 鮭おにぎり(DEX)
DEX固定値を増加させる料理。

| レベル | DEX(+) | 効果値 |
|--------|--------|--------|
| Lv1    | +2     | 2      |
| Lv2    | +4     | 4      |
| Lv3    | +6     | 6      |
| Lv4    | +8     | 8      |
| Lv5    | +10    | 10     |
| Lv6    | +14    | 14     |
| Lv7    | +18    | 18     |
| Lv8    | +22    | 22     |
| Lv9    | +26    | 26     |
| Lv10   | +30    | 30     |

```typescript
const salmonOnigiri: FoodEffect = {
  id: 'salmon_onigiri',
  name: '鮭おにぎり(DEX)',
  category: 'STAT',
  propertyType: 'DEX',
  isPercentage: false,
  levels: [
    { level: 1, value: 2 },
    { level: 2, value: 4 },
    { level: 3, value: 6 },
    { level: 4, value: 8 },
    { level: 5, value: 10 },
    { level: 6, value: 14 },
    { level: 7, value: 18 },
    { level: 8, value: 22 },
    { level: 9, value: 26 },
    { level: 10, value: 30 }
  ],
  description: 'DEX固定値を増加させる料理'
}
```

#### 明太子おにぎり(AGI)
AGI固定値を増加させる料理。

| レベル | AGI(+) | 効果値 |
|--------|--------|--------|
| Lv1    | +2     | 2      |
| Lv2    | +4     | 4      |
| Lv3    | +6     | 6      |
| Lv4    | +8     | 8      |
| Lv5    | +10    | 10     |
| Lv6    | +14    | 14     |
| Lv7    | +18    | 18     |
| Lv8    | +22    | 22     |
| Lv9    | +26    | 26     |
| Lv10   | +30    | 30     |

```typescript
const mentaikoOnigiri: FoodEffect = {
  id: 'mentaiko_onigiri',
  name: '明太子おにぎり(AGI)',
  category: 'STAT',
  propertyType: 'AGI',
  isPercentage: false,
  levels: [
    { level: 1, value: 2 },
    { level: 2, value: 4 },
    { level: 3, value: 6 },
    { level: 4, value: 8 },
    { level: 5, value: 10 },
    { level: 6, value: 14 },
    { level: 7, value: 18 },
    { level: 8, value: 22 },
    { level: 9, value: 26 },
    { level: 10, value: 30 }
  ],
  description: 'AGI固定値を増加させる料理'
}
```

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
│   ├── special-foods.json    # 特殊効果系料理データ
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
| 2024-06-24 | ステータス系料理（おにぎり5種）追加 | STR/INT/VIT/DEX/AGI対応料理データ追加 |
| 2024-06-24 | 命中系料理追加 | しょうゆラーメン(命中)データ追加 |
| 2024-06-24 | MP系・ATK系料理追加 | あんかけチャーハン(MP)、マルゲリータ(武器ATK)データ追加 |
| 2024-06-24 | 特殊効果系料理（3種）追加 | 焼きそば(攻撃MP回復)、たこやき(クリ率)、ビーフシチュー(ヘイト+)データ追加 |
| 2024-06-24 | ヘイト-系料理追加 | ホワイトシチュー(ヘイト-)データ追加 |

## 関連ドキュメント
- [基本ステータス計算式](../calculations/basic-stats.md) - 計算ロジックとの統合
- [StatusPreview設計](../ui/status-preview.md) - UI表示との連携
- [バフシステム要件](../requirements/05_buff-systems.md) - バフとの関係性