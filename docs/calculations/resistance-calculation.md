# 物理・魔法耐性計算

## 概要
物理耐性と魔法耐性の計算式について記述します。これらは敵からの物理攻撃・魔法攻撃に対するダメージ軽減率を決定する重要なステータスです。

**重要**: 2024年統一により、AllBonusesインターフェースはEquipmentPropertiesと同じ命名規則（PascalCase + アンダースコア）を使用。例：`PhysicalResistance_Rate`, `MagicalResistance_Rate`

## 物理耐性計算

### 基本計算式
```
物理耐性(%) = 装備/プロパティ物理耐性% + クリスタ物理耐性% + 料理物理耐性% + バフアイテム物理耐性%
```

### 詳細計算

#### 構成要素
- **装備/プロパティ物理耐性%**: 装備品のプロパティからの物理耐性%(PhysicalResistance_Rate)補正
- **クリスタ物理耐性%**: セットしてあるクリスタからの物理耐性%(PhysicalResistance_Rate)補正
- **料理物理耐性%**: 料理からの物理耐性%(PhysicalResistance_Rate)補正（例：ビーフバーガー（物理耐性））
- **バフアイテム物理耐性%**: バフアイテムからの物理耐性%(PhysicalResistance_Rate)補正

#### 計算手順
1. **各ソースから物理耐性%を取得**
2. **単純合算**: 全ての物理耐性%補正を加算

### 計算例

#### 例1: 標準的なケース
**入力値:**
- 装備/プロパティ物理耐性%: 15%
- クリスタ物理耐性%: 10%
- 料理物理耐性%: 8% (ビーフバーガーLv4)
- バフアイテム物理耐性%: 5%

**計算手順:**
1. 最終物理耐性 = 15% + 10% + 8% + 5% = 38%

#### 例2: 料理なしケース
**入力値:**
- 装備/プロパティ物理耐性%: 20%
- クリスタ物理耐性%: 12%
- 料理物理耐性%: 0% (なし)
- バフアイテム物理耐性%: 8%

**計算手順:**
1. 最終物理耐性 = 20% + 12% + 0% + 8% = 40%

#### 例3: 高耐性ケース（防御特化）
**入力値:**
- 装備/プロパティ物理耐性%: 25%
- クリスタ物理耐性%: 18%
- 料理物理耐性%: 12% (ビーフバーガーLv8)
- バフアイテム物理耐性%: 10%

**計算手順:**
1. 最終物理耐性 = 25% + 18% + 12% + 10% = 65%

### 構成要素

**物理耐性%の構成:**
- 装備/プロパティの物理耐性%(PhysicalResistance_Rate)補正
- クリスタの物理耐性%(PhysicalResistance_Rate)補正
- 料理の物理耐性%(PhysicalResistance_Rate)補正（例：ビーフバーガー）
- バフアイテムの物理耐性%(PhysicalResistance_Rate)補正

### 重要な制限事項

1. **%補正のみ**: 物理耐性は%補正のみで、固定値補正は存在しない
2. **単純合算**: 複雑な計算はなく、全ての%補正を単純に加算
3. **料理対応**: 料理（ビーフバーガー）からも物理耐性%補正が得られる

## 魔法耐性計算

### 基本計算式
```
魔法耐性(%) = 装備/プロパティ魔法耐性% + クリスタ魔法耐性% + 料理魔法耐性% + バフアイテム魔法耐性%
```

### 詳細計算

#### 構成要素
- **装備/プロパティ魔法耐性%**: 装備品のプロパティからの魔法耐性%(MagicalResistance_Rate)補正
- **クリスタ魔法耐性%**: セットしてあるクリスタからの魔法耐性%(MagicalResistance_Rate)補正
- **料理魔法耐性%**: 料理からの魔法耐性%(MagicalResistance_Rate)補正（例：フィッシュバーガー（魔法耐性））
- **バフアイテム魔法耐性%**: バフアイテムからの魔法耐性%(MagicalResistance_Rate)補正

#### 計算手順
1. **各ソースから魔法耐性%を取得**
2. **単純合算**: 全ての魔法耐性%補正を加算

### 計算例

#### 例1: 標準的なケース
**入力値:**
- 装備/プロパティ魔法耐性%: 12%
- クリスタ魔法耐性%: 8%
- 料理魔法耐性%: 6% (フィッシュバーガーLv3)
- バフアイテム魔法耐性%: 4%

**計算手順:**
1. 最終魔法耐性 = 12% + 8% + 6% + 4% = 30%

#### 例2: 料理なしケース
**入力値:**
- 装備/プロパティ魔法耐性%: 18%
- クリスタ魔法耐性%: 10%
- 料理魔法耐性%: 0% (なし)
- バフアイテム魔法耐性%: 7%

**計算手順:**
1. 最終魔法耐性 = 18% + 10% + 0% + 7% = 35%

#### 例3: 高耐性ケース（魔法防御特化）
**入力値:**
- 装備/プロパティ魔法耐性%: 22%
- クリスタ魔法耐性%: 15%
- 料理魔法耐性%: 10% (フィッシュバーガーLv7)
- バフアイテム魔法耐性%: 8%

**計算手順:**
1. 最終魔法耐性 = 22% + 15% + 10% + 8% = 55%

### 構成要素

**魔法耐性%の構成:**
- 装備/プロパティの魔法耐性%(MagicalResistance_Rate)補正
- クリスタの魔法耐性%(MagicalResistance_Rate)補正
- 料理の魔法耐性%(MagicalResistance_Rate)補正（例：フィッシュバーガー）
- バフアイテムの魔法耐性%(MagicalResistance_Rate)補正

### 重要な制限事項

1. **%補正のみ**: 魔法耐性は%補正のみで、固定値補正は存在しない
2. **単純合算**: 複雑な計算はなく、全ての%補正を単純に加算
3. **料理対応**: 料理（フィッシュバーガー）からも魔法耐性%補正が得られる

## TypeScript実装例

```typescript
interface ResistanceCalculationSteps {
  equipmentPhysicalResistance: number
  crystalPhysicalResistance: number
  foodPhysicalResistance: number
  buffItemPhysicalResistance: number
  finalPhysicalResistance: number
  equipmentMagicalResistance: number
  crystalMagicalResistance: number
  foodMagicalResistance: number
  buffItemMagicalResistance: number
  finalMagicalResistance: number
}

function calculateResistance(
  allBonuses: AllBonuses = {}
): ResistanceCalculationSteps {
  // 物理耐性計算
  const equipmentPhysicalResistance = allBonuses.PhysicalResistance_Rate?.equipment || 0
  const crystalPhysicalResistance = allBonuses.PhysicalResistance_Rate?.crystal || 0
  const foodPhysicalResistance = allBonuses.PhysicalResistance_Rate?.food || 0
  const buffItemPhysicalResistance = allBonuses.PhysicalResistance_Rate?.buffItem || 0
  
  const finalPhysicalResistance = equipmentPhysicalResistance + 
                                  crystalPhysicalResistance + 
                                  foodPhysicalResistance + 
                                  buffItemPhysicalResistance
  
  // 魔法耐性計算
  const equipmentMagicalResistance = allBonuses.MagicalResistance_Rate?.equipment || 0
  const crystalMagicalResistance = allBonuses.MagicalResistance_Rate?.crystal || 0
  const foodMagicalResistance = allBonuses.MagicalResistance_Rate?.food || 0
  const buffItemMagicalResistance = allBonuses.MagicalResistance_Rate?.buffItem || 0
  
  const finalMagicalResistance = equipmentMagicalResistance + 
                                 crystalMagicalResistance + 
                                 foodMagicalResistance + 
                                 buffItemMagicalResistance
  
  return {
    equipmentPhysicalResistance,
    crystalPhysicalResistance,
    foodPhysicalResistance,
    buffItemPhysicalResistance,
    finalPhysicalResistance,
    equipmentMagicalResistance,
    crystalMagicalResistance,
    foodMagicalResistance,
    buffItemMagicalResistance,
    finalMagicalResistance,
  }
}

// 簡略版（統合されたボーナス値を使用）
function calculateSimpleResistance(
  allBonuses: AllBonuses = {}
): { physicalResistance: number; magicalResistance: number } {
  const physicalResistance = allBonuses.PhysicalResistance_Rate || 0
  const magicalResistance = allBonuses.MagicalResistance_Rate || 0
  
  return {
    physicalResistance,
    magicalResistance,
  }
}
```

## 耐性の特徴と用途

### 物理耐性の特徴
- **対象**: 物理攻撃全般（近接攻撃、弓攻撃など）
- **主要ソース**: ビーフバーガー料理、防具プロパティ、防御系クリスタ
- **効果**: 物理ダメージを%分軽減
- **用途**: 物理攻撃主体の敵との戦闘、タンク役での生存率向上

### 魔法耐性の特徴
- **対象**: 魔法攻撃全般（属性魔法、無属性魔法など）
- **主要ソース**: フィッシュバーガー料理、防具プロパティ、防御系クリスタ
- **効果**: 魔法ダメージを%分軽減
- **用途**: 魔法攻撃主体の敵との戦闘、魔法ダメージ対策

### 両耐性の共通特徴
1. **%ベース**: 固定値減算ではなく、%による軽減効果
2. **上限なし**: 100%を超える耐性も理論上可能（ただし実用的な上限は存在）
3. **料理対応**: 専用料理による強化が可能
4. **装備依存**: 防具プロパティとクリスタが主要な補正源

## 戦略的考察

### バランス型ビルド
- 物理・魔法耐性を均等に上げる
- 汎用性の高い防御力を確保
- どの敵にも一定の対応力を持つ

### 特化型ビルド
- 特定の敵や攻撃タイプに特化
- 高い耐性値による大幅なダメージ軽減
- 対象外の攻撃には脆弱性を持つ

### 料理活用戦略
- 事前情報に基づく料理選択
- ビーフバーガー（物理耐性）vs フィッシュバーガー（魔法耐性）
- 戦闘前の準備による大幅な生存率向上

## 更新履歴

| 日付 | 更新内容 | 備考 |
|------|----------|------|
| 2024-06-26 | 物理耐性計算式を追加 | 4データソース統合、単純加算方式、料理対応 |
| 2024-06-26 | 魔法耐性計算式を追加 | 4データソース統合、単純加算方式、フィッシュバーガー対応 |
| 2025-07-01 | basic-stats.mdから分離 | 専用ファイルとして独立、TypeScript実装例と戦略的考察を追加 |

## 関連ドキュメント
- [基本ステータス計算式](./basic-stats.md) - その他の基本ステータス計算
- [計算式概要](./overview.md)